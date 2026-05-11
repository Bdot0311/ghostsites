import type { DesignSystem, SiteCopy } from "../types";

export function renderNav(ds: DesignSystem, copy: SiteCopy, currentPage: string): string {
  const cta = copy.hero.cta;
  const links = copy.nav.links.map(l => {
    const isActive = l.href === currentPage || (currentPage === "index.html" && l.href === "index.html");
    return `<a href="${l.href}" class="${isActive ? "active" : ""}">${l.label}</a>`;
  }).join("");

  const ctaBtn = `<a href="contact.html" class="btn btn-sm nav-cta">${cta}</a>`;

  if (ds.layout.navStyle === "floating") {
    return `<nav class="nav"><div class="container">
      <a href="index.html" class="nav-brand">${copy.nav.brand}</a>
      <div class="nav-links">${links}${ctaBtn}</div>
    </div></nav>`;
  }

  return `<nav class="nav"><div class="container">
    <a href="index.html" class="nav-brand">${copy.nav.brand}</a>
    <div class="nav-links">${links}${ctaBtn}</div>
  </div></nav>`;
}
