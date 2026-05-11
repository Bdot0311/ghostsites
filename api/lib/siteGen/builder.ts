// siteGen/builder.ts — assembles a complete multi-page site
import { generateDesignSystem } from "./designer";
import { generateCopy } from "./copywriter";
import { generateCSS } from "./css";
import { generateJS } from "./js";
import { renderNav } from "./components/nav";
import { renderFooter } from "./components/footer";
import { buildHomePage } from "./pages/home";
import { buildServicesPage } from "./pages/services";
import { buildAboutPage } from "./pages/about";
import { buildContactPage } from "./pages/contact";
import type { BusinessInput, DesignSystem, SiteCopy, GeneratedSite, GeneratedPage } from "./types";

interface BuilderOptions {
  apiKey?: string;
  heroImageUrl?: string;
  aboutImageUrl?: string;
}

export async function buildSite(
  business: BusinessInput,
  options: BuilderOptions = {}
): Promise<GeneratedSite> {
  // 1. Generate unique design system
  const ds = generateDesignSystem(business);

  // 2. Generate all copy via AI
  const copy = await generateCopy(business, options.apiKey);

  // 3. Generate CSS
  const css = generateCSS(ds);

  // 4. Generate JS
  const js = generateJS();

  // 5. Use provided images or generate descriptions
  const heroImage = options.heroImageUrl || "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&h=900&fit=crop";
  const aboutImage = options.aboutImageUrl || heroImage;

  // 6. Build each page
  const pages: GeneratedPage[] = [
    {
      filename: "index.html",
      title: copy.hero.headline,
      html: wrapPage("index.html", copy.hero.headline, ds, copy, business, buildHomePage(ds, copy, heroImage), heroImage, aboutImage),
    },
    {
      filename: "services.html",
      title: `${copy.services.headline} — ${copy.nav.brand}`,
      html: wrapPage("services.html", `${copy.services.headline} — ${copy.nav.brand}`, ds, copy, business, buildServicesPage(ds, copy), heroImage, aboutImage),
    },
    {
      filename: "about.html",
      title: `${copy.about.headline} — ${copy.nav.brand}`,
      html: wrapPage("about.html", `${copy.about.headline} — ${copy.nav.brand}`, ds, copy, business, buildAboutPage(ds, copy), heroImage, aboutImage),
    },
    {
      filename: "contact.html",
      title: `${copy.contact.headline} — ${copy.nav.brand}`,
      html: wrapPage("contact.html", `${copy.contact.headline} — ${copy.nav.brand}`, ds, copy, business, buildContactPage(ds, copy, business), heroImage, aboutImage),
    },
  ];

  // 7. Generate README
  const readme = generateReadme(business, ds, copy);

  return { pages, css, js, readme, designSystem: ds, copy };
}

function wrapPage(
  currentPage: string,
  title: string,
  ds: DesignSystem,
  copy: SiteCopy,
  business: BusinessInput,
  bodyContent: string,
  _heroImage: string,
  _aboutImage: string,
): string {
  const nav = renderNav(ds, copy, currentPage);
  const footer = renderFooter(ds, copy, business);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${copy.hero.subheadline.slice(0, 155)}">
<link rel="stylesheet" href="css/style.css">
<link rel="icon" type="image/svg+xml" href="images/favicon.svg">
</head>
<body>
${nav}
<main class="page-content">
${bodyContent}
</main>
${footer}
<script src="js/main.js"></script>
</body>
</html>`;
}

function generateReadme(business: BusinessInput, ds: DesignSystem, copy: SiteCopy): string {
  return `# ${business.name} Website

${copy.hero.headline}

## Pages
- **index.html** — Homepage with hero, services preview, testimonials, FAQ
- **services.html** — Full services listing with detailed breakdowns
- **about.html** — Company story, testimonials, complete FAQ
- **contact.html** — Contact form with working submission

## Files
- css/style.css — All styles (generated from unique design system)
- js/main.js — Form handling, scroll animations, mobile nav
- images/hero.jpg — Hero image
- images/about.jpg — About page image
- images/favicon.svg — Site favicon

## Design System
- **Colors**: ${ds.description}
- **Fonts**: ${ds.fonts.heading.split(",")[0]} (headings), ${ds.fonts.body.split(",")[0]} (body)
- **Layout**: ${ds.layout.navStyle} nav, ${ds.layout.heroStyle} hero, ${ds.layout.footerStyle} footer

## Quick Changes
- Edit any text in the HTML files
- Edit colors and fonts in css/style.css (search for :root)
- Replace images in the images/ folder (keep same filenames)
- Contact form submits to /api/site/contact-form — configure endpoint in js/main.js

## Hosting
1. Upload all files to any static host (Netlify, Vercel, Cloudflare Pages)
2. Or drag the folder to [Netlify Drop](https://app.netlify.com/drop)

## Contact Form Setup
The form submits via fetch to an API endpoint. For static hosting without a backend:
- Use [Formspree](https://formspree.io): replace the fetch URL in js/main.js
- Or use [Getform](https://getform.io)
- Or connect to your own backend
`;
}
