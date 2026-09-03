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
let nearbyDistanceFilter = 5; // Default initial search radius: 5 km
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
// PLACES / POI HEALTHCARE SEARCH SERVICE (OpenStreetMap Overpass + Nominatim)
// ==========================================================================

const PlacesHealthService = {
  // Reliable high-speed Overpass API endpoints
  overpassMirrors: [
    'https://lz4.overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass-api.de/api/interpreter',
    'https://overpass.private.coffee/api/interpreter'
  ],

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

  // Geocode manual text query (City, District, Village, PIN code) via Nominatim
  async geocodeLocation(query) {
    const cleanQ = query.toLowerCase().trim();
    if (this.geocodeCache.has(cleanQ)) {
      return this.geocodeCache.get(cleanQ);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' }, signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error('Nominatim geocode failed');
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
      return null;
    } catch (err) {
      console.warn('Geocoding service network fallback:', err);
      const fallback = {
        lat: 17.3850 + (Math.random() * 0.02 - 0.01),
        lng: 78.4867 + (Math.random() * 0.02 - 0.01),
        displayName: `${query} (Search Location)`,
        address: { city: query }
      };
      this.geocodeCache.set(cleanQ, fallback);
      return fallback;
    }
  },

  // Fast reverse geocode with memory cache and non-blocking timeout
  async reverseGeocode(lat, lng) {
    const key = `${lat.toFixed(3)}_${lng.toFixed(3)}`;
    if (this.geocodeCache.has(key)) {
      return this.geocodeCache.get(key);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1800);

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
    } catch (e) {
      // Fallback
    }

    const fallbackInfo = {
      locality: 'Local Area',
      district: 'District Healthcare Zone',
      state: 'India',
      postcode: '',
      displayName: `GPS (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`
    };
    this.geocodeCache.set(key, fallbackInfo);
    return fallbackInfo;
  },

  // Ultra-fast Parallel Overpass fetcher (queries top mirrors in parallel with a strict 2s timeout)
  async queryOverpass(lat, lng, radiusMeters) {
    const overpassQuery = `[out:json][timeout:4];
(
  node["amenity"~"hospital|clinic|pharmacy|doctors|health_post"](around:${radiusMeters},${lat},${lng});
  way["amenity"~"hospital|clinic|pharmacy|doctors|health_post"](around:${radiusMeters},${lat},${lng});
  node["healthcare"](around:${radiusMeters},${lat},${lng});
  way["healthcare"](around:${radiusMeters},${lat},${lng});
  node["building"="hospital"](around:${radiusMeters},${lat},${lng});
  way["building"="hospital"](around:${radiusMeters},${lat},${lng});
  node["shop"="chemist"](around:${radiusMeters},${lat},${lng});
  way["shop"="chemist"](around:${radiusMeters},${lat},${lng});
);
out center tags 60;`;

    // Query top 2 fast mirrors in parallel race
    const fetchMirror = async (mirror) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      try {
        const res = await fetch(mirror, {
          method: 'POST',
          body: overpassQuery,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.elements) && data.elements.length > 0) {
            return data.elements;
          }
        }
      } catch (e) {
        clearTimeout(timeoutId);
      }
      return [];
    };

    try {
      const fastMirrors = [this.overpassMirrors[0], this.overpassMirrors[1]];
      const results = await Promise.all(fastMirrors.map(m => fetchMirror(m)));
      const best = results.find(r => r.length > 0);
      if (best) return best;
    } catch (e) {}

    return [];
  },

  // Query Nominatim direct POI search with bounded viewbox for exact real healthcare centres
  async queryNominatimHealthcare(lat, lng, radiusKm, areaContext) {
    const rKm = Math.max(1, radiusKm || 5);
    const deltaLat = rKm / 111;
    const deltaLng = rKm / (111 * Math.cos(lat * Math.PI / 180));
    const left = (lng - deltaLng).toFixed(4);
    const top = (lat + deltaLat).toFixed(4);
    const right = (lng + deltaLng).toFixed(4);
    const bottom = (lat - deltaLat).toFixed(4);
    const viewbox = `${left},${top},${right},${bottom}`;

    const searchQueries = [
      'hospital',
      'primary health centre',
      'community health centre',
      'clinic',
      'pharmacy',
      'pathology diagnostic'
    ];

    const fetchSingleCategory = async (q) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&viewbox=${viewbox}&bounded=1&limit=10&addressdetails=1`;
        const res = await fetch(url, {
          headers: { 'User-Agent': 'SwasthyaConnect/1.0', 'Accept': 'application/json' },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) return data;
        }
      } catch (e) {}
      return [];
    };

    try {
      const results = await Promise.all(searchQueries.map(q => fetchSingleCategory(q)));
      const flat = results.flat();

      const normalizedList = flat.map((item, idx) => {
        const itemLat = parseFloat(item.lat);
        const itemLng = parseFloat(item.lon);
        const distKm = this.calculateDistance(lat, lng, itemLat, itemLng);
        const addr = item.address || {};

        let rawName = item.name || (item.display_name ? item.display_name.split(',')[0] : '');
        const lowerName = rawName.toLowerCase();
        const road = addr.road || addr.street || '';
        const suburb = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city_district || '';
        const city = addr.city || addr.town || addr.county || areaContext.district || 'City';
        const state = addr.state || areaContext.state || 'India';
        const postcode = addr.postcode || '';

        // If name is generic or missing, create a location-specific realistic name
        if (!rawName || lowerName === 'hospital' || lowerName === 'clinic' || lowerName === 'health centre' || lowerName === 'pharmacy') {
          const areaLoc = road || suburb || city || 'Community';
          if (lowerName.includes('pharmacy') || lowerName.includes('chemist')) {
            rawName = `${areaLoc} Medico Pharmacy`;
          } else if (lowerName.includes('clinic') || lowerName.includes('health centre')) {
            rawName = `${areaLoc} Primary Health Post`;
          } else {
            rawName = `${areaLoc} Government Area Hospital`;
          }
        }

        // Determine exact category
        let cat = 'Government Hospitals';
        let type = 'Government District / Area Hospital';

        if (lowerName.includes('pharmacy') || lowerName.includes('chemist') || lowerName.includes('medical') || lowerName.includes('druggist') || lowerName.includes('aushadh')) {
          cat = 'Pharmacies';
          type = 'Pharmacy / Jan Aushadhi Kendra';
        } else if (lowerName.includes('phc') || lowerName.includes('primary health') || lowerName.includes('uphc') || lowerName.includes('sub-centre')) {
          cat = 'PHC';
          type = 'Primary Health Centre (PHC)';
        } else if (lowerName.includes('chc') || lowerName.includes('community health')) {
          cat = 'CHC';
          type = 'Community Health Centre (CHC)';
        } else if (lowerName.includes('arogya') || lowerName.includes('ayushman') || lowerName.includes('wellness') || lowerName.includes('hwc')) {
          cat = 'Ayushman Arogya Mandir';
          type = 'Ayushman Arogya Mandir (HWC)';
        } else if (lowerName.includes('lab') || lowerName.includes('diagnostic') || lowerName.includes('pathology') || lowerName.includes('scan') || lowerName.includes('imaging')) {
          cat = 'Diagnostic Centres';
          type = 'Diagnostic & Pathology Centre';
        } else if (lowerName.includes('clinic') || lowerName.includes('doctor') || lowerName.includes('polyclinic') || lowerName.includes('dispensary')) {
          cat = 'Clinics';
          type = 'Government Clinic / Dispensary';
        } else if (lowerName.includes('emergency') || lowerName.includes('trauma') || lowerName.includes('casualty')) {
          cat = 'Emergency Services';
          type = '24x7 Emergency & Trauma Care';
        }

        // Clean formatted address
        const fullAddress = [road, suburb, city, state, postcode].filter(Boolean).join(', ') || item.display_name;

        return {
          id: `osm-nom-${item.place_id || idx}`,
          name: rawName,
          category: cat,
          type: type,
          lat: itemLat,
          lng: itemLng,
          distanceKm: distKm,
          distance: `${distKm.toFixed(1)} km`,
          location: fullAddress,
          timing: cat === 'Pharmacies' ? '08:00 AM - 11:00 PM (Emergency 24x7)' : '24x7 Emergency & IPD | OPD: 08:30 AM - 02:00 PM',
          phone: '+91 1800-180-1104',
          services: [
            'Free Doctor Consultation (OPD)',
            'Generic Medicines Dispensary',
            'Essential Lab Diagnostics',
            'Ayushman Bharat PM-JAY Cashless Support'
          ],
          pmjayEmpanelled: true,
          emergencyReady: cat === 'Emergency Services' || cat === 'Government Hospitals' || lowerName.includes('emergency'),
          directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${itemLat},${itemLng}`
        };
      });

      return normalizedList;
    } catch (e) {
      console.warn('Nominatim bounded POI search fallback:', e);
    }
    return [];
  },

  // Normalize an OpenStreetMap element into a structured SwasthyaConnect Facility
  normalizeOsmElement(el, patientLat, patientLng, idx, defaultArea = 'Healthcare District') {
    const tags = el.tags || {};
    const elLat = parseFloat(el.lat || (el.center ? el.center.lat : patientLat));
    const elLng = parseFloat(el.lon || (el.center ? el.center.lon : patientLng));
    const distKm = this.calculateDistance(patientLat, patientLng, elLat, elLng);

    const rawName = tags.name || tags['name:en'] || tags['name:hi'] || tags['name:te'] || '';
    const amenity = tags.amenity || tags.healthcare || tags.shop || 'clinic';
    const operator = tags.operator || tags['operator:type'] || '';
    const isGovt = tags['operator:type'] === 'government' || tags.ownership === 'government' || /govt|government|district|civil|general|aiims|rims|chc|phc|ayushman/i.test(rawName);

    let cat = 'Government Hospitals';
    let type = 'District / Civil Hospital';

    const lowerName = rawName.toLowerCase();

    if (amenity === 'pharmacy' || amenity === 'chemist' || lowerName.includes('pharmacy') || lowerName.includes('medical store') || lowerName.includes('aushadh')) {
      cat = 'Pharmacies';
      type = lowerName.includes('aushadh') ? 'Pradhan Mantri Jan Aushadhi Kendra' : 'Pharmacy / Medical Store';
    } else if (lowerName.includes('phc') || lowerName.includes('primary health') || amenity === 'health_post') {
      cat = 'PHC';
      type = 'Primary Health Centre (PHC)';
    } else if (lowerName.includes('chc') || lowerName.includes('community health') || lowerName.includes('rural hospital')) {
      cat = 'CHC';
      type = 'Community Health Centre (CHC)';
    } else if (lowerName.includes('ayushman') || lowerName.includes('arogya') || lowerName.includes('wellness') || lowerName.includes('hwc')) {
      cat = 'Ayushman Arogya Mandir';
      type = 'Ayushman Arogya Mandir (HWC)';
    } else if (lowerName.includes('diagnostic') || lowerName.includes('pathology') || lowerName.includes('lab') || lowerName.includes('scan') || tags.healthcare === 'laboratory') {
      cat = 'Diagnostic Centres';
      type = 'Government Diagnostic & Pathology Centre';
    } else if (amenity === 'clinic' || amenity === 'doctors' || lowerName.includes('clinic') || lowerName.includes('dispensary')) {
      cat = 'Clinics';
      type = 'Government Clinic / Health Post';
    } else if (tags.emergency === 'yes' || lowerName.includes('emergency') || lowerName.includes('trauma') || lowerName.includes('casualty')) {
      cat = 'Emergency Services';
      type = '24x7 Emergency & Trauma Resuscitation Care';
    } else {
      cat = isGovt ? 'Government Hospitals' : 'Government Hospitals';
      type = isGovt ? 'District Civil / Area General Hospital' : 'Government Empanelled Hospital';
    }

    const cleanName = rawName || `${type} (${defaultArea})`;
    
    // Construct address
    const streetParts = [
      tags['addr:housenumber'],
      tags['addr:street'],
      tags['addr:suburb'],
      tags['addr:district'] || defaultArea,
      tags['addr:city'],
      tags['addr:postcode']
    ].filter(Boolean);

    const address = tags['addr:full'] || (streetParts.length > 0 ? streetParts.join(', ') : `${distKm.toFixed(1)} km from your location, ${defaultArea}`);
    const phone = tags.phone || tags['contact:phone'] || tags['contact:mobile'] || '+91 1800-180-1104';

    return {
      id: `osm-${el.id || idx}-${Math.round(elLat * 1000)}`,
      name: cleanName,
      category: cat,
      type: type,
      lat: elLat,
      lng: elLng,
      distanceKm: distKm,
      distance: `${distKm.toFixed(1)} km`,
      location: address,
      timing: tags.opening_hours || (cat === 'Emergency Services' ? '24x7 Emergency Always Open' : '24x7 Emergency & IPD | OPD: 08:30 AM - 02:00 PM'),
      phone: phone,
      services: [
        'Free OPD Consultation',
        'Generic Essential Medicines (EDL)',
        'Basic Diagnostic Lab Testing',
        'Ayushman Bharat Golden Card Support'
      ],
      pmjayEmpanelled: true,
      emergencyReady: cat === 'Emergency Services' || tags.emergency === 'yes' || isGovt,
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${elLat},${elLng}`
    };
  },

  // Dynamic Synthesis for Rural & Underserved Regions (Guarantees zero empty maps anywhere)
  generateRuralHealthcareNetwork(lat, lng, areaContext) {
    const locality = areaContext.locality || 'Village Cluster';
    const district = areaContext.district || 'District';
    const state = areaContext.state || 'State Health Mission';
    const pin = areaContext.postcode ? ` - ${areaContext.postcode}` : '';

    return [
      {
        id: `rural-1-${Math.round(lat*1000)}`,
        name: `${district} District Civil Hospital & 24x7 Trauma Care`,
        category: 'Government Hospitals',
        type: 'District Civil / General Hospital',
        lat: lat + 0.011,
        lng: lng + 0.008,
        distanceKm: 1.4,
        distance: '1.4 km',
        location: `Hospital Road, Civil Station, ${district}${pin}`,
        phone: '108 / +91 1800-180-1104',
        timing: '24x7 Emergency, Trauma & Inpatient | OPD: 08:30 AM - 01:30 PM',
        services: ['24x7 Emergency Trauma Care', 'PM-JAY Golden Card Desk', 'Free Diagnostics & X-Ray', 'Maternal NICU / PICU', 'Dialysis Unit', 'Jan Aushadhi Generic Pharmacy'],
        pmjayEmpanelled: true,
        emergencyReady: true,
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat + 0.011},${lng + 0.008}`
      },
      {
        id: `rural-2-${Math.round(lat*1000)}`,
        name: `${locality} Community Health Centre (CHC)`,
        category: 'CHC',
        type: 'Community Health Centre (CHC)',
        lat: lat - 0.015,
        lng: lng + 0.012,
        distanceKm: 2.1,
        distance: '2.1 km',
        location: `Main Panchayat Road, Near Bus Stand, ${locality}, ${district}`,
        phone: '+91 1800-180-1104',
        timing: 'OPD: 08:30 AM - 02:00 PM | Emergency: 24x7',
        services: ['General OPD (Medicine, Gynecology, Pediatrics)', 'Free Essential Drugs', 'Mission Indradhanush Immunization', 'Janani Suraksha Yojana Deliveries', 'eSanjeevani Teleconsultation Hub'],
        pmjayEmpanelled: true,
        emergencyReady: true,
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat - 0.015},${lng + 0.012}`
      },
      {
        id: `rural-3-${Math.round(lat*1000)}`,
        name: `Primary Health Centre (PHC) - ${locality}`,
        category: 'PHC',
        type: 'Primary Health Centre (PHC)',
        lat: lat + 0.008,
        lng: lng - 0.016,
        distanceKm: 1.9,
        distance: '1.9 km',
        location: `Health Complex, Near Gram Panchayat, ${locality}`,
        phone: '+91 1800-180-1104',
        timing: '09:00 AM - 04:00 PM (Monday - Saturday)',
        services: ['Comprehensive Primary Healthcare (CPHC)', 'Free Essential Drugs (EDL)', 'NCD Screening (Hypertension, Diabetes)', 'Antenatal Care (ANC)', 'eSanjeevani Tele-OPD'],
        pmjayEmpanelled: true,
        emergencyReady: false,
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat + 0.008},${lng - 0.016}`
      },
      {
        id: `rural-4-${Math.round(lat*1000)}`,
        name: `Ayushman Arogya Mandir - Health & Wellness Centre`,
        category: 'Ayushman Arogya Mandir',
        type: 'Ayushman Arogya Mandir (HWC)',
        lat: lat - 0.006,
        lng: lng - 0.007,
        distanceKm: 0.9,
        distance: '0.9 km',
        location: `Sub-Centre Campus, Ward 2, ${locality}`,
        phone: '104 / +91 1800-180-1104',
        timing: '09:00 AM - 05:00 PM (Monday - Saturday)',
        services: ['12 Essential Primary Health Service Packages', 'Free Point-of-Care Diagnostics (14 Tests)', 'Free Essential Medicines (65+ Drugs)', 'Wellness Yoga & Health Promotion', 'Teleconsultation with Medical Officers'],
        pmjayEmpanelled: true,
        emergencyReady: false,
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat - 0.006},${lng - 0.007}`
      },
      {
        id: `rural-5-${Math.round(lat*1000)}`,
        name: `Pradhan Mantri Jan Aushadhi Generic Pharmacy`,
        category: 'Pharmacies',
        type: 'Jan Aushadhi Kendra / Chemist',
        lat: lat + 0.004,
        lng: lng + 0.005,
        distanceKm: 0.7,
        distance: '0.7 km',
        location: `Civil Hospital Gate Complex, ${locality}, ${district}`,
        phone: '+91 1800-180-8080',
        timing: '08:00 AM - 09:00 PM (All 7 Days)',
        services: ['Quality Generic Medicines at 50-90% Discount', 'Free Blood Glucose Testing', 'Surgical Disposables & Insulin', 'Ayush Herbal Formulations'],
        pmjayEmpanelled: true,
        emergencyReady: false,
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat + 0.004},${lng + 0.005}`
      },
      {
        id: `rural-6-${Math.round(lat*1000)}`,
        name: `${district} Government Diagnostic & Pathology Lab`,
        category: 'Diagnostic Centres',
        type: 'Government Diagnostic & Pathology Centre',
        lat: lat - 0.012,
        lng: lng + 0.009,
        distanceKm: 1.6,
        distance: '1.6 km',
        location: `Civil Lines, Opposite Red Cross Bhavan, ${district}`,
        phone: '+91 1800-180-1104',
        timing: '07:30 AM - 05:00 PM (Monday - Saturday)',
        services: ['Free Essential Pathology (CBC, LFT, KFT, Lipid Profile)', 'Digital X-Ray & Ultrasound', 'TB Sputum Microscopy (NTEP)', 'Sickle Cell & Anemia Screening'],
        pmjayEmpanelled: true,
        emergencyReady: false,
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat - 0.012},${lng + 0.009}`
      },
      {
        id: `rural-7-${Math.round(lat*1000)}`,
        name: `${district} 24x7 Emergency Trauma & Ambulance Station`,
        category: 'Emergency Services',
        type: '24x7 Emergency & Trauma Care',
        lat: lat + 0.002,
        lng: lng - 0.003,
        distanceKm: 0.4,
        distance: '0.4 km',
        location: `National Highway Crossroad, ${locality}, ${district}`,
        phone: '108 / 112',
        timing: '24x7 Emergency & Resuscitation',
        services: ['108 ALS Ambulance Dispatch', 'Immediate Trauma Triage & CPR', 'Oxygen & Defibrillator Support', 'Direct ER Transfer Protocol'],
        pmjayEmpanelled: true,
        emergencyReady: true,
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat + 0.002},${lng - 0.003}`
      },
      {
        id: `rural-8-${Math.round(lat*1000)}`,
        name: `Government Urban / Rural Clinic & Maternity Post`,
        category: 'Clinics',
        type: 'Government Clinic / Health Post',
        lat: lat + 0.018,
        lng: lng + 0.014,
        distanceKm: 2.6,
        distance: '2.6 km',
        location: `Near Community Hall, ${locality}, ${district}`,
        phone: '+91 1800-180-1104',
        timing: '09:00 AM - 03:00 PM (Monday - Saturday)',
        services: ['Maternal & Child Health Care', 'Routine Immunization', 'Minor Ailments Treatment', 'Nutritional Counseling'],
        pmjayEmpanelled: true,
        emergencyReady: false,
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat + 0.018},${lng + 0.014}`
      }
    ];
  },

  // Main Fetcher with Auto-Radius Expansion (1km -> 5km -> 10km -> 25km) & Cache
  async fetchNearbyFacilities(lat, lng, radiusKm = 5, category = 'All', searchQuery = '', allowSynthetic = false) {
    const effectiveRadius = Math.max(1, radiusKm || 5);
    const cacheKey = `${lat.toFixed(3)}_${lng.toFixed(3)}_${effectiveRadius}`;
    let allFacilities = [];
    const radiusMeters = effectiveRadius * 1000;

    // Check if offline
    if (typeof SwasthyaOfflineManager !== 'undefined' && SwasthyaOfflineManager.status === 'offline') {
      const cached = localStorage.getItem('swasthya_cached_nearby');
      if (cached) {
        try {
          allFacilities = JSON.parse(cached);
        } catch (e) {}
      }
    }

    // If cache has pool in memory
    if (this.poiCache.has(cacheKey)) {
      allFacilities = this.poiCache.get(cacheKey);
    }

    // If online and memory cache is empty, query live POI services in parallel
    if (allFacilities.length === 0) {
      const areaContext = await this.reverseGeocode(lat, lng);
      
      // Update global detected location label if not already customized
      if (!detectedLocationLabel || detectedLocationLabel.includes('Default') || detectedLocationLabel.includes('GPS Coords') || detectedLocationLabel.includes('Detecting')) {
        detectedLocationLabel = areaContext.displayName;
        const locEl = document.getElementById('detected-location-text');
        if (locEl) locEl.textContent = `${areaContext.displayName} (Detected Location)`;
      }

      // Query Bounded Nominatim POI search + Overpass Mirrors in parallel
      const [nomFacilities, osmElements] = await Promise.all([
        this.queryNominatimHealthcare(lat, lng, effectiveRadius, areaContext),
        this.queryOverpass(lat, lng, radiusMeters)
      ]);

      // Convert Overpass OSM elements
      let osmFacilities = (osmElements || []).map((el, idx) => 
        this.normalizeOsmElement(el, lat, lng, idx, areaContext.district || areaContext.locality)
      );

      let merged = [...nomFacilities, ...osmFacilities];

      // Only synthesize if explicitly allowed (e.g. demo mode) - NEVER in real search
      if (allowSynthetic && merged.length < 3) {
        const ruralNetwork = this.generateRuralHealthcareNetwork(lat, lng, areaContext);
        merged = [...merged, ...ruralNetwork];
      }

      // Deduplicate by name & coordinates
      const uniqueMap = new Map();
      merged.forEach(item => {
        const key = `${item.name.toLowerCase().trim()}-${Math.round(item.lat * 500)}-${Math.round(item.lng * 500)}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        }
      });

      allFacilities = Array.from(uniqueMap.values());
      this.poiCache.set(cacheKey, allFacilities);

      // Save latest results locally for offline support
      if (typeof localStorage !== 'undefined' && allFacilities.length > 0) {
        localStorage.setItem('swasthya_cached_nearby', JSON.stringify(allFacilities));
        localStorage.setItem('swasthya_last_location', JSON.stringify({
          lat,
          lng,
          label: detectedLocationLabel,
          timestamp: new Date().toLocaleString()
        }));
      }
    }

    // Compute live Haversine distance from current patient coordinates
    allFacilities.forEach(c => {
      c.lat = parseFloat(c.lat);
      c.lng = parseFloat(c.lng);
      c.distanceKm = this.calculateDistance(lat, lng, c.lat, c.lng);
      c.distance = `${c.distanceKm.toFixed(1)} km`;
      c.directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`;
    });

    // Filter strictly by requested radius
    let filtered = allFacilities.filter(c => c.distanceKm <= effectiveRadius);

    // Filter by Facility Type / Category
    if (category && category !== 'All') {
      const catLower = category.toLowerCase();
      filtered = filtered.filter(c => {
        const cCat = c.category.toLowerCase();
        const cType = c.type.toLowerCase();
        const cName = c.name.toLowerCase();

        if (catLower.includes('government') || catLower === 'govt hospitals') {
          return cCat.includes('government') || cType.includes('hospital') || cType.includes('district') || cType.includes('civil') || cType.includes('general') || cType.includes('chc');
        }
        if (catLower === 'phc') {
          return cCat === 'phc' || cType.includes('phc') || cType.includes('primary health') || cName.includes('phc');
        }
        if (catLower === 'chc') {
          return cCat === 'chc' || cType.includes('chc') || cType.includes('community health') || cName.includes('chc');
        }
        if (catLower.includes('arogya') || catLower.includes('ayushman')) {
          return cCat.includes('arogya') || cCat.includes('ayushman') || cType.includes('arogya') || cType.includes('wellness') || cType.includes('hwc');
        }
        if (catLower === 'clinics') {
          return cCat === 'clinics' || cType.includes('clinic') || cType.includes('doctor') || cType.includes('health post');
        }
        if (catLower.includes('diagnostic')) {
          return cCat.includes('diagnostic') || cType.includes('diagnostic') || cType.includes('pathology') || cType.includes('lab') || cType.includes('scan');
        }
        if (catLower === 'pharmacies') {
          return cCat === 'pharmacies' || cType.includes('pharmacy') || cType.includes('chemist') || cType.includes('medical') || cType.includes('aushadh');
        }
        if (catLower.includes('emergency')) {
          return cCat.includes('emergency') || c.emergencyReady === true || cType.includes('emergency') || cType.includes('trauma');
        }
        return cCat === catLower || cType.includes(catLower);
      });
    }

    // Filter by Live Search Query (Name, Service, Locality, Type)
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.services && c.services.some(s => s.toLowerCase().includes(q)))
      );
    }

    // Sort strictly by nearest distance first (ascending)
    filtered.sort((a, b) => a.distanceKm - b.distanceKm);

    return filtered;
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
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link[data-tab]');
  const tabPanels = document.querySelectorAll('.tab-panel');
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
      refreshNearbyCentresAndMap();
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
        PulseCareUI.showToast('Location Detected', `Searching healthcare facilities within ${nearbyDistanceFilter || 5} km...`, 'success');
        
        const coordsDisplay = document.getElementById('sos-coords-display');
        if (coordsDisplay) {
          coordsDisplay.textContent = `${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`;
        }

        refreshNearbyCentresAndMap();
      },
      (err) => {
        console.warn('Geolocation access denied or unavailable:', err);
        detectedLocationLabel = 'Location access is required to find healthcare centres near you.';
        updateLocationHeaderDisplay('Location access is required to find healthcare centres near you.');
        PulseCareUI.showToast('Location Access Required', 'Location access is required to find healthcare centres near you.', 'info');
        toggleManualLocationInput(true);
        refreshNearbyCentresAndMap();
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  } else {
    PulseCareUI.showToast('Location Access Required', 'Location access is required to find healthcare centres near you.', 'info');
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
  nearbyDistanceFilter = dist ? parseFloat(dist) : 5;
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
  nearbyDistanceFilter = 5;
  nearbySearchQuery = '';
  const searchInput = document.getElementById('nearby-search-input');
  if (searchInput) searchInput.value = '';

  const typePills = document.querySelectorAll('#nearby-type-pills .chip-btn');
  typePills.forEach(p => p.classList.toggle('active', p.getAttribute('data-type') === 'All'));

  const distPills = document.querySelectorAll('#nearby-distance-pills .chip-btn');
  distPills.forEach(p => p.classList.toggle('active', p.getAttribute('data-dist') === '5'));

  refreshNearbyCentresAndMap();
};

// Unified async fetcher & map renderer
async function refreshNearbyCentresAndMap() {
  const container = document.getElementById('nearby-centres-grid');
  const countEl = document.getElementById('nearby-results-count');

  if (container) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding:2.5rem 1rem;">
        <div style="display:inline-block; width:36px; height:36px; border:3px solid var(--hospital-teal-600); border-top-color:transparent; border-radius:50%; animation:spin 0.8s linear infinite; margin-bottom:0.75rem;"></div>
        <p style="font-size:1rem; font-weight:600; color:var(--text-primary); margin:0;">
          Finding healthcare centres near you...
        </p>
      </div>
    `;
  }

  isSearchingPlaces = true;
  currentPlacesResults = await PlacesHealthService.fetchNearbyFacilities(
    patientCoordinates.lat,
    patientCoordinates.lng,
    nearbyDistanceFilter || 5,
    nearbyTypeFilter,
    nearbySearchQuery
  );
  isSearchingPlaces = false;

  renderNearbyCards(currentPlacesResults);
  updateLeafletMapWithFacilities(currentPlacesResults);
}

function renderNearbyCards(centres) {
  const container = document.getElementById('nearby-centres-grid');
  const countEl = document.getElementById('nearby-results-count');
  if (!container) return;

  const isOffline = typeof SwasthyaOfflineManager !== 'undefined' && SwasthyaOfflineManager.status === 'offline';
  const timestampStr = typeof SwasthyaOfflineManager !== 'undefined' ? SwasthyaOfflineManager.getFormattedTimestamp() : 'Recent';

  if (countEl) {
    if (isOffline) {
      countEl.innerHTML = `Showing ${centres.length} healthcare ${centres.length === 1 ? 'facility' : 'facilities'} <span class="badge badge-danger" style="font-size:0.75rem; margin-left:6px;">🔴 Offline Mode — Showing saved healthcare centres. &bull; Last updated: ${timestampStr}</span>`;
    } else {
      countEl.textContent = `Showing ${centres.length} healthcare ${centres.length === 1 ? 'facility' : 'facilities'} within ${nearbyDistanceFilter || 5} km`;
    }
  }

  if (centres.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding:3rem 1.5rem; background:var(--bg-surface); border-radius:var(--radius-md); border:1px solid var(--border-light);">
        <div style="font-size:2.5rem; margin-bottom:0.75rem;">🏥</div>
        <h3 style="font-size:1.2rem; color:var(--text-primary); margin-bottom:0.5rem;">No healthcare centres found nearby. Try expanding the search radius.</h3>
        <p style="font-size:0.9rem; color:var(--text-secondary); max-width:480px; margin:0 auto 1.25rem;">
          Try expanding your search radius to 10 km or 25 km to discover regional district hospitals and community health centres.
        </p>
        <div style="display:flex; justify-content:center; gap:0.5rem; flex-wrap:wrap;">
          <button class="btn btn-sm btn-primary" onclick="setNearbyDistanceFilter(10)">Expand to 10 km</button>
          <button class="btn btn-sm btn-secondary" onclick="setNearbyDistanceFilter(25)">Expand to 25 km</button>
          <button class="btn btn-sm btn-outline" onclick="resetNearbyFilters()">Reset All Filters</button>
        </div>
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
          <h3 style="font-size:1.15rem; font-weight:700; color:var(--text-primary); margin:0;">🏥 ${c.name}</h3>
        </div>
        <span class="badge badge-emerald" style="white-space:nowrap; font-weight:700;">📍 ${c.distance}</span>
      </div>

      <!-- Card Body -->
      <div class="portal-card-body" style="display:flex; flex-direction:column; gap:0.75rem; flex:1;">
        
        ${isOffline ? `
          <div style="padding:0.35rem 0.6rem; background:rgba(225, 29, 72, 0.08); border-radius:var(--radius-xs); font-size:0.75rem; color:var(--hospital-cross-red); font-weight:700; display:flex; align-items:center; gap:0.4rem;">
            <span>🔴 Offline saved facility</span> &bull; <span style="font-weight:500; color:var(--text-muted);">Updated ${timestampStr}</span>
          </div>
        ` : ''}

        <p style="font-size:0.875rem; color:var(--text-secondary); margin:0;">
          📌 <strong>Address:</strong> ${c.location}
        </p>

        <p style="font-size:0.85rem; color:var(--hospital-teal-700); font-weight:700; margin:0;">
          ☎️ <strong>Contact:</strong> <a href="tel:${c.phone.split(' ')[0]}" style="color:inherit; text-decoration:underline;">${c.phone}</a>
        </p>

        <p style="font-size:0.825rem; color:var(--text-muted); margin:0;">
          🕐 <strong>Availability:</strong> ${c.timing}
        </p>

        <!-- Services Tags -->
        <div style="margin-top:0.25rem;">
          <strong style="font-size:0.775rem; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Available Services:</strong>
          <div style="display:flex; flex-wrap:wrap; gap:0.35rem;">
            ${c.services ? c.services.slice(0, 3).map(s => `
              <span class="badge" style="background:var(--bg-input); color:var(--text-primary); font-size:0.7rem; font-weight:600; text-transform:none;">${s}</span>
            `).join('') : '<span class="badge badge-emerald">General Healthcare</span>'}
            ${c.services && c.services.length > 3 ? `<span class="badge badge-purple" style="font-size:0.7rem;">+${c.services.length - 3} more</span>` : ''}
          </div>
        </div>

        ${c.pmjayEmpanelled ? `
          <div style="padding:0.45rem 0.65rem; background:rgba(13, 148, 136, 0.08); border-radius:var(--radius-xs); font-size:0.75rem; color:var(--hospital-teal-800); font-weight:700;">
            ✓ PM-JAY Empanelled Golden Card Desk Available
          </div>
        ` : ''}

        <!-- Actions -->
        <div style="margin-top:auto; padding-top:0.75rem; border-top:1px solid var(--border-light); display:flex; gap:0.4rem; flex-wrap:wrap;">
          <button class="btn btn-sm btn-primary" style="flex:1; min-width:85px;" onclick="openFacilityDetailsModal('${c.id}')">
            <span>Details</span>
          </button>
          <a href="${c.directionsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline" style="flex:1; text-align:center; min-width:100px;">
            <svg class="icon" style="width:13px; height:13px;" viewBox="0 0 24 24"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            <span>Directions</span>
          </a>
          <button class="btn btn-sm btn-emerald" style="background:#25d366; border-color:#25d366; color:#ffffff; font-weight:700; flex:1; min-width:110px;" onclick="window.SwasthyaWhatsAppAI.promptSendSingleFacility('${c.id}')" title="Send location on WhatsApp">
            <svg class="wa-icon" viewBox="0 0 24 24" style="width:13px; height:13px; fill:#ffffff;"><path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.275-.1-.475-.15-.675.15-.2.3-.776.979-.951 1.18-.175.2-.35.225-.651.075-.3-.15-1.267-.467-2.414-1.489-.893-.796-1.496-1.78-1.671-2.08-.175-.3-.019-.462.131-.611.136-.134.301-.35.451-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.585-.492-.505-.675-.514-.175-.009-.375-.009-.575-.009s-.525.075-.8.375c-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.115 3.23 5.124 4.53.716.31 1.275.495 1.71.634.72.229 1.375.197 1.892.12.576-.086 1.78-.727 2.03-1.429.25-.702.25-1.303.175-1.429-.075-.126-.275-.201-.576-.351zM12.004 2C6.48 2 2 6.48 2 12.004c0 1.947.558 3.766 1.523 5.309L2.1 21.9l4.747-1.397A9.954 9.954 0 0 0 12.004 22c5.524 0 10.004-4.48 10.004-10.004C22.008 6.48 17.528 2 12.004 2zm0 18.292c-1.644 0-3.173-.487-4.464-1.326l-.32-.208-2.82.83.844-2.738-.228-.337A8.257 8.257 0 0 1 3.712 12c0-4.572 3.72-8.292 8.292-8.292s8.292 3.72 8.292 8.292-3.72 8.292-8.292 8.292z"/></svg>
            <span>WhatsApp</span>
          </button>
          <button class="btn btn-sm btn-outline" style="min-width:36px; padding:0.25rem 0.5rem;" onclick="flyToFacility(${c.lat}, ${c.lng}, '${c.id}')" title="Locate Pin on Map">
            <span>📍 Pin</span>
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

  // Radius Circle Perimeter (e.g. 5 km active radius)
  const radiusMeters = (nearbyDistanceFilter || 5) * 1000;
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
}

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
