import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { business_id } = body;
    if (!business_id) return Response.json({ error: 'business_id required' }, { status: 400 });

    const businesses = await base44.asServiceRole.entities.Business.filter({ id: business_id });
    if (!businesses || businesses.length === 0) return Response.json({ error: 'Business not found' }, { status: 404 });
    const business = businesses[0];

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) return Response.json({ error: 'OpenAI API key not configured' }, { status: 500 });

    const reviewsText = (business.top_reviews || [])
      .map((r: { author: string; text: string; rating: number }, i: number) =>
        `Review ${i + 1} (${r.rating}/5) by ${r.author}:\n"${r.text}"`)
      .join("\n\n");

    const systemPrompt = `You are a senior brand strategist analyzing a local business to design a website that captures its true personality.

ARCHETYPE MAPPING RULES:
- Florists, salons, boutiques, spas → Soft Luxury or Editorial
- Barbers, mechanics, dive bars, tattoo shops → Brutalist or Retro
- Law firms, accountants, dentists, financial → Editorial or Bold Minimal
- Taco trucks, diners, family restaurants, delis → Warm Local or Retro
- Gyms, bike shops, skate shops → Brutalist or Bold Minimal
- Bakeries, coffee shops, cafes → Warm Local or Soft Luxury
- Tech / IT / repair shops → Modern Tech or Bold Minimal
- Photographers, galleries, design studios → Photo-First or Editorial
- Bookstores, record stores → Editorial or Retro
- Bars, cocktail lounges → Editorial, Brutalist, or Retro

If reviews mention "feels like stepping back in time" or "old school" → lean Retro.
If reviews mention "stunning" or "beautiful space" → lean Editorial or Soft Luxury.
If reviews mention "no nonsense" or "gets it done" → lean Brutalist or Bold Minimal.

OUTPUT — JSON ONLY, NO PREAMBLE:
{
  "personality_keywords": ["5 specific adjectives from review language, NOT generic words like professional or quality"],
  "design_archetype": "one of: Editorial | Brutalist | Soft Luxury | Modern Tech | Warm Local | Bold Minimal | Photo-First | Retro",
  "tone_of_voice": "one sentence describing copy tone",
  "key_differentiator": "the ONE thing reviews keep mentioning",
  "best_review_quote": {"text": "most quotable line verbatim", "author": "first name + last initial"},
  "avoid": ["3 things that would feel wrong for this business"]
}`;

    const userPrompt = `Business Name: ${business.name}
Category: ${business.category}
City: ${business.city}${business.state ? ", " + business.state : ""}
Rating: ${business.rating || "N/A"} (${business.review_count || 0} reviews)
Hours: ${business.hours || "N/A"}
Year Established: ${business.year_established || "Unknown"}

REVIEWS:
${reviewsText || "No reviews available"}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return Response.json({ error: `OpenAI error: ${err}` }, { status: 500 });
    }

    const data = await response.json();
    const profile = JSON.parse(data.choices[0].message.content);

    await base44.asServiceRole.entities.Business.update(business_id, { personality_profile: profile });

    return Response.json({ success: true, profile, business_id });
  } catch (error: unknown) {
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
});
