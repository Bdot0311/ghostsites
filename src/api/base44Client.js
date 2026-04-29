import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { token, functionsVersion, appBaseUrl } = appParams;

export const base44 = createClient({
  appId: "69efdfc7247e1585291f7701",
  token,
  functionsVersion,
  requiresAuth: false,
  appBaseUrl
});
