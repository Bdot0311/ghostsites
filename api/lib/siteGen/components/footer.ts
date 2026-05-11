import type { DesignSystem, SiteCopy } from "../types";

export function renderFooter(ds: DesignSystem, copy: SiteCopy, business: { name: string; city: string }): string {
  const f = copy.footer;
  const year = new Date().getFullYear();

  switch (ds.layout.footerStyle) {
    case "multi-column":
      return `<footer class="footer"><div class="container">
        <div class="footer-grid">
          <div>
            <div class="footer-brand">${copy.nav.brand}</div>
            <p class="footer-tagline">${f.tagline}</p>
          </div>
          ${f.columns.map(col => `<div class="footer-col">
            <h4>${col.title}</h4>
            ${col.links.map(l => `<a href="#">${l}</a>`).join("")}
          </div>`).join("")}
        </div>
        <div class="footer-bottom">&copy; ${year} ${business.name} &middot; ${business.city}</div>
      </div></footer>`;

    case "branded":
      return `<footer class="footer"><div class="container">
        <div class="footer-brand">${copy.nav.brand}</div>
        <p class="footer-tagline">${f.tagline}</p>
        <div class="footer-links">
          ${copy.nav.links.map(l => `<a href="${l.href}">${l.label}</a>`).join("")}
        </div>
        <div class="footer-bottom">&copy; ${year} ${business.name} &middot; ${business.city}</div>
      </div></footer>`;

    case "minimal":
    default:
      return `<footer class="footer"><div class="container">
        <div class="footer-brand">${copy.nav.brand}</div>
        <div class="footer-bottom">&copy; ${year} ${business.name} &middot; ${business.city} &middot; ${f.tagline}</div>
      </div></footer>`;
  }
}
