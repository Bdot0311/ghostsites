import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;

    const { campaign_id, to_email, gmail_token } = await req.json().catch(() => ({}));
    if (!campaign_id || !to_email) return Response.json({ error: 'campaign_id and to_email required' }, { status: 400 });

    const campaign = await db.EmailCampaign.get(campaign_id);
    const gmailTok = gmail_token || Deno.env.get('GMAIL_ACCESS_TOKEN');
    if (!gmailTok) return Response.json({ error: 'Gmail token required' }, { status: 400 });

    const raw = btoa([
      `To: ${to_email}`,
      `Subject: ${campaign.subject}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      campaign.body as string
    ].join('\r\n')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');

    const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method:'POST',
      headers:{ 'Authorization': `Bearer ${gmailTok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw }),
    });

    if (!gmailRes.ok) {
      await db.EmailCampaign.update(campaign_id, { send_attempts: ((campaign.send_attempts as number)||0)+1 });
      throw new Error(`Gmail error: ${await gmailRes.text()}`);
    }

    await db.EmailCampaign.update(campaign_id, {
      status:'sent',
      sent_at: new Date().toISOString(),
      send_attempts: ((campaign.send_attempts as number)||0)+1
    });
    return Response.json({ success: true });
  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
});
