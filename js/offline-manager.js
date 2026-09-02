/**
 * SwasthyaConnect - Comprehensive Offline & Low-Internet Manager (js/offline-manager.js)
 * Manages Connection Status Detection, Offline-First Data Caching, Two-Way Background Sync,
 * Data Saver Mode, and Service Worker Registration.
 */

const SwasthyaOfflineManager = {
  status: 'online', // 'online', 'offline', 'poor'
  dataSaver: false,
  lastCacheTimestamp: null,
  syncQueue: [],
  heartbeatInterval: null,

  init() {
    this.loadState();
    this.registerServiceWorker();
    this.bindNetworkEvents();
    this.startHeartbeat();
    this.updateUI();
    this.cacheCurrentDataSnapshot();

    // If online on start, process any pending offline sync queue
    if (navigator.onLine) {
      setTimeout(() => this.processSyncQueue(), 1200);
    }
  },

  loadState() {
    // Load Data Saver preference
    const savedDataSaver = localStorage.getItem('swasthya_data_saver');
    this.dataSaver = savedDataSaver === 'true';
    if (this.dataSaver) {
      document.documentElement.setAttribute('data-saver', 'true');
      document.body && document.body.setAttribute('data-saver', 'true');
    }

    // Load Last Cache Timestamp
    this.lastCacheTimestamp = localStorage.getItem('swasthya_cache_timestamp') || new Date().toISOString();

    // Load Sync Queue
    try {
      this.syncQueue = JSON.parse(localStorage.getItem('swasthya_sync_queue') || '[]');
    } catch (e) {
      this.syncQueue = [];
    }

    // Initial Status
    this.status = navigator.onLine ? this.checkConnectionQuality() : 'offline';
  },

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => {
            console.log('[PWA] SwasthyaConnect ServiceWorker registered with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('[PWA] ServiceWorker registration failed:', err);
          });
      });

      // Listen for message from SW
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_PENDING_QUEUE') {
          this.processSyncQueue();
        }
      });
    }
  },

  bindNetworkEvents() {
    window.addEventListener('online', () => {
      console.log('[Network] Internet connection restored');
      this.status = this.checkConnectionQuality();
      this.updateUI();
      this.showToast('🟢 Online Mode', 'Connected to the internet. Synchronizing saved updates...', 'success');
      this.processSyncQueue();
      this.cacheCurrentDataSnapshot();
    });

    window.addEventListener('offline', () => {
      console.log('[Network] Internet disconnected. Entering Offline Mode.');
      this.status = 'offline';
      this.updateUI();
      this.showToast('🔴 Offline Mode', 'You are offline. SwasthyaConnect is using saved information.', 'error');
    });

    // Check Network Information API if supported
    if (navigator.connection) {
      navigator.connection.addEventListener('change', () => {
        if (navigator.onLine) {
          this.status = this.checkConnectionQuality();
          this.updateUI();
        }
      });
    }
  },

  checkConnectionQuality() {
    if (!navigator.onLine) return 'offline';
    if (navigator.connection) {
      const { effectiveType, saveData } = navigator.connection;
      if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
        return 'poor';
      }
    }
    return 'online';
  },

  startHeartbeat() {
    // Lightweight heartbeat every 20 seconds to detect intermittent drops
    this.heartbeatInterval = setInterval(async () => {
      if (navigator.onLine) {
        try {
          // Fast lightweight fetch
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3000);
          await fetch('./manifest.json?_=' + Date.now(), { method: 'HEAD', signal: controller.signal });
          clearTimeout(timeout);
          
          const newStatus = this.checkConnectionQuality();
          if (this.status !== newStatus) {
            this.status = newStatus;
            this.updateUI();
          }
        } catch (e) {
          if (this.status !== 'offline') {
            console.warn('[Network] Heartbeat failed. Switching to Offline Mode.');
            this.status = 'offline';
            this.updateUI();
          }
        }
      } else {
        if (this.status !== 'offline') {
          this.status = 'offline';
          this.updateUI();
        }
      }
    }, 20000);
  },

  updateUI() {
    const banner = document.getElementById('connection-status-banner');
    const dot = document.getElementById('conn-status-dot');
    const text = document.getElementById('conn-status-text');
    const timeLabel = document.getElementById('conn-status-time');
    const syncBadge = document.getElementById('offline-sync-badge');

    if (!banner) return;

    banner.className = `connection-status-banner status-${this.status}`;

    if (this.status === 'online') {
      if (text) text.innerHTML = `<strong>🟢 Online Mode</strong> &bull; Connected to the internet. All live services & telemedicine active.`;
      if (timeLabel) timeLabel.textContent = `Live Synced`;
      banner.style.display = this.dataSaver ? 'flex' : 'none'; // Only show if data saver active or transition
    } else if (this.status === 'poor') {
      banner.style.display = 'flex';
      if (text) text.innerHTML = `<strong>🟡 Poor Connection</strong> &bull; Unstable network detected. Data Saver Mode is recommended.`;
      if (timeLabel) timeLabel.textContent = `Last verified: ${this.getFormattedTimestamp()}`;
    } else {
      // Offline
      banner.style.display = 'flex';
      if (text) text.innerHTML = `<strong>🔴 Offline Mode Active</strong> &bull; You are offline. SwasthyaConnect is using saved information.`;
      if (timeLabel) timeLabel.textContent = `Last updated: ${this.getFormattedTimestamp()}`;
    }

    // Update pending sync badge
    if (syncBadge) {
      if (this.syncQueue.length > 0) {
        syncBadge.style.display = 'inline-flex';
        syncBadge.textContent = `${this.syncQueue.length} pending sync`;
      } else {
        syncBadge.style.display = 'none';
      }
    }

    // Update offline labels across the portal
    document.querySelectorAll('.offline-timestamp-label').forEach(el => {
      el.textContent = `Last updated: ${this.getFormattedTimestamp()}`;
    });

    // Update Data Saver toggle button state
    const dataSaverBtn = document.getElementById('data-saver-toggle-btn');
    if (dataSaverBtn) {
      dataSaverBtn.classList.toggle('active', this.dataSaver);
      dataSaverBtn.innerHTML = this.dataSaver 
        ? `<svg class="icon" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg><span>Data Saver: ON</span>`
        : `<svg class="icon" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg><span>Data Saver: OFF</span>`;
    }
  },

  getFormattedTimestamp(isoString = null) {
    const d = new Date(isoString || this.lastCacheTimestamp || Date.now());
    const day = d.getDate().toString().padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  },

  // Snapshot current state to localStorage & IndexedDB for reliable offline loading
  cacheCurrentDataSnapshot() {
    try {
      const now = new Date().toISOString();
      this.lastCacheTimestamp = now;
      localStorage.setItem('swasthya_cache_timestamp', now);

      if (typeof PulseCareStore !== 'undefined') {
        const session = PulseCareStore.getSession();
        if (session) {
          localStorage.setItem('swasthya_cached_session', JSON.stringify(session));
          const pat = PulseCareStore.getPatientById(session.id);
          if (pat) {
            localStorage.setItem('swasthya_cached_patient', JSON.stringify(pat));
          }
          const apts = PulseCareStore.getAppointments(session.id);
          localStorage.setItem('swasthya_cached_appointments', JSON.stringify(apts));

          const rxs = PulseCareStore.getPrescriptions(session.id);
          localStorage.setItem('swasthya_cached_prescriptions', JSON.stringify(rxs));

          const labs = PulseCareStore.getLabReports(session.id);
          localStorage.setItem('swasthya_cached_labs', JSON.stringify(labs));

          const schemes = PulseCareStore.getGovernmentSchemes();
          localStorage.setItem('swasthya_cached_schemes', JSON.stringify(schemes));

          const nearby = PulseCareStore.getNearbyCentres();
          localStorage.setItem('swasthya_cached_nearby', JSON.stringify(nearby));
        }
      }
      console.log('[OfflineManager] Cached healthcare data snapshot successfully at', now);
    } catch (e) {
      console.warn('[OfflineManager] Error caching snapshot:', e);
    }
  },

  // Queue actions performed while offline
  queueOfflineAction(actionType, payload) {
    const item = {
      id: 'sync-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      type: actionType,
      payload: payload,
      timestamp: new Date().toISOString()
    };

    this.syncQueue.push(item);
    localStorage.setItem('swasthya_sync_queue', JSON.stringify(this.syncQueue));
    this.updateUI();

    this.showToast(
      'Saved Offline',
      'Action saved safely on device. It will automatically synchronize when you are back online.',
      'info'
    );

    // If online right now, immediately process
    if (navigator.onLine) {
      this.processSyncQueue();
    }
  },

  // Synchronize pending queue when connectivity returns
  async processSyncQueue() {
    if (this.syncQueue.length === 0 || !navigator.onLine) return;

    console.log(`[OfflineManager] Synchronizing ${this.syncQueue.length} pending offline actions...`);
    const count = this.syncQueue.length;

    try {
      while (this.syncQueue.length > 0) {
        const item = this.syncQueue.shift();
        
        if (item.type === 'BOOK_APPOINTMENT' && typeof PulseCareStore !== 'undefined') {
          PulseCareStore.addAppointment(item.payload);
        } else if (item.type === 'REFILL_REQUEST' && typeof PulseCareStore !== 'undefined') {
          PulseCareStore.requestRefill(item.payload.rxId);
        } else if (item.type === 'UPDATE_PROFILE' && typeof PulseCareStore !== 'undefined') {
          PulseCareStore.updatePatient(item.payload.id, item.payload.data);
        }
      }

      localStorage.setItem('swasthya_sync_queue', JSON.stringify([]));
      this.cacheCurrentDataSnapshot();
      this.updateUI();

      this.showToast(
        '🔄 Synchronized',
        `Your information has been synchronized successfully (${count} ${count === 1 ? 'update' : 'updates'} synced).`,
        'success'
      );

      // Trigger UI refresh
      window.dispatchEvent(new CustomEvent('swasthya:state_change'));
    } catch (err) {
      console.error('[OfflineManager] Error during synchronization:', err);
    }
  },

  // Toggle Low-Data / Data Saver Mode
  toggleDataSaver(forceState = null) {
    this.dataSaver = forceState !== null ? forceState : !this.dataSaver;
    localStorage.setItem('swasthya_data_saver', this.dataSaver ? 'true' : 'false');

    if (this.dataSaver) {
      document.documentElement.setAttribute('data-saver', 'true');
      document.body && document.body.setAttribute('data-saver', 'true');
      this.showToast(
        '⚙️ Data Saver Enabled',
        'Animations paused, graphics optimized, and network requests minimized for low bandwidth.',
        'success'
      );
    } else {
      document.documentElement.removeAttribute('data-saver');
      document.body && document.body.removeAttribute('data-saver');
      this.showToast('⚙️ Data Saver Disabled', 'Standard graphics and animations restored.', 'info');
    }

    this.updateUI();
  },

  // Privacy & Storage Management: Clear cached offline medical records
  clearOfflineData() {
    const confirmed = confirm('Are you sure you want to clear locally cached offline healthcare records on this device? Your online account data will remain safe.');
    if (!confirmed) return;

    localStorage.removeItem('swasthya_cached_patient');
    localStorage.removeItem('swasthya_cached_appointments');
    localStorage.removeItem('swasthya_cached_prescriptions');
    localStorage.removeItem('swasthya_cached_labs');
    localStorage.removeItem('swasthya_cached_nearby');
    localStorage.removeItem('swasthya_sync_queue');
    this.syncQueue = [];

    // Also clear CacheStorage if available
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('swasthya')) caches.delete(name);
        });
      });
    }

    this.updateUI();
    this.showToast('Offline Cache Cleared', 'All locally stored offline healthcare records have been securely removed from this device.', 'info');
  },

  showToast(title, message, type = 'info') {
    if (typeof PulseCareUI !== 'undefined' && PulseCareUI.showToast) {
      PulseCareUI.showToast(title, message, type);
    } else {
      console.log(`[Toast] ${title}: ${message}`);
    }
  }
};

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  SwasthyaOfflineManager.init();
});
