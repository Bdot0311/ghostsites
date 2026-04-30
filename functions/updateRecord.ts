const APP_ID = '69efdfc7247e1585291f7701';
const BASE_URL = `https://base44.app/api/apps/${APP_ID}`;
function getToken(req: Request): string {
  return (req.headers.get('Authorization') || req.headers.get('x-service-token') || '').replace('Bearer ', '');
}

Deno.serve(async (req) => {
  try {
    const token = getToken(req);
    if (!token) return Response.json({ error: 'No auth token' }, { status: 401 });
    const { entity, id, data } = await req.json().catch(() => ({}));
    if (!entity || !id || !data) return Response.json({ error: 'entity, id, data required' }, { status: 400 });
    const r = await fetch(`${BASE_URL}/entities/${entity}/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!r.ok) throw new Error(`Update failed: ${await r.text()}`);
    return Response.json({ success: true, result: await r.json() });
  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
});
