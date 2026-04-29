import { createClient } from 'npm:@base44/sdk@0.8.25';

async function callClaude(apiKey: string, system: string, user: string, maxTokens = 600): Promise<string> {
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

    const sites = await base44.asServiceRole.entities.GeneratedSite.filter({ business_id });
    if (!sites?.length) return Response.json({ error: 'No generated site found' }, { status: 400 });
    const site = sites[0];

    const profile = business.personality_profile || {};
    const bestQuote = profile.best_review_quote || {};

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return Response.json({ error: 'Anthropic API key not configured' }, { status: 500 });

    const system = `Write a 60-90 word cold email to a local business owner who doesn't have a website.

Subject line rules:
- Under 6 words, lowercase, no emojis, no "quick question" or "hey there"
- Examples: "built you a quick site", "saw your shop on maps", "thought you'd want this"

Opening: Specific to THIS business. NEVER "Hope you're well", "Hope this finds you well", "I came across your business"

Body: One sentence what you noticed + one sentence what you built + the link on its own line

Soft CTA: Just ask if they want to look. No pricing. No "let me know if you're interested"

Sign-off: First name only, no title, no company

HARD RULES: Never use "I hope this email finds you well", "I wanted to reach out", "amazing", "incredible". Never include pricing. Under 90 words. No bullet points.

OUTPUT JSON ONLY: {"subject": "...", "body": "..."}`;

    const user = `Owner: ${business.owner_name || 'the owner'}
Business: ${business.name}
Category: ${business.category}
City: ${business.city}
Preview URL: ${site.subdomain_url}
Best Review Quote: "${bestQuote.text || ''}" — ${bestQuote.author || ''}
Personality Keywords: ${(profile.personality_keywords || []).join(', ')}
Key Differentiator: ${profile.key_differentiator || ''}
Tone: ${profile.tone_of_voice || ''}
Address: ${business.address || ''}`;

    const text = await callClaude(apiKey, system, user, 600);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in Claude response');
    const emailContent = JSON.parse(jsonMatch[0]);
    const fullBody = `${emailContent.body}\n\n---\nTo unsubscribe, reply "remove me" and I'll take you off the list immediately.`;

    const campaign = await base44.asServiceRole.entities.EmailCampaign.create({
      business_id,
      site_id: site.id,
      subject: emailContent.subject,
      body: fullBody,
      status: 'draft',
      send_attempts: 0,
    });

    return Response.json({ success: true, campaign_id: campaign.id, subject: emailContent.subject, body: fullBody });
  } catch (error: unknown) {
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
});
