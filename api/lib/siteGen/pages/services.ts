import type { DesignSystem, SiteCopy } from "../types";

export function buildServicesPage(_ds: DesignSystem, copy: SiteCopy): string {
  const sp = copy.servicesPage;
  const svc = copy.services;

  // Hero header
  const header = `<section class="page-content" style="background:var(--c-bg2);padding:calc(var(--sp)*1.2) 0 calc(var(--sp)*0.8)">
    <div class="container reveal">
      <h1 style="margin-bottom:1rem">${sp.headline}</h1>
      <p style="max-width:640px">${sp.intro}</p>
    </div>
  </section>`;

  // Main services from homepage
  const mainServices = `<section class="page-content"><div class="container">
    <div class="srv-grid">
      ${svc.items.map((s, i) => `<div class="srv-card reveal reveal-delay-${(i % 3) + 1}">
        <div class="srv-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/></svg>
        </div>
        <h4>${s.name}</h4>
        <p>${s.desc}</p>
        ${s.price ? `<div class="srv-price">${s.price}</div>` : ""}
        <a href="contact.html" class="btn btn-sm" style="margin-top:1rem">Book This Service</a>
      </div>`).join("")}
    </div>
  </div></section>`;

  // Detailed service breakdowns
  const details = `<section class="page-content" style="background:var(--c-bg2)"><div class="container">
    <div class="section-header reveal">
      <h2>Service Details</h2>
      <p>Everything you need to know before booking.</p>
    </div>
    ${sp.serviceDetails.map((sd, i) => `<div class="srv-detail reveal reveal-delay-${(i % 3) + 1}">
      <h3>${sd.name}</h3>
      <p>${sd.desc}</p>
      <ul>
        ${sd.features.map(f => `<li>${f}</li>`).join("")}
      </ul>
      ${sd.price ? `<div class="srv-price" style="margin-top:1rem">${sd.price}</div>` : ""}
    </div>`).join("")}
  </div></section>`;

  // CTA
  const cta = `<section class="cta-section page-content container">
    <div class="reveal">
      <h3>${copy.cta.headline}</h3>
      <p>${copy.cta.subheadline}</p>
      <a href="contact.html" class="btn btn-lg btn-light">${copy.cta.button}</a>
    </div>
  </section>`;

  return header + mainServices + details + cta;
}
