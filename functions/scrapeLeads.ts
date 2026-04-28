import { base44 } from 'npm:@base44/sdk@0.8.25';

// PLACES API (NEW) - uses places.googleapis.com/v1 NOT maps.googleapis.com
const db = base44.initializeApp({ appId: "69efdfc7247e1585291f7701" });
const NEW_API = "https://places.googleapis.com/v1/places:searchText";

Deno.serve(async (req) => {
  const body = await req.json().catch(() => ({}));
  const { city, category, campaign_id } = body;
  if (!city || !category) return Response.json({ error: "city and category required" }, { status: 400 });

  const KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");
  if (!KEY) return Response.json({ error: "GOOGLE_PLACES_API_KEY not set" }, { status: 500 });

  const allPlaces: Record<string, unknown>[] = [];
  let nextToken: string | undefined;
  let pg = 0;

  do {
    const payload: Record<string, unknown> = { textQuery: `${category} in ${city}`, maxResultCount: 20 };
    if (nextToken) payload.pageToken = nextToken;

    const r = await fetch(NEW_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": KEY,
        "X-Goog-FieldMask": [
          "places.id", "places.displayName", "places.websiteUri",
          "places.formattedAddress", "places.nationalPhoneNumber",
          "places.rating", "places.userRatingCount",
          "places.regularOpeningHours", "places.photos",
          "places.businessStatus", "nextPageToken"
        ].join(","),
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const e = await r.text();
      return Response.json({ error: `Places API (New) failed: ${e}` }, { status: 500 });
    }

    const d = await r.json();
    if (d.places) allPlaces.push(...d.places);
    nextToken = d.nextPageToken;
    pg++;
    if (nextToken) await new Promise(res => setTimeout(res, 1500));
  } while (nextToken && pg < 3);

  const queue: Record<string, unknown>[] = [];

  for (const pl of allPlaces) {
    if (pl.websiteUri) continue;
    if (pl.businessStatus === "PERMANENTLY_CLOSED") continue;

    // Fetch reviews via Place Details (New)
    let reviews: { author: string; text: string; rating: number }[] = [];
    try {
      const dr = await fetch(`https://places.googleapis.com/v1/places/${pl.id}`, {
        headers: { "X-Goog-Api-Key": KEY, "X-Goog-FieldMask": "reviews" },
      });
      if (dr.ok) {
        const dd = await dr.json();
        reviews = (dd.reviews || []).slice(0, 5).map((rv: Record<string, unknown>) => ({
          author: (rv.authorAttribution as Record<string, string>)?.displayName ?? "Anonymous",
          text: (rv.text as Record<string, string>)?.text ?? "",
          rating: (rv.rating as number) ?? 5,
        }));
      }
    } catch (_) {}

    const photoUrls = ((pl.photos as { name: string }[]) || []).slice(0, 5)
      .map(p => `https://places.googleapis.com/v1/${p.name}/media?maxWidthPx=800&key=${KEY}`);

    const hours = ((pl.regularOpeningHours as Record<string, string[]>)?.weekdayDescriptions ?? []).join(", ");
    const fullAddr = (pl.formattedAddress as string) ?? "";
    const addrParts = fullAddr.split(",");
    const street = addrParts.slice(0, -3).join(",").trim() || addrParts[0]?.trim() || "";
    const stateCode = addrParts.slice(-2, -1)[0]?.trim().split(" ")[0] ?? "";
    const bizName = (pl.displayName as Record<string, string>)?.text ?? "Unknown";

    queue.push({
      name: bizName, category, address: street, city, state: stateCode,
      phone: (pl.nationalPhoneNumber as string) ?? "",
      email: "",
      google_place_id: pl.id as string,
      rating: (pl.rating as number) ?? 0,
      review_count: (pl.userRatingCount as number) ?? 0,
      top_reviews: reviews,
      photos: photoUrls,
      hours,
      owner_name: "", year_established: "",
      personality_profile: null,
      status: "scraped",
      campaign_query: `${category} in ${city}`,
      unsubscribed: false,
    });

    await new Promise(res => setTimeout(res, 150));
  }

  let saved = 0;
  for (const biz of queue) {
    const existing = await db.asServiceRole.entities.Business.filter({ google_place_id: biz.google_place_id as string });
    if (existing?.length > 0) continue;
    await db.asServiceRole.entities.Business.create(biz);
    saved++;
  }

  if (campaign_id) {
    await db.asServiceRole.entities.Campaign.update(campaign_id, {
      businesses_found: saved,
      status: saved > 0 ? "analyzing" : "done",
    });
  }

  return Response.json({ success: true, found: allPlaces.length, no_website: queue.length, saved });
});
