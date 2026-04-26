/* ============================================================
   Hello Dyslexia — Landing Page Scripts
   ============================================================ */

(function () {
  'use strict';

  /* ── Nav: scroll background ─────────────────────────────── */
  const nav = document.getElementById('nav');

  // Reveal the pill background once the user scrolls past the first
  // section (typically the landing hero). Falls back to a small offset
  // on pages that don't have a hero so the nav still gets a backdrop.
  const firstSection = document.querySelector('.landing-hero, main > section:first-of-type, body > section:first-of-type');
  const reassuranceSection = document.querySelector('.reassurance');
  const howItWorks = document.querySelector('.how-it-works');
  const toolsStrip = document.querySelector('.tools-strip');
  const howItWorksSteps = howItWorks ? howItWorks.querySelectorAll('.how-it-works__step') : [];
  var heroBlobShiftTarget = 0;
  var heroBlobShiftCurrent = 0;
  var heroBlobRafId = null;
  var prefersReducedMotion = typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getScrollThreshold() {
    if (firstSection) {
      // Trigger slightly before the section ends so the pill is in
      // place by the time the next section's content arrives.
      return firstSection.offsetTop + firstSection.offsetHeight - 80;
    }
    return 32;
  }

  function updateHeroBlobShift() {
    if (!firstSection || !firstSection.classList.contains('landing-hero')) return;

    // Piecewise scroll map: most vertical travel happens while the user moves
    // from “late hero” into and through the reassurance row, so blobs read as
    // continuing into the second section instead of stalling there.
    var isMobile = window.matchMedia('(max-width: 860px)').matches;
    // Total vertical shift (px) at full scroll — keep modest so hero blobs stay calm
    var maxTravel = isMobile ? 96 : 168;
    var sy = window.scrollY;
    var vh = window.innerHeight;
    var progress;

    if (reassuranceSection) {
      var rTop = reassuranceSection.offsetTop;
      var rBot = rTop + reassuranceSection.offsetHeight;
      // Start ramping blob travel before the reassurance block hits the viewport
      // so motion is already underway as the second section appears.
      var rampStart = Math.max(48, rTop - vh * 0.42);
      // Finish most travel shortly after the bar scrolls past (short tail).
      var rampEnd = rBot + vh * 0.14;

      if (sy <= rampStart) {
        progress = rampStart > 8 ? sy / rampStart * 0.22 : 0;
      } else if (sy >= rampEnd) {
        progress = 1;
      } else {
        progress = 0.22 + ((sy - rampStart) / Math.max(rampEnd - rampStart, 1)) * 0.78;
      }
    } else if (howItWorks) {
      var zoneEnd = howItWorks.offsetTop + howItWorks.offsetHeight * 0.35;
      zoneEnd = Math.max(zoneEnd, 420);
      progress = Math.min(Math.max(sy / zoneEnd, 0), 1);
    } else {
      var fallbackEnd = Math.max(firstSection.offsetHeight * 1.15, 560);
      progress = Math.min(Math.max(sy / fallbackEnd, 0), 1);
    }

    progress = Math.min(Math.max(progress, 0), 1);
    // Light ease-out on the combined curve (piecewise is already front-loaded).
    var eased = 1 - Math.pow(1 - progress, 1.55);
    heroBlobShiftTarget = eased * maxTravel;

    if (prefersReducedMotion) {
      heroBlobShiftCurrent = heroBlobShiftTarget;
      firstSection.style.setProperty('--hero-blob-shift-y', heroBlobShiftCurrent.toFixed(2) + 'px');
      return;
    }

    scheduleHeroBlobRaf();
  }

  function scheduleHeroBlobRaf() {
    if (heroBlobRafId != null) return;
    heroBlobRafId = window.requestAnimationFrame(function heroBlobTick() {
      heroBlobRafId = null;
      var diff = heroBlobShiftTarget - heroBlobShiftCurrent;
      if (Math.abs(diff) < 0.08) {
        heroBlobShiftCurrent = heroBlobShiftTarget;
      } else {
        heroBlobShiftCurrent += diff * 0.24;
        scheduleHeroBlobRaf();
      }
      firstSection.style.setProperty('--hero-blob-shift-y', heroBlobShiftCurrent.toFixed(2) + 'px');
    });
  }

  function updateHowItWorksTimeline() {
    if (!howItWorks) return;

    var isMobile = window.matchMedia('(max-width: 860px)').matches;
    if (isMobile) {
      var vh = window.innerHeight;
      var sectionRect = howItWorks.getBoundingClientRect();
      var sectionProgress = Math.min(Math.max((vh - sectionRect.top) / (vh + sectionRect.height), 0), 1);
      var mobileEasedProgress = 1 - Math.pow(1 - sectionProgress, 2);

      howItWorks.style.setProperty('--timeline-progress', sectionProgress.toFixed(3));
      howItWorks.style.setProperty('--timeline-shift-x', '0px');
      howItWorks.style.setProperty('--timeline-blob-left-x', (-sectionProgress * 8).toFixed(1) + 'px');
      howItWorks.style.setProperty('--timeline-blob-right-x', (sectionProgress * 8).toFixed(1) + 'px');
      howItWorks.style.setProperty('--timeline-decor-shift-y', (mobileEasedProgress * 5).toFixed(1) + 'px');
      howItWorks.style.setProperty('--timeline-content-shift-y', '0px');
      howItWorks.style.setProperty('--timeline-opacity', '1');

      howItWorksSteps.forEach(function (step) {
        var rect = step.getBoundingClientRect();
        var midpoint = rect.top + (rect.height * 0.45);
        step.classList.toggle('is-active', midpoint < vh * 0.82);
      });
      return;
    }

    var sectionTop = howItWorks.offsetTop;
    var sectionHeight = howItWorks.offsetHeight;
    var sticky = howItWorks.querySelector('.how-it-works__sticky');
    var stickyHeight = sticky ? sticky.offsetHeight : 280;
    var navHeight = nav ? nav.offsetHeight : 64;
    // Matches the CSS `top` value for the sticky element (nav + 240px).
    // A larger offset means the cards engage and begin animating sooner
    // in the scroll, while still leaving room above the nav.
    var stickyTopOffset = navHeight + 240;

    // Animate exactly while the cards are pinned on screen: start the
    // moment the sticky element locks, finish before it releases.
    var pinStart = sectionTop - stickyTopOffset;
    var pinDuration = Math.max(sectionHeight - stickyHeight - stickyTopOffset, 1);
    var progress = Math.min(Math.max((window.scrollY - pinStart) / pinDuration, 0), 1);

    var maxShift = window.innerWidth >= 1180 ? 72 : 48;
    var shift = maxShift - (progress * maxShift * 2);
    // Hit each step early so the third card is illuminated well before
    // the sticky releases, leaving a beat for the user to see all three.
    var activeThresholds = [0.0, 0.28, 0.58];

    // Keep the pinned cards moving subtly without collapsing the gap before
    // the following tools section.
    var easedProgress = 1 - Math.pow(1 - progress, 2.4);
    var contentDrift = isMobile ? easedProgress * 10 : easedProgress * 22;
    var timelineOpacity = 1;
    if (!isMobile && toolsStrip) {
      // Fade against the next section: keep the timeline and cards at full
      // opacity until the tools strip is much closer, then ease out quickly.
      var toolsTop = toolsStrip.offsetTop;
      var viewportHeight = window.innerHeight;
      var fadeStart = toolsTop - viewportHeight * 0.76;
      // Same fade-in point as before; shorter scroll span so opacity drops faster.
      var fadeMid = toolsTop - viewportHeight * 0.56;
      var fadeEnd = toolsTop - viewportHeight * 0.31;
      var smoothProgress;

      if (window.scrollY <= fadeStart) {
        timelineOpacity = 1;
      } else if (window.scrollY <= fadeMid) {
        smoothProgress = (window.scrollY - fadeStart) / Math.max(fadeMid - fadeStart, 1);
        smoothProgress = smoothProgress * smoothProgress * (3 - (2 * smoothProgress));
        timelineOpacity = 1 - (smoothProgress * 0.5);
      } else if (window.scrollY <= fadeEnd) {
        smoothProgress = (window.scrollY - fadeMid) / Math.max(fadeEnd - fadeMid, 1);
        smoothProgress = smoothProgress * smoothProgress * (3 - (2 * smoothProgress));
        timelineOpacity = 0.5 - (smoothProgress * 0.5);
      } else {
        timelineOpacity = 0;
      }
    }

    howItWorks.style.setProperty('--timeline-progress', progress.toFixed(3));
    howItWorks.style.setProperty('--timeline-shift-x', shift.toFixed(1) + 'px');
    // Side decor blobs: gentler horizontal nudge than the card track; vertical
    // shift is a fraction of card drift so they stay visually detached.
    var blobNudge = isMobile ? 10 : 12;
    var decorShiftY = isMobile ? easedProgress * 5 : easedProgress * 11;
    howItWorks.style.setProperty('--timeline-blob-left-x', (-progress * blobNudge).toFixed(1) + 'px');
    howItWorks.style.setProperty('--timeline-blob-right-x', (progress * blobNudge).toFixed(1) + 'px');
    howItWorks.style.setProperty('--timeline-decor-shift-y', decorShiftY.toFixed(1) + 'px');
    howItWorks.style.setProperty('--timeline-content-shift-y', contentDrift.toFixed(1) + 'px');
    howItWorks.style.setProperty('--timeline-opacity', timelineOpacity.toFixed(3));

    howItWorksSteps.forEach(function (step, i) {
      step.classList.toggle('is-active', progress >= (activeThresholds[i] || 0));
    });
  }

  function updateHomeSoftBlobs() {
    if (!document.body.classList.contains('page--home')) return;
    var b = document.body;
    var zero = function () {
      b.style.setProperty('--soft-blob-x-a', '0px');
      b.style.setProperty('--soft-blob-x-b', '0px');
      b.style.setProperty('--soft-blob-y-a', '0px');
      b.style.setProperty('--soft-blob-y-b', '0px');
      b.style.setProperty('--soft-blob-y-c', '0px');
      b.style.setProperty('--soft-blob-y-d', '0px');
    };
    if (prefersReducedMotion) {
      zero();
      return;
    }
    var sy = window.scrollY;
    var isMobile = window.matchMedia('(max-width: 860px)').matches;
    var xm = isMobile ? 0.5 : 1;
    b.style.setProperty('--soft-blob-x-a', (sy * 0.009 * xm).toFixed(2) + 'px');
    b.style.setProperty('--soft-blob-x-b', (-sy * 0.012 * xm).toFixed(2) + 'px');
    b.style.setProperty('--soft-blob-y-a', (sy * 0.016 * xm).toFixed(2) + 'px');
    b.style.setProperty('--soft-blob-y-b', (-sy * 0.013 * xm).toFixed(2) + 'px');
    b.style.setProperty('--soft-blob-y-c', (sy * 0.022 * xm).toFixed(2) + 'px');
    b.style.setProperty('--soft-blob-y-d', (-sy * 0.019 * xm).toFixed(2) + 'px');
  }

  function onScroll() {
    if (window.scrollY > getScrollThreshold()) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    updateHeroBlobShift();
    updateHowItWorksTimeline();
    updateHomeSoftBlobs();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll(); // initial check

  /* ── Mobile nav toggle ──────────────────────────────────── */
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  const overlay = document.getElementById('navOverlay');
  function openMenu() {
    toggle.classList.add('open');
    links.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    toggle.classList.remove('open');
    links.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', function () {
    if (links.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  overlay.addEventListener('click', closeMenu);

  // Close menu on link click (mobile)
  links.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* ── Smooth scroll for anchor links ─────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') {
        e.preventDefault();
        return;
      }
      try {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const offset = nav.offsetHeight + 16;
          const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      } catch (err) {
        // Ignore invalid selectors
      }
    });
  });

  /* ── Scroll-triggered fade-in ───────────────────────────── */
  const animateEls = document.querySelectorAll(
    '.understand-card, .path__step, .reassurance__item, .tool-card, .resource-card, .situation-card, .is-isnot-card, .strengths-callout, .screener-selector__card, .tab-selector__card, .faq-accordion__item, .myth-fact-card, .glossary-term, .flagged-color-card, .deeper-checklist__item'
  );

  var isParentsPage = document.body.classList.contains('page--parents') || document.body.classList.contains('page--compact');
  var animEasing = isParentsPage
    ? 'opacity 0.6s cubic-bezier(0.32, 0.72, 0, 1), transform 0.6s cubic-bezier(0.32, 0.72, 0, 1)'
    : 'opacity 0.5s ease, transform 0.5s ease';

  animateEls.forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = animEasing;
  });

  // Softer, “floating” reveal for the reassurance row (hero → second section).
  document.querySelectorAll('.reassurance .reassurance__item').forEach(function (el) {
    el.style.transform = 'translateY(16px) scale(0.988)';
    el.style.transition =
      'opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1), transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)';
  });

  function revealOnScroll() {
    var triggerBottom = window.innerHeight * 1.08;
    var vh = window.innerHeight;
    // Reassurance: same scroll-driven motion as hero + soft blobs (they move from
    // scrollY ≈ 0). Once the user scrolls, use a loose line so cards begin their
    // reveal immediately instead of waiting for a tight viewport intersection.
    var reassuranceBaseline = vh + Math.min(340, vh * 0.38);
    var reassuranceAfterScroll = vh * 2.48;
    var userHasScrolled = window.scrollY > 1;

    animateEls.forEach(function (el) {
      var top = el.getBoundingClientRect().top;
      var inReassurance = el.closest && el.closest('.reassurance');
      var trigger = inReassurance
        ? (userHasScrolled ? reassuranceAfterScroll : reassuranceBaseline)
        : triggerBottom;
      if (top < trigger) {
        el.style.opacity = '1';
        if (el.closest && el.closest('.reassurance')) {
          el.style.transform = 'translateY(0) scale(1)';
        } else {
          el.style.transform = 'translateY(0)';
        }
      }
    });
  }

  window.addEventListener('scroll', revealOnScroll, { passive: true });
  window.addEventListener('load', revealOnScroll);

  /* ── Page-load fade-in for .animate-up elements ─────────── */
  var animateUpEls = document.querySelectorAll('.animate-up');
  window.addEventListener('load', function () {
    setTimeout(function () {
      animateUpEls.forEach(function (el, i) {
        setTimeout(function () {
          el.classList.add('is-visible');
        }, i * 180);
      });
    }, 500);
  });

  /* ── Stagger delays for card groups ─────────────────────── */
  function staggerGroup(selector, delayMs) {
    document.querySelectorAll(selector).forEach(function (el, i) {
      el.style.transitionDelay = (i * delayMs) + 'ms';
    });
  }

  staggerGroup('.understand-card', 100);
  staggerGroup('.path__step', 120);
  staggerGroup('.reassurance__item', 36);
  staggerGroup('.tool-card', 55);
  staggerGroup('.resource-card', 100);

  /* ── Screener selector toggle ────────────────────────────── */
  var screenerSelector = document.getElementById('screenerSelector');
  if (screenerSelector) {
    var selectorCards = screenerSelector.querySelectorAll('.screener-selector__card');
    var detailPanels = document.querySelectorAll('.screener-detail');

    selectorCards.forEach(function (card) {
      card.addEventListener('click', function () {
        var target = card.getAttribute('data-screener');

        selectorCards.forEach(function (c) { c.classList.remove('active'); });
        card.classList.add('active');

        detailPanels.forEach(function (panel) {
          if (panel.getAttribute('data-screener') === target) {
            panel.classList.add('active');
          } else {
            panel.classList.remove('active');
          }
        });
      });
    });
  }

  /* ── Reusable tab selector (age bands, scenarios, grade bands) ── */
  function initTabSelector(containerId, cardSelector, panelSelector, dataAttr) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var cards = container.querySelectorAll(cardSelector);
    var panels = document.querySelectorAll(panelSelector);
    if (!cards.length || !panels.length) return;

    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        var target = card.getAttribute(dataAttr);
        cards.forEach(function (c) { c.classList.remove('active'); });
        card.classList.add('active');
        panels.forEach(function (panel) {
          if (panel.getAttribute(dataAttr) === target) {
            panel.classList.add('active');
          } else {
            panel.classList.remove('active');
          }
        });
      });
    });
  }

  initTabSelector('ageBandSelector', '.tab-selector__card', '.tab-panel[data-tab]', 'data-tab');
  initTabSelector('scenarioSelector', '.tab-selector__card', '.tab-panel[data-scenario]', 'data-scenario');
  initTabSelector('gradeBandSelector', '.tab-selector__card', '.tab-panel[data-grade]', 'data-grade');
  initTabSelector('pathwaySelector', '.tab-selector__card', '.tab-panel[data-pathway]', 'data-pathway');

  /* ── Glossary search filter ─────────────────────────────── */
  var glossarySearch = document.getElementById('glossarySearch');
  if (glossarySearch) {
    var glossaryTerms = document.querySelectorAll('.glossary-term');
    glossarySearch.addEventListener('input', function () {
      var q = this.value.trim().toLowerCase();
      glossaryTerms.forEach(function (term) {
        var name = (term.querySelector('.glossary-term__name') || term).textContent || '';
        var def = (term.querySelector('.glossary-term__def') || {}).textContent || '';
        var text = (name + ' ' + def).toLowerCase();
        if (!q || text.indexOf(q) !== -1) {
          term.classList.remove('glossary-term--hidden');
        } else {
          term.classList.add('glossary-term--hidden');
        }
      });
    });
  }

  /* ── FAQ accordion ──────────────────────────────────────── */
  document.querySelectorAll('.faq-accordion__item').forEach(function (item) {
    var trigger = item.querySelector('.faq-accordion__trigger');
    var body = item.querySelector('.faq-accordion__body');
    if (!trigger || !body) return;
    trigger.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-accordion__item.open').forEach(function (openItem) {
        openItem.classList.remove('open');
        var t = openItem.querySelector('.faq-accordion__trigger');
        var b = openItem.querySelector('.faq-accordion__body');
        if (t) t.setAttribute('aria-expanded', 'false');
        if (b) b.setAttribute('hidden', '');
      });
      if (!isOpen) {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        body.removeAttribute('hidden');
      }
    });
  });

  /* ── New component scroll animations ────────────────────── */
  staggerGroup('.situation-card', 100);
  staggerGroup('.screener-selector__card', 80);
  staggerGroup('.is-isnot-card', 120);
  staggerGroup('.tab-selector__card', 80);
  staggerGroup('.faq-accordion__item', 60);
  staggerGroup('.myth-fact-card', 80);
  staggerGroup('.glossary-term', 40);
  staggerGroup('.flagged-color-card', 150);
  staggerGroup('.deeper-checklist__item', 150);

})();
