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
 * 5. Real GPS Geolocation & OpenStreetMap Healthcare POI Discovery with Progressive Search
 * 6. Live Development Diagnostic Debug Panel
 */

(function () {
  'use strict';

  // Browser Web Speech API references
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const isSpeechSupported = !!SpeechRecognition;
  const isSynthesisSupported = 'speechSynthesis' in window;

  // Assistant State (Strict Off by default, only activated when explicitly opened)
  let voiceAssistantOpen = false;
  let isOpen = false; // Backward-compatible alias
  let selectedLanguage = 'en-IN'; // Standard BCP 47: 'en-IN', 'te-IN', 'hi-IN'
  let recognition = null;
  let isListening = false;
  let isSpeaking = false;
  let isProcessing = false;
  let patientCoords = null; // { lat, lng, accuracy }
  let availableVoices = [];
  let showDebugPanel = false;

  // Debug & Follow-up State Tracking
  let lastRecognizedCommand = 'None';
  let lastLocationDebug = null; // { lat, lng, accuracy }
  let lastSearchRadius = 3;
  let lastApiStatus = 'Idle'; // 'Idle' | 'Searching' | 'Success' | 'Failed'
  let lastFacilitiesCount = 0;
  let lastFoundFacilities = [];

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
      statusOff: 'Voice Assistant Off',
      statusReady: 'Ready (Tap microphone to speak)',
      statusListening: 'Listening... (Speak in English)',
      statusProcessing: 'Processing request...',
      statusSpeaking: 'Speaking...',
      greeting: 'Hi! I’m <strong>SwasthyaConnect Voice AI</strong>. How can I help you today?',
      greetingSpeech: 'Hi! I am SwasthyaConnect Voice AI. How can I help you with hospitals, appointments, prescriptions, or government schemes?',
      locating: '📍 Getting your location...',
      locDetectedTitle: '📍 Your location detected',
      locDenied: 'Location permission is required to find healthcare near you.',
      locFailed: 'Unable to detect your location. Please try again or enter your location manually.',
      apiUnavailable: 'Healthcare search is temporarily unavailable. Please try again.',
      micDenied: 'Microphone permission is required for voice commands. You can type your medical request in the box below.',
      unsupported: 'Voice recognition is not supported in this browser. Please use Google Chrome on Android/Desktop or type your request.',
      noVoiceWarning: 'English voice is not available on this device/browser.',
      searchingWithinRadius: (r) => `🔍 Searching within ${r} km...`,
      expandingRadiusText: (prev, next) => `No healthcare facilities were found within ${prev} km. Expanding search to ${next} km...`,
      expandingRadiusSpeech: (prev, next) => `No healthcare facilities were found within ${prev} kilometres. I am expanding the search radius to ${next} kilometres.`,
      foundFacilitiesSpeech: (count, name, dist) => count === 1
        ? `I found 1 healthcare facility near you. It is ${name}, ${dist} away.`
        : `I found ${count} healthcare facilities near you. The nearest one is ${name}, ${dist} away.`,
      foundFacilitiesText: (count, radius) => `Found <strong>${count}</strong> healthcare facilities near you (within ${radius} km):`,
      noFacilitiesFound: (radius) => `No healthcare facilities were found within ${radius} km. Expand search radius?`,
      nearestDetailsSpeech: (name, dist, addr) => `The nearest facility is ${name}, ${dist} away at ${addr}.`,
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
      schemesSpeech: 'Government health initiatives in India include the National Health Mission, Ayushman Bharat PM-JAY, PM-JANMAN, PMSSY, and NACP. Details are on your screen.',
      schemesTitle: '🏛️ Government Healthcare Schemes',
      schemesDesc: 'Official Indian public health missions, free hospitalization covers, telemedicine, and health infrastructure initiatives.',
      nhmSpeech: 'The National Health Mission (NHM) is a major Government of India health mission focused on improving access to equitable, affordable and quality healthcare. It includes NRHM, NUHM, and Mobile Medical Units.',
      nhmTitle: '🏥 National Health Mission (NHM)',
      nhmDesc: 'Major Government of India mission focused on improving equitable, affordable and quality healthcare across rural and urban India.',
      ayushmanSpeech: 'Ayushman Bharat provides comprehensive primary healthcare through Ayushman Arogya Mandirs and up to 5 lakh rupees annual cashless hospitalization per eligible family under PM-JAY.',
      ayushmanTitle: '🛡️ Ayushman Bharat (PM-JAY & AAM)',
      ayushmanDesc: 'Two complementary components: Ayushman Arogya Mandirs for primary healthcare and PM-JAY for financial protection.',
      pmjanmanSpeech: 'PM-JANMAN (Pradhan Mantri Janjati Adivasi Nyaya Maha Abhiyan) improves healthcare, nutrition, housing, drinking water, and essential services for Particularly Vulnerable Tribal Groups.',
      pmjanmanTitle: '👥 PM-JANMAN (Tribal Health Mission)',
      pmjanmanDesc: 'Focused on improving socio-economic conditions and essential healthcare services for Particularly Vulnerable Tribal Groups (PVTGs).',
      pmssySpeech: 'Pradhan Mantri Swasthya Suraksha Yojana (PMSSY) addresses regional imbalances in tertiary healthcare by establishing 22 new AIIMS apex institutions and upgrading medical colleges across India.',
      pmssyTitle: '🏢 PMSSY (Healthcare Infrastructure)',
      pmssyDesc: 'Aims to correct regional imbalances in tertiary healthcare availability and augment medical education infrastructure.',
      nacpSpeech: 'The National AIDS Control Programme implemented through NACO provides 100% free, confidential HIV testing, counseling, awareness, and lifelong Anti-Retroviral Treatment across India.',
      nacpTitle: '🎗️ National AIDS Control Programme (NACP)',
      nacpDesc: 'India\'s national programme for prevention and control of HIV/AIDS, implemented through the National AIDS Control Organisation (NACO).',
      ruralSchemesSpeech: 'Schemes supporting rural healthcare include the National Health Mission (NHM), Ayushman Arogya Mandirs, PM-JANMAN mobile medical units, and eSanjeevani teleconsultation.',
      ruralSchemesTitle: '🌾 Rural Healthcare Schemes',
      ruralSchemesDesc: 'Major rural health initiatives: NHM (NRHM), Ayushman Arogya Mandirs, PM-JANMAN, and eSanjeevani.',
      quickPrompts: [
        'Find hospitals near me',
        'Find government hospitals near me',
        'Show government health schemes',
        'Tell me about NHM',
        'What is Ayushman Bharat?',
        'Tell me about PM-JANMAN',
        'Tell me about PMSSY',
        'Tell me about the National AIDS Control Programme',
        'Which schemes support rural healthcare?'
      ]
    },
    'te-IN': {
      code: 'te-IN',
      short: 'te',
      name: 'తెలుగు (Telugu)',
      label: 'తెలుగు',
      nativeLabel: 'తెలుగు (Telugu)',
      tapToSpeak: 'మాట్లాడటానికి మైక్రోఫోన్ నొక్కండి',
      statusOff: 'వాయిస్ అసిస్టెంట్ ఆఫ్‌లో ఉంది',
      statusReady: 'సిద్ధంగా ఉంది (మాట్లాడటానికి మైక్ నొక్కండి)',
      statusListening: 'వింటున్నాను... (తెలుగులో మాట్లాడండి)',
      statusProcessing: 'మీ అభ్యర్థనను ప్రాసెస్ చేస్తున్నాను...',
      statusSpeaking: 'సమాధానం చెబుతున్నాను...',
      greeting: 'నమస్కారం! నేను <strong>స్వాస్థ్యకనెక్ట్ వాయిస్ AI</strong>. మీకు ఎలా సహాయపడగలను?',
      greetingSpeech: 'నమస్కారం! నేను మీ స్వాస్థ్యకనెక్ట్ వాయిస్ అసిస్టెంట్‌ని. ఆసుపత్రులు, అపాయింట్‌మెంట్లు, ప్రిస్క్రిప్షన్లు లేదా ప్రభుత్వ పథకాల గురించి నేను మీకు ఎలా సహాయపడగలను?',
      locating: '📍 మీ లొకేషన్ తీసుకుంటున్నాను...',
      locDetectedTitle: '📍 మీ లొకేషన్ గుర్తించబడింది',
      locDenied: 'మీ సమీపంలో ఆరోగ్య కేంద్రాలను కనుగొనడానికి లొకేషన్ అనుమతి అవసరం.',
      locFailed: 'మీ లొకేషన్ గుర్తించడం సాధ్యపడలేదు. దయచేసి మళ్లీ ప్రయత్నించండి లేదా లొకేషన్ స్వయంగా నమోదు చేయండి.',
      apiUnavailable: 'ఆరోగ్య కేంద్రాల శోధన తాత్కాలికంగా అందుబాటులో లేదు. దయచేసి మళ్లీ ప్రయత్నించండి.',
      micDenied: 'వాయిస్ ఆదేశాల కోసం మైక్రోఫోన్ అనుమతి అవసరం. మీరు క్రింది బాక్స్‌లో మీ అభ్యర్థనను టైప్ చేయవచ్చు.',
      unsupported: 'ఈ బ్రౌజర్‌లో వాయిస్ రికగ్నిషన్ సపోర్ట్ లేదు. దయచేసి Google Chrome లేదా Android ఉపయోగించండి.',
      noVoiceWarning: 'Telugu voice is not available on this device/browser. Please try Chrome on Android or enable Telugu speech services.',
      searchingWithinRadius: (r) => `🔍 ${r} కి.మీ పరిధిలో శోధిస్తున్నాను...`,
      expandingRadiusText: (prev, next) => `${prev} కి.మీ పరిధిలో ఆరోగ్య కేంద్రాలు కనిపించలేదు. శోధన పరిధిని ${next} కి.మీ కి పెంచుతున్నాను...`,
      expandingRadiusSpeech: (prev, next) => `${prev} కిలోమీటర్ల పరిధిలో ఆరోగ్య కేంద్రాలు కనిపించలేదు. శోధన పరిధిని ${next} కిలోమీటర్లకు పెంచుతున్నాను.`,
      foundFacilitiesSpeech: (count, name, dist) => count === 1
        ? `మీకు దగ్గరలో 1 ఆరోగ్య కేంద్రాన్ని కనుగొన్నాను: ${name}, ఇది ${dist} దూరంలో ఉంది.`
        : `మీకు దగ్గరలో ${count} ఆరోగ్య కేంద్రాలను కనుగొన్నాను. అందులో దగ్గరలో ఉన్నది ${name}, ఇది ${dist} దూరంలో ఉంది.`,
      foundFacilitiesText: (count, radius) => `మీ సమీపంలో <strong>${count}</strong> ఆరోగ్య కేంద్రాలు కనుగొనబడ్డాయి (${radius} కి.మీ పరిధిలో):`,
      noFacilitiesFound: (radius) => `${radius} కి.మీ పరిధిలో ఆరోగ్య కేంద్రాలు కనిపించలేదు. శోధన పరిధిని 10 కి.మీ కి పెంచమంటారా?`,
      nearestDetailsSpeech: (name, dist, addr) => `అత్యంత సమీపంలో ఉన్నది ${name}, ${dist} దూరంలో ${addr} వద్ద ఉంది.`,
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
      schemesSpeech: 'భారత ప్రభుత్వ ఆరోగ్య పథకాలైన నేషనల్ హెల్త్ మిషన్ (NHM), ఆయుష్మాన్ భారత్, పీఎం-జన్-మన్, పీఎంఎస్‌ఎస్‌వై మరియు నాకో వివరాలను స్క్రీన్‌పై చూపించాను.',
      schemesTitle: '🏛️ ప్రభుత్వ ఆరోగ్య పథకాలు',
      schemesDesc: 'భారత ప్రభుత్వ ఉచిత చికిత్స, ప్రాథమిక వైద్యం, మాతా-శిశు సంరక్షణ మరియు ఆరోగ్య పథకాలు.',
      nhmSpeech: 'జాతీయ ఆరోగ్య మిషన్ (NHM) గ్రామీణ మరియు పట్టణ ప్రజలకు నాణ్యమైన, ఉచిత ఆరోగ్య సేవలు, ప్రాథమిక చికిత్స, మాతా-శిశు సంరక్షణ మరియు మొబైల్ మెడికల్ యూనిట్లను అందిస్తుంది.',
      nhmTitle: '🏥 నేషనల్ హెల్త్ మిషన్ (NHM)',
      nhmDesc: 'గ్రామీణ మరియు పట్టణ ప్రజలకు ఉచిత ప్రాథమిక మరియు ద్వితీయ ఆరోగ్య సేవలను అందించే భారత ప్రభుత్వ ప్రధాన పథకం.',
      ayushmanSpeech: 'ఆయుష్మాన్ భారత్ పథకం ఆయుష్మాన్ ఆరోగ్య మందిరాల ద్వారా ప్రాథమిక చికిత్స మరియు పీఎం-జేవై క్రింద అర్హత కలిగిన కుటుంబాలకు సంవత్సరానికి ₹5 లక్షల ఉచిత నగదు రహిత చికిత్సను అందిస్తుంది.',
      ayushmanTitle: '🛡️ ఆయుష్మాన్ భారత్ (PM-JAY & AAM)',
      ayushmanDesc: 'ఆయుష్మాన్ ఆరోగ్య మందిరాలు మరియు పీఎం-జేవై ద్వారా ₹5 లక్షల ఉచిత నగదు రహిత ఆసుపత్రి చికిత్స.',
      pmjanmanSpeech: 'పీఎం-జన్-మన్ పథకం ప్రత్యేకంగా గుర్తించబడిన ఆదివాసీ గిరిజన సమూహాలకు (PVTGs) మెరుగైన వైద్య సేవలు, పోషకాహారం, తాగునీరు మరియు సంచార వైద్య యూనిట్లను అందిస్తుంది.',
      pmjanmanTitle: '👥 పీఎం-జన్-మన్ (గిరిజన ఆరోగ్య మిషన్)',
      pmjanmanDesc: 'ప్రత్యేకంగా వెనుకబడిన ఆదివాసీ గిరిజన సమూహాల (PVTGs) సంక్షేమం మరియు ఉచిత వైద్య సేవలు.',
      pmssySpeech: 'పీఎంఎస్‌ఎస్‌వై (PMSSY) పథకం దేశవ్యాప్తంగా 22 కొత్త ఎయిమ్స్ (AIIMS) ఆసుపత్రుల స్థాపన మరియు ప్రభుత్వ మెడికల్ కాలేజీలను ఆధునీకరించి సూపర్ స్పెషాలిటీ వైద్య సేవలను విస్తరిస్తుంది.',
      pmssyTitle: '🏢 పీఎంఎస్‌ఎస్‌వై (PMSSY - సూపర్ స్పెషాలిటీ)',
      pmssyDesc: '22 కొత్త ఎయిమ్స్ ఆసుపత్రులు మరియు ప్రభుత్వ మెడికల్ కాలేజీల ఆధునీకరణ ద్వారా సూపర్ స్పెషాలిటీ వైద్య సేవలు.',
      nacpSpeech: 'జాతీయ ఎయిడ్స్ నియంత్రణ కార్యక్రమం (NACP) నాకో (NACO) ద్వారా ఉచిత, గోప్యమైన హెచ్ఐవి పరీక్షలు, కౌన్సెలింగ్ మరియు జీవితాంతం ఉచిత ఏఆర్‌టి చికిత్సను అందిస్తుంది.',
      nacpTitle: '🎗️ జాతీయ ఎయిడ్స్ నియంత్రణ కార్యక్రమం (NACP)',
      nacpDesc: 'నాకో (NACO) ద్వారా ఉచిత, గోప్యమైన హెచ్ఐవి/ఎయిడ్స్ పరీక్షలు, కౌన్సెలింగ్ మరియు ఉచిత ఏఆర్‌టి మందులు.',
      ruralSchemesSpeech: 'గ్రామీణ ఆరోగ్య రక్షణకు నేషనల్ హెల్త్ మిషన్ (NHM), ఆయుష్మాన్ ఆరోగ్య మందిరాలు, పీఎం-జన్-మన్ మరియు ఈ-సంజీవని టెలీమెడిసిన్ సేవలు అందుబాటులో ఉన్నాయి.',
      ruralSchemesTitle: '🌾 గ్రామీణ ఆరోగ్య పథకాలు',
      ruralSchemesDesc: 'గ్రామీణ ప్రాంతాల కోసం NHM, ఆయుష్మాన్ ఆరోగ్య మందిరాలు మరియు పీఎం-జన్-మన్ పథకాలు.',
      quickPrompts: [
        'నా దగ్గరలో ఆసుపత్రులను కనుగొను',
        'దగ్గరలో ఉన్న ఆసుపత్రులను చూపించు',
        'ప్రభుత్వ ఆరోగ్య పథకాలు చూపించు',
        'NHM గురించి చెప్పు',
        'ఆయుష్మాన్ భారత్ అంటే ఏమిటి?',
        'PM-JANMAN పథకం ఏమిటి?',
        'PMSSY పథకం గురించి చెప్పు',
        'NACP గురించి చెప్పు',
        'గ్రామీణ ఆరోగ్య పథకాలు ఏమిటి?'
      ]
    },
    'hi-IN': {
      code: 'hi-IN',
      short: 'hi',
      name: 'हिन्दी (Hindi)',
      label: 'हिन्दी',
      nativeLabel: 'हिन्दी (Hindi)',
      tapToSpeak: 'बोलने के लिए माइक दबाएं',
      statusOff: 'वॉयस असिस्टेंट बंद है',
      statusReady: 'तैयार (बोलने के लिए माइक दबाएं)',
      statusListening: 'सुन रहा हूँ... (हिंदी में बोलें)',
      statusProcessing: 'आपके अनुरोध पर काम हो रहा है...',
      statusSpeaking: 'बोल रहा हूँ...',
      greeting: 'नमस्ते! मैं <strong>स्वास्थ्यकनेक्ट वॉयस AI</strong> हूँ। मैं आपकी क्या मदद कर सकता हूँ?',
      greetingSpeech: 'नमस्ते! मैं आपका स्वास्थ्यकनेक्ट वॉयस असिस्टेंट हूँ। मैं अस्पताल खोजने, अपॉइंटमेंट, पर्चे या सरकारी योजनाओं में आपकी क्या मदद कर सकता हूँ?',
      locating: '📍 आपका स्थान प्राप्त किया जा रहा है...',
      locDetectedTitle: '📍 आपका स्थान पहचाना गया',
      locDenied: 'आपके पास स्वास्थ्य सेवाएं खोजने के लिए स्थान अनुमति आवश्यक है।',
      locFailed: 'आपका स्थान पहचानने में असमर्थ। कृपया पुनः प्रयास करें या अपना स्थान दर्ज करें।',
      apiUnavailable: 'स्वास्थ्य सेवा खोज अस्थायी रूप से अनुपलब्ध है। कृपया पुनः प्रयास करें।',
      micDenied: 'वॉयस कमांड के लिए माइक्रोफ़ोन अनुमति आवश्यक है। आप नीचे दिए गए बॉक्स में टाइप कर सकते हैं।',
      unsupported: 'इस ब्राउज़र में वॉयस इनपुट समर्थित नहीं है। कृपया Google Chrome या Android का उपयोग करें।',
      noVoiceWarning: 'Hindi voice is not available on this device/browser. Please try Chrome on Android or enable Hindi speech services.',
      searchingWithinRadius: (r) => `🔍 ${r} किमी के दायरे में खोज रहा हूँ...`,
      expandingRadiusText: (prev, next) => `${prev} किमी के भीतर कोई अस्पताल नहीं मिला। खोज का दायरा ${next} किमी बढ़ा रहा हूँ...`,
      expandingRadiusSpeech: (prev, next) => `${prev} किलोमीटर के दायरे में कोई स्वास्थ्य केंद्र नहीं मिला। मैं खोज का दायरा ${next} किलोमीटर तक बढ़ा रहा हूँ।`,
      foundFacilitiesSpeech: (count, name, dist) => count === 1
        ? `मुझे आपके पास 1 स्वास्थ्य केंद्र मिला है: ${name}, जो ${dist} दूर है।`
        : `मुझे आपके पास ${count} स्वास्थ्य केंद्र मिले हैं। सबसे नज़दीकी ${name} ${dist} दूर है।`,
      foundFacilitiesText: (count, radius) => `आपके पास <strong>${count}</strong> स्वास्थ्य केंद्र मिले (${radius} किमी के दायरे में):`,
      noFacilitiesFound: (radius) => `${radius} किमी के भीतर कोई स्वास्थ्य केंद्र नहीं मिला। क्या खोज का दायरा 10 किमी बढ़ाएं?`,
      nearestDetailsSpeech: (name, dist, addr) => `सबसे नज़दीकी स्वास्थ्य केंद्र ${name} है, जो ${dist} दूर ${addr} पर स्थित है।`,
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
      schemesSpeech: 'भारत सरकार की प्रमुख स्वास्थ्य योजनाओं जैसे राष्ट्रीय स्वास्थ्य मिशन (NHM), आयुष्मान भारत, पीएम-जनमन, और पीएमएसएसवाई का विवरण स्क्रीन पर उपलब्ध है।',
      schemesTitle: '🏛️ सरकारी स्वास्थ्य योजनाएं',
      schemesDesc: 'भारत सरकार के प्रमुख स्वास्थ्य मिशन, मुफ्त अस्पताल उपचार, और सार्वजनिक स्वास्थ्य योजनाएं।',
      nhmSpeech: 'राष्ट्रीय स्वास्थ्य मिशन (NHM) भारत सरकार का प्रमुख मिशन है जो ग्रामीण एवं शहरी क्षेत्रों में प्राथमिक स्वास्थ्य, मातृ एवं शिशु स्वास्थ्य, और मोबाइल मेडिकल यूनिट्स के माध्यम से किफायती स्वास्थ्य सेवाएं प्रदान करता है।',
      nhmTitle: '🏥 राष्ट्रीय स्वास्थ्य मिशन (NHM)',
      nhmDesc: 'ग्रामीण एवं शहरी क्षेत्रों में गुणवत्तापूर्ण एवं किफायती स्वास्थ्य सेवा प्रदान करने वाला भारत सरकार का प्रमुख मिशन।',
      ayushmanSpeech: 'आयुष्मान भारत योजना आयुष्मान आरोग्य मंदिरों के माध्यम से व्यापक प्राथमिक स्वास्थ्य सेवा और पीएम-जय के तहत प्रति वर्ष प्रति परिवार ₹5 लाख तक का कैशलेस इलाज प्रदान करती है।',
      ayushmanTitle: '🛡️ आयुष्मान भारत (PM-JAY एवं आरोग्य मंदिर)',
      ayushmanDesc: 'आयुष्मान आरोग्य मंदिर और पीएम-जय के तहत प्रति परिवार ₹5,00,000 का मुफ्त कैशलेस इलाज।',
      pmjanmanSpeech: 'पीएम-जनमन योजना विशेष रूप से कमज़ोर जनजातीय समूहों (PVTGs) के लिए बेहतर स्वास्थ्य सेवा, पोषण, स्वच्छ पेयजल, आवास और मोबाइल मेडिकल यूनिट्स सुनिश्चित करती है।',
      pmjanmanTitle: '👥 पीएम-जनमन (जनजातीय स्वास्थ्य मिशन)',
      pmjanmanDesc: 'विशेष रूप से कमज़ोर जनजातीय समूहों (PVTGs) के सामाजिक-आर्थिक उत्थान एवं स्वास्थ्य सुरक्षा हेतु मिशन।',
      pmssySpeech: 'प्रधानमंत्री स्वास्थ्य सुरक्षा योजना (PMSSY) देश भर में 22 नए एम्स (AIIMS) संस्थानों की स्थापना और मेडिकल कॉलेजों को अपग्रेड करके तृतीयक स्वास्थ्य सुविधाओं का विस्तार करती है।',
      pmssyTitle: '🏢 पीएमएसएसवाई (PMSSY - एम्स एवं मेडिकल विस्तार)',
      pmssyDesc: '22 नए एम्स की स्थापना एवं मेडिकल कॉलेजों के उन्नयन द्वारा सुपर-स्पेशियलिटी स्वास्थ्य सेवा का विस्तार।',
      nacpSpeech: 'राष्ट्रीय एड्स नियंत्रण कार्यक्रम (NACP) नाको के माध्यम से 100% मुफ्त, गोपनीय एचआईवी जांच, परामर्श, जागरूकता और जीवन भर मुफ्त एआरटी दवाएं प्रदान करता है।',
      nacpTitle: '🎗️ राष्ट्रीय एड्स नियंत्रण कार्यक्रम (NACP)',
      nacpDesc: 'नाको (NACO) के माध्यम से 100% मुफ्त, गोपनीय एचआईवी/एड्स जांच, परामर्श एवं जीवन पर्यंत मुफ्त एआरटी उपचार।',
      ruralSchemesSpeech: 'ग्रामीण स्वास्थ्य के लिए राष्ट्रीय स्वास्थ्य मिशन (NHM), आयुष्मान आरोग्य मंदिर, पीएम-जनमन मोबाइल यूनिट्स और ई-संजीवनी टेलीमेडिसिन प्रमुख योजनाएं हैं।',
      ruralSchemesTitle: '🌾 ग्रामीण स्वास्थ्य योजनाएं',
      ruralSchemesDesc: 'ग्रामीण भारत हेतु NHM, आयुष्मान आरोग्य मंदिर, पीएम-जनमन और ई-संजीवनी योजनाएं।',
      quickPrompts: [
        'मेरे पास अस्पताल खोजो',
        'पास के अस्पताल दिखाओ',
        'सरकारी स्वास्थ्य योजनाएं दिखाओ',
        'NHM के बारे में बताओ',
        'आयुष्मान भारत क्या है?',
        'पीएम-जनमन योजना क्या है?',
        'पीएमएसएसवाई क्या है?',
        'राष्ट्रीय एड्स नियंत्रण कार्यक्रम क्या है?',
        'ग्रामीण स्वास्थ्य योजनाएं कौन सी हैं?'
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

  // Get matching native voice for specified language code
  function getVoiceForLanguage(langCode) {
    const voices = availableVoices.length > 0 ? availableVoices : (isSynthesisSupported ? window.speechSynthesis.getVoices() : []);
    if (!voices || voices.length === 0) return null;

    const norm = normalizeLanguage(langCode);

    if (norm === 'te-IN') {
      return voices.find(v => {
        const vl = (v.lang || '').toLowerCase().replace(/_/g, '-');
        const vn = (v.name || '').toLowerCase();
        return vl.startsWith('te') || vl.includes('te-') || vl.includes('telugu') ||
               vn.includes('telugu') || vn.includes('mohan') || vn.includes('chitra') || vn.includes('shruthi');
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
    if (!voiceAssistantOpen) return null;

    try {
      if (recognition) {
        try {
          recognition.onstart = null;
          recognition.onresult = null;
          recognition.onerror = null;
          recognition.onend = null;
          recognition.abort();
          recognition.stop();
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
        if (!voiceAssistantOpen) {
          try { recognition.abort(); } catch (e) {}
          isListening = false;
          return;
        }
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
        if (currentInterim && !finalTranscript && voiceAssistantOpen) {
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
          updateUIState('mic-denied');
          const input = document.getElementById('va-text-input');
          if (input) input.focus();
        } else if (event.error === 'language-not-supported') {
          appendMessage('bot', cfg.unsupported);
          updateUIState(voiceAssistantOpen ? 'idle' : 'off');
        } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
          updateUIState(voiceAssistantOpen ? 'idle' : 'off');
        }
        updateDebugInfo();
      };

      recognition.onend = () => {
        isListening = false;
        if (voiceAssistantOpen) {
          if (!isSpeaking && !isProcessing) {
            updateUIState('idle');
          }
        } else {
          updateUIState('off');
        }
        updateDebugInfo();
      };

      return recognition;
    } catch (e) {
      console.error('Error creating SpeechRecognition instance:', e);
      return null;
    }
  }

  // Start Voice Listening (Strictly only when assistant is open)
  function startListening() {
    const cfg = getLangConfig();
    if (!isSpeechSupported) {
      appendMessage('bot', cfg.unsupported);
      return;
    }

    if (!voiceAssistantOpen) {
      console.log('Voice Assistant is closed. Listening blocked.');
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
            if (recognition && voiceAssistantOpen) {
              recognition.start();
            }
          }, 150);
        } catch (e) {}
      }
    }
  }

  // Stop Voice Listening and release microphone
  function stopListening() {
    if (recognition) {
      try {
        recognition.onstart = null;
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.abort();
        recognition.stop();
      } catch (e) {}
      recognition = null;
    }
    isListening = false;
    if (voiceAssistantOpen) {
      updateUIState('idle');
    } else {
      updateUIState('off');
    }
  }

  // Toggle listening state
  function toggleListening() {
    if (!voiceAssistantOpen) {
      toggleAssistant(true);
      return;
    }
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
   * Obtain Real Browser GPS Coordinates
   * Strict accuracy with timeout: 15000, maximumAge: 0
   */
  function obtainGPSCoordinates() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported by browser'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          patientCoords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy || 10)
          };
          lastLocationDebug = patientCoords;
          // Also sync with global patientCoordinates in patient.js
          if (typeof window.patientCoordinates !== 'undefined') {
            window.patientCoordinates.lat = pos.coords.latitude;
            window.patientCoordinates.lng = pos.coords.longitude;
          }
          resolve(patientCoords);
        },
        (err) => {
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    });
  }

  /**
   * Core Multilingual Voice AI NLP Engine
   * Recognizes Commands & Follow-ups in English, Telugu, and Hindi
   */
  async function handleVoiceQuery(query) {
    if (!query) return;

    lastRecognizedCommand = query;
    updateDebugInfo();

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
      (lower.includes('send') && (lower.includes('hospital') || lower.includes('centre') || lower.includes('nearest'))) ||
      lower.includes('వాట్సాప్‌కి పంపు') || lower.includes('వాట్సాప్ లో పంపు') ||
      lower.includes('व्हाट्सएप पर भेजो') || lower.includes('व्हाट्सएप संदेश')
    ) {
      await handleWhatsAppVoiceShare();
      return;
    }

    // 3. FOLLOW-UP: "Show the nearest one" / "దగ్గరలో ఉన్నదాన్ని చూపించు" / "सबसे नज़दीकी अस्पताल दिखाओ"
    if (
      lower.includes('nearest one') || lower.includes('show nearest') || lower.includes('first one') ||
      lower.includes('దగ్గరలో ఉన్నదాన్ని') || lower.includes('సమీప ఆసుపత్రిని') || lower.includes('మొదటిది') ||
      lower.includes('सबसे नज़दीकी') || lower.includes('पहला अस्पताल') || lower.includes('पास वाला')
    ) {
      if (lastFoundFacilities && lastFoundFacilities.length > 0) {
        const top = lastFoundFacilities[0];
        isProcessing = false;
        if (typeof window.flyToFacility === 'function') {
          window.flyToFacility(top.lat, top.lng, top.id);
        }
        const speech = cfg.nearestDetailsSpeech(top.name, top.distance, top.location);
        appendMessage('bot', `
          <div style="font-size:0.875rem;">
            <strong>🏥 ${escapeHTML(top.name)}</strong><br>
            <span style="color:#0d9488; font-weight:700;">📍 ${top.distance} away</span><br>
            <span style="color:var(--text-secondary); font-size:0.8rem;">📌 ${escapeHTML(top.location)}</span>
          </div>
        `);
        speakResponse(speech, selectedLanguage);
        return;
      }
    }

    // 4. FOLLOW-UP: "Give me directions" / "మార్గం చూపించు" / "दिशा-निर्देश दो"
    if (
      lower.includes('give me direction') || lower.includes('directions') || lower.includes('how to reach') ||
      lower.includes('మార్గం') || lower.includes('రూట్') || lower.includes('దిశ') ||
      lower.includes('दिशा') || lower.includes('रास्ता')
    ) {
      if (lastFoundFacilities && lastFoundFacilities.length > 0) {
        const top = lastFoundFacilities[0];
        isProcessing = false;
        window.open(top.directionsUrl, '_blank');
        const dirSpeech = selectedLanguage === 'te-IN' ? `${top.name} కి మార్గం మ్యాప్స్‌లో తెరుస్తున్నాను.` :
                          selectedLanguage === 'hi-IN' ? `${top.name} के लिए दिशा-निर्देश मैप्स में खोल रहा हूँ।` :
                          `Opening directions to ${top.name} in Google Maps.`;
        appendMessage('bot', `<p style="margin:0; font-size:0.875rem;">🗺️ ${dirSpeech}</p>`);
        speakResponse(dirSpeech, selectedLanguage);
        return;
      }
    }

    // 5. APPOINTMENTS
    if (
      lower.includes('appointment') || lower.includes('अपॉइंटमेंट') || lower.includes('अप्वाइंटमेंट') ||
      lower.includes('అపాయింట్') || lower.includes('అపాయింట్‌మెంట్') ||
      (lower.includes('doctor') && !lower.includes('hospital') && !lower.includes('near')) ||
      (lower.includes('డాక్టర్') && !lower.includes('ఆసుపత్రి'))
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

    // 6. PRESCRIPTIONS & MEDICAL RECORDS
    if (
      lower.includes('prescription') || lower.includes('medicine') || lower.includes('medication') ||
      (lower.includes('record') && !lower.includes('hospital')) || lower.includes('पर्चे') || lower.includes('दवा') || lower.includes('दवाई') ||
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

    // 7. GOVERNMENT HEALTH SCHEMES (NHM, Ayushman Bharat, PM-JANMAN, PMSSY, NACP, Rural Health, General)
    // 7A. National Health Mission (NHM)
    if (
      lower.includes('nhm') || lower.includes('nrhm') || lower.includes('nuhm') ||
      lower.includes('national health mission') || lower.includes('జాతీయ ఆరోగ్య మిషన్') || lower.includes('राष्ट्रीय स्वास्थ्य मिशन')
    ) {
      isProcessing = false;
      const html = `
        <div class="va-scheme-card" style="padding:0.75rem; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border-light);">
          <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.4rem;">
            <span style="font-size:1.3rem;">🏥</span>
            <strong style="color:var(--hospital-teal-800, #115e59); font-size:0.95rem;">${cfg.nhmTitle}</strong>
          </div>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin:0 0 0.6rem 0; line-height:1.4;">
            ${cfg.nhmDesc}
          </p>
          <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
            <button class="btn btn-sm btn-primary" style="flex:1;" onclick="if(typeof openSchemeDetailsModal === 'function') openSchemeDetailsModal('nhm'); else if(typeof PulseCareUI !== 'undefined') PulseCareUI.switchTab('schemes');">
              Learn More →
            </button>
            <a href="https://nhm.gov.in/" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline" style="flex:1; text-align:center;">
              Official Website ↗
            </a>
          </div>
        </div>
      `;
      appendMessage('bot', html);
      speakResponse(cfg.nhmSpeech, selectedLanguage);
      return;
    }

    // 7B. Ayushman Bharat (PM-JAY & AAM)
    if (
      lower.includes('ayushman') || lower.includes('pmjay') || lower.includes('pm-jay') || lower.includes('jan arogya') ||
      lower.includes('arogya mandir') || lower.includes('ఆయుష్మాన్') || lower.includes('आयुष्मान') || lower.includes('जन आरोग्य')
    ) {
      isProcessing = false;
      const html = `
        <div class="va-scheme-card" style="padding:0.75rem; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border-light);">
          <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.4rem;">
            <span style="font-size:1.3rem;">🛡️</span>
            <strong style="color:var(--hospital-teal-800, #115e59); font-size:0.95rem;">${cfg.ayushmanTitle}</strong>
          </div>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin:0 0 0.6rem 0; line-height:1.4;">
            ${cfg.ayushmanDesc}
          </p>
          <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
            <button class="btn btn-sm btn-primary" style="width:100%; margin-bottom:0.3rem;" onclick="if(typeof openSchemeDetailsModal === 'function') openSchemeDetailsModal('ayushman-bharat'); else if(typeof PulseCareUI !== 'undefined') PulseCareUI.switchTab('schemes');">
              Learn More →
            </button>
            <a href="https://pmjay.gov.in/" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline" style="flex:1; text-align:center;">
              PM-JAY ↗
            </a>
            <a href="https://aam.mohfw.gov.in/" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline" style="flex:1; text-align:center;">
              Arogya Mandir ↗
            </a>
          </div>
        </div>
      `;
      appendMessage('bot', html);
      speakResponse(cfg.ayushmanSpeech, selectedLanguage);
      return;
    }

    // 7C. PM-JANMAN (Tribal Health Mission)
    if (
      lower.includes('janman') || lower.includes('jan-man') || lower.includes('janjati') || lower.includes('pvtg') ||
      lower.includes('జన్-మన్') || lower.includes('గిరిజన') || lower.includes('जनमन') || lower.includes('जनजाति') || lower.includes('आदिवासी')
    ) {
      isProcessing = false;
      const html = `
        <div class="va-scheme-card" style="padding:0.75rem; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border-light);">
          <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.4rem;">
            <span style="font-size:1.3rem;">👥</span>
            <strong style="color:var(--hospital-teal-800, #115e59); font-size:0.95rem;">${cfg.pmjanmanTitle}</strong>
          </div>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin:0 0 0.6rem 0; line-height:1.4;">
            ${cfg.pmjanmanDesc}
          </p>
          <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
            <button class="btn btn-sm btn-primary" style="flex:1;" onclick="if(typeof openSchemeDetailsModal === 'function') openSchemeDetailsModal('pm-janman'); else if(typeof PulseCareUI !== 'undefined') PulseCareUI.switchTab('schemes');">
              Learn More →
            </button>
            <a href="https://tribal.nic.in/PM-JANMAN.aspx" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline" style="flex:1; text-align:center;">
              Official Website ↗
            </a>
          </div>
        </div>
      `;
      appendMessage('bot', html);
      speakResponse(cfg.pmjanmanSpeech, selectedLanguage);
      return;
    }

    // 7D. PMSSY (Pradhan Mantri Swasthya Suraksha Yojana)
    if (
      lower.includes('pmssy') || lower.includes('swasthya suraksha') || lower.includes('aiims') ||
      lower.includes('ఎయిమ్స్') || lower.includes('పీఎంఎస్‌ఎస్‌వై') || lower.includes('एम्स') || lower.includes('स्वास्थ्य सुरक्षा योजना')
    ) {
      isProcessing = false;
      const html = `
        <div class="va-scheme-card" style="padding:0.75rem; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border-light);">
          <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.4rem;">
            <span style="font-size:1.3rem;">🏢</span>
            <strong style="color:var(--hospital-teal-800, #115e59); font-size:0.95rem;">${cfg.pmssyTitle}</strong>
          </div>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin:0 0 0.6rem 0; line-height:1.4;">
            ${cfg.pmssyDesc}
          </p>
          <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
            <button class="btn btn-sm btn-primary" style="flex:1;" onclick="if(typeof openSchemeDetailsModal === 'function') openSchemeDetailsModal('pmssy'); else if(typeof PulseCareUI !== 'undefined') PulseCareUI.switchTab('schemes');">
              Learn More →
            </button>
            <a href="https://pmssy.mohfw.gov.in/" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline" style="flex:1; text-align:center;">
              Official Website ↗
            </a>
          </div>
        </div>
      `;
      appendMessage('bot', html);
      speakResponse(cfg.pmssySpeech, selectedLanguage);
      return;
    }

    // 7E. National AIDS Control Programme (NACP)
    if (
      lower.includes('nacp') || lower.includes('naco') || lower.includes('aids') || lower.includes('hiv') ||
      lower.includes('నాకో') || lower.includes('ఎయిడ్స్') || lower.includes('नाको') || lower.includes('एड्स')
    ) {
      isProcessing = false;
      const html = `
        <div class="va-scheme-card" style="padding:0.75rem; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border-light);">
          <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.4rem;">
            <span style="font-size:1.3rem;">🎗️</span>
            <strong style="color:var(--hospital-teal-800, #115e59); font-size:0.95rem;">${cfg.nacpTitle}</strong>
          </div>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin:0 0 0.6rem 0; line-height:1.4;">
            ${cfg.nacpDesc}
          </p>
          <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
            <button class="btn btn-sm btn-primary" style="flex:1;" onclick="if(typeof openSchemeDetailsModal === 'function') openSchemeDetailsModal('nacp'); else if(typeof PulseCareUI !== 'undefined') PulseCareUI.switchTab('schemes');">
              Learn More →
            </button>
            <a href="https://naco.gov.in/" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline" style="flex:1; text-align:center;">
              NACO Official ↗
            </a>
          </div>
        </div>
      `;
      appendMessage('bot', html);
      speakResponse(cfg.nacpSpeech, selectedLanguage);
      return;
    }

    // 7F. Rural Healthcare Inquiry ("Which schemes support rural healthcare?")
    if (
      lower.includes('rural health') || lower.includes('support rural') ||
      lower.includes('గ్రామీణ ఆరోగ్య') || lower.includes('గ్రామీణ పథకాలు') ||
      lower.includes('ग्रामीण स्वास्थ्य') || lower.includes('गांव के लिए')
    ) {
      isProcessing = false;
      const html = `
        <div class="va-scheme-card" style="padding:0.75rem; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border-light);">
          <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.4rem;">
            <span style="font-size:1.3rem;">🌾</span>
            <strong style="color:var(--hospital-teal-800, #115e59); font-size:0.95rem;">${cfg.ruralSchemesTitle}</strong>
          </div>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin:0 0 0.6rem 0; line-height:1.4;">
            ${cfg.ruralSchemesDesc}
          </p>
          <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
            <button class="btn btn-sm btn-primary" style="flex:1;" onclick="if(typeof filterSchemes === 'function') { PulseCareUI.switchTab('schemes'); filterSchemes('Rural Healthcare'); }">
              View Rural Schemes
            </button>
            <button class="btn btn-sm btn-outline" style="flex:1;" onclick="if(typeof PulseCareUI !== 'undefined') PulseCareUI.switchTab('schemes');">
              All Schemes ↗
            </button>
          </div>
        </div>
      `;
      appendMessage('bot', html);
      speakResponse(cfg.ruralSchemesSpeech, selectedLanguage);
      return;
    }

    // 7G. General Government Health Schemes
    if (
      lower.includes('scheme') || lower.includes('government health') || lower.includes('public health') ||
      lower.includes('పథకం') || lower.includes('పథకాలు') || lower.includes('యొక్క పథకాలు') ||
      lower.includes('योजना') || lower.includes('योजनाएं')
    ) {
      isProcessing = false;
      const html = `
        <div class="va-scheme-card" style="padding:0.75rem; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border-light);">
          <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.4rem;">
            <span style="font-size:1.3rem;">🏛️</span>
            <strong style="color:var(--hospital-teal-800, #115e59); font-size:0.95rem;">${cfg.schemesTitle}</strong>
          </div>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin:0 0 0.6rem 0; line-height:1.4;">
            ${cfg.schemesDesc}
          </p>
          <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
            <button class="btn btn-sm btn-primary" style="flex:1;" onclick="if(typeof PulseCareUI !== 'undefined') PulseCareUI.switchTab('schemes');">
              Explore All Schemes
            </button>
            <button class="btn btn-sm btn-secondary" style="flex:1;" onclick="if(typeof PulseCareUI !== 'undefined') PulseCareUI.openModal('eligibility-modal');">
              Check Eligibility
            </button>
          </div>
        </div>
      `;
      appendMessage('bot', html);
      speakResponse(cfg.schemesSpeech, selectedLanguage);
      return;
    }

    // 8. HEALTHCARE LOCATION SEARCH (Hospital, PHC, Clinic, Pharmacy, Government, etc.)
    let category = 'All';
    if (lower.includes('government') || lower.includes('सरकारी') || lower.includes('ప్రభుత్వ') || lower.includes('goverment') || lower.includes('civil') || lower.includes('district')) {
      category = 'Government Hospitals';
    } else if (lower.includes('phc') || lower.includes('primary') || lower.includes('प्राथमिक') || lower.includes('ప్రాథమిక') || lower.includes('పీహెచ్‌సీ')) {
      category = 'PHC';
    } else if (lower.includes('chc') || lower.includes('community') || lower.includes('सामुदायिक') || lower.includes('కమ్యూనిటీ')) {
      category = 'CHC';
    } else if (lower.includes('pharmacy') || lower.includes('chemist') || lower.includes('दवा') || lower.includes('దవా') || lower.includes('మందుల') || lower.includes('ఫార్మసీ')) {
      category = 'Pharmacies';
    } else if (lower.includes('diagnostic') || lower.includes('lab') || lower.includes('test') || lower.includes('परीक्षण') || lower.includes('టెస్ట్') || lower.includes('ల్యాబ్')) {
      category = 'Diagnostic Centres';
    } else if (lower.includes('clinic') || lower.includes('क्लिनिक') || lower.includes('క్లినిక్')) {
      category = 'Clinics';
    }

    let radius = 3; // Default initial progressive radius: 3 km
    const matchKm = lower.match(/(\d+)\s*(km|kilometre|kilometer|किमी|కిమీ)/);
    if (matchKm && matchKm[1]) {
      radius = parseInt(matchKm[1], 10);
    }

    await executeVoiceHealthcareSearch(category, radius, query);
  }

  /**
   * Execute Real GPS Healthcare Search for Voice AI
   * 1. Obtains real GPS location via navigator.geolocation (no fake/hardcoded coords)
   * 2. Displays location confirmation (lat, lng, accuracy)
   * 3. Performs progressive Overpass + Nominatim healthcare POI search (3km -> 5km -> 10km -> 25km)
   * 4. Calculates Haversine distances and sorts nearest first
   * 5. Displays hospital cards with Directions, Map, and WhatsApp
   * 6. Updates Leaflet map in Patient Portal
   * 7. Speaks multilingual summary
   */
  async function executeVoiceHealthcareSearch(category = 'All', initialRadius = 3, userQuery = '') {
    const cfg = getLangConfig();

    // Step 1: Ensure patient has valid GPS coordinates
    if (!patientCoords) {
      appendMessage('bot', `<p style="margin:0; font-size:0.875rem;">📡 <em>${cfg.locating}</em></p>`);
      try {
        await obtainGPSCoordinates();
      } catch (err) {
        isProcessing = false;
        lastApiStatus = 'Failed';
        updateDebugInfo();

        const isDenied = err && (err.code === 1 || err.name === 'NotAllowedError');
        const errMsg = isDenied ? cfg.locDenied : cfg.locFailed;

        appendMessage('bot', `
          <div style="font-size:0.85rem;">
            <p style="margin:0 0 0.5rem 0; color:#dc2626; font-weight:600;">⚠️ ${escapeHTML(errMsg)}</p>
            <div style="display:flex; gap:0.4rem; flex-wrap:wrap; margin-top:0.4rem;">
              <button class="btn btn-sm btn-primary" onclick="SwasthyaVoiceAssistant.startListening()">
                📍 Allow Location & Retry
              </button>
            </div>
            <div style="display:flex; gap:0.4rem; margin-top:0.5rem;">
              <input type="text" id="va-manual-loc-input" placeholder="Enter City, Town, or PIN code..." style="flex:1; padding:0.4rem 0.6rem; font-size:0.85rem; border-radius:var(--radius-xs, 6px); border:1px solid var(--border-light, #cbd5e1); background:var(--bg-input, #ffffff); color:var(--text-primary, #0f172a);">
              <button class="btn btn-sm btn-outline" onclick="SwasthyaVoiceAssistant.submitManualLocation()">Search</button>
            </div>
          </div>
        `);
        speakResponse(errMsg, selectedLanguage);
        updateUIState('idle');
        return;
      }
    }

    // Step 2: Show Location Confirmation Card
    appendMessage('bot', `
      <div class="va-loc-confirm-card" style="padding:0.6rem 0.8rem; background:rgba(2, 132, 199, 0.08); border-left:3px solid #0284c7; border-radius:6px; font-size:0.85rem; margin-bottom:0.5rem;">
        <div style="font-weight:700; color:#0369a1; margin-bottom:3px;">${cfg.locDetectedTitle}</div>
        <div style="font-family:ui-monospace, monospace; font-size:0.775rem; color:var(--text-secondary, #475569); line-height:1.4;">
          Latitude: <strong>${patientCoords.lat.toFixed(5)}</strong><br>
          Longitude: <strong>${patientCoords.lng.toFixed(5)}</strong><br>
          Accuracy: <strong>${patientCoords.accuracy}</strong> meters
        </div>
      </div>
    `);

    // Step 3: Progressive Search (3 km -> 5 km -> 10 km -> 25 km)
    const progressiveRadii = Array.from(new Set([Math.max(3, initialRadius), 5, 10, 25])).sort((a, b) => a - b);
    let results = [];
    let finalSearchRadius = initialRadius;

    lastApiStatus = 'Searching';
    updateDebugInfo();

    for (let i = 0; i < progressiveRadii.length; i++) {
      const r = progressiveRadii[i];
      finalSearchRadius = r;
      lastSearchRadius = r;
      updateDebugInfo();

      if (i > 0) {
        const prevR = progressiveRadii[i - 1];
        appendMessage('bot', `<p style="margin:0 0 0.4rem 0; font-size:0.8rem; color:var(--text-muted, #64748b);"><em>${cfg.expandingRadiusText(prevR, r)}</em></p>`);
      }

      if (typeof PlacesHealthService !== 'undefined' && typeof PlacesHealthService.fetchNearbyFacilities === 'function') {
        try {
          results = await PlacesHealthService.fetchNearbyFacilities(
            patientCoords.lat,
            patientCoords.lng,
            r,
            category,
            userQuery,
            false // allowSynthetic = false (REAL OSM POIs ONLY)
          );
        } catch (e) {
          console.warn('PlacesHealthService query error:', e);
        }
      }

      // If we found 1 or more real facilities, proceed
      if (results && results.length > 0) {
        break;
      }
    }

    isProcessing = false;

    // Step 4: Handle zero results
    if (!results || results.length === 0) {
      lastApiStatus = 'Failed';
      lastFacilitiesCount = 0;
      lastFoundFacilities = [];
      updateDebugInfo();

      const noResultsText = cfg.noFacilitiesFound(finalSearchRadius);
      appendMessage('bot', `
        <div style="font-size:0.875rem;">
          <p style="margin:0 0 0.5rem 0;">🏥 ${escapeHTML(noResultsText)}</p>
          <button class="btn btn-sm btn-primary" onclick="SwasthyaVoiceAssistant.executeVoiceHealthcareSearch('${category}', 25)">
            🔍 Search within 25 km
          </button>
        </div>
      `);
      speakResponse(noResultsText, selectedLanguage);
      updateUIState('idle');
      return;
    }

    // Step 5: Save State & Update Map
    lastApiStatus = 'Success';
    lastFacilitiesCount = results.length;
    lastFoundFacilities = results;
    updateDebugInfo();

    // Update global Patient Portal Map & Cards if on patient page
    if (typeof window.initOrUpdateLeafletMap === 'function') {
      window.initOrUpdateLeafletMap(results);
    }
    if (typeof window.renderNearbyCards === 'function') {
      window.renderNearbyCards(results);
    }

    const topFacility = results[0];
    const speechSummary = cfg.foundFacilitiesSpeech(results.length, topFacility.name, topFacility.distance);

    // Step 6: Render Facility Cards
    let html = `
      <div style="font-size:0.85rem; margin-bottom:0.5rem; color:var(--text-muted, #64748b);">
        ${cfg.foundFacilitiesText(results.length, finalSearchRadius)}
      </div>
      <div style="display:flex; flex-direction:column; gap:0.6rem; max-height:280px; overflow-y:auto; padding-right:4px;">
    `;

    results.slice(0, 3).forEach(fac => {
      html += `
        <div class="va-facility-card" style="padding:0.75rem; background:var(--bg-surface, #ffffff); border-radius:var(--radius-sm, 8px); border:1px solid var(--border-light, #e2e8f0); box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem; margin-bottom:0.25rem;">
            <strong style="font-size:0.9rem; color:var(--text-primary, #0f172a);">🏥 ${escapeHTML(fac.name)}</strong>
            <span class="badge badge-emerald" style="font-size:0.7rem; white-space:nowrap; background:#10b981; color:#fff; padding:2px 7px; border-radius:12px; font-weight:700;">📍 ${fac.distance}</span>
          </div>
          <div style="font-size:0.75rem; color:#0d9488; font-weight:600; margin-bottom:0.2rem;">🏷️ ${escapeHTML(fac.type || 'Healthcare Facility')}</div>
          <p style="font-size:0.775rem; color:var(--text-secondary, #64748b); margin:0 0 0.35rem 0; line-height:1.3;">📌 ${escapeHTML(fac.location || fac.address || '')}</p>
          ${fac.timing ? `<div style="font-size:0.725rem; color:var(--text-muted, #94a3b8); margin-bottom:0.35rem;">🕐 ${escapeHTML(fac.timing)}</div>` : ''}
          ${fac.phone ? `<div style="font-size:0.725rem; color:#0369a1; margin-bottom:0.45rem;">☎️ <a href="tel:${fac.phone.split(' ')[0]}" style="color:inherit; text-decoration:underline;"><strong>${escapeHTML(fac.phone)}</strong></a></div>` : ''}
          <div style="display:flex; gap:0.35rem; flex-wrap:wrap; margin-top:0.4rem;">
            <a href="${fac.directionsUrl || '#'}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline" style="padding:0.25rem 0.5rem; font-size:0.75rem; flex:1; text-align:center;">
              📍 Directions
            </a>
            <button class="btn btn-sm btn-primary" style="padding:0.25rem 0.5rem; font-size:0.75rem; flex:1;" onclick="if(typeof window.flyToFacility === 'function') window.flyToFacility(${fac.lat}, ${fac.lng}, '${fac.id}');">
              🗺️ View on Map
            </button>
            <button class="btn btn-sm btn-emerald" style="padding:0.25rem 0.5rem; font-size:0.75rem; background:#25d366; border-color:#25d366; color:#ffffff; font-weight:700; flex:1; display:flex; align-items:center; justify-content:center; gap:3px;" onclick="SwasthyaVoiceAssistant.shareFacilityToWhatsApp('${fac.id}')">
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
        🗺️ Open Full Interactive Map Tab
      </button>
    `;

    appendMessage('bot', html);
    speakResponse(speechSummary, selectedLanguage);
  }

  // Handle WhatsApp Voice Share
  async function handleWhatsAppVoiceShare(facilityId = null) {
    const cfg = getLangConfig();

    let facilities = lastFoundFacilities;
    if (!facilities || facilities.length === 0) {
      if (typeof PlacesHealthService !== 'undefined' && typeof PlacesHealthService.getSavedFacilities === 'function') {
        facilities = PlacesHealthService.getSavedFacilities();
      }
    }

    if (!facilities || facilities.length === 0) {
      if (patientCoords && typeof PlacesHealthService !== 'undefined') {
        facilities = await PlacesHealthService.fetchNearbyFacilities(patientCoords.lat, patientCoords.lng, 5, 'All', '', false);
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

    const message = `*SwasthyaConnect - Verified Healthcare Facility*%0A%0A🏥 *Hospital:* ${encodeURIComponent(targetFac.name)}%0A🏷️ *Type:* ${encodeURIComponent(targetFac.type || 'Healthcare Facility')}%0A📍 *Distance:* ${encodeURIComponent(targetFac.distance || 'Nearby')}%0A📌 *Address:* ${encodeURIComponent(targetFac.location || targetFac.address || '')}%0A🗺️ *Directions:* ${encodeURIComponent(targetFac.directionsUrl || '')}%0A%0A_Sent via SwasthyaConnect AI Voice Assistant_`;
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
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          accuracy: 50
        };
        lastLocationDebug = patientCoords;
        await executeVoiceHealthcareSearch('All', 3, locationQuery);
      } else {
        appendMessage('bot', `Could not find "${locationQuery}". Please check the spelling or PIN code.`);
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

    micBtn.classList.remove('state-listening', 'state-speaking', 'state-processing', 'state-idle');
    if (visualizer) visualizer.classList.remove('vis-active');

    if (!voiceAssistantOpen || state === 'off') {
      statusText.innerHTML = `<span class="pulse-dot" style="background:#94a3b8;"></span> ${cfg.statusOff || 'Voice Assistant Off'}`;
      micBtn.classList.add('state-idle');
    } else if (state === 'listening') {
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
    } else if (state === 'mic-denied') {
      const deniedNotice = selectedLanguage === 'te-IN' ? 'మైక్ అనుమతి నిరాకరించబడింది (టైప్ చేయండి)' :
                           selectedLanguage === 'hi-IN' ? 'माइक अनुमति अस्वीकृत (टाइप करें)' :
                           'Mic Permission Denied (Use text box)';
      statusText.innerHTML = `<span class="pulse-dot" style="background:#ef4444;"></span> ⚠️ ${deniedNotice}`;
      micBtn.classList.add('state-idle');
    } else {
      statusText.innerHTML = `<span class="pulse-dot" style="background:#64748b;"></span> ${cfg.statusReady}`;
      micBtn.classList.add('state-idle');
    }
  }

  /**
   * Switch Language (Dynamic Language Switching Pipeline)
   * 1. Updates selectedLanguage state variable immediately ('en-IN', 'te-IN', 'hi-IN')
   * 2. Re-initializes SpeechRecognition object with recognition.lang = selectedLanguage (if open)
   * 3. Selects matching native TTS voice or fallback warning
   * 4. Updates quick prompts and greets user in new language (if open)
   * 5. Translates the entire website DOM via SwasthyaI18n
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

    // 3. Update Quick Prompts in the selected language
    renderQuickPrompts();
    updateDebugInfo();

    // 4. Only re-initialize recognition, greet, or listen IF the Voice Assistant is open
    if (voiceAssistantOpen) {
      initSpeechRecognition();
      updateUIState('idle');
      const cfg = getLangConfig();
      appendMessage('bot', cfg.greeting);
      speakResponse(cfg.greetingSpeech, selectedLanguage);
      startListening();
    } else {
      updateUIState('off');
    }

    // 5. Sync with Global SwasthyaI18n to translate the ENTIRE page immediately
    if (!skipGlobalSync && typeof window.SwasthyaI18n !== 'undefined' && typeof window.SwasthyaI18n.setLanguage === 'function') {
      window.SwasthyaI18n.setLanguage(getShortLangCode(normalized), true);
    }
  }

  // Toggle Assistant Modal Window
  function toggleAssistant(shouldOpen = null) {
    const win = document.getElementById('swasthya-va-window');
    if (!win) return;

    if (shouldOpen === null) {
      voiceAssistantOpen = !voiceAssistantOpen;
    } else {
      voiceAssistantOpen = !!shouldOpen;
    }
    isOpen = voiceAssistantOpen;

    if (voiceAssistantOpen) {
      win.style.display = 'flex';
      renderQuickPrompts();
      updateDebugInfo();
      // Start fresh voice recognition session only after panel is opened
      if (!isListening && !isSpeaking) {
        startListening();
      }
    } else {
      win.style.display = 'none';
      // Immediately stop speech recognition, microphone listening, speaking, and reset state
      stopListening();
      stopSpeaking();
      updateUIState('off');
    }
  }

  // Render Language-Specific Quick Prompts
  function renderQuickPrompts() {
    const chipContainer = document.getElementById('va-chips-container');
    if (!chipContainer) return;

    const cfg = getLangConfig();
    chipContainer.innerHTML = '';

    (cfg.quickPrompts || []).forEach(prompt => {
      const btn = document.createElement('button');
      btn.className = 'va-chip-btn';
      btn.textContent = prompt;
      btn.onclick = () => {
        handleVoiceQuery(prompt);
      };
      chipContainer.appendChild(btn);
    });
  }

  // Toggle Development Diagnostic Debug Panel
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

    debugEl.innerHTML = `
      <div style="display:grid; grid-template-columns:auto 1fr; gap:3px 8px; font-family:monospace; font-size:0.75rem;">
        <strong>Voice command:</strong> <code>${escapeHTML(lastRecognizedCommand)}</code>
        <strong>Location:</strong> <span>${lastLocationDebug ? `Lat: ${lastLocationDebug.lat.toFixed(4)}, Lng: ${lastLocationDebug.lng.toFixed(4)} (±${lastLocationDebug.accuracy}m)` : 'Not detected yet'}</span>
        <strong>Search radius:</strong> <span>${lastSearchRadius} km</span>
        <strong>API status:</strong> <span style="font-weight:700; color:${lastApiStatus === 'Success' ? '#10b981' : lastApiStatus === 'Searching' ? '#3b82f6' : lastApiStatus === 'Failed' ? '#ef4444' : '#64748b'};">${lastApiStatus}</span>
        <strong>Facilities returned:</strong> <span>${lastFacilitiesCount}</span>
        <strong>Selected language:</strong> <code>${selectedLanguage}</code> (${getLangConfig().name})
        <strong>Recognition language:</strong> <code>${recognition ? recognition.lang : selectedLanguage}</code>
        <strong>Speech recognition:</strong> <span>${isSpeechSupported ? '✅ Supported' : '❌ Unsupported'}</span>
        <strong>Speech synthesis:</strong> <span>${isSynthesisSupported ? '✅ Supported' : '❌ Unsupported'}</span>
        <strong>Selected voice:</strong> <span>${selectedVoice ? `${selectedVoice.name} (${selectedVoice.lang})` : '<span style="color:#ef4444; font-weight:bold;">⚠️ None found for this language</span>'}</span>
      </div>
    `;
  }

  // Build Voice Assistant DOM UI
  function buildVoiceAssistantDOM() {
    if (document.getElementById('swasthya-va-root')) return;

    const isPatientPage = (typeof window !== 'undefined' && window.location && (
                            (window.location.pathname && (window.location.pathname.endsWith('patient.html') || window.location.pathname.endsWith('/patient'))) ||
                            (window.location.href && window.location.href.includes('patient'))
                          )) || 
                          (typeof document !== 'undefined' && (
                            document.getElementById('patient-portal-body') ||
                            (document.querySelector && document.querySelector('.portal-sidebar [data-tab="nearby"]'))
                          ));

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
        box-shadow: 0 4px 20px rgba(13, 148, 136, 0.4);
        cursor: pointer;
        font-weight: 700;
        font-size: 0.9rem;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .swasthya-va-launcher:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 24px rgba(13, 148, 136, 0.5);
      }
      .swasthya-va-window {
        position: fixed;
        bottom: 85px;
        right: 22px;
        width: 380px;
        max-width: calc(100vw - 30px);
        height: 560px;
        max-height: calc(100vh - 110px);
        background: var(--bg-surface, #ffffff);
        border: 1px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-lg, 16px);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.16);
        z-index: 9999;
        display: none;
        flex-direction: column;
        overflow: hidden;
        animation: vaSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      @keyframes vaSlideUp {
        from { opacity: 0; transform: translateY(20px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .va-header {
        background: linear-gradient(135deg, #0d9488 0%, #059669 100%);
        color: #ffffff;
        padding: 0.85rem 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .va-header-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 700;
        font-size: 0.95rem;
      }
      .va-lang-picker {
        background: rgba(255, 255, 255, 0.2);
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.4);
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.2rem 0.4rem;
        cursor: pointer;
        outline: none;
      }
      .va-lang-picker option {
        background: #0f172a;
        color: #ffffff;
      }
      .va-mic-section {
        padding: 1.15rem 1rem 0.65rem 1rem;
        text-align: center;
        border-bottom: 1px solid var(--border-light, #e2e8f0);
        position: relative;
      }
      .va-main-mic-btn {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: linear-gradient(135deg, #0d9488 0%, #059669 100%);
        color: #ffffff;
        border: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(13, 148, 136, 0.35);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .va-main-mic-btn:hover {
        transform: scale(1.06);
      }
      .va-main-mic-btn.state-listening {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
        animation: vaMicPulse 1.4s infinite;
      }
      .va-main-mic-btn.state-speaking {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        animation: vaMicSpeaking 1.2s infinite alternate;
      }
      .va-main-mic-btn.state-processing {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      }
      @keyframes vaMicPulse {
        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
        70% { transform: scale(1.05); box-shadow: 0 0 0 16px rgba(239, 68, 68, 0); }
        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
      }
      @keyframes vaMicSpeaking {
        0% { transform: scale(1.0); }
        100% { transform: scale(1.08); }
      }
      .va-visualizer-container {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 3px;
        height: 18px;
        margin-top: 6px;
      }
      .va-vis-bar {
        width: 3.5px;
        height: 4px;
        background: var(--hospital-teal-600, #0d9488);
        border-radius: 3px;
        transition: height 0.1s ease;
      }
      .vis-active .va-vis-bar:nth-child(1) { animation: visWave 0.5s infinite 0.1s; }
      .vis-active .va-vis-bar:nth-child(2) { animation: visWave 0.5s infinite 0.2s; }
      .vis-active .va-vis-bar:nth-child(3) { animation: visWave 0.5s infinite 0.3s; }
      .vis-active .va-vis-bar:nth-child(4) { animation: visWave 0.5s infinite 0.15s; }
      .vis-active .va-vis-bar:nth-child(5) { animation: visWave 0.5s infinite 0.25s; }
      @keyframes visWave {
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
      .va-chips-wrapper {
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
        max-height: 150px;
        overflow-y: auto;
      }
    `;
    document.head.appendChild(style);

    // Container DOM
    const wrap = document.createElement('div');
    wrap.id = 'swasthya-va-root';
    wrap.innerHTML = `
      <!-- Launcher Button -->
      <button id="swasthya-va-launcher-btn" class="swasthya-va-launcher" onclick="SwasthyaVoiceAssistant.toggleAssistant(true)" title="Open Multilingual Voice AI Assistant">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
        <span>Voice AI</span>
      </button>

      <!-- Assistant Window (Initially closed/off) -->
      <div id="swasthya-va-window" class="swasthya-va-window" role="dialog" aria-label="Voice AI Assistant" style="display:none;">
        <!-- Header -->
        <div class="va-header">
          <div class="va-header-title">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
            <span>Voice AI</span>
          </div>

          <div style="display:flex; align-items:center; gap:0.4rem;">
            <!-- Language Selector: English, Telugu, Hindi -->
            <select id="va-lang-select" class="va-lang-picker" onchange="SwasthyaVoiceAssistant.setLanguage(this.value)" aria-label="Select Voice Language" title="🌐 Select Voice Language">
              <option value="en-IN" selected>🌐 English</option>
              <option value="te-IN">🌐 తెలుగు (Telugu)</option>
              <option value="hi-IN">🌐 हिन्दी (Hindi)</option>
            </select>

            <button onclick="SwasthyaVoiceAssistant.toggleAssistant(false)" style="background:none; border:none; color:#ffffff; font-size:1.3rem; cursor:pointer; line-height:1; padding:0 4px;" title="Close Voice Assistant">
              &times;
            </button>
          </div>
        </div>

        <!-- Mic & Speech Visualizer -->
        <div class="va-mic-section">
          <button id="va-main-mic-btn" class="va-main-mic-btn state-idle" onclick="SwasthyaVoiceAssistant.toggleListening()" title="Click to speak">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
          </button>
          <div id="va-status-text" style="font-size:0.8rem; margin-top:0.4rem; color:var(--text-secondary); min-height:18px;">
            Voice Assistant Off
          </div>
          <div id="va-visualizer" class="va-visualizer-container">
            <div class="va-vis-bar"></div>
            <div class="va-vis-bar"></div>
            <div class="va-vis-bar"></div>
            <div class="va-vis-bar"></div>
            <div class="va-vis-bar"></div>
          </div>
        </div>

        <!-- Conversation Stream -->
        <div id="va-chat-stream" class="va-chat-stream">
          <!-- Initial Greeting -->
          <div class="va-chat-row va-row-bot">
            <div class="va-bubble va-bubble-bot">
              <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:4px;">
                <span style="font-size:0.9rem;">🤖</span>
                <strong style="font-size:0.8rem; color:var(--hospital-teal-700, #0d9488);">SwasthyaConnect Voice AI</strong>
              </div>
              <div class="va-bubble-content">
                Hi! I’m <strong>SwasthyaConnect Voice AI</strong>. How can I help you with hospitals, appointments, prescriptions, or government schemes?
              </div>
            </div>
          </div>
        </div>

        <!-- Diagnostic Debug Panel (Collapsible) -->
        <div id="va-debug-panel" class="va-debug-panel" style="display:none;">
          <div style="font-weight:700; margin-bottom:3px; color:var(--hospital-teal-700, #0d9488);">🛠️ Voice AI Engine Diagnostics:</div>
          <div id="va-debug-content">Loading diagnostics...</div>
        </div>

        <!-- Quick Prompts Chips -->
        <div id="va-chips-container" class="va-chips-wrapper"></div>

        <!-- Text Input Fallback Bar -->
        <div class="va-input-bar">
          <input type="text" id="va-text-input" class="va-input-field" placeholder="Or type your medical request..." onkeydown="if(event.key==='Enter') SwasthyaVoiceAssistant.handleTextInputSubmit()">
          <button class="btn btn-sm btn-primary" onclick="SwasthyaVoiceAssistant.handleTextInputSubmit()">
            Send
          </button>
          <button class="btn btn-sm btn-outline" style="padding:0.3rem 0.5rem; font-size:0.75rem;" onclick="SwasthyaVoiceAssistant.toggleDebugPanel()" title="Toggle Voice AI Engine Diagnostics">
            🛠️ Debug
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(wrap);
    renderQuickPrompts();
    voiceAssistantOpen = false;
    isOpen = false;
    isListening = false;
    recognition = null;
    updateUIState('off');
    updateDebugInfo();
  }

  function handleTextInputSubmit() {
    const input = document.getElementById('va-text-input');
    if (!input) return;
    const query = input.value.trim();
    if (!query) return;
    input.value = '';
    handleVoiceQuery(query);
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Public API
  window.SwasthyaVoiceAssistant = {
    get voiceAssistantOpen() {
      return voiceAssistantOpen;
    },
    set voiceAssistantOpen(val) {
      toggleAssistant(val);
    },
    get isOpen() {
      return voiceAssistantOpen;
    },
    get isListening() {
      return isListening;
    },
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
    openAssistant: () => toggleAssistant(true),
    closeAssistant: () => toggleAssistant(false),
    setLanguage,
    getLanguage: () => selectedLanguage,
    getVoiceForLanguage,
    loadAvailableVoices,
    toggleDebugPanel,
    updateDebugInfo,
    submitManualLocation,
    shareFacilityToWhatsApp: (id) => handleWhatsAppVoiceShare(id),
    handleTextInputSubmit,
    executeVoiceHealthcareSearch,
    obtainGPSCoordinates
  };

  // Auto-init on DOM ready (Builds DOM shell only, Voice Assistant remains OFF by default)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      buildVoiceAssistantDOM();
      loadAvailableVoices();
    });
  } else {
    buildVoiceAssistantDOM();
    loadAvailableVoices();
  }

  if (isSynthesisSupported && window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      loadAvailableVoices();
    };
  }

})();
