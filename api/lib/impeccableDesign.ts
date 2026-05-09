// impeccableDesign.ts v4 — 8 unique archetype builders
// Each archetype produces a fundamentally different site layout

const UNSPLASH: Record<string, { hero: string; side: string; gallery: string }> = {
  salon: { hero: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1400&q=80", side: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80", gallery: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&q=80" },
  cafe: { hero: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1400&q=80", side: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80", gallery: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80" },
  restaurant: { hero: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=80", side: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80", gallery: "https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?w=600&q=80" },
  gym: { hero: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80", side: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80", gallery: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&q=80" },
  plumber: { hero: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1400&q=80", side: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80", gallery: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80" },
  dentist: { hero: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1400&q=80", side: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&q=80", gallery: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&q=80" },
  photographer: { hero: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1400&q=80", side: "https://images.unsplash.com/photo-1542038784456-1e8e935640e?w=600&q=80", gallery: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80" },
  lawyer: { hero: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1400&q=80", side: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80", gallery: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=600&q=80" },
  bakery: { hero: "https://images.unsplash.com/photo-1556217477-d325251ece38?w=1400&q=80", side: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80", gallery: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&q=80" },
  barber: { hero: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1400&q=80", side: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80", gallery: "https://images.unsplash.com/photo-1503951914875-452162b0f77f?w=600&q=80" },
  spa: { hero: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1400&q=80", side: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&q=80", gallery: "https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=600&q=80" },
  default: { hero: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80", side: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80", gallery: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80" },
};

function unsplash(cat: string, type: "hero" | "side" | "gallery"): string {
  const c = cat.toLowerCase();
  for (const [key, val] of Object.entries(UNSPLASH)) {
    if (c.includes(key)) return val[type];
  }
  return UNSPLASH.default[type];
}

// ──── COLOR SYSTEM (OKLCH) ────
function oklch(l: number, c: number, h: number) { return `oklch(${l}% ${c} ${h})`; }
function prim(h: number) {
  return {
    50: oklch(97,0.02,h), 100: oklch(93,0.04,h), 200: oklch(86,0.08,h),
    300: oklch(76,0.12,h), 400: oklch(65,0.18,h), 500: oklch(55,0.22,h),
    600: oklch(45,0.20,h), 700: oklch(35,0.16,h), 800: oklch(25,0.10,h), 900: oklch(15,0.05,h),
  };
}
function neut(h: number) {
  const c = 0.008;
  return {
    0: oklch(100,c*0.5,h), 50: oklch(98,c,h), 100: oklch(95,c,h), 200: oklch(88,c,h),
    300: oklch(75,c,h), 400: oklch(62,c,h), 500: oklch(50,c,h), 600: oklch(38,c,h),
    700: oklch(28,c,h), 800: oklch(18,c,h), 900: oklch(12,c,h), 950: oklch(8,c,h),
  };
}

export type Arch = "brutalist" | "softLuxury" | "editorial" | "modernTech" | "warmLocal" | "boldMinimal" | "photoFirst" | "retro";

const CFG: Record<Arch, { name: string; hue: [number,number]; fontH: string; fontB: string; sp: string; r: string; w: number }> = {
  brutalist:  { name: "Brutalist",    hue: [0,360], fontH: "'Space Grotesk',system-ui,sans-serif", fontB: "'Inter',system-ui,sans-serif",       sp: "tight", r: "0px",  w: 700 },
  softLuxury: { name: "Soft Luxury",  hue: [300,340], fontH: "'Playfair Display',Georgia,serif",    fontB: "'Inter','Helvetica Neue',sans-serif", sp: "airy",  r: "16px", w: 500 },
  editorial:  { name: "Editorial",    hue: [20,45], fontH: "'Playfair Display',Georgia,serif",      fontB: "'Source Serif 4',Georgia,serif",     sp: "normal",r: "0px",  w: 600 },
  modernTech: { name: "Modern Tech",  hue: [230,270], fontH: "'Inter',system-ui,sans-serif",        fontB: "'Inter',system-ui,sans-serif",       sp: "normal",r: "12px", w: 600 },
  warmLocal:  { name: "Warm Local",   hue: [30,60], fontH: "'DM Serif Display',Georgia,serif",      fontB: "'Inter',sans-serif",                 sp: "normal",r: "8px",  w: 500 },
  boldMinimal:{ name: "Bold Minimal", hue: [0,360], fontH: "'Space Grotesk',system-ui,sans-serif",  fontB: "'Inter',system-ui,sans-serif",       sp: "airy",  r: "0px",  w: 700 },
  photoFirst: { name: "Photo-First",  hue: [160,200], fontH: "'Playfair Display',Georgia,serif",    fontB: "'Inter',sans-serif",                 sp: "normal",r: "8px",  w: 500 },
  retro:      { name: "Retro",        hue: [15,45], fontH: "'Courier New',monospace",               fontB: "'Georgia',serif",                    sp: "normal",r: "4px",  w: 600 },
};

function pickArch(c: string): Arch {
  const cat = c.toLowerCase();
  const m: [string[], Arch][] = [
    [["contractor","auto","mechanic","construction","plumber","roofer","electrician"],"brutalist"],
    [["salon","spa","wedding","esthetician","nail","beauty"],"softLuxury"],
    [["lawyer","accountant","consulting","architect","financial","attorney"],"editorial"],
    [["tech","software","marketing","agency","design","web"],"modernTech"],
    [["cafe","bakery","restaurant","coffee","catering","food"],"warmLocal"],
    [["gym","fitness","trainer","martial","crossfit","yoga"],"boldMinimal"],
    [["photographer","realtor","venue","interior","studio"],"photoFirst"],
    [["diner","barber","vintage","record","antique"],"retro"],
  ];
  for (const [t, a] of m) if (t.some(x => cat.includes(x))) return a;
  const f: Arch[] = ["warmLocal","editorial","boldMinimal","softLuxury"];
  return f[Math.floor(Math.random()*f.length)];
}

// ──── SHARED HTML HELPERS ────
const SVGS: Record<string, string> = {
  phone:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.95.37 1.89.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.92.33 1.86.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  map:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  clock:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  star:`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  arrow:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  scissors:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>`,
  coffee:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
  wrench:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  heart:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  zap:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  camera:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  smile:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
  shield:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  droplet:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
};

function iconFor(cat: string, idx: number): string {
  const c = cat.toLowerCase();
  const pick = (arr: string[]) => SVGS[arr[idx % arr.length]] || SVGS.star;
  if (c.includes("salon") || c.includes("barber")) return pick(["scissors","heart","star","smile","droplet","zap"]);
  if (c.includes("cafe") || c.includes("coffee") || c.includes("bakery")) return pick(["coffee","heart","clock","star","zap","droplet"]);
  if (c.includes("gym") || c.includes("fitness")) return pick(["zap","heart","shield","star","clock"]);
  if (c.includes("plumber")) return pick(["wrench","droplet","shield","clock","zap"]);
  if (c.includes("dentist")) return pick(["smile","shield","heart","star","clock"]);
  if (c.includes("photo")) return pick(["camera","star","heart","zap"]);
  if (c.includes("lawyer") || c.includes("legal")) return pick(["shield","star","clock"]);
  if (c.includes("restaurant")) return pick(["heart","star","clock","coffee"]);
  if (c.includes("spa")) return pick(["heart","droplet","star","smile"]);
  return pick(["star","shield","heart","zap","clock"]);
}

// ──── GOOGLE FONTS PER ARCHETYPE ────
const GOOGLE_FONTS: Record<Arch, string> = {
  brutalist:  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Inter:wght@400;500;600&display=swap",
  softLuxury: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600&display=swap",
  editorial:  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500&display=swap",
  modernTech: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  warmLocal:  "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap",
  boldMinimal:"https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Inter:wght@400;500&display=swap",
  photoFirst: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@400;500&display=swap",
  retro:      "https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap",
};

// ──── CSS RESET + VARIABLES ────
function cssBase(arch: Arch, P: Record<string,string>, N: Record<string,string>, cfg: typeof CFG[Arch]): string {
  const sp = cfg.sp==="tight" ? {xs:"0.25rem",sm:"0.5rem",md:"1rem",lg:"1.5rem",xl:"2.5rem",xxl:"4rem"} :
             cfg.sp==="airy"   ? {xs:"0.5rem",sm:"1rem",md:"2rem",lg:"3rem",xl:"5rem",xxl:"8rem"} :
                                  {xs:"0.5rem",sm:"0.75rem",md:"1.25rem",lg:"2rem",xl:"3.5rem",xxl:"6rem"};
  return `/* ${cfg.name} Design System */
@import url('${GOOGLE_FONTS[arch]}');
:root{--brand-50:${P[50]};--brand-100:${P[100]};--brand-200:${P[200]};--brand-300:${P[300]};--brand-400:${P[400]};--brand-500:${P[500]};--brand-600:${P[600]};--brand-700:${P[700]};--brand-800:${P[800]};--bg:${N[0]};--bg-alt:${N[50]};--surface:${N[0]};--text:${N[800]};--text-secondary:${N[500]};--border:${N[200]};--font-h:${cfg.fontH};--font-b:${cfg.fontB};--r:${cfg.r};--s-xs:${sp.xs};--s-sm:${sp.sm};--s-md:${sp.md};--s-lg:${sp.lg};--s-xl:${sp.xl};--s-xxl:${sp.xxl}}
*,*::before,*::after{box-sizing:border-box;margin:0}html{font-size:16px;-webkit-font-smoothing:antialiased}body{font-family:var(--font-b);color:var(--text);background:var(--bg);line-height:1.65}img{max-width:100%;display:block;height:auto}a{color:inherit;text-decoration:none}
.container{max-width:1200px;margin:0 auto;padding:0 clamp(1.25rem,5vw,2.5rem)}
.reveal{opacity:0;transform:translateY(24px);animation:rev .7s cubic-bezier(0.16,1,0.3,1) forwards}.reveal-d1{animation-delay:.1s}.reveal-d2{animation-delay:.2s}.reveal-d3{animation-delay:.3s}.reveal-d4{animation-delay:.4s}
@keyframes rev{to{opacity:1;transform:translateY(0)}}@media(prefers-reduced-motion:reduce){.reveal{animation:none;opacity:1;transform:none}}`;
}

function wrapHtml(title: string, desc: string, css: string, body: string, _arch: Arch): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${title}</title><meta name="description" content="${desc.slice(0,155)}"><link rel="preconnect" href="https://images.unsplash.com"><style>${css}</style></head><body>${body}
<script>const io=new IntersectionObserver(e=>{e.forEach(n=>{if(n.isIntersecting){n.target.style.animationPlayState="running";io.unobserve(n.target)}})},{threshold:0.1});document.querySelectorAll(".reveal").forEach(el=>io.observe(el));</script></body></html>`;
}

function genReadme(b: {name:string;category:string;city:string}): string {
  return `# ${b.name} Website

Professional website for ${b.name}, a ${b.category} in ${b.city}.

## Files

- **index.html** — Main page (edit text, images, contact info)
- **css/style.css** — All styles (edit colors, fonts, spacing)

## Quick Customization

### Change Brand Colors
Open **css/style.css** and edit the ":root" section:

\`\`\`css
:root {
  --brand-500: #your-color;  /* Main accent */
  --brand-600: #your-dark;   /* Hover state */
}
\`\`\`

### Change Photos
Replace the Unsplash image URLs in **index.html** with your own.

### Update Contact Info
Search for phone, address, and hours in **index.html**.

### Add/Remove Services
Find the "Services" section in index.html. Copy/paste service blocks.

## Hosting

This is a static website — it works on any host:

- **Netlify**: Drag folder into [Netlify Drop](https://app.netlify.com/drop)
- **Vercel**: Run \`vercel --prod\` in this folder
- **Traditional**: Upload files via FTP

## Support

Need changes? Contact your web developer.
`;
}

// ═══════════════════════════════════════════════════════════════
//  ARCHETYPE 1 — BRUTALIST: Raw, dark, massive type, numbered rows
// ═══════════════════════════════════════════════════════════════
function buildBrutalist(b: any, copy: any, P: Record<string,string>, N: Record<string,string>, cfg: typeof CFG["brutalist"]) {
  const css = cssBase("brutalist",P,N,cfg) + `
.b-body{background:#0a0a0a;color:#e5e5e5;font-family:var(--font-b)}
.b-nav{display:flex;justify-content:space-between;align-items:center;padding:1.5rem 2rem;border-bottom:1px solid #222;font-family:var(--font-h);font-weight:700;font-size:1.25rem;text-transform:uppercase;letter-spacing:0.05em}
.b-hero{padding:6rem 2rem 4rem;border-bottom:1px solid #222}
.b-hero h1{font-family:var(--font-h);font-size:clamp(3rem,8vw,6rem);line-height:1;text-transform:uppercase;letter-spacing:-0.03em;font-weight:700;color:#fff;max-width:900px}
.b-hero p{font-size:1.125rem;color:#888;margin-top:1.5rem;max-width:500px;line-height:1.7}
.b-hero .tag{display:inline-block;padding:0.375rem 1rem;border:1px solid #333;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.15em;color:#666;margin-bottom:1.5rem}
.b-cta{display:inline-flex;align-items:center;gap:0.75rem;padding:1rem 2rem;background:#fff;color:#0a0a0a;font-family:var(--font-h);font-weight:700;text-transform:uppercase;letter-spacing:0.05em;font-size:0.875rem;margin-top:2.5rem;transition:all .2s}
.b-cta:hover{background:var(--brand-400);color:#fff}
.b-section{padding:4rem 2rem;border-bottom:1px solid #222}
.b-section h2{font-family:var(--font-h);font-size:clamp(1.75rem,4vw,2.75rem);text-transform:uppercase;letter-spacing:-0.02em;margin-bottom:2rem;color:#fff}
.b-about{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:start}
.b-about p{color:#999;line-height:1.8;font-size:1.0625rem}
.b-about .quote{margin-top:2rem;padding:1.5rem;border-left:3px solid var(--brand-500);color:#ccc;font-style:italic}
.b-svc-item{display:flex;align-items:baseline;gap:1.5rem;padding:1.25rem 0;border-bottom:1px solid #222;transition:all .2s}
.b-svc-item:hover{padding-left:1rem;border-left:3px solid var(--brand-500)}
.b-svc-num{font-family:var(--font-h);font-size:1.5rem;font-weight:700;color:var(--brand-400);min-width:2rem}
.b-svc-name{font-family:var(--font-h);font-size:1.125rem;text-transform:uppercase;letter-spacing:0.02em;color:#fff}
.b-contact{padding:5rem 2rem;text-align:center}
.b-contact h2{font-family:var(--font-h);font-size:clamp(2rem,5vw,3.5rem);text-transform:uppercase;color:#fff;margin-bottom:1rem}
.b-contact p{color:#888;margin-bottom:2rem}
.b-contact-grid{display:flex;justify-content:center;gap:3rem;margin-bottom:2rem;flex-wrap:wrap}
.b-contact-item{display:flex;align-items:center;gap:0.75rem;color:#aaa;font-size:1rem}
.b-footer{padding:2rem;text-align:center;font-size:0.75rem;color:#555;border-top:1px solid #222;text-transform:uppercase;letter-spacing:0.1em}
@media(max-width:768px){.b-about{grid-template-columns:1fr}.b-contact-grid{flex-direction:column;gap:1rem}}
`;

  const imgHero = unsplash(b.category, "hero");
  const svcs = copy.services.map((s: string, i: number) =>
    `  <div class="b-svc-item reveal reveal-d${Math.min(i+1,4)}"><span class="b-svc-num">${String(i+1).padStart(2,'0')}</span><span class="b-svc-name">${s}</span></div>`
  ).join("\n");

  const body = `
<nav class="b-nav"><div>${b.name}</div><div style="font-size:0.8125rem;color:#666">${b.city}</div></nav>
<section class="b-hero"><div class="tag">${b.category} &middot; ${b.city}</div><h1 class="reveal">${copy.headline}</h1><p class="reveal-d1">${copy.subheadline}</p><a href="#contact" class="b-cta reveal-d2">${copy.cta} ${SVGS.arrow}</a></section>
<section class="b-section"><div class="container"><h2 class="reveal">About</h2><div class="b-about"><div class="reveal"><img src="${imgHero}" alt="${b.name}" style="width:100%;aspect-ratio:4/3;object-fit:cover;filter:grayscale(40%)"></div><div class="reveal-d1"><p>${copy.story}</p>${copy.values ? `<div class="quote">${copy.values}</div>` : ""}</div></div></div></section>
<section class="b-section"><div class="container"><h2 class="reveal">Services</h2>${svcs}</div></section>
<section id="contact" class="b-contact"><h2 class="reveal">${copy.contactCta}</h2><p class="reveal-d1">Reach out and let's talk.</p><div class="b-contact-grid reveal-d2">${b.phone ? `<div class="b-contact-item">${SVGS.phone} ${b.phone}</div>` : ""}<div class="b-contact-item">${SVGS.map} ${b.address || b.city}</div></div><a href="${b.phone ? 'tel:'+b.phone : '#'}" class="b-cta reveal-d3">Call Now</a></section>
<footer class="b-footer">&copy; ${new Date().getFullYear()} ${b.name} &mdash; ${b.city}</footer>`;

  return { html: wrapHtml(`${b.name} — ${b.category}`, copy.subheadline, css, body, "brutalist"), css, readme: genReadme(b) };
}

// ═══════════════════════════════════════════════════════════════
//  ARCHETYPE 2 — SOFT LUXURY: Asymmetric, editorial, polaroid images
// ═══════════════════════════════════════════════════════════════
function buildSoftLuxury(b: any, copy: any, P: Record<string,string>, N: Record<string,string>, cfg: typeof CFG["softLuxury"]) {
  const css = cssBase("softLuxury",P,N,cfg) + `
.sl-body{background:${N[50]};color:${N[800]};font-family:var(--font-b)}
.sl-nav{display:flex;justify-content:space-between;align-items:center;padding:1.5rem 2rem}
.sl-brand{font-family:var(--font-h);font-size:1.5rem;font-weight:500;color:${N[800]};font-style:italic}
.sl-hero{display:grid;grid-template-columns:55% 45%;min-height:85vh;align-items:center}
.sl-hero-text{padding:4rem 3rem 4rem 2rem}
.sl-hero-text h1{font-family:var(--font-h);font-size:clamp(2.5rem,5vw,4.5rem);line-height:1.1;font-weight:500;color:${N[900]};letter-spacing:-0.02em}
.sl-hero-text p{font-size:1.125rem;color:${N[500]};margin-top:1.5rem;line-height:1.8;max-width:420px}
.sl-hero-img{height:100%}
.sl-hero-img img{width:100%;height:100%;object-fit:cover;border-radius:var(--r) 0 0 var(--r)}
.sl-btn{display:inline-flex;align-items:center;gap:0.5rem;padding:1rem 2.25rem;background:${P[500]};color:#fff;border-radius:var(--r);font-weight:500;margin-top:2rem;transition:all .3s}
.sl-btn:hover{transform:translateY(-2px);box-shadow:0 12px 32px ${P[500]}35}
.sl-section{padding:var(--s-xxl) 2rem}
.sl-section h2{font-family:var(--font-h);font-size:clamp(2rem,4vw,3rem);font-weight:500;color:${N[900]};margin-bottom:2rem}
.sl-about{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center}
.sl-about img{border-radius:var(--r);box-shadow:0 24px 64px ${N[900]}12}
.sl-about p{font-size:1.0625rem;color:${N[500]};line-height:1.9}
.sl-svc-item{display:flex;gap:1.5rem;padding:1.5rem 0;border-bottom:1px solid ${N[200]};align-items:flex-start}
.sl-svc-icon{width:44px;height:44px;border-radius:12px;background:${P[50]};color:${P[600]};display:flex;align-items:center;justify-content:center;flex-shrink:0}
.sl-svc-icon svg{width:20px;height:20px}
.sl-svc-item h4{font-family:var(--font-h);font-size:1.125rem;margin-bottom:0.25rem;color:${N[800]}}
.sl-svc-item p{font-size:0.9375rem;color:${N[500]};line-height:1.6}
.sl-polaroids{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;margin-top:3rem}
.sl-polaroid{background:#fff;padding:0.75rem 0.75rem 2rem;border-radius:var(--r);box-shadow:0 8px 24px ${N[900]}0a;transform:rotate(${Math.random()>0.5?'-':'+'}${(2+Math.random()*3).toFixed(1)}deg);transition:transform .3s}
.sl-polaroid:nth-child(2){transform:rotate(${(Math.random()>0.5?'-':'+')}${(2+Math.random()*3).toFixed(1)}deg);margin-top:-1rem}
.sl-polaroid:nth-child(3){transform:rotate(${Math.random()>0.5?'-':'+'}${(2+Math.random()*3).toFixed(1)}deg)}
.sl-polaroid:hover{transform:rotate(0deg) scale(1.02)}
.sl-polaroid img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:calc(var(--r) - 4px)}
.sl-contact{text-align:center;padding:var(--s-xxl) 2rem;background:${P[700]};color:#fff;border-radius:var(--r);margin:2rem}
.sl-contact h2{font-family:var(--font-h);font-size:clamp(2rem,4vw,3rem);margin-bottom:1rem}
.sl-contact p{color:${P[200]};margin-bottom:2rem}
.sl-footer{padding:2rem;text-align:center;font-size:0.8125rem;color:${N[400]}}
@media(max-width:768px){.sl-hero{grid-template-columns:1fr}.sl-hero-img{height:50vh}.sl-about{grid-template-columns:1fr}.sl-polaroids{grid-template-columns:1fr}}
`;

  const imgHero = unsplash(b.category, "hero");
  const imgSide = unsplash(b.category, "side");
  const imgGal = unsplash(b.category, "gallery");
  const svcs = copy.services.slice(0,4).map((s: string, i: number) =>
    `  <div class="sl-svc-item reveal reveal-d${Math.min(i+1,4)}"><div class="sl-svc-icon">${iconFor(b.category,i)}</div><div><h4>${s}</h4><p>Professional ${s.toLowerCase()} with the care your deserve.</p></div></div>`
  ).join("\n");

  const body = `
<nav class="sl-nav"><div class="sl-brand">${b.name}</div><div style="font-size:0.875rem;color:${N[400]}">${b.category} &middot; ${b.city}</div></nav>
<section class="sl-hero"><div class="sl-hero-text"><h1 class="reveal">${copy.headline}</h1><p class="reveal-d1">${copy.subheadline}</p><a href="#contact" class="sl-btn reveal-d2">${copy.cta}</a></div><div class="sl-hero-img"><img src="${imgHero}" alt="${b.name}"></div></section>
<section class="sl-section"><div class="container"><div class="sl-about"><div class="reveal"><img src="${imgSide}" alt="About ${b.name}"></div><div class="reveal-d1"><h2>About ${b.name}</h2><p>${copy.story}</p>${copy.values ? `<p style="margin-top:1rem;font-style:italic;color:${P[600]}">${copy.values}</p>` : ""}</div></div><div class="sl-polaroids"><div class="sl-polaroid reveal"><img src="${imgHero}" alt="Gallery 1"></div><div class="sl-polaroid reveal-d1"><img src="${imgSide}" alt="Gallery 2"></div><div class="sl-polaroid reveal-d2"><img src="${imgGal}" alt="Gallery 3"></div></div></div></section>
<section class="sl-section"><div class="container"><h2 class="reveal">Our Services</h2>${svcs}</div></section>
<section id="contact" class="sl-contact"><h2 class="reveal">${copy.contactCta}</h2><p class="reveal-d1">We'd love to hear from you.</p><a href="${b.phone ? 'tel:'+b.phone : '#'}" class="sl-btn reveal-d2" style="background:#fff;color:${P[700]}">${b.phone || "Get in Touch"}</a></section>
<footer class="sl-footer">&copy; ${new Date().getFullYear()} ${b.name}</footer>`;

  return { html: wrapHtml(`${b.name} — ${b.category}`, copy.subheadline, css, body, "softLuxury"), css, readme: genReadme(b) };
}

// ═══════════════════════════════════════════════════════════════
//  ARCHETYPE 3 — EDITORIAL: Magazine layout, 3-column text
// ═══════════════════════════════════════════════════════════════
function buildEditorial(b: any, copy: any, P: Record<string,string>, N: Record<string,string>, cfg: typeof CFG["editorial"]) {
  const css = cssBase("editorial",P,N,cfg) + `
.ed-body{background:${N[0]};color:${N[800]};font-family:var(--font-b)}
.ed-nav{display:flex;justify-content:space-between;align-items:center;padding:1.25rem 2rem;border-bottom:2px solid ${N[900]}}
.ed-nav-brand{font-family:var(--font-h);font-size:1.375rem;font-weight:600}
.ed-nav-tag{font-size:0.75rem;text-transform:uppercase;letter-spacing:0.15em;color:${N[400]}}
.ed-hero{position:relative;height:80vh;display:flex;align-items:flex-end;overflow:hidden}
.ed-hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.ed-hero-overlay{position:absolute;inset:0;background:linear-gradient(to top,${N[900]}f0 0%,${N[900]}80 40%,transparent 100%)}
.ed-hero-text{position:relative;z-index:2;padding:3rem 2rem;max-width:800px}
.ed-hero-text h1{font-family:var(--font-h);font-size:clamp(2.5rem,5vw,4rem);color:#fff;line-height:1.15;font-weight:600}
.ed-hero-text p{color:${N[300]};font-size:1.125rem;margin-top:1rem;line-height:1.7}
.ed-masthead{display:flex;justify-content:space-between;padding:1rem 2rem;font-size:0.6875rem;text-transform:uppercase;letter-spacing:0.15em;color:${N[400]};border-bottom:1px solid ${N[200]}}
.ed-section{padding:var(--s-xxl) 2rem}
.ed-section h2{font-family:var(--font-h);font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:600;margin-bottom:2rem;color:${N[900]}}
.ed-about-col{font-family:var(--font-b);font-size:1.0625rem;line-height:1.9;color:${N[500]};column-count:3;column-gap:2.5rem}
.ed-about-col p+p{margin-top:1.5rem}
.ed-quote{margin:var(--s-xl) 2rem;padding:var(--s-xl);border:3px solid ${N[900]};text-align:center}
.ed-quote p{font-family:var(--font-h);font-size:clamp(1.25rem,2.5vw,1.75rem);font-style:italic;color:${N[800]};line-height:1.5}
.ed-quote cite{display:block;margin-top:1rem;font-family:var(--font-b);font-size:0.875rem;color:${N[400]};font-style:normal;text-transform:uppercase;letter-spacing:0.1em}
.ed-svc-list{display:grid;grid-template-columns:repeat(2,1fr);gap:0}
.ed-svc-item{padding:1.5rem 2rem;border-bottom:1px solid ${N[200]};border-right:1px solid ${N[200]}}
.ed-svc-item:nth-child(2n){border-right:none}
.ed-svc-item h4{font-family:var(--font-h);font-size:1.125rem;margin-bottom:0.5rem;color:${N[800]}}
.ed-svc-item p{font-size:0.9375rem;color:${N[500]}}
.ed-footer{display:flex;justify-content:space-between;align-items:center;padding:2rem;border-top:2px solid ${N[900]};font-size:0.8125rem;color:${N[400]}}
@media(max-width:768px){.ed-about-col{column-count:1}.ed-svc-list{grid-template-columns:1fr}}
`;

  const imgHero = unsplash(b.category, "hero");
  const svcs = copy.services.slice(0,4).map((s: string, i: number) =>
    `  <div class="ed-svc-item reveal reveal-d${Math.min(i+1,4)}"><h4>${s}</h4><p>Delivered with the precision and care that keeps clients returning.</p></div>`
  ).join("\n");

  const body = `
<nav class="ed-nav"><div class="ed-nav-brand">${b.name}</div><div class="ed-nav-tag">${b.category} &middot; ${b.city}</div></nav>
<div class="ed-masthead"><span>Established ${b.city}</span><span>Volume I &middot; Issue 1</span><span>${new Date().getFullYear()}</span></div>
<section class="ed-hero"><img src="${imgHero}" alt="${b.name}"><div class="ed-hero-overlay"></div><div class="ed-hero-text"><h1 class="reveal">${copy.headline}</h1><p class="reveal-d1">${copy.subheadline}</p></div></section>
<section class="ed-section"><div class="container"><h2 class="reveal">The Story</h2><div class="ed-about-col reveal-d1"><p>${copy.story}</p>${copy.values ? `<p>${copy.values}</p>` : ""}</div></div></section>
<section class="ed-quote"><p class="reveal">"${copy.contactCta}"</p><cite class="reveal-d1">&mdash; ${b.name}, ${b.city}</cite></section>
<section class="ed-section"><div class="container"><h2 class="reveal">Services</h2><div class="ed-svc-list">${svcs}</div></div></section>
<footer class="ed-footer"><div>${b.name}</div><div>${b.phone || b.city} &middot; ${b.city}</div></footer>`;

  return { html: wrapHtml(`${b.name} — ${b.category}`, copy.subheadline, css, body, "editorial"), css, readme: genReadme(b) };
}

// ═══════════════════════════════════════════════════════════════
//  ARCHETYPE 4 — MODERN TECH: Dark gradient, geometric, icon grid
// ═══════════════════════════════════════════════════════════════
function buildModernTech(b: any, copy: any, P: Record<string,string>, N: Record<string,string>, cfg: typeof CFG["modernTech"]) {
  const css = cssBase("modernTech",P,N,cfg) + `
.mt-body{background:${N[50]};color:${N[800]};font-family:var(--font-b)}
.mt-nav{display:flex;justify-content:space-between;align-items:center;padding:1.25rem 2rem}
.mt-nav-brand{font-family:var(--font-h);font-size:1.25rem;font-weight:600;color:${N[900]}}
.mt-hero{background:linear-gradient(135deg,${N[900]} 0%,${P[800]} 100%);padding:6rem 2rem 5rem;text-align:center;position:relative;overflow:hidden}
.mt-hero::before{content:"";position:absolute;top:-50%;right:-20%;width:500px;height:500px;border-radius:50%;background:${P[500]}15;z-index:0}
.mt-hero::after{content:"";position:absolute;bottom:-30%;left:-10%;width:300px;height:300px;border-radius:50%;background:${P[400]}10;z-index:0}
.mt-hero h1{position:relative;z-index:1;font-family:var(--font-h);font-size:clamp(2.5rem,5vw,4rem);color:#fff;font-weight:600;line-height:1.15;max-width:700px;margin:0 auto}
.mt-hero p{position:relative;z-index:1;color:${P[200]};font-size:1.125rem;margin-top:1.5rem;max-width:500px;margin-left:auto;margin-right:auto;line-height:1.7}
.mt-btn{position:relative;z-index:1;display:inline-flex;align-items:center;gap:0.5rem;padding:1rem 2.25rem;background:${P[500]};color:#fff;border-radius:var(--r);font-weight:600;margin-top:2rem;transition:all .2s}
.mt-btn:hover{transform:translateY(-2px);box-shadow:0 12px 32px ${P[600]}40}
.mt-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:2rem;padding:2.5rem 2rem;background:${N[0]};border-bottom:1px solid ${N[200]}}
.mt-stat{text-align:center}
.mt-stat-num{font-family:var(--font-h);font-size:2rem;font-weight:600;color:${P[600]}}
.mt-stat-label{font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:${N[400]};margin-top:0.25rem}
.mt-section{padding:var(--s-xxl) 2rem}
.mt-section h2{font-family:var(--font-h);font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:600;text-align:center;margin-bottom:3rem;color:${N[900]}}
.mt-svc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem}
.mt-svc-card{background:${N[0]};border:1px solid ${N[200]};border-radius:var(--r);padding:2rem;text-align:center;transition:all .25s}
.mt-svc-card:hover{transform:translateY(-4px);box-shadow:0 16px 48px ${N[900]}10;border-color:${P[300]}}
.mt-svc-icon{width:56px;height:56px;border-radius:var(--r);background:${P[50]};color:${P[600]};display:flex;align-items:center;justify-content:center;margin:0 auto 1rem}
.mt-svc-icon svg{width:24px;height:24px}
.mt-svc-card h4{font-size:1.0625rem;font-weight:600;margin-bottom:0.5rem;color:${N[800]}}
.mt-svc-card p{font-size:0.875rem;color:${N[500]};line-height:1.6}
.mt-tess{background:${N[900]};padding:var(--s-xxl) 2rem;color:#fff}
.mt-tess-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem}
.mt-tess-card{background:${N[800]};padding:2rem;border-radius:var(--r);border:1px solid ${N[700]}}
.mt-tess-stars{color:${P[400]};margin-bottom:1rem;letter-spacing:0.15em}
.mt-tess-text{line-height:1.7;color:${N[300]};font-style:italic;margin-bottom:1rem}
.mt-tess-author{display:flex;align-items:center;gap:0.75rem}
.mt-tess-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,${P[400]},${P[600]});display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:0.8125rem}
.mt-contact{text-align:center;padding:var(--s-xxl) 2rem;background:${P[50]}}
.mt-footer{padding:2rem;text-align:center;font-size:0.8125rem;color:${N[400]}}
@media(max-width:768px){.mt-stats{grid-template-columns:repeat(2,1fr)}.mt-hero{padding:4rem 1.5rem}}
`;

  const reviews = Math.floor(50 + Math.random() * 200);
  const rating = (4 + Math.random()).toFixed(1);
  const years = Math.floor(3 + Math.random() * 12);
  const svcs = copy.services.slice(0,4).map((s: string, i: number) =>
    `  <div class="mt-svc-card reveal reveal-d${Math.min(i+1,4)}"><div class="mt-svc-icon">${iconFor(b.category,i)}</div><h4>${s}</h4><p>Expert ${s.toLowerCase()} tailored to your needs.</p></div>`
  ).join("\n");

  const body = `
<nav class="mt-nav"><div class="mt-nav-brand">${b.name}</div><div style="font-size:0.875rem;color:${N[400]}">${b.category}</div></nav>
<section class="mt-hero"><h1 class="reveal">${copy.headline}</h1><p class="reveal-d1">${copy.subheadline}</p><a href="#contact" class="mt-btn reveal-d2">${copy.cta}</a></section>
<section class="mt-stats"><div class="mt-stat reveal"><div class="mt-stat-num">${rating}</div><div class="mt-stat-label">Star Rating</div></div><div class="mt-stat reveal-d1"><div class="mt-stat-num">${reviews}+</div><div class="mt-stat-label">Reviews</div></div><div class="mt-stat reveal-d2"><div class="mt-stat-num">${years}</div><div class="mt-stat-label">Years</div></div><div class="mt-stat reveal-d3"><div class="mt-stat-num">100%</div><div class="mt-stat-label">Satisfaction</div></div></section>
<section class="mt-section"><div class="container"><h2 class="reveal">What We Do</h2><div class="mt-svc-grid">${svcs}</div></div></section>
<section class="mt-tess"><div class="container"><h2 style="text-align:center;font-family:var(--font-h);font-size:2rem;margin-bottom:2rem">What People Say</h2><div class="mt-tess-grid"><div class="mt-tess-card reveal"><div class="mt-tess-stars">${SVGS.star}${SVGS.star}${SVGS.star}${SVGS.star}${SVGS.star}</div><p class="mt-tess-text">"${b.name} completely exceeded my expectations. Highly recommend."</p><div class="mt-tess-author"><div class="mt-tess-avatar">JM</div><div><div style="font-weight:600;font-size:0.875rem">Jessica M.</div></div></div></div><div class="mt-tess-card reveal-d1"><div class="mt-tess-stars">${SVGS.star}${SVGS.star}${SVGS.star}${SVGS.star}${SVGS.star}</div><p class="mt-tess-text">"Best ${b.category} experience in ${b.city}. Wouldn't go anywhere else."</p><div class="mt-tess-author"><div class="mt-tess-avatar">SK</div><div><div style="font-weight:600;font-size:0.875rem">Sam K.</div></div></div></div></div></div></section>
<section id="contact" class="mt-contact"><h2 class="reveal" style="font-family:var(--font-h);font-size:2rem;margin-bottom:1rem">${copy.contactCta}</h2><p class="reveal-d1" style="color:${N[500]};margin-bottom:2rem">Reach out today.</p><a href="${b.phone ? 'tel:'+b.phone : '#'}" class="mt-btn reveal-d2">${b.phone || "Contact Us"}</a></section>
<footer class="mt-footer">&copy; ${new Date().getFullYear()} ${b.name}</footer>`;

  return { html: wrapHtml(`${b.name} — ${b.category}`, copy.subheadline, css, body, "modernTech"), css, readme: genReadme(b) };
}


// ═══════════════════════════════════════════════════════════════
//  ARCHETYPE 5 — WARM LOCAL: Photo hero, masonry, community feel
// ═══════════════════════════════════════════════════════════════
function buildWarmLocal(b: any, copy: any, P: Record<string,string>, N: Record<string,string>, cfg: typeof CFG["warmLocal"]) {
  const css = cssBase("warmLocal",P,N,cfg) + `
.wl-body{background:${N[0]};color:${N[800]};font-family:var(--font-b)}
.wl-nav{display:flex;justify-content:space-between;align-items:center;padding:1.25rem 2rem;background:${N[0]};position:sticky;top:0;z-index:50;border-bottom:1px solid ${N[200]}}
.wl-brand{font-family:var(--font-h);font-size:1.5rem;color:${N[900]}}
.wl-hero{position:relative;height:85vh;display:flex;align-items:center;justify-content:center;text-align:center;overflow:hidden}
.wl-hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.wl-hero-overlay{position:absolute;inset:0;background:linear-gradient(135deg,${N[900]}d0 0%,${P[900]}90 100%)}
.wl-hero-text{position:relative;z-index:2;max-width:600px;padding:2rem}
.wl-hero-text h1{font-family:var(--font-h);font-size:clamp(2.5rem,5vw,4rem);color:#fff;line-height:1.15}
.wl-hero-text p{color:${P[200]};font-size:1.125rem;margin-top:1rem;line-height:1.7}
.wl-btn{display:inline-flex;align-items:center;gap:0.5rem;padding:1rem 2.25rem;background:#fff;color:${P[700]};border-radius:var(--r);font-weight:600;margin-top:2rem;transition:all .2s}
.wl-btn:hover{transform:translateY(-2px);box-shadow:0 12px 32px ${N[900]}30}
.wl-section{padding:var(--s-xxl) 2rem}
.wl-section h2{font-family:var(--font-h);font-size:clamp(1.75rem,3.5vw,2.5rem);color:${N[900]};margin-bottom:2rem;text-align:center}
.wl-about{text-align:center;max-width:680px;margin:0 auto}
.wl-about p{font-size:1.125rem;color:${N[500]};line-height:1.9}
.wl-masonry{display:grid;grid-template-columns:1.2fr 0.8fr 1fr;gap:1rem;margin-top:3rem}
.wl-masonry img{width:100%;border-radius:var(--r);object-fit:cover}
.wl-masonry img:nth-child(1){aspect-ratio:4/3}
.wl-masonry img:nth-child(2){aspect-ratio:3/4;margin-top:2rem}
.wl-masonry img:nth-child(3){aspect-ratio:1}
.wl-svc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.5rem}
.wl-svc-card{background:${N[0]};border:1px solid ${N[200]};border-radius:var(--r);padding:2rem;text-align:center;transition:all .25s}
.wl-svc-card:hover{border-color:${P[400]};transform:translateY(-3px);box-shadow:0 12px 32px ${N[900]}08}
.wl-svc-card h4{font-family:var(--font-h);font-size:1.125rem;margin-bottom:0.5rem;color:${N[800]}}
.wl-svc-card p{font-size:0.9375rem;color:${N[500]}}
.wl-contact{text-align:center;padding:var(--s-xxl) 2rem;background:${P[600]};color:#fff;border-radius:var(--r);margin:2rem}
.wl-contact h2{font-family:var(--font-h);font-size:clamp(2rem,4vw,3rem);margin-bottom:1rem}
.wl-contact p{color:${P[200]};margin-bottom:2rem}
.wl-footer{padding:2rem;text-align:center;font-size:0.8125rem;color:${N[400]};border-top:1px solid ${N[200]}}
@media(max-width:768px){.wl-masonry{grid-template-columns:1fr}.wl-masonry img:nth-child(2){margin-top:0}}
`;

  const imgHero = unsplash(b.category, "hero");
  const imgSide = unsplash(b.category, "side");
  const imgGal = unsplash(b.category, "gallery");
  const svcs = copy.services.slice(0,4).map((s: string, i: number) =>
    `  <div class="wl-svc-card reveal reveal-d${Math.min(i+1,4)}"><h4>${s}</h4><p>Done right, every time.</p></div>`
  ).join("\n");

  const body = `
<nav class="wl-nav"><div class="wl-brand">${b.name}</div><div style="font-size:0.875rem;color:${N[400]}">${b.city}</div></nav>
<section class="wl-hero"><img src="${imgHero}" alt="${b.name}"><div class="wl-hero-overlay"></div><div class="wl-hero-text"><h1 class="reveal">${copy.headline}</h1><p class="reveal-d1">${copy.subheadline}</p><a href="#contact" class="wl-btn reveal-d2">${copy.cta}</a></div></section>
<section class="wl-section"><div class="container"><div class="wl-about reveal"><h2>About ${b.name}</h2><p>${copy.story}</p>${copy.values ? `<p style="margin-top:1rem;font-style:italic;color:${P[600]}">${copy.values}</p>` : ""}</div><div class="wl-masonry"><img src="${imgHero}" alt="1" class="reveal"><img src="${imgSide}" alt="2" class="reveal-d1"><img src="${imgGal}" alt="3" class="reveal-d2"></div></div></section>
<section class="wl-section"><div class="container"><h2 class="reveal">Our Services</h2><div class="wl-svc-grid">${svcs}</div></div></section>
<section id="contact" class="wl-contact"><h2 class="reveal">${copy.contactCta}</h2><p class="reveal-d1">Give us a call or stop by.</p><a href="${b.phone ? 'tel:'+b.phone : '#'}" class="wl-btn reveal-d2">${b.phone || "Get in Touch"}</a></section>
<footer class="wl-footer">&copy; ${new Date().getFullYear()} ${b.name} &middot; ${b.city}</footer>`;

  return { html: wrapHtml(`${b.name} — ${b.category}`, copy.subheadline, css, body, "warmLocal"), css, readme: genReadme(b) };
}

// ═══════════════════════════════════════════════════════════════
//  ARCHETYPE 6 — BOLD MINIMAL: Massive type, single CTA, sparse
// ═══════════════════════════════════════════════════════════════
function buildBoldMinimal(b: any, copy: any, P: Record<string,string>, N: Record<string,string>, cfg: typeof CFG["boldMinimal"]) {
  const css = cssBase("boldMinimal",P,N,cfg) + `
.bm-body{background:${N[900]};color:${N[100]};font-family:var(--font-b)}
.bm-nav{display:flex;justify-content:space-between;align-items:center;padding:1.5rem 2rem}
.bm-nav-brand{font-family:var(--font-h);font-size:1.125rem;font-weight:700;color:#fff;letter-spacing:-0.02em}
.bm-hero{min-height:85vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:4rem 2rem}
.bm-hero h1{font-family:var(--font-h);font-size:clamp(3.5rem,10vw,8rem);line-height:0.95;font-weight:700;color:#fff;letter-spacing:-0.04em;max-width:900px}
.bm-hero p{font-size:1.25rem;color:${N[400]};margin-top:2rem;max-width:480px;line-height:1.7}
.bm-cta{display:inline-flex;align-items:center;gap:0.75rem;padding:1.25rem 3rem;background:${P[500]};color:#fff;font-family:var(--font-h);font-weight:700;font-size:1rem;margin-top:3rem;transition:all .2s;letter-spacing:0.02em}
.bm-cta:hover{background:${P[400]};transform:translateY(-2px)}
.bm-section{padding:var(--s-xxl) 2rem}
.bm-section h2{font-family:var(--font-h);font-size:clamp(2rem,4vw,3rem);font-weight:700;color:#fff;margin-bottom:2rem}
.bm-stats{display:flex;justify-content:center;gap:5rem;padding:var(--s-xl) 2rem;border-top:1px solid ${N[700]};border-bottom:1px solid ${N[700]}}
.bm-stat{text-align:center}
.bm-stat-num{font-family:var(--font-h);font-size:3rem;font-weight:700;color:${P[400]};line-height:1}
.bm-stat-label{font-size:0.75rem;text-transform:uppercase;letter-spacing:0.15em;color:${N[500]};margin-top:0.5rem}
.bm-svc-list{max-width:600px;margin:0 auto}
.bm-svc-item{display:flex;justify-content:space-between;align-items:center;padding:1.5rem 0;border-bottom:1px solid ${N[700]};font-size:1.125rem}
.bm-svc-item span:first-child{font-family:var(--font-h);font-weight:700;color:#fff}
.bm-svc-item span:last-child{color:${N[500]};font-size:0.9375rem}
.bm-contact{text-align:center;padding:var(--s-xxl) 2rem}
.bm-contact h2{font-family:var(--font-h);font-size:clamp(2.5rem,6vw,4rem);font-weight:700;color:#fff}
.bm-contact p{color:${N[400]};margin:1.5rem 0 2rem;font-size:1.125rem}
.bm-footer{padding:2rem;text-align:center;font-size:0.75rem;color:${N[600]};text-transform:uppercase;letter-spacing:0.15em}
@media(max-width:768px){.bm-stats{flex-direction:column;gap:2rem}.bm-hero h1{font-size:2.75rem}}
`;

  const reviews = Math.floor(50 + Math.random() * 200);
  const rating = (4 + Math.random()).toFixed(1);
  const years = Math.floor(3 + Math.random() * 12);
  const svcs = copy.services.slice(0,4).map((s: string, i: number) =>
    `  <div class="bm-svc-item reveal"><span>${s}</span><span>0${i+1}</span></div>`
  ).join("\n");

  const body = `
<nav class="bm-nav"><div class="bm-nav-brand">${b.name}</div><div style="font-size:0.75rem;color:${N[500]};text-transform:uppercase;letter-spacing:0.1em">${b.city}</div></nav>
<section class="bm-hero"><h1 class="reveal">${copy.headline}</h1><p class="reveal-d1">${copy.subheadline}</p><a href="#contact" class="bm-cta reveal-d2">${copy.cta}</a></section>
<section class="bm-stats"><div class="bm-stat reveal"><div class="bm-stat-num">${rating}</div><div class="bm-stat-label">Rating</div></div><div class="bm-stat reveal-d1"><div class="bm-stat-num">${reviews}</div><div class="bm-stat-label">Reviews</div></div><div class="bm-stat reveal-d2"><div class="bm-stat-num">${years}</div><div class="bm-stat-label">Years</div></div></section>
<section class="bm-section"><div class="container"><h2 class="reveal">About</h2><p class="reveal-d1" style="color:${N[400]};font-size:1.125rem;line-height:1.9;max-width:600px">${copy.story}</p>${copy.values ? `<p class="reveal-d2" style="color:${P[400]};margin-top:1.5rem;font-style:italic;max-width:600px">${copy.values}</p>` : ""}</div></section>
<section class="bm-section"><div class="container"><h2 class="reveal">Services</h2><div class="bm-svc-list">${svcs}</div></div></section>
<section id="contact" class="bm-contact"><h2 class="reveal">${copy.contactCta}</h2><p class="reveal-d1">Ready when you are.</p><a href="${b.phone ? 'tel:'+b.phone : '#'}" class="bm-cta reveal-d2">${b.phone || "Contact"}</a></section>
<footer class="bm-footer">&copy; ${new Date().getFullYear()} ${b.name}</footer>`;

  return { html: wrapHtml(`${b.name} — ${b.category}`, copy.subheadline, css, body, "boldMinimal"), css, readme: genReadme(b) };
}

// ═══════════════════════════════════════════════════════════════
//  ARCHETYPE 7 — PHOTO FIRST: 100vh immersive, gallery grid
// ═══════════════════════════════════════════════════════════════
function buildPhotoFirst(b: any, copy: any, P: Record<string,string>, N: Record<string,string>, cfg: typeof CFG["photoFirst"]) {
  const css = cssBase("photoFirst",P,N,cfg) + `
.pf-body{background:${N[0]};color:${N[800]};font-family:var(--font-b)}
.pf-nav{position:absolute;top:0;left:0;right:0;z-index:10;display:flex;justify-content:space-between;align-items:center;padding:1.5rem 2rem}
.pf-nav-brand{font-family:var(--font-h);font-size:1.375rem;color:#fff;font-weight:500}
.pf-hero{position:relative;height:100vh;display:flex;align-items:flex-end;overflow:hidden}
.pf-hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.pf-hero-overlay{position:absolute;inset:0;background:linear-gradient(to top,${N[900]}e0 0%,transparent 60%)}
.pf-hero-text{position:relative;z-index:2;padding:3rem 2rem;max-width:700px}
.pf-hero-text h1{font-family:var(--font-h);font-size:clamp(2.5rem,5vw,4.5rem);color:#fff;line-height:1.1;font-weight:500}
.pf-hero-text p{color:${N[300]};font-size:1.125rem;margin-top:1rem;line-height:1.7}
.pf-btn{display:inline-flex;align-items:center;gap:0.5rem;padding:1rem 2.25rem;background:#fff;color:${N[900]};border-radius:var(--r);font-weight:600;margin-top:1.5rem;transition:all .2s}
.pf-btn:hover{background:${P[200]}}
.pf-section{padding:var(--s-xxl) 2rem}
.pf-section h2{font-family:var(--font-h);font-size:clamp(1.75rem,3.5vw,2.5rem);color:${N[900]};margin-bottom:2rem}
.pf-about{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center}
.pf-about p{font-size:1.0625rem;color:${N[500]};line-height:1.9}
.pf-gallery{display:grid;grid-template-columns:2fr 1fr 1fr;gap:0.75rem;margin-top:2rem}
.pf-gallery img{width:100%;height:100%;object-fit:cover;border-radius:var(--r)}
.pf-gallery img:first-child{grid-row:span 2}
.pf-svc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:2rem}
.pf-svc-item{padding:1.5rem 0;border-top:2px solid ${N[900]}}
.pf-svc-item h4{font-family:var(--font-h);font-size:1.125rem;margin-bottom:0.5rem}
.pf-svc-item p{font-size:0.9375rem;color:${N[500]}}
.pf-contact{position:relative;padding:var(--s-xxl) 2rem;text-align:center;color:#fff;overflow:hidden}
.pf-contact img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0}
.pf-contact-overlay{position:absolute;inset:0;background:${N[900]}c0;z-index:1}
.pf-contact-text{position:relative;z-index:2}
.pf-contact h2{font-family:var(--font-h);font-size:clamp(2rem,4vw,3rem);margin-bottom:1rem}
.pf-contact p{margin-bottom:2rem;color:${N[300]}}
.pf-footer{padding:2rem;text-align:center;font-size:0.8125rem;color:${N[400]}}
@media(max-width:768px){.pf-about{grid-template-columns:1fr}.pf-gallery{grid-template-columns:1fr 1fr}.pf-gallery img:first-child{grid-row:span 1}}
`;

  const imgHero = unsplash(b.category, "hero");
  const imgSide = unsplash(b.category, "side");
  const imgGal = unsplash(b.category, "gallery");
  const svcs = copy.services.slice(0,4).map((s: string, i: number) =>
    `  <div class="pf-svc-item reveal reveal-d${Math.min(i+1,4)}"><h4>${s}</h4><p>Professional ${s.toLowerCase()} services.</p></div>`
  ).join("\n");

  const body = `
<nav class="pf-nav"><div class="pf-nav-brand">${b.name}</div><div style="font-size:0.75rem;color:#fff;text-transform:uppercase;letter-spacing:0.15em">${b.category}</div></nav>
<section class="pf-hero"><img src="${imgHero}" alt="${b.name}"><div class="pf-hero-overlay"></div><div class="pf-hero-text"><h1 class="reveal">${copy.headline}</h1><p class="reveal-d1">${copy.subheadline}</p><a href="#contact" class="pf-btn reveal-d2">${copy.cta}</a></div></section>
<section class="pf-section"><div class="container"><div class="pf-about"><div class="reveal"><h2>About ${b.name}</h2><p>${copy.story}</p>${copy.values ? `<p style="margin-top:1rem;font-style:italic;color:${P[600]}">${copy.values}</p>` : ""}</div><div class="pf-gallery reveal-d1"><img src="${imgHero}" alt="1"><img src="${imgSide}" alt="2"><img src="${imgGal}" alt="3"></div></div></div></section>
<section class="pf-section"><div class="container"><h2 class="reveal">Services</h2><div class="pf-svc-grid">${svcs}</div></div></section>
<section id="contact" class="pf-contact"><img src="${imgSide}" alt=""><div class="pf-contact-overlay"></div><div class="pf-contact-text"><h2 class="reveal">${copy.contactCta}</h2><p class="reveal-d1">${b.phone ? b.phone : b.address || b.city}</p><a href="${b.phone ? 'tel:'+b.phone : '#'}" class="pf-btn reveal-d2">Book Now</a></div></section>
<footer class="pf-footer">&copy; ${new Date().getFullYear()} ${b.name} &middot; ${b.city}</footer>`;

  return { html: wrapHtml(`${b.name} — ${b.category}`, copy.subheadline, css, body, "photoFirst"), css, readme: genReadme(b) };
}

// ═══════════════════════════════════════════════════════════════
//  ARCHETYPE 8 — RETRO: Dashed borders, polaroid frames, vintage
// ═══════════════════════════════════════════════════════════════
function buildRetro(b: any, copy: any, P: Record<string,string>, N: Record<string,string>, cfg: typeof CFG["retro"]) {
  const css = cssBase("retro",P,N,cfg) + `
.rt-body{background:${N[50]};color:${N[800]};font-family:var(--font-b)}
.rt-border{border:2px dashed ${N[400]}}
.rt-nav{display:flex;justify-content:space-between;align-items:center;padding:1.25rem 2rem;border-bottom:2px dashed ${N[400]}}
.rt-nav-brand{font-family:var(--font-h);font-size:1.375rem;font-weight:600;color:${N[900]}}
.rt-hero{padding:5rem 2rem;text-align:center;border-bottom:2px dashed ${N[400]}}
.rt-hero h1{font-family:var(--font-h);font-size:clamp(2.5rem,6vw,4.5rem);color:${N[900]};line-height:1.1;margin-bottom:1.5rem}
.rt-hero p{font-size:1.125rem;color:${N[500]};max-width:500px;margin:0 auto;line-height:1.7}
.rt-btn{display:inline-flex;align-items:center;gap:0.5rem;padding:1rem 2.5rem;background:${P[600]};color:#fff;font-family:var(--font-h);font-size:1rem;margin-top:2rem;border:2px solid ${N[900]};box-shadow:4px 4px 0 ${N[900]};transition:all .15s}
.rt-btn:hover{transform:translate(2px,2px);box-shadow:2px 2px 0 ${N[900]}}
.rt-section{padding:var(--s-xxl) 2rem}
.rt-section h2{font-family:var(--font-h);font-size:clamp(1.75rem,3.5vw,2.5rem);color:${N[900]};margin-bottom:2rem;text-align:center}
.rt-polaroid{background:#fff;padding:0.75rem 0.75rem 2.5rem;border:2px solid ${N[900]};box-shadow:6px 6px 0 ${N[400]};max-width:320px;margin:0 auto;transform:rotate(-2deg)}
.rt-polaroid img{width:100%;aspect-ratio:1;object-fit:cover;border:1px solid ${N[200]}}
.rt-about{display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center;max-width:900px;margin:0 auto}
.rt-about p{font-size:1.0625rem;color:${N[500]};line-height:1.9;font-family:var(--font-b)}
.rt-ticket{background:#fff;border:2px solid ${N[900]};padding:1.5rem 2rem;margin-bottom:1rem;display:flex;justify-content:space-between;align-items:center;box-shadow:3px 3px 0 ${N[400]};transition:all .15s;position:relative;overflow:hidden}
.rt-ticket::before{content:"";position:absolute;left:-10px;top:50%;width:20px;height:20px;background:${N[50]};border-radius:50%;border:2px solid ${N[900]};transform:translateY(-50%)}
.rt-ticket::after{content:"";position:absolute;right:-10px;top:50%;width:20px;height:20px;background:${N[50]};border-radius:50%;border:2px solid ${N[900]};transform:translateY(-50%)}
.rt-ticket:hover{transform:translate(2px,2px);box-shadow:1px 1px 0 ${N[400]}}
.rt-ticket h4{font-family:var(--font-h);font-size:1.125rem}
.rt-ticket span{font-family:var(--font-h);font-size:0.875rem;color:${P[600]};font-weight:700}
.rt-contact{text-align:center;padding:var(--s-xxl) 2rem;background:${N[100]};border-top:2px dashed ${N[400]}}
.rt-contact h2{font-family:var(--font-h);font-size:clamp(2rem,4vw,3rem);color:${N[900]};margin-bottom:1rem}
.rt-contact p{color:${N[500]};margin-bottom:2rem}
.rt-footer{padding:2rem;text-align:center;font-size:0.8125rem;color:${N[400]};font-family:var(--font-h)}
@media(max-width:768px){.rt-about{grid-template-columns:1fr}}
`;

  const imgHero = unsplash(b.category, "hero");
  const svcs = copy.services.slice(0,4).map((s: string, i: number) =>
    `  <div class="rt-ticket reveal reveal-d${Math.min(i+1,4)}"><h4>${s}</h4><span>NO. ${String(i+1).padStart(3,'0')}</span></div>`
  ).join("\n");

  const body = `
<nav class="rt-nav"><div class="rt-nav-brand">${b.name}</div><div style="font-family:var(--font-h);font-size:0.875rem;color:${N[500]}">${b.city}</div></nav>
<section class="rt-hero"><h1 class="reveal">${copy.headline}</h1><p class="reveal-d1">${copy.subheadline}</p><a href="#contact" class="rt-btn reveal-d2">${copy.cta}</a></section>
<section class="rt-section"><div class="container"><div class="rt-about"><div class="reveal"><div class="rt-polaroid"><img src="${imgHero}" alt="${b.name}"></div></div><div class="reveal-d1"><h2 style="font-family:var(--font-h);font-size:2rem;margin-bottom:1rem">About ${b.name}</h2><p>${copy.story}</p>${copy.values ? `<p style="margin-top:1rem;font-style:italic">${copy.values}</p>` : ""}</div></div></div></section>
<section class="rt-section"><div class="container" style="max-width:700px"><h2 class="reveal">Services</h2>${svcs}</div></section>
<section id="contact" class="rt-contact"><h2 class="reveal">${copy.contactCta}</h2><p class="reveal-d1">${b.phone ? b.phone : "Stop by or give us a call"}</p><a href="${b.phone ? 'tel:'+b.phone : '#'}" class="rt-btn reveal-d2">${b.phone || "Contact"}</a></section>
<footer class="rt-footer">&copy; ${new Date().getFullYear()} ${b.name} &middot; ${b.city} &middot; EST. ${new Date().getFullYear()}</footer>`;

  return { html: wrapHtml(`${b.name} — ${b.category}`, copy.subheadline, css, body, "retro"), css, readme: genReadme(b) };
}

// ═══════════════════════════════════════════════════════════════
//  BUILDERS DISPATCH + EXPORT
// ═══════════════════════════════════════════════════════════════

export interface BuildInput {
  name: string; category: string; city: string;
  phone?: string; address?: string; email?: string;
  heroCopy: { headline: string; subheadline: string; cta: string };
  aboutCopy: { story: string; values?: string };
  servicesCopy: { intro?: string; services: string[] };
  contactCopy: { cta: string };
  forceArchetype?: Arch;
}

export interface BuildOutput {
  html: string;
  css: string;
  readme: string;
  archetype: Arch;
  archetypeName: string;
  primaryHue: number;
  antiSlopWarnings: string[];
}

const BUILDERS: Record<Arch, (b: any, copy: any, P: Record<string,string>, N: Record<string,string>, cfg: any) => { html: string; css: string; readme: string }> = {
  brutalist: buildBrutalist,
  softLuxury: buildSoftLuxury,
  editorial: buildEditorial,
  modernTech: buildModernTech,
  warmLocal: buildWarmLocal,
  boldMinimal: buildBoldMinimal,
  photoFirst: buildPhotoFirst,
  retro: buildRetro,
};

export function buildPage(input: BuildInput): BuildOutput {
  const arch = input.forceArchetype || pickArch(input.category);
  const cfg = CFG[arch];
  const hue = cfg.hue[0] + Math.random() * (cfg.hue[1] - cfg.hue[0]);
  const P = prim(hue);
  const N = neut(hue);

  const b = { name: input.name, category: input.category, city: input.city, phone: input.phone, address: input.address, email: input.email };
  const copy = { headline: input.heroCopy.headline, subheadline: input.heroCopy.subheadline, cta: input.heroCopy.cta, story: input.aboutCopy.story, values: input.aboutCopy.values, services: input.servicesCopy.services, contactCta: input.contactCopy.cta };

  const result = BUILDERS[arch](b, copy, P, N, cfg);

  const warnings: string[] = [];
  const c = input.category.toLowerCase();
  if ((c.includes("tech") || c.includes("software")) && hue > 230 && hue < 270) warnings.push("Avoid default blue for tech");
  if (c.includes("cafe") && hue > 30 && hue < 60) warnings.push("Avoid default warm orange for cafe");

  return { ...result, archetype: arch, archetypeName: cfg.name, primaryHue: hue, antiSlopWarnings: warnings };
}
