// siteGen/types.ts — shared types for multi-page site generator

export interface BusinessInput {
  id: number;
  name: string;
  category: string;
  city: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  description?: string | null;
  hours?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
}

export interface DesignSystem {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    accent: string;
    bg: string;
    bgAlt: string;
    surface: string;
    surfaceAlt: string;
    text: string;
    textLight: string;
    textMuted: string;
    border: string;
    borderLight: string;
    white: string;
    black: string;
  };
  fonts: {
    heading: string;
    body: string;
    accent: string;
    headingUrl: string;
    bodyUrl: string;
    accentUrl: string;
  };
  spacing: {
    sectionPad: string;
    contentMaxWidth: string;
    gridGap: string;
    borderRadius: string;
    borderRadiusSm: string;
    borderRadiusLg: string;
  };
  effects: {
    shadowSm: string;
    shadowMd: string;
    shadowLg: string;
    shadowXl: string;
    transition: string;
    heroOverlay: string;
  };
  layout: {
    navStyle: "fixed" | "transparent" | "floating" | "minimal";
    heroStyle: "fullscreen" | "split" | "centered" | "sidebar" | "overlapping";
    footerStyle: "simple" | "multi-column" | "branded" | "minimal";
  };
}

export interface SiteCopy {
  nav: { brand: string; links: { label: string; href: string }[] };
  hero: {
    headline: string;
    subheadline: string;
    cta: string;
    ctaSecondary: string;
    badge?: string;
  };
  trust: { label: string; stat?: string }[];
  services: {
    headline: string;
    subheadline: string;
    items: { name: string; desc: string; price?: string; icon?: string }[];
  };
  about: {
    headline: string;
    story: string;
    values: string[];
    quote?: string;
  };
  testimonials: { text: string; author: string; role: string }[];
  faq: { q: string; a: string }[];
  cta: { headline: string; subheadline: string; button: string };
  contact: {
    headline: string;
    subheadline: string;
    formButton: string;
  };
  footer: {
    tagline: string;
    columns: { title: string; links: string[] }[];
    bottom: string;
  };
  servicesPage: {
    headline: string;
    intro: string;
    serviceDetails: { name: string; desc: string; features: string[]; price?: string }[];
  };
}

export interface SiteAssets {
  heroImage: string;
  aboutImage: string;
  favicon: string;
}

export interface GeneratedPage {
  filename: string;
  title: string;
  html: string;
}

export interface GeneratedSite {
  pages: GeneratedPage[];
  css: string;
  js: string;
  readme: string;
  designSystem: DesignSystem;
  copy: SiteCopy;
}
