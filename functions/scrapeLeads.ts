import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;

    const { city, category } = await req.json().catch(() => ({}));
    if (!city || !category) return Response.json({ error: 'city and category required' }, { status: 400 });

    const KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!KEY) return Response.json({ error: 'GOOGLE_PLACES_API_KEY not set' }, { status: 500 });

    const allPlaces: Record<string, unknown>[] = [];
    let nextToken: string | undefined;
    let pg = 0;
    do {
      const payload: Record<string, unknown> = { textQuery: `${category} in ${city}`, maxResultCount: 20 };
      if (nextToken) payload.pageToken = nextToken;
      const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': KEY, 'X-Goog-FieldMask': 'places.id,places.displayName,places.websiteUri,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.regularOpeningHours,places.photos,places.businessStatus,nextPageToken' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(`Places API: ${await r.text()}`);
      const d = await r.json();
      if (d.places) allPlaces.push(...d.places);
      nextToken = d.nextPageToken;
      pg++;
      if (nextToken) await new Promise(res => setTimeout(res, 1500));
    } while (nextToken && pg < 3);

    const saved: string[] = [];
    for (const pl of allPlaces) {
      if (pl.websiteUri || pl.businessStatus === 'PERMANENTLY_CLOSED') continue;
      const existing = await db.Business.filter({ google_place_id: pl.id as string });
      if ((existing as unknown[])?.length > 0) continue;

      let reviews: { author: string; text: string; rating: number }[] = [];
      try {
        const dr = await fetch(`https://places.googleapis.com/v1/places/${pl.id}`, {
          headers: { 'X-Goog-Api-Key': KEY, 'X-Goog-FieldMask': 'reviews' },
        });
        if (dr.ok) {
          const dd = await dr.json();
          reviews = (dd.reviews || []).slice(0, 5).map((rv: Record<string, unknown>) => ({
            author: (rv.authorAttribution as Record<string, string>)?.displayName ?? 'Anonymous',
            text: (rv.text as Record<string, string>)?.text ?? '',
            rating: (rv.rating as number) ?? 5,
          }));
        }
      } catch (_) { /* skip */ }

      const photoUrls = ((pl.photos as { name: string }[]) || []).slice(0, 3)
        .map(p => `https://places.googleapis.com/v1/${p.name}/media?maxWidthPx=800&key=${KEY}`);
      const fullAddr = (pl.formattedAddress as string) ?? '';
      const addrParts = fullAddr.split(',');
      const street = addrParts.slice(0, -3).join(',').trim() || addrParts[0]?.trim() || '';
      const stateCode = addrParts.slice(-2, -1)[0]?.trim().split(' ')[0] ?? '';

      const created = await db.Business.create({
        name: (pl.displayName as Record<string, string>)?.text ?? 'Unknown', category,
        address: street, city, state: stateCode,
        phone: (pl.nationalPhoneNumber as string) ?? '', email: '',
        google_place_id: pl.id as string,
        rating: (pl.rating as number) ?? 0, review_count: (pl.userRatingCount as number) ?? 0,
        top_reviews: reviews, photos: photoUrls,
        hours: ((pl.regularOpeningHours as Record<string, string[]>)?.weekdayDescriptions ?? []).join(', '),
        owner_name: '', year_established: '', personality_profile: null,
        status: 'scraped', campaign_query: `${category} in ${city}`, unsubscribed: false,
      });
      saved.push(created.id as string);
      await new Promise(res => setTimeout(res, 150));
    }

    return Response.json({ success: true, saved_count: saved.length, business_ids: saved });
  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
});
