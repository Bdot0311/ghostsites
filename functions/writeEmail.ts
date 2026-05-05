import { createClientFromRequest } from "npm:@base44/sdk";

async function callClaude(apiKey: string, system: string, user: string): Promise<string> {
  for (let attempt = 0; attempt <= 2; attempt++) {
    if (attempt > 0) await new Promise(r => setTimeout(r, 1500 * attempt));
    let res: Response;
    try {
      res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: {'x-api-key':apiKey,'anthropic-version':'2023-06-01','content-type':'application/json'},
        body: JSON.stringify({
          model:'claude-opus-4-5', max_tokens:700,
          system: system + '\n\nOutput raw JSON only. No markdown. No code fences. No explanation.',
          messages:[{role:'user',content:user},{role:'assistant',content:'{'}],
        }),
        signal: AbortSignal.timeout(90000), // signal goes in fetch options, not body
      });
    } catch (e) { if (attempt === 2) throw e; continue; }
    const raw = await res.text();
    if (raw.trimStart().startsWith('<')) { if (attempt === 2) throw new Error(`HTML response: ${raw.slice(0,200)}`); continue; }
    if (!res.ok) throw new Error(`Claude error ${res.status}: ${raw.slice(0,300)}`);
    return '{' + JSON.parse(raw).content[0].text;
  }
  throw new Error('All retries exhausted');
}
function parseJSON(t: string) {
  const clean = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').replace(/<!--[\s\S]*?-->/g, '').trim();
  try { return JSON.parse(clean); } catch (_) {}
  const m = clean.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch (_) {} }
  throw new Error(`No valid JSON. Raw: ${t.slice(0, 200)}`);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;

    const { business_id } = await req.json().catch(() => ({}));
    if (!business_id) return Response.json({ error: 'business_id required' }, { status: 400 });
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return Response.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 });

    const business = await db.Business.get(business_id);
    const sites = await db.GeneratedSite.filter({ business_id });
    const site = (sites as Record<string,unknown>[])?.[0] || {};
    const profile = (business.personality_profile as Record<string,unknown>) || {};
    const bestQuote = (profile.best_review_quote as Record<string,string>) || {};
    const specificPraise = (profile.key_differentiator as string) || '';
    const ownerName = (business.owner_name as string) || '';
    const hasWebsite = !!(business.current_website_url);
    const greeting = ownerName ? `Hi ${ownerName}` : `Hi`;

    const system = `Write a cold email to a local business owner. Output JSON only: {"subject":"...","body":"..."}

You are a web designer who genuinely researched this business before writing. The email must feel like a human wrote it after spending 10 minutes on their Google listing — NOT a mass blast.

STRICT RULES:
- Subject: ≤6 words, lowercase, feels written specifically for THIS business. Reference their category or a review detail. NEVER generic like "your website" or "web design".
- Body: 75-95 words total. Short and punchy.
- NO "hope this finds you well", "wanted to reach out", "I came across", "amazing", "incredible", "premier", "leading", "top-rated".
- NO exclamation marks.
- The opener must reference something SPECIFIC from the reviews or their listing — a customer name, a specific praise, their rating count, their neighborhood. Show you actually looked.
- The pain point must be SPECIFIC to having no web presence or a bad site. Mention what happens when someone searches their category in their city.
- Sign off as "— Alex" (casual, no title).

BAD OPENER: "I saw your reviews and wanted to reach out..."
GOOD OPENER: "Maria G. said you're the only shop in Williamsburg that gets her '60s fade exactly right — and with 47 five-star reviews, clearly word's getting around."

BAD PAIN: "You need a better website to attract more customers."
GOOD PAIN: "But when someone searches 'barber near me' in Williamsburg at 11pm, your Instagram doesn't show up — and they book somewhere else."

BAD SUBJECT: "your website"
GOOD SUBJECT: "11pm searches in williamsburg" or "that '60s fade maria mentioned"`;

    const user = `Business: ${business.name} (${business.category} in ${business.city})
Greeting: ${greeting}
Specific praise from reviews: "${specificPraise}"
Best customer review: "${bestQuote.text || ''}" — ${bestQuote.author || ''}
Mockup URL: ${site.subdomain_url||'N/A'}
Has existing website: ${hasWebsite ? 'YES - ' + business.current_website_url : 'NO'}
Rating: ${business.rating}/5 (${business.review_count} reviews)

Write the email now.`;

    const email = parseJSON(await callClaude(apiKey, system, user));
    const campaign = await db.EmailCampaign.create({
      business_id, site_id: (site.id as string)||null,
      subject: email.subject,
      body: `${email.body}\n\n---\nTo unsubscribe, reply "remove me".`,
      status: 'draft', send_attempts: 0,
    });

    return Response.json({ success:true, campaign_id: campaign.id, subject: email.subject, body: campaign.body });
  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
});
