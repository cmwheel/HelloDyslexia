/* ============================================================
   Hello Dyslexia — Landing Page Scripts
   ============================================================ */

(function () {
  'use strict';

  var isMobile = window.matchMedia('(max-width: 960px)').matches;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Nav: scroll background ─────────────────────────────── */
  var nav = document.getElementById('nav');
  var lastScrollY = window.scrollY;
  var scrollTicking = false;

  function onScroll() {
    if (window.scrollY > 32) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    if (isMobile) {
      handleAutoHideNav();
      handleStickyCtaVisibility();
    }
  }

  /* ── Auto-hiding nav on mobile scroll ──────────────────── */
  var navHideThreshold = 80;

  function handleAutoHideNav() {
    var currentY = window.scrollY;
    var toggle = document.getElementById('navToggle');
    var menuOpen = toggle && toggle.classList.contains('open');

    if (menuOpen) {
      nav.classList.remove('nav--hidden');
      lastScrollY = currentY;
      return;
    }

    if (currentY > lastScrollY && currentY > navHideThreshold) {
      nav.classList.add('nav--hidden');
    } else if (currentY < lastScrollY) {
      nav.classList.remove('nav--hidden');
    }

    lastScrollY = currentY;
  }

  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      requestAnimationFrame(function () {
        onScroll();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });
  onScroll();

  /* ── Mobile nav toggle ──────────────────────────────────── */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  var overlay = document.getElementById('navOverlay');

  function openMenu() {
    toggle.classList.add('open');
    links.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    nav.classList.remove('nav--hidden');
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

  links.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* ── Swipe-to-close nav drawer ─────────────────────────── */
  var swipeStartX = 0;
  var swipeCurrentX = 0;
  var isSwiping = false;

  links.addEventListener('touchstart', function (e) {
    swipeStartX = e.touches[0].clientX;
    isSwiping = true;
  }, { passive: true });

  links.addEventListener('touchmove', function (e) {
    if (!isSwiping) return;
    swipeCurrentX = e.touches[0].clientX;
    var diff = swipeCurrentX - swipeStartX;
    if (diff > 0) {
      links.style.transform = 'translateX(' + diff + 'px)';
      links.style.transition = 'none';
    }
  }, { passive: true });

  links.addEventListener('touchend', function () {
    if (!isSwiping) return;
    isSwiping = false;
    var diff = swipeCurrentX - swipeStartX;
    links.style.transition = '';
    links.style.transform = '';

    if (diff > 80) {
      closeMenu();
    }
    swipeStartX = 0;
    swipeCurrentX = 0;
  }, { passive: true });

  /* ── Nav dropdown toggle ──────────────────────────────── */
  document.querySelectorAll('.nav__dropdown-trigger').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();

      if (isMobile) {
        e.preventDefault();
        openBottomSheet();
        return;
      }

      var dropdown = btn.closest('.nav__dropdown');
      var isOpen = dropdown.classList.contains('open');

      document.querySelectorAll('.nav__dropdown.open').forEach(function (d) {
        d.classList.remove('open');
        d.querySelector('.nav__dropdown-trigger').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        dropdown.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.addEventListener('click', function () {
    document.querySelectorAll('.nav__dropdown.open').forEach(function (d) {
      d.classList.remove('open');
      d.querySelector('.nav__dropdown-trigger').setAttribute('aria-expanded', 'false');
    });
  });

  /* ── Bottom sheet for "I'm a..." ───────────────────────── */
  var bottomSheet = document.getElementById('bottomSheet');
  var bottomSheetOverlay = document.getElementById('bottomSheetOverlay');
  var sheetSwipeStartY = 0;
  var sheetSwipeCurrentY = 0;
  var isSheetSwiping = false;

  function openBottomSheet() {
    if (!bottomSheet) return;
    closeMenu();
    bottomSheetOverlay.style.display = 'block';
    bottomSheet.style.display = 'block';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        bottomSheetOverlay.classList.add('open');
        bottomSheet.classList.add('open');
      });
    });
    document.body.style.overflow = 'hidden';
  }

  function closeBottomSheet() {
    if (!bottomSheet) return;
    bottomSheet.classList.remove('open');
    bottomSheetOverlay.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(function () {
      bottomSheet.style.display = '';
      bottomSheetOverlay.style.display = '';
    }, 400);
  }

  if (bottomSheetOverlay) {
    bottomSheetOverlay.addEventListener('click', closeBottomSheet);
  }

  if (bottomSheet) {
    bottomSheet.addEventListener('touchstart', function (e) {
      sheetSwipeStartY = e.touches[0].clientY;
      isSheetSwiping = true;
    }, { passive: true });

    bottomSheet.addEventListener('touchmove', function (e) {
      if (!isSheetSwiping) return;
      sheetSwipeCurrentY = e.touches[0].clientY;
      var diff = sheetSwipeCurrentY - sheetSwipeStartY;
      if (diff > 0) {
        bottomSheet.style.transform = 'translateY(' + diff + 'px)';
        bottomSheet.style.transition = 'none';
      }
    }, { passive: true });

    bottomSheet.addEventListener('touchend', function () {
      if (!isSheetSwiping) return;
      isSheetSwiping = false;
      var diff = sheetSwipeCurrentY - sheetSwipeStartY;
      bottomSheet.style.transition = '';
      bottomSheet.style.transform = '';

      if (diff > 100) {
        closeBottomSheet();
      } else {
        bottomSheet.classList.add('open');
      }
      sheetSwipeStartY = 0;
      sheetSwipeCurrentY = 0;
    }, { passive: true });
  }

  /* ── Smooth scroll for anchor links ─────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') {
        e.preventDefault();
        return;
      }
      try {
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          var offset = nav.offsetHeight + 16;
          var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      } catch (err) {
        // Ignore invalid selectors
      }
    });
  });

  /* ── Scroll-triggered fade-in ───────────────────────────── */
  if (!prefersReducedMotion) {
    var revealDistance = isMobile ? 16 : 24;
    var revealDuration = isMobile ? '0.35s' : '0.5s';

    var animateEls = document.querySelectorAll(
      '.understand-card, .path__step, .impact-banner__stat, .reassurance__item, .assessment-banner, .resource-card, .specialist-banner, .entry-card, .strength-item, .situation-card, .is-isnot-card, .strengths-callout, .screener-selector__card, .tab-selector__card, .faq-accordion__item, .myth-fact-card, .glossary-term, .flagged-color-card, .deeper-checklist__item'
    );

    animateEls.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(' + revealDistance + 'px)';
      el.style.transition = 'opacity ' + revealDuration + ' ease, transform ' + revealDuration + ' ease';
    });

    function revealOnScroll() {
      var triggerBottom = window.innerHeight * 1.08;

      animateEls.forEach(function (el) {
        var top = el.getBoundingClientRect().top;
        if (top < triggerBottom) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }
      });
    }

    window.addEventListener('scroll', revealOnScroll, { passive: true });
    window.addEventListener('load', revealOnScroll);
  }

  /* ── Page-load fade-in for .animate-up elements ─────────── */
  var animateUpEls = document.querySelectorAll('.animate-up');
  if (!prefersReducedMotion) {
    window.addEventListener('load', function () {
      setTimeout(function () {
        animateUpEls.forEach(function (el, i) {
          setTimeout(function () {
            el.classList.add('is-visible');
          }, i * 180);
        });
      }, 500);
    });
  } else {
    animateUpEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ── Stagger delays for card groups ─────────────────────── */
  function staggerGroup(selector, delayMs) {
    if (prefersReducedMotion) return;
    var mobileDelayMs = Math.round(delayMs * 0.7);
    var actualDelay = isMobile ? mobileDelayMs : delayMs;
    document.querySelectorAll(selector).forEach(function (el, i) {
      el.style.transitionDelay = (i * actualDelay) + 'ms';
    });
  }

  staggerGroup('.understand-card', 100);
  staggerGroup('.impact-banner__stat', 80);
  staggerGroup('.path__step', 120);
  staggerGroup('.reassurance__item', 80);
  staggerGroup('.resource-card', 100);
  staggerGroup('.entry-card', 100);
  staggerGroup('.strength-item', 80);

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

  /* ── Hero banner: change image on entry card hover/touch ── */
  var heroSection = document.querySelector('.hero-new');
  var entryCardsContainer = document.querySelector('.entry-cards');
  if (heroSection && entryCardsContainer) {
    entryCardsContainer.querySelectorAll('.entry-card').forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        heroSection.classList.remove('hero-new--banner-teens', 'hero-new--banner-educators');
        if (card.classList.contains('entry-card--cyan')) {
          heroSection.classList.add('hero-new--banner-teens');
        } else if (card.classList.contains('entry-card--gold')) {
          heroSection.classList.add('hero-new--banner-educators');
        }
      });

      card.addEventListener('touchstart', function () {
        heroSection.classList.remove('hero-new--banner-teens', 'hero-new--banner-educators');
        if (card.classList.contains('entry-card--cyan')) {
          heroSection.classList.add('hero-new--banner-teens');
        } else if (card.classList.contains('entry-card--gold')) {
          heroSection.classList.add('hero-new--banner-educators');
        }
      }, { passive: true });
    });

    entryCardsContainer.addEventListener('mouseleave', function () {
      heroSection.classList.remove('hero-new--banner-teens', 'hero-new--banner-educators');
    });
  }

  /* ── Swipeable entry cards carousel (mobile) ───────────── */
  var entryCarousel = document.getElementById('entryCardsCarousel');
  var entryDots = document.querySelectorAll('.entry-cards-dot');

  function updateEntryDots() {
    if (!entryCarousel || !entryDots.length || !isMobile) return;
    var cards = entryCarousel.querySelectorAll('.entry-card');
    var scrollLeft = entryCarousel.scrollLeft;
    var containerWidth = entryCarousel.offsetWidth;
    var activeIndex = 0;
    var minDist = Infinity;

    cards.forEach(function (card, i) {
      var cardCenter = card.offsetLeft + card.offsetWidth / 2;
      var viewCenter = scrollLeft + containerWidth / 2;
      var dist = Math.abs(cardCenter - viewCenter);
      if (dist < minDist) {
        minDist = dist;
        activeIndex = i;
      }
    });

    entryDots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === activeIndex);
    });

    heroSection.classList.remove('hero-new--banner-teens', 'hero-new--banner-educators');
    if (activeIndex === 1) {
      heroSection.classList.add('hero-new--banner-teens');
    } else if (activeIndex === 2) {
      heroSection.classList.add('hero-new--banner-educators');
    }
  }

  if (entryCarousel) {
    entryCarousel.addEventListener('scroll', updateEntryDots, { passive: true });

    entryDots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        var cards = entryCarousel.querySelectorAll('.entry-card');
        if (cards[i]) {
          cards[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });
    });
  }

  /* ── Horizontal-scroll impact stats dots (mobile) ──────── */
  var impactInner = document.querySelector('.impact-banner__inner');
  var impactDots = document.querySelectorAll('.impact-banner__dot');

  function updateImpactDots() {
    if (!impactInner || !impactDots.length || !isMobile) return;
    var stats = impactInner.querySelectorAll('.impact-banner__stat');
    var scrollLeft = impactInner.scrollLeft;
    var containerWidth = impactInner.offsetWidth;
    var activeIndex = 0;
    var minDist = Infinity;

    stats.forEach(function (stat, i) {
      var statCenter = stat.offsetLeft + stat.offsetWidth / 2;
      var viewCenter = scrollLeft + containerWidth / 2;
      var dist = Math.abs(statCenter - viewCenter);
      if (dist < minDist) {
        minDist = dist;
        activeIndex = i;
      }
    });

    impactDots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === activeIndex);
    });
  }

  if (impactInner) {
    impactInner.addEventListener('scroll', updateImpactDots, { passive: true });

    impactDots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        var stats = impactInner.querySelectorAll('.impact-banner__stat');
        if (stats[i]) {
          stats[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });
    });
  }

  /* ── Sticky bottom CTA bar ─────────────────────────────── */
  var stickyBar = document.getElementById('mobileStickyCtA');
  var stickyDismiss = document.getElementById('stickyCTADismiss');
  var heroEl = document.querySelector('.hero-new');
  var stickyDismissed = false;

  function handleStickyCtaVisibility() {
    if (!stickyBar || !heroEl || stickyDismissed) return;
    var heroBottom = heroEl.getBoundingClientRect().bottom;
    if (heroBottom < 0) {
      stickyBar.classList.add('visible');
    } else {
      stickyBar.classList.remove('visible');
    }
  }

  if (stickyDismiss) {
    stickyDismiss.addEventListener('click', function () {
      stickyDismissed = true;
      stickyBar.classList.remove('visible');
      stickyBar.classList.add('dismissed');
      document.body.style.paddingBottom = '0';
    });
  }

  /* ── Responsive: update isMobile on resize ─────────────── */
  window.matchMedia('(max-width: 960px)').addEventListener('change', function (e) {
    isMobile = e.matches;
  });

})();
