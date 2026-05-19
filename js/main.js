/* ============================================================
   EMECSA — Main Animation Script
   Focus: Anime.js + native browser APIs
   ============================================================ */

(function () {
  'use strict';

  const qs = (selector, ctx = document) => ctx.querySelector(selector);
  const qsa = (selector, ctx = document) => Array.from(ctx.querySelectorAll(selector));
  const isTouch = () => window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 820;
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  const SERVICE_CAROUSEL = [
    {
      number: '01',
      title: 'Consultoría y diseño electromecánico',
      text: 'Planos eléctricos, sistemas especiales, sistemas mecánicos, supresión de incendios y verificaciones eléctricas para trámites ante Ministerio de Salud.',
      bullets: ['Residencial, comercial, institucional e industrial.', 'Documentación para tramitología y códigos OC.', 'Equipo de diseño interno.'],
      meta: 'Diseño y documentación'
    },
    {
      number: '02',
      title: 'Construcción electromecánica',
      text: 'Acometidas, canalizaciones, tableros, ramales, luminarias, refrigeración, pararrayos, telecomunicaciones, aguas negras, pluviales, agua potable y bombas.',
      bullets: ['Obra eléctrica y mecánica completa.', 'Media y baja tensión.', 'Puesta en servicio por etapas.'],
      meta: 'Ejecución en campo'
    },
    {
      number: '03',
      title: 'Sistemas especiales',
      text: 'CCTV, telecomunicaciones, sonido y detección de incendios para edificaciones de alto tránsito.',
      bullets: ['Retail, oficinas, centros educativos y edificios públicos.', 'Coordinación con arquitectura y operación.', 'Integración ordenada de canalizaciones.'],
      meta: 'Integración técnica'
    },
    {
      number: '04',
      title: 'Remodelaciones industriales, comerciales y residenciales',
      text: 'Ejecución de remodelaciones electromecánicas orientadas a mejorar la eficiencia, continuidad operativa y desempeño técnico de cada edificación.',
      bullets: ['Supermercados, restaurantes, centros comerciales y plantas.', 'Trabajos por fases con operación activa.', 'Reemplazo total o parcial de sistemas críticos.'],
      meta: 'Operación activa'
    },
    {
      number: '05',
      title: 'Automatización y sistemas de control',
      text: 'Soluciones de automatización y control para procesos residenciales, comerciales e industriales, alineadas con la rama electromecánica que originó la empresa.',
      bullets: ['Potencia y control para refrigeración.', 'Control de procesos y tableros.', 'Integración con sistemas eléctricos existentes.'],
      meta: 'Control y potencia'
    }
  ];

  function runAnime(config) {
    if (reduceMotion() || !window.anime) {
      const targets = qsaFromTargets(config.targets);
      targets.forEach((target) => {
        if (!target || !target.style) return;
        if (config.opacity !== undefined) target.style.opacity = Array.isArray(config.opacity) ? config.opacity.at(-1) : config.opacity;
        if (
          config.translateY !== undefined ||
          config.translateX !== undefined ||
          config.scale !== undefined ||
          config.scaleX !== undefined ||
          config.rotate !== undefined
        ) {
          target.style.transform = 'none';
        }
      });
      if (typeof config.complete === 'function') config.complete();
      return null;
    }
    return anime(config);
  }

  function qsaFromTargets(targets) {
    if (!targets) return [];
    if (typeof targets === 'string') return qsa(targets);
    if (targets instanceof Element || targets === window) return [targets];
    if (Array.isArray(targets)) return targets;
    return [];
  }

  function initScrollProgress() {
    const bar = qs('.scroll-progress');
    if (!bar) return;

    let ticking = false;
    const update = () => {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / max));
      bar.style.transform = `scaleX(${progress})`;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }

  function initHeader() {
    const header = qs('#header');
    if (!header || document.body.classList.contains('inner-page')) return;

    const update = () => header.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function initPreloader() {
    const preloader = qs('#preloader');
    if (!preloader) {
      document.body.classList.remove('is-loading');
      window.dispatchEvent(new Event('hero:scrollReady'));
      heroEntrance();
      return;
    }

    const fill = qs('#preloaderFill');
    if (!window.anime || reduceMotion()) {
      preloader.style.display = 'none';
      document.body.classList.remove('is-loading');
      window.dispatchEvent(new Event('hero:scrollReady'));
      heroEntrance();
      return;
    }

    anime.timeline({ easing: 'easeInOutCubic' })
      .add({
        targets: fill,
        width: '100%',
        duration: 900
      })
      .add({
        targets: preloader,
        translateY: '-100%',
        duration: 680,
        complete() {
          preloader.style.display = 'none';
          document.body.classList.remove('is-loading');
          window.dispatchEvent(new Event('hero:scrollReady'));
          heroEntrance();
        }
      });
  }

  function heroEntrance() {
    if (!qs('#heroContent')) {
      revealAboveFold();
      return;
    }

    if (!window.anime || reduceMotion()) {
      qsa('#heroLogo, #heroEyebrow, #heroHeadline, #heroSub, #heroCtaRow').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      window.dispatchEvent(new Event('hero:entranceComplete'));
      revealAboveFold();
      return;
    }

    anime.timeline({
      easing: 'easeOutExpo',
      complete() {
        window.dispatchEvent(new Event('hero:entranceComplete'));
        revealAboveFold();
      }
    })
      .add({ targets: '#heroLogo', opacity: [0, 1], scale: [0.75, 1], duration: 950 })
      .add({ targets: '#heroEyebrow', opacity: [0, 1], translateY: [16, 0], duration: 650 }, '-=520')
      .add({ targets: '#heroHeadline', opacity: [0, 1], translateY: [28, 0], duration: 780 }, '-=520')
      .add({ targets: '#heroSub', opacity: [0, 1], translateY: [18, 0], duration: 650 }, '-=520')
        .add({ targets: '#heroCtaRow', opacity: [0, 1], translateY: [16, 0], duration: 600 }, '-=480');
  }

  function revealAboveFold() {
    qsa('[data-reveal]').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        revealElement(el);
      }
    });
  }

  function revealElement(el) {
    if (!el || el.dataset.revealed === 'true') return;
    el.dataset.revealed = 'true';
    runAnime({
      targets: el,
      opacity: [0, 1],
      translateY: [28, 0],
      duration: 760,
      easing: 'easeOutExpo'
    });

    if (el.classList.contains('metric-strip')) {
      runAnime({
        targets: qsa('.metric-item', el),
        opacity: [0, 1],
        translateY: [18, 0],
        scale: [0.96, 1],
        delay: window.anime && window.anime.stagger ? window.anime.stagger(90) : 0,
        duration: 620,
        easing: 'easeOutExpo'
      });
    }

    if (el.hasAttribute('data-company-stats')) {
      runAnime({
        targets: qsa('.company-stat', el),
        opacity: [0, 1],
        translateY: [34, 0],
        delay: window.anime && window.anime.stagger ? window.anime.stagger(120) : 0,
        duration: 760,
        easing: 'easeOutExpo'
      });

      runAnime({
        targets: qsa('.company-stat-bar span', el),
        scaleX: [0, 1],
        delay: window.anime && window.anime.stagger ? window.anime.stagger(120, { start: 260 }) : 260,
        duration: 1100,
        easing: 'easeInOutCubic'
      });
    }

    if (el.classList.contains('values-grid')) {
      runAnime({
        targets: qsa('span', el),
        opacity: [0, 1],
        translateY: [18, 0],
        rotate: [-1.5, 0],
        delay: window.anime && window.anime.stagger ? window.anime.stagger(80) : 0,
        duration: 620,
        easing: 'easeOutExpo'
      });
    }
  }

  function initReveals() {
    const items = qsa('[data-reveal]');
    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        revealElement(entry.target);
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.18,
      rootMargin: '0px 0px -8% 0px'
    });

    items.forEach((item) => observer.observe(item));
  }

  function initCounters() {
    qsa('[data-counter]').forEach((counter) => {
      const target = parseFloat(counter.dataset.counter || '0');
      let played = false;

      const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting) || played) return;
        played = true;
        observer.disconnect();

        const fmt = (n) => Math.round(n).toLocaleString('en-US');

        if (!window.anime || reduceMotion()) {
          counter.textContent = fmt(target);
          return;
        }

        anime({
          targets: { value: 0 },
          value: target,
          duration: 1700,
          easing: 'easeOutCubic',
          update(anim) {
            counter.textContent = fmt(anim.animatables[0].target.value);
          }
        });
      }, { threshold: 0.35 });

      observer.observe(counter);
    });
  }

  function initCompanyMarquee() {
    const marquee = qs('.company-marquee');
    if (!marquee || !window.anime || reduceMotion()) return;

    anime({
      targets: marquee,
      translateX: ['0%', '-50%'],
      duration: 24000,
      easing: 'linear',
      loop: true
    });
  }

  function initServiceCarousel() {
    const carousel = qs('[data-service-carousel]');
    if (!carousel) return;

    const track = qs('[data-carousel-track]', carousel);
    const viewport = qs('[data-carousel-viewport]', carousel);
    const prev = qs('[data-carousel-prev]', carousel);
    const next = qs('[data-carousel-next]', carousel);
    if (!track || !viewport || !prev || !next) return;

    const autoDelay = 6200;
    let index = 0;
    let autoTimer = null;
    let isDragging = false;
    let dragStartX = 0;

    track.innerHTML = SERVICE_CAROUSEL.map((item) => {
      const imagePath = `imgs/${Number(item.number)}.png`;
      return `
      <article class="service-carousel-card" data-service-card tabindex="0" aria-label="${item.number}. ${item.title}">
        <div class="service-card-media">
          <img src="${imagePath}" alt="${item.title}" loading="lazy">
        </div>
        <div class="service-card-content">
          <h3>${item.title}</h3>
          <p>${item.text}</p>
        </div>
      </article>
    `;
    }).join('');

    viewport.setAttribute('tabindex', '0');

    function getCards() {
      return qsa('.service-carousel-card', track);
    }

    function getTargetOffset(cards) {
      const active = cards[index];
      if (!active) return 0;
      const last = cards[cards.length - 1];
      const centeredOffset = active.offsetLeft - ((viewport.clientWidth - active.offsetWidth) / 2);
      const maxOffset = last
        ? Math.max(0, last.offsetLeft + last.offsetWidth - viewport.clientWidth)
        : 0;
      return Math.max(0, Math.min(centeredOffset, maxOffset));
    }

    function updateActiveState() {
      const cards = qsa('.service-carousel-card', track);
      const active = cards[index];
      if (!active) return;

      cards.forEach((card, cardIndex) => {
        const dist = Math.abs(cardIndex - index);
        card.classList.toggle('is-active', dist === 0);
        card.classList.toggle('is-side', dist === 1);
        card.classList.toggle('is-far', dist >= 2);
        card.setAttribute('aria-selected', String(dist === 0));
      });
    }

    function moveTrack() {
      const cards = getCards();
      const offset = getTargetOffset(cards);

      if (!window.anime || reduceMotion()) {
        track.style.transform = `translate3d(${-offset}px, 0, 0)`;
        return;
      }

      anime.remove(track);
      anime({
        targets: track,
        translateX: -offset,
        duration: 760,
        easing: 'easeInOutCubic'
      });
    }

    function moveTo(nextIndex, fromManualAction) {
      index = (nextIndex + SERVICE_CAROUSEL.length) % SERVICE_CAROUSEL.length;

      updateActiveState();
      moveTrack();
      if (fromManualAction) restartAuto();
    }

    function restartAuto() {
      if (autoTimer) window.clearTimeout(autoTimer);
      autoTimer = window.setTimeout(() => {
        moveTo(index + 1, false);
        restartAuto();
      }, autoDelay);
    }

    prev.addEventListener('click', () => moveTo(index - 1, true));
    next.addEventListener('click', () => moveTo(index + 1, true));

    getCards().forEach((card, cardIndex) => {
      card.addEventListener('click', () => moveTo(cardIndex, true));
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          moveTo(cardIndex, true);
        }
      });
    });

    viewport.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        moveTo(index - 1, true);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        moveTo(index + 1, true);
      }
    });

    viewport.addEventListener('pointerdown', (event) => {
      isDragging = true;
      dragStartX = event.clientX;
      viewport.classList.add('is-dragging');
      if (autoTimer) window.clearTimeout(autoTimer);
    });

    viewport.addEventListener('pointerup', (event) => {
      if (!isDragging) return;
      isDragging = false;
      viewport.classList.remove('is-dragging');
      const delta = event.clientX - dragStartX;
      if (Math.abs(delta) > 44) moveTo(index + (delta < 0 ? 1 : -1), true);
      else restartAuto();
    });

    viewport.addEventListener('pointerleave', () => {
      if (!isDragging) return;
      isDragging = false;
      viewport.classList.remove('is-dragging');
      restartAuto();
    });

    window.addEventListener('resize', () => moveTrack());

    moveTo(0, false);
    restartAuto();
  }

  function initProjectMasks() {
    qsa('.project-card').forEach((card, index) => {
      const mask = qs('.project-reveal', card);
      if (!mask) return;

      const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        runAnime({
          targets: mask,
          scaleX: [1, 0],
          duration: 900,
          delay: index * 90,
          easing: 'easeInOutQuart'
        });
      }, { threshold: 0.28 });

      observer.observe(card);
    });
  }

  function initRings() {
    const section = qs('.cta-section');
    const rings = qsa('.cta-ring');
    if (!section || !rings.length) return;

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      runAnime({
        targets: rings,
        scale: [0.4, 1],
        opacity: [0, 1],
        delay: window.anime && window.anime.stagger ? window.anime.stagger(140) : 0,
        duration: 1100,
        easing: 'easeOutExpo'
      });
    }, { threshold: 0.25 });

    observer.observe(section);
  }

  function initParallax() {
    const medias = qsa('[data-parallax] img');
    if (!medias.length || reduceMotion()) return;

    let ticking = false;
    const update = () => {
      const vh = window.innerHeight || 1;
      medias.forEach((img) => {
        const rect = img.parentElement.getBoundingClientRect();
        if (rect.bottom < -120 || rect.top > vh + 120) return;
        const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
        const y = Math.max(-32, Math.min(32, progress * -42));
        img.style.transform = `translateY(${y}px) scale(1.08)`;
      });
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    window.addEventListener('resize', update, { passive: true });
    update();
  }

  function initNavScroll() {
    qsa('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        const href = link.getAttribute('href');
        const target = href ? qs(href) : null;
        if (!target) return;

        event.preventDefault();

        if (link.hasAttribute('data-hero-home')) {
          window.dispatchEvent(new Event('hero:resetRequested'));
        }

        const start = window.scrollY;
        const header = qs('#header');
        const headerOffset = link.hasAttribute('data-hero-home') ? 0 : ((header?.offsetHeight || 0) + 16);
        const end = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerOffset);
        const state = { y: start };

        if (!window.anime || reduceMotion()) {
          window.scrollTo(0, end);
          return;
        }

        anime.remove(state);
        anime({
          targets: state,
          y: end,
          duration: 900,
          easing: 'easeInOutCubic',
          update() {
            window.scrollTo(0, state.y);
          }
        });
      });
    });
  }

  function initInteractiveCards() {
    if (isTouch() || reduceMotion()) return;

    qsa('.standard-card, .service-detail-card, .portfolio-card, .metric-item, .company-stat, .values-grid span').forEach((card) => {
      card.addEventListener('mouseenter', () => {
        runAnime({
          targets: card,
          translateY: -6,
          scale: 1.015,
          duration: 260,
          easing: 'easeOutExpo'
        });
      });

      card.addEventListener('mouseleave', () => {
        runAnime({
          targets: card,
          translateY: 0,
          scale: 1,
          duration: 360,
          easing: 'easeOutExpo'
        });
      });
    });
  }

  function initNavToggle() {
    const toggle = qs('.nav-toggle');
    const header = qs('#header');
    if (!toggle || !header) return;

    const open = () => {
      header.classList.add('nav-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Cerrar menú');
      document.body.style.overflow = 'hidden';
    };

    const close = () => {
      header.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
      document.body.style.overflow = '';
    };

    toggle.addEventListener('click', () => {
      header.classList.contains('nav-open') ? close() : open();
    });

    qs('#main-nav')?.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', close);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && header.classList.contains('nav-open')) close();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 820) close();
    });
  }

  function boot() {
    initServiceCarousel();
    initScrollProgress();
    initHeader();
    initNavToggle();
    initCompanyMarquee();
    initReveals();
    initCounters();
    initProjectMasks();
    initRings();
    initParallax();
    initNavScroll();
    initInteractiveCards();
    initPreloader();
  }

  document.addEventListener('DOMContentLoaded', boot);
}());
