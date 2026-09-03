/**
 * SwasthyaConnect AI Voice Assistant - Universal Multilingual Edition
 * Supports all major Indian & Global languages:
 * English, Hindi (हिंदी), Telugu (తెలుగు), Tamil (தமிழ்), Kannada (ಕನ್ನಡ),
 * Malayalam (മലയാളം), Bengali (বাংলা), Marathi (मराठी), Gujarati (ગુજરાતી),
 * Punjabi (ਪੰਜਾਬੀ), Urdu (اردو), Odia (ଓଡ଼ିଆ)
 *
 * Features:
 * - Real-time Speech-to-Text & Text-to-Speech (Web Speech API)
 * - Automatic Language Detection (Unicode script analysis + NLP token parsing)
 * - GPS-driven healthcare discovery (Zero hardcoding)
 * - Multilingual intent recognition (Emergency, Hospitals, PHC, Pharmacy, Schemes, WhatsApp, Records, Appointments)
 */

(function () {
  'use strict';

  // Speech API Availability
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const isSpeechSupported = !!SpeechRecognition;
  const isSynthesisSupported = 'speechSynthesis' in window;

  // Assistant State
  let recognition = null;
  let isListening = false;
  let isSpeaking = false;
  let isProcessing = false;
  let currentLang = 'en'; // Active language
  let isOpen = false;
  let patientCoords = null;
  let availableVoices = [];

  // Multilingual Configuration for all supported languages
  const langConfig = {
    en: {
      code: 'en-IN',
      synthLang: 'en-IN',
      name: 'English',
      welcomeSpeech: 'Hello! I am your SwasthyaConnect Voice Assistant. How can I help you today with hospitals, appointments, prescriptions, or government schemes?',
      welcomeText: 'Hi! I’m <strong>SwasthyaConnect Voice Assistant</strong>. How can I help you today?',
      listeningText: '🎤 Listening... Please speak your question',
      processingText: '🧠 Processing your request...',
      speakingText: '🔊 Speaking...',
      idleText: 'Tap the microphone to speak',
      locatingText: 'Getting your real GPS location...',
      locSuccess: '📍 Location received successfully',
      locDenied: 'Location access was not granted. You can speak or type your city/PIN code.',
      micPermissionDenied: 'Microphone access was denied. Please allow microphone permission in your browser.',
      micNotSupported: 'Speech recognition is not supported in this browser. You can type your question below.',
      emergencyTitle: '🚨 Emergency Medical Assistance (Dial 108)',
      emergencySpeech: 'If you are facing a medical emergency, please dial 108 immediately for an ambulance. I have displayed emergency options and nearby trauma care.',
      nearestHospitalSpeech: (name, dist) => `I found healthcare facilities near you. The nearest one is ${name}, approximately ${dist} away.`,
      whatsAppPrompt: (name) => `I have prepared the WhatsApp message for ${name}. Click the button to open WhatsApp and review before sending.`,
      schemesSpeech: 'Ayushman Bharat PM-JAY provides up to 5 lakh rupees per family per year for cashless hospitalization at 27,000+ empanelled hospitals.',
      appointmentsSpeech: (count) => `You have ${count} upcoming doctor appointment${count === 1 ? '' : 's'}. Details are shown on your screen.`,
      prescriptionsSpeech: (count) => `You have ${count} active digital prescription${count === 1 ? '' : 's'}. Details are shown on your screen.`,
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
    hi: {
      code: 'hi-IN',
      synthLang: 'hi-IN',
      name: 'हिंदी (Hindi)',
      welcomeSpeech: 'नमस्ते! मैं आपका स्वास्थ्यकनेक्ट वॉयस असिस्टेंट हूँ। मैं अस्पताल खोजने, अपॉइंटमेंट, पर्चे या सरकारी योजनाओं में आपकी क्या मदद कर सकता हूँ?',
      welcomeText: 'नमस्ते! मैं <strong>स्वास्थ्यकनेक्ट वॉयस असिस्टेंट</strong> हूँ। मैं आपकी क्या मदद कर सकता हूँ?',
      listeningText: '🎤 सुन रहा हूँ... कृपया अपना प्रश्न बोलें',
      processingText: '🧠 आपके अनुरोध पर काम हो रहा है...',
      speakingText: '🔊 बोल रहा हूँ...',
      idleText: 'बोलने के लिए माइक बटन दबाएं',
      locatingText: 'आपका सटीक जीपीएस स्थान प्राप्त किया जा रहा है...',
      locSuccess: '📍 आपका स्थान सफलतापूर्वक प्राप्त हो गया',
      locDenied: 'स्थान अनुमति नहीं मिली। आप शहर या पिन कोड बोल सकते हैं।',
      micPermissionDenied: 'माइक्रोफ़ोन अनुमति नहीं दी गई। कृपया ब्राउज़र में माइक्रोफ़ोन चालू करें।',
      micNotSupported: 'इस ब्राउज़र में वॉयस रिकग्निशन समर्थित नहीं है। आप नीचे टाइप कर सकते हैं।',
      emergencyTitle: '🚨 आपातकालीन चिकित्सा सहायता (108 डायल करें)',
      emergencySpeech: 'यदि कोई आपात स्थिति है, तो कृपया तुरंत 108 डायल करें। मैंने नजदीकी ट्रॉमा अस्पताल स्क्रीन पर दिखा दिए हैं।',
      nearestHospitalSpeech: (name, dist) => `मुझे आपके पास अस्पताल मिले हैं। सबसे नजदीकी ${name} है, जो लगभग ${dist} की दूरी पर है।`,
      whatsAppPrompt: (name) => `मैंने ${name} के लिए व्हाट्सएप संदेश तैयार कर दिया है। भेजने से पहले देखने के लिए बटन दबाएं।`,
      schemesSpeech: 'आयुष्मान भारत योजना के तहत प्रति वर्ष प्रति परिवार ₹5 लाख तक का मुफ्त इलाज मिलता है।',
      appointmentsSpeech: (count) => `आपके पास ${count} आगामी डॉक्टर अपॉइंटमेंट हैं।`,
      prescriptionsSpeech: (count) => `आपके पास ${count} सक्रिय डिजिटल पर्चे उपलब्ध हैं।`,
      quickPrompts: [
        'नजदीकी अस्पताल खोजें',
        'सरकारी अस्पताल खोजें',
        'नजदीकी पीएचसी (PHC) दिखाएं',
        'पास की दवा दुकान खोजें',
        'मेरे अपॉइंटमेंट दिखाएं',
        'मेरे पर्चे दिखाएं',
        'आयुष्मान भारत योजना के बारे में बताएं',
        'अस्पताल व्हाट्सएप पर भेजें',
        'मुझे आपातकालीन मदद चाहिए'
      ]
    },
    te: {
      code: 'te-IN',
      synthLang: 'te-IN',
      name: 'తెలుగు (Telugu)',
      welcomeSpeech: 'నమస్కారం! నేను మీ స్వాస్థ్యకనెక్ట్ వాయిస్ అసిస్టెంట్‌ని. ఆసుపత్రులు, అపాయింట్‌మెంట్లు, ప్రిస్క్రిప్షన్లు లేదా ప్రభుత్వ పథకాల గురించి నేను మీకు ఎలా సహాయపడగలను?',
      welcomeText: 'నమస్కారం! నేను <strong>స్వాస్థ్యకనెక్ట్ వాయిస్ అసిస్టెంట్‌ని</strong>. నేను మీకు ఎలా సహాయపడగలను?',
      listeningText: '🎤 వింటున్నాను... దయచేసి మాట్లాడండి',
      processingText: '🧠 మీ అభ్యర్థనను ప్రాసెస్ చేస్తున్నాను...',
      speakingText: '🔊 సమాధానం చెబుతున్నాను...',
      idleText: 'మాట్లాడటానికి మైక్రోఫోన్ నొక్కండి',
      locatingText: 'మీ ఖచ్చితమైన జీపీఎస్ లొకేషన్ తీసుకుంటున్నాను...',
      locSuccess: '📍 లొకేషన్ విజయవంతంగా అందింది',
      locDenied: 'లొకేషన్ అనుమతి లభించలేదు. మీ ఊరు లేదా పిన్ కోడ్ చెప్పవచ్చు.',
      micPermissionDenied: 'మైక్రోఫోన్ అనుమతి నిరాకరించబడింది. దయచేసి బ్రౌజర్ సెట్టింగ్స్‌లో మైక్ ఆన్ చేయండి.',
      micNotSupported: 'ఈ బ్రౌజర్‌లో వాయిస్ రికగ్నిషన్ సపోర్ట్ లేదు. మీరు టైప్ చేయవచ్చు.',
      emergencyTitle: '🚨 అత్యవసర వైద్య సహాయం (108 కాల్ చేయండి)',
      emergencySpeech: 'వైద్య అత్యవసర పరిస్థితి అయితే వెంటనే 108కి కాల్ చేయండి. సమీపంలోని ట్రూమా ఆసుపత్రుల వివరాలను స్క్రీన్‌పై చూపించాను.',
      nearestHospitalSpeech: (name, dist) => `మీ సమీపంలో ఆరోగ్య కేంద్రాలు కనిపించాయి. అత్యంత సమీపంలో ఉన్నది ${name}, దాదాపు ${dist} దూరంలో ఉంది.`,
      whatsAppPrompt: (name) => `నేను ${name} వివరాలతో వాట్సాప్ సందేశం సిద్ధం చేసాను. పంపేముందు చూడటానికి బటన్ నొక్కండి.`,
      schemesSpeech: 'ఆయుష్మాన్ భారత్ పీఎం-జేవై పథకం ద్వారా ప్రతి కుటుంబానికి సంవత్సరానికి ₹5 లక్షల ఉచిత వైద్యం లభిస్తుంది.',
      appointmentsSpeech: (count) => `మీకు ${count} రాబోయే డాక్టర్ అపాయింట్‌మెంట్లు ఉన్నాయి. వివరాలను స్క్రీన్‌పై చూపించాను.`,
      prescriptionsSpeech: (count) => `మీకు ${count} యాక్టివ్ డిజిటల్ ప్రిస్క్రిప్షన్లు ఉన్నాయి.`,
      quickPrompts: [
        'సమీప ఆసుపత్రులను కనుగొనండి',
        'ప్రభుత్వ ఆసుపత్రులు చూపించండి',
        'సమీప పీహెచ్‌సీలు (PHC) చూపించండి',
        'సమీప మందుల దుకాణం',
        'నా అపాయింట్‌మెంట్లు చూపించండి',
        'నా ప్రిస్క్రిప్షన్లు చూపించండి',
        'ఆయుష్మాన్ భారత్ పథకం వివరాలు',
        'ఆసుపత్రిని వాట్సాప్‌కి పంపండి',
        'నాకు అత్యవసర సహాయం కావాలి'
      ]
    },
    ta: {
      code: 'ta-IN',
      synthLang: 'ta-IN',
      name: 'தமிழ் (Tamil)',
      welcomeSpeech: 'வணக்கம்! நான் உங்கள் ஸ்வஸ்த்யா கனெக்ட் குரல் உதவியாளர். மருத்துவமனைகள், முன்பதிவுகள் அல்லது அரசுத் திட்டங்கள் குறித்து நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?',
      welcomeText: 'வணக்கம்! நான் <strong>ஸ்வஸ்த்யா கனெக்ட் குரல் உதவியாளர்</strong>. நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?',
      listeningText: '🎤 கேட்கிறேன்... தயவுசெய்து பேசுங்கள்',
      processingText: '🧠 செயலாக்குகிறது...',
      speakingText: '🔊 பேசுகிறது...',
      idleText: 'பேச மைக்ரோஃபோனைத் தொடவும்',
      locatingText: 'உங்கள் ஜி.பி.எஸ் இருப்பிடத்தைக் கண்டறிகிறது...',
      locSuccess: '📍 இருப்பிடம் பெறப்பட்டது',
      locDenied: 'இருப்பிட அனுமதி கிடைக்கவில்லை.',
      micPermissionDenied: 'மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டது.',
      micNotSupported: 'குரல் உள்ளீடு ஆதரிக்கப்படவில்லை.',
      emergencyTitle: '🚨 அவசர மருத்துவ உதவி (108 அழைக்கவும்)',
      emergencySpeech: 'மருத்துவ அவசரநிலைக்கு உடனே 108 ஐ அழைக்கவும்.',
      nearestHospitalSpeech: (name, dist) => `உங்களுக்கு அருகில் உள்ள மருத்துவமனை ${name}, சுமார் ${dist} தொலைவில் உள்ளது.`,
      whatsAppPrompt: (name) => `${name} விவரங்களுடன் வாட்ஸ்அப் செய்தி தயார்.`,
      schemesSpeech: 'ஆயுஷ்மான் பாரத் திட்டம் மூலம் குடும்பத்திற்கு ₹5 லட்சம் வரை இலவச சிகிச்சை பெறலாம்.',
      appointmentsSpeech: (count) => `உங்களுக்கு ${count} மருத்துவ சந்திப்புகள் உள்ளன.`,
      prescriptionsSpeech: (count) => `உங்களுக்கு ${count} மருந்துக் குறிப்புகள் உள்ளன.`,
      quickPrompts: [
        'அருகிலுள்ள மருத்துவமனைகள்',
        'அரசு மருத்துவமனைகள்',
        'அருகிலுள்ள ஆரம்ப சுகாதார நிலையம்',
        'மருந்தகம் தேடுங்கள்',
        'என் சந்திப்புகளைக் காட்டு',
        'என் மருந்து சீட்டுகள்',
        'ஆயுஷ்மான் பாரத் திட்டம்',
        'வாட்ஸ்அப்பில் அனுப்பு',
        'அவசர உதவி தேவை'
      ]
    },
    kn: {
      code: 'kn-IN',
      synthLang: 'kn-IN',
      name: 'ಕನ್ನಡ (Kannada)',
      welcomeSpeech: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಸ್ವಾಸ್ಥ್ಯಕನೆಕ್ಟ್ ಧ್ವನಿ ಸಹಾಯಕ. ಆಸ್ಪತ್ರೆಗಳು, ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು ಅಥವಾ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
      welcomeText: 'ನಮಸ್ಕಾರ! ನಾನು <strong>ಸ್ವಾಸ್ಥ್ಯಕನೆಕ್ಟ್ ಧ್ವನಿ ಸಹಾಯಕ</strong>. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
      listeningText: '🎤 ಆಲಿಸಲಾಗುತ್ತಿದೆ... ದಯವಿಟ್ಟು ಮಾತನಾಡಿ',
      processingText: '🧠 ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತಿದೆ...',
      speakingText: '🔊 ಮಾತನಾಡಲಾಗುತ್ತಿದೆ...',
      idleText: 'ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿರಿ',
      locatingText: 'ನಿಮ್ಮ ಜಿಪಿಎಸ್ ಸ್ಥಳವನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ...',
      locSuccess: '📍 ಸ್ಥಳ ಯಶಸ್ವಿಯಾಗಿ ದೊರೆತಿದೆ',
      locDenied: 'ಸ್ಥಳದ ಅನುಮತಿ ಸಿಗಲಿಲ್ಲ.',
      micPermissionDenied: 'ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ.',
      micNotSupported: 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ.',
      emergencyTitle: '🚨 ತುರ್ತು ವೈದ್ಯಕೀಯ ನೆರವು (108 ಡಯಲ್ ಮಾಡಿ)',
      emergencySpeech: 'ತುರ್ತು ಸಂದರ್ಭದಲ್ಲಿ ದಯವಿಟ್ಟು ತಕ್ಷಣ 108 ಗೆ ಕರೆ ಮಾಡಿ.',
      nearestHospitalSpeech: (name, dist) => `ನಿಮ್ಮ ಸಮೀಪದ ಆಸ್ಪತ್ರೆ ${name}, ಸುಮಾರು ${dist} ದೂರದಲ್ಲಿದೆ.`,
      whatsAppPrompt: (name) => `${name} ಮಾಹಿತಿಯೊಂದಿಗೆ ವಾಟ್ಸಾಪ್ ಸಂದೇಶ ಸಿದ್ಧವಾಗಿದೆ.`,
      schemesSpeech: 'ಆಯುಷ್ಮಾನ್ ಭಾರತ್ ಯೋಜನೆಯಡಿ ಪ್ರತಿ ಕುಟುಂಬಕ್ಕೆ ₹5 ಲಕ್ಷದವರೆಗೆ ಉಚಿತ ಚಿಕಿತ್ಸೆ ಸಿಗುತ್ತದೆ.',
      appointmentsSpeech: (count) => `ನಿಮಗೆ ${count} ವೈದ್ಯರ ಭೇಟಿಗಳಿವೆ.`,
      prescriptionsSpeech: (count) => `ನಿಮ್ಮಲ್ಲಿ ${count} ಸಕ್ರಿಯ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ಗಳಿವೆ.`,
      quickPrompts: [
        'ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗಳನ್ನು ಹುಡುಕಿ',
        'ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆಗಳು',
        'ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರ (PHC)',
        'ಔಷಧಿ ಅಂಗಡಿ ಹುಡುಕಿ',
        'ನನ್ನ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು',
        'ನನ್ನ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ಗಳು',
        'ಆಯುಷ್ಮಾನ್ ಭಾರತ್ ಯೋಜನೆ',
        'ವಾಟ್ಸಾಪ್‌ಗೆ ಕಳುಹಿಸಿ',
        'ತುರ್ತು ನೆರವು ಬೇಕು'
      ]
    },
    ml: {
      code: 'ml-IN',
      synthLang: 'ml-IN',
      name: 'മലയാളം (Malayalam)',
      welcomeSpeech: 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ സ്വാസ്ഥ്യകണക്ട് വോയ്‌സ് അസിസ്റ്റന്റാണ്. ആശുപത്രികൾ, അപ്പോയിന്റ്‌മെന്റുകൾ അല്ലെങ്കിൽ സർക്കാർ പദ്ധതികൾ എന്നിവയിൽ ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കും?',
      welcomeText: 'നമസ്കാരം! ഞാൻ <strong>സ്വാസ്ഥ്യകണക്ട് വോയ്‌സ് അസിസ്റ്റന്റാണ്</strong>.',
      listeningText: '🎤 കേൾക്കുന്നു... ദയവായി സംസാരിക്കുക',
      processingText: '🧠 പ്രോസസ്സ് ചെയ്യുന്നു...',
      speakingText: '🔊 സംസാരിക്കുന്നു...',
      idleText: 'സംസാരിക്കാൻ മൈക്ക് അമർത്തുക',
      locatingText: 'ജിപിഎസ് ലൊക്കേഷൻ എടുക്കുന്നു...',
      locSuccess: '📍 ലൊക്കേഷൻ ലഭിച്ചു',
      locDenied: 'ലൊക്കേഷൻ അനുമതി ലഭിച്ചില്ല.',
      micPermissionDenied: 'മൈക്രോഫോൺ അനുമതി നിഷേധിച്ചു.',
      micNotSupported: 'വോയ്‌സ് റെക്കഗ്നിഷൻ പിന്തുണ ലഭ്യമല്ല.',
      emergencyTitle: '🚨 അടിയന്തര സഹായം (108 വിളിക്കുക)',
      emergencySpeech: 'അടിയന്തര ഘട്ടങ്ങളിൽ ദയവായി ഉടൻ 108 വിളിക്കുക.',
      nearestHospitalSpeech: (name, dist) => `അടുത്തുള്ള ആശുപത്രി ${name} ആണ്, ഏകദേശം ${dist} അകലെയാണ്.`,
      whatsAppPrompt: (name) => `${name} വിവരങ്ങളോടെ വാട്ട്‌സ്ആപ്പ് സന്ദേശം തയ്യാറാണ്.`,
      schemesSpeech: 'ആയുഷ്മാൻ ഭാരത് വഴി പ്രതിവർഷം 5 ലക്ഷം രൂപ വരെ സൗജന്യ ചികിത്സ ലഭിക്കും.',
      appointmentsSpeech: (count) => `നിങ്ങൾക്ക് ${count} അപ്പോയിന്റ്‌മെന്റുകൾ ഉണ്ട്.`,
      prescriptionsSpeech: (count) => `നിങ്ങൾക്ക് ${count} കുറിപ്പടികൾ ഉണ്ട്.`,
      quickPrompts: [
        'അടുത്തുള്ള ആശുപത്രികൾ',
        'സർക്കാർ ആശുപത്രികൾ',
        'പ്രാഥമിക ആരോഗ്യ കേന്ദ്രം (PHC)',
        'മെഡിക്കൽ ഷോപ്പ്',
        'എന്റെ അപ്പോയിന്റ്‌മെന്റുകൾ',
        'എന്റെ മരുന്നുകൾ',
        'ആയുഷ്മാൻ ഭാരത്',
        'വാട്ട്‌സ്ആപ്പിൽ അയക്കുക',
        'അടിയന്തര സഹായം'
      ]
    },
    bn: {
      code: 'bn-IN',
      synthLang: 'bn-IN',
      name: 'বাংলা (Bengali)',
      welcomeSpeech: 'নমস্কার! আমি আপনার স্বাস্থ্যকানেক্ট ভয়েস সহকারী। হাসপাতাল, অ্যাপয়েন্টমেন্ট বা সরকারি স্বাস্থ্য প্রকল্প সম্পর্কে কীভাবে সাহায্য করতে পারি?',
      welcomeText: 'নমস্কার! আমি <strong>স্বাস্থ্যকানেক্ট ভয়েস সহকারী</strong>।',
      listeningText: '🎤 শুনছি... অনুগ্রহ করে বলুন',
      processingText: '🧠 প্রক্রিয়া করা হচ্ছে...',
      speakingText: '🔊 কথা বলছি...',
      idleText: 'কথা বলতে মাইকে চাপ দিন',
      locatingText: 'জিপিএস অবস্থান নেওয়া হচ্ছে...',
      locSuccess: '📍 অবস্থান পাওয়া গেছে',
      locDenied: 'অবস্থানের অনুমতি মেলেনি।',
      micPermissionDenied: 'মাইক্রোফোনের অনুমতি দেওয়া হয়নি।',
      micNotSupported: 'ভয়েস রিকগনিশন সমর্থিত নয়।',
      emergencyTitle: '🚨 জরুরি চিকিৎসা সহায়তা (১০৮ ডায়াল করুন)',
      emergencySpeech: 'জরুরি পরিস্থিতিতে অবিলম্বে ১০৮ নম্বরে অ্যাম্বুলেন্স ডাকুন।',
      nearestHospitalSpeech: (name, dist) => `নিকটতম হাসপাতাল হল ${name}, প্রায় ${dist} দূরে।`,
      whatsAppPrompt: (name) => `${name} এর জন্য হোয়াটসঅ্যাপ বার্তা তৈরি।`,
      schemesSpeech: 'আয়ুষ্মান ভারত যোজনার অধীনে বার্ষিক ₹৫ লক্ষ টাকার বিনামূল্যে চিকিৎসা পাওয়া যায়।',
      appointmentsSpeech: (count) => `আপনার ${count}টি অ্যাপয়েন্টমেন্ট রয়েছে।`,
      prescriptionsSpeech: (count) => `আপনার ${count}টি প্রেসক্রিপশন রয়েছে।`,
      quickPrompts: [
        'কাছের হাসপাতাল খুঁজুন',
        'সরকারি হাসপাতাল',
        'নিকটবর্তী পিএইচসি (PHC)',
        'ওষুধের দোকান খুঁজুন',
        'আমার অ্যাপয়েন্টমেন্ট',
        'আমার প্রেসক্রিপশন',
        'আয়ুষ্মান ভারত যোজনা',
        'হোয়াটসঅ্যাপে পাঠান',
        'জরুরি সাহায্য চাই'
      ]
    },
    mr: {
      code: 'mr-IN',
      synthLang: 'mr-IN',
      name: 'मराठी (Marathi)',
      welcomeSpeech: 'नमस्कार! मी आपला स्वास्थ्यकनेक्ट व्हॉइस असिस्टंट आहे. रुग्णालये, अपॉइंटमेंट्स किंवा सरकारी योजनांबद्दल मी कशी मदत करू?',
      welcomeText: 'नमस्कार! मी <strong>स्वास्थ्यकनेक्ट व्हॉइस असिस्टंट</strong> आहे.',
      listeningText: '🎤 ऐकत आहे... कृपया बोला',
      processingText: '🧠 प्रक्रिया सुरू आहे...',
      speakingText: '🔊 बोलत आहे...',
      idleText: 'बोलण्यासाठी माइक दाबा',
      locatingText: 'जीपीएस स्थान शोधत आहे...',
      locSuccess: '📍 स्थान प्राप्त झाले',
      locDenied: 'स्थान परवानगी नाकारली.',
      micPermissionDenied: 'मायक्रोफोन परवानगी नाकारली.',
      micNotSupported: 'व्हॉइस रेकग्निशन समर्थित नाही.',
      emergencyTitle: '🚨 आपत्कालीन वैद्यकीय मदत (१०८ डायल करा)',
      emergencySpeech: 'वैद्यकीय आणीबाणीसाठी त्वरित १०८ क्रमांकावर कॉल करा.',
      nearestHospitalSpeech: (name, dist) => `सर्वात जवळचे रुग्णालय ${name} आहे, अंदाजे ${dist} अंतरावर आहे.`,
      whatsAppPrompt: (name) => `${name} साठी व्हॉट्सॲप संदेश तयार आहे.`,
      schemesSpeech: 'आयुष्मान भारत योजनेअंतर्गत प्रति कुटुंब ₹५ लाख पर्यंत मोफत उपचार मिळतात.',
      appointmentsSpeech: (count) => `आपल्याकडे ${count} अपॉइंटमेंट्स आहेत.`,
      prescriptionsSpeech: (count) => `आपल्याकडे ${count} औषधोपचार पत्रके आहेत.`,
      quickPrompts: [
        'जवळचे रुग्णालय शोधा',
        'सरकारी रुग्णालय',
        'प्राथमिक आरोग्य केंद्र (PHC)',
        'औषधांचे दुकान शोधा',
        'माझ्या अपॉइंटमेंट्स',
        'माझे प्रिस्क्रिप्शन',
        'आयुष्मान भारत योजना',
        'व्हॉट्सॲपवर पाठवा',
        'आपत्कालीन मदत हवी'
      ]
    },
    gu: {
      code: 'gu-IN',
      synthLang: 'gu-IN',
      name: 'ગુજરાતી (Gujarati)',
      welcomeSpeech: 'નમસ્તે! હું તમારો સ્વાસ્થ્યકનેક્ટ વૉઇસ આસિસ્ટન્ટ છું. હોસ્પિટલ, એપોઇન્ટમેન્ટ્સ કે સરકારી યોજનાઓમાં હું કેવી રીતે મદદ કરી શકું?',
      welcomeText: 'નમસ્તે! હું <strong>સ્વાસ્થ્યકનેક્ટ વૉઇસ આસિસ્ટન્ટ</strong> છું.',
      listeningText: '🎤 સાંભળી રહ્યો છું... કૃપા કરીને બોલો',
      processingText: '🧠 પ્રક્રિયા થઈ રહી છે...',
      speakingText: '🔊 બોલી રહ્યો છું...',
      idleText: 'બોલવા માટે માઇક દબાવો',
      locatingText: 'જીપીએસ લોકેશન મેળવી રહ્યું છે...',
      locSuccess: '📍 લોકેશન મળી ગયું',
      locDenied: 'લોકેશન પરવાનગી મળી નથી.',
      micPermissionDenied: 'માઇક્રોફોન પરવાનગી નકારી.',
      micNotSupported: 'વૉઇસ રેકગ્નિશન સપોર્ટેડ નથી.',
      emergencyTitle: '🚨 ઇમરજન્સી મેડિકલ સહાય (108 ડાયલ કરો)',
      emergencySpeech: 'ઇમરજન્સી માટે કૃપા કરીને તરત જ 108 પર કૉલ કરો.',
      nearestHospitalSpeech: (name, dist) => `સૌથી નજીકની હોસ્પિટલ ${name} છે, આશરે ${dist} દૂર છે.`,
      whatsAppPrompt: (name) => `${name} માટે વોટ્સએપ મેસેજ તૈયાર છે.`,
      schemesSpeech: 'આયુષ્માન ભારત યોજના હેઠળ વાર્ષિક ₹5 લાખ સુધીની મફત સારવાર મળે છે.',
      appointmentsSpeech: (count) => `તમારી પાસે ${count} એપોઇન્ટમેન્ટ્સ છે.`,
      prescriptionsSpeech: (count) => `તમારી પાસે ${count} દવાના પ્રિસ્ક્રિપ્શન્સ છે.`,
      quickPrompts: [
        'નજીકની હોસ્પિટલ શોધો',
        'સરકારી હોસ્પિટલ',
        'પ્રાથમિક આરોગ્ય કેન્દ્ર (PHC)',
        'દવાની દુકાન શોધો',
        'મારી એપોઇન્ટમેન્ટ્સ',
        'મારા પ્રિસ્ક્રિપ્શન્સ',
        'આયુષ્માન ભારત યોજના',
        'વોટ્સએપ પર મોકલો',
        'ઇમરજન્સી મદદ જોઈએ'
      ]
    },
    pa: {
      code: 'pa-IN',
      synthLang: 'pa-IN',
      name: 'ਪੰਜਾਬੀ (Punjabi)',
      welcomeSpeech: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਸਵਾਸਥਿਆਕਨੈਕਟ ਵੌਇਸ ਅਸਿਸਟੈਂਟ ਹਾਂ। ਹਸਪਤਾਲ, ਮੁਲਾਕਾਤਾਂ ਜਾਂ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਬਾਰੇ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?',
      welcomeText: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ <strong>ਸਵਾਸਥਿਆਕਨੈਕਟ ਵੌਇਸ ਅਸਿਸਟੈਂਟ</strong> ਹਾਂ।',
      listeningText: '🎤 ਸੁਣ ਰਿਹਾ ਹਾਂ... ਕਿਰਪਾ ਕਰਕੇ ਬੋਲੋ',
      processingText: '🧠 ਕਾਰਵਾਈ ਹੋ ਰਹੀ ਹੈ...',
      speakingText: '🔊 ਬੋਲ ਰਿਹਾ ਹਾਂ...',
      idleText: 'ਬੋਲਣ ਲਈ ਮਾਈਕ ਦਬਾਓ',
      locatingText: 'ਜੀਪੀਐਸ ਟਿਕਾਣਾ ਲੱਭ ਰਿਹਾ ਹੈ...',
      locSuccess: '📍 ਟਿਕਾਣਾ ਮਿਲ ਗਿਆ',
      locDenied: 'ਟਿਕਾਣਾ ਇਜਾਜ਼ਤ ਨਹੀਂ ਮਿਲੀ।',
      micPermissionDenied: 'ਮਾਈਕ੍ਰੋਫੋਨ ਇਜਾਜ਼ਤ ਰੱਦ ਕੀਤੀ ਗਈ।',
      micNotSupported: 'ਵੌਇਸ ਪਛਾਣ ਸਮਰਥਿਤ ਨਹੀਂ ਹੈ।',
      emergencyTitle: '🚨 ਐਮਰਜੈਂਸੀ ਮੈਡੀਕਲ ਸਹਾਇਤਾ (108 ਡਾਇਲ ਕਰੋ)',
      emergencySpeech: 'ਐਮਰਜੈਂਸੀ ਵਿੱਚ ਕਿਰਪਾ ਕਰਕੇ ਤੁਰੰਤ 108 ਡਾਇਲ ਕਰੋ।',
      nearestHospitalSpeech: (name, dist) => `ਸਭ ਤੋਂ ਨੇੜਲਾ ਹਸਪਤਾਲ ${name} ਹੈ, ਲਗਭਗ ${dist} ਦੂਰ।`,
      whatsAppPrompt: (name) => `${name} ਲਈ ਵਟਸਐਪ ਸੁਨੇਹਾ ਤਿਆਰ ਹੈ।`,
      schemesSpeech: 'ਆਯੁਸ਼ਮਾਨ ਭਾਰਤ ਸਕੀਮ ਤਹਿਤ ₹5 ਲੱਖ ਤੱਕ ਦਾ ਮੁਫ਼ਤ ਇਲਾਜ ਮਿਲਦਾ ਹੈ।',
      appointmentsSpeech: (count) => `ਤੁਹਾਡੀਆਂ ${count} ਮੁਲਾਕਾਤਾਂ ਹਨ।`,
      prescriptionsSpeech: (count) => `ਤੁਹਾਡੀਆਂ ${count} ਪਰਚੀਆਂ ਹਨ।`,
      quickPrompts: [
        'ਨੇੜਲੇ ਹਸਪਤਾਲ ਲੱਭੋ',
        'ਸਰਕਾਰੀ ਹਸਪਤਾਲ',
        'ਪ੍ਰਾਇਮਰੀ ਹੈਲਥ ਸੈਂਟਰ (PHC)',
        'ਦਵਾਈਆਂ ਦੀ ਦੁਕਾਨ',
        'ਮੇਰੀਆਂ ਮੁਲਾਕਾਤਾਂ',
        'ਮੇਰੀਆਂ ਪਰਚੀਆਂ',
        'ਆਯੁਸ਼ਮਾਨ ਭਾਰਤ ਸਕੀਮ',
        'ਵਟਸਐਪ ਤੇ ਭੇਜੋ',
        'ਐਮਰਜੈਂਸੀ ਮਦਦ ਚਾਹੀਦੀ'
      ]
    },
    ur: {
      code: 'ur-IN',
      synthLang: 'ur-IN',
      name: 'اردو (Urdu)',
      welcomeSpeech: 'السلام علیکم! میں آپ کا سواستھیہ کنیکٹ وائس اسسٹنٹ ہوں۔ ہسپتال، اپائنٹمنٹس، یا سرکاری اسکیموں کے بارے میں کیسے مدد کر سکتا ہوں؟',
      welcomeText: 'السلام علیکم! میں <strong>سواستھیہ کنیکٹ وائس اسسٹنٹ</strong> ہوں۔',
      listeningText: '🎤 سن رہا ہوں... براہ کرم بولیں',
      processingText: '🧠 عمل جاری ہے...',
      speakingText: '🔊 بول رہا ہوں...',
      idleText: 'بولنے کے لیے مائیک دبائیں',
      locatingText: 'جی پی ایس مقام حاصل کیا جا رہا ہے...',
      locSuccess: '📍 مقام موصول ہو گیا',
      locDenied: 'مقام کی اجازت نہیں ملی۔',
      micPermissionDenied: 'مائیکروفون کی اجازت مسترد کر دی گئی۔',
      micNotSupported: 'آواز کی شناخت معاون نہیں ہے۔',
      emergencyTitle: '🚨 ایمرجنسی طبی امداد (108 ڈائل کریں)',
      emergencySpeech: 'ہنگامی حالت میں فوری طور پر 108 پر ایمبولینس کے لیے کال کریں۔',
      nearestHospitalSpeech: (name, dist) => `قریب ترین ہسپتال ${name} ہے، تقریباً ${dist} کے فاصلے پر۔`,
      whatsAppPrompt: (name) => `${name} کے لیے واٹس ایپ پیغام تیار ہے۔`,
      schemesSpeech: 'آیوشمان بھارت کے تحت فی خاندان سالانہ 5 لاکھ روپے تک کا مفت علاج ملتا ہے۔',
      appointmentsSpeech: (count) => `آپ کی ${count} اپائنٹمنٹس ہیں۔`,
      prescriptionsSpeech: (count) => `آپ کے پاس ${count} نسخے ہیں۔`,
      quickPrompts: [
        'قریبی ہسپتال تلاش کریں',
        'سرکاری ہسپتال',
        'پرائمری ہیلتھ سینٹر (PHC)',
        'میڈیکل اسٹور تلاش کریں',
        'میری اپائنٹمنٹس',
        'میرے نسخے',
        'آیوشمان بھارت اسکیم',
        'واٹس ایپ پر بھیجیں',
        'ایمرجنسی مدد چاہیے'
      ]
    },
    or: {
      code: 'or-IN',
      synthLang: 'or-IN',
      name: 'ଓଡ଼ିଆ (Odia)',
      welcomeSpeech: 'ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କ ସ୍ବାସ୍ଥ୍ୟକନେକ୍ଟ ଭଏସ୍ ଆସିଷ୍ଟାଣ୍ଟ। ଡାକ୍ତରଖାନା, ଆପଏଣ୍ଟମେଣ୍ଟ କିମ୍ବା ସରକାରୀ ଯୋଜନା ବିଷୟରେ ମୁଁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?',
      welcomeText: 'ନମସ୍କାର! ମୁଁ <strong>ସ୍ବାସ୍ଥ୍ୟକନେକ୍ଟ ଭଏସ୍ ଆସିଷ୍ଟାଣ୍ଟ</strong>।',
      listeningText: '🎤 ଶୁଣୁଛି... ଦୟାକରି କୁହନ୍ତୁ',
      processingText: '🧠 ପ୍ରକ୍ରିୟାକରଣ ଚାଲିଛି...',
      speakingText: '🔊 କହୁଛି...',
      idleText: 'କହିବା ପାଇଁ ମାଇକ୍ ଦବାନ୍ତୁ',
      locatingText: 'ଜିପିଏସ୍ ଲୋକେସନ୍ ନିଆଯାଉଛି...',
      locSuccess: '📍 ଲୋକେସନ୍ ମିଳିଗଲା',
      locDenied: 'ଲୋକେସନ୍ ଅନୁମତି ମିଳିଲା ନାହିଁ।',
      micPermissionDenied: 'ମାଇକ୍ରୋଫୋନ୍ ଅନୁମତି ମିଳିଲା ନାହିଁ।',
      micNotSupported: 'ଭଏସ୍ ସପୋର୍ଟ ଉପଲବ୍ଧ ନାହିଁ।',
      emergencyTitle: '🚨 ଜରୁରୀକାଳୀନ ଚିକିତ୍ସା ସହାୟତା (୧୦୮ ଡାଏଲ କରନ୍ତୁ)',
      emergencySpeech: 'ଜରୁରୀକାଳୀନ ପରିସ୍ଥିତିରେ ଦୟାକରି ତୁରନ୍ତ ୧୦୮ କୁ କଲ୍ କରନ୍ତୁ।',
      nearestHospitalSpeech: (name, dist) => `ନିକଟତମ ଡାକ୍ତରଖାନା ହେଉଛି ${name}, ପାଖାପାଖି ${dist} ଦୂରରେ।`,
      whatsAppPrompt: (name) => `${name} ପାଇଁ ହ୍ୱାଟ୍ସଆପ୍ ବାର୍ତ୍ତା ପ୍ରସ୍ତୁତ।`,
      schemesSpeech: 'ଆୟୁଷ୍ମାନ ଭାରତ ଯୋଜନା ଅଧୀନରେ ₹୫ ଲକ୍ଷ ପର୍ଯ୍ୟନ୍ତ ମାଗଣା ଚିକିତ୍ସା ଉପଲବ୍ଧ।',
      appointmentsSpeech: (count) => `ଆପଣଙ୍କର ${count}ଟି ଆପଏଣ୍ଟମେଣ୍ଟ ଅଛି।`,
      prescriptionsSpeech: (count) => `ଆପଣଙ୍କର ${count}ଟି ପ୍ରେସକ୍ରିପସନ୍ ଅଛି।`,
      quickPrompts: [
        'ନିକଟସ୍ଥ ଡାକ୍ତରଖାନା ଖୋଜନ୍ତୁ',
        'ସରକାରୀ ଡାକ୍ତରଖାନା',
        'ପ୍ରାଥମିକ ସ୍ବାସ୍ଥ୍ୟ କେନ୍ଦ୍ର (PHC)',
        'ଔଷଧ ଦୋକାନ ଖୋଜନ୍ତୁ',
        'ମୋର ଆପଏଣ୍ଟମେଣ୍ଟ',
        'ମୋର ପ୍ରେସକ୍ରିପସନ୍',
        'ଆୟୁଷ୍ମାନ ଭାରତ ଯୋଜନା',
        'ହ୍ୱାଟ୍ସଆପ୍ ରେ ପଠାନ୍ତୁ',
        'ଜରୁରୀ ସାହାଯ୍ୟ ଦରକାର'
      ]
    }
  };

  // Automatic Language Detection (Unicode script analysis)
  function detectLanguageFromText(text) {
    if (!text) return currentLang;
    
    // Telugu script: \u0C00-\u0C7F
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
    // Tamil script: \u0B80-\u0BFF
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
    // Kannada script: \u0C80-\u0CFF
    if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';
    // Malayalam script: \u0D00-\u0D7F
    if (/[\u0D00-\u0D7F]/.test(text)) return 'ml';
    // Bengali script: \u0980-\u09FF
    if (/[\u0980-\u09FF]/.test(text)) return 'bn';
    // Gujarati script: \u0A80-\u0AFF]
    if (/[\u0A80-\u0AFF]/.test(text)) return 'gu';
    // Gurmukhi (Punjabi): \u0A00-\u0A7F
    if (/[\u0A00-\u0A7F]/.test(text)) return 'pa';
    // Arabic/Urdu: \u0600-\u06FF
    if (/[\u0600-\u06FF]/.test(text)) return 'ur';
    // Odia script: \u0B00-\u0B7F
    if (/[\u0B00-\u0B7F]/.test(text)) return 'or';
    // Devanagari script: \u0900-\u097F (Hindi or Marathi)
    if (/[\u0900-\u097F]/.test(text)) {
      if (text.includes('रुग्णालय') || text.includes('माझे') || text.includes('आहे')) return 'mr';
      return 'hi';
    }

    // Phonetic keywords in Latin/English transliteration
    const lower = text.toLowerCase();
    if (lower.includes('dawa') || lower.includes('aspataal') || lower.includes('aspatal') || lower.includes('yojana')) return 'hi';
    if (lower.includes('mandulu') || lower.includes('aspathri') || lower.includes('pathakam') || lower.includes('samipam')) return 'te';
    if (lower.includes('marunthu') || lower.includes('maruthuvamanai') || lower.includes('thittam')) return 'ta';
    if (lower.includes('aushadhi') || lower.includes('aspathre')) return 'kn';

    return currentLang;
  }

  // Load synthesized voices
  function loadVoices() {
    if (!isSynthesisSupported) return;
    availableVoices = window.speechSynthesis.getVoices();
  }

  if (isSynthesisSupported) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }

  // Initialize Speech Recognition
  function initSpeechRecognition() {
    if (!isSpeechSupported) return;

    try {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      const cfg = langConfig[currentLang] || langConfig.en;
      recognition.lang = cfg.code;

      recognition.onstart = () => {
        isListening = true;
        updateUIState('listening');
      };

      recognition.onresult = (event) => {
        isListening = false;
        const transcript = event.results[0][0].transcript;
        if (transcript && transcript.trim()) {
          // Auto-detect language if different from current
          const detectedLang = detectLanguageFromText(transcript);
          if (detectedLang && detectedLang !== currentLang && langConfig[detectedLang]) {
            setLanguage(detectedLang);
          }
          handleVoiceQuery(transcript.trim());
        } else {
          updateUIState('idle');
        }
      };

      recognition.onerror = (event) => {
        isListening = false;
        console.warn('Voice Assistant error:', event.error);
        if (event.error === 'not-allowed') {
          const msg = (langConfig[currentLang] || langConfig.en).micPermissionDenied;
          appendMessage('bot', msg);
          speakText(msg);
        }
        updateUIState('idle');
      };

      recognition.onend = () => {
        isListening = false;
        if (!isSpeaking && !isProcessing) {
          updateUIState('idle');
        }
      };
    } catch (e) {
      console.error('Speech recognition initialization failed:', e);
    }
  }

  // Start Listening
  function startListening() {
    if (!isSpeechSupported) {
      appendMessage('bot', (langConfig[currentLang] || langConfig.en).micNotSupported);
      return;
    }

    stopSpeaking();

    if (!recognition) {
      initSpeechRecognition();
    }

    if (recognition) {
      const cfg = langConfig[currentLang] || langConfig.en;
      recognition.lang = cfg.code;
      try {
        recognition.start();
      } catch (err) {
        try {
          recognition.stop();
          setTimeout(() => recognition.start(), 150);
        } catch (e) {}
      }
    }
  }

  // Stop Listening
  function stopListening() {
    if (recognition && isListening) {
      try { recognition.stop(); } catch (e) {}
    }
    isListening = false;
    updateUIState('idle');
  }

  // Text to Speech
  function speakText(text, onEndCallback = null) {
    if (!isSynthesisSupported || !text) {
      if (onEndCallback) onEndCallback();
      return;
    }

    const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
    if (!cleanText) {
      if (onEndCallback) onEndCallback();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const cfg = langConfig[currentLang] || langConfig.en;
    utterance.lang = cfg.synthLang;
    utterance.rate = 0.92; // Slightly measured pacing for elder accessibility
    utterance.pitch = 1.0;

    if (availableVoices.length > 0) {
      const targetPrefix = cfg.code.split('-')[0].toLowerCase();
      const matchedVoice = availableVoices.find(v => v.lang.toLowerCase().includes(cfg.code.toLowerCase())) ||
                           availableVoices.find(v => v.lang.toLowerCase().startsWith(targetPrefix));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    utterance.onstart = () => {
      isSpeaking = true;
      updateUIState('speaking');
    };

    utterance.onend = () => {
      isSpeaking = false;
      updateUIState('idle');
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = () => {
      isSpeaking = false;
      updateUIState('idle');
      if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.speak(utterance);
  }

  // Stop Speaking
  function stopSpeaking() {
    if (isSynthesisSupported) {
      window.speechSynthesis.cancel();
    }
    isSpeaking = false;
    if (!isListening) {
      updateUIState('idle');
    }
  }

  // Main NLP Voice Processing Engine
  async function handleVoiceQuery(query) {
    if (!query) return;

    // Detect language and update if needed
    const detected = detectLanguageFromText(query);
    if (detected && detected !== currentLang && langConfig[detected]) {
      setLanguage(detected);
    }

    appendMessage('user', query);
    updateUIState('processing');
    isProcessing = true;

    const lower = query.toLowerCase().trim();
    const cfg = langConfig[currentLang] || langConfig.en;

    // 1. EMERGENCY (108 / Ambulance / Urgent)
    if (
      lower.includes('emergency') ||
      lower.includes('आपातकालीन') ||
      lower.includes('ఆపద') ||
      lower.includes('అత్యవసరం') ||
      lower.includes('அவசரம்') ||
      lower.includes('ತುರ್ತು') ||
      lower.includes('അടിയന്തര') ||
      lower.includes('জরুরি') ||
      lower.includes('आपत्कालीन') ||
      lower.includes('ઇમરજન્સી') ||
      lower.includes('ਐਮਰਜੈਂਸੀ') ||
      lower.includes('ایمرجنسی') ||
      lower.includes('ଜରୁରୀ') ||
      lower.includes('ambulance') ||
      lower.includes('108') ||
      lower.includes('heart attack') ||
      lower.includes('accident')
    ) {
      isProcessing = false;
      const html = `
        <div class="va-emergency-card">
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">
            <span style="font-size:1.5rem;">🚨</span>
            <strong style="color:var(--hospital-cross-red); font-size:1.05rem;">${cfg.emergencyTitle}</strong>
          </div>
          <p style="margin:0 0 0.75rem 0; font-size:0.875rem;">National 24x7 Ambulance & Health Dispatch:</p>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:0.75rem;">
            <a href="tel:108" class="btn btn-danger btn-sm" style="flex:1; text-align:center; font-weight:700; font-size:0.95rem;">
              📞 Dial 108 (Ambulance)
            </a>
            <a href="tel:104" class="btn btn-outline btn-sm" style="flex:1; text-align:center; font-weight:700;">
              📞 Dial 104 (Helpline)
            </a>
          </div>
          <button class="btn btn-sm btn-primary" style="width:100%;" onclick="PulseCareUI.switchTab('emergency')">
            🏥 View Trauma Centres & SOS Guide
          </button>
        </div>
      `;
      appendMessage('bot', html);
      speakText(cfg.emergencySpeech);
      return;
    }

    // 2. WHATSAPP SHARING
    if (
      lower.includes('whatsapp') ||
      lower.includes('व्हाट्सएप') ||
      lower.includes('వాట్సాప్') ||
      lower.includes('வாட்ஸ்அப்') ||
      lower.includes('ವಾಟ್ಸಾಪ್') ||
      lower.includes('വാട്ട്സ്ആപ്പ്') ||
      lower.includes('হোয়াটসঅ্যাপ') ||
      lower.includes('व्हॉट्सॲप') ||
      lower.includes('વોટ્સએપ') ||
      lower.includes('ਵਟਸਐਪ') ||
      lower.includes('واٹس ایپ') ||
      lower.includes('ହ୍ୱାଟ୍ସଆପ୍') ||
      (lower.includes('send') && (lower.includes('hospital') || lower.includes('centre')))
    ) {
      await handleWhatsAppVoiceShare();
      return;
    }

    // 3. APPOINTMENTS
    if (
      lower.includes('appointment') ||
      lower.includes('अपॉइंटमेंट') ||
      lower.includes('అపాయింట్') ||
      lower.includes('சந்திப்பு') ||
      lower.includes('ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್') ||
      lower.includes('അപ്പോയിന്റ്മെന്റ്') ||
      lower.includes('অ্যাপয়েন্টমেন্ট') ||
      lower.includes('એપોઇન્ટમેન્ટ') ||
      lower.includes('ਮੁਲਾਕਾਤ') ||
      lower.includes('اپائنٹمنٹ') ||
      lower.includes('doctor visit') ||
      lower.includes('consultation')
    ) {
      isProcessing = false;
      const appointments = typeof PulseCareStore !== 'undefined' ? PulseCareStore.getAppointments() : [];
      const upcoming = appointments.filter(a => a.status === 'Upcoming' || a.status === 'Confirmed');

      let html = `<div style="font-size:0.9rem; margin-bottom:0.5rem;">📅 <strong>Upcoming Appointments (${upcoming.length})</strong>:</div>`;
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
        html += `<button class="btn btn-sm btn-primary" style="width:100%; margin-top:0.6rem;" onclick="PulseCareUI.switchTab('appointments')">View All Appointments</button>`;
      } else {
        html += `<p style="font-size:0.85rem; color:var(--text-muted);">No upcoming appointments scheduled.</p>`;
        html += `<button class="btn btn-sm btn-primary" style="width:100%;" onclick="PulseCareUI.openModal('book-apt-modal')">Book New Appointment</button>`;
      }

      appendMessage('bot', html);
      speakText(cfg.appointmentsSpeech(upcoming.length));
      return;
    }

    // 4. PRESCRIPTIONS & MEDICAL RECORDS
    if (
      lower.includes('prescription') ||
      lower.includes('medicine') ||
      lower.includes('medication') ||
      lower.includes('पर्चे') ||
      lower.includes('दवा') ||
      lower.includes('మందులు') ||
      lower.includes('மருந்து') ||
      lower.includes('ಔಷಧಿ') ||
      lower.includes('മരുന്ന്') ||
      lower.includes('প্রেসক্রিপশন') ||
      lower.includes('प्रिस्क्रिप्शन') ||
      lower.includes('પરચੀਆਂ') ||
      lower.includes('نسخے') ||
      lower.includes('ପ୍ରେସକ୍ରିପସନ୍') ||
      lower.includes('records') ||
      lower.includes('lab')
    ) {
      isProcessing = false;
      const prescriptions = typeof PulseCareStore !== 'undefined' ? PulseCareStore.getPrescriptions() : [];
      let html = `<div style="font-size:0.9rem; margin-bottom:0.5rem;">💊 <strong>Active Prescriptions & Records</strong>:</div>`;
      if (prescriptions.length > 0) {
        html += `<div style="display:flex; flex-direction:column; gap:0.5rem;">`;
        prescriptions.slice(0, 2).forEach(p => {
          html += `
            <div style="padding:0.6rem; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border-light); font-size:0.85rem;">
              <strong>Rx by ${p.doctorName || 'Attending Physician'}</strong> (${p.date})<br>
              <span style="color:var(--text-muted); font-size:0.8rem;">Diagnosis: ${p.diagnosis || 'Clinical Checkup'}</span><br>
              <span style="color:var(--hospital-teal-700); font-weight:600; font-size:0.8rem;">Medications: ${p.medications ? p.medications.map(m => m.name || m).join(', ') : 'Paracetamol, Amoxicillin'}</span>
            </div>
          `;
        });
        html += `</div>`;
        html += `<button class="btn btn-sm btn-primary" style="width:100%; margin-top:0.6rem;" onclick="PulseCareUI.switchTab('records')">Open Health Records</button>`;
      } else {
        html += `<p style="font-size:0.85rem; color:var(--text-muted);">No active prescriptions found.</p>`;
        html += `<button class="btn btn-sm btn-primary" style="width:100%;" onclick="PulseCareUI.switchTab('records')">View All Records</button>`;
      }

      appendMessage('bot', html);
      speakText(cfg.prescriptionsSpeech(prescriptions.length));
      return;
    }

    // 5. GOVERNMENT HEALTH SCHEMES (PM-JAY, Arogyasri, Jan Aushadhi)
    if (
      lower.includes('scheme') ||
      lower.includes('ayushman') ||
      lower.includes('pmjay') ||
      lower.includes('pm-jay') ||
      lower.includes('योजना') ||
      lower.includes('పథకం') ||
      lower.includes('திட்டம்') ||
      lower.includes('ಯೋಜನೆ') ||
      lower.includes('പദ്ധതി') ||
      lower.includes('যোজনা') ||
      lower.includes('યોજના') ||
      lower.includes('ਸਕੀਮ') ||
      lower.includes('اسکیم') ||
      lower.includes('ଯୋଜନା') ||
      lower.includes('aarogyasri') ||
      lower.includes('aushadhi')
    ) {
      isProcessing = false;
      const html = `
        <div class="va-scheme-card" style="padding:0.75rem; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border-light);">
          <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.4rem;">
            <span style="font-size:1.3rem;">🏛️</span>
            <strong style="color:var(--hospital-teal-800); font-size:0.95rem;">Ayushman Bharat PM-JAY</strong>
          </div>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin:0 0 0.6rem 0;">
            Provides <strong>₹5,00,000 per family per year</strong> cashless treatment across 27,000+ empanelled government and private hospitals.
          </p>
          <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
            <button class="btn btn-sm btn-primary" style="flex:1;" onclick="PulseCareUI.switchTab('schemes')">
              Check Eligibility
            </button>
            <a href="https://pmjay.gov.in" target="_blank" rel="noopener" class="btn btn-sm btn-outline" style="flex:1; text-align:center;">
              Official Portal ↗
            </a>
          </div>
        </div>
      `;
      appendMessage('bot', html);
      speakText(cfg.schemesSpeech);
      return;
    }

    // 6. HEALTHCARE FACILITIES SEARCH (Default / Primary Intent)
    let category = 'All';
    if (
      lower.includes('government') || lower.includes('सरकारी') || lower.includes('ప్రభుత్వ') ||
      lower.includes('அரசு') || lower.includes('ಸರ್ಕಾರಿ') || lower.includes('സർക്കാർ') ||
      lower.includes('সরকারি') || lower.includes('સરકારી') || lower.includes('ਸਰਕਾਰੀ') ||
      lower.includes('سرکاری') || lower.includes('ସରକାରୀ')
    ) {
      category = 'Government Hospitals';
    } else if (
      lower.includes('phc') || lower.includes('primary') || lower.includes('प्राथमिक') ||
      lower.includes('ప్రాథమిక') || lower.includes('ஆரம்ப') || lower.includes('ಪ್ರಾಥಮିକ') ||
      lower.includes('പ്രാഥമിക') || lower.includes('প্রাথমিক') || lower.includes('ਪ੍ਰਾਇਮਰੀ') ||
      lower.includes('پرائمری') || lower.includes('ପ୍ରାଥମିକ')
    ) {
      category = 'PHC (Primary Health)';
    } else if (
      lower.includes('chc') || lower.includes('community') || lower.includes('सामुदायिक') ||
      lower.includes('కమ్యూనిటీ') || lower.includes('சமூக')
    ) {
      category = 'CHC (Community Health)';
    } else if (
      lower.includes('pharmacy') || lower.includes('chemist') || lower.includes('दवा') ||
      lower.includes('మందుల') || lower.includes('மருந்தகம்') || lower.includes('ಔಷಧಿ') ||
      lower.includes('മെഡിക്കൽ') || lower.includes('ওষুধ') || lower.includes('દવા') ||
      lower.includes('ਮੈਡੀਕਲ') || lower.includes('میڈیکل') || lower.includes('ଔଷଧ')
    ) {
      category = 'Pharmacies & Jan Aushadhi';
    } else if (
      lower.includes('diagnostic') || lower.includes('lab') || lower.includes('blood test') ||
      lower.includes('టెస్ట్') || lower.includes('சோதனை') || lower.includes('ಟೆಸ್ಟ್') ||
      lower.includes('ടെസ്റ്റ്') || lower.includes('টেস্ট') || lower.includes('ટેસ્ટ') ||
      lower.includes('ਟੈਸਟ') || lower.includes('ٹیسٹ') || lower.includes('ଟେଷ୍ଟ')
    ) {
      category = 'Diagnostic Labs';
    } else if (
      lower.includes('clinic') || lower.includes('dispensary') || lower.includes('क्लिनिक') ||
      lower.includes('క్లినిక్') || lower.includes('கிளினிக்') || lower.includes('ಕ್ಲಿನಿಕ್') ||
      lower.includes('ക്ലിനിക്ക്') || lower.includes('ক্লিনিক') || lower.includes('ક્લિનિક') ||
      lower.includes('ਕਲੀਨਿਕ') || lower.includes('کلینک') || lower.includes('କ୍ଲିନିକ୍')
    ) {
      category = 'Clinics & Dispensaries';
    }

    // Radius parser
    let radius = 5;
    const matchKm = lower.match(/(\d+)\s*(km|kilometre|kilometer|किमी|కిమీ|கிமீ|ಕಿಮೀ|കിമീ|কিমি|કિમી|ਕਿਲੋਮੀਟਰ|کلومیٹر|କିମି)/);
    if (matchKm && matchKm[1]) {
      radius = parseInt(matchKm[1], 10);
    }

    await executeVoiceHealthcareSearch(category, radius, query);
  }

  // Execute Real Location Healthcare Search for Voice
  async function executeVoiceHealthcareSearch(category = 'All', radius = 5, userQuery = '') {
    const cfg = langConfig[currentLang] || langConfig.en;

    if (!patientCoords) {
      appendMessage('bot', `<p style="margin:0; font-size:0.875rem;">📡 <em>${cfg.locatingText}</em></p>`);
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
        speakText(cfg.locDenied);
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
    } else if (window.SwasthyaWhatsAppAI && typeof window.SwasthyaWhatsAppAI.fetchFacilities === 'function') {
      results = await window.SwasthyaWhatsAppAI.fetchFacilities(patientCoords.lat, patientCoords.lng, radius, category);
    }

    isProcessing = false;

    if (!results || results.length === 0) {
      const noResultsText = `No healthcare centres found within ${radius} km. Try expanding the search radius.`;
      appendMessage('bot', `<p style="margin:0; font-size:0.875rem;">🏥 ${noResultsText}</p>`);
      speakText(noResultsText);
      updateUIState('idle');
      return;
    }

    const topFacility = results[0];
    const speechSummary = cfg.nearestHospitalSpeech(topFacility.name, topFacility.distance);

    let html = `
      <div style="font-size:0.85rem; margin-bottom:0.5rem; color:var(--text-muted);">
        📍 Found <strong>${results.length}</strong> facilities near your location (within ${radius} km):
      </div>
      <div style="display:flex; flex-direction:column; gap:0.6rem; max-height:260px; overflow-y:auto; padding-right:4px;">
    `;

    results.slice(0, 3).forEach(fac => {
      html += `
        <div class="va-facility-card" style="padding:0.65rem; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border-light); box-shadow:var(--shadow-sm);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem; margin-bottom:0.3rem;">
            <strong style="font-size:0.9rem; color:var(--text-primary);">🏥 ${fac.name}</strong>
            <span class="badge badge-emerald" style="font-size:0.7rem; white-space:nowrap;">📍 ${fac.distance}</span>
          </div>
          <p style="font-size:0.775rem; color:var(--text-secondary); margin:0 0 0.35rem 0;">📌 ${fac.location}</p>
          <div style="display:flex; gap:0.35rem; flex-wrap:wrap;">
            <a href="${fac.directionsUrl}" target="_blank" rel="noopener" class="btn btn-sm btn-outline" style="padding:0.2rem 0.5rem; font-size:0.75rem; flex:1; text-align:center;">
              🗺️ Directions
            </a>
            <button class="btn btn-sm btn-emerald" style="padding:0.2rem 0.5rem; font-size:0.75rem; background:#25d366; border-color:#25d366; color:#ffffff; font-weight:700; flex:1;" onclick="SwasthyaVoiceAssistant.shareFacilityToWhatsApp('${fac.id}')">
              <svg class="wa-icon" viewBox="0 0 24 24" style="width:12px; height:12px; fill:#ffffff;"><path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.275-.1-.475-.15-.675.15-.2.3-.776.979-.951 1.18-.175.2-.35.225-.651.075-.3-.15-1.267-.467-2.414-1.489-.893-.796-1.496-1.78-1.671-2.08-.175-.3-.019-.462.131-.611.136-.134.301-.35.451-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.585-.492-.505-.675-.514-.175-.009-.375-.009-.575-.009s-.525.075-.8.375c-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.115 3.23 5.124 4.53.716.31 1.275.495 1.71.634.72.229 1.375.197 1.892.12.576-.086 1.78-.727 2.03-1.429.25-.702.25-1.303.175-1.429-.075-.126-.275-.201-.576-.351zM12.004 2C6.48 2 2 6.48 2 12.004c0 1.947.558 3.766 1.523 5.309L2.1 21.9l4.747-1.397A9.954 9.954 0 0 0 12.004 22c5.524 0 10.004-4.48 10.004-10.004C22.008 6.48 17.528 2 12.004 2zm0 18.292c-1.644 0-3.173-.487-4.464-1.326l-.32-.208-2.82.83.844-2.738-.228-.337A8.257 8.257 0 0 1 3.712 12c0-4.572 3.72-8.292 8.292-8.292s8.292 3.72 8.292 8.292-3.72 8.292-8.292 8.292z"/></svg>
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      `;
    });

    html += `
      </div>
      <button class="btn btn-sm btn-outline" style="width:100%; margin-top:0.6rem;" onclick="PulseCareUI.switchTab('nearby')">
        🗺️ View All on Map & Nearby Tab
      </button>
    `;

    appendMessage('bot', html);
    speakText(speechSummary);
  }

  // Handle WhatsApp Voice Sharing
  async function handleWhatsAppVoiceShare(facilityId = null) {
    const cfg = langConfig[currentLang] || langConfig.en;

    if (!patientCoords) {
      try { await obtainGPSCoordinates(); } catch (e) {}
    }

    let facilities = [];
    if (typeof PlacesHealthService !== 'undefined' && typeof PlacesHealthService.getSavedFacilities === 'function') {
      facilities = PlacesHealthService.getSavedFacilities();
    }

    if (!facilities || facilities.length === 0) {
      if (patientCoords) {
        facilities = await PlacesHealthService.fetchNearbyFacilities(patientCoords.lat, patientCoords.lng, 5, 'All');
      }
    }

    let targetFac = null;
    if (facilityId && facilities.length > 0) {
      targetFac = facilities.find(f => f.id === facilityId);
    }
    if (!targetFac && facilities && facilities.length > 0) {
      targetFac = facilities[0];
    }

    isProcessing = false;

    if (!targetFac) {
      const errText = 'No hospital details available to share on WhatsApp yet. Please ask for nearby hospitals first.';
      appendMessage('bot', errText);
      speakText(errText);
      return;
    }

    const message = `*SwasthyaConnect Healthcare Facility Information*%0A%0A*Facility:* ${encodeURIComponent(targetFac.name)}%0A*Type:* ${encodeURIComponent(targetFac.type || 'Healthcare')}%0A*Distance:* ${encodeURIComponent(targetFac.distance)}%0A*Address:* ${encodeURIComponent(targetFac.location)}%0A*Directions (Google Maps):* ${encodeURIComponent(targetFac.directionsUrl)}%0A%0A_Sent via SwasthyaConnect Voice Assistant_`;
    const waUrl = `https://api.whatsapp.com/send?text=${message}`;

    const html = `
      <div style="padding:0.75rem; background:rgba(37, 211, 102, 0.08); border:1px solid rgba(37, 211, 102, 0.3); border-radius:var(--radius-sm); font-size:0.85rem;">
        <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.4rem;">
          <svg class="wa-icon" viewBox="0 0 24 24" style="width:18px; height:18px; fill:#25d366;"><path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.275-.1-.475-.15-.675.15-.2.3-.776.979-.951 1.18-.175.2-.35.225-.651.075-.3-.15-1.267-.467-2.414-1.489-.893-.796-1.496-1.78-1.671-2.08-.175-.3-.019-.462.131-.611.136-.134.301-.35.451-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.585-.492-.505-.675-.514-.175-.009-.375-.009-.575-.009s-.525.075-.8.375c-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.115 3.23 5.124 4.53.716.31 1.275.495 1.71.634.72.229 1.375.197 1.892.12.576-.086 1.78-.727 2.03-1.429.25-.702.25-1.303.175-1.429-.075-.126-.275-.201-.576-.351zM12.004 2C6.48 2 2 6.48 2 12.004c0 1.947.558 3.766 1.523 5.309L2.1 21.9l4.747-1.397A9.954 9.954 0 0 0 12.004 22c5.524 0 10.004-4.48 10.004-10.004C22.008 6.48 17.528 2 12.004 2zm0 18.292c-1.644 0-3.173-.487-4.464-1.326l-.32-.208-2.82.83.844-2.738-.228-.337A8.257 8.257 0 0 1 3.712 12c0-4.572 3.72-8.292 8.292-8.292s8.292 3.72 8.292 8.292-3.72 8.292-8.292 8.292z"/></svg>
          <strong style="color:#075e54;">WhatsApp Message Ready</strong>
        </div>
        <p style="margin:0 0 0.5rem 0; color:var(--text-secondary);">
          Review hospital details for <strong>${targetFac.name}</strong> before sending:
        </p>
        <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-emerald" style="width:100%; text-align:center; background:#25d366; border-color:#25d366; color:#ffffff; font-weight:700;">
          📱 Open WhatsApp & Send
        </a>
      </div>
    `;

    appendMessage('bot', html);
    speakText(cfg.whatsAppPrompt(targetFac.name));
  }

  // Obtain REAL GPS Coordinates (Strictly no hardcoding)
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

  // Manual Location Submit
  async function submitManualLocation(val) {
    const input = document.getElementById('va-manual-loc-input');
    const locationQuery = val || (input ? input.value.trim() : '');
    if (!locationQuery) return;

    appendMessage('user', `Location: ${locationQuery}`);
    updateUIState('processing');

    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}&countrycodes=in&limit=1`, {
        headers: { 'User-Agent': 'SwasthyaConnect/1.0' }
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
        appendMessage('bot', `Could not find "${locationQuery}". Searching general healthcare...`);
        updateUIState('idle');
      }
    } catch (e) {
      appendMessage('bot', `Failed to locate area. Please try again.`);
      updateUIState('idle');
    }
  }

  // Append Chat Message
  function appendMessage(sender, contentHtml) {
    const stream = document.getElementById('va-chat-stream');
    if (!stream) return;

    const row = document.createElement('div');
    row.className = `va-chat-row ${sender === 'user' ? 'va-row-user' : 'va-row-bot'}`;

    if (sender === 'user') {
      row.innerHTML = `
        <div class="va-bubble va-bubble-user">
          <span style="font-size:0.75rem; color:rgba(255,255,255,0.7); display:block; margin-bottom:2px;">You said:</span>
          ${contentHtml}
        </div>
      `;
    } else {
      row.innerHTML = `
        <div class="va-bubble va-bubble-bot">
          <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:4px;">
            <span style="font-size:0.9rem;">🤖</span>
            <strong style="font-size:0.8rem; color:var(--hospital-teal-700);">SwasthyaConnect Voice AI</strong>
          </div>
          <div class="va-bubble-content">${contentHtml}</div>
        </div>
      `;
    }

    stream.appendChild(row);
    stream.scrollTop = stream.scrollHeight;
  }

  // UI Status & Visualizer
  function updateUIState(state) {
    const statusText = document.getElementById('va-status-text');
    const micBtn = document.getElementById('va-main-mic-btn');
    const visualizer = document.getElementById('va-visualizer');
    const cfg = langConfig[currentLang] || langConfig.en;

    if (!statusText || !micBtn) return;

    micBtn.classList.remove('state-listening', 'state-processing', 'state-speaking', 'state-idle');
    if (visualizer) visualizer.classList.remove('vis-active');

    if (state === 'listening') {
      statusText.innerHTML = `<span class="pulse-dot" style="background:#ef4444;"></span> ${cfg.listeningText}`;
      micBtn.classList.add('state-listening');
      if (visualizer) visualizer.classList.add('vis-active');
    } else if (state === 'processing') {
      statusText.innerHTML = `<span class="pulse-dot" style="background:#3b82f6;"></span> ${cfg.processingText}`;
      micBtn.classList.add('state-processing');
    } else if (state === 'speaking') {
      statusText.innerHTML = `<span class="pulse-dot" style="background:#10b981;"></span> ${cfg.speakingText}`;
      micBtn.classList.add('state-speaking');
      if (visualizer) visualizer.classList.add('vis-active');
    } else {
      statusText.innerHTML = `<span class="pulse-dot" style="background:#64748b;"></span> ${cfg.idleText}`;
      micBtn.classList.add('state-idle');
    }
  }

  // Toggle Assistant Modal
  function toggleAssistant(shouldOpen = null) {
    const win = document.getElementById('swasthya-va-window');
    if (!win) return;

    isOpen = shouldOpen !== null ? shouldOpen : !isOpen;
    win.style.display = isOpen ? 'flex' : 'none';

    if (isOpen) {
      // Sync with global i18n language if set
      if (typeof SwasthyaI18n !== 'undefined' && typeof SwasthyaI18n.getLanguage === 'function') {
        const globalLang = SwasthyaI18n.getLanguage();
        if (globalLang && langConfig[globalLang] && globalLang !== currentLang) {
          setLanguage(globalLang);
        }
      }

      const cfg = langConfig[currentLang] || langConfig.en;
      const stream = document.getElementById('va-chat-stream');
      if (stream && stream.children.length === 0) {
        appendMessage('bot', cfg.welcomeText);
        speakText(cfg.welcomeSpeech);
      }
    } else {
      stopListening();
      stopSpeaking();
    }
  }

  // Set Language
  function setLanguage(lang) {
    if (!langConfig[lang]) return;
    currentLang = lang;
    const select = document.getElementById('va-lang-select');
    if (select && select.value !== lang) {
      select.value = lang;
    }

    if (recognition) {
      recognition.lang = langConfig[lang].code;
    }

    renderQuickPrompts();
    updateUIState('idle');
  }

  // Render Language Quick Prompts
  function renderQuickPrompts() {
    const container = document.getElementById('va-quick-prompts');
    if (!container) return;

    const cfg = langConfig[currentLang] || langConfig.en;
    container.innerHTML = cfg.quickPrompts.map(p => `
      <button type="button" class="va-chip-btn" onclick="SwasthyaVoiceAssistant.handleVoiceQuery('${p.replace(/'/g, "\\'")}')">
        💬 "${p}"
      </button>
    `).join('');
  }

  // Build Voice Assistant DOM
  function buildVoiceAssistantDOM() {
    const isPatientPage = window.location.pathname.endsWith('patient.html') || 
                          window.location.pathname.endsWith('/patient') ||
                          document.getElementById('patient-portal-body') ||
                          document.querySelector('.portal-sidebar [data-tab="nearby"]');

    if (!isPatientPage) {
      return;
    }

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
        75%, 100% {
          transform: scale(1.15, 1.3);
          opacity: 0;
        }
      }

      .swasthya-va-window {
        position: fixed;
        bottom: 150px;
        right: 22px;
        width: 390px;
        max-width: calc(100vw - 32px);
        height: 570px;
        max-height: calc(100vh - 180px);
        background: var(--bg-surface);
        border: 1px solid var(--border-light);
        border-radius: var(--radius-lg);
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

      .va-status-bar {
        background: var(--bg-surface-elevated);
        padding: 0.45rem 1rem;
        border-bottom: 1px solid var(--border-light);
        font-size: 0.8rem;
        color: var(--text-secondary);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .va-mic-area {
        background: linear-gradient(180deg, var(--bg-surface-elevated) 0%, var(--bg-surface) 100%);
        padding: 1.15rem 1rem 0.65rem 1rem;
        text-align: center;
        border-bottom: 1px solid var(--border-light);
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
        background: var(--hospital-teal-600);
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
        background: var(--bg-surface);
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
        border-radius: var(--radius-md);
        font-size: 0.85rem;
        line-height: 1.4;
      }
      .va-bubble-user {
        background: linear-gradient(135deg, #0d9488 0%, #059669 100%);
        color: #ffffff;
        border-bottom-right-radius: var(--radius-xs);
      }
      .va-bubble-bot {
        background: var(--bg-surface-elevated);
        border: 1px solid var(--border-light);
        color: var(--text-primary);
        border-bottom-left-radius: var(--radius-xs);
      }

      .va-quick-prompts {
        display: flex;
        gap: 0.35rem;
        overflow-x: auto;
        padding: 0.5rem 0.9rem;
        background: var(--bg-surface-elevated);
        border-top: 1px solid var(--border-light);
        white-space: nowrap;
      }
      .va-chip-btn {
        background: var(--bg-surface);
        border: 1px solid var(--border-light);
        color: var(--text-secondary);
        font-size: 0.75rem;
        padding: 0.25rem 0.6rem;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .va-chip-btn:hover {
        background: var(--hospital-teal-600);
        color: #ffffff;
        border-color: var(--hospital-teal-600);
      }

      .va-input-bar {
        padding: 0.6rem 0.9rem;
        background: var(--bg-surface);
        border-top: 1px solid var(--border-light);
        display: flex;
        gap: 0.4rem;
      }
      .va-input-field {
        flex: 1;
        padding: 0.45rem 0.75rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-light);
        background: var(--bg-input);
        color: var(--text-primary);
        font-size: 0.85rem;
        outline: none;
      }
      .va-input-field:focus {
        border-color: var(--hospital-teal-600);
      }
    `;

    document.head.appendChild(style);

    // Build language options dynamically
    const langOptionsHtml = Object.keys(langConfig).map(k => `
      <option value="${k}" ${k === currentLang ? 'selected' : ''} style="color:#000;">${langConfig[k].name}</option>
    `).join('');

    // DOM markup
    const wrap = document.createElement('div');
    wrap.id = 'swasthya-va-root';
    wrap.innerHTML = `
      <button id="swasthya-va-launcher" class="swasthya-va-launcher" title="Open SwasthyaConnect AI Voice Assistant" onclick="SwasthyaVoiceAssistant.toggleAssistant()">
        <span class="va-pulse-ring"></span>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
        <span>Voice AI</span>
      </button>

      <div id="swasthya-va-window" class="swasthya-va-window">
        
        <div class="va-header">
          <div class="va-header-title">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
            <span>Voice Assistant</span>
          </div>

          <div style="display:flex; align-items:center; gap:0.4rem;">
            <!-- Language Dropdown (All Major Indian & Global Languages) -->
            <select id="va-lang-select" onchange="SwasthyaVoiceAssistant.setLanguage(this.value)" style="background:rgba(255,255,255,0.2); color:#ffffff; border:1px solid rgba(255,255,255,0.4); border-radius:var(--radius-xs); padding:2px 6px; font-size:0.75rem; font-weight:600; outline:none; cursor:pointer;" title="Change Language / भाषा बदलें / భాషను మార్చండి">
              ${langOptionsHtml}
            </select>

            <button onclick="SwasthyaVoiceAssistant.toggleAssistant(false)" style="background:none; border:none; color:#ffffff; font-size:1.2rem; cursor:pointer; line-height:1; padding:0 4px;" title="Close Voice Assistant">
              &times;
            </button>
          </div>
        </div>

        <div class="va-status-bar">
          <span id="va-status-text"><span class="pulse-dot" style="background:#64748b;"></span> Tap the microphone to speak</span>
          <button class="btn btn-sm btn-outline" style="padding:1px 6px; font-size:0.7rem;" onclick="SwasthyaVoiceAssistant.stopSpeaking()" title="Stop Voice Speaking">
            ⏹ Stop
          </button>
        </div>

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

        <div id="va-chat-stream" class="va-chat-stream">
          <!-- Populated dynamically -->
        </div>

        <div id="va-quick-prompts" class="va-quick-prompts">
          <!-- Populated dynamically -->
        </div>

        <form class="va-input-bar" onsubmit="event.preventDefault(); SwasthyaVoiceAssistant.handleTextInputSubmit();">
          <input type="text" id="va-text-input" class="va-input-field" placeholder="Or type your healthcare question here...">
          <button type="submit" class="btn btn-sm btn-primary" style="padding:0.4rem 0.8rem;">
            Send
          </button>
        </form>

      </div>
    `;

    document.body.appendChild(wrap);
    renderQuickPrompts();
  }

  function handleTextInputSubmit() {
    const input = document.getElementById('va-text-input');
    if (!input || !input.value.trim()) return;
    const query = input.value.trim();
    input.value = '';
    handleVoiceQuery(query);
  }

  function toggleListening() {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  // Public API
  window.SwasthyaVoiceAssistant = {
    startListening,
    stopListening,
    toggleListening,
    stopSpeaking,
    speakText,
    handleVoiceQuery,
    toggleAssistant,
    setLanguage,
    submitManualLocation,
    shareFacilityToWhatsApp: (id) => handleWhatsAppVoiceShare(id),
    handleTextInputSubmit,
    detectLanguageFromText
  };

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildVoiceAssistantDOM);
  } else {
    buildVoiceAssistantDOM();
  }

})();
