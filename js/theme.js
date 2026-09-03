/**
 * PulseCare OS - Global Theme & UI Utilities (js/theme.js)
 */

(function () {
  // Theme & Low Data Mode Managers
  const THEME_STORAGE_KEY = 'swasthya_theme_mode';
  const LOW_DATA_STORAGE_KEY = 'swasthya_low_data';

  function initTheme() {
    // Default explicitly to clean hospital Light Theme unless user previously chose dark
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'light';
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggleIcons(savedTheme);
  }

  function initLowDataMode() {
    const isLowData = localStorage.getItem(LOW_DATA_STORAGE_KEY) === 'true';
    if (isLowData) {
      document.documentElement.classList.add('low-data-mode');
    } else {
      document.documentElement.classList.remove('low-data-mode');
    }
    updateLowDataButtons(isLowData);
  }

  function toggleLowDataMode() {
    const isCurrentlyLowData = document.documentElement.classList.contains('low-data-mode');
    const newState = !isCurrentlyLowData;
    if (newState) {
      document.documentElement.classList.add('low-data-mode');
      localStorage.setItem(LOW_DATA_STORAGE_KEY, 'true');
      showToast('⚡ Low Data Mode Active', 'Animations and heavy graphics reduced for low bandwidth.', 'info');
    } else {
      document.documentElement.classList.remove('low-data-mode');
      localStorage.setItem(LOW_DATA_STORAGE_KEY, 'false');
      showToast('Standard Mode', 'Full visual effects restored.', 'info');
    }
    updateLowDataButtons(newState);
  }

  function updateLowDataButtons(isActive) {
    document.querySelectorAll('.low-data-toggle-btn').forEach(btn => {
      if (isActive) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('title', 'Low Data Mode: Active (Click to switch to standard)');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('title', 'Enable Low Data Mode for slow internet');
      }
    });
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    updateThemeToggleIcons(newTheme);
    showToast('Theme Updated', `Switched to ${newTheme} mode`, 'info');
  }

  function updateThemeToggleIcons(theme) {
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    toggleBtns.forEach(btn => {
      const sunIcon = btn.querySelector('.icon-sun');
      const moonIcon = btn.querySelector('.icon-moon');
      if (sunIcon && moonIcon) {
        if (theme === 'dark') {
          sunIcon.style.display = 'block';
          moonIcon.style.display = 'none';
        } else {
          sunIcon.style.display = 'none';
          moonIcon.style.display = 'block';
        }
      }
    });
  }

  // Toast Notification Engine
  function showToast(title, message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg class="icon toast-icon" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg class="icon toast-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    } else {
      iconSvg = `<svg class="icon toast-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `
      ${iconSvg}
      <div class="toast-content">
        <div class="toast-title">${escapeHTML(title)}</div>
        <div class="toast-message">${escapeHTML(message)}</div>
      </div>
    `;

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto remove after 4 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 4000);
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // Modal helpers
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Mobile menu sidebar toggle
  function initMobileNav() {
    const toggleBtn = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.portal-sidebar');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });

      // Close sidebar when clicking outside on mobile
      document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('open') && 
            !sidebar.contains(e.target) && 
            !toggleBtn.contains(e.target)) {
          sidebar.classList.remove('open');
        }
      });
    }
  }

  // Global Logout Action
  function handleLogout() {
    if (window.PulseCareStore) {
      window.PulseCareStore.clearSession();
    }
    showToast('Signed Out', 'You have securely logged out of PulseCare OS.', 'info');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 500);
  }

  // Document Ready Setup
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLowDataMode();
    initMobileNav();

    // Bind Theme Toggle Buttons
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });

    // Bind Low Data Toggle Buttons
    document.querySelectorAll('.low-data-toggle-btn').forEach(btn => {
      btn.addEventListener('click', toggleLowDataMode);
    });

    // Bind Modal Close buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close-modal');
        closeModal(modalId);
      });
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });

    // Bind Logout Buttons
    document.querySelectorAll('.btn-logout').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
      });
    });
  });

  // Expose to window
  const UIInterface = {
    toggleTheme,
    toggleLowDataMode,
    initLowDataMode,
    showToast,
    openModal,
    closeModal,
    handleLogout,
    escapeHTML
  };
  window.SwasthyaUI = UIInterface;
  window.PulseCareUI = UIInterface;
})();
