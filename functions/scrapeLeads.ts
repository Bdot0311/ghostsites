import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { city, category, campaign_id } = body;
    if (!city || !category) return Response.json({ error: 'city and category required' }, { status: 400 });

    const googleApiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    if (!googleApiKey) return Response.json({ error: 'GOOGLE_PLACES_API_KEY not configured' }, { status: 500 });

    const query = `${category} in ${city}`;
    const results: Record<string, unknown>[] = [];
    let nextPageToken: string | undefined;
    let page = 0;
    const MAX_PAGES = 3;

    do {
      const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
      url.searchParams.set("query", query);
      url.searchParams.set("key", googleApiKey);
      url.searchParams.set("region", "us");
      if (nextPageToken) {
        url.searchParams.set("pagetoken", nextPageToken);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        return Response.json({ error: `Google Places error: ${data.status}` }, { status: 500 });
      }
      if (data.results) results.push(...data.results);
      nextPageToken = data.next_page_token;
      page++;
    } while (nextPageToken && page < MAX_PAGES);

    const noWebsite: Record<string, unknown>[] = [];

    for (const place of results) {
      const detailUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json");
      detailUrl.searchParams.set("place_id", place.place_id as string);
      detailUrl.searchParams.set("fields", "name,website,formatted_address,formatted_phone_number,opening_hours,rating,user_ratings_total,reviews,photos,business_status");
      detailUrl.searchParams.set("key", googleApiKey);

      const detailRes = await fetch(detailUrl.toString());
      const detailData = await detailRes.json();
      const detail = detailData.result;
      if (!detail) continue;
      if (detail.website) continue;
      if (detail.business_status === "PERMANENTLY_CLOSED") continue;

      const photos = (detail.photos || []).slice(0, 5).map((p: { photo_reference: string }) =>
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${p.photo_reference}&key=${googleApiKey}`
      );
      const top_reviews = (detail.reviews || []).slice(0, 5).map((r: { author_name: string; text: string; rating: number }) => ({
        author: r.author_name, text: r.text, rating: r.rating,
      }));
      const hours = (detail.opening_hours?.weekday_text || []).join(", ");
      const addressParts = (detail.formatted_address || "").split(",");
      const address = addressParts.slice(0, -3).join(",").trim();
      const statePart = addressParts.slice(-2, -1)[0]?.trim().split(" ")[0] || "";

      noWebsite.push({
        name: detail.name || place.name,
        category, address, city, state: statePart,
        phone: detail.formatted_phone_number || "",
        email: "",
        google_place_id: place.place_id,
        rating: detail.rating || 0,
        review_count: detail.user_ratings_total || 0,
        top_reviews, photos, hours,
        owner_name: "", year_established: "",
        personality_profile: null,
        status: "scraped",
        campaign_query: `${category} in ${city}`,
      });

      await new Promise(resolve => setTimeout(resolve, 200));
    }

    let saved = 0;
    for (const biz of noWebsite) {
      const existing = await base44.asServiceRole.entities.Business.filter({ google_place_id: biz.google_place_id as string });
      if (existing && existing.length > 0) continue;
      await base44.asServiceRole.entities.Business.create(biz);
      saved++;
    }

    if (campaign_id) {
      await base44.asServiceRole.entities.Campaign.update(campaign_id, {
        businesses_found: saved, status: "analyzing",
      });
    }

    return Response.json({ success: true, found: results.length, no_website: noWebsite.length, saved });
  } catch (error: unknown) {
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
});
