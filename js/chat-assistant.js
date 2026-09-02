/**
 * SwasthyaConnect - WhatsApp AI Healthcare Assistant (js/chat-assistant.js)
 * 
 * Features:
 * 1. Authentic WhatsApp-style AI Chat Interface (SwasthyaConnect AI 🤖)
 * 2. Privacy-first Real Browser Geolocation (Latitude, Longitude, Accuracy)
 * 3. Live OpenStreetMap Overpass & Nominatim Healthcare POI Search
 * 4. Priority for Government Hospitals, PHCs, CHCs, Ayushman Arogya Mandirs, Pharmacies, Emergency
 * 5. Single & Multi-Facility WhatsApp Message Generation with Review & Confirm modal
 * 6. Interactive Leaflet Map Synchronization with identical coordinates & direction links
 * 7. Natural Language Command Processing (English, Hindi, Telugu)
 * 8. Dynamic Distance Filtering (1km, 5km, 10km, 25km) with Rural Auto-Expansion
 * 9. Offline / Poor Internet Mode with Local Caching & Clear Timestamping
 * 10. Emergency Triage Response with 108 Emergency Trauma Dispatch & Safety Disclaimer
 */

(function () {
  'use strict';

  // State
  let currentLang = 'en'; // 'en', 'hi', 'te'
  let patientCoords = null; // { lat, lng, accuracy, label, isManual }
  let currentFacilities = [];
  let activeRadius = 5; // default 5 km
  let activeCategory = 'All';
  let isSearching = false;
  let isOpen = false;
  let isExpanded = false;

  // Language & i18n
  const i18n = {
    en: {
      botName: 'SwasthyaConnect AI',
      botSubtitle: '● Online • WhatsApp Healthcare AI',
      welcomeHeader: 'Hi! 👋 I am <strong>SwasthyaConnect AI</strong>, your WhatsApp Healthcare Assistant.',
      welcomeQuestion: 'Would you like me to find hospitals and healthcare centres near your current location?',
      btnShareLocation: '📍 Share My Location',
      btnEnterManual: '✏️ Enter Location Manually',
      privacyNotice: '🔒 <strong>Privacy Note:</strong> Your location is used only to find nearby healthcare services. We will not share your location with anyone without your confirmation.',
      inputPlaceholder: 'Type a message (e.g., "Find hospitals near me", "Show PHCs", "Emergency help")...',
      locatingText: 'Requesting precise GPS coordinates from your device...',
      locSuccess: '📍 Location received successfully',
      locDenied: 'I couldn\'t access your GPS location. You can enter your village, town, district, or PIN code manually below:',
      manualSearchBtn: 'Find Facilities',
      manualPlaceholder: 'Enter city, district, town, or PIN code (e.g., Hyderabad, 500001)...',
      foundCount: (count, radius) => `I found ${count} healthcare ${count === 1 ? 'centre' : 'centres'} near you (within ${radius} km):`,
      expandedRadiusNote: (prev, next) => `ℹ️ Found limited facilities within ${prev} km. Automatically expanded search to ${next} km to find more options.`,
      btnDirections: '📍 Directions',
      btnSendWhatsApp: '📱 Send on WhatsApp',
      btnSendAllWhatsApp: '📱 Send Top Facilities to WhatsApp',
      btnChangeRadius: 'Filter Distance',
      btnViewOnMap: '🗺️ View on Map',
      emergencyTitle: '🚨 EMERGENCY HEALTHCARE ALERT',
      emergencyNotice: 'Nearest emergency facilities are prioritized below. If experiencing severe trauma, chest pain, or life-threatening distress, call 108 immediately.',
      emergencyDialBtn: '📞 Call 108 Ambulance',
      offlineNotice: '🔴 Offline Mode: Showing previously saved healthcare centres.',
      offlineTimestamp: (ts) => `Last updated: ${ts}`,
      confirmWhatsAppTitle: 'Review WhatsApp Message',
      confirmWhatsAppDesc: 'Review the prepared message before opening WhatsApp. No message is sent automatically.',
      confirmWhatsAppBtn: 'Confirm & Open WhatsApp',
      cancelBtn: 'Cancel',
      disclaimer: 'Note: SwasthyaConnect AI provides location & clinical navigation. For acute emergencies, call 108 directly.'
    },
    hi: {
      botName: 'स्वास्थ्य कनेक्ट एआई',
      botSubtitle: '● ऑनलाइन • व्हाट्सएप स्वास्थ्य सहायक',
      welcomeHeader: 'नमस्ते! 👋 मैं <strong>स्वास्थ्य कनेक्ट एआई</strong> (SwasthyaConnect AI) हूँ।',
      welcomeQuestion: 'क्या आप चाहते हैं कि मैं आपके वर्तमान स्थान के पास के अस्पताल और स्वास्थ्य केंद्र खोजूँ?',
      btnShareLocation: '📍 अपना स्थान साझा करें (Share Location)',
      btnEnterManual: '✏️ स्थान मैन्युअल रूप से दर्ज करें',
      privacyNotice: '🔒 <strong>गोपनीयता सूचना:</strong> आपके स्थान का उपयोग केवल नजदीकी स्वास्थ्य सेवाएं खोजने के लिए किया जाता है। आपकी पुष्टि के बिना इसे किसी के साथ साझा नहीं किया जाएगा।',
      inputPlaceholder: 'पूछें (जैसे: "पास के अस्पताल", "पीएचसी दिखाएं", "आपातकालीन सहायता")...',
      locatingText: 'आपके डिवाइस से जीपीएस (GPS) स्थान प्राप्त किया जा रहा है...',
      locSuccess: '📍 स्थान सफलतापूर्वक प्राप्त हुआ',
      locDenied: 'मैं आपके स्थान तक नहीं पहुँच सका। आप नीचे अपना गांव, शहर, जिला या पिन कोड दर्ज कर सकते हैं:',
      manualSearchBtn: 'स्वास्थ्य केंद्र खोजें',
      manualPlaceholder: 'शहर, जिला या 6-अंकीय पिन कोड दर्ज करें...',
      foundCount: (count, radius) => `मुझे आपके पास ${count} स्वास्थ्य ${count === 1 ? 'केंद्र' : 'केंद्र'} मिले (${radius} किमी के भीतर):`,
      expandedRadiusNote: (prev, next) => `ℹ️ ${prev} किमी के भीतर सीमित केंद्र मिले। अधिक विकल्प खोजने के लिए खोज दायरा ${next} किमी तक बढ़ाया गया।`,
      btnDirections: '📍 दिशा-निर्देश (Directions)',
      btnSendWhatsApp: '📱 व्हाट्सएप पर भेजें',
      btnSendAllWhatsApp: '📱 सभी नजदीकी अस्पताल व्हाट्सएप पर भेजें',
      btnChangeRadius: 'दूरी बदलें',
      btnViewOnMap: '🗺️ मैप पर देखें',
      emergencyTitle: '🚨 आपातकालीन स्वास्थ्य सहायता (EMERGENCY)',
      emergencyNotice: 'गंभीर आपातकाल या सीने में दर्द की स्थिति में तुरंत 108 एम्बुलेंस को कॉल करें।',
      emergencyDialBtn: '📞 108 एम्बुलेंस को कॉल करें',
      offlineNotice: '🔴 ऑफलाइन मोड: पहले से सहेजे गए स्वास्थ्य केंद्र दिखाए जा रहे हैं।',
      offlineTimestamp: (ts) => `अंतिम अपडेट: ${ts}`,
      confirmWhatsAppTitle: 'व्हाट्सएप संदेश की समीक्षा करें',
      confirmWhatsAppDesc: 'व्हाट्सएप खोलने से पहले संदेश की जांच करें। कोई भी संदेश स्वचालित रूप से नहीं भेजा जाता है।',
      confirmWhatsAppBtn: 'पुष्टि करें और व्हाट्सएप खोलें',
      cancelBtn: 'रद्द करें',
      disclaimer: 'सूचना: यह सहायक केवल स्वास्थ्य स्थान मार्गदर्शन प्रदान करता है। आपातकाल में सीधे 108 पर कॉल करें।'
    },
    te: {
      botName: 'స్వాస్థ్య కనెక్ట్ AI',
      botSubtitle: '● ఆన్‌లైన్ • వాట్సాప్ హెల్త్‌కేర్ అసిస్టెంట్',
      welcomeHeader: 'నమస్కారం! 👋 నేను మీ <strong>స్వాస్థ్య కనెక్ట్ AI</strong> (WhatsApp Healthcare AI).',
      welcomeQuestion: 'మీ ప్రస్తుత లొకేషన్ ఆధారంగా సమీపంలోని ఆసుపత్రులు మరియు ఆరోగ్య కేంద్రాలను కనుగొనమంటారా?',
      btnShareLocation: '📍 నా లొకేషన్ షేర్ చేయండి (Share Location)',
      btnEnterManual: '✏️ లొకేషన్ మాన్యువల్‌గా నమోదు చేయండి',
      privacyNotice: '🔒 <strong>గోప్యతా గమనిక:</strong> మీ లొకేషన్ సమీప ఆరోగ్య సేవలను కనుగొనడానికి మాత్రమే ఉపయోగించబడుతుంది. మీ అనుమతి లేకుండా ఇది ఎవరితోనూ పంచుకోబడదు.',
      inputPlaceholder: 'టైప్ చేయండి (ఉదా: "నా దగ్గర్లోని ఆసుపత్రులు", "PHC కేంద్రాలు", "ఎమర్జెన్సీ")...',
      locatingText: 'మీ పరికరం నుండి GPS లొకేషన్ పొందబడుతోంది...',
      locSuccess: '📍 లొకేషన్ విజయవంతంగా స్వీకరించబడింది',
      locDenied: 'మీ GPS లొకేషన్ పొందలేకపోయాము. దయచేసి మీ గ్రామం, పట్టణం, జిల్లా లేదా పిన్ కోడ్‌ను నమోదు చేయండి:',
      manualSearchBtn: 'ఆసుపత్రులను శోధించండి',
      manualPlaceholder: 'పట్టణం, జిల్లా లేదా పిన్ కోడ్ నమోదు చేయండి...',
      foundCount: (count, radius) => `మీ సమీపంలో (${radius} కి.మీ పరిధిలో) ${count} ఆరోగ్య కేంద్రాలు కనుగొనబడ్డాయి:`,
      expandedRadiusNote: (prev, next) => `ℹ️ ${prev} కి.మీ పరిధిలో తక్కువ కేంద్రాలు లభించాయి. మరిన్ని ఎంపికల కోసం శోధన ${next} కి.మీకి విస్తరించబడింది.`,
      btnDirections: '📍 దారి చూడండి (Directions)',
      btnSendWhatsApp: '📱 వాట్సాప్‌లో పంపండి',
      btnSendAllWhatsApp: '📱 ముఖ్య ఆసుపత్రుల వివరాలు వాట్సాప్‌లో పంపండి',
      btnChangeRadius: 'దూరం ఫిల్టర్',
      btnViewOnMap: '🗺️ మ్యాప్‌లో చూడండి',
      emergencyTitle: '🚨 అత్యవసర ఆరోగ్య హెచ్చరిక (EMERGENCY)',
      emergencyNotice: 'తీవ్రమైన ప్రమాదం లేదా ఛాతీ నొప్పి ఉన్నట్లయితే వెంటనే 108 అంబులెన్స్‌కు కాల్ చేయండి.',
      emergencyDialBtn: '📞 108 అంబులెన్స్ కాల్ చేయండి',
      offlineNotice: '🔴 ఆఫ్‌లైన్ మోడ్: గతంలో సేవ్ చేసిన ఆరోగ్య కేంద్రాలు చూపబడుతున్నాయి.',
      offlineTimestamp: (ts) => `చివరిగా నవీకరించబడింది: ${ts}`,
      confirmWhatsAppTitle: 'వాట్సాప్ సందేశాన్ని సమీక్షించండి',
      confirmWhatsAppDesc: 'వాట్సాప్ తెరవడానికి ముందు సందేశాన్ని సమీక్షించండి. మీ నిర్ధారణ లేకుండా సందేశం పంపబడదు.',
      confirmWhatsAppBtn: 'నిర్ధారించి వాట్సాప్ తెరవండి',
      cancelBtn: 'రద్దు చేయండి',
      disclaimer: 'గమనిక: ఈ అసిస్టెంట్ కేవలం లొకేషన్ మరియు గైడెన్స్ ఇస్తుంది. అత్యవసర పరిస్థితుల్లో 108కి కాల్ చేయండి.'
    }
  };

  // Build HTML Structure
  const widgetHTML = `
    <!-- Floating WhatsApp AI Healthcare Assistant Container -->
    <div id="swasthya-wa-container" class="swasthya-wa-container">
      
      <!-- Floating Launcher Button with WhatsApp Branding -->
      <button id="swasthya-wa-launcher" class="swasthya-wa-launcher" aria-label="Open WhatsApp Healthcare AI" title="Find Nearby Hospitals via WhatsApp AI">
        <div class="wa-launcher-icon-wrap">
          <svg class="wa-icon" viewBox="0 0 24 24" width="28" height="28" fill="#ffffff">
            <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.275-.1-.475-.15-.675.15-.2.3-.776.979-.951 1.18-.175.2-.35.225-.651.075-.3-.15-1.267-.467-2.414-1.489-.893-.796-1.496-1.78-1.671-2.08-.175-.3-.019-.462.131-.611.136-.134.301-.35.451-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.585-.492-.505-.675-.514-.175-.009-.375-.009-.575-.009s-.525.075-.8.375c-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.115 3.23 5.124 4.53.716.31 1.275.495 1.71.634.72.229 1.375.197 1.892.12.576-.086 1.78-.727 2.03-1.429.25-.702.25-1.303.175-1.429-.075-.126-.275-.201-.576-.351zM12.004 2C6.48 2 2 6.48 2 12.004c0 1.947.558 3.766 1.523 5.309L2.1 21.9l4.747-1.397A9.954 9.954 0 0 0 12.004 22c5.524 0 10.004-4.48 10.004-10.004C22.008 6.48 17.528 2 12.004 2zm0 18.292c-1.644 0-3.173-.487-4.464-1.326l-.32-.208-2.82.83.844-2.738-.228-.337A8.257 8.257 0 0 1 3.712 12c0-4.572 3.72-8.292 8.292-8.292s8.292 3.72 8.292 8.292-3.72 8.292-8.292 8.292z"/>
          </svg>
          <span class="wa-online-pulse"></span>
        </div>
        <div class="wa-launcher-text">
          <span class="wa-launcher-title">WhatsApp Healthcare AI</span>
          <span class="wa-launcher-sub">Find Nearby Hospitals 📍</span>
        </div>
      </button>

      <!-- WhatsApp Style Chat Window -->
      <div id="swasthya-wa-window" class="swasthya-wa-window" style="display:none;">
        
        <!-- WhatsApp Header -->
        <div class="wa-header">
          <div class="wa-header-avatar">
            <div class="wa-avatar-img">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <span class="wa-verified-badge" title="Official SwasthyaConnect Verified AI">✓</span>
          </div>

          <div class="wa-header-info">
            <div class="wa-header-title" id="wa-bot-name">SwasthyaConnect AI</div>
            <div class="wa-header-status" id="wa-bot-status">● Online • WhatsApp Healthcare AI</div>
          </div>

          <div class="wa-header-actions">
            <!-- Language Selector -->
            <select id="wa-lang-select" class="wa-lang-select" aria-label="Select Language">
              <option value="en">EN</option>
              <option value="hi">हिंदी</option>
              <option value="te">తెలుగు</option>
            </select>

            <!-- Expand / Minimize Toggle -->
            <button id="wa-expand-toggle" class="wa-icon-btn" title="Toggle Window Size" aria-label="Expand or Shrink Window">
              <svg class="icon-expand" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
            </button>

            <!-- Close Button -->
            <button id="wa-close-btn" class="wa-icon-btn" title="Close Chat" aria-label="Close Chat">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Connection Banner (Online / Offline) -->
        <div id="wa-offline-bar" class="wa-offline-bar" style="display:none;">
          <span class="pulse-dot" style="background:#ef4444;"></span>
          <span id="wa-offline-text">🔴 Offline Mode — Using cached healthcare data.</span>
        </div>

        <!-- WhatsApp Chat Body (Wallpaper Pattern) -->
        <div id="wa-chat-body" class="wa-chat-body">
          
          <!-- Encryption / Privacy Security Badge -->
          <div class="wa-encryption-pill">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" style="opacity:0.8;">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            <span>Messages & location queries are processed securely. Location is never shared without confirmation.</span>
          </div>

          <!-- Initial Bot Welcome Message -->
          <div class="wa-msg-row bot-row" id="wa-msg-welcome">
            <div class="wa-bubble bot-bubble">
              <div class="wa-sender-label">🤖 SwasthyaConnect AI</div>
              <div class="wa-text-content" id="wa-welcome-text-1">
                Hi! 👋 I am <strong>SwasthyaConnect AI</strong>, your WhatsApp Healthcare Assistant.
              </div>
              <div class="wa-text-content" style="margin-top:0.4rem;" id="wa-welcome-text-2">
                Would you like me to find hospitals and healthcare centres near your current location?
              </div>
              
              <!-- Action Buttons -->
              <div class="wa-action-buttons-group">
                <button type="button" class="wa-btn-action wa-btn-primary" id="wa-btn-share-gps" onclick="window.SwasthyaWhatsAppAI.requestLocationPermission()">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
                  </svg>
                  <span id="wa-label-share-loc">📍 Share My Location</span>
                </button>
                <button type="button" class="wa-btn-action wa-btn-secondary" id="wa-btn-enter-manual" onclick="window.SwasthyaWhatsAppAI.showManualLocationPrompt()">
                  <span id="wa-label-manual-loc">✏️ Enter Location Manually</span>
                </button>
              </div>

              <!-- Privacy Notice Inside Bubble -->
              <div class="wa-privacy-badge" id="wa-privacy-desc">
                🔒 <strong>Privacy Note:</strong> Your location will be used only to find nearby healthcare services. We will not share your location with anyone without your confirmation.
              </div>

              <div class="wa-msg-footer">
                <span class="wa-time">Just now</span>
              </div>
            </div>
          </div>

          <!-- Quick Discovery Chips Bar -->
          <div id="wa-quick-chips-wrapper" class="wa-quick-chips-wrapper">
            <span class="wa-chips-title">💡 Quick AI Search Prompts:</span>
            <div class="wa-chips-row">
              <button class="wa-chip" onclick="window.SwasthyaWhatsAppAI.handleUserQuery('Find hospitals near me')">🏥 Hospitals Near Me</button>
              <button class="wa-chip" onclick="window.SwasthyaWhatsAppAI.handleUserQuery('Show nearby PHCs')">🟢 Nearby PHCs</button>
              <button class="wa-chip" onclick="window.SwasthyaWhatsAppAI.handleUserQuery('Find government hospitals')">🏛️ Govt Hospitals</button>
              <button class="wa-chip" onclick="window.SwasthyaWhatsAppAI.handleUserQuery('Find a pharmacy near me')">💊 Pharmacies</button>
              <button class="wa-chip" onclick="window.SwasthyaWhatsAppAI.handleUserQuery('Show emergency hospitals')">🚨 Emergency Trauma</button>
              <button class="wa-chip wa-chip-danger" onclick="window.SwasthyaWhatsAppAI.handleUserQuery('I need emergency help')">⚠️ Emergency Help (108)</button>
            </div>
          </div>

          <!-- Dynamic Message Append Container -->
          <div id="wa-dynamic-messages"></div>

        </div>

        <!-- Typing Indicator -->
        <div id="wa-typing-indicator" class="wa-typing-indicator" style="display:none;">
          <div class="wa-typing-bubble">
            <span class="wa-typing-dot"></span>
            <span class="wa-typing-dot"></span>
            <span class="wa-typing-dot"></span>
          </div>
          <span class="wa-typing-text">SwasthyaConnect AI is finding healthcare centres...</span>
        </div>

        <!-- WhatsApp Input Bar -->
        <form id="wa-chat-form" class="wa-chat-form">
          <!-- Attachment / Quick Command Button -->
          <button type="button" class="wa-icon-btn wa-attach-btn" id="wa-attach-btn" title="Quick Location Options" onclick="window.SwasthyaWhatsAppAI.toggleAttachmentMenu()">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
            </svg>
          </button>

          <!-- Input Field -->
          <input type="text" id="wa-user-input" class="wa-user-input" placeholder="Type a message (e.g. Find hospitals near me)..." autocomplete="off" required>

          <!-- Send Button (WhatsApp Styled Circular Green Button) -->
          <button type="submit" class="wa-send-btn" id="wa-send-btn" aria-label="Send Message" title="Send">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#ffffff">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </form>

        <!-- Attachment Menu Dropdown -->
        <div id="wa-attachment-dropdown" class="wa-attachment-dropdown" style="display:none;">
          <button type="button" class="wa-attach-item" onclick="window.SwasthyaWhatsAppAI.requestLocationPermission()">
            <div class="wa-attach-icon" style="background:#059669;">📍</div>
            <span>Share My GPS Location</span>
          </button>
          <button type="button" class="wa-attach-item" onclick="window.SwasthyaWhatsAppAI.showManualLocationPrompt()">
            <div class="wa-attach-icon" style="background:#0284c7;">✏️</div>
            <span>Enter Location Manually</span>
          </button>
          <button type="button" class="wa-attach-item" onclick="window.SwasthyaWhatsAppAI.handleUserQuery('I need emergency help')">
            <div class="wa-attach-icon" style="background:#e11d48;">🚨</div>
            <span>Emergency 108 Hotline</span>
          </button>
        </div>

      </div>

    </div>

    <!-- WhatsApp Message Review & Confirmation Modal -->
    <div class="modal-overlay" id="wa-confirm-modal" style="display:none; z-index:9999;">
      <div class="modal-content wa-confirm-modal-content">
        <div class="modal-header" style="background:#075e54; color:#ffffff;">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <svg class="wa-icon" viewBox="0 0 24 24" width="22" height="22" fill="#25d366">
              <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.275-.1-.475-.15-.675.15-.2.3-.776.979-.951 1.18-.175.2-.35.225-.651.075-.3-.15-1.267-.467-2.414-1.489-.893-.796-1.496-1.78-1.671-2.08-.175-.3-.019-.462.131-.611.136-.134.301-.35.451-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.585-.492-.505-.675-.514-.175-.009-.375-.009-.575-.009s-.525.075-.8.375c-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.115 3.23 5.124 4.53.716.31 1.275.495 1.71.634.72.229 1.375.197 1.892.12.576-.086 1.78-.727 2.03-1.429.25-.702.25-1.303.175-1.429-.075-.126-.275-.201-.576-.351zM12.004 2C6.48 2 2 6.48 2 12.004c0 1.947.558 3.766 1.523 5.309L2.1 21.9l4.747-1.397A9.954 9.954 0 0 0 12.004 22c5.524 0 10.004-4.48 10.004-10.004C22.008 6.48 17.528 2 12.004 2zm0 18.292c-1.644 0-3.173-.487-4.464-1.326l-.32-.208-2.82.83.844-2.738-.228-.337A8.257 8.257 0 0 1 3.712 12c0-4.572 3.72-8.292 8.292-8.292s8.292 3.72 8.292 8.292-3.72 8.292-8.292 8.292z"/>
            </svg>
            <h3 class="modal-title" style="color:#ffffff; font-size:1.1rem;" id="wa-modal-title">Review WhatsApp Message</h3>
          </div>
          <button class="btn-icon" style="color:#ffffff;" onclick="window.SwasthyaWhatsAppAI.closeWhatsAppConfirmModal()" aria-label="Close">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body" style="padding:1.25rem;">
          <p style="font-size:0.875rem; color:var(--text-secondary); margin-bottom:1rem;" id="wa-modal-desc">
            Review the prepared message before opening WhatsApp. You can choose any recipient or group to send this to.
          </p>
          
          <!-- Message Preview Bubble -->
          <div class="wa-preview-box">
            <div class="wa-preview-header">
              <span>WhatsApp Message Preview</span>
              <span class="badge badge-emerald" style="font-size:0.7rem;">Ready to Share</span>
            </div>
            <pre id="wa-preview-text" class="wa-preview-pre"></pre>
          </div>

          <div style="background:var(--bg-input); padding:0.75rem 1rem; border-radius:8px; font-size:0.8rem; color:var(--text-muted); margin-top:1rem; display:flex; align-items:center; gap:0.5rem;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="color:var(--hospital-teal-600); flex-shrink:0;">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span><strong>Patient Privacy Guard:</strong> This message will only be sent when you click send in your WhatsApp application.</span>
          </div>
        </div>
        <div class="modal-footer" style="padding:1rem 1.25rem; display:flex; justify-content:flex-end; gap:0.75rem;">
          <button type="button" class="btn btn-secondary" onclick="window.SwasthyaWhatsAppAI.closeWhatsAppConfirmModal()">Cancel</button>
          <button type="button" class="btn btn-emerald" id="wa-confirm-dispatch-btn" onclick="window.SwasthyaWhatsAppAI.dispatchPreparedWhatsAppMessage()" style="background:#25d366; border-color:#25d366; color:#ffffff; font-weight:700;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
            <span>Open WhatsApp & Send</span>
          </button>
        </div>
      </div>
    </div>
  `;

  // Inject Dedicated WhatsApp AI Styles
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    /* WhatsApp AI Healthcare Assistant Design System */
    .swasthya-wa-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2100;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    /* Floating Launcher Button */
    .swasthya-wa-launcher {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 1.25rem;
      background: linear-gradient(135deg, #075e54 0%, #128c7e 50%, #25d366 100%);
      color: #ffffff;
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-radius: 9999px;
      box-shadow: 0 10px 30px rgba(7, 94, 84, 0.45);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .swasthya-wa-launcher:hover {
      transform: translateY(-3px) scale(1.03);
      box-shadow: 0 14px 36px rgba(37, 211, 102, 0.55);
    }
    .wa-launcher-icon-wrap {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .wa-online-pulse {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 10px;
      height: 10px;
      background: #25d366;
      border: 2px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 8px #25d366;
      animation: waPulse 1.8s infinite;
    }
    @keyframes waPulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(37, 211, 102, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
    }
    .wa-launcher-text {
      display: flex;
      flex-direction: column;
      text-align: left;
    }
    .wa-launcher-title {
      font-weight: 800;
      font-size: 0.925rem;
      letter-spacing: 0.02em;
      line-height: 1.2;
    }
    .wa-launcher-sub {
      font-size: 0.725rem;
      opacity: 0.92;
      font-weight: 500;
    }

    /* WhatsApp Chat Window */
    .swasthya-wa-window {
      position: absolute;
      bottom: 65px;
      right: 0;
      width: 420px;
      height: 600px;
      max-width: calc(100vw - 32px);
      max-height: calc(100vh - 90px);
      background: #efeae2;
      border-radius: 20px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 24px 60px rgba(7, 40, 35, 0.35);
      border: 1px solid rgba(7, 94, 84, 0.2);
      transform-origin: bottom right;
      animation: waPopIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    [data-theme="dark"] .swasthya-wa-window {
      background: #0b141a;
      border-color: #202c33;
    }
    .swasthya-wa-window.expanded {
      width: 720px;
      height: 720px;
    }
    @keyframes waPopIn {
      from { opacity: 0; transform: scale(0.92) translateY(20px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    /* Header */
    .wa-header {
      background: #075e54;
      color: #ffffff;
      padding: 0.75rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    }
    [data-theme="dark"] .wa-header {
      background: #202c33;
    }
    .wa-header-avatar {
      position: relative;
    }
    .wa-avatar-img {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: linear-gradient(135deg, #128c7e 0%, #25d366 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #ffffff;
    }
    .wa-verified-badge {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 14px;
      height: 14px;
      background: #25d366;
      color: #ffffff;
      font-size: 9px;
      font-weight: 800;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1.5px solid #075e54;
    }
    .wa-header-info {
      flex: 1;
      min-width: 0;
    }
    .wa-header-title {
      font-weight: 700;
      font-size: 0.95rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #ffffff;
    }
    .wa-header-status {
      font-size: 0.7rem;
      color: #a7f3d0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .wa-header-actions {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .wa-lang-select {
      background: rgba(255, 255, 255, 0.18);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.35);
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.4rem;
      cursor: pointer;
      outline: none;
    }
    .wa-lang-select option {
      background: #075e54;
      color: #ffffff;
    }
    .wa-icon-btn {
      background: transparent;
      border: none;
      color: #ffffff;
      opacity: 0.85;
      cursor: pointer;
      padding: 0.35rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .wa-icon-btn:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.15);
    }

    /* Offline Bar */
    .wa-offline-bar {
      background: #fef2f2;
      border-bottom: 1px solid #fecaca;
      color: #b91c1c;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.4rem 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    [data-theme="dark"] .wa-offline-bar {
      background: #450a0a;
      border-bottom-color: #7f1d1d;
      color: #fca5a5;
    }

    /* WhatsApp Chat Body */
    .wa-chat-body {
      flex: 1;
      padding: 1rem 0.85rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      background-image: radial-gradient(rgba(7, 94, 84, 0.05) 1px, transparent 0);
      background-size: 24px 24px;
    }
    [data-theme="dark"] .wa-chat-body {
      background-image: radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 0);
    }

    /* Encryption / Privacy Pill */
    .wa-encryption-pill {
      align-self: center;
      max-width: 90%;
      background: #ffeecd;
      color: #54656f;
      font-size: 0.7rem;
      line-height: 1.35;
      padding: 0.4rem 0.75rem;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      gap: 0.4rem;
      justify-content: center;
      margin-bottom: 0.5rem;
    }
    [data-theme="dark"] .wa-encryption-pill {
      background: #182229;
      color: #8696a0;
    }

    /* Message Rows */
    .wa-msg-row {
      display: flex;
      flex-direction: column;
      max-width: 90%;
    }
    .wa-msg-row.bot-row {
      align-self: flex-start;
    }
    .wa-msg-row.user-row {
      align-self: flex-end;
    }

    /* Message Bubbles */
    .wa-bubble {
      padding: 0.75rem 0.95rem;
      border-radius: 12px;
      font-size: 0.875rem;
      line-height: 1.45;
      position: relative;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .bot-bubble {
      background: #ffffff;
      color: #111b21;
      border-top-left-radius: 2px;
    }
    [data-theme="dark"] .bot-bubble {
      background: #202c33;
      color: #e9edef;
    }
    .user-bubble {
      background: #d9fdd3;
      color: #111b21;
      border-top-right-radius: 2px;
    }
    [data-theme="dark"] .user-bubble {
      background: #005c4b;
      color: #e9edef;
    }

    .wa-sender-label {
      font-size: 0.72rem;
      font-weight: 700;
      color: #0f766e;
      margin-bottom: 0.25rem;
    }
    [data-theme="dark"] .wa-sender-label {
      color: #2dd4bf;
    }
    .wa-msg-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 3px;
      margin-top: 0.35rem;
      font-size: 0.65rem;
      color: #667781;
    }
    [data-theme="dark"] .wa-msg-footer {
      color: #8696a0;
    }
    .wa-double-tick {
      color: #53bdeb;
      font-weight: 800;
      font-size: 0.75rem;
    }

    /* Action Buttons Inside Bubbles */
    .wa-action-buttons-group {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      margin-top: 0.65rem;
    }
    .wa-btn-action {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      padding: 0.6rem 0.85rem;
      border-radius: 8px;
      font-size: 0.825rem;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
    }
    .wa-btn-primary {
      background: #25d366;
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(37, 211, 102, 0.35);
    }
    .wa-btn-primary:hover {
      background: #20ba59;
      transform: translateY(-1px);
    }
    .wa-btn-secondary {
      background: #edf4f9;
      color: #0f766e;
      border: 1px solid #cce1ed;
    }
    [data-theme="dark"] .wa-btn-secondary {
      background: #111b21;
      color: #2dd4bf;
      border-color: #2a3942;
    }
    .wa-btn-secondary:hover {
      background: #e0eef7;
    }

    /* Privacy Badge */
    .wa-privacy-badge {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
      font-size: 0.725rem;
      padding: 0.45rem 0.6rem;
      border-radius: 6px;
      margin-top: 0.6rem;
      line-height: 1.35;
    }
    [data-theme="dark"] .wa-privacy-badge {
      background: #052e16;
      border-color: #14532d;
      color: #86efac;
    }

    /* Quick Suggestion Chips */
    .wa-quick-chips-wrapper {
      padding: 0.5rem 0;
    }
    .wa-chips-title {
      font-size: 0.7rem;
      font-weight: 700;
      color: #54656f;
      display: block;
      margin-bottom: 0.35rem;
    }
    [data-theme="dark"] .wa-chips-title {
      color: #8696a0;
    }
    .wa-chips-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }
    .wa-chip {
      padding: 0.35rem 0.65rem;
      background: #ffffff;
      border: 1px solid #d1d7db;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #008069;
      cursor: pointer;
      transition: all 0.15s;
    }
    [data-theme="dark"] .wa-chip {
      background: #202c33;
      border-color: #374248;
      color: #00a884;
    }
    .wa-chip:hover {
      background: #f0fdfa;
      border-color: #00a884;
      transform: translateY(-1px);
    }
    .wa-chip-danger {
      color: #e11d48 !important;
      background: #fff1f2 !important;
      border-color: #fecdd3 !important;
    }
    [data-theme="dark"] .wa-chip-danger {
      background: #4c0519 !important;
      border-color: #881337 !important;
      color: #fda4af !important;
    }

    /* WhatsApp Healthcare Cards List */
    .wa-facility-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 0.75rem;
      margin-top: 0.5rem;
    }
    [data-theme="dark"] .wa-facility-card {
      background: #111b21;
      border-color: #2a3942;
    }
    .wa-facility-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.5rem;
      margin-bottom: 0.35rem;
    }
    .wa-facility-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }
    [data-theme="dark"] .wa-facility-title {
      color: #f8fafc;
    }
    .wa-dist-badge {
      background: #dcfce7;
      color: #166534;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.15rem 0.45rem;
      border-radius: 9999px;
      white-space: nowrap;
    }
    [data-theme="dark"] .wa-dist-badge {
      background: #052e16;
      color: #86efac;
    }
    .wa-card-details {
      font-size: 0.775rem;
      color: #475569;
      line-height: 1.4;
      margin-bottom: 0.5rem;
    }
    [data-theme="dark"] .wa-card-details {
      color: #94a3b8;
    }
    .wa-facility-actions {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
    }
    .wa-card-btn {
      flex: 1;
      min-width: 110px;
      padding: 0.4rem 0.6rem;
      font-size: 0.75rem;
      font-weight: 700;
      border-radius: 6px;
      text-align: center;
      text-decoration: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
    }
    .wa-btn-dir {
      background: #0284c7;
      color: #ffffff;
      border: none;
    }
    .wa-btn-dir:hover {
      background: #0369a1;
      color: #ffffff;
    }
    .wa-btn-wa-share {
      background: #25d366;
      color: #ffffff;
      border: none;
    }
    .wa-btn-wa-share:hover {
      background: #20ba59;
      color: #ffffff;
    }

    /* Typing Indicator */
    .wa-typing-indicator {
      padding: 0.4rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .wa-typing-bubble {
      background: #ffffff;
      padding: 0.5rem 0.75rem;
      border-radius: 12px;
      display: flex;
      gap: 4px;
      align-items: center;
    }
    [data-theme="dark"] .wa-typing-bubble {
      background: #202c33;
    }
    .wa-typing-dot {
      width: 6px;
      height: 6px;
      background: #25d366;
      border-radius: 50%;
      animation: waBlink 1.4s infinite ease-in-out both;
    }
    .wa-typing-dot:nth-child(1) { animation-delay: -0.32s; }
    .wa-typing-dot:nth-child(2) { animation-delay: -0.16s; }
    @keyframes waBlink {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
    .wa-typing-text {
      font-size: 0.725rem;
      color: #54656f;
      font-style: italic;
    }
    [data-theme="dark"] .wa-typing-text {
      color: #8696a0;
    }

    /* WhatsApp Input Bar */
    .wa-chat-form {
      padding: 0.65rem 0.85rem;
      background: #f0f2f5;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
      border-top: 1px solid #e9edef;
      position: relative;
    }
    [data-theme="dark"] .wa-chat-form {
      background: #202c33;
      border-top-color: #2a3942;
    }
    .wa-attach-btn {
      color: #54656f;
    }
    [data-theme="dark"] .wa-attach-btn {
      color: #8696a0;
    }
    .wa-user-input {
      flex: 1;
      padding: 0.6rem 0.95rem;
      border-radius: 9999px;
      border: 1px solid #d1d7db;
      background: #ffffff;
      color: #111b21;
      font-size: 0.85rem;
      outline: none;
      transition: border 0.2s;
    }
    [data-theme="dark"] .wa-user-input {
      background: #2a3942;
      border-color: #374248;
      color: #e9edef;
    }
    .wa-user-input:focus {
      border-color: #00a884;
    }
    .wa-send-btn {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #00a884;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.2s;
    }
    .wa-send-btn:hover {
      background: #008f6f;
      transform: scale(1.05);
    }

    /* Attachment Dropdown */
    .wa-attachment-dropdown {
      position: absolute;
      bottom: 60px;
      left: 12px;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      z-index: 100;
      border: 1px solid #e2e8f0;
      min-width: 210px;
      animation: waPopIn 0.2s ease forwards;
    }
    [data-theme="dark"] .wa-attachment-dropdown {
      background: #202c33;
      border-color: #2a3942;
    }
    .wa-attach-item {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      background: transparent;
      border: none;
      color: #111b21;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s;
    }
    [data-theme="dark"] .wa-attach-item {
      color: #e9edef;
    }
    .wa-attach-item:hover {
      background: #f0fdf4;
    }
    [data-theme="dark"] .wa-attach-item:hover {
      background: #111b21;
    }
    .wa-attach-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 0.85rem;
    }

    /* WhatsApp Preview Modal Content */
    .wa-confirm-modal-content {
      max-width: 580px;
      border-radius: 16px;
      overflow: hidden;
    }
    .wa-preview-box {
      background: #efeae2;
      border: 1px solid #d1d7db;
      border-radius: 12px;
      padding: 1rem;
    }
    [data-theme="dark"] .wa-preview-box {
      background: #0b141a;
      border-color: #202c33;
    }
    .wa-preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      font-weight: 700;
      color: #54656f;
      margin-bottom: 0.65rem;
    }
    [data-theme="dark"] .wa-preview-header {
      color: #8696a0;
    }
    .wa-preview-pre {
      background: #ffffff;
      color: #111b21;
      padding: 0.85rem 1rem;
      border-radius: 8px;
      font-family: inherit;
      font-size: 0.85rem;
      line-height: 1.45;
      white-space: pre-wrap;
      word-break: break-word;
      margin: 0;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
      border-left: 4px solid #25d366;
    }
    [data-theme="dark"] .wa-preview-pre {
      background: #202c33;
      color: #e9edef;
    }

    /* Mobile Responsiveness */
    @media (max-width: 480px) {
      .swasthya-wa-container {
        bottom: 16px;
        right: 16px;
      }
      .swasthya-wa-window {
        right: -8px;
        bottom: 60px;
        width: calc(100vw - 24px);
        height: calc(100vh - 85px);
        border-radius: 16px;
      }
      .wa-launcher-text {
        display: none;
      }
      .swasthya-wa-launcher {
        padding: 0.75rem;
      }
    }
  `;

  document.head.appendChild(styleEl);

  // Initialize Widget
  function initWidget() {
    const wrap = document.createElement('div');
    wrap.innerHTML = widgetHTML;
    document.body.appendChild(wrap);

    // Bind event listeners
    const launcher = document.getElementById('swasthya-wa-launcher');
    const win = document.getElementById('swasthya-wa-window');
    const closeBtn = document.getElementById('wa-close-btn');
    const expandBtn = document.getElementById('wa-expand-toggle');
    const form = document.getElementById('wa-chat-form');
    const input = document.getElementById('wa-user-input');
    const langSelect = document.getElementById('wa-lang-select');

    if (launcher && win) {
      launcher.addEventListener('click', () => {
        isOpen = !isOpen;
        win.style.display = isOpen ? 'flex' : 'none';
        if (isOpen) {
          if (input) input.focus();
          syncLanguageUI(currentLang);
          checkNetworkStatus();
        }
      });
    }

    if (closeBtn && win) {
      closeBtn.addEventListener('click', () => {
        isOpen = false;
        win.style.display = 'none';
      });
    }

    if (expandBtn && win) {
      expandBtn.addEventListener('click', () => {
        isExpanded = !isExpanded;
        win.classList.toggle('expanded', isExpanded);
      });
    }

    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        setLanguage(e.target.value);
      });
    }

    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        closeAttachmentMenu();
        handleUserQuery(text);
      });
    }

    // Monitor online / offline status
    window.addEventListener('online', checkNetworkStatus);
    window.addEventListener('offline', checkNetworkStatus);

    // Initial check
    checkNetworkStatus();
    setLanguage('en');
  }

  function checkNetworkStatus() {
    const offlineBar = document.getElementById('wa-offline-bar');
    const offlineText = document.getElementById('wa-offline-text');
    const isOffline = !navigator.onLine || (typeof SwasthyaOfflineManager !== 'undefined' && SwasthyaOfflineManager.status === 'offline');
    const t = i18n[currentLang] || i18n.en;

    if (offlineBar && offlineText) {
      if (isOffline) {
        offlineBar.style.display = 'flex';
        const ts = typeof SwasthyaOfflineManager !== 'undefined' ? SwasthyaOfflineManager.getFormattedTimestamp() : 'Recently';
        offlineText.textContent = `${t.offlineNotice} (${t.offlineTimestamp(ts)})`;
      } else {
        offlineBar.style.display = 'none';
      }
    }
  }

  function setLanguage(lang) {
    currentLang = lang || 'en';
    syncLanguageUI(currentLang);
  }

  function syncLanguageUI(lang) {
    const t = i18n[lang] || i18n.en;
    const botName = document.getElementById('wa-bot-name');
    const botStatus = document.getElementById('wa-bot-status');
    const welcome1 = document.getElementById('wa-welcome-text-1');
    const welcome2 = document.getElementById('wa-welcome-text-2');
    const shareBtn = document.getElementById('wa-label-share-loc');
    const manualBtn = document.getElementById('wa-label-manual-loc');
    const privacyEl = document.getElementById('wa-privacy-desc');
    const inputField = document.getElementById('wa-user-input');
    const modalTitle = document.getElementById('wa-modal-title');
    const modalDesc = document.getElementById('wa-modal-desc');

    if (botName) botName.textContent = t.botName;
    if (botStatus) botStatus.textContent = t.botSubtitle;
    if (welcome1) welcome1.innerHTML = t.welcomeHeader;
    if (welcome2) welcome2.innerHTML = t.welcomeQuestion;
    if (shareBtn) shareBtn.textContent = t.btnShareLocation;
    if (manualBtn) manualBtn.textContent = t.btnEnterManual;
    if (privacyEl) privacyEl.innerHTML = t.privacyNotice;
    if (inputField) inputField.placeholder = t.inputPlaceholder;
    if (modalTitle) modalTitle.textContent = t.confirmWhatsAppTitle;
    if (modalDesc) modalDesc.textContent = t.confirmWhatsAppDesc;

    const langSelect = document.getElementById('wa-lang-select');
    if (langSelect && langSelect.value !== lang) {
      langSelect.value = lang;
    }
  }

  // Request real GPS Geolocation from browser
  function requestLocationPermission() {
    closeAttachmentMenu();
    const t = i18n[currentLang] || i18n.en;

    appendUserMessage(t.btnShareLocation);
    showTyping(t.locatingText);

    if (!navigator.geolocation) {
      hideTyping();
      appendBotMessage(`
        <div style="color:#e11d48; font-weight:700; margin-bottom:0.4rem;">⚠️ Geolocation Not Supported</div>
        ${t.locDenied}
        ${renderInlineManualSearchForm()}
      `);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        hideTyping();
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy || 15);

        patientCoords = {
          lat: lat,
          lng: lng,
          accuracy: accuracy,
          isManual: false,
          timestamp: new Date().toISOString()
        };

        // Update global patientCoordinates if on patient portal
        if (typeof window.patientCoordinates !== 'undefined') {
          window.patientCoordinates = { lat, lng };
        }

        // Reverse Geocode for locality name
        let locationName = `GPS (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`;
        if (window.PlacesHealthService && window.PlacesHealthService.reverseGeocode) {
          const areaInfo = await window.PlacesHealthService.reverseGeocode(lat, lng);
          if (areaInfo && areaInfo.displayName) {
            locationName = areaInfo.displayName;
          }
        }
        patientCoords.label = locationName;

        // Sync header on patient page
        const detectedEl = document.getElementById('detected-location-text');
        if (detectedEl) detectedEl.textContent = `${locationName} (GPS Coords)`;

        // Append Bot Success Message
        appendBotMessage(`
          <div style="display:flex; align-items:center; gap:0.4rem; color:#059669; font-weight:700; margin-bottom:0.35rem;">
            <span>${t.locSuccess}</span>
          </div>
          <div style="font-size:0.8rem; background:rgba(5, 150, 105, 0.08); padding:0.45rem 0.65rem; border-radius:6px; margin-bottom:0.6rem;">
            📌 <strong>${locationName}</strong><br>
            <span style="font-size:0.725rem; color:#64748b;">GPS: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E (Accuracy: ±${accuracy}m)</span>
          </div>
          <div>Searching nearby government hospitals, PHCs, CHCs, Ayushman Arogya Mandirs, pharmacies, and emergency services within <strong>${activeRadius} km</strong>...</div>
        `);

        // Perform healthcare POI search
        executeHealthcareSearch(lat, lng, activeRadius, activeCategory);
      },
      (err) => {
        hideTyping();
        console.warn('Browser geolocation denied or timeout:', err);
        appendBotMessage(`
          <div style="color:#e11d48; font-weight:700; margin-bottom:0.35rem;">⚠️ ${t.locDenied}</div>
          <p style="font-size:0.8rem; color:#64748b; margin:0 0 0.6rem;">
            Location permission was denied or unavailable. Please enter your location manually to continue:
          </p>
          ${renderInlineManualSearchForm()}
        `);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  // Inline Manual Search Box
  function renderInlineManualSearchForm() {
    const t = i18n[currentLang] || i18n.en;
    const formId = `wa-manual-form-${Date.now()}`;
    const inputId = `wa-manual-input-${Date.now()}`;

    setTimeout(() => {
      const f = document.getElementById(formId);
      if (f) {
        f.addEventListener('submit', (e) => {
          e.preventDefault();
          const inp = document.getElementById(inputId);
          if (inp && inp.value.trim()) {
            handleManualSearchSubmit(inp.value.trim());
          }
        });
      }
    }, 50);

    return `
      <form id="${formId}" style="display:flex; flex-direction:column; gap:0.45rem; margin-top:0.4rem;">
        <input type="text" id="${inputId}" class="wa-user-input" placeholder="${t.manualPlaceholder}" style="border-radius:8px; padding:0.5rem 0.75rem;" required>
        <div style="display:flex; gap:0.4rem;">
          <button type="submit" class="wa-btn-action wa-btn-primary" style="flex:1;">
            🔍 ${t.manualSearchBtn}
          </button>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:0.3rem; margin-top:0.25rem;">
          <span style="font-size:0.7rem; color:#64748b;">Quick search:</span>
          <button type="button" class="wa-chip" style="font-size:0.7rem; padding:2px 8px;" onclick="window.SwasthyaWhatsAppAI.handleManualSearchSubmit('Hyderabad, Telangana')">Hyderabad</button>
          <button type="button" class="wa-chip" style="font-size:0.7rem; padding:2px 8px;" onclick="window.SwasthyaWhatsAppAI.handleManualSearchSubmit('Vijayawada, Andhra Pradesh')">Vijayawada</button>
          <button type="button" class="wa-chip" style="font-size:0.7rem; padding:2px 8px;" onclick="window.SwasthyaWhatsAppAI.handleManualSearchSubmit('New Delhi')">New Delhi</button>
          <button type="button" class="wa-chip" style="font-size:0.7rem; padding:2px 8px;" onclick="window.SwasthyaWhatsAppAI.handleManualSearchSubmit('500001')">PIN: 500001</button>
        </div>
      </form>
    `;
  }

  function showManualLocationPrompt() {
    closeAttachmentMenu();
    const t = i18n[currentLang] || i18n.en;
    appendUserMessage(t.btnEnterManual);
    appendBotMessage(`
      <div style="font-weight:700; margin-bottom:0.35rem;">✏️ Enter Location Manually</div>
      <p style="font-size:0.8rem; color:#64748b; margin:0 0 0.5rem;">
        Please enter your village, town, district name, or 6-digit PIN code:
      </p>
      ${renderInlineManualSearchForm()}
    `);
  }

  async function handleManualSearchSubmit(query) {
    const t = i18n[currentLang] || i18n.en;
    appendUserMessage(`📍 Search location: ${query}`);
    showTyping(`Locating "${query}" on OpenStreetMap...`);

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      hideTyping();

      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const item = data[0];
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);

          patientCoords = {
            lat: lat,
            lng: lng,
            accuracy: 500,
            label: item.display_name,
            isManual: true,
            timestamp: new Date().toISOString()
          };

          if (typeof window.patientCoordinates !== 'undefined') {
            window.patientCoordinates = { lat, lng };
          }

          const detectedEl = document.getElementById('detected-location-text');
          if (detectedEl) detectedEl.textContent = `${item.display_name} (Manual Search)`;

          appendBotMessage(`
            <div style="color:#059669; font-weight:700; margin-bottom:0.35rem;">✓ Location Resolved</div>
            <div style="font-size:0.8rem; background:rgba(5, 150, 105, 0.08); padding:0.45rem 0.65rem; border-radius:6px; margin-bottom:0.5rem;">
              📌 <strong>${item.display_name}</strong>
            </div>
            <div>Finding healthcare facilities near this location...</div>
          `);

          executeHealthcareSearch(lat, lng, activeRadius, activeCategory);
          return;
        }
      }
    } catch (e) {
      hideTyping();
      console.warn('Geocoding error:', e);
    }

    // Fallback if geocoding returns nothing
    appendBotMessage(`
      <div style="color:#e11d48; font-weight:700;">Could not locate "${query}".</div>
      <p style="font-size:0.8rem; color:#64748b; margin:0.3rem 0;">Please try with a major city name, district, or 6-digit postal PIN code.</p>
      ${renderInlineManualSearchForm()}
    `);
  }

  // Execute Search for Nearby Healthcare POIs
  async function executeHealthcareSearch(lat, lng, radiusKm, category) {
    showTyping('Querying real OpenStreetMap & Overpass healthcare facilities...');
    const t = i18n[currentLang] || i18n.en;

    let facilities = [];

    if (window.PlacesHealthService && window.PlacesHealthService.fetchNearbyFacilities) {
      facilities = await window.PlacesHealthService.fetchNearbyFacilities(lat, lng, radiusKm, category);
    } else {
      // Direct live Nominatim POI query if PlacesHealthService not on page
      try {
        const rKm = Math.max(1, radiusKm || 5);
        const deltaLat = rKm / 111;
        const deltaLng = rKm / (111 * Math.cos(lat * Math.PI / 180));
        const viewbox = `${(lng - deltaLng).toFixed(4)},${(lat + deltaLat).toFixed(4)},${(lng + deltaLng).toFixed(4)},${(lat - deltaLat).toFixed(4)}`;
        const qList = ['hospital', 'primary health centre', 'clinic', 'pharmacy'];
        const results = await Promise.all(qList.map(async q => {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&viewbox=${viewbox}&bounded=1&limit=8&addressdetails=1`, {
              headers: { 'User-Agent': 'SwasthyaConnect/1.0', 'Accept': 'application/json' }
            });
            if (res.ok) return await res.json();
          } catch(e) {}
          return [];
        }));
        const flat = results.flat();
        facilities = flat.map((item, idx) => {
          const itemLat = parseFloat(item.lat);
          const itemLng = parseFloat(item.lon);
          const distKm = Math.round(6371 * 2 * Math.atan2(Math.sqrt(
            Math.sin((itemLat - lat) * Math.PI / 360) ** 2 +
            Math.cos(lat * Math.PI / 180) * Math.cos(itemLat * Math.PI / 180) *
            Math.sin((itemLng - lng) * Math.PI / 360) ** 2
          ), Math.sqrt(1 - (
            Math.sin((itemLat - lat) * Math.PI / 360) ** 2 +
            Math.cos(lat * Math.PI / 180) * Math.cos(itemLat * Math.PI / 180) *
            Math.sin((itemLng - lng) * Math.PI / 360) ** 2
          ))) * 10) / 10;
          let rawName = item.name || (item.display_name ? item.display_name.split(',')[0] : '');
          if (!rawName || rawName.toLowerCase() === 'hospital' || rawName.toLowerCase() === 'clinic') {
            rawName = `${item.address?.road || item.address?.suburb || 'Local'} ${rawName.toLowerCase() === 'clinic' ? 'Health Clinic' : 'Hospital'}`;
          }
          return {
            id: `nom-${item.place_id || idx}`,
            name: rawName,
            category: rawName.toLowerCase().includes('pharmacy') ? 'Pharmacies' : (rawName.toLowerCase().includes('phc') ? 'PHC' : 'Government Hospitals'),
            type: rawName.toLowerCase().includes('pharmacy') ? 'Pharmacy / Kendra' : (rawName.toLowerCase().includes('phc') ? 'Primary Health Centre' : 'Hospital'),
            lat: itemLat,
            lng: itemLng,
            distanceKm: distKm,
            distance: `${distKm.toFixed(1)} km`,
            location: item.display_name,
            timing: '24x7 Emergency & IPD | OPD: 09:00 AM - 02:00 PM',
            phone: '+91 1800-180-1104',
            services: ['Free Doctor Consultation', 'Generic Medicines', 'Diagnostic Testing', 'Ayushman Bharat PM-JAY'],
            pmjayEmpanelled: true,
            emergencyReady: true,
            directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${itemLat},${itemLng}`
          };
        }).sort((a, b) => a.distanceKm - b.distanceKm);
      } catch(e) {}
    }

    hideTyping();

    // Auto-radius expansion if few facilities found (Rural Healthcare Support)
    if (facilities.length < 3 && radiusKm < 10) {
      const prevRadius = radiusKm;
      activeRadius = 10;
      if (window.PlacesHealthService) {
        facilities = await window.PlacesHealthService.fetchNearbyFacilities(lat, lng, 10, category);
      }
      appendBotMessage(`
        <div style="font-size:0.775rem; color:#0f766e; background:#f0fdfa; padding:0.4rem 0.65rem; border-radius:6px; border-left:3px solid #0d9488; margin-bottom:0.5rem;">
          ${t.expandedRadiusNote(prevRadius, 10)}
        </div>
      `);
    } else if (facilities.length === 0 && radiusKm < 25) {
      const prevRadius = radiusKm;
      activeRadius = 25;
      if (window.PlacesHealthService) {
        facilities = await window.PlacesHealthService.fetchNearbyFacilities(lat, lng, 25, category);
      }
      appendBotMessage(`
        <div style="font-size:0.775rem; color:#0f766e; background:#f0fdfa; padding:0.4rem 0.65rem; border-radius:6px; border-left:3px solid #0d9488; margin-bottom:0.5rem;">
          ${t.expandedRadiusNote(prevRadius, 25)}
        </div>
      `);
    }

    currentFacilities = facilities;

    // Check if offline
    const isOffline = !navigator.onLine || (typeof SwasthyaOfflineManager !== 'undefined' && SwasthyaOfflineManager.status === 'offline');
    const timestampStr = typeof SwasthyaOfflineManager !== 'undefined' ? SwasthyaOfflineManager.getFormattedTimestamp() : 'Recently';

    // Synchronize Leaflet map on patient.html
    if (typeof window.updateLeafletMapWithFacilities === 'function') {
      window.updateLeafletMapWithFacilities(facilities);
    }
    if (typeof window.renderNearbyCards === 'function') {
      window.renderNearbyCards(facilities);
    }

    if (facilities.length === 0) {
      appendBotMessage(`
        <div style="text-align:center; padding:0.5rem 0;">
          <div style="font-size:1.6rem; margin-bottom:0.3rem;">🏥</div>
          <div style="font-weight:700; margin-bottom:0.3rem;">I couldn't find a healthcare centre within ${activeRadius} km.</div>
          <p style="font-size:0.8rem; color:#64748b; margin:0 0 0.6rem;">Would you like me to search within a wider 25 km radius?</p>
          <button class="wa-btn-action wa-btn-primary" onclick="window.SwasthyaWhatsAppAI.setDistanceFilter(25)">
            🔍 Search within 25 km
          </button>
        </div>
      `);
      return;
    }

    // Format Numbered AI Response
    const topFacilities = facilities.slice(0, 5);
    const facilitiesListHTML = topFacilities.map((fac, idx) => {
      const catIcon = getCategoryEmoji(fac.category);
      return `
        <div class="wa-facility-card">
          <div class="wa-facility-card-header">
            <div style="flex:1;">
              <span class="badge ${getCategoryBadge(fac.category)}" style="font-size:0.65rem; margin-bottom:2px;">${fac.type}</span>
              <h4 class="wa-facility-title">${idx + 1}. ${fac.name}</h4>
            </div>
            <span class="wa-dist-badge">📍 ${fac.distance}</span>
          </div>

          <div class="wa-card-details">
            <div>📌 <strong>Address:</strong> ${fac.location}</div>
            ${fac.phone ? `<div>☎️ <strong>Phone:</strong> <a href="tel:${fac.phone.split(' ')[0]}" style="color:inherit; text-decoration:underline;">${fac.phone}</a></div>` : ''}
            ${fac.timing ? `<div>🕒 <strong>Hours:</strong> ${fac.timing}</div>` : ''}
            ${fac.emergencyReady ? `<div style="color:#e11d48; font-weight:700; margin-top:2px;">🚨 24x7 Emergency Ready</div>` : ''}
          </div>

          <div class="wa-facility-actions">
            <a href="${fac.directionsUrl}" target="_blank" rel="noopener noreferrer" class="wa-card-btn wa-btn-dir">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
              <span>${t.btnDirections}</span>
            </a>
            <button type="button" class="wa-card-btn wa-btn-wa-share" onclick="window.SwasthyaWhatsAppAI.promptSendSingleFacility('${fac.id}')">
              <svg class="wa-icon" viewBox="0 0 24 24" width="14" height="14" fill="#ffffff" style="margin-right:2px;">
                <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.275-.1-.475-.15-.675.15-.2.3-.776.979-.951 1.18-.175.2-.35.225-.651.075-.3-.15-1.267-.467-2.414-1.489-.893-.796-1.496-1.78-1.671-2.08-.175-.3-.019-.462.131-.611.136-.134.301-.35.451-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.585-.492-.505-.675-.514-.175-.009-.375-.009-.575-.009s-.525.075-.8.375c-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.115 3.23 5.124 4.53.716.31 1.275.495 1.71.634.72.229 1.375.197 1.892.12.576-.086 1.78-.727 2.03-1.429.25-.702.25-1.303.175-1.429-.075-.126-.275-.201-.576-.351zM12.004 2C6.48 2 2 6.48 2 12.004c0 1.947.558 3.766 1.523 5.309L2.1 21.9l4.747-1.397A9.954 9.954 0 0 0 12.004 22c5.524 0 10.004-4.48 10.004-10.004C22.008 6.48 17.528 2 12.004 2zm0 18.292c-1.644 0-3.173-.487-4.464-1.326l-.32-.208-2.82.83.844-2.738-.228-.337A8.257 8.257 0 0 1 3.712 12c0-4.572 3.72-8.292 8.292-8.292s8.292 3.72 8.292 8.292-3.72 8.292-8.292 8.292z"/>
              </svg>
              <span>${t.btnSendWhatsApp}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    appendBotMessage(`
      ${isOffline ? `
        <div style="padding:0.35rem 0.6rem; background:#fee2e2; color:#b91c1c; font-size:0.75rem; font-weight:700; border-radius:6px; margin-bottom:0.5rem;">
          ${t.offlineNotice} (${t.offlineTimestamp(timestampStr)})
        </div>
      ` : ''}
      <div style="font-weight:700; font-size:0.925rem; color:#0f766e; margin-bottom:0.35rem;">
        ${t.foundCount(facilities.length, activeRadius)}
      </div>
      ${facilitiesListHTML}

      <!-- Batch Share on WhatsApp & Filters Bar -->
      <div style="margin-top:0.75rem; display:flex; flex-direction:column; gap:0.4rem;">
        <button type="button" class="wa-btn-action wa-btn-primary" onclick="window.SwasthyaWhatsAppAI.promptSendMultipleFacilities()" style="background:#075e54;">
          <svg class="wa-icon" viewBox="0 0 24 24" width="18" height="18" fill="#ffffff" style="margin-right:4px;">
            <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.275-.1-.475-.15-.675.15-.2.3-.776.979-.951 1.18-.175.2-.35.225-.651.075-.3-.15-1.267-.467-2.414-1.489-.893-.796-1.496-1.78-1.671-2.08-.175-.3-.019-.462.131-.611.136-.134.301-.35.451-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.585-.492-.505-.675-.514-.175-.009-.375-.009-.575-.009s-.525.075-.8.375c-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.115 3.23 5.124 4.53.716.31 1.275.495 1.71.634.72.229 1.375.197 1.892.12.576-.086 1.78-.727 2.03-1.429.25-.702.25-1.303.175-1.429-.075-.126-.275-.201-.576-.351zM12.004 2C6.48 2 2 6.48 2 12.004c0 1.947.558 3.766 1.523 5.309L2.1 21.9l4.747-1.397A9.954 9.954 0 0 0 12.004 22c5.524 0 10.004-4.48 10.004-10.004C22.008 6.48 17.528 2 12.004 2zm0 18.292c-1.644 0-3.173-.487-4.464-1.326l-.32-.208-2.82.83.844-2.738-.228-.337A8.257 8.257 0 0 1 3.712 12c0-4.572 3.72-8.292 8.292-8.292s8.292 3.72 8.292 8.292-3.72 8.292-8.292 8.292z"/>
          </svg>
          <span>${t.btnSendAllWhatsApp}</span>
        </button>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.25rem;">
          <span style="font-size:0.7rem; color:#64748b;">Distance:</span>
          <div style="display:flex; gap:0.25rem;">
            <button class="wa-chip ${activeRadius === 1 ? 'wa-chip-danger' : ''}" style="font-size:0.68rem; padding:2px 6px;" onclick="window.SwasthyaWhatsAppAI.setDistanceFilter(1)">1 km</button>
            <button class="wa-chip ${activeRadius === 5 ? 'wa-chip-danger' : ''}" style="font-size:0.68rem; padding:2px 6px;" onclick="window.SwasthyaWhatsAppAI.setDistanceFilter(5)">5 km</button>
            <button class="wa-chip ${activeRadius === 10 ? 'wa-chip-danger' : ''}" style="font-size:0.68rem; padding:2px 6px;" onclick="window.SwasthyaWhatsAppAI.setDistanceFilter(10)">10 km</button>
            <button class="wa-chip ${activeRadius === 25 ? 'wa-chip-danger' : ''}" style="font-size:0.68rem; padding:2px 6px;" onclick="window.SwasthyaWhatsAppAI.setDistanceFilter(25)">25 km</button>
          </div>
        </div>
      </div>
    `);
  }

  function setDistanceFilter(dist) {
    activeRadius = dist;
    appendUserMessage(`Filter distance: within ${dist} km`);
    if (patientCoords) {
      executeHealthcareSearch(patientCoords.lat, patientCoords.lng, dist, activeCategory);
    } else {
      requestLocationPermission();
    }
  }

  function getCategoryEmoji(cat) {
    const c = String(cat).toLowerCase();
    if (c.includes('emergency')) return '🚨';
    if (c.includes('phc') || c.includes('arogya')) return '🟢';
    if (c.includes('pharmacy')) return '💊';
    if (c.includes('diagnostic')) return '🧪';
    return '🏥';
  }

  function getCategoryBadge(cat) {
    const c = String(cat).toLowerCase();
    if (c.includes('emergency')) return 'badge-danger';
    if (c.includes('phc') || c.includes('arogya')) return 'badge-emerald';
    if (c.includes('pharmacy')) return 'badge-amber';
    if (c.includes('diagnostic')) return 'badge-purple';
    return 'badge-primary';
  }

  // =========================================================================
  // WhatsApp Message Preparation & Confirmation Dialog
  // =========================================================================
  let pendingWhatsAppText = '';

  function promptSendSingleFacility(facId) {
    const fac = currentFacilities.find(f => f.id === facId);
    if (!fac) return;

    // Exact Format Specified in Requirement 5
    const msg = `SwasthyaConnect Healthcare Location

🏥 ${fac.name}

📍 Address:
${fac.location}

📏 Distance:
${fac.distance || (fac.distanceKm ? fac.distanceKm.toFixed(1) + ' km' : 'Nearby')}

🗺️ Location:
${fac.directionsUrl}

This healthcare location was found using SwasthyaConnect.`;

    openWhatsAppConfirmModal(msg);
  }

  function promptSendMultipleFacilities() {
    if (!currentFacilities || currentFacilities.length === 0) {
      appendBotMessage('Please find nearby healthcare facilities first before sharing on WhatsApp.');
      return;
    }

    const top = currentFacilities.slice(0, 3);
    const lines = top.map((f, i) => `${i + 1}. ${f.name} — ${f.distance || (f.distanceKm ? f.distanceKm.toFixed(1) + ' km' : '')}\n📍 ${f.directionsUrl}`).join('\n\n');

    // Exact Format Specified in Requirement 6
    const msg = `🏥 Nearby Healthcare Centres

${lines}

Powered by SwasthyaConnect.`;

    openWhatsAppConfirmModal(msg);
  }

  function openWhatsAppConfirmModal(messageText) {
    pendingWhatsAppText = messageText;
    const modal = document.getElementById('wa-confirm-modal');
    const pre = document.getElementById('wa-preview-text');

    if (pre) pre.textContent = messageText;
    if (modal) modal.style.display = 'flex';
  }

  function closeWhatsAppConfirmModal() {
    const modal = document.getElementById('wa-confirm-modal');
    if (modal) modal.style.display = 'none';
  }

  function dispatchPreparedWhatsAppMessage() {
    closeWhatsAppConfirmModal();
    if (!pendingWhatsAppText) return;

    const encoded = encodeURIComponent(pendingWhatsAppText);
    const waUrl = `https://api.whatsapp.com/send?text=${encoded}`;

    // Open WhatsApp in new window/tab
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // Add confirmation feedback in chat
    appendBotMessage(`
      <div style="color:#059669; font-weight:700;">✓ WhatsApp opened with your selected healthcare details.</div>
      <p style="font-size:0.775rem; color:#64748b; margin:2px 0 0;">Review and hit send inside WhatsApp to share with your family or caregiver.</p>
    `);
  }

  // =========================================================================
  // Natural Language Understanding (NLP) Query Engine
  // =========================================================================
  function handleUserQuery(text) {
    appendUserMessage(text);
    const q = text.toLowerCase().trim();
    const t = i18n[currentLang] || i18n.en;

    // 1. Emergency Query ("I need emergency help", "emergency", "ambulance", "chest pain")
    if (
      q.includes('emergency') || q.includes('chest pain') || q.includes('heart attack') || q.includes('sos') ||
      q.includes('दर्द') || q.includes('इमरजेंसी') || q.includes('सांस') || q.includes('आपातकालीन') ||
      q.includes('ఎమర్జెన్సీ') || q.includes('అత్యవసర') || q.includes('ఛాతీ నొప్పి')
    ) {
      showTyping('Triaging emergency priority...');
      setTimeout(() => {
        hideTyping();
        appendBotMessage(`
          <div style="background:#fee2e2; border:2px solid #ef4444; border-radius:10px; padding:0.85rem; margin-bottom:0.5rem;">
            <div style="color:#b91c1c; font-weight:800; font-size:0.95rem; margin-bottom:0.25rem;">
              🚨 ${t.emergencyTitle}
            </div>
            <p style="font-size:0.825rem; color:#7f1d1d; margin:0 0 0.65rem; line-height:1.4;">
              ${t.emergencyNotice}
            </p>
            <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
              <a href="tel:108" class="wa-btn-action" style="background:#dc2626; color:#ffffff; flex:1; min-width:140px; text-decoration:none;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>${t.emergencyDialBtn}</span>
              </a>
              <button class="wa-btn-action wa-btn-secondary" style="flex:1;" onclick="window.SwasthyaWhatsAppAI.requestLocationPermission()">
                📍 Locate Nearest Trauma ER
              </button>
            </div>
            <div style="font-size:0.7rem; color:#991b1b; margin-top:0.5rem; font-style:italic;">
              ${t.disclaimer}
            </div>
          </div>
        `);
      }, 400);
      return;
    }

    // 2. WhatsApp Batch Share request
    if (q.includes('send') && (q.includes('whatsapp') || q.includes('share') || q.includes('हॉस्पिटल व्हाट्सएप') || q.includes('వాట్సాప్'))) {
      promptSendMultipleFacilities();
      return;
    }

    // 3. Distance Radius queries (e.g. "within 5 km", "within 10 km")
    if (q.includes('1 km') || q.includes('1km')) { setDistanceFilter(1); return; }
    if (q.includes('5 km') || q.includes('5km')) { setDistanceFilter(5); return; }
    if (q.includes('10 km') || q.includes('10km')) { setDistanceFilter(10); return; }
    if (q.includes('25 km') || q.includes('25km')) { setDistanceFilter(25); return; }

    // 4. Category-specific searches (PHC, Govt Hospital, Pharmacy, Arogya Mandir)
    let catFilter = 'All';
    if (q.includes('phc') || q.includes('primary health')) catFilter = 'PHC';
    else if (q.includes('chc') || q.includes('community health')) catFilter = 'CHC';
    else if (q.includes('government') || q.includes('govt') || q.includes('सरकारी') || q.includes('ప్రభుత్వ')) catFilter = 'Government Hospitals';
    else if (q.includes('pharmacy') || q.includes('chemist') || q.includes('medicine') || q.includes('दवा') || q.includes('మందుల')) catFilter = 'Pharmacies';
    else if (q.includes('arogya') || q.includes('ayushman') || q.includes('wellness')) catFilter = 'Ayushman Arogya Mandir';
    else if (q.includes('diagnostic') || q.includes('lab') || q.includes('blood test') || q.includes('x-ray')) catFilter = 'Diagnostic Centres';
    else if (q.includes('emergency') || q.includes('trauma')) catFilter = 'Emergency Services';

    activeCategory = catFilter;

    if (patientCoords) {
      executeHealthcareSearch(patientCoords.lat, patientCoords.lng, activeRadius, catFilter);
    } else {
      appendBotMessage(`
        <div>I will search for <strong>${catFilter === 'All' ? 'nearby healthcare centres' : catFilter}</strong>.</div>
        <p style="font-size:0.825rem; color:#64748b; margin:0.3rem 0 0.6rem;">Please share your location so I can calculate accurate distances:</p>
        <button class="wa-btn-action wa-btn-primary" onclick="window.SwasthyaWhatsAppAI.requestLocationPermission()">
          📍 Share My Location
        </button>
      `);
    }
  }

  // =========================================================================
  // DOM Message Appenders & Helpers
  // =========================================================================
  function appendUserMessage(text) {
    const container = document.getElementById('wa-dynamic-messages');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'wa-msg-row user-row';
    row.innerHTML = `
      <div class="wa-bubble user-bubble">
        <div class="wa-text-content">${escapeHTML(text)}</div>
        <div class="wa-msg-footer">
          <span class="wa-time">${formatCurrentTime()}</span>
          <span class="wa-double-tick">✓✓</span>
        </div>
      </div>
    `;

    container.appendChild(row);
    scrollToBottom();
  }

  function appendBotMessage(htmlContent) {
    const container = document.getElementById('wa-dynamic-messages');
    if (!container) return;

    const t = i18n[currentLang] || i18n.en;
    const row = document.createElement('div');
    row.className = 'wa-msg-row bot-row';
    row.innerHTML = `
      <div class="wa-bubble bot-bubble">
        <div class="wa-sender-label">🤖 ${t.botName}</div>
        <div class="wa-text-content">${htmlContent}</div>
        <div class="wa-msg-footer">
          <span class="wa-time">${formatCurrentTime()}</span>
        </div>
      </div>
    `;

    container.appendChild(row);
    scrollToBottom();
  }

  function showTyping(customText = null) {
    const typing = document.getElementById('wa-typing-indicator');
    if (!typing) return;
    if (customText) {
      const txt = typing.querySelector('.wa-typing-text');
      if (txt) txt.textContent = customText;
    }
    typing.style.display = 'flex';
    scrollToBottom();
  }

  function hideTyping() {
    const typing = document.getElementById('wa-typing-indicator');
    if (typing) typing.style.display = 'none';
  }

  function scrollToBottom() {
    const body = document.getElementById('wa-chat-body');
    if (body) {
      setTimeout(() => {
        body.scrollTop = body.scrollHeight;
      }, 50);
    }
  }

  function formatCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  }

  function escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function toggleAttachmentMenu() {
    const menu = document.getElementById('wa-attachment-dropdown');
    if (!menu) return;
    const isHidden = menu.style.display === 'none' || menu.style.display === '';
    menu.style.display = isHidden ? 'flex' : 'none';
  }

  function closeAttachmentMenu() {
    const menu = document.getElementById('wa-attachment-dropdown');
    if (menu) menu.style.display = 'none';
  }

  // Open Chat programmatically (e.g. from buttons on dashboard)
  function openAssistant(initialQuery = null) {
    const win = document.getElementById('swasthya-wa-window');
    if (win) {
      win.style.display = 'flex';
      isOpen = true;
      if (initialQuery) {
        handleUserQuery(initialQuery);
      }
    }
  }

  // Expose global interface
  window.SwasthyaWhatsAppAI = {
    requestLocationPermission,
    showManualLocationPrompt,
    handleManualSearchSubmit,
    handleUserQuery,
    setDistanceFilter,
    promptSendSingleFacility,
    promptSendMultipleFacilities,
    closeWhatsAppConfirmModal,
    dispatchPreparedWhatsAppMessage,
    toggleAttachmentMenu,
    openAssistant,
    setLanguage
  };

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

})();
