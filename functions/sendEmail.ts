import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Encode email body as base64url per Gmail API spec
function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function buildMimeMessage(to: string, from: string, subject: string, body: string): string {
  const msg = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: quoted-printable`,
    ``,
    body,
  ].join('\r\n');
  return toBase64Url(msg);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { campaign_id, to_email, from_name } = await req.json().catch(() => ({}));
    if (!campaign_id || !to_email) {
      return Response.json({ error: 'campaign_id and to_email required' }, { status: 400 });
    }

    // Load campaign
    const campaigns = await base44.asServiceRole.entities.EmailCampaign.filter({ id: campaign_id });
    if (!campaigns?.length) return Response.json({ error: 'Campaign not found' }, { status: 404 });
    const campaign = campaigns[0];

    if (campaign.status === 'sent') {
      return Response.json({ error: 'Email already sent' }, { status: 400 });
    }

    // Load business for context
    const businesses = await base44.asServiceRole.entities.Business.filter({ id: campaign.business_id });
    const business = businesses?.[0];
    if (business?.unsubscribed) {
      return Response.json({ error: 'Business has unsubscribed' }, { status: 400 });
    }

    // Get Gmail token
    const gmailToken = Deno.env.get('GMAIL_ACCESS_TOKEN');
    if (!gmailToken) return Response.json({ error: 'Gmail not connected' }, { status: 500 });

    // Get sender's Gmail address
    const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${gmailToken}` },
    });
    if (!profileRes.ok) {
      return Response.json({ error: 'Failed to get Gmail profile' }, { status: 500 });
    }
    const profile = await profileRes.json();
    const fromEmail = profile.emailAddress;
    const fromDisplay = from_name ? `${from_name} <${fromEmail}>` : fromEmail;

    // Build and send
    const raw = buildMimeMessage(to_email, fromDisplay, campaign.subject, campaign.body);

    const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${gmailToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    });

    if (!sendRes.ok) {
      const err = await sendRes.text();
      // Increment attempt count even on failure
      await base44.asServiceRole.entities.EmailCampaign.update(campaign_id, {
        send_attempts: (campaign.send_attempts || 0) + 1,
        status: 'failed',
      });
      return Response.json({ error: `Gmail send error: ${err}` }, { status: 500 });
    }

    const sentMsg = await sendRes.json();

    // Update campaign record
    await base44.asServiceRole.entities.EmailCampaign.update(campaign_id, {
      status: 'sent',
      sent_at: new Date().toISOString(),
      send_attempts: (campaign.send_attempts || 0) + 1,
    });

    // Update business email if we have it
    if (business && !business.email) {
      await base44.asServiceRole.entities.Business.update(business.id, { email: to_email });
    }

    return Response.json({
      success: true,
      gmail_message_id: sentMsg.id,
      from: fromEmail,
      to: to_email,
      subject: campaign.subject,
    });
  } catch (error: unknown) {
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
});
