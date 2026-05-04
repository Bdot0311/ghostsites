import { createClientFromRequest } from "npm:@base44/sdk";
import { getIndustrySections } from "./designLibrary.ts";

const MINI_APP_URL = 'https://untitled-app-37d87fa3.base44.app';

async function callClaude(apiKey: string, system: string, user: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-opus-4-5', max_tokens: 6000,
      system: system + '\n\nOutput raw JSON only. No markdown. No code fences. No explanation.',
      messages: [{ role: 'user', content: user }, { role: 'assistant', content: '{' }],
    }),
  });
  if (!res.ok) throw new Error(`Claude error: ${await res.text()}`);
  return '{' + (await res.json()).content[0].text;
}

function parseJSON(text: string) {
  const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').replace(/<!--[\s\S]*?-->/g, '').trim();
  try { return JSON.parse(clean); } catch (_) {}
  const greedy = clean.match(/\{[\s\S]*\}/);
  if (greedy) { try { return JSON.parse(greedy[0]); } catch (_) {} }
  throw new Error(`No valid JSON. Raw: ${text.slice(0, 200)}`);
}

function pick<T>(a: T[]): T { return a[Math.floor(Math.random() * a.length)]; }
function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }
function stars(n: number): string { return '★'.repeat(Math.min(5, Math.max(1, Math.round(n || 5)))); }
function isDarkBg(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) < 128;
}

// ── Animation CSS ──────────────────────────────────────────────────────────
function getAnimationCSS(interactions: string[], pal: any): string {
  const anim: string[] = [];
  anim.push(`
    @keyframes fadeUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
    .anim-fade-up { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
    .anim-delay-1 { animation-delay: 0.1s; }
    .anim-delay-2 { animation-delay: 0.2s; }
    .anim-delay-3 { animation-delay: 0.3s; }
    .anim-delay-4 { animation-delay: 0.4s; }
    .anim-delay-5 { animation-delay: 0.5s; }
    .reveal { opacity: 0; transform: translateY(50px); transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1); }
    .reveal.visible { opacity: 1; transform: translateY(0); }
    .img-reveal { position: relative; overflow: hidden; }
    .img-reveal::after { content: ''; position: absolute; inset: 0; background: ${pal.accent}; transform: scaleX(1); transform-origin: right; transition: transform 1.2s cubic-bezier(0.77, 0, 0.175, 1); }
    .img-reveal.visible::after { transform: scaleX(0); transform-origin: left; }
    .hover-lift { transition: transform 0.35s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.35s ease; }
    .hover-lift:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
  `);
  if (interactions.includes("MARQUEE")) {
    anim.push(`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .marquee-track { display: flex; width: max-content; animation: marquee 25s linear infinite; }`);
  }
  return anim.join('\n');
}

// ── Archetype CSS ──────────────────────────────────────────────────────────
function getArchetypeCSS(archetype: string, pal: any, typo: any): string {
  const isDark = isDarkBg(pal.background);
  if (archetype === "Brutalist") {
    return `body{font-family:'${typo.body}',system-ui,sans-serif;background:${pal.background};color:${pal.text};line-height:1.65;font-size:1.05rem;}h1,h2,h3{font-family:'${typo.heading}',Impact,sans-serif;line-height:0.95;text-transform:uppercase;letter-spacing:-0.02em;font-weight:900;}h1{font-size:clamp(3rem,10vw,8rem);}.card{border:2px solid ${pal.text};border-radius:0;background:${pal.background};}.btn{border:2px solid ${pal.text};border-radius:0;background:${pal.accent};color:${pal.background};font-weight:800;text-transform:uppercase;letter-spacing:0.05em;padding:1rem 2rem;display:inline-flex;align-items:center;gap:0.5rem;}.btn:hover{background:${pal.text};color:${pal.accent};}`;
  }
  if (archetype === "Soft Luxury") {
    return `body{font-family:'${typo.body}',system-ui,sans-serif;background:${pal.background};color:${pal.text};line-height:1.85;font-size:1.0625rem;}h1,h2,h3{font-family:'${typo.heading}',Georgia,serif;line-height:1.15;font-weight:400;letter-spacing:-0.01em;}h1{font-size:clamp(2.8rem,5.5vw,4rem);font-weight:300;}.card{border-radius:2px;background:${pal.primary};border:none;}.btn{border-radius:50px;background:${pal.accent};color:#fff;font-weight:500;letter-spacing:0.02em;padding:1.1rem 2.5rem;display:inline-flex;align-items:center;gap:0.5rem;border:none;transition:transform 0.2s,box-shadow 0.2s;}.btn:hover{transform:translateY(-3px);box-shadow:0 8px 32px rgba(0,0,0,0.18);}section{padding:8rem 0;}.wrap{max-width:1100px;margin:0 auto;padding:0 2.5rem;}`;
  }
  if (archetype === "Bold Minimal") {
    return `body{font-family:'${typo.body}',system-ui,sans-serif;background:${pal.background};color:${pal.text};line-height:1.6;font-size:1.05rem;}h1,h2,h3{font-family:'${typo.heading}',Impact,sans-serif;line-height:0.95;font-weight:900;text-transform:uppercase;letter-spacing:-0.02em;}h1{font-size:clamp(3.5rem,10vw,8rem);}.card{border-radius:0;border-top:1px solid ${pal.muted};padding-top:2rem;background:transparent;}.btn{background:${pal.accent};color:${isDark ? pal.background : '#fff'};font-weight:900;padding:1.2rem 2.5rem;text-transform:uppercase;letter-spacing:0.08em;border:none;display:inline-flex;align-items:center;gap:0.5rem;}section{padding:10rem 0;}.wrap{max-width:1000px;margin:0 auto;padding:0 2rem;}`;
  }
  if (archetype === "Retro") {
    return `body{font-family:'${typo.body}',system-ui,sans-serif;background:${pal.background};color:${pal.text};line-height:1.7;font-size:1.05rem;}h1,h2,h3{font-family:'${typo.heading}',Georgia,serif;line-height:1.2;}h1{font-size:clamp(2.8rem,6vw,5rem);}.card{border-radius:8px;background:${pal.primary};box-shadow:4px 4px 0 ${pal.secondary};border:2px solid ${pal.secondary};padding:2rem;}.btn{border-radius:8px;background:${pal.accent};color:#fff;font-weight:700;padding:1rem 2rem;display:inline-flex;align-items:center;gap:0.5rem;box-shadow:3px 3px 0 ${pal.text};transition:all 0.2s;}.btn:hover{transform:translate(2px,2px);box-shadow:1px 1px 0 ${pal.text};}`;
  }
  if (archetype === "Modern Tech") {
    return `body{font-family:'${typo.body}',system-ui,sans-serif;background:${pal.background};color:${pal.text};line-height:1.65;font-size:0.95rem;}h1,h2,h3{font-family:'${typo.heading}',system-ui,sans-serif;line-height:1.15;font-weight:600;letter-spacing:-0.02em;}h1{font-size:clamp(2.5rem,5.5vw,4.5rem);font-weight:700;}.card{border-radius:12px;background:${pal.primary};border:1px solid rgba(255,255,255,0.1);padding:2rem;}.btn{border-radius:8px;background:${pal.accent};color:${isDark ? pal.background : '#fff'};font-weight:600;padding:0.85rem 1.75rem;display:inline-flex;align-items:center;gap:0.5rem;font-size:0.9rem;letter-spacing:0.02em;transition:transform 0.2s,box-shadow 0.2s;}.btn:hover{transform:translateY(-2px);}`;
  }
  if (archetype === "Photo-First") {
    return `body{font-family:'${typo.body}',system-ui,sans-serif;background:${pal.background};color:${pal.text};line-height:1.7;font-size:1rem;}h1,h2,h3{font-family:'${typo.heading}',Georgia,serif;line-height:1.1;font-weight:400;}h1{font-size:clamp(2.2rem,5vw,4rem);font-weight:300;}.card{border-radius:0;background:transparent;padding:2rem;}.btn{background:transparent;color:${pal.text};border:1px solid ${pal.text};padding:0.75rem 1.5rem;display:inline-flex;align-items:center;gap:0.5rem;font-size:0.85rem;text-transform:uppercase;letter-spacing:0.1em;transition:all 0.3s;}.btn:hover{background:${pal.text};color:${pal.background};}`;
  }
  // Editorial + default
  return `body{font-family:'${typo.body}',system-ui,sans-serif;background:${pal.background};color:${pal.text};line-height:1.75;font-size:1.0625rem;}h1,h2,h3{font-family:'${typo.heading}',Georgia,serif;line-height:1.15;font-weight:700;}h1{font-size:clamp(3rem,7vw,6rem);letter-spacing:-0.03em;}.card{border-radius:14px;background:${pal.primary};box-shadow:0 2px 16px rgba(0,0,0,0.07);padding:2rem;}.btn{border-radius:50px;background:${pal.accent};color:#fff;font-weight:700;padding:0.9rem 2rem;display:inline-flex;align-items:center;gap:0.5rem;transition:transform 0.2s,box-shadow 0.2s;}.btn:hover{transform:translateY(-3px);box-shadow:0 8px 32px rgba(0,0,0,0.18);}`;
}

// ── Section builders ───────────────────────────────────────────────────────
function buildHero(archetype: string, business: any, copy: any, pal: any, photos: string[]): string {
  const phone = business.phone || '';
  const phoneTel = phone.replace(/\D/g, '');
  const rating = business.rating || 5;
  const revCount = business.review_count || 0;
  const heroPhoto = photos[0] || '';

  if (archetype === "Brutalist") {
    return `<section class="hero" style="min-height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:2rem;background:${pal.background};border-bottom:4px solid ${pal.text};"><div style="max-width:900px;"><div class="anim-fade-up" style="font-family:monospace;font-size:0.8rem;text-transform:uppercase;letter-spacing:0.15em;color:${pal.muted};margin-bottom:2rem;">${business.category} · ${business.city}${business.state ? ', ' + business.state : ''}</div><h1 class="anim-fade-up anim-delay-1" style="font-size:clamp(3rem,10vw,8rem);font-weight:900;text-transform:uppercase;line-height:0.9;margin-bottom:2rem;color:${pal.text};">${copy.headline}</h1><p class="anim-fade-up anim-delay-2" style="font-size:clamp(1.1rem,2vw,1.4rem);color:${pal.muted};max-width:50ch;margin:0 auto 3rem;">${copy.tagline}</p><div class="anim-fade-up anim-delay-3" style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;"><a href="tel:${phoneTel}" class="btn">📞 Call Now</a>${heroPhoto ? `<a href="#about" class="btn" style="background:transparent;color:${pal.text};">See More</a>` : ''}</div>${revCount > 0 ? `<div class="anim-fade-up anim-delay-4" style="margin-top:3rem;font-family:monospace;font-size:0.75rem;color:${pal.muted};">★ ${rating} · ${revCount} reviews</div>` : ''}</div></section>`;
  }
  if (archetype === "Soft Luxury") {
    return `<section class="hero" style="min-height:100vh;display:flex;align-items:center;padding:6rem 2rem;background:${pal.background};position:relative;"><div style="max-width:1100px;margin:0 auto;width:100%;"><div style="max-width:700px;"><p class="anim-fade-up" style="font-size:0.85rem;text-transform:uppercase;letter-spacing:0.12em;color:${pal.muted};margin-bottom:2rem;">${business.category} — ${business.city}</p><h1 class="anim-fade-up anim-delay-1" style="font-size:clamp(2.8rem,5.5vw,4.5rem);font-weight:300;line-height:1.1;margin-bottom:1.5rem;letter-spacing:-0.02em;color:${pal.text};">${copy.headline}</h1><p class="anim-fade-up anim-delay-2" style="font-size:clamp(1.05rem,1.5vw,1.2rem);color:${pal.muted};line-height:1.7;max-width:45ch;margin-bottom:2.5rem;">${copy.tagline}</p><div class="anim-fade-up anim-delay-3" style="display:flex;gap:1.5rem;align-items:center;flex-wrap:wrap;"><a href="tel:${phoneTel}" class="btn">${phone || 'Book a Consultation'}</a><span style="font-size:0.85rem;color:${pal.muted};">⭐ ${rating} · ${revCount} reviews</span></div></div></div>${heroPhoto ? `<div style="position:absolute;top:0;right:0;width:40%;height:100%;opacity:0.15;"><img src="${heroPhoto}" style="width:100%;height:100%;object-fit:cover;" alt=""></div>` : ''}</section>`;
  }
  if (archetype === "Bold Minimal") {
    return `<section class="hero" style="min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:4rem 2rem;background:${pal.background};border-bottom:1px solid ${pal.muted};"><div class="wrap" style="width:100%;"><h1 class="anim-fade-up" style="font-size:clamp(3.5rem,10vw,8rem);font-weight:900;text-transform:uppercase;line-height:0.9;letter-spacing:-0.03em;color:${pal.text};margin-bottom:1.5rem;">${copy.headline}</h1><div style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:2rem;"><p class="anim-fade-up anim-delay-1" style="font-size:clamp(1rem,1.5vw,1.2rem);color:${pal.muted};max-width:40ch;line-height:1.6;">${copy.tagline}</p><a href="tel:${phoneTel}" class="btn anim-fade-up anim-delay-2">${phone || 'Call Now'}</a></div>${revCount > 0 ? `<div class="anim-fade-up anim-delay-3" style="margin-top:4rem;padding-top:2rem;border-top:1px solid ${pal.muted};font-size:0.8rem;color:${pal.muted};text-transform:uppercase;letter-spacing:0.1em;">★ ${rating} · ${revCount} Google Reviews · ${business.city}</div>` : ''}</div></section>`;
  }
  if (archetype === "Retro") {
    return `<section class="hero" style="min-height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:3rem 2rem;background:${pal.background};position:relative;overflow:hidden;"><div style="position:absolute;inset:0;opacity:0.08;background:repeating-linear-gradient(45deg, ${pal.accent} 0px, ${pal.accent} 2px, transparent 2px, transparent 12px);"></div><div style="position:relative;z-index:1;max-width:800px;"><div class="anim-fade-up" style="display:inline-block;background:${pal.accent};color:#fff;font-size:0.8rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;padding:0.5rem 1.25rem;border-radius:4px;margin-bottom:2rem;">Est. ${business.city}</div><h1 class="anim-fade-up anim-delay-1" style="font-size:clamp(2.5rem,6vw,5rem);line-height:1.1;margin-bottom:1.5rem;color:${pal.text};">${copy.headline}</h1><p class="anim-fade-up anim-delay-2" style="font-size:clamp(1rem,2vw,1.2rem);color:${pal.muted};max-width:50ch;margin:0 auto 2.5rem;">${copy.tagline}</p><a href="tel:${phoneTel}" class="btn anim-fade-up anim-delay-3">📞 ${phone || 'Call Us'}</a>${revCount > 0 ? `<div class="anim-fade-up anim-delay-4" style="margin-top:2.5rem;font-size:0.85rem;color:${pal.muted};">★★★★★ ${revCount} happy customers</div>` : ''}</div></div></section>`;
  }
  // Default warm/editorial hero
  const heroBg = heroPhoto
    ? `background:linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.65) 100%), url('${heroPhoto}') center/cover no-repeat;`
    : `background:linear-gradient(145deg, ${pal.accent}15 0%, ${pal.background} 60%, ${pal.primary} 100%);`;
  const heroColor = heroPhoto ? '#fff' : pal.text;
  const heroMuted = heroPhoto ? 'rgba(255,255,255,0.8)' : pal.muted;

  return `<section class="hero" style="min-height:100vh;${heroBg}display:flex;flex-direction:column;justify-content:flex-end;padding:0 0 5rem;"><div class="wrap anim-fade-up" style="width:100%;margin:0 auto;padding:0 2rem;max-width:1200px;"><div style="display:inline-flex;align-items:center;gap:.4rem;background:${heroPhoto ? 'rgba(255,255,255,0.15)' : pal.primary};border:1px solid ${heroPhoto ? 'rgba(255,255,255,0.3)' : pal.accent + '44'};color:${heroColor};font-size:.82rem;font-weight:600;padding:.4rem 1rem;border-radius:50px;margin-bottom:1.5rem;backdrop-filter:blur(8px);">⭐ ${rating} · ${revCount} Google Reviews</div><h1 style="font-size:clamp(3rem,8.5vw,7rem);font-weight:900;line-height:1.0;letter-spacing:-.03em;color:${heroColor};max-width:16ch;margin-bottom:1.25rem;${heroPhoto ? 'text-shadow:0 2px 24px rgba(0,0,0,.45)' : ''}">${copy.headline}</h1><p style="font-size:clamp(1.05rem,2vw,1.3rem);color:${heroMuted};max-width:50ch;margin-bottom:2.25rem;line-height:1.6;">${copy.tagline}</p><div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;"><a href="tel:${phoneTel}" class="btn">📞 Call ${phone || 'Now'}</a><a href="#services" style="display:inline-flex;align-items:center;gap:.35rem;color:${heroColor};font-size:.95rem;font-weight:600;border-bottom:2px solid ${heroPhoto ? 'rgba(255,255,255,.45)' : pal.accent};padding-bottom:.1rem;">See our work →</a></div></div></section>`;
}

function buildAbout(archetype: string, business: any, copy: any, pal: any, photos: string[]): string {
  const aboutPhoto = photos[1] || '';
  const rating = business.rating || 5;
  const revCount = business.review_count || 0;
  if (archetype === "Brutalist") {
    return `<section id="about" class="reveal" style="padding:6rem 2rem;background:${pal.background};border-top:2px solid ${pal.text};"><div style="max-width:1000px;margin:0 auto;"><div style="display:grid;grid-template-columns:${aboutPhoto ? '1fr 1fr' : '1fr'};gap:4rem;align-items:center;"><div><h2 style="font-size:clamp(2rem,4vw,3.5rem);font-weight:900;text-transform:uppercase;line-height:0.95;margin-bottom:2rem;color:${pal.text};">${business.name}</h2><p style="color:${pal.muted};margin-bottom:1.5rem;font-size:1.1rem;line-height:1.7;">${copy.about_1}</p><p style="color:${pal.muted};font-size:1.1rem;line-height:1.7;">${copy.about_2}</p><div style="display:flex;gap:3rem;margin-top:3rem;padding-top:2rem;border-top:2px solid ${pal.text};"><div><div style="font-size:3rem;font-weight:900;color:${pal.accent};line-height:1;">${rating}</div><div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:${pal.muted};">Rating</div></div><div><div style="font-size:3rem;font-weight:900;color:${pal.accent};line-height:1;">${revCount}+</div><div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:${pal.muted};">Reviews</div></div><div><div style="font-size:3rem;font-weight:900;color:${pal.accent};line-height:1;">${business.city}</div><div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:${pal.muted};">Location</div></div></div></div>${aboutPhoto ? `<div class="img-reveal"><img src="${aboutPhoto}" alt="${business.name}" style="width:100%;height:400px;object-fit:cover;border:2px solid ${pal.text};"></div>` : ''}</div></div></section>`;
  }
  return `<section id="about" class="reveal" style="padding:6rem 2rem;background:${pal.primary};"><div style="max-width:1200px;margin:0 auto;"><div style="display:grid;grid-template-columns:${aboutPhoto ? '1fr 1fr' : '1fr'};gap:4rem;align-items:center;"><div><h2 style="font-size:clamp(2rem,4vw,3rem);font-weight:800;margin-bottom:1.4rem;color:${pal.text};">${business.name}</h2><p style="color:${pal.muted};margin-bottom:1rem;font-size:1.0625rem;line-height:1.7;">${copy.about_1}</p><p style="color:${pal.muted};font-size:1.0625rem;line-height:1.7;">${copy.about_2}</p><div style="display:flex;gap:2.5rem;margin-top:2rem;padding-top:2rem;border-top:1px solid ${pal.muted}33;flex-wrap:wrap;"><div><div style="font-family:serif;font-size:2.6rem;font-weight:900;color:${pal.accent};line-height:1;">${rating}★</div><div style="font-size:0.75rem;color:${pal.muted};text-transform:uppercase;letter-spacing:0.07em;">Google Rating</div></div><div><div style="font-family:serif;font-size:2.6rem;font-weight:900;color:${pal.accent};line-height:1;">${revCount}+</div><div style="font-size:0.75rem;color:${pal.muted};text-transform:uppercase;letter-spacing:0.07em;">Reviews</div></div><div><div style="font-family:serif;font-size:2.6rem;font-weight:900;color:${pal.accent};line-height:1;">${business.city}</div><div style="font-size:0.75rem;color:${pal.muted};text-transform:uppercase;letter-spacing:0.07em;">Location</div></div></div></div>${aboutPhoto ? `<div class="img-reveal"><img src="${aboutPhoto}" alt="${business.name}" style="width:100%;height:420px;object-fit:cover;border-radius:14px;box-shadow:0 16px 64px rgba(0,0,0,0.18);"></div>` : ''}</div></div></section>`;
}

function buildServices(archetype: string, business: any, copy: any, pal: any): string {
  const cards = (copy.services || []).slice(0, 6).map((s: any, i: number) => {
    const delay = `anim-delay-${Math.min(i + 1, 5)}`;
    if (archetype === "Brutalist") {
      return `<div class="card hover-lift ${delay}" style="padding:2rem;"><div style="font-family:monospace;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:${pal.muted};margin-bottom:0.75rem;">0${i + 1}</div><h3 style="font-size:1.2rem;font-weight:900;text-transform:uppercase;margin-bottom:0.5rem;color:${pal.text};">${s.name}</h3><p style="color:${pal.muted};font-size:0.95rem;line-height:1.6;">${s.desc}</p>${s.price ? `<div style="margin-top:1rem;font-family:monospace;font-size:0.85rem;font-weight:700;color:${pal.accent};">${s.price}</div>` : ''}</div>`;
    }
    if (archetype === "Soft Luxury") {
      return `<div class="hover-lift ${delay}" style="padding:2.5rem 0;border-top:1px solid ${pal.muted}33;"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;margin-bottom:0.75rem;"><h3 style="font-size:1.1rem;font-weight:400;color:${pal.text};">${s.name}</h3>${s.price ? `<span style="font-size:0.9rem;color:${pal.accent};font-weight:500;white-space:nowrap;">${s.price}</span>` : ''}</div><p style="color:${pal.muted};font-size:0.95rem;line-height:1.7;">${s.desc}</p></div>`;
    }
    return `<div class="card hover-lift ${delay}" style="padding:2rem;border-left:4px solid ${pal.accent};"><div style="font-size:1.8rem;margin-bottom:1rem;">${s.icon || '✦'}</div><h3 style="font-size:1.15rem;font-weight:700;margin-bottom:0.5rem;color:${pal.text};">${s.name}</h3><p style="color:${pal.muted};font-size:0.9375rem;line-height:1.65;">${s.desc}</p>${s.price ? `<div style="margin-top:0.9rem;font-weight:700;color:${pal.accent};font-size:0.875rem;">${s.price}</div>` : ''}</div>`;
  }).join('');

  const titleStyle = archetype === "Brutalist" 
    ? 'font-size:clamp(2rem,4vw,3.5rem);font-weight:900;text-transform:uppercase;line-height:0.95;'
    : archetype === "Soft Luxury"
    ? 'font-size:clamp(1.6rem,3vw,2.2rem);font-weight:300;'
    : 'font-size:clamp(2rem,4vw,3rem);font-weight:800;';

  return `<section id="services" class="reveal" style="padding:6rem 2rem;background:${pal.background};"><div style="max-width:1200px;margin:0 auto;"><h2 style="${titleStyle}margin-bottom:0.75rem;color:${pal.text};">What We Offer</h2><p style="color:${pal.muted};margin-bottom:3rem;max-width:54ch;font-size:1.05rem;">Services from ${business.name} — ${business.city}${business.state ? ', ' + business.state : ''}.</p><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem;">${cards}</div></div></section>`;
}

function buildGallery(archetype: string, business: any, photos: string[], pal: any): string {
  if (photos.length < 2) return '';
  const galleryPhotos = photos.slice(1);
  if (archetype === "Brutalist") {
    return `<section id="gallery" class="reveal" style="padding:4rem 2rem;background:${pal.background};border-top:2px solid ${pal.text};"><div style="max-width:1200px;margin:0 auto;"><h2 style="font-size:clamp(2rem,4vw,3rem);font-weight:900;text-transform:uppercase;margin-bottom:2rem;color:${pal.text};">Our Work</h2><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:0;">${galleryPhotos.map(u => `<div style="border:2px solid ${pal.text};margin:-1px;"><img src="${u}" alt="${business.name}" style="width:100%;height:280px;object-fit:cover;display:block;" loading="lazy"></div>`).join('')}</div></div></section>`;
  }
  return `<section id="gallery" class="reveal" style="padding:4rem 2rem;background:${pal.primary};"><div style="max-width:1200px;margin:0 auto;"><h2 style="font-size:clamp(2rem,4vw,3rem);font-weight:800;margin-bottom:2rem;color:${pal.text};">Our Work</h2><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;">${galleryPhotos.map(u => `<div style="overflow:hidden;border-radius:10px;aspect-ratio:4/3;"><img src="${u}" alt="${business.name}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.4s ease;" loading="lazy" onmouseover="this.style.transform='scale(1.06)'" onmouseout="this.style.transform='scale(1)'"></div>`).join('')}</div></div></section>`;
}

function buildReviews(archetype: string, business: any, pal: any): string {
  const isDark = isDarkBg(pal.background);
  const revBg = isDark ? pal.primary : '#0f0f0f';
  const revText = isDark ? pal.text : '#ffffff';
  const revSubRgb = revText === '#ffffff' ? '255,255,255' : '0,0,0';
  const reviewCards = ((business.top_reviews || []) as { text: string; author: string; rating: number }[])
    .slice(0, 3).map((r, i) => `<div class="card hover-lift reveal anim-delay-${i + 1}" style="padding:2rem;position:relative;transition:background 0.2s;"><div style="color:${pal.accent};font-size:1.05rem;letter-spacing:0.05em;margin-bottom:1.2rem;">${stars(r.rating)}</div><blockquote style="color:${revText === '#ffffff' ? 'rgba(255,255,255,0.82)' : pal.muted};font-style:italic;line-height:1.7;font-size:1rem;margin-bottom:1.2rem;padding-left:0.5rem;">"${(r.text || '').slice(0, 220)}"</blockquote><cite style="color:${pal.accent};font-weight:600;font-style:normal;font-size:0.875rem;">— ${r.author}</cite></div>`).join('') || `<div class="card" style="padding:2rem;"><div style="color:${pal.accent};font-size:1.05rem;margin-bottom:1.2rem;">★★★★★</div><blockquote style="color:${pal.muted};font-style:italic;line-height:1.7;">"Fantastic service — couldn't recommend them more highly."</blockquote><cite style="color:${pal.accent};font-weight:600;font-size:0.875rem;">— Happy Customer</cite></div>`;

  const titleStyle = archetype === "Brutalist"
    ? 'font-size:clamp(2rem,4vw,3.5rem);font-weight:900;text-transform:uppercase;line-height:0.95;'
    : 'font-size:clamp(2rem,4vw,3rem);font-weight:800;';

  return `<section id="reviews" class="reveal" style="padding:6rem 2rem;background:${revBg};"><div style="max-width:1200px;margin:0 auto;"><h2 style="${titleStyle}margin-bottom:0.5rem;color:${revText};">What Customers Say</h2><p style="color:rgba(${revSubRgb},0.42);margin-bottom:3rem;font-size:1rem;">Real words from real people</p><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.5rem;">${reviewCards}</div></div></section>`;
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
    : 'background:' + pal.accent + ';color:#fff;border:none;border-radius:50px;';

  return `<section id="contact" class="reveal" style="padding:6rem 2rem;background:${pal.background};"><div style="max-width:1200px;margin:0 auto;"><h2 style="font-size:clamp(2rem,4vw,3rem);font-weight:800;margin-bottom:3rem;color:${pal.text};">Find Us</h2><div style="display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:start;"><div><p style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${pal.muted};margin-bottom:1rem;">Hours</p><ul style="list-style:none;">${hoursHtml}</ul></div><div style="display:flex;flex-direction:column;gap:1.5rem;">${business.address ? `<div><strong style="display:block;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;color:${pal.muted};margin-bottom:0.3rem;">Address</strong><span style="font-size:1.0625rem;font-weight:500;color:${pal.text};">${business.address}</span></div>` : ''}<div><strong style="display:block;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;color:${pal.muted};margin-bottom:0.3rem;">Phone</strong><span style="font-size:1.0625rem;font-weight:500;color:${pal.text};">${phone || 'Call for info'}</span></div>${business.email ? `<div><strong style="display:block;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;color:${pal.muted};margin-bottom:0.3rem;">Email</strong><span style="font-size:1.0625rem;font-weight:500;color:${pal.text};">${business.email}</span></div>` : ''}<a href="tel:${phoneTel}" class="btn" style="display:inline-flex;align-items:center;gap:0.6rem;${ctaStyle}font-size:1.15rem;font-weight:800;padding:1rem 2.5rem;margin-top:1rem;transition:transform 0.2s,box-shadow 0.2s;">Call Now →</a></div></div></div></section>`;
}

function buildFooter(archetype: string, business: any, pal: any): string {
  if (archetype === "Brutalist") {
    return `<footer style="background:${pal.text};color:${pal.background};padding:3rem 2rem;border-top:4px solid ${pal.accent};"><div style="max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;gap:2rem;flex-wrap:wrap;"><span style="font-family:'${pal.heading}',serif;font-size:1.2rem;font-weight:900;text-transform:uppercase;">${business.name}</span><span style="font-family:monospace;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;opacity:0.6;">Built as a free preview — not affiliated with ${business.name}</span></div></footer>`;
  }
  return `<footer style="background:#0d0d0d;color:rgba(255,255,255,0.38);padding:3rem 2rem;"><div style="max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;gap:2rem;flex-wrap:wrap;"><span style="font-family:'${pal.heading}',serif;font-size:1.05rem;font-weight:700;color:rgba(255,255,255,0.75);">${business.name}</span><span style="font-size:0.75rem;">Built as a free preview — not affiliated with ${business.name}</span></div></footer>`;
}

// ── Design token maps (synced with designLibrary.ts) ─────────────────────────

const PALETTES: Record<number, { name: string; background: string; text: string; accent: string; muted: string; primary: string }> = {
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

const TYPO: Record<number, { name: string; heading: string; body: string; gf: string }> = {
  1: { name: "Fraunces + Inter", heading: "Fraunces", body: "Inter", gf: "Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:wght@300;400;500;600" },
  2: { name: "Playfair + Manrope", heading: "Playfair Display", body: "Manrope", gf: "Playfair+Display:ital,wght@0,400..900;1,400..900&family=Manrope:wght@300;400;500;600" },
  3: { name: "Libre Baskerville + Lato", heading: "Libre Baskerville", body: "Lato", gf: "Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700" },
  4: { name: "Oswald + Source Sans", heading: "Oswald", body: "Source Sans 3", gf: "Oswald:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;600" },
  5: { name: "Bebas + Open Sans", heading: "Bebas Neue", body: "Open Sans", gf: "Bebas+Neue&family=Open+Sans:wght@300;400;600" },
  6: { name: "Montserrat + Merriweather", heading: "Montserrat", body: "Merriweather", gf: "Montserrat:wght@400;600;700;800&family=Merriweather:ital,wght@0,300;0,400;1,300" },
  7: { name: "Raleway + Merriweather", heading: "Raleway", body: "Merriweather", gf: "Raleway:wght@300;400;600;700&family=Merriweather:ital,wght@0,300;0,400;1,300" },
  8: { name: "Anton + Roboto", heading: "Anton", body: "Roboto", gf: "Anton&family=Roboto:wght@300;400;500" },
  9: { name: "Space Grotesk + DM Sans", heading: "Space Grotesk", body: "DM Sans", gf: "Space+Grotesk:wght@300..700&family=DM+Sans:wght@300;400;500;600" },
  10: { name: "Archivo Black + Inter", heading: "Archivo Black", body: "Inter", gf: "Archivo+Black&family=Inter:wght@300;400;500;600" },
  11: { name: "Black Han + Nunito", heading: "Black Han Sans", body: "Nunito", gf: "Black+Han+Sans&family=Nunito:wght@300;400;600" },
  12: { name: "Ultra + Crimson", heading: "Ultra", body: "Crimson Text", gf: "Ultra&family=Crimson+Text:ital,wght@0,400;0,600;1,400" },
  13: { name: "Barlow Condensed + Karla", heading: "Barlow Condensed", body: "Karla", gf: "Barlow+Condensed:wght@400;600;700;800&family=Karla:wght@300;400;500" },
  14: { name: "DM Serif + Work Sans", heading: "DM Serif Display", body: "Work Sans", gf: "DM+Serif+Display:ital@0;1&family=Work+Sans:wght@300;400;500;600" },
  18: { name: "Fraunces + Inter (warm)", heading: "Fraunces", body: "Inter", gf: "Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:wght@300;400;500;600" },
  20: { name: "Abril + Raleway", heading: "Abril Fatface", body: "Raleway", gf: "Abril+Fatface&family=Raleway:ital,wght@0,300..700;1,300..700" },
};

const A2P: Record<string, number[]> = {
  "Editorial": [1, 3, 7, 39, 14], "Soft Luxury": [2, 4, 6, 19, 20],
  "Brutalist": [9, 10, 11, 21], "Modern Tech": [25, 9, 14, 3],
  "Warm Local": [8, 17, 34, 35, 22, 15], "Bold Minimal": [10, 39, 1, 21, 12],
  "Photo-First": [39, 1, 2, 3, 7], "Retro": [17, 18, 13, 22, 16],
};
const A2T: Record<string, number[]> = {
  "Editorial": [1, 2, 3, 7, 14], "Soft Luxury": [1, 2, 7, 12, 14, 20],
  "Brutalist": [9, 10, 5, 8, 13], "Modern Tech": [9, 10, 13, 4],
  "Warm Local": [18, 20, 1, 3, 7, 6], "Bold Minimal": [10, 9, 4, 5, 8],
  "Photo-First": [1, 2, 7, 14, 3], "Retro": [20, 18, 11, 12, 4, 6],
};
const A2L: Record<string, string[]> = {
  "Editorial": ["MAGAZINE_GRID", "SPLIT_HERO", "SCROLL_FLOW"],
  "Soft Luxury": ["CENTERED_HERO", "SPLIT_HERO", "OFFSET_HERO", "SCROLL_FLOW"],
  "Brutalist": ["CENTERED_HERO", "ASYMMETRIC_STACK", "MAGAZINE_GRID"],
  "Modern Tech": ["SPLIT_HERO", "CENTERED_HERO", "SCROLL_FLOW"],
  "Warm Local": ["FULL_BLEED_HERO", "SPLIT_HERO", "SCROLL_FLOW"],
  "Bold Minimal": ["CENTERED_HERO", "OFFSET_HERO", "SPLIT_HERO"],
  "Photo-First": ["FULL_BLEED_HERO", "MAGAZINE_GRID", "SPLIT_HERO"],
  "Retro": ["ASYMMETRIC_STACK", "SCROLL_FLOW", "MAGAZINE_GRID"],
};
const A2I: Record<string, string[]> = {
  "Editorial": ["SCROLL_REVEAL", "STICKY_HEADER", "IMAGE_REVEAL"],
  "Soft Luxury": ["SCROLL_REVEAL", "PARALLAX", "MAGNETIC_BUTTONS"],
  "Brutalist": ["CUSTOM_CURSOR", "TEXT_SCRAMBLE", "MARQUEE"],
  "Modern Tech": ["TEXT_SCRAMBLE", "CUSTOM_CURSOR", "MAGNETIC_BUTTONS"],
  "Warm Local": ["SCROLL_REVEAL", "MARQUEE", "HOVER_LIFT"],
  "Bold Minimal": ["SCROLL_REVEAL", "HOVER_LIFT", "MAGNETIC_BUTTONS"],
  "Photo-First": ["PARALLAX", "IMAGE_REVEAL", "SCROLL_REVEAL"],
  "Retro": ["MARQUEE", "HOVER_LIFT", "SCROLL_REVEAL"],
};

// ── Main handler ────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;

    const { business_id } = await req.json().catch(() => ({}));
    if (!business_id) return Response.json({ error: 'business_id required' }, { status: 400 });
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return Response.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 });

    const business = await db.Business.get(business_id);
    if (!business.personality_profile) return Response.json({ error: 'Run personality analysis first' }, { status: 400 });
    const profile = business.personality_profile as Record<string, unknown>;

    const existingSites = await db.GeneratedSite.list() as { design_fingerprint: string }[];
    const existingFP = existingSites.map(s => s.design_fingerprint).filter(Boolean);

    const arch = (profile.design_archetype as string) || 'Warm Local';
    let palId = pick(PALETTES[A2P[arch] || [8]]);
    let typId = pick(TYPO[A2T[arch] || [1]]);
    const layout = pick(A2L[arch] || ['SCROLL_FLOW']);
    const interactions = shuffle(A2I[arch] || ["SCROLL_REVEAL", "HOVER_LIFT"]).slice(0, 2 + Math.floor(Math.random() * 2));

    if (existingFP.includes(`${arch}-${palId}-${typId}-${layout}`)) {
      palId = pick((A2P[arch] || [8]).filter((p: number) => p !== palId)) ?? palId;
      typId = pick((A2T[arch] || [1]).filter((t: number) => t !== typId)) ?? typId;
    }
    const pal = PALETTES[palId] || PALETTES[8];
    const typo = TYPO[typId] || TYPO[1];
    const fp = `${arch}-${palId}-${typId}-${layout}-${Date.now()}`;

    const reviews = ((business.top_reviews as { author: string; text: string }[]) || []).slice(0, 3)
      .map(r => `"${r.text.slice(0, 150)}" — ${r.author}`).join('\n');

    // STRONGER copy prompt
    const copyJson = await callClaude(apiKey,
      `Output valid JSON only. No explanation. No markdown.`,
      `Write website copy for ${business.name}, a ${business.category} in ${business.city}${business.state ? ', ' + business.state : ''}.
Archetype: ${arch}
Tone: ${profile.tone_of_voice as string}
Differentiator: ${profile.key_differentiator as string}
Keywords: ${((profile.personality_keywords as string[]) || []).join(', ')}
Customer reviews:
${reviews}

CRITICAL:
1. Headline must reference something SPECIFIC — neighborhood, a signature item, a review detail. NEVER generic.
2. Tagline must sound like the owner talking.
3. About must mention the city naturally.
4. Services must use REAL industry terms.

Return JSON:
{
  "headline": "4-8 word hero — specific and unique to this business",
  "tagline": "one sentence, owner voice, mentions city",
  "about_1": "2-3 sentences about the business in this neighborhood",
  "about_2": "2-3 sentences referencing a specific customer praise point",
  "services": [
    {"name":"specific service","desc":"1-2 sentences with industry terms","price":"$XX–$XX","icon":"emoji"},
    {"name":"specific service","desc":"1-2 sentences with industry terms","price":"$XX–$XX","icon":"emoji"},
    {"name":"specific service","desc":"1-2 sentences with industry terms","price":"$XX–$XX","icon":"emoji"},
    {"name":"specific service","desc":"1-2 sentences with industry terms","price":"$XX–$XX","icon":"emoji"},
    {"name":"specific service","desc":"1-2 sentences with industry terms","price":"$XX–$XX","icon":"emoji"}
  ]
}`
    );

    const copy = parseJSON(copyJson);

    // Resolve photos
    const KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
    const photos: string[] = [];
    if (KEY && business.photos) {
      for (const url of (business.photos as string[]).slice(0, 4)) {
        try {
          const resolved = await fetch(url.replace(/maxWidthPx=\d+/, 'maxWidthPx=900'), { method: 'HEAD', redirect: 'follow' });
          if (resolved.ok && (resolved.url.includes('googleusercontent') || resolved.url.includes('gstatic'))) {
            photos.push(resolved.url);
          }
        } catch (_) { /* skip */ }
      }
    }

    // Build archetype-specific HTML
    const sections: string[] = [];
    sections.push(buildHero(arch, business, copy, pal, photos));
    sections.push(buildAbout(arch, business, copy, pal, photos));
    sections.push(buildServices(arch, business, copy, pal));
    sections.push(buildGallery(arch, business, photos, pal));
    sections.push(buildReviews(arch, business, pal));
    sections.push(buildContact(arch, business, pal));
    sections.push(buildFooter(arch, business, pal));

    const css = getArchetypeCSS(arch, pal, typo) + '\n' + getAnimationCSS(interactions, pal);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${business.name} | ${business.city}</title>
  <meta name="description" content="${business.category} in ${business.city}${business.state ? ', ' + business.state : ''}. ${copy.tagline}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${typo.gf}&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    ${css}
    a{color:inherit;text-decoration:none}
    img{display:block;max-width:100%;height:auto}
    .wrap{max-width:1200px;margin:0 auto;padding:0 2rem}
    section{padding:6rem 0}
    @media(max-width:768px){
      section{padding:4rem 0}
      .hero h1{font-size:clamp(2.2rem,10vw,3.5rem)!important}
      .about-grid,.contact-grid{grid-template-columns:1fr!important}
    }
  </style>
</head>
<body>
${sections.join('\n')}
<script>
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal, .img-reveal').forEach(el => observer.observe(el));
</script>
</body>
</html>`;

    const heroMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const hero_copy = heroMatch ? heroMatch[1].replace(/<[^>]+>/g, '').trim() : '';

    const site = await db.GeneratedSite.create({
      business_id, full_html: html, subdomain_url: '',
      design_archetype: arch, color_palette_id: palId, typography_pair_id: typId,
      layout_variant: layout, section_order: ['About', 'Services', 'Reviews', 'Hours', 'Contact'],
      micro_interactions: interactions, imagery_treatment: 'CLEAN', design_fingerprint: fp,
      hero_copy, about_copy: '', services_copy: '', cta_copy: '',
      generated_at: new Date().toISOString(), view_count: 0,
    });

    const previewUrl = `${MINI_APP_URL}/SitePreview?id=${site.id}`;
    await db.GeneratedSite.update(site.id as string, { subdomain_url: previewUrl });
    await db.Business.update(business_id, { status: 'site_generated' });

    return Response.json({
      success: true, site_id: site.id,
      subdomain_url: previewUrl,
      layout, palette: pal.name, typography: typo.name, archetype: arch,
    });
  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
});
