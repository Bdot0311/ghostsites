import { createClientFromRequest } from "npm:@base44/sdk";
import { getIndustrySections } from "./designLibrary.ts";

const MINI_APP_URL = 'https://untitled-app-37d87fa3.base44.app';

// ── Helpers ──────────────────────────────────────────────────────────────────

// Safe Anthropic caller: reads body as text first so HTML proxy errors never crash res.json().
// Retries up to 2x with backoff on transient failures (rate limits, CDN error pages, etc).
async function anthropicFetch(payload: Record<string, unknown>, apiKey: string, retries = 2): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) await new Promise(r => setTimeout(r, 1500 * attempt));
    let res: Response;
    try {
      res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(90000),
      });
    } catch (e) {
      if (attempt === retries) throw new Error(`Anthropic fetch failed: ${e}`);
      continue;
    }
    const raw = await res.text();
    // HTML response = proxy/CDN error page (<!-- --> or <!DOCTYPE) — retry
    if (raw.trimStart().startsWith('<')) {
      if (attempt === retries) throw new Error(`Anthropic returned HTML (${res.status}): ${raw.slice(0, 200)}`);
      continue;
    }
    if (!res.ok) throw new Error(`Anthropic ${res.status}: ${raw.slice(0, 300)}`);
    let data: { content: { text: string }[] };
    try { data = JSON.parse(raw); } catch (_) {
      if (attempt === retries) throw new Error(`Anthropic non-JSON: ${raw.slice(0, 200)}`);
      continue;
    }
    const text = data?.content?.[0]?.text;
    if (typeof text !== 'string') throw new Error(`Anthropic response missing text: ${raw.slice(0, 200)}`);
    const cleanedText = stripHtmlComments(text).trim();
    if (!cleanedText) throw new Error('Anthropic returned empty text');
    if (cleanedText.trimStart().startsWith('<')) {
      if (attempt === retries) throw new Error(`Anthropic returned HTML text (${res.status}): ${cleanedText.slice(0, 200)}`);
      continue;
    }
    return cleanedText;
  }
  throw new Error('Anthropic: all retries exhausted');
}

async function callClaude(apiKey: string, system: string, user: string, maxTokens = 1000, model = 'claude-opus-4-5'): Promise<string> {
  return anthropicFetch({ model, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] }, apiKey);
}

// callClaudeJSON: pre-fills assistant turn with '{' — model can never prepend markdown/HTML.
async function callClaudeJSON(apiKey: string, system: string, user: string, maxTokens = 1000, model = 'claude-opus-4-5'): Promise<string> {
  const text = await anthropicFetch({
    model, max_tokens: maxTokens,
    system: system + '\n\nOutput raw JSON only. No markdown. No code fences. No explanation.',
    messages: [{ role: 'user', content: user }, { role: 'assistant', content: '{' }],
  }, apiKey);
  return '{' + text;
}

function parseJSON(text: string) {
  // Strip markdown code fences
  let t = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  // Strip leading HTML comments
  t = stripHtmlComments(t).trim();
  if (!t) throw new Error(`No JSON returned. Raw: ${text.slice(0, 200)}`);
  if (t.trimStart().startsWith('<')) throw new Error(`Expected JSON but got HTML. Raw: ${text.slice(0, 200)}`);
  // Try the full cleaned string first
  try { return JSON.parse(t); } catch (_) { /* fall through */ }
  // Greedy: first { to last }
  const greedy = t.match(/\{[\s\S]*\}/);
  if (greedy) { try { return JSON.parse(greedy[0]); } catch (_) {} }
  // Last-resort: smallest valid JSON objects from end to start
  const blocks = [...t.matchAll(/\{[^{}]*\}/g)].reverse();
  for (const m of blocks) { try { return JSON.parse(m[0]); } catch (_) {} }
  throw new Error(`No valid JSON in Claude response. Raw: ${text.slice(0, 200)}`);
}

function stripHtmlComments(text: string): string {
  return text.replace(/^\s*(?:<!--[\s\S]*?-->\s*)+/g, '').replace(/<!--[\s\S]*?-->/g, '');
}

// Follow the Google Places photo redirect server-side to get the public CDN URL.
async function resolvePhotoUrl(placesUrl: string): Promise<string | null> {
  const isCdn = (u: string) =>
    u.includes('googleusercontent') || u.includes('gstatic') || u.includes('ggpht');
  try {
    const url = placesUrl.replace(/maxWidthPx=\d+/, 'maxWidthPx=900');
    const head = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(8000) });
    if (head.ok && isCdn(head.url)) return head.url;
    const get = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(8000) });
    await get.body?.cancel();
    if (get.ok && isCdn(get.url)) return get.url;
    return null;
  } catch (_) { return null; }
}

const LOW_QUALITY_PATTERNS = [
  /facebook\.com/i, /instagram\.com/i, /yelp\.com/i, /google\.com\/maps/i,
  /wix\.com/i, /weebly\.com/i, /godaddy\.com\/(sites|websitebuilder)/i,
  /site123\.com/i, /jimdo\.com/i, /yola\.com/i, /webnode\.com/i,
  /vistaprint\.com/i, /yellowpages\.com/i, /angieslist\.com/i,
  /thumbtack\.com/i, /homeadvisor\.com/i, /nextdoor\.com/i,
  /squarespace\.com\/preview/i, /wordpress\.com\//i,
];
function isLowQualityWebsite(url: string): boolean {
  return LOW_QUALITY_PATTERNS.some(p => p.test(url));
}

async function enrichFromWebsite(websiteUrl: string): Promise<{ email?: string; owner_name?: string }> {
  try {
    const resp = await fetch(websiteUrl, {
      redirect: 'follow', signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GhostSites/1.0; +https://ghostsites.io)' },
    });
    if (!resp.ok) return {};
    const html = await resp.text();
    const emailMatches = html.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) || [];
    const email = emailMatches.find(e =>
      !e.match(/noreply|no-reply|example|test@|@sentry|\.png|\.jpg|\.gif|wix|wordpress/i)
    );
    const ownerMatch = html.match(
      /(?:owner|founder|proprietor|president|ceo|by)[:\s,]+([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i
    );
    return { email, owner_name: ownerMatch?.[1] };
  } catch (_) { return {}; }
}

function pickRandom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }
function stars(n: number): string { return '★'.repeat(Math.min(5, Math.max(1, Math.round(n || 5)))); }
function hexToRgb(hex: string): string {
  const m = hex.replace('#', '').match(/.{2}/g) || ['0', '0', '0'];
  return m.slice(0, 3).map(x => parseInt(x, 16)).join(',');
}
function isDarkBg(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) < 128;
}

// ── Animation CSS generators (actually implemented) ─────────────────────────

function getAnimationCSS(interactions: string[], pal: any, isDark: boolean): string {
  const anim: string[] = [];
  
  // Always include scroll reveal base
  anim.push(`
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideInLeft {
      from { opacity: 0; transform: translateX(-60px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(60px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .anim-fade-up {
      animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      opacity: 0;
    }
    .anim-delay-1 { animation-delay: 0.1s; }
    .anim-delay-2 { animation-delay: 0.2s; }
    .anim-delay-3 { animation-delay: 0.3s; }
    .anim-delay-4 { animation-delay: 0.4s; }
    .anim-delay-5 { animation-delay: 0.5s; }
  `);

  if (interactions.includes("SCROLL_REVEAL")) {
    anim.push(`
      .reveal {
        opacity: 0;
        transform: translateY(50px);
        transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .reveal.visible {
        opacity: 1;
        transform: translateY(0);
      }
      .reveal-left {
        opacity: 0;
        transform: translateX(-50px);
        transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .reveal-left.visible {
        opacity: 1;
        transform: translateX(0);
      }
      .reveal-scale {
        opacity: 0;
        transform: scale(0.92);
        transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .reveal-scale.visible {
        opacity: 1;
        transform: scale(1);
      }
    `);
  }

  if (interactions.includes("MARQUEE")) {
    anim.push(`
      .marquee-track {
        display: flex;
        width: max-content;
        animation: marquee 25s linear infinite;
      }
      .marquee-track:hover {
        animation-play-state: paused;
      }
    `);
  }

  if (interactions.includes("TEXT_SCRAMBLE")) {
    anim.push(`
      @keyframes glitch {
        0%, 100% { opacity: 1; transform: translate(0); }
        20% { opacity: 0.8; transform: translate(-2px, 1px); }
        40% { opacity: 1; transform: translate(2px, -1px); }
        60% { opacity: 0.9; transform: translate(-1px, -1px); }
        80% { opacity: 1; transform: translate(1px, 2px); }
      }
      .text-glitch {
        animation: glitch 0.4s ease-in-out;
      }
    `);
  }

  if (interactions.includes("IMAGE_REVEAL")) {
    anim.push(`
      .img-reveal {
        position: relative;
        overflow: hidden;
      }
      .img-reveal::after {
        content: '';
        position: absolute;
        inset: 0;
        background: ${pal.accent};
        transform: scaleX(1);
        transform-origin: right;
        transition: transform 1.2s cubic-bezier(0.77, 0, 0.175, 1);
      }
      .img-reveal.visible::after {
        transform: scaleX(0);
        transform-origin: left;
      }
      .img-reveal img {
        transform: scale(1.2);
        transition: transform 1.4s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .img-reveal.visible img {
        transform: scale(1);
      }
    `);
  }

  if (interactions.includes("MAGNETIC_BUTTONS")) {
    anim.push(`
      .btn-magnetic {
        transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
      }
      .btn-magnetic:hover {
        transform: scale(1.05);
      }
    `);
  }

  if (interactions.includes("CUSTOM_CURSOR") && !isDark) {
    // Only on dark brutalist/tech sites
  }

  if (interactions.includes("PARALLAX")) {
    anim.push(`
      .parallax-bg {
        background-attachment: fixed;
        background-position: center;
        background-size: cover;
      }
      @media (max-width: 768px) {
        .parallax-bg { background-attachment: scroll; }
      }
    `);
  }

  // Hover lift for cards
  anim.push(`
    .hover-lift {
      transition: transform 0.35s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.35s ease;
    }
    .hover-lift:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    }
  `);

  return anim.join('\n');
}

// ── Archetype-specific base CSS ─────────────────────────────────────────────

function getArchetypeBaseCSS(archetype: string, pal: any, typo: any): string {
  const isDark = isDarkBg(pal.background);
  
  // Brutalist: harsh, raw, no soft edges
  if (archetype === "Brutalist") {
    return `
      body { font-family: '${typo.body_font}', system-ui, sans-serif; background: ${pal.background}; color: ${pal.text}; line-height: 1.65; font-size: 1.05rem; -webkit-font-smoothing: antialiased; }
      h1, h2, h3 { font-family: '${typo.heading_font}', Impact, sans-serif; line-height: 0.95; text-transform: uppercase; letter-spacing: -0.02em; }
      h1 { font-weight: 900; }
      .card { border: 2px solid ${pal.text}; border-radius: 0; background: ${pal.background}; }
      .btn { border: 2px solid ${pal.text}; border-radius: 0; background: ${pal.accent}; color: ${pal.background}; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; padding: 1rem 2rem; }
      .btn:hover { background: ${pal.text}; color: ${pal.accent}; }
    `;
  }
  
  // Soft Luxury: elegant, generous spacing, refined
  if (archetype === "Soft Luxury") {
    return `
      body { font-family: '${typo.body_font}', system-ui, sans-serif; background: ${pal.background}; color: ${pal.text}; line-height: 1.85; font-size: 1.0625rem; -webkit-font-smoothing: antialiased; }
      h1, h2, h3 { font-family: '${typo.heading_font}', Georgia, serif; line-height: 1.15; font-weight: 400; letter-spacing: -0.01em; }
      h1 { font-weight: 300; font-size: clamp(2.8rem, 6vw, 5rem); }
      .card { border-radius: 2px; background: ${pal.primary}; border: none; }
      .btn { border-radius: 50px; background: ${pal.accent}; color: #fff; font-weight: 500; letter-spacing: 0.02em; padding: 1.1rem 2.5rem; border: none; }
      section { padding: 8rem 0; }
      .wrap { max-width: 1100px; margin: 0 auto; padding: 0 2.5rem; }
    `;
  }
  
  // Editorial: magazine-like, strong hierarchy
  if (archetype === "Editorial") {
    return `
      body { font-family: '${typo.body_font}', system-ui, sans-serif; background: ${pal.background}; color: ${pal.text}; line-height: 1.75; font-size: 1.05rem; -webkit-font-smoothing: antialiased; }
      h1, h2, h3 { font-family: '${typo.heading_font}', Georgia, serif; line-height: 1.1; font-weight: 700; }
      h1 { font-size: clamp(3rem, 7vw, 6rem); letter-spacing: -0.03em; }
      .card { border-radius: 0; background: transparent; border-left: 3px solid ${pal.accent}; padding-left: 1.5rem; }
      .btn { background: ${pal.text}; color: ${pal.background}; font-weight: 700; padding: 0.9rem 2rem; border-radius: 0; }
    `;
  }
  
  // Retro: warm, nostalgic, slightly playful
  if (archetype === "Retro") {
    return `
      body { font-family: '${typo.body_font}', system-ui, sans-serif; background: ${pal.background}; color: ${pal.text}; line-height: 1.7; font-size: 1.05rem; -webkit-font-smoothing: antialiased; }
      h1, h2, h3 { font-family: '${typo.heading_font}', Georgia, serif; line-height: 1.2; }
      h1 { font-size: clamp(2.8rem, 6vw, 5rem); }
      .card { border-radius: 8px; background: ${pal.primary}; box-shadow: 4px 4px 0 ${pal.secondary}; border: 2px solid ${pal.secondary}; }
      .btn { border-radius: 8px; background: ${pal.accent}; color: #fff; font-weight: 700; padding: 1rem 2rem; box-shadow: 3px 3px 0 ${pal.text}; transition: all 0.2s; }
      .btn:hover { transform: translate(2px, 2px); box-shadow: 1px 1px 0 ${pal.text}; }
    `;
  }
  
  // Modern Tech: clean, precise, slightly cold
  if (archetype === "Modern Tech") {
    return `
      body { font-family: '${typo.body_font}', system-ui, sans-serif; background: ${pal.background}; color: ${pal.text}; line-height: 1.65; font-size: 0.95rem; -webkit-font-smoothing: antialiased; }
      h1, h2, h3 { font-family: '${typo.heading_font}', system-ui, sans-serif; line-height: 1.15; font-weight: 600; letter-spacing: -0.02em; }
      h1 { font-size: clamp(2.5rem, 5.5vw, 4.5rem); font-weight: 700; }
      .card { border-radius: 12px; background: ${pal.primary}; border: 1px solid rgba(255,255,255,0.1); }
      .btn { border-radius: 8px; background: ${pal.accent}; color: ${pal.background}; font-weight: 600; padding: 0.85rem 1.75rem; font-size: 0.9rem; letter-spacing: 0.02em; }
    `;
  }
  
  // Photo-First: minimal UI, images dominate
  if (archetype === "Photo-First") {
    return `
      body { font-family: '${typo.body_font}', system-ui, sans-serif; background: ${pal.background}; color: ${pal.text}; line-height: 1.7; font-size: 1rem; -webkit-font-smoothing: antialiased; }
      h1, h2, h3 { font-family: '${typo.heading_font}', Georgia, serif; line-height: 1.1; font-weight: 400; }
      h1 { font-size: clamp(2.2rem, 5vw, 4rem); font-weight: 300; }
      .card { border-radius: 0; background: transparent; }
      .btn { background: transparent; color: ${pal.text}; border: 1px solid ${pal.text}; padding: 0.75rem 1.5rem; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; }
      .btn:hover { background: ${pal.text}; color: ${pal.background}; }
    `;
  }
  
  // Bold Minimal: stark, confident, aggressive whitespace
  if (archetype === "Bold Minimal") {
    return `
      body { font-family: '${typo.body_font}', system-ui, sans-serif; background: ${pal.background}; color: ${pal.text}; line-height: 1.6; font-size: 1.05rem; -webkit-font-smoothing: antialiased; }
      h1, h2, h3 { font-family: '${typo.heading_font}', Impact, sans-serif; line-height: 0.95; font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em; }
      h1 { font-size: clamp(3.5rem, 10vw, 8rem); }
      .card { border-radius: 0; border-top: 1px solid ${pal.muted}; padding-top: 2rem; }
      .btn { background: ${pal.accent}; color: ${pal.background === '#FFFFFF' || pal.background === '#FAFAFA' ? '#fff' : pal.background}; font-weight: 900; padding: 1.2rem 2.5rem; text-transform: uppercase; letter-spacing: 0.08em; border: none; }
      section { padding: 10rem 0; }
      .wrap { max-width: 1000px; }
    `;
  }
  
  // Warm Local (default): friendly, approachable, neighborhood feel
  return `
    body { font-family: '${typo.body_font}', system-ui, sans-serif; background: ${pal.background}; color: ${pal.text}; line-height: 1.75; font-size: 1.0625rem; -webkit-font-smoothing: antialiased; }
    h1, h2, h3 { font-family: '${typo.heading_font}', Georgia, serif; line-height: 1.15; font-weight: 700; }
    .card { border-radius: 14px; background: ${pal.primary}; box-shadow: 0 2px 16px rgba(0,0,0,0.07); }
    .btn { border-radius: 50px; background: ${pal.accent}; color: #fff; font-weight: 700; padding: 0.9rem 2rem; transition: transform 0.2s, box-shadow 0.2s; }
    .btn:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(0,0,0,0.18); }
  `;
}

// ── Archetype-specific HTML builders ────────────────────────────────────────

function buildHero(archetype: string, business: any, copy: any, pal: any, photos: string[]): string {
  const phone = business.phone || '';
  const phoneTel = phone.replace(/\D/g, '');
  const rating = business.rating || 5;
  const revCount = business.review_count || 0;
  const heroPhoto = photos[0] || '';
  const isDark = isDarkBg(pal.background);

  // Brutalist: massive centered type, raw, no soft gradients
  if (archetype === "Brutalist") {
    return `
<section class="hero" style="min-height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:2rem;background:${pal.background};border-bottom:4px solid ${pal.text};">
  <div class="hero-inner" style="max-width:900px;">
    <div class="anim-fade-up" style="font-family:monospace;font-size:0.8rem;text-transform:uppercase;letter-spacing:0.15em;color:${pal.muted};margin-bottom:2rem;">
      ${business.category} · ${business.city}${business.state ? ', ' + business.state : ''}
    </div>
    <h1 class="anim-fade-up anim-delay-1" style="font-size:clamp(3rem,10vw,8rem);font-weight:900;text-transform:uppercase;line-height:0.9;margin-bottom:2rem;color:${pal.text};">
      ${copy.headline}
    </h1>
    <p class="anim-fade-up anim-delay-2" style="font-size:clamp(1.1rem,2vw,1.4rem);color:${pal.muted};max-width:50ch;margin:0 auto 3rem;">
      ${copy.tagline}
    </p>
    <div class="anim-fade-up anim-delay-3" style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
      <a href="tel:${phoneTel}" class="btn">📞 Call Now</a>
      ${heroPhoto ? `<a href="#about" class="btn" style="background:transparent;color:${pal.text};border:2px solid ${pal.text};">See More</a>` : ''}
    </div>
    ${revCount > 0 ? `<div class="anim-fade-up anim-delay-4" style="margin-top:3rem;font-family:monospace;font-size:0.75rem;color:${pal.muted};">★ ${rating} · ${revCount} reviews</div>` : ''}
  </div>
</section>`;
  }

  // Soft Luxury: generous, elegant, centered or split
  if (archetype === "Soft Luxury") {
    return `
<section class="hero" style="min-height:100vh;display:flex;align-items:center;padding:6rem 2rem;background:${pal.background};">
  <div class="wrap" style="width:100%;">
    <div style="max-width:700px;">
      <p class="anim-fade-up" style="font-size:0.85rem;text-transform:uppercase;letter-spacing:0.12em;color:${pal.muted};margin-bottom:2rem;">
        ${business.category} — ${business.city}
      </p>
      <h1 class="anim-fade-up anim-delay-1" style="font-size:clamp(2.8rem,5.5vw,4.5rem);font-weight:300;line-height:1.1;margin-bottom:1.5rem;letter-spacing:-0.02em;color:${pal.text};">
        ${copy.headline}
      </h1>
      <p class="anim-fade-up anim-delay-2" style="font-size:clamp(1.05rem,1.5vw,1.2rem);color:${pal.muted};line-height:1.7;max-width:45ch;margin-bottom:2.5rem;">
        ${copy.tagline}
      </p>
      <div class="anim-fade-up anim-delay-3" style="display:flex;gap:1.5rem;align-items:center;flex-wrap:wrap;">
        <a href="tel:${phoneTel}" class="btn">${phone || 'Book a Consultation'}</a>
        <span style="font-size:0.85rem;color:${pal.muted};">⭐ ${rating} · ${revCount} reviews</span>
      </div>
    </div>
  </div>
  ${heroPhoto ? `<div style="position:absolute;top:0;right:0;width:40%;height:100%;opacity:0.15;"><img src="${heroPhoto}" style="width:100%;height:100%;object-fit:cover;" alt=""></div>` : ''}
</section>`;
  }

  // Photo-First: image dominates, minimal text overlay
  if (archetype === "Photo-First" && heroPhoto) {
    return `
<section class="hero parallax-bg" style="min-height:100vh;display:flex;align-items:flex-end;padding:0 0 4rem;background:linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%), url('${heroPhoto}') center/cover no-repeat;">
  <div class="wrap anim-fade-up" style="width:100%;">
    <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.2em;color:rgba(255,255,255,0.7);margin-bottom:1rem;">${business.category} · ${business.city}</p>
    <h1 style="font-size:clamp(2.5rem,6vw,5rem);font-weight:300;color:#fff;line-height:1.05;max-width:14ch;margin-bottom:1.5rem;">${copy.headline}</h1>
    <p style="font-size:1.05rem;color:rgba(255,255,255,0.85);max-width:45ch;margin-bottom:2rem;">${copy.tagline}</p>
    <a href="tel:${phoneTel}" class="btn" style="background:#fff;color:#1a1a1a;">📞 ${phone || 'Get in Touch'}</a>
  </div>
</section>`;
  }

  // Bold Minimal: massive type, aggressive whitespace
  if (archetype === "Bold Minimal") {
    return `
<section class="hero" style="min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:4rem 2rem;background:${pal.background};border-bottom:1px solid ${pal.muted};">
  <div class="wrap" style="width:100%;">
    <h1 class="anim-fade-up" style="font-size:clamp(3.5rem,10vw,8rem);font-weight:900;text-transform:uppercase;line-height:0.9;letter-spacing:-0.03em;color:${pal.text};margin-bottom:1.5rem;">
      ${copy.headline}
    </h1>
    <div style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:2rem;">
      <p class="anim-fade-up anim-delay-1" style="font-size:clamp(1rem,1.5vw,1.2rem);color:${pal.muted};max-width:40ch;line-height:1.6;">
        ${copy.tagline}
      </p>
      <a href="tel:${phoneTel}" class="btn anim-fade-up anim-delay-2">${phone || 'Call Now'}</a>
    </div>
    ${revCount > 0 ? `<div class="anim-fade-up anim-delay-3" style="margin-top:4rem;padding-top:2rem;border-top:1px solid ${pal.muted};font-size:0.8rem;color:${pal.muted};text-transform:uppercase;letter-spacing:0.1em;">★ ${rating} · ${revCount} Google Reviews · ${business.city}</div>` : ''}
  </div>
</section>`;
  }

  // Editorial: magazine-style, structured
  if (archetype === "Editorial") {
    return `
<section class="hero" style="min-height:90vh;display:grid;grid-template-columns:${heroPhoto ? '1fr 1fr' : '1fr'};gap:0;background:${pal.background};">
  <div style="display:flex;flex-direction:column;justify-content:center;padding:4rem 3rem;">
    <p class="anim-fade-up" style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${pal.accent};margin-bottom:1.5rem;">${business.category}</p>
    <h1 class="anim-fade-up anim-delay-1" style="font-size:clamp(2.5rem,5vw,4.5rem);font-weight:700;line-height:1.05;letter-spacing:-0.02em;color:${pal.text};margin-bottom:1.5rem;">
      ${copy.headline}
    </h1>
    <p class="anim-fade-up anim-delay-2" style="font-size:1.1rem;color:${pal.muted};line-height:1.7;max-width:45ch;margin-bottom:2rem;">
      ${copy.tagline}
    </p>
    <div class="anim-fade-up anim-delay-3" style="display:flex;gap:1rem;align-items:center;">
      <a href="tel:${phoneTel}" class="btn">${phone || 'Contact Us'}</a>
      <span style="font-size:0.85rem;color:${pal.muted};">⭐ ${rating} · ${revCount}</span>
    </div>
  </div>
  ${heroPhoto ? `<div class="img-reveal" style="height:100%;min-height:400px;"><img src="${heroPhoto}" style="width:100%;height:100%;object-fit:cover;" alt="${business.name}"></div>` : ''}
</section>`;
  }

  // Retro: warm, nostalgic, playful
  if (archetype === "Retro") {
    return `
<section class="hero" style="min-height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:3rem 2rem;background:${pal.background};position:relative;overflow:hidden;">
  <div style="position:absolute;inset:0;opacity:0.08;background:repeating-linear-gradient(45deg, ${pal.accent} 0px, ${pal.accent} 2px, transparent 2px, transparent 12px);"></div>
  <div style="position:relative;z-index:1;max-width:800px;">
    <div class="anim-fade-up" style="display:inline-block;background:${pal.accent};color:#fff;font-size:0.8rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;padding:0.5rem 1.25rem;border-radius:4px;margin-bottom:2rem;">
      Est. ${business.city}
    </div>
    <h1 class="anim-fade-up anim-delay-1" style="font-size:clamp(2.5rem,6vw,5rem);line-height:1.1;margin-bottom:1.5rem;color:${pal.text};">
      ${copy.headline}
    </h1>
    <p class="anim-fade-up anim-delay-2" style="font-size:clamp(1rem,2vw,1.2rem);color:${pal.muted};max-width:50ch;margin:0 auto 2.5rem;">
      ${copy.tagline}
    </p>
    <a href="tel:${phoneTel}" class="btn anim-fade-up anim-delay-3">📞 ${phone || 'Call Us'}</a>
    ${revCount > 0 ? `<div class="anim-fade-up anim-delay-4" style="margin-top:2.5rem;font-size:0.85rem;color:${pal.muted};">★★★★★ ${revCount} happy customers</div>` : ''}
  </div>
</section>`;
  }

  // Modern Tech: clean, structured, precise
  if (archetype === "Modern Tech") {
    return `
<section class="hero" style="min-height:100vh;display:flex;align-items:center;padding:4rem 2rem;background:${pal.background};">
  <div class="wrap" style="width:100%;display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;">
    <div>
      <div class="anim-fade-up" style="display:inline-flex;align-items:center;gap:0.5rem;background:${pal.primary};padding:0.4rem 1rem;border-radius:6px;font-size:0.8rem;font-weight:600;color:${pal.accent};margin-bottom:1.5rem;">
        <span style="width:6px;height:6px;background:${pal.accent};border-radius:50%;display:inline-block;"></span>
        ${business.city}
      </div>
      <h1 class="anim-fade-up anim-delay-1" style="font-size:clamp(2.2rem,4.5vw,3.5rem);font-weight:700;line-height:1.15;letter-spacing:-0.02em;color:${pal.text};margin-bottom:1rem;">
        ${copy.headline}
      </h1>
      <p class="anim-fade-up anim-delay-2" style="font-size:1rem;color:${pal.muted};line-height:1.7;max-width:45ch;margin-bottom:2rem;">
        ${copy.tagline}
      </p>
      <div class="anim-fade-up anim-delay-3" style="display:flex;gap:1rem;flex-wrap:wrap;">
        <a href="tel:${phoneTel}" class="btn">${phone || 'Contact'}</a>
        <a href="#services" style="display:inline-flex;align-items:center;gap:0.35rem;color:${pal.text};font-size:0.9rem;font-weight:600;border-bottom:1px solid ${pal.muted};padding-bottom:0.1rem;">Services →</a>
      </div>
    </div>
    ${heroPhoto ? `<div class="anim-fade-up anim-delay-2 img-reveal" style="border-radius:12px;overflow:hidden;height:500px;"><img src="${heroPhoto}" style="width:100%;height:100%;object-fit:cover;" alt="${business.name}"></div>` : ''}
  </div>
</section>`;
  }

  // Warm Local (default) — classic centered or split with photo
  const heroBg = heroPhoto
    ? `background: linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.65) 100%), url('${heroPhoto}') center/cover no-repeat;`
    : `background: linear-gradient(145deg, ${pal.accent}15 0%, ${pal.background} 60%, ${pal.primary} 100%);`;
  const heroColor = heroPhoto ? '#fff' : pal.text;
  const heroMuted = heroPhoto ? 'rgba(255,255,255,0.8)' : pal.muted;

  return `
<section class="hero" style="min-height:100vh;${heroBg}display:flex;flex-direction:column;justify-content:flex-end;padding:0 0 5rem;">
  <div class="hero-inner wrap anim-fade-up" style="width:100%;">
    <div style="display:inline-flex;align-items:center;gap:.4rem;background:${heroPhoto ? 'rgba(255,255,255,0.15)' : pal.primary};border:1px solid ${heroPhoto ? 'rgba(255,255,255,0.3)' : pal.accent + '44'};color:${heroColor};font-size:.82rem;font-weight:600;padding:.4rem 1rem;border-radius:50px;margin-bottom:1.5rem;backdrop-filter:blur(8px);">
      ⭐ ${rating} · ${revCount} Google Reviews
    </div>
    <h1 style="font-size:clamp(3rem,8.5vw,7rem);font-weight:900;line-height:1.0;letter-spacing:-.03em;color:${heroColor};max-width:16ch;margin-bottom:1.25rem;${heroPhoto ? 'text-shadow:0 2px 24px rgba(0,0,0,.45)' : ''}">
      ${copy.headline}
    </h1>
    <p style="font-size:clamp(1.05rem,2vw,1.3rem);color:${heroMuted};max-width:50ch;margin-bottom:2.25rem;line-height:1.6;">
      ${copy.tagline}
    </p>
    <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;">
      <a href="tel:${phoneTel}" class="btn btn-magnetic">📞 Call ${phone || 'Now'}</a>
      <a href="#services" style="display:inline-flex;align-items:center;gap:.35rem;color:${heroColor};font-size:.95rem;font-weight:600;border-bottom:2px solid ${heroPhoto ? 'rgba(255,255,255,.45)' : pal.accent};padding-bottom:.1rem;">See our work →</a>
    </div>
  </div>
</section>`;
}

// ── Section builders ────────────────────────────────────────────────────────

function buildAbout(archetype: string, business: any, copy: any, pal: any, photos: string[]): string {
  const aboutPhoto = photos[1] || '';
  const rating = business.rating || 5;
  const revCount = business.review_count || 0;
  
  // Brutalist: raw, stats as big numbers, no soft edges
  if (archetype === "Brutalist") {
    return `
<section id="about" class="reveal" style="padding:6rem 2rem;background:${pal.background};border-top:2px solid ${pal.text};">
  <div class="wrap" style="max-width:1000px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:${aboutPhoto ? '1fr 1fr' : '1fr'};gap:4rem;align-items:center;">
      <div>
        <h2 style="font-size:clamp(2rem,4vw,3.5rem);font-weight:900;text-transform:uppercase;line-height:0.95;margin-bottom:2rem;color:${pal.text};">${business.name}</h2>
        <p style="color:${pal.muted};margin-bottom:1.5rem;font-size:1.1rem;line-height:1.7;">${copy.about_1}</p>
        <p style="color:${pal.muted};font-size:1.1rem;line-height:1.7;">${copy.about_2}</p>
        <div style="display:flex;gap:3rem;margin-top:3rem;padding-top:2rem;border-top:2px solid ${pal.text};">
          <div><div style="font-size:3rem;font-weight:900;color:${pal.accent};line-height:1;">${rating}</div><div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:${pal.muted};">Rating</div></div>
          <div><div style="font-size:3rem;font-weight:900;color:${pal.accent};line-height:1;">${revCount}+</div><div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:${pal.muted};">Reviews</div></div>
          <div><div style="font-size:3rem;font-weight:900;color:${pal.accent};line-height:1;">${business.city}</div><div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:${pal.muted};">Location</div></div>
        </div>
      </div>
      ${aboutPhoto ? `<div class="img-reveal"><img src="${aboutPhoto}" alt="${business.name}" style="width:100%;height:400px;object-fit:cover;border:2px solid ${pal.text};"></div>` : ''}
    </div>
  </div>
</section>`;
  }
  
  // Soft Luxury: elegant, generous, editorial feel
  if (archetype === "Soft Luxury") {
    return `
<section id="about" class="reveal-scale" style="padding:8rem 2rem;background:${pal.primary};">
  <div class="wrap" style="max-width:900px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:${aboutPhoto ? '1fr 1fr' : '1fr'};gap:5rem;align-items:center;">
      ${aboutPhoto ? `<div class="reveal-left"><img src="${aboutPhoto}" alt="${business.name}" style="width:100%;height:500px;object-fit:cover;border-radius:2px;"></div>` : ''}
      <div>
        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.15em;color:${pal.muted};margin-bottom:1.5rem;">About</p>
        <h2 style="font-size:clamp(1.8rem,3vw,2.5rem);font-weight:300;line-height:1.2;margin-bottom:1.5rem;color:${pal.text};">${business.name}</h2>
        <p style="color:${pal.muted};margin-bottom:1.5rem;font-size:1.05rem;line-height:1.8;">${copy.about_1}</p>
        <p style="color:${pal.muted};font-size:1.05rem;line-height:1.8;margin-bottom:2rem;">${copy.about_2}</p>
        <div style="display:flex;gap:2rem;padding-top:1.5rem;border-top:1px solid ${pal.muted}33;">
          <div><div style="font-family:'${pal.heading_font}',serif;font-size:2rem;font-weight:300;color:${pal.accent};">${rating}★</div><div style="font-size:0.7rem;color:${pal.muted};text-transform:uppercase;letter-spacing:0.1em;">Rating</div></div>
          <div><div style="font-family:'${pal.heading_font}',serif;font-size:2rem;font-weight:300;color:${pal.accent};">${revCount}</div><div style="font-size:0.7rem;color:${pal.muted};text-transform:uppercase;letter-spacing:0.1em;">Reviews</div></div>
        </div>
      </div>
    </div>
  </div>
</section>`;
  }
  
  // Default about (works for most archetypes)
  return `
<section id="about" class="reveal" style="padding:6rem 2rem;background:${pal.primary};">
  <div class="wrap" style="max-width:1200px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:${aboutPhoto ? '1fr 1fr' : '1fr'};gap:4rem;align-items:center;">
      <div>
        <h2 style="font-size:clamp(2rem,4vw,3rem);font-weight:800;margin-bottom:1.4rem;color:${pal.text};">${business.name}</h2>
        <p style="color:${pal.muted};margin-bottom:1rem;font-size:1.0625rem;line-height:1.7;">${copy.about_1}</p>
        <p style="color:${pal.muted};font-size:1.0625rem;line-height:1.7;">${copy.about_2}</p>
        <div style="display:flex;gap:2.5rem;margin-top:2rem;padding-top:2rem;border-top:1px solid ${pal.muted}33;flex-wrap:wrap;">
          <div><div style="font-family:serif;font-size:2.6rem;font-weight:900;color:${pal.accent};line-height:1;">${rating}★</div><div style="font-size:0.75rem;color:${pal.muted};text-transform:uppercase;letter-spacing:0.07em;">Google Rating</div></div>
          <div><div style="font-family:serif;font-size:2.6rem;font-weight:900;color:${pal.accent};line-height:1;">${revCount}+</div><div style="font-size:0.75rem;color:${pal.muted};text-transform:uppercase;letter-spacing:0.07em;">Reviews</div></div>
          <div><div style="font-family:serif;font-size:2.6rem;font-weight:900;color:${pal.accent};line-height:1;">${business.city}</div><div style="font-size:0.75rem;color:${pal.muted};text-transform:uppercase;letter-spacing:0.07em;">Location</div></div>
        </div>
      </div>
      ${aboutPhoto ? `<div class="img-reveal"><img src="${aboutPhoto}" alt="${business.name}" style="width:100%;height:420px;object-fit:cover;border-radius:14px;box-shadow:0 16px 64px rgba(0,0,0,0.18);"></div>` : ''}
    </div>
  </div>
</section>`;
}

function buildServices(archetype: string, business: any, copy: any, pal: any): string {
  const cards = (copy.services || []).slice(0, 6).map((s: any, i: number) => {
    const delay = `anim-delay-${Math.min(i + 1, 5)}`;
    
    if (archetype === "Brutalist") {
      return `
        <div class="card hover-lift ${delay}" style="padding:2rem;">
          <div style="font-family:monospace;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:${pal.muted};margin-bottom:0.75rem;">0${i + 1}</div>
          <h3 style="font-size:1.2rem;font-weight:900;text-transform:uppercase;margin-bottom:0.5rem;color:${pal.text};">${s.name}</h3>
          <p style="color:${pal.muted};font-size:0.95rem;line-height:1.6;">${s.desc}</p>
          ${s.price ? `<div style="margin-top:1rem;font-family:monospace;font-size:0.85rem;font-weight:700;color:${pal.accent};">${s.price}</div>` : ''}
        </div>`;
    }
    
    if (archetype === "Soft Luxury") {
      return `
        <div class="hover-lift ${delay}" style="padding:2.5rem 0;border-top:1px solid ${pal.muted}33;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;margin-bottom:0.75rem;">
            <h3 style="font-size:1.1rem;font-weight:400;color:${pal.text};">${s.name}</h3>
            ${s.price ? `<span style="font-size:0.9rem;color:${pal.accent};font-weight:500;white-space:nowrap;">${s.price}</span>` : ''}
          </div>
          <p style="color:${pal.muted};font-size:0.95rem;line-height:1.7;">${s.desc}</p>
        </div>`;
    }
    
    // Default card
    return `
      <div class="card hover-lift ${delay}" style="padding:2rem;border-left:4px solid ${pal.accent};">
        <div style="font-size:1.8rem;margin-bottom:1rem;">${s.icon || '✦'}</div>
        <h3 style="font-size:1.15rem;font-weight:700;margin-bottom:0.5rem;color:${pal.text};">${s.name}</h3>
        <p style="color:${pal.muted};font-size:0.9375rem;line-height:1.65;">${s.desc}</p>
        ${s.price ? `<div style="margin-top:0.9rem;font-weight:700;color:${pal.accent};font-size:0.875rem;">${s.price}</div>` : ''}
      </div>`;
  }).join('');

  const titleStyle = archetype === "Brutalist" 
    ? 'font-size:clamp(2rem,4vw,3.5rem);font-weight:900;text-transform:uppercase;line-height:0.95;'
    : archetype === "Soft Luxury"
    ? 'font-size:clamp(1.6rem,3vw,2.2rem);font-weight:300;'
    : 'font-size:clamp(2rem,4vw,3rem);font-weight:800;';

  return `
<section id="services" class="reveal" style="padding:6rem 2rem;background:${pal.background};">
  <div class="wrap" style="max-width:1200px;margin:0 auto;">
    <h2 style="${titleStyle}margin-bottom:0.75rem;color:${pal.text};">What We Offer</h2>
    <p style="color:${pal.muted};margin-bottom:3rem;max-width:54ch;font-size:1.05rem;">Services from ${business.name} — ${business.city}${business.state ? ', ' + business.state : ''}.</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem;">
      ${cards}
    </div>
  </div>
</section>`;
}

function buildGallery(archetype: string, business: any, photos: string[], pal: any): string {
  if (photos.length < 2) return '';
  const galleryPhotos = photos.slice(1);
  
  if (archetype === "Photo-First") {
    // Full-bleed masonry-style for Photo-First
    return `
<section id="gallery" class="reveal" style="padding:4rem 0;background:${pal.background};">
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:0;">
    ${galleryPhotos.map((u, i) => `
      <div class="img-reveal" style="aspect-ratio:4/3;overflow:hidden;">
        <img src="${u}" alt="${business.name}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.6s ease;" loading="lazy" 
          onmouseover="this.style.transform='scale(1.05)" onmouseout="this.style.transform='scale(1)'>
      </div>
    `).join('')}
  </div>
</section>`;
  }
  
  if (archetype === "Brutalist") {
    return `
<section id="gallery" class="reveal" style="padding:4rem 2rem;background:${pal.background};border-top:2px solid ${pal.text};">
  <div class="wrap" style="max-width:1200px;margin:0 auto;">
    <h2 style="font-size:clamp(2rem,4vw,3rem);font-weight:900;text-transform:uppercase;margin-bottom:2rem;color:${pal.text};">Our Work</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:0;">
      ${galleryPhotos.map(u => `
        <div style="border:2px solid ${pal.text};margin:-1px;"><img src="${u}" alt="${business.name}" style="width:100%;height:280px;object-fit:cover;display:block;" loading="lazy"></div>
      `).join('')}
    </div>
  </div>
</section>`;
  }
  
  return `
<section id="gallery" class="reveal" style="padding:4rem 2rem;background:${pal.primary};">
  <div class="wrap" style="max-width:1200px;margin:0 auto;">
    <h2 style="font-size:clamp(2rem,4vw,3rem);font-weight:800;margin-bottom:2rem;color:${pal.text};">Our Work</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;">
      ${galleryPhotos.map(u => `
        <div style="overflow:hidden;border-radius:10px;aspect-ratio:4/3;">
          <img src="${u}" alt="${business.name}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.4s ease;" loading="lazy" 
            onmouseover="this.style.transform='scale(1.06)'" onmouseout="this.style.transform='scale(1)'">
        </div>
      `).join('')}
    </div>
  </div>
</section>`;
}

function buildReviews(archetype: string, business: any, pal: any): string {
  const isDark = isDarkBg(pal.background);
  const revBg = isDark ? pal.primary : '#0f0f0f';
  const revText = isDark ? pal.text : '#ffffff';
  const revSubRgb = revText === '#ffffff' ? '255,255,255' : '0,0,0';
  
  const reviewCards = ((business.top_reviews || []) as { text: string; author: string; rating: number }[])
    .slice(0, 3).map((r, i) => `
      <div class="card hover-lift reveal anim-delay-${i + 1}" style="padding:2rem;position:relative;transition:background 0.2s;">
        <div style="color:${pal.accent};font-size:1.05rem;letter-spacing:0.05em;margin-bottom:1.2rem;">${stars(r.rating)}</div>
        <blockquote style="color:${revText === '#ffffff' ? 'rgba(255,255,255,0.82)' : pal.muted};font-style:italic;line-height:1.7;font-size:1rem;margin-bottom:1.2rem;padding-left:0.5rem;">
          "${(r.text || '').slice(0, 220)}"
        </blockquote>
        <cite style="color:${pal.accent};font-weight:600;font-style:normal;font-size:0.875rem;">— ${r.author}</cite>
      </div>`).join('') || `
      <div class="card" style="padding:2rem;">
        <div style="color:${pal.accent};font-size:1.05rem;margin-bottom:1.2rem;">★★★★★</div>
        <blockquote style="color:${pal.muted};font-style:italic;line-height:1.7;">"Fantastic service — couldn't recommend them more highly."</blockquote>
        <cite style="color:${pal.accent};font-weight:600;font-size:0.875rem;">— Happy Customer</cite>
      </div>`;

  const titleStyle = archetype === "Brutalist"
    ? 'font-size:clamp(2rem,4vw,3.5rem);font-weight:900;text-transform:uppercase;line-height:0.95;'
    : 'font-size:clamp(2rem,4vw,3rem);font-weight:800;';

  return `
<section id="reviews" class="reveal" style="padding:6rem 2rem;background:${revBg};">
  <div class="wrap" style="max-width:1200px;margin:0 auto;">
    <h2 style="${titleStyle}margin-bottom:0.5rem;color:${revText};">What Customers Say</h2>
    <p style="color:rgba(${revSubRgb},0.42);margin-bottom:3rem;font-size:1rem;">Real words from real people</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.5rem;">
      ${reviewCards}
    </div>
  </div>
</section>`;
}

function buildContact(archetype: string, business: any, pal: any): string {
  const phone = business.phone || '';
  const phoneTel = phone.replace(/\D/g, '');
  
  const hoursRaw = (business.hours as string) || '';
  const hoursLines = hoursRaw.split(/,(?=[A-Z])/).map((h: string) => h.trim()).filter(Boolean);
  const hoursHtml = hoursLines.length > 0
    ? hoursLines.map((h: string) => {
        const idx = h.search(/:\s/);
        if (idx > 0) {
          const day = h.slice(0, idx);
          const time = h.slice(idx + 2);
          return `<li style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem 0;border-bottom:1px solid ${pal.muted}33;font-size:0.9375rem;gap:1rem;"><span style="color:${pal.muted};">${day}</span><span style="font-weight:600;text-align:right;">${time}</span></li>`;
        }
        return `<li style="padding:0.75rem 0;border-bottom:1px solid ${pal.muted}33;"><span>${h}</span></li>`;
      }).join('\n          ')
    : `<li style="display:flex;justify-content:space-between;padding:0.75rem 0;border-bottom:1px solid ${pal.muted}33;"><span style="color:${pal.muted};">Hours</span><span style="font-weight:600;">Call for info</span></li>`;

  const ctaStyle = archetype === "Brutalist"
    ? 'background:transparent;color:' + pal.text + ';border:2px solid ' + pal.text + ';'
    : archetype === "Soft Luxury"
    ? 'background:' + pal.accent + ';color:#fff;border:none;border-radius:50px;'
    : 'background:' + pal.accent + ';color:#fff;border:none;border-radius:50px;';

  return `
<section id="contact" class="reveal" style="padding:6rem 2rem;background:${pal.background};">
  <div class="wrap" style="max-width:1200px;margin:0 auto;">
    <h2 style="font-size:clamp(2rem,4vw,3rem);font-weight:800;margin-bottom:3rem;color:${pal.text};">Find Us</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:start;">
      <div>
        <p style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${pal.muted};margin-bottom:1rem;">Hours</p>
        <ul style="list-style:none;">
          ${hoursHtml}
        </ul>
      </div>
      <div style="display:flex;flex-direction:column;gap:1.5rem;">
        ${business.address ? `<div><strong style="display:block;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;color:${pal.muted};margin-bottom:0.3rem;">Address</strong><span style="font-size:1.0625rem;font-weight:500;color:${pal.text};">${business.address}</span></div>` : ''}
        <div><strong style="display:block;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;color:${pal.muted};margin-bottom:0.3rem;">Phone</strong><span style="font-size:1.0625rem;font-weight:500;color:${pal.text};">${phone || 'Call for info'}</span></div>
        ${business.email ? `<div><strong style="display:block;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;color:${pal.muted};margin-bottom:0.3rem;">Email</strong><span style="font-size:1.0625rem;font-weight:500;color:${pal.text};">${business.email}</span></div>` : ''}
        <a href="tel:${phoneTel}" class="btn btn-magnetic" style="display:inline-flex;align-items:center;gap:0.6rem;${ctaStyle}font-size:1.15rem;font-weight:800;padding:1rem 2.5rem;margin-top:1rem;transition:transform 0.2s,box-shadow 0.2s;">Call Now →</a>
      </div>
    </div>
  </div>
</section>`;
}

function buildFooter(archetype: string, business: any, pal: any): string {
  if (archetype === "Brutalist") {
    return `
<footer style="background:${pal.text};color:${pal.background};padding:3rem 2rem;border-top:4px solid ${pal.accent};">
  <div style="max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;gap:2rem;flex-wrap:wrap;">
    <span style="font-family:'${pal.heading_font}',serif;font-size:1.2rem;font-weight:900;text-transform:uppercase;">${business.name}</span>
    <span style="font-family:monospace;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;opacity:0.6;">Built as a free preview — not affiliated with ${business.name}</span>
  </div>
</footer>`;
  }
  
  return `
<footer style="background:#0d0d0d;color:rgba(255,255,255,0.38);padding:3rem 2rem;">
  <div style="max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;gap:2rem;flex-wrap:wrap;">
    <span style="font-family:'${pal.heading_font}',serif;font-size:1.05rem;font-weight:700;color:rgba(255,255,255,0.75);">${business.name}</span>
    <span style="font-size:0.75rem;">Built as a free preview — not affiliated with ${business.name}</span>
  </div>
</footer>`;
}

// ── Main HTML builder ───────────────────────────────────────────────────────

// deno-lint-ignore no-explicit-any
function buildHtml(
  business: any,
  copy: { headline: string; tagline: string; about_1: string; about_2: string; services: { name: string; desc: string; price?: string; icon?: string }[] },
  pal: any,
  typo: any,
  photos: string[],
  archetype: string,
  interactions: string[]
): string {
  const isDark = isDarkBg(pal.background);
  const baseCSS = getArchetypeBaseCSS(archetype, pal, typo);
  const animCSS = getAnimationCSS(interactions, pal, isDark);
  const industrySections = getIndustrySections(business.category);
  
  // Build sections based on archetype + industry
  const sections: string[] = [];
  
  // Always have hero
  sections.push(buildHero(archetype, business, copy, pal, photos));
  
  // Add sections based on industry recommendations
  for (const section of industrySections) {
    if (section === "Hero") continue; // already added
    if (section === "About") sections.push(buildAbout(archetype, business, copy, pal, photos));
    else if (section === "Services" || section === "Menu" || section === "Treatments" || section === "Classes") {
      sections.push(buildServices(archetype, business, copy, pal));
    }
    else if (section === "Gallery" || section === "Portfolio") {
      sections.push(buildGallery(archetype, business, photos, pal));
    }
    else if (section === "Reviews") {
      sections.push(buildReviews(archetype, business, pal));
    }
    else if (section === "Contact" || section === "Book" || section === "Reservations") {
      sections.push(buildContact(archetype, business, pal));
    }
  }
  
  // Always end with footer
  sections.push(buildFooter(archetype, business, pal));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${business.name} | ${business.city}</title>
  <meta name="description" content="${business.category} in ${business.city}${business.state ? ', ' + business.state : ''}. ${copy.tagline}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${typo.google_fonts}&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    ${baseCSS}
    a{color:inherit;text-decoration:none}
    img{display:block;max-width:100%;height:auto}
    .wrap{max-width:1200px;margin:0 auto;padding:0 2rem}
    section{padding:6rem 0}
    ${animCSS}
    @media(max-width:768px){
      section{padding:4rem 0}
      .hero h1{font-size:clamp(2.2rem,10vw,3.5rem)!important}
    }
  </style>
</head>
<body>
${sections.join('\n')}
<script>
  // Intersection Observer for scroll reveals
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  
  document.querySelectorAll('.reveal, .reveal-left, .reveal-scale, .img-reveal').forEach(el => observer.observe(el));
</script>
</body>
</html>`;
}

// ── analyzePersonality ───────────────────────────────────────────────────────

// deno-lint-ignore no-explicit-any
async function analyzePersonality(business: any, apiKey: string, db: any) {
  const reviewsText = (business.top_reviews || []).slice(0, 5)
    .map((r: { author: string; text: string; rating: number }, i: number) =>
      `[${i+1}] ${r.author} (${r.rating}/5): "${r.text.slice(0, 120)}"`).join('\n');

  const system = `You are a brand strategist for LOCAL SERVICE BUSINESSES. Output JSON only. No explanation.

Pick ONE archetype from this list based on the business vibe in the reviews:
- Barbers/men's grooming → Retro OR Classic OR Bold Minimal
- Salons/nail/lash/beauty → Soft Luxury OR Retro OR Editorial
- Tattoo studios → Brutalist OR Editorial
- Spas/massage → Soft Luxury OR Editorial
- Cafes/bakeries/coffee → Warm Local OR Rustic OR Retro
- Diners/family restaurants → Warm Local OR Retro
- Upscale restaurants/bars → Editorial OR Classic OR Photo-First
- Gyms/boxing/fitness → Bold Minimal OR Brutalist
- Auto/mechanics → Rustic OR Retro OR Bold Minimal
- Accounting/law/medical → Classic OR Editorial
- Landscaping/trades → Warm Local OR Rustic
- Photographers/galleries → Photo-First OR Editorial
- Breweries/wine → Editorial OR Retro OR Classic
- Boutiques/clothing → Soft Luxury OR Photo-First

Also extract:
1. What specific thing customers keep praising (not "good service" — something UNIQUE like "she remembers every regular's order" or "they finish oil changes in 20 minutes")
2. The emotional tone of the reviews (warm, edgy, professional, playful, intense, calming)
3. A verbatim quote from the BEST review (most emotional, most specific)
4. 3-5 personality keywords that capture the vibe
5. 1-2 things to avoid in the design

JSON: {"personality_keywords":["a","b","c","d","e"],"design_archetype":"Classic","tone_of_voice":"one owner-voice sentence referencing the city","key_differentiator":"the one specific thing customers keep praising","best_review_quote":{"text":"verbatim quote","author":"Name L."},"avoid":["x","y"],"industry_sections":["Hero","About","Services","Gallery","Reviews","Contact"]}`;

  const user = `${business.name} | ${business.category} | ${business.city}${business.state ? ', ' + business.state : ''}
Rating: ${business.rating || 'N/A'} (${business.review_count || 0} reviews)
Reviews:\n${reviewsText || 'None'}`;

  const profile = parseJSON(await callClaudeJSON(apiKey, system, user, 800, 'claude-opus-4-5'));
  await db.Business.update(business.id, { personality_profile: profile });
  return profile;
}

// ── generateSite ─────────────────────────────────────────────────────────────

// deno-lint-ignore no-explicit-any
async function generateSite(business: any, profile: any, apiKey: string, db: any) {
  const existingSites = await db.GeneratedSite.list();
  const usedFPs = new Set(
    (existingSites as { design_fingerprint: string }[]).map(s => s.design_fingerprint).filter(Boolean)
  );

  const rawArchetype = (profile.design_archetype || 'Warm Local').trim();
  const archetype = rawArchetype.split(/\s+/)
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

  // Design tokens mapping (simplified for this file)
  const paletteMap: Record<string, number[]> = {
    "Editorial": [1, 3, 7, 39, 14], "Soft Luxury": [2, 4, 6, 19, 20],
    "Brutalist": [9, 10, 11, 21], "Modern Tech": [25, 9, 14, 3],
    "Warm Local": [8, 17, 34, 35, 22, 15], "Bold Minimal": [10, 39, 1, 21, 12],
    "Photo-First": [39, 1, 2, 3, 7], "Retro": [17, 18, 13, 22, 16],
    "Classic": [7, 3, 39, 14], "Rustic": [8, 22, 24, 16, 13],
  };
  const typoMap: Record<string, number[]> = {
    "Editorial": [1, 2, 3, 7, 14], "Soft Luxury": [1, 2, 7, 12, 14, 20],
    "Brutalist": [9, 10, 5, 8, 13], "Modern Tech": [9, 10, 13, 4],
    "Warm Local": [18, 20, 1, 3, 7, 6], "Bold Minimal": [10, 9, 4, 5, 8],
    "Photo-First": [1, 2, 7, 14, 3], "Retro": [20, 18, 11, 12, 4, 6],
    "Classic": [3, 7, 1, 14, 2], "Rustic": [18, 12, 3, 6, 7],
  };
  const layoutMap: Record<string, string[]> = {
    "Editorial": ["MAGAZINE_GRID", "SPLIT_HERO", "SCROLL_FLOW"],
    "Soft Luxury": ["CENTERED_HERO", "SPLIT_HERO", "OFFSET_HERO", "SCROLL_FLOW"],
    "Brutalist": ["CENTERED_HERO", "ASYMMETRIC_STACK", "MAGAZINE_GRID"],
    "Modern Tech": ["SPLIT_HERO", "CENTERED_HERO", "SCROLL_FLOW"],
    "Warm Local": ["FULL_BLEED_HERO", "SPLIT_HERO", "SCROLL_FLOW"],
    "Bold Minimal": ["CENTERED_HERO", "OFFSET_HERO", "SPLIT_HERO"],
    "Photo-First": ["FULL_BLEED_HERO", "MAGAZINE_GRID", "SPLIT_HERO"],
    "Retro": ["ASYMMETRIC_STACK", "SCROLL_FLOW", "MAGAZINE_GRID"],
  };
  const interactionsMap: Record<string, string[]> = {
    "Editorial": ["SCROLL_REVEAL", "STICKY_HEADER", "IMAGE_REVEAL"],
    "Soft Luxury": ["SCROLL_REVEAL", "PARALLAX", "MAGNETIC_BUTTONS"],
    "Brutalist": ["CUSTOM_CURSOR", "TEXT_SCRAMBLE", "MARQUEE"],
    "Modern Tech": ["TEXT_SCRAMBLE", "CUSTOM_CURSOR", "MAGNETIC_BUTTONS"],
    "Warm Local": ["SCROLL_REVEAL", "MARQUEE", "HOVER_LIFT"],
    "Bold Minimal": ["SCROLL_REVEAL", "HOVER_LIFT", "MAGNETIC_BUTTONS"],
    "Photo-First": ["PARALLAX", "IMAGE_REVEAL", "SCROLL_REVEAL"],
    "Retro": ["MARQUEE", "HOVER_LIFT", "SCROLL_REVEAL"],
  };

  const palettes: Record<number, any> = {
    1: { name: "Cream Ink", background: "#FAF6ED", text: "#1A1A1A", accent: "#C04F2E", muted: "#6B6B6B", primary: "#F5F1E8" },
    2: { name: "Sage Linen", background: "#F2F0E8", text: "#2C2E27", accent: "#5C7A4E", muted: "#7A7D70", primary: "#D4DDC9" },
    3: { name: "Slate Blue", background: "#F0F4F8", text: "#1E2A3A", accent: "#3B6FBA", muted: "#6E7E90", primary: "#DCE4E8" },
    4: { name: "Champagne Noir", background: "#F5EFE2", text: "#1C1C1C", accent: "#C4A573", muted: "#6E665A", primary: "#ECE4D4" },
    5: { name: "Forest Fog", background: "#EDF2EE", text: "#1A2E1A", accent: "#4A7C59", muted: "#6B7D6B", primary: "#D4DDC9" },
    6: { name: "Dusty Rose", background: "#F8F0F0", text: "#2C1A1A", accent: "#B05070", muted: "#8C6E6E", primary: "#E8D5CC" },
    7: { name: "Navy Linen", background: "#F0F2F8", text: "#0F1F3D", accent: "#C4832D", muted: "#6E7A8C", primary: "#DCE4E8" },
    8: { name: "Terracotta Cream", background: "#F8F1E3", text: "#3A2C24", accent: "#C9663D", muted: "#8C7B6E", primary: "#F0E5D3" },
    9: { name: "Concrete Acid", background: "#1A1A1A", text: "#FFFFFF", accent: "#D4FF00", muted: "#888888", primary: "#2A2A2A" },
    10: { name: "Pure Brutalist", background: "#FFFFFF", text: "#000000", accent: "#FF3D00", muted: "#444444", primary: "#FFFFFF" },
    11: { name: "Steel Yellow", background: "#2C2C2C", text: "#FAFAFA", accent: "#FFD600", muted: "#999999", primary: "#1F1F1F" },
    12: { name: "Ink & Copper", background: "#1C1A18", text: "#F5F0E8", accent: "#C87941", muted: "#8A7D6E", primary: "#2A2724" },
    13: { name: "Old Paper", background: "#EDE0C4", text: "#2A1F0E", accent: "#8B3A1A", muted: "#7A6A52", primary: "#E2D4B4" },
    14: { name: "Chalk & Cobalt", background: "#F4F7FF", text: "#0A1A3A", accent: "#1A4FCC", muted: "#5E6E8C", primary: "#E8EEFF" },
    15: { name: "Olive & Cream", background: "#F5F2E4", text: "#2A2A1A", accent: "#7A8C3A", muted: "#7A7A5A", primary: "#EAE6D4" },
    16: { name: "Espresso", background: "#1E1410", text: "#F5EFE0", accent: "#D4884A", muted: "#8A7060", primary: "#2A1E18" },
    17: { name: "Diner Red", background: "#F8E9D6", text: "#1D3557", accent: "#E63946", muted: "#6E7A82", primary: "#F0DCC0" },
    18: { name: "70s Mustard", background: "#F2E4C9", text: "#2B1810", accent: "#8B4A0A", muted: "#8C6E4E", primary: "#D4A24C" },
    19: { name: "Bubblegum", background: "#FFF0F5", text: "#2A0A1A", accent: "#E0407A", muted: "#8C6070", primary: "#FFE2EE" },
    20: { name: "Mint Condition", background: "#F0FAF5", text: "#0A2A1A", accent: "#2A8A5A", muted: "#5A8A6A", primary: "#E0F4EA" },
    21: { name: "Matte Black", background: "#111111", text: "#EEEEEE", accent: "#FFFFFF", muted: "#777777", primary: "#1E1E1E" },
    22: { name: "Desert Sand", background: "#F5E8D0", text: "#2A1A0A", accent: "#C87A3A", muted: "#8A7050", primary: "#EAD8BA" },
    23: { name: "Lilac Noir", background: "#1A1228", text: "#F0ECF8", accent: "#B08AE0", muted: "#8A7AA0", primary: "#241A38" },
    24: { name: "Rust & Stone", background: "#F2ECE4", text: "#2A1A12", accent: "#B04A20", muted: "#8A7060", primary: "#E6DDD2" },
    25: { name: "Mesh Indigo", background: "#1E1B4B", text: "#F1F5F9", accent: "#C7D2FE", muted: "#94A3B8", primary: "#282462" },
    34: { name: "Brick Bakery", background: "#F8F1E3", text: "#2C1810", accent: "#C2461F", muted: "#8C6E5C", primary: "#EEE4D0" },
    35: { name: "Garden Green", background: "#F8F1E3", text: "#2A3D24", accent: "#5A8A3A", muted: "#7A7B65", primary: "#EEE4D0" },
    39: { name: "Times Serif", background: "#FAFAFA", text: "#1A1A1A", accent: "#B91C1C", muted: "#6E6E6E", primary: "#F0F0F0" },
  };

  const typos: Record<number, any> = {
    1: { heading_font: "Fraunces", body_font: "Inter", google_fonts: "Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:wght@300;400;500;600" },
    2: { heading_font: "Playfair Display", body_font: "Manrope", google_fonts: "Playfair+Display:ital,wght@0,400..900;1,400..900&family=Manrope:wght@300;400;500;600" },
    3: { heading_font: "Libre Baskerville", body_font: "Lato", google_fonts: "Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700" },
    4: { heading_font: "Oswald", body_font: "Source Sans 3", google_fonts: "Oswald:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;600" },
    5: { heading_font: "Bebas Neue", body_font: "Open Sans", google_fonts: "Bebas+Neue&family=Open+Sans:wght@300;400;600" },
    6: { heading_font: "Montserrat", body_font: "Merriweather", google_fonts: "Montserrat:wght@400;600;700;800&family=Merriweather:ital,wght@0,300;0,400;1,300" },
    7: { heading_font: "Raleway", body_font: "Merriweather", google_fonts: "Raleway:wght@300;400;600;700&family=Merriweather:ital,wght@0,300;0,400;1,300" },
    8: { heading_font: "Anton", body_font: "Roboto", google_fonts: "Anton&family=Roboto:wght@300;400;500" },
    9: { heading_font: "Space Grotesk", body_font: "DM Sans", google_fonts: "Space+Grotesk:wght@300..700&family=DM+Sans:wght@300;400;500;600" },
    10: { heading_font: "Archivo Black", body_font: "Inter", google_fonts: "Archivo+Black&family=Inter:wght@300;400;500;600" },
    11: { heading_font: "Black Han Sans", body_font: "Nunito", google_fonts: "Black+Han+Sans&family=Nunito:wght@300;400;600" },
    12: { heading_font: "Ultra", body_font: "Crimson Text", google_fonts: "Ultra&family=Crimson+Text:ital,wght@0,400;0,600;1,400" },
    13: { heading_font: "Barlow Condensed", body_font: "Karla", google_fonts: "Barlow+Condensed:wght@400;600;700;800&family=Karla:wght@300;400;500" },
    14: { heading_font: "DM Serif Display", body_font: "Work Sans", google_fonts: "DM+Serif+Display:ital@0;1&family=Work+Sans:wght@300;400;500;600" },
    18: { heading_font: "Fraunces", body_font: "Inter", google_fonts: "Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:wght@300;400;500;600" },
    20: { heading_font: "Abril Fatface", body_font: "Raleway", google_fonts: "Abril+Fatface&family=Raleway:ital,wght@0,300..700;1,300..700" },
  };

  const validPalettes = paletteMap[archetype] || paletteMap['Warm Local'];
  const validTypo = typoMap[archetype] || typoMap['Warm Local'];
  const validLayouts = layoutMap[archetype] || layoutMap['Warm Local'];
  const validInteractions = interactionsMap[archetype] || interactionsMap['Warm Local'];

  let paletteId = validPalettes[0], typoId = validTypo[0], layout = validLayouts[0];
  let fingerprint = `${archetype}-${paletteId}-${typoId}-${layout}`;
  let found = false;

  outer: for (const p of shuffle(validPalettes)) {
    for (const t of shuffle(validTypo)) {
      for (const l of shuffle(validLayouts)) {
        const fp = `${archetype}-${p}-${t}-${l}`;
        if (!usedFPs.has(fp)) { paletteId = p; typoId = t; layout = l; fingerprint = fp; found = true; break outer; }
      }
    }
  }
  if (!found) {
    paletteId = pickRandom(validPalettes); typoId = pickRandom(validTypo); layout = pickRandom(validLayouts);
    fingerprint = `${archetype}-${paletteId}-${typoId}-${layout}-${Date.now()}`;
  }

  const pal = palettes[paletteId] || palettes[8];
  const typo = typos[typoId] || typos[1];
  const interactions = shuffle(validInteractions).slice(0, 2 + Math.floor(Math.random() * 2));

  // Resolve photos
  const resolvedPhotos: string[] = [];
  for (const url of (business.photos || []).slice(0, 4)) {
    const cdn = await resolvePhotoUrl(url as string);
    if (cdn) resolvedPhotos.push(cdn);
  }

  // Ask Claude for copy with STRONGER prompting
  const reviewSnippets = ((business.top_reviews || []) as { text: string; author: string; rating: number }[])
    .slice(0, 3).map(r => `"${r.text.slice(0, 120)}" — ${r.author}`).join(' | ');

  const copyJson = await callClaudeJSON(apiKey, `Output valid JSON only. No explanation. No markdown.`, `
Write website copy for this local business. The copy must feel written BY the owner, not ABOUT them.

Business: ${business.name}
Type: ${business.category}
City: ${business.city}${business.state ? ', ' + business.state : ''}
Archetype: ${archetype}
Owner voice: ${profile.tone_of_voice || ''}
Unique value: ${profile.key_differentiator || ''}
Keywords: ${(profile.personality_keywords || []).join(', ')}
Avoid: ${(profile.avoid || []).join(', ')}
Customer reviews: ${reviewSnippets || '(none)'}

CRITICAL RULES:
1. Headline must reference something SPECIFIC to this business — a neighborhood, a signature item, a customer praise point. NEVER generic like "Best [category] in [city]".
2. Tagline must sound like the owner talking to a neighbor.
3. About text must mention the city/neighborhood naturally at least once.
4. Services must use REAL industry terminology, not generic filler.
5. If reviews mention specific prices/times/details, reference them.

Return JSON:
{
  "headline": "4-8 word hero headline capturing this shop's unique soul — references something specific from reviews or city",
  "tagline": "one sentence, owner voice, mentions the city or neighborhood specifically",
  "about_1": "2-3 sentences, warm, references the neighborhood and why they opened here",
  "about_2": "2-3 sentences, references a specific customer praise point from reviews",
  "services": [
    {"name":"specific service name","desc":"1-2 sentence description using industry terms","price":"$XX–$XX or 'Call for pricing'","icon":"emoji"},
    {"name":"specific service name","desc":"1-2 sentence description using industry terms","price":"$XX–$XX or 'Call for pricing'","icon":"emoji"},
    {"name":"specific service name","desc":"1-2 sentence description using industry terms","price":"$XX–$XX or 'Call for pricing'","icon":"emoji"},
    {"name":"specific service name","desc":"1-2 sentence description using industry terms","price":"$XX–$XX or 'Call for pricing'","icon":"emoji"},
    {"name":"specific service name","desc":"1-2 sentence description using industry terms","price":"$XX–$XX or 'Call for pricing'","icon":"emoji"}
  ]
}`, 2000, 'claude-opus-4-5');

  const copy = parseJSON(copyJson);

  // Build full HTML with archetype-specific structure
  const html = buildHtml(business, copy, pal, typo, resolvedPhotos, archetype, interactions);

  const site = await db.GeneratedSite.create({
    business_id: business.id, full_html: html, subdomain_url: '',
    design_archetype: archetype, color_palette_id: paletteId, typography_pair_id: typoId,
    layout_variant: layout, section_order: (profile.industry_sections || ['Hero','About','Services','Gallery','Reviews','Contact']),
    micro_interactions: interactions, imagery_treatment: resolvedPhotos.length > 0 ? 'PHOTO' : 'CLEAN',
    design_fingerprint: fingerprint,
    hero_copy: copy.headline || '', about_copy: '', services_copy: '', cta_copy: '',
    generated_at: new Date().toISOString(), view_count: 0,
  });

  const previewUrl = `${MINI_APP_URL}/SitePreview?id=${site.id}`;
  await db.GeneratedSite.update(site.id, { subdomain_url: previewUrl });
  await db.Business.update(business.id, { status: 'site_generated' });
  return { site_id: site.id, subdomain_url: previewUrl, archetype, palette: pal.name, typography: typo.heading_font + ' + ' + typo.body_font, layout };
}

// ── writeEmail ───────────────────────────────────────────────────────────────

// deno-lint-ignore no-explicit-any
async function writeEmail(business: any, profile: any, site: Record<string, unknown>, apiKey: string, db: any) {
  const ownerName = (business.owner_name as string) || '';
  const hasWebsite = !!(business.current_website_url);
  const bestQuote = (profile.best_review_quote || {}) as { text?: string; author?: string };
  const greeting = ownerName ? `Hi ${ownerName}` : `Hi`;
  const specificPraise = (profile.key_differentiator as string) || '';

  const painInstruction = hasWebsite
    ? `PAIN: This business HAS a website (${business.current_website_url}) but it looks cheap/outdated. Write ONE sentence about what an unprofessional-looking site is costing them — lost trust, customers clicking away, competitors getting the call instead. Mention something SPECIFIC like "When people search '${business.category} ${business.city}' and land on your current site..."`
    : `PAIN: This business has ZERO web presence. Write ONE sentence about what being invisible online is costing them — be specific: "When someone searches '${business.category} near me' in ${business.city}, they find [competitor type] instead of you."`;

  const email = parseJSON(await callClaudeJSON(apiKey, 'Output JSON only: {"subject":"...","body":"..."}', `
Write a cold outreach email from a web designer to a local business owner.
The email must feel like you wrote it AFTER spending 10 minutes looking at their Google listing and reviews.

Business: ${business.name} (${business.category} in ${business.city})
Greeting: ${greeting}
Specific praise from reviews: "${specificPraise}"
Best customer review: "${bestQuote.text || ''}" — ${bestQuote.author || ''}
Mockup URL: ${site.subdomain_url}

STRICT 4-point structure (80-95 words total — SHORT and punchy):
1. OPENER — ONE specific sentence referencing something REAL about ${business.name}: quote their best review, mention their rating, reference their neighborhood in ${business.city}. Do NOT say "I saw your reviews" or "I found you online." Instead say something like "Maria G. said you're the only shop in [neighborhood] that..." or "With ${business.rating} stars from ${business.review_count} people..."
2. ${painInstruction}
3. SOLUTION — write exactly: "I put together a free mockup of what your site could look like:" then on its own line: ${site.subdomain_url}
4. CTA — one casual sentence: a 15-minute call, no commitment. No exclamation marks.

Start the email with: "${greeting},"
Sign off: — Alex

Subject line: ≤6 words, lowercase, feels written for ${business.name} specifically. Reference their category or a detail from reviews.`, 900, 'claude-opus-4-5'));

  const campaign = await db.EmailCampaign.create({
    business_id: business.id, site_id: site.site_id,
    subject: email.subject,
    body: `${email.body}\n\n---\nTo opt out, reply "unsubscribe".`,
    status: 'draft', send_attempts: 0,
    created_at: new Date().toISOString(),
  });
  return { campaign_id: campaign.id, subject: email.subject };
}

// ── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;
    const body = await req.json().catch(() => ({}));
    const { city, category, business_id } = body;
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return Response.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 });

    // ── Single business mode ──────────────────────────────────────────────────
    if (business_id) {
      let step = 'loading business';
      try {
        const business = await db.Business.get(business_id);
        if (!business) return Response.json({ error: 'Business not found' }, { status: 404 });
        step = 'analyzePersonality';
        const profile = await analyzePersonality(business, apiKey, db);
        step = 'generateSite';
        const site = await generateSite(business, profile, apiKey, db);
        step = 'writeEmail';
        const email = await writeEmail(business, profile, site, apiKey, db);
        return Response.json({ success: true, business_id, site, email });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return Response.json({ error: `[${step}] ${msg}` }, { status: 500 });
      }
    }

    // ── Campaign mode ─────────────────────────────────────────────────────────
    if (!city || !category) return Response.json({ error: 'Provide city + category or business_id' }, { status: 400 });
    const KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!KEY) return Response.json({ error: 'GOOGLE_PLACES_API_KEY not set' }, { status: 500 });

    const campaign = await db.Campaign.create({
      query: `${category} in ${city}`, city, category,
      status: 'scraping', businesses_found: 0, sites_generated: 0, emails_sent: 0,
    });

    // Scrape Google Places
    const allPlaces: Record<string, unknown>[] = [];
    let nextToken: string | undefined;
    let pg = 0;
    do {
      const payload: Record<string, unknown> = { textQuery: `${category} in ${city}`, maxResultCount: 20 };
      if (nextToken) payload.pageToken = nextToken;
      const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 'X-Goog-Api-Key': KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.websiteUri,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.regularOpeningHours,places.photos,places.businessStatus,nextPageToken',
        },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const e = await r.text();
        await db.Campaign.update(campaign.id, { status: 'error', error_message: `Places API: ${e}` });
        return Response.json({ error: `Places API error: ${e}` }, { status: 500 });
      }
      const rawPlaces = await r.text();
      if (rawPlaces.trimStart().startsWith('<')) throw new Error(`Places API returned HTML: ${rawPlaces.slice(0, 200)}`);
      const d = JSON.parse(rawPlaces);
      if (d.places) allPlaces.push(...d.places);
      nextToken = d.nextPageToken;
      pg++;
      if (nextToken) await new Promise(res => setTimeout(res, 1500));
    } while (nextToken && pg < 3);

    // Filter: include businesses with NO website OR with a low-quality website
    const queue: Record<string, unknown>[] = [];
    for (const pl of allPlaces) {
      if (pl.businessStatus === 'PERMANENTLY_CLOSED') continue;

      const websiteUri = pl.websiteUri as string | undefined;
      const hasWebsite = !!websiteUri;
      const websiteIsLowQuality = hasWebsite && isLowQualityWebsite(websiteUri!);
      if (hasWebsite && !websiteIsLowQuality) continue;

      const websiteQuality = !hasWebsite ? 'none' : 'low_quality';

      let reviews: { author: string; text: string; rating: number }[] = [];
      try {
        const dr = await fetch(`https://places.googleapis.com/v1/places/${pl.id}`, {
          headers: { 'X-Goog-Api-Key': KEY, 'X-Goog-FieldMask': 'reviews' },
        });
        if (dr.ok) {
          const dd = await dr.json();
          reviews = (dd.reviews || []).slice(0, 5).map((rv: Record<string, unknown>) => ({
            author: (rv.authorAttribution as Record<string, string>)?.displayName ?? 'Anonymous',
            text: (rv.text as Record<string, string>)?.text ?? '',
            rating: (rv.rating as number) ?? 5,
          }));
        }
      } catch (_) { /* skip */ }

      const photoUrls = ((pl.photos as { name: string }[]) || []).slice(0, 4)
        .map(p => `https://places.googleapis.com/v1/${p.name}/media?maxWidthPx=900&key=${KEY}`);

      const fullAddr = (pl.formattedAddress as string) ?? '';
      const addrParts = fullAddr.split(',');
      const street = addrParts.slice(0, -3).join(',').trim() || addrParts[0]?.trim() || '';
      const stateCode = addrParts.slice(-2, -1)[0]?.trim().split(' ')[0] ?? '';

      queue.push({
        name: (pl.displayName as Record<string, string>)?.text ?? 'Unknown',
        category, address: street, city, state: stateCode,
        phone: (pl.nationalPhoneNumber as string) ?? '', email: '',
        google_place_id: pl.id as string,
        current_website_url: websiteUri || '',
        website_quality: websiteQuality,
        rating: (pl.rating as number) ?? 0,
        review_count: (pl.userRatingCount as number) ?? 0,
        top_reviews: reviews, photos: photoUrls,
        hours: ((pl.regularOpeningHours as Record<string, string[]>)?.weekdayDescriptions ?? []).join(', '),
        owner_name: '', year_established: '', personality_profile: null,
        status: 'scraped', campaign_id: campaign.id,
        campaign_query: `${category} in ${city}`, unsubscribed: false,
      });
      await new Promise(res => setTimeout(res, 150));
    }

    // Upsert businesses
    const toProcess: Record<string, unknown>[] = [];
    for (const biz of queue) {
      const existing = await db.Business.filter({ google_place_id: biz.google_place_id as string }) as Record<string, unknown>[];
      if (existing?.length > 0) {
        const eb = existing[0];
        await db.Business.update(eb.id as string, {
          rating: biz.rating, review_count: biz.review_count,
          top_reviews: biz.top_reviews, hours: biz.hours, phone: biz.phone,
          campaign_id: campaign.id, current_website_url: biz.current_website_url,
          website_quality: biz.website_quality,
        });
        const existingSites = await db.GeneratedSite.filter({ business_id: eb.id as string }) as unknown[];
        if (!existingSites?.length) toProcess.push({ ...eb, ...biz, id: eb.id });
        continue;
      }
      let enriched: { email?: string; owner_name?: string } = {};
      if (biz.current_website_url) {
        enriched = await enrichFromWebsite(biz.current_website_url as string);
      }
      const created = await db.Business.create({
        ...biz,
        email: enriched.email || '',
        owner_name: enriched.owner_name || '',
      });
      toProcess.push(created);
    }

    await db.Campaign.update(campaign.id, {
      businesses_found: queue.length,
      status: toProcess.length > 0 ? 'analyzing' : 'done',
    });

    if (toProcess.length === 0) {
      return Response.json({
        success: true, campaign_id: campaign.id,
        businesses_found: queue.length, sites_generated: 0,
        message: 'All businesses found already have sites, or all have decent websites. Try a different city or category.',
      });
    }

    // Process sequentially
    let sitesGenerated = 0;
    for (const business of toProcess) {
      try {
        const profile = await analyzePersonality(business, apiKey, db);
        const site = await generateSite(business, profile, apiKey, db);
        await writeEmail(business, profile, site, apiKey, db);
        sitesGenerated++;
        await db.Campaign.update(campaign.id, { sites_generated: sitesGenerated });
      } catch (err) {
        console.error(`Pipeline failed for ${(business as { name: string }).name}:`, err);
      }
    }

    await db.Campaign.update(campaign.id, { status: 'done', sites_generated: sitesGenerated });
    return Response.json({
      success: true, campaign_id: campaign.id,
      businesses_found: queue.length, sites_generated: sitesGenerated,
    });

  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
});
