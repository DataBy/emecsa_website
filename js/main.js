/* ============================================================
   EMECSA — Main Animation Script
   Uses GSAP + ScrollTrigger (loaded from CDN)
   ============================================================ */

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/* ============================================================
   UTILITIES
   ============================================================ */
const qs  = (s, ctx = document) => ctx.querySelector(s);
const qsa = (s, ctx = document) => [...ctx.querySelectorAll(s)];

const isMobile = () => window.innerWidth <= 768;

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

/* initHeroCanvas removed — hero.js handles the sequence canvas */

/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
function initCursor() {
  if (isMobile()) return;

  const dot      = qs('#cursor');
  const follower = qs('#cursorFollower');
  let mx = 0, my = 0, fx = 0, fy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    gsap.to(dot, { x: mx, y: my, duration: 0.08, overwrite: true });
  });

  (function track() {
    fx += (mx - fx) * 0.11;
    fy += (my - fy) * 0.11;
    gsap.set(follower, { x: fx, y: fy });
    requestAnimationFrame(track);
  })();

  const hover   = qsa('a, button, .service-card, .project-card');
  hover.forEach(el => {
    el.addEventListener('mouseenter', () => {
      gsap.to(dot,      { scale: 2.8, duration: 0.3 });
      gsap.to(follower, { scale: 1.6, opacity: 0.28, duration: 0.3 });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(dot,      { scale: 1, duration: 0.3 });
      gsap.to(follower, { scale: 1, opacity: 1,    duration: 0.3 });
    });
  });
}

/* ============================================================
   SCROLL PROGRESS BAR
   ============================================================ */
function initScrollProgress() {
  gsap.to('.scroll-progress', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: {
      scrub: true,
      start: 'top top',
      end:   'bottom bottom'
    }
  });
}

/* ============================================================
   HEADER — sticky state
   ============================================================ */
function initHeader() {
  const header = qs('header');
  ScrollTrigger.create({
    start: 'top -60',
    onUpdate: self => header.classList.toggle('scrolled', self.scroll() > 60)
  });
}

/* ============================================================
   PRELOADER → HERO ENTRANCE
   ============================================================ */
function initPreloader() {
  const tl = gsap.timeline();

  tl.to('#preloaderFill', {
    width: '100%',
    duration: 1.1,
    ease: 'power2.inOut'
  })
  .to('#preloader', {
    yPercent: -100,
    duration: 0.75,
    ease: 'power3.inOut',
    onComplete() {
      qs('#preloader').style.display = 'none';
      document.body.classList.remove('is-loading');
      ScrollTrigger.refresh();
      window.dispatchEvent(new Event('hero:scrollReady'));
      heroEntrance();
    }
  });
}

function heroEntrance() {
  /* Staggered entrance of hero UI elements after preloader exits.
     hero.js takes over scroll-based opacity/transform after onComplete fires. */
  const tl = gsap.timeline({
    defaults: { ease: 'expo.out' },
    onComplete() {
      window.dispatchEvent(new Event('hero:entranceComplete'));
    }
  });

  tl.to('#heroLogo',     { opacity: 1, scale: 1, duration: 1.2 })
    .to('#heroEyebrow',  { opacity: 1, y: 0, duration: 0.7 }, '-=0.65')
    .to('#heroHeadline', { opacity: 1, y: 0, duration: 0.9 }, '-=0.55')
    .to('#heroSub',      { opacity: 1, y: 0, duration: 0.7 }, '-=0.6')
    .to('#heroCtaRow',   { opacity: 1, y: 0, duration: 0.6 }, '-=0.55')
    .to('#heroScrollCue',{ opacity: 1, duration: 0.5 },        '-=0.3')
    .to('.header-logo',  { opacity: 1, duration: 0.4 },        '-=0.8');
  /* Scroll-based parallax on hero elements removed — hero.js handles
     content fade-out via direct style on #heroContent */
}

/* initServices removed — services now live inside the hero sequence (hero.js) */

/* ============================================================
   STRENGTH — counters + bar
   ============================================================ */
function initStrength() {
  ScrollTrigger.create({
    trigger: '#strength',
    start: 'top 72%',
    onEnter() {
      gsap.to('#strengthLabel', { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' });
      gsap.to('#strengthTitle', { opacity: 1, y: 0, duration: 0.8, delay: 0.1, ease: 'power3.out' });
    }
  });

  qsa('.stat-item').forEach((item, i) => {
    const counter = qs('.stat-count', item);
    const bar     = qs('.stat-bar-fill', item);
    const target  = parseInt(counter.dataset.target);

    ScrollTrigger.create({
      trigger: item,
      start: 'top 82%',
      onEnter() {
        const delay = i * 0.14;

        gsap.to(item, { opacity: 1, y: 0, duration: 0.75, delay, ease: 'power3.out' });

        gsap.to({ v: 0 }, {
          v: target, duration: 2.2, delay: delay + 0.2,
          ease: 'power2.out',
          onUpdate() { counter.textContent = Math.round(this.targets()[0].v); }
        });

        gsap.to(bar, { scaleX: 1, duration: 1.6, delay: delay + 0.4, ease: 'power3.out' });
      }
    });
  });
}

/* ============================================================
   PROJECTS — reveal masks + parallax zoom
   ============================================================ */
function initProjects() {
  ScrollTrigger.create({
    trigger: '#projects',
    start: 'top 72%',
    onEnter() {
      gsap.to('#projectsLabel', { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' });
      gsap.to('#projectsTitle', { opacity: 1, y: 0, duration: 0.8, delay: 0.1, ease: 'power3.out' });
    }
  });

  qsa('.project-card').forEach((card, i) => {
    const mask  = qs('.project-reveal', card);
    const inner = qs('.project-placeholder', card);

    /* Slide mask out to reveal image */
    ScrollTrigger.create({
      trigger: card,
      start: 'top 82%',
      onEnter() {
        gsap.to(mask, {
          scaleX: 0, duration: 1.05,
          delay: i * 0.14,
          ease: 'power4.inOut'
        });
      }
    });

    /* Parallax zoom — inner image scales from 1.12→1 as card passes viewport */
    if (inner) {
      gsap.to(inner, {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.8
        }
      });
    }
  });
}

/* ============================================================
   CAPABILITIES — circuit drawing + list items
   ============================================================ */
function initCapabilities() {
  ScrollTrigger.create({
    trigger: '#capabilities',
    start: 'top 72%',
    onEnter() {
      gsap.to('#capLabel', { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' });
      gsap.to('#capTitle', { opacity: 1, y: 0, duration: 0.8, delay: 0.1, ease: 'power3.out' });

      gsap.to('.cap-list li', {
        opacity: 1, x: 0,
        duration: 0.55,
        stagger: 0.07,
        delay: 0.2,
        ease: 'power3.out'
      });

      /* Reveal circuit diagram */
      gsap.to('.circuit-wrap', {
        opacity: 1, scale: 1,
        duration: 1, delay: 0.35,
        ease: 'power3.out'
      });

      /* Draw each path */
      qsa('.c-path').forEach((path, i) => {
        const len = path.getTotalLength ? path.getTotalLength() : 300;
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 1.6,
          delay: 0.55 + i * 0.09,
          ease: 'power2.inOut'
        });
      });

      /* Pop nodes */
      gsap.to('.c-node', {
        opacity: 1,
        stagger: 0.04,
        delay: 1.3,
        duration: 0.3,
        ease: 'back.out(2)'
      });

      gsap.to('.c-chip', {
        opacity: 1,
        delay: 1.5,
        duration: 0.5,
        ease: 'power2.out'
      });
    }
  });

  /* Pulse animation on central node */
  gsap.to('#cpuPulse', {
    opacity: 0.9, r: 10,
    duration: 1,
    repeat: -1, yoyo: true,
    ease: 'sine.inOut',
    delay: 2.5
  });
}

/* ============================================================
   CTA
   ============================================================ */
function initCTA() {
  ScrollTrigger.create({
    trigger: '#cta',
    start: 'top 68%',
    onEnter() {
      gsap.to('.cta-ring', {
        scale: 1, opacity: 1,
        duration: 1.6, stagger: 0.22,
        ease: 'power3.out'
      });

      gsap.to('#ctaLabel',    { opacity: 1,           duration: 0.5, delay: 0.2 });
      gsap.to('#ctaHeadline', { opacity: 1, y: 0,     duration: 0.8, delay: 0.3, ease: 'power3.out' });
      gsap.to('#ctaSub',      { opacity: 1,           duration: 0.6, delay: 0.5 });
      gsap.to('#ctaActions',  { opacity: 1, y: 0,     duration: 0.6, delay: 0.6, ease: 'back.out(1.4)' });
      gsap.to('#ctaContact',  { opacity: 1,           duration: 0.6, delay: 0.8 });
    }
  });

  /* Pulse glow on primary button */
  gsap.to('.btn-primary', {
    boxShadow: '0 0 32px rgba(0,135,90,0.28)',
    duration: 1.6, repeat: -1, yoyo: true,
    ease: 'sine.inOut', delay: 2
  });
}

/* ============================================================
   PARALLAX — background text drift
   ============================================================ */
function initParallax() {
  gsap.to('.strength-marquee-inner', {
    x: '-50%',
    ease: 'none',
    scrollTrigger: {
      trigger: '#strength',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 3
    }
  });
}

/* ============================================================
   SMOOTH NAV SCROLL
   ============================================================ */
function initNavScroll() {
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      const target = qs(href);
      if (!target) return;
      e.preventDefault();

      const heroWrapper = qs('#heroSequenceWrapper');
      const goesToHeroHome = a.hasAttribute('data-hero-home') && heroWrapper;

      if (goesToHeroHome) {
        window.dispatchEvent(new Event('hero:resetRequested'));
        gsap.killTweensOf(window);
        gsap.to(window, {
          scrollTo: { y: heroWrapper, offsetY: 0 },
          duration: 0.8,
          ease: 'power3.inOut'
        });
        return;
      }

      const servicesReviewProgress = 0.9;
      const servicesReviewY = heroWrapper
        ? heroWrapper.offsetTop + ((heroWrapper.offsetHeight - window.innerHeight) * servicesReviewProgress)
        : 0;
      const goesToServicesReview = a.hasAttribute('data-services-review') && heroWrapper;

      if (goesToServicesReview) {
        window.dispatchEvent(new Event('hero:servicesReviewRequested'));
        gsap.killTweensOf(window);
        window.scrollTo(0, servicesReviewY);
        return;
      }

      gsap.to(window, {
        scrollTo: { y: target, offsetY: 0 },
        duration: 1.3,
        ease: 'power3.inOut'
      });
    });
  });
}

/* ============================================================
   BOOT
   ============================================================ */
window.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);

  initCursor();
  initScrollProgress();
  initHeader();
  initPreloader();
  initStrength();
  initProjects();
  initCapabilities();
  initCTA();
  initParallax();
  initNavScroll();

  window.addEventListener('load', () => ScrollTrigger.refresh());
});
