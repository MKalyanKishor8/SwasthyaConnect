/**
 * SwasthyaConnect AI Voice Assistant
 * Voice-first interactive healthcare companion for rural & urban patients.
 * Uses Web Speech API (SpeechRecognition + SpeechSynthesis) with English, Hindi, and Telugu support.
 */

(function () {
  'use strict';

  // Speech Recognition API Availability
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const isSpeechSupported = !!SpeechRecognition;
  const isSynthesisSupported = 'speechSynthesis' in window;

  // Assistant State
  let recognition = null;
  let isListening = false;
  let isSpeaking = false;
  let isProcessing = false;
  let currentLang = 'en'; // 'en', 'hi', 'te'
  let isOpen = false;
  let patientCoords = null;
  let lastSpokenText = '';
  let speechQueue = [];
  let availableVoices = [];

  // Language configuration mapping
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
      micPermissionDenied: 'Microphone access was denied. Please allow microphone permission in your browser to use voice commands.',
      micNotSupported: 'Speech recognition is not supported in this browser. You can type your question below.',
      emergencyTitle: '🚨 Emergency Medical Assistance (Dial 108)',
      emergencySpeech: 'If you are facing a medical emergency, please dial 108 immediately for an ambulance. I have displayed emergency options and nearby trauma care.',
      nearestHospitalSpeech: (name, dist) => `I found healthcare facilities near you. The nearest one is ${name}, approximately ${dist} away.`,
      whatsAppPrompt: (name) => `I have prepared the WhatsApp message for ${name}. Click the button to open WhatsApp and review before sending.`,
      schemesSpeech: 'Ayushman Bharat PM-JAY provides up to 5 lakh rupees per family per year for cashless hospitalization at 27,000+ empanelled hospitals.',
      appointmentsSpeech: (count) => `You have ${count} upcoming doctor appointment${count === 1 ? '' : 's'}. I have displayed the details on your screen.`,
      prescriptionsSpeech: (count) => `You have ${count} active digital prescription${count === 1 ? '' : 's'}. I have displayed them for you.`,
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
      micPermissionDenied: 'माइक्रोफ़ोन अनुमति नहीं दी गई। कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन चालू करें।',
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
    }
  };

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
          handleVoiceQuery(transcript.trim());
        } else {
          updateUIState('idle');
        }
      };

      recognition.onerror = (event) => {
        isListening = false;
        console.warn('Voice Assistant speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          appendMessage('bot', (langConfig[currentLang] || langConfig.en).micPermissionDenied);
          speakText((langConfig[currentLang] || langConfig.en).micPermissionDenied);
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
      console.error('Error initializing speech recognition:', e);
    }
  }

  // Start listening to patient voice
  function startListening() {
    if (!isSpeechSupported) {
      appendMessage('bot', (langConfig[currentLang] || langConfig.en).micNotSupported);
      return;
    }

    // Stop speaking if currently talking
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
        // In case recognition was already active
        try {
          recognition.stop();
          setTimeout(() => recognition.start(), 150);
        } catch (e) {}
      }
    }
  }

  // Stop listening
  function stopListening() {
    if (recognition && isListening) {
      try {
        recognition.stop();
      } catch (e) {}
    }
    isListening = false;
    updateUIState('idle');
  }

  // Text-to-Speech (TTS)
  function speakText(text, onEndCallback = null) {
    if (!isSynthesisSupported || !text) {
      if (onEndCallback) onEndCallback();
      return;
    }

    // Clean HTML tags from text before speaking
    const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
    if (!cleanText) {
      if (onEndCallback) onEndCallback();
      return;
    }

    // Cancel ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const cfg = langConfig[currentLang] || langConfig.en;
    utterance.lang = cfg.synthLang;
    utterance.rate = 0.95; // Slightly slower pacing for clear rural/elderly listening
    utterance.pitch = 1.0;

    // Pick best matched regional voice if available
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

  // Stop all voice outputs
  function stopSpeaking() {
    if (isSynthesisSupported) {
      window.speechSynthesis.cancel();
    }
    isSpeaking = false;
    if (!isListening) {
      updateUIState('idle');
    }
  }

  // Process Patient's Voice Query
  async function handleVoiceQuery(query) {
    if (!query) return;

    // Add User Spoken Bubble
    appendMessage('user', query);
    updateUIState('processing');
    isProcessing = true;

    const lower = query.toLowerCase().trim();
    const cfg = langConfig[currentLang] || langConfig.en;

    // 1. EMERGENCY INTENT
    if (
      lower.includes('emergency') ||
      lower.includes('आपातकालीन') ||
      lower.includes('ఆపద') ||
      lower.includes('అత్యవసరం') ||
      lower.includes('ambulance') ||
      lower.includes('108') ||
      lower.includes('heart attack') ||
      lower.includes('accident')
    ) {
      isProcessing = false;
      const responseHtml = `
        <div class="va-emergency-card">
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">
            <span style="font-size:1.5rem;">🚨</span>
            <strong style="color:var(--hospital-cross-red); font-size:1.05rem;">${cfg.emergencyTitle}</strong>
          </div>
          <p style="margin:0 0 0.75rem 0; font-size:0.875rem;">For life-threatening emergencies, call national emergency ambulance service immediately:</p>
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
      appendMessage('bot', responseHtml);
      speakText(cfg.emergencySpeech);
      return;
    }

    // 2. WHATSAPP NEAREST HOSPITAL SHARING INTENT
    if (
      lower.includes('whatsapp') ||
      lower.includes('व्हाट्सएप') ||
      lower.includes('వాట్సాప్') ||
      lower.includes('send') && (lower.includes('hospital') || lower.includes('centre'))
    ) {
      await handleWhatsAppVoiceShare();
      return;
    }

    // 3. APPOINTMENTS INTENT
    if (
      lower.includes('appointment') ||
      lower.includes('अपॉइंटमेंट') ||
      lower.includes('అపాయింట్') ||
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

    // 4. PRESCRIPTIONS & MEDICAL RECORDS INTENT
    if (
      lower.includes('prescription') ||
      lower.includes('medicine') ||
      lower.includes('medication') ||
      lower.includes('पर्चे') ||
      lower.includes('दवा') ||
      lower.includes('మందులు') ||
      lower.includes('రికార్డు') ||
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

    // 5. GOVERNMENT SCHEMES INTENT (Ayushman Bharat, Jan Aushadhi, Aarogyasri)
    if (
      lower.includes('scheme') ||
      lower.includes('ayushman') ||
      lower.includes('pmjay') ||
      lower.includes('pm-jay') ||
      lower.includes('योजना') ||
      lower.includes('పథకం') ||
      lower.includes('aarogyasri') ||
      lower.includes('aushadhi') ||
      lower.includes('card')
    ) {
      isProcessing = false;
      const html = `
        <div class="va-scheme-card" style="padding:0.75rem; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border-light);">
          <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.4rem;">
            <span style="font-size:1.3rem;">🏛️</span>
            <strong style="color:var(--hospital-teal-800); font-size:0.95rem;">Ayushman Bharat PM-JAY</strong>
          </div>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin:0 0 0.6rem 0;">
            Provides <strong>₹5,00,000 per family per year</strong> for secondary and tertiary care hospitalization across 27,000+ empanelled government and private hospitals.
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
    if (lower.includes('government') || lower.includes('सरकारी') || lower.includes('ప్రభుత్వ')) {
      category = 'Government Hospitals';
    } else if (lower.includes('phc') || lower.includes('primary') || lower.includes('प्राथमिक') || lower.includes('ప్రాథమిక')) {
      category = 'PHC (Primary Health)';
    } else if (lower.includes('chc') || lower.includes('community') || lower.includes('सामुदायिक') || lower.includes('కమ్యూనిటీ')) {
      category = 'CHC (Community Health)';
    } else if (lower.includes('pharmacy') || lower.includes('medicine') || lower.includes('दवा') || lower.includes('మందుల')) {
      category = 'Pharmacies & Jan Aushadhi';
    } else if (lower.includes('diagnostic') || lower.includes('lab') || lower.includes('blood test') || lower.includes('టెస్ట్')) {
      category = 'Diagnostic Labs';
    } else if (lower.includes('clinic') || lower.includes('dispensary') || lower.includes('क्लिनिक') || lower.includes('క్లినిక్')) {
      category = 'Clinics & Dispensaries';
    }

    // Distance Radius Extraction
    let radius = 5;
    const matchKm = lower.match(/(\d+)\s*(km|kilometre|kilometer|किमी|కిమీ)/);
    if (matchKm && matchKm[1]) {
      radius = parseInt(matchKm[1], 10);
    }

    await executeVoiceHealthcareSearch(category, radius, query);
  }

  // Execute Real Location Healthcare Search for Voice
  async function executeVoiceHealthcareSearch(category = 'All', radius = 5, userQuery = '') {
    const cfg = langConfig[currentLang] || langConfig.en;

    // Check GPS coordinates
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
      const noResultsText = `No healthcare centres found within ${radius} km. Try asking to expand search to 10 km or 25 km.`;
      appendMessage('bot', `<p style="margin:0; font-size:0.875rem;">🏥 ${noResultsText}</p>`);
      speakText(noResultsText);
      updateUIState('idle');
      return;
    }

    // Top nearest facility
    const topFacility = results[0];
    const speechSummary = cfg.nearestHospitalSpeech(topFacility.name, topFacility.distance);

    // Build Results Cards HTML
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
      try {
        await obtainGPSCoordinates();
      } catch (e) {}
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

  // Handle Manual Location Submit from Voice Input
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
        appendMessage('bot', `Could not pinpoint "${locationQuery}". Searching general healthcare...`);
        updateUIState('idle');
      }
    } catch (e) {
      appendMessage('bot', `Failed to geocode location. Please try another name.`);
      updateUIState('idle');
    }
  }

  // UI Messaging & Bubbles
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

  // Update UI Status & Visualizer Animations
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

  // Toggle Voice Assistant Modal
  function toggleAssistant(shouldOpen = null) {
    const win = document.getElementById('swasthya-va-window');
    if (!win) return;

    isOpen = shouldOpen !== null ? shouldOpen : !isOpen;
    win.style.display = isOpen ? 'flex' : 'none';

    if (isOpen) {
      // Speak greeting on first open
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

  // Change Voice Language
  function setLanguage(lang) {
    if (!langConfig[lang]) return;
    currentLang = lang;
    const select = document.getElementById('va-lang-select');
    if (select) select.value = lang;

    // Reset speech recognition language
    if (recognition) {
      recognition.lang = langConfig[lang].code;
    }

    renderQuickPrompts();
    updateUIState('idle');
  }

  // Render clickable quick prompts in the panel
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

  // Create and Inject Voice Assistant HTML & Styles
  function buildVoiceAssistantDOM() {
    const isPatientPage = window.location.pathname.endsWith('patient.html') || 
                          window.location.pathname.endsWith('/patient') ||
                          document.getElementById('patient-portal-body') ||
                          document.querySelector('.portal-sidebar [data-tab="nearby"]');

    if (!isPatientPage) {
      return; // Restrict exclusively to Patient Portal
    }

    // Styles
    const style = document.createElement('style');
    style.id = 'swasthya-va-styles';
    style.textContent = `
      /* Voice Assistant Floating Launcher */
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

      /* Voice Assistant Panel */
      .swasthya-va-window {
        position: fixed;
        bottom: 150px;
        right: 22px;
        width: 380px;
        max-width: calc(100vw - 32px);
        height: 560px;
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
        padding: 0.9rem 1.1rem;
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

      /* Central Mic & Visualizer Area */
      .va-mic-area {
        background: linear-gradient(180deg, var(--bg-surface-elevated) 0%, var(--bg-surface) 100%);
        padding: 1.25rem 1rem 0.75rem 1rem;
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

      /* Audio Visualizer Waves */
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

      /* Chat Stream */
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

      /* Quick Prompts Container */
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

      /* Text Input Fallback */
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

    // DOM markup
    const wrap = document.createElement('div');
    wrap.id = 'swasthya-va-root';
    wrap.innerHTML = `
      <!-- Floating Voice Assistant Launcher -->
      <button id="swasthya-va-launcher" class="swasthya-va-launcher" title="Open SwasthyaConnect AI Voice Assistant" onclick="SwasthyaVoiceAssistant.toggleAssistant()">
        <span class="va-pulse-ring"></span>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
        <span>Voice AI</span>
      </button>

      <!-- Voice Assistant Panel Window -->
      <div id="swasthya-va-window" class="swasthya-va-window">
        
        <!-- Header -->
        <div class="va-header">
          <div class="va-header-title">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
            <span>Voice Assistant</span>
          </div>

          <div style="display:flex; align-items:center; gap:0.4rem;">
            <!-- Language Switcher -->
            <select id="va-lang-select" onchange="SwasthyaVoiceAssistant.setLanguage(this.value)" style="background:rgba(255,255,255,0.2); color:#ffffff; border:1px solid rgba(255,255,255,0.4); border-radius:var(--radius-xs); padding:2px 6px; font-size:0.75rem; font-weight:600; outline:none; cursor:pointer;">
              <option value="en" style="color:#000;">English</option>
              <option value="hi" style="color:#000;">हिंदी</option>
              <option value="te" style="color:#000;">తెలుగు</option>
            </select>

            <!-- Close Button -->
            <button onclick="SwasthyaVoiceAssistant.toggleAssistant(false)" style="background:none; border:none; color:#ffffff; font-size:1.2rem; cursor:pointer; line-height:1; padding:0 4px;" title="Close Voice Assistant">
              &times;
            </button>
          </div>
        </div>

        <!-- Status Bar -->
        <div class="va-status-bar">
          <span id="va-status-text"><span class="pulse-dot" style="background:#64748b;"></span> Tap the microphone to speak</span>
          <button class="btn btn-sm btn-outline" style="padding:1px 6px; font-size:0.7rem;" onclick="SwasthyaVoiceAssistant.stopSpeaking()" title="Stop Voice Speaking">
            ⏹ Stop
          </button>
        </div>

        <!-- Central Microphone & Visualizer -->
        <div class="va-mic-area">
          <button id="va-main-mic-btn" class="va-main-mic-btn state-idle" onclick="SwasthyaVoiceAssistant.toggleListening()" title="Click to Speak">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
          </button>

          <!-- Audio Waveform Visualizer -->
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

        <!-- Quick Prompts -->
        <div id="va-quick-prompts" class="va-quick-prompts">
          <!-- Populated dynamically -->
        </div>

        <!-- Text Input Fallback -->
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
    handleTextInputSubmit
  };

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildVoiceAssistantDOM);
  } else {
    buildVoiceAssistantDOM();
  }

})();
