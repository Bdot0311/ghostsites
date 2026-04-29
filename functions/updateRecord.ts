const APP_ID = '69efdfc7247e1585291f7701';
const BASE_URL = `https://base44.app/api/apps/${APP_ID}`;

Deno.serve(async (req) => {
  try {
    const { entity, id, data } = await req.json().catch(() => ({}));
    if (!entity || !id || !data) return Response.json({ error: 'entity, id, and data are required' }, { status: 400 });

    const r = await fetch(`${BASE_URL}/entities/${entity}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-App-Id': APP_ID },
      body: JSON.stringify(data),
    });
    if (!r.ok) throw new Error(`DB update failed: ${await r.text()}`);
    const result = await r.json();
    return Response.json({ success: true, result });
  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
});
