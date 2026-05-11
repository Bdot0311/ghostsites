// impeccableDesign.ts v9 — $1000+ quality websites
// GSAP scroll animations, asymmetric layouts, AI hero images, aggressive copy

// ═══════════════════════════════════════════════════════════════════
// 1. AI HERO IMAGE SELECTOR — unique image per category
// ═══════════════════════════════════════════════════════════════════
function heroImg(cat: string): string {
  const c = cat.toLowerCase();
  if (c.includes("plumber") || c.includes("contractor") || c.includes("hvac") || c.includes("electrician") || c.includes("roofer")) return "/hero-images/plumber.jpg";
  if (c.includes("salon") || c.includes("spa") || c.includes("esthetician") || c.includes("nail") || c.includes("lash") || c.includes("brow")) return "/hero-images/salon.jpg";
  if (c.includes("gym") || c.includes("fitness") || c.includes("trainer") || c.includes("crossfit") || c.includes("yoga") || c.includes("pilates")) return "/hero-images/gym.jpg";
  if (c.includes("cafe") || c.includes("bakery") || c.includes("restaurant") || c.includes("coffee") || c.includes("catering") || c.includes("food")) return "/hero-images/cafe.jpg";
  if (c.includes("lawyer") || c.includes("attorney") || c.includes("accountant") || c.includes("consulting") || c.includes("financial") || c.includes("tax")) return "/hero-images/lawyer.jpg";
  if (c.includes("dentist") || c.includes("dental") || c.includes("orthodont")) return "/hero-images/dentist.jpg";
  if (c.includes("photo") || c.includes("studio") || c.includes("florist") || c.includes("event") || c.includes("wedding") || c.includes("realtor")) return "/hero-images/photographer.jpg";
  if (c.includes("barber")) return "/hero-images/barber.jpg";
  return "/hero-images/plumber.jpg";
}

// ═══════════════════════════════════════════════════════════════════
// 2. COLOR SYSTEM
// ═══════════════════════════════════════════════════════════════════
function oklch(l: number, c: number, h: number) { return `oklch(${l}% ${c} ${h})`; }
function prim(h: number) {
  return { 50: oklch(97, 0.02, h), 100: oklch(93, 0.04, h), 200: oklch(86, 0.08, h), 300: oklch(76, 0.12, h), 400: oklch(65, 0.18, h), 500: oklch(55, 0.22, h), 600: oklch(45, 0.20, h), 700: oklch(35, 0.16, h), 800: oklch(25, 0.10, h), 900: oklch(15, 0.05, h) };
}
function neut(h: number) {
  const c = 0.008;
  return { 0: oklch(100, c * 0.5, h), 50: oklch(98, c, h), 100: oklch(95, c, h), 200: oklch(88, c, h), 300: oklch(75, c, h), 400: oklch(62, c, h), 500: oklch(50, c, h), 600: oklch(38, c, h), 700: oklch(28, c, h), 800: oklch(18, c, h), 900: oklch(12, c, h), 950: oklch(8, c, h) };
}

// ═══════════════════════════════════════════════════════════════════
// 3. ARCHETYPE CONFIG
// ═══════════════════════════════════════════════════════════════════
export type Arch = "brutalist" | "softLuxury" | "editorial" | "modernTech" | "warmLocal" | "boldMinimal" | "photoFirst" | "retro";

const CFG: Record<Arch, { name: string; hue: [number, number]; fH: string; fB: string; r: string }> = {
  brutalist:   { name: "Brutalist",    hue: [0, 360],     fH: "'Space Grotesk',system-ui,sans-serif",  fB: "'Inter',system-ui,sans-serif", r: "0px" },
  softLuxury:  { name: "Soft Luxury",  hue: [300, 340],   fH: "'Playfair Display',Georgia,serif",      fB: "'Inter',sans-serif",           r: "16px" },
  editorial:   { name: "Editorial",    hue: [20, 45],     fH: "'Playfair Display',Georgia,serif",      fB: "'Source Serif 4',Georgia,serif", r: "0px" },
  modernTech:  { name: "Modern Tech",  hue: [230, 270],   fH: "'Inter',system-ui,sans-serif",          fB: "'Inter',system-ui,sans-serif", r: "12px" },
  warmLocal:   { name: "Warm Local",   hue: [30, 60],     fH: "'DM Serif Display',Georgia,serif",      fB: "'Inter',sans-serif",           r: "8px" },
  boldMinimal: { name: "Bold Minimal", hue: [0, 360],     fH: "'Space Grotesk',system-ui,sans-serif",  fB: "'Inter',system-ui,sans-serif", r: "0px" },
  photoFirst:  { name: "Photo-First",  hue: [160, 200],   fH: "'Playfair Display',Georgia,serif",      fB: "'Inter',sans-serif",           r: "8px" },
  retro:       { name: "Retro",        hue: [15, 45],     fH: "'Courier Prime',monospace",             fB: "'Georgia',serif",              r: "4px" },
};

const GF: Record<Arch, string> = {
  brutalist:   "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Inter:wght@400;500;600&display=swap",
  softLuxury:  "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600&display=swap",
  editorial:   "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500&display=swap",
  modernTech:  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  warmLocal:   "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap",
  boldMinimal: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Inter:wght@400;500&display=swap",
  photoFirst:  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@400;500&display=swap",
  retro:       "https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap",
};

function pickArch(c: string): Arch {
  const cat = c.toLowerCase();
  const m: [string[], Arch][] = [
    [["contractor", "plumber", "roofer", "electrician", "hvac", "landscaping", "handyman", "pest"], "brutalist"],
    [["salon", "spa", "esthetician", "nail", "lash", "brow", "makeup"], "softLuxury"],
    [["lawyer", "accountant", "consulting", "architect", "financial", "attorney", "advisor", "tax"], "editorial"],
    [["tech", "software", "marketing", "agency", "design", "web", "app", "digital", "it"], "modernTech"],
    [["cafe", "bakery", "restaurant", "coffee", "catering", "food", "kitchen", "brew", "diner"], "warmLocal"],
    [["gym", "fitness", "trainer", "crossfit", "yoga", "pilates", "boxing", "martial"], "boldMinimal"],
    [["photographer", "realtor", "venue", "interior", "studio", "florist", "event", "wedding"], "photoFirst"],
    [["barber", "vintage", "record", "antique", "thrift", "tattoo"], "retro"],
  ];
  for (const [t, a] of m) if (t.some(x => cat.includes(x))) return a;
  return (["warmLocal", "editorial", "boldMinimal", "softLuxury"] as Arch[])[Math.floor(Math.random() * 4)];
}

// ═══════════════════════════════════════════════════════════════════
// 4. CATEGORY-SPECIFIC DATA — aggressive, pain-point driven
// ═══════════════════════════════════════════════════════════════════
interface CatData {
  headlineTemplate: string;
  subTemplate: string;
  ctaMain: string; ctaPhone: string;
  trust: string[];
  emergency?: string;
  steps: { n: string; d: string }[];
  testimonials: { t: string; a: string; r: string }[];
  faqs: { q: string; a: string }[];
  services?: string[];
  servicesIntro?: string;
  story?: string;
  values?: string;
  contactCta?: string;
}

function catData(cat: string, name: string, city: string): CatData {
  const c = cat.toLowerCase();
  if (c.includes("plumber") || c.includes("contractor") || c.includes("hvac") || c.includes("electrician")) {
    return {
      headlineTemplate: `Water Damage Doesn\'t Wait. Neither Do We.`,
      subTemplate: `89% of our ${cat} calls in ${city} are resolved same-day. Licensed, insured, and on-time—every time.`,
      ctaMain: "Get Free Estimate", ctaPhone: "Emergency? Call Now",
      trust: ["Licensed & Insured", "Same-Day Service", "24/7 Emergency", "90-Day Warranty"],
      emergency: `Emergency in ${city}? We answer 24/7 — Call now`,
      steps: [{ n: "Call", d: "Describe the issue" }, { n: "Diagnose", d: "We assess on-site" }, { n: "Fix", d: "Repair done right" }, { n: "Guarantee", d: "90-day warranty" }],
      testimonials: [
        { t: `Called at 11pm with a burst pipe. They were at my ${city} home by midnight. Fixed it in under an hour.`, a: "Mike R.", r: `${city} Homeowner` },
        { t: `Got three quotes. ${name} was the only one who actually explained what was wrong instead of pushing a full replacement.`, a: "Jennifer T.", r: `Property Manager, ${city}` },
        { t: `They found the issue in 10 minutes. The last company I called spent two hours and still couldn\'t figure it out.`, a: "Carlos M.", r: `Restaurant Owner, ${city}` },
      ],
      faqs: [
        { q: "Do you charge for estimates?", a: "No. Estimates are always free and no-obligation. We believe you should know the cost before committing." },
        { q: "How fast can you get here?", a: `For emergencies in ${city}, we typically arrive within 1-2 hours. Standard calls are same-day or next-day.` },
        { q: "Do you warranty your work?", a: "Yes. All repairs come with a 90-day parts and labor warranty. If it fails, we fix it free." },
        { q: "What areas do you serve?", a: `We serve all of ${city} and surrounding neighborhoods including Downtown ${city}, ${city} Heights, and East ${city}.` },
        { q: "Can you handle commercial jobs?", a: "Absolutely. We handle both residential and commercial work. No job is too big or too small." },
      ],
    };
  }
  if (c.includes("salon") || c.includes("spa") || c.includes("nail") || c.includes("esthetician")) {
    return {
      headlineTemplate: `Bad Hair Days Are Over. Walk Out Looking Like *You*.`,
      subTemplate: `We take 30 minutes to understand your hair before touching a single strand. That\'s why ${city} keeps coming back to ${name}.`,
      ctaMain: "Book Appointment", ctaPhone: "Call to Book",
      trust: ["Licensed Stylists", `${city}\'s Top Rated`, "Premium Products", "Walk-Ins Welcome"],
      steps: [{ n: "Consult", d: "Discuss your look" }, { n: "Customize", d: "Tailored to you" }, { n: "Transform", d: "Expert hands at work" }, { n: "Maintain", d: "Aftercare tips given" }],
      testimonials: [
        { t: `Finally a salon in ${city} that actually listens. I showed them a photo and they told me honestly what would work with *my* hair texture.`, a: "Amanda K.", r: `${city}` },
        { t: `The atmosphere is so relaxing I almost fell asleep during the wash. Best balayage I\'ve had in years.`, a: "Stephanie L.", r: `Regular, ${city}` },
        { t: `I\'ve been to 4 salons in ${city}. ${name} is the only one where I didn\'t have to fix my hair when I got home.`, a: "Rachel G.", r: `New Client, ${city}` },
      ],
      faqs: [
        { q: "Do I need to book ahead?", a: "Walk-ins are welcome but we recommend booking for color services. Cuts usually have same-day availability." },
        { q: "What products do you use?", a: "We use premium professional-grade products. Ask about our vegan and sulfate-free options." },
        { q: "How long does a typical appointment take?", a: "Cuts take 30-45 min. Color services range from 1.5-3 hours depending on the treatment." },
        { q: "Do you offer gift cards?", a: "Yes, gift cards are available in any amount and never expire." },
        { q: "Can I bring reference photos?", a: "Absolutely — the more visual references the better. We'll give you honest feedback on what works for your features." },
      ],
    };
  }
  if (c.includes("gym") || c.includes("fitness") || c.includes("trainer") || c.includes("crossfit") || c.includes("yoga")) {
    return {
      headlineTemplate: `Still Paying for a Gym You Don\'t Use? That Ends Today.`,
      subTemplate: `Our ${city} members lose an average of 12 lbs in their first 30 days. No contracts. No excuses. Just results.`,
      ctaMain: "Start Free Trial", ctaPhone: "Call to Tour",
      trust: ["Certified Trainers", "No Contracts Ever", "24/7 Access", "Free Parking"],
      steps: [{ n: "Tour", d: "See the facility" }, { n: "Assess", d: "Fitness evaluation" }, { n: "Train", d: "Personalized program" }, { n: "Results", d: "Track progress monthly" }],
      testimonials: [
        { t: `Lost 30 lbs in 4 months. The trainers at ${name} actually check in on you if you miss a session. That accountability changed everything.`, a: "David H.", r: `${city} Member, 6 months` },
        { t: `Cleanest gym I've been to in ${city}. Equipment is always maintained. And they actually have enough squat racks.`, a: "Lisa P.", r: `${city} Member, 1 year` },
        { t: `No contracts, no hidden fees, no drama. Just a solid place to work out with people who know what they're doing.`, a: "Marcus J.", r: `${city} Member, 3 months` },
      ],
      faqs: [
        { q: "Is there a contract?", a: "No. We offer month-to-month memberships. Cancel anytime with 7 days notice." },
        { q: "Do you offer personal training?", a: "Yes, all trainers are NASM-certified and offer one-on-one and small group sessions starting at $49/session." },
        { q: "What are your hours?", a: "We're open 24/7 for members. Staffed hours are 6am-10pm Mon-Sat, 8am-6pm Sunday." },
        { q: "Can I try before I join?", a: "Absolutely. Your first week is completely free — no credit card required." },
        { q: "Do you have classes?", a: "Yes, over 30 classes per week including HIIT, yoga, spin, boxing, and strength training. All included in membership." },
      ],
    };
  }
  if (c.includes("cafe") || c.includes("bakery") || c.includes("restaurant") || c.includes("coffee") || c.includes("food")) {
    return {
      headlineTemplate: `The Best ${cat.charAt(0).toUpperCase() + c.slice(1)} in ${city}. Period.`,
      subTemplate: `Made fresh every morning. Sourced locally whenever possible. And the kind of place where the staff remembers your name.`,
      ctaMain: "Order Online", ctaPhone: "Call Ahead",
      trust: ["Made Fresh Daily", "Local Ingredients", `Catering in ${city}`, "Family Owned"],
      steps: [{ n: "Order", d: "Online, phone, or in-person" }, { n: "Prepare", d: "Made fresh to order" }, { n: "Enjoy", d: "Eat in or take out" }, { n: "Return", d: "Regulars get perks" }],
      testimonials: [
        { t: `Best breakfast spot in ${city}. The croissants are ridiculous — flaky, buttery, and somehow even better than the ones I had in Paris.`, a: "Tom W.", r: `${city} Weekly Regular` },
        { t: `We order catering from ${name} for every office meeting. Always on time, always delicious, and they remember our dietary restrictions.`, a: "Sarah B.", r: `Office Manager, ${city}` },
        { t: `The coffee alone is worth the trip. Plus they know my order by heart now. That's the kind of place ${name} is.`, a: "Nina R.", r: `${city} Daily Customer` },
      ],
      faqs: [
        { q: "Do you take reservations?", a: "We accept reservations for parties of 6 or more. Walk-ins are always welcome." },
        { q: "Do you offer catering?", a: `Yes! We cater events from 10 to 200 people in ${city}. Call us for a custom quote.` },
        { q: "Are you open for breakfast?", a: "We open at 7am daily and serve breakfast until 11am." },
        { q: "Do you have vegan options?", a: "Yes, we offer a rotating selection of vegan and gluten-free items daily. Just ask!" },
        { q: "Can I order online for pickup?", a: "Absolutely. Order through our website or call ahead and we'll have it ready when you arrive." },
      ],
    };
  }
  if (c.includes("lawyer") || c.includes("attorney") || c.includes("accountant") || c.includes("consulting") || c.includes("tax")) {
    return {
      headlineTemplate: `Your Problem Isn\'t Hopeless. You Just Need the Right ${cat.charAt(0).toUpperCase() + c.slice(1)}.`,
      subTemplate: `We\'ve helped over 500 ${city} clients resolve their cases faster and with better outcomes than they expected. Your first consultation is free.`,
      ctaMain: "Free Consultation", ctaPhone: "Call Now",
      trust: ["Licensed Professional", "Strictly Confidential", "Flat Fees Available", "Proven Results"],
      steps: [{ n: "Consult", d: "Free initial meeting" }, { n: "Plan", d: "Strategy tailored to you" }, { n: "Execute", d: "Handle all details" }, { n: "Resolve", d: "Case closed" }],
      testimonials: [
        { t: `Took a situation that felt completely hopeless and resolved it in two weeks flat. I wish I'd called ${name} sooner.`, a: "Robert C.", r: `${city} Business Client` },
        { t: `Clear communication, fair flat-fee pricing, and got me a better settlement than I expected. Worth every penny.`, a: "Angela D.", r: `${city} Personal Client` },
        { t: `Professional from day one. No surprises, no hidden fees, just results. The way it should be.`, a: "Kevin S.", r: `Small Business Owner, ${city}` },
      ],
      faqs: [
        { q: "Is the first consultation free?", a: "Yes. Your initial 30-minute consultation is completely free and confidential." },
        { q: "Do you offer flat fees?", a: "Yes, we offer flat-fee arrangements for many common matters. No surprise bills. Ever." },
        { q: "How long will my case take?", a: "It varies by matter, but we always give you a realistic timeline upfront — not false promises." },
        { q: "Do you handle emergencies?", a: "Yes. For urgent matters, call our direct line and we'll respond within 24 hours." },
        { q: "What information should I bring?", a: "Bring any relevant documents, contracts, or correspondence. We'll handle the rest from there." },
      ],
    };
  }
  if (c.includes("dentist") || c.includes("dental")) {
    return {
      headlineTemplate: `Afraid of the Dentist? We Designed ${name} Around People Like You.`,
      subTemplate: `Sedation available. Same-day emergency appointments. And a team that actually explains what they're doing before they do it.`,
      ctaMain: "Book Appointment", ctaPhone: `Call ${city} Office`,
      trust: ["Board Certified", "Sedation Available", "Accepts Insurance", "Weekend Hours"],
      emergency: `Dental emergency in ${city}? We reserve slots daily — Call now`,
      steps: [{ n: "Book", d: "Easy online scheduling" }, { n: "Examine", d: "Digital X-rays & checkup" }, { n: "Treat", d: "Gentle, modern care" }, { n: "Smile", d: "Results you love" }],
      testimonials: [
        { t: `I used to dread the dentist. Now I actually don't mind going. They're that gentle and that good at explaining everything.`, a: "Patricia M.", r: `Patient, ${city}, 3 years` },
        { t: `Got me in same day for a broken tooth. The repair looks completely natural — you can't even tell it was damaged.`, a: "Daniel F.", r: `New Patient, ${city}` },
        { t: `The staff is incredibly friendly and the office is spotless. My kids actually look forward to coming here.`, a: "Hannah L.", r: `Patient, ${city}, 1 year` },
      ],
      faqs: [
        { q: "Do you accept my insurance?", a: "We accept most major dental insurance plans. Call us and we'll verify your coverage before your visit." },
        { q: "Is sedation available?", a: "Yes, we offer nitrous oxide and oral sedation for anxious patients at no extra cost." },
        { q: "How often should I come in?", a: "We recommend cleanings every 6 months, though some patients benefit from quarterly visits." },
        { q: "Do you see children?", a: "Yes, we treat patients of all ages starting at age 3. We have a gentle approach for little ones." },
        { q: "What if I have a dental emergency?", a: `Call us immediately. We reserve slots daily for emergencies and offer same-day treatment in ${city}.` },
      ],
    };
  }
  if (c.includes("photo") || c.includes("studio") || c.includes("florist") || c.includes("event") || c.includes("wedding")) {
    return {
      headlineTemplate: `Moments Fade. Great Photos Last Forever.`,
      subTemplate: `Over 200 ${city} events captured. Edited and delivered in 14 days. Full rights included.`,
      ctaMain: "Check Availability", ctaPhone: "Discuss Your Event",
      trust: ["200+ Events", "Full Day Coverage", "Edited in 14 Days", "Full Rights Included"],
      steps: [{ n: "Connect", d: "Tell us your vision" }, { n: "Plan", d: "Timeline & shot list" }, { n: "Shoot", d: "Full coverage" }, { n: "Deliver", d: "Edited in 2 weeks" }],
      testimonials: [
        { t: `The photos came out better than we imagined. Every important moment was captured and the editing is absolutely stunning.`, a: "Jessica & Tom", r: `Wedding, ${city}` },
        { t: `Professional, creative, and so easy to work with. ${name} made everyone feel comfortable in front of the camera.`, a: "Alex R.", r: `Brand Shoot, ${city}` },
        { t: `Booked them for our company gala. The photos were incredible — candid, artistic, and perfectly captured the energy of the night.`, a: "Nicole B.", r: `Corporate Event, ${city}` },
      ],
      faqs: [
        { q: "How far in advance should I book?", a: "Weddings book 6-12 months out. For other events, 2-4 weeks notice is usually sufficient." },
        { q: "How long until I get my photos?", a: "Standard turnaround is 14 days. Rush delivery (7 days) is available for an additional fee." },
        { q: "Do you travel?", a: `Yes, available for travel beyond ${city}. Travel fees apply outside the metro area.` },
        { q: "What's included?", a: "All packages include edited digital images, an online gallery, and full printing rights. No hidden costs." },
        { q: "Can we request specific shots?", a: "Absolutely. We create a custom shot list for every event based on your priorities and vision." },
      ],
    };
  }
  if (c.includes("barber")) {
    return {
      headlineTemplate: `A Cut Above Everything Else in ${city}.`,
      subTemplate: `Master barbers. Hot towel shaves. And the kind of attention to detail that keeps you coming back every two weeks.`,
      ctaMain: "Walk In or Book", ctaPhone: "Call Ahead",
      trust: ["Master Barbers", "Hot Towel Shaves", "Kids Welcome", `${city} Favorite`],
      steps: [{ n: "Walk In", d: "Or book ahead" }, { n: "Consult", d: "Discuss the cut" }, { n: "Cut", d: "Precision work" }, { n: "Detail", d: "Line-up & finish" }],
      testimonials: [
        { t: `Best fade I've had in years. These guys know what they're doing and they take their time.`, a: "Jamal T.", r: `${city} Regular` },
        { t: `The atmosphere is unmatched. Feels like the barbershop I grew up with, but cleaner and with better music.`, a: "Anthony R.", r: `${city} Monthly Client` },
        { t: `My son loves coming here. They're patient with kids and always give him a clean cut. Best in ${city}.`, a: "Monica G.", r: `Parent, ${city}` },
      ],
      faqs: [
        { q: "Do I need an appointment?", a: "Walk-ins are always welcome, but we recommend booking for weekends and after-work hours." },
        { q: "How long does a cut take?", a: "A standard cut takes about 30 minutes. A cut with beard work takes about 45 minutes." },
        { q: "Do you do kids?", a: "Absolutely. We cut all ages and have plenty of experience with first haircuts." },
        { q: "Can I request a specific barber?", a: "Yes. When booking, just let us know your preferred barber and we'll accommodate." },
        { q: "Do you do beard trims only?", a: "Yes, beard trims and line-ups are available as standalone services." },
      ],
    };
  }
  return {
    headlineTemplate: `${name} — ${cat.charAt(0).toUpperCase() + c.slice(1)} in ${city} You Can Actually Trust.`,
    subTemplate: `Professional ${cat} services in ${city} with fair pricing and results that speak for themselves.`,
    ctaMain: "Get in Touch", ctaPhone: "Call Now",
    trust: ["Licensed & Insured", `${city}\'s Top Rated`, "Fair Pricing", "Satisfaction Guaranteed"],
    steps: [{ n: "Call", d: "Tell us what you need" }, { n: "Quote", d: "Clear, fair pricing" }, { n: "Work", d: "Done right, on time" }, { n: "Done", d: "Satisfaction guaranteed" }],
    testimonials: [
      { t: `Professional from start to finish. ${name} exceeded every expectation I had.`, a: "James R.", r: `${city}` },
      { t: `Fair pricing and excellent work. I\'ve already recommended ${name} to three friends in ${city}.`, a: "Lisa M.", r: `${city}` },
      { t: `Showed up on time and delivered exactly what was promised. Refreshingly rare these days.`, a: "Carlos S.", r: `${city}` },
    ],
    faqs: [
      { q: "How do I get started?", a: `Just give us a call or send a message. We'll schedule a time that works for you in ${city}.` },
      { q: "Do you offer free estimates?", a: "Yes, estimates are always free with no obligation." },
      { q: "What areas do you serve?", a: `We serve all of ${city} and surrounding neighborhoods.` },
      { q: "Are you licensed and insured?", a: "Yes, fully licensed and insured for your protection." },
      { q: "What payment methods do you accept?", a: "We accept cash, check, and all major credit cards." },
    ],
  };
}

// ═══════════════════════════════════════════════════════════════════
// 6. HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════
function cssVars(arch: Arch, P: Record<string, string>, N: Record<string, string>) {
  const cfg = CFG[arch];
  return `@import url('${GF[arch]}');
:root{--b50:${P[50]};--b100:${P[100]};--b200:${P[200]};--b300:${P[300]};--b400:${P[400]};--b500:${P[500]};--b600:${P[600]};--b700:${P[700]};--b800:${P[800]};--bg:${N[0]};--bg2:${N[50]};--txt:${N[800]};--txt2:${N[500]};--bdr:${N[200]};--n900:${N[900]};--n800:${N[800]};--n700:${N[700]};--n600:${N[600]};--n500:${N[500]};--n400:${N[400]};--n300:${N[300]};--n200:${N[200]};--n100:${N[100]};--fH:${cfg.fH};--fB:${cfg.fB};--r:${cfg.r}}
*,*::before,*::after{box-sizing:border-box;margin:0}
html{-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block;height:auto}
a{color:inherit;text-decoration:none}
body{font-family:var(--fB);color:var(--txt);background:var(--bg);line-height:1.65;overflow-x:hidden}`;
}

function wrapHtml(title: string, desc: string, css: string, body: string) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${title}</title><meta name="description" content="${desc.slice(0, 155)}"><link rel="preconnect" href="https://images.unsplash.com"><style>${css}</style></head><body>${body}
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script>${gsapScript()}</script></body></html>`;
}

function rd(b: { name: string; category: string; city: string }) {
  return `# ${b.name} Website\nProfessional website for ${b.name}, a ${b.category} in ${b.city}.\n\n## Files\n- **index.html** — Main page\n- **css/style.css** — All styles\n\n## Quick Changes\n- Edit text, images, and contact info in index.html\n- Edit colors and fonts in css/style.css\n\n## Hosting\nDrag folder to [Netlify Drop](https://app.netlify.com/drop) or upload via FTP.\n`;
}

function ft(b: any) {
  return `<footer class="sf"><div class="container">&copy; ${new Date().getFullYear()} ${b.name} &middot; ${b.city}</div></footer>`;
}

// ═══════════════════════════════════════════════════════════════════
// 7. GSAP ANIMATION SCRIPT — included in every generated page
// ═══════════════════════════════════════════════════════════════════
function gsapScript(): string {
  return `
gsap.registerPlugin(ScrollTrigger);
// Smooth Scroll (Lenis-style)
let currentScroll=0,targetScroll=0;const ease=0.1;
function smoothScroll(){currentScroll+=(targetScroll-currentScroll)*ease;document.documentElement.scrollTop=currentScroll;requestAnimationFrame(smoothScroll)}
window.addEventListener('scroll',()=>targetScroll=window.pageYOffset||document.documentElement.scrollTop);
requestAnimationFrame(smoothScroll);
// Parallax
gsap.utils.toArray('.parallax').forEach(el=>{gsap.to(el,{yPercent:-20,ease:'none',scrollTrigger:{trigger:el.parentElement,start:'top bottom',end:'bottom top',scrub:true}})});
// Text reveal
gsap.utils.toArray('.text-reveal').forEach(el=>{const text=el.textContent||'';const words=text.split(' ').filter(w=>w.length>0);el.innerHTML=words.map(w=>'<span style="display:inline-block;overflow:hidden;margin-right:0.3em"><span class="word-inner" style="display:inline-block">'+w+'</span></span>').join(' ');gsap.from(el.querySelectorAll('.word-inner'),{y:60,opacity:0,duration:0.8,stagger:0.03,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 85%'}})});
// Section entrances
gsap.utils.toArray('.animate-in').forEach(el=>{gsap.from(el,{y:60,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 85%'}})});
// Stagger cards
gsap.utils.toArray('.stagger-container').forEach(c=>{gsap.from(c.querySelectorAll('.stagger-item'),{y:80,opacity:0,duration:0.8,stagger:0.12,ease:'power3.out',scrollTrigger:{trigger:c,start:'top 80%'}})});
// Image scale reveals
gsap.utils.toArray('.img-reveal').forEach(el=>{gsap.from(el,{scale:1.2,opacity:0,duration:1.2,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 85%'}})});
// Counter animation
gsap.utils.toArray('.counter').forEach(el=>{const target=parseInt(el.dataset.target||'0');gsap.from(el,{textContent:0,duration:2,ease:'power2.out',snap:{textContent:1},scrollTrigger:{trigger:el,start:'top 85%'},onUpdate:function(){el.textContent=Math.ceil(this.targets()[0].textContent).toString()}});el.dataset.animated='true'});
// Magnetic buttons
document.querySelectorAll('.magnetic').forEach(btn=>{btn.addEventListener('mousemove',e=>{const rect=btn.getBoundingClientRect();const x=e.clientX-rect.left-rect.width/2;const y=e.clientY-rect.top-rect.height/2;btn.style.transform='translate('+x*0.3+'px,'+y*0.3+'px)';btn.style.transition='transform 0.1s'});btn.addEventListener('mouseleave',()=>{btn.style.transform='translate(0,0)';btn.style.transition='transform 0.3s'})});
// Diagonal section divider
const diagonal=document.querySelector('.diagonal-bottom');if(diagonal){diagonal.style.clipPath='polygon(0 0,100% 0,100% 85%,0 100%)'}
`.trim();
}

// ═══════════════════════════════════════════════════════════════════
// 8. SHARED CSS — all animation classes + layout styles
// ═══════════════════════════════════════════════════════════════════
function sharedCSS(arch: Arch, P: Record<string, string>, N: Record<string, string>): string {
  const isDark = arch === "brutalist" || arch === "boldMinimal";
  const d = { bg: isDark ? "#0a0a0a" : "var(--bg)", bg2: isDark ? "#111" : "var(--bg2)", txt: isDark ? "#e5e5e5" : "var(--txt)", txt2: isDark ? "#888" : "var(--txt2)", bdr: isDark ? "#222" : "var(--bdr)", surface: isDark ? "#111" : "var(--bg2)" };
  const btnBg = arch === "boldMinimal" ? "var(--b500)" : arch === "retro" ? "var(--b600)" : "var(--b500)";
  return `
/* === LAYOUT === */
.container{max-width:1160px;margin:0 auto;padding:0 clamp(1.25rem,5vw,2.5rem)}
.sf{padding:2rem 0;text-align:center;font-size:0.8125rem;color:${d.txt2};border-top:1px solid ${d.bdr}}

/* === NAV === */
.nav{display:flex;justify-content:space-between;align-items:center;padding:1.5rem 0;border-bottom:1px solid ${d.bdr};position:relative;z-index:10}
.logo{font-family:var(--fH);font-size:1.25rem;font-weight:${arch==="boldMinimal"?"700":"600"};color:${isDark?"#fff":"var(--n900)"};${arch==="softLuxury"?"font-style:italic;":""}}
.tag{font-size:0.8125rem;color:${d.txt2}}

/* === HERO === */
.hero-wrap{position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;overflow:hidden}
.hero-bg{position:absolute;inset:0;z-index:0}
.hero-bg img{width:100%;height:100%;object-fit:cover}
.hero-grad{position:absolute;inset:0;background:linear-gradient(135deg,${isDark?"#0a0a0a":N[900]}e8 0%,${isDark?"#0a0a0a":N[900]}c0 40%,${isDark?"#0a0a0acc":"transparent"} 100%);z-index:1}
.hero-inner{position:relative;z-index:2;max-width:800px;padding:2rem}
.hero-inner h1{font-family:var(--fH);font-size:clamp(3.5rem,9vw,7rem);line-height:0.95;font-weight:700;color:#fff;letter-spacing:${arch==="boldMinimal"?"-0.04em":arch==="brutalist"?"-0.03em":"-0.02em"};text-transform:${arch==="brutalist"?"uppercase":"none"}}
.hero-inner p{color:${isDark?"var(--n300)":N[200]};font-size:1.25rem;margin-top:1.5rem;line-height:1.7;max-width:560px;margin-left:auto;margin-right:auto}
.hero-actions{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-top:2.5rem}
.btn{display:inline-flex;align-items:center;gap:0.5rem;padding:1.125rem 2.5rem;background:${btnBg};color:#fff;border-radius:var(--r);font-weight:600;font-size:0.9375rem;transition:all .25s;cursor:pointer;font-family:var(--fB)}
.btn:hover{transform:translateY(-3px);box-shadow:0 16px 40px ${P[600]}50}
.btn-outline{background:transparent;color:#fff;border:1px solid ${isDark?"#444":N[300]}}
.btn-outline:hover{border-color:#fff;background:rgba(255,255,255,0.05)}
.hero-badge{display:inline-flex;align-items:center;gap:1rem;background:rgba(255,255,255,0.1);backdrop-filter:blur(10px);padding:0.75rem 1.5rem;border-radius:100px;margin-top:2rem;color:#fff;border:1px solid rgba(255,255,255,0.15)}
.hero-badge-stars{color:var(--b400);font-weight:600;font-size:0.9375rem;letter-spacing:0.1em}

/* === EMERGENCY BAR === */
.eb{background:var(--b600);color:#fff;text-align:center;padding:0.875rem;font-weight:600;font-size:0.9375rem}
.eb a{color:#fff;text-decoration:underline;font-weight:700}

/* === TRUST BAR === */
.tb{background:${d.surface};padding:1.5rem 0;border-bottom:1px solid ${d.bdr}}
.tb .container{display:flex;justify-content:space-around;flex-wrap:wrap;gap:1.5rem}
.ti{display:flex;align-items:center;gap:0.5rem;font-size:0.8125rem;color:${d.txt2};font-weight:500}
.ti svg{color:var(--b600);width:18px;height:18px}

/* === SERVICES === */
.ss{padding:6rem 0}
.ss h2{font-family:var(--fH);font-size:clamp(2rem,4vw,3.5rem);text-align:center;margin-bottom:1rem;color:${isDark?"#fff":"var(--n900)"}}
.ss-sub{text-align:center;color:${d.txt2};margin-bottom:3rem;font-size:1.0625rem}
.sg{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem}
.sc{background:${d.surface};border:1px solid ${d.bdr};border-radius:var(--r);padding:2rem;transition:all .3s;position:relative;overflow:hidden}
.sc:hover{transform:translateY(-6px);box-shadow:0 24px 64px ${N[900]}15;border-color:var(--b300)}
.sc::before{content:"";position:absolute;top:0;left:0;width:4px;height:100%;background:var(--b500);opacity:0;transition:opacity .3s}
.sc:hover::before{opacity:1}
.sci{width:56px;height:56px;border-radius:var(--r);background:var(--b50);color:var(--b600);display:flex;align-items:center;justify-content:center;margin-bottom:1.25rem}
.sc h4{font-family:var(--fH);font-size:1.125rem;margin-bottom:0.5rem;color:${isDark?"#fff":"var(--n800)"}}
.sc p{color:${d.txt2};font-size:0.9375rem;line-height:1.6}
.scp{font-family:var(--fH);font-size:1.375rem;color:var(--b600);font-weight:700;margin-top:0.75rem}
.scl{display:inline-flex;align-items:center;gap:0.4rem;color:var(--b600);font-weight:600;font-size:0.875rem;margin-top:1rem}

/* === ABOUT === */
.abt{padding:6rem 0}
.abt h2{font-family:var(--fH);font-size:clamp(2rem,4vw,3rem);margin-bottom:1.5rem;color:${isDark?"#fff":"var(--n900)"}}
.ag{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center}
.ag img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:var(--r);${arch==="brutalist"?"filter:grayscale(40%) contrast(1.1)":arch==="softLuxury"?"box-shadow:0 32px 80px "+N[900]+"18":""}}
.ag p{color:${d.txt2};line-height:1.9;font-size:1.0625rem}
.qt{margin-top:2rem;padding:1.5rem 0 1.5rem 1.5rem;border-left:3px solid var(--b500);color:${isDark?"#ccc":"var(--n700)"};font-style:italic;font-size:1.125rem;line-height:1.7}

/* === PROCESS === */
.ps{padding:6rem 0;background:${d.surface}}
.ps h2{font-family:var(--fH);font-size:clamp(2rem,4vw,3rem);text-align:center;margin-bottom:3rem;color:${isDark?"#fff":"var(--n900)"}}
.pg{display:grid;grid-template-columns:repeat(4,1fr);gap:2rem;text-align:center}
.pn{width:64px;height:64px;border-radius:50%;background:var(--b600);color:#fff;font-family:var(--fH);font-size:1.5rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;box-shadow:0 8px 24px ${P[600]}40}
.pg h4{font-size:1.0625rem;margin-bottom:0.25rem;color:${isDark?"#fff":"var(--n800)"};font-weight:600}
.pg p{color:${d.txt2};font-size:0.875rem}

/* === TESTIMONIALS === */
.ts{padding:6rem 0;background:${d.surface}}
.ts h2{font-family:var(--fH);font-size:clamp(2rem,4vw,3rem);text-align:center;margin-bottom:3rem;color:${isDark?"#fff":"var(--n900)"}}
.tg{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem}
.tc{background:${isDark?"#1a1a1a":d.bg};padding:2rem;border-radius:var(--r);border:1px solid ${d.bdr};position:relative}
.tc::before{content:'"';position:absolute;top:1rem;right:1.5rem;font-family:var(--fH);font-size:4rem;color:var(--b200);line-height:1;opacity:0.5}
.tstars{color:var(--b400);margin-bottom:1rem;font-size:0.875rem;letter-spacing:0.15em}
.tt{line-height:1.8;color:${d.txt2};font-style:italic;margin-bottom:1.5rem;font-size:1rem}
.ta{display:flex;align-items:center;gap:0.75rem}
.tav{width:40px;height:40px;border-radius:50%;background:var(--b600);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:0.875rem}
.tnm{font-weight:600;color:${isDark?"#ddd":"var(--n800)"}}
.tr{font-size:0.8125rem;color:${d.txt2}}

/* === FAQ === */
.fq{padding:6rem 0}
.fq h2{font-family:var(--fH);font-size:clamp(2rem,4vw,3rem);text-align:center;margin-bottom:3rem;color:${isDark?"#fff":"var(--n900)"}}
.fi{border-bottom:1px solid ${d.bdr}}
.fi input{display:none}
.fi label{display:flex;justify-content:space-between;align-items:center;padding:1.25rem 0;cursor:pointer;font-weight:600;color:${isDark?"#fff":"var(--n800)"};font-family:var(--fH);font-size:1.0625rem}
.ftog{font-size:1.5rem;color:var(--b600);transition:transform .3s}
.fi input:checked~label .ftog{transform:rotate(45deg)}
.fans{max-height:0;overflow:hidden;transition:max-height .4s,color ${d.txt2};line-height:1.7;font-size:1rem}
.fi input:checked~.fans{max-height:250px;padding-bottom:1.25rem}

/* === CTA BANNER === */
.cta{text-align:center;padding:5rem 2rem;margin:2rem;border-radius:var(--r);color:#fff;position:relative;overflow:hidden}
.cta::before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,var(--n900) 0%,var(--b800) 100%);z-index:0}
.cta>*{position:relative;z-index:1}
.cta h3{font-family:var(--fH);font-size:clamp(2rem,4vw,3rem);margin-bottom:1rem}
.cta p{color:var(--n300);margin-bottom:2rem;font-size:1.125rem}

/* === CONTACT === */
.cs{padding:6rem 0;text-align:center}
.cs h2{font-family:var(--fH);font-size:clamp(2rem,4vw,3.5rem);margin-bottom:1rem;color:${isDark?"#fff":"var(--n900)"}}
.csp{color:${d.txt2};margin-bottom:2.5rem;font-size:1.125rem;max-width:500px;margin-left:auto;margin-right:auto}
.cg{display:flex;justify-content:center;gap:3rem;margin-bottom:2.5rem;flex-wrap:wrap}
.cg>div{display:flex;align-items:center;gap:0.75rem;color:${d.txt2}}
.cg svg{color:var(--b600)}
.cg a{color:var(--b600);font-weight:500}

/* === STATS === */
.sts{display:flex;justify-content:center;gap:5rem;padding:4rem 0;border-top:1px solid ${d.bdr};border-bottom:1px solid ${d.bdr}}
.sn{font-family:var(--fH);font-size:3.5rem;font-weight:700;color:var(--b400);line-height:1}
.sl{font-size:0.75rem;text-transform:uppercase;letter-spacing:0.15em;color:${d.txt2};margin-top:0.5rem}

/* === ANIMATION UTILITIES === */
.word-inner{will-change:transform}
.parallax{will-change:transform}
.img-reveal{overflow:hidden;border-radius:var(--r)}
.img-reveal img{will-change:transform}
.magnetic{will-change:transform}
.diagonal-bottom{clip-path:polygon(0 0,100% 0,100% 85%,0 100%)}

/* === RESPONSIVE === */
@media(max-width:768px){
.hero-inner h1{font-size:clamp(2.5rem,12vw,4rem)!important}
.ag{grid-template-columns:1fr!important}
.pg{grid-template-columns:repeat(2,1fr)!important}
.sg{grid-template-columns:1fr!important}
.tg{grid-template-columns:1fr!important}
.sts{flex-direction:column;gap:2rem!important}
.hero-actions{flex-direction:column;align-items:center}
.cta{margin:1rem!important;padding:3rem 1.5rem!important}
}
@media(max-width:480px){
.pg{grid-template-columns:1fr!important}
.cg{flex-direction:column;gap:1rem!important}
}`;
}


// ═══════════════════════════════════════════════════════════════════
// 9. SECTION BUILDERS — each returns a chunk of HTML
// ═══════════════════════════════════════════════════════════════════

function heroSection(b: any, cd: CatData, heroImg: string, arch: Arch): string {
  const isDark = arch === "brutalist" || arch === "boldMinimal";
  return `<section class="hero-wrap diagonal-bottom" style="${arch==="brutalist"?"clip-path:polygon(0 0,100% 0,100% 92%,0 100%)":arch==="boldMinimal"?"clip-path:polygon(0 0,100% 0,100% 88%,0 100%)":""}">
<div class="hero-bg parallax"><img src="${heroImg}" alt="${b.name}"></div>
<div class="hero-grad"></div>
<div class="hero-inner animate-in">
<h1 class="text-reveal">${cd.headlineTemplate}</h1>
<p>${cd.subTemplate}</p>
<div class="hero-actions">
<a href="#contact" class="btn magnetic">${cd.ctaMain}</a>
${b.phone ? `<a href="tel:${b.phone}" class="btn btn-outline magnetic">${cd.ctaPhone}</a>` : ""}
</div>
<div class="hero-badge">
<span class="hero-badge-stars">★★★★★</span><span>4.9/5 from ${cd.testimonials.length}0+ ${b.city} customers</span>
</div>
</div></section>`;
}

function trustBar(cd: CatData): string {
  return `<section class="tb"><div class="container">
${cd.trust.map(t => `<div class="ti"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>${t}</div>`).join("")}
</div></section>`;
}

function servicesSection(b: any, cd: CatData, arch: Arch): string {
  const svc = cd.services || ["Service 1", "Service 2", "Service 3", "Service 4"];
  const prices = b.category && typeof b.category === 'string' && b.category.toLowerCase().includes("plumber")
    ? ["From $89", "From $149", "From $199", "From $249"]
    : b.category && typeof b.category === 'string' && b.category.toLowerCase().includes("salon")
    ? ["From $45", "From $85", "From $120", "From $200"]
    : b.category && typeof b.category === 'string' && (b.category.toLowerCase().includes("gym") || b.category.toLowerCase().includes("fitness"))
    ? ["$49/mo", "$79/mo", "$99/mo", "$149/mo"]
    : b.category && typeof b.category === 'string' && b.category.toLowerCase().includes("cafe")
    ? ["$4–$8", "$6–$12", "$8–$15", "$12–$20"]
    : b.category && typeof b.category === 'string' && (b.category.toLowerCase().includes("lawyer") || b.category.toLowerCase().includes("attorney"))
    ? ["Flat Fee", "Hourly", "Retainer", "Free Consult"]
    : b.category && typeof b.category === 'string' && b.category.toLowerCase().includes("dentist")
    ? ["From $99", "From $149", "From $199", "From $299"]
    : b.category && typeof b.category === 'string' && b.category.toLowerCase().includes("barber")
    ? ["$25", "$35", "$45", "$55"]
    : b.category && typeof b.category === 'string' && b.category.toLowerCase().includes("photo")
    ? ["From $299", "From $499", "From $799", "From $1,499"]
    : ["Contact Us", "Contact Us", "Contact Us", "Contact Us"];
  const icons = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  ];
  return `<section class="ss" id="services"><div class="container">
<h2 class="text-reveal">What We Do</h2>
<p class="ss-sub">${cd.servicesIntro || `Services built around real customer needs in ${b.city}.`}</p>
<div class="sg stagger-container">
${svc.map((s: string, i: number) => `<div class="sc stagger-item">
<div class="sci">${icons[i % icons.length]}</div>
<h4>${s}</h4>
<p>Professional-grade ${typeof s === 'string' ? s.toLowerCase() : s} delivered by experienced team members who care about the details.</p>
<div class="scp">${prices[i] || "Contact Us"}</div>
</div>`).join("")}
</div></div></section>`;
}

function aboutSection(b: any, cd: CatData, arch: Arch, heroImg: string): string {
  const isDark = arch === "brutalist" || arch === "boldMinimal";
  return `<section class="abt" id="about"><div class="container">
<div class="ag">
<div class="img-reveal">
<img src="${heroImg}" alt="${b.name} team at work">
</div>
<div class="animate-in">
<h2 class="text-reveal">Not Your Average ${typeof b.category === 'string' ? b.category.charAt(0).toUpperCase() + b.category.slice(1) : 'Business'}</h2>
<p>${cd.story || `${b.name} started with a simple idea: do right by every customer who walks through the door. In ${b.city}, word travels fast — and we've built our reputation one job at a time.`}</p>
<div class="qt">
${cd.values || `"We believe in showing up on time, doing what we said we'd do, and charging what's fair. Everything else is just noise."`}
</div>
</div>
</div>
</div></section>`;
}

function processSection(cd: CatData): string {
  return `<section class="ps" id="process"><div class="container">
<h2 class="text-reveal">How It Works</h2>
<div class="pg stagger-container">
${cd.steps.map((s: any, i: number) => `<div class="stagger-item"><div class="pn">${i + 1}</div><h4>${s.n}</h4><p>${s.d}</p></div>`).join("")}
</div></div></section>`;
}

function testimonialsSection(cd: CatData): string {
  return `<section class="ts" id="reviews"><div class="container">
<h2 class="text-reveal">What ${cd.testimonials[0]?.a?.includes("Homeowner") ? "Homeowners" : "Customers"} Say</h2>
<div class="tg stagger-container">
${cd.testimonials.map((t: any) => `<div class="tc stagger-item">
<div class="tstars">★★★★★</div>
<div class="tt">${t.t}</div>
<div class="ta"><div class="tav">${t.a.split(" ").map((w: string) => w[0]).join("")}</div><div><div class="tnm">${t.a}</div><div class="tr">${t.r}</div></div></div>
</div>`).join("")}
</div></div></section>`;
}

function faqSection(cd: CatData): string {
  return `<section class="fq" id="faq"><div class="container">
<h2 class="text-reveal">Questions? Answered.</h2>
${cd.faqs.map((f: any, i: number) => `<div class="fi"><input type="checkbox" id="f${i}"><label for="f${i}">${f.q}<span class="ftog">+</span></label><div class="fans">${f.a}</div></div>`).join("")}
</div></section>`;
}

function ctaBanner(b: any, cd: CatData): string {
  return `<section class="cta"><div>
<h3>${cd.contactCta || `Ready to get started with ${b.name}?`}</h3>
<p>Join the ${cd.testimonials.length}0+ satisfied customers in ${b.city}. First consultation is always free.</p>
<div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
<a href="#contact" class="btn magnetic" style="background:#fff;color:var(--n900)">${cd.ctaMain}</a>
${b.phone ? `<a href="tel:${b.phone}" class="btn btn-outline magnetic">${b.phone}</a>` : ""}
</div></div></section>`;
}

function contactSection(b: any): string {
  return `<section class="cs" id="contact"><div class="container">
<h2 class="text-reveal">Get in Touch</h2>
<p class="csp">${b.phone ? `Call ${b.phone}` : ""}${b.phone && b.email ? " or " : ""}${b.email ? `email ${b.email}` : ""}. We respond within 24 hours.</p>
<div class="cg">
${b.phone ? `<div><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg><a href="tel:${b.phone}">${b.phone}</a></div>` : ""}
${b.email ? `<div><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg><a href="mailto:${b.email}">${b.email}</a></div>` : ""}
${b.address ? `<div><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><span>${b.address}, ${b.city}</span></div>` : ""}
</div>
</div></section>`;
}

function statsBar(): string {
  return `<section class="sts"><div>
<div><div class="sn counter" data-target="500">500</div><div class="sl">Happy Customers</div></div>
<div><div class="sn counter" data-target="12">12</div><div class="sl">Years Experience</div></div>
<div><div class="sn counter" data-target="98">98</div><div class="sl">% Satisfaction</div></div>
</div></section>`;
}

function emergencyBar(cd: CatData): string {
  if (!cd.emergency) return "";
  return `<div class="eb">${cd.emergency} — <a href="tel:5551234567">555-123-4567</a></div>`;
}

// ═══════════════════════════════════════════════════════════════════
// 10. MAIN BUILDER — assembles full page
// ═══════════════════════════════════════════════════════════════════

export interface BuildInput {
  business: {
    name: string;
    category: string;
    city: string;
    phone?: string;
    email?: string;
    address?: string;
    website?: string;
    description?: string;
    hours?: string;
  };
  copy?: {
    headline?: string;
    subheadline?: string;
    cta?: string;
    story?: string;
    values?: string;
    servicesIntro?: string;
    services?: string[];
    contactCta?: string;
  } | null;
}

export interface BuildOutput {
  title: string;
  description: string;
  body: string;
  readme: string;
}

export function buildPage(input: BuildInput): BuildOutput {
  const b = input.business;
  const categoryDisplay = b.category.charAt(0).toUpperCase() + b.category.slice(1);
  const title = `${b.name} — ${categoryDisplay} in ${b.city}`;
  const desc = b.description || `${b.name} is a ${b.category} business serving ${b.city}.`;

  const arch = pickArch(b.category);
  const h = CFG[arch].hue[0] + Math.random() * (CFG[arch].hue[1] - CFG[arch].hue[0]);
  const P = prim(h);
  const N = neut(h);

  const heroImage = heroImg(b.category);
  const cd = catData(b.category, b.name, b.city);

  // Override with AI-generated copy if available
  if (input.copy) {
    if (input.copy.headline) cd.headlineTemplate = input.copy.headline;
    if (input.copy.subheadline) cd.subTemplate = input.copy.subheadline;
    if (input.copy.cta) cd.ctaMain = input.copy.cta;
    if (input.copy.story) cd.story = input.copy.story;
    if (input.copy.values) cd.values = input.copy.values;
    if (input.copy.servicesIntro) cd.servicesIntro = input.copy.servicesIntro;
    if (input.copy.services && input.copy.services.length > 0) cd.services = input.copy.services;
    if (input.copy.contactCta) cd.contactCta = input.copy.contactCta;
  }
  // Use business services if provided
  const em = emergencyBar(cd);
  const nav = `<nav class="nav container"><div class="logo">${b.name}</div><div class="tag">${categoryDisplay} &middot; ${b.city}</div></nav>`;

  // Per-archetype section composition
  let sections = "";

  switch (arch) {
    case "brutalist": {
      sections = em + nav +
        heroSection(b, cd, heroImage, arch) +
        trustBar(cd) +
        statsBar() +
        servicesSection(b, cd, arch) +
        aboutSection(b, cd, arch, heroImage) +
        processSection(cd) +
        testimonialsSection(cd) +
        faqSection(cd) +
        ctaBanner(b, cd) +
        contactSection(b);
      break;
    }
    case "softLuxury": {
      sections = nav + em +
        heroSection(b, cd, heroImage, arch) +
        trustBar(cd) +
        aboutSection(b, cd, arch, heroImage) +
        servicesSection(b, cd, arch) +
        processSection(cd) +
        testimonialsSection(cd) +
        faqSection(cd) +
        ctaBanner(b, cd) +
        contactSection(b);
      break;
    }
    case "editorial": {
      sections = nav +
        heroSection(b, cd, heroImage, arch) +
        trustBar(cd) +
        statsBar() +
        aboutSection(b, cd, arch, heroImage) +
        processSection(cd) +
        servicesSection(b, cd, arch) +
        testimonialsSection(cd) +
        faqSection(cd) +
        ctaBanner(b, cd) +
        contactSection(b);
      break;
    }
    case "modernTech": {
      sections = nav + em +
        heroSection(b, cd, heroImage, arch) +
        statsBar() +
        servicesSection(b, cd, arch) +
        processSection(cd) +
        aboutSection(b, cd, arch, heroImage) +
        testimonialsSection(cd) +
        faqSection(cd) +
        ctaBanner(b, cd) +
        contactSection(b);
      break;
    }
    case "warmLocal": {
      sections = nav +
        heroSection(b, cd, heroImage, arch) +
        trustBar(cd) +
        aboutSection(b, cd, arch, heroImage) +
        servicesSection(b, cd, arch) +
        processSection(cd) +
        testimonialsSection(cd) +
        faqSection(cd) +
        ctaBanner(b, cd) +
        contactSection(b);
      break;
    }
    case "boldMinimal": {
      sections = em + nav +
        heroSection(b, cd, heroImage, arch) +
        statsBar() +
        servicesSection(b, cd, arch) +
        aboutSection(b, cd, arch, heroImage) +
        processSection(cd) +
        testimonialsSection(cd) +
        faqSection(cd) +
        ctaBanner(b, cd) +
        contactSection(b);
      break;
    }
    case "photoFirst": {
      sections = nav +
        heroSection(b, cd, heroImage, arch) +
        trustBar(cd) +
        aboutSection(b, cd, arch, heroImage) +
        servicesSection(b, cd, arch) +
        processSection(cd) +
        testimonialsSection(cd) +
        faqSection(cd) +
        ctaBanner(b, cd) +
        contactSection(b);
      break;
    }
    case "retro": {
      sections = nav +
        heroSection(b, cd, heroImage, arch) +
        trustBar(cd) +
        aboutSection(b, cd, arch, heroImage) +
        servicesSection(b, cd, arch) +
        processSection(cd) +
        testimonialsSection(cd) +
        faqSection(cd) +
        ctaBanner(b, cd) +
        contactSection(b);
      break;
    }
  }

  const css = cssVars(arch, P, N) + sharedCSS(arch, P, N);
  const body = sections + ft(b);
  const html = wrapHtml(title, desc, css, body);

  return {
    title,
    description: desc,
    body: html,
    readme: rd(b),
  };
}
