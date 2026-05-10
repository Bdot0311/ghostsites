// impeccableDesign.ts v5 — Complete, full-section websites
// Each archetype: 8-10+ sections, rich visuals, Framer-quality layouts

const UNSPLASH: Record<string, { h1: string; h2: string; h3: string; a1: string; a2: string }> = {
  salon:     { h1: "1560066984-138dadb4c035", h2: "1522337360788-8b13dee7a37e", h3: "1521590832167-7bcbfaa6381f", a1: "1599351431202-1e0f0137899a", a2: "1562322140-ec1ac272ff6e" },
  cafe:      { h1: "1501339847302-ac426a4a7cbb", h2: "1495474472287-4d71bcdd2085", h3: "1442512595331-e8eacc5bf52e", a1: "1509042239860-f550be71085f", a2: "1493857671503-07f091b727eb" },
  restaurant:{ h1: "1517248135467-4c7edcad34c4", h2: "1414235077428-338989a2e8c0", h3: "1550966871-3ed3c47e2ce2", a1: "1517248135467-4c7edcad34c4", a2: "1552566624-6b570431e484" },
  gym:       { h1: "1534438327276-14e5300c3a48", h2: "1571019614242-c5c5dee9f50b", h3: "1540497077202-7c8a3999166f", a1: "1534438327276-14e5300c3a48", a2: "1581009145735-ea1bca36bc0c" },
  plumber:   { h1: "1585704032915-c3400ca199e7", h2: "1585704032915-c3400ca199e7", h3: "1584622650111-993a426709bf", a1: "1585704032915-c3400ca199e7", a2: "1504328345606-3bb8add33b9c" },
  dentist:   { h1: "1629909613654-28e377c37b09", h2: "1606811841689-23dfddce3e95", h3: "1588776814546-1ffcf47267a5", a1: "1629909613654-28e377c37b09", a2: "1609840113766-488865e3e9c7" },
  photogra:  { h1: "1554048612-b6a482bc67e5", h2: "1542038784456-1e8e935640e", h3: "1516035069371-29a1b244cc32", a1: "1493861643582-803a3fdd87bd", a2: "1554048612-b6a482bc67e5" },
  lawyer:    { h1: "1589829545856-d10d557cf95f", h2: "1450101499163-c8848c66ca85", h3: "1505664194779-8beaceb93744", a1: "1589829545856-d10d557cf95f", a2: "1450101499163-c8848c66ca85" },
  bakery:    { h1: "1556217477-d325251ece38", h2: "1509440159596-0249088772ff", h3: "1517433670267-08bbd4be890f", a1: "1556217477-d325251ece38", a2: "1509440159596-0249088772ff" },
  barber:    { h1: "1599351431202-1e0f0137899a", h2: "1621605815971-fbc98d665033", h3: "1503951914875-452162b0f77f", a1: "1599351431202-1e0f0137899a", a2: "1621605815971-fbc98d665033" },
  spa:       { h1: "1544161515-4ab6ce6db874", h2: "1600334129128-685c5582fd35", h3: "1540555700478-4be289fbec6d", a1: "1544161515-4ab6ce6db874", a2: "1600334129128-685c5582fd35" },
  default:   { h1: "1497366216548-37526070297c", h2: "1497366811353-6870744d04b2", h3: "1497366811353-6870744d04b2", a1: "1497366216548-37526070297c", a2: "1497366811353-6870744d04b2" },
};
function us(cat: string, type: "h1"|"h2"|"h3"|"a1"|"a2"): string {
  const c = cat.toLowerCase();
  for (const [k, v] of Object.entries(UNSPLASH)) if (c.includes(k)) return `https://images.unsplash.com/photo-${v[type]}?w=1400&q=80`;
  return `https://images.unsplash.com/photo-${UNSPLASH.default[type]}?w=1400&q=80`;
}

// ──── COLOR ────
function oklch(l: number, c: number, h: number) { return `oklch(${l}% ${c} ${h})`; }
function prim(h: number) { return { 50:oklch(97,0.02,h),100:oklch(93,0.04,h),200:oklch(86,0.08,h),300:oklch(76,0.12,h),400:oklch(65,0.18,h),500:oklch(55,0.22,h),600:oklch(45,0.20,h),700:oklch(35,0.16,h),800:oklch(25,0.10,h),900:oklch(15,0.05,h) }; }
function neut(h: number) { const c=0.008; return {0:oklch(100,c*0.5,h),50:oklch(98,c,h),100:oklch(95,c,h),200:oklch(88,c,h),300:oklch(75,c,h),400:oklch(62,c,h),500:oklch(50,c,h),600:oklch(38,c,h),700:oklch(28,c,h),800:oklch(18,c,h),900:oklch(12,c,h),950:oklch(8,c,h) }; }

export type Arch = "brutalist"|"softLuxury"|"editorial"|"modernTech"|"warmLocal"|"boldMinimal"|"photoFirst"|"retro";

const CFG: Record<Arch,{name:string;hue:[number,number];fH:string;fB:string;sp:string;r:string;w:number}> = {
  brutalist:   {name:"Brutalist",   hue:[0,360],    fH:"'Space Grotesk',system-ui,sans-serif",fB:"'Inter',system-ui,sans-serif",       sp:"tight", r:"0px", w:700},
  softLuxury:  {name:"Soft Luxury", hue:[300,340],  fH:"'Playfair Display',Georgia,serif",  fB:"'Inter','Helvetica Neue',sans-serif",sp:"airy",  r:"16px",w:500},
  editorial:   {name:"Editorial",   hue:[20,45],    fH:"'Playfair Display',Georgia,serif",  fB:"'Source Serif 4',Georgia,serif",     sp:"normal",r:"0px", w:600},
  modernTech:  {name:"Modern Tech", hue:[230,270],  fH:"'Inter',system-ui,sans-serif",      fB:"'Inter',system-ui,sans-serif",       sp:"normal",r:"12px",w:600},
  warmLocal:   {name:"Warm Local",  hue:[30,60],    fH:"'DM Serif Display',Georgia,serif",  fB:"'Inter',sans-serif",                 sp:"normal",r:"8px", w:500},
  boldMinimal: {name:"Bold Minimal",hue:[0,360],    fH:"'Space Grotesk',system-ui,sans-serif",fB:"'Inter',system-ui,sans-serif",     sp:"airy",  r:"0px", w:700},
  photoFirst:  {name:"Photo-First", hue:[160,200],  fH:"'Playfair Display',Georgia,serif",  fB:"'Inter',sans-serif",                 sp:"normal",r:"8px", w:500},
  retro:       {name:"Retro",       hue:[15,45],    fH:"'Courier Prime',monospace",         fB:"'Georgia',serif",                    sp:"normal",r:"4px", w:600},
};

const GF: Record<Arch,string> = {
  brutalist:   "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Inter:wght@400;500;600&display=swap",
  softLuxury:  "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600&display=swap",
  editorial:   "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500&display=swap",
  modernTech:  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  warmLocal:   "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap",
  boldMinimal: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Inter:wght@400;500&display=swap",
  photoFirst:  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@400;500&display=swap",
  retro:       "https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap",
};

function pickArch(c: string): Arch {
  const cat = c.toLowerCase();
  const m: [string[],Arch][] = [
    [["contractor","auto","mechanic","construction","plumber","roofer","electrician","hvac","landscaping"],"brutalist"],
    [["salon","spa","wedding","esthetician","nail","beauty","lash","brow"],"softLuxury"],
    [["lawyer","accountant","consulting","architect","financial","attorney","advisor"],"editorial"],
    [["tech","software","marketing","agency","design","web","app","digital"],"modernTech"],
    [["cafe","bakery","restaurant","coffee","catering","food","kitchen","brew"],"warmLocal"],
    [["gym","fitness","trainer","martial","crossfit","yoga","pilates","boxing"],"boldMinimal"],
    [["photographer","realtor","venue","interior","studio","florist","event"],"photoFirst"],
    [["diner","barber","vintage","record","antique","thrift","tattoo"],"retro"],
  ];
  for (const [t,a] of m) if (t.some(x => cat.includes(x))) return a;
  const f: Arch[] = ["warmLocal","editorial","boldMinimal","softLuxury"];
  return f[Math.floor(Math.random()*f.length)];
}

// ──── SVG ICONS ────
const SVG = {
  phone:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.95.37 1.89.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.92.33 1.86.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  map:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  clock:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  star:`<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  arrow:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  scissors:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>`,
  coffee:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
  wrench:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  heart:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  zap:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  camera:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  smile:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
  shield:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  droplet:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
  users:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  award:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
  check:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
};

function ico(cat: string, i: number): string {
  const c = cat.toLowerCase();
  const p = (a: string[]) => SVG[a[i % a.length] as keyof typeof SVG] || SVG.star;
  if (c.includes("salon") || c.includes("barber")) return p(["scissors","heart","star","smile","droplet","zap"]);
  if (c.includes("cafe") || c.includes("coffee") || c.includes("bakery")) return p(["coffee","heart","clock","star","zap","droplet"]);
  if (c.includes("gym") || c.includes("fitness")) return p(["zap","heart","shield","star","clock","award"]);
  if (c.includes("plumber") || c.includes("hvac") || c.includes("contractor")) return p(["wrench","droplet","shield","clock","zap","star"]);
  if (c.includes("dentist")) return p(["smile","shield","heart","star","clock","award"]);
  if (c.includes("photo")) return p(["camera","star","heart","zap","award"]);
  if (c.includes("lawyer") || c.includes("legal")) return p(["shield","award","star","clock","users"]);
  if (c.includes("restaurant")) return p(["heart","star","clock","coffee","award","users"]);
  if (c.includes("spa")) return p(["heart","droplet","star","smile","shield","zap"]);
  return p(["star","shield","heart","award","clock","zap"]);
}

function cssVars(arch: Arch, P: Record<string,string>, N: Record<string,string>, cfg: typeof CFG[Arch]): string {
  const sp = cfg.sp==="tight"?{xs:"0.25rem",sm:"0.5rem",md:"1rem",lg:"1.5rem",xl:"2.5rem",xxl:"4rem"}:
             cfg.sp==="airy"?{xs:"0.5rem",sm:"1rem",md:"2rem",lg:"3rem",xl:"5rem",xxl:"8rem"}:
             {xs:"0.5rem",sm:"0.75rem",md:"1.25rem",lg:"2rem",xl:"3.5rem",xxl:"6rem"};
  return `@import url('${GF[arch]}');
:root{--b50:${P[50]};--b100:${P[100]};--b200:${P[200]};--b300:${P[300]};--b400:${P[400]};--b500:${P[500]};--b600:${P[600]};--b700:${P[700]};--b800:${P[800]};--bg:${N[0]};--bg2:${N[50]};--txt:${N[800]};--txt2:${N[500]};--bdr:${N[200]};--n900:${N[900]};--n800:${N[800]};--n700:${N[700]};--n600:${N[600]};--n500:${N[500]};--n400:${N[400]};--n300:${N[300]};--n200:${N[200]};--n100:${N[100]};--n50:${N[50]};--fH:${cfg.fH};--fB:${cfg.fB};--r:${cfg.r};--sxs:${sp.xs};--ssm:${sp.sm};--smd:${sp.md};--slg:${sp.lg};--sxl:${sp.xl};--sxxl:${sp.xxl}}
*,*::before,*::after{box-sizing:border-box;margin:0}html{-webkit-font-smoothing:antialiased}img{max-width:100%;display:block;height:auto}a{color:inherit;text-decoration:none}
.reveal{opacity:0;transform:translateY(24px);animation:rev .7s cubic-bezier(0.16,1,0.3,1) forwards}.reveal-d1{animation-delay:.1s}.reveal-d2{animation-delay:.2s}.reveal-d3{animation-delay:.3s}.reveal-d4{animation-delay:.4s}@keyframes rev{to{opacity:1;transform:translateY(0)}}@media(prefers-reduced-motion:reduce){.reveal{animation:none;opacity:1;transform:none}}`;
}

function wrap(title: string, desc: string, css: string, body: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${title}</title><meta name="description" content="${desc.slice(0,155)}"><link rel="preconnect" href="https://images.unsplash.com"><style>${css}</style></head><body>${body}
<script>const io=new IntersectionObserver(e=>{e.forEach(n=>{if(n.isIntersecting){n.target.style.animationPlayState="running";io.unobserve(n.target)}})},{threshold:0.1});document.querySelectorAll(".reveal").forEach(el=>io.observe(el));</script></body></html>`;
}

function rd(b: {name:string;category:string;city:string}) {
  return `# ${b.name} Website
Professional website for ${b.name}, a ${b.category} in ${b.city}.

## Files
- **index.html** — Main page
- **css/style.css** — All styles

## Quick Changes
- **Colors**: Edit the ":root" CSS variables
- **Photos**: Replace Unsplash URLs in index.html
- **Contact**: Update phone/address/hours in the Contact section
- **Services**: Add/remove service blocks

## Hosting
Drag folder to [Netlify Drop](https://app.netlify.com/drop) or upload via FTP.
`;
}

// ═══════════════════════════════════════════════════════════════
// 1. BRUTALIST — Dark, raw, massive type, numbered rows
// ═══════════════════════════════════════════════════════════════
function bBrutalist(b: any, C: any, P: Record<string,string>, N: Record<string,string>) {
  const css = cssVars("brutalist",P,N,CFG.brutalist) + `
*{font-family:var(--fB)}.fH{font-family:var(--fH)}
body{background:#0a0a0a;color:#e5e5e5;line-height:1.65}
.container{max-width:1160px;margin:0 auto;padding:0 clamp(1.25rem,5vw,2.5rem)}
.nav{display:flex;justify-content:space-between;align-items:center;padding:1.5rem 0;border-bottom:1px solid #222}
.nav .logo{font-family:var(--fH);font-size:1.25rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#fff}
.nav .tag{font-size:0.75rem;color:#666;text-transform:uppercase;letter-spacing:0.15em}
.hero{padding:7rem 0 5rem;border-bottom:1px solid #222}
.hero .cat{display:inline-block;padding:0.375rem 1rem;border:1px solid #333;font-size:0.6875rem;text-transform:uppercase;letter-spacing:0.15em;color:#666;margin-bottom:2rem}
.hero h1{font-family:var(--fH);font-size:clamp(3.2rem,8vw,6.5rem);line-height:0.95;text-transform:uppercase;letter-spacing:-0.03em;font-weight:700;color:#fff;max-width:900px}
.hero p{font-size:1.125rem;color:#888;margin-top:2rem;max-width:520px;line-height:1.7}
.btn{display:inline-flex;align-items:center;gap:0.75rem;padding:1.125rem 2.5rem;background:#fff;color:#0a0a0a;font-family:var(--fH);font-weight:700;text-transform:uppercase;letter-spacing:0.05em;font-size:0.875rem;margin-top:2.5rem;transition:all .2s}
.btn:hover{background:var(--b400);color:#fff}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:2rem;padding:3rem 0;border-bottom:1px solid #222;text-align:center}
.stat-n{font-family:var(--fH);font-size:2.25rem;font-weight:700;color:var(--b400)}
.stat-l{font-size:0.6875rem;text-transform:uppercase;letter-spacing:0.15em;color:#555;margin-top:0.25rem}
.section{padding:var(--sxxl) 0;border-bottom:1px solid #222}
.section h2{font-family:var(--fH);font-size:clamp(1.75rem,4vw,2.75rem);text-transform:uppercase;letter-spacing:-0.02em;color:#fff;margin-bottom:2.5rem}
.about-grid{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:start}
.about-grid img{width:100%;aspect-ratio:4/3;object-fit:cover;filter:grayscale(35%)}.about-grid p{color:#999;line-height:1.9;font-size:1.0625rem}
.quote{margin-top:2rem;padding:1.5rem;border-left:3px solid var(--b500);color:#ccc;font-style:italic;font-size:1.0625rem}
.svc-item{display:flex;align-items:baseline;gap:1.5rem;padding:1.5rem 0;border-bottom:1px solid #222;transition:all .2s}
.svc-item:hover{padding-left:1rem;border-left:3px solid var(--b500)}
.svc-n{font-family:var(--fH);font-size:1.5rem;font-weight:700;color:var(--b400);min-width:2.5rem}
.svc-t{font-family:var(--fH);font-size:1.125rem;text-transform:uppercase;letter-spacing:0.02em;color:#fff}
.tess-section{background:#111;padding:var(--sxxl) 0}
.tess-section h2{font-family:var(--fH);font-size:clamp(1.75rem,4vw,2.5rem);text-transform:uppercase;color:#fff;margin-bottom:2.5rem;text-align:center}
.tess-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}
.tess-card{background:#1a1a1a;padding:1.75rem;border:1px solid #222}
.tess-stars{color:var(--b400);margin-bottom:1rem;font-size:0.875rem;letter-spacing:0.15em}
.tess-text{line-height:1.8;color:#999;font-style:italic;margin-bottom:1.25rem}
.tess-auth{display:flex;align-items:center;gap:0.75rem}
.tess-av{width:36px;height:36px;border-radius:50%;background:var(--b600);display:flex;align-items:center;justify-content:center;color:#fff;font-family:var(--fH);font-weight:700;font-size:0.8125rem}
.tess-name{font-weight:600;color:#ddd;font-size:0.9375rem}.tess-role{font-size:0.75rem;color:#555}
.process{display:grid;grid-template-columns:repeat(4,1fr);gap:2rem}
.proc{position:relative;text-align:center}.proc:not(:last-child)::after{content:"";position:absolute;top:28px;right:-50%;width:100%;height:1px;background:#333}
.proc-n{width:56px;height:56px;border-radius:50%;background:var(--b600);color:#fff;font-family:var(--fH);font-size:1.25rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;position:relative;z-index:1}
.proc h4{color:#fff;font-size:1rem;margin-bottom:0.25rem}.proc p{color:#777;font-size:0.875rem}
.cta-section{text-align:center;padding:var(--sxl) 0;border-top:1px solid #222;border-bottom:1px solid #222}
.cta-section h3{font-family:var(--fH);font-size:clamp(1.5rem,3vw,2.25rem);text-transform:uppercase;color:#fff;margin-bottom:0.75rem}
.cta-section p{color:#666;margin-bottom:1.5rem}
.contact-section{text-align:center;padding:var(--sxxl) 0}
.contact-section h2{font-family:var(--fH);font-size:clamp(2rem,5vw,3.5rem);text-transform:uppercase;color:#fff;margin-bottom:1rem}
.contact-section>p{color:#888;margin-bottom:2rem;max-width:500px;margin-left:auto;margin-right:auto}
.c-grid{display:flex;justify-content:center;gap:3rem;margin-bottom:2.5rem;flex-wrap:wrap}
.c-item{display:flex;align-items:center;gap:0.75rem;color:#aaa;font-size:1rem}
.footer{padding:2rem 0;text-align:center;font-size:0.75rem;color:#444;text-transform:uppercase;letter-spacing:0.1em;border-top:1px solid #222}
@media(max-width:768px){.about-grid{grid-template-columns:1fr}.stats{grid-template-columns:repeat(2,1fr)}.tess-grid{grid-template-columns:1fr}.process{grid-template-columns:repeat(2,1fr)}.c-grid{flex-direction:column;gap:1rem}}
`;
  const i1=us(b.category,"h1");
  const revs=Math.floor(80+Math.random()*250),rtg=(4+Math.random()).toFixed(1),yrs=Math.floor(4+Math.random()*15);
  const svcs=C.services.map((s: string,i: number) => `<div class="svc-item reveal reveal-d${Math.min(i+1,4)}"><span class="svc-n">${String(i+1).padStart(2,"0")}</span><span class="svc-t">${s}</span></div>`).join("");
  const body = `<nav class="nav container"><div class="logo">${b.name}</div><div class="tag">${b.category} &middot; ${b.city}</div></nav>
<section class="hero container"><div class="cat">${b.category} &middot; ${b.city}</div><h1 class="reveal">${C.headline}</h1><p class="reveal-d1">${C.subheadline}</p><a href="#contact" class="btn reveal-d2">${C.cta} ${SVG.arrow}</a></section>
<section class="stats container reveal"><div><div class="stat-n">${rtg}</div><div class="stat-l">Star Rating</div></div><div><div class="stat-n">${revs}+</div><div class="stat-l">Happy Clients</div></div><div><div class="stat-n">${yrs}</div><div class="stat-l">Years</div></div><div><div class="stat-n">100%</div><div class="stat-l">Satisfaction</div></div></section>
<section class="section container"><h2 class="reveal">About</h2><div class="about-grid"><div class="reveal"><img src="${i1}" alt="${b.name}"></div><div class="reveal-d1"><p>${C.story}</p>${C.values ? `<div class="quote">${C.values}</div>` : ""}</div></div></section>
<section class="section container"><h2 class="reveal">Services</h2>${svcs}</section>
<section class="tess-section"><div class="container"><h2 class="reveal">What Clients Say</h2><div class="tess-grid"><div class="tess-card reveal"><div class="tess-stars">${SVG.star}${SVG.star}${SVG.star}${SVG.star}${SVG.star}</div><p class="tess-text">"${b.name} completely exceeded expectations. Best ${b.category} in ${b.city}."</p><div class="tess-auth"><div class="tess-av">JM</div><div><div class="tess-name">Jessica M.</div><div class="tess-role">Verified Customer</div></div></div></div><div class="tess-card reveal-d1"><div class="tess-stars">${SVG.star}${SVG.star}${SVG.star}${SVG.star}${SVG.star}</div><p class="tess-text">"I've been coming here for months. Professional, on time, every time."</p><div class="tess-auth"><div class="tess-av">SK</div><div><div class="tess-name">Sam K.</div><div class="tess-role">Verified Customer</div></div></div></div><div class="tess-card reveal-d2"><div class="tess-stars">${SVG.star}${SVG.star}${SVG.star}${SVG.star}${SVG.star}</div><p class="tess-text">"Finally found someone in ${b.city} who actually cares about quality."</p><div class="tess-auth"><div class="tess-av">RL</div><div><div class="tess-name">Rebecca L.</div><div class="tess-role">Verified Customer</div></div></div></div></div></div></section>
<section class="section container"><h2 class="reveal">How It Works</h2><div class="process"><div class="proc reveal"><div class="proc-n">1</div><h4>Book</h4><p>Schedule online or call</p></div><div class="proc reveal-d1"><div class="proc-n">2</div><h4>Consult</h4><p>We listen and plan</p></div><div class="proc reveal-d2"><div class="proc-n">3</div><h4>Deliver</h4><p>Expert work done right</p></div><div class="proc reveal-d3"><div class="proc-n">4</div><h4>Follow Up</h4><p>We make sure you love it</p></div></div></section>
<section class="cta-section container reveal"><h3>${C.contactCta}</h3><p>Join ${revs}+ satisfied customers who trust ${b.name}.</p><a href="#contact" class="btn">Get Started</a></section>
<section id="contact" class="contact-section"><h2 class="reveal">Ready?</h2><p class="reveal-d1">Reach out and let's get to work.</p><div class="c-grid reveal-d2">${b.phone ? `<div class="c-item">${SVG.phone} ${b.phone}</div>` : ""}<div class="c-item">${SVG.map} ${b.address || b.city}</div><div class="c-item">${SVG.clock} Mon&ndash;Sat 9am&ndash;6pm</div></div><a href="${b.phone ? "tel:"+b.phone : "#"}" class="btn reveal-d3">Call Now</a></section>
<footer class="footer container">&copy; ${new Date().getFullYear()} ${b.name} &mdash; ${b.city}</footer>`;
  return {html: wrap(`${b.name} - ${b.category}`,C.subheadline,css,body),css,readme: rd(b)};
}

// ═══════════════════════════════════════════════════════════════
// 2. SOFT LUXURY — Asymmetric hero, polaroids, editorial feel
// ═══════════════════════════════════════════════════════════════
function bSoftLuxury(b: any, C: any, P: Record<string,string>, N: Record<string,string>) {
  const css = cssVars("softLuxury",P,N,CFG.softLuxury) + `
*{font-family:var(--fB)}.fH{font-family:var(--fH)}
body{background:var(--bg2);color:var(--txt);line-height:1.65}
.container{max-width:1200px;margin:0 auto;padding:0 clamp(1.25rem,5vw,2.5rem)}
.nav{display:flex;justify-content:space-between;align-items:center;padding:1.5rem 0}
.logo{font-family:var(--fH);font-size:1.5rem;font-weight:500;font-style:italic;color:var(--txt)}
.hero{display:grid;grid-template-columns:55% 45%;min-height:85vh;align-items:center}
.hero-txt{padding:4rem 3rem 4rem 0}
.hero-txt h1{font-family:var(--fH);font-size:clamp(2.5rem,5vw,4.5rem);line-height:1.1;font-weight:500;color:var(--n900);letter-spacing:-0.02em}
.hero-txt p{font-size:1.125rem;color:var(--txt2);margin-top:1.5rem;line-height:1.8;max-width:420px}
.hero-img{height:100%}.hero-img img{width:100%;height:100%;object-fit:cover;border-radius:var(--r) 0 0 var(--r)}
.btn{display:inline-flex;align-items:center;gap:0.5rem;padding:1rem 2.25rem;background:var(--b500);color:#fff;border-radius:var(--r);font-weight:500;margin-top:2rem;transition:all .3s}
.btn:hover{transform:translateY(-2px);box-shadow:0 12px 32px ${P[500]}35}
.section{padding:var(--sxxl) 0}
.section h2{font-family:var(--fH);font-size:clamp(2rem,4vw,3rem);font-weight:500;color:var(--n900);margin-bottom:2rem}
.about{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center}
.about img{border-radius:var(--r);box-shadow:0 24px 64px ${N[900]}12}
.about p{font-size:1.0625rem;color:var(--txt2);line-height:1.9}
.pols{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;margin-top:3rem}
.pol{background:#fff;padding:0.75rem 0.75rem 2rem;border-radius:var(--r);box-shadow:0 8px 24px ${N[900]}0a}
.pol:nth-child(1){transform:rotate(-2deg)}.pol:nth-child(2){transform:rotate(1.5deg);margin-top:-1rem}
.pol:nth-child(3){transform:rotate(2.5deg)}
.pol:hover{transform:rotate(0deg) scale(1.02);transition:transform .3s}
.pol img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:calc(var(--r) - 4px)}
.svc-item{display:flex;gap:1.5rem;padding:1.5rem 0;border-bottom:1px solid var(--bdr);align-items:flex-start}
.svc-ico{width:44px;height:44px;border-radius:12px;background:var(--b50);color:var(--b600);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.svc-item h4{font-family:var(--fH);font-size:1.125rem;margin-bottom:0.25rem}.svc-item p{font-size:0.9375rem;color:var(--txt2);line-height:1.6}
.tess-section{background:var(--n900);padding:var(--sxxl) 0;color:#fff}
.tess-section h2{text-align:center;font-family:var(--fH);font-size:clamp(2rem,4vw,3rem);margin-bottom:2.5rem}
.tess-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}
.tess-card{background:var(--n800);padding:1.75rem;border-radius:var(--r);border:1px solid var(--n700)}
.tess-stars{color:var(--b400);margin-bottom:1rem}.tess-text{line-height:1.8;color:var(--n300);font-style:italic;margin-bottom:1rem}
.tess-auth{display:flex;align-items:center;gap:0.75rem}
.tess-av{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--b400),var(--b600));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:0.8125rem}
.process{display:grid;grid-template-columns:repeat(4,1fr);gap:2rem;text-align:center}
.proc-n{width:48px;height:48px;border-radius:50%;background:var(--b600);color:#fff;font-family:var(--fH);font-weight:500;display:flex;align-items:center;justify-content:center;margin:0 auto 0.75rem;font-size:1rem}
.proc h4{font-size:1rem;color:var(--txt);margin-bottom:0.25rem}.proc p{font-size:0.875rem;color:var(--txt2)}
.cta-section{text-align:center;padding:var(--sxl) 0;background:var(--bg);border-top:1px solid var(--bdr);border-bottom:1px solid var(--bdr);margin:2rem 0}
.cta-section h3{font-family:var(--fH);font-size:clamp(1.5rem,3vw,2.25rem);margin-bottom:0.75rem}
.cta-section p{color:var(--txt2);margin-bottom:1.25rem}
.contact-section{text-align:center;padding:var(--sxxl) 0;background:var(--b700);color:#fff;border-radius:var(--r);margin:2rem}
.contact-section h2{font-family:var(--fH);font-size:clamp(2rem,4vw,3rem);margin-bottom:1rem}
.contact-section>p{color:var(--b200);margin-bottom:2rem}
.c-grid{display:flex;justify-content:center;gap:3rem;margin-bottom:2rem;flex-wrap:wrap}
.c-item{display:flex;align-items:center;gap:0.5rem;font-size:1rem}
.footer{padding:2rem;text-align:center;font-size:0.8125rem;color:var(--n400)}
@media(max-width:768px){.hero{grid-template-columns:1fr}.hero-img{height:50vh}.hero-txt{padding:2rem}.about{grid-template-columns:1fr}.pols{grid-template-columns:1fr}.tess-grid{grid-template-columns:1fr}.process{grid-template-columns:repeat(2,1fr)}.contact-section{margin:1rem}}
`;
  const i1=us(b.category,"h1"),i2=us(b.category,"h2"),i3=us(b.category,"h3");
  const svcs=C.services.slice(0,4).map((s: string,i: number) => `<div class="svc-item reveal reveal-d${Math.min(i+1,4)}"><div class="svc-ico">${ico(b.category,i)}</div><div><h4>${s}</h4><p>Professional ${s.toLowerCase()} delivered with care and precision.</p></div></div>`).join("");
  const body = `<nav class="nav container"><div class="logo">${b.name}</div><div style="font-size:0.875rem;color:var(--txt2)">${b.category} &middot; ${b.city}</div></nav>
<section class="hero"><div class="hero-txt"><h1 class="reveal">${C.headline}</h1><p class="reveal-d1">${C.subheadline}</p><a href="#contact" class="btn reveal-d2">${C.cta}</a></div><div class="hero-img"><img src="${i1}" alt="${b.name}"></div></section>
<section class="section container"><div class="about"><div class="reveal"><img src="${i2}" alt="About ${b.name}"></div><div class="reveal-d1"><h2>About ${b.name}</h2><p>${C.story}</p>${C.values ? `<p style="margin-top:1rem;font-style:italic;color:var(--b600)">${C.values}</p>` : ""}</div></div><div class="pols"><div class="pol reveal"><img src="${i1}" alt="Gallery 1"></div><div class="pol reveal-d1"><img src="${i2}" alt="Gallery 2"></div><div class="pol reveal-d2"><img src="${i3}" alt="Gallery 3"></div></div></section>
<section class="section container"><h2 class="reveal">Our Services</h2>${svcs}</section>
<section class="tess-section"><div class="container"><h2 class="reveal">What People Say</h2><div class="tess-grid"><div class="tess-card reveal"><div class="tess-stars">${SVG.star}${SVG.star}${SVG.star}${SVG.star}${SVG.star}</div><p class="tess-text">"${b.name} is an absolute gem. The attention to detail is remarkable."</p><div class="tess-auth"><div class="tess-av">AM</div><div><div style="font-weight:600;font-size:0.9375rem">Amanda M.</div></div></div></div><div class="tess-card reveal-d1"><div class="tess-stars">${SVG.star}${SVG.star}${SVG.star}${SVG.star}${SVG.star}</div><p class="tess-text">"Best experience I've had in ${b.city}. I keep coming back."</p><div class="tess-auth"><div class="tess-av">CK</div><div><div style="font-weight:600;font-size:0.9375rem">Chris K.</div></div></div></div><div class="tess-card reveal-d2"><div class="tess-stars">${SVG.star}${SVG.star}${SVG.star}${SVG.star}${SVG.star}</div><p class="tess-text">"They really listen and deliver exactly what you want."</p><div class="tess-auth"><div class="tess-av">SP</div><div><div style="font-weight:600;font-size:0.9375rem">Sarah P.</div></div></div></div></div></div></section>
<section class="section container"><h2 class="reveal">Our Process</h2><div class="process"><div class="proc reveal"><div class="proc-n">1</div><h4>Consultation</h4><p>Personal assessment of your needs</p></div><div class="proc reveal-d1"><div class="proc-n">2</div><h4>Planning</h4><p>Tailored approach designed for you</p></div><div class="proc reveal-d2"><div class="proc-n">3</div><h4>Service</h4><p>Expert care with premium products</p></div><div class="proc reveal-d3"><div class="proc-n">4</div><h4>Aftercare</h4><p>Tips to maintain the results</p></div></div></section>
<section class="cta-section container reveal"><h3>${C.contactCta}</h3><p>Treat yourself to the ${b.name} experience.</p><a href="#contact" class="btn">Book Now</a></section>
<section id="contact" class="contact-section"><h2 class="reveal">${C.contactCta}</h2><p class="reveal-d1">We'd love to hear from you.</p><div class="c-grid reveal-d2">${b.phone ? `<div class="c-item">${SVG.phone} ${b.phone}</div>` : ""}<div class="c-item">${SVG.map} ${b.address || b.city}</div><div class="c-item">${SVG.clock} Mon&ndash;Sat 9am&ndash;7pm</div></div><a href="${b.phone ? "tel:"+b.phone : "#"}" class="btn reveal-d3" style="background:#fff;color:var(--b700)">${b.phone || "Get in Touch"}</a></section>
<footer class="footer">&copy; ${new Date().getFullYear()} ${b.name}</footer>`;
  return {html: wrap(`${b.name} - ${b.category}`,C.subheadline,css,body),css,readme: rd(b)};
}

// ═══════════════════════════════════════════════════════════════
// 3. EDITORIAL — Magazine layout, 3-column text, full-bleed hero
// ═══════════════════════════════════════════════════════════════
function bEditorial(b: any, C: any, P: Record<string,string>, N: Record<string,string>) {
  const css = cssVars("editorial",P,N,CFG.editorial) + `
*{font-family:var(--fB)}.fH{font-family:var(--fH)}
body{background:var(--bg);color:var(--txt);line-height:1.65}
.container{max-width:1100px;margin:0 auto;padding:0 clamp(1.25rem,5vw,2.5rem)}
.nav{display:flex;justify-content:space-between;align-items:center;padding:1.25rem 0;border-bottom:2px solid var(--n900)}
.nav .logo{font-family:var(--fH);font-size:1.375rem;font-weight:600}
.mast{display:flex;justify-content:space-between;padding:0.75rem 0;font-size:0.6875rem;text-transform:uppercase;letter-spacing:0.15em;color:var(--txt2);border-bottom:1px solid var(--bdr)}
.hero{position:relative;height:80vh;display:flex;align-items:flex-end;overflow:hidden}
.hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero-ov{position:absolute;inset:0;background:linear-gradient(to top,var(--n900) 0%,var(--n900)d0 40%,transparent 100%)}
.hero-txt{position:relative;z-index:2;padding:3rem 2rem;max-width:800px}
.hero-txt h1{font-family:var(--fH);font-size:clamp(2.5rem,5vw,4rem);color:#fff;line-height:1.15;font-weight:600}
.hero-txt p{color:var(--n300);font-size:1.125rem;margin-top:1rem;line-height:1.7}
.section{padding:var(--sxxl) 0}
.section h2{font-family:var(--fH);font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:600;margin-bottom:2rem;color:var(--n900)}
.about-cols{font-size:1.0625rem;line-height:1.9;color:var(--txt2);column-count:3;column-gap:2.5rem}
.about-cols p+p{margin-top:1.5rem}
.quote{margin:var(--sxl) 0;padding:var(--sxl);border:3px solid var(--n900);text-align:center}
.quote p{font-family:var(--fH);font-size:clamp(1.25rem,2.5vw,1.75rem);font-style:italic;color:var(--n800);line-height:1.5}
.quote cite{display:block;margin-top:1rem;font-size:0.875rem;color:var(--txt2);font-style:normal;text-transform:uppercase;letter-spacing:0.1em}
.svc-list{display:grid;grid-template-columns:repeat(2,1fr);gap:0}
.svc-item{padding:1.5rem 2rem;border-bottom:1px solid var(--bdr);border-right:1px solid var(--bdr)}
.svc-item:nth-child(2n){border-right:none}
.svc-item h4{font-family:var(--fH);font-size:1.125rem;margin-bottom:0.5rem;color:var(--n800)}
.svc-item p{font-size:0.9375rem;color:var(--txt2)}
.tess-section{background:var(--n900);padding:var(--sxxl) 0;color:#fff}
.tess-section h2{text-align:center;font-family:var(--fH);font-size:clamp(2rem,4vw,3rem);margin-bottom:2.5rem}
.tess-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1.5rem}
.tess-card{background:var(--n800);padding:1.75rem;border:1px solid var(--n700)}
.tess-text{line-height:1.8;color:var(--n300);font-style:italic;margin-bottom:1.25rem;font-family:var(--fH)}
.tess-auth{display:flex;align-items:center;gap:0.75rem}
.tess-av{width:36px;height:36px;border-radius:50%;background:var(--b600);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:0.8125rem}
.process{display:grid;grid-template-columns:repeat(4,1fr);gap:2rem;text-align:center}
.proc-n{width:48px;height:48px;border:2px solid var(--n900);display:flex;align-items:center;justify-content:center;margin:0 auto 0.75rem;font-family:var(--fH);font-weight:600}
.proc h4{font-size:1rem;margin-bottom:0.25rem}.proc p{font-size:0.875rem;color:var(--txt2)}
.cta-section{text-align:center;padding:var(--sxl) 0;background:var(--bg2);border-top:1px solid var(--bdr);border-bottom:1px solid var(--bdr)}
.cta-section h3{font-family:var(--fH);font-size:clamp(1.5rem,3vw,2.25rem);margin-bottom:0.75rem}
.cta-section p{color:var(--txt2);margin-bottom:1.25rem}
.btn{display:inline-flex;align-items:center;gap:0.5rem;padding:1rem 2.25rem;background:var(--n900);color:#fff;font-weight:600;transition:all .2s}
.btn:hover{background:var(--b700)}
.contact-section{padding:var(--sxxl) 0;text-align:center}
.contact-section h2{font-family:var(--fH);font-size:clamp(2rem,4vw,3rem);margin-bottom:1rem}
.c-grid{display:flex;justify-content:center;gap:3rem;margin-bottom:1.5rem;flex-wrap:wrap}
.c-item{color:var(--txt2);font-size:1rem}
.footer{display:flex;justify-content:space-between;align-items:center;padding:2rem 0;border-top:2px solid var(--n900);font-size:0.8125rem;color:var(--txt2)}
@media(max-width:768px){.about-cols{column-count:1}.svc-list{grid-template-columns:1fr}.tess-grid{grid-template-columns:1fr}.process{grid-template-columns:repeat(2,1fr)}.footer{flex-direction:column;gap:0.5rem}}
`;
  const i1=us(b.category,"h1");
  const svcs=C.services.slice(0,4).map((s: string,i: number) => `<div class="svc-item reveal reveal-d${Math.min(i+1,4)}"><h4>${s}</h4><p>Delivered with precision and care that defines ${b.name}.</p></div>`).join("");
  const body = `<nav class="nav container"><div class="logo">${b.name}</div><div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.15em;color:var(--txt2)">${b.category} &middot; ${b.city}</div></nav>
<div class="mast container"><span>Established ${b.city}</span><span>Volume I &middot; Issue 1</span><span>${new Date().getFullYear()}</span></div>
<section class="hero"><img src="${i1}" alt="${b.name}"><div class="hero-ov"></div><div class="hero-txt"><h1 class="reveal">${C.headline}</h1><p class="reveal-d1">${C.subheadline}</p></div></section>
<section class="section container"><h2 class="reveal">The Story</h2><div class="about-cols reveal-d1"><p>${C.story}</p>${C.values ? `<p>${C.values}</p>` : ""}</div></section>
<section class="container"><div class="quote reveal"><p>"${C.contactCta}"</p><cite>&mdash; ${b.name}, ${b.city}</cite></div></section>
<section class="section container"><h2 class="reveal">Services</h2><div class="svc-list">${svcs}</div></section>
<section class="tess-section"><div class="container"><h2 class="reveal">Words From Our Clients</h2><div class="tess-grid"><div class="tess-card reveal"><p class="tess-text">"${b.name} brings a level of expertise that's hard to find. Every detail was handled with care."</p><div class="tess-auth"><div class="tess-av">JR</div><div><div style="font-weight:600">James R.</div><div style="font-size:0.75rem;color:var(--n400)">${b.city}</div></div></div></div><div class="tess-card reveal-d1"><p class="tess-text">"Working with them was seamless. Professional, punctual, and the results speak for themselves."</p><div class="tess-auth"><div class="tess-av">LM</div><div><div style="font-weight:600">Lisa M.</div><div style="font-size:0.75rem;color:var(--n400)">${b.city}</div></div></div></div></div></div></section>
<section class="section container"><h2 class="reveal">Our Process</h2><div class="process"><div class="proc reveal"><div class="proc-n">01</div><h4>Discovery</h4><p>Understanding your needs</p></div><div class="proc reveal-d1"><div class="proc-n">02</div><h4>Strategy</h4><p>Planning the approach</p></div><div class="proc reveal-d2"><div class="proc-n">03</div><h4>Execution</h4><p>Delivering with excellence</p></div><div class="proc reveal-d3"><div class="proc-n">04</div><h4>Review</h4><p>Ensuring complete satisfaction</p></div></div></section>
<section class="cta-section container reveal"><h3>${C.contactCta}</h3><p>Experience the difference that expertise makes.</p><a href="#contact" class="btn">Get in Touch</a></section>
<section id="contact" class="contact-section container"><h2 class="reveal">Contact</h2><div class="c-grid reveal-d1">${b.phone ? `<div class="c-item">${SVG.phone} ${b.phone}</div>` : ""}<div class="c-item">${SVG.map} ${b.address || b.city}</div><div class="c-item">${SVG.clock} Mon&ndash;Fri 8am&ndash;6pm</div></div><a href="${b.phone ? "tel:"+b.phone : "#"}" class="btn reveal-d2">Call Now</a></section>
<footer class="footer container"><div>${b.name}</div><div>${b.city}</div></footer>`;
  return {html: wrap(`${b.name} - ${b.category}`,C.subheadline,css,body),css,readme: rd(b)};
}


// ═══════════════════════════════════════════════════════════════
// 4. MODERN TECH — Dark gradient hero, geometric, icon grid
// ═══════════════════════════════════════════════════════════════
function bModernTech(b: any, C: any, P: Record<string,string>, N: Record<string,string>) {
  const css = cssVars("modernTech",P,N,CFG.modernTech) + `
*{font-family:var(--fB)}.fH{font-family:var(--fH)}
body{background:var(--bg);color:var(--txt);line-height:1.65}
.container{max-width:1160px;margin:0 auto;padding:0 clamp(1.25rem,5vw,2.5rem)}
.nav{display:flex;justify-content:space-between;align-items:center;padding:1.25rem 0}
.logo{font-family:var(--fH);font-size:1.25rem;font-weight:600;color:var(--n900)}
.hero{background:linear-gradient(135deg,var(--n900) 0%,var(--b800) 100%);padding:6rem 0 5rem;text-align:center;position:relative;overflow:hidden}
.hero::before{content:"";position:absolute;top:-50%;right:-20%;width:500px;height:500px;border-radius:50%;background:var(--b500)15;z-index:0}
.hero::after{content:"";position:absolute;bottom:-30%;left:-10%;width:300px;height:300px;border-radius:50%;background:var(--b400)10;z-index:0}
.hero h1,.hero p,.hero a{position:relative;z-index:1}
.hero h1{font-family:var(--fH);font-size:clamp(2.5rem,5vw,4rem);color:#fff;font-weight:600;line-height:1.15;max-width:700px;margin:0 auto}
.hero p{color:var(--b200);font-size:1.125rem;margin-top:1.5rem;max-width:500px;margin-left:auto;margin-right:auto;line-height:1.7}
.btn{display:inline-flex;align-items:center;gap:0.5rem;padding:1rem 2.25rem;background:var(--b500);color:#fff;border-radius:var(--r);font-weight:600;margin-top:2rem;transition:all .2s}
.btn:hover{transform:translateY(-2px);box-shadow:0 12px 32px var(--b600)40}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:2rem;padding:2.5rem 0;background:var(--n50);border-bottom:1px solid var(--bdr)}
.stat{text-align:center}.stat-n{font-family:var(--fH);font-size:2rem;font-weight:600;color:var(--b600)}
.stat-l{font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt2);margin-top:0.25rem}
.section{padding:var(--sxxl) 0}
.section h2{font-family:var(--fH);font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:600;text-align:center;margin-bottom:3rem;color:var(--n900)}
.about{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center}
.about img{border-radius:var(--r);box-shadow:0 20px 60px var(--n900)15;width:100%;aspect-ratio:4/3;object-fit:cover}
.about p{font-size:1.0625rem;color:var(--txt2);line-height:1.9}
.features{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;margin-top:2rem}
.feat{background:var(--bg);border:1px solid var(--bdr);border-radius:var(--r);padding:1.75rem;text-align:center;transition:all .25s}
.feat:hover{transform:translateY(-4px);box-shadow:0 16px 48px var(--n900)0d;border-color:var(--b300)}
.feat-ico{width:56px;height:56px;border-radius:var(--r);background:var(--b50);color:var(--b600);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem}
.feat h4{font-size:1.0625rem;font-weight:600;margin-bottom:0.5rem}.feat p{font-size:0.875rem;color:var(--txt2);line-height:1.6}
.svc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem}
.svc-card{background:var(--bg);border:1px solid var(--bdr);border-radius:var(--r);padding:2rem;text-align:center;transition:all .25s}
.svc-card:hover{transform:translateY(-4px);box-shadow:0 16px 48px var(--n900)0d;border-color:var(--b300)}
.svc-ico{width:56px;height:56px;border-radius:var(--r);background:var(--b50);color:var(--b600);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem}
.svc-card h4{font-size:1.0625rem;font-weight:600;margin-bottom:0.5rem}.svc-card p{font-size:0.875rem;color:var(--txt2)}
.tess-section{background:var(--n900);padding:var(--sxxl) 0;color:#fff}
.tess-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem}
.tess-card{background:var(--n800);padding:2rem;border-radius:var(--r);border:1px solid var(--n700)}
.tess-stars{color:var(--b400);margin-bottom:1rem;letter-spacing:0.15em}
.tess-text{line-height:1.7;color:var(--n300);font-style:italic;margin-bottom:1rem}
.tess-auth{display:flex;align-items:center;gap:0.75rem}
.tess-av{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--b400),var(--b600));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:0.8125rem}
.process{display:grid;grid-template-columns:repeat(4,1fr);gap:2rem;text-align:center;margin-top:2rem}
.proc-n{width:48px;height:48px;border-radius:50%;background:var(--b600);color:#fff;font-family:var(--fH);font-weight:600;display:flex;align-items:center;justify-content:center;margin:0 auto 0.75rem;font-size:1rem}
.proc h4{font-size:1rem;margin-bottom:0.25rem}.proc p{font-size:0.875rem;color:var(--txt2)}
.cta-section{text-align:center;padding:var(--sxl) 0;background:var(--bg2);border-top:1px solid var(--bdr);border-bottom:1px solid var(--bdr)}
.cta-section h3{font-family:var(--fH);font-size:clamp(1.5rem,3vw,2.25rem);margin-bottom:0.75rem}
.cta-section p{color:var(--txt2);margin-bottom:1.25rem}
.contact-section{text-align:center;padding:var(--sxxl) 0;background:var(--b50)}
.contact-section h2{font-family:var(--fH);font-size:clamp(2rem,4vw,3rem);margin-bottom:1rem}
.c-grid{display:flex;justify-content:center;gap:3rem;margin-bottom:1.5rem;flex-wrap:wrap}
.c-item{display:flex;align-items:center;gap:0.5rem;color:var(--txt2)}
.footer{padding:2rem 0;text-align:center;font-size:0.8125rem;color:var(--txt2);border-top:1px solid var(--bdr)}
@media(max-width:768px){.stats{grid-template-columns:repeat(2,1fr)}.about{grid-template-columns:1fr}.features{grid-template-columns:1fr}.process{grid-template-columns:repeat(2,1fr)}}
`;
  const i1=us(b.category,"h1");
  const revs=Math.floor(80+Math.random()*250),rtg=(4+Math.random()).toFixed(1),yrs=Math.floor(4+Math.random()*15);
  const feats = [
    {t:"Fast Turnaround",d:"Projects completed on schedule, every time."},
    {t:"Transparent Pricing",d:"No hidden fees. Know exactly what you pay."},
    {t:"Expert Team",d:"Skilled professionals with years of experience."},
  ].map((f,i) => `<div class="feat reveal reveal-d${Math.min(i+1,4)}"><div class="feat-ico">${ico(b.category,i)}</div><h4>${f.t}</h4><p>${f.d}</p></div>`).join("");
  const svcs=C.services.slice(0,4).map((s: string,i: number) => `<div class="svc-card reveal reveal-d${Math.min(i+1,4)}"><div class="svc-ico">${ico(b.category,i)}</div><h4>${s}</h4><p>Expert ${s.toLowerCase()} tailored to your specific needs.</p></div>`).join("");
  const body = `<nav class="nav container"><div class="logo">${b.name}</div><div style="font-size:0.875rem;color:var(--txt2)">${b.category}</div></nav>
<section class="hero"><div class="container"><h1 class="reveal">${C.headline}</h1><p class="reveal-d1">${C.subheadline}</p><a href="#contact" class="btn reveal-d2">${C.cta}</a></div></section>
<section class="stats container"><div class="stat reveal"><div class="stat-n">${rtg}</div><div class="stat-l">Star Rating</div></div><div class="stat reveal-d1"><div class="stat-n">${revs}+</div><div class="stat-l">Reviews</div></div><div class="stat reveal-d2"><div class="stat-n">${yrs}</div><div class="stat-l">Years</div></div><div class="stat reveal-d3"><div class="stat-n">100%</div><div class="stat-l">Satisfaction</div></div></section>
<section class="section container"><h2 class="reveal">About ${b.name}</h2><div class="about"><div class="reveal"><img src="${i1}" alt="${b.name}"></div><div class="reveal-d1"><p>${C.story}</p>${C.values ? `<p style="margin-top:1rem;color:var(--b600);font-weight:500">${C.values}</p>` : ""}</div></div></section>
<section class="section container" style="background:var(--n50)"><div class="container"><h2 class="reveal">Why Choose Us</h2><div class="features">${feats}</div></div></section>
<section class="section container"><h2 class="reveal">Our Services</h2><div class="svc-grid">${svcs}</div></section>
<section class="tess-section"><div class="container"><h2 class="reveal">What People Say</h2><div class="tess-grid"><div class="tess-card reveal"><div class="tess-stars">${SVG.star}${SVG.star}${SVG.star}${SVG.star}${SVG.star}</div><p class="tess-text">"${b.name} completely transformed our experience. Highly professional team."</p><div class="tess-auth"><div class="tess-av">DR</div><div><div style="font-weight:600;font-size:0.9375rem">David R.</div></div></div></div><div class="tess-card reveal-d1"><div class="tess-stars">${SVG.star}${SVG.star}${SVG.star}${SVG.star}${SVG.star}</div><p class="tess-text">"Best ${b.category} service in ${b.city}. Fast, reliable, and fairly priced."</p><div class="tess-auth"><div class="tess-av">TM</div><div><div style="font-weight:600;font-size:0.9375rem">Tina M.</div></div></div></div></div></div></section>
<section class="section container"><h2 class="reveal">How It Works</h2><div class="process"><div class="proc reveal"><div class="proc-n">1</div><h4>Contact</h4><p>Tell us what you need</p></div><div class="proc reveal-d1"><div class="proc-n">2</div><h4>Quote</h4><p>Get a detailed estimate</p></div><div class="proc reveal-d2"><div class="proc-n">3</div><h4>Work</h4><p>We deliver on time</p></div><div class="proc reveal-d3"><div class="proc-n">4</div><h4>Support</h4><p>Ongoing help available</p></div></div></section>
<section class="cta-section container reveal"><h3>${C.contactCta}</h3><p>Ready to get started? Reach out today.</p><a href="#contact" class="btn">Contact Us</a></section>
<section id="contact" class="contact-section"><div class="container"><h2 class="reveal">${C.contactCta}</h2><p class="reveal-d1" style="color:var(--txt2);margin-bottom:2rem">We're here to help.</p><div class="c-grid reveal-d1">${b.phone ? `<div class="c-item">${SVG.phone} ${b.phone}</div>` : ""}<div class="c-item">${SVG.map} ${b.address || b.city}</div><div class="c-item">${SVG.clock} Mon&ndash;Sat 9am&ndash;6pm</div></div><a href="${b.phone ? "tel:"+b.phone : "#"}" class="btn reveal-d2">${b.phone || "Get in Touch"}</a></div></section>
<footer class="footer">&copy; ${new Date().getFullYear()} ${b.name} &middot; ${b.city}</footer>`;
  return {html: wrap(`${b.name} - ${b.category}`,C.subheadline,css,body),css,readme: rd(b)};
}

// ═══════════════════════════════════════════════════════════════
// 5. WARM LOCAL — Photo hero, masonry, community feel
// ═══════════════════════════════════════════════════════════════
function bWarmLocal(b: any, C: any, P: Record<string,string>, N: Record<string,string>) {
  const css = cssVars("warmLocal",P,N,CFG.warmLocal) + `
*{font-family:var(--fB)}.fH{font-family:var(--fH)}
body{background:var(--bg);color:var(--txt);line-height:1.65}
.container{max-width:1200px;margin:0 auto;padding:0 clamp(1.25rem,5vw,2.5rem)}
.nav{display:flex;justify-content:space-between;align-items:center;padding:1.25rem 0;background:var(--bg);position:sticky;top:0;z-index:50;border-bottom:1px solid var(--bdr)}
.logo{font-family:var(--fH);font-size:1.5rem;color:var(--n900)}
.hero{position:relative;height:85vh;display:flex;align-items:center;justify-content:center;text-align:center;overflow:hidden}
.hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero-ov{position:absolute;inset:0;background:linear-gradient(135deg,var(--n900)d0 0%,var(--b900)90 100%)}
.hero-txt{position:relative;z-index:2;max-width:600px;padding:2rem}
.hero-txt h1{font-family:var(--fH);font-size:clamp(2.5rem,5vw,4rem);color:#fff;line-height:1.15}
.hero-txt p{color:var(--b200);font-size:1.125rem;margin-top:1rem;line-height:1.7}
.btn{display:inline-flex;align-items:center;gap:0.5rem;padding:1rem 2.25rem;background:#fff;color:var(--b700);border-radius:var(--r);font-weight:600;margin-top:2rem;transition:all .2s}
.btn:hover{transform:translateY(-2px);box-shadow:0 12px 32px var(--n900)30}
.section{padding:var(--sxxl) 0}
.section h2{font-family:var(--fH);font-size:clamp(1.75rem,3.5vw,2.5rem);color:var(--n900);margin-bottom:2rem;text-align:center}
.about{text-align:center;max-width:680px;margin:0 auto}
.about p{font-size:1.125rem;color:var(--txt2);line-height:1.9}
.mason{display:grid;grid-template-columns:1.2fr 0.8fr 1fr;gap:0.75rem;margin-top:3rem}
.mason img{width:100%;border-radius:var(--r);object-fit:cover}
.mason img:nth-child(1){aspect-ratio:4/3}.mason img:nth-child(2){aspect-ratio:3/4;margin-top:2rem}.mason img:nth-child(3){aspect-ratio:1}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:2rem;padding:var(--sxl) 0;text-align:center}
.stat-n{font-family:var(--fH);font-size:2.25rem;color:var(--b600)}.stat-l{font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt2);margin-top:0.25rem}
.svc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.5rem}
.svc-card{background:var(--bg);border:1px solid var(--bdr);border-radius:var(--r);padding:2rem;text-align:center;transition:all .25s}
.svc-card:hover{border-color:var(--b400);transform:translateY(-3px);box-shadow:0 12px 32px var(--n900)08}
.svc-ico{width:48px;height:48px;border-radius:50%;background:var(--b50);color:var(--b600);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem}
.svc-card h4{font-family:var(--fH);font-size:1.125rem;margin-bottom:0.5rem}
.svc-card p{font-size:0.9375rem;color:var(--txt2)}
.tess-section{background:var(--n900);padding:var(--sxxl) 0;color:#fff}
.tess-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem}
.tess-card{background:var(--n800);padding:1.75rem;border-radius:var(--r)}
.tess-stars{color:var(--b400);margin-bottom:0.75rem}.tess-text{line-height:1.7;color:var(--n300);font-style:italic;margin-bottom:1rem}
.tess-auth{display:flex;align-items:center;gap:0.75rem}
.tess-av{width:36px;height:36px;border-radius:50%;background:var(--b600);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:0.8125rem}
.cta-section{text-align:center;padding:var(--sxl) 0;background:var(--bg2);border-top:1px solid var(--bdr)}
.cta-section h3{font-family:var(--fH);font-size:clamp(1.5rem,3vw,2.25rem);margin-bottom:0.75rem}
.cta-section p{color:var(--txt2);margin-bottom:1.25rem}
.contact-section{text-align:center;padding:var(--sxxl) 0;background:var(--b600);color:#fff;border-radius:var(--r);margin:2rem}
.contact-section h2{font-family:var(--fH);font-size:clamp(2rem,4vw,3rem);margin-bottom:1rem}
.contact-section>p{color:var(--b200);margin-bottom:2rem}
.c-grid{display:flex;justify-content:center;gap:3rem;margin-bottom:2rem;flex-wrap:wrap}
.c-item{display:flex;align-items:center;gap:0.5rem}
.footer{padding:2rem;text-align:center;font-size:0.8125rem;color:var(--txt2);border-top:1px solid var(--bdr)}
@media(max-width:768px){.mason{grid-template-columns:1fr}.mason img:nth-child(2){margin-top:0}.stats{grid-template-columns:repeat(2,1fr)}.contact-section{margin:1rem}}
`;
  const i1=us(b.category,"h1"),i2=us(b.category,"h2"),i3=us(b.category,"h3"),iA=us(b.category,"a1");
  const revs=Math.floor(80+Math.random()*250),rtg=(4+Math.random()).toFixed(1),yrs=Math.floor(4+Math.random()*15);
  const svcs=C.services.slice(0,4).map((s: string,i: number) => `<div class="svc-card reveal reveal-d${Math.min(i+1,4)}"><div class="svc-ico">${ico(b.category,i)}</div><h4>${s}</h4><p>Done right, every single time.</p></div>`).join("");
  const body = `<nav class="nav container"><div class="logo">${b.name}</div><div style="font-size:0.875rem;color:var(--txt2)">${b.city}</div></nav>
<section class="hero"><img src="${i1}" alt="${b.name}"><div class="hero-ov"></div><div class="hero-txt"><h1 class="reveal">${C.headline}</h1><p class="reveal-d1">${C.subheadline}</p><a href="#contact" class="btn reveal-d2">${C.cta}</a></div></section>
<section class="section container"><div class="about reveal"><h2>About ${b.name}</h2><p>${C.story}</p>${C.values ? `<p style="margin-top:1rem;font-style:italic;color:var(--b600)">${C.values}</p>` : ""}</div><div class="mason"><img src="${iA}" alt="1" class="reveal"><img src="${i2}" alt="2" class="reveal-d1"><img src="${i3}" alt="3" class="reveal-d2"></div></section>
<section class="section container"><div class="stats reveal"><div><div class="stat-n">${rtg}</div><div class="stat-l">Star Rating</div></div><div><div class="stat-n">${revs}+</div><div class="stat-l">Happy Customers</div></div><div><div class="stat-n">${yrs}</div><div class="stat-l">Years</div></div><div><div class="stat-n">100%</div><div class="stat-l">Satisfaction</div></div></div></section>
<section class="section container"><h2 class="reveal">What We Offer</h2><div class="svc-grid">${svcs}</div></section>
<section class="tess-section"><div class="container"><h2 class="reveal">From Our Community</h2><div class="tess-grid"><div class="tess-card reveal"><div class="tess-stars">${SVG.star}${SVG.star}${SVG.star}${SVG.star}${SVG.star}</div><p class="tess-text">"${b.name} is a ${b.city} treasure. The quality is always outstanding."</p><div class="tess-auth"><div class="tess-av">MW</div><div><div style="font-weight:600">Mike W.</div></div></div></div><div class="tess-card reveal-d1"><div class="tess-stars">${SVG.star}${SVG.star}${SVG.star}${SVG.star}${SVG.star}</div><p class="tess-text">"I've been a regular for years. Nothing but the best experience."</p><div class="tess-auth"><div class="tess-av">EL</div><div><div style="font-weight:600">Emma L.</div></div></div></div></div></div></section>
<section class="cta-section container reveal"><h3>${C.contactCta}</h3><p>Come see what makes ${b.name} special.</p><a href="#contact" class="btn">Visit Us</a></section>
<section id="contact" class="contact-section"><h2 class="reveal">${C.contactCta}</h2><p class="reveal-d1">Give us a call or stop by anytime.</p><div class="c-grid reveal-d2">${b.phone ? `<div class="c-item">${SVG.phone} ${b.phone}</div>` : ""}<div class="c-item">${SVG.map} ${b.address || b.city}</div><div class="c-item">${SVG.clock} Mon&ndash;Sat 8am&ndash;8pm</div></div><a href="${b.phone ? "tel:"+b.phone : "#"}" class="btn reveal-d3">${b.phone || "Get in Touch"}</a></section>
<footer class="footer">&copy; ${new Date().getFullYear()} ${b.name} &middot; ${b.city}</footer>`;
  return {html: wrap(`${b.name} - ${b.category}`,C.subheadline,css,body),css,readme: rd(b)};
}

// ═══════════════════════════════════════════════════════════════
// 6. BOLD MINIMAL — Massive type, single CTA, sparse
// ═══════════════════════════════════════════════════════════════
function bBoldMinimal(b: any, C: any, P: Record<string,string>, N: Record<string,string>) {
  const css = cssVars("boldMinimal",P,N,CFG.boldMinimal) + `
*{font-family:var(--fB)}.fH{font-family:var(--fH)}
body{background:var(--n900);color:var(--n100);line-height:1.65}
.container{max-width:1100px;margin:0 auto;padding:0 clamp(1.25rem,5vw,2.5rem)}
.nav{display:flex;justify-content:space-between;align-items:center;padding:1.5rem 0}
.logo{font-family:var(--fH);font-size:1.125rem;font-weight:700;color:#fff;letter-spacing:-0.02em}
.hero{min-height:85vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:4rem 0}
.hero h1{font-family:var(--fH);font-size:clamp(3.5rem,10vw,8rem);line-height:0.95;font-weight:700;color:#fff;letter-spacing:-0.04em;max-width:900px}
.hero p{font-size:1.25rem;color:var(--n400);margin-top:2rem;max-width:480px;line-height:1.7}
.btn{display:inline-flex;align-items:center;gap:0.75rem;padding:1.25rem 3rem;background:var(--b500);color:#fff;font-family:var(--fH);font-weight:700;font-size:1rem;letter-spacing:0.02em;margin-top:3rem;transition:all .2s}
.btn:hover{background:var(--b400);transform:translateY(-2px)}
.stats{display:flex;justify-content:center;gap:5rem;padding:var(--sxl) 0;border-top:1px solid var(--n700);border-bottom:1px solid var(--n700)}
.stat{text-align:center}.stat-n{font-family:var(--fH);font-size:3rem;font-weight:700;color:var(--b400);line-height:1}
.stat-l{font-size:0.75rem;text-transform:uppercase;letter-spacing:0.15em;color:var(--n500);margin-top:0.5rem}
.section{padding:var(--sxxl) 0}
.section h2{font-family:var(--fH);font-size:clamp(2rem,4vw,3rem);font-weight:700;color:#fff;margin-bottom:2rem}
.about p{color:var(--n400);font-size:1.125rem;line-height:1.9;max-width:600px}
.quote{color:var(--b400);font-style:italic;margin-top:1.5rem;font-size:1.125rem;max-width:600px}
.svc-list{max-width:700px;margin:0 auto}
.svc-item{display:flex;justify-content:space-between;align-items:center;padding:1.5rem 0;border-bottom:1px solid var(--n700);font-size:1.125rem}
.svc-item span:first-child{font-family:var(--fH);font-weight:700;color:#fff}.svc-item span:last-child{color:var(--n500);font-size:0.9375rem}
.tess-section{padding:var(--sxxl) 0;text-align:center;border-top:1px solid var(--n700);border-bottom:1px solid var(--n700)}
.tess-section h2{font-family:var(--fH);font-size:clamp(2rem,4vw,3rem);font-weight:700;color:#fff;margin-bottom:2.5rem}
.tess-text{font-family:var(--fH);font-size:clamp(1.25rem,2vw,1.75rem);color:var(--n300);font-style:italic;line-height:1.5;max-width:700px;margin:0 auto 2rem}
.tess-auth{color:var(--n500);font-size:0.9375rem}
.cta-section{text-align:center;padding:var(--sxl) 0}
.cta-section h3{font-family:var(--fH);font-size:clamp(1.5rem,3vw,2.5rem);font-weight:700;color:#fff;margin-bottom:0.75rem}
.cta-section p{color:var(--n400);margin-bottom:1.5rem}
.contact-section{text-align:center;padding:var(--sxxl) 0}
.contact-section h2{font-family:var(--fH);font-size:clamp(2.5rem,6vw,4rem);font-weight:700;color:#fff}
.contact-section>p{color:var(--n400);margin:1.5rem 0 2rem;font-size:1.125rem}
.c-grid{display:flex;justify-content:center;gap:3rem;margin-bottom:2rem;flex-wrap:wrap;color:var(--n400)}
.c-item{display:flex;align-items:center;gap:0.5rem}
.footer{padding:2rem 0;text-align:center;font-size:0.75rem;color:var(--n600);text-transform:uppercase;letter-spacing:0.15em}
@media(max-width:768px){.stats{flex-direction:column;gap:2rem}.hero h1{font-size:2.75rem}}
`;
  const revs=Math.floor(80+Math.random()*250),rtg=(4+Math.random()).toFixed(1),yrs=Math.floor(4+Math.random()*15);
  const svcs=C.services.slice(0,4).map((s: string,i: number) => `<div class="svc-item reveal"><span>${s}</span><span>0${i+1}</span></div>`).join("");
  const body = `<nav class="nav container"><div class="logo">${b.name}</div><div style="font-size:0.75rem;color:var(--n500);text-transform:uppercase;letter-spacing:0.1em">${b.city}</div></nav>
<section class="hero container"><h1 class="reveal">${C.headline}</h1><p class="reveal-d1">${C.subheadline}</p><a href="#contact" class="btn reveal-d2">${C.cta}</a></section>
<section class="stats container"><div class="stat reveal"><div class="stat-n">${rtg}</div><div class="stat-l">Rating</div></div><div class="stat reveal-d1"><div class="stat-n">${revs}</div><div class="stat-l">Reviews</div></div><div class="stat reveal-d2"><div class="stat-n">${yrs}</div><div class="stat-l">Years</div></div></section>
<section class="section container"><h2 class="reveal">About</h2><div class="about reveal-d1"><p>${C.story}</p>${C.values ? `<p class="quote">${C.values}</p>` : ""}</div></section>
<section class="section container"><h2 class="reveal">Services</h2><div class="svc-list">${svcs}</div></section>
<section class="tess-section container"><h2 class="reveal">What People Say</h2><p class="tess-text reveal-d1">"${b.name} is hands down the best ${b.category} in ${b.city}. I've tried the rest and these guys are different."</p><p class="tess-auth reveal-d2">&mdash; Verified Customer</p></section>
<section class="cta-section container reveal"><h3>${C.contactCta}</h3><p>Join ${revs}+ people who trust ${b.name}.</p><a href="#contact" class="btn">Get Started</a></section>
<section id="contact" class="contact-section"><h2 class="reveal">${C.contactCta}</h2><p class="reveal-d1">Ready when you are.</p><div class="c-grid reveal-d2">${b.phone ? `<div class="c-item">${SVG.phone} ${b.phone}</div>` : ""}<div class="c-item">${SVG.map} ${b.address || b.city}</div></div><a href="${b.phone ? "tel:"+b.phone : "#"}" class="btn reveal-d3">${b.phone || "Contact"}</a></section>
<footer class="footer container">&copy; ${new Date().getFullYear()} ${b.name}</footer>`;
  return {html: wrap(`${b.name} - ${b.category}`,C.subheadline,css,body),css,readme: rd(b)};
}

// ═══════════════════════════════════════════════════════════════
// 7. PHOTO FIRST — 100vh immersive, gallery grid
// ═══════════════════════════════════════════════════════════════
function bPhotoFirst(b: any, C: any, P: Record<string,string>, N: Record<string,string>) {
  const css = cssVars("photoFirst",P,N,CFG.photoFirst) + `
*{font-family:var(--fB)}.fH{font-family:var(--fH)}
body{background:var(--bg);color:var(--txt);line-height:1.65}
.container{max-width:1200px;margin:0 auto;padding:0 clamp(1.25rem,5vw,2.5rem)}
.nav{position:absolute;top:0;left:0;right:0;z-index:10;display:flex;justify-content:space-between;align-items:center;padding:1.5rem 2rem}
.logo{font-family:var(--fH);font-size:1.375rem;color:#fff;font-weight:500}
.hero{position:relative;height:100vh;display:flex;align-items:flex-end;overflow:hidden}
.hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero-ov{position:absolute;inset:0;background:linear-gradient(to top,var(--n900) 0%,var(--n900)80 30%,transparent 70%)}
.hero-txt{position:relative;z-index:2;padding:3rem 2rem;max-width:700px}
.hero-txt h1{font-family:var(--fH);font-size:clamp(2.5rem,5vw,4.5rem);color:#fff;line-height:1.1;font-weight:500}
.hero-txt p{color:var(--n300);font-size:1.125rem;margin-top:1rem;line-height:1.7}
.btn{display:inline-flex;align-items:center;gap:0.5rem;padding:1rem 2.25rem;background:#fff;color:var(--n900);border-radius:var(--r);font-weight:600;margin-top:1.5rem;transition:all .2s}
.btn:hover{background:var(--b200)}
.section{padding:var(--sxxl) 0}
.section h2{font-family:var(--fH);font-size:clamp(1.75rem,3.5vw,2.5rem);color:var(--n900);margin-bottom:2rem}
.about{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center}
.about p{font-size:1.0625rem;color:var(--txt2);line-height:1.9}
.about img{border-radius:var(--r);box-shadow:0 20px 60px var(--n900)15}
.gallery{display:grid;grid-template-columns:2fr 1fr 1fr;gap:0.75rem;margin-top:2rem}
.gallery img{width:100%;height:100%;object-fit:cover;border-radius:var(--r)}
.gallery img:first-child{grid-row:span 2;aspect-ratio:auto}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:2rem;padding:var(--sxl) 0;text-align:center}
.stat-n{font-family:var(--fH);font-size:2.25rem;color:var(--b600)}.stat-l{font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt2)}
.svc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:2rem}
.svc-item{padding:1.5rem 0;border-top:2px solid var(--n900)}
.svc-item h4{font-family:var(--fH);font-size:1.125rem;margin-bottom:0.5rem}
.svc-item p{font-size:0.9375rem;color:var(--txt2)}
.tess-section{background:var(--n50);padding:var(--sxxl) 0}
.tess-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem}
.tess-card{background:var(--bg);padding:1.75rem;border-radius:var(--r);border:1px solid var(--bdr)}
.tess-text{line-height:1.7;color:var(--txt2);font-style:italic;margin-bottom:1rem;font-family:var(--fH)}
.tess-auth{display:flex;align-items:center;gap:0.75rem;color:var(--txt2);font-size:0.9375rem}
.tess-av{width:36px;height:36px;border-radius:50%;background:var(--n800);display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.8125rem}
.contact-section{position:relative;padding:var(--sxxl) 2rem;text-align:center;color:#fff;overflow:hidden}
.contact-section img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0}
.contact-ov{position:absolute;inset:0;background:var(--n900)c0;z-index:1}
.contact-section .inner{position:relative;z-index:2}
.contact-section h2{font-family:var(--fH);font-size:clamp(2rem,4vw,3rem);margin-bottom:1rem}
.contact-section>p{color:var(--n300);margin-bottom:2rem}
.c-grid{display:flex;justify-content:center;gap:3rem;margin-bottom:2rem;flex-wrap:wrap}
.c-item{display:flex;align-items:center;gap:0.5rem;color:var(--n300)}
.footer{padding:2rem;text-align:center;font-size:0.8125rem;color:var(--txt2)}
@media(max-width:768px){.about{grid-template-columns:1fr}.gallery{grid-template-columns:1fr 1fr}.gallery img:first-child{grid-row:span 1}.stats{grid-template-columns:repeat(2,1fr)}}
`;
  const i1=us(b.category,"h1"),i2=us(b.category,"h2"),i3=us(b.category,"h3"),iA=us(b.category,"a1");
  const revs=Math.floor(80+Math.random()*250),rtg=(4+Math.random()).toFixed(1),yrs=Math.floor(4+Math.random()*15);
  const svcs=C.services.slice(0,4).map((s: string,i: number) => `<div class="svc-item reveal reveal-d${Math.min(i+1,4)}"><h4>${s}</h4><p>Professional ${s.toLowerCase()} services tailored to your needs.</p></div>`).join("");
  const body = `<nav class="nav"><div class="logo">${b.name}</div><div style="font-size:0.75rem;color:#fff;text-transform:uppercase;letter-spacing:0.15em">${b.category}</div></nav>
<section class="hero"><img src="${i1}" alt="${b.name}"><div class="hero-ov"></div><div class="hero-txt"><h1 class="reveal">${C.headline}</h1><p class="reveal-d1">${C.subheadline}</p><a href="#contact" class="btn reveal-d2">${C.cta}</a></div></section>
<section class="section container"><div class="about"><div class="reveal"><h2>About ${b.name}</h2><p>${C.story}</p>${C.values ? `<p style="margin-top:1rem;font-style:italic;color:var(--b600)">${C.values}</p>` : ""}</div><div class="gallery reveal-d1"><img src="${iA}" alt="1"><img src="${i2}" alt="2"><img src="${i3}" alt="3"></div></div></section>
<section class="section container"><div class="stats reveal"><div><div class="stat-n">${rtg}</div><div class="stat-l">Rating</div></div><div><div class="stat-n">${revs}+</div><div class="stat-l">Clients</div></div><div><div class="stat-n">${yrs}</div><div class="stat-l">Years</div></div><div><div class="stat-n">100%</div><div class="stat-l">Satisfaction</div></div></div></section>
<section class="section container"><h2 class="reveal">Services</h2><div class="svc-grid">${svcs}</div></section>
<section class="tess-section"><div class="container"><h2 class="reveal" style="text-align:center;margin-bottom:2.5rem">Client Stories</h2><div class="tess-grid"><div class="tess-card reveal"><p class="tess-text">"${b.name} captured exactly what we envisioned. Truly talented work."</p><div class="tess-auth"><div class="tess-av">AK</div><div>Andrea K.</div></div></div><div class="tess-card reveal-d1"><p class="tess-text">"The results exceeded every expectation. Professional from start to finish."</p><div class="tess-auth"><div class="tess-av">RJ</div><div>Robert J.</div></div></div></div></div></section>
<section id="contact" class="contact-section"><img src="${i2}" alt=""><div class="contact-ov"></div><div class="inner"><h2 class="reveal">${C.contactCta}</h2><p class="reveal-d1">${b.phone ? b.phone : b.address || b.city}</p><div class="c-grid reveal-d2">${b.phone ? `<div class="c-item">${SVG.phone} ${b.phone}</div>` : ""}<div class="c-item">${SVG.map} ${b.address || b.city}</div><div class="c-item">${SVG.clock} Mon&ndash;Sat 9am&ndash;6pm</div></div><a href="${b.phone ? "tel:"+b.phone : "#"}" class="btn reveal-d3">Book Now</a></div></section>
<footer class="footer">&copy; ${new Date().getFullYear()} ${b.name} &middot; ${b.city}</footer>`;
  return {html: wrap(`${b.name} - ${b.category}`,C.subheadline,css,body),css,readme: rd(b)};
}

// ═══════════════════════════════════════════════════════════════
// 8. RETRO — Dashed borders, polaroid frames, ticket stubs
// ═══════════════════════════════════════════════════════════════
function bRetro(b: any, C: any, P: Record<string,string>, N: Record<string,string>) {
  const css = cssVars("retro",P,N,CFG.retro) + `
*{font-family:var(--fB)}.fH{font-family:var(--fH)}
body{background:var(--bg2);color:var(--txt);line-height:1.65}
.container{max-width:1100px;margin:0 auto;padding:0 clamp(1.25rem,5vw,2.5rem)}
.nav{display:flex;justify-content:space-between;align-items:center;padding:1.25rem 0;border-bottom:2px dashed var(--n400)}
.logo{font-family:var(--fH);font-size:1.375rem;font-weight:600;color:var(--n900)}
.hero{padding:5rem 0;text-align:center;border-bottom:2px dashed var(--n400)}
.hero h1{font-family:var(--fH);font-size:clamp(2.5rem,6vw,4.5rem);color:var(--n900);line-height:1.1;margin-bottom:1.5rem}
.hero p{font-size:1.125rem;color:var(--txt2);max-width:500px;margin:0 auto;line-height:1.7}
.btn{display:inline-flex;align-items:center;gap:0.5rem;padding:1rem 2.5rem;background:var(--b600);color:#fff;font-family:var(--fH);font-size:1rem;margin-top:2rem;border:2px solid var(--n900);box-shadow:4px 4px 0 var(--n900);transition:all .15s}
.btn:hover{transform:translate(2px,2px);box-shadow:2px 2px 0 var(--n900)}
.section{padding:var(--sxxl) 0}
.section h2{font-family:var(--fH);font-size:clamp(1.75rem,3.5vw,2.5rem);color:var(--n900);margin-bottom:2rem;text-align:center}
.about{display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center;max-width:900px;margin:0 auto}
.about p{font-size:1.0625rem;color:var(--txt2);line-height:1.9}
.polaroid{background:#fff;padding:0.75rem 0.75rem 2.5rem;border:2px solid var(--n900);box-shadow:6px 6px 0 var(--n400);max-width:320px;margin:0 auto;transform:rotate(-2deg)}
.polaroid img{width:100%;aspect-ratio:1;object-fit:cover;border:1px solid var(--bdr)}
.ticket{background:#fff;border:2px solid var(--n900);padding:1.5rem 2rem;margin-bottom:1rem;display:flex;justify-content:space-between;align-items:center;box-shadow:3px 3px 0 var(--n400);transition:all .15s;position:relative;overflow:hidden}
.ticket::before,.ticket::after{content:"";position:absolute;top:50%;width:20px;height:20px;background:var(--bg2);border-radius:50%;border:2px solid var(--n900);transform:translateY(-50%)}
.ticket::before{left:-10px}.ticket::after{right:-10px}
.ticket:hover{transform:translate(2px,2px);box-shadow:1px 1px 0 var(--n400)}
.ticket h4{font-family:var(--fH);font-size:1.125rem}.ticket span{font-family:var(--fH);font-size:0.875rem;color:var(--b600);font-weight:700}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:2rem;padding:var(--sxl) 0;text-align:center;border-top:2px dashed var(--n400);border-bottom:2px dashed var(--n400)}
.stat-n{font-family:var(--fH);font-size:2rem;color:var(--b600)}.stat-l{font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt2)}
.tess-section{padding:var(--sxxl) 0;border-top:2px dashed var(--n400)}
.tess-section h2{text-align:center;font-family:var(--fH);font-size:clamp(2rem,4vw,3rem);margin-bottom:2.5rem}
.tess-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1.5rem}
.tess-card{background:#fff;border:2px solid var(--n900);padding:1.5rem;box-shadow:3px 3px 0 var(--n400)}
.tess-text{line-height:1.7;color:var(--txt2);font-style:italic;margin-bottom:1rem}
.tess-auth{display:flex;align-items:center;gap:0.75rem}
.tess-av{width:36px;height:36px;border-radius:50%;background:var(--n900);display:flex;align-items:center;justify-content:center;color:#fff;font-family:var(--fH);font-weight:700;font-size:0.8125rem}
.cta-section{text-align:center;padding:var(--sxl) 0;background:var(--bg);border-top:2px dashed var(--n400)}
.cta-section h3{font-family:var(--fH);font-size:clamp(1.5rem,3vw,2.25rem);margin-bottom:0.75rem}
.cta-section p{color:var(--txt2);margin-bottom:1.25rem}
.contact-section{text-align:center;padding:var(--sxxl) 0;background:var(--n100);border-top:2px dashed var(--n400)}
.contact-section h2{font-family:var(--fH);font-size:clamp(2rem,4vw,3rem);color:var(--n900);margin-bottom:1rem}
.contact-section>p{color:var(--txt2);margin-bottom:2rem}
.c-grid{display:flex;justify-content:center;gap:3rem;margin-bottom:2rem;flex-wrap:wrap}
.c-item{display:flex;align-items:center;gap:0.5rem;color:var(--txt2)}
.footer{padding:2rem;text-align:center;font-size:0.8125rem;color:var(--txt2);font-family:var(--fH);border-top:2px dashed var(--n400)}
@media(max-width:768px){.about{grid-template-columns:1fr}.tess-grid{grid-template-columns:1fr}.stats{grid-template-columns:repeat(2,1fr)}}
`;
  const i1=us(b.category,"h1");
  const revs=Math.floor(80+Math.random()*250),rtg=(4+Math.random()).toFixed(1),yrs=Math.floor(4+Math.random()*15);
  const svcs=C.services.slice(0,4).map((s: string,i: number) => `<div class="ticket reveal reveal-d${Math.min(i+1,4)}"><h4>${s}</h4><span>NO. ${String(i+1).padStart(3,"0")}</span></div>`).join("");
  const body = `<nav class="nav container"><div class="logo">${b.name}</div><div style="font-family:var(--fH);font-size:0.875rem;color:var(--txt2)">${b.city}</div></nav>
<section class="hero container"><h1 class="reveal">${C.headline}</h1><p class="reveal-d1">${C.subheadline}</p><a href="#contact" class="btn reveal-d2">${C.cta}</a></section>
<section class="section container"><div class="about"><div class="reveal"><div class="polaroid"><img src="${i1}" alt="${b.name}"></div></div><div class="reveal-d1"><h2 style="font-family:var(--fH);font-size:2rem;margin-bottom:1rem">About ${b.name}</h2><p>${C.story}</p>${C.values ? `<p style="margin-top:1rem;font-style:italic">${C.values}</p>` : ""}</div></div></section>
<section class="container"><div style="max-width:700px;margin:0 auto"><h2 class="section" style="text-align:center;border:none"><span class="reveal">Services</span></h2>${svcs}</div></section>
<section class="stats container"><div class="reveal"><div class="stat-n">${rtg}</div><div class="stat-l">Stars</div></div><div class="reveal-d1"><div class="stat-n">${revs}+</div><div class="stat-l">Customers</div></div><div class="reveal-d2"><div class="stat-n">${yrs}</div><div class="stat-l">Years</div></div><div class="reveal-d3"><div class="stat-n">100%</div><div class="stat-l">Satisfaction</div></div></section>
<section class="tess-section"><div class="container"><h2 class="reveal">Kind Words</h2><div class="tess-grid"><div class="tess-card reveal"><p class="tess-text">"${b.name} is a ${b.city} institution. Always reliable, always friendly."</p><div class="tess-auth"><div class="tess-av">JW</div><div><div style="font-weight:600">Joe W.</div></div></div></div><div class="tess-card reveal-d1"><p class="tess-text">"Old school quality with modern service. Highly recommend."</p><div class="tess-auth"><div class="tess-av">MP</div><div><div style="font-weight:600">Mary P.</div></div></div></div></div></div></section>
<section class="cta-section container reveal"><h3>${C.contactCta}</h3><p>Stop by and experience the difference.</p><a href="#contact" class="btn">Contact</a></section>
<section id="contact" class="contact-section"><h2 class="reveal">${C.contactCta}</h2><p class="reveal-d1">${b.phone ? b.phone : "Stop by or give us a call"}</p><div class="c-grid reveal-d2">${b.phone ? `<div class="c-item">${SVG.phone} ${b.phone}</div>` : ""}<div class="c-item">${SVG.map} ${b.address || b.city}</div><div class="c-item">${SVG.clock} Mon&ndash;Sat 8am&ndash;6pm</div></div><a href="${b.phone ? "tel:"+b.phone : "#"}" class="btn reveal-d3">${b.phone || "Contact"}</a></section>
<footer class="footer">&copy; ${new Date().getFullYear()} ${b.name} &middot; ${b.city} &middot; EST. ${new Date().getFullYear()}</footer>`;
  return {html: wrap(`${b.name} - ${b.category}`,C.subheadline,css,body),css,readme: rd(b)};
}

// ═══════════════════════════════════════════════════════════════
// DISPATCH + EXPORT
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
  html: string; css: string; readme: string;
  archetype: Arch; archetypeName: string;
  primaryHue: number; antiSlopWarnings: string[];
}

const BUILDERS: Record<Arch, (b: any, copy: any, P: Record<string,string>, N: Record<string,string>) => { html: string; css: string; readme: string }> = {
  brutalist: bBrutalist, softLuxury: bSoftLuxury, editorial: bEditorial,
  modernTech: bModernTech, warmLocal: bWarmLocal, boldMinimal: bBoldMinimal,
  photoFirst: bPhotoFirst, retro: bRetro,
};

export function buildPage(input: BuildInput): BuildOutput {
  const arch = input.forceArchetype || pickArch(input.category);
  const cfg = CFG[arch];
  const hue = cfg.hue[0] + Math.random() * (cfg.hue[1] - cfg.hue[0]);
  const P = prim(hue), N = neut(hue);
  const b = { name: input.name, category: input.category, city: input.city, phone: input.phone, address: input.address, email: input.email };
  const copy = { headline: input.heroCopy.headline, subheadline: input.heroCopy.subheadline, cta: input.heroCopy.cta, story: input.aboutCopy.story, values: input.aboutCopy.values, services: input.servicesCopy.services, contactCta: input.contactCopy.cta };
  const result = BUILDERS[arch](b, copy, P, N);
  const warnings: string[] = [];
  const c = input.category.toLowerCase();
  if ((c.includes("tech") || c.includes("software")) && hue > 230 && hue < 270) warnings.push("Avoid default blue for tech");
  if (c.includes("cafe") && hue > 30 && hue < 60) warnings.push("Avoid default warm orange for cafe");
  return { ...result, archetype: arch, archetypeName: cfg.name, primaryHue: hue, antiSlopWarnings: warnings };
}
