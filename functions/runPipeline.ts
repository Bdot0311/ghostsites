// Master Pipeline Orchestrator
// Runs the full GhostSites pipeline for a single business:
// Scrape → Analyze → Generate → Write Email

import base44 from "npm:@base44/sdk";

const client = base44({ appId: Deno.env.get("BASE44_APP_ID") });
const BASE_URL = Deno.env.get("BASE44_FUNCTION_BASE_URL") || "https://api.base44.com/api/apps/" + Deno.env.get("BASE44_APP_ID") + "/functions";

async function callFunction(name: string, payload: Record<string, unknown>) {
  const res = await fetch(`${BASE_URL}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": Deno.env.get("BASE44_API_KEY") || "",
    },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export default async function runPipeline(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { city, category, mode } = body;

    // MODE 1: Full campaign — scrape first, then process each business
    if (mode === "campaign" || (!body.business_id && city && category)) {
      // Create Campaign record
      const campaign = await client.asServiceRole.entities.Campaign.create({
        query: `${category} in ${city}`,
        city,
        category,
        status: "scraping",
        businesses_found: 0,
        sites_generated: 0,
        emails_sent: 0,
      });

      // Step 1: Scrape
      const scrapeResult = await callFunction("scrapeLeads", { city, category, campaign_id: campaign.id });
      if (scrapeResult.error) {
        await client.asServiceRole.entities.Campaign.update(campaign.id, {
          status: "error",
          error_message: scrapeResult.error,
        });
        return Response.json({ error: scrapeResult.error, campaign_id: campaign.id }, { status: 500 });
      }

      // Step 2: Get all scraped businesses for this campaign
      const businesses = await client.asServiceRole.entities.Business.filter({
        campaign_query: `${category} in ${city}`,
        status: "scraped",
      });

      let sitesGenerated = 0;

      for (const business of businesses) {
        try {
          // Analyze personality
          const analyzeResult = await callFunction("analyzePersonality", { business_id: business.id });
          if (analyzeResult.error) continue;

          // Generate site
          const siteResult = await callFunction("generateSite", { business_id: business.id });
          if (siteResult.error) continue;

          // Write email draft
          await callFunction("writeEmail", { business_id: business.id });

          sitesGenerated++;
        } catch {
          // Continue with next business on error
          continue;
        }
      }

      await client.asServiceRole.entities.Campaign.update(campaign.id, {
        status: "done",
        sites_generated: sitesGenerated,
      });

      return Response.json({
        success: true,
        campaign_id: campaign.id,
        businesses_found: scrapeResult.saved || 0,
        sites_generated: sitesGenerated,
      });
    }

    // MODE 2: Process single business through full pipeline
    const { business_id } = body;
    if (!business_id) {
      return Response.json({ error: "Provide either (city + category) or business_id" }, { status: 400 });
    }

    const analyzeResult = await callFunction("analyzePersonality", { business_id });
    if (analyzeResult.error) {
      return Response.json({ error: `Analyze failed: ${analyzeResult.error}` }, { status: 500 });
    }

    const siteResult = await callFunction("generateSite", { business_id });
    if (siteResult.error) {
      return Response.json({ error: `Site generation failed: ${siteResult.error}` }, { status: 500 });
    }

    const emailResult = await callFunction("writeEmail", { business_id });
    if (emailResult.error) {
      return Response.json({ error: `Email writing failed: ${emailResult.error}` }, { status: 500 });
    }

    return Response.json({
      success: true,
      business_id,
      site: siteResult,
      email: emailResult,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}
