/* ============================================================
   STACKLY – PAGES.JS
   Shared JavaScript for all sub-pages
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ─── TOPBAR SCROLL HIDE ─── */
  const topbar = document.getElementById('topbar');
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', function () {
    const scrollY = window.scrollY;
    if (scrollY > 60) {
      navbar.classList.add('scrolled');
      if (topbar) topbar.style.display = 'none';
    } else {
      navbar.classList.remove('scrolled');
      if (topbar) topbar.style.display = '';
    }
    lastScroll = scrollY;
  }, { passive: true });

  /* ─── HAMBURGER / MOBILE MENU ─── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileBackdrop = document.getElementById('mobile-backdrop');
  const mobileCloseBtn = document.getElementById('mobile-close-btn');
  const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-accordion-btn');

  function openMobileMenu() {
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    mobileBackdrop.style.display = 'block';
    document.body.style.overflow = 'hidden';
    setTimeout(() => mobileBackdrop.classList.add('show'), 10);
    // Stagger reveal
    let delay = 80;
    mobileLinks.forEach(link => {
      link.style.transitionDelay = `${delay}ms`;
      link.classList.add('link-revealed');
      delay += 60;
    });
  }

  function closeMobileMenu() {
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    mobileBackdrop.classList.remove('show');
    document.body.style.overflow = '';
    mobileLinks.forEach(link => {
      link.classList.remove('link-revealed');
      link.style.transitionDelay = '';
    });
    setTimeout(() => { mobileBackdrop.style.display = ''; }, 420);
  }

  if (hamburger) {
    hamburger.addEventListener('click', function() {
      if (hamburger.classList.contains('open')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }
  if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMobileMenu);
  if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileMenu);

  // Mobile accordion
  const accordionBtn = document.getElementById('mobile-services-btn');
  const accordionContent = document.getElementById('mobile-services-content');
  if (accordionBtn && accordionContent) {
    accordionBtn.addEventListener('click', function () {
      const isOpen = accordionContent.classList.contains('open');
      accordionContent.classList.toggle('open', !isOpen);
      accordionBtn.classList.toggle('open', !isOpen);
    });
  }

  // Close mobile menu when any mobile link is clicked
  document.querySelectorAll('.mobile-link, .mobile-sub-link, .mobile-btn-quote, .mobile-btn-call').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  /* ─── BACK TO TOP ─── */
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('visible', window.scrollY > 300);
    }, { passive: true });
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ─── SCROLL REVEAL ─── */
  function initReveal() {
    const els = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    if (!els.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => observer.observe(el));
  }
  initReveal();

  /* ─── FORM HANDLING ─── */
  document.querySelectorAll('form[data-ajax]').forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      const successMsg = form.querySelector('.form-success-msg');
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '<span>Sending...</span>';
        btn.disabled = true;
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.disabled = false;
          if (successMsg) {
            successMsg.style.display = 'block';
            setTimeout(() => { successMsg.style.display = ''; }, 4000);
          }
          form.reset();
        }, 1800);
      }
    });
  });

  /* ─── PROJECT FILTER ─── */
  const filterBtns = document.querySelectorAll('.pf-btn');
  const projectCards = document.querySelectorAll('.project-page-card[data-category]');
  if (filterBtns.length && projectCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.filter;
        projectCards.forEach(card => {
          if (cat === 'all' || card.dataset.category === cat) {
            card.style.display = '';
            card.style.opacity = '1';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /* ─── COUNTER ANIMATION ─── */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target || el.textContent, 10);
    if (isNaN(target)) return;
    const duration = 1800;
    const start = performance.now();
    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(ease * target);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    }
    requestAnimationFrame(update);
  }
  const statNums = document.querySelectorAll('.stat-banner-num [data-target], .stat-count');
  if (statNums.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    statNums.forEach(el => obs.observe(el));
  }

  /* ─── PASSWORD TOGGLE ─── */
  document.querySelectorAll('.pwd-toggle').forEach(btn => {
    btn.addEventListener('click', function () {
      const input = btn.parentElement.querySelector('input');
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
      } else {
        input.type = 'password';
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
      }
    });
  });

  /* ─── DASHBOARD SIDEBAR TOGGLE ─── */
  const dashMenuToggle = document.getElementById('dash-menu-toggle');
  const dashSidebar = document.getElementById('dash-sidebar');
  const dashOverlay = document.getElementById('dash-sidebar-overlay');
  if (dashMenuToggle && dashSidebar) {
    function openDashSidebar() {
      dashSidebar.classList.add('open');
      if (dashOverlay) { dashOverlay.classList.add('visible'); }
      document.body.style.overflow = 'hidden';
    }
    function closeDashSidebar() {
      dashSidebar.classList.remove('open');
      if (dashOverlay) { dashOverlay.classList.remove('visible'); }
      document.body.style.overflow = '';
    }
    dashMenuToggle.addEventListener('click', openDashSidebar);
    if (dashOverlay) dashOverlay.addEventListener('click', closeDashSidebar);
  }

  /* ─── ACTIVE NAV LINK HIGHLIGHT ─── */
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[data-page], .dash-nav-item[data-page]').forEach(link => {
    if (link.dataset.page === currentPage) link.classList.add('active');
  });

  /* ─── RATING BARS ANIMATION ─── */
  const ratingBars = document.querySelectorAll('.rb-bar-fill[data-width]');
  if (ratingBars.length) {
    const rbObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.width = entry.target.dataset.width;
          rbObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    ratingBars.forEach(bar => {
      bar.style.width = '0';
      rbObs.observe(bar);
    });
  }

});
