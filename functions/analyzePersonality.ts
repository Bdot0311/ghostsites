import { createClient } from 'npm:@base44/sdk@0.8.25';

async function callClaude(apiKey: string, system: string, user: string, maxTokens = 1000): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic error: ${err}`);
  }
  const data = await res.json();
  return data.content[0].text;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClient({
      appId: Deno.env.get('BASE44_APP_ID') || '69efdfc7247e1585291f7701',
      serviceToken: Deno.env.get('BASE44_SERVICE_TOKEN') || '',
    });
    const { business_id } = await req.json().catch(() => ({}));
    if (!business_id) return Response.json({ error: 'business_id required' }, { status: 400 });

    const businesses = await base44.asServiceRole.entities.Business.filter({ id: business_id });
    if (!businesses?.length) return Response.json({ error: 'Business not found' }, { status: 404 });
    const business = businesses[0];

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return Response.json({ error: 'Anthropic API key not configured' }, { status: 500 });

    const reviewsText = (business.top_reviews || [])
      .map((r: { author: string; text: string; rating: number }, i: number) =>
        `Review ${i + 1} (${r.rating}/5) by ${r.author}:\n"${r.text}"`)
      .join('\n\n');

    const system = `You are a senior brand strategist analyzing a local business to design a website that captures its true personality.

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

    const user = `Business Name: ${business.name}
Category: ${business.category}
City: ${business.city}${business.state ? ', ' + business.state : ''}
Rating: ${business.rating || 'N/A'} (${business.review_count || 0} reviews)
Hours: ${business.hours || 'N/A'}
Year Established: ${business.year_established || 'Unknown'}

REVIEWS:
${reviewsText || 'No reviews available'}`;

    const text = await callClaude(apiKey, system, user, 1000);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in Claude response');
    const profile = JSON.parse(jsonMatch[0]);

    await base44.asServiceRole.entities.Business.update(business_id, { personality_profile: profile });

    return Response.json({ success: true, profile, business_id });
  } catch (error: unknown) {
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
});
