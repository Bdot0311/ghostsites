import { createClientFromRequest } from "npm:@base44/sdk";

async function callClaude(apiKey: string, system: string, user: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 800, system, messages: [{ role: 'user', content: user }] }),
  });
  if (!res.ok) throw new Error(`Claude error: ${await res.text()}`);
  return (await res.json()).content[0].text;
}
function parseJSON(t: string) { const m = t.match(/\{[\s\S]*\}/); if (!m) throw new Error('No JSON'); return JSON.parse(m[0]); }

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;

    const { business_id } = await req.json().catch(() => ({}));
    if (!business_id) return Response.json({ error: 'business_id required' }, { status: 400 });
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return Response.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 });

    const business = await db.Business.get(business_id);
    const reviewsText = ((business.top_reviews as {author:string;text:string;rating:number}[]) || []).slice(0,5)
      .map((r,i) => `Review ${i+1} (${r.rating}/5) by ${r.author}: "${r.text}"`).join('\n');

    const system = `You are a brand strategist for LOCAL SERVICE BUSINESSES. Output JSON only. No explanation.

Your job is to read the reviews and extract the SOUL of this business — not generic platitudes.

Pick ONE archetype from this list based on the business vibe in the reviews:
- Barbers/men's grooming → Brutalist OR Retro OR Bold Minimal
- Salons/nail/lash/beauty → Soft Luxury OR Retro OR Editorial
- Tattoo studios → Brutalist OR Editorial
- Spas/massage → Soft Luxury OR Editorial
- Cafes/bakeries/coffee → Warm Local OR Retro
- Diners/family restaurants → Warm Local OR Retro
- Upscale restaurants/bars → Editorial OR Photo-First
- Gyms/boxing/fitness → Bold Minimal OR Brutalist
- Auto/mechanics → Brutalist OR Retro OR Bold Minimal
- Accounting/law/medical → Editorial OR Bold Minimal
- Landscaping/trades → Warm Local
- Photographers/galleries → Photo-First OR Editorial
- Boutiques/clothing → Soft Luxury OR Photo-First

CRITICAL EXTRACTION RULES:
1. Differentiator: What SPECIFIC thing do customers keep praising? NOT "good service" or "friendly staff". Look for details like "she remembers every regular's order", "they finished my oil change in 20 minutes", "the best croissant I've had outside Paris", "he got my fade exactly right when 3 other barbers couldn't". If reviews are vague, infer from the category + city + rating.
2. Tone: Write ONE sentence in the owner's voice. Reference the city/neighborhood. Example: "We've been fixing transmissions on this corner of Brooklyn for fifteen years — if it runs, we can keep it running." NOT: "We provide excellent customer service."
3. Keywords: 3-5 words that capture the vibe. NOT "professional, reliable, friendly". INSTEAD "gritty, no-BS, lightning-fast, neighborhood-famous, unpretentious"
4. Best review quote: Pick the MOST emotional, MOST specific review. Not the longest. The one with a story or a specific detail.
5. Avoid: What design clichés would KILL this business's vibe? Example for a brutalist barber: avoid "soft pastels, script fonts, floral patterns". Example for a luxury spa: avoid "neon colors, comic sans, cluttered layouts"
6. Industry sections: Based on the category, recommend what sections the website should have. Use real names like ["Hero","Menu","Story","Gallery","Reservations","Reviews","Hours","Contact"] for restaurants, or ["Hero","Services","Gallery","Book","Reviews","Contact"] for salons.

JSON: {"personality_keywords":["a","b","c","d","e"],"design_archetype":"Brutalist","tone_of_voice":"one sentence, owner voice, references the city","key_differentiator":"the one specific thing customers keep praising, with detail","best_review_quote":{"text":"verbatim most emotional quote","author":"Name L."},"avoid":["cliche1","cliche2"],"industry_sections":["Hero","About","Services","Gallery","Reviews","Contact"]}`;

    const user = `Business: ${business.name}
Category: ${business.category}
City: ${business.city}${business.state ? ', ' + business.state : ''}
Rating: ${business.rating || 'N/A'} (${business.review_count || 0} reviews)
Reviews:
${reviewsText || 'None'}`;

    const profile = parseJSON(await callClaude(apiKey, system, user));
    await db.Business.update(business_id, { personality_profile: profile });
    return Response.json({ success: true, profile });
  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
});
