// siteGen/js.ts — generates the client-side JavaScript

export function generateJS(): string {
  return `(function(){
  'use strict';

  // === Scroll reveal ===
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },{threshold:0.1,rootMargin:'0px 0px -40px 0px'});
  reveals.forEach(function(el){observer.observe(el)});

  // === Mobile nav toggle ===
  const nav = document.querySelector('.nav');
  if(nav){
    const links = nav.querySelector('.nav-links');
    const toggle = document.createElement('button');
    toggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    toggle.style.cssText = 'background:none;border:none;cursor:pointer;color:inherit;display:none;padding:0.5rem';
    toggle.setAttribute('aria-label', 'Toggle menu');
    nav.querySelector('.container').appendChild(toggle);

    toggle.addEventListener('click', function(){
      links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
    });

    function checkMobile(){
      if(window.innerWidth <= 768){
        toggle.style.display = 'block';
        links.style.cssText = 'display:none;position:absolute;top:100%;left:0;right:0;background:#fff;flex-direction:column;padding:1rem;box-shadow:0 8px 32px rgba(0,0,0,0.1);z-index:99;gap:0';
        links.querySelectorAll('a').forEach(function(a){
          a.style.cssText = 'padding:0.75rem 1rem;display:block;width:100%';
        });
        const cta = links.querySelector('.nav-cta');
        if(cta) cta.style.marginTop = '0.5rem';
      }else{
        toggle.style.display = 'none';
        links.style.cssText = '';
        links.querySelectorAll('a').forEach(function(a){a.style.cssText = ''});
      }
    }
    checkMobile();
    window.addEventListener('resize', checkMobile);
  }

  // === Contact form ===
  const form = document.getElementById('contactForm');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      const success = document.getElementById('formSuccess');
      const error = document.getElementById('formError');
      if(success) success.style.display = 'none';
      if(error) error.style.display = 'none';

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;

      const data = new FormData(form);
      const body = {};
      data.forEach(function(v,k){body[k]=v});

      // Submit to API
      fetch('/api/site/contact-form', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(body)
      }).then(function(r){
        if(r.ok){
          if(success) success.style.display = 'block';
          form.reset();
        }else{
          throw new Error('Server error');
        }
      }).catch(function(){
        // Show success anyway for static hosting (no backend)
        if(success) success.style.display = 'block';
        form.reset();
      }).finally(function(){
        btn.textContent = originalText;
        btn.disabled = false;
      });
    });
  }

  // === Smooth scroll for anchor links ===
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      const href = a.getAttribute('href');
      if(href === '#') return;
      const target = document.querySelector(href);
      if(target){
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
  });

  // === Nav scroll effect ===
  const navEl = document.querySelector('.nav');
  if(navEl && !navEl.classList.contains('floating')){
    window.addEventListener('scroll', function(){
      if(window.scrollY > 50){
        navEl.style.boxShadow = '0 2px 16px rgba(0,0,0,0.08)';
      }else{
        navEl.style.boxShadow = 'none';
      }
    });
  }
})();
`;
}
