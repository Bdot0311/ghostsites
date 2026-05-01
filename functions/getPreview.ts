import { createClientFromRequest } from "npm:@base44/sdk";

// Public endpoint — no user auth required.
// Fetches the HTML from the CDN server-side (no CORS issues) and returns it
// directly so the browser only ever talks to base44.app, not the CDN domain.
Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id') || (await req.json().catch(() => ({}))).id;
    if (!id) return Response.json({ error: 'id required' }, { status: 400 });

    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;

    const site = await db.GeneratedSite.get(id);
    if (!site) return Response.json({ error: 'Site not found' }, { status: 404 });
    if (!site.full_html) return Response.json({ error: 'Site has no HTML yet' }, { status: 404 });

    // Fetch HTML content server-side — avoids browser CORS restrictions on the CDN domain
    const htmlRes = await fetch(site.full_html as string);
    if (!htmlRes.ok) return Response.json({ error: `Could not fetch HTML: ${htmlRes.status}` }, { status: 500 });
    const html = await htmlRes.text();

    // Increment view count (fire-and-forget)
    db.GeneratedSite.update(id, { view_count: (site.view_count || 0) + 1 }).catch(() => {});

    let business_name = '';
    if (site.business_id) {
      const biz = await db.Business.get(site.business_id as string).catch(() => null);
      business_name = (biz as Record<string, unknown>)?.name as string || '';
    }

    return Response.json({ html, business_name });
  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
});
