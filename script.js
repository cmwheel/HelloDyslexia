/* ============================================================
   Hello Dyslexia — Landing Page Scripts
   ============================================================ */

(function () {
  'use strict';

  /* ── Nav: scroll background ─────────────────────────────── */
  const nav = document.getElementById('nav');

  function onScroll() {
    if (window.scrollY > 32) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
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

  /* ── Nav dropdown toggle ──────────────────────────────── */
  document.querySelectorAll('.nav__dropdown-trigger').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
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
    '.understand-card, .path__step, .impact-banner__stat, .reassurance__item, .assessment-banner, .resource-card, .specialist-banner, .entry-card, .strength-item, .situation-card, .is-isnot-card, .strengths-callout, .screener-selector__card, .tab-selector__card, .faq-accordion__item, .myth-fact-card, .glossary-term, .flagged-color-card, .deeper-checklist__item'
  );

  var isParentsPage = document.body.classList.contains('page--parents');
  var animEasing = isParentsPage
    ? 'opacity 0.6s cubic-bezier(0.32, 0.72, 0, 1), transform 0.6s cubic-bezier(0.32, 0.72, 0, 1)'
    : 'opacity 0.5s ease, transform 0.5s ease';

  animateEls.forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = animEasing;
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

  /* ── Hero banner: change image on entry card hover ───────── */
  var heroSection = document.querySelector('.hero-new');
  var entryCards = document.querySelector('.entry-cards');
  if (heroSection && entryCards) {
    entryCards.querySelectorAll('.entry-card').forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        heroSection.classList.remove('hero-new--banner-teens', 'hero-new--banner-educators');
        if (card.classList.contains('entry-card--cyan')) {
          heroSection.classList.add('hero-new--banner-teens');
        } else if (card.classList.contains('entry-card--gold')) {
          heroSection.classList.add('hero-new--banner-educators');
        }
      });
    });
    entryCards.addEventListener('mouseleave', function () {
      heroSection.classList.remove('hero-new--banner-teens', 'hero-new--banner-educators');
    });
  }

})();
