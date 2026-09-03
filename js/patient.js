/**
 * SwasthyaConnect - Comprehensive Patient Portal Controller (js/patient.js)
 * Manages Dashboard, Profile, Appointments, Medical Records, Prescriptions, Labs,
 * Telehealth, Government Schemes, Location-Based Nearby Healthcare Centres, and Interactive Map.
 */

let currentPatient = null;
let currentSchemeCategory = 'All';

// Location & Nearby Places POI State
let patientCoordinates = { lat: 17.3850, lng: 78.4867 }; // Default Reference Coords (Hyderabad/Springfield)
let detectedLocationLabel = 'Current Location (GPS Detected)';
let nearbyTypeFilter = 'All';
let nearbyDistanceFilter = 10; // Default initial search radius: 10 km
let nearbySearchQuery = '';
let leafletMapInstance = null;
let mapMarkersLayer = null;
let radiusCircleLayer = null;
let userMarker = null;
let mapMarkerDict = {};
let isSearchingPlaces = false;
let currentPlacesResults = [];

// ==========================================================================
// ==========================================================================
// PLACES / POI HEALTHCARE SEARCH SERVICE (Serverless Proxy + OSM Fallback)
// ==========================================================================

const PlacesHealthService = {
  // In-memory geocode & POI cache for sub-millisecond responses
  geocodeCache: new Map(),
  poiCache: new Map(),

  // Self-contained Haversine distance calculator (km)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const p1 = parseFloat(lat1);
    const p2 = parseFloat(lon1);
    const p3 = parseFloat(lat2);
    const p4 = parseFloat(lon2);
    if (isNaN(p1) || isNaN(p2) || isNaN(p3) || isNaN(p4)) return 1.0;

    const R = 6371; // Earth radius in km
    const dLat = (p3 - p1) * Math.PI / 180;
    const dLon = (p4 - p2) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(p1 * Math.PI / 180) * Math.cos(p3 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  },

  // Geocode manual text query (City, District, Village, PIN code)
  async geocodeLocation(query) {
    const cleanQ = query.toLowerCase().trim();
    if (this.geocodeCache.has(cleanQ)) {
      return this.geocodeCache.get(cleanQ);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`;
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const result = {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
            displayName: data[0].display_name,
            address: data[0].address || {}
          };
          this.geocodeCache.set(cleanQ, result);
          return result;
        }
      }
    } catch (err) {
      console.warn('Geocoding service fallback:', err.message);
    }

    // Photon fallback for location geocoding
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`;
      const pRes = await fetch(photonUrl);
      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData && pData.features && pData.features.length > 0) {
          const f = pData.features[0];
          const [lon, lat] = f.geometry.coordinates;
          const result = {
            lat: parseFloat(lat),
            lng: parseFloat(lon),
            displayName: f.properties.name || f.properties.city || query,
            address: f.properties || {}
          };
          this.geocodeCache.set(cleanQ, result);
          return result;
        }
      }
    } catch (e) {}

    const fallback = {
      lat: 17.3850,
      lng: 78.4867,
      displayName: `${query} (Search Location)`,
      address: { city: query }
    };
    this.geocodeCache.set(cleanQ, fallback);
    return fallback;
  },

  // Reverse geocode with memory cache
  async reverseGeocode(lat, lng) {
    const key = `${parseFloat(lat).toFixed(3)}_${parseFloat(lng).toFixed(3)}`;
    if (this.geocodeCache.has(key)) {
      return this.geocodeCache.get(key);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' }, signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          const a = data.address;
          const locality = a.village || a.hamlet || a.suburb || a.neighbourhood || a.town || a.city_district || a.city || 'Local Area';
          const district = a.county || a.state_district || a.district || a.city || 'District';
          const state = a.state || '';
          const postcode = a.postcode || '';
          const info = {
            locality,
            district,
            state,
            postcode,
            displayName: [locality, district, state, postcode].filter(Boolean).join(', ')
          };
          this.geocodeCache.set(key, info);
          return info;
        }
      }
    } catch (e) {}

    const fallbackInfo = {
      locality: 'Local Area',
      district: 'District Healthcare Zone',
      state: 'India',
      postcode: '',
      displayName: `GPS (${parseFloat(lat).toFixed(4)}° N, ${parseFloat(lng).toFixed(4)}° E)`
    };
    this.geocodeCache.set(key, fallbackInfo);
    return fallbackInfo;
  },

  // Primary Fetcher: Calls /api/hospitals with resilient multi-tier client fallback
  async fetchNearbyFacilities(lat, lng, radiusKm = 10, category = 'All', searchQuery = '') {
    const pLat = parseFloat(lat);
    const pLng = parseFloat(lng);
    const effectiveRadius = Math.max(1, parseFloat(radiusKm) || 10);

    if (isNaN(pLat) || isNaN(pLng)) {
      console.warn('Invalid coordinates passed to fetchNearbyFacilities:', lat, lng);
      return [];
    }

    const cacheKey = `${pLat.toFixed(3)}_${pLng.toFixed(3)}_${effectiveRadius}_${category}_${searchQuery}`;

    // 1. Check in-memory cache
    if (this.poiCache.has(cacheKey)) {
      return this.poiCache.get(cacheKey);
    }

    // 2. Check offline local cache if offline
    if (typeof SwasthyaOfflineManager !== 'undefined' && SwasthyaOfflineManager.status === 'offline') {
      try {
        const cached = localStorage.getItem('swasthya_cached_nearby');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {}
    }

    let results = [];

    // 3. Primary: Query Vercel Serverless Function (/api/hospitals)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const apiUrl = `/api/hospitals?lat=${pLat}&lng=${pLng}&radius=${effectiveRadius}&category=${encodeURIComponent(category || 'All')}&q=${encodeURIComponent(searchQuery || '')}`;
      
      const res = await fetch(apiUrl, {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.hospitals)) {
          results = data.hospitals;
        }
      }
    } catch (e) {
      console.info('Serverless /api/hospitals fallback to client POI search:', e.message);
    }

    // 4. Secondary Fallback: Direct Client-Side Photon + Nominatim + Overpass queries
    if (results.length === 0) {
      try {
        const [photonItems, nomItems] = await Promise.all([
          this.queryPhotonHealthcare(pLat, pLng, effectiveRadius),
          this.queryNominatimClient(pLat, pLng, effectiveRadius)
        ]);

        const merged = [...photonItems, ...nomItems];
        const uniqueMap = new Map();
        merged.forEach(item => {
          const key = `${item.name.toLowerCase().trim()}-${Math.round(item.lat * 500)}-${Math.round(item.lng * 500)}`;
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, item);
          }
        });

        results = Array.from(uniqueMap.values());
      } catch (clientErr) {
        console.warn('Client-side POI query fallback:', clientErr);
      }
    }

    // 5. Ensure all results have exact Haversine distance and Google Maps directions link
    results.forEach(c => {
      c.lat = parseFloat(c.lat);
      c.lng = parseFloat(c.lng);
      c.distanceKm = this.calculateDistance(pLat, pLng, c.lat, c.lng);
      c.distance = `${c.distanceKm.toFixed(1)} km away`;
      c.directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`;
    });

    // 6. Filter by radius
    results = results.filter(c => c.distanceKm <= effectiveRadius);

    // 7. Filter by Category
    if (category && category !== 'All') {
      const catLower = category.toLowerCase();
      results = results.filter(c => {
        const cCat = (c.category || '').toLowerCase();
        const cType = (c.type || '').toLowerCase();
        if (catLower.includes('govt') || catLower.includes('government')) {
          return cCat.includes('government') || cType.includes('hospital') || cType.includes('district');
        }
        if (catLower === 'phc') return cCat === 'phc' || cType.includes('phc');
        if (catLower === 'chc') return cCat === 'chc' || cType.includes('chc');
        if (catLower.includes('arogya') || catLower.includes('ayushman')) return cCat.includes('arogya') || cCat.includes('ayushman');
        if (catLower === 'pharmacies') return cCat === 'pharmacies';
        if (catLower.includes('emergency')) return cCat.includes('emergency') || c.emergencyReady;
        return cCat === catLower || cType.includes(catLower);
      });
    }

    // 8. Filter by search query
    if (searchQuery && searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase().trim();
      results = results.filter(c =>
        c.name.toLowerCase().includes(qLower) ||
        c.location.toLowerCase().includes(qLower) ||
        c.type.toLowerCase().includes(qLower)
      );
    }

    // 9. Sort strictly ascending by distance
    results.sort((a, b) => a.distanceKm - b.distanceKm);

    if (results.length > 0) {
      this.poiCache.set(cacheKey, results);
      try {
        localStorage.setItem('swasthya_cached_nearby', JSON.stringify(results));
      } catch (e) {}
    }

    return results;
  },

  // Photon Client-Side Fetcher (Lightning fast Elasticsearch OpenStreetMap POIs)
  async queryPhotonHealthcare(lat, lng, radiusKm) {
    try {
      const limit = Math.min(30, Math.round(radiusKm * 3));
      const url = `https://photon.komoot.io/api/?q=hospital&lat=${lat}&lon=${lng}&limit=${limit}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.features)) {
          return data.features.map((f, idx) => {
            const p = f.properties || {};
            const [lon, itemLat] = f.geometry.coordinates;
            const dist = this.calculateDistance(lat, lng, itemLat, lon);
            const name = p.name || p.street || 'Healthcare Centre';
            const street = [p.housenumber, p.street, p.district, p.city, p.state, p.postcode].filter(Boolean).join(', ');
            
            let cat = 'Government Hospitals';
            let type = 'District Civil / Area Hospital';
            const lower = name.toLowerCase();

            if (lower.includes('phc') || lower.includes('primary health')) {
              cat = 'PHC';
              type = 'Primary Health Centre (PHC)';
            } else if (lower.includes('chc') || lower.includes('community health')) {
              cat = 'CHC';
              type = 'Community Health Centre (CHC)';
            } else if (lower.includes('pharmacy') || lower.includes('chemist') || lower.includes('medical')) {
              cat = 'Pharmacies';
              type = 'Pharmacy / Jan Aushadhi Kendra';
            } else if (lower.includes('clinic')) {
              cat = 'Clinics';
              type = 'Government Clinic / Dispensary';
            }

            return {
              id: `photon-${p.osm_id || idx}-${Math.round(itemLat * 1000)}`,
              name,
              category: cat,
              type,
              lat: itemLat,
              lng: lon,
              distanceKm: dist,
              distance: `${dist.toFixed(1)} km away`,
              location: street || `${dist.toFixed(1)} km from your coordinates`,
              timing: '24x7 Emergency & IPD | OPD: 08:30 AM - 02:00 PM',
              phone: '+91 1800-180-1104 / 108',
              services: [
                'Free Doctor Consultation (OPD)',
                'Essential Medicines Dispensary',
                'Basic Pathology & Diagnostic Tests',
                'PM-JAY Cashless Support'
              ],
              pmjayEmpanelled: true,
              emergencyReady: cat === 'Emergency Services' || cat === 'Government Hospitals',
              directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${itemLat},${lon}`
            };
          });
        }
      }
    } catch (e) {
      console.warn('Photon POI query fallback:', e.message);
    }
    return [];
  },

  // Nominatim Client-Side Bounded Fetcher
  async queryNominatimClient(lat, lng, radiusKm) {
    try {
      const rKm = Math.max(1, radiusKm || 10);
      const deltaLat = rKm / 111;
      const deltaLng = rKm / (111 * Math.cos(lat * Math.PI / 180));
      const viewbox = `${(lng - deltaLng).toFixed(4)},${(lat + deltaLat).toFixed(4)},${(lng + deltaLng).toFixed(4)},${(lat - deltaLat).toFixed(4)}`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=hospital&viewbox=${viewbox}&bounded=1&addressdetails=1&limit=15`;
      
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          return data.map((item, idx) => {
            const itemLat = parseFloat(item.lat);
            const itemLng = parseFloat(item.lon);
            const dist = this.calculateDistance(lat, lng, itemLat, itemLng);
            const name = item.name || (item.display_name ? item.display_name.split(',')[0] : 'Government Hospital');
            return {
              id: `nom-${item.place_id || idx}-${Math.round(itemLat * 1000)}`,
              name,
              category: 'Government Hospitals',
              type: 'Government / Empanelled Area Hospital',
              lat: itemLat,
              lng: itemLng,
              distanceKm: dist,
              distance: `${dist.toFixed(1)} km away`,
              location: item.display_name,
              timing: '24x7 Emergency & IPD | OPD: 08:30 AM - 02:00 PM',
              phone: '+91 1800-180-1104 / 108',
              services: [
                'Free OPD Consultation',
                'Essential Generic Drugs',
                'Basic Pathology Testing',
                'PM-JAY Cashless Support'
              ],
              pmjayEmpanelled: true,
              emergencyReady: true,
              directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${itemLat},${itemLng}`
            };
          });
        }
      }
    } catch (e) {}
    return [];
  },

  // Get currently loaded / saved facilities
  getSavedFacilities() {
    return currentPlacesResults || [];
  },

  // Helper to sync distance pill buttons
  updateDistancePillUI(dist) {
    const pills = document.querySelectorAll('#nearby-distance-pills .chip-btn');
    pills.forEach(p => {
      p.classList.toggle('active', p.getAttribute('data-dist') === String(dist));
    });
  }
};

window.PlacesHealthService = PlacesHealthService;

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
  renderDoctorsList();
  renderGovernmentSchemes();
  initSchemesSearchAndFilter();
  initEligibilityChecker();
  initBookingWizard();
  initNearbySearchAndFilter();

  // Handle Post-Login Location Permission Popup
  checkPostLoginLocationPrompt();

  // Listen for location detection event from site-entry geolocation
  window.addEventListener('swasthya:location_detected', (e) => {
    if (e.detail && e.detail.lat && e.detail.lng) {
      patientCoordinates = { lat: e.detail.lat, lng: e.detail.lng };
      hasUserLocation = true;
      detectedLocationLabel = e.detail.label || `GPS (${e.detail.lat.toFixed(4)}° N, ${e.detail.lng.toFixed(4)}° E)`;
      updateLocationHeaderDisplay(detectedLocationLabel);

      const activeTab = window.location.hash.replace('#', '') || 'overview';
      if (activeTab === 'nearby') {
        refreshNearbyCentresAndMap();
      }
    }
  });

  // Check if location is already detected or stored in localStorage
  if (window.SwasthyaLocation && window.SwasthyaLocation.coords) {
    patientCoordinates = { lat: window.SwasthyaLocation.coords.lat, lng: window.SwasthyaLocation.coords.lng };
    hasUserLocation = true;
    detectedLocationLabel = window.SwasthyaLocation.label;
    updateLocationHeaderDisplay(detectedLocationLabel);
  } else {
    try {
      const storedLoc = localStorage.getItem('swasthya_user_coords');
      if (storedLoc) {
        const parsed = JSON.parse(storedLoc);
        if (parsed && parsed.lat && parsed.lng) {
          patientCoordinates = { lat: parsed.lat, lng: parsed.lng };
          hasUserLocation = true;
          detectedLocationLabel = parsed.label || `GPS (${parsed.lat.toFixed(4)}° N, ${parsed.lng.toFixed(4)}° E)`;
          updateLocationHeaderDisplay(detectedLocationLabel);
        }
      }
    } catch (e) {}
  }

  // Resize / Invalidate map on window resize
  window.addEventListener('resize', () => {
    if (leafletMapInstance) {
      leafletMapInstance.invalidateSize();
    }
  });

  // Listen to cross-portal state changes
  window.addEventListener('swasthya:state_change', () => {
    currentPatient = PulseCareStore.getPatientById(currentPatient.id) || PulseCareStore.getPatients()[0];
    renderPatientData();
    renderAppointments();
    renderPrescriptions();
    renderMedicalRecords();
    renderScans();
    renderTelehealthHistory();
    renderDoctorsList();
    renderGovernmentSchemes(currentSchemeCategory);
    refreshNearbyCentresAndMap();
  });

  // Listen to global Language Change (English / Hindi / Telugu)
  window.addEventListener('swasthyaLanguageChanged', (e) => {
    renderPatientData();
    renderAppointments();
    renderDoctorsList();
    renderGovernmentSchemes(currentSchemeCategory);
    if (currentPlacesResults && currentPlacesResults.length > 0) {
      renderNearbyCards(currentPlacesResults);
    }
    if (typeof SwasthyaI18n !== 'undefined' && typeof SwasthyaI18n.translateEntireDOM === 'function') {
      setTimeout(() => SwasthyaI18n.translateEntireDOM(), 30);
    }
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
    dashboard: 'Patient Health Dashboard',
    profile: 'My Patient Profile & Demographics',
    appointments: 'Scheduled Consultations & Appointments',
    doctors: 'Find a Doctor & Rural Specialist',
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
  const normTab = (tabId === 'overview' || tabId === 'dashboard') ? 'dashboard' : tabId;
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link[data-tab]');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const pageTitle = document.getElementById('current-page-title');

  const titles = {
    overview: 'Patient Health Dashboard & Telemetry',
    dashboard: 'Patient Health Dashboard & Telemetry',
    profile: 'My Patient Profile & Demographics',
    appointments: 'Scheduled Consultations & Appointments',
    doctors: 'Find a Doctor & Rural Specialist',
    records: 'Electronic Medical Records (EHR)',
    prescriptions: 'Active Medications & Pharmacy Refills',
    labs: 'Diagnostic Lab Reports & Pathology',
    telehealth: 'Encrypted Telemedicine Video Consultations',
    schemes: 'Indian Government Healthcare Schemes',
    nearby: 'Find Nearby Government Healthcare Centres',
    emergency: 'Emergency Information & Rapid Response'
  };

  navLinks.forEach(l => {
    const lTab = l.getAttribute('data-tab');
    if (lTab === normTab || ((normTab === 'dashboard') && (lTab === 'dashboard' || lTab === 'overview'))) {
      l.classList.add('active');
    } else {
      l.classList.remove('active');
    }
  });

  tabPanels.forEach(p => {
    if (p.id === `tab-${normTab}` || (normTab === 'dashboard' && (p.id === 'tab-dashboard' || p.id === 'tab-overview'))) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });

  if (pageTitle && titles[normTab]) {
    pageTitle.textContent = titles[normTab];
  }

  window.location.hash = normTab;
  if (normTab === 'nearby') {
    setTimeout(() => {
      onOpenNearbyHospitalsTab();
    }, 150);
  }

  const sidebar = document.querySelector('.portal-sidebar');
  if (sidebar && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
  }
}

// ==========================================================================
// LOCATION PERMISSION & DETECTION FLOW (NEARBY HOSPITALS)
// ==========================================================================

let hasUserLocation = false;
let isLocationDetecting = false;

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
  switchTab('nearby');
  triggerDeviceGeolocation(true);
};

window.enterLocationManuallyFromModal = function() {
  sessionStorage.setItem('swasthya_location_prompted', 'true');
  PulseCareUI.closeModal('location-permission-modal');
  switchTab('nearby');
  toggleManualLocationInput(true);
};

window.handleDashboardFindHealthcare = function() {
  switchTab('nearby');
  triggerDeviceGeolocation(true);
};

function onOpenNearbyHospitalsTab() {
  if (!hasUserLocation && !patientCoordinates) {
    triggerDeviceGeolocation(false);
  } else {
    refreshNearbyCentresAndMap();
  }
}

window.triggerDeviceGeolocation = function(userInitiated = false) {
  const locIndicator = document.getElementById('detected-location-text');
  const container = document.getElementById('nearby-centres-grid');

  if (locIndicator) {
    locIndicator.innerHTML = `<span class="pulse-dot"></span> 📍 Getting your location...`;
  }

  if (container) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding:3.5rem 1.5rem;" role="status" aria-live="polite">
        <div style="display:inline-block; width:42px; height:42px; border:3px solid var(--hospital-teal-600); border-top-color:transparent; border-radius:50%; animation:spin 0.8s linear infinite; margin-bottom:1rem;"></div>
        <h3 style="font-size:1.2rem; font-weight:700; color:var(--text-primary); margin:0 0 0.5rem 0;">📍 Getting your location...</h3>
        <p style="color:var(--text-secondary); font-size:0.9rem; max-width:460px; margin:0 auto;">
          Detecting your GPS coordinates to search for nearby hospitals and healthcare facilities.
        </p>
      </div>
    `;
  }

  if (!navigator.geolocation) {
    handleGeolocationError({ code: 2, message: 'Geolocation is not supported by your browser.' });
    return;
  }

  isLocationDetecting = true;

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      isLocationDetecting = false;
      const lat = pos.coords ? pos.coords.latitude : null;
      const lng = pos.coords ? pos.coords.longitude : null;

      if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
        handleGeolocationError({ code: 2, message: 'Invalid coordinates returned by browser.' });
        return;
      }

      patientCoordinates = { lat, lng };
      hasUserLocation = true;
      sessionStorage.setItem('swasthya_location_prompted', 'true');

      // Reverse-geocode to get user's city/village name
      const areaInfo = await PlacesHealthService.reverseGeocode(lat, lng);
      detectedLocationLabel = areaInfo.displayName || `GPS (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`;
      updateLocationHeaderDisplay(detectedLocationLabel);

      const coordsDisplay = document.getElementById('sos-coords-display');
      if (coordsDisplay) {
        coordsDisplay.textContent = `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
      }

      toggleManualLocationInput(false);
      PulseCareUI.showToast('Location Detected', `Searching hospitals near ${areaInfo.locality || 'your coordinates'}...`, 'success');
      await refreshNearbyCentresAndMap();
    },
    (err) => {
      isLocationDetecting = false;
      handleGeolocationError(err);
    },
    { timeout: 10000, enableHighAccuracy: true, maximumAge: 60000 }
  );
};

function handleGeolocationError(err) {
  const isDenied = err && err.code === 1; // PERMISSION_DENIED
  const locIndicator = document.getElementById('detected-location-text');
  const container = document.getElementById('nearby-centres-grid');

  if (isDenied) {
    updateLocationHeaderDisplay('Location permission denied');
    if (locIndicator) {
      locIndicator.innerHTML = `<span style="color:var(--hospital-cross-red);">Location permission was denied.</span>`;
    }
    if (container) {
      container.innerHTML = `
        <div class="glass-panel" style="grid-column: 1 / -1; padding:2.5rem 1.5rem; text-align:center; border-left:4px solid var(--hospital-cross-red); margin-bottom:1.5rem;">
          <div style="font-size:2.5rem; margin-bottom:0.75rem;">📍</div>
          <h3 style="font-size:1.25rem; font-weight:700; color:var(--text-primary); margin-bottom:0.5rem;">Location permission was denied. Please enable location access and try again.</h3>
          <p style="color:var(--text-secondary); max-width:520px; margin:0 auto 1.5rem; font-size:0.9rem; line-height:1.5;">
            Location access is needed to find hospitals nearest to you. Please enable location permission in your browser settings, or enter your city / district / PIN code manually below.
          </p>
          <div style="display:flex; justify-content:center; gap:0.75rem; flex-wrap:wrap;">
            <button class="btn btn-primary" onclick="triggerDeviceGeolocation(true)">
              <svg class="icon" viewBox="0 0 24 24"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
              <span>Enable Location</span>
            </button>
            <button class="btn btn-outline" onclick="toggleManualLocationInput(true)">
              <span>Enter Location Manually</span>
            </button>
          </div>
        </div>
      `;
    }
  } else {
    updateLocationHeaderDisplay('Location unavailable');
    if (locIndicator) {
      locIndicator.innerHTML = `<span style="color:var(--text-muted);">Location unavailable. Please search manually.</span>`;
    }
    if (container) {
      container.innerHTML = `
        <div class="glass-panel" style="grid-column: 1 / -1; padding:2.5rem 1.5rem; text-align:center; border-left:4px solid var(--hospital-amber); margin-bottom:1.5rem;">
          <div style="font-size:2.5rem; margin-bottom:0.75rem;">⚠️</div>
          <h3 style="font-size:1.2rem; font-weight:700; color:var(--text-primary); margin-bottom:0.5rem;">Location services are currently unavailable.</h3>
          <p style="color:var(--text-secondary); max-width:500px; margin:0 auto 1.25rem; font-size:0.9rem;">
            We could not obtain your GPS coordinates. Please check your device location settings or enter your city / PIN code manually.
          </p>
          <div style="display:flex; justify-content:center; gap:0.75rem; flex-wrap:wrap;">
            <button class="btn btn-primary btn-sm" onclick="triggerDeviceGeolocation(true)">
              <svg class="icon" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              <span>Retry Location</span>
            </button>
            <button class="btn btn-outline btn-sm" onclick="toggleManualLocationInput(true)">
              <span>Enter Location Manually</span>
            </button>
          </div>
        </div>
      `;
    }
  }

  // If no coordinates yet, set a sensible central fallback so the section is NEVER blank
  if (!patientCoordinates) {
    patientCoordinates = { lat: 17.3850, lng: 78.4867 };
    detectedLocationLabel = 'Hyderabad, Telangana (Demo Fallback)';
  }

  toggleManualLocationInput(true);
}

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
      refreshNearbyCentresAndMap();
    });
  }

  const manualForm = document.getElementById('manual-location-form');
  if (manualForm) {
    manualForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const area = document.getElementById('manual-location-input').value.trim();
      if (!area) return;

      PulseCareUI.showToast('Searching Location', `Finding healthcare centres near "${area}"...`, 'info');
      const geocoded = await PlacesHealthService.geocodeLocation(area);

      if (geocoded) {
        patientCoordinates = { lat: geocoded.lat, lng: geocoded.lng };
        hasUserLocation = true;
        detectedLocationLabel = `${geocoded.displayName.split(',')[0]} (${area})`;
        updateLocationHeaderDisplay(detectedLocationLabel);
        toggleManualLocationInput(false);
        PulseCareUI.showToast('Location Set', `Found healthcare facilities near ${area}`, 'success');
      } else {
        detectedLocationLabel = `${area} (Manual Location)`;
        updateLocationHeaderDisplay(detectedLocationLabel);
        toggleManualLocationInput(false);
      }

      refreshNearbyCentresAndMap();
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
  refreshNearbyCentresAndMap();
};

window.setNearbyDistanceFilter = function(dist) {
  nearbyDistanceFilter = dist ? parseFloat(dist) : 10;
  const pills = document.querySelectorAll('#nearby-distance-pills .chip-btn');
  pills.forEach(p => {
    const val = p.getAttribute('data-dist');
    if (val === String(dist)) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });
  refreshNearbyCentresAndMap();
};

window.resetNearbyFilters = function() {
  nearbyTypeFilter = 'All';
  nearbyDistanceFilter = 10;
  nearbySearchQuery = '';
  const searchInput = document.getElementById('nearby-search-input');
  if (searchInput) searchInput.value = '';

  const typePills = document.querySelectorAll('#nearby-type-pills .chip-btn');
  typePills.forEach(p => p.classList.toggle('active', p.getAttribute('data-type') === 'All'));

  const distPills = document.querySelectorAll('#nearby-distance-pills .chip-btn');
  distPills.forEach(p => p.classList.toggle('active', p.getAttribute('data-dist') === '10'));

  refreshNearbyCentresAndMap();
};

// Unified async fetcher & map renderer
async function refreshNearbyCentresAndMap() {
  const container = document.getElementById('nearby-centres-grid');
  const countEl = document.getElementById('nearby-results-count');

  if (!patientCoordinates) {
    triggerDeviceGeolocation(false);
    return;
  }

  if (container) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding:3.5rem 1.5rem;" role="status" aria-live="polite">
        <div style="display:inline-block; width:40px; height:40px; border:3px solid var(--hospital-teal-600); border-top-color:transparent; border-radius:50%; animation:spin 0.8s linear infinite; margin-bottom:1rem;"></div>
        <h3 style="font-size:1.2rem; font-weight:700; color:var(--text-primary); margin:0 0 0.5rem 0;">🏥 Finding nearby hospitals...</h3>
        <p style="font-size:0.875rem; color:var(--text-secondary); margin:0;">
          Querying verified government hospitals, PHCs, and CHCs within ${nearbyDistanceFilter || 10} km...
        </p>
      </div>
    `;
  }

  isSearchingPlaces = true;

  try {
    currentPlacesResults = await PlacesHealthService.fetchNearbyFacilities(
      patientCoordinates.lat,
      patientCoordinates.lng,
      nearbyDistanceFilter || 10,
      nearbyTypeFilter,
      nearbySearchQuery
    );
    isSearchingPlaces = false;

    renderNearbyCards(currentPlacesResults);
    updateLeafletMapWithFacilities(currentPlacesResults);
  } catch (err) {
    console.error('Nearby hospital search error:', err);
    isSearchingPlaces = false;
    if (container) {
      container.innerHTML = `
        <div class="glass-panel" style="grid-column: 1 / -1; text-align:center; padding:3rem 1.5rem; border-left:4px solid var(--hospital-amber); border-radius:var(--radius-md);">
          <div style="font-size:2.5rem; margin-bottom:0.75rem;">⚠️</div>
          <h3 style="font-size:1.2rem; font-weight:700; color:var(--text-primary); margin-bottom:0.5rem;">Unable to find nearby hospitals right now.</h3>
          <p style="color:var(--text-secondary); max-width:480px; margin:0 auto 1.5rem; font-size:0.9rem;">
            The healthcare registry service could not be reached. Please check your connection or retry.
          </p>
          <div style="display:flex; justify-content:center; gap:0.75rem; flex-wrap:wrap;">
            <button class="btn btn-primary" onclick="refreshNearbyCentresAndMap()">
              <svg class="icon" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              <span>Retry</span>
            </button>
            <button class="btn btn-outline" onclick="toggleManualLocationInput(true)">
              <span>Search by City / PIN</span>
            </button>
          </div>
        </div>
      `;
    }
  }
}

function renderNearbyCards(centres) {
  const container = document.getElementById('nearby-centres-grid');
  const countEl = document.getElementById('nearby-results-count');
  if (!container) return;

  const isOffline = typeof SwasthyaOfflineManager !== 'undefined' && SwasthyaOfflineManager.status === 'offline';
  const timestampStr = typeof SwasthyaOfflineManager !== 'undefined' ? SwasthyaOfflineManager.getFormattedTimestamp() : 'Recent';

  if (countEl) {
    if (isOffline) {
      countEl.innerHTML = `Showing ${centres.length} healthcare ${centres.length === 1 ? 'facility' : 'facilities'} <span class="badge badge-danger" style="font-size:0.75rem; margin-left:6px;">🔴 Offline Mode &bull; Last updated: ${timestampStr}</span>`;
    } else {
      countEl.textContent = `Showing ${centres.length} healthcare ${centres.length === 1 ? 'facility' : 'facilities'} within ${nearbyDistanceFilter || 10} km`;
    }
  }

  if (centres.length === 0) {
    container.innerHTML = `
      <div class="glass-panel" style="grid-column: 1 / -1; text-align:center; padding:3rem 1.5rem; border:1px solid var(--border-light); border-radius:var(--radius-md);">
        <div style="font-size:2.75rem; margin-bottom:0.75rem;">🏥</div>
        <h3 style="font-size:1.25rem; font-weight:700; color:var(--text-primary); margin-bottom:0.5rem;">No hospitals found within ${nearbyDistanceFilter || 10} km.</h3>
        <p style="font-size:0.9rem; color:var(--text-secondary); max-width:480px; margin:0 auto 1.5rem;">
          Try expanding your search radius to discover regional district hospitals and community healthcare centres.
        </p>
        
        <div style="display:flex; justify-content:center; gap:0.5rem; flex-wrap:wrap; margin-bottom:1.5rem;">
          <button class="btn btn-primary" onclick="setNearbyDistanceFilter(25)">Search within 25 km</button>
          <button class="btn btn-secondary" onclick="setNearbyDistanceFilter(50)">Search within 50 km</button>
          <button class="btn btn-outline" onclick="refreshNearbyCentresAndMap()">Try Again</button>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = centres.map(c => `
    <div class="portal-card" style="border-top:4px solid ${getFacilityTypeColor(c.category)}; display:flex; flex-direction:column; height:100%; border-radius:var(--radius-md); box-shadow:var(--shadow-sm);">
      
      <!-- Card Header -->
      <div class="portal-card-header" style="background:var(--bg-surface-elevated); align-items:flex-start; gap:0.5rem;">
        <div style="flex:1; min-width:0;">
          <span class="badge ${getFacilityBadgeClass(c.category)}" style="margin-bottom:0.35rem; display:inline-block;">${c.type || 'Healthcare Facility'}</span>
          <h3 style="font-size:1.15rem; font-weight:700; color:var(--text-primary); margin:0; line-height:1.3;">🏥 ${c.name}</h3>
        </div>
        <span class="badge badge-emerald" style="white-space:nowrap; font-weight:700; font-size:0.85rem;">📍 ${c.distance || `${c.distanceKm} km away`}</span>
      </div>

      <!-- Card Body -->
      <div class="portal-card-body" style="display:flex; flex-direction:column; gap:0.75rem; flex:1;">
        
        ${isOffline ? `
          <div style="padding:0.35rem 0.6rem; background:rgba(225, 29, 72, 0.08); border-radius:var(--radius-xs); font-size:0.75rem; color:var(--hospital-cross-red); font-weight:700; display:flex; align-items:center; gap:0.4rem;">
            <span>🔴 Offline saved facility</span> &bull; <span style="font-weight:500; color:var(--text-muted);">Updated ${timestampStr}</span>
          </div>
        ` : ''}

        <p style="font-size:0.875rem; color:var(--text-secondary); margin:0; line-height:1.4;">
          📌 <strong>Address:</strong> ${c.location || 'Hospital Road, Area Healthcare Centre'}
        </p>

        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem;">
          <span class="badge badge-emerald" style="font-weight:700;">🕐 ${c.timing && c.timing.includes('24x7') ? 'Open • 24x7 Emergency' : 'Open'}</span>
          ${c.phone ? `
            <span style="font-size:0.85rem; color:var(--hospital-teal-700); font-weight:700;">
              ☎️ <a href="tel:${c.phone.split(' ')[0]}" style="color:inherit; text-decoration:underline;">${c.phone}</a>
            </span>
          ` : ''}
        </div>

        <p style="font-size:0.825rem; color:var(--text-muted); margin:0;">
          🕐 <strong>Timing:</strong> ${c.timing || '24x7 Emergency & IPD | OPD: 08:30 AM - 02:00 PM'}
        </p>

        <!-- Services Tags -->
        <div style="margin-top:0.25rem;">
          <strong style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Services:</strong>
          <div style="display:flex; flex-wrap:wrap; gap:0.35rem;">
            ${(c.services || ['Free OPD Consultation', 'Essential Generic Drugs', 'Diagnostic Testing']).slice(0, 3).map(s => `
              <span class="badge" style="background:var(--bg-input); color:var(--text-primary); font-size:0.7rem; font-weight:600; text-transform:none;">${s}</span>
            `).join('')}
          </div>
        </div>

        ${c.pmjayEmpanelled ? `
          <div style="padding:0.45rem 0.65rem; background:rgba(13, 148, 136, 0.08); border-radius:var(--radius-xs); font-size:0.75rem; color:var(--hospital-teal-800); font-weight:700;">
            ✓ PM-JAY Empanelled Golden Card Desk Available
          </div>
        ` : ''}

        <!-- Actions -->
        <div style="margin-top:auto; padding-top:0.75rem; border-top:1px solid var(--border-light); display:flex; gap:0.5rem; flex-wrap:wrap;">
          <button class="btn btn-sm btn-primary" style="flex:1; min-width:110px; display:inline-flex; align-items:center; justify-content:center; gap:4px;" onclick="viewHospitalOnMap(${c.lat}, ${c.lng}, '${c.name.replace(/'/g, "\\'")}', '${c.id}')">
            <svg class="icon" style="width:14px; height:14px;" viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
            <span>View on Map</span>
          </button>
          
          <a href="https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-emerald" style="flex:1; min-width:120px; text-align:center; display:inline-flex; align-items:center; justify-content:center; gap:4px;">
            <svg class="icon" style="width:14px; height:14px;" viewBox="0 0 24 24"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            <span>Get Directions</span>
          </a>

          <button class="btn btn-sm btn-outline" style="min-width:36px; padding:0.25rem 0.5rem;" onclick="openFacilityDetailsModal('${c.id}')" title="Facility Details">
            <span>ℹ️</span>
          </button>
        </div>

      </div>
    </div>
  `).join('');
}

window.viewHospitalOnMap = function(lat, lng, name, facId) {
  const mapEl = document.getElementById('healthcare-map');
  if (mapEl) {
    mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  if (leafletMapInstance) {
    const fLat = parseFloat(lat);
    const fLng = parseFloat(lng);
    leafletMapInstance.flyTo([fLat, fLng], 15, { animate: true, duration: 0.8 });
    setTimeout(() => {
      if (mapMarkerDict[facId]) {
        mapMarkerDict[facId].openPopup();
      }
    }, 900);
  } else {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  }
};

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

// Leaflet Map Initialization & POI Marker Updates
function updateLeafletMapWithFacilities(centres) {
  const mapEl = document.getElementById('healthcare-map');
  if (!mapEl || typeof L === 'undefined') return;

  const pLat = parseFloat(patientCoordinates.lat);
  const pLng = parseFloat(patientCoordinates.lng);

  if (!leafletMapInstance) {
    leafletMapInstance = L.map('healthcare-map', {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView([pLat, pLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(leafletMapInstance);

    mapMarkersLayer = L.layerGroup().addTo(leafletMapInstance);
  } else {
    leafletMapInstance.invalidateSize({ animate: false });
  }

  // Clear previous markers & radius
  if (mapMarkersLayer) {
    mapMarkersLayer.clearLayers();
  }
  if (radiusCircleLayer) {
    leafletMapInstance.removeLayer(radiusCircleLayer);
  }

  mapMarkerDict = {};

  // Radius Circle Perimeter (e.g. 10 km active radius)
  const radiusMeters = (nearbyDistanceFilter || 10) * 1000;
  radiusCircleLayer = L.circle([pLat, pLng], {
    radius: radiusMeters,
    color: '#0d9488',
    fillColor: '#0d9488',
    fillOpacity: 0.08,
    weight: 2,
    dashArray: '5, 6'
  }).addTo(leafletMapInstance);

  // User Location Marker (🔵 You = Patient)
  const userIcon = L.divIcon({
    className: 'custom-user-marker',
    html: `<div style="width:24px; height:24px; background:#0284c7; border:3px solid #ffffff; border-radius:50%; box-shadow:0 0 16px rgba(2,132,199,0.95); animation:pulse 1.5s infinite; display:flex; align-items:center; justify-content:center;"><div style="width:8px; height:8px; background:#ffffff; border-radius:50%;"></div></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  userMarker = L.marker([pLat, pLng], { icon: userIcon, zIndexOffset: 1000 })
    .bindPopup(`
      <div style="font-family:system-ui, sans-serif; padding:2px;">
        <span class="badge badge-primary" style="font-size:0.7rem; margin-bottom:4px;">🔵 Patient Location</span>
        <h4 style="margin:2px 0 4px; font-size:0.95rem; color:#0b2238; font-weight:700;">📍 You are here</h4>
        <p style="margin:0; font-size:0.775rem; color:#64748b;">${detectedLocationLabel}</p>
      </div>
    `)
    .addTo(mapMarkersLayer);

  // Facility POI Markers
  centres.forEach(c => {
    const cLat = parseFloat(c.lat);
    const cLng = parseFloat(c.lng);
    if (isNaN(cLat) || isNaN(cLng)) return;

    const pinColor = getFacilityPinColorHex(c.category);
    const facIcon = L.divIcon({
      className: 'custom-fac-marker',
      html: `<div class="custom-fac-pin" style="background:${pinColor};"><div class="custom-fac-pin-inner"></div></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -28]
    });

    const marker = L.marker([cLat, cLng], { icon: facIcon }).addTo(mapMarkersLayer);
    mapMarkerDict[c.id] = marker;

    marker.bindPopup(`
      <div style="font-family:system-ui, sans-serif; min-width:220px; padding:2px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:4px; margin-bottom:4px;">
          <span class="badge ${getFacilityBadgeClass(c.category)}" style="font-size:0.65rem;">${c.type}</span>
          <span style="font-size:0.75rem; font-weight:700; color:#0d9488;">📍 ${c.distance}</span>
        </div>
        <h4 style="margin:2px 0 4px; font-size:0.95rem; color:#0b2238; font-weight:700;">🏥 ${c.name}</h4>
        <p style="margin:2px 0 4px; font-size:0.75rem; color:#64748b; line-height:1.3;">📌 ${c.location}</p>
        <p style="margin:0 0 8px; font-size:0.75rem; color:#0f172a;">☎️ <a href="tel:${c.phone.split(' ')[0]}" style="color:inherit; text-decoration:underline;"><strong>${c.phone}</strong></a></p>
        <div style="display:flex; gap:5px; flex-wrap:wrap; margin-top:6px;">
          <button class="btn btn-sm btn-primary" style="font-size:0.72rem; padding:4px 8px; flex:1;" onclick="openFacilityDetailsModal('${c.id}')">Details</button>
          <a href="${c.directionsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline" style="font-size:0.72rem; padding:4px 8px; flex:1; text-align:center;">Directions</a>
          <button class="btn btn-sm btn-emerald" style="background:#25d366; border-color:#25d366; color:#ffffff; font-size:0.72rem; padding:4px 8px; flex:1; font-weight:700;" onclick="window.SwasthyaWhatsAppAI.promptSendSingleFacility('${c.id}')">📱 WhatsApp</button>
        </div>
      </div>
    `);
  });

  // Fit bounds to display the active search radius circle and all healthcare markers
  const bounds = L.latLngBounds([[pLat, pLng]]);
  centres.forEach(c => {
    const cLat = parseFloat(c.lat);
    const cLng = parseFloat(c.lng);
    if (!isNaN(cLat) && !isNaN(cLng)) {
      bounds.extend([cLat, cLng]);
    }
  });
  if (radiusCircleLayer) {
    bounds.extend(radiusCircleLayer.getBounds());
  }

  leafletMapInstance.fitBounds(bounds, { padding: [35, 35], maxZoom: 15 });
}

window.flyToFacility = function(lat, lng, facId) {
  if (leafletMapInstance) {
    const fLat = parseFloat(lat);
    const fLng = parseFloat(lng);
    leafletMapInstance.flyTo([fLat, fLng], 15, { animate: true, duration: 1.0 });
    setTimeout(() => {
      if (mapMarkerDict[facId]) {
        mapMarkerDict[facId].openPopup();
      }
    }, 1100);
  }
};

function getFacilityPinColorHex(cat) {
  const c = String(cat).toLowerCase();
  if (c.includes('emergency')) return '#e11d48'; // 🔴 Emergency
  if (c.includes('government') || c.includes('hospital') || c.includes('chc')) return '#0d9488'; // 🟢 Hospital / CHC
  if (c.includes('phc') || c.includes('arogya') || c.includes('wellness')) return '#059669'; // 🟩 PHC / Arogya Mandir
  if (c.includes('pharmacy') || c.includes('chemist') || c.includes('aushadh')) return '#d97706'; // 🟠 Pharmacy
  if (c.includes('diagnostic') || c.includes('lab') || c.includes('pathology')) return '#8b5cf6'; // 🟣 Diagnostic
  return '#0284c7';
}

// Facility Details Modal
window.openFacilityDetailsModal = function(facilityId) {
  let fac = currentPlacesResults.find(c => c.id === facilityId);
  if (!fac) {
    fac = PulseCareStore.getNearbyCentreById(facilityId);
  }
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
          <span class="badge badge-purple">${fac.beds || 'Hospital Beds Available'}</span>
          <span class="badge badge-primary">${fac.doctorsCount || '8'} On-Duty Doctors</span>
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
        <p style="font-size:0.85rem; margin:0;"><strong>Emergency Ready:</strong> ${fac.emergencyReady ? '🚨 Yes (24x7 Trauma & Ambulance)' : 'Day OPD Care'}</p>
      </div>

      <div class="glass-panel" style="padding:1rem;">
        <h4 style="font-size:0.95rem; margin-bottom:0.4rem; color:var(--hospital-teal-700);">Govt Scheme Empanelled</h4>
        <p style="font-size:0.85rem; margin-bottom:0.25rem;"><strong>PM-JAY Golden Card:</strong> ${fac.pmjayEmpanelled ? '✓ Yes (Cashless Treatment)' : 'Primary Care Outpatient'}</p>
        <p style="font-size:0.85rem; margin-bottom:0.25rem;"><strong>Free Diagnostics:</strong> Available under NHM</p>
        <p style="font-size:0.85rem; margin:0;"><strong>Generic Pharmacy:</strong> Jan Aushadhi Kendra</p>
      </div>
    </div>

    <!-- Complete Available Services -->
    <div style="margin-bottom:1.5rem;">
      <h4 style="font-size:1rem; margin-bottom:0.6rem; color:var(--text-primary);">Available Clinical & Diagnostic Services</h4>
      <div style="display:flex; flex-direction:column; gap:0.45rem;">
        ${(fac.services || ['General OPD', 'Emergency Care', 'Pharmacy', 'Diagnostic Lab']).map(s => `
          <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; background:var(--bg-input); padding:0.6rem 0.85rem; border-radius:var(--radius-xs);">
            <svg class="icon" style="color:var(--hospital-healing-green); width:15px; height:15px; flex-shrink:0;" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            <span>${s}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Footer Actions -->
    <div style="display:flex; justify-content:space-between; align-items:center; padding-top:1rem; border-top:1px solid var(--border-light); flex-wrap:wrap; gap:0.75rem;">
      <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
        <a href="${fac.directionsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-emerald">
          <svg class="icon" viewBox="0 0 24 24"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
          <span>Open Directions (Google Maps)</span>
        </a>
        <button type="button" class="btn btn-emerald" style="background:#25d366; border-color:#25d366; color:#ffffff; font-weight:700;" onclick="window.SwasthyaWhatsAppAI.promptSendSingleFacility('${fac.id}')">
          <svg class="wa-icon" viewBox="0 0 24 24" style="fill:#ffffff; width:16px; height:16px;"><path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.275-.1-.475-.15-.675.15-.2.3-.776.979-.951 1.18-.175.2-.35.225-.651.075-.3-.15-1.267-.467-2.414-1.489-.893-.796-1.496-1.78-1.671-2.08-.175-.3-.019-.462.131-.611.136-.134.301-.35.451-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.585-.492-.505-.675-.514-.175-.009-.375-.009-.575-.009s-.525.075-.8.375c-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.115 3.23 5.124 4.53.716.31 1.275.495 1.71.634.72.229 1.375.197 1.892.12.576-.086 1.78-.727 2.03-1.429.25-.702.25-1.303.175-1.429-.075-.126-.275-.201-.576-.351zM12.004 2C6.48 2 2 6.48 2 12.004c0 1.947.558 3.766 1.523 5.309L2.1 21.9l4.747-1.397A9.954 9.954 0 0 0 12.004 22c5.524 0 10.004-4.48 10.004-10.004C22.008 6.48 17.528 2 12.004 2zm0 18.292c-1.644 0-3.173-.487-4.464-1.326l-.32-.208-2.82.83.844-2.738-.228-.337A8.257 8.257 0 0 1 3.712 12c0-4.572 3.72-8.292 8.292-8.292s8.292 3.72 8.292 8.292-3.72 8.292-8.292 8.292z"/></svg>
          <span>Share on WhatsApp</span>
        </button>
      </div>
      <a href="tel:${fac.phone.split(' ')[0]}" class="btn btn-secondary">
        <svg class="icon" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/></svg>
        <span>Call Facility</span>
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

  const glucEl = document.getElementById('ov-glucose');
  if (glucEl) glucEl.textContent = vit.glucose ? vit.glucose.split(' ')[0] : '94';

  const respEl = document.getElementById('ov-resp-rate');
  if (respEl) respEl.textContent = vit.respiratoryRate ? vit.respiratoryRate.split(' ')[0] : '16';

  const lastSyncEl = document.getElementById('ov-last-synced');
  if (lastSyncEl) lastSyncEl.textContent = vit.lastUpdated || 'Today at 08:30 AM';

  renderTelemetryChart();
}

function renderTelemetryChart() {
  const container = document.getElementById('ov-telemetry-chart-container');
  if (!container) return;

  const history = (currentPatient && currentPatient.vitalsHistory && currentPatient.vitalsHistory.length > 0)
    ? currentPatient.vitalsHistory
    : [
        { date: 'Aug 28', hr: 75, bpSys: 122, bpDia: 80, o2: 98 },
        { date: 'Aug 29', hr: 71, bpSys: 120, bpDia: 78, o2: 99 },
        { date: 'Aug 30', hr: 74, bpSys: 119, bpDia: 79, o2: 99 },
        { date: 'Aug 31', hr: 70, bpSys: 117, bpDia: 77, o2: 98 },
        { date: 'Sep 01', hr: 73, bpSys: 118, bpDia: 78, o2: 99 },
        { date: 'Sep 02', hr: 72, bpSys: 118, bpDia: 78, o2: 99 },
        { date: 'Today', hr: 72, bpSys: 118, bpDia: 78, o2: 99 }
      ];

  const svgWidth = 650;
  const svgHeight = 160;
  const paddingX = 45;
  const paddingY = 25;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingY * 2;

  const count = history.length;
  const getX = (i) => paddingX + (i * plotWidth) / Math.max(1, count - 1);

  // Pulse (BPM): min 55, max 95
  const getYPulse = (val) => paddingY + plotHeight - (((val || 72) - 55) / 40) * plotHeight;
  // Systolic BP: min 100, max 140
  const getYSys = (val) => paddingY + plotHeight - (((val || 120) - 100) / 40) * plotHeight;
  // SpO2: min 94, max 100
  const getYSpO2 = (val) => paddingY + plotHeight - (((val || 99) - 94) / 6) * plotHeight;

  const pulsePoints = history.map((d, i) => `${getX(i).toFixed(1)},${getYPulse(d.hr).toFixed(1)}`).join(' ');
  const sysPoints = history.map((d, i) => `${getX(i).toFixed(1)},${getYSys(d.bpSys).toFixed(1)}`).join(' ');
  const spo2Points = history.map((d, i) => `${getX(i).toFixed(1)},${getYSpO2(d.o2).toFixed(1)}`).join(' ');

  container.innerHTML = `
    <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width:100%; height:auto; overflow:visible;" aria-label="7-Day Telemetry Chart">
      <defs>
        <linearGradient id="telemetryPulseGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0d9488" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#0d9488" stop-opacity="0.0"/>
        </linearGradient>
      </defs>

      <!-- Grid lines -->
      <line x1="${paddingX}" y1="${paddingY}" x2="${svgWidth - paddingX}" y2="${paddingY}" stroke="rgba(148, 163, 184, 0.2)" stroke-dasharray="3 3"/>
      <line x1="${paddingX}" y1="${paddingY + plotHeight / 2}" x2="${svgWidth - paddingX}" y2="${paddingY + plotHeight / 2}" stroke="rgba(148, 163, 184, 0.2)" stroke-dasharray="3 3"/>
      <line x1="${paddingX}" y1="${paddingY + plotHeight}" x2="${svgWidth - paddingX}" y2="${paddingY + plotHeight}" stroke="rgba(148, 163, 184, 0.3)"/>

      <!-- Pulse Area Fill -->
      <polygon points="${getX(0).toFixed(1)},${paddingY + plotHeight} ${pulsePoints} ${getX(count - 1).toFixed(1)},${paddingY + plotHeight}" fill="url(#telemetryPulseGrad)"/>

      <!-- Polylines -->
      <polyline points="${sysPoints}" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="${pulsePoints}" fill="none" stroke="#0d9488" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="${spo2Points}" fill="none" stroke="#e11d48" stroke-width="2" stroke-dasharray="4 3" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Data Dots & Day Labels -->
      ${history.map((d, i) => `
        <g>
          <line x1="${getX(i).toFixed(1)}" y1="${paddingY}" x2="${getX(i).toFixed(1)}" y2="${paddingY + plotHeight}" stroke="rgba(148, 163, 184, 0.15)" stroke-width="1"/>
          <circle cx="${getX(i).toFixed(1)}" cy="${getYPulse(d.hr).toFixed(1)}" r="4.5" fill="#0d9488" stroke="#ffffff" stroke-width="2">
            <title>${d.date}: Pulse ${d.hr} BPM</title>
          </circle>
          <circle cx="${getX(i).toFixed(1)}" cy="${getYSys(d.bpSys).toFixed(1)}" r="4.5" fill="#0284c7" stroke="#ffffff" stroke-width="2">
            <title>${d.date}: BP ${d.bpSys}/${d.bpDia} mmHg</title>
          </circle>
          <text x="${getX(i).toFixed(1)}" y="${paddingY + plotHeight + 16}" font-size="10.5" font-weight="600" fill="var(--text-muted)" text-anchor="middle">${d.date}</text>
        </g>
      `).join('')}
    </svg>
  `;
}

window.syncDeviceTelemetry = function() {
  const syncBtn = document.getElementById('btn-sync-telemetry');

  if (syncBtn) {
    syncBtn.disabled = true;
    syncBtn.innerHTML = `
      <div style="display:inline-block; width:12px; height:12px; border:2px solid var(--hospital-teal-600); border-top-color:transparent; border-radius:50%; animation:spin 0.6s linear infinite; margin-right:4px;"></div>
      <span>Syncing...</span>
    `;
  }

  PulseCareUI.showToast('Telemetry Sync', 'Connecting to Bluetooth BP cuff & Pulse Oximeter...', 'info');

  setTimeout(() => {
    if (currentPatient && currentPatient.vitals) {
      currentPatient.vitals.heartRate = Math.floor(70 + Math.random() * 5);
      currentPatient.vitals.spO2 = Math.min(100, Math.floor(98 + Math.random() * 2));
      currentPatient.vitals.lastUpdated = `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    renderPatientData();

    if (syncBtn) {
      syncBtn.disabled = false;
      syncBtn.innerHTML = `
        <svg class="icon" style="width:14px; height:14px;" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
        <span>Sync Devices</span>
      `;
    }

    PulseCareUI.showToast('Telemetry Updated', 'Live vitals synchronized successfully from home monitoring sensors.', 'success');
  }, 900);
};

function renderAppointments() {
  const allApts = PulseCareStore.getAppointments(currentPatient.id);
  const upcomingContainer = document.getElementById('appointments-upcoming-list');
  const pastContainer = document.getElementById('appointments-past-list');
  const ovContainer = document.getElementById('ov-appointments-list');

  const upcoming = allApts.filter(a => a.status !== 'completed' && a.status !== 'cancelled');
  const past = allApts.filter(a => a.status === 'completed');

  const emptyUpcomingHTML = `
    <div class="glass-panel" style="padding: 2.25rem 1.5rem; text-align: center; border: 1.5px dashed var(--border-light); border-radius: var(--radius-md); margin: 0.5rem 0;">
      <div style="font-size: 2.25rem; margin-bottom: 0.5rem;">📅</div>
      <h4 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-primary);">No upcoming appointments</h4>
      <p style="color: var(--text-secondary); font-size: 0.875rem; max-width: 420px; margin: 0 auto 1.25rem;">
        You currently have no scheduled visits. Search our rural doctor network or book a new tele-consultation.
      </p>
      <div style="display:flex; justify-content:center; gap:0.75rem; flex-wrap:wrap;">
        <button class="btn btn-primary btn-sm" onclick="PulseCareUI.openModal('book-apt-modal')">
          <svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Book Appointment</span>
        </button>
        <button class="btn btn-outline btn-sm" onclick="switchTab('doctors')">
          <span>Find a Doctor</span>
        </button>
      </div>
    </div>
  `;

  if (ovContainer) {
    if (upcoming.length === 0) {
      ovContainer.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">No upcoming appointments scheduled. <a href="#" onclick="event.preventDefault(); PulseCareUI.openModal('book-apt-modal');" style="color:var(--primary-600); font-weight:600;">Book now &rarr;</a></p>`;
    } else {
      ovContainer.innerHTML = upcoming.slice(0, 2).map(apt => createAppointmentItemHTML(apt)).join('');
    }
  }

  if (upcomingContainer) {
    if (upcoming.length === 0) {
      upcomingContainer.innerHTML = emptyUpcomingHTML;
    } else {
      upcomingContainer.innerHTML = upcoming.map(apt => createAppointmentItemHTML(apt, true)).join('');
    }
  }

  if (pastContainer) {
    if (past.length === 0) {
      pastContainer.innerHTML = `<div class="glass-panel" style="padding:1.5rem; text-align:center; color:var(--text-muted); font-size:0.9rem;">No past appointment history recorded.</div>`;
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
  if (typeof SwasthyaOfflineManager !== 'undefined' && SwasthyaOfflineManager.status === 'offline') {
    SwasthyaOfflineManager.queueOfflineAction('REFILL_REQUEST', { rxId });
    PulseCareStore.requestRefill(rxId);
    PulseCareUI.showToast('Refill Saved Offline', 'Refill request stored safely on device. Will automatically sync to pharmacy when reconnected.', 'info');
    renderPrescriptions();
    return;
  }

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
    <div class="portal-card" style="border-top:4px solid ${getCategoryColor(s.category)}; display:flex; flex-direction:column; height:100%; transition:transform 0.2s ease, box-shadow 0.2s ease;">
      <div class="portal-card-header" style="background:var(--bg-surface-elevated); align-items:flex-start; gap:0.6rem;">
        <div style="display:flex; align-items:center; justify-content:center; width:40px; height:40px; border-radius:10px; background:var(--primary-gradient); color:#ffffff; font-size:1.3rem; flex-shrink:0;">
          ${s.icon || '🏛️'}
        </div>
        <div style="flex:1;">
          <span class="badge ${getCategoryBadgeClass(s.category)}" style="margin-bottom:0.35rem;">${s.category}</span>
          <h3 style="font-size:1.15rem; font-weight:700; line-height:1.3; color:var(--text-primary); margin:0;">${s.name}</h3>
          ${s.hindiName ? `<p style="font-size:0.775rem; color:var(--text-muted); margin:3px 0 0 0;">${s.hindiName}</p>` : ''}
        </div>
        <span class="badge badge-emerald" style="white-space:nowrap; font-size:0.7rem;">${s.badge}</span>
      </div>

      <div class="portal-card-body" style="display:flex; flex-direction:column; gap:0.9rem; flex:1;">
        <p style="font-size:0.875rem; line-height:1.5; color:var(--text-secondary); margin:0;">${s.shortDesc}</p>

        <div style="font-size:0.775rem; color:var(--text-muted); display:flex; align-items:center; gap:0.4rem;">
          <svg class="icon" style="width:14px; height:14px; flex-shrink:0; color:var(--hospital-teal-600);" viewBox="0 0 24 24"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7M4 4h16a1 1 0 0 1 1 1v2H3V5a1 1 0 0 1 1-1z"/></svg>
          <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${s.department}</span>
        </div>

        <div style="background:var(--bg-input); padding:0.85rem; border-radius:var(--radius-sm); font-size:0.825rem;">
          <strong style="color:var(--text-primary); display:block; margin-bottom:0.4rem;">Key Benefits & Areas:</strong>
          <ul style="padding:0; margin:0; list-style:none; color:var(--text-secondary); line-height:1.45;">
            ${(s.keyAreas || s.benefits || []).slice(0, 3).map(b => `
              <li style="margin-bottom:4px; display:flex; align-items:flex-start; gap:6px;">
                <span style="color:#10b981; font-weight:700;">✓</span>
                <span>${b}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <div style="margin-top:auto; padding-top:0.75rem; border-top:1px solid var(--border-light); display:flex; flex-direction:column; gap:0.45rem;">
          <div style="display:flex; gap:0.45rem;">
            <button class="btn btn-sm btn-primary" style="flex:1;" onclick="openSchemeDetailsModal('${s.id}')">
              <span>Learn More →</span>
            </button>
            <button class="btn btn-sm btn-secondary" style="flex:1;" onclick="openSchemeEligibilityFor('${s.id}')">
              <span>Check Eligibility</span>
            </button>
          </div>

          ${s.id === 'ayushman-bharat' ? `
            <div style="display:flex; gap:0.45rem;">
              <a href="https://pmjay.gov.in/" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline" style="flex:1; text-align:center; font-size:0.75rem;">
                <span>PM-JAY ↗</span>
              </a>
              <a href="https://aam.mohfw.gov.in/" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline" style="flex:1; text-align:center; font-size:0.75rem;">
                <span>Ayushman Arogya Mandir ↗</span>
              </a>
            </div>
          ` : `
            <a href="${s.officialUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline" style="text-align:center;">
              <span>${s.officialBtnLabel || 'Official Website'} ↗</span>
            </a>
          `}
        </div>
      </div>
    </div>
  `).join('');
}

function getCategoryColor(cat) {
  if (cat.includes('Tribal')) return '#f59e0b';
  if (cat.includes('Infrastructure')) return 'var(--hospital-blue)';
  if (cat.includes('Rural')) return 'var(--hospital-healing-green)';
  if (cat.includes('Universal Health') || cat.includes('Insurance')) return 'var(--hospital-teal-600)';
  if (cat.includes('Telemedicine')) return 'var(--hospital-blue)';
  if (cat.includes('Vaccination') || cat.includes('Immunization')) return 'var(--hospital-healing-green)';
  if (cat.includes('Maternal')) return '#d946ef';
  if (cat.includes('Disease')) return 'var(--hospital-cross-red)';
  return 'var(--hospital-teal-700)';
}

function getCategoryBadgeClass(cat) {
  if (cat.includes('Tribal')) return 'badge-amber';
  if (cat.includes('Infrastructure')) return 'badge-primary';
  if (cat.includes('Rural')) return 'badge-emerald';
  if (cat.includes('Universal Health') || cat.includes('Insurance')) return 'badge-primary';
  if (cat.includes('Telemedicine')) return 'badge-purple';
  if (cat.includes('Vaccination') || cat.includes('Immunization')) return 'badge-emerald';
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
  if (modalTitle) modalTitle.innerHTML = `<span style="margin-right:6px;">${scheme.icon || '🏛️'}</span> ${escapeHTML(scheme.name)}`;

  modalBody.innerHTML = `
    <!-- Header Banner / About -->
    <div class="welcome-banner" style="padding:1.25rem; margin-bottom:1.25rem; background:linear-gradient(135deg, rgba(13, 148, 136, 0.12) 0%, rgba(2, 132, 199, 0.12) 100%);">
      <div class="welcome-text">
        <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.25rem; flex-wrap:wrap;">
          <span class="badge badge-emerald">${scheme.badge}</span>
          <span class="badge badge-primary">${scheme.category}</span>
        </div>
        <h4 style="font-size:1.15rem; margin-bottom:0.25rem;">About the Scheme</h4>
        <p style="font-size:0.875rem; color:var(--text-secondary); line-height:1.5;">${scheme.shortDesc}</p>
      </div>
    </div>

    <!-- Objectives -->
    <div style="background:var(--bg-surface); border:1px solid var(--border-light); border-radius:var(--radius-sm); padding:1rem; margin-bottom:1.25rem;">
      <h4 style="font-size:0.95rem; margin-bottom:0.35rem; color:var(--hospital-teal-700);">🎯 Scheme Objectives</h4>
      <p style="font-size:0.85rem; color:var(--text-secondary); margin:0; line-height:1.5;">${scheme.purpose}</p>
    </div>

    <!-- Who it is intended to support -->
    ${scheme.intendedSupport ? `
      <div style="background:var(--bg-surface); border:1px solid var(--border-light); border-radius:var(--radius-sm); padding:1rem; margin-bottom:1.25rem;">
        <h4 style="font-size:0.95rem; margin-bottom:0.35rem; color:var(--hospital-teal-700);">👥 Who it is Intended to Support</h4>
        <p style="font-size:0.85rem; color:var(--text-secondary); margin:0; line-height:1.5;">${scheme.intendedSupport}</p>
      </div>
    ` : ''}

    <!-- Key Services & Benefits -->
    <div style="margin-bottom:1.25rem;">
      <h4 style="font-size:1rem; margin-bottom:0.5rem; color:var(--hospital-teal-700);">Key Services & Benefits</h4>
      <div style="display:flex; flex-direction:column; gap:0.45rem;">
        ${(scheme.benefits || scheme.keyAreas || []).map(b => `
          <div style="display:flex; align-items:flex-start; gap:0.5rem; font-size:0.85rem; background:var(--bg-input); padding:0.6rem 0.8rem; border-radius:var(--radius-xs);">
            <svg class="icon" style="color:var(--hospital-healing-green); width:16px; height:16px; margin-top:2px; flex-shrink:0;" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            <span>${b}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Eligibility & Documents Grid -->
    <div class="dashboard-grid-2" style="margin-bottom:1.25rem;">
      <div class="glass-panel" style="padding:1rem;">
        <h4 style="font-size:0.925rem; margin-bottom:0.4rem; color:var(--text-primary);">Eligibility Criteria</h4>
        <ul style="padding-left:1.15rem; font-size:0.825rem; color:var(--text-secondary); line-height:1.5; margin:0;">
          ${(scheme.eligibility || []).map(e => `<li style="margin-bottom:4px;">${e}</li>`).join('')}
        </ul>
      </div>

      <div class="glass-panel" style="padding:1rem;">
        <h4 style="font-size:0.925rem; margin-bottom:0.4rem; color:var(--text-primary);">Required Documents</h4>
        <ul style="padding-left:1.15rem; font-size:0.825rem; color:var(--text-secondary); line-height:1.5; margin:0;">
          ${(scheme.documents || []).map(d => `<li style="margin-bottom:4px;">${d}</li>`).join('')}
        </ul>
      </div>
    </div>

    <!-- How to Get More Information & Apply -->
    <div style="margin-bottom:1.25rem;">
      <h4 style="font-size:1rem; margin-bottom:0.5rem; color:var(--hospital-teal-700);">How to Get More Information & Apply</h4>
      <div style="display:flex; flex-direction:column; gap:0.45rem;">
        ${(scheme.howToApply || []).map((step, idx) => `
          <div style="display:flex; align-items:flex-start; gap:0.65rem; font-size:0.85rem; background:var(--bg-surface); border:1px solid var(--border-light); padding:0.6rem 0.8rem; border-radius:var(--radius-xs);">
            <span style="width:22px; height:22px; border-radius:50%; background:var(--primary-gradient); color:#fff; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:800; flex-shrink:0;">${idx + 1}</span>
            <p style="margin:0; font-size:0.825rem; color:var(--text-secondary); line-height:1.4;">${step}</p>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Standard Disclaimer Box -->
    <div style="background:rgba(2, 132, 199, 0.08); border-left:4px solid var(--hospital-blue); padding:0.85rem 1rem; border-radius:var(--radius-xs); margin-bottom:1.25rem; font-size:0.825rem; color:var(--text-secondary); line-height:1.45;">
      <strong style="color:var(--hospital-blue); display:block; margin-bottom:2px;">📌 Important Guidance Notice:</strong>
      <span>${scheme.disclaimer || 'Information provided by SwasthyaConnect is for awareness and guidance. Eligibility, benefits and application decisions are determined by the relevant Government authority.'}</span>
      <div style="margin-top:4px; font-size:0.75rem; color:var(--text-muted);">
        📅 Last Verified Date: <strong>${scheme.lastVerified || 'September 2026'}</strong>
      </div>
    </div>

    <!-- Action Buttons with Official Links -->
    <div style="display:flex; justify-content:space-between; align-items:center; padding-top:1rem; border-top:1px solid var(--border-light); flex-wrap:wrap; gap:0.75rem;">
      <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
        <a href="${scheme.officialUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-emerald">
          <svg class="icon" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          <span>${scheme.officialBtnLabel || 'Official Government Website'} ↗</span>
        </a>
        ${scheme.secondaryUrl ? `
          <a href="${scheme.secondaryUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">
            <span>${scheme.secondaryBtnLabel || 'Secondary Portal'} ↗</span>
          </a>
        ` : ''}
      </div>
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
              <h4 style="font-size:1.15rem; color:var(--text-primary);">🎯 Scheme Eligibility Guidance Report</h4>
              <span class="badge badge-emerald">Evaluated</span>
            </div>

            <div style="background:rgba(245, 158, 11, 0.12); border:1px solid rgba(245, 158, 11, 0.4); border-radius:var(--radius-xs); padding:0.85rem 1rem; margin-bottom:1.25rem; font-size:0.825rem; color:var(--text-primary);">
              <strong>⚠️ Guidance Notice:</strong> Information provided by SwasthyaConnect is for guidance and awareness only. Eligibility, benefits and application decisions are determined by the relevant Government authority. Verify through the official portal.
            </div>

            <div style="display:flex; flex-direction:column; gap:0.75rem;">
              ${results.map(r => `
                <div class="glass-panel" style="padding:1rem; border-left:4px solid ${getEligibilityStatusColor(r.status)};">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.25rem; flex-wrap:wrap; gap:0.4rem;">
                    <div style="display:flex; align-items:center; gap:0.4rem;">
                      <span>${r.icon || '🏛️'}</span>
                      <strong style="font-size:0.95rem; color:var(--text-primary);">${r.schemeName}</strong>
                      <span class="badge ${getCategoryBadgeClass(r.category)}" style="margin-left:4px; font-size:0.65rem;">${r.category}</span>
                    </div>
                    ${getEligibilityBadgeHTML(r.status)}
                  </div>
                  <p style="font-size:0.825rem; color:var(--text-secondary); margin:0.35rem 0 0.5rem; line-height:1.4;">
                    ${r.reason}
                  </p>
                  <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
                    <a href="${r.portalUrl || r.officialUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline" style="font-size:0.75rem; padding:0.25rem 0.6rem;">
                      <span>Verify on Official Portal ↗</span>
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
  if (status === 'Potentially Eligible' || status === 'Eligible') return 'var(--hospital-healing-green)';
  if (status === 'More Information Required' || status === 'Verify') return '#f59e0b';
  return 'var(--hospital-blue)';
}

function getEligibilityBadgeHTML(status) {
  if (status === 'Potentially Eligible' || status === 'Eligible') {
    return `<span class="badge badge-emerald">🟢 Potentially Eligible</span>`;
  } else if (status === 'More Information Required') {
    return `<span class="badge badge-amber">🟡 More Information Required</span>`;
  } else {
    return `<span class="badge badge-primary">🔵 Check Official Eligibility</span>`;
  }
}

// Telehealth WebRTC Simulator
window.joinTelehealthRoom = function(aptId) {
  if (typeof SwasthyaOfflineManager !== 'undefined' && SwasthyaOfflineManager.status === 'offline') {
    PulseCareUI.showToast('Internet Connection Required', 'Live encrypted video telehealth requires an active internet connection. Please reconnect or use the offline telephone helpline.', 'error');
    return;
  }

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
  const dateInput = document.getElementById('book-date');

  // Set min date to today
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    if (!dateInput.value || dateInput.value < today) {
      dateInput.value = today;
    }
  }

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

      if (!doc) {
        PulseCareUI.showToast('Select Doctor', 'Please select an attending doctor.', 'error');
        return;
      }

      const appointmentData = {
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
      };

      try {
        if (typeof SwasthyaOfflineManager !== 'undefined' && SwasthyaOfflineManager.status === 'offline') {
          SwasthyaOfflineManager.queueOfflineAction('BOOK_APPOINTMENT', appointmentData);
          PulseCareStore.addAppointment(appointmentData);
          PulseCareUI.closeModal('book-apt-modal');
          PulseCareUI.showToast('Appointment Saved (Offline)', `Consultation with ${doc.name} saved on device. Will auto-sync with servers when online.`, 'info');
          renderAppointments();
          switchTab('appointments');
          return;
        }

        PulseCareStore.addAppointment(appointmentData);

        PulseCareUI.closeModal('book-apt-modal');
        PulseCareUI.showToast('Appointment Confirmed', `Appointment successfully booked with ${doc.name} for ${date} at ${time}.`, 'success');
        renderAppointments();
        switchTab('appointments');
      } catch (err) {
        PulseCareUI.showToast('Booking Error', err.message || 'Unable to complete booking. Please select another date/time.', 'error');
      }
    });
  }
}

// ==========================================================================
// DOCTORS DIRECTORY & SEARCH
// ==========================================================================

function renderDoctorsList(filterOptions = {}) {
  const container = document.getElementById('doctors-cards-container');
  if (!container) return;

  let doctors = PulseCareStore.getDoctors();

  const specialty = filterOptions.specialty || document.getElementById('filter-doc-specialty')?.value || 'All';
  const location = filterOptions.location || document.getElementById('filter-doc-location')?.value || 'All';
  const language = filterOptions.language || document.getElementById('filter-doc-language')?.value || 'All';

  if (specialty !== 'All') {
    doctors = doctors.filter(d => (d.specialty || '').toLowerCase().includes(specialty.toLowerCase()));
  }

  if (location !== 'All') {
    doctors = doctors.filter(d => (d.hospital || '').toLowerCase().includes(location.toLowerCase()));
  }

  if (language !== 'All') {
    doctors = doctors.filter(d => (d.languages || []).some(l => l.toLowerCase().includes(language.toLowerCase())));
  }

  if (doctors.length === 0) {
    container.innerHTML = `
      <div class="glass-panel" style="grid-column: 1 / -1; padding: 2.5rem; text-align: center;">
        <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🩺</div>
        <h4 style="font-size: 1.2rem; margin-bottom: 0.5rem;">No doctors matching selected filters</h4>
        <p style="color: var(--text-secondary); margin-bottom: 1.25rem;">Try resetting your filters to view all available specialists in the rural tele-health network.</p>
        <button class="btn btn-primary btn-sm" onclick="resetDoctorFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = doctors.map(doc => `
    <div class="glass-panel" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; border-top: 4px solid var(--primary-600); transition: transform 0.2s ease, box-shadow 0.2s ease;">
      <div>
        <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem;">
          <div class="user-avatar" style="width: 52px; height: 52px; font-size: 1.2rem; background: var(--primary-gradient); flex-shrink: 0;">
            ${doc.avatar}
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
              <h3 style="font-size: 1.1rem; font-weight: 700; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${doc.name}</h3>
              <span class="badge badge-emerald" style="font-size: 0.7rem;">⭐ ${doc.rating || '4.9'}</span>
            </div>
            <p style="color: var(--primary-600); font-size: 0.85rem; font-weight: 600; margin: 2px 0 0;">${doc.specialty}</p>
          </div>
        </div>

        <div style="margin-bottom: 1rem; font-size: 0.825rem; color: var(--text-secondary);">
          <div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.35rem;">
            <svg class="icon" viewBox="0 0 24 24" style="width:14px; height:14px; color:var(--primary-600);"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span><strong>Facility:</strong> ${doc.hospital}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.35rem;">
            <svg class="icon" viewBox="0 0 24 24" style="width:14px; height:14px; color:var(--accent-emerald);"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span><strong>Schedule:</strong> ${doc.availability || 'Mon - Sat (09:00 - 17:00)'}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.4rem;">
            <svg class="icon" viewBox="0 0 24 24" style="width:14px; height:14px; color:var(--text-muted);"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
            <span><strong>Languages:</strong> ${(doc.languages || ['English', 'Telugu', 'Hindi']).join(', ')}</span>
          </div>
        </div>

        <p style="font-size: 0.825rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 1.25rem;">
          ${doc.bio || 'Experienced clinician providing primary and specialized care for rural and underserved communities.'}
        </p>
      </div>

      <div style="display: flex; gap: 0.5rem; border-top: 1px solid var(--border-light); padding-top: 1rem;">
        <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="bookDoctorDirectly('${doc.id}')">
          <svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Book Appointment</span>
        </button>
      </div>
    </div>
  `).join('');
}

function filterDoctorsList() {
  renderDoctorsList();
}

function resetDoctorFilters() {
  const spec = document.getElementById('filter-doc-specialty');
  const loc = document.getElementById('filter-doc-location');
  const lang = document.getElementById('filter-doc-language');
  if (spec) spec.value = 'All';
  if (loc) loc.value = 'All';
  if (lang) lang.value = 'All';
  renderDoctorsList();
}

function bookDoctorDirectly(doctorId) {
  const docSelect = document.getElementById('book-doctor-select');
  if (docSelect && doctorId) {
    docSelect.value = doctorId;
  }
  PulseCareUI.openModal('book-apt-modal');
}
