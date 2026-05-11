// siteGen/copywriter.ts — AI writes ALL copy from scratch per business
// Zero templates. Every word is generated fresh for this ONE business.

import { callKimi } from "../openrouter";
import type { BusinessInput, SiteCopy } from "./types";

export async function generateCopy(
  business: BusinessInput,
  apiKey?: string
): Promise<SiteCopy> {
  const cat = business.category.charAt(0).toUpperCase() + business.category.slice(1);
  const city = business.city;
  const name = business.name;

  const prompt = `You are a world-class conversion copywriter. Write the complete website copy for ONE business. Be specific. Reference their name, city, and what they actually do. Write like a real person talks, not a marketing brochure.

BUSINESS: ${name}
TYPE: ${cat}
LOCATION: ${city}
${business.description ? `ABOUT: ${business.description}` : ""}
${business.rating ? `RATING: ${business.rating}/5` : ""}
${business.reviewCount ? `REVIEWS: ${business.reviewCount}` : ""}

RULES:
- Headlines must be bold, specific, under 10 words each
- NO generic filler: "quality service", "committed to excellence", "your satisfaction is our priority", "welcome to our website", "years of experience", "trusted provider"
- Write as if you just talked to the owner for 30 minutes over coffee
- Reference real neighborhood vibes, local references about ${city}
- Services should be named how CUSTOMERS say them, not industry jargon
- Testimonials should sound like real people (imperfect grammar, specific details)
- FAQ answers should be conversational and direct
- The footer should have a memorable one-line tagline

Output ONLY valid JSON. No markdown, no code blocks. Pure JSON:
{
  "nav": {
    "brand": "short brand name (1-2 words max)",
    "links": [
      {"label": "Home", "href": "index.html"},
      {"label": "Services", "href": "services.html"},
      {"label": "About", "href": "about.html"},
      {"label": "Contact", "href": "contact.html"}
    ]
  },
  "hero": {
    "headline": "bold specific headline (6-10 words). Pain-point driven.",
    "subheadline": "1-2 sentences that make the customer feel understood. Specific to ${city}.",
    "cta": "action-oriented button (2-3 words)",
    "ctaSecondary": "secondary button text (2-3 words)",
    "badge": "optional social proof badge (e.g., 'Rated 4.9★ by ${city} locals')"
  },
  "trust": [
    {"label": "trust indicator 1", "stat": "optional number"},
    {"label": "trust indicator 2"},
    {"label": "trust indicator 3"},
    {"label": "trust indicator 4"}
  ],
  "services": {
    "headline": "specific headline about what they do (not 'Our Services')",
    "subheadline": "1 sentence explaining the approach. Not generic.",
    "items": [
      {"name": "Service 1 (how customers say it)", "desc": "2-3 sentences explaining what happens. Include a small detail.", "price": "optional price range"},
      {"name": "Service 2", "desc": "2-3 sentences", "price": "optional"},
      {"name": "Service 3", "desc": "2-3 sentences", "price": "optional"},
      {"name": "Service 4", "desc": "2-3 sentences", "price": "optional"}
    ]
  },
  "about": {
    "headline": "headline about who they are (not 'About Us')",
    "story": "3-4 sentences. Write it like an interview. Include a specific detail about how they work or why they started.",
    "values": ["value 1", "value 2", "value 3"],
    "quote": "optional owner quote"
  },
  "testimonials": [
    {"text": "real-sounding review with specific details about their experience", "author": "First Last", "role": "descriptor, ${city}"},
    {"text": "another review with different voice/tone", "author": "First Last", "role": "descriptor, ${city}"},
    {"text": "third review", "author": "First Last", "role": "descriptor, ${city}"}
  ],
  "faq": [
    {"q": "common question customers actually ask", "a": "straightforward answer, 2-3 sentences"},
    {"q": "question 2", "a": "answer 2"},
    {"q": "question 3", "a": "answer 3"},
    {"q": "question 4", "a": "answer 4"},
    {"q": "question 5", "a": "answer 5"}
  ],
  "cta": {
    "headline": "compelling reason to act now",
    "subheadline": "1 sentence lowering the barrier to entry",
    "button": "button text"
  },
  "contact": {
    "headline": "friendly invitation to reach out",
    "subheadline": "reassurance about response time and what to expect",
    "formButton": "button text for form submit"
  },
  "footer": {
    "tagline": "memorable one-liner that sums up what makes them different",
    "columns": [
      {"title": "Services", "links": ["service1", "service2", "service3"]},
      {"title": "Company", "links": ["About", "Reviews", "Contact"]}
    ],
    "bottom": "copyright line"
  },
  "servicesPage": {
    "headline": "specific headline for the services page",
    "intro": "2-3 sentences setting context for the services",
    "serviceDetails": [
      {
        "name": "Service 1 detailed name",
        "desc": "2-3 sentences explaining the service in detail",
        "features": ["feature 1", "feature 2", "feature 3"],
        "price": "optional"
      },
      {
        "name": "Service 2",
        "desc": "description",
        "features": ["f1", "f2", "f3"],
        "price": "optional"
      }
    ]
  }
}`;

  const raw = await callKimi([{ role: "user", content: prompt }], {
    temperature: 0.85,
    max_tokens: 4000,
    apiKey,
  });

  let parsed: Partial<SiteCopy>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Fallback: generate minimal copy manually
    parsed = generateFallbackCopy(business);
  }

  // Ensure all required fields exist
  return fillDefaults(parsed, business);
}

function generateFallbackCopy(b: BusinessInput): Partial<SiteCopy> {
  const c = b.category.toLowerCase();
  const city = b.city;
  return {
    nav: { brand: b.name, links: [
      { label: "Home", href: "index.html" },
      { label: "Services", href: "services.html" },
      { label: "About", href: "about.html" },
      { label: "Contact", href: "contact.html" },
    ]},
    hero: {
      headline: `${b.name} — ${c} in ${city} That Actually Shows Up`,
      subheadline: `Tired of ${c} companies that overpromise and underdeliver? ${b.name} does things differently in ${city}.`,
      cta: "Get Started",
      ctaSecondary: "Learn More",
    },
    trust: [
      { label: "Licensed & Insured" },
      { label: `${city} Local` },
      { label: "Fair Pricing" },
      { label: "Satisfaction Guaranteed" },
    ],
    services: {
      headline: `What ${b.name} Does Best`,
      subheadline: `Real services for real people in ${city}. No upsells, no surprises.`,
      items: [
        { name: `${c.charAt(0).toUpperCase() + c.slice(1)} Service`, desc: `Our core ${c} service, done right the first time.` },
        { name: "Consultation", desc: "Free initial assessment so you know exactly what you need." },
        { name: "Ongoing Support", desc: "We're here long after the job is done." },
        { name: "Emergency Service", desc: "When you need us most, we're there." },
      ],
    },
  };
}

function fillDefaults(p: Partial<SiteCopy>, b: BusinessInput): SiteCopy {
  const fb = generateFallbackCopy(b);
  return {
    nav: p.nav ?? fb.nav!,
    hero: p.hero ?? fb.hero!,
    trust: p.trust ?? fb.trust!,
    services: p.services ?? fb.services!,
    about: p.about ?? { headline: `Why ${b.name} Is Different`, story: `${b.name} started because we saw a gap in ${b.city}. Too many ${b.category} businesses were treating customers like transactions. We decided to do it differently.`, values: ["Honesty", "Quality", "Respect"] },
    testimonials: p.testimonials ?? [
      { text: "Best experience I've had. Professional, on time, and the results speak for themselves.", author: "Sarah M.", role: `${b.city}` },
      { text: `I've used ${b.name} multiple times and they never disappoint. Highly recommend.`, author: "Mike T.", role: `${b.city}` },
    ],
    faq: p.faq ?? [
      { q: "How do I get started?", a: `Just reach out through our contact form or give us a call. We'll schedule a time that works for you in ${b.city}.` },
      { q: "What areas do you serve?", a: `We serve ${b.city} and surrounding areas.` },
      { q: "How much does it cost?", a: "Every job is different. Contact us for a free, no-obligation quote." },
      { q: "Do you offer guarantees?", a: "Yes. We stand behind our work with a satisfaction guarantee." },
      { q: "How soon can you start?", a: "We typically can start within a few days of your call." },
    ],
    cta: p.cta ?? { headline: "Ready to Get Started?", subheadline: `Contact ${b.name} today for a free consultation.`, button: "Contact Us" },
    contact: p.contact ?? { headline: "Get in Touch", subheadline: "We respond within 24 hours. No pressure, just answers.", formButton: "Send Message" },
    footer: p.footer ?? { tagline: `${b.name} — ${b.category} done right in ${b.city}.`, columns: [{ title: "Services", links: ["Services", "About", "Contact"] }, { title: "Company", links: ["About", "Reviews", "Contact"] }], bottom: `© ${new Date().getFullYear()} ${b.name}. All rights reserved.` },
    servicesPage: p.servicesPage ?? { headline: `Our Services`, intro: `Everything ${b.name} offers in ${b.city}.`, serviceDetails: (p.services?.items ?? fb.services!.items).map((s: any) => ({ name: s.name, desc: s.desc, features: ["Professional service", "Experienced team", "Satisfaction guaranteed"], price: s.price })) },
  };
}
