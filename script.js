/* ============================================================
   STACKLY – ELECTRICAL SERVICES WEBSITE
   script.js – Premium Interactions & Animations
   ============================================================ */

'use strict';

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Query selector helper
 * @param {string} sel - CSS selector
 * @param {Element} [ctx=document]
 */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/**
 * Clamp a number between min and max
 */
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

// ============================================================
// TOPBAR HIDE ON SCROLL
// ============================================================
(function setupTopbar() {
  const topbar = $('#topbar');
  const navbar = $('#navbar');
  if (!topbar || !navbar) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (scrollY > 100) {
          navbar.classList.add('scrolled');
          topbar.style.display = 'none';
        } else {
          navbar.classList.remove('scrolled');
          topbar.style.display = '';
        }
        lastScrollY = scrollY;
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
})();

// ============================================================
// ACTIVE NAV LINK ON SCROLL
// ============================================================
(function setupActiveNav() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle(
              'active',
              link.getAttribute('href') === `#${id}`
            );
          });
        }
      });
    },
    { threshold: 0.3, rootMargin: '-10% 0px -60% 0px' }
  );

  sections.forEach(s => observer.observe(s));
})();

// ============================================================
// HAMBURGER MENU
// ============================================================
(function setupMobileMenu() {
  const hamburger = $('#hamburger');
  const mobileMenu = $('#mobile-menu');
  const mobileLinks = $$('.mobile-link, .mobile-btn-call, .mobile-btn-quote');

  if (!hamburger || !mobileMenu) return;

  const toggle = (open) => {
    hamburger.classList.toggle('open', open);
    mobileMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    toggle(!isOpen);
  });

  // Close on link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => toggle(false));
  });

  // Mobile accordion for Services dropdown
  const accordionBtn = $('#mobile-services-btn');
  const accordionContent = $('#mobile-services-content');
  if (accordionBtn && accordionContent) {
    accordionBtn.addEventListener('click', () => {
      const isOpen = accordionContent.classList.contains('open');
      accordionContent.classList.toggle('open', !isOpen);
      accordionBtn.classList.toggle('open', !isOpen);
    });
  }
})();

// ============================================================
// HERO SLIDER
// ============================================================
(function setupHeroSlider() {
  const slides    = $$('.hero-slide');
  const dots      = $$('.dot');
  const prevBtn   = $('#slider-prev');
  const nextBtn   = $('#slider-next');

  if (!slides.length) return;

  let current = 0;
  let autoTimer = null;
  let isAnimating = false;
  const DURATION = 5500;
  const ANIM_TIME = 900;

  const goTo = (index) => {
    if (isAnimating || index === current) return;
    isAnimating = true;

    const prevIndex = current;
    current = (index + slides.length) % slides.length;

    slides[prevIndex].classList.remove('active');
    slides[prevIndex].classList.add('exiting');
    slides[current].classList.add('active');

    dots.forEach((d, i) => d.classList.toggle('active', i === current));

    // Trigger counter on hero stats for active slide
    animateHeroCounters(slides[current]);

    setTimeout(() => {
      slides[prevIndex].classList.remove('exiting');
      isAnimating = false;
    }, ANIM_TIME);
  };

  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  const startAuto = () => {
    clearInterval(autoTimer);
    autoTimer = setInterval(next, DURATION);
  };

  const stopAuto  = () => clearInterval(autoTimer);

  // Controls
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAuto(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAuto(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); startAuto(); });
  });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { prev(); startAuto(); }
    if (e.key === 'ArrowRight') { next(); startAuto(); }
  });

  // Touch swipe
  let touchStartX = 0;
  const hero = $('.hero');
  if (hero) {
    hero.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) next(); else prev();
        startAuto();
      }
    }, { passive: true });

    // Pause on hover
    hero.addEventListener('mouseenter', stopAuto);
    hero.addEventListener('mouseleave', startAuto);
  }

  // Kick-off
  startAuto();
  animateHeroCounters(slides[0]);
})();

// ============================================================
// HERO COUNTER ANIMATION (stat nums inside hero)
// ============================================================
function animateHeroCounters(slideEl) {
  const nums = $$('[data-target]', slideEl);
  nums.forEach(el => {
    const target = +el.dataset.target;
    const duration = 1800;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

// ============================================================
// SCROLL REVEAL (Intersection Observer)
// ============================================================
(function setupScrollReveal() {
  const revealEls = $$('.reveal-up, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(el => observer.observe(el));
})();

// ============================================================
// COUNTER ANIMATION (About Stats Bar)
// ============================================================
(function setupCounters() {
  const counters = $$('.counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(c => observer.observe(c));
})();

function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const start    = performance.now();

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 4);
    el.textContent = Math.floor(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

// ============================================================
// PROJECTS FILTER
// ============================================================
(function setupProjectFilter() {
  const filterBtns = $$('.filter-btn');
  const projectCards = $$('.project-card');

  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      projectCards.forEach(card => {
        const category = card.dataset.category;
        const show = filter === 'all' || category === filter;

        if (show) {
          card.classList.remove('hidden');
          card.style.animation = 'fadeInUp 0.5s ease both';
          setTimeout(() => { card.style.animation = ''; }, 600);
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();

// ============================================================
// TESTIMONIALS SLIDER
// ============================================================
(function setupTestimonialsSlider() {
  const track   = $('#testimonials-track');
  const prevBtn = $('#test-prev');
  const nextBtn = $('#test-next');
  const dots    = $$('.t-dot');
  const cards   = $$('.testimonial-card');

  if (!track || !cards.length) return;

  let current      = 0;
  let autoTimer    = null;
  let cardWidth    = 0;
  let visibleCount = 1;
  const DURATION   = 4000;

  const getVisibleCount = () => {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768)  return 2;
    return 1;
  };

  const getMaxIndex = () => Math.max(0, cards.length - getVisibleCount());

  const updateDots = () => {
    const maxIndex = getMaxIndex();
    const dotsCount = maxIndex + 1;
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
  };

  const goTo = (index) => {
    visibleCount = getVisibleCount();
    const maxIndex = getMaxIndex();
    current = clamp(index, 0, maxIndex);

    cardWidth = cards[0].offsetWidth + parseInt(getComputedStyle(track).gap || 24);
    track.style.transform = `translateX(-${current * cardWidth}px)`;
    updateDots();
  };

  const next = () => goTo(current + 1 > getMaxIndex() ? 0 : current + 1);
  const prev = () => goTo(current - 1 < 0 ? getMaxIndex() : current - 1);

  const startAuto = () => {
    clearInterval(autoTimer);
    autoTimer = setInterval(next, DURATION);
  };

  if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAuto(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAuto(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); startAuto(); });
  });

  // Touch support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next(); else prev();
      startAuto();
    }
  }, { passive: true });

  // Recalculate on resize
  window.addEventListener('resize', () => {
    goTo(0);
  });

  goTo(0);
  startAuto();
})();

// ============================================================
// CONTACT FORM HANDLING
// ============================================================
(function setupContactForm() {
  const form        = $('#contact-form');
  const submitBtn   = $('#form-submit');
  const btnText     = $('#btn-text');
  const successMsg  = $('#form-success');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic validation
    const fname   = $('#fname', form).value.trim();
    const email   = $('#email', form).value.trim();
    const service = $('#service', form).value;

    if (!fname || !email) {
      shakeForm(submitBtn);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      shakeForm(submitBtn);
      return;
    }

    // Show loading state
    submitBtn.disabled = true;
    btnText.textContent = 'Sending...';
    submitBtn.style.opacity = '0.8';

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1800));

    // Success
    btnText.textContent = 'Sent! ✓';
    submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';

    if (successMsg) {
      successMsg.classList.add('visible');
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    form.reset();

    // Reset after delay
    setTimeout(() => {
      submitBtn.disabled = false;
      btnText.textContent = 'Send Request';
      submitBtn.style.background = '';
      submitBtn.style.opacity = '';
      if (successMsg) successMsg.classList.remove('visible');
    }, 4000);
  });

  function shakeForm(el) {
    el.style.animation = 'none';
    requestAnimationFrame(() => {
      el.style.animation = 'shake 0.5s ease';
    });
    setTimeout(() => { el.style.animation = ''; }, 600);
  }

  // Add shake keyframe
  if (!document.querySelector('#shake-style')) {
    const style = document.createElement('style');
    style.id = 'shake-style';
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%  { transform: translateX(-8px); }
        40%  { transform: translateX(8px); }
        60%  { transform: translateX(-5px); }
        80%  { transform: translateX(5px); }
      }
    `;
    document.head.appendChild(style);
  }
})();

// ============================================================
// BACK TO TOP BUTTON
// ============================================================
(function setupBackToTop() {
  const btn = $('#back-to-top');
  if (!btn) return;

  const toggle = () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  };

  window.addEventListener('scroll', toggle, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ============================================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================================
(function setupSmoothScroll() {
  const navbar = $('#navbar');

  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = $(href);
      if (!target) return;

      e.preventDefault();

      const navbarH = navbar ? navbar.offsetHeight : 0;
      const topY = target.getBoundingClientRect().top + window.scrollY - navbarH - 8;

      window.scrollTo({ top: topY, behavior: 'smooth' });
    });
  });
})();

// ============================================================
// NAVBAR DROPDOWN KEYBOARD ACCESSIBILITY
// ============================================================
(function setupDropdownA11y() {
  const trigger  = $('#services-dropdown-trigger');
  const menuEl   = $('#services-dropdown-menu');
  const dropdown = trigger?.closest('.dropdown');

  if (!trigger || !menuEl || !dropdown) return;

  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      menuEl.classList.toggle('open');
    }
    if (e.key === 'Escape') {
      menuEl.classList.remove('open');
      trigger.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      menuEl.classList.remove('open');
    }
  });
})();

// ============================================================
// PARALLAX EFFECT ON HERO 3D ELEMENTS
// ============================================================
(function setupParallax() {
  const hero   = $('.hero');
  const els    = $$('.hero-3d-element');

  if (!hero || !els.length) return;

  hero.addEventListener('mousemove', (e) => {
    const { left, top, width, height } = hero.getBoundingClientRect();
    const x = (e.clientX - left - width  / 2) / (width  / 2);
    const y = (e.clientY - top  - height / 2) / (height / 2);

    els.forEach((el, i) => {
      const factor = (i + 1) * 8;
      el.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    });
  });

  hero.addEventListener('mouseleave', () => {
    els.forEach(el => { el.style.transform = ''; });
  });
})();

// ============================================================
// FLOATING BADGE ANIMATION – stagger on load
// ============================================================
(function setupFloatingBadges() {
  $$('.about-floating-card, .about-badge-card').forEach((el, i) => {
    el.style.animationDelay = `${i * 0.3}s`;
  });
})();

// ============================================================
// SERVICE CARD TILT EFFECT (3D on hover)
// ============================================================
(function setupCardTilt() {
  $$('.service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = (e.clientX - left - width  / 2) / (width  / 2);
      const y = (e.clientY - top  - height / 2) / (height / 2);
      card.style.transform = `translateY(-10px) perspective(600px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

// ============================================================
// PROJECT CARD TILT
// ============================================================
(function setupProjectTilt() {
  $$('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = (e.clientX - left - width  / 2) / (width  / 2);
      const y = (e.clientY - top  - height / 2) / (height / 2);
      card.style.transform = `translateY(-8px) perspective(600px) rotateX(${-y * 3}deg) rotateY(${x * 3}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

// ============================================================
// WHY FEATURE HOVER ANIMATION
// ============================================================
(function setupWhyFeatureHover() {
  $$('.why-feature').forEach(el => {
    el.addEventListener('mouseenter', () => {
      const icon = el.querySelector('.why-feature-icon');
      if (icon) icon.style.boxShadow = '0 0 20px rgba(245,158,11,0.4)';
    });
    el.addEventListener('mouseleave', () => {
      const icon = el.querySelector('.why-feature-icon');
      if (icon) icon.style.boxShadow = '';
    });
  });
})();

// ============================================================
// TYPEWRITER EFFECT ON HERO TITLE (first slide)
// ============================================================
(function setupTypewriter() {
  // Subtle blinking cursor on hero highlight
  const highlight = $('.hero-slide.active .hero-highlight');
  if (!highlight) return;

  const cursor = document.createElement('span');
  cursor.textContent = '|';
  cursor.style.cssText = `
    color: var(--primary);
    animation: blink 1s step-end infinite;
    margin-left: 2px;
    font-weight: 900;
  `;

  if (!document.querySelector('#blink-style')) {
    const style = document.createElement('style');
    style.id = 'blink-style';
    style.textContent = `
      @keyframes blink {
        from, to { opacity: 1; }
        50%       { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
})();

// ============================================================
// PERFORMANCE: LAZY LOAD IMAGES
// ============================================================
(function setupLazyLoad() {
  const images = $$('img');

  if ('loading' in HTMLImageElement.prototype) {
    images.forEach(img => {
      if (!img.getAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
    });
  } else {
    // Fallback IntersectionObserver
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              observer.unobserve(img);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    images.forEach(img => observer.observe(img));
  }
})();

// ============================================================
// INIT LOG
// ============================================================
console.log('%c⚡ Stackly Electrical Services', 'color:#f59e0b;font-size:18px;font-weight:bold;');
console.log('%cPremium Website by Stackly — Powered up! ⚡', 'color:#94a3b8;font-size:12px;');
