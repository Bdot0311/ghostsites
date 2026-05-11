import type { DesignSystem, SiteCopy } from "../types";

export function buildAboutPage(_ds: DesignSystem, copy: SiteCopy): string {
  const abt = copy.about;
  const testi = copy.testimonials;

  // Hero
  const hero = `<section class="page-content" style="background:var(--c-bg2);padding:calc(var(--sp)*1.2) 0 calc(var(--sp)*0.8)">
    <div class="container reveal">
      <h1 style="margin-bottom:1rem">${abt.headline}</h1>
      <p style="max-width:640px">The story behind ${copy.nav.brand}.</p>
    </div>
  </section>`;

  // Story
  const story = `<section class="page-content"><div class="container">
    <div class="about-grid">
      <div class="reveal"><img src="images/about.jpg" alt="About ${copy.nav.brand}"></div>
      <div class="reveal reveal-delay-1">
        <h2>Our Story</h2>
        <p>${abt.story}</p>
        <div class="about-values">
          ${abt.values.map(v => `<span>${v}</span>`).join("")}
        </div>
        ${abt.quote ? `<div class="about-quote">${abt.quote}</div>` : ""}
      </div>
    </div>
  </div></section>`;

  // Testimonials
  const testimonials = `<section class="page-content" style="background:var(--c-bg2)"><div class="container">
    <div class="section-header reveal"><h2>What Our Customers Say</h2></div>
    <div class="testi-grid">
      ${testi.map((t, i) => `<div class="testi-card reveal reveal-delay-${(i % 3) + 1}">
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

  // Full FAQ
  const faq = copy.faq;
  const faqSection = `<section class="page-content" id="faq"><div class="container">
    <div class="section-header reveal"><h2>Frequently Asked Questions</h2></div>
    <div style="max-width:720px;margin:0 auto">
      ${faq.map((f, i) => `<div class="faq-item reveal reveal-delay-${(i % 3) + 1}">
        <input type="checkbox" id="fa${i}">
        <label for="fa${i}">${f.q}<span class="faq-toggle">+</span></label>
        <div class="faq-answer">${f.a}</div>
      </div>`).join("")}
    </div>
  </div></section>`;

  return hero + story + testimonials + faqSection;
}
