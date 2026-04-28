import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const BASE_URL = "https://api.base44.com/api/apps/" + Deno.env.get("BASE44_APP_ID") + "/functions";

async function callFunction(name: string, payload: Record<string, unknown>, req: Request) {
  const res = await fetch(`${BASE_URL}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Forward the original auth headers so the called function has a valid session
      "cookie": req.headers.get("cookie") || "",
      "authorization": req.headers.get("authorization") || "",
      "x-api-key": req.headers.get("x-api-key") || "",
    },
    body: JSON.stringify(payload),
  });
  return res.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { city, category, mode } = body;

    // MODE 1: Full campaign — scrape first, then process each business
    if (mode === "campaign" || (!body.business_id && city && category)) {
      const campaign = await base44.asServiceRole.entities.Campaign.create({
        query: `${category} in ${city}`,
        city,
        category,
        status: "scraping",
        businesses_found: 0,
        sites_generated: 0,
        emails_sent: 0,
      });

      // Step 1: Scrape
      const scrapeResult = await callFunction("scrapeLeads", { city, category, campaign_id: campaign.id }, req);
      if (scrapeResult.error) {
        await base44.asServiceRole.entities.Campaign.update(campaign.id, {
          status: "error",
          error_message: scrapeResult.error,
        });
        return Response.json({ error: scrapeResult.error, campaign_id: campaign.id }, { status: 500 });
      }

      // Step 2: Get all scraped businesses for this campaign
      const businesses = await base44.asServiceRole.entities.Business.filter({
        campaign_query: `${category} in ${city}`,
        status: "scraped",
      });

      let sitesGenerated = 0;

      for (const business of businesses) {
        try {
          const analyzeResult = await callFunction("analyzePersonality", { business_id: business.id }, req);
          if (analyzeResult.error) continue;

          const siteResult = await callFunction("generateSite", { business_id: business.id }, req);
          if (siteResult.error) continue;

          await callFunction("writeEmail", { business_id: business.id }, req);

          sitesGenerated++;
        } catch {
          continue;
        }
      }

      await base44.asServiceRole.entities.Campaign.update(campaign.id, {
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

    const analyzeResult = await callFunction("analyzePersonality", { business_id }, req);
    if (analyzeResult.error) {
      return Response.json({ error: `Analyze failed: ${analyzeResult.error}` }, { status: 500 });
    }

    const siteResult = await callFunction("generateSite", { business_id }, req);
    if (siteResult.error) {
      return Response.json({ error: `Site generation failed: ${siteResult.error}` }, { status: 500 });
    }

    const emailResult = await callFunction("writeEmail", { business_id }, req);
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
});
