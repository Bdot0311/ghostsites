const APP_ID = '69efdfc7247e1585291f7701';
const BASE_URL = `https://base44.app/api/apps/${APP_ID}`;
function authHeaders(token: string) {
  if (token.startsWith('eyJ')) {
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  }
  return { 'X-App-Id': token, 'Content-Type': 'application/json' };
}
function getToken(req: Request): string {
  const auth = req.headers.get('Authorization') || '';
  if (auth.startsWith('Bearer ')) return auth.replace('Bearer ', '');
  return req.headers.get('X-App-Id') || req.headers.get('x-service-token') || '';
}

Deno.serve(async (req) => {
  try {
    const token = getToken(req);
    if (!token) return Response.json({ error: 'No auth token' }, { status: 401 });
    const { entity, id, data } = await req.json().catch(() => ({}));
    if (!entity || !id || !data) return Response.json({ error: 'entity, id, data required' }, { status: 400 });
    const r = await fetch(`${BASE_URL}/entities/${entity}/${id}`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    if (!r.ok) throw new Error(`Update failed: ${await r.text()}`);
    return Response.json({ success: true, result: await r.json() });
  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
});
