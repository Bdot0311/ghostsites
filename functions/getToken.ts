// The dashboard needs a token to call other functions on behalf of the app.
// Instead of a stored JWT (which expires), we use X-App-Id auth which is
// always valid for server-to-server calls within the same app.
const APP_ID = '69efdfc7247e1585291f7701';

Deno.serve(async (req) => {
  // If the caller already has a Bearer token (logged-in user), echo it back
  const incoming = (req.headers.get('Authorization') || '').replace('Bearer ', '');
  if (incoming && incoming.startsWith('eyJ')) {
    return Response.json({ token: incoming });
  }

  // Otherwise return the app ID as the auth credential.
  // Backend functions accept X-App-Id for internal service calls.
  // The dashboard will use this as a fallback "token" passed in X-App-Id header.
  return Response.json({ token: APP_ID, auth_type: 'app_id' });
});
