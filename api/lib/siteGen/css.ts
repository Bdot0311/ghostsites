// siteGen/css.ts — generates complete CSS from design system
import type { DesignSystem } from "./types";

export function generateCSS(ds: DesignSystem): string {
  const c = ds.colors;
  const f = ds.fonts;
  const s = ds.spacing;
  const e = ds.effects;

  return `@import url('https://fonts.googleapis.com/css2?family=${f.headingUrl}&family=${f.bodyUrl}&display=swap');

:root{
  --c-p:${c.primary};--c-pl:${c.primaryLight};--c-pd:${c.primaryDark};--c-s:${c.secondary};--c-a:${c.accent};
  --c-bg:${c.bg};--c-bg2:${c.bgAlt};--c-su:${c.surface};--c-su2:${c.surfaceAlt};
  --c-t:${c.text};--c-tl:${c.textLight};--c-tm:${c.textMuted};--c-bd:${c.border};--c-bdl:${c.borderLight};
  --c-w:${c.white};--c-bk:${c.black};
  --f-h:${f.heading};--f-b:${f.body};--f-a:${f.accent};
  --sp:${s.sectionPad};--mw:${s.contentMaxWidth};--gg:${s.gridGap};
  --r:${s.borderRadius};--rs:${s.borderRadiusSm};--rl:${s.borderRadiusLg};
  --sh:${e.shadowSm};--shd:${e.shadowMd};--shl:${e.shadowLg};--tr:${e.transition};
}

*,*::before,*::after{box-sizing:border-box;margin:0}
html{-webkit-font-smoothing:antialiased;scroll-behavior:smooth}
img{max-width:100%;display:block;height:auto}
a{color:inherit;text-decoration:none}
body{font-family:var(--f-b);color:var(--c-t);background:var(--c-bg);line-height:1.7;font-size:16px;overflow-x:hidden}

/* === NAV === */
${navStyles(ds)}

/* === HERO === */
${heroStyles(ds)}

/* === LAYOUT === */
.container{max-width:var(--mw);margin:0 auto;padding:0 clamp(1.25rem,5vw,2.5rem)}
section{padding:var(--sp) 0}

/* === TYPOGRAPHY === */
h1,h2,h3,h4,h5,h6{font-family:var(--f-h);font-weight:600;line-height:1.15;color:var(--c-t);letter-spacing:-0.02em}
h1{font-size:clamp(2.5rem,7vw,5.5rem)}
h2{font-size:clamp(2rem,4.5vw,3.5rem)}
h3{font-size:clamp(1.5rem,3vw,2.25rem)}
p{font-size:1.0625rem;color:var(--c-tl);line-height:1.8}

/* === BUTTONS === */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:1rem 2.25rem;background:var(--c-p);color:var(--c-w);border-radius:var(--r);font-family:var(--f-h);font-weight:600;font-size:0.9375rem;border:none;cursor:pointer;transition:var(--tr);text-decoration:none}
.btn:hover{transform:translateY(-2px);box-shadow:var(--shd);background:var(--c-pd)}
.btn-outline{background:transparent;color:var(--c-p);border:2px solid var(--c-p)}
.btn-outline:hover{background:var(--c-p);color:var(--c-w)}
.btn-light{background:var(--c-w);color:var(--c-t)}
.btn-light:hover{background:var(--c-bg2)}
.btn-lg{padding:1.125rem 2.75rem;font-size:1rem}
.btn-sm{padding:0.75rem 1.5rem;font-size:0.875rem}

/* === TRUST BAR === */
.trust{background:var(--c-su);border-bottom:1px solid var(--c-bd);padding:1.25rem 0}
.trust .container{display:flex;justify-content:space-around;flex-wrap:wrap;gap:1rem 2rem}
.trust-item{display:flex;align-items:center;gap:0.5rem;font-size:0.8125rem;color:var(--c-tm);font-weight:500}
.trust-item svg{width:18px;height:18px;color:var(--c-p);flex-shrink:0}

/* === SERVICES === */
.srv-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:var(--gg)}
.srv-card{background:var(--c-su);border:1px solid var(--c-bd);border-radius:var(--r);padding:2.25rem;transition:var(--tr);position:relative}
.srv-card:hover{transform:translateY(-6px);box-shadow:var(--shl);border-color:var(--c-p)}
.srv-card h4{font-family:var(--f-h);font-size:1.25rem;margin-bottom:0.75rem}
.srv-card p{color:var(--c-tl);font-size:0.9375rem;line-height:1.7}
.srv-price{font-family:var(--f-h);font-size:1.375rem;color:var(--c-p);font-weight:700;margin-top:0.75rem}
.srv-icon{width:52px;height:52px;border-radius:var(--r);background:var(--c-pl);color:var(--c-p);display:flex;align-items:center;justify-content:center;margin-bottom:1.25rem}

/* === ABOUT === */
.about-grid{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center}
.about-grid img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:var(--rl);box-shadow:var(--shl)}
.about-grid p{color:var(--c-tl);line-height:1.9;font-size:1.0625rem}
.about-values{display:flex;flex-wrap:wrap;gap:0.75rem;margin-top:1.5rem}
.about-values span{background:var(--c-pl);color:var(--c-pd);padding:0.5rem 1rem;border-radius:100px;font-size:0.8125rem;font-weight:600}
.about-quote{margin-top:2rem;padding:1.5rem 0 1.5rem 1.5rem;border-left:3px solid var(--c-p);color:var(--c-tl);font-style:italic;font-size:1.125rem;line-height:1.7}

/* === TESTIMONIALS === */
.testi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:var(--gg)}
.testi-card{background:var(--c-su);border:1px solid var(--c-bd);border-radius:var(--r);padding:2rem;position:relative}
.testi-card::before{content:'"';position:absolute;top:0.75rem;right:1.25rem;font-family:var(--f-h);font-size:4rem;color:var(--c-pl);line-height:1;opacity:0.6}
.testi-stars{color:var(--c-a);margin-bottom:1rem;font-size:0.875rem;letter-spacing:0.15em}
.testi-text{line-height:1.8;color:var(--c-tl);font-style:italic;margin-bottom:1.5rem}
.testi-author{display:flex;align-items:center;gap:0.75rem}
.testi-avatar{width:40px;height:40px;border-radius:50%;background:var(--c-p);display:flex;align-items:center;justify-content:center;color:var(--c-w);font-weight:700;font-size:0.875rem}
.testi-name{font-weight:600;color:var(--c-t)}
.testi-role{font-size:0.8125rem;color:var(--c-tm)}

/* === FAQ === */
.faq-item{border-bottom:1px solid var(--c-bd)}
.faq-item input{display:none}
.faq-item label{display:flex;justify-content:space-between;align-items:center;padding:1.25rem 0;cursor:pointer;font-weight:600;color:var(--c-t);font-family:var(--f-h);font-size:1.0625rem;gap:1rem}
.faq-toggle{font-size:1.5rem;color:var(--c-p);transition:transform .3s;flex-shrink:0}
.faq-item input:checked~label .faq-toggle{transform:rotate(45deg)}
.faq-answer{max-height:0;overflow:hidden;transition:max-height .4s;line-height:1.7;color:var(--c-tl);font-size:1rem}
.faq-item input:checked~.faq-answer{max-height:300px;padding-bottom:1.25rem}

/* === CTA === */
.cta-section{text-align:center;padding:calc(var(--sp) * 1.2) 2rem;border-radius:var(--rl);color:var(--c-w);position:relative;overflow:hidden;margin:var(--sp) 0}
.cta-section::before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,var(--c-pd) 0%,var(--c-p) 100%);z-index:0}
.cta-section>*{position:relative;z-index:1}
.cta-section h3{font-size:clamp(2rem,4vw,3.5rem);margin-bottom:1rem;color:var(--c-w)}
.cta-section p{color:rgba(255,255,255,0.8);margin-bottom:2rem;font-size:1.125rem;max-width:600px;margin-left:auto;margin-right:auto}

/* === CONTACT === */
.contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:start}
.contact-info h3{margin-bottom:1rem}
.contact-info p{margin-bottom:2rem}
.contact-detail{display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem;color:var(--c-tl)}
.contact-detail svg{color:var(--c-p);width:20px;height:20px;flex-shrink:0}
.contact-detail a{color:var(--c-p);font-weight:500}
.contact-form{background:var(--c-su);border:1px solid var(--c-bd);border-radius:var(--r);padding:2.5rem}
.form-group{margin-bottom:1.25rem}
.form-group label{display:block;font-size:0.8125rem;font-weight:600;color:var(--c-t);margin-bottom:0.375rem;text-transform:uppercase;letter-spacing:0.05em}
.form-group input,.form-group textarea{width:100%;padding:0.875rem 1rem;border:1px solid var(--c-bd);border-radius:var(--r);font-family:var(--f-b);font-size:0.9375rem;color:var(--c-t);background:var(--c-bg);transition:var(--tr)}
.form-group input:focus,.form-group textarea:focus{outline:none;border-color:var(--c-p);box-shadow:0 0 0 3px ${c.primaryLight.replace("hsl", "hsla").replace(")", " / 30%)")}}
.form-group textarea{min-height:120px;resize:vertical}
.form-success{display:none;padding:1rem;background:var(--c-pl);color:var(--c-pd);border-radius:var(--r);font-weight:500;margin-bottom:1rem}
.form-error{display:none;padding:1rem;background:#fee2e2;color:#991b1b;border-radius:var(--r);font-weight:500;margin-bottom:1rem}

/* === SERVICES PAGE === */
.srv-detail{background:var(--c-su);border:1px solid var(--c-bd);border-radius:var(--r);padding:2.5rem;margin-bottom:1.5rem}
.srv-detail h3{margin-bottom:0.5rem}
.srv-detail p{color:var(--c-tl);margin-bottom:1.25rem}
.srv-detail ul{list-style:none;padding:0}
.srv-detail li{padding:0.375rem 0;padding-left:1.5rem;position:relative;color:var(--c-tl)}
.srv-detail li::before{content:"";position:absolute;left:0;top:0.75rem;width:6px;height:6px;border-radius:50%;background:var(--c-p)}

/* === FOOTER === */
${footerStyles(ds)}

/* === SECTION HEADER === */
.section-header{text-align:center;max-width:640px;margin:0 auto 3.5rem}
.section-header h2{margin-bottom:0.75rem}
.section-header p{font-size:1.125rem}

/* === PAGE TRANSITION === */
.page-content{animation:fadeIn 0.5s ease-out}
@keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}

/* === SCROLL REVEAL === */
.reveal{opacity:0;transform:translateY(40px);transition:opacity 0.7s ease-out,transform 0.7s ease-out}
.reveal.visible{opacity:1;transform:translateY(0)}
.reveal-delay-1{transition-delay:0.1s}
.reveal-delay-2{transition-delay:0.2s}
.reveal-delay-3{transition-delay:0.3s}

/* === RESPONSIVE === */
@media(max-width:768px){
  .about-grid,.contact-grid{grid-template-columns:1fr!important;gap:2rem}
  .srv-grid{grid-template-columns:1fr!important}
  .testi-grid{grid-template-columns:1fr!important}
  .trust .container{flex-direction:column;align-items:center;gap:0.75rem}
  .hero-inner h1{font-size:clamp(2rem,10vw,3.5rem)!important}
  .about-grid img{aspect-ratio:16/9}
  .cta-section{margin:3rem 1rem;padding:3rem 1.5rem}
  .srv-detail{padding:1.5rem}
}
@media(max-width:480px){
  .btn{width:100%;justify-content:center}
  .hero-actions{flex-direction:column}
  .contact-form{padding:1.5rem}
}
`;
}

function navStyles(ds: DesignSystem): string {
  const c = ds.colors;
  switch (ds.layout.navStyle) {
    case "fixed":
      return `.nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);border-bottom:1px solid ${c.border};padding:0}
.nav .container{display:flex;justify-content:space-between;align-items:center;height:64px}
.nav-brand{font-family:var(--f-h);font-size:1.25rem;font-weight:600;color:var(--c-t)}
.nav-links{display:flex;gap:2rem;align-items:center}
.nav-links a{font-size:0.875rem;font-weight:500;color:var(--c-tl);transition:var(--tr)}
.nav-links a:hover{color:var(--c-p)}
.nav-links a.active{color:var(--c-p)}
.nav-cta{padding:0.625rem 1.25rem;font-size:0.8125rem}
body{padding-top:64px}`;
    case "transparent":
      return `.nav{position:absolute;top:0;left:0;right:0;z-index:100;padding:1.5rem 0}
.nav .container{display:flex;justify-content:space-between;align-items:center}
.nav-brand{font-family:var(--f-h);font-size:1.25rem;font-weight:600;color:#fff}
.nav-links{display:flex;gap:2rem;align-items:center}
.nav-links a{font-size:0.875rem;font-weight:500;color:rgba(255,255,255,0.8);transition:var(--tr)}
.nav-links a:hover{color:#fff}
.nav-links a.active{color:#fff;border-bottom:2px solid #fff}
.nav-cta{background:#fff;color:var(--c-t);padding:0.625rem 1.25rem;font-size:0.8125rem}
.nav-cta:hover{background:rgba(255,255,255,0.9)}`;
    case "floating":
      return `.nav{position:fixed;top:1rem;left:50%;transform:translateX(-50%);z-index:100;background:rgba(255,255,255,0.95);backdrop-filter:blur(12px);border:1px solid ${c.border};border-radius:100px;padding:0.75rem 1.5rem;box-shadow:var(--sh);max-width:fit-content}
.nav .container{display:flex;gap:2rem;align-items:center;width:auto;padding:0}
.nav-brand{font-family:var(--f-h);font-size:1.125rem;font-weight:600;color:var(--c-t)}
.nav-links{display:flex;gap:1.5rem;align-items:center}
.nav-links a{font-size:0.8125rem;font-weight:500;color:var(--c-tl);transition:var(--tr);white-space:nowrap}
.nav-links a:hover{color:var(--c-p)}
.nav-links a.active{color:var(--c-p);font-weight:600}
.nav-cta{padding:0.5rem 1.25rem;font-size:0.8125rem;white-space:nowrap}
body{padding-top:80px}`;
    case "minimal":
    default:
      return `.nav{padding:1.5rem 0;border-bottom:1px solid ${c.border}}
.nav .container{display:flex;justify-content:space-between;align-items:center}
.nav-brand{font-family:var(--f-h);font-size:1.25rem;font-weight:600;color:var(--c-t)}
.nav-links{display:flex;gap:2rem;align-items:center}
.nav-links a{font-size:0.875rem;font-weight:500;color:var(--c-tl);transition:var(--tr)}
.nav-links a:hover{color:var(--c-p)}
.nav-links a.active{color:var(--c-p)}
.nav-cta{padding:0.625rem 1.25rem;font-size:0.8125rem}`;
  }
}

function heroStyles(ds: DesignSystem): string {
  const c = ds.colors;
  const isTransparentNav = ds.layout.navStyle === "transparent";
  const topPad = isTransparentNav ? "0" : "0";

  switch (ds.layout.heroStyle) {
    case "fullscreen":
      return `.hero{position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;overflow:hidden;margin-top:${isTransparentNav ? "0" : "-64px"}}
.hero-bg{position:absolute;inset:0;z-index:0}
.hero-bg img{width:100%;height:100%;object-fit:cover}
.hero-overlay{position:absolute;inset:0;${ds.effects.heroOverlay};z-index:1}
.hero-inner{position:relative;z-index:2;max-width:720px;padding:2rem}
.hero-inner h1{font-family:var(--f-h);font-size:clamp(3rem,8vw,6rem);line-height:0.95;font-weight:700;color:#fff;margin-bottom:1.5rem}
.hero-inner p{color:rgba(255,255,255,0.8);font-size:1.25rem;line-height:1.7;margin-bottom:2.5rem}
.hero-actions{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}
.hero-badge{display:inline-flex;align-items:center;gap:0.75rem;background:rgba(255,255,255,0.1);backdrop-filter:blur(8px);padding:0.75rem 1.5rem;border-radius:100px;margin-top:2rem;color:rgba(255,255,255,0.9);border:1px solid rgba(255,255,255,0.15);font-size:0.875rem}`;
    case "split":
      return `.hero{position:relative;min-height:90vh;display:grid;grid-template-columns:1fr 1fr;align-items:center;overflow:hidden}
.hero-content{padding:clamp(2rem,5vw,4rem);max-width:560px;margin-left:auto}
.hero-content h1{font-family:var(--f-h);font-size:clamp(2.5rem,5vw,4.5rem);line-height:1;font-weight:700;color:var(--c-t);margin-bottom:1.25rem}
.hero-content p{color:var(--c-tl);font-size:1.125rem;line-height:1.7;margin-bottom:2rem}
.hero-actions{display:flex;gap:1rem;flex-wrap:wrap}
.hero-visual{position:relative;height:100%;min-height:500px}
.hero-visual img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero-badge{display:inline-flex;align-items:center;gap:0.75rem;background:var(--c-pl);padding:0.625rem 1.25rem;border-radius:100px;margin-top:1.5rem;color:var(--c-pd);font-size:0.8125rem;font-weight:600}
@media(max-width:768px){.hero{grid-template-columns:1fr}.hero-visual{min-height:300px;order:-1}}`;
    case "centered":
      return `.hero{padding:calc(var(--sp)*1.5) 0;text-align:center;background:var(--c-su2)}
.hero-inner{max-width:680px;margin:0 auto}
.hero-inner h1{font-family:var(--f-h);font-size:clamp(2.5rem,6vw,5rem);line-height:1;font-weight:700;color:var(--c-t);margin-bottom:1.25rem}
.hero-inner p{color:var(--c-tl);font-size:1.125rem;line-height:1.7;margin-bottom:2rem}
.hero-actions{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}
.hero-visual{margin-top:3rem;border-radius:var(--rl);overflow:hidden;box-shadow:var(--shl)}
.hero-visual img{width:100%;aspect-ratio:21/9;object-fit:cover}
.hero-badge{display:inline-flex;align-items:center;gap:0.75rem;background:var(--c-pl);padding:0.625rem 1.25rem;border-radius:100px;margin-top:1.5rem;color:var(--c-pd);font-size:0.8125rem;font-weight:600}`;
    case "overlapping":
      return `.hero{position:relative;padding:calc(var(--sp)*1.5) 0 0;overflow:hidden}
.hero-grid{display:grid;grid-template-columns:1.2fr 1fr;gap:0;align-items:end}
.hero-content{padding-bottom:4rem;max-width:540px}
.hero-content h1{font-family:var(--f-h);font-size:clamp(2.5rem,5vw,4.5rem);line-height:1;font-weight:700;color:var(--c-t);margin-bottom:1.25rem}
.hero-content p{color:var(--c-tl);font-size:1.125rem;line-height:1.7;margin-bottom:2rem}
.hero-actions{display:flex;gap:1rem;flex-wrap:wrap}
.hero-visual{position:relative;margin-bottom:-4rem}
.hero-visual img{width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:var(--rl) 0 0 var(--rl);box-shadow:var(--shl)}
.hero-badge{display:inline-flex;align-items:center;gap:0.75rem;background:var(--c-pl);padding:0.625rem 1.25rem;border-radius:100px;margin-top:1.5rem;color:var(--c-pd);font-size:0.8125rem;font-weight:600}
.hero+section{padding-top:calc(var(--sp) + 4rem)}
@media(max-width:768px){.hero-grid{grid-template-columns:1fr}.hero-visual{margin-bottom:0}.hero-visual img{border-radius:var(--r)}.hero+section{padding-top:var(--sp)}}`;
    default:
      return `.hero{position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;overflow:hidden}
.hero-bg{position:absolute;inset:0;z-index:0}
.hero-bg img{width:100%;height:100%;object-fit:cover}
.hero-overlay{position:absolute;inset:0;background:${ds.effects.heroOverlay};z-index:1}
.hero-inner{position:relative;z-index:2;max-width:720px;padding:2rem}
.hero-inner h1{font-family:var(--f-h);font-size:clamp(3rem,8vw,6rem);line-height:0.95;font-weight:700;color:#fff;margin-bottom:1.5rem}
.hero-inner p{color:rgba(255,255,255,0.8);font-size:1.25rem;line-height:1.7;margin-bottom:2.5rem}
.hero-actions{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}
.hero-badge{display:inline-flex;align-items:center;gap:0.75rem;background:rgba(255,255,255,0.1);backdrop-filter:blur(8px);padding:0.75rem 1.5rem;border-radius:100px;margin-top:2rem;color:rgba(255,255,255,0.9);border:1px solid rgba(255,255,255,0.15);font-size:0.875rem}`;
  }
}

function footerStyles(ds: DesignSystem): string {
  const c = ds.colors;
  switch (ds.layout.footerStyle) {
    case "multi-column":
      return `.footer{background:var(--c-bk);color:var(--c-w);padding:4rem 0 2rem}
.footer-grid{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:3rem;margin-bottom:3rem}
.footer-brand{font-family:var(--f-h);font-size:1.5rem;font-weight:600;margin-bottom:1rem;color:var(--c-w)}
.footer-tagline{color:rgba(255,255,255,0.6);font-size:0.9375rem;line-height:1.7;max-width:300px}
.footer-col h4{font-size:0.8125rem;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.5);margin-bottom:1rem;font-weight:600}
.footer-col a{display:block;color:rgba(255,255,255,0.7);font-size:0.875rem;padding:0.375rem 0;transition:var(--tr)}
.footer-col a:hover{color:var(--c-w)}
.footer-bottom{border-top:1px solid rgba(255,255,255,0.1);padding-top:1.5rem;text-align:center;color:rgba(255,255,255,0.4);font-size:0.8125rem}
@media(max-width:768px){.footer-grid{grid-template-columns:1fr;gap:2rem}}`;
    case "branded":
      return `.footer{padding:3rem 0;text-align:center;border-top:1px solid var(--c-bd)}
.footer-brand{font-family:var(--f-h);font-size:1.75rem;font-weight:600;margin-bottom:0.5rem;color:var(--c-t)}
.footer-tagline{color:var(--c-tm);font-size:0.9375rem;margin-bottom:1.5rem}
.footer-links{display:flex;justify-content:center;gap:2rem;margin-bottom:1.5rem;flex-wrap:wrap}
.footer-links a{color:var(--c-tl);font-size:0.875rem;transition:var(--tr)}
.footer-links a:hover{color:var(--c-p)}
.footer-bottom{color:var(--c-tm);font-size:0.8125rem}`;
    case "minimal":
    default:
      return `.footer{padding:2rem 0;border-top:1px solid var(--c-bd);text-align:center}
.footer-brand{font-family:var(--f-h);font-size:1rem;font-weight:600;color:var(--c-t)}
.footer-bottom{color:var(--c-tm);font-size:0.8125rem;margin-top:0.5rem}`;
  }
}
