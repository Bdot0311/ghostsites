// Generates a fresh service token by exchanging app credentials with Base44 auth API
const APP_ID = '69efdfc7247e1585291f7701';

Deno.serve(async (_req) => {
  try {
    // Try stored service token first
    const stored = Deno.env.get('BASE44_SERVICE_TOKEN') || '';
    // Validate it looks like a JWT (starts with eyJ)
    if (stored.startsWith('eyJ')) {
      return Response.json({ token: stored });
    }

    // Fallback: use the API key to get a fresh app-scoped token
    const apiKey = Deno.env.get('BASE44_API_KEY') || '';
    if (apiKey) {
      const res = await fetch(`https://base44.app/api/apps/${APP_ID}/auth/service-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Api-Key': apiKey },
        body: JSON.stringify({ app_id: APP_ID }),
      });
      if (res.ok) {
        const data = await res.json();
        const token = data.token || data.access_token || '';
        if (token) return Response.json({ token });
      }
    }

    return Response.json({ error: 'Could not obtain a valid service token. BASE44_SERVICE_TOKEN must be a JWT (starts with eyJ).' }, { status: 500 });
  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
});
