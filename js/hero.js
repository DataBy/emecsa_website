/* ============================================================
   EMECSA — Hero scroll-driven image sequence
   Depends on: Anime.js (loaded before this script)
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     CONFIG
     ============================================================ */
  var FRAME_DIR       = 'svg_animation/';
  var FRAME_PREFIX    = 'ezgif-frame-';
  var FRAME_EXTENSION = '.jpg';
  var TOTAL_FRAMES    = 240;
  var FRAME_END_PROGRESS = 0.88;
  var SERVICES_REVIEW_START = 0.88;

  /*
   * Service segments — each defines when a card is visible.
   * inStart→inEnd  : Anime.js fade-in fires when progress crosses inStart
   * outStart→outEnd: Anime.js fade-out fires when progress crosses outStart
   *
   * Visible peak ranges align with spec:
   *   0.32–0.44 | 0.48–0.60 | 0.64–0.76 | 0.80–0.92
   */
  var SEGMENTS = [
    { inStart: 0.32,  inEnd: 0.38, outStart: 0.44, outEnd: 0.50 },
    { inStart: 0.48,  inEnd: 0.54, outStart: 0.60, outEnd: 0.66 },
    { inStart: 0.64,  inEnd: 0.70, outStart: 0.76, outEnd: 0.82 },
    { inStart: 0.80,  inEnd: 0.86, outStart: 0.92, outEnd: 0.98 },
  ];

  var CARD_MOTION = [
    { x: 34,  y: 18 },
    { x: -34, y: -18 },
    { x: 34,  y: -18 },
    { x: -34, y: 18 },
  ];

  /* ============================================================
     STATE
     ============================================================ */
  var frames       = new Array(TOTAL_FRAMES).fill(null);
  var loadedCount  = 0;
  var currentFrame = -1;
  var heroIntroComplete = false;

  /* Per-card visibility — tracks whether Anime.js last animated it in */
  var cardVisible  = [false, false, false, false];
  var servicesReviewRequested = false;
  var servicesReviewActive = false;

  /* ============================================================
     DOM REFS — populated in init()
     ============================================================ */
  var wrapper, hero, canvas, ctx;
  var heroContent, heroOfferTitle, heroScrollCue, seqFill;

  /* ============================================================
     IMAGE LOADING
     ============================================================ */
  function padNum(n) {
    return ('00' + n).slice(-3);
  }

  function loadFrames() {
    for (var i = 0; i < TOTAL_FRAMES; i++) {
      (function (idx) {
        var img  = new Image();
        img.onload = function () {
          frames[idx] = img;
          loadedCount++;
          /* Draw the very first frame as soon as it's ready */
          if (idx === 0) {
            resizeCanvas();
            drawFrame(0);
          }
        };
        img.onerror = function () { loadedCount++; };
        img.src = FRAME_DIR + FRAME_PREFIX + padNum(idx + 1) + FRAME_EXTENSION;
      }(i));
    }
  }

  /* ============================================================
     CANVAS — cover-fit rendering (like background-size: cover)
     ============================================================ */
  function resizeCanvas() {
    var dpr   = window.devicePixelRatio || 1;
    canvas.width  = canvas.offsetWidth  * dpr;
    canvas.height = canvas.offsetHeight * dpr;
  }

  function drawFrame(index) {
    /* If the requested frame isn't loaded yet, walk outward to find nearest */
    if (!frames[index]) {
      for (var d = 1; d < TOTAL_FRAMES; d++) {
        var lo = index - d, hi = index + d;
        if (lo >= 0 && frames[lo]) { drawFrame(lo); return; }
        if (hi < TOTAL_FRAMES && frames[hi]) { drawFrame(hi); return; }
      }
      return; /* nothing loaded yet */
    }

    var img = frames[index];
    var CW  = canvas.width;
    var CH  = canvas.height;
    var iR  = img.naturalWidth  / img.naturalHeight;
    var cR  = CW / CH;

    var dw, dh, dx, dy;
    if (iR > cR) { dh = CH; dw = CH * iR; }
    else          { dw = CW; dh = CW / iR; }
    dx = (CW - dw) / 2;
    dy = (CH - dh) / 2;

    ctx.clearRect(0, 0, CW, CH);
    ctx.drawImage(img, Math.round(dx), Math.round(dy), Math.round(dw), Math.round(dh));
  }

  /* ============================================================
     SCROLL PROGRESS  (0 → 1 through the wrapper)
     ============================================================ */
  function getProgress() {
    var rect  = wrapper.getBoundingClientRect();
    var total = rect.height - window.innerHeight;
    if (total <= 0) return 0;
    return Math.max(0, Math.min(1, -rect.top / total));
  }

  function updatePinState() {
    if (!wrapper || !hero) return;

    var rect = wrapper.getBoundingClientRect();
    var withinRunway = rect.top <= 0 && rect.bottom > window.innerHeight;
    var completed = rect.bottom <= window.innerHeight;

    hero.classList.toggle('hero-fixed', withinRunway);
    hero.classList.toggle('hero-complete', completed);
  }

  function clamp01(v) {
    return Math.max(0, Math.min(1, v));
  }

  function smoothstep(v) {
    v = clamp01(v);
    return v * v * (3 - 2 * v);
  }

  /* ============================================================
     HERO CONTENT — direct style update (no Anime.js — pure scrub)
     ============================================================ */
  function updateHeroContent(p) {
    var FADE_END = 0.07;
    var opacity, ty;

    if (p <= 0) {
      opacity = 1; ty = 0;
    } else if (p >= FADE_END) {
      opacity = 0; ty = -28;
    } else {
      var t = p / FADE_END;
      opacity = 1 - t;
      ty      = -28 * t;
    }

    heroContent.style.opacity   = opacity;
    heroContent.style.transform = 'translateY(' + ty + 'px)';

    /* Scroll cue vanishes quickly */
    if (heroScrollCue) {
      heroScrollCue.style.opacity = Math.max(0, 1 - p * 18);
    }
  }

  function updateOfferTitle(p) {
    if (!heroOfferTitle) return;

    var inT = smoothstep((p - 0.09) / 0.055);
    var outT = smoothstep((p - 0.255) / 0.055);
    var visible = Math.max(0, inT - outT);
    var popScale = 0.72 + (0.34 * inT) - (0.08 * outT);
    var y = -50 - (outT * 10);

    heroOfferTitle.style.opacity = visible;
    heroOfferTitle.style.transform =
      'translate(-50%, ' + y + '%) scale(' + popScale + ')';
  }

  /* ============================================================
     SERVICE CARDS — Anime.js triggered on threshold crossings
     ============================================================ */
  function showCard(idx) {
    var el = document.getElementById('hsvc-' + idx);
    if (!el) return;
    var motion = CARD_MOTION[idx] || { x: 0, y: 24 };
    var currentOpacity = parseFloat(getComputedStyle(el).opacity);
    anime.remove(el);
    el.style.pointerEvents = 'auto';
    anime({
      targets:    el,
      opacity:    [isNaN(currentOpacity) ? 0 : currentOpacity, 1],
      translateX: [motion.x, 0],
      translateY: [motion.y, 0],
      easing:     'easeOutExpo',
      duration:   640,
    });
  }

  function hideCard(idx, dir) {
    var el = document.getElementById('hsvc-' + idx);
    if (!el) return;
    var motion = CARD_MOTION[idx] || { x: 0, y: 18 };
    var currentOpacity = parseFloat(getComputedStyle(el).opacity);
    anime.remove(el);
    anime({
      targets:    el,
      opacity:    [isNaN(currentOpacity) ? 1 : currentOpacity, 0],
      translateX: [0, motion.x * 0.55],
      translateY: [0, dir === 'up' ? -Math.abs(motion.y) : Math.abs(motion.y)],
      easing:     'easeInExpo',
      duration:   480,
      complete: function () {
        el.style.pointerEvents = 'none';
      },
    });
  }

  function showAllCardsImmediately() {
    if (hero) {
      hero.classList.add('services-review');
    }

    servicesReviewRequested = true;
    servicesReviewActive = true;

    for (var i = 0; i < cardVisible.length; i++) {
      var el = document.getElementById('hsvc-' + i);
      if (!el) continue;

      anime.remove(el);
      cardVisible[i] = true;
      el.style.opacity = '1';
      el.style.transform = 'translateX(0) translateY(0)';
      el.style.pointerEvents = 'auto';
    }
  }

  function resetHeroState() {
    servicesReviewRequested = false;
    servicesReviewActive = false;
    currentFrame = -1;

    if (hero) {
      hero.classList.remove('services-review');
    }

    for (var i = 0; i < cardVisible.length; i++) {
      var el = document.getElementById('hsvc-' + i);
      cardVisible[i] = false;
      if (!el) continue;

      anime.remove(el);
      el.style.opacity = '0';
      el.style.transform = 'translateX(0) translateY(18px)';
      el.style.pointerEvents = 'none';
    }

    if (heroOfferTitle) {
      heroOfferTitle.style.opacity = '0';
    }

    if (seqFill) {
      seqFill.style.transform = 'scaleX(0)';
    }

    drawFrame(0);
  }

  function updateServiceCards(p) {
    if (p < 0.04 && servicesReviewRequested) {
      servicesReviewRequested = false;
      servicesReviewActive = false;
      if (hero) {
        hero.classList.remove('services-review');
      }
    }

    var reviewRange = servicesReviewRequested && p >= SERVICES_REVIEW_START;

    if (hero && reviewRange !== servicesReviewActive) {
      servicesReviewActive = reviewRange;
      hero.classList.toggle('services-review', reviewRange);
    }

    for (var i = 0; i < SEGMENTS.length; i++) {
      var seg       = SEGMENTS[i];
      var inRange   = reviewRange || (p >= seg.inStart && p <= seg.outEnd);

      if (inRange && !cardVisible[i]) {
        cardVisible[i] = true;
        showCard(i);
      } else if (!inRange && cardVisible[i]) {
        cardVisible[i] = false;
        /* Up = scrolling forward past outEnd; down = scrolling back past inStart */
        hideCard(i, p > seg.outEnd ? 'up' : 'down');
      }
    }
  }

  /* ============================================================
     UI — sequence progress bar
     ============================================================ */
  function updateUI(p) {
    if (seqFill) {
      seqFill.style.transform = 'scaleX(' + p + ')';
    }
  }

  /* ============================================================
     MAIN rAF TICK
     ============================================================ */
  function tick() {
    updatePinState();

    var p  = getProgress();
    var frameProgress = clamp01(p / FRAME_END_PROGRESS);
    var fi = Math.min(TOTAL_FRAMES - 1, Math.floor(frameProgress * TOTAL_FRAMES));

    /* Only re-draw canvas when frame index actually changes */
    if (fi !== currentFrame) {
      currentFrame = fi;
      drawFrame(fi);
    }

    if (heroIntroComplete || p > 0.001) {
      updateHeroContent(p);
    }
    updateOfferTitle(p);
    updateServiceCards(p);
    updateUI(frameProgress);

    requestAnimationFrame(tick);
  }

  /* ============================================================
     RESIZE
     ============================================================ */
  function onResize() {
    resizeCanvas();
    if (currentFrame >= 0) drawFrame(currentFrame);
  }

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    wrapper      = document.getElementById('heroSequenceWrapper');
    hero         = document.getElementById('hero');
    canvas       = document.getElementById('seqCanvas');
    heroContent  = document.getElementById('heroContent');
    heroOfferTitle = document.getElementById('heroOfferTitle');
    heroScrollCue= document.getElementById('heroScrollCue');
    seqFill      = document.getElementById('seqProgressFill');

    if (!wrapper || !canvas) return;

    ctx = canvas.getContext('2d');

    resizeCanvas();
    loadFrames();

    window.addEventListener('resize', onResize);
    window.addEventListener('hero:servicesReviewRequested', function () {
      showAllCardsImmediately();
    });
    window.addEventListener('hero:resetRequested', resetHeroState);
    window.addEventListener('hero:scrollReady', function () {
      onResize();
    });

    window.addEventListener('hero:entranceComplete', function () {
      heroIntroComplete = true;
      onResize();
    });

    requestAnimationFrame(tick);
  }

  document.addEventListener('DOMContentLoaded', init);

}());
