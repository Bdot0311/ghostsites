// impeccableDesign.ts v8 — Hyper-personalized per business category
// Category-specific sections, copy, CTAs, and content — NOT just color swaps

const US: Record<string,{h1:string;h2:string;h3:string;a1:string;a2:string}>={
  salon:{h1:"1560066984-138dadb4c035",h2:"1522337360788-8b13dee7a37e",h3:"1521590832167-7bcbfaa6381f",a1:"1599351431202-1e0f0137899a",a2:"1562322140-ec1ac272ff6e"},
  cafe:{h1:"1501339847302-ac426a4a7cbb",h2:"1495474472287-4d71bcdd2085",h3:"1442512595331-e8eacc5bf52e",a1:"1509042239860-f550be71085f",a2:"1493857671503-07f091b727eb"},
  restaurant:{h1:"1517248135467-4c7edcad34c4",h2:"1414235077428-338989a2e8c0",h3:"1550966871-3ed3c47e2ce2",a1:"1552566624-6b570431e484",a2:"1517248135467-4c7edcad34c4"},
  gym:{h1:"1534438327276-14e5300c3a48",h2:"1571019614242-c5c5dee9f50b",h3:"1540497077202-7c8a3999166f",a1:"1581009145735-ea1bca36bc0c",a2:"1534438327276-14e5300c3a48"},
  plumber:{h1:"1585704032915-c3400ca199e7",h2:"1584622650111-993a426709bf",h3:"1585704032915-c3400ca199e7",a1:"1585704032915-c3400ca199e7",a2:"1504328345606-3bb8add33b9c"},
  dentist:{h1:"1629909613654-28e377c37b09",h2:"1606811841689-23dfddce3e95",h3:"1588776814546-1ffcf47267a5",a1:"1629909613654-28e377c37b09",a2:"1609840113766-488865e3e9c7"},
  photogra:{h1:"1554048612-b6a482bc67e5",h2:"1542038784456-1e8e935640e",h3:"1516035069371-29a1b244cc32",a1:"1493861643582-803a3fdd87bd",a2:"1554048612-b6a482bc67e5"},
  lawyer:{h1:"1589829545856-d10d557cf95f",h2:"1450101499163-c8848c66ca85",h3:"1505664194779-8beaceb93744",a1:"1589829545856-d10d557cf95f",a2:"1450101499163-c8848c66ca85"},
  bakery:{h1:"1556217477-d325251ece38",h2:"1509440159596-0249088772ff",h3:"1517433670267-08bbd4be890f",a1:"1556217477-d325251ece38",a2:"1509440159596-0249088772ff"},
  barber:{h1:"1599351431202-1e0f0137899a",h2:"1621605815971-fbc98d665033",h3:"1503951914875-452162b0f77f",a1:"1599351431202-1e0f0137899a",a2:"1621605815971-fbc98d665033"},
  spa:{h1:"1544161515-4ab6ce6db874",h2:"1600334129128-685c5582fd35",h3:"1540555700478-4be289fbec6d",a1:"1544161515-4ab6ce6db874",a2:"1600334129128-685c5582fd35"},
  default:{h1:"1497366216548-37526070297c",h2:"1497366811353-6870744d04b2",h3:"1497366811353-6870744d04b2",a1:"1497366216548-37526070297c",a2:"1497366811353-6870744d04b2"},
};
function us(cat:string,t:"h1"|"h2"|"h3"|"a1"|"a2"):string{const c=cat.toLowerCase();for(const[k,v]of Object.entries(US))if(c.includes(k))return`https://images.unsplash.com/photo-${v[t]}?w=1400&q=80`;return`https://images.unsplash.com/photo-${US.default[t]}?w=1400&q=80`;}

function oklch(l:number,c:number,h:number){return`oklch(${l}% ${c} ${h})`;}
function prim(h:number){return{50:oklch(97,0.02,h),100:oklch(93,0.04,h),200:oklch(86,0.08,h),300:oklch(76,0.12,h),400:oklch(65,0.18,h),500:oklch(55,0.22,h),600:oklch(45,0.20,h),700:oklch(35,0.16,h),800:oklch(25,0.10,h),900:oklch(15,0.05,h)};}
function neut(h:number){const c=0.008;return{0:oklch(100,c*0.5,h),50:oklch(98,c,h),100:oklch(95,c,h),200:oklch(88,c,h),300:oklch(75,c,h),400:oklch(62,c,h),500:oklch(50,c,h),600:oklch(38,c,h),700:oklch(28,c,h),800:oklch(18,c,h),900:oklch(12,c,h),950:oklch(8,c,h)};}

export type Arch="brutalist"|"softLuxury"|"editorial"|"modernTech"|"warmLocal"|"boldMinimal"|"photoFirst"|"retro";

const CFG:Record<Arch,{name:string;hue:[number,number];fH:string;fB:string;r:string}>= {
  brutalist:{name:"Brutalist",hue:[0,360],fH:"'Space Grotesk',system-ui,sans-serif",fB:"'Inter',system-ui,sans-serif",r:"0px"},
  softLuxury:{name:"Soft Luxury",hue:[300,340],fH:"'Playfair Display',Georgia,serif",fB:"'Inter',sans-serif",r:"16px"},
  editorial:{name:"Editorial",hue:[20,45],fH:"'Playfair Display',Georgia,serif",fB:"'Source Serif 4',Georgia,serif",r:"0px"},
  modernTech:{name:"Modern Tech",hue:[230,270],fH:"'Inter',system-ui,sans-serif",fB:"'Inter',system-ui,sans-serif",r:"12px"},
  warmLocal:{name:"Warm Local",hue:[30,60],fH:"'DM Serif Display',Georgia,serif",fB:"'Inter',sans-serif",r:"8px"},
  boldMinimal:{name:"Bold Minimal",hue:[0,360],fH:"'Space Grotesk',system-ui,sans-serif",fB:"'Inter',system-ui,sans-serif",r:"0px"},
  photoFirst:{name:"Photo-First",hue:[160,200],fH:"'Playfair Display',Georgia,serif",fB:"'Inter',sans-serif",r:"8px"},
  retro:{name:"Retro",hue:[15,45],fH:"'Courier Prime',monospace",fB:"'Georgia',serif",r:"4px"},
};

const GF:Record<Arch,string>={
  brutalist:"https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Inter:wght@400;500;600&display=swap",
  softLuxury:"https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600&display=swap",
  editorial:"https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500&display=swap",
  modernTech:"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  warmLocal:"https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap",
  boldMinimal:"https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Inter:wght@400;500&display=swap",
  photoFirst:"https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@400;500&display=swap",
  retro:"https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap",
};

function pickArch(c:string):Arch{const cat=c.toLowerCase();const m:[string[],Arch][]=[[["contractor","plumber","roofer","electrician","hvac","landscaping","handyman","pest"],"brutalist"],[["salon","spa","esthetician","nail","lash","brow","makeup"],"softLuxury"],[["lawyer","accountant","consulting","architect","financial","attorney","advisor","tax"],"editorial"],[["tech","software","marketing","agency","design","web","app","digital","it"],"modernTech"],[["cafe","bakery","restaurant","coffee","catering","food","kitchen","brew","diner"],"warmLocal"],[["gym","fitness","trainer","crossfit","yoga","pilates","boxing","martial"],"boldMinimal"],[["photographer","realtor","venue","interior","studio","florist","event","wedding"],"photoFirst"],[["barber","vintage","record","antique","thrift","tattoo"],"retro"]];for(const[t,a]of m)if(t.some(x=>cat.includes(x)))return a;return(["warmLocal","editorial","boldMinimal","softLuxury"]as Arch[])[Math.floor(Math.random()*4)];}

// ──── CATEGORY-SPECIFIC DATA ────
// This is the key: different content per business category

interface CatData {
  ctaShort: string; ctaMain: string; ctaPhone: string;
  trustItems: string[];
  emergencyText?: string;
  showPricing: boolean; showTeam: boolean; showGallery: boolean;
  processSteps: {n:string;d:string}[];
  testimonials: {t:string;a:string;l:string}[];
  faqs: {q:string;a:string}[];
}

function catData(cat: string): CatData {
  const c = cat.toLowerCase();
  // PLUMBER / CONTRACTOR / HVAC
  if (c.includes("plumber") || c.includes("contractor") || c.includes("hvac") || c.includes("electrician") || c.includes("roofer")) {
    return {
      ctaShort: "Get Quote", ctaMain: "Get Your Free Estimate", ctaPhone: "Call for Emergency",
      trustItems: ["Licensed & Insured", "Same-Day Service", "24/7 Emergency", "Free Estimates"],
      emergencyText: "Emergency? Call Now — We Answer 24/7",
      showPricing: true, showTeam: false, showGallery: false,
      processSteps: [{n:"Call",d:"Describe the problem"},{n:"Diagnose",d:"We assess on-site"},{n:"Fix",d:"Repair done right"},{n:"Guarantee",d:"90-day warranty"}],
      testimonials: [{t:"They showed up within an hour and fixed the leak. No games, no upsell. Just honest work.",a:"Mike R.",l:"Homeowner"},{t:"Best pricing I found in town. Will definitely call again.",a:"Jennifer T.",l:"Property Manager"},{t:"Found the problem fast and had it fixed before lunch. That's rare.",a:"Carlos M.",l:"Restaurant Owner"}],
      faqs: [{q:"Do you charge for estimates?",a:"No. Estimates are always free and no-obligation."},{q:"How fast can you get here?",a:"For emergencies, we typically arrive within 1-2 hours. Standard calls are usually same-day or next-day."},{q:"Do you warranty your work?",a:"Yes. All repairs come with a 90-day parts and labor warranty."},{q:"What areas do you serve?",a:"We serve the entire metro area and surrounding neighborhoods."},{q:"Can you handle commercial jobs?",a:"Absolutely. We handle both residential and commercial work of all sizes."}],
    };
  }
  // SALON / SPA / BEAUTY
  if (c.includes("salon") || c.includes("spa") || c.includes("nail") || c.includes("esthetician") || c.includes("lash") || c.includes("brow") || c.includes("makeup")) {
    return {
      ctaShort: "Book Now", ctaMain: "Book Your Appointment", ctaPhone: "Call to Book",
      trustItems: ["Licensed Stylists", "Top Rated in Area", "Premium Products", "Walk-Ins Welcome"],
      showPricing: true, showTeam: true, showGallery: true,
      processSteps: [{n:"Consult",d:"Discuss your look"},{n:"Customize",d:"Tailored to you"},{n:"Transform",d:"Expert hands at work"},{n:"Maintain",d:"Aftercare tips given"}],
      testimonials: [{t:"Finally a salon that actually listens. My hair has never looked better.",a:"Amanda K.",l:"Regular Client"},{t:"The atmosphere is so relaxing and the results are always perfect.",a:"Stephanie L.",l:"Monthly Visitor"},{t:"Best balayage I've ever had. Worth every penny.",a:"Rachel G.",l:"New Client"}],
      faqs: [{q:"Do I need to book ahead?",a:"Walk-ins are welcome but we recommend booking for specialty services."},{q:"What products do you use?",a:"We use premium, professional-grade products. Ask about our vegan and sulfate-free options."},{q:"How long does a typical appointment take?",a:"Cuts take 30-45 min. Color services range from 1.5-3 hours depending on the treatment."},{q:"Do you offer gift cards?",a:"Yes, gift cards are available in any amount and never expire."},{q:"Can I bring reference photos?",a:"Absolutely — the more visual references the better!"}],
    };
  }
  // GYM / FITNESS
  if (c.includes("gym") || c.includes("fitness") || c.includes("trainer") || c.includes("crossfit") || c.includes("yoga") || c.includes("pilates") || c.includes("boxing")) {
    return {
      ctaShort: "Start Free", ctaMain: "Start Your Free Trial", ctaPhone: "Call to Visit",
      trustItems: ["Certified Trainers", "No Contracts", "24/7 Access", "Free Parking"],
      emergencyText: undefined,
      showPricing: true, showTeam: true, showGallery: true,
      processSteps: [{n:"Tour",d:"See the facility"},{n:"Assess",d:"Fitness evaluation"},{n:"Train",d:"Personalized program"},{n:"Results",d:"Track progress monthly"}],
      testimonials: [{t:"Lost 30 lbs in 4 months. The trainers actually care about your progress.",a:"David H.",l:"Member 6 months"},{t:"Cleanest gym I've been to. Equipment is always maintained.",a:"Lisa P.",l:"Member 1 year"},{t:"No contracts, no drama. Just a solid place to work out.",a:"Marcus J.",l:"Member 3 months"}],
      faqs: [{q:"Is there a contract?",a:"No. We offer month-to-month memberships with no long-term commitment."},{q:"Do you offer personal training?",a:"Yes, all of our trainers are certified and offer one-on-one and small group sessions."},{q:"What are your hours?",a:"We're open 24/7 for members. Staffed hours are 6am-10pm Mon-Sat, 8am-6pm Sunday."},{q:"Can I try before I join?",a:"Absolutely. Your first week is free — no credit card required."},{q:"Do you have classes?",a:"Yes, we offer over 30 classes per week including HIIT, yoga, spin, and strength training."}],
    };
  }
  // CAFE / BAKERY / RESTAURANT
  if (c.includes("cafe") || c.includes("bakery") || c.includes("restaurant") || c.includes("coffee") || c.includes("catering") || c.includes("food") || c.includes("kitchen") || c.includes("diner")) {
    return {
      ctaShort: "Order Now", ctaMain: "Order Online or Visit Us", ctaPhone: "Call to Order",
      trustItems: ["Made Fresh Daily", "Local Ingredients", "Catering Available", "Family Owned"],
      showPricing: false, showTeam: true, showGallery: true,
      processSteps: [{n:"Order",d:"Online, phone, or in-person"},{n:"Prepare",d:"Made fresh to order"},{n:"Enjoy",d:"Eat in or take out"},{n:"Return",d:"Regulars get perks"}],
      testimonials: [{t:"Best breakfast spot in town. The croissants are ridiculous.",a:"Tom W.",l:"Weekly Regular"},{t:"We order catering from here for every office meeting. Always on time and delicious.",a:"Sarah B.",l:"Office Manager"},{t:"The coffee alone is worth the trip. Plus the staff remembers your name.",a:"Nina R.",l:"Daily Customer"}],
      faqs: [{q:"Do you take reservations?",a:"We accept reservations for parties of 6 or more. Walk-ins are always welcome."},{q:"Do you offer catering?",a:"Yes! We cater events from 10 to 200 people. Call us for a custom quote."},{q:"Are you open for breakfast?",a:"We open at 7am daily and serve breakfast until 11am."},{q:"Do you have vegan options?",a:"Yes, we offer a rotating selection of vegan and gluten-free items daily."},{q:"Can I order online for pickup?",a:"Absolutely. Order through our website or call ahead and we'll have it ready."}],
    };
  }
  // LAWYER / ACCOUNTANT / CONSULTING
  if (c.includes("lawyer") || c.includes("attorney") || c.includes("accountant") || c.includes("consulting") || c.includes("financial") || c.includes("tax") || c.includes("advisor")) {
    return {
      ctaShort: "Consult", ctaMain: "Schedule a Free Consultation", ctaPhone: "Call Now",
      trustItems: ["Licensed Professional", "Confidential", "Flat Fees Available", "Proven Results"],
      showPricing: true, showTeam: false, showGallery: false,
      processSteps: [{n:"Consult",d:"Free initial meeting"},{n:"Plan",d:"Strategy tailored to you"},{n:"Execute",d:"Handle all details"},{n:"Resolve",d:"Case closed, you win"}],
      testimonials: [{t:"Took a situation that felt hopeless and resolved it in two weeks. Highly recommend.",a:"Robert C.",l:"Business Client"},{t:"Clear communication, fair pricing, and got me a better result than I expected.",a:"Angela D.",l:"Personal Client"},{t:"Professional from day one. No surprises, just results.",a:"Kevin S.",l:"Small Business Owner"}],
      faqs: [{q:"Is the first consultation free?",a:"Yes. Your initial 30-minute consultation is completely free and confidential."},{q:"Do you offer flat fees?",a:"Yes, we offer flat-fee arrangements for many common matters. No surprise bills."},{q:"How long will my case take?",a:"It varies by matter, but we always give you a realistic timeline upfront."},{q:"Do you handle emergencies?",a:"Yes. For urgent matters, call our direct line and we'll respond within 24 hours."},{q:"What information should I bring?",a:"Bring any relevant documents, contracts, or correspondence. We'll handle the rest."}],
    };
  }
  // DENTIST / MEDICAL
  if (c.includes("dentist") || c.includes("dental") || c.includes("orthodont")) {
    return {
      ctaShort: "Book Now", ctaMain: "Book Your Appointment", ctaPhone: "Call Today",
      trustItems: ["Board Certified", "Sedation Available", "Accepts Insurance", "Weekend Hours"],
      emergencyText: "Dental Emergency? Same-Day Appointments Available",
      showPricing: false, showTeam: true, showGallery: false,
      processSteps: [{n:"Book",d:"Easy online scheduling"},{n:"Examine",d:"Digital X-rays & checkup"},{n:"Treat",d:"Gentle, modern care"},{n:"Smile",d:"Results you love"}],
      testimonials: [{t:"I used to dread the dentist. Now I actually don't mind going. They're that gentle.",a:"Patricia M.",l:"Patient 3 years"},{t:"Got me in same day for a broken tooth. Excellent work.",a:"Daniel F.",l:"New Patient"},{t:"The staff is incredibly friendly and the office is spotless.",a:"Hannah L.",l:"Patient 1 year"}],
      faqs: [{q:"Do you accept my insurance?",a:"We accept most major dental insurance plans. Call us to verify your coverage."},{q:"Is sedation available?",a:"Yes, we offer nitrous oxide and oral sedation for anxious patients."},{q:"How often should I come in?",a:"We recommend cleanings every 6 months, but some patients benefit from quarterly visits."},{q:"Do you see children?",a:"Yes, we treat patients of all ages starting at age 3."},{q:"What if I have a dental emergency?",a:"Call us immediately. We reserve slots daily for emergencies and same-day treatment."}],
    };
  }
  // PHOTOGRAPHER / CREATIVE
  if (c.includes("photo") || c.includes("studio") || c.includes("florist") || c.includes("event") || c.includes("wedding")) {
    return {
      ctaShort: "Inquire", ctaMain: "Inquire About Your Date", ctaPhone: "Let's Talk",
      trustItems: ["Award Winning", "Full Day Coverage", "Edited in 2 Weeks", "Contracts Protect You"],
      showPricing: true, showTeam: false, showGallery: true,
      processSteps: [{n:"Connect",d:"Tell us about your vision"},{n:"Plan",d:"Timeline and shot list"},{n:"Shoot",d:"Full coverage, all day"},{n:"Deliver",d:"Edited photos in 2 weeks"}],
      testimonials: [{t:"The photos came out better than we imagined. Every important moment was captured.",a:"Jessica & Tom",l:"Wedding Client"},{t:"Professional, creative, and so easy to work with. The images speak for themselves.",a:"Alex R.",l:"Brand Shoot"},{t:"Booked them for our company event and the photos were incredible. Highly recommend.",a:"Nicole B.",l:"Corporate Client"}],
      faqs: [{q:"How far in advance should I book?",a:"Weddings book 6-12 months out. For other events, 2-4 weeks notice is usually fine."},{q:"How long until I get my photos?",a:"Standard turnaround is 2 weeks. Rush delivery is available for an additional fee."},{q:"Do you travel?",a:"Yes, we're available for travel nationwide. Travel fees apply outside the metro area."},{q:"What's included in the package?",a:"All packages include edited digital images, an online gallery, and full printing rights."},{q:"Can we request specific shots?",a:"Absolutely. We create a custom shot list for every event based on your priorities."}],
    };
  }
  // BARBER
  if (c.includes("barber")) {
    return {
      ctaShort: "Walk In", ctaMain: "Walk In or Book Ahead", ctaPhone: "Call Ahead",
      trustItems: ["Master Barbers", "Hot Towel Shaves", "No Wait App", "Kids Welcome"],
      showPricing: true, showTeam: true, showGallery: true,
      processSteps: [{n:"Walk In",d:"Or book ahead"},{n:"Consult",d:"Discuss the cut"},{n:"Cut",d:"Precision work"},{n:"Detail",d:"Line-up & finish"}],
      testimonials: [{t:"Best fade I've had in years. These guys know what they're doing.",a:"Jamal T.",l:"Regular"},{t:"The atmosphere is unmatched. Feels like the barbershop I grew up with.",a:"Anthony R.",l:"Monthly Client"},{t:"My son loves coming here. Patient with kids and always a clean cut.",a:"Monica G.",l:"Parent"}],
      faqs: [{q:"Do I need an appointment?",a:"Walk-ins are always welcome, but we recommend booking for weekends."},{q:"How long does a cut take?",a:"A standard cut takes about 30 minutes. A cut with beard work takes about 45."},{q:"Do you do kids?",a:"Absolutely. We cut all ages and have plenty of experience with first haircuts."},{q:"Can I request a specific barber?",a:"Yes. When booking online or by phone, just let us know your preferred barber."},{q:"Do you do beard trims only?",a:"Yes, beard trims and line-ups are available as standalone services."}],
    };
  }
  // DEFAULT
  return {
    ctaShort: "Contact", ctaMain: "Get in Touch", ctaPhone: "Call Now",
    trustItems: ["Licensed & Insured", "Top Rated", "Fair Pricing", "Satisfaction Guaranteed"],
    showPricing: false, showTeam: false, showGallery: false,
    processSteps: [{n:"Call",d:"Tell us what you need"},{n:"Quote",d:"Clear, fair pricing"},{n:"Work",d:"Done right, on time"},{n:"Done",d:"Satisfaction guaranteed"}],
    testimonials: [{t:"Professional from start to finish. Highly recommend.",a:"James R.",l:"Verified Customer"},{t:"Fair pricing and excellent work. Will use again.",a:"Lisa M.",l:"Verified Customer"},{t:"Showed up on time and delivered exactly what they promised.",a:"Carlos S.",l:"Verified Customer"}],
    faqs: [{q:"How do I get started?",a:"Just give us a call or send us a message. We'll schedule a time that works for you."},{q:"Do you offer free estimates?",a:"Yes, estimates are always free with no obligation."},{q:"What areas do you serve?",a:"We serve the entire metro area and surrounding neighborhoods."},{q:"Are you licensed and insured?",a:"Yes, fully licensed and insured for your protection."},{q:"What payment methods do you accept?",a:"We accept cash, check, and all major credit cards."}],
  };
}

// ──── SVG ────
const SVG={phone:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.95.37 1.89.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.92.33 1.86.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,map:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,clock:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,star:`<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,arrow:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,check:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,shield:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,zap:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,smile:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,wrench:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,scissors:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>`,coffee:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,heart:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,camera:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,award:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,droplet:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,users:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,leaf:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>`,calendar:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,sun:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,moon:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,};

function ico(cat:string,i:number):string{const c=cat.toLowerCase();const p=(a:string[])=>SVG[a[i%a.length]as keyof typeof SVG]||SVG.star;if(c.includes("salon")||c.includes("barber"))return p(["scissors","heart","star","smile","droplet","zap"]);if(c.includes("cafe")||c.includes("coffee")||c.includes("bakery"))return p(["coffee","heart","clock","star","zap","droplet"]);if(c.includes("gym")||c.includes("fitness"))return p(["zap","heart","shield","star","clock","award"]);if(c.includes("plumber")||c.includes("contractor")||c.includes("hvac"))return p(["wrench","droplet","shield","clock","zap","star"]);if(c.includes("dentist"))return p(["smile","shield","heart","star","clock","award"]);if(c.includes("photo")||c.includes("studio"))return p(["camera","star","heart","zap","award"]);if(c.includes("lawyer")||c.includes("attorney")||c.includes("legal"))return p(["shield","award","star","clock","users"]);if(c.includes("restaurant"))return p(["heart","star","clock","coffee","award","users"]);if(c.includes("spa"))return p(["heart","droplet","star","smile","shield","zap"]);if(c.includes("salon"))return p(["scissors","heart","star","droplet","zap"]);return p(["star","shield","heart","award","clock","zap"]);}

// ──── CSS + HTML HELPERS ────
function wrap(title:string,desc:string,css:string,body:string){return`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${title}</title><meta name="description" content="${desc.slice(0,155)}"><link rel="preconnect" href="https://images.unsplash.com"><style>${css}</style></head><body>${body}\n<script>const io=new IntersectionObserver(e=>{e.forEach(n=>{if(n.isIntersecting){n.target.style.animationPlayState="running";io.unobserve(n.target)}})},{threshold:0.1});document.querySelectorAll(".reveal").forEach(el=>io.observe(el));</script></body></html>`;}
function rd(b:{name:string;category:string;city:string}){return`# ${b.name} Website\nProfessional website for ${b.name}, a ${b.category} in ${b.city}.\n\n## Files\n- **index.html** — Main page\n- **css/style.css** — All styles\n\n## Quick Changes\n- Edit text, images, and contact info in index.html\n- Edit colors and fonts in css/style.css\n\n## Hosting\nDrag folder to [Netlify Drop](https://app.netlify.com/drop) or upload via FTP.\n`;}
function ft(b:any){return`<footer class="site-footer"><div class="container">&copy; ${new Date().getFullYear()} ${b.name} &middot; ${b.city}</div></footer>`;}
function genStats(){const r=Math.floor(80+Math.random()*250),rt=(4+Math.random()).toFixed(1),y=Math.floor(4+Math.random()*15);return{revs:r,rtg:rt,yrs:y};}

// ═══════════════════════════════════════════════════════════════
// CATEGORY-SPECIFIC SECTION BUILDERS
// These generate different CONTENT based on the business category
// ═══════════════════════════════════════════════════════════════

// Emergency banner (plumber, dentist)
function emergencyBanner(text: string, phone: string, P: Record<string,string>) {
  if (!text) return "";
  return `<section class="emergency-banner" style="background:${P[600]};color:#fff;text-align:center;padding:0.875rem 1rem;font-weight:600;font-size:0.9375rem"><div class="container">${text}${phone ? ` — <a href="tel:${phone}" style="text-decoration:underline">${phone}</a>` : ""}</div></section>`;
}

// Trust bar with category-specific items
function trustBar(items: string[], _cat: string, _N: Record<string,string>) {
  const icons = [SVG.shield, SVG.award, SVG.clock, SVG.users, SVG.star, SVG.check, SVG.leaf, SVG.calendar];
  return `<section class="trust-bar"><div class="container">${items.map((t, i) => `<div class="trust-item reveal reveal-d${i}"><span class="trust-icon">${icons[i % icons.length]}</span><span>${t}</span></div>`).join("")}</div></section>`;
}

// Service cards with category-specific pricing
function serviceCards(services: string[], cat: string, catInfo: CatData, _P: Record<string,string>, _N: Record<string,string>) {
  if (!catInfo.showPricing) {
    // No pricing — simple service list
    const cards = services.map((s, i) => `<div class="svc-card reveal reveal-d${Math.min(i+1,4)}"><div class="svc-ico">${ico(cat, i)}</div><h4>${s}</h4><p>Professional ${cat.toLowerCase()} service.</p></div>`).join("");
    return `<section class="svc-section"><div class="container"><h2 class="reveal">What We Do</h2><div class="svc-grid">${cards}</div></div></section>`;
  }
  // With pricing
  const basePrice = cat.toLowerCase().includes("gym") ? 29 : cat.toLowerCase().includes("lawyer") ? 199 : cat.toLowerCase().includes("photo") ? 299 : 49;
  const cards = services.map((s, i) => {
    const price = basePrice + i * (cat.toLowerCase().includes("gym") ? 20 : cat.toLowerCase().includes("lawyer") ? 150 : 25);
    return `<div class="svc-card reveal reveal-d${Math.min(i+1,4)}"><div class="svc-ico">${ico(cat, i)}</div><h4>${s}</h4><p class="svc-price">From $${price}</p><a href="#contact" class="svc-link">${catInfo.ctaShort} ${SVG.arrow}</a></div>`;
  }).join("");
  return `<section class="svc-section"><div class="container"><h2 class="reveal">Services & Pricing</h2><div class="svc-grid">${cards}</div></div></section>`;
}

// Process steps with category-specific steps
function processSection(steps: {n: string; d: string}[], _arch: Arch, _N: Record<string,string>) {
  const procItems = steps.map((s, i) => `<div class="proc reveal reveal-d${Math.min(i+1,4)}"><div class="proc-n">${i + 1}</div><h4>${s.n}</h4><p>${s.d}</p></div>`).join("");
  return `<section class="process-section"><div class="container"><h2 class="reveal">How It Works</h2><div class="process-grid">${procItems}</div></div></section>`;
}

// Testimonials with category-specific quotes
function testimonialsSection(catInfo: CatData, b: any, P: Record<string,string>, _N: Record<string,string>) {
  const cards = catInfo.testimonials.map((t, i) => `<div class="tess-card reveal reveal-d${Math.min(i+1,4)}"><div class="tess-stars">${SVG.star.repeat(5)}</div><p class="tess-text">"${t.t}"</p><div class="tess-auth"><div class="tess-av" style="background:${P[600]}">${t.a.split(" ").map((w: string) => w[0]).join("")}</div><div><div class="tess-name">${t.a}</div><div class="tess-role">${t.l}</div></div></div></div>`).join("");
  return `<section class="tess-section"><div class="container"><h2 class="reveal">What ${b.city} Clients Say</h2><div class="tess-grid">${cards}</div></div></section>`;
}

// FAQ with category-specific questions
function _faqSection(catInfo: CatData) {
  const items = catInfo.faqs.map((f, i) => `<div class="faq-item reveal reveal-d${Math.min(i+1,4)}"><input type="checkbox" id="faq${i}"><label for="faq${i}"><span>${f.q}</span><span class="faq-toggle">+</span></label><div class="faq-ans">${f.a}</div></div>`).join("");
  return `<section class="faq-section"><div class="container"><h2 class="reveal">Common Questions</h2>${items}</div></section>`;
}

// Gallery grid
function gallerySection(b: any, arch: Arch, _N: Record<string,string>) {
  const i1 = us(b.category, "h1"), i2 = us(b.category, "h2"), i3 = us(b.category, "h3"), iA = us(b.category, "a1");
  return `<section class="gallery-section"><div class="container"><h2 class="reveal">${arch === "photoFirst" ? "Portfolio" : "Our Work"}</h2><div class="gallery-grid"><img src="${iA}" alt="Work 1" class="reveal"><img src="${i2}" alt="Work 2" class="reveal-d1"><img src="${i3}" alt="Work 3" class="reveal-d2"><img src="${i1}" alt="Work 4" class="reveal-d3"></div></div></section>`;
}

// Team section
function teamSection(b: any, catInfo: CatData, _N: Record<string,string>) {
  if (!catInfo.showTeam) return "";
  const names = ["Sarah Johnson", "Michael Chen", "Emily Rodriguez"];
  const roles = b.category.toLowerCase().includes("barber") ? ["Master Barber", "Senior Barber", "Stylist"] : b.category.toLowerCase().includes("gym") ? ["Head Trainer", "Strength Coach", "Yoga Instructor"] : b.category.toLowerCase().includes("cafe") || b.category.toLowerCase().includes("restaurant") ? ["Head Chef", "Sous Chef", "Manager"] : ["Lead Stylist", "Senior Specialist", "Consultant"];
  const team = [0, 1, 2].map((i) => `<div class="team-card reveal reveal-d${i+1}"><img src="${us(b.category, `team${i+1}` as keyof typeof US['default'])}" alt="${names[i]}"><h4>${names[i]}</h4><p style="color:var(--b600);font-size:0.875rem">${roles[i]}</p></div>`).join("");
  return `<section class="team-section"><div class="container"><h2 class="reveal">Meet the Team</h2><p class="reveal-d1" style="color:var(--txt2);margin-bottom:2rem">The people behind ${b.name}.</p><div class="team-grid">${team}</div></div></section>`;
}


// ═══════════════════════════════════════════════════════════════
// SHARED CSS (included by every builder)
// ═══════════════════════════════════════════════════════════════
function sharedCSS(arch: Arch, P: Record<string,string>, N: Record<string,string>) {
  const _cfg = CFG[arch];
  const isDark = arch === "brutalist" || arch === "boldMinimal";
  const bg = isDark ? "#0a0a0a" : "var(--bg)";
  const txt = isDark ? "#e5e5e5" : "var(--txt)";
  const txt2 = isDark ? "#888" : "var(--txt2)";
  const surface = isDark ? "#111" : "var(--bg2)";
  const border = isDark ? "#222" : "var(--bdr)";
  const btnStyle = arch === "retro" ? "background:var(--b600);color:#fff;font-family:var(--fH);border:2px solid var(--n900);box-shadow:4px 4px 0 var(--n900)" :
                   arch === "boldMinimal" ? "background:var(--b500);color:#fff;font-family:var(--fH);font-weight:700;letter-spacing:0.02em" :
                   "background:var(--b500);color:#fff";
  return `@import url('${GF[arch]}');
:root{--b50:${P[50]};--b100:${P[100]};--b200:${P[200]};--b300:${P[300]};--b400:${P[400]};--b500:${P[500]};--b600:${P[600]};--b700:${P[700]};--b800:${P[800]};--bg:${N[0]};--bg2:${N[50]};--txt:${N[800]};--txt2:${N[500]};--bdr:${N[200]};--n900:${N[900]};--n800:${N[800]};--n700:${N[700]};--n600:${N[600]};--n500:${N[500]};--n400:${N[400]};--n300:${N[300]};--n200:${N[200]};--n100:${N[100]};--fH:${_cfg.fH};--fB:${_cfg.fB};--r:${_cfg.r}}
*{font-family:var(--fB)}.fH{font-family:var(--fH)}
body{background:${bg};color:${txt};line-height:1.65}
.container{max-width:1160px;margin:0 auto;padding:0 clamp(1.25rem,5vw,2.5rem)}
/* NAV */
.nav{display:flex;justify-content:space-between;align-items:center;padding:1.25rem 0;border-bottom:1px solid ${border}}
.logo{font-family:var(--fH);font-size:1.25rem;font-weight:${arch==="boldMinimal"?"700":arch==="editorial"?"600":"500"};color:${isDark?"#fff":"var(--n900)"};${arch==="softLuxury"?"font-style:italic;":""}${arch==="retro"?"font-family:var(--fH);":""}}
.tag{font-size:0.75rem;color:${txt2};${arch==="brutalist"||arch==="boldMinimal"?"text-transform:uppercase;letter-spacing:0.15em;":""}}
/* HERO */
.hero-dark{padding:6rem 0 4rem;text-align:center}
.hero-dark h1{font-family:var(--fH);font-size:${arch==="boldMinimal"?"clamp(3.5rem,10vw,7rem)":"clamp(2.5rem,6vw,4.5rem)"};line-height:${arch==="boldMinimal"?"0.95":"1.1"};font-weight:${arch==="boldMinimal"?"700":"600"};color:${isDark?"#fff":"var(--n900)"};${arch==="boldMinimal"?"letter-spacing:-0.04em;":arch==="brutalist"?"text-transform:uppercase;letter-spacing:-0.02em;":""}}
.hero-dark p{color:${txt2};margin-top:1.5rem;max-width:520px;margin-left:auto;margin-right:auto;font-size:1.125rem;line-height:1.7}
.hero-actions{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-top:2rem}
.hero-badge{display:inline-flex;align-items:center;gap:1rem;background:${isDark?"var(--n800)":"#fff"};color:${isDark?"#fff":"var(--n900)"};padding:0.6rem 1.2rem;border-radius:100px;margin-top:1.5rem;border:1px solid ${border}}
.hero-badge-stars{color:var(--b500);font-weight:600;font-size:0.875rem}
.hero-badge-avatars{display:flex}
/* HERO SPLIT */
.hero-split{display:grid;grid-template-columns:50% 50%;min-height:85vh;align-items:center}
.hero-split .hero-txt{padding:4rem 3rem 4rem 0}
.hero-split .hero-pic{height:100%}
.hero-split .hero-pic img{width:100%;height:100%;object-fit:cover}
/* HERO IMAGE */
.hero-img{position:relative;height:${arch==="photoFirst"?"100vh":"80vh"};display:flex;align-items:flex-end;overflow:hidden}
.hero-img>img:first-child{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero-ov{position:absolute;inset:0;background:linear-gradient(to top,${isDark?"#0a0a0a":N[900]}e0 0%,transparent 60%)}
.hero-img .hero-txt{position:relative;z-index:2;padding:3rem 2rem;max-width:700px}
.hero-img .hero-txt h1{font-family:var(--fH);font-size:clamp(2.5rem,5vw,4rem);color:#fff;line-height:1.1;font-weight:${arch==="boldMinimal"?"700":"500"}}
.hero-img .hero-txt p{color:${isDark?"var(--n300)":N[300]};font-size:1.125rem;margin-top:1rem}
/* CENTER HERO */
.hero-center{position:relative;height:85vh;display:flex;align-items:center;justify-content:center;text-align:center;overflow:hidden}
.hero-center .hero-bg{position:absolute;inset:0;z-index:0}.hero-center .hero-bg img{width:100%;height:100%;object-fit:cover}
.hero-center .hero-ov{position:absolute;inset:0;background:linear-gradient(135deg,${N[900]}d0 0%,${P[800]}90 100%)}
.hero-center .hero-txt{position:relative;z-index:2;max-width:600px;padding:2rem}
/* BTN */
.btn{display:inline-flex;align-items:center;gap:0.5rem;padding:1rem 2.25rem;${btnStyle};border-radius:var(--r);font-weight:${arch==="boldMinimal"?"700":"600"};margin-top:1.5rem;transition:all .2s;cursor:pointer;font-size:0.9375rem}
.btn:hover{${arch==="retro"?"transform:translate(2px,2px);box-shadow:2px 2px 0 var(--n900)":arch==="boldMinimal"?"background:var(--b400);transform:translateY(-2px)":"transform:translateY(-2px);box-shadow:0 12px 32px var(--b600)40"}}
/* EMERGENCY */
.emergency-banner{background:var(--b600);color:#fff;text-align:center;padding:0.875rem 1rem;font-weight:600;font-size:0.9375rem}
.emergency-banner a{color:#fff;text-decoration:underline}
/* TRUST */
.trust-bar{background:${surface};padding:1.5rem 0;border-bottom:1px solid ${border}}
.trust-bar .container{display:flex;justify-content:space-around;flex-wrap:wrap;gap:1.5rem}
.trust-item{display:flex;align-items:center;gap:0.5rem;font-size:0.8125rem;color:${txt2};${arch==="brutalist"||arch==="boldMinimal"||arch==="retro"?"text-transform:uppercase;letter-spacing:0.05em;font-family:var(--fH);":""}}
.trust-icon{color:var(--b600)}
/* SERVICES */
.svc-section{padding:var(--sxxl) 0}
.svc-section h2{font-family:var(--fH);font-size:clamp(1.75rem,3.5vw,2.5rem);color:${isDark?"#fff":"var(--n900)"};margin-bottom:2.5rem;text-align:${arch==="editorial"?"left":"center"}}
.svc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem}
.svc-card{background:${surface};border:1px solid ${border};border-radius:var(--r);padding:2rem;text-align:center;transition:all .25s}
.svc-card:hover{transform:translateY(-4px);box-shadow:0 16px 48px ${N[900]}0d;border-color:var(--b300)}
.svc-ico{width:56px;height:56px;border-radius:var(--r);background:var(--b50);color:var(--b600);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem}
.svc-price{font-family:var(--fH);font-size:1.25rem;color:var(--b600);font-weight:600;margin-top:0.5rem}
.svc-link{display:inline-flex;align-items:center;gap:0.5rem;color:var(--b600);font-weight:500;font-size:0.875rem;margin-top:0.75rem}
/* SECTIONS */
.section{padding:var(--sxxl) 0}
.section h2{font-family:var(--fH);font-size:clamp(1.75rem,3.5vw,2.5rem);color:${isDark?"#fff":"var(--n900)"};margin-bottom:2rem}
.about-grid{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center}
.about-grid img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:var(--r);${arch==="brutalist"?"filter:grayscale(35%)":""}}
.about-grid p{color:${txt2};line-height:1.9;font-size:1.0625rem}
.quote{margin-top:2rem;padding:1.5rem;border-left:3px solid var(--b500);color:${isDark?"#ccc":"var(--n700)"};font-style:italic}
/* PROCESS */
.process-section{padding:var(--sxxl) 0;background:${surface}}
.process-section h2{text-align:center}
.process-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2rem;text-align:center}
.proc{position:relative}.proc:not(:last-child)::after{content:"";position:absolute;top:24px;right:-50%;width:100%;height:1px;background:${border}}
.proc-n{width:48px;height:48px;border-radius:50%;background:var(--b600);color:#fff;font-family:var(--fH);font-weight:600;display:flex;align-items:center;justify-content:center;margin:0 auto 0.75rem;position:relative;z-index:1}
.proc h4{color:${isDark?"#fff":"var(--n800)"};font-size:1rem}.proc p{color:${txt2};font-size:0.875rem}
/* TESTIMONIALS */
.tess-section{padding:var(--sxxl) 0;background:${arch==="editorial"?bg:surface}}
.tess-section h2{text-align:center}
.tess-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem}
.tess-card{background:${isDark?"#1a1a1a":bg};padding:1.75rem;border-radius:var(--r);border:1px solid ${border}}
.tess-stars{color:var(--b400);margin-bottom:1rem;font-size:0.875rem;letter-spacing:0.15em}
.tess-text{line-height:1.8;color:${txt2};font-style:italic;margin-bottom:1.25rem}
.tess-auth{display:flex;align-items:center;gap:0.75rem}
.tess-av{width:36px;height:36px;border-radius:50%;background:var(--b600);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:0.8125rem}
.tess-name{font-weight:600;color:${isDark?"#ddd":"var(--n800)"};font-size:0.9375rem}.tess-role{font-size:0.75rem;color:${txt2}}
/* GALLERY */
.gallery-section{padding:var(--sxxl) 0}
.gallery-section h2{text-align:center}
.gallery-grid{display:grid;grid-template-columns:${arch==="photoFirst"?"2fr 1fr 1fr":"repeat(4,1fr)"};gap:0.75rem}
.gallery-grid img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:var(--r)}
.gallery-grid img:first-child{${arch==="photoFirst"?"grid-row:span 2;aspect-ratio:auto":""}}
/* TEAM */
.team-section{padding:var(--sxxl) 0}
.team-section h2{text-align:center}
.team-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem}
.team-card{text-align:center}.team-card img{width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:var(--r);margin-bottom:1rem}
.team-card h4{font-family:var(--fH);font-size:1.125rem;color:${isDark?"#fff":"var(--n800)"}}
/* AREAS */
.areas-section{padding:var(--sxxl) 0;background:${surface}}
.areas-section h2{text-align:center}
.areas-grid{display:flex;flex-wrap:wrap;gap:0.75rem;justify-content:center}
.area-tag{display:inline-flex;align-items:center;gap:0.5rem;padding:0.75rem 1.25rem;background:${isDark?"#1a1a1a":bg};border:1px solid ${border};border-radius:var(--r);font-size:0.875rem;color:${isDark?"#ccc":"var(--n700)"}}
/* FAQ */
.faq-section{padding:var(--sxxl) 0;background:${surface}}
.faq-section h2{text-align:center;margin-bottom:2rem}
.faq-item{border-bottom:1px solid ${border}}
.faq-item input{display:none}
.faq-item label{display:flex;justify-content:space-between;align-items:center;padding:1.25rem 0;cursor:pointer;font-weight:500;color:${isDark?"#fff":"var(--n800)"};font-family:var(--fH)}
.faq-toggle{font-size:1.25rem;color:var(--b600)}
.faq-ans{max-height:0;overflow:hidden;transition:max-height .3s;color:${txt2};line-height:1.7;font-size:0.9375rem}
.faq-item input:checked ~ .faq-ans{max-height:200px;padding-bottom:1.25rem}
/* CTA */
.cta-section{text-align:center;padding:var(--sxl) 0;margin:2rem;border-radius:var(--r);color:#fff}
.cta-section h3{font-family:var(--fH);font-size:clamp(1.5rem,3vw,2.25rem);margin-bottom:0.75rem}
.cta-section p{color:${N[300]};margin-bottom:1.5rem}
/* CONTACT */
.contact-section{text-align:center;padding:var(--sxxl) 0}
.contact-section h2{font-family:var(--fH);font-size:clamp(2rem,4vw,3rem);color:${isDark?"#fff":"var(--n900)"};margin-bottom:1rem}
.contact-section>p{color:${txt2};margin-bottom:2rem;max-width:500px;margin-left:auto;margin-right:auto}
.c-grid{display:flex;justify-content:center;gap:3rem;margin-bottom:2rem;flex-wrap:wrap}
.c-item{display:flex;align-items:center;gap:0.75rem;color:${txt2};font-size:1rem}
/* FOOTER */
.site-footer{padding:2rem 0;text-align:center;font-size:0.8125rem;color:${txt2};border-top:1px solid ${border}}
@media(max-width:768px){
  .hero-split{grid-template-columns:1fr}.hero-split .hero-pic{height:50vh}.hero-split .hero-txt{padding:2rem}
  .about-grid{grid-template-columns:1fr}.process-grid{grid-template-columns:repeat(2,1fr)}
  .tess-grid{grid-template-columns:1fr}.team-grid{grid-template-columns:repeat(2,1fr)}
  .gallery-grid{grid-template-columns:1fr 1fr}.gallery-grid img:first-child{grid-row:span 1}
  ${arch==="boldMinimal"?".hero-dark h1{font-size:2.75rem}":""}
}`;
}

// Hero builder — dispatches to correct style
function buildHero(b: any, C: any, catInfo: CatData, P: Record<string,string>, N: Record<string,string>, arch: Arch) {
  const i1 = us(b.category, "h1");
  const rtg = (4 + Math.random()).toFixed(1);
  const badge = `<div class="hero-badge"><span class="hero-badge-stars">${SVG.star.repeat(5)} ${rtg}</span><span style="font-size:0.8125rem">500+ happy clients</span></div>`;
  const actions = `<div class="hero-actions"><a href="#contact" class="btn">${catInfo.ctaMain}</a>${b.phone ? `<a href="tel:${b.phone}" class="btn" style="background:transparent;border:1px solid ${arch==="brutalist"||arch==="boldMinimal"?"#444":"var(--bdr)"};color:${arch==="brutalist"||arch==="boldMinimal"?"#fff":"var(--n900)"}">${SVG.phone} ${catInfo.ctaPhone}</a>` : ""}</div>`;
  
  if (arch === "brutalist" || arch === "boldMinimal" || arch === "modernTech") {
    return `<section class="hero-dark" style="${arch==="modernTech"?"background:linear-gradient(135deg,var(--n900) 0%,var(--b800) 100%)":""}"><div class="container"><h1 class="reveal">${C.headline}</h1><p class="reveal-d1">${C.subheadline}</p>${actions}${badge}</div></section>`;
  }
  if (arch === "softLuxury") {
    return `<section class="hero-split"><div class="hero-txt"><h1 class="reveal">${C.headline}</h1><p class="reveal-d1">${C.subheadline}</p>${actions}${badge}</div><div class="hero-pic"><img src="${i1}" alt="${b.name}"></div></section>`;
  }
  if (arch === "editorial") {
    return `<section class="hero-img" style="height:80vh"><img src="${i1}" alt="${b.name}"><div class="hero-ov"></div><div class="hero-txt"><h1 class="reveal">${C.headline}</h1><p class="reveal-d1">${C.subheadline}</p>${badge}</div></section>`;
  }
  if (arch === "photoFirst") {
    return `<section class="hero-img" style="height:100vh"><img src="${i1}" alt="${b.name}"><div class="hero-ov"></div><div class="hero-txt"><h1 class="reveal">${C.headline}</h1><p class="reveal-d1">${C.subheadline}</p><a href="#contact" class="btn reveal-d2">${catInfo.ctaMain}</a>${badge}</div></section>`;
  }
  // warmLocal, retro default — centered hero
  return `<section class="hero-center"><div class="hero-bg"><img src="${i1}" alt="${b.name}"><div class="hero-ov" style="background:linear-gradient(135deg,${N[900]}d0 0%,${P[800]}90 100%)"></div></div><div class="hero-txt"><h1 class="reveal">${C.headline}</h1><p class="reveal-d1">${C.subheadline}</p><a href="#contact" class="btn reveal-d2">${catInfo.ctaMain}</a>${badge}</div></section>`;
}


// ═══════════════════════════════════════════════════════════════
// MAIN BUILDER — Composes sections per archetype + per category
// ═══════════════════════════════════════════════════════════════

function buildSite(b: any, C: any, arch: Arch, P: Record<string,string>, N: Record<string,string>) {
  const ci = catData(b.category);
  const css = sharedCSS(arch, P, N);
  const nav = `<nav class="nav container"><div class="logo">${b.name}</div><div class="tag">${b.category} &middot; ${b.city}</div></nav>`;
  
  // Each archetype composes DIFFERENT sections
  let sections: string[] = [];
  
  switch (arch) {
    case "brutalist":
      // BRUTALIST: Dark, raw, no-nonsense — perfect for contractors, plumbers
      // Nav → Emergency → Hero → Trust → Services → Process → Testimonials → Contact → Footer
      sections = [
        nav,
        emergencyBanner(ci.emergencyText || "", b.phone || "", P),
        buildHero(b, C, ci, P, N, arch),
        trustBar(ci.trustItems, b.category, N),
        serviceCards(C.services, b.category, ci, P, N),
        processSection(ci.processSteps, arch, N),
        testimonialsSection(ci, b, P, N),
        `<section id="contact" class="contact-section"><div class="container"><h2 class="reveal">Ready to Get Started?</h2><p class="reveal-d1">${b.phone ? `Call ${b.phone} or` : ""} reach out below.</p><div class="c-grid reveal-d2">${b.phone ? `<div class="c-item">${SVG.phone} <a href="tel:${b.phone}">${b.phone}</a></div>` : ""}<div class="c-item">${SVG.map} ${b.address || b.city}</div><div class="c-item">${SVG.clock} Mon-Sat 9am-6pm</div></div><a href="${b.phone ? "tel:"+b.phone : "#contact"}" class="btn reveal-d3">${ci.ctaMain}</a></div></section>`,
        ft(b),
      ];
      break;
      
    case "softLuxury":
      // SOFT LUXURY: Elegant, gallery, team — perfect for salons, spas
      // Nav → Hero → About+Polaroids → Services → Team → Testimonials → Contact → Footer
      sections = [
        nav,
        buildHero(b, C, ci, P, N, arch),
        `<section class="section"><div class="container"><div class="about-grid"><div class="reveal"><img src="${us(b.category,"h2")}" alt="About"></div><div class="reveal-d1"><h2>About ${b.name}</h2><p>${C.story}</p>${C.values ? `<div class="quote">${C.values}</div>` : ""}</div></div></div></section>`,
        serviceCards(C.services, b.category, ci, P, N),
        teamSection(b, ci, N),
        testimonialsSection(ci, b, P, N),
        `<section id="contact" class="contact-section" style="background:var(--b700);color:#fff;border-radius:var(--r);margin:2rem"><div class="container"><h2 class="reveal">${C.contactCta}</h2><p class="reveal-d1">We'd love to see you.</p><div class="c-grid reveal-d2">${b.phone ? `<div class="c-item">${SVG.phone} ${b.phone}</div>` : ""}<div class="c-item">${SVG.map} ${b.address || b.city}</div><div class="c-item">${SVG.clock} Mon-Sat 9am-7pm</div></div><a href="${b.phone ? "tel:"+b.phone : "#"}" class="btn reveal-d3" style="background:#fff;color:var(--b700)">${ci.ctaMain}</a></div></section>`,
        ft(b),
      ];
      break;
      
    case "editorial":
      // EDITORIAL: Magazine-style, FAQ-heavy — perfect for lawyers, accountants
      // Nav → Masthead → Hero → Story → Quote → Services → FAQ → Testimonials → Contact → Footer
      sections = [
        nav,
        `<div class="container" style="display:flex;justify-content:space-between;padding:0.75rem 0;font-size:0.6875rem;text-transform:uppercase;letter-spacing:0.15em;color:var(--txt2);border-bottom:1px solid var(--bdr)"><span>${b.category} &middot; ${b.city}</span><span>${new Date().getFullYear()}</span></div>`,
        buildHero(b, C, ci, P, N, arch),
        `<section class="section"><div class="container"><h2 class="reveal">The Story</h2><div style="font-size:1.0625rem;line-height:1.9;color:var(--txt2);column-count:3;column-gap:2.5rem" class="reveal-d1"><p>${C.story}</p>${C.values ? `<p>${C.values}</p>` : ""}</div></div></section>`,
        `<section class="container"><div style="margin:var(--sxl) 0;padding:var(--sxl);border:3px solid var(--n900);text-align:center" class="reveal"><p style="font-family:var(--fH);font-size:clamp(1.25rem,2.5vw,1.75rem);font-style:italic;color:var(--n800);line-height:1.5">"${C.contactCta}"</p><cite style="display:block;margin-top:1rem;font-size:0.875rem;color:var(--txt2);font-style:normal;text-transform:uppercase;letter-spacing:0.1em">&mdash; ${b.name}, ${b.city}</cite></div></section>`,
        serviceCards(C.services, b.category, ci, P, N),
        _faqSection(ci),
        testimonialsSection(ci, b, P, N),
        `<section id="contact" class="contact-section"><div class="container"><h2 class="reveal">Get In Touch</h2><p class="reveal-d1" style="color:var(--txt2);margin-bottom:2rem">Schedule your free consultation today.</p><div class="c-grid reveal-d2">${b.phone ? `<div class="c-item">${SVG.phone} <a href="tel:${b.phone}">${b.phone}</a></div>` : ""}<div class="c-item">${SVG.map} ${b.address || b.city}</div><div class="c-item">${SVG.clock} Mon-Fri 8am-6pm</div></div><a href="${b.phone ? "tel:"+b.phone : "#"}" class="btn reveal-d3">${ci.ctaMain}</a></div></section>`,
        `<footer class="site-footer" style="display:flex;justify-content:space-between;align-items:center"><div class="container" style="display:flex;justify-content:space-between;width:100%"><div>${b.name}</div><div>${b.city}</div></div></footer>`,
      ];
      break;
      
    case "modernTech":
      // MODERN TECH: Features, team, FAQ — perfect for agencies, tech
      // Nav → Hero → Trust → Services → About → Team → FAQ → CTA → Contact → Footer
      sections = [
        nav,
        buildHero(b, C, ci, P, N, arch),
        trustBar(ci.trustItems, b.category, N),
        serviceCards(C.services, b.category, ci, P, N),
        `<section class="section"><div class="container"><div class="about-grid"><div class="reveal"><img src="${us(b.category,"h1")}" alt="${b.name}"></div><div class="reveal-d1"><h2>About ${b.name}</h2><p>${C.story}</p>${C.values ? `<p style="margin-top:1rem;color:var(--b600);font-weight:500">${C.values}</p>` : ""}</div></div></div></section>`,
        teamSection(b, ci, N),
        _faqSection(ci),
        `<section class="cta-section" style="background:linear-gradient(135deg,var(--n900) 0%,var(--b800) 100%)"><div class="container reveal"><h3>${C.contactCta}</h3><p style="color:var(--n300);margin-bottom:1.5rem">Ready to get started? Reach out today.</p><a href="#contact" class="btn" style="background:var(--b500)">${ci.ctaMain}</a></div></section>`,
        `<section id="contact" class="contact-section" style="background:var(--b50)"><div class="container"><h2 class="reveal">${ci.ctaMain}</h2><p class="reveal-d1" style="color:var(--txt2);margin-bottom:2rem">We're here to help.</p><div class="c-grid reveal-d2">${b.phone ? `<div class="c-item">${SVG.phone} ${b.phone}</div>` : ""}<div class="c-item">${SVG.map} ${b.address || b.city}</div><div class="c-item">${SVG.clock} Mon-Sat 9am-6pm</div></div><a href="${b.phone ? "tel:"+b.phone : "#"}" class="btn reveal-d3">${b.phone || "Contact Us"}</a></div></section>`,
        ft(b),
      ];
      break;
      
    case "warmLocal":
      // WARM LOCAL: Photo-heavy, masonry, community — perfect for cafes, restaurants
      // Nav → Hero → About+Gallery → Services → Team → Testimonials → Contact → Footer
      sections = [
        nav,
        buildHero(b, C, ci, P, N, arch),
        `<section class="section"><div class="container"><div style="text-align:center;max-width:680px;margin:0 auto" class="about reveal"><h2>About ${b.name}</h2><p>${C.story}</p>${C.values ? `<p style="margin-top:1rem;font-style:italic;color:var(--b600)">${C.values}</p>` : ""}</div><div style="display:grid;grid-template-columns:1.2fr 0.8fr 1fr;gap:0.75rem;margin-top:3rem"><img src="${us(b.category,"a1")}" alt="1" class="reveal" style="width:100%;border-radius:var(--r);aspect-ratio:4/3;object-fit:cover"><img src="${us(b.category,"h2")}" alt="2" class="reveal-d1" style="width:100%;border-radius:var(--r);aspect-ratio:3/4;object-fit:cover;margin-top:2rem"><img src="${us(b.category,"h3")}" alt="3" class="reveal-d2" style="width:100%;border-radius:var(--r);aspect-ratio:1;object-fit:cover"></div></div></section>`,
        serviceCards(C.services, b.category, ci, P, N),
        teamSection(b, ci, N),
        testimonialsSection(ci, b, P, N),
        `<section id="contact" class="contact-section" style="background:var(--b600);color:#fff;border-radius:var(--r);margin:2rem"><div class="container"><h2 class="reveal">${C.contactCta}</h2><p class="reveal-d1">Come see us in person.</p><div class="c-grid reveal-d2">${b.phone ? `<div class="c-item">${SVG.phone} ${b.phone}</div>` : ""}<div class="c-item">${SVG.map} ${b.address || b.city}</div><div class="c-item">${SVG.clock} Mon-Sat 8am-8pm</div></div><a href="${b.phone ? "tel:"+b.phone : "#"}" class="btn reveal-d3">${ci.ctaMain}</a></div></section>`,
        ft(b),
      ];
      break;
      
    case "boldMinimal":
      // BOLD MINIMAL: Massive type, sparse — perfect for gyms, fitness
      // Nav → Hero → Stats → Services → About → Quote → Contact → Footer
      const {revs, rtg, yrs} = genStats();
      sections = [
        nav,
        buildHero(b, C, ci, P, N, arch),
        `<div class="container" style="display:flex;justify-content:center;gap:5rem;padding:var(--sxl) 0;border-top:1px solid #222;border-bottom:1px solid #222"><div class="reveal"><div style="font-family:var(--fH);font-size:3rem;font-weight:700;color:var(--b400);line-height:1">${rtg}</div><div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.15em;color:var(--n500);margin-top:0.5rem;text-align:center">Rating</div></div><div class="reveal-d1"><div style="font-family:var(--fH);font-size:3rem;font-weight:700;color:var(--b400);line-height:1">${revs}+</div><div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.15em;color:var(--n500);margin-top:0.5rem;text-align:center">Reviews</div></div><div class="reveal-d2"><div style="font-family:var(--fH);font-size:3rem;font-weight:700;color:var(--b400);line-height:1">${yrs}</div><div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.15em;color:var(--n500);margin-top:0.5rem;text-align:center">Years</div></div></div>`,
        serviceCards(C.services, b.category, ci, P, N),
        `<section class="section"><div class="container"><h2 class="reveal">About</h2><div style="color:var(--n400);font-size:1.125rem;line-height:1.9;max-width:600px" class="reveal-d1"><p>${C.story}</p>${C.values ? `<p style="color:var(--b400);font-style:italic;margin-top:1.5rem">${C.values}</p>` : ""}</div></div></section>`,
        `<section style="padding:var(--sxxl) 0;text-align:center;border-top:1px solid #222;border-bottom:1px solid #222"><div class="container"><p style="font-family:var(--fH);font-size:clamp(1.5rem,3vw,2.25rem);color:var(--n300);font-style:italic;line-height:1.5;max-width:700px;margin:0 auto 1.5rem" class="reveal">"${ci.testimonials[0].t}"</p><p style="color:var(--n500);font-size:0.9375rem" class="reveal-d1">&mdash; ${ci.testimonials[0].a}</p></div></section>`,
        `<section id="contact" class="contact-section"><div class="container"><h2 class="reveal" style="font-size:clamp(2.5rem,6vw,4rem)">${C.contactCta}</h2><p style="color:var(--n400);margin:1.5rem 0 2rem;font-size:1.125rem" class="reveal-d1">Ready when you are.</p><div class="c-grid reveal-d2" style="color:var(--n400)">${b.phone ? `<div class="c-item">${SVG.phone} ${b.phone}</div>` : ""}<div class="c-item">${SVG.map} ${b.address || b.city}</div></div><a href="${b.phone ? "tel:"+b.phone : "#"}" class="btn reveal-d3">${b.phone || "Contact"}</a></div></section>`,
        ft(b),
      ];
      break;
      
    case "photoFirst":
      // PHOTO FIRST: Gallery-focused, immersive — perfect for photographers, venues
      // Nav → Hero → Gallery → Services → About → Contact(full-bleed) → Footer
      sections = [
        nav,
        buildHero(b, C, ci, P, N, arch),
        gallerySection(b, arch, N),
        serviceCards(C.services, b.category, ci, P, N),
        `<section class="section"><div class="container"><div class="about-grid"><div class="reveal"><h2>About ${b.name}</h2><p>${C.story}</p>${C.values ? `<p style="margin-top:1rem;font-style:italic;color:var(--b600)">${C.values}</p>` : ""}</div><div class="reveal-d1"><img src="${us(b.category,"a1")}" alt="About ${b.name}"></div></div></div></section>`,
        `<section id="contact" style="position:relative;padding:var(--sxxl) 2rem;text-align:center;color:#fff;overflow:hidden;min-height:60vh;display:flex;align-items:center;justify-content:center"><img src="${us(b.category,"h2")}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0"><div style="position:absolute;inset:0;background:var(--n900)c0;z-index:1"></div><div style="position:relative;z-index:2"><h2 class="reveal" style="font-family:var(--fH);font-size:clamp(2rem,4vw,3rem);margin-bottom:1rem">${C.contactCta}</h2><p class="reveal-d1">${b.phone ? b.phone : b.address || b.city}</p><div class="c-grid reveal-d2" style="color:var(--n300)">${b.phone ? `<div class="c-item">${SVG.phone} ${b.phone}</div>` : ""}<div class="c-item">${SVG.map} ${b.address || b.city}</div><div class="c-item">${SVG.clock} Mon-Sat 9am-6pm</div></div><a href="${b.phone ? "tel:"+b.phone : "#"}" class="btn reveal-d3">Book Now</a></div></section>`,
        ft(b),
      ];
      break;
      
    case "retro":
      // RETRO: Dashed borders, tickets — perfect for barbers, diners, vintage
      // Nav → Hero → About+Polaroid → Services(tickets) → Trust → Stats → Reviews → Contact → Footer
      const {revs: rv, rtg: rt, yrs: yr} = genStats();
      sections = [
        nav,
        buildHero(b, C, ci, P, N, arch),
        `<section class="section"><div class="container"><div style="display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center;max-width:900px;margin:0 auto"><div class="reveal"><div style="background:#fff;padding:0.75rem 0.75rem 2.5rem;border:2px solid var(--n900);box-shadow:6px 6px 0 var(--n400);max-width:320px;margin:0 auto;transform:rotate(-2deg)"><img src="${us(b.category,"h1")}" alt="${b.name}" style="width:100%;aspect-ratio:1;object-fit:cover;border:1px solid var(--bdr)"></div></div><div class="reveal-d1"><h2 style="font-family:var(--fH);font-size:2rem;margin-bottom:1rem;color:var(--n900)">About ${b.name}</h2><p style="font-size:1.0625rem;color:var(--txt2);line-height:1.9">${C.story}</p>${C.values ? `<p style="margin-top:1rem;font-style:italic">${C.values}</p>` : ""}</div></div></div></section>`,
        `<section style="padding-bottom:var(--sxxl)"><div class="container" style="max-width:700px;margin:0 auto"><h2 style="font-family:var(--fH);text-align:center;margin-bottom:2rem;font-size:clamp(1.75rem,3.5vw,2.5rem);color:var(--n900)">Services</h2>${C.services.slice(0,4).map((s: string,i: number) => `<div class="reveal reveal-d${Math.min(i+1,4)}"><div style="background:#fff;border:2px solid var(--n900);padding:1.5rem 2rem;margin-bottom:1rem;display:flex;justify-content:space-between;align-items:center;box-shadow:3px 3px 0 var(--n400);position:relative;overflow:hidden"><div style="position:absolute;top:50%;left:-10px;width:20px;height:20px;background:var(--bg2);border-radius:50%;border:2px solid var(--n900);transform:translateY(-50%)"></div><div style="position:absolute;top:50%;right:-10px;width:20px;height:20px;background:var(--bg2);border-radius:50%;border:2px solid var(--n900);transform:translateY(-50%)"></div><h4 style="font-family:var(--fH);font-size:1.125rem">${s}</h4><span style="font-family:var(--fH);font-size:0.875rem;color:var(--b600);font-weight:700">NO. ${String(i+1).padStart(3,"0")}</span></div></div>`).join("")}</div></section>`,
        trustBar(ci.trustItems, b.category, N),
        `<div class="container" style="display:grid;grid-template-columns:repeat(4,1fr);gap:2rem;padding:var(--sxl) 0;text-align:center;border-top:2px dashed var(--n400);border-bottom:2px dashed var(--n400)"><div class="reveal"><div style="font-family:var(--fH);font-size:2rem;color:var(--b600)">${rt}</div><div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt2)">Stars</div></div><div class="reveal-d1"><div style="font-family:var(--fH);font-size:2rem;color:var(--b600)">${rv}+</div><div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt2)">Customers</div></div><div class="reveal-d2"><div style="font-family:var(--fH);font-size:2rem;color:var(--b600)">${yr}</div><div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt2)">Years</div></div><div class="reveal-d3"><div style="font-family:var(--fH);font-size:2rem;color:var(--b600)">100%</div><div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt2)">Satisfaction</div></div></div>`,
        testimonialsSection(ci, b, P, N),
        `<section id="contact" class="contact-section" style="background:var(--n100);border-top:2px dashed var(--n400)"><div class="container"><h2 class="reveal" style="font-family:var(--fH);font-size:clamp(2rem,4vw,3rem);color:var(--n900);margin-bottom:1rem">${C.contactCta}</h2><p style="color:var(--txt2);margin-bottom:2rem" class="reveal-d1">${b.phone || "Stop by or give us a call"}</p><div class="c-grid reveal-d2">${b.phone ? `<div class="c-item">${SVG.phone} ${b.phone}</div>` : ""}<div class="c-item">${SVG.map} ${b.address || b.city}</div><div class="c-item">${SVG.clock} Mon-Sat 8am-6pm</div></div><a href="${b.phone ? "tel:"+b.phone : "#"}" class="btn reveal-d3">${b.phone || "Contact"}</a></section>`,
        ft(b),
      ];
      break;
  }

  const body = sections.join("\n");
  return {html: wrap(`${b.name} — ${b.category} in ${b.city}`, C.subheadline, css, body), css, readme: rd(b)};
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

export interface BuildInput {
  name: string; category: string; city: string;
  phone?: string; address?: string; email?: string;
  heroCopy: { headline: string; subheadline: string; cta: string };
  aboutCopy: { story: string; values?: string };
  servicesCopy: { intro?: string; services: string[] };
  contactCopy: { cta: string };
  forceArchetype?: Arch;
}

export interface BuildOutput {
  html: string; css: string; readme: string;
  archetype: Arch; archetypeName: string;
  primaryHue: number; antiSlopWarnings: string[];
}

export function buildPage(input: BuildInput): BuildOutput {
  const arch = input.forceArchetype || pickArch(input.category);
  const cfg = CFG[arch];
  const hue = cfg.hue[0] + Math.random() * (cfg.hue[1] - cfg.hue[0]);
  const P = prim(hue), N = neut(hue);
  const b = { name: input.name, category: input.category, city: input.city, phone: input.phone, address: input.address, email: input.email };
  const copy = { headline: input.heroCopy.headline, subheadline: input.heroCopy.subheadline, cta: input.heroCopy.cta, story: input.aboutCopy.story, values: input.aboutCopy.values, services: input.servicesCopy.services, contactCta: input.contactCopy.cta };
  const result = buildSite(b, copy, arch, P, N);
  const warnings: string[] = [];
  const c = input.category.toLowerCase();
  if ((c.includes("tech") || c.includes("software")) && hue > 230 && hue < 270) warnings.push("Avoid default blue for tech");
  if (c.includes("cafe") && hue > 30 && hue < 60) warnings.push("Avoid default warm orange for cafe");
  return { ...result, archetype: arch, archetypeName: cfg.name, primaryHue: hue, antiSlopWarnings: warnings };
}
