import type { DesignSystem, SiteCopy } from "../types";

export function buildHomePage(ds: DesignSystem, copy: SiteCopy, heroImage: string): string {
  const h = copy.hero;
  const trust = copy.trust;

  let hero = "";
  if (ds.layout.heroStyle === "fullscreen") {
    hero = `<section class="hero">
      <div class="hero-bg"><img src="images/hero.jpg" alt="${h.headline}"></div>
      <div class="hero-overlay"></div>
      <div class="hero-inner reveal">
        <h1>${h.headline}</h1>
        <p>${h.subheadline}</p>
        <div class="hero-actions">
          <a href="contact.html" class="btn btn-lg">${h.cta}</a>
          <a href="services.html" class="btn btn-outline btn-lg">${h.ctaSecondary}</a>
        </div>
        ${h.badge ? `<div class="hero-badge">${h.badge}</div>` : ""}
      </div>
    </section>`;
  } else if (ds.layout.heroStyle === "split") {
    hero = `<section class="hero">
      <div class="hero-content reveal">
        <h1>${h.headline}</h1>
        <p>${h.subheadline}</p>
        <div class="hero-actions">
          <a href="contact.html" class="btn btn-lg">${h.cta}</a>
          <a href="services.html" class="btn btn-outline btn-lg">${h.ctaSecondary}</a>
        </div>
        ${h.badge ? `<div class="hero-badge">${h.badge}</div>` : ""}
      </div>
      <div class="hero-visual"><img src="images/hero.jpg" alt="${h.headline}"></div>
    </section>`;
  } else if (ds.layout.heroStyle === "centered") {
    hero = `<section class="hero">
      <div class="hero-inner reveal">
        <h1>${h.headline}</h1>
        <p>${h.subheadline}</p>
        <div class="hero-actions">
          <a href="contact.html" class="btn btn-lg">${h.cta}</a>
          <a href="services.html" class="btn btn-outline btn-lg">${h.ctaSecondary}</a>
        </div>
        ${h.badge ? `<div class="hero-badge">${h.badge}</div>` : ""}
      </div>
      <div class="hero-visual reveal reveal-delay-2"><img src="images/hero.jpg" alt="${h.headline}"></div>
    </section>`;
  } else {
    // overlapping
    hero = `<section class="hero">
      <div class="hero-grid container">
        <div class="hero-content reveal">
          <h1>${h.headline}</h1>
          <p>${h.subheadline}</p>
          <div class="hero-actions">
            <a href="contact.html" class="btn btn-lg">${h.cta}</a>
            <a href="services.html" class="btn btn-outline btn-lg">${h.ctaSecondary}</a>
          </div>
          ${h.badge ? `<div class="hero-badge">${h.badge}</div>` : ""}
        </div>
        <div class="hero-visual reveal reveal-delay-2"><img src="images/hero.jpg" alt="${h.headline}"></div>
      </div>
    </section>`;
  }

  // Trust bar
  const trustBar = `<section class="trust">
    <div class="container">
      ${trust.map(t => `<div class="trust-item">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <span>${t.label}${t.stat ? ` <strong>${t.stat}</strong>` : ""}</span>
      </div>`).join("")}
    </div>
  </section>`;

  // Services preview
  const svc = copy.services;
  const svcPreview = `<section class="page-content"><div class="container">
    <div class="section-header reveal">
      <h2>${svc.headline}</h2>
      <p>${svc.subheadline}</p>
    </div>
    <div class="srv-grid">
      ${svc.items.slice(0, 4).map((s, i) => `<div class="srv-card reveal reveal-delay-${i + 1}">
        <div class="srv-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/></svg>
        </div>
        <h4>${s.name}</h4>
        <p>${s.desc}</p>
        ${s.price ? `<div class="srv-price">${s.price}</div>` : ""}
      </div>`).join("")}
    </div>
    <div style="text-align:center;margin-top:2.5rem">
      <a href="services.html" class="btn btn-outline">View All Services</a>
    </div>
  </div></section>`;

  // About preview
  const abt = copy.about;
  const aboutPreview = `<section class="about-grid container page-content">
    <div class="reveal"><img src="images/about.jpg" alt="About ${copy.nav.brand}"></div>
    <div class="reveal reveal-delay-1">
      <h2>${abt.headline}</h2>
      <p>${abt.story.substring(0, abt.story.length * 0.6)}...</p>
      <div class="about-values">
        ${abt.values.map(v => `<span>${v}</span>`).join("")}
      </div>
      <a href="about.html" class="btn" style="margin-top:1.5rem">Read Our Story</a>
    </div>
  </section>`;

  // Testimonials
  const testi = copy.testimonials;
  const testimonials = `<section style="background:var(--c-bg2)" class="page-content"><div class="container">
    <div class="section-header reveal">
      <h2>What People Say</h2>
    </div>
    <div class="testi-grid">
      ${testi.map((t, i) => `<div class="testi-card reveal reveal-delay-${i + 1}">
        <div class="testi-stars">★★★★★</div>
        <p class="testi-text">${t.text}</p>
        <div class="testi-author">
          <div class="testi-avatar">${t.author.split(" ").map(w => w[0]).join("")}</div>
          <div>
            <div class="testi-name">${t.author}</div>
            <div class="testi-role">${t.role}</div>
          </div>
        </div>
      </div>`).join("")}
    </div>
  </div></section>`;

  // CTA
  const cta = copy.cta;
  const ctaSection = `<section class="cta-section page-content container">
    <div class="reveal">
      <h3>${cta.headline}</h3>
      <p>${cta.subheadline}</p>
      <a href="contact.html" class="btn btn-lg btn-light">${cta.button}</a>
    </div>
  </section>`;

  // FAQ
  const faq = copy.faq.slice(0, 4);
  const faqSection = `<section class="page-content"><div class="container">
    <div class="section-header reveal"><h2>Common Questions</h2></div>
    <div style="max-width:720px;margin:0 auto">
      ${faq.map((f, i) => `<div class="faq-item reveal reveal-delay-${i + 1}">
        <input type="checkbox" id="fh${i}">
        <label for="fh${i}">${f.q}<span class="faq-toggle">+</span></label>
        <div class="faq-answer">${f.a}</div>
      </div>`).join("")}
    </div>
    <div style="text-align:center;margin-top:2rem">
      <a href="about.html#faq" class="btn btn-outline">View All FAQs</a>
    </div>
  </div></section>`;

  return hero + trustBar + svcPreview + aboutPreview + testimonials + ctaSection + faqSection;
}
