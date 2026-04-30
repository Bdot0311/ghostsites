const APP_ID = '69efdfc7247e1585291f7701';
const BASE_URL = `https://base44.app/api/apps/${APP_ID}`;
function getToken(req: Request): string {
  return (req.headers.get('Authorization') || req.headers.get('x-service-token') || '').replace('Bearer ', '');
}
async function dbList(entity: string, token: string): Promise<unknown[]> {
  const r = await fetch(`${BASE_URL}/entities/${entity}`, { headers: { 'Authorization': `Bearer ${token}` } });
  if (!r.ok) throw new Error(`List ${entity} failed: ${await r.text()}`);
  return r.json();
}

Deno.serve(async (req) => {
  try {
    const token = getToken(req);
    if (!token) return Response.json({ error: 'No auth token' }, { status: 401 });
    const [businesses, sites, campaigns, emailCampaigns] = await Promise.all([
      dbList('Business', token),
      dbList('GeneratedSite', token),
      dbList('Campaign', token),
      dbList('EmailCampaign', token),
    ]);
    return Response.json({ businesses, sites, campaigns, emailCampaigns });
  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
});
