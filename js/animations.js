/**
 * SwasthyaConnect - Premium Healthcare Animation Controller
 * Smooth Medical ECG Intro Splash, Staggered Card Entrances, Vitals Live Telemetry,
 * Dynamic Micro-Interactions, and Tab Transitions.
 */

(function () {
  'use strict';

  // Check prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Initialize Splash Loading Animation
  function initMedicalSplashAnimation() {
    // Only show splash once per session or on page load
    const splashShown = sessionStorage.getItem('swasthya_splash_shown');
    if (splashShown && !window.location.search.includes('replay_intro=true')) {
      return;
    }

    if (prefersReducedMotion) {
      sessionStorage.setItem('swasthya_splash_shown', 'true');
      return;
    }

    // Create Splash Overlay
    const splash = document.createElement('div');
    splash.id = 'swasthya-medical-splash';
    splash.className = 'swasthya-medical-splash';
    splash.innerHTML = `
      <div class="splash-inner">
        <!-- SVG Animated ECG Heartbeat Pulse Line -->
        <div class="splash-ecg-container">
          <svg class="splash-ecg-svg" viewBox="0 0 600 120" preserveAspectRatio="none">
            <!-- Background subtle guideline -->
            <path class="splash-ecg-guide" d="M 0,60 L 160,60 L 180,60 L 195,20 L 210,105 L 225,45 L 235,75 L 245,60 L 355,60 L 370,60 L 385,20 L 400,105 L 415,45 L 425,75 L 435,60 L 600,60" />
            <!-- Active glowing heartbeat line -->
            <path class="splash-ecg-line" d="M 0,60 L 160,60 L 180,60 L 195,20 L 210,105 L 225,45 L 235,75 L 245,60 L 355,60 L 370,60 L 385,20 L 400,105 L 415,45 L 425,75 L 435,60 L 600,60" />
          </svg>
        </div>

        <!-- Central Medical Glow & Healthcare AI Logo Reveal -->
        <div class="splash-center-content">
          <div class="splash-glow-ring"></div>
          <div class="splash-glow-core"></div>
          
          <div class="splash-logo-symbol">
            <div class="splash-cross-vertical"></div>
            <div class="splash-cross-horizontal"></div>
            <div class="splash-pulse-dot"></div>
          </div>

          <div class="splash-brand-wrap">
            <h1 class="splash-brand-title">
              <span class="splash-brand-accent">Swasthya</span>Connect
            </h1>
            <p class="splash-brand-tagline">Connecting Care. Improving Lives.</p>
          </div>
        </div>

        <!-- Skip button for instant access -->
        <button class="splash-skip-btn" onclick="SwasthyaAnimations.dismissSplash()" aria-label="Skip animation">
          Skip ✕
        </button>
      </div>
    `;

    document.body.appendChild(splash);

    // Auto dismiss after 2.4 seconds with smooth fade/zoom out
    setTimeout(() => {
      dismissSplash();
    }, 2350);

    sessionStorage.setItem('swasthya_splash_shown', 'true');
  }

  // Dismiss Splash
  function dismissSplash() {
    const splash = document.getElementById('swasthya-medical-splash');
    if (!splash) return;

    splash.classList.add('splash-fade-out');
    setTimeout(() => {
      if (splash && splash.parentNode) {
        splash.parentNode.removeChild(splash);
      }
      triggerPageEntranceAnimations();
    }, 450);
  }

  // Staggered Entrance Animations for Cards and Sections
  function triggerPageEntranceAnimations() {
    if (prefersReducedMotion) return;

    // Apply smooth staggered entrance classes
    const heroElements = document.querySelectorAll('.hero-content, .auth-hero, .welcome-banner');
    heroElements.forEach(el => el.classList.add('animate-fade-slide-up'));

    const cards = document.querySelectorAll('.metric-card, .portal-card, .feature-card, .scheme-card');
    cards.forEach((card, index) => {
      card.style.animationDelay = `${Math.min(index * 60, 480)}ms`;
      card.classList.add('animate-card-stagger');
    });

    // Add live pulse to vitals
    const vitalCards = document.querySelectorAll('.metric-card');
    vitalCards.forEach(vc => vc.classList.add('animate-vitals-live'));
  }

  // Initialize interactive micro-animations (Button ripples, live pulses)
  function initInteractiveAnimations() {
    // Add click ripple effect to primary & emerald buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-primary, .btn-emerald, .btn-danger, .btn-secondary');
      if (!btn) return;

      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple-wave';
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });

    // Animate Tab switching transitions
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link, .tab-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        const targetId = link.getAttribute('data-tab') || (link.getAttribute('href') || '').replace('#', '');
        if (!targetId) return;

        setTimeout(() => {
          const activePanel = document.getElementById(targetId) || document.getElementById(`tab-${targetId}`);
          if (activePanel) {
            activePanel.classList.remove('animate-tab-enter');
            void activePanel.offsetWidth; // Trigger reflow
            activePanel.classList.add('animate-tab-enter');
          }
        }, 30);
      });
    });
  }

  // Public API
  window.SwasthyaAnimations = {
    init: function () {
      initMedicalSplashAnimation();
      initInteractiveAnimations();
      if (!document.getElementById('swasthya-medical-splash')) {
        triggerPageEntranceAnimations();
      }
    },
    dismissSplash,
    replayIntro: function () {
      sessionStorage.removeItem('swasthya_splash_shown');
      window.location.href = window.location.pathname + '?replay_intro=true';
    }
  };

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.SwasthyaAnimations.init);
  } else {
    window.SwasthyaAnimations.init();
  }

})();
