import { createClient } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClient({
      appId: Deno.env.get('BASE44_APP_ID') || '69efdfc7247e1585291f7701',
      serviceToken: Deno.env.get('BASE44_SERVICE_TOKEN') || '',
    });
    const [businesses, sites, emailCampaigns, campaigns] = await Promise.all([
      base44.asServiceRole.entities.Business.list(),
      base44.asServiceRole.entities.GeneratedSite.list(),
      base44.asServiceRole.entities.EmailCampaign.list(),
      base44.asServiceRole.entities.Campaign.list(),
    ]);
    return Response.json({ businesses: businesses || [], sites: sites || [], emailCampaigns: emailCampaigns || [], campaigns: campaigns || [] });
  } catch (error: unknown) {
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
});
