/**
 * SwasthyaConnect AI Voice Assistant (js/voice-assistant.js)
 * 
 * Complete, High-Fidelity Multilingual Voice Engine:
 * - English (en-IN)
 * - తెలుగు (te-IN)
 * - हिन्दी (hi-IN)
 * 
 * Features:
 * 1. Dynamic Language Switching across STT, TTS, NLP, and UI
 * 2. SpeechRecognition Re-initialization per Language with real-time transcription
 * 3. Exact Language-Matched Text-to-Speech (speakResponse) & Native Voice Filtering
 * 4. Missing Voice Detection & Device-Specific Fallback Warnings
 * 5. Real GPS Geolocation & OpenStreetMap Healthcare POI Discovery
 * 6. Live Development Diagnostic Debug Panel
 */

(function () {
  'use strict';

  // Browser Web Speech API references
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const isSpeechSupported = !!SpeechRecognition;
  const isSynthesisSupported = 'speechSynthesis' in window;

  // Assistant State
  let selectedLanguage = 'en-IN'; // Standard BCP 47: 'en-IN', 'te-IN', 'hi-IN'
  let recognition = null;
  let isListening = false;
  let isSpeaking = false;
  let isProcessing = false;
  let isOpen = false;
  let patientCoords = null; // { lat, lng, accuracy }
  let availableVoices = [];
  let showDebugPanel = false;

  // Language Code Normalization Helper
  function normalizeLanguage(lang) {
    if (!lang) return 'en-IN';
    const l = String(lang).toLowerCase().trim();
    if (l === 'te' || l === 'te-in' || l === 'te_in' || l.startsWith('te') || l.includes('telugu')) {
      return 'te-IN';
    }
    if (l === 'hi' || l === 'hi-in' || l === 'hi_in' || l.startsWith('hi') || l.includes('hindi')) {
      return 'hi-IN';
    }
    return 'en-IN';
  }

  // Short code helper for i18n compatibility
  function getShortLangCode(lang) {
    const norm = normalizeLanguage(lang);
    if (norm === 'te-IN') return 'te';
    if (norm === 'hi-IN') return 'hi';
    return 'en';
  }

  // Comprehensive Multilingual Language Configuration
  const langConfig = {
    'en-IN': {
      code: 'en-IN',
      short: 'en',
      name: 'English',
      label: 'English',
      nativeLabel: 'English',
      tapToSpeak: 'Tap microphone to speak',
      statusReady: 'Ready (Tap microphone to speak)',
      statusListening: 'Listening... (Speak in English)',
      statusProcessing: 'Processing request...',
      statusSpeaking: 'Speaking...',
      greeting: 'Hi! I’m <strong>SwasthyaConnect Voice AI</strong>. How can I help you today?',
      greetingSpeech: 'Hi! I am SwasthyaConnect Voice AI. How can I help you with hospitals, appointments, prescriptions, or government schemes?',
      locating: 'Getting your real GPS location...',
      locDenied: 'Location access was not granted. Please speak or enter your city or PIN code.',
      micDenied: 'Microphone access was denied. Please allow microphone permissions in your browser.',
      unsupported: 'Voice recognition is not supported in this browser. Please use Google Chrome on Android/Desktop or type your request.',
      noVoiceWarning: 'English voice is not available on this device/browser.',
      searchingHealthcare: 'Searching for healthcare facilities near your GPS location...',
      foundFacilitiesSpeech: (count, name, dist) => `I found ${count} healthcare facilities near you. The nearest is ${name}, approximately ${dist} away.`,
      foundFacilitiesText: (count, radius) => `Found <strong>${count}</strong> healthcare facilities near you (within ${radius} km):`,
      noFacilitiesFound: (radius) => `No healthcare centres found within ${radius} km. Try asking to expand search radius.`,
      emergencyTitle: '🚨 Emergency Medical Assistance (Dial 108)',
      emergencySpeech: 'If you are facing a medical emergency, please dial 108 immediately for an ambulance. I have displayed emergency trauma centers.',
      emergencyText: 'Immediate 24x7 Ambulance & Emergency Helpline:',
      whatsAppPreparedSpeech: (name) => `I have prepared the WhatsApp message for ${name}. Click the button to review and send.`,
      whatsAppPreparedText: (name) => `Review hospital details for <strong>${name}</strong> before sending:`,
      whatsAppNoHospital: 'No hospital details available to share yet. Please search for nearby hospitals first.',
      appointmentsSpeech: (count) => `You have ${count} upcoming doctor appointment${count === 1 ? '' : 's'}. Details are on your screen.`,
      appointmentsTitle: (count) => `📅 <strong>Upcoming Appointments (${count})</strong>:`,
      prescriptionsSpeech: (count) => `You have ${count} active digital prescription${count === 1 ? '' : 's'}. Details are on your screen.`,
      prescriptionsTitle: '💊 <strong>Active Prescriptions & Medical Records</strong>:',
      schemesSpeech: 'Ayushman Bharat PM-JAY provides up to 5 lakh rupees per family per year for cashless hospitalization at 27,000+ empanelled hospitals.',
      schemesTitle: '🏛️ <strong>Ayushman Bharat PM-JAY</strong>',
      schemesDesc: 'Provides ₹5,00,000 per family per year for cashless treatment across empanelled government and private hospitals.',
      quickPrompts: [
        'Find hospitals near me',
        'Find government hospitals',
        'Show nearby PHCs',
        'Find a pharmacy near me',
        'Show my appointments',
        'Show my prescriptions',
        'Tell me about Ayushman Bharat',
        'Send nearest hospital to WhatsApp',
        'I need emergency healthcare'
      ]
    },
    'te-IN': {
      code: 'te-IN',
      short: 'te',
      name: 'తెలుగు (Telugu)',
      label: 'తెలుగు',
      nativeLabel: 'తెలుగు (Telugu)',
      tapToSpeak: 'మాట్లాడటానికి మైక్రోఫోన్ నొక్కండి',
      statusReady: 'సిద్ధంగా ఉంది (మాట్లాడటానికి మైక్ నొక్కండి)',
      statusListening: 'వింటున్నాను... (తెలుగులో మాట్లాడండి)',
      statusProcessing: 'మీ అభ్యర్థనను ప్రాసెస్ చేస్తున్నాను...',
      statusSpeaking: 'సమాధానం చెబుతున్నాను...',
      greeting: 'నమస్కారం! నేను <strong>స్వాస్థ్యకనెక్ట్ వాయిస్ AI</strong>. మీకు ఎలా సహాయపడగలను?',
      greetingSpeech: 'నమస్కారం! నేను మీ స్వాస్థ్యకనెక్ట్ వాయిస్ అసిస్టెంట్‌ని. ఆసుపత్రులు, అపాయింట్‌మెంట్లు, ప్రిస్క్రిప్షన్లు లేదా ప్రభుత్వ పథకాల గురించి నేను మీకు ఎలా సహాయపడగలను?',
      locating: 'మీ ఖచ్చితమైన జీపీఎస్ లొకేషన్ తీసుకుంటున్నాను...',
      locDenied: 'లొకేషన్ అనుమతి లభించలేదు. మీ నగరం లేదా పిన్ కోడ్ చెప్పండి లేదా టైప్ చేయండి.',
      micDenied: 'మైక్రోఫోన్ అనుమతి నిరాకరించబడింది. దయచేసి బ్రౌజర్ సెట్టింగ్స్‌లో మైక్ ఆన్ చేయండి.',
      unsupported: 'ఈ బ్రౌజర్‌లో వాయిస్ రికగ్నిషన్ సపోర్ట్ లేదు. దయచేసి Google Chrome లేదా Android ఉపయోగించండి.',
      noVoiceWarning: 'Telugu voice is not available on this device/browser. Please try Chrome on Android or enable Telugu speech services.',
      searchingHealthcare: 'మీకు దగ్గరలో ఉన్న ప్రభుత్వ మరియు ప్రైవేట్ ఆసుపత్రులను వెతుకుతున్నాను...',
      foundFacilitiesSpeech: (count, name, dist) => `మీ సమీపంలో ${count} ఆరోగ్య కేంద్రాలు కనిపించాయి. అత్యంత సమీపంలో ఉన్నది ${name}, దాదాపు ${dist} దూరంలో ఉంది.`,
      foundFacilitiesText: (count, radius) => `మీ సమీపంలో <strong>${count}</strong> ఆరోగ్య కేంద్రాలు కనుగొనబడ్డాయి (${radius} కి.మీ పరిధిలో):`,
      noFacilitiesFound: (radius) => `${radius} కి.మీ పరిధిలో ఆరోగ్య కేంద్రాలు కనిపించలేదు. శోధన పరిధిని పెంచడానికి అడగండి.`,
      emergencyTitle: '🚨 అత్యవసర వైద్య సహాయం (108 కాల్ చేయండి)',
      emergencySpeech: 'వైద్య అత్యవసర పరిస్థితి అయితే వెంటనే 108 కి కాల్ చేయండి. సమీపంలోని ట్రూమా ఆసుపత్రుల వివరాలను స్క్రీన్‌పై చూపించాను.',
      emergencyText: 'తక్షణ 24x7 అంబులెన్స్ మరియు అత్యవసర సేవలు:',
      whatsAppPreparedSpeech: (name) => `నేను ${name} వివరాలతో వాట్సాప్ సందేశం సిద్ధం చేసాను. పంపేముందు చూడటానికి బటన్ నొక్కండి.`,
      whatsAppPreparedText: (name) => `పంపే ముందు <strong>${name}</strong> ఆసుపత్రి వివరాలను సమీక్షించండి:`,
      whatsAppNoHospital: 'వాట్సాప్‌లో పంపడానికి ఆసుపత్రి వివరాలు లేవు. దయచేసి ముందుగా సమీప ఆసుపత్రుల కోసం అడగండి.',
      appointmentsSpeech: (count) => `మీకు ${count} రాబోయే డాక్టర్ అపాయింట్‌మెంట్లు ఉన్నాయి. వివరాలను స్క్రీన్‌పై చూపించాను.`,
      appointmentsTitle: (count) => `📅 <strong>రాబోయే అపాయింట్‌మెంట్లు (${count})</strong>:`,
      prescriptionsSpeech: (count) => `మీకు ${count} క్రియాశీల డిజిటల్ ప్రిస్క్రిప్షన్లు ఉన్నాయి. వివరాలు స్క్రీన్‌పై ఉన్నాయి.`,
      prescriptionsTitle: '💊 <strong>క్రియాశీల ప్రిస్క్రిప్షన్లు & మెడికల్ రికార్డులు</strong>:',
      schemesSpeech: 'ఆయుష్మాన్ భారత్ పీఎం-జేవై పథకం ద్వారా ప్రతి కుటుంబానికి సంవత్సరానికి ₹5 లక్షల ఉచిత నగదు రహిత వైద్యం లభిస్తుంది.',
      schemesTitle: '🏛️ <strong>ఆయుష్మాన్ భారత్ పీఎం-జేవై & ఆరోగ్యశ్రీ</strong>',
      schemesDesc: 'నెట్‌వర్క్ ఆసుపత్రులలో ప్రతి కుటుంబానికి సంవత్సరానికి ₹5,00,000 ఉచిత నగదు రహిత వైద్య చికిత్స అందిస్తుంది.',
      quickPrompts: [
        'నా దగ్గరలో ఆసుపత్రిని కనుగొను',
        'నా దగ్గరలో ఉన్న ప్రభుత్వ ఆసుపత్రులను చూపించు',
        'దగ్గరలో PHC ఉందా?',
        'నా దగ్గరలో ఫార్మసీ కనుగొను',
        'నాకు దగ్గరలో ఎమర్జెన్సీ ఆసుపత్రి కావాలి',
        'నా అపాయింట్‌మెంట్లు చూపించు',
        'నా ప్రిస్క్రిప్షన్లు చూపించు',
        'ఆయుష్మాన్ భారత్ పథకం వివరాలు',
        'ఆసుపత్రి వివరాలు వాట్సాప్‌కి పంపు'
      ]
    },
    'hi-IN': {
      code: 'hi-IN',
      short: 'hi',
      name: 'हिन्दी (Hindi)',
      label: 'हिन्दी',
      nativeLabel: 'हिन्दी (Hindi)',
      tapToSpeak: 'बोलने के लिए माइक दबाएं',
      statusReady: 'तैयार (बोलने के लिए माइक दबाएं)',
      statusListening: 'सुन रहा हूँ... (हिंदी में बोलें)',
      statusProcessing: 'आपके अनुरोध पर काम हो रहा है...',
      statusSpeaking: 'बोल रहा हूँ...',
      greeting: 'नमस्ते! मैं <strong>स्वास्थ्यकनेक्ट वॉयस AI</strong> हूँ। मैं आपकी क्या मदद कर सकता हूँ?',
      greetingSpeech: 'नमस्ते! मैं आपका स्वास्थ्यकनेक्ट वॉयस असिस्टेंट हूँ। मैं अस्पताल खोजने, अपॉइंटमेंट, पर्चे या सरकारी योजनाओं में आपकी क्या मदद कर सकता हूँ?',
      locating: 'आपका सटीक जीपीएस स्थान प्राप्त किया जा रहा है...',
      locDenied: 'स्थान अनुमति नहीं मिली। कृपया शहर या पिन कोड बोलें या टाइप करें।',
      micDenied: 'माइक्रोफ़ोन अनुमति नहीं दी गई। कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन चालू करें।',
      unsupported: 'इस ब्राउज़र में वॉयस इनपुट समर्थित नहीं है। कृपया Google Chrome या Android का उपयोग करें।',
      noVoiceWarning: 'Hindi voice is not available on this device/browser. Please try Chrome on Android or enable Hindi speech services.',
      searchingHealthcare: 'मैं आपके पास सरकारी और निजी अस्पताल खोज रहा हूँ...',
      foundFacilitiesSpeech: (count, name, dist) => `मुझे आपके पास ${count} स्वास्थ्य केंद्र मिले हैं। सबसे नजदीकी ${name} है, जो लगभग ${dist} की दूरी पर है।`,
      foundFacilitiesText: (count, radius) => `आपके पास <strong>${count}</strong> स्वास्थ्य केंद्र मिले (${radius} किमी के दायरे में):`,
      noFacilitiesFound: (radius) => `${radius} किमी के भीतर कोई स्वास्थ्य केंद्र नहीं मिला। खोज का दायरा बढ़ाएं।`,
      emergencyTitle: '🚨 आपातकालीन चिकित्सा सहायता (108 डायल करें)',
      emergencySpeech: 'यदि कोई आपात स्थिति है, तो कृपया तुरंत 108 डायल करें। मैंने नजदीकी ट्रॉमा अस्पताल स्क्रीन पर दिखा दिए हैं।',
      emergencyText: 'तत्काल 24x7 राष्ट्रीय एम्बुलेंस सेवा एवं हेल्पलाइन:',
      whatsAppPreparedSpeech: (name) => `मैंने ${name} के लिए व्हाट्सएप संदेश तैयार कर दिया है। भेजने से पहले देखने के लिए बटन दबाएं।`,
      whatsAppPreparedText: (name) => `भेजने से पहले <strong>${name}</strong> अस्पताल के विवरण की समीक्षा करें:`,
      whatsAppNoHospital: 'व्हाट्सएप पर भेजने के लिए अस्पताल के विवरण उपलब्ध नहीं हैं। पहले नजदीकी अस्पताल खोजें।',
      appointmentsSpeech: (count) => `आपके पास ${count} आगामी डॉक्टर अपॉइंटमेंट हैं। विवरण स्क्रीन पर उपलब्ध हैं।`,
      appointmentsTitle: (count) => `📅 <strong>आगामी अपॉइंटमेंट (${count})</strong>:`,
      prescriptionsSpeech: (count) => `आपके पास ${count} सक्रिय डिजिटल पर्चे उपलब्ध हैं।`,
      prescriptionsTitle: '💊 <strong>सक्रिय पर्चे एवं मेडिकल रिकॉर्ड</strong>:',
      schemesSpeech: 'आयुष्मान भारत योजना के तहत प्रति वर्ष प्रति परिवार ₹5 लाख तक का मुफ्त इलाज मिलता है।',
      schemesTitle: '🏛️ <strong>आयुष्मान भारत पीएम-जय (PM-JAY)</strong>',
      schemesDesc: 'सूचीबद्ध अस्पतालों में प्रति परिवार प्रति वर्ष ₹5,00,000 का मुफ्त कैशलेस इलाज प्रदान करती है।',
      quickPrompts: [
        'मेरे पास अस्पताल खोजो',
        'मेरे पास सरकारी अस्पताल खोजो',
        'मेरे पास PHC खोजो',
        'पास में फार्मेसी खोजो',
        'मेरे पास आपातकालीन अस्पताल खोजो',
        'मेरे अपॉइंटमेंट दिखाओ',
        'मेरे पर्चे दिखाओ',
        'आयुष्मान भारत योजना की जानकारी',
        'अस्पताल व्हाट्सएप पर भेजो'
      ]
    }
  };

  // Helper to get active configuration safely
  function getLangConfig(lang = null) {
    const key = normalizeLanguage(lang || selectedLanguage);
    return langConfig[key] || langConfig['en-IN'];
  }

  // Load and cache available voices from SpeechSynthesis
  function loadAvailableVoices() {
    if (!isSynthesisSupported) return [];
    try {
      availableVoices = window.speechSynthesis.getVoices() || [];
    } catch (e) {
      availableVoices = [];
    }
    updateDebugInfo();
    return availableVoices;
  }

  if (isSynthesisSupported) {
    window.speechSynthesis.onvoiceschanged = () => {
      loadAvailableVoices();
    };
    loadAvailableVoices();
  }

  /**
   * Precise Voice Finder for Selected Language
   * For Telugu: voice.lang starts with "te" (e.g., te-IN)
   * For Hindi: voice.lang starts with "hi" (e.g., hi-IN)
   * For English: prefer "en-IN" (e.g., en-IN, Google Indian English)
   */
  function getVoiceForLanguage(langKey = null) {
    if (!isSynthesisSupported) return null;
    const norm = normalizeLanguage(langKey || selectedLanguage);
    const voices = availableVoices.length > 0 ? availableVoices : loadAvailableVoices();
    if (!voices || voices.length === 0) return null;

    if (norm === 'te-IN') {
      return voices.find(v => {
        const vl = (v.lang || '').toLowerCase().replace(/_/g, '-');
        const vn = (v.name || '').toLowerCase();
        return vl.startsWith('te') || vl.includes('te-') || vl.includes('telugu') || vn.includes('telugu');
      }) || null;
    }

    if (norm === 'hi-IN') {
      return voices.find(v => {
        const vl = (v.lang || '').toLowerCase().replace(/_/g, '-');
        const vn = (v.name || '').toLowerCase();
        return vl.startsWith('hi') || vl.includes('hi-') || vl.includes('hindi') ||
               vn.includes('hindi') || vn.includes('lekhraj') || vn.includes('swara') ||
               vn.includes('madhur') || vn.includes('kalpana');
      }) || null;
    }

    // Default English - prefer en-IN (Indian English)
    const indianVoice = voices.find(v => {
      const vl = (v.lang || '').toLowerCase().replace(/_/g, '-');
      const vn = (v.name || '').toLowerCase();
      return vl === 'en-in' || vl.startsWith('en-in') || vn.includes('india') || vn.includes('prabhat') || vn.includes('veena') || vn.includes('neerja');
    });

    if (indianVoice) return indianVoice;

    // Fallback to standard English voices
    return voices.find(v => (v.lang || '').toLowerCase().startsWith('en')) || voices[0] || null;
  }

  /**
   * Re-create and configure Speech Recognition instance for the active language
   */
  function initSpeechRecognition() {
    if (!isSpeechSupported) return null;

    try {
      if (recognition) {
        try {
          recognition.onstart = null;
          recognition.onresult = null;
          recognition.onerror = null;
          recognition.onend = null;
          recognition.abort();
        } catch (e) {}
        recognition = null;
      }

      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true; // Live interim transcription
      recognition.maxAlternatives = 1;

      // Dynamically set language code to selectedLanguage ('en-IN', 'te-IN', 'hi-IN')
      recognition.lang = selectedLanguage;

      recognition.onstart = () => {
        isListening = true;
        updateUIState('listening');
        updateDebugInfo();
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            currentInterim += item[0].transcript;
          }
        }

        // Live interim text display in status bar
        if (currentInterim && !finalTranscript) {
          const statusText = document.getElementById('va-status-text');
          if (statusText) {
            statusText.innerHTML = `<span class="pulse-dot" style="background:#ef4444;"></span> <em>"${escapeHTML(currentInterim)}"</em>`;
          }
        }

        if (finalTranscript && finalTranscript.trim()) {
          isListening = false;
          handleVoiceQuery(finalTranscript.trim());
        }
      };

      recognition.onerror = (event) => {
        isListening = false;
        console.warn('Speech recognition error:', event.error);
        const cfg = getLangConfig();

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          appendMessage('bot', cfg.micDenied);
          speakResponse(cfg.micDenied, selectedLanguage);
        } else if (event.error === 'language-not-supported') {
          appendMessage('bot', cfg.unsupported);
        }
        updateUIState('idle');
        updateDebugInfo();
      };

      recognition.onend = () => {
        isListening = false;
        if (!isSpeaking && !isProcessing) {
          updateUIState('idle');
        }
        updateDebugInfo();
      };

      return recognition;
    } catch (e) {
      console.error('Error creating SpeechRecognition instance:', e);
      return null;
    }
  }

  // Start Voice Listening
  function startListening() {
    const cfg = getLangConfig();
    if (!isSpeechSupported) {
      appendMessage('bot', cfg.unsupported);
      return;
    }

    stopSpeaking();
    initSpeechRecognition();

    if (recognition) {
      try {
        recognition.start();
      } catch (err) {
        try {
          recognition.abort();
          setTimeout(() => {
            if (recognition) recognition.start();
          }, 150);
        } catch (e) {}
      }
    }
  }

  // Stop Voice Listening
  function stopListening() {
    if (recognition && isListening) {
      try { recognition.stop(); } catch (e) {}
    }
    isListening = false;
    updateUIState('idle');
  }

  // Toggle listening state
  function toggleListening() {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  /**
   * Speak Response Function (Text-To-Speech)
   * Exact matching language codes (en-IN, te-IN, hi-IN) with fallback warning
   */
  function speakResponse(text, language = null) {
    if (!isSynthesisSupported || !text) return;

    const targetLang = normalizeLanguage(language || selectedLanguage);
    const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    if (!cleanText) return;

    window.speechSynthesis.cancel();

    // Check voice support for Telugu or Hindi
    const matchedVoice = getVoiceForLanguage(targetLang);

    if (targetLang === 'te-IN' && !matchedVoice) {
      const warnMsg = langConfig['te-IN'].noVoiceWarning;
      console.warn('Telugu voice not available in current browser engine:', warnMsg);
      appendVoiceNotice(warnMsg);
      updateUIState('idle');
      return; // DO NOT silently speak Telugu using an English voice
    }

    if (targetLang === 'hi-IN' && !matchedVoice) {
      const warnMsg = langConfig['hi-IN'].noVoiceWarning;
      console.warn('Hindi voice not available in current browser engine:', warnMsg);
      appendVoiceNotice(warnMsg);
      updateUIState('idle');
      return; // DO NOT silently speak Hindi using an English voice
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = targetLang; // Exact language (en-IN, te-IN, hi-IN)
    utterance.rate = targetLang === 'en-IN' ? 0.95 : 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      isSpeaking = true;
      updateUIState('speaking');
      updateDebugInfo();
    };

    utterance.onend = () => {
      isSpeaking = false;
      updateUIState('idle');
      updateDebugInfo();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      isSpeaking = false;
      updateUIState('idle');
      updateDebugInfo();
    };

    window.speechSynthesis.speak(utterance);
  }

  // Alias for backward compatibility
  const speakText = speakResponse;

  // Stop Speaking
  function stopSpeaking() {
    if (isSynthesisSupported) {
      window.speechSynthesis.cancel();
    }
    isSpeaking = false;
    if (!isListening) {
      updateUIState('idle');
    }
    updateDebugInfo();
  }

  // Notice helper for missing speech synthesis voice
  function appendVoiceNotice(notice) {
    const stream = document.getElementById('va-chat-stream');
    if (!stream) return;
    const el = document.createElement('div');
    el.className = 'va-voice-notice';
    el.innerHTML = `⚠️ <small>${escapeHTML(notice)}</small>`;
    stream.appendChild(el);
    stream.scrollTop = stream.scrollHeight;
  }

  /**
   * Core Multilingual Voice AI NLP Engine
   * Generates AI Responses in the currently selected language
   */
  async function handleVoiceQuery(query) {
    if (!query) return;

    // Display user question
    appendMessage('user', query);
    updateUIState('processing');
    isProcessing = true;

    const lower = query.toLowerCase().trim();
    const cfg = getLangConfig();

    // 1. EMERGENCY COMMANDS (108 / Ambulance / SOS)
    if (
      lower.includes('emergency') || lower.includes('ambulance') || lower.includes('108') ||
      lower.includes('ఆపద') || lower.includes('అత్యవసరం') || lower.includes('ఎమర్జెన్సీ') ||
      lower.includes('ఆసుపత్రి కావాలి') || lower.includes('కాపాడండి') ||
      lower.includes('आपातकालीन') || lower.includes('इमरजेंसी') || lower.includes('एंबुलेंस') ||
      lower.includes('मदद') || lower.includes('बचाओ')
    ) {
      isProcessing = false;
      const html = `
        <div class="va-emergency-card" style="padding:0.75rem; background:rgba(239, 68, 68, 0.08); border:1px solid rgba(239, 68, 68, 0.3); border-radius:var(--radius-sm);">
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">
            <span style="font-size:1.5rem;">🚨</span>
            <strong style="color:var(--hospital-cross-red, #dc2626); font-size:1.05rem;">${cfg.emergencyTitle}</strong>
          </div>
          <p style="margin:0 0 0.75rem 0; font-size:0.875rem;">${cfg.emergencyText}</p>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:0.75rem;">
            <a href="tel:108" class="btn btn-danger btn-sm" style="flex:1; text-align:center; font-weight:700; font-size:0.95rem; background:#dc2626; color:#ffffff; padding:0.4rem;">
              📞 108 (Ambulance)
            </a>
            <a href="tel:104" class="btn btn-outline btn-sm" style="flex:1; text-align:center; font-weight:700; padding:0.4rem;">
              📞 104 (Helpline)
            </a>
          </div>
          <button class="btn btn-sm btn-primary" style="width:100%;" onclick="if(typeof PulseCareUI !== 'undefined') PulseCareUI.switchTab('emergency');">
            🏥 Emergency SOS / Trauma Center
          </button>
        </div>
      `;
      appendMessage('bot', html);
      speakResponse(cfg.emergencySpeech, selectedLanguage);
      return;
    }

    // 2. WHATSAPP SHARING
    if (
      lower.includes('whatsapp') || lower.includes('व्हाट्सएप') || lower.includes('వాట్సాప్') ||
      (lower.includes('send') && (lower.includes('hospital') || lower.includes('centre'))) ||
      lower.includes('వాట్సాప్‌కి పంపు') || lower.includes('వాట్సాప్ లో పంపు') ||
      lower.includes('व्हाट्सएप पर भेजो') || lower.includes('व्हाट्सएप संदेश')
    ) {
      await handleWhatsAppVoiceShare();
      return;
    }

    // 3. APPOINTMENTS
    if (
      lower.includes('appointment') || lower.includes('अपॉइंटमेंट') || lower.includes('अप्वाइंटमेंट') ||
      lower.includes('అపాయింట్') || lower.includes('అపాయింట్‌మెంట్') || lower.includes('డాక్టర్') ||
      lower.includes('doctor') || lower.includes('डॉक्टर')
    ) {
      isProcessing = false;
      const appointments = typeof PulseCareStore !== 'undefined' ? PulseCareStore.getAppointments() : [];
      const upcoming = appointments.filter(a => a.status === 'Upcoming' || a.status === 'Confirmed');

      let html = `<div style="font-size:0.9rem; margin-bottom:0.5rem;">${cfg.appointmentsTitle(upcoming.length)}</div>`;
      if (upcoming.length > 0) {
        html += `<div style="display:flex; flex-direction:column; gap:0.5rem;">`;
        upcoming.slice(0, 3).forEach(apt => {
          html += `
            <div style="padding:0.6rem; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border-light); font-size:0.85rem;">
              <strong>👨‍⚕️ ${apt.doctorName || 'Doctor'}</strong> (${apt.specialty || 'General'})<br>
              <span style="color:var(--text-muted);">🗓️ ${apt.date} at ${apt.time || '10:00 AM'} &bull; ${apt.type || 'In-Person'}</span>
            </div>
          `;
        });
        html += `</div>`;
        html += `<button class="btn btn-sm btn-primary" style="width:100%; margin-top:0.6rem;" onclick="if(typeof PulseCareUI !== 'undefined') PulseCareUI.switchTab('appointments');">View All Appointments</button>`;
      } else {
        const noAptText = selectedLanguage === 'te-IN' ? 'ప్రస్తుతం రాబోయే అపాయింట్‌మెంట్లు ఏవీ లేవు.' :
                          selectedLanguage === 'hi-IN' ? 'वर्तमान में कोई आगामी अपॉइंटमेंट नहीं है।' :
                          'No upcoming appointments found.';
        html += `<p style="font-size:0.85rem; color:var(--text-muted);">${noAptText}</p>`;
        html += `<button class="btn btn-sm btn-primary" style="width:100%;" onclick="if(typeof PulseCareUI !== 'undefined') PulseCareUI.openModal('book-apt-modal');">Book New Visit</button>`;
      }

      appendMessage('bot', html);
      speakResponse(cfg.appointmentsSpeech(upcoming.length), selectedLanguage);
      return;
    }

    // 4. PRESCRIPTIONS & MEDICAL RECORDS
    if (
      lower.includes('prescription') || lower.includes('medicine') || lower.includes('medication') ||
      lower.includes('record') || lower.includes('पर्चे') || lower.includes('दवा') || lower.includes('दवाई') ||
      lower.includes('మందులు') || lower.includes('ప్రిస్క్రిప్షన్') || lower.includes('రికార్డు') ||
      lower.includes('రిపోర్ట్') || lower.includes('रिपोर्ट')
    ) {
      isProcessing = false;
      const prescriptions = typeof PulseCareStore !== 'undefined' ? PulseCareStore.getPrescriptions() : [];
      let html = `<div style="font-size:0.9rem; margin-bottom:0.5rem;">${cfg.prescriptionsTitle}</div>`;
      if (prescriptions.length > 0) {
        html += `<div style="display:flex; flex-direction:column; gap:0.5rem;">`;
        prescriptions.slice(0, 2).forEach(p => {
          html += `
            <div style="padding:0.6rem; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border-light); font-size:0.85rem;">
              <strong>Rx by ${p.doctorName || 'Doctor'}</strong> (${p.date})<br>
              <span style="color:var(--text-muted); font-size:0.8rem;">Diagnosis: ${p.diagnosis || 'General Checkup'}</span><br>
              <span style="color:var(--hospital-teal-700, #0d9488); font-weight:600; font-size:0.8rem;">Rx: ${p.medications ? p.medications.map(m => m.name || m).join(', ') : 'Paracetamol, Multivitamin'}</span>
            </div>
          `;
        });
        html += `</div>`;
        html += `<button class="btn btn-sm btn-primary" style="width:100%; margin-top:0.6rem;" onclick="if(typeof PulseCareUI !== 'undefined') PulseCareUI.switchTab('records');">View All Records</button>`;
      } else {
        const noRxText = selectedLanguage === 'te-IN' ? 'యాక్టివ్ ప్రిస్క్రిప్షన్లు ఏవీ కనిపించలేదు.' :
                         selectedLanguage === 'hi-IN' ? 'कोई सक्रिय डिजिटल पर्चा नहीं मिला।' :
                         'No active prescriptions found.';
        html += `<p style="font-size:0.85rem; color:var(--text-muted);">${noRxText}</p>`;
        html += `<button class="btn btn-sm btn-primary" style="width:100%;" onclick="if(typeof PulseCareUI !== 'undefined') PulseCareUI.switchTab('records');">Open Records</button>`;
      }

      appendMessage('bot', html);
      speakResponse(cfg.prescriptionsSpeech(prescriptions.length), selectedLanguage);
      return;
    }

    // 5. GOVERNMENT HEALTH SCHEMES (Ayushman Bharat PM-JAY & Aarogyasri)
    if (
      lower.includes('scheme') || lower.includes('ayushman') || lower.includes('pmjay') || lower.includes('pm-jay') ||
      lower.includes('పథకం') || lower.includes('యोजना') || lower.includes('योजना') || lower.includes('aarogyasri') ||
      lower.includes('ఆరోగ్యశ్రీ') || lower.includes('aushadhi') || lower.includes('భారత్') || lower.includes('आयुष्मान')
    ) {
      isProcessing = false;
      const html = `
        <div class="va-scheme-card" style="padding:0.75rem; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border-light);">
          <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.4rem;">
            <span style="font-size:1.3rem;">🏛️</span>
            <strong style="color:var(--hospital-teal-800, #115e59); font-size:0.95rem;">${cfg.schemesTitle}</strong>
          </div>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin:0 0 0.6rem 0;">
            ${cfg.schemesDesc}
          </p>
          <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
            <button class="btn btn-sm btn-primary" style="flex:1;" onclick="if(typeof PulseCareUI !== 'undefined') PulseCareUI.switchTab('schemes');">
              Check Eligibility
            </button>
            <a href="https://pmjay.gov.in" target="_blank" rel="noopener" class="btn btn-sm btn-outline" style="flex:1; text-align:center;">
              Official Portal ↗
            </a>
          </div>
        </div>
      `;
      appendMessage('bot', html);
      speakResponse(cfg.schemesSpeech, selectedLanguage);
      return;
    }

    // 6. HEALTHCARE FACILITIES DISCOVERY (DEFAULT INTENT)
    let category = 'All';
    if (lower.includes('government') || lower.includes('सरकारी') || lower.includes('ప్రభుత్వ') || lower.includes('goverment')) {
      category = 'Government Hospitals';
    } else if (lower.includes('phc') || lower.includes('primary') || lower.includes('प्राथमिक') || lower.includes('ప్రాథమిక') || lower.includes('పీహెచ్‌సీ')) {
      category = 'PHC (Primary Health)';
    } else if (lower.includes('chc') || lower.includes('community') || lower.includes('सामुदायिक') || lower.includes('కమ్యూనిటీ')) {
      category = 'CHC (Community Health)';
    } else if (lower.includes('pharmacy') || lower.includes('chemist') || lower.includes('दवा') || lower.includes('దవా') || lower.includes('మందుల') || lower.includes('ఫార్మసీ')) {
      category = 'Pharmacies & Jan Aushadhi';
    } else if (lower.includes('diagnostic') || lower.includes('lab') || lower.includes('test') || lower.includes('परीक्षण') || lower.includes('టెస్ట్') || lower.includes('ల్యాబ్')) {
      category = 'Diagnostic Labs';
    } else if (lower.includes('clinic') || lower.includes('क्लिनिक') || lower.includes('క్లినిక్')) {
      category = 'Clinics & Dispensaries';
    }

    let radius = 5;
    const matchKm = lower.match(/(\d+)\s*(km|kilometre|kilometer|किमी|కిమీ)/);
    if (matchKm && matchKm[1]) {
      radius = parseInt(matchKm[1], 10);
    }

    await executeVoiceHealthcareSearch(category, radius, query);
  }

  /**
   * Execute Real GPS Healthcare Search for Voice AI
   */
  async function executeVoiceHealthcareSearch(category = 'All', radius = 5, userQuery = '') {
    const cfg = getLangConfig();

    if (!patientCoords) {
      appendMessage('bot', `<p style="margin:0; font-size:0.875rem;">📡 <em>${cfg.locating}</em></p>`);
      try {
        await obtainGPSCoordinates();
      } catch (err) {
        isProcessing = false;
        appendMessage('bot', `
          <div style="font-size:0.85rem;">
            <p style="margin:0 0 0.5rem 0;">⚠️ ${cfg.locDenied}</p>
            <div style="display:flex; gap:0.4rem;">
              <input type="text" id="va-manual-loc-input" placeholder="e.g., Hyderabad, 500001" style="flex:1; padding:0.4rem 0.6rem; font-size:0.85rem; border-radius:var(--radius-xs); border:1px solid var(--border-light); background:var(--bg-input); color:var(--text-primary);">
              <button class="btn btn-sm btn-primary" onclick="SwasthyaVoiceAssistant.submitManualLocation()">Search</button>
            </div>
          </div>
        `);
        speakResponse(cfg.locDenied, selectedLanguage);
        updateUIState('idle');
        return;
      }
    }

    let results = [];
    if (typeof PlacesHealthService !== 'undefined' && typeof PlacesHealthService.fetchNearbyFacilities === 'function') {
      results = await PlacesHealthService.fetchNearbyFacilities(
        patientCoords.lat,
        patientCoords.lng,
        radius,
        category,
        userQuery
      );
    }

    isProcessing = false;

    if (!results || results.length === 0) {
      const noResultsText = cfg.noFacilitiesFound(radius);
      appendMessage('bot', `<p style="margin:0; font-size:0.875rem;">🏥 ${noResultsText}</p>`);
      speakResponse(noResultsText, selectedLanguage);
      updateUIState('idle');
      return;
    }

    const topFacility = results[0];
    const speechSummary = cfg.foundFacilitiesSpeech(results.length, topFacility.name, topFacility.distance);

    let html = `
      <div style="font-size:0.85rem; margin-bottom:0.5rem; color:var(--text-muted);">
        📍 ${cfg.foundFacilitiesText(results.length, radius)}
      </div>
      <div style="display:flex; flex-direction:column; gap:0.6rem; max-height:260px; overflow-y:auto; padding-right:4px;">
    `;

    results.slice(0, 3).forEach(fac => {
      html += `
        <div class="va-facility-card" style="padding:0.65rem; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border-light); box-shadow:var(--shadow-sm);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem; margin-bottom:0.3rem;">
            <strong style="font-size:0.9rem; color:var(--text-primary);">🏥 ${escapeHTML(fac.name)}</strong>
            <span class="badge badge-emerald" style="font-size:0.7rem; white-space:nowrap; background:#10b981; color:#fff; padding:2px 6px; border-radius:12px;">📍 ${fac.distance}</span>
          </div>
          <p style="font-size:0.775rem; color:var(--text-secondary); margin:0 0 0.35rem 0;">📌 ${escapeHTML(fac.location || fac.address || '')}</p>
          <div style="display:flex; gap:0.35rem; flex-wrap:wrap;">
            <a href="${fac.directionsUrl || '#'}" target="_blank" rel="noopener" class="btn btn-sm btn-outline" style="padding:0.2rem 0.5rem; font-size:0.75rem; flex:1; text-align:center;">
              🗺️ Directions
            </a>
            <button class="btn btn-sm btn-emerald" style="padding:0.2rem 0.5rem; font-size:0.75rem; background:#25d366; border-color:#25d366; color:#ffffff; font-weight:700; flex:1; display:flex; align-items:center; justify-content:center; gap:3px;" onclick="SwasthyaVoiceAssistant.shareFacilityToWhatsApp('${fac.id}')">
              <svg viewBox="0 0 24 24" style="width:12px; height:12px; fill:#ffffff;"><path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.275-.1-.475-.15-.675.15-.2.3-.776.979-.951 1.18-.175.2-.35.225-.651.075-.3-.15-1.267-.467-2.414-1.489-.893-.796-1.496-1.78-1.671-2.08-.175-.3-.019-.462.131-.611.136-.134.301-.35.451-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.585-.492-.505-.675-.514-.175-.009-.375-.009-.575-.009s-.525.075-.8.375c-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.115 3.23 5.124 4.53.716.31 1.275.495 1.71.634.72.229 1.375.197 1.892.12.576-.086 1.78-.727 2.03-1.429.25-.702.25-1.303.175-1.429-.075-.126-.275-.201-.576-.351zM12.004 2C6.48 2 2 6.48 2 12.004c0 1.947.558 3.766 1.523 5.309L2.1 21.9l4.747-1.397A9.954 9.954 0 0 0 12.004 22c5.524 0 10.004-4.48 10.004-10.004C22.008 6.48 17.528 2 12.004 2zm0 18.292c-1.644 0-3.173-.487-4.464-1.326l-.32-.208-2.82.83.844-2.738-.228-.337A8.257 8.257 0 0 1 3.712 12c0-4.572 3.72-8.292 8.292-8.292s8.292 3.72 8.292 8.292-3.72 8.292-8.292 8.292z"/></svg>
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      `;
    });

    html += `
      </div>
      <button class="btn btn-sm btn-outline" style="width:100%; margin-top:0.6rem;" onclick="if(typeof PulseCareUI !== 'undefined') PulseCareUI.switchTab('nearby');">
        🗺️ Open Nearby Map Tab
      </button>
    `;

    appendMessage('bot', html);
    speakResponse(speechSummary, selectedLanguage);
  }

  // Handle WhatsApp Voice Share
  async function handleWhatsAppVoiceShare(facilityId = null) {
    const cfg = getLangConfig();

    if (!patientCoords) {
      try { await obtainGPSCoordinates(); } catch (e) {}
    }

    let facilities = [];
    if (typeof PlacesHealthService !== 'undefined' && typeof PlacesHealthService.getSavedFacilities === 'function') {
      facilities = PlacesHealthService.getSavedFacilities();
    }

    if (!facilities || facilities.length === 0) {
      if (patientCoords && typeof PlacesHealthService !== 'undefined') {
        facilities = await PlacesHealthService.fetchNearbyFacilities(patientCoords.lat, patientCoords.lng, 5, 'All');
      }
    }

    let targetFac = null;
    if (facilityId && facilities && facilities.length > 0) {
      targetFac = facilities.find(f => f.id === facilityId);
    }
    if (!targetFac && facilities && facilities.length > 0) {
      targetFac = facilities[0];
    }

    isProcessing = false;

    if (!targetFac) {
      appendMessage('bot', cfg.whatsAppNoHospital);
      speakResponse(cfg.whatsAppNoHospital, selectedLanguage);
      return;
    }

    const message = `*SwasthyaConnect Healthcare Facility*%0A%0A*Name:* ${encodeURIComponent(targetFac.name)}%0A*Type:* ${encodeURIComponent(targetFac.type || 'Healthcare')}%0A*Distance:* ${encodeURIComponent(targetFac.distance || 'Nearby')}%0A*Address:* ${encodeURIComponent(targetFac.location || targetFac.address || '')}%0A*Directions:* ${encodeURIComponent(targetFac.directionsUrl || '')}%0A%0A_Sent via SwasthyaConnect AI Voice Assistant_`;
    const waUrl = `https://api.whatsapp.com/send?text=${message}`;

    const html = `
      <div style="padding:0.75rem; background:rgba(37, 211, 102, 0.08); border:1px solid rgba(37, 211, 102, 0.3); border-radius:var(--radius-sm); font-size:0.85rem;">
        <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.4rem;">
          <svg viewBox="0 0 24 24" style="width:18px; height:18px; fill:#25d366;"><path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.275-.1-.475-.15-.675.15-.2.3-.776.979-.951 1.18-.175.2-.35.225-.651.075-.3-.15-1.267-.467-2.414-1.489-.893-.796-1.496-1.78-1.671-2.08-.175-.3-.019-.462.131-.611.136-.134.301-.35.451-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.585-.492-.505-.675-.514-.175-.009-.375-.009-.575-.009s-.525.075-.8.375c-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.115 3.23 5.124 4.53.716.31 1.275.495 1.71.634.72.229 1.375.197 1.892.12.576-.086 1.78-.727 2.03-1.429.25-.702.25-1.303.175-1.429-.075-.126-.275-.201-.576-.351zM12.004 2C6.48 2 2 6.48 2 12.004c0 1.947.558 3.766 1.523 5.309L2.1 21.9l4.747-1.397A9.954 9.954 0 0 0 12.004 22c5.524 0 10.004-4.48 10.004-10.004C22.008 6.48 17.528 2 12.004 2zm0 18.292c-1.644 0-3.173-.487-4.464-1.326l-.32-.208-2.82.83.844-2.738-.228-.337A8.257 8.257 0 0 1 3.712 12c0-4.572 3.72-8.292 8.292-8.292s8.292 3.72 8.292 8.292-3.72 8.292-8.292 8.292z"/></svg>
          <strong style="color:#075e54;">WhatsApp Message Ready</strong>
        </div>
        <p style="margin:0 0 0.5rem 0; color:var(--text-secondary);">
          ${cfg.whatsAppPreparedText(targetFac.name)}
        </p>
        <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-emerald" style="width:100%; text-align:center; background:#25d366; border-color:#25d366; color:#ffffff; font-weight:700; display:block; padding:0.4rem;">
          📱 Open WhatsApp & Review
        </a>
      </div>
    `;

    appendMessage('bot', html);
    speakResponse(cfg.whatsAppPreparedSpeech(targetFac.name), selectedLanguage);
  }

  // Obtain Real Browser GPS Coordinates
  function obtainGPSCoordinates() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          patientCoords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy || 10)
          };
          resolve(patientCoords);
        },
        (err) => {
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }

  // Manual Location Submission
  async function submitManualLocation(val) {
    const input = document.getElementById('va-manual-loc-input');
    const locationQuery = val || (input ? input.value.trim() : '');
    if (!locationQuery) return;

    appendMessage('user', `Location: ${locationQuery}`);
    updateUIState('processing');

    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}&countrycodes=in&limit=1`, {
        headers: { 'Accept': 'application/json' }
      });
      const data = await resp.json();
      if (data && data.length > 0) {
        patientCoords = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          accuracy: 50
        };
        await executeVoiceHealthcareSearch('All', 5, locationQuery);
      } else {
        appendMessage('bot', `Could not find "${locationQuery}". Searching nearest healthcare...`);
        updateUIState('idle');
      }
    } catch (e) {
      appendMessage('bot', `Failed to locate area.`);
      updateUIState('idle');
    }
  }

  // Append Chat Message Row
  function appendMessage(sender, contentHtml) {
    const stream = document.getElementById('va-chat-stream');
    if (!stream) return;

    const row = document.createElement('div');
    row.className = `va-chat-row ${sender === 'user' ? 'va-row-user' : 'va-row-bot'}`;
    const cfg = getLangConfig();

    if (sender === 'user') {
      row.innerHTML = `
        <div class="va-bubble va-bubble-user">
          <span style="font-size:0.75rem; color:rgba(255,255,255,0.8); display:block; margin-bottom:2px; font-weight:600;">You (${cfg.label}):</span>
          <div>${escapeHTML(contentHtml)}</div>
        </div>
      `;
    } else {
      row.innerHTML = `
        <div class="va-bubble va-bubble-bot">
          <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:4px;">
            <span style="font-size:0.9rem;">🤖</span>
            <strong style="font-size:0.8rem; color:var(--hospital-teal-700, #0d9488);">SwasthyaConnect Voice AI (${cfg.label})</strong>
          </div>
          <div class="va-bubble-content">${contentHtml}</div>
        </div>
      `;
    }

    stream.appendChild(row);
    stream.scrollTop = stream.scrollHeight;
  }

  // UI Status Indicator
  function updateUIState(state) {
    const statusText = document.getElementById('va-status-text');
    const micBtn = document.getElementById('va-main-mic-btn');
    const visualizer = document.getElementById('va-visualizer');
    const cfg = getLangConfig();

    if (!statusText || !micBtn) return;

    micBtn.classList.remove('state-listening', 'state-processing', 'state-speaking', 'state-idle');
    if (visualizer) visualizer.classList.remove('vis-active');

    if (state === 'listening') {
      statusText.innerHTML = `<span class="pulse-dot" style="background:#ef4444;"></span> ${cfg.statusListening}`;
      micBtn.classList.add('state-listening');
      if (visualizer) visualizer.classList.add('vis-active');
    } else if (state === 'processing') {
      statusText.innerHTML = `<span class="pulse-dot" style="background:#3b82f6;"></span> ${cfg.statusProcessing}`;
      micBtn.classList.add('state-processing');
    } else if (state === 'speaking') {
      statusText.innerHTML = `<span class="pulse-dot" style="background:#10b981;"></span> ${cfg.statusSpeaking}`;
      micBtn.classList.add('state-speaking');
      if (visualizer) visualizer.classList.add('vis-active');
    } else {
      statusText.innerHTML = `<span class="pulse-dot" style="background:#64748b;"></span> ${cfg.statusReady}`;
      micBtn.classList.add('state-idle');
    }
  }

  /**
   * Switch Language (Dynamic Language Switching Pipeline)
   * 1. Updates selectedLanguage state variable immediately ('en-IN', 'te-IN', 'hi-IN')
   * 2. Re-initializes SpeechRecognition object with recognition.lang = selectedLanguage
   * 3. Selects matching native TTS voice or fallback warning
   * 4. Updates quick prompts and greets user in new language
   */
  function setLanguage(lang, skipGlobalSync = false) {
    const normalized = normalizeLanguage(lang);
    selectedLanguage = normalized;

    // 1. Update Voice AI Dropdown UI
    const select = document.getElementById('va-lang-select');
    if (select && select.value !== normalized) {
      select.value = normalized;
    }

    // 2. Stop ongoing speech and active listening
    stopSpeaking();
    stopListening();

    // 3. Re-create / Reinitialize Speech Recognition instance with the new language
    initSpeechRecognition();

    // 4. Update Quick Prompts in the selected language
    renderQuickPrompts();
    updateUIState('idle');
    updateDebugInfo();

    // 5. Greet user in newly selected language
    const cfg = getLangConfig();
    appendMessage('bot', cfg.greeting);
    speakResponse(cfg.greetingSpeech, selectedLanguage);

    // 6. Sync with Global SwasthyaI18n to translate the ENTIRE page immediately
    if (!skipGlobalSync && typeof window.SwasthyaI18n !== 'undefined' && typeof window.SwasthyaI18n.setLanguage === 'function') {
      window.SwasthyaI18n.setLanguage(cfg.short, true);
    }
  }

  // Toggle Assistant Modal Window
  function toggleAssistant(shouldOpen = null) {
    const win = document.getElementById('swasthya-va-window');
    if (!win) return;

    isOpen = shouldOpen !== null ? shouldOpen : !isOpen;
    win.style.display = isOpen ? 'flex' : 'none';

    if (isOpen) {
      loadAvailableVoices();

      // Sync with global language switcher if present
      if (typeof window.SwasthyaI18n !== 'undefined' && typeof window.SwasthyaI18n.getLanguage === 'function') {
        const globalLang = window.SwasthyaI18n.getLanguage();
        if (globalLang) {
          const norm = normalizeLanguage(globalLang);
          if (norm !== selectedLanguage) {
            selectedLanguage = norm;
            const select = document.getElementById('va-lang-select');
            if (select) select.value = norm;
            initSpeechRecognition();
          }
        }
      }

      const stream = document.getElementById('va-chat-stream');
      if (stream && stream.children.length === 0) {
        const cfg = getLangConfig();
        appendMessage('bot', cfg.greeting);
        speakResponse(cfg.greetingSpeech, selectedLanguage);
      }

      renderQuickPrompts();
      updateUIState('idle');
      updateDebugInfo();
    } else {
      stopListening();
      stopSpeaking();
    }
  }

  // Render Quick Prompts Chips
  function renderQuickPrompts() {
    const container = document.getElementById('va-quick-prompts');
    if (!container) return;

    const cfg = getLangConfig();
    container.innerHTML = cfg.quickPrompts.map(p => `
      <button type="button" class="va-chip-btn" onclick="SwasthyaVoiceAssistant.handleVoiceQuery('${p.replace(/'/g, "\\'")}')">
        💬 "${escapeHTML(p)}"
      </button>
    `).join('');
  }

  // Toggle Debug Diagnostic Panel
  function toggleDebugPanel() {
    showDebugPanel = !showDebugPanel;
    const panel = document.getElementById('va-debug-panel');
    if (panel) {
      panel.style.display = showDebugPanel ? 'block' : 'none';
      if (showDebugPanel) updateDebugInfo();
    }
  }

  // Update Diagnostic Debug Info Section
  function updateDebugInfo() {
    const debugEl = document.getElementById('va-debug-content');
    if (!debugEl) return;

    const voices = availableVoices.length > 0 ? availableVoices : (isSynthesisSupported ? window.speechSynthesis.getVoices() : []);
    const selectedVoice = getVoiceForLanguage(selectedLanguage);
    const teVoices = voices.filter(v => (v.lang || '').toLowerCase().startsWith('te') || (v.name || '').toLowerCase().includes('telugu'));
    const hiVoices = voices.filter(v => (v.lang || '').toLowerCase().startsWith('hi') || (v.name || '').toLowerCase().includes('hindi'));
    const enVoices = voices.filter(v => (v.lang || '').toLowerCase().startsWith('en'));

    debugEl.innerHTML = `
      <div style="display:grid; grid-template-columns:auto 1fr; gap:3px 8px; font-family:monospace; font-size:0.75rem;">
        <strong>Selected language:</strong> <code>${selectedLanguage}</code> (${getLangConfig().name})
        <strong>Recognition language:</strong> <code>${recognition ? recognition.lang : selectedLanguage}</code>
        <strong>Speech recognition:</strong> <span>${isSpeechSupported ? '✅ Supported' : '❌ Unsupported'}</span>
        <strong>Speech synthesis:</strong> <span>${isSynthesisSupported ? '✅ Supported' : '❌ Unsupported'}</span>
        <strong>Available voices:</strong> <span>${voices.length} voice(s) loaded</span>
        <strong>Selected voice:</strong> <span>${selectedVoice ? `${selectedVoice.name} (${selectedVoice.lang})` : '<span style="color:#ef4444; font-weight:bold;">⚠️ None found for this language</span>'}</span>
        <strong>Telugu voices:</strong> <span>${teVoices.length > 0 ? teVoices.map(v => `${v.name}`).join(', ') : '⚠️ None'}</span>
        <strong>Hindi voices:</strong> <span>${hiVoices.length > 0 ? hiVoices.map(v => `${v.name}`).join(', ') : '⚠️ None'}</span>
        <strong>English voices:</strong> <span>${enVoices.length > 0 ? `${enVoices.length} found` : '⚠️ None'}</span>
      </div>
    `;
  }

  // Build Voice Assistant DOM UI
  function buildVoiceAssistantDOM() {
    // Only build once
    if (document.getElementById('swasthya-va-root')) return;

    const isPatientPage = window.location.pathname.endsWith('patient.html') || 
                          window.location.pathname.endsWith('/patient') ||
                          document.getElementById('patient-portal-body') ||
                          document.querySelector('.portal-sidebar [data-tab="nearby"]');

    if (!isPatientPage) return;

    // Styles
    const style = document.createElement('style');
    style.id = 'swasthya-va-styles';
    style.textContent = `
      .swasthya-va-launcher {
        position: fixed;
        bottom: 85px;
        right: 22px;
        z-index: 9998;
        background: linear-gradient(135deg, #0d9488 0%, #059669 100%);
        color: #ffffff;
        border: none;
        border-radius: 50px;
        padding: 0.75rem 1.15rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 700;
        font-size: 0.875rem;
        box-shadow: 0 8px 24px rgba(13, 148, 136, 0.35);
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .swasthya-va-launcher:hover {
        transform: translateY(-3px) scale(1.04);
        box-shadow: 0 12px 28px rgba(13, 148, 136, 0.45);
      }
      .va-pulse-ring {
        position: absolute;
        inset: -4px;
        border-radius: 50px;
        border: 2px solid #0d9488;
        animation: va-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        pointer-events: none;
      }
      @keyframes va-ping {
        75%, 100% { transform: scale(1.15, 1.3); opacity: 0; }
      }

      .swasthya-va-window {
        position: fixed;
        bottom: 150px;
        right: 22px;
        width: 395px;
        max-width: calc(100vw - 32px);
        height: 590px;
        max-height: calc(100vh - 180px);
        background: var(--bg-surface, #ffffff);
        border: 1px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-lg, 16px);
        box-shadow: 0 20px 48px rgba(0, 0, 0, 0.22);
        z-index: 9999;
        display: none;
        flex-direction: column;
        overflow: hidden;
        animation: va-slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes va-slide-up {
        from { opacity: 0; transform: translateY(20px) scale(0.96); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      .va-header {
        background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
        color: #ffffff;
        padding: 0.85rem 1.1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .va-header-title {
        font-weight: 700;
        font-size: 0.95rem;
        display: flex;
        align-items: center;
        gap: 0.45rem;
      }

      .va-lang-picker {
        background: rgba(255, 255, 255, 0.22);
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.45);
        border-radius: var(--radius-xs, 6px);
        padding: 4px 8px;
        font-size: 0.8rem;
        font-weight: 700;
        outline: none;
        cursor: pointer;
      }
      .va-lang-picker option {
        background: #ffffff;
        color: #1e293b;
        font-weight: 600;
      }

      .va-status-bar {
        background: var(--bg-surface-elevated, #f8fafc);
        padding: 0.45rem 1rem;
        border-bottom: 1px solid var(--border-light, #e2e8f0);
        font-size: 0.8rem;
        color: var(--text-secondary, #64748b);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .va-mic-area {
        background: linear-gradient(180deg, var(--bg-surface-elevated, #f8fafc) 0%, var(--bg-surface, #ffffff) 100%);
        padding: 1.15rem 1rem 0.65rem 1rem;
        text-align: center;
        border-bottom: 1px solid var(--border-light, #e2e8f0);
        position: relative;
      }
      .va-main-mic-btn {
        width: 68px;
        height: 68px;
        border-radius: 50%;
        border: none;
        background: linear-gradient(135deg, #0d9488 0%, #059669 100%);
        color: #ffffff;
        font-size: 1.6rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 6px 18px rgba(13, 148, 136, 0.4);
        transition: all 0.2s ease;
        position: relative;
      }
      .va-main-mic-btn:hover {
        transform: scale(1.08);
      }
      .va-main-mic-btn.state-listening {
        background: #ef4444;
        box-shadow: 0 0 0 8px rgba(239, 68, 68, 0.25), 0 0 0 16px rgba(239, 68, 68, 0.1);
        animation: va-pulse-red 1.2s infinite;
      }
      .va-main-mic-btn.state-speaking {
        background: #10b981;
        box-shadow: 0 0 0 8px rgba(16, 185, 129, 0.25);
      }
      .va-main-mic-btn.state-processing {
        background: #3b82f6;
        animation: va-spin 2s linear infinite;
      }
      @keyframes va-pulse-red {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      .va-visualizer {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 4px;
        height: 18px;
        margin-top: 0.6rem;
        opacity: 0.3;
        transition: opacity 0.2s ease;
      }
      .va-visualizer.vis-active {
        opacity: 1;
      }
      .va-vis-bar {
        width: 3.5px;
        height: 4px;
        background: var(--hospital-teal-600, #0d9488);
        border-radius: 3px;
        transition: height 0.1s ease;
      }
      .vis-active .va-vis-bar:nth-child(1) { animation: va-wave 0.8s ease-in-out infinite 0.1s; }
      .vis-active .va-vis-bar:nth-child(2) { animation: va-wave 0.8s ease-in-out infinite 0.2s; }
      .vis-active .va-vis-bar:nth-child(3) { animation: va-wave 0.8s ease-in-out infinite 0.3s; }
      .vis-active .va-vis-bar:nth-child(4) { animation: va-wave 0.8s ease-in-out infinite 0.4s; }
      .vis-active .va-vis-bar:nth-child(5) { animation: va-wave 0.8s ease-in-out infinite 0.2s; }
      @keyframes va-wave {
        0%, 100% { height: 4px; }
        50% { height: 16px; }
      }

      .va-chat-stream {
        flex: 1;
        overflow-y: auto;
        padding: 0.9rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        background: var(--bg-surface, #ffffff);
      }
      .va-chat-row {
        display: flex;
        width: 100%;
      }
      .va-row-user {
        justify-content: flex-end;
      }
      .va-row-bot {
        justify-content: flex-start;
      }
      .va-bubble {
        max-width: 88%;
        padding: 0.65rem 0.85rem;
        border-radius: var(--radius-md, 10px);
        font-size: 0.85rem;
        line-height: 1.4;
      }
      .va-bubble-user {
        background: linear-gradient(135deg, #0d9488 0%, #059669 100%);
        color: #ffffff;
        border-bottom-right-radius: 2px;
      }
      .va-bubble-bot {
        background: var(--bg-surface-elevated, #f8fafc);
        border: 1px solid var(--border-light, #e2e8f0);
        color: var(--text-primary, #1e293b);
        border-bottom-left-radius: 2px;
      }

      .va-voice-notice {
        padding: 0.5rem 0.75rem;
        background: rgba(245, 158, 11, 0.1);
        border: 1px solid rgba(245, 158, 11, 0.3);
        border-radius: var(--radius-xs, 6px);
        color: #b45309;
        font-size: 0.75rem;
        margin-top: 0.25rem;
      }

      .va-quick-prompts {
        display: flex;
        gap: 0.35rem;
        overflow-x: auto;
        padding: 0.5rem 0.9rem;
        background: var(--bg-surface-elevated, #f8fafc);
        border-top: 1px solid var(--border-light, #e2e8f0);
        white-space: nowrap;
      }
      .va-chip-btn {
        background: var(--bg-surface, #ffffff);
        border: 1px solid var(--border-light, #e2e8f0);
        color: var(--text-secondary, #64748b);
        font-size: 0.75rem;
        padding: 0.25rem 0.6rem;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .va-chip-btn:hover {
        background: var(--hospital-teal-600, #0d9488);
        color: #ffffff;
        border-color: var(--hospital-teal-600, #0d9488);
      }

      .va-input-bar {
        padding: 0.6rem 0.9rem;
        background: var(--bg-surface, #ffffff);
        border-top: 1px solid var(--border-light, #e2e8f0);
        display: flex;
        gap: 0.4rem;
      }
      .va-input-field {
        flex: 1;
        padding: 0.45rem 0.75rem;
        border-radius: var(--radius-sm, 8px);
        border: 1px solid var(--border-light, #e2e8f0);
        background: var(--bg-input, #ffffff);
        color: var(--text-primary, #1e293b);
        font-size: 0.85rem;
        outline: none;
      }
      .va-input-field:focus {
        border-color: var(--hospital-teal-600, #0d9488);
      }

      .va-debug-panel {
        background: var(--bg-surface-elevated, #f1f5f9);
        border-top: 1px dashed var(--border-light, #cbd5e1);
        padding: 0.6rem 0.9rem;
        font-size: 0.7rem;
        color: var(--text-muted, #475569);
        line-height: 1.5;
        max-height: 140px;
        overflow-y: auto;
      }
    `;

    document.head.appendChild(style);

    // DOM Root
    const wrap = document.createElement('div');
    wrap.id = 'swasthya-va-root';
    wrap.innerHTML = `
      <!-- Floating Voice Assistant Launcher -->
      <button id="swasthya-va-launcher" class="swasthya-va-launcher" title="Open SwasthyaConnect AI Voice Assistant" onclick="SwasthyaVoiceAssistant.toggleAssistant()">
        <span class="va-pulse-ring"></span>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
        <span>Voice AI</span>
      </button>

      <!-- Voice Assistant Window -->
      <div id="swasthya-va-window" class="swasthya-va-window">
        
        <!-- Header -->
        <div class="va-header">
          <div class="va-header-title">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
            <span>Voice AI</span>
          </div>

          <div style="display:flex; align-items:center; gap:0.4rem;">
            <!-- Language Selector: English, Telugu, Hindi -->
            <select id="va-lang-select" class="va-lang-picker" onchange="SwasthyaVoiceAssistant.setLanguage(this.value)" aria-label="Select Voice Language" title="🌐 Select Voice Language">
              <option value="en-IN">🌐 English</option>
              <option value="te-IN">🌐 తెలుగు (Telugu)</option>
              <option value="hi-IN">🌐 हिन्दी (Hindi)</option>
            </select>

            <button onclick="SwasthyaVoiceAssistant.toggleAssistant(false)" style="background:none; border:none; color:#ffffff; font-size:1.3rem; cursor:pointer; line-height:1; padding:0 4px;" title="Close Voice Assistant">
              &times;
            </button>
          </div>
        </div>

        <!-- Status Bar -->
        <div class="va-status-bar">
          <span id="va-status-text"><span class="pulse-dot" style="background:#64748b;"></span> Tap microphone to speak</span>
          <div style="display:flex; gap:0.3rem;">
            <button class="btn btn-sm btn-outline" style="padding:1px 6px; font-size:0.7rem;" onclick="SwasthyaVoiceAssistant.toggleDebugPanel()" title="Toggle Diagnostic Voice Panel">
              🛠️ Debug
            </button>
            <button class="btn btn-sm btn-outline" style="padding:1px 6px; font-size:0.7rem;" onclick="SwasthyaVoiceAssistant.stopSpeaking()" title="Stop Speaking">
              ⏹ Stop
            </button>
          </div>
        </div>

        <!-- Central Microphone Visualizer -->
        <div class="va-mic-area">
          <button id="va-main-mic-btn" class="va-main-mic-btn state-idle" onclick="SwasthyaVoiceAssistant.toggleListening()" title="Click to Speak">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
          </button>

          <div id="va-visualizer" class="va-visualizer">
            <div class="va-vis-bar"></div>
            <div class="va-vis-bar"></div>
            <div class="va-vis-bar"></div>
            <div class="va-vis-bar"></div>
            <div class="va-vis-bar"></div>
          </div>
        </div>

        <!-- Chat Stream -->
        <div id="va-chat-stream" class="va-chat-stream">
          <!-- Populated dynamically -->
        </div>

        <!-- Quick Prompts Chips -->
        <div id="va-quick-prompts" class="va-quick-prompts">
          <!-- Populated dynamically -->
        </div>

        <!-- Diagnostic Debug Panel (Collapsible) -->
        <div id="va-debug-panel" class="va-debug-panel" style="display:none;">
          <div style="font-weight:700; margin-bottom:3px; color:var(--hospital-teal-700, #0d9488);">🛠️ Voice AI Engine Diagnostics:</div>
          <div id="va-debug-content">Loading diagnostics...</div>
        </div>

        <!-- Text Input Fallback -->
        <form class="va-input-bar" onsubmit="event.preventDefault(); SwasthyaVoiceAssistant.handleTextInputSubmit();">
          <input type="text" id="va-text-input" class="va-input-field" placeholder="Or type your question here...">
          <button type="submit" class="btn btn-sm btn-primary" style="padding:0.4rem 0.8rem;">
            Send
          </button>
        </form>

      </div>
    `;

    document.body.appendChild(wrap);
    renderQuickPrompts();
    updateUIState('idle');
    updateDebugInfo();
  }

  function handleTextInputSubmit() {
    const input = document.getElementById('va-text-input');
    if (!input || !input.value.trim()) return;
    const query = input.value.trim();
    input.value = '';
    handleVoiceQuery(query);
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Public API
  window.SwasthyaVoiceAssistant = {
    get selectedLanguage() {
      return selectedLanguage;
    },
    set selectedLanguage(val) {
      setLanguage(val);
    },
    startListening,
    stopListening,
    toggleListening,
    stopSpeaking,
    speakResponse,
    speakText,
    handleVoiceQuery,
    toggleAssistant,
    setLanguage,
    getLanguage: () => selectedLanguage,
    getVoiceForLanguage,
    loadAvailableVoices,
    toggleDebugPanel,
    updateDebugInfo,
    submitManualLocation,
    shareFacilityToWhatsApp: (id) => handleWhatsAppVoiceShare(id),
    handleTextInputSubmit,
    executeVoiceHealthcareSearch
  };

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildVoiceAssistantDOM);
  } else {
    buildVoiceAssistantDOM();
  }

})();
