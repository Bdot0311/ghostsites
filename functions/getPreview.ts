// Public endpoint — no user auth required.
// Uses X-App-Id (service-level auth) directly instead of createClientFromRequest,
// because that SDK call throws when the incoming request has no Bearer token.
const APP_ID = '69efdfc7247e1585291f7701';
const BASE_URL = `https://base44.app/api/apps/${APP_ID}`;

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id') || (await req.json().catch(() => ({}))).id;
    if (!id) return Response.json({ error: 'id required' }, { status: 400 });

    // Fetch site record using X-App-Id service auth
    const siteRes = await fetch(`${BASE_URL}/entities/GeneratedSite/${id}`, {
      headers: { 'X-App-Id': APP_ID },
    });
    if (!siteRes.ok) return Response.json({ error: `Site not found (${siteRes.status})` }, { status: 404 });
    const site = await siteRes.json();

    if (!site.full_html) return Response.json({ error: 'Site has no HTML yet' }, { status: 404 });

    // Fetch HTML content server-side — avoids browser CORS restrictions on the CDN domain
    const htmlRes = await fetch(site.full_html);
    if (!htmlRes.ok) return Response.json({ error: `Could not fetch HTML: ${htmlRes.status}` }, { status: 500 });
    const html = await htmlRes.text();

    // Increment view count (fire-and-forget)
    fetch(`${BASE_URL}/entities/GeneratedSite/${id}`, {
      method: 'PUT',
      headers: { 'X-App-Id': APP_ID, 'Content-Type': 'application/json' },
      body: JSON.stringify({ view_count: (site.view_count || 0) + 1 }),
    }).catch(() => {});

    // Fetch business name
    let business_name = '';
    if (site.business_id) {
      const bizRes = await fetch(`${BASE_URL}/entities/Business/${site.business_id}`, {
        headers: { 'X-App-Id': APP_ID },
      });
      if (bizRes.ok) {
        const biz = await bizRes.json();
        business_name = biz.name || '';
      }
    }

    return Response.json({ html, business_name });
  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
});
