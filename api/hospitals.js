/**
 * SwasthyaConnect - Vercel Serverless Function (/api/hospitals.js)
 * High-reliability proxy for OpenStreetMap Nominatim & Overpass healthcare POIs.
 * Avoids browser CORS and 403 Forbidden issues by setting appropriate User-Agent headers.
 */

// Haversine Distance Formula (km)
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const p1 = parseFloat(lat1);
  const p2 = parseFloat(lon1);
  const p3 = parseFloat(lat2);
  const p4 = parseFloat(lon2);
  if (isNaN(p1) || isNaN(p2) || isNaN(p3) || isNaN(p4)) return 0.0;

  const R = 6371; // Earth's radius in km
  const dLat = (p3 - p1) * Math.PI / 180;
  const dLon = (p4 - p2) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1 * Math.PI / 180) * Math.cos(p3 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Bounded Nominatim POI Fetcher
async function fetchBoundedNominatim(lat, lng, radiusKm) {
  const rKm = Math.max(1, radiusKm || 10);
  const deltaLat = rKm / 111;
  const deltaLng = rKm / (111 * Math.cos(lat * Math.PI / 180));
  const left = (lng - deltaLng).toFixed(4);
  const top = (lat + deltaLat).toFixed(4);
  const right = (lng + deltaLng).toFixed(4);
  const bottom = (lat - deltaLat).toFixed(4);
  const viewbox = `${left},${top},${right},${bottom}`;

  const searchTerms = [
    'hospital',
    'primary health centre',
    'community health centre',
    'clinic',
    'dispensary',
    'pharmacy',
    'pathology lab'
  ];

  const fetchCategory = async (term) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(term)}&viewbox=${viewbox}&bounded=1&addressdetails=1&limit=12`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'SwasthyaConnect/1.0 (https://swasthyaconnect.vercel.app; info@swasthyaconnect.health)',
          'Accept': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      }
    } catch (e) {
      console.warn(`Nominatim fetch error for term "${term}":`, e.message);
    }
    return [];
  };

  const results = await Promise.all(searchTerms.map(t => fetchCategory(t)));
  return results.flat();
}

// Overpass API Query Fetcher
async function fetchOverpassFacilities(lat, lng, radiusKm) {
  const radiusMeters = Math.max(1000, Math.round(radiusKm * 1000));
  const overpassQuery = `[out:json][timeout:6];(
    node["amenity"~"hospital|clinic|doctors|health_post|pharmacy"](around:${radiusMeters},${lat},${lng});
    way["amenity"~"hospital|clinic|doctors|health_post|pharmacy"](around:${radiusMeters},${lat},${lng});
    node["healthcare"](around:${radiusMeters},${lat},${lng});
    way["healthcare"](around:${radiusMeters},${lat},${lng});
    node["building"="hospital"](around:${radiusMeters},${lat},${lng});
    way["building"="hospital"](around:${radiusMeters},${lat},${lng});
  );out center tags 60;`;

  const mirrors = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.private.coffee/api/interpreter'
  ];

  for (const mirror of mirrors) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(mirror, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(overpassQuery),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'SwasthyaConnect/1.0 (https://swasthyaconnect.vercel.app)'
        },
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
      // Continue to next mirror
    }
  }
  return [];
}

// Normalize raw POI items into clean SwasthyaConnect Facility structure
function normalizeFacility(item, userLat, userLng, idx) {
  let lat, lng, rawName = '', addressStr = '', tags = {};

  if (item.tags) {
    // Overpass format
    tags = item.tags;
    lat = parseFloat(item.lat || (item.center ? item.center.lat : userLat));
    lng = parseFloat(item.lon || (item.center ? item.center.lon : userLng));
    rawName = tags.name || tags['name:en'] || tags['name:hi'] || tags['name:te'] || '';
    
    const streetParts = [
      tags['addr:housenumber'],
      tags['addr:street'],
      tags['addr:suburb'],
      tags['addr:district'],
      tags['addr:city'],
      tags['addr:postcode']
    ].filter(Boolean);
    addressStr = tags['addr:full'] || (streetParts.length > 0 ? streetParts.join(', ') : '');
  } else {
    // Nominatim format
    lat = parseFloat(item.lat);
    lng = parseFloat(item.lon);
    rawName = item.name || (item.display_name ? item.display_name.split(',')[0] : '');
    const addr = item.address || {};
    const streetParts = [
      addr.road || addr.street,
      addr.suburb || addr.neighbourhood || addr.village || addr.town,
      addr.city_district || addr.city || addr.county || addr.district,
      addr.state,
      addr.postcode
    ].filter(Boolean);
    addressStr = streetParts.length > 0 ? streetParts.join(', ') : (item.display_name || '');
  }

  const distKm = calculateDistanceKm(userLat, userLng, lat, lng);
  const lowerName = (rawName || '').toLowerCase();
  const amenity = (tags.amenity || tags.healthcare || '').toLowerCase();

  let category = 'Government Hospitals';
  let type = 'District Civil / General Hospital';

  if (amenity.includes('pharmacy') || lowerName.includes('pharmacy') || lowerName.includes('chemist') || lowerName.includes('medical store') || lowerName.includes('aushadh')) {
    category = 'Pharmacies';
    type = lowerName.includes('aushadh') ? 'Pradhan Mantri Jan Aushadhi Kendra' : 'Pharmacy / Medical Store';
  } else if (lowerName.includes('phc') || lowerName.includes('primary health') || amenity === 'health_post') {
    category = 'PHC';
    type = 'Primary Health Centre (PHC)';
  } else if (lowerName.includes('chc') || lowerName.includes('community health')) {
    category = 'CHC';
    type = 'Community Health Centre (CHC)';
  } else if (lowerName.includes('arogya') || lowerName.includes('ayushman') || lowerName.includes('wellness') || lowerName.includes('hwc')) {
    category = 'Ayushman Arogya Mandir';
    type = 'Ayushman Arogya Mandir (HWC)';
  } else if (lowerName.includes('diagnostic') || lowerName.includes('pathology') || lowerName.includes('lab') || lowerName.includes('scan')) {
    category = 'Diagnostic Centres';
    type = 'Diagnostic & Pathology Centre';
  } else if (amenity === 'clinic' || amenity === 'doctors' || lowerName.includes('clinic') || lowerName.includes('dispensary')) {
    category = 'Clinics';
    type = 'Government Clinic / Health Post';
  } else if (tags.emergency === 'yes' || lowerName.includes('emergency') || lowerName.includes('trauma') || lowerName.includes('casualty')) {
    category = 'Emergency Services';
    type = '24x7 Emergency & Trauma Care';
  } else {
    category = 'Government Hospitals';
    type = 'Government / Empanelled Area Hospital';
  }

  const cleanName = rawName || `${type} (Near Landmark)`;
  const finalAddress = addressStr || `${distKm.toFixed(1)} km from your coordinates`;
  const phone = tags.phone || tags['contact:phone'] || tags['contact:mobile'] || '+91 1800-180-1104 / 108';
  const timing = tags.opening_hours || (category === 'Emergency Services' ? '24x7 Emergency Always Open' : '24x7 Emergency & IPD | OPD: 08:30 AM - 02:00 PM');

  return {
    id: `fac-${item.place_id || item.id || idx}-${Math.round(lat * 1000)}`,
    name: cleanName,
    category,
    type,
    lat,
    lng,
    distanceKm: distKm,
    distance: `${distKm.toFixed(1)} km away`,
    location: finalAddress,
    timing,
    phone,
    services: [
      'Free Doctor Consultation (OPD)',
      'Essential Generic Drugs Dispensary',
      'Basic Pathology & Diagnostic Tests',
      'Ayushman Bharat PM-JAY Cashless Support'
    ],
    pmjayEmpanelled: true,
    emergencyReady: category === 'Emergency Services' || category === 'Government Hospitals' || tags.emergency === 'yes',
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
  };
}

function sendJson(res, statusCode, data) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') {
      res.status(200).end();
    } else {
      res.statusCode = 200;
      res.end();
    }
    return;
  }

  const query = req.query || (req.url ? Object.fromEntries(new URL(req.url, `http://${req.headers?.host || 'localhost'}`).searchParams) : {});
  const { lat, lng, radius, category, q } = query;

  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);
  const radiusKm = parseFloat(radius) || 10; // Default: 10 km as required

  if (isNaN(userLat) || isNaN(userLng)) {
    sendJson(res, 400, {
      success: false,
      error: 'Invalid or missing latitude/longitude parameters.'
    });
    return;
  }

  try {
    // Parallel fetch from bounded Nominatim and Overpass mirrors
    const [nomItems, overpassItems] = await Promise.all([
      fetchBoundedNominatim(userLat, userLng, radiusKm),
      fetchOverpassFacilities(userLat, userLng, radiusKm)
    ]);

    const allItems = [...nomItems, ...overpassItems];
    const normalizedList = allItems.map((item, idx) => normalizeFacility(item, userLat, userLng, idx));

    // Deduplicate facilities by name & close coordinates
    const uniqueMap = new Map();
    normalizedList.forEach(item => {
      const key = `${item.name.toLowerCase().trim()}-${Math.round(item.lat * 500)}-${Math.round(item.lng * 500)}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });

    let hospitals = Array.from(uniqueMap.values());

    // Filter by radius
    hospitals = hospitals.filter(h => h.distanceKm <= radiusKm);

    // Filter by Category if specified
    if (category && category !== 'All') {
      const catLower = category.toLowerCase();
      hospitals = hospitals.filter(h => {
        const cCat = h.category.toLowerCase();
        const cType = h.type.toLowerCase();
        if (catLower.includes('govt') || catLower.includes('government')) {
          return cCat.includes('government') || cType.includes('hospital') || cType.includes('district');
        }
        if (catLower === 'phc') return cCat === 'phc' || cType.includes('phc');
        if (catLower === 'chc') return cCat === 'chc' || cType.includes('chc');
        if (catLower.includes('arogya') || catLower.includes('ayushman')) return cCat.includes('arogya') || cCat.includes('ayushman');
        if (catLower === 'pharmacies') return cCat === 'pharmacies';
        if (catLower.includes('emergency')) return cCat.includes('emergency') || h.emergencyReady;
        return cCat === catLower || cType.includes(catLower);
      });
    }

    // Filter by search query if specified
    if (q && q.trim()) {
      const qLower = q.toLowerCase().trim();
      hospitals = hospitals.filter(h =>
        h.name.toLowerCase().includes(qLower) ||
        h.location.toLowerCase().includes(qLower) ||
        h.type.toLowerCase().includes(qLower)
      );
    }

    // Sort strictly by nearest distance (ascending)
    hospitals.sort((a, b) => a.distanceKm - b.distanceKm);

    sendJson(res, 200, {
      success: true,
      count: hospitals.length,
      radiusKm,
      hospitals
    });
  } catch (err) {
    console.error('Hospital search API handler error:', err);
    sendJson(res, 500, {
      success: false,
      error: 'Unable to find nearby hospitals right now.'
    });
  }
};
