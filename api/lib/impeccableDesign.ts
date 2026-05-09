// impeccableDesign.ts — Production-grade design system for GhostSites
// Based on pbakaus/impeccable skill: OKLCH colors, tinted neutrals, rhythmic spacing, anti-slop checks

// ═══════════════════════════════════════════════════════════
// OKLCH COLOR SYSTEM
// ═══════════════════════════════════════════════════════════

function oklch(l: number, c: number, h: number): string {
  return `oklch(${l}% ${c} ${h})`;
}

function generatePrimaryPalette(hue: number) {
  return {
    50: oklch(97, 0.02, hue),
    100: oklch(93, 0.04, hue),
    200: oklch(86, 0.08, hue),
    300: oklch(76, 0.12, hue),
    400: oklch(65, 0.18, hue),
    500: oklch(55, 0.22, hue),
    600: oklch(45, 0.20, hue),
    700: oklch(35, 0.16, hue),
    800: oklch(25, 0.10, hue),
    900: oklch(15, 0.05, hue),
  };
}

function generateNeutralPalette(hue: number) {
  // Tinted neutrals — never pure gray
  const c = 0.008; // tiny chroma for cohesion
  return {
    0: oklch(100, c * 0.5, hue),
    50: oklch(98, c, hue),
    100: oklch(95, c, hue),
    200: oklch(88, c, hue),
    300: oklch(75, c, hue),
    400: oklch(62, c, hue),
    500: oklch(50, c, hue),
    600: oklch(38, c, hue),
    700: oklch(28, c, hue),
    800: oklch(18, c, hue),
    900: oklch(12, c, hue),
    950: oklch(8, c, hue),
  };
}

// ═══════════════════════════════════════════════════════════
// 8 DESIGN ARCHETYPES
// ═══════════════════════════════════════════════════════════

export type DesignArchetype =
  | "brutalist"
  | "softLuxury"
  | "editorial"
  | "modernTech"
  | "warmLocal"
  | "boldMinimal"
  | "photoFirst"
  | "retro";

const ARCHETYPE_CONFIG: Record<
  DesignArchetype,
  {
    name: string;
    hueBias: number;
    hueRange: [number, number];
    fontHeading: string;
    fontBody: string;
    spacing: "tight" | "normal" | "airy";
    borderRadius: string;
    shadowIntensity: "none" | "subtle" | "dramatic";
    categoryTags: string[];
  }
> = {
  brutalist: {
    name: "Brutalist",
    hueBias: 0,
    hueRange: [0, 360],
    fontHeading: "system-ui",
    fontBody: "system-ui",
    spacing: "tight",
    borderRadius: "0px",
    shadowIntensity: "none",
    categoryTags: ["contractor", "auto", "mechanic", "construction"],
  },
  softLuxury: {
    name: "Soft Luxury",
    hueBias: 320,
    hueRange: [300, 340],
    fontHeading: "Georgia, 'Times New Roman', serif",
    fontBody: "'Helvetica Neue', Arial, sans-serif",
    spacing: "airy",
    borderRadius: "24px",
    shadowIntensity: "subtle",
    categoryTags: ["salon", "spa", "wedding", "photographer", "estate"],
  },
  editorial: {
    name: "Editorial",
    hueBias: 30,
    hueRange: [20, 45],
    fontHeading: "'Playfair Display', Georgia, serif",
    fontBody: "'Source Sans 3', 'Helvetica Neue', sans-serif",
    spacing: "normal",
    borderRadius: "0px",
    shadowIntensity: "none",
    categoryTags: ["lawyer", "accountant", "consulting", "architect"],
  },
  modernTech: {
    name: "Modern Tech",
    hueBias: 250,
    hueRange: [230, 270],
    fontHeading: "'Inter', system-ui, sans-serif",
    fontBody: "'Inter', system-ui, sans-serif",
    spacing: "normal",
    borderRadius: "12px",
    shadowIntensity: "subtle",
    categoryTags: ["tech", "software", "marketing", "agency"],
  },
  warmLocal: {
    name: "Warm Local",
    hueBias: 45,
    hueRange: [30, 60],
    fontHeading: "'Georgia', serif",
    fontBody: "'Georgia', serif",
    spacing: "normal",
    borderRadius: "8px",
    shadowIntensity: "subtle",
    categoryTags: ["cafe", "bakery", "restaurant", "grocery"],
  },
  boldMinimal: {
    name: "Bold Minimal",
    hueBias: 0,
    hueRange: [0, 360],
    fontHeading: "system-ui, sans-serif",
    fontBody: "system-ui, sans-serif",
    spacing: "airy",
    borderRadius: "0px",
    shadowIntensity: "none",
    categoryTags: ["gym", "fitness", "trainer", "studio"],
  },
  photoFirst: {
    name: "Photo-First",
    hueBias: 180,
    hueRange: [160, 200],
    fontHeading: "'Georgia', serif",
    fontBody: "system-ui, sans-serif",
    spacing: "normal",
    borderRadius: "0px",
    shadowIntensity: "none",
    categoryTags: ["photographer", "realtor", "venue", "designer"],
  },
  retro: {
    name: "Retro",
    hueBias: 30,
    hueRange: [15, 45],
    fontHeading: "'Courier New', monospace",
    fontBody: "'Georgia', serif",
    spacing: "normal",
    borderRadius: "4px",
    shadowIntensity: "subtle",
    categoryTags: ["diner", "barber", "vintage", "record"],
  },
};

function pickArchetype(category: string): DesignArchetype {
  const cat = category.toLowerCase();
  for (const [key, config] of Object.entries(ARCHETYPE_CONFIG)) {
    if (config.categoryTags.some((tag) => cat.includes(tag))) {
      return key as DesignArchetype;
    }
  }
  // Default distribution — avoid always picking modernTech
  const defaults: DesignArchetype[] = ["warmLocal", "editorial", "boldMinimal", "softLuxury"];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

// ═══════════════════════════════════════════════════════════
// MOTION TOKENS
// ═══════════════════════════════════════════════════════════

function generateMotionTokens() {
  return {
    durationFast: "150ms",
    durationNormal: "300ms",
    durationSlow: "500ms",
    easeOut: "cubic-bezier(0.16, 1, 0.3, 1)", // expo-out
    easeIn: "cubic-bezier(0.7, 0, 0.84, 0)",
    easeInOut: "cubic-bezier(0.65, 0, 0.35, 1)",
    staggerDelay: "60ms",
  };
}

// ═══════════════════════════════════════════════════════════
// CSS GENERATION
// ═══════════════════════════════════════════════════════════

function generateBaseCSS(
  archetype: DesignArchetype,
  primaryHue: number,
  colors: { primary: Record<string, string>; neutral: Record<string, string> },
  fonts: { heading: string; body: string },
  motion: ReturnType<typeof generateMotionTokens>,
): string {
  const config = ARCHETYPE_CONFIG[archetype];
  const spacingScale = config.spacing === "tight"
    ? { xs: "0.25rem", sm: "0.5rem", md: "1rem", lg: "1.5rem", xl: "2rem", "2xl": "3rem" }
    : config.spacing === "airy"
    ? { xs: "0.5rem", sm: "1rem", md: "2rem", lg: "3rem", xl: "4.5rem", "2xl": "7rem" }
    : { xs: "0.5rem", sm: "0.75rem", md: "1.25rem", lg: "2rem", xl: "3rem", "2xl": "5rem" };

  return `
:root {
  /* Primary */
  --color-primary-50: ${colors.primary[50]};
  --color-primary-100: ${colors.primary[100]};
  --color-primary-200: ${colors.primary[200]};
  --color-primary-300: ${colors.primary[300]};
  --color-primary-400: ${colors.primary[400]};
  --color-primary-500: ${colors.primary[500]};
  --color-primary-600: ${colors.primary[600]};
  --color-primary-700: ${colors.primary[700]};
  --color-primary-800: ${colors.primary[800]};
  --color-primary-900: ${colors.primary[900]};

  /* Neutrals */
  --color-neutral-0: ${colors.neutral[0]};
  --color-neutral-50: ${colors.neutral[50]};
  --color-neutral-100: ${colors.neutral[100]};
  --color-neutral-200: ${colors.neutral[200]};
  --color-neutral-300: ${colors.neutral[300]};
  --color-neutral-400: ${colors.neutral[400]};
  --color-neutral-500: ${colors.neutral[500]};
  --color-neutral-600: ${colors.neutral[600]};
  --color-neutral-700: ${colors.neutral[700]};
  --color-neutral-800: ${colors.neutral[800]};
  --color-neutral-900: ${colors.neutral[900]};
  --color-neutral-950: ${colors.neutral[950]};

  /* Semantic */
  --color-bg: ${colors.neutral[0]};
  --color-text: ${colors.neutral[900]};
  --color-text-secondary: ${colors.neutral[500]};
  --color-border: ${colors.neutral[200]};
  --color-surface: ${colors.neutral[50]};
  --color-surface-elevated: ${colors.neutral[0]};

  /* Typography */
  --font-heading: ${fonts.heading};
  --font-body: ${fonts.body};

  /* Spacing */
  --space-xs: ${spacingScale.xs};
  --space-sm: ${spacingScale.sm};
  --space-md: ${spacingScale.md};
  --space-lg: ${spacingScale.lg};
  --space-xl: ${spacingScale.xl};
  --space-2xl: ${spacingScale["2xl"]};

  /* Motion */
  --motion-duration-fast: ${motion.durationFast};
  --motion-duration-normal: ${motion.durationNormal};
  --motion-duration-slow: ${motion.durationSlow};
  --motion-ease-out: ${motion.easeOut};
  --motion-ease-in: ${motion.easeIn};
  --motion-stagger: ${motion.staggerDelay};

  /* Shape */
  --radius: ${config.borderRadius};
}

/* ── RESET ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: var(--font-body);
  color: var(--color-text);
  background: var(--color-bg);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
img { max-width: 100%; display: block; }
a { color: var(--color-primary-600); text-decoration: none; }

/* ── TYPOGRAPHY ── */
h1, h2, h3, h4 { font-family: var(--font-heading); line-height: 1.15; text-wrap: balance; }
h1 { font-size: clamp(2rem, 4vw + 1rem, 3.5rem); font-weight: 700; }
h2 { font-size: clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem); font-weight: 600; }
h3 { font-size: clamp(1.125rem, 1.5vw + 0.25rem, 1.5rem); font-weight: 600; }
.lead { font-size: 1.125rem; line-height: 1.7; max-width: 65ch; }

/* ── REVEAL ANIMATIONS ── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.reveal {
  opacity: 0;
  animation: fadeUp var(--motion-duration-slow) var(--motion-ease-out) forwards;
}
.reveal-delay-1 { animation-delay: calc(var(--motion-stagger) * 1); }
.reveal-delay-2 { animation-delay: calc(var(--motion-stagger) * 2); }
.reveal-delay-3 { animation-delay: calc(var(--motion-stagger) * 3); }
.reveal-delay-4 { animation-delay: calc(var(--motion-stagger) * 4); }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .reveal { animation: fadeIn 200ms ease-out forwards; }
}

/* ── BUTTONS ── */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-family: var(--font-body);
  font-size: 0.9375rem; font-weight: 600;
  border-radius: var(--radius);
  border: 2px solid var(--color-primary-600);
  background: var(--color-primary-600);
  color: var(--color-neutral-0);
  cursor: pointer;
  transition: all var(--motion-duration-fast) var(--motion-ease-out);
}
.btn:hover { background: var(--color-primary-700); border-color: var(--color-primary-700); transform: translateY(-1px); }
.btn:active { transform: translateY(0); }
.btn-outline {
  background: transparent;
  color: var(--color-primary-600);
}
.btn-outline:hover { background: var(--color-primary-50); }

/* ── CARD ── */
.card {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: var(--space-lg);
  transition: transform var(--motion-duration-fast) var(--motion-ease-out), box-shadow var(--motion-duration-fast) var(--motion-ease-out);
}
${config.shadowIntensity !== "none" ? `.card:hover { transform: translateY(-2px); box-shadow: 0 8px 30px ${config.shadowIntensity === "dramatic" ? "oklch(20% 0.02 250 / 0.15)" : "oklch(30% 0.01 250 / 0.08)"}; }` : ""}

/* ── SECTIONS ── */
.section { padding: var(--space-2xl) var(--space-md); }
.container { max-width: 1200px; margin: 0 auto; padding: 0 var(--space-md); }

/* ── NAV ── */
.nav {
  position: sticky; top: 0; z-index: 50;
  background: ${archetype === "brutalist" ? "var(--color-neutral-900)" : "oklch(100% 0.005 " + primaryHue + " / 0.92)"};
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
}

/* ── HERO ── */
.hero {
  padding: var(--space-2xl) var(--space-md);
  ${archetype === "boldMinimal" ? "min-height: 60vh; display: flex; align-items: center;" : ""}
}

/* ── TAG / CHIP ── */
.tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  border-radius: 999px;
}

/* ── HR ── */
hr {
  border: none;
  height: 1px;
  background: var(--color-border);
  margin: var(--space-xl) 0;
}

/* ── FOOTER ── */
.footer {
  padding: var(--space-xl) var(--space-md);
  background: var(--color-neutral-950);
  color: var(--color-neutral-300);
  text-align: center;
  font-size: 0.875rem;
}
`;
}

// ═══════════════════════════════════════════════════════════
// ANTI-SLOP VALIDATION
// ═══════════════════════════════════════════════════════════

function antiSlopCheck(category: string, _archetype: DesignArchetype, primaryHue: number): string[] {
  const warnings: string[] = [];

  // Category-reflex check
  const cat = category.toLowerCase();
  const reflexMap: Record<string, { hue: number; tolerance: number; msg: string }> = {
    tech: { hue: 250, tolerance: 20, msg: "Tech defaulting to blue — pick something unexpected" },
    cafe: { hue: 30, tolerance: 15, msg: "Cafe defaulting to warm orange — try green or magenta" },
    gym: { hue: 0, tolerance: 10, msg: "Gym defaulting to red/black — try teal or amber" },
    salon: { hue: 320, tolerance: 20, msg: "Salon defaulting to pink — try deep teal or olive" },
    lawyer: { hue: 220, tolerance: 20, msg: "Lawyer defaulting to navy — try forest green or charcoal+warm" },
  };

  for (const [keyword, check] of Object.entries(reflexMap)) {
    if (cat.includes(keyword)) {
      const diff = Math.abs(primaryHue - check.hue);
      if (diff < check.tolerance) {
        warnings.push(check.msg);
      }
    }
  }

  return warnings;
}

// ═══════════════════════════════════════════════════════════
// HTML PAGE BUILDER
// ═══════════════════════════════════════════════════════════

function navSection(business: { name: string }): string {
  return `<nav class="nav">
  <div class="container" style="display:flex;justify-content:space-between;align-items:center;padding:1rem 0;">
    <strong style="font-family:var(--font-heading);font-size:1.25rem;">${business.name}</strong>
    <div style="display:flex;gap:2rem;font-size:0.875rem;">
      <a href="#about">About</a>
      <a href="#services">Services</a>
      <a href="#contact">Contact</a>
    </div>
  </div>
</nav>`;
}

function heroSection(
  business: { name: string; category: string; city: string },
  copy: { headline: string; subheadline: string; cta: string },
  archetype: DesignArchetype,
): string {
  const config = ARCHETYPE_CONFIG[archetype];

  if (archetype === "boldMinimal") {
    return `<section class="hero" style="background:var(--color-neutral-950);color:var(--color-neutral-0);">
  <div class="container">
    <div style="max-width:700px;" class="reveal">
      <span class="tag" style="background:var(--color-primary-500);color:var(--color-neutral-0);margin-bottom:1.5rem;display:inline-block;">${business.city}</span>
      <h1 style="margin-bottom:1.5rem;">${copy.headline}</h1>
      <p class="lead" style="color:var(--color-neutral-300);margin-bottom:2rem;">${copy.subheadline}</p>
      <a href="#contact" class="btn" style="background:var(--color-primary-500);border-color:var(--color-primary-500);">${copy.cta}</a>
    </div>
  </div>
</section>`;
  }

  if (archetype === "brutalist") {
    return `<section class="hero" style="border-bottom:4px solid var(--color-neutral-900);padding:4rem 1.5rem;">
  <div class="container">
    <div class="reveal" style="display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center;">
      <div>
        <h1 style="font-size:clamp(2.5rem,5vw,4rem);text-transform:uppercase;letter-spacing:-0.02em;margin-bottom:1rem;">${copy.headline}</h1>
        <p style="font-size:1.125rem;margin-bottom:2rem;max-width:50ch;">${copy.subheadline}</p>
        <a href="#contact" class="btn" style="border-radius:0;border-width:3px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">${copy.cta}</a>
      </div>
      <div style="background:var(--color-neutral-200);aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;font-size:0.875rem;color:var(--color-neutral-500);text-transform:uppercase;letter-spacing:0.1em;">
        ${business.name} — ${business.category}
      </div>
    </div>
  </div>
</section>`;
  }

  // Default hero (works for softLuxury, editorial, modernTech, warmLocal, photoFirst, retro)
  return `<section class="hero" style="${config.shadowIntensity === "none" && archetype !== "softLuxury" ? "" : "background:var(--color-primary-50);"}">
  <div class="container">
    <div class="reveal" style="display:grid;grid-template-columns:${archetype === "photoFirst" ? "1fr" : "1fr 1fr"};gap:3rem;align-items:center;">
      <div>
        <span class="tag">${business.category} in ${business.city}</span>
        <h1 style="margin:1.5rem 0 1rem;">${copy.headline}</h1>
        <p class="lead" style="color:var(--color-text-secondary);margin-bottom:2rem;">${copy.subheadline}</p>
        <div style="display:flex;gap:1rem;flex-wrap:wrap;">
          <a href="#contact" class="btn">${copy.cta}</a>
          <a href="#services" class="btn btn-outline">Our Services</a>
        </div>
      </div>
      ${archetype !== "photoFirst" ? `<div style="background:var(--color-neutral-200);aspect-ratio:4/3;border-radius:var(--radius);display:flex;align-items:center;justify-content:center;color:var(--color-neutral-500);font-size:0.875rem;">
        ${business.name}
      </div>` : ""}
    </div>
  </div>
</section>`;
}

function aboutSection(
  business: { name: string; category: string },
  copy: { story: string; values?: string },
  archetype: DesignArchetype,
): string {
  const hasValues = copy.values && copy.values.length > 20;

  if (archetype === "editorial") {
    return `<section id="about" class="section" style="background:var(--color-neutral-50);">
  <div class="container">
    <div class="reveal" style="display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:start;">
      <div>
        <hr style="width:60px;border:none;height:3px;background:var(--color-primary-600);margin-bottom:2rem;">
        <h2 style="margin-bottom:1.5rem;">About ${business.name}</h2>
        <p style="font-size:1.0625rem;line-height:1.7;color:var(--color-text-secondary);">${copy.story}</p>
      </div>
      ${hasValues ? `<div style="padding-top:3rem;">
        <p style="font-size:1.0625rem;line-height:1.7;color:var(--color-text-secondary);font-style:italic;border-left:3px solid var(--color-primary-400);padding-left:1.5rem;">${copy.values}</p>
      </div>` : ""}
    </div>
  </div>
</section>`;
  }

  return `<section id="about" class="section">
  <div class="container">
    <div class="reveal" style="max-width:720px;">
      <h2 style="margin-bottom:1rem;">About ${business.name}</h2>
      <p style="color:var(--color-text-secondary);margin-bottom:${hasValues ? "1.5rem" : "0"};">${copy.story}</p>
      ${hasValues ? `<p style="color:var(--color-text-secondary);">${copy.values}</p>` : ""}
    </div>
  </div>
</section>`;
}

function servicesSection(
  services: string[],
  copy: { intro?: string },
  archetype: DesignArchetype,
): string {
  if (services.length === 0) return "";

  const items = services.map((svc, i) => {
    const num = String(i + 1).padStart(2, "0");
    if (archetype === "brutalist") {
      return `<div class="card reveal reveal-delay-${Math.min(i + 1, 4)}" style="border:2px solid var(--color-neutral-900);border-radius:0;padding:1.5rem;">
        <span style="font-size:2rem;font-weight:700;color:var(--color-primary-600);font-family:var(--font-heading);">${num}</span>
        <h3 style="margin-top:0.75rem;font-size:1rem;">${svc}</h3>
      </div>`;
    }
    if (archetype === "softLuxury") {
      return `<div class="reveal reveal-delay-${Math.min(i + 1, 4)}" style="padding:2rem 0;border-bottom:1px solid var(--color-border);">
        <h3 style="font-size:1.25rem;font-weight:500;margin-bottom:0.5rem;">${svc}</h3>
        <p style="color:var(--color-text-secondary);font-size:0.9375rem;">Premium ${svc.toLowerCase()} tailored to your exact needs.</p>
      </div>`;
    }
    return `<div class="card reveal reveal-delay-${Math.min(i + 1, 4)}">
      <h3 style="font-size:1.125rem;margin-bottom:0.5rem;">${svc}</h3>
      <p style="color:var(--color-text-secondary);font-size:0.9375rem;">Professional ${svc.toLowerCase()} with attention to every detail.</p>
    </div>`;
  }).join("\n");

  const gridStyle = archetype === "softLuxury"
    ? "max-width:800px;"
    : "display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem;";

  return `<section id="services" class="section" style="background:var(--color-neutral-50);">
  <div class="container">
    <div class="reveal" style="margin-bottom:2rem;">
      <h2 style="margin-bottom:0.5rem;">What We Do</h2>
      ${copy.intro ? `<p style="color:var(--color-text-secondary);">${copy.intro}</p>` : ""}
    </div>
    <div style="${gridStyle}">
      ${items}
    </div>
  </div>
</section>`;
}

function contactSection(
  business: { name: string; phone?: string; address?: string; email?: string; city: string },
  copy: { cta: string },
): string {
  return `<section id="contact" class="section" style="background:var(--color-primary-900);color:var(--color-neutral-0);">
  <div class="container">
    <div class="reveal" style="text-align:center;max-width:600px;margin:0 auto;">
      <h2 style="margin-bottom:1rem;color:var(--color-neutral-0);">${copy.cta}</h2>
      <p style="color:var(--color-neutral-300);margin-bottom:2rem;">Reach out today and let's get started.</p>
      <div style="display:flex;flex-direction:column;gap:1rem;align-items:center;font-size:1rem;">
        ${business.phone ? `<a href="tel:${business.phone}" style="color:var(--color-primary-200);font-size:1.25rem;font-weight:600;">${business.phone}</a>` : ""}
        ${business.email ? `<a href="mailto:${business.email}" style="color:var(--color-primary-200);">${business.email}</a>` : ""}
        ${business.address ? `<p style="color:var(--color-neutral-400);">${business.address}</p>` : ""}
      </div>
    </div>
  </div>
</section>`;
}

function footerSection(business: { name: string }): string {
  return `<footer class="footer">
  <p>&copy; ${new Date().getFullYear()} ${business.name}. All rights reserved.</p>
</footer>`;
}

// ═══════════════════════════════════════════════════════════
// MAIN EXPORT: buildPage
// ═══════════════════════════════════════════════════════════

export interface BuildPageInput {
  name: string;
  category: string;
  city: string;
  phone?: string;
  address?: string;
  email?: string;
  heroCopy: { headline: string; subheadline: string; cta: string };
  aboutCopy: { story: string; values?: string };
  servicesCopy: { intro?: string; services: string[] };
  contactCopy: { cta: string };
  forceArchetype?: DesignArchetype;
}

export interface BuildPageOutput {
  html: string;
  archetype: DesignArchetype;
  archetypeName: string;
  primaryHue: number;
  antiSlopWarnings: string[];
}

export function buildPage(input: BuildPageInput): BuildPageOutput {
  const archetype = input.forceArchetype ?? pickArchetype(input.category);
  const config = ARCHETYPE_CONFIG[archetype];

  // Use archetype's hue range, not the lazy defaults
  const hueSpread = config.hueRange[1] - config.hueRange[0];
  const primaryHue = config.hueRange[0] + Math.random() * hueSpread;

  const colors = {
    primary: generatePrimaryPalette(primaryHue),
    neutral: generateNeutralPalette(primaryHue),
  };

  const fonts = {
    heading: config.fontHeading,
    body: config.fontBody,
  };

  const motion = generateMotionTokens();
  const css = generateBaseCSS(archetype, primaryHue, colors, fonts, motion);

  const antiSlopWarnings = antiSlopCheck(input.category, archetype, primaryHue);

  const business = {
    name: input.name,
    category: input.category,
    city: input.city,
    phone: input.phone,
    address: input.address,
    email: input.email,
  };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${input.name} — ${input.category} in ${input.city}</title>
<meta name="description" content="${input.heroCopy.subheadline.slice(0, 155)}">
<style>${css}</style>
</head>
<body>
${navSection(business)}
${heroSection(business, input.heroCopy, archetype)}
${aboutSection(business, input.aboutCopy, archetype)}
${servicesSection(input.servicesCopy.services, input.servicesCopy, archetype)}
${contactSection(business, input.contactCopy)}
${footerSection(business)}
<script>
// IntersectionObserver for reveal animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
</script>
</body>
</html>`;

  return {
    html,
    archetype,
    archetypeName: config.name,
    primaryHue,
    antiSlopWarnings,
  };
}
