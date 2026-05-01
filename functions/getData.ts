import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;

    const [businesses, sitesRaw, campaigns, emailCampaigns] = await Promise.all([
      db.Business.list(),
      db.GeneratedSite.list(),
      db.Campaign.list(),
      db.EmailCampaign.list(),
    ]);

    // Strip full_html — it's 20KB+ per site, fetched on-demand via getPreview instead
    // deno-lint-ignore no-explicit-any
    const sites = (sitesRaw as any[]).map(({ full_html: _html, ...rest }) => rest);

    return Response.json({ businesses, sites, campaigns, emailCampaigns });
  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
});
