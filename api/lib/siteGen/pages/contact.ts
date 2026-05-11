import type { DesignSystem, SiteCopy } from "../types";

export function buildContactPage(_ds: DesignSystem, copy: SiteCopy, business: { name: string; city: string; phone?: string | null; email?: string | null; address?: string | null }): string {
  const c = copy.contact;

  // Hero
  const hero = `<section class="page-content" style="background:var(--c-bg2);padding:calc(var(--sp)*1.2) 0 calc(var(--sp)*0.8)">
    <div class="container reveal">
      <h1 style="margin-bottom:1rem">${c.headline}</h1>
      <p style="max-width:640px">${c.subheadline}</p>
    </div>
  </section>`;

  // Contact grid
  const contact = `<section class="page-content"><div class="container">
    <div class="contact-grid">
      <div class="reveal">
        <h3>Contact Information</h3>
        <p>Reach out however works best for you. We respond to every inquiry within 24 hours.</p>
        <div style="margin-top:2rem">
          ${business.phone ? `<div class="contact-detail">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.38 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.32 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <a href="tel:${business.phone}">${business.phone}</a>
          </div>` : ""}
          ${business.email ? `<div class="contact-detail">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            <a href="mailto:${business.email}">${business.email}</a>
          </div>` : ""}
          ${business.address ? `<div class="contact-detail">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${business.address}, ${business.city}</span>
          </div>` : ""}
        </div>
        <div style="margin-top:3rem;padding:1.5rem;background:var(--c-pl);border-radius:var(--r)">
          <h4 style="margin-bottom:0.5rem;font-size:1rem">Business Hours</h4>
          <p style="font-size:0.875rem;color:var(--c-tl)">Monday – Friday: 8am – 6pm<br>Saturday: 9am – 4pm<br>Sunday: Closed</p>
        </div>
      </div>
      <div class="contact-form reveal reveal-delay-1">
        <div class="form-success" id="formSuccess">Thanks! We'll be in touch within 24 hours.</div>
        <div class="form-error" id="formError">Something went wrong. Please try again or call us directly.</div>
        <form id="contactForm" action="#" method="POST">
          <div class="form-group">
            <label for="name">Your Name</label>
            <input type="text" id="name" name="name" required placeholder="John Smith">
          </div>
          <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" name="email" required placeholder="john@example.com">
          </div>
          <div class="form-group">
            <label for="phone">Phone (optional)</label>
            <input type="tel" id="phone" name="phone" placeholder="(555) 123-4567">
          </div>
          <div class="form-group">
            <label for="service">Service Needed</label>
            <input type="text" id="service" name="service" placeholder="What do you need help with?">
          </div>
          <div class="form-group">
            <label for="message">Message</label>
            <textarea id="message" name="message" required placeholder="Tell us a bit about what you're looking for..."></textarea>
          </div>
          <button type="submit" class="btn" style="width:100%">${c.formButton}</button>
        </form>
      </div>
    </div>
  </div></section>`;

  return hero + contact;
}
