/**
 * Neepank Toolbox — Landing Page Client Script
 * Lightweight vanilla JavaScript (Zero external dependencies):
 * - Dynamic tool count calculation & live match counter
 * - Interactive instant search across all 16 tools (title, description, category)
 * - Coordinated category filtering + instant search
 * - Keyboard shortcuts: '/' to focus search, 'Escape' to clear
 * - Empty state with quick-reset action
 * - Dark & Light mode switcher with localStorage persistence & system preference detection
 * - Interactive pointer spotlight tracking on tool cards & CTA banner
 * - 3D parallax tilt on hero mockup with ambient orb drift
 * - Sticky navigation scroll state
 * - Smooth anchor scrolling with nav offset
 * - Staggered scroll-reveal using IntersectionObserver
 * - Full respect for prefers-reduced-motion
 */

(function () {
  'use strict';

  function initLanding() {
    var landingEl = document.querySelector('.nk-landing');
    var header = document.querySelector('.nk-header');
    var filterChips = document.querySelectorAll('.nk-filter-chip');
    var toolCards = document.querySelectorAll('.nk-tool-card');
    var toolCountBadge = document.getElementById('nk-tool-count');
    var searchInput = document.getElementById('nk-tool-search');
    var searchClearBtn = document.getElementById('nk-search-clear');
    var emptyState = document.getElementById('nk-tools-empty-state');
    var emptyQuerySpan = document.querySelector('.nk-empty-query');
    var emptyClearBtn = document.getElementById('nk-empty-clear-btn');
    var themeToggles = document.querySelectorAll('.nk-theme-toggle');

    var hero = document.querySelector('.nk-hero');
    var heroMockup = document.querySelector('.nk-hero-mockup-container');
    var orb1 = document.querySelector('.nk-glow-orb-1');
    var orb2 = document.querySelector('.nk-glow-orb-2');
    var ctaBox = document.querySelector('.nk-cta-box');
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var totalCount = toolCards.length || 16;
    var activeCategory = 'All';
    var searchQuery = '';

    // ==========================================
    // 1. Dark / Light Theme Management
    // ==========================================
    var STORAGE_THEME_KEY = 'neepank-theme';

    function getInitialTheme() {
      try {
        var stored = localStorage.getItem(STORAGE_THEME_KEY);
        if (stored === 'dark' || stored === 'light') {
          return stored;
        }
      } catch (e) {}

      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    }

    function setTheme(theme) {
      if (landingEl) {
        landingEl.setAttribute('data-theme', theme);
      }
      document.documentElement.setAttribute('data-theme', theme);
      if (document.body) {
        document.body.setAttribute('data-theme', theme);
      }

      try {
        localStorage.setItem(STORAGE_THEME_KEY, theme);
      } catch (e) {}

      // Update button aria attributes & label texts
      themeToggles.forEach(function (btn) {
        var isDark = theme === 'dark';
        btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        btn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        var label = btn.querySelector('.nk-theme-btn-label');
        if (label) {
          label.textContent = isDark ? 'Dark' : 'Light';
        }
      });
    }

    function toggleTheme() {
      var current = (landingEl && landingEl.getAttribute('data-theme')) || 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      setTheme(next);
    }

    // Initialize Theme
    setTheme(getInitialTheme());

    // Theme toggle button clicks
    themeToggles.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        toggleTheme();
      });
    });

    // ==========================================
    // 2. Coordinated Search & Category Filtering
    // ==========================================
    function applyFilters() {
      var q = searchQuery.trim().toLowerCase();
      var visibleCount = 0;
      var staggerIdx = 0;

      toolCards.forEach(function (card) {
        var cardCat = (card.getAttribute('data-category') || '').trim();
        var titleEl = card.querySelector('.nk-card-title');
        var descEl = card.querySelector('.nk-card-desc');
        var cardTitle = titleEl ? titleEl.textContent.toLowerCase() : '';
        var cardDesc = descEl ? descEl.textContent.toLowerCase() : '';
        var cardCatLower = cardCat.toLowerCase();

        var matchesCategory = (activeCategory === 'All' || cardCatLower === activeCategory.toLowerCase());
        var matchesSearch = !q ||
          cardTitle.indexOf(q) !== -1 ||
          cardDesc.indexOf(q) !== -1 ||
          cardCatLower.indexOf(q) !== -1;

        if (matchesCategory && matchesSearch) {
          card.classList.remove('nk-hidden');
          if (!prefersReducedMotion) {
            card.classList.remove('nk-animating-in');
            // Trigger reflow to restart CSS animation
            void card.offsetWidth;
            card.style.animationDelay = (staggerIdx * 30) + 'ms';
            card.classList.add('nk-animating-in');
            staggerIdx++;
          }
          visibleCount++;
        } else {
          card.classList.add('nk-hidden');
          card.classList.remove('nk-animating-in');
          card.style.animationDelay = '0ms';
        }
      });

      // Update counter badge
      if (toolCountBadge) {
        if (q) {
          toolCountBadge.textContent = visibleCount + (visibleCount === 1 ? ' Match' : ' Matches');
        } else if (activeCategory !== 'All') {
          toolCountBadge.textContent = visibleCount + ' of ' + totalCount + ' Tools';
        } else {
          toolCountBadge.textContent = totalCount + ' Tools';
        }
      }

      // Update search clear button
      if (searchClearBtn) {
        if (q.length > 0) {
          searchClearBtn.hidden = false;
          searchClearBtn.style.display = 'flex';
        } else {
          searchClearBtn.hidden = true;
          searchClearBtn.style.display = 'none';
        }
      }

      // Update empty state
      if (emptyState) {
        if (visibleCount === 0) {
          emptyState.style.display = 'flex';
          if (emptyQuerySpan) {
            emptyQuerySpan.textContent = q || activeCategory;
          }
        } else {
          emptyState.style.display = 'none';
        }
      }
    }

    // Initial filter pass
    applyFilters();

    // Category chip clicks
    filterChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeCategory = chip.getAttribute('data-category') || 'All';

        filterChips.forEach(function (c) {
          c.classList.remove('nk-active');
          c.setAttribute('aria-pressed', 'false');
        });
        chip.classList.add('nk-active');
        chip.setAttribute('aria-pressed', 'true');

        applyFilters();
      });
    });

    // Search input live typing
    if (searchInput) {
      searchInput.addEventListener('input', function (e) {
        searchQuery = e.target.value || '';
        applyFilters();
      });

      searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          searchInput.value = '';
          searchQuery = '';
          applyFilters();
          searchInput.blur();
        }
      });
    }

    // Clear search button
    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        searchQuery = '';
        applyFilters();
      });
    }

    // Empty state "Clear search" CTA
    if (emptyClearBtn) {
      emptyClearBtn.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }
        searchQuery = '';
        activeCategory = 'All';

        filterChips.forEach(function (c) {
          if (c.getAttribute('data-category') === 'All') {
            c.classList.add('nk-active');
            c.setAttribute('aria-pressed', 'true');
          } else {
            c.classList.remove('nk-active');
            c.setAttribute('aria-pressed', 'false');
          }
        });

        applyFilters();
        if (searchInput) {
          searchInput.focus();
        }
      });
    }

    // Global keyboard hotkey: '/' focuses search input
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && searchInput && document.activeElement !== searchInput) {
        var activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          e.preventDefault();
          searchInput.focus();
          searchInput.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
        }
      }
    });

    // ==========================================
    // 3. Interactive Cursor Spotlight on Tool Cards
    // ==========================================
    if (!prefersReducedMotion) {
      toolCards.forEach(function (card) {
        card.addEventListener('pointermove', function (e) {
          var rect = card.getBoundingClientRect();
          var x = ((e.clientX - rect.left) / rect.width) * 100;
          var y = ((e.clientY - rect.top) / rect.height) * 100;
          card.style.setProperty('--mouse-x', x.toFixed(1) + '%');
          card.style.setProperty('--mouse-y', y.toFixed(1) + '%');
        });
      });

      // Ambient Interactive Spotlight on CTA Container
      if (ctaBox) {
        ctaBox.addEventListener('pointermove', function (e) {
          var rect = ctaBox.getBoundingClientRect();
          var x = ((e.clientX - rect.left) / rect.width) * 100;
          var y = ((e.clientY - rect.top) / rect.height) * 100;
          ctaBox.style.setProperty('--cta-mouse-x', x.toFixed(1) + '%');
          ctaBox.style.setProperty('--cta-mouse-y', y.toFixed(1) + '%');
        });
      }
    }

    // ==========================================
    // 4. Smooth 3D Mouse Parallax on Hero Mockup
    // ==========================================
    if (!prefersReducedMotion && hero && heroMockup) {
      var heroTicking = false;
      var targetRotX = 0;
      var targetRotY = 0;
      var targetOrbX = 0;
      var targetOrbY = 0;

      function updateHeroParallax() {
        heroMockup.style.transform = 'perspective(1000px) rotateX(' + targetRotX + 'deg) rotateY(' + targetRotY + 'deg)';
        if (orb1) {
          orb1.style.transform = 'translate(' + (-targetOrbX) + 'px, ' + (-targetOrbY) + 'px)';
        }
        if (orb2) {
          orb2.style.transform = 'translate(' + targetOrbX + 'px, ' + targetOrbY + 'px)';
        }
        heroTicking = false;
      }

      hero.addEventListener('pointermove', function (e) {
        var rect = hero.getBoundingClientRect();
        var centerX = rect.left + rect.width / 2;
        var centerY = rect.top + rect.height / 2;
        var normX = (e.clientX - centerX) / (rect.width / 2);
        var normY = (e.clientY - centerY) / (rect.height / 2);

        // Subtle clamped tilt: max 5.5 deg
        targetRotY = (normX * 5.5).toFixed(2);
        targetRotX = (-normY * 4).toFixed(2);
        targetOrbX = (normX * 22).toFixed(1);
        targetOrbY = (normY * 22).toFixed(1);

        if (!heroTicking) {
          window.requestAnimationFrame(updateHeroParallax);
          heroTicking = true;
        }
      });

      hero.addEventListener('pointerleave', function () {
        targetRotX = 0;
        targetRotY = 0;
        targetOrbX = 0;
        targetOrbY = 0;
        if (!heroTicking) {
          window.requestAnimationFrame(updateHeroParallax);
          heroTicking = true;
        }
      });
    }

    // ==========================================
    // 5. Sticky Top Nav on Scroll
    // ==========================================
    function onScroll() {
      if (!header) return;
      if (window.scrollY > 25) {
        header.classList.add('nk-scrolled');
      } else {
        header.classList.remove('nk-scrolled');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ==========================================
    // 6. Smooth Anchor Scrolling with Nav Offset
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = anchor.getAttribute('href');
        if (targetId === '#' || targetId === '#top') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
          return;
        }
        var targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          var navHeight = header ? header.offsetHeight : 70;
          var targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;
          window.scrollTo({
            top: targetPosition,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
          });
        }
      });
    });

    // ==========================================
    // 7. Scroll-Reveal with Staggered Transition
    // ==========================================
    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
      var revealElements = document.querySelectorAll('.nk-reveal');
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var stagger = el.getAttribute('data-stagger');
            if (stagger) {
              el.style.transitionDelay = (parseInt(stagger, 10) * 45) + 'ms';
            }
            el.classList.add('nk-revealed');
            observer.unobserve(el);
          }
        });
      }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      });

      revealElements.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      document.querySelectorAll('.nk-reveal').forEach(function (el) {
        el.classList.add('nk-revealed');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanding);
  } else {
    initLanding();
  }
})();
