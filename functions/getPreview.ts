import { createClientFromRequest } from "npm:@base44/sdk";

// Public endpoint — no user auth required.
// Returns the HTML CDN URL and business name for a GeneratedSite by ID.
// SitePreview.jsx calls this so unauthenticated visitors (business owners) can view their preview.
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

    // Increment view count (fire-and-forget)
    db.GeneratedSite.update(id, { view_count: (site.view_count || 0) + 1 }).catch(() => {});

    let business_name = '';
    if (site.business_id) {
      const biz = await db.Business.get(site.business_id).catch(() => null);
      business_name = biz?.name || '';
    }

    return Response.json({ html_url: site.full_html, business_name });
  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
});
