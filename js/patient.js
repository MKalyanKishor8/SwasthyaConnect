/**
 * SwasthyaConnect - Comprehensive Patient Portal Controller (js/patient.js)
 * Manages Dashboard, Profile, Appointments, Medical Records, Prescriptions, Labs,
 * Telehealth, Government Schemes, Location-Based Nearby Healthcare Centres, and Interactive Map.
 */

let currentPatient = null;
let currentSchemeCategory = 'All';

// Location & Nearby State
let patientCoordinates = { lat: 17.3850, lng: 78.4867 }; // Default Reference Coords (Hyderabad/Springfield)
let detectedLocationLabel = 'Springfield Central (Reference)';
let nearbyTypeFilter = 'All';
let nearbyDistanceFilter = null; // null for All Distances, or 1, 5, 10, 25
let nearbySearchQuery = '';
let leafletMapInstance = null;
let mapMarkersLayer = null;
let userMarker = null;

document.addEventListener('DOMContentLoaded', () => {
  // Ensure authenticated session
  const session = PulseCareStore.getSession();
  if (!session || session.role !== 'patient') {
    const pat = PulseCareStore.getPatientById('pat-1') || PulseCareStore.getPatients()[0];
    PulseCareStore.setSession({
      id: pat.id,
      name: pat.name,
      email: pat.email,
      role: 'patient',
      bloodType: pat.bloodType,
      mrn: pat.mrn
    }, true);
  }

  const activeSession = PulseCareStore.getSession();
  currentPatient = PulseCareStore.getPatientById(activeSession?.id || 'pat-1') || PulseCareStore.getPatients()[0];

  initNavigation();
  initNotificationCenter();
  renderPatientData();
  renderAppointments();
  renderPrescriptions();
  renderMedicalRecords();
  renderScans();
  renderTelehealthHistory();
  renderGovernmentSchemes();
  initSchemesSearchAndFilter();
  initEligibilityChecker();
  initBookingWizard();
  initNearbySearchAndFilter();

  // Handle Post-Login Location Permission Popup
  checkPostLoginLocationPrompt();

  // Listen to cross-portal state changes
  window.addEventListener('swasthya:state_change', () => {
    currentPatient = PulseCareStore.getPatientById(currentPatient.id) || PulseCareStore.getPatients()[0];
    renderPatientData();
    renderAppointments();
    renderPrescriptions();
    renderMedicalRecords();
    renderScans();
    renderTelehealthHistory();
    renderGovernmentSchemes(currentSchemeCategory);
    renderNearbyCentres();
  });
});

// ==========================================================================
// NAVIGATION & TABS
// ==========================================================================

function initNavigation() {
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link[data-tab]');
  const pageTitle = document.getElementById('current-page-title');

  const titles = {
    overview: 'Patient Health Dashboard',
    profile: 'My Patient Profile & Demographics',
    appointments: 'Scheduled Consultations & Appointments',
    records: 'Electronic Medical Records (EHR)',
    prescriptions: 'Active Medications & Pharmacy Refills',
    labs: 'Diagnostic Lab Reports & Pathology',
    telehealth: 'Encrypted Telemedicine Video Consultations',
    schemes: 'Indian Government Healthcare Schemes',
    nearby: 'Find Nearby Government Healthcare Centres',
    emergency: 'Emergency Information & Rapid Response'
  };

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = link.getAttribute('data-tab');
      switchTab(tab);
    });
  });

  const hash = window.location.hash.replace('#', '');
  if (hash && titles[hash]) {
    switchTab(hash);
  }
}

function switchTab(tabId) {
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link[data-tab]');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const pageTitle = document.getElementById('current-page-title');

  const titles = {
    overview: 'Patient Health Dashboard',
    profile: 'My Patient Profile & Demographics',
    appointments: 'Scheduled Consultations & Appointments',
    records: 'Electronic Medical Records (EHR)',
    prescriptions: 'Active Medications & Pharmacy Refills',
    labs: 'Diagnostic Lab Reports & Pathology',
    telehealth: 'Encrypted Telemedicine Video Consultations',
    schemes: 'Indian Government Healthcare Schemes',
    nearby: 'Find Nearby Government Healthcare Centres',
    emergency: 'Emergency Information & Rapid Response'
  };

  navLinks.forEach(l => {
    if (l.getAttribute('data-tab') === tabId) {
      l.classList.add('active');
    } else {
      l.classList.remove('active');
    }
  });

  tabPanels.forEach(p => {
    if (p.id === `tab-${tabId}`) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });

  if (pageTitle && titles[tabId]) {
    pageTitle.textContent = titles[tabId];
  }

  window.location.hash = tabId;

  // Invalidate and re-render Leaflet Map if switching to nearby tab
  if (tabId === 'nearby') {
    setTimeout(() => {
      initOrUpdateHealthcareMap();
      renderNearbyCentres();
    }, 200);
  }

  const sidebar = document.querySelector('.portal-sidebar');
  if (sidebar && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
  }
}

// ==========================================================================
// LOCATION PERMISSION & DETECTION FLOW (POST-LOGIN)
// ==========================================================================

function checkPostLoginLocationPrompt() {
  const hasPrompted = sessionStorage.getItem('swasthya_location_prompted');
  if (!hasPrompted) {
    setTimeout(() => {
      PulseCareUI.openModal('location-permission-modal');
    }, 350);
  }
}

window.grantLocationPermission = function() {
  sessionStorage.setItem('swasthya_location_prompted', 'true');
  PulseCareUI.closeModal('location-permission-modal');
  triggerDeviceGeolocation();
};

window.enterLocationManuallyFromModal = function() {
  sessionStorage.setItem('swasthya_location_prompted', 'true');
  PulseCareUI.closeModal('location-permission-modal');
  switchTab('nearby');
  toggleManualLocationInput(true);
};

window.handleDashboardFindHealthcare = function() {
  switchTab('nearby');
  triggerDeviceGeolocation();
};

window.triggerDeviceGeolocation = function() {
  const locIndicator = document.getElementById('detected-location-text');
  if (locIndicator) {
    locIndicator.innerHTML = `<span class="pulse-dot"></span> Detecting GPS Coordinates...`;
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        patientCoordinates = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        detectedLocationLabel = `GPS Coords (${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E)`;
        updateLocationHeaderDisplay(detectedLocationLabel);
        PulseCareUI.showToast('Location Detected', 'Calculated nearby healthcare facilities based on your current location.', 'success');
        
        const coordsDisplay = document.getElementById('sos-coords-display');
        if (coordsDisplay) {
          coordsDisplay.textContent = `${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`;
        }

        renderNearbyCentres();
        initOrUpdateHealthcareMap();
      },
      (err) => {
        console.warn('Geolocation access denied or unavailable:', err);
        detectedLocationLabel = 'Springfield Central (Default)';
        updateLocationHeaderDisplay('Location access unavailable (Using Default Reference)');
        PulseCareUI.showToast('Location Unavailable', 'Location access was not granted. You can enter your area manually.', 'info');
        toggleManualLocationInput(true);
        renderNearbyCentres();
        initOrUpdateHealthcareMap();
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  } else {
    PulseCareUI.showToast('Unsupported', 'Geolocation is not supported by your browser.', 'info');
    toggleManualLocationInput(true);
  }
};

function updateLocationHeaderDisplay(text) {
  const el = document.getElementById('detected-location-text');
  if (el) el.textContent = text;
}

window.toggleManualLocationInput = function(forceShow = null) {
  const box = document.getElementById('manual-location-box');
  if (!box) return;
  const isHidden = box.style.display === 'none' || box.style.display === '';
  const shouldShow = forceShow !== null ? forceShow : isHidden;
  box.style.display = shouldShow ? 'block' : 'none';
  if (shouldShow) {
    const input = document.getElementById('manual-location-input');
    if (input) input.focus();
  }
};

// ==========================================================================
// LOCATION-BASED NEARBY HEALTHCARE CENTRES & MAP VIEW
// ==========================================================================

function initNearbySearchAndFilter() {
  const searchInput = document.getElementById('nearby-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      nearbySearchQuery = e.target.value;
      renderNearbyCentres();
      initOrUpdateHealthcareMap();
    });
  }

  const manualForm = document.getElementById('manual-location-form');
  if (manualForm) {
    manualForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const area = document.getElementById('manual-location-input').value.trim();
      if (!area) return;

      // Simulated realistic geocoding offset for manual search
      patientCoordinates = {
        lat: 17.3850 + (Math.random() * 0.02 - 0.01),
        lng: 78.4867 + (Math.random() * 0.02 - 0.01)
      };
      detectedLocationLabel = `${area} (Manual Location)`;
      updateLocationHeaderDisplay(detectedLocationLabel);
      toggleManualLocationInput(false);
      PulseCareUI.showToast('Location Set', `Showing healthcare centres for "${area}"`, 'success');
      renderNearbyCentres();
      initOrUpdateHealthcareMap();
    });
  }
}

window.setNearbyTypeFilter = function(type) {
  nearbyTypeFilter = type;
  const pills = document.querySelectorAll('#nearby-type-pills .chip-btn');
  pills.forEach(p => {
    if (p.getAttribute('data-type') === type) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });
  renderNearbyCentres();
  initOrUpdateHealthcareMap();
};

window.setNearbyDistanceFilter = function(dist) {
  nearbyDistanceFilter = dist ? parseFloat(dist) : null;
  const pills = document.querySelectorAll('#nearby-distance-pills .chip-btn');
  pills.forEach(p => {
    const val = p.getAttribute('data-dist');
    if ((dist === null && val === 'null') || val === String(dist)) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });
  renderNearbyCentres();
  initOrUpdateHealthcareMap();
};

window.resetNearbyFilters = function() {
  nearbyTypeFilter = 'All';
  nearbyDistanceFilter = null;
  nearbySearchQuery = '';
  const searchInput = document.getElementById('nearby-search-input');
  if (searchInput) searchInput.value = '';

  const typePills = document.querySelectorAll('#nearby-type-pills .chip-btn');
  typePills.forEach(p => p.classList.toggle('active', p.getAttribute('data-type') === 'All'));

  const distPills = document.querySelectorAll('#nearby-distance-pills .chip-btn');
  distPills.forEach(p => p.classList.toggle('active', p.getAttribute('data-dist') === 'null'));

  renderNearbyCentres();
  initOrUpdateHealthcareMap();
};

function renderNearbyCentres() {
  const container = document.getElementById('nearby-centres-grid');
  const countEl = document.getElementById('nearby-results-count');
  if (!container) return;

  const centres = PulseCareStore.getNearbyCentres({
    filterType: nearbyTypeFilter,
    maxDistanceKm: nearbyDistanceFilter,
    search: nearbySearchQuery,
    userCoords: patientCoordinates
  });

  if (countEl) {
    countEl.textContent = `Showing ${centres.length} healthcare ${centres.length === 1 ? 'facility' : 'facilities'} ${nearbyDistanceFilter ? `within ${nearbyDistanceFilter} km` : 'near your location'}`;
  }

  if (centres.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding:3rem 1rem; background:var(--bg-surface); border-radius:var(--radius-md); border:1px solid var(--border-light);">
        <p style="font-size:1.1rem; color:var(--text-muted); margin-bottom:1rem;">No healthcare centres found matching your active filter criteria.</p>
        <button class="btn btn-sm btn-primary" onclick="resetNearbyFilters()">Reset Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = centres.map(c => `
    <div class="portal-card" style="border-top:4px solid ${getFacilityTypeColor(c.category)}; display:flex; flex-direction:column; height:100%;">
      
      <!-- Card Header -->
      <div class="portal-card-header" style="background:var(--bg-surface-elevated); align-items:flex-start; gap:0.5rem;">
        <div style="flex:1;">
          <span class="badge ${getFacilityBadgeClass(c.category)}" style="margin-bottom:0.25rem;">${c.type}</span>
          <h4 style="font-size:1.1rem; font-weight:700; color:var(--text-primary); margin:0;">${c.name}</h4>
        </div>
        <span class="badge badge-emerald" style="white-space:nowrap; font-weight:700;">📍 ${c.distance}</span>
      </div>

      <!-- Card Body -->
      <div class="portal-card-body" style="display:flex; flex-direction:column; gap:0.75rem; flex:1;">
        
        <p style="font-size:0.85rem; color:var(--text-secondary); margin:0;">
          📍 <strong>Address:</strong> ${c.location}
        </p>

        <p style="font-size:0.825rem; color:var(--text-muted); margin:0;">
          🕐 <strong>Availability:</strong> ${c.timing}
        </p>

        <p style="font-size:0.85rem; color:var(--hospital-teal-700); font-weight:700; margin:0;">
          ☎️ <strong>Helpline:</strong> <a href="tel:${c.phone.split(' ')[0]}" style="color:inherit; text-decoration:underline;">${c.phone}</a>
        </p>

        <!-- Services Tags -->
        <div style="margin-top:0.25rem;">
          <strong style="font-size:0.775rem; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Available Services:</strong>
          <div style="display:flex; flex-wrap:wrap; gap:0.35rem;">
            ${c.services.slice(0, 3).map(s => `
              <span class="badge" style="background:var(--bg-input); color:var(--text-primary); font-size:0.7rem; font-weight:600; text-transform:none;">${s}</span>
            `).join('')}
            ${c.services.length > 3 ? `<span class="badge badge-purple" style="font-size:0.7rem;">+${c.services.length - 3} more</span>` : ''}
          </div>
        </div>

        ${c.pmjayEmpanelled ? `
          <div style="padding:0.45rem 0.65rem; background:rgba(13, 148, 136, 0.08); border-radius:var(--radius-xs); font-size:0.75rem; color:var(--hospital-teal-800); font-weight:700;">
            ✓ PM-JAY Empanelled Golden Card Desk Available
          </div>
        ` : ''}

        <!-- Actions -->
        <div style="margin-top:auto; padding-top:0.75rem; border-top:1px solid var(--border-light); display:flex; gap:0.5rem; flex-wrap:wrap;">
          <a href="${c.directionsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary" style="flex:1; text-align:center; min-width:110px;">
            <svg class="icon" style="width:13px; height:13px;" viewBox="0 0 24 24"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            <span>Get Directions</span>
          </a>
          <a href="tel:${c.phone.split(' ')[0]}" class="btn btn-sm btn-secondary" style="flex:1; text-align:center; min-width:70px;">
            <svg class="icon" style="width:13px; height:13px;" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/></svg>
            <span>Call</span>
          </a>
          <button class="btn btn-sm btn-outline" style="flex:1; min-width:90px;" onclick="openFacilityDetailsModal('${c.id}')">
            <span>View Details</span>
          </button>
        </div>

      </div>
    </div>
  `).join('');
}

function getFacilityTypeColor(cat) {
  if (cat.includes('Emergency')) return 'var(--hospital-cross-red)';
  if (cat.includes('Government Hospitals') || cat.includes('CHC')) return 'var(--hospital-teal-600)';
  if (cat.includes('PHC') || cat.includes('Arogya Mandir')) return 'var(--hospital-healing-green)';
  if (cat.includes('Pharmacies')) return '#d97706';
  if (cat.includes('Diagnostic')) return '#8b5cf6';
  return 'var(--hospital-blue)';
}

function getFacilityBadgeClass(cat) {
  if (cat.includes('Emergency')) return 'badge-danger';
  if (cat.includes('Government Hospitals') || cat.includes('CHC')) return 'badge-primary';
  if (cat.includes('PHC') || cat.includes('Arogya Mandir')) return 'badge-emerald';
  if (cat.includes('Pharmacies')) return 'badge-amber';
  if (cat.includes('Diagnostic')) return 'badge-purple';
  return 'badge-primary';
}

// Leaflet Map Initialization & Marker Updates
function initOrUpdateHealthcareMap() {
  const mapEl = document.getElementById('healthcare-map');
  if (!mapEl || typeof L === 'undefined') return;

  const centres = PulseCareStore.getNearbyCentres({
    filterType: nearbyTypeFilter,
    maxDistanceKm: nearbyDistanceFilter,
    search: nearbySearchQuery,
    userCoords: patientCoordinates
  });

  if (!leafletMapInstance) {
    leafletMapInstance = L.map('healthcare-map').setView([patientCoordinates.lat, patientCoordinates.lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(leafletMapInstance);

    mapMarkersLayer = L.layerGroup().addTo(leafletMapInstance);
  } else {
    leafletMapInstance.invalidateSize();
  }

  // Clear previous markers
  if (mapMarkersLayer) {
    mapMarkersLayer.clearLayers();
  }

  // User Location Marker (Pulse Dot)
  const userIcon = L.divIcon({
    className: 'custom-user-marker',
    html: `<div style="width:20px; height:20px; background:#0284c7; border:3px solid #ffffff; border-radius:50%; box-shadow:0 0 10px rgba(2,132,199,0.8); animation:pulse 1.5s infinite;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  userMarker = L.marker([patientCoordinates.lat, patientCoordinates.lng], { icon: userIcon })
    .bindPopup(`<strong>📍 You are here</strong><br><span style="font-size:0.8rem; color:#64748b;">${detectedLocationLabel}</span>`)
    .addTo(mapMarkersLayer);

  // Facility Markers
  centres.forEach(c => {
    const pinColor = getFacilityPinColorHex(c.category);
    const facIcon = L.divIcon({
      className: 'custom-fac-marker',
      html: `<div style="width:26px; height:26px; background:${pinColor}; border:2px solid #ffffff; border-radius:50% 50% 50% 0; transform:rotate(-45deg); display:flex; align-items:center; justify-content:center; box-shadow:0 3px 8px rgba(0,0,0,0.3);"><div style="width:8px; height:8px; background:#ffffff; border-radius:50%;"></div></div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 26],
      popupAnchor: [0, -26]
    });

    const marker = L.marker([c.lat, c.lng], { icon: facIcon }).addTo(mapMarkersLayer);
    marker.bindPopup(`
      <div style="font-family:system-ui, sans-serif; min-width:180px;">
        <span class="badge ${getFacilityBadgeClass(c.category)}" style="font-size:0.65rem; margin-bottom:2px;">${c.type}</span>
        <h4 style="margin:2px 0; font-size:0.95rem; color:#0b2238;">${c.name}</h4>
        <p style="margin:0; font-size:0.8rem; color:#0d9488; font-weight:700;">📍 ${c.distance} away</p>
        <p style="margin:2px 0 6px; font-size:0.75rem; color:#64748b;">${c.timing}</p>
        <div style="display:flex; gap:4px;">
          <a href="${c.directionsUrl}" target="_blank" class="btn btn-sm btn-primary" style="font-size:0.7rem; padding:2px 6px;">Directions</a>
          <button class="btn btn-sm btn-outline" style="font-size:0.7rem; padding:2px 6px;" onclick="openFacilityDetailsModal('${c.id}')">Details</button>
        </div>
      </div>
    `);
  });

  // Fit bounds if markers exist
  if (centres.length > 0) {
    const bounds = L.latLngBounds([[patientCoordinates.lat, patientCoordinates.lng]]);
    centres.forEach(c => bounds.extend([c.lat, c.lng]));
    leafletMapInstance.fitBounds(bounds, { padding: [40, 40] });
  } else {
    leafletMapInstance.setView([patientCoordinates.lat, patientCoordinates.lng], 13);
  }
}

function getFacilityPinColorHex(cat) {
  if (cat.includes('Emergency')) return '#e11d48';
  if (cat.includes('Government Hospitals') || cat.includes('CHC')) return '#0d9488';
  if (cat.includes('PHC') || cat.includes('Arogya Mandir')) return '#059669';
  if (cat.includes('Pharmacies')) return '#d97706';
  if (cat.includes('Diagnostic')) return '#8b5cf6';
  return '#0284c7';
}

// Facility Details Modal
window.openFacilityDetailsModal = function(facilityId) {
  const fac = PulseCareStore.getNearbyCentreById(facilityId);
  if (!fac) return;

  const badgeEl = document.getElementById('modal-fac-badge');
  const titleEl = document.getElementById('modal-fac-title');
  const bodyEl = document.getElementById('facility-modal-body');

  if (badgeEl) badgeEl.textContent = fac.type;
  if (titleEl) titleEl.textContent = fac.name;

  bodyEl.innerHTML = `
    <!-- Top Highlights -->
    <div class="welcome-banner" style="padding:1.25rem; margin-bottom:1.5rem; background:linear-gradient(135deg, rgba(13, 148, 136, 0.12) 0%, rgba(2, 132, 199, 0.12) 100%);">
      <div class="welcome-text">
        <div style="display:flex; gap:0.5rem; margin-bottom:0.35rem; flex-wrap:wrap;">
          <span class="badge badge-emerald">📍 ${fac.distance || '1.2 km'} from your location</span>
          <span class="badge badge-purple">${fac.beds || 'Hospital Beds'}</span>
          <span class="badge badge-primary">${fac.doctorsCount || '8'} Doctors on Duty</span>
        </div>
        <p style="font-size:0.9rem; color:var(--text-secondary); margin:0;">${fac.location}</p>
      </div>
    </div>

    <!-- Contact & Operating Info -->
    <div class="dashboard-grid-2" style="margin-bottom:1.5rem;">
      <div class="glass-panel" style="padding:1rem;">
        <h4 style="font-size:0.95rem; margin-bottom:0.4rem; color:var(--hospital-teal-700);">Operating Hours & Contact</h4>
        <p style="font-size:0.85rem; margin-bottom:0.25rem;"><strong>Hours:</strong> ${fac.timing}</p>
        <p style="font-size:0.85rem; margin-bottom:0.25rem;"><strong>Helpline:</strong> <a href="tel:${fac.phone.split(' ')[0]}" style="color:var(--hospital-teal-600); font-weight:700;">${fac.phone}</a></p>
        <p style="font-size:0.85rem; margin:0;"><strong>Emergency Ready:</strong> ${fac.emergencyReady ? '🚨 Yes (24x7 Trauma & Ambulance)' : 'No (Day OPD)'}</p>
      </div>

      <div class="glass-panel" style="padding:1rem;">
        <h4 style="font-size:0.95rem; margin-bottom:0.4rem; color:var(--hospital-teal-700);">Govt Scheme Empanelled</h4>
        <p style="font-size:0.85rem; margin-bottom:0.25rem;"><strong>PM-JAY Golden Card:</strong> ${fac.pmjayEmpanelled ? '✓ Yes (Cashless Treatment)' : 'Outpatient Primary Only'}</p>
        <p style="font-size:0.85rem; margin-bottom:0.25rem;"><strong>Free Diagnostics:</strong> Available under NHM</p>
        <p style="font-size:0.85rem; margin:0;"><strong>Generic Pharmacy:</strong> Jan Aushadhi Kendra Desk</p>
      </div>
    </div>

    <!-- Complete Available Services -->
    <div style="margin-bottom:1.5rem;">
      <h4 style="font-size:1rem; margin-bottom:0.6rem; color:var(--text-primary);">Available Clinical & Diagnostic Services</h4>
      <div style="display:flex; flex-direction:column; gap:0.45rem;">
        ${fac.services.map(s => `
          <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; background:var(--bg-input); padding:0.6rem 0.85rem; border-radius:var(--radius-xs);">
            <svg class="icon" style="color:var(--hospital-healing-green); width:15px; height:15px; flex-shrink:0;" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            <span>${s}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Footer Actions -->
    <div style="display:flex; justify-content:space-between; align-items:center; padding-top:1rem; border-top:1px solid var(--border-light); flex-wrap:wrap; gap:0.75rem;">
      <a href="${fac.directionsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
        <svg class="icon" viewBox="0 0 24 24"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
        <span>Open Navigation Route (Google Maps)</span>
      </a>
      <a href="tel:${fac.phone.split(' ')[0]}" class="btn btn-secondary">
        <svg class="icon" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/></svg>
        <span>Call Hospital</span>
      </a>
    </div>
  `;

  PulseCareUI.openModal('facility-details-modal');
};

// Emergency SOS Trigger & Confirmation
window.triggerEmergencySOS = function() {
  const coordsDisplay = document.getElementById('sos-coords-display');
  if (coordsDisplay && patientCoordinates) {
    coordsDisplay.textContent = `${patientCoordinates.lat.toFixed(4)}° N, ${patientCoordinates.lng.toFixed(4)}° E`;
  }
  PulseCareUI.openModal('emergency-sos-modal');
};

window.confirmSOSDispatch = function() {
  PulseCareUI.closeModal('emergency-sos-modal');
  PulseCareUI.showToast('🚨 Emergency Dispatch Confirmed', 'Trauma Ambulance and Hospital ER team alerted with your live GPS location.', 'error');
};

// ==========================================================================
// PATIENT PROFILE, VITALS, APPOINTMENTS, LABS, PRESCRIPTIONS, SCHEMES
// ==========================================================================

function renderPatientData() {
  if (!currentPatient) return;

  document.querySelectorAll('.patient-name').forEach(el => el.textContent = currentPatient.name);
  const initials = currentPatient.name.split(' ').map(n => n[0]).join('');
  document.querySelectorAll('.patient-avatar-initials').forEach(el => el.textContent = initials);

  const mrn = currentPatient.mrn || 'MRN-2026-9082';
  const mrnEl = document.getElementById('sidebar-mrn');
  if (mrnEl) mrnEl.textContent = mrn;
  const profMrn = document.getElementById('prof-mrn');
  if (profMrn) profMrn.textContent = mrn;
  const mrnBadge = document.getElementById('pat-mrn-badge');
  if (mrnBadge) mrnBadge.textContent = mrn;

  const bloodEl = document.getElementById('pat-blood-type');
  if (bloodEl) bloodEl.textContent = currentPatient.bloodType || 'O+';
  const profBlood = document.getElementById('prof-blood');
  if (profBlood) profBlood.textContent = currentPatient.bloodType || 'O+';

  const ageGenderEl = document.getElementById('pat-age-gender');
  if (ageGenderEl) ageGenderEl.textContent = `${currentPatient.age} yrs • ${currentPatient.gender}`;
  const profAge = document.getElementById('prof-age');
  if (profAge) profAge.textContent = `${currentPatient.age} years`;
  const profGender = document.getElementById('prof-gender');
  if (profGender) profGender.textContent = currentPatient.gender;
  const profDob = document.getElementById('prof-dob');
  if (profDob) profDob.textContent = currentPatient.dob || '1992-04-15';

  const profPhone = document.getElementById('prof-phone');
  if (profPhone) profPhone.textContent = currentPatient.phone;
  const profEmail = document.getElementById('prof-email');
  if (profEmail) profEmail.textContent = currentPatient.email;
  const profAddress = document.getElementById('prof-address');
  if (profAddress) profAddress.textContent = currentPatient.address;

  const profInsurance = document.getElementById('prof-insurance');
  if (profInsurance) {
    profInsurance.textContent = typeof currentPatient.insurance === 'object' ? currentPatient.insurance.provider : currentPatient.insurance;
  }

  const healthStatusEl = document.getElementById('dash-health-status');
  if (healthStatusEl && currentPatient.healthStatus) {
    healthStatusEl.innerHTML = `Current Health Status: <strong style="color:var(--hospital-healing-green);">${currentPatient.healthStatus}</strong>`;
  }

  const vit = currentPatient.vitals || {};
  const hrEl = document.getElementById('ov-heart-rate');
  if (hrEl) hrEl.textContent = vit.heartRate || 72;

  const bpEl = document.getElementById('ov-bp');
  if (bpEl) bpEl.textContent = vit.bloodPressure || '118/78';

  const tempEl = document.getElementById('ov-temp');
  if (tempEl) tempEl.textContent = vit.temperature ? vit.temperature.split(' ')[0] : '98.6';

  const o2El = document.getElementById('ov-spo2');
  if (o2El) o2El.textContent = vit.spO2 || 99;
}

function renderAppointments() {
  const allApts = PulseCareStore.getAppointments(currentPatient.id);
  const upcomingContainer = document.getElementById('appointments-upcoming-list');
  const pastContainer = document.getElementById('appointments-past-list');
  const ovContainer = document.getElementById('ov-appointments-list');

  const upcoming = allApts.filter(a => a.status !== 'completed' && a.status !== 'cancelled');
  const past = allApts.filter(a => a.status === 'completed');

  if (ovContainer) {
    if (upcoming.length === 0) {
      ovContainer.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">No upcoming appointments scheduled.</p>`;
    } else {
      ovContainer.innerHTML = upcoming.slice(0, 2).map(apt => createAppointmentItemHTML(apt)).join('');
    }
  }

  if (upcomingContainer) {
    if (upcoming.length === 0) {
      upcomingContainer.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">No upcoming appointments. Click "Book New Appointment" to schedule.</p>`;
    } else {
      upcomingContainer.innerHTML = upcoming.map(apt => createAppointmentItemHTML(apt, true)).join('');
    }
  }

  if (pastContainer) {
    if (past.length === 0) {
      pastContainer.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">No past appointment records found.</p>`;
    } else {
      pastContainer.innerHTML = past.map(apt => createPastAppointmentHTML(apt)).join('');
    }
  }
}

function createAppointmentItemHTML(apt, full = false) {
  const dateObj = new Date(apt.date + 'T00:00:00');
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = monthNames[dateObj.getMonth()] || 'SEP';
  const day = dateObj.getDate() || '04';

  const isTelehealth = apt.type.toLowerCase().includes('telehealth') || apt.type.toLowerCase().includes('video');
  const isReadyForCall = isTelehealth && (apt.status === 'confirmed' || apt.status === 'in-consultation');

  return `
    <div class="appointment-item">
      <div class="appointment-meta">
        <div class="appointment-time-box">
          <span class="day">${day}</span>
          <span class="month">${month}</span>
        </div>
        <div class="appointment-info">
          <h4>${apt.reason}</h4>
          <p><strong>${apt.doctorName}</strong> &bull; ${apt.doctorSpecialty || 'Specialist'}</p>
          <p style="font-size:0.775rem; color:var(--text-muted); margin-top:2px;">
            ${apt.time} &bull; <span class="badge ${isTelehealth ? 'badge-purple' : 'badge-emerald'}" style="padding:0.1rem 0.4rem;">${apt.type}</span>
          </p>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:0.5rem;">
        <span class="badge ${apt.status === 'waiting' ? 'badge-amber' : 'badge-emerald'}">${apt.status}</span>
        ${isReadyForCall ? `
          <button class="btn btn-sm btn-emerald" onclick="joinTelehealthRoom('${apt.id}')">
            <svg class="icon" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            <span>Join Video</span>
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

function createPastAppointmentHTML(apt) {
  return `
    <div class="appointment-item" style="opacity:0.9;">
      <div class="appointment-meta">
        <div class="appointment-time-box" style="background:var(--bg-hover); color:var(--text-primary);">
          <span class="day">${apt.date.split('-')[2]}</span>
          <span class="month">${apt.date.split('-')[1]}</span>
        </div>
        <div class="appointment-info">
          <h4>${apt.reason}</h4>
          <p><strong>${apt.doctorName}</strong> &bull; ${apt.doctorSpecialty || 'Specialist'}</p>
          <p style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">
            Encounter Note: <em>"${apt.notes || 'Consultation concluded successfully.'}"</em>
          </p>
        </div>
      </div>
      <div>
        <span class="badge badge-purple">Completed</span>
      </div>
    </div>
  `;
}

function renderPrescriptions() {
  const rxs = PulseCareStore.getPrescriptions(currentPatient.id);
  const fullContainer = document.getElementById('prescriptions-list');
  const ovContainer = document.getElementById('ov-prescriptions-list');

  if (ovContainer) {
    ovContainer.innerHTML = rxs.slice(0, 2).map(rx => `
      <div class="glass-panel" style="padding:1rem; margin-bottom:0.75rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
          <strong style="font-size:1rem;">${rx.medicationName} ${rx.strength}</strong>
          <span class="badge badge-emerald">Active</span>
        </div>
        <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.5rem;">${rx.dosage}</p>
        <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted);">
          <span>${rx.pillsRemaining} of ${rx.totalPills} remaining</span>
          <span>${rx.refillsRemaining} refills left</span>
        </div>
      </div>
    `).join('');
  }

  if (fullContainer) {
    if (rxs.length === 0) {
      fullContainer.innerHTML = `<p style="color:var(--text-muted);">No active prescriptions found.</p>`;
      return;
    }

    fullContainer.innerHTML = rxs.map(rx => {
      const pct = Math.round((rx.pillsRemaining / rx.totalPills) * 100);
      return `
        <div class="rx-card">
          <div class="rx-badge-top">
            <span class="badge badge-emerald">Active Rx</span>
            <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted);">Rx #${rx.id}</span>
          </div>

          <div>
            <h4 class="rx-name">${rx.medicationName} <span style="font-size:0.95rem; color:var(--hospital-teal-600);">${rx.strength}</span></h4>
            <p class="rx-dosage">${rx.dosage}</p>
            <p style="font-size:0.775rem; color:var(--text-muted); margin-top:4px;">
              <strong>Indication:</strong> ${rx.purpose} &bull; <strong>Prescribed by:</strong> ${rx.doctorName}
            </p>
          </div>

          <div>
            <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;">
              <span>Supply: <strong>${rx.pillsRemaining}</strong> / ${rx.totalPills} units</span>
              <span><strong>${rx.refillsRemaining}</strong> Refills Left</span>
            </div>
            <div class="rx-progress-bar">
              <div class="rx-progress-fill" style="width: ${pct}%;"></div>
            </div>
          </div>

          <div style="margin-top:auto; pt:0.5rem;">
            <button class="btn btn-sm btn-primary" style="width:100%;" onclick="handleRefillRequest('${rx.id}')">
              <svg class="icon" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              <span>1-Click Refill Request</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
}

function handleRefillRequest(rxId) {
  const res = PulseCareStore.requestRefill(rxId);
  if (res.success) {
    PulseCareUI.showToast('Refill Authorized', `Refill order for ${res.rx.medicationName} transmitted to pharmacy network!`, 'success');
    renderPrescriptions();
  } else {
    PulseCareUI.showToast('Refill Failed', res.message, 'error');
  }
}

function renderMedicalRecords() {
  if (!currentPatient) return;

  const allergyContainer = document.getElementById('allergies-container');
  if (allergyContainer && currentPatient.allergies) {
    allergyContainer.innerHTML = `
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:1rem;">
        ${currentPatient.allergies.map(al => `
          <div class="glass-panel" style="padding:1rem; border-left:3px solid var(--hospital-cross-red);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
              <strong style="color:var(--hospital-cross-red); font-size:1rem;">${al.allergen}</strong>
              <span class="badge badge-danger">${al.severity}</span>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted);">Reaction: ${al.reaction}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  const diagnosesContainer = document.getElementById('diagnoses-container');
  if (diagnosesContainer && currentPatient.previousDiagnoses) {
    diagnosesContainer.innerHTML = currentPatient.previousDiagnoses.map(d => `
      <div style="padding:0.75rem 0; border-bottom:1px solid var(--border-light);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong>${d.name}</strong>
          <span class="badge badge-primary">${d.code}</span>
        </div>
        <p style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">
          Diagnosed: ${d.date} by ${d.doctor}
        </p>
      </div>
    `).join('');
  }

  const historyContainer = document.getElementById('history-container');
  if (historyContainer && currentPatient.medicalHistory) {
    historyContainer.innerHTML = currentPatient.medicalHistory.map(h => `
      <div style="padding:0.75rem 0; border-bottom:1px solid var(--border-light);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong>${h.event}</strong>
          <span class="badge badge-purple">${h.year}</span>
        </div>
        <p style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">
          Facility: ${h.facility} &bull; Outcome: ${h.outcome}
        </p>
      </div>
    `).join('');
  }

  const labs = PulseCareStore.getLabReports(currentPatient.id);
  const labContainer = document.getElementById('lab-reports-list');
  if (labContainer) {
    if (labs.length === 0) {
      labContainer.innerHTML = `<p style="color:var(--text-muted);">No lab reports uploaded.</p>`;
    } else {
      labContainer.innerHTML = labs.map(lab => `
        <div class="appointment-item">
          <div class="appointment-meta">
            <div class="appointment-time-box" style="background:var(--hospital-healing-green);">
              <span class="day">LAB</span>
              <span class="month">REP</span>
            </div>
            <div class="appointment-info">
              <h4>${lab.title}</h4>
              <p><strong>${lab.facility}</strong> &bull; Authenticated: ${lab.date}</p>
              <p style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">
                ${lab.summary}
              </p>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span class="badge badge-emerald">${lab.status}</span>
            <button class="btn btn-sm btn-outline" onclick="openLabModal('${lab.id}')">
              <svg class="icon" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <span>View Full Report</span>
            </button>
          </div>
        </div>
      `).join('');
    }
  }
}

function renderScans() {
  const scans = PulseCareStore.getScans(currentPatient.id);
  const scanContainer = document.getElementById('scans-list');
  if (!scanContainer) return;

  if (scans.length === 0) {
    scanContainer.innerHTML = `<p style="color:var(--text-muted);">No imaging scan records archived.</p>`;
  } else {
    scanContainer.innerHTML = scans.map(sc => `
      <div class="appointment-item">
        <div class="appointment-meta">
          <div class="appointment-time-box" style="background:var(--hospital-blue);">
            <span class="day">SCAN</span>
            <span class="month">IMG</span>
          </div>
          <div class="appointment-info">
            <h4>${sc.title}</h4>
            <p><strong>${sc.modality}</strong> &bull; Date: ${sc.date}</p>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">
              Radiologist: ${sc.radiologist} &bull; Impression: <em>"${sc.impression}"</em>
            </p>
          </div>
        </div>
        <div>
          <span class="badge badge-primary">${sc.status}</span>
        </div>
      </div>
    `).join('');
  }
}

function renderTelehealthHistory() {
  const container = document.getElementById('telehealth-history-container');
  if (!container) return;

  const prevApts = PulseCareStore.getAppointments(currentPatient.id).filter(a => a.type.toLowerCase().includes('telehealth') && a.status === 'completed');

  if (prevApts.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">No completed video consultation archives yet.</p>`;
  } else {
    container.innerHTML = prevApts.map(apt => `
      <div class="appointment-item">
        <div class="appointment-meta">
          <div class="appointment-time-box" style="background:var(--primary-gradient);">
            <span class="day">HD</span>
            <span class="month">VIDEO</span>
          </div>
          <div class="appointment-info">
            <h4>${apt.reason}</h4>
            <p><strong>${apt.doctorName}</strong> &bull; Completed on ${apt.date}</p>
            <p style="font-size:0.8rem; color:var(--text-muted);">Summary: ${apt.notes}</p>
          </div>
        </div>
        <span class="badge badge-purple">Archived</span>
      </div>
    `).join('');
  }
}

// ==========================================================================
// GOVERNMENT HEALTHCARE SCHEMES CONTROLLER
// ==========================================================================

function renderGovernmentSchemes(category = 'All', search = '') {
  const container = document.getElementById('schemes-grid-container');
  if (!container) return;

  const schemes = PulseCareStore.getGovernmentSchemes(category, search);

  if (schemes.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding:3rem 1rem; background:var(--bg-surface); border-radius:var(--radius-md); border:1px solid var(--border-light);">
        <p style="font-size:1.1rem; color:var(--text-muted); margin-bottom:1rem;">No government schemes found matching your filter.</p>
        <button class="btn btn-sm btn-primary" onclick="document.getElementById('scheme-search-input').value=''; filterSchemes('All');">View All Schemes</button>
      </div>
    `;
    return;
  }

  container.innerHTML = schemes.map(s => `
    <div class="portal-card" style="border-top:4px solid ${getCategoryColor(s.category)}; display:flex; flex-direction:column; height:100%;">
      <div class="portal-card-header" style="background:var(--bg-surface-elevated); align-items:flex-start; gap:0.5rem;">
        <div style="flex:1;">
          <span class="badge ${getCategoryBadgeClass(s.category)}" style="margin-bottom:0.35rem;">${s.category}</span>
          <h3 style="font-size:1.15rem; font-weight:700; line-height:1.3; color:var(--text-primary);">${s.name}</h3>
          ${s.hindiName ? `<p style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">${s.hindiName}</p>` : ''}
        </div>
        <span class="badge badge-emerald" style="white-space:nowrap;">${s.badge}</span>
      </div>

      <div class="portal-card-body" style="display:flex; flex-direction:column; gap:1rem; flex:1;">
        <p style="font-size:0.875rem; line-height:1.5; color:var(--text-secondary);">${s.shortDesc}</p>

        <div style="font-size:0.775rem; color:var(--text-muted); display:flex; align-items:center; gap:0.4rem;">
          <svg class="icon" style="width:14px; height:14px; flex-shrink:0; color:var(--hospital-teal-600);" viewBox="0 0 24 24"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7M4 4h16a1 1 0 0 1 1 1v2H3V5a1 1 0 0 1 1-1z"/></svg>
          <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${s.department}</span>
        </div>

        <div style="background:var(--bg-input); padding:0.85rem; border-radius:var(--radius-sm); font-size:0.825rem;">
          <strong style="color:var(--text-primary); display:block; margin-bottom:0.35rem;">Key Benefits:</strong>
          <ul style="padding-left:1.15rem; margin:0; color:var(--text-secondary); line-height:1.45;">
            ${s.benefits.slice(0, 2).map(b => `<li style="margin-bottom:3px;">${b}</li>`).join('')}
          </ul>
        </div>

        <div style="font-size:0.8rem; color:var(--text-muted);">
          <strong>Eligibility:</strong> ${s.eligibility[0]}
        </div>

        <div style="margin-top:auto; padding-top:0.75rem; border-top:1px solid var(--border-light); display:flex; flex-direction:column; gap:0.5rem;">
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-sm btn-primary" style="flex:1;" onclick="openSchemeDetailsModal('${s.id}')">
              <span>View Full Details</span>
            </button>
            <button class="btn btn-sm btn-secondary" style="flex:1;" onclick="openSchemeEligibilityFor('${s.id}')">
              <span>Check Eligibility</span>
            </button>
          </div>
          <a href="${s.officialUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline" style="text-align:center;">
            <span>Official Portal</span>
            <svg class="icon" style="width:12px; height:12px;" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

function getCategoryColor(cat) {
  if (cat.includes('Tribal')) return '#f59e0b';
  if (cat.includes('Infrastructure')) return 'var(--hospital-blue)';
  if (cat.includes('Rural')) return 'var(--hospital-healing-green)';
  if (cat.includes('Insurance')) return 'var(--hospital-teal-600)';
  if (cat.includes('Telemedicine')) return 'var(--hospital-blue)';
  if (cat.includes('Vaccination')) return 'var(--hospital-healing-green)';
  if (cat.includes('Maternal')) return '#d946ef';
  if (cat.includes('Disease')) return 'var(--hospital-cross-red)';
  return 'var(--hospital-teal-700)';
}

function getCategoryBadgeClass(cat) {
  if (cat.includes('Tribal')) return 'badge-amber';
  if (cat.includes('Infrastructure')) return 'badge-primary';
  if (cat.includes('Rural')) return 'badge-emerald';
  if (cat.includes('Insurance')) return 'badge-primary';
  if (cat.includes('Telemedicine')) return 'badge-purple';
  if (cat.includes('Vaccination')) return 'badge-emerald';
  if (cat.includes('Maternal')) return 'badge-purple';
  if (cat.includes('Disease')) return 'badge-danger';
  return 'badge-primary';
}

function initSchemesSearchAndFilter() {
  const searchInput = document.getElementById('scheme-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderGovernmentSchemes(currentSchemeCategory, e.target.value);
    });
  }
}

window.filterSchemes = function(category) {
  currentSchemeCategory = category;
  const pills = document.querySelectorAll('#scheme-category-pills .chip-btn');
  pills.forEach(p => p.classList.toggle('active', p.getAttribute('data-cat') === category));
  const q = document.getElementById('scheme-search-input')?.value || '';
  renderGovernmentSchemes(category, q);
};

window.openSchemeDetailsModal = function(schemeId) {
  const scheme = PulseCareStore.getSchemeById(schemeId);
  if (!scheme) return;

  const modalDept = document.getElementById('modal-scheme-dept');
  const modalTitle = document.getElementById('modal-scheme-title');
  const modalBody = document.getElementById('scheme-modal-body');

  if (modalDept) modalDept.textContent = scheme.department;
  if (modalTitle) modalTitle.textContent = scheme.name;

  modalBody.innerHTML = `
    <div class="welcome-banner" style="padding:1.25rem; margin-bottom:1.5rem; background:linear-gradient(135deg, rgba(13, 148, 136, 0.12) 0%, rgba(2, 132, 199, 0.12) 100%);">
      <div class="welcome-text">
        <span class="badge badge-emerald" style="margin-bottom:0.25rem;">${scheme.badge}</span>
        <h4 style="font-size:1.15rem; margin-bottom:0.2rem;">${scheme.shortName} Purpose</h4>
        <p style="font-size:0.875rem; color:var(--text-secondary);">${scheme.purpose}</p>
      </div>
    </div>

    <div style="background:rgba(2, 132, 199, 0.08); border-left:4px solid var(--hospital-blue); padding:0.85rem 1rem; border-radius:var(--radius-xs); margin-bottom:1.5rem; font-size:0.85rem;">
      <strong style="color:var(--hospital-blue);">📌 Beneficiary Status:</strong>
      <span>You are <strong>Potentially Eligible</strong> for this scheme based on public health entitlements. Final verification is conducted on official government portals.</span>
    </div>

    <div style="margin-bottom:1.5rem;">
      <h4 style="font-size:1.05rem; margin-bottom:0.6rem; color:var(--hospital-teal-700);">Key Benefits</h4>
      <div style="display:flex; flex-direction:column; gap:0.5rem;">
        ${scheme.benefits.map(b => `
          <div style="display:flex; align-items:flex-start; gap:0.5rem; font-size:0.875rem; background:var(--bg-input); padding:0.65rem 0.85rem; border-radius:var(--radius-xs);">
            <svg class="icon" style="color:var(--hospital-healing-green); width:16px; height:16px; margin-top:2px; flex-shrink:0;" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            <span>${b}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="dashboard-grid-2" style="margin-bottom:1.5rem;">
      <div class="glass-panel" style="padding:1.15rem;">
        <h4 style="font-size:0.95rem; margin-bottom:0.5rem;">Eligibility Criteria</h4>
        <ul style="padding-left:1.15rem; font-size:0.825rem; color:var(--text-secondary); line-height:1.5;">
          ${scheme.eligibility.map(e => `<li style="margin-bottom:4px;">${e}</li>`).join('')}
        </ul>
      </div>

      <div class="glass-panel" style="padding:1.15rem;">
        <h4 style="font-size:0.95rem; margin-bottom:0.5rem;">Required Documents</h4>
        <ul style="padding-left:1.15rem; font-size:0.825rem; color:var(--text-secondary); line-height:1.5;">
          ${scheme.documents.map(d => `<li style="margin-bottom:4px;">${d}</li>`).join('')}
        </ul>
      </div>
    </div>

    <div style="margin-bottom:1.5rem;">
      <h4 style="font-size:1.05rem; margin-bottom:0.6rem; color:var(--hospital-teal-700);">How to Apply</h4>
      <div style="display:flex; flex-direction:column; gap:0.5rem;">
        ${scheme.howToApply.map((step, idx) => `
          <div style="display:flex; align-items:flex-start; gap:0.75rem; font-size:0.875rem;">
            <span style="width:24px; height:24px; border-radius:50%; background:var(--primary-gradient); color:#fff; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:800; flex-shrink:0;">${idx + 1}</span>
            <p style="margin:0; font-size:0.85rem; color:var(--text-secondary);">${step}</p>
          </div>
        `).join('')}
      </div>
    </div>

    ${scheme.faqs && scheme.faqs.length ? `
      <div style="margin-bottom:1.5rem;">
        <h4 style="font-size:1.05rem; margin-bottom:0.6rem; color:var(--hospital-teal-700);">Frequently Asked Questions</h4>
        <div style="display:flex; flex-direction:column; gap:0.5rem;">
          ${scheme.faqs.map(f => `
            <div style="background:var(--bg-input); padding:0.75rem 1rem; border-radius:var(--radius-xs);">
              <strong style="font-size:0.85rem; color:var(--text-primary); display:block; margin-bottom:2px;">Q: ${f.q}</strong>
              <p style="font-size:0.825rem; color:var(--text-secondary); margin:0;">${f.a}</p>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <div style="display:flex; justify-content:space-between; align-items:center; padding-top:1rem; border-top:1px solid var(--border-light); flex-wrap:wrap; gap:0.75rem;">
      <a href="${scheme.portalUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-emerald">
        <svg class="icon" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        <span>Open Official Portal</span>
      </a>
      <button class="btn btn-primary" data-close-modal="scheme-details-modal">Close</button>
    </div>
  `;

  PulseCareUI.openModal('scheme-details-modal');
};

window.openSchemeEligibilityFor = function(schemeId) {
  PulseCareUI.openModal('eligibility-modal');
};

function initEligibilityChecker() {
  const form = document.getElementById('eligibility-form');
  const resultsContainer = document.getElementById('eligibility-results-container');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const results = PulseCareStore.evaluateSchemeEligibility({
        ageGroup: document.getElementById('elig-age').value,
        state: document.getElementById('elig-state').value,
        location: document.getElementById('elig-location').value,
        incomeCategory: document.getElementById('elig-income').value,
        specialStatus: document.getElementById('elig-status').value
      });

      if (resultsContainer) {
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
          <div style="border-top:2px solid var(--hospital-teal-600); padding-top:1.25rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
              <h4 style="font-size:1.15rem; color:var(--text-primary);">🎯 Scheme Eligibility Results</h4>
              <span class="badge badge-emerald">Evaluated</span>
            </div>

            <div style="background:rgba(245, 158, 11, 0.12); border:1px solid rgba(245, 158, 11, 0.4); border-radius:var(--radius-xs); padding:0.85rem 1rem; margin-bottom:1.25rem; font-size:0.825rem; color:var(--text-primary);">
              <strong>⚠️ Guidance Disclaimer:</strong> Eligibility information shown here is for guidance only. Please verify eligibility through the official government portal.
            </div>

            <div style="display:flex; flex-direction:column; gap:0.75rem;">
              ${results.map(r => `
                <div class="glass-panel" style="padding:1rem; border-left:4px solid ${getEligibilityStatusColor(r.status)};">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.25rem; flex-wrap:wrap; gap:0.4rem;">
                    <div>
                      <strong style="font-size:0.95rem; color:var(--text-primary);">${r.schemeName}</strong>
                      <span class="badge ${getCategoryBadgeClass(r.category)}" style="margin-left:6px; font-size:0.65rem;">${r.category}</span>
                    </div>
                    ${getEligibilityBadgeHTML(r.status)}
                  </div>
                  <p style="font-size:0.825rem; color:var(--text-secondary); margin:0.35rem 0 0.5rem;">
                    ${r.reason}
                  </p>
                  <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
                    <a href="${r.portalUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline" style="font-size:0.75rem; padding:0.25rem 0.6rem;">
                      <span>Verify Officially</span>
                      <svg class="icon" style="width:10px; height:10px;" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        PulseCareUI.showToast('Evaluation Complete', 'Your scheme eligibility report has been generated.', 'success');
      }
    });
  }
}

function getEligibilityStatusColor(status) {
  if (status === 'Eligible') return 'var(--hospital-healing-green)';
  if (status === 'Verify') return 'var(--hospital-blue)';
  return 'var(--text-muted)';
}

function getEligibilityBadgeHTML(status) {
  if (status === 'Eligible') {
    return `<span class="badge badge-emerald">🟢 Potentially Eligible</span>`;
  } else if (status === 'Verify') {
    return `<span class="badge badge-purple">🟡 Please Verify Officially</span>`;
  } else {
    return `<span class="badge" style="background:rgba(100, 116, 139, 0.2); color:#64748b;">⚪ May Not Be Eligible</span>`;
  }
}

// Telehealth WebRTC Simulator
window.joinTelehealthRoom = function(aptId) {
  const apt = PulseCareStore.getAppointments().find(a => a.id === aptId) || PulseCareStore.getAppointments()[0];
  const modalBody = document.getElementById('telehealth-modal-body');

  modalBody.innerHTML = `
    <div style="background:#000000; border-radius:var(--radius-md); overflow:hidden; position:relative; aspect-ratio:16/9; display:flex; align-items:center; justify-content:center; margin-bottom:1rem;">
      <div style="text-align:center; color:#ffffff;">
        <div class="user-avatar" style="width:80px; height:80px; font-size:2rem; margin:0 auto 1rem; background:var(--primary-gradient);">SL</div>
        <h3 style="color:#ffffff; font-size:1.3rem;">Dr. Sarah Lin, MD (Cardiologist)</h3>
        <p style="color:#10b981; font-size:0.9rem;">● Encrypted WebRTC HD Stream Live (1080p 60fps)</p>
        <p style="font-size:0.8rem; color:#94a3b8; margin-top:4px;">Encounter: ${apt ? apt.reason : 'Cardiology Consultation'}</p>
      </div>
      <div style="position:absolute; bottom:16px; right:16px; width:140px; aspect-ratio:4/3; background:#1e293b; border:2px solid #0d9488; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#ffffff; font-size:0.75rem;">
        <span>Self (Patient)</span>
      </div>
    </div>
    <div style="display:flex; justify-content:center; gap:1rem; padding:0.5rem 0;">
      <button class="btn btn-secondary btn-icon" onclick="PulseCareUI.showToast('Microphone', 'Audio unmuted', 'info')">
        <svg class="icon" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
      </button>
      <button class="btn btn-secondary btn-icon" onclick="PulseCareUI.showToast('Camera', 'HD Camera stream active', 'info')">
        <svg class="icon" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
      </button>
      <button class="btn btn-danger" onclick="PulseCareUI.closeModal('telehealth-modal'); PulseCareUI.showToast('Call Ended', 'Telehealth consultation session saved to chart.', 'info')">
        <span>End Call</span>
      </button>
    </div>
  `;

  PulseCareUI.openModal('telehealth-modal');
};

// Lab Modal Detail View
window.openLabModal = function(labId) {
  const lab = PulseCareStore.getLabReports().find(l => l.id === labId);
  if (!lab) return;

  const modalBody = document.getElementById('lab-modal-body');
  modalBody.innerHTML = `
    <div style="border-bottom:2px solid var(--hospital-teal-600); padding-bottom:1rem; margin-bottom:1rem;">
      <h3 style="font-size:1.3rem;">${lab.title}</h3>
      <p style="font-size:0.85rem; color:var(--text-muted);">${lab.facility} &bull; Date: ${lab.date}</p>
    </div>
    <div style="margin-bottom:1.5rem;">
      <h4 style="font-size:1rem; margin-bottom:0.5rem;">Pathologist Clinical Summary</h4>
      <p style="font-size:0.9rem; line-height:1.6; background:var(--bg-input); padding:1rem; border-radius:var(--radius-sm);">${lab.summary}</p>
    </div>
    <h4 style="font-size:1rem; margin-bottom:0.5rem;">Biomarkers</h4>
    <div class="doctor-table-wrap" style="margin-bottom:1.5rem;">
      <table class="doctor-table">
        <thead>
          <tr>
            <th>Test</th>
            <th>Result</th>
            <th>Reference</th>
            <th>Interpretation</th>
          </tr>
        </thead>
        <tbody>
          ${(lab.results || []).map(r => `
            <tr>
              <td><strong>${r.test}</strong></td>
              <td style="font-weight:700; color:var(--hospital-teal-700);">${r.value}</td>
              <td>${r.normalRange}</td>
              <td><span class="badge badge-emerald">${r.flag}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <div style="display:flex; justify-content:flex-end;">
      <button class="btn btn-primary" data-close-modal="lab-report-modal">Done</button>
    </div>
  `;

  PulseCareUI.openModal('lab-report-modal');
};

function initNotificationCenter() {
  const bellBtn = document.getElementById('notif-bell-btn');
  const dropdown = document.getElementById('notif-dropdown');
  const itemsContainer = document.getElementById('notif-items-container');
  const dot = document.getElementById('notif-badge-dot');

  function renderNotifs() {
    const notifs = PulseCareStore.getNotifications(currentPatient.id);
    const unread = notifs.filter(n => !n.read).length;

    if (dot) dot.style.display = unread > 0 ? 'inline-block' : 'none';

    if (itemsContainer) {
      if (notifs.length === 0) {
        itemsContainer.innerHTML = `<p style="font-size:0.8rem; color:var(--text-muted); text-align:center; padding:1rem;">No notifications.</p>`;
      } else {
        itemsContainer.innerHTML = notifs.map(n => `
          <div style="padding:0.6rem; border-radius:6px; background:${n.read ? 'transparent' : 'var(--bg-hover)'}; border:1px solid var(--border-light); font-size:0.8rem;">
            <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
              <strong style="color:var(--text-primary);">${n.title}</strong>
              <span style="font-size:0.7rem; color:var(--text-muted);">${n.time}</span>
            </div>
            <p style="font-size:0.775rem; color:var(--text-secondary); margin:0;">${n.message}</p>
          </div>
        `).join('');
      }
    }
  }

  if (bellBtn && dropdown) {
    bellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.style.display === 'block';
      dropdown.style.display = isOpen ? 'none' : 'block';
      if (!isOpen) renderNotifs();
    });

    document.addEventListener('click', () => {
      dropdown.style.display = 'none';
    });
  }

  window.clearAllNotifications = function() {
    const notifs = PulseCareStore.getNotifications(currentPatient.id);
    notifs.forEach(n => PulseCareStore.markNotificationRead(n.id));
    renderNotifs();
    PulseCareUI.showToast('Notifications', 'All notifications cleared.', 'info');
  };

  renderNotifs();
}

function initBookingWizard() {
  const form = document.getElementById('book-appointment-form');
  const docSelect = document.getElementById('book-doctor-select');

  if (docSelect) {
    const doctors = PulseCareStore.getDoctors();
    docSelect.innerHTML = doctors.map(d => `
      <option value="${d.id}">${d.name} (${d.specialty}) &bull; ${d.hospital}</option>
    `).join('');
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const docId = docSelect.value;
      const doc = PulseCareStore.getDoctorById(docId);
      const date = document.getElementById('book-date').value;
      const time = document.getElementById('book-time').value;
      const type = document.getElementById('book-type').value;
      const reason = document.getElementById('book-reason').value;

      PulseCareStore.addAppointment({
        patientId: currentPatient.id,
        patientName: currentPatient.name,
        doctorId: doc.id,
        doctorName: doc.name,
        doctorSpecialty: doc.specialty,
        doctorRoom: doc.department,
        date,
        time,
        type,
        reason,
        status: 'confirmed'
      });

      PulseCareUI.closeModal('book-apt-modal');
      PulseCareUI.showToast('Consultation Booked', `Appointment confirmed with ${doc.name} for ${date} at ${time}.`, 'success');
      renderAppointments();
      switchTab('appointments');
    });
  }
}
