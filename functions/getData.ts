const APP_ID = '69efdfc7247e1585291f7701';
const BASE_URL = `https://base44.app/api/apps/${APP_ID}`;

async function dbList(entity: string): Promise<unknown[]> {
  const r = await fetch(`${BASE_URL}/entities/${entity}`, { headers: { 'X-App-Id': APP_ID } });
  if (!r.ok) throw new Error(`DB list ${entity} failed: ${await r.text()}`);
  return r.json();
}

Deno.serve(async (_req) => {
  try {
    const [businesses, sites, campaigns, emailCampaigns] = await Promise.all([
      dbList('Business'),
      dbList('GeneratedSite'),
      dbList('Campaign'),
      dbList('EmailCampaign'),
    ]);
    return Response.json({ businesses, sites, campaigns, emailCampaigns });
  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
});
