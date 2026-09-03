/**
 * SwasthyaConnect - Centralized Multilingual Internationalization (i18n) Engine
 * Supported Languages:
 *   - 'en': English (Default)
 *   - 'te': తెలుగు (Telugu)
 *   - 'hi': हिन्दी (Hindi)
 * 
 * Features:
 * 1. Comprehensive Hierarchical Translation Dictionary (translations.en, translations.te, translations.hi)
 * 2. Flat Healthcare Phrase & Word Translation Database (phraseMap)
 * 3. Bidirectional Lossless Reverse Index for seamless English <-> Telugu <-> Hindi transitions
 * 4. Full DOM TreeWalker Auto-Translator (Text nodes, data-i18n, placeholders, titles, aria-labels, options)
 * 5. Dynamic Content Translation Helpers: SwasthyaI18n.t(keyOrPhrase, fallback)
 * 6. Synchronized with Voice Assistant, WhatsApp AI, Leaflet Map, Geolocation, and Portal views
 * 7. Language Persistence via localStorage ('swasthya_lang')
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. HIERARCHICAL TRANSLATION DICTIONARY
  // =========================================================================
  const translations = {
    en: {
      nav: {
        home: "Home",
        findDoctor: "Find Doctor",
        appointments: "Appointments",
        healthRecords: "Health Records",
        schemes: "Government Health Schemes",
        voiceAssistant: "Voice Assistant",
        about: "About",
        nearby: "Nearby Healthcare Centres",
        emergency: "Emergency Support (108)",
        patientSignIn: "Patient Sign In",
        doctorSignIn: "Doctor Sign In",
        dashboard: "Dashboard & Telemetry",
        records: "Health Records & Rx",
        prescriptions: "Prescriptions",
        labs: "Lab Reports",
        telehealth: "Tele-OPD Video",
        switchDoctor: "Switch to Doctor View",
        switchPatient: "Switch to Patient View",
        signOut: "Log Out"
      },
      hero: {
        badge: "Privacy-focused prototype • Demo data only",
        title: "Accessible Healthcare for Every Village",
        desc: "SwasthyaConnect helps rural and underserved communities find healthcare services, connect with doctors, manage appointments and access health information.",
        findDoctorBtn: "Find a Doctor",
        bookAptBtn: "Book Appointment",
        openVoiceBtn: "🎙️ Open Voice Assistant",
        emergencyBtn: "Emergency Help",
        disclaimer: "ℹ️ Prototype Notice: This prototype uses demo data and is not intended for storing real medical information. Designed for rural accessibility and Smart India Hackathon demonstrations."
      },
      features: {
        teleclinicTitle: "PHC & CHC Tele-Clinic",
        teleclinicDesc: "Connect with specialist doctors from village clinics",
        voiceAiTitle: "Trilingual Voice AI",
        voiceAiDesc: "Speak in English, Telugu (తెలుగు), or Hindi (हिन्दी)",
        genericsTitle: "Jan Aushadhi Generics",
        genericsDesc: "Affordable generic medicine e-prescriptions",
        schemesTitle: "Govt Health Schemes",
        schemesDesc: "NHM, Ayushman Bharat, PM-JANMAN, PMSSY & NACP",
        vitalsTrackingTitle: "Vitals Tracking",
        vitalsTrackingDesc: "Continuous Blood Pressure & Pulse telemetry",
        telehealthVideoTitle: "Telehealth Video",
        telehealthVideoDesc: "Direct virtual visits with your doctor",
        refillsTitle: "1-Click Refills",
        refillsDesc: "Direct pharmacy dispatch for medications",
        labsTitle: "Diagnostic Labs",
        labsDesc: "Instant official CMP, ECG & Lipid reports"
      },
      auth: {
        portalTitle: "SwasthyaConnect Portal",
        portalSubtitle: "Demo Access & Authentication Gateway",
        patientPortal: "Patient Portal",
        doctorPortal: "Doctor Clinical Hub",
        patientSignInTitle: "Patient Portal Sign In",
        doctorSignInTitle: "Doctor Portal Sign In",
        patientSub: "Sign in with your verified email or Medical Record Number (MRN)",
        doctorSub: "Sign in with your clinical email or NMC Medical License ID",
        quickDemo: "⚡ One-Click Demo Access",
        instantLogin: "Instant Access",
        emailLabel: "Email or Health Record Identifier",
        emailPlaceholder: "e.g. alex.johnson@example.com",
        passwordLabel: "Password",
        passwordPlaceholder: "Enter password",
        forgotPass: "Forgot password?",
        signInBtn: "Sign In (Demo Mode)",
        createAccount: "Create Demo Account",
        registerPrompt: "New to SwasthyaConnect?",
        registerLink: "Register demo account",
        fullName: "Full Name",
        fullNamePlaceholder: "e.g. Ramesh Kumar",
        emailAddress: "Email Address",
        roleSelect: "Account Role",
        rolePatient: "Patient Portal",
        roleDoctor: "Doctor Portal (Verification Required)",
        cancel: "Cancel",
        doctorNotice: "* Note: Doctor accounts require clinical verification in production. In this prototype, demo mode is enabled.",
        authenticating: "Authenticating...",
        resetTitle: "Reset Credentials (Demo)",
        resetDesc: "Enter your registered email address to receive password reset instructions.",
        sendResetBtn: "Send Reset Instructions",
        officialHelplines: "Official Helplines (India)",
        nationalAmbulance: "National Ambulance",
        teleAdvice: "Health Advice / Telemedicine"
      },
      dashboard: {
        welcomeHello: "Hello,",
        healthStatusLabel: "Current Health Status:",
        stableHypertension: "Stable • Controlled Stage-1 Hypertension",
        bloodGroup: "Blood Group:",
        mrn: "MRN:",
        attendingDoctor: "Attending: Dr. Sarah Lin, MD",
        joinTelehealth: "Join Telehealth Visit",
        govtSchemesBtn: "Govt Schemes",
        nearbyHeader: "📍 Nearby Healthcare Centres & Hospitals",
        nearbyDesc: "Find verified government hospitals, PHCs, pharmacies, diagnostics, and 24x7 emergency services near your current location.",
        findNearMe: "Find Healthcare Near Me",
        telemetryHeader: "📡 Latest Vital Signs Telemetry",
        telemetrySub: "Continuous remote patient monitoring & connected biometric sensors",
        syncDevices: "Sync Devices",
        syncing: "Syncing...",
        bloodPressure: "Blood Pressure",
        optimalRange: "Optimal Range",
        armCuffSync: "Arm Cuff Sync",
        heartRate: "Heart Rate (Pulse)",
        normalSinus: "Normal Sinus Rhythm",
        restingPulse: "Resting Pulse",
        spo2: "Blood Oxygen (SpO2)",
        optimalOxygen: "Optimal Oxygenation",
        pulseOximeter: "Pulse Oximeter",
        temperature: "Body Temperature",
        afebrile: "Afebrile (Normal)",
        tympanicSensor: "Tympanic Sensor",
        glucose: "Fasting Glucose",
        normalGlycemic: "Normal Glycemic",
        glucometerSync: "Glucometer Sync",
        respiratoryRate: "Respiratory Rate",
        eupnea: "Eupnea (Normal)",
        chestRespiration: "Chest Respiration",
        trendTitle: "7-Day Biometric Telemetry & Vitals Trend",
        trendSub: "Daily resting vitals recorded via automated home monitoring",
        pulseBpmLegend: "Pulse (BPM)",
        systolicBpLegend: "Systolic BP",
        spo2Legend: "SpO2 (%)",
        upcomingConsults: "Upcoming Appointments",
        bookNew: "+ Book New",
        activePrescriptions: "Active Prescriptions",
        viewAllArrow: "View All →"
      },
      nearby: {
        title: "Find Nearby Government Healthcare Centres",
        sub: "Locate verified public hospitals, Community Health Centres (CHC), Primary Health Centres (PHC), Ayushman Arogya Mandirs, pharmacies, and 24x7 emergency trauma services near you.",
        autoDetectGps: "Auto-Detect GPS Location",
        detectingLocation: "📍 Getting your location...",
        findingHospitals: "🏥 Finding nearby hospitals...",
        searchPlaceholder: "Search by hospital name, area, town, or PIN code...",
        searchRadius: "Search Radius:",
        dist5km: "Within 5 km",
        dist10km: "Within 10 km",
        dist25km: "Within 25 km",
        dist50km: "Within 50 km",
        allFacilities: "All Facilities",
        govtHospitals: "Government Hospitals",
        phc: "PHC (Primary Health)",
        chc: "CHC (Community Health)",
        ayushmanMandir: "Ayushman Arogya Mandir",
        clinics: "Clinics & Dispensaries",
        labs: "Diagnostic Labs",
        pharmacies: "Pharmacies & Jan Aushadhi",
        emergencyTrauma: "24x7 Emergency Trauma",
        getDirections: "Get Directions",
        viewOnMap: "View on Map",
        open24x7: "Open • 24x7 Emergency & IPD",
        closed: "Closed",
        phone: "Phone:",
        address: "Address:",
        distanceAway: "away",
        noHospitalsTitle: "No hospitals found within",
        noHospitalsDesc: "Try expanding your search radius or search by city name.",
        searchWithin25: "Search within 25 km",
        searchWithin50: "Search within 50 km",
        tryAgain: "Try Again",
        retry: "Retry",
        unableToFind: "Unable to find nearby hospitals right now.",
        locationDeniedTitle: "Location Access Required",
        locationDeniedDesc: "Location permission was denied. Please enable location access in your browser settings to find hospitals near you.",
        enableLocation: "Enable Location",
        enterManually: "Enter Location Manually",
        privacyNotice: "Privacy Notice: Your coordinates are used locally to calculate nearby distance and are never stored on external servers."
      },
      appointments: {
        title: "Scheduled Consultations & Appointments",
        sub: "View your upcoming in-person hospital visits and tele-OPD video consultations.",
        bookNewBtn: "+ Book Consultation",
        upcomingTab: "Upcoming Appointments",
        pastTab: "Past Consultation History",
        doctor: "Doctor",
        specialty: "Specialty",
        dateTime: "Date & Time",
        mode: "Mode",
        status: "Status",
        actions: "Actions",
        inPerson: "In-Person Hospital Visit",
        telehealthVideo: "Telehealth Video Call",
        confirmed: "Confirmed",
        completed: "Completed",
        cancelled: "Cancelled",
        joinVideo: "Join Video Call",
        cancelApt: "Cancel Visit",
        reschedule: "Reschedule",
        reason: "Reason for Visit",
        noUpcoming: "No upcoming appointments scheduled.",
        noPast: "No past appointment history recorded.",
        bookNowArrow: "Book now →",
        modalTitle: "Book Medical Consultation",
        selectDoctor: "Select Doctor / Specialist",
        selectDate: "Preferred Date",
        selectTime: "Preferred Time Slot",
        consultMode: "Consultation Mode",
        reasonPlaceholder: "Briefly describe your symptoms or reason for visit...",
        confirmBookingBtn: "Confirm Appointment Booking"
      },
      schemes: {
        title: "Indian Government Healthcare Schemes",
        sub: "Central and state public health welfare programs, cashless hospitalization benefits, and free generic medicine schemes.",
        searchPlaceholder: "Search government schemes by name, keyword, or benefits...",
        allSchemes: "All Schemes",
        ruralHealth: "Rural Healthcare",
        universalCover: "Universal Health Coverage",
        tribalHealth: "Tribal & Underserved",
        infra: "Healthcare Infrastructure",
        diseasePrevention: "Disease Prevention",
        checkEligibility: "Check Eligibility",
        applyCard: "Apply for Card",
        findHospitals: "Find Empanelled Hospitals",
        officialSite: "Official Website",
        pmjayTitle: "Ayushman Bharat PM-JAY",
        pmjayDesc: "Free secondary and tertiary hospitalization cover up to ₹5,00,000 per family per year for vulnerable families.",
        nhmTitle: "National Health Mission (NHM)",
        nhmDesc: "Universal access to equitable, affordable & quality healthcare services with National Rural Health Mission (NRHM).",
        pmjanmanTitle: "PM-JANMAN (Tribal Health Mission)",
        pmjanmanDesc: "Targeted healthcare, mobile medical units, and sickle cell screening for Particularly Vulnerable Tribal Groups (PVTG).",
        janAushadhiTitle: "PM Jan Aushadhi Scheme",
        janAushadhiDesc: "Quality generic medicines at 50% to 90% lower prices than branded equivalents across 10,000+ Jan Aushadhi Kendras."
      },
      emergency: {
        title: "Emergency Information & Rapid Response",
        sub: "Instant 24x7 emergency dispatch, ambulance tracking, nearest trauma center navigation, and emergency first aid guide.",
        call108: "Dial 108 Emergency Ambulance",
        call104: "Dial 104 Health Helpline",
        call112: "Dial 112 National Emergency",
        nearestHospital: "Nearest Emergency Trauma Hospital",
        firstAidTitle: "Emergency First Aid Quick Guides",
        cprTitle: "CPR & Cardiac Arrest",
        cprDesc: "Push hard and fast in the center of the chest at 100-120 beats per minute.",
        snakeBiteTitle: "Snake Bite First Aid",
        snakeBiteDesc: "Keep victim calm, immobilize bitten limb below heart level, do NOT cut or suck venom.",
        burnsTitle: "Burns & Scalds Care",
        burnsDesc: "Cool the burn under cool running water for at least 10 minutes. Do not apply ice.",
        bleedingTitle: "Severe Bleeding Control",
        bleedingDesc: "Apply direct firm pressure on wound with a sterile cloth. Elevate injured area.",
        triggerSosBtn: "Trigger Instant 108 SOS Alert",
        sosModalTitle: "Confirm Emergency Ambulance Request (108)",
        sosModalDesc: "Are you sure you want to trigger an emergency SOS dispatch? Your GPS coordinates will be shared with the nearest response unit.",
        confirmDispatch: "Confirm & Dispatch 108"
      },
      voice: {
        title: "Voice Assistant",
        statusOff: "Voice Assistant Off",
        statusListening: "Listening... (Speak now)",
        statusProcessing: "Processing request...",
        statusSpeaking: "Speaking...",
        statusReady: "Ready (Tap microphone to speak)",
        greeting: "Hi! I’m <strong>SwasthyaConnect Voice AI</strong>. How can I help you today?",
        locating: "📍 Getting your location...",
        micPrompt: "Tap the microphone icon to begin speaking in your selected language.",
        typePrompt: "Or type your medical request here...",
        sendBtn: "Send",
        chipNearby: "🏥 Nearby Hospitals",
        chipApts: "📅 My Appointments",
        chipRx: "💊 Prescriptions",
        chipSchemes: "🏛️ Govt Schemes",
        chipEmergency: "🚨 Emergency 108",
        micPermissionDenied: "Microphone permission is required for voice commands. You can type your medical request below."
      },
      doctor: {
        portalTitle: "Clinical Command Center",
        disclaimer: "Doctor Verification Required (Prototype Demo Mode): Registered medical practitioners are verified before receiving clinical credentials. This station displays simulated demo patient queues.",
        workstationOnline: "Clinical Workstation Online",
        ehrSynced: "EHR Synced",
        openQueueBtn: "Open Patient Queue",
        registeredPatients: "Registered Patients",
        activeCharts: "Active Charts",
        scheduledConsults: "Scheduled Consults",
        todayTotal: "Today's Total",
        patientsWaiting: "Patients Waiting",
        triageQueue: "Triage Queue",
        consultationsDone: "Consultations Done",
        completedToday: "Completed Today",
        patientQueueTitle: "Today's Patient Queue & Triage",
        allFilter: "All Encounters",
        waitingFilter: "Waiting",
        inConsultFilter: "In-Consultation",
        completedFilter: "Completed",
        thPatient: "Patient Details",
        thTime: "Time / Slot",
        thReason: "Chief Complaint",
        thVitals: "Telemetry Vitals",
        thStatus: "Triage Status",
        thAction: "Action",
        startConsult: "Start Consult",
        reviewEhr: "Review EHR",
        writeRxBtn: "Write Rx / SOAP Note",
        soapModalTitle: "Clinical Encounter & SOAP e-Prescription",
        patientSelectLabel: "Select Patient",
        chiefComplaintLabel: "Chief Complaint & Primary Symptoms",
        subjectiveLabel: "Subjective (Patient History & Complaints)",
        objectiveLabel: "Objective (Exam & Telemetry Vitals)",
        assessmentLabel: "Assessment & Clinical Diagnosis",
        planLabel: "Plan & Treatment Strategy",
        rxMedName: "Medication Name",
        rxStrength: "Strength",
        rxDosage: "Dosage & Instructions",
        rxJanAushadhi: "Jan Aushadhi Generic Option",
        saveAbhaBtn: "Save & Sync to ABHA",
        discardBtn: "Discard"
      },
      common: {
        onlineMode: "🟢 Online Mode",
        offlineMode: "🔴 Offline Mode",
        connectedText: "Connected to the internet. All live services active.",
        liveSynced: "Live Synced",
        dataSaver: "Data Saver",
        dataSaverToggle: "Toggle Data Saver",
        notifications: "Notifications",
        notificationsCenter: "Notifications Center",
        clearAll: "Clear All",
        emergencySos: "Emergency SOS",
        bookVisit: "Book Visit",
        loading: "Loading...",
        success: "Success",
        error: "Error",
        info: "Information",
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        confirm: "Confirm",
        search: "Search",
        filter: "Filter",
        download: "Download",
        close: "Close",
        back: "Back",
        next: "Next",
        details: "Details",
        share: "Share",
        copyright: "© 2026 SwasthyaConnect • Smart India Hackathon Rural Healthcare Prototype • Demo Data Only"
      }
    },

    te: {
      nav: {
        home: "హోమ్",
        findDoctor: "వైద్యుడిని కనుగొనండి",
        appointments: "అపాయింట్‌మెంట్లు",
        healthRecords: "ఆరోగ్య రికార్డులు",
        schemes: "ప్రభుత్వ ఆరోగ్య పథకాలు",
        voiceAssistant: "వాయిస్ అసిస్టెంట్",
        about: "మా గురించి",
        nearby: "సమీప ఆరోగ్య కేంద్రాలు",
        emergency: "అత్యవసర సహాయం (108)",
        patientSignIn: "పేషెంట్ సైన్ ఇన్",
        doctorSignIn: "డాక్టర్ సైన్ ఇన్",
        dashboard: "డ్యాష్‌బోర్డ్ & వైటల్స్",
        records: "ఆరోగ్య రికార్డులు & మందులు",
        prescriptions: "ప్రిస్క్రిప్షన్లు",
        labs: "ల్యాబ్ రిపోర్టులు",
        telehealth: "టెలీ-ఓపీడీ వీడియో",
        switchDoctor: "డాక్టర్ వ్యూకి మారండి",
        switchPatient: "పేషెంట్ వ్యూకి మారండి",
        signOut: "లాగ్ అవుట్"
      },
      hero: {
        badge: "గోప్యత ఆధారిత ప్రోటోటైప్ • డెమో డేటా మాత్రమే",
        title: "ప్రతి గ్రామానికి అందుబాటులో ఉండే ఆరోగ్య సంరక్షణ",
        desc: "స్వాస్థ్యకనెక్ట్ గ్రామీణ మరియు వెనుకబడిన ప్రజలకు ఆరోగ్య సేవలను కనుగొనడానికి, వైద్యులతో మాట్లాడటానికి, అపాయింట్‌మెంట్‌లను నిర్వహించడానికి మరియు సమాచారాన్ని పొందడానికి సహాయపడుతుంది.",
        findDoctorBtn: "వైద్యుడిని కనుగొనండి",
        bookAptBtn: "అపాయింట్‌మెంట్ బుక్ చేయండి",
        openVoiceBtn: "🎙️ వాయిస్ అసిస్టెంట్ తెరవండి",
        emergencyBtn: "అత్యవసర సహాయం",
        disclaimer: "ℹ️ ప్రోటోటైప్ గమనిక: ఈ ప్రోటోటైప్ డెమో డేటాను ఉపయోగిస్తుంది మరియు నిజమైన వైద్య సమాచారాన్ని నిల్వ చేయడానికి ఉద్దేశించబడలేదు. స్మార్ట్ ఇండియా హ్యాకథాన్ మరియు గ్రామీణ సేవల కోసం రూపొందించబడింది."
      },
      features: {
        teleclinicTitle: "పీహెచ్‌సీ & సీహెచ్‌సీ టెలీ-క్లినిక్",
        teleclinicDesc: "గ్రామ క్లినిక్‌ల నుండే నిపుణులైన వైద్యులతో సంప్రదింపులు",
        voiceAiTitle: "త్రిభాషా వాయిస్ AI",
        voiceAiDesc: "తెలుగు, హిందీ లేదా ఇంగ్లీషులో సులభంగా మాట్లాడండి",
        genericsTitle: "జన్ ఔషధి జెనరిక్ మందులు",
        genericsDesc: "తక్కువ ధరకే నాణ్యమైన జెనరిక్ మందుల ప్రిస్క్రిప్షన్లు",
        schemesTitle: "ప్రభుత్వ ఆరోగ్య పథకాలు",
        schemesDesc: "ఆయుష్మాన్ భారత్, ఎన్‌హెచ్‌ఎం, పీఎం-జన్-మన్, ఆరోగ్యశ్రీ వివరాలు",
        vitalsTrackingTitle: "వైటల్స్ నిరంతర పర్యవేక్షణ",
        vitalsTrackingDesc: "రక్తపోటు మరియు గుండె వేగం టెలిమెట్రీ ట్రాకింగ్",
        telehealthVideoTitle: "టెలీహెల్త్ వీడియో కాల్",
        telehealthVideoDesc: "వైద్యులతో నేరుగా ముఖాముఖి వీడియో సంప్రదింపులు",
        refillsTitle: "1-క్లిక్ మందుల రీఫిల్",
        refillsDesc: "ఫార్మసీ నుండి త్వరితగతిన మందుల సరఫరా",
        labsTitle: "డయాగ్నస్టిక్ ల్యాబ్స్",
        labsDesc: "ఈసీజీ, రక్త పరీక్షల అధికారిక ల్యాబ్ నివేదికలు"
      },
      auth: {
        portalTitle: "స్వాస్థ్యకనెక్ట్ పోర్టల్",
        portalSubtitle: "డెమో యాక్సెస్ & ప్రామాణీకరణ గేట్‌వే",
        patientPortal: "పేషెంట్ పోర్టల్",
        doctorPortal: "డాక్టర్ క్లినికల్ హబ్",
        patientSignInTitle: "పేషెంట్ పోర్టల్ సైన్ ఇన్",
        doctorSignInTitle: "డాక్టర్ పోర్టల్ సైన్ ఇన్",
        patientSub: "మీ నమోదిత ఈమెయిల్ లేదా మెడికల్ రికార్డ్ నంబర్ (MRN) తో సైన్ ఇన్ అవ్వండి",
        doctorSub: "మీ క్లినికల్ ఈమెయిల్ లేదా మెడికల్ లైసెన్స్ ఐడీతో సైన్ ఇన్ అవ్వండి",
        quickDemo: "⚡ వన్-క్లిక్ డెమో యాక్సెస్",
        instantLogin: "తక్షణ ప్రవేశం",
        emailLabel: "ఈమెయిల్ లేదా హెల్త్ రికార్డ్ ఐడెంటిఫైయర్",
        emailPlaceholder: "ఉదా: alex.johnson@example.com",
        passwordLabel: "పాస్‌వర్డ్",
        passwordPlaceholder: "పాస్‌వర్డ్ నమోదు చేయండి",
        forgotPass: "పాస్‌వర్డ్ మర్చిపోయారా?",
        signInBtn: "సైన్ ఇన్ (డెమో మోడ్)",
        createAccount: "డెమో ఖాతాను సృష్టించండి",
        registerPrompt: "స్వాస్థ్యకనెక్ట్‌కు కొత్తవారా?",
        registerLink: "డెమో ఖాతా నమోదు చేసుకోండి",
        fullName: "పూర్తి పేరు",
        fullNamePlaceholder: "ఉదా: రమేష్ కుమార్",
        emailAddress: "ఈమెయిల్ చిరునామా",
        roleSelect: "ఖాతా రకం",
        rolePatient: "పేషెంట్ పోర్టల్",
        roleDoctor: "డాక్టర్ పోర్టల్ (ధృవీకరణ అవసరం)",
        cancel: "రద్దు చేయండి",
        doctorNotice: "* గమనిక: డాక్టర్ ఖాతాలకు ఉత్పత్తిలో క్లినికల్ ధృవీకరణ అవసరం. ఈ ప్రోటోటైప్‌లో డెమో మోడ్ ప్రారంభించబడింది.",
        authenticating: "ధృవీకరిస్తోంది...",
        resetTitle: "రుజువులను రీసెట్ చేయండి (డెమో)",
        resetDesc: "పాస్‌వర్డ్ రీసెట్ సూచనలను స్వీకరించడానికి మీ నమోదిత ఈమెయిల్ చిరునామాను నమోదు చేయండి.",
        sendResetBtn: "రీసెట్ సూచనలను పంపండి",
        officialHelplines: "అధికారిక హెల్ప్‌లైన్లు (భారత్)",
        nationalAmbulance: "జాతీయ అంబులెన్స్",
        teleAdvice: "ఆరోగ్య సలహా / టెలిమెడిసిన్"
      },
      dashboard: {
        welcomeHello: "నమస్కారం,",
        healthStatusLabel: "ప్రస్తుత ఆరోగ్య స్థితి:",
        stableHypertension: "స్థిరంగా ఉంది • నియంత్రణలో ఉన్న స్టేజ్-1 రక్తపోటు",
        bloodGroup: "రక్త గ్రూపు:",
        mrn: "MRN సంఖ్య:",
        attendingDoctor: "వైద్యులు: డాక్టర్ సారా లిన్, ఎండీ",
        joinTelehealth: "టెలీ-కన్సల్టేషన్ చేరండి",
        govtSchemesBtn: "ప్రభుత్వ పథకాలు",
        nearbyHeader: "📍 సమీప ఆరోగ్య కేంద్రాలు & ఆసుపత్రులు",
        nearbyDesc: "మీ ప్రస్తుత ప్రదేశం దగ్గర ఉన్న ప్రభుత్వ ఆసుపత్రులు, పీహెచ్‌సీలు, మందుల దుకాణాలు మరియు 24x7 అత్యవసర సేవలను కనుగొనండి.",
        findNearMe: "సమీప ఆసుపత్రులను కనుగొనండి",
        telemetryHeader: "📡 తాజా వైటల్స్ టెలిమెట్రీ",
        telemetrySub: "నిరంతర రిమోట్ రోగి పర్యవేక్షణ & కనెక్ట్ చేయబడిన సెన్సార్లు",
        syncDevices: "డివైసెస్ సింక్ చేయండి",
        syncing: "సింక్ అవుతోంది...",
        bloodPressure: "రక్తపోటు (BP)",
        optimalRange: "సరైన పరిధి",
        armCuffSync: "బీపీ కఫ్ సింక్",
        heartRate: "గుండె వేగం (పల్స్)",
        normalSinus: "సాధారణ సైన్స్ రిథమ్",
        restingPulse: "రెస్టింగ్ పల్స్",
        spo2: "ఆక్సిజన్ స్థాయి (SpO2)",
        optimalOxygen: "సరైన ఆక్సిజన్",
        pulseOximeter: "పల్స్ ఆక్సిమీటర్",
        temperature: "శరీర ఉష్ణోగ్రత",
        afebrile: "సాధారణ జ్వరం లేని స్థితి",
        tympanicSensor: "డిజిటల్ సెన్సార్",
        glucose: "ఫాస్టింగ్ బ్లడ్ షుగర్",
        normalGlycemic: "సాధారణ గ్లైసెమిక్",
        glucometerSync: "గ్లూకోమీటర్ సింక్",
        respiratoryRate: "శ్వాసక్రియ రేటు",
        eupnea: "సాధారణ శ్వాస",
        chestRespiration: "ఛాతీ రెస్పిరేషన్",
        trendTitle: "7 రోజుల బయోమెట్రిక్ టెలిమెట్రీ ట్రెండ్",
        trendSub: "గృహ పర్యవేక్షణ ద్వారా నమోదు చేయబడిన రోజువారీ వైటల్స్",
        pulseBpmLegend: "పల్స్ (BPM)",
        systolicBpLegend: "సిస్టోలిక్ BP",
        spo2Legend: "SpO2 (%)",
        upcomingConsults: "రాబోయే అపాయింట్‌మెంట్లు",
        bookNew: "+ కొత్తది బుక్ చేయండి",
        activePrescriptions: "క్రియాశీల ప్రిస్క్రిప్షన్లు",
        viewAllArrow: "అన్నీ చూడండి →"
      },
      nearby: {
        title: "సమీప ప్రభుత్వ ఆరోగ్య కేంద్రాలను కనుగొనండి",
        sub: "మీ సమీపంలోని ప్రభుత్వ ఆసుపత్రులు, కమ్యూనిటీ హెల్త్ సెంటర్లు (CHC), ప్రాథమిక ఆరోగ్య కేంద్రాలు (PHC), ఆయుష్మాన్ ఆరోగ్య మందిరాలు, మందుల దుకాణాలు మరియు 24x7 అత్యవసర కేంద్రాలను కనుగొనండి.",
        autoDetectGps: "జీపీఎస్ లొకేషన్ ఆటో గుర్తింపు",
        detectingLocation: "📍 మీ ప్రదేశాన్ని గుర్తిస్తోంది...",
        findingHospitals: "🏥 సమీప ఆసుపత్రులను శోధిస్తోంది...",
        searchPlaceholder: "ఆసుపత్రి పేరు, ప్రాంతం, ఊరు లేదా పిన్ కోడ్ ద్వారా శోధించండి...",
        searchRadius: "శోధన పరిధి:",
        dist5km: "5 కి.మీ పరిధిలో",
        dist10km: "10 కి.మీ పరిధిలో",
        dist25km: "25 కి.మీ పరిధిలో",
        dist50km: "50 కి.మీ పరిధిలో",
        allFacilities: "అన్ని కేంద్రాలు",
        govtHospitals: "ప్రభుత్వ ఆసుపత్రులు",
        phc: "ప్రాథమిక ఆరోగ్య కేంద్రాలు (PHC)",
        chc: "కమ్యూనిటీ ఆరోగ్య కేంద్రాలు (CHC)",
        ayushmanMandir: "ఆయుష్మాన్ ఆరోగ్య మందిరం",
        clinics: "క్లినిక్‌లు & డిస్పెన్సరీలు",
        labs: "డయాగ్నస్టిక్ ల్యాబ్‌లు",
        pharmacies: "ఫార్మసీలు & జన్ ఔషధి",
        emergencyTrauma: "24x7 అత్యవసర ట్రూమా",
        getDirections: "రూట్ / మార్గం",
        viewOnMap: "మ్యాప్‌లో చూడండి",
        open24x7: "తెరిచి ఉంది • 24x7 అత్యవసర సేవలు",
        closed: "మూసివేయబడింది",
        phone: "ఫోన్:",
        address: "చిరునామా:",
        distanceAway: "దూరంలో",
        noHospitalsTitle: "ఈ పరిధిలో ఆసుపత్రులు కనుగొనబడలేదు:",
        noHospitalsDesc: "దయచేసి శోధన పరిధిని పెంచండి లేదా సమీప నగరం పేరుతో శోధించండి.",
        searchWithin25: "25 కి.మీ పరిధిలో శోధించండి",
        searchWithin50: "50 కి.మీ పరిధిలో శోధించండి",
        tryAgain: "మళ్లీ ప్రయత్నించండి",
        retry: "మళ్లీ ప్రయత్నించండి",
        unableToFind: "ప్రస్తుతం సమీప ఆసుపత్రులను కనుగొనడం సాధ్యం కాలేదు.",
        locationDeniedTitle: "లొకేషన్ అనుమతి అవసరం",
        locationDeniedDesc: "లొకేషన్ అనుమతి నిరాకరించబడింది. సమీప ఆసుపత్రులను చూడటానికి దయచేసి బ్రౌజర్ సెట్టింగ్స్‌లో లొకేషన్ అనుమతించండి.",
        enableLocation: "లొకేషన్ అనుమతించండి",
        enterManually: "ప్రదేశాన్ని మాన్యువల్‌గా నమోదు చేయండి",
        privacyNotice: "గోప్యతా గమనిక: మీ లొకేషన్ కేవలం సమీప దూరాన్ని లెక్కించడానికి మాత్రమే ఉపయోగించబడుతుంది."
      },
      appointments: {
        title: "షెడ్యూల్ చేయబడిన సంప్రదింపులు & అపాయింట్‌మెంట్లు",
        sub: "మీ రాబోయే ప్రత్యక్ష ఆసుపత్రి సందర్శనలు మరియు టెలీ-ఓపీడీ వీడియో సంప్రదింపులను వీక్షించండి.",
        bookNewBtn: "+ అపాయింట్‌మెంట్ బుక్ చేయండి",
        upcomingTab: "రాబోయే అపాయింట్‌మెంట్లు",
        pastTab: "గత సంప్రదింపుల చరిత్ర",
        doctor: "డాక్టర్",
        specialty: "ప్రత్యేకత",
        dateTime: "తేదీ & సమయం",
        mode: "విధానం",
        status: "స్థితి",
        actions: "చర్యలు",
        inPerson: "ప్రత్యక్ష ఆసుపత్రి సందర్శన",
        telehealthVideo: "టెలీహెల్త్ వీడియో కాల్",
        confirmed: "నిర్ధారించబడింది",
        completed: "పూర్తయింది",
        cancelled: "రద్దు చేయబడింది",
        joinVideo: "వీడియో కాల్‌లో చేరండి",
        cancelApt: "రద్దు చేయండి",
        reschedule: "సమయం మార్చండి",
        reason: "సందర్శన కారణం",
        noUpcoming: "రాబోయే అపాయింట్‌మెంట్‌లు ఏవీ షెడ్యూల్ చేయబడలేదు.",
        noPast: "గత అపాయింట్‌మెంట్ చరిత్ర ఏదీ లేదు.",
        bookNowArrow: "ఇప్పుడే బుక్ చేయండి →",
        modalTitle: "వైద్య సంప్రదింపును బుక్ చేయండి",
        selectDoctor: "వైద్యుడిని ఎంచుకోండి",
        selectDate: "తేదీని ఎంచుకోండి",
        selectTime: "సమయాన్ని ఎంచుకోండి",
        consultMode: "సంప్రదింపు విధానం",
        reasonPlaceholder: "మీ లక్షణాలు లేదా సందర్శన కారణాన్ని క్లుప్తంగా వివరించండి...",
        confirmBookingBtn: "బుకింగ్‌ను నిర్ధారించండి"
      },
      schemes: {
        title: "భారత ప్రభుత్వ ఆరోగ్య పథకాలు",
        sub: "కేంద్ర మరియు రాష్ట్ర ప్రజా సంక్షేమ కార్యక్రమాలు, నగదు రహిత చికిత్సలు మరియు ఉచిత మందుల పథకాలు.",
        searchPlaceholder: "ప్రభుత్వ పథకాలను పేరు లేదా ప్రయోజనాల ద్వారా శోధించండి...",
        allSchemes: "అన్ని పథకాలు",
        ruralHealth: "గ్రామీణ ఆరోగ్యం",
        universalCover: "సార్వత్రిక ఆరోగ్య రక్షణ",
        tribalHealth: "గిరిజన & వెనుకబడిన వర్గాలు",
        infra: "ఆరోగ్య మౌలిక సదుపాయాలు",
        diseasePrevention: "వ్యాధి నివారణ",
        checkEligibility: "అర్హతను తనిఖీ చేయండి",
        applyCard: "కార్డు కోసం దరఖాస్తు చేయండి",
        findHospitals: "నెట్‌వర్క్ ఆసుపత్రులను కనుగొనండి",
        officialSite: "అధికారిక వెబ్‌సైట్",
        pmjayTitle: "ఆయుష్మాన్ భారత్ పీఎం-జేవై",
        pmjayDesc: "అర్హులైన కుటుంబానికి సంవత్సరానికి ₹5,00,000 వరకు ఉచిత ఆసుపత్రి చికిత్స రక్షణ.",
        nhmTitle: "జాతీయ ఆరోగ్య మిషన్ (NHM)",
        nhmDesc: "గ్రామీణ మరియు పట్టణ ప్రాంతాల్లో అందరికీ నాణ్యమైన వైద్య సేవలు అందించే జాతీయ మిషన్.",
        pmjanmanTitle: "పీఎం-జన్-మన్ (గిరిజన ఆరోగ్య మిషన్)",
        pmjanmanDesc: "ప్రత్యేక గిరిజన ప్రాంతాల కోసం మొబైల్ మెడికల్ యూనిట్లు మరియు సికిల్ సెల్ వ్యాధి నిర్ధారణ.",
        janAushadhiTitle: "ప్రధాన మంత్రి జన్ ఔషధి కేంద్రం",
        janAushadhiDesc: "మార్కెట్ ధర కంటే 50% నుండి 90% తక్కువ ధరకే నాణ్యమైన జెనరిక్ మందులు."
      },
      emergency: {
        title: "అత్యవసర సమాచారం & తక్షణ సహాయం",
        sub: "తక్షణ 24x7 అత్యవసర సేవలు, 108 అంబులెన్స్ సహాయం, సమీప ట్రూమా ఆసుపత్రి మార్గం మరియు ప్రథమ చికిత్స గైడ్.",
        call108: "108 అత్యవసర అంబులెన్స్‌కి కాల్ చేయండి",
        call104: "104 ఆరోగ్య హెల్ప్‌లైన్‌కి కాల్ చేయండి",
        call112: "112 జాతీయ అత్యవసర నంబర్‌కు కాల్ చేయండి",
        nearestHospital: "సమీప అత్యవసర ట్రూమా ఆసుపత్రి",
        firstAidTitle: "అత్యవసర ప్రథమ చికిత్స గైడ్",
        cprTitle: "సీపీఆర్ (CPR) & గుండెపోటు",
        cprDesc: "ఛాతీ మధ్యలో నిమిషానికి 100-120 సార్లు వేగంగా ఒత్తిడి కలిగించండి.",
        snakeBiteTitle: "పాము కాటుకు ప్రథమ చికిత్స",
        snakeBiteDesc: "బాధితుడిని కదలకుండా ఉంచండి, గాయం ఉన్న భాగాన్ని గుండె కంటే కింద ఉంచండి. కోయవద్దు లేదా విషాన్ని పీల్చవద్దు.",
        burnsTitle: "కాలిన గాయాల సంరక్షణ",
        burnsDesc: "కాలిన భాగాన్ని కనీసం 10 నిమిషాల పాటు చల్లటి నీటి కింద ఉంచండి. ఐస్ పెట్టవద్దు.",
        bleedingTitle: "తీవ్ర రక్తస్రావం ఆపే పద్ధతులు",
        bleedingDesc: "గాయంపై శుభ్రమైన గుడ్డతో గట్టిగా అదిమి ఉంచండి. గాయపడిన భాగాన్ని పైకి ఎత్తండి.",
        triggerSosBtn: "తక్షణ 108 SOS అలర్ట్ పంపండి",
        sosModalTitle: "అత్యవసర 108 అంబులెన్స్ అభ్యర్థనను నిర్ధారించండి",
        sosModalDesc: "మీరు నిజంగానే అత్యవసర SOS పంపాలనుకుంటున్నారా? మీ జీపీఎస్ లొకేషన్ సమీప అంబులెన్స్ యూనిట్‌కు పంపబడుతుంది.",
        confirmDispatch: "నిర్ధారించి 108 పంపండి"
      },
      voice: {
        title: "వాయిస్ అసిస్టెంట్",
        statusOff: "వాయిస్ అసిస్టెంట్ ఆఫ్‌లో ఉంది",
        statusListening: "వింటోంది... (ఇప్పుడు మాట్లాడండి)",
        statusProcessing: "అభ్యర్థనను పరిశీలిస్తోంది...",
        statusSpeaking: "మాట్లాడుతోంది...",
        statusReady: "సిద్ధంగా ఉంది (మైక్రోఫోన్ నొక్కండి)",
        greeting: "నమస్కారం! నేను <strong>స్వాస్థ్యకనెక్ట్ వాయిస్ AI</strong>ని. నేను మీకు ఎలా సహాయపడగలను?",
        locating: "📍 మీ ప్రదేశాన్ని గుర్తిస్తోంది...",
        micPrompt: "మీ ఎంచుకున్న భాషలో మాట్లాడటానికి మైక్రోఫోన్ ఐకాన్‌ను నొక్కండి.",
        typePrompt: "లేదా మీ వైద్య ప్రశ్నను ఇక్కడ టైప్ చేయండి...",
        sendBtn: "పంపండి",
        chipNearby: "🏥 సమీప ఆసుపత్రులు",
        chipApts: "📅 నా అపాయింట్‌మెంట్లు",
        chipRx: "💊 ప్రిస్క్రిప్షన్లు",
        chipSchemes: "🏛️ ప్రభుత్వ పథకాలు",
        chipEmergency: "🚨 అత్యవసర 108",
        micPermissionDenied: "వాయిస్ ఆదేశాల కోసం మైక్రోఫోన్ అనుమతి అవసరం. మీరు క్రింద టైప్ చేయవచ్చు."
      },
      doctor: {
        portalTitle: "క్లినికల్ కమాండ్ సెంటర్",
        disclaimer: "డాక్టర్ ధృవీకరణ అవసరం (డెమో ప్రోటోటైప్ మోడ్): నమోదిత వైద్యులకు ధృవీకరణ తర్వాత ఆధారాలు ఇవ్వబడతాయి. ఈ స్టేషన్ డెమో రోగుల జాబితాను చూపుతుంది.",
        workstationOnline: "క్లినికల్ వర్క్‌స్టేషన్ ఆన్‌లైన్",
        ehrSynced: "EHR సింక్ అయింది",
        openQueueBtn: "రోగుల క్యూ తెరవండి",
        registeredPatients: "నమోదైన రోగులు",
        activeCharts: "యాక్టివ్ చార్ట్‌లు",
        scheduledConsults: "షెడ్యూల్డ్ కన్సల్టేషన్లు",
        todayTotal: "నేటి మొత్తం",
        patientsWaiting: "వేచి ఉన్న రోగులు",
        triageQueue: "ట్రియేజ్ క్యూ",
        consultationsDone: "పూర్తయిన సంప్రదింపులు",
        completedToday: "నేడు పూర్తయినవి",
        patientQueueTitle: "నేటి రోగుల జాబితా & ట్రియేజ్",
        allFilter: "అన్ని కేసులు",
        waitingFilter: "వేచి ఉన్నవారు",
        inConsultFilter: "సంప్రదింపులో ఉన్నవారు",
        completedFilter: "పూర్తయినవి",
        thPatient: "రోగి వివరాలు",
        thTime: "సమయం / స్లాట్",
        thReason: "ప్రధాన సమస్య",
        thVitals: "వైటల్స్ టెలిమెట్రీ",
        thStatus: "ట్రియేజ్ స్థితి",
        thAction: "చర్య",
        startConsult: "కన్సల్ట్ ప్రారంభించండి",
        reviewEhr: "EHR సమీక్షించండి",
        writeRxBtn: "ప్రిస్క్రిప్షన్ / సోప్ నోట్ రాయండి",
        soapModalTitle: "క్లినికల్ సంప్రదింపు & SOAP ప్రిస్క్రిప్షన్",
        patientSelectLabel: "రోగిని ఎంచుకోండి",
        chiefComplaintLabel: "ప్రధాన సమస్య & లక్షణాలు",
        subjectiveLabel: "సబ్జెక్టివ్ (రోగి తెలిపిన వివరాలు)",
        objectiveLabel: "ఆబ్జెక్టివ్ (పరీక్ష & వైటల్స్ నివేదిక)",
        assessmentLabel: "అసెస్మెంట్ & వ్యాధి నిర్ధారణ",
        planLabel: "ప్లాన్ & చికిత్సా వ్యూహం",
        rxMedName: "మందు పేరు",
        rxStrength: "డోసేజ్ పరిమాణం",
        rxDosage: "వాడే విధానం & సూచనలు",
        rxJanAushadhi: "జన్ ఔషధి జెనరిక్ ఎంపిక",
        saveAbhaBtn: "ఆభాలో భద్రపరచి సింక్ చేయండి",
        discardBtn: "రద్దు చేయండి"
      },
      common: {
        onlineMode: "🟢 ఆన్‌లైన్ మోడ్",
        offlineMode: "🔴 ఆఫ్‌లైన్ మోడ్",
        connectedText: "ఇంటర్నెట్‌తో కనెక్ట్ చేయబడింది. అన్ని సేవలు ప్రత్యక్షంగా పనిచేస్తున్నాయి.",
        liveSynced: "లైవ్ సింక్ అయింది",
        dataSaver: "డేటా సేవర్",
        dataSaverToggle: "డేటా సేవర్ మార్చండి",
        notifications: "నోటిఫికేషన్లు",
        notificationsCenter: "నోటిఫికేషన్ల కేంద్రం",
        clearAll: "అన్నీ తొలగించు",
        emergencySos: "అత్యవసర SOS",
        bookVisit: "అపాయింట్‌మెంట్",
        loading: "లోడ్ అవుతోంది...",
        success: "విజయవంతం",
        error: "లోపం",
        info: "సమాచారం",
        save: "భద్రపరచండి",
        cancel: "రద్దు చేయండి",
        delete: "తొలగించండి",
        edit: "సవరించండి",
        confirm: "నిర్ధారించండి",
        search: "శోధించండి",
        filter: "ఫిల్టర్",
        download: "డౌన్‌లోడ్",
        close: "మూసివేయండి",
        back: "వెనుకకు",
        next: "తరువాత",
        details: "వివరాలు",
        share: "షేర్ చేయండి",
        copyright: "© 2026 స్వాస్థ్యకనెక్ట్ • స్మార్ట్ ఇండియా హ్యాకథాన్ గ్రామీణ ఆరోగ్య ప్రోటోటైప్ • డెమో డేటా మాత్రమే"
      }
    },

    hi: {
      nav: {
        home: "होम",
        findDoctor: "डॉक्टर खोजें",
        appointments: "अपॉइंटमेंट",
        healthRecords: "स्वास्थ्य रिकॉर्ड",
        schemes: "सरकारी स्वास्थ्य योजनाएं",
        voiceAssistant: "वॉयस असिस्टेंट",
        about: "हमारे बारे में",
        nearby: "नजदीकी स्वास्थ्य केंद्र",
        emergency: "आपातकालीन सहायता (108)",
        patientSignIn: "मरीज साइन इन",
        doctorSignIn: "डॉक्टर साइन इन",
        dashboard: "डैशबोर्ड और टेलीमेट्री",
        records: "स्वास्थ्य रिकॉर्ड और पर्चे",
        prescriptions: "दवा के पर्चे",
        labs: "लैब रिपोर्ट",
        telehealth: "टेली-ओपीडी वीडियो",
        switchDoctor: "डॉक्टर व्यू पर जाएं",
        switchPatient: "मरीज व्यू पर जाएं",
        signOut: "लॉग आउट"
      },
      hero: {
        badge: "गोपनीयता-केंद्रित प्रोटोटाइप • केवल डेमो डेटा",
        title: "हर गांव के लिए सुलभ स्वास्थ्य सेवा",
        desc: "स्वास्थ्यकनेक्ट ग्रामीण और वंचित समुदायों को स्वास्थ्य सेवाएं खोजने, डॉक्टरों से जुड़ने, अपॉइंटमेंट प्रबंधित करने और स्वास्थ्य जानकारी प्राप्त करने में मदद करता है।",
        findDoctorBtn: "डॉक्टर खोजें",
        bookAptBtn: "अपॉइंटमेंट बुक करें",
        openVoiceBtn: "🎙️ वॉयस असिस्टेंट खोलें",
        emergencyBtn: "आपातकालीन सहायता",
        disclaimer: "ℹ️ प्रोटोटाइप सूचना: यह प्रोटोटाइप डेमो डेटा का उपयोग करता है और वास्तविक चिकित्सा जानकारी संग्रहीत करने के लिए अभिप्रेत नहीं है। ग्रामीण पहुंच और स्मार्ट इंडिया हैकथॉन के लिए डिज़ाइन किया गया।"
      },
      features: {
        teleclinicTitle: "पीएचसी एवं सीएचसी टेली-क्लिनिक",
        teleclinicDesc: "गांव के क्लिनिक से ही विशेषज्ञ डॉक्टरों से सीधा परामर्श",
        voiceAiTitle: "त्रिभाषी वॉयस AI",
        voiceAiDesc: "हिंदी, तेलुगु या अंग्रेजी में आसानी से बात करें",
        genericsTitle: "जन औषधि जेनेरिक दवाएं",
        genericsDesc: "किफायती दामों पर गुणवत्तापूर्ण जेनेरिक दवाओं के पर्चे",
        schemesTitle: "सरकारी स्वास्थ्य योजनाएं",
        schemesDesc: "आयुष्मान भारत, एनएचएम, पीएम-जनमन, पीएमएसएसवाई विवरण",
        vitalsTrackingTitle: "वाइटल्स की निरंतर निगरानी",
        vitalsTrackingDesc: "रक्तचाप और पल्स की लाइव टेलीमेट्री ट्रैकिंग",
        telehealthVideoTitle: "टेलीहेल्थ वीडियो कॉल",
        telehealthVideoDesc: "डॉक्टर के साथ आमने-सामने वीडियो परामर्श",
        refillsTitle: "1-क्लिक दवा रीफिल",
        refillsDesc: "फार्मेसी से दवाओं की त्वरित डिलीवरी",
        labsTitle: "डायग्नोस्टिक लैब्स",
        labsDesc: "ईसीजी, रक्त जांच की आधिकारिक डिजिटल रिपोर्ट"
      },
      auth: {
        portalTitle: "स्वास्थ्यकनेक्ट पोर्टल",
        portalSubtitle: "डेमो एक्सेस एवं प्रमाणीकरण गेटवे",
        patientPortal: "मरीज पोर्टल",
        doctorPortal: "डॉक्टर क्लिनिकल हब",
        patientSignInTitle: "मरीज पोर्टल साइन इन",
        doctorSignInTitle: "डॉक्टर पोर्टल साइन इन",
        patientSub: "अपने सत्यापित ईमेल या मेडिकल रिकॉर्ड नंबर (MRN) से साइन इन करें",
        doctorSub: "अपने क्लिनिकल ईमेल या मेडिकल लाइसेंस आईडी से साइन इन करें",
        quickDemo: "⚡ वन-क्लिक डेमो एक्सेस",
        instantLogin: "त्वरित प्रवेश",
        emailLabel: "ईमेल या स्वास्थ्य रिकॉर्ड पहचानकर्ता",
        emailPlaceholder: "उदा: alex.johnson@example.com",
        passwordLabel: "पासवर्ड",
        passwordPlaceholder: "पासवर्ड दर्ज करें",
        forgotPass: "पासवर्ड भूल गए?",
        signInBtn: "साइन इन (डेमो मोड)",
        createAccount: "डेमो खाता बनाएं",
        registerPrompt: "स्वास्थ्यकनेक्ट पर नए हैं?",
        registerLink: "डेमो खाता पंजीकृत करें",
        fullName: "पूरा नाम",
        fullNamePlaceholder: "उदा: रमेश कुमार",
        emailAddress: "ईमेल पता",
        roleSelect: "खाता प्रकार",
        rolePatient: "मरीज पोर्टल",
        roleDoctor: "डॉक्टर पोर्टल (सत्यापन आवश्यक)",
        cancel: "रद्द करें",
        doctorNotice: "* नोट: डॉक्टर खातों के लिए उत्पादन में क्लिनिकल सत्यापन की आवश्यकता होती है। इस प्रोटोटाइप में डेमो मोड सक्षम है।",
        authenticating: "प्रमाणीकरण हो रहा है...",
        resetTitle: "क्रेडेंशियल रीसेट करें (डेमो)",
        resetDesc: "पासवर्ड रीसेट निर्देश प्राप्त करने के लिए अपना पंजीकृत ईमेल दर्ज करें।",
        sendResetBtn: "रीसेट निर्देश भेजें",
        officialHelplines: "आधिकारिक हेल्पलाइन (भारत)",
        nationalAmbulance: "राष्ट्रीय एम्बुलेंस",
        teleAdvice: "स्वास्थ्य सलाह / टेलीमेडिसिन"
      },
      dashboard: {
        welcomeHello: "नमस्ते,",
        healthStatusLabel: "वर्तमान स्वास्थ्य स्थिति:",
        stableHypertension: "स्थिर • नियंत्रित स्टेज-1 उच्च रक्तचाप",
        bloodGroup: "रक्त समूह:",
        mrn: "MRN संख्या:",
        attendingDoctor: "चिकित्सक: डॉ. सारा लिन, एमडी",
        joinTelehealth: "टेली-परामर्श में शामिल हों",
        govtSchemesBtn: "सरकारी योजनाएं",
        nearbyHeader: "📍 नजदीकी स्वास्थ्य केंद्र एवं अस्पताल",
        nearbyDesc: "अपने वर्तमान स्थान के पास सत्यापित सरकारी अस्पताल, पीएचसी, सीएचसी, दवा की दुकानें और 24x7 आपातकालीन सेवाएं खोजें।",
        findNearMe: "नजदीकी अस्पताल खोजें",
        telemetryHeader: "📡 नवीनतम वाइटल साइन्स टेलीमेट्री",
        telemetrySub: "निरंतर रिमोट मरीज निगरानी एवं जुड़े हुए बायोमेट्रिक सेंसर",
        syncDevices: "डिवाइस सिंक करें",
        syncing: "सिंक हो रहा है...",
        bloodPressure: "रक्तचाप (BP)",
        optimalRange: "उत्तम दायरा",
        armCuffSync: "बीपी कफ सिंक",
        heartRate: "हृदय गति (पल्स)",
        normalSinus: "सामान्य साइनस रिदम",
        restingPulse: "रेस्टिंग पल्स",
        spo2: "रक्त ऑक्सीजन (SpO2)",
        optimalOxygen: "उत्तम ऑक्सीजन स्तर",
        pulseOximeter: "पल्स ऑक्सीमीटर",
        temperature: "शरीर का तापमान",
        afebrile: "सामान्य (बुखार रहित)",
        tympanicSensor: "डिजिटल सेंसर",
        glucose: "खाली पेट रक्त शर्करा (Fasting)",
        normalGlycemic: "सामान्य शर्करा",
        glucometerSync: "ग्लूकोमीटर सिंक",
        respiratoryRate: "श्वसन दर",
        eupnea: "सामान्य श्वसन",
        chestRespiration: "चेस्ट रेस्पिरेशन",
        trendTitle: "7-दिवसीय बायोमेट्रिक टेलीमेट्री रुझान",
        trendSub: "स्वचालित होम मॉनिटरिंग के माध्यम से दर्ज दैनिक वाइटल्स",
        pulseBpmLegend: "पल्स (BPM)",
        systolicBpLegend: "सिस्टोलिक BP",
        spo2Legend: "SpO2 (%)",
        upcomingConsults: "आगामी अपॉइंटमेंट",
        bookNew: "+ नया बुक करें",
        activePrescriptions: "सक्रिय दवा के पर्चे",
        viewAllArrow: "सभी देखें →"
      },
      nearby: {
        title: "नजदीकी सरकारी स्वास्थ्य केंद्र खोजें",
        sub: "अपने नजदीकी सरकारी अस्पताल, सामुदायिक स्वास्थ्य केंद्र (CHC), प्राथमिक स्वास्थ्य केंद्र (PHC), आयुष्मान आरोग्य मंदिर, फार्मेसी और 24x7 आपातकालीन ट्रॉमा केंद्र खोजें।",
        autoDetectGps: "जीपीएस स्थान स्वतः पहचानें",
        detectingLocation: "📍 आपका स्थान पहचाना जा रहा है...",
        findingHospitals: "🏥 नजदीकी अस्पताल खोजे जा रहे हैं...",
        searchPlaceholder: "अस्पताल का नाम, क्षेत्र, शहर या पिन कोड द्वारा खोजें...",
        searchRadius: "खोज का दायरा:",
        dist5km: "5 किमी के भीतर",
        dist10km: "10 किमी के भीतर",
        dist25km: "25 किमी के भीतर",
        dist50km: "50 किमी के भीतर",
        allFacilities: "सभी सुविधाएं",
        govtHospitals: "सरकारी अस्पताल",
        phc: "प्राथमिक स्वास्थ्य केंद्र (PHC)",
        chc: "सामुदायिक स्वास्थ्य केंद्र (CHC)",
        ayushmanMandir: "आयुष्मान आरोग्य मंदिर",
        clinics: "क्लिनिक एवं औषधालय",
        labs: "डायग्नोस्टिक लैब",
        pharmacies: "फार्मेसी एवं जन औषधि",
        emergencyTrauma: "24x7 आपातकालीन ट्रॉमा",
        getDirections: "दिशा-निर्देश",
        viewOnMap: "मानचित्र पर देखें",
        open24x7: "खुला है • 24x7 आपातकालीन एवं आईपीडी",
        closed: "बंद है",
        phone: "फोन:",
        address: "पता:",
        distanceAway: "की दूरी पर",
        noHospitalsTitle: "इस दायरे में कोई अस्पताल नहीं मिला:",
        noHospitalsDesc: "कृपया खोज का दायरा बढ़ाएं या नजदीकी शहर के नाम से खोजें।",
        searchWithin25: "25 किमी के दायरे में खोजें",
        searchWithin50: "50 किमी के दायरे में खोजें",
        tryAgain: "पुनः प्रयास करें",
        retry: "पुनः प्रयास करें",
        unableToFind: "वर्तमान में नजदीकी अस्पताल खोजने में असमर्थ।",
        locationDeniedTitle: "स्थान अनुमति आवश्यक",
        locationDeniedDesc: "स्थान अनुमति अस्वीकृत कर दी गई। नजदीकी अस्पताल देखने के लिए कृपया ब्राउज़र सेटिंग्स में स्थान की अनुमति दें।",
        enableLocation: "स्थान अनुमति दें",
        enterManually: "स्थान मैन्युअल रूप से दर्ज करें",
        privacyNotice: "गोपनीयता सूचना: आपके स्थान का उपयोग केवल नजदीकी दूरी की गणना के लिए किया जाता है।"
      },
      appointments: {
        title: "निर्धारित परामर्श एवं अपॉइंटमेंट",
        sub: "अपने आगामी अस्पताल दौरों और टेली-ओपीडी वीडियो परामर्शों को देखें।",
        bookNewBtn: "+ अपॉइंटमेंट बुक करें",
        upcomingTab: "आगामी अपॉइंटमेंट",
        pastTab: "पुराने परामर्श का इतिहास",
        doctor: "डॉक्टर",
        specialty: "विशेषज्ञता",
        dateTime: "दिनांक एवं समय",
        mode: "माध्यम",
        status: "स्थिति",
        actions: "कार्रवाई",
        inPerson: "व्यक्तिगत अस्पताल दौरा",
        telehealthVideo: "टेलीहेल्थ वीडियो कॉल",
        confirmed: "पुष्टि की गई",
        completed: "पूर्ण",
        cancelled: "रद्द",
        joinVideo: "वीडियो कॉल में शामिल हों",
        cancelApt: "अपॉइंटमेंट रद्द करें",
        reschedule: "समय बदलें",
        reason: "परामर्श का कारण",
        noUpcoming: "कोई आगामी अपॉइंटमेंट निर्धारित नहीं है।",
        noPast: "कोई पुराना अपॉइंटमेंट इतिहास दर्ज नहीं है।",
        bookNowArrow: "अभी बुक करें →",
        modalTitle: "चिकित्सा परामर्श बुक करें",
        selectDoctor: "डॉक्टर / विशेषज्ञ चुनें",
        selectDate: "पसंदीदा तारीख",
        selectTime: "पसंदीदा समय",
        consultMode: "परामर्श माध्यम",
        reasonPlaceholder: "अपने लक्षण या परामर्श का कारण संक्षेप में बताएं...",
        confirmBookingBtn: "अपॉइंटमेंट बुकिंग की पुष्टि करें"
      },
      schemes: {
        title: "भारत सरकार की स्वास्थ्य योजनाएं",
        sub: "केंद्र और राज्य सरकार के सार्वजनिक स्वास्थ्य कार्यक्रम, कैशलेस इलाज और मुफ्त जेनेरिक दवा योजनाएं।",
        searchPlaceholder: "नाम या लाभ के आधार पर सरकारी योजनाएं खोजें...",
        allSchemes: "सभी योजनाएं",
        ruralHealth: "ग्रामीण स्वास्थ्य",
        universalCover: "सार्वभौमिक स्वास्थ्य कवरेज",
        tribalHealth: "जनजातीय एवं वंचित वर्ग",
        infra: "स्वास्थ्य अवसंरचना",
        diseasePrevention: "रोग रोकथाम",
        checkEligibility: "पात्रता जांचें",
        applyCard: "कार्ड के लिए आवेदन करें",
        findHospitals: "सूचीबद्ध अस्पताल खोजें",
        officialSite: "आधिकारिक वेबसाइट",
        pmjayTitle: "आयुष्मान भारत पीएम-जय (PM-JAY)",
        pmjayDesc: "पात्र परिवारों को प्रति वर्ष ₹5,00,000 तक का मुफ्त द्वितीयक और तृतीयक अस्पताल इलाज कवर।",
        nhmTitle: "राष्ट्रीय स्वास्थ्य मिशन (NHM)",
        nhmDesc: "ग्रामीण और शहरी भारत में सभी के लिए गुणवत्तापूर्ण स्वास्थ्य सेवाओं की सार्वभौमिक पहुंच।",
        pmjanmanTitle: "पीएम-जनमन (जनजातीय स्वास्थ्य मिशन)",
        pmjanmanDesc: "विशेष रूप से कमजोर जनजातीय समूहों (PVTG) के लिए मोबाइल मेडिकल यूनिट और सिकल सेल जांच।",
        janAushadhiTitle: "प्रधानमंत्री जन औषधि योजना",
        janAushadhiDesc: "10,000+ जन औषधि केंद्रों पर बाजार भाव से 50% से 90% कम कीमत पर उच्च गुणवत्ता वाली दवाएं।"
      },
      emergency: {
        title: "आपातकालीन जानकारी एवं त्वरित सहायता",
        sub: "तत्काल 24x7 आपातकालीन सेवा, 108 एम्बुलेंस सहायता, नजदीकी ट्रॉमा सेंटर और प्राथमिक चिकित्सा गाइड।",
        call108: "108 आपातकालीन एम्बुलेंस को कॉल करें",
        call104: "104 स्वास्थ्य हेल्पलाइन पर कॉल करें",
        call112: "112 राष्ट्रीय आपातकालीन नंबर पर कॉल करें",
        nearestHospital: "निकटतम आपातकालीन ट्रॉमा अस्पताल",
        firstAidTitle: "आपातकालीन प्राथमिक चिकित्सा गाइड",
        cprTitle: "सीपीआर और कार्डियक अरेस्ट",
        cprDesc: "छाती के बीच में 100-120 प्रति मिनट की गति से तेजी से और मजबूती से दबाएं।",
        snakeBiteTitle: "सांप काटने पर प्राथमिक उपचार",
        snakeBiteDesc: "मरीज को शांत रखें, डंक लगे अंग को हृदय के स्तर से नीचे स्थिर रखें। चीरा न लगाएं।",
        burnsTitle: "जलने पर प्राथमिक उपचार",
        burnsDesc: "जले हुए स्थान पर कम से कम 10 मिनट तक ठंडा बहता पानी डालें। बर्फ न लगाएं।",
        bleedingTitle: "रक्तस्राव रोकने का उपाय",
        bleedingDesc: "घाव पर साफ कपड़े से सीधा दबाव डालें। घायल अंग को ऊपर उठाएं।",
        triggerSosBtn: "तत्काल 108 एसओएस अलर्ट भेजें",
        sosModalTitle: "आपातकालीन 108 एम्बुलेंस अनुरोध की पुष्टि करें",
        sosModalDesc: "क्या आप वाकई 108 आपातकालीन अलर्ट भेजना चाहते हैं? आपका जीपीएस स्थान निकटतम यूनिट को भेजा जाएगा।",
        confirmDispatch: "पुष्टि करें और 108 भेजें"
      },
      voice: {
        title: "वॉयस असिस्टेंट",
        statusOff: "वॉयस असिस्टेंट बंद है",
        statusListening: "सुन रहा है... (अब बोलें)",
        statusProcessing: "अनुरोध प्रोसेस हो रहा है...",
        statusSpeaking: "बोल रहा है...",
        statusReady: "तैयार है (बोलने के लिए माइक दबाएं)",
        greeting: "नमस्ते! मैं <strong>स्वास्थ्यकनेक्ट वॉयस AI</strong> हूँ। आज मैं आपकी क्या मदद कर सकता हूँ?",
        locating: "📍 आपका स्थान खोजा जा रहा है...",
        micPrompt: "अपनी चुनी हुई भाषा में बोलने के लिए माइक्रोफोन आइकन पर टैप करें।",
        typePrompt: "या अपना चिकित्सा प्रश्न यहाँ लिखें...",
        sendBtn: "भेजें",
        chipNearby: "🏥 नजदीकी अस्पताल",
        chipApts: "📅 मेरे अपॉइंटमेंट",
        chipRx: "💊 दवा के पर्चे",
        chipSchemes: "🏛️ सरकारी योजनाएं",
        chipEmergency: "🚨 आपातकालीन 108",
        micPermissionDenied: "वॉयस कमांड के लिए माइक्रोफोन अनुमति आवश्यक है। आप नीचे टाइप कर सकते हैं।"
      },
      doctor: {
        portalTitle: "क्लिनिकल कमांड सेंटर",
        disclaimer: "डॉक्टर सत्यापन आवश्यक (प्रोटोटाइप डेमो मोड): पंजीकृत चिकित्सकों को सत्यापन के बाद क्रेडेंशियल दिए जाते हैं। यह स्टेशन डेमो मरीजों की कतार दिखाता है।",
        workstationOnline: "क्लिनिकल वर्कस्टेशन ऑनलाइन",
        ehrSynced: "EHR सिंक हुआ",
        openQueueBtn: "मरीजों की कतार खोलें",
        registeredPatients: "पंजीकृत मरीज",
        activeCharts: "सक्रिय चार्ट",
        scheduledConsults: "निर्धारित परामर्श",
        todayTotal: "आज का कुल",
        patientsWaiting: "प्रतीक्षारत मरीज",
        triageQueue: "ट्राइएज कतार",
        consultationsDone: "पूर्ण परामर्श",
        completedToday: "आज पूर्ण हुए",
        patientQueueTitle: "आज के मरीजों की कतार एवं ट्राइएज",
        allFilter: "सभी केस",
        waitingFilter: "प्रतीक्षारत",
        inConsultFilter: "परामर्श में",
        completedFilter: "पूर्ण",
        thPatient: "मरीज का विवरण",
        thTime: "समय / स्लॉट",
        thReason: "मुख्य समस्या",
        thVitals: "वाइटल्स टेलीमेट्री",
        thStatus: "ट्राइएज स्थिति",
        thAction: "कार्रवाई",
        startConsult: "परामर्श शुरू करें",
        reviewEhr: "EHR देखें",
        writeRxBtn: "पर्चा / सोप नोट लिखें",
        soapModalTitle: "क्लिनिकल परामर्श एवं SOAP ई-पर्चा",
        patientSelectLabel: "मरीज चुनें",
        chiefComplaintLabel: "मुख्य समस्या एवं लक्षण",
        subjectiveLabel: "सब्जेक्टिव (मरीज द्वारा बताए गए लक्षण)",
        objectiveLabel: "ऑब्जेक्टिव (जांच एवं वाइटल्स रिपोर्ट)",
        assessmentLabel: "असेसमेंट एवं नैदानिक निष्कर्ष",
        planLabel: "उपचार योजना एवं रणनीति",
        rxMedName: "दवा का नाम",
        rxStrength: "मात्रा / स्ट्रेंथ",
        rxDosage: "खुराक और निर्देश",
        rxJanAushadhi: "जन औषधि जेनेरिक विकल्प",
        saveAbhaBtn: "आभा में सहेजें और सिंक करें",
        discardBtn: "रद्द करें"
      },
      common: {
        onlineMode: "🟢 ऑनलाइन मोड",
        offlineMode: "🔴 ऑफ़लाइन मोड",
        connectedText: "इंटरनेट से जुड़ा हुआ है। सभी सेवाएं सक्रिय हैं।",
        liveSynced: "लाइव सिंक हुआ",
        dataSaver: "डेटा सेवर",
        dataSaverToggle: "डेटा सेवर बदलें",
        notifications: "सूचनाएं",
        notificationsCenter: "सूचना केंद्र",
        clearAll: "सभी हटाएं",
        emergencySos: "आपातकालीन एसओएस",
        bookVisit: "अपॉइंटमेंट लें",
        loading: "लोड हो रहा है...",
        success: "सफल",
        error: "त्रुटि",
        info: "जानकारी",
        save: "सहेजें",
        cancel: "रद्द करें",
        delete: "हटाएं",
        edit: "संपादित करें",
        confirm: "पुष्टि करें",
        search: "खोजें",
        filter: "फ़िल्टर",
        download: "डाउनलोड",
        close: "बंद करें",
        back: "पीछे",
        next: "आगे",
        details: "विवरण",
        share: "साझा करें",
        copyright: "© 2026 स्वास्थ्यकनेक्ट • स्मार्ट इंडिया हैकथॉन ग्रामीण स्वास्थ्य प्रोटोटाइप • केवल डेमो डेटा"
      }
    }
  };

  // =========================================================================
  // 2. FLAT PHRASE DATABASE & REVERSE INDEX FOR ALL TEXT NODES
  // =========================================================================
  const phraseMap = {};
  const reverseIndex = {};

  // Populate phraseMap with comprehensive English <-> Telugu <-> Hindi phrases
  const rawPhrases = [
    // Top Tickers & Global
    ["Emergency Services: 108 (Ambulance) / 112 (National Emergency)", "అత్యవసర సేవలు: 108 (అంబులెన్స్) / 112 (జాతీయ అత్యవసర సహాయం)", "आपातकालीन सेवाएं: 108 (एम्बुलेंस) / 112 (राष्ट्रीय आपातकाल)"],
    ["Emergency: 108 (Ambulance) / 112", "అత్యవసర సహాయం: 108 (అంబులెన్స్) / 112", "आपातकालीन सहायता: 108 (एम्बुलेंस) / 112"],
    ["Accessible Healthcare for Every Village", "ప్రతి గ్రామానికి అందుబాటులో ఉండే ఆరోగ్య సంరక్షణ", "हर गांव के लिए सुलभ स्वास्थ्य सेवा"],
    ["Privacy-focused prototype • Demo data only", "గోప్యత ఆధారిత ప్రోటోటైప్ • డెమో డేటా మాత్రమే", "गोपनीयता-केंद्रित प्रोटोटाइप • केवल डेमो डेटा"],
    ["Privacy-focused prototype &bull; Demo data only", "గోప్యత ఆధారిత ప్రోటోటైప్ • డెమో డేటా మాత్రమే", "गोपनीयता-केंद्रित प्रोटोटाइप • केवल डेमो डेटा"],
    ["Detecting location...", "ప్రదేశాన్ని గుర్తిస్తోంది...", "स्थान पहचाना जा रहा है..."],
    ["📍 Detecting location...", "📍 ప్రదేశాన్ని గుర్తిస్తోంది...", "📍 स्थान पहचाना जा रहा है..."],
    ["📍 Getting your location...", "📍 మీ ప్రదేశాన్ని గుర్తిస్తోంది...", "📍 आपका स्थान खोजा जा रहा है..."],
    ["🏥 Finding nearby hospitals...", "🏥 సమీప ఆసుపత్రులను శోధిస్తోంది...", "🏥 नजदीकी अस्पताल खोजे जा रहे हैं..."],
    ["⚡ Low Data", "⚡ తక్కువ డేటా", "⚡ कम डेटा"],
    ["Low Data Mode", "తక్కువ డేటా మోడ్", "कम डेटा मोड"],
    ["Toggle Low Data Mode", "తక్కువ డేటా మోడ్ మార్చండి", "कम डेटा मोड बदलें"],
    ["Toggle Low Data Mode for rural low-bandwidth", "తక్కువ డేటా మోడ్ మార్చండి", "कम डेटा मोड बदलें"],
    ["Patient Sign In", "పేషెంట్ సైన్ ఇన్", "मरीज साइन इन"],
    ["Doctor Sign In", "డాక్టర్ సైన్ ఇన్", "डॉक्टर साइन इन"],
    ["Sign In as Patient", "పేషెంట్‌గా సైన్ ఇన్ అవ్వండి", "मरीज के रूप में साइन इन करें"],
    ["Sign In as Doctor / MD", "వైద్యుడిగా సైన్ ఇన్ అవ్వండి", "डॉक्टर के रूप में साइन इन करें"],
    ["Sign In (Demo Mode)", "సైన్ ఇన్ (డెమో మోడ్)", "साइन इन (डेमो मोड)"],
    ["Register demo account", "డెమో ఖాతా నమోదు చేసుకోండి", "डेमो खाता पंजीकृत करें"],
    ["New to SwasthyaConnect?", "స్వాస్థ్యకనెక్ట్‌కు కొత్తవారా?", "स्वास्थ्यकनेक्ट पर नए हैं?"],
    ["Choose Your Healthcare Portal", "మీ ఆరోగ్య పోర్టల్‌ను ఎంచుకోండి", "अपना स्वास्थ्य पोर्टल चुनें"],
    ["Choose Your", "ఎంచుకోండి", "चुनें"],
    ["Healthcare Portal", "ఆరోగ్య పోర్టల్", "स्वास्थ्य पोर्टल"],
    ["Welcome to SwasthyaConnect. Please select your role to access your dedicated rural healthcare portal or demo physician workstation.", "స్వాస్థ్యకనెక్ట్‌కు స్వాగతం. మీ గ్రామీణ ఆరోగ్య పోర్టల్ లేదా వైద్యుల వర్క్‌స్టేషన్‌ను యాక్సెస్ చేయడానికి మీ పాత్రను ఎంచుకోండి.", "स्वास्थ्यकनेक्ट में आपका स्वागत है। अपने समर्पित ग्रामीण स्वास्थ्य पोर्टल या डॉक्टर वर्कस्टेशन तक पहुंचने के लिए अपनी भूमिका चुनें।"],
    ["Patients & Families", "రోగులు & కుటుంబాలు", "मरीज एवं परिवार"],
    ["Physicians & Staff", "వైద్యులు & సిబ్బంది", "चिकित्सक एवं स्टाफ"],
    ["Access your medical chart, live vitals, prescription refills, upcoming doctor visits, and telehealth chat.", "మీ వైద్య చార్ట్, లైవ్ వైటల్స్, ప్రిస్క్రిప్షన్ రీఫిల్స్, రాబోయే డాక్టర్ అపాయింట్‌మెంట్లు మరియు టెలీహెల్త్ సేవలను పొందండి.", "अपना मेडिकल चार्ट, लाइव वाइटल्स, दवा के पर्चे, आगामी डॉक्टर अपॉइंटमेंट और टेलीहेल्थ चैट एक्सेस करें।"],
    ["Manage daily patient intake queues, review complete electronic health records (EHR), and write SOAP e-prescriptions.", "రోజువారీ రోగుల క్యూ నిర్వహించండి, పూర్తి ఎలక్ట్రానిక్ హెల్త్ రికార్డులను (EHR) సమీక్షించండి మరియు SOAP ఈ-ప్రిస్క్రిప్షన్లు రాయండి.", "दैनिक मरीज कतार प्रबंधित करें, संपूर्ण इलेक्ट्रॉनिक स्वास्थ्य रिकॉर्ड (EHR) की समीक्षा करें और SOAP ई-पर्चे लिखें।"],
    ["⚡ Instant Demo: Alex Johnson", "⚡ తక్షణ డెమో: అలెక్స్ జాన్సన్ (రోగి)", "⚡ त्वरित डेमो: एलेक्स जॉनसन (मरीज)"],
    ["⚡ Instant Demo: Dr. Sarah Lin, MD", "⚡ తక్షణ డెమో: డాక్టర్ సారా లిన్ (వైద్యులు)", "⚡ त्वरित डेमो: डॉ. सारा लिन (चिकित्सक)"],
    ["Sign in instantly as Alex Johnson (Patient)", "అలెక్స్ జాన్సన్ (రోగి) గా తక్షణమే సైన్ ఇన్ అవ్వండి", "एलेक्स जॉनसन (मरीज) के रूप में तुरंत साइन इन करें"],
    ["Sign in instantly as Dr. Sarah Lin, MD (Doctor)", "డాక్టర్ సారా లిన్ గా తక్షణమే సైన్ ఇన్ అవ్వండి", "डॉ. सारा लिन (डॉक्टर) के रूप में तुरंत साइन इन करें"],
    ["⚡ One-Click Demo Access", "⚡ వన్-క్లిక్ డెమో యాక్సెస్", "⚡ वन-क्लिक डेमो एक्सेस"],
    ["⚡ One-Click Patient Demo Access", "⚡ వన్-క్లిక్ పేషెంట్ డెమో యాక్సెస్", "⚡ वन-क्लिक मरीज डेमो एक्सेस"],
    ["⚡ One-Click Doctor Demo Access", "⚡ వన్-క్లిక్ డాక్టర్ డెమో యాక్సెస్", "⚡ वन-क्लिक डॉक्टर डेमो एक्सेस"],
    ["Instant Login", "తక్షణ ప్రవేశం", "त्वरित प्रवेश"],
    ["Instant Access", "తక్షణ ప్రవేశం", "त्वरित प्रवेश"],

    // Navigation Links
    ["Home", "హోమ్", "होम"],
    ["Find Doctor", "వైద్యుడిని కనుగొనండి", "डॉक्टर खोजें"],
    ["Find a Doctor", "వైద్యుడిని కనుగొనండి", "डॉक्टर खोजें"],
    ["Appointments", "అపాయింట్‌మెంట్లు", "अपॉइंटमेंट"],
    ["Book Appointment", "అపాయింట్‌మెంట్ బుక్ చేయండి", "अपॉइंटमेंट बुक करें"],
    ["Health Records", "ఆరోగ్య రికార్డులు", "स्वास्थ्य रिकॉर्ड"],
    ["Health Schemes", "ఆరోగ్య పథకాలు", "स्वास्थ्य योजनाएं"],
    ["Government Health Schemes", "ప్రభుత్వ ఆరోగ్య పథకాలు", "सरकारी स्वास्थ्य योजनाएं"],
    ["Government Schemes", "ప్రభుత్వ పథకాలు", "सरकारी योजनाएं"],
    ["Govt Schemes", "ప్రభుత్వ పథకాలు", "सरकारी योजनाएं"],
    ["Voice Assistant", "వాయిస్ అసిస్టెంట్", "वॉयस असिस्टेंट"],
    ["🎙️ Open Voice Assistant", "🎙️ వాయిస్ అసిస్టెంట్ తెరవండి", "🎙️ वॉयस असिस्टेंट खोलें"],
    ["Open Voice Assistant", "వాయిస్ అసిస్టెంట్ తెరవండి", "वॉयस असिस्टेंट खोलें"],
    ["Emergency Help", "అత్యవసర సహాయం", "आपातकालीन सहायता"],
    ["Emergency Help (108 / 112)", "అత్యవసర సహాయం (108 / 112)", "आपातकालीन सहायता (108 / 112)"],
    ["Emergency Support (108)", "అత్యవసర సహాయం (108)", "आपातकालीन सहायता (108)"],
    ["Emergency Support", "అత్యవసర సహాయం", "आपातकालीन सहायता"],
    ["Emergency Assistance", "అత్యవసర సహాయం", "आपातकालीन सहायता"],
    ["About", "మా గురించి", "हमारे बारे में"],
    ["Nearby Healthcare Centres", "సమీప ఆరోగ్య కేంద్రాలు", "नजदीकी स्वास्थ्य केंद्र"],
    ["Dashboard & Telemetry", "డ్యాష్‌బోర్డ్ & వైటల్స్", "डैशबोर्ड और टेलीमेट्री"],
    ["Dashboard", "డ్యాష్‌బోర్డ్", "डैशबोर्ड"],
    ["Health Records & Rx", "ఆరోగ్య రికార్డులు & మందులు", "स्वास्थ्य रिकॉर्ड और पर्चे"],
    ["Appointments & Tele-OPD", "అపాయింట్‌మెంట్లు & టెలీ-ఓపీడీ", "अपॉइंटमेंट और टेली-ओपीडी"],
    ["Switch to Doctor View", "డాక్టర్ వ్యూకి మారండి", "डॉक्टर व्यू पर जाएं"],
    ["Switch to Patient View", "పేషెంట్ వ్యూకి మారండి", "मरीज व्यू पर जाएं"],
    ["Log Out", "లాగ్ అవుట్", "लॉग आउट"],
    ["Patient Portal Menu", "పేషెంట్ పోర్టల్ మెనూ", "मरीज पोर्टल मेनू"],
    ["Physician Station", "వైద్యుల విభాగం", "चिकित्सक स्टेशन"],
    ["Doctor Portal Menu", "డాక్టర్ పోర్టల్ మెనూ", "डॉक्टर पोर्टल मेनू"],
    ["System Switch", "సిస్టమ్ మార్పిడి", "सिस्टम स्विच"],
    ["Command Center", "కమాండ్ సెంటర్", "कमांड सेंटर"],
    ["Patient Queue", "రోగుల క్యూ", "मरीजों की कतार"],
    ["Patient Records (EHR)", "రోగుల రికార్డులు (EHR)", "मरीज रिकॉर्ड (EHR)"],
    ["Prescriptions & Notes", "ప్రిస్క్రిప్షన్లు & నోట్స్", "पर्चे और नोट्स"],

    // Form Labels & Fields
    ["Email or Health Record Identifier", "ఈమెయిల్ లేదా హెల్త్ రికార్డ్ ఐడెంటిఫైయర్", "ईमेल या स्वास्थ्य रिकॉर्ड पहचानकर्ता"],
    ["Email or Medical Record # (MRN)", "ఈమెయిల్ లేదా మెడికల్ రికార్డ్ సంఖ్య (MRN)", "ईमेल या मेडिकल रिकॉर्ड नंबर (MRN)"],
    ["Clinical Email or Doctor ID", "క్లినికల్ ఈమెయిల్ లేదా డాక్టర్ ఐడీ", "क्लिनिकल ईमेल या डॉक्टर आईडी"],
    ["Password", "పాస్‌వర్డ్", "पासवर्ड"],
    ["Forgot password?", "పాస్‌వర్డ్ మర్చిపోయారా?", "पासवर्ड भूल गए?"],
    ["Full Name", "పూర్తి పేరు", "पूरा नाम"],
    ["Email Address", "ఈమెయిల్ చిరునామా", "ईमेल पता"],
    ["Account Role", "ఖాతా రకం", "खाता प्रकार"],
    ["Registered Email", "నమోదిత ఈమెయిల్", "पंजीकृत ईमेल"],
    ["Cancel", "రద్దు చేయండి", "रद्द करें"],
    ["Save", "భద్రపరచండి", "सहेजें"],
    ["Submit", "సమర్పించండి", "जमा करें"],
    ["Edit", "సవరించండి", "संपादित करें"],
    ["Delete", "తొలగించండి", "हटाएं"],
    ["Close", "మూసివేయండి", "बंद करें"],
    ["Confirm", "నిర్ధారించండి", "पुष्टि करें"],
    ["Back", "వెనుకకు", "पीछे"],
    ["Next", "తరువాత", "आगे"],
    ["Search", "శోధించండి", "खोजें"],
    ["Filter", "ఫిల్టర్", "फ़िल्टर"],
    ["All", "అన్నీ", "सभी"],
    ["Send", "పంపండి", "भेजें"],
    ["Download", "డౌన్‌లోడ్", "डाउनलोड"],

    // Dashboard & Telemetry
    ["Hello,", "నమస్కారం,", "नमस्ते,"],
    ["Good day,", "శుభదినం,", "शुभ दिन,"],
    ["Current Health Status:", "ప్రస్తుత ఆరోగ్య స్థితి:", "वर्तमान स्वास्थ्य स्थिति:"],
    ["Stable • Controlled Stage-1 Hypertension", "స్థిరంగా ఉంది • నియంత్రణలో ఉన్న స్టేజ్-1 రక్తపోటు", "स्थिर • नियंत्रित स्टेज-1 उच्च रक्तचाप"],
    ["Blood Group:", "రక్త గ్రూపు:", "रक्त समूह:"],
    ["Attending: Dr. Sarah Lin, MD", "వైద్యులు: డాక్టర్ సారా లిన్, ఎండీ", "चिकित्सक: डॉ. सारा लिन, एमडी"],
    ["Join Telehealth Visit", "టెలీ-కన్సల్టేషన్ చేరండి", "टेली-परामर्श में शामिल हों"],
    ["📍 Nearby Healthcare Centres & Hospitals", "📍 సమీప ఆరోగ్య కేంద్రాలు & ఆసుపత్రులు", "📍 नजदीकी स्वास्थ्य केंद्र एवं अस्पताल"],
    ["Find Healthcare Near Me", "సమీప ఆసుపత్రులను కనుగొనండి", "नजदीकी अस्पताल खोजें"],
    ["📡 Latest Vital Signs Telemetry", "📡 తాజా వైటల్స్ టెలిమెట్రీ", "📡 नवीनतम वाइटल साइन्स टेलीमेट्री"],
    ["Latest Vital Signs Telemetry", "తాజా వైటల్స్ టెలిమెట్రీ", "नवीनतम वाइटल साइन्स टेलीमेट्री"],
    ["Continuous remote patient monitoring & connected biometric sensors", "నిరంతర రిమోట్ రోగి పర్యవేక్షణ & కనెక్ట్ చేయబడిన సెన్సార్లు", "निरंतर रिमोट मरीज निगरानी एवं जुड़े हुए बायोमेट्रिक सेंसर"],
    ["Bluetooth Sensor Connected", "బ్లూటూత్ సెన్సార్ కనెక్ట్ అయింది", "ब्लूटूथ सेंसर कनेक्टेड"],
    ["Sync Devices", "డివైసెస్ సింక్ చేయండి", "डिवाइस सिंक करें"],
    ["Syncing...", "సింక్ అవుతోంది...", "सिंक हो रहा है..."],
    ["Blood Pressure", "రక్తపోటు (BP)", "रक्तचाप (BP)"],
    ["Optimal Range", "సరైన పరిధి", "उत्तम दायरा"],
    ["Arm Cuff Sync", "బీపీ కఫ్ సింక్", "बीपी कफ सिंक"],
    ["Heart Rate (Pulse)", "గుండె వేగం (పల్స్)", "हृदय गति (पल्स)"],
    ["Heart Rate", "గుండె వేగం", "हृदय गति"],
    ["Normal Sinus Rhythm", "సాధారణ సైన్స్ రిథమ్", "सामान्य साइनस रिदम"],
    ["Normal Sinus", "సాధారణ సైన్స్", "सामान्य साइनस"],
    ["Resting Pulse", "రెస్టింగ్ పల్స్", "रेस्टिंग पल्स"],
    ["Resting Average", "విశ్రాంతి సగటు", "विश्राम औसत"],
    ["Blood Oxygen (SpO2)", "ఆక్సిజన్ స్థాయి (SpO2)", "रक्त ऑक्सीजन (SpO2)"],
    ["Optimal Oxygenation", "సరైన ఆక్సిజన్ స్థాయి", "उत्तम ऑक्सीजन स्तर"],
    ["Pulse Oximeter", "పల్స్ ఆక్సిమీటర్", "पल्स ऑक्सीमीटर"],
    ["Body Temperature", "శరీర ఉష్ణోగ్రత", "शरीर का तापमान"],
    ["Afebrile (Normal)", "సాధారణం (జ్వరం లేదు)", "सामान्य (बुखार रहित)"],
    ["Tympanic Sensor", "డిజిటల్ సెన్సార్", "डिजिटल सेंसर"],
    ["Digital Tympanic", "డిజిటల్ థర్మామీటర్", "डिजिटल थर्मामीटर"],
    ["Fasting Glucose", "ఫాస్టింగ్ బ్లడ్ షుగర్", "खाली पेट रक्त शर्करा"],
    ["Blood Glucose", "బ్లడ్ షుగర్", "रक्त शर्करा"],
    ["Normal Glycemic", "సాధారణ గ్లైసెమిక్", "सामान्य शर्करा"],
    ["Glucometer Sync", "గ్లూకోమీటర్ సింక్", "ग्लूकोमीटर सिंक"],
    ["Respiratory Rate", "శ్వాసక్రియ రేటు", "श्वसन दर"],
    ["Eupnea (Normal)", "సాధారణ శ్వాస", "सामान्य श्वसन"],
    ["Chest Respiration", "ఛాతీ రెస్పిరేషన్", "चेस्ट रेस्पिरेशन"],
    ["7-Day Biometric Telemetry & Vitals Trend", "7 రోజుల బయోమెట్రిక్ టెలిమెట్రీ ట్రెండ్", "7-दिवसीय बायोमेट्रिक टेलीमेट्री रुझान"],
    ["Daily resting vitals recorded via automated home monitoring", "గృహ పర్యవేక్షణ ద్వారా నమోదు చేయబడిన రోజువారీ వైటల్స్", "स्वचालित होम मॉनिटरिंग के माध्यम से दर्ज दैनिक वाइटल्स"],
    ["Pulse (BPM)", "పల్స్ (BPM)", "पल्स (BPM)"],
    ["Systolic BP", "సిస్టోలిక్ BP", "सिस्टोलिक BP"],
    ["SpO2 (%)", "SpO2 (%)", "SpO2 (%)"],
    ["Upcoming Appointments", "రాబోయే అపాయింట్‌మెంట్లు", "आगामी अपॉइंटमेंट"],
    ["+ Book New", "+ కొత్తది బుక్ చేయండి", "+ नया बुक करें"],
    ["Active Prescriptions", "క్రియాశీల ప్రిస్క్రిప్షన్లు", "सक्रिय दवा के पर्चे"],
    ["View All →", "అన్నీ చూడండి →", "सभी देखें →"],
    ["View All &rarr;", "అన్నీ చూడండి →", "सभी देखें →"],

    // Nearby Facilities & Map
    ["Find Nearby Government Healthcare Centres", "సమీప ప్రభుత్వ ఆరోగ్య కేంద్రాలను కనుగొనండి", "नजदीकी सरकारी स्वास्थ्य केंद्र खोजें"],
    ["Auto-Detect GPS Location", "జీపీఎస్ లొకేషన్ ఆటో గుర్తింపు", "जीपीएस स्थान स्वतः पहचानें"],
    ["Detected Location:", "గుర్తించిన ప్రదేశం:", "पहचाना गया स्थान:"],
    ["Search Radius:", "శోధన పరిధి:", "खोज का दायरा:"],
    ["Within 1 km", "1 కి.మీ పరిధిలో", "1 किमी के भीतर"],
    ["Within 5 km", "5 కి.మీ పరిధిలో", "5 किमी के भीतर"],
    ["Within 10 km", "10 కి.మీ పరిధిలో", "10 किमी के भीतर"],
    ["Within 25 km", "25 కి.మీ పరిధిలో", "25 किमी के भीतर"],
    ["Within 50 km", "50 కి.మీ పరిధిలో", "50 किमी के भीतर"],
    ["All Facilities", "అన్ని కేంద్రాలు", "सभी सुविधाएं"],
    ["Government Hospitals", "ప్రభుత్వ ఆసుపత్రులు", "सरकारी अस्पताल"],
    ["PHC (Primary Health)", "ప్రాథమిక ఆరోగ్య కేంద్రాలు (PHC)", "प्राथमिक स्वास्थ्य केंद्र (PHC)"],
    ["CHC (Community Health)", "కమ్యూనిటీ ఆరోగ్య కేంద్రాలు (CHC)", "सामुदायिक स्वास्थ्य केंद्र (CHC)"],
    ["Ayushman Arogya Mandir", "ఆయుష్మాన్ ఆరోగ్య మందిరం", "आयुष्मान आरोग्य मंदिर"],
    ["Clinics & Dispensaries", "క్లినిక్‌లు & డిస్పెన్సరీలు", "क्लिनिक एवं औषधालय"],
    ["Diagnostic Labs", "డయాగ్నస్టిక్ ల్యాబ్‌లు", "डायग्नोस्टिक लैब"],
    ["Pharmacies & Jan Aushadhi", "ఫార్మసీలు & జన్ ఔషధి", "फार्मेसी एवं जन औषधि"],
    ["24x7 Emergency Trauma", "24x7 అత్యవసర ట్రూమా", "24x7 आपातकालीन ट्रॉमा"],
    ["Get Directions", "రూట్ / మార్గం", "दिशा-निर्देश"],
    ["View on Map", "మ్యాప్‌లో చూడండి", "मानचित्र पर देखें"],
    ["Open • 24x7 Emergency & IPD", "తెరిచి ఉంది • 24x7 అత్యవసర సేవలు", "खुला है • 24x7 आपातकालीन एवं आईपीडी"],
    ["Open", "తెరిచి ఉంది", "खुला है"],
    ["Closed", "మూసివేయబడింది", "बंद है"],
    ["away", "దూరంలో", "की दूरी पर"],
    ["km away", "కి.మీ దూరంలో", "किमी की दूरी पर"],
    ["Search within 25 km", "25 కి.మీ పరిధిలో శోధించండి", "25 किमी के दायरे में खोजें"],
    ["Search within 50 km", "50 కి.మీ పరిధిలో శోధించండి", "50 किमी के दायरे में खोजें"],
    ["Try Again", "మళ్లీ ప్రయత్నించండి", "पुनः प्रयास करें"],
    ["Retry", "మళ్లీ ప్రయత్నించండి", "पुनः प्रयास करें"],
    ["Enable Location", "లొకేషన్ అనుమతించండి", "स्थान अनुमति दें"],
    ["Enter Location Manually", "ప్రదేశాన్ని మాన్యువల్‌గా నమోదు చేయండి", "स्थान मैन्युअल रूप से दर्ज करें"],
    ["Sorted by Proximity", "సమీప దూరం ప్రకారం", "दूरी के अनुसार व्यवस्थित"],
    ["Showing all facilities", "అన్ని కేంద్రాలు చూపబడుతున్నాయి", "सभी सुविधाएं दिखाई जा रही हैं"],

    // Schemes
    ["Indian Government Healthcare Schemes", "భారత ప్రభుత్వ ఆరోగ్య పథకాలు", "भारत सरकार की स्वास्थ्य योजनाएं"],
    ["Government Health Schemes & Subsidies", "ప్రభుత్వ ఆరోగ్య పథకాలు & రాయితీలు", "सरकारी स्वास्थ्य योजनाएं एवं सब्सिडी"],
    ["Check Eligibility", "అర్హతను తనిఖీ చేయండి", "पात्रता जांचें"],
    ["Apply for Card", "కార్డు కోసం దరఖాస్తు చేయండి", "कार्ड के लिए आवेदन करें"],
    ["Find Empanelled Hospitals", "నెట్‌వర్క్ ఆసుపత్రులను కనుగొనండి", "सूचीबद्ध अस्पताल खोजें"],
    ["Official Website", "అధికారిక వెబ్‌సైట్", "आधिकारिक वेबसाइट"],
    ["Ayushman Bharat PM-JAY", "ఆయుష్మాన్ భారత్ పీఎం-జేవై", "आयुष्मान भारत पीएम-जय (PM-JAY)"],
    ["Ayushman Bharat", "ఆయుష్మాన్ భారత్", "आयुष्मान भारत"],
    ["National Health Mission (NHM)", "జాతీయ ఆరోగ్య మిషన్ (NHM)", "राष्ट्रीय स्वास्थ्य मिशन (NHM)"],
    ["PM-JANMAN (Tribal Health Mission)", "పీఎం-జన్-మన్ (గిరిజన ఆరోగ్య మిషన్)", "पीएम-जनमन (जनजातीय स्वास्थ्य मिशन)"],
    ["Pradhan Mantri Jan Aushadhi Kendra", "ప్రధాన మంత్రి భారతీయ జన్ ఔషధి కేంద్రం", "प्रधानमंत्री भारतीय जन औषधि केंद्र"],
    ["Rural & Public Healthcare", "గ్రామీణ & ప్రజా ఆరోగ్యం", "ग्रामीण एवं सार्वजनिक स्वास्थ्य"],
    ["Universal Health Coverage", "సార్వత్రిక ఆరోగ్య రక్షణ", "सार्वभौमिक स्वास्थ्य कवरेज"],
    ["Tribal & Underserved Communities", "గిరిజన & వెనుకబడిన వర్గాలు", "जनजातीय एवं वंचित समुदाय"],
    ["Healthcare Infrastructure", "ఆరోగ్య మౌలిక సదుపాయాలు", "स्वास्थ्य अवसंरचना"],
    ["Disease Prevention", "వ్యాధి నివారణ", "रोग रोकथाम"],

    // Emergency
    ["Emergency Information & Rapid Response", "అత్యవసర సమాచారం & తక్షణ సహాయం", "आपातकालीन जानकारी एवं त्वरित सहायता"],
    ["Dial 108 Emergency Ambulance", "108 అత్యవసర అంబులెన్స్‌కి కాల్ చేయండి", "108 आपातकालीन एम्बुलेंस को कॉल करें"],
    ["Dial 104 Health Helpline", "104 ఆరోగ్య హెల్ప్‌లైన్‌కి కాల్ చేయండి", "104 स्वास्थ्य हेल्पलाइन पर कॉल करें"],
    ["Dial 112 National Emergency", "112 జాతీయ అత్యవసర నంబర్‌కు కాల్ చేయండి", "112 राष्ट्रीय आपातकालीन नंबर पर कॉल करें"],
    ["Nearest Emergency Trauma Hospital", "సమీప అత్యవసర ట్రూమా ఆసుపత్రి", "निकटतम आपातकालीन ट्रॉमा अस्पताल"],
    ["Emergency First Aid Quick Guides", "అత్యవసర ప్రథమ చికిత్స గైడ్", "आपातकालीन प्राथमिक चिकित्सा गाइड"],
    ["CPR & Cardiac Arrest", "సీపీఆర్ (CPR) & గుండెపోటు", "सीपीआर और कार्डियक अरेस्ट"],
    ["Snake Bite First Aid", "పాము కాటుకు ప్రథమ చికిత్స", "सांप काटने पर प्राथमिक उपचार"],
    ["Burns & Scalds Care", "కాలిన గాయాల సంరక్షణ", "जलने पर प्राथमिक उपचार"],
    ["Severe Bleeding Control", "తీవ్ర రక్తస్రావం ఆపే పద్ధతులు", "रक्तस्राव रोकने का उपाय"],
    ["Trigger Instant SOS Alert", "తక్షణ 108 SOS అలర్ట్ పంపండి", "तत्काल 108 एसओएस अलर्ट भेजें"],
    ["Trigger Instant 108 SOS Alert", "తక్షణ 108 SOS అలర్ట్ పంపండి", "तत्काल 108 एसओएस अलर्ट भेजें"],
    ["Emergency SOS", "అత్యవసర SOS", "आपातकालीन एसओएस"],
    ["Confirm & Dispatch", "నిర్ధారించి పంపండి", "पुष्टि करें और भेजें"],

    // Appointments & Records
    ["Scheduled Consultations & Appointments", "షెడ్యూల్ చేయబడిన సంప్రదింపులు & అపాయింట్‌మెంట్లు", "निर्धारित परामर्श एवं अपॉइंटमेंट"],
    ["Book New Consultation", "కొత్త సంప్రదింపు బుక్ చేయండి", "नया परामर्श बुक करें"],
    ["Book New Appointment", "కొత్త అపాయింట్‌మెంట్ బుక్ చేయండి", "नया अपॉइंटमेंट बुक करें"],
    ["Upcoming Visits", "రాబోయే అపాయింట్‌మెంట్లు", "आगामी अपॉइंटमेंट"],
    ["Past Appointments", "గత అపాయింట్‌మెంట్లు", "पुराने अपॉइंटमेंट"],
    ["In-Person", "ప్రత్యక్షంగా", "व्यक्तिगत रूप से"],
    ["Telehealth Video", "టెలీహెల్త్ వీడియో", "टेलीहेल्थ वीडियो"],
    ["Confirmed", "నిర్ధారించబడింది", "पुष्टि की गई"],
    ["Completed", "పూర్తయింది", "पूर्ण"],
    ["Cancelled", "రద్దు చేయబడింది", "रद्द"],
    ["Join Video Call", "వీడియో కాల్‌లో చేరండి", "वीडियो कॉल में शामिल हों"],
    ["Electronic Medical Records (EHR)", "ఎలక్ట్రానిక్ మెడికల్ రికార్డులు (EHR)", "इलेक्ट्रॉनिक मेडिकल रिकॉर्ड (EHR)"],
    ["Upload Clinical Document", "వైద్య పత్రం అప్‌లోడ్ చేయండి", "दस्तावेज़ अपलोड करें"],
    ["All Records", "అన్ని రికార్డులు", "सभी रिकॉर्ड"],
    ["Active Medications & Pharmacy Refills", "క్రియాశీల మందులు & రీఫిల్స్", "सक्रिय दवाएं एवं फार्मेसी रिफिल"],
    ["Diagnostic Lab Reports & Pathology", "డయాగ్నస్టిక్ ల్యాబ్ రిపోర్టులు & పాథాలజీ", "डायग्नोस्टिक लैब रिपोर्ट"],
    ["Download Record (PDF)", "పీడీఎఫ్ డౌన్‌లోడ్", "पीडीएफ डाउनलोड करें"],
    ["Share via ABHA", "ఆభా ద్వారా షేర్ చేయండి", "आभा के माध्यम से साझा करें"],

    // Doctor Hub
    ["Clinical Command Center", "క్లినికల్ కమాండ్ సెంటర్", "क्लिनिकल कमांड सेंटर"],
    ["Today's Patient Queue & Triage", "నేటి రోగుల జాబితా & ట్రియేజ్", "आज के मरीजों की कतार एवं ट्राइएज"],
    ["Patients Waiting", "వేచి ఉన్న రోగులు", "प्रतीक्षारत मरीज"],
    ["Consultations Done", "పూర్తయిన సంప్రదింపులు", "पूर्ण परामर्श"],
    ["Patient Medical History", "రోగి వైద్య చరిత్ర", "मरीज का मेडिकल इतिहास"],
    ["Write Rx / SOAP Note", "ప్రిస్క్రిప్షన్ / సోప్ నోట్ రాయండి", "पर्चा / सोप नोट लिखें"],
    ["Save & Sync to ABHA", "ఆభాలో భద్రపరచి సింక్ చేయండి", "आभा में सहेजें और सिंक करें"],
    ["Start Consult", "కన్సల్ట్ ప్రారంభించండి", "परामर्श शुरू करें"],
    ["Review EHR", "EHR సమీక్షించండి", "EHR देखें"],

    // Topbar & System
    ["Data Saver", "డేటా సేవర్", "डेटा सेवर"],
    ["Notifications", "నోటిఫికేషన్లు", "सूचनाएं"],
    ["Notifications Center", "నోటిఫికేషన్ల కేంద్రం", "सूचना केंद्र"],
    ["Clear All", "అన్నీ తొలగించు", "सभी हटाएं"],
    ["Book Visit", "అపాయింట్‌మెంట్", "अपॉइंटमेंट लें"],
    ["🟢 Online Mode", "🟢 ఆన్‌లైన్ మోడ్", "🟢 ऑनलाइन मोड"],
    ["🔴 Offline Mode", "🔴 ఆఫ్‌లైన్ మోడ్", "🔴 ऑफ़लाइन मोड"],
    ["108 Emergency Ambulance", "108 అత్యవసర అంబులెన్స్", "108 आपातकालीन एम्बुलेंस"],
    ["No hospitals found within", "ఈ పరిధిలో ఆసుపత్రులు కనుగొనబడలేదు:", "इस दायरे में कोई अस्पताल नहीं मिला:"],
    ["Unable to find nearby hospitals right now.", "ప్రస్తుతం సమీప ఆసుపత్రులను కనుగొనడం సాధ్యం కాలేదు.", "वर्तमान में नजदीकी अस्पताल खोजने में असमर्थ।"],
    ["Finding nearby hospitals...", "సమీప ఆసుపత్రులను శోధిస్తోంది...", "नजदीकी अस्पताल खोजे जा रहे हैं..."],
    ["Live Synced", "లైవ్ సింక్ అయింది", "लाइव सिंक हुआ"],
    ["GPS", "జీపీఎస్", "जीपीएस"],
    ["India", "భారత్", "भारत"]
  ];

  // Populate phraseMap and reverseIndex from rawPhrases
  rawPhrases.forEach(([en, te, hi]) => {
    const enKey = en.trim();
    phraseMap[enKey] = { te: te.trim(), hi: hi.trim() };
    reverseIndex[enKey] = enKey;
    reverseIndex[te.trim()] = enKey;
    reverseIndex[hi.trim()] = enKey;
  });

  // Recursively map all translations from translations.en, translations.te, translations.hi into phraseMap & reverseIndex
  function buildPhraseMapFromTree(enTree, teTree, hiTree, prefix = '') {
    if (!enTree || typeof enTree !== 'object') return;
    Object.keys(enTree).forEach(key => {
      const enVal = enTree[key];
      const teVal = teTree ? teTree[key] : null;
      const hiVal = hiTree ? hiTree[key] : null;

      if (typeof enVal === 'string') {
        const enTrim = enVal.trim();
        const teTrim = typeof teVal === 'string' ? teVal.trim() : enTrim;
        const hiTrim = typeof hiVal === 'string' ? hiVal.trim() : enTrim;
        
        phraseMap[enTrim] = { te: teTrim, hi: hiTrim };
        reverseIndex[enTrim] = enTrim;
        reverseIndex[teTrim] = enTrim;
        reverseIndex[hiTrim] = enTrim;

        const fullKey = prefix ? `${prefix}.${key}` : key;
        phraseMap[fullKey] = { te: teTrim, hi: hiTrim };
      } else if (typeof enVal === 'object' && enVal !== null) {
        buildPhraseMapFromTree(enVal, teVal, hiVal, prefix ? `${prefix}.${key}` : key);
      }
    });
  }
  buildPhraseMapFromTree(translations.en, translations.te, translations.hi);

  // State
  let currentLang = 'en';

  // Normalize language string
  function normalizeLang(lang) {
    if (!lang) return 'en';
    const l = String(lang).toLowerCase().trim();
    if (l === 'te' || l.startsWith('te') || l.includes('telugu')) return 'te';
    if (l === 'hi' || l.startsWith('hi') || l.includes('hindi')) return 'hi';
    return 'en';
  }

  // Load saved language preference
  try {
    const saved = localStorage.getItem('swasthya_lang');
    if (saved) {
      currentLang = normalizeLang(saved);
    }
  } catch (e) {}

  /**
   * Helper: Look up nested key e.g. "nav.home" or "dashboard.bloodPressure"
   */
  function getNestedKey(obj, path) {
    if (!obj || !path) return null;
    return path.split('.').reduce((prev, curr) => (prev && prev[curr] !== undefined) ? prev[curr] : null, obj);
  }

  /**
   * Translate a key or English phrase
   * Usage:
   *   SwasthyaI18n.t('nav.home') -> "హోమ్"
   *   SwasthyaI18n.t('Blood Pressure') -> "రక్తపోటు (BP)"
   */
  function t(phraseOrKey, fallback = '') {
    if (!phraseOrKey) return fallback;
    const clean = String(phraseOrKey).trim();

    // 1. Check hierarchical translations[currentLang][path]
    const fromNested = getNestedKey(translations[currentLang], clean);
    if (fromNested) return fromNested;

    // 2. Check phraseMap via reverseIndex
    const canonical = reverseIndex[clean] || clean;
    if (phraseMap[canonical] && phraseMap[canonical][currentLang]) {
      return phraseMap[canonical][currentLang];
    }

    if (currentLang === 'en') {
      const enNested = getNestedKey(translations.en, clean);
      if (enNested) return enNested;
      return canonical;
    }

    return fallback || clean;
  }

  /**
   * Full Page DOM Translator
   * Walks every text node across the entire DOM tree and translates text,
   * placeholders, titles, aria-labels, and data-i18n attributes.
   */
  function translateEntireDOM() {
    const FILTER_SHOW_TEXT = (typeof NodeFilter !== 'undefined' && NodeFilter.SHOW_TEXT) || 4;
    const FILTER_ACCEPT = (typeof NodeFilter !== 'undefined' && NodeFilter.FILTER_ACCEPT) || 1;
    const FILTER_REJECT = (typeof NodeFilter !== 'undefined' && NodeFilter.FILTER_REJECT) || 2;
    const FILTER_SKIP = (typeof NodeFilter !== 'undefined' && NodeFilter.FILTER_SKIP) || 3;

    // 1. Elements with data-i18n attributes (e.g. data-i18n="nav.home" or data-i18n="navHome")
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      const trans = t(key);
      if (trans && trans !== key) {
        el.textContent = trans;
      } else {
        const direct = t(el.textContent.trim());
        if (direct) el.textContent = direct;
      }
    });

    // 2. Elements with data-i18n-html
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (!key) return;
      const trans = t(key);
      if (trans && trans !== key) {
        el.innerHTML = trans;
      }
    });

    // 3. Text Nodes Walker (Translates all visible text across the page)
    if ((document.body || document.documentElement) && typeof document.createTreeWalker === 'function') {
      try {
        const walker = document.createTreeWalker(
          document.body || document.documentElement,
          FILTER_SHOW_TEXT,
          {
            acceptNode: function (node) {
              if (!node || !node.nodeValue) return FILTER_REJECT;
              const parent = node.parentElement;
              if (!parent) return FILTER_REJECT;

              const tagName = parent.tagName ? parent.tagName.toUpperCase() : '';
              if (
                tagName === 'SCRIPT' ||
                tagName === 'STYLE' ||
                tagName === 'CODE' ||
                tagName === 'PRE' ||
                tagName === 'TEXTAREA' ||
                parent.closest('.lang-switcher-wrap') ||
                parent.closest('.va-lang-picker') ||
                parent.closest('.wa-lang-picker') ||
                parent.id === 'va-debug-panel'
              ) {
                return FILTER_REJECT;
              }

              if (node.nodeValue.trim().length === 0) return FILTER_SKIP;
              return FILTER_ACCEPT;
            }
          }
        );

        const textNodes = [];
        while (walker.nextNode()) {
          textNodes.push(walker.currentNode);
        }

        textNodes.forEach(node => {
          const currentTrim = node.nodeValue.trim();
          if (!currentTrim) return;

          // Track original English text
          if (!node._swasthyaOrigText) {
            node._swasthyaOrigText = reverseIndex[currentTrim] || currentTrim;
          }

          const canonicalKey = node._swasthyaOrigText;
          const leadingSpace = node.nodeValue.match(/^\s*/)[0];
          const trailingSpace = node.nodeValue.match(/\s*$/)[0];

          if (currentLang === 'en') {
            const enText = reverseIndex[currentTrim] || node._swasthyaOrigText || currentTrim;
            node.nodeValue = leadingSpace + enText + trailingSpace;
          } else {
            if (phraseMap[canonicalKey] && phraseMap[canonicalKey][currentLang]) {
              node.nodeValue = leadingSpace + phraseMap[canonicalKey][currentLang] + trailingSpace;
            } else {
              const trans = t(canonicalKey);
              if (trans && trans !== canonicalKey) {
                node.nodeValue = leadingSpace + trans + trailingSpace;
              }
            }
          }
        });
      } catch (e) {
        console.warn('TreeWalker translation error:', e);
      }
    }

    // 4. Input & Textarea Placeholders
    document.querySelectorAll('input[placeholder], textarea[placeholder], [data-i18n-placeholder]').forEach(input => {
      const explicitKey = input.getAttribute('data-i18n-placeholder');
      if (explicitKey) {
        const trans = t(explicitKey);
        if (trans) { input.placeholder = trans; return; }
      }

      const ph = input.placeholder.trim();
      if (!ph) return;

      if (!input.hasAttribute('data-swasthya-orig-ph')) {
        input.setAttribute('data-swasthya-orig-ph', reverseIndex[ph] || ph);
      }

      const canonicalPh = input.getAttribute('data-swasthya-orig-ph') || ph;
      if (currentLang === 'en') {
        input.placeholder = canonicalPh;
      } else if (phraseMap[canonicalPh] && phraseMap[canonicalPh][currentLang]) {
        input.placeholder = phraseMap[canonicalPh][currentLang];
      } else {
        const trans = t(canonicalPh);
        if (trans && trans !== canonicalPh) input.placeholder = trans;
        else if (canonicalPh.toLowerCase().includes('search')) {
          input.placeholder = currentLang === 'te' ? 'ఇక్కడ శోధించండి...' : 'यहाँ खोजें...';
        }
      }
    });

    // 5. Tooltips & Titles
    document.querySelectorAll('[title], [data-i18n-title]').forEach(el => {
      if (el.closest('.lang-switcher-wrap')) return;
      const explicitKey = el.getAttribute('data-i18n-title');
      if (explicitKey) {
        const trans = t(explicitKey);
        if (trans) { el.title = trans; return; }
      }

      const title = el.title.trim();
      if (!title) return;

      if (!el.hasAttribute('data-swasthya-orig-title')) {
        el.setAttribute('data-swasthya-orig-title', reverseIndex[title] || title);
      }

      const canonicalTitle = el.getAttribute('data-swasthya-orig-title') || title;
      if (currentLang === 'en') {
        el.title = canonicalTitle;
      } else if (phraseMap[canonicalTitle] && phraseMap[canonicalTitle][currentLang]) {
        el.title = phraseMap[canonicalTitle][currentLang];
      }
    });

    // 6. Accessibility Aria Labels
    document.querySelectorAll('[aria-label], [data-i18n-aria]').forEach(el => {
      const explicitKey = el.getAttribute('data-i18n-aria');
      if (explicitKey) {
        const trans = t(explicitKey);
        if (trans) { el.setAttribute('aria-label', trans); return; }
      }

      const aria = el.getAttribute('aria-label')?.trim();
      if (!aria) return;

      if (!el.hasAttribute('data-swasthya-orig-aria')) {
        el.setAttribute('data-swasthya-orig-aria', reverseIndex[aria] || aria);
      }

      const canonicalAria = el.getAttribute('data-swasthya-orig-aria') || aria;
      if (currentLang === 'en') {
        el.setAttribute('aria-label', canonicalAria);
      } else if (phraseMap[canonicalAria] && phraseMap[canonicalAria][currentLang]) {
        el.setAttribute('aria-label', phraseMap[canonicalAria][currentLang]);
      }
    });
  }

  /**
   * Global Language Switcher
   * Updates language everywhere across the page
   */
  function setLanguage(lang, skipVoiceSync = false) {
    const normalized = normalizeLang(lang);
    currentLang = normalized;

    try {
      localStorage.setItem('swasthya_lang', normalized);
    } catch (e) {}

    // Update html lang attribute for screen readers and search engines
    if (document.documentElement) {
      document.documentElement.lang = normalized;
    }

    // Apply translation to all elements across the entire page
    translateEntireDOM();

    // Sync all language dropdown selectors on the page
    const dropdowns = document.querySelectorAll('.swasthya-lang-dropdown, #topbar-lang-select, #nav-lang-select, #va-lang-select, #wa-lang-select');
    dropdowns.forEach(sel => {
      if (!sel) return;
      if (sel.id === 'va-lang-select') {
        const vaVal = normalized === 'te' ? 'te-IN' : normalized === 'hi' ? 'hi-IN' : 'en-IN';
        if (sel.value !== vaVal) sel.value = vaVal;
      } else if (sel.value !== normalized) {
        sel.value = normalized;
      }
    });

    // Notify Voice Assistant if available (without auto-starting microphone listening)
    if (!skipVoiceSync && window.SwasthyaVoiceAssistant && typeof window.SwasthyaVoiceAssistant.setLanguage === 'function') {
      const vaCode = normalized === 'te' ? 'te-IN' : normalized === 'hi' ? 'hi-IN' : 'en-IN';
      if (window.SwasthyaVoiceAssistant.getLanguage() !== vaCode) {
        window.SwasthyaVoiceAssistant.setLanguage(vaCode, true);
      }
    }

    // Notify WhatsApp Assistant if available
    if (window.SwasthyaWhatsAppAI && typeof window.SwasthyaWhatsAppAI.setLanguage === 'function') {
      window.SwasthyaWhatsAppAI.setLanguage(normalized);
    }

    // Dispatch global custom event for dynamic components to re-render immediately
    if (typeof window.dispatchEvent === 'function' && typeof CustomEvent !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('swasthyaLanguageChanged', { detail: { lang: normalized } }));
      } catch (e) {}
    }
  }

  // Public API
  window.SwasthyaI18n = {
    t,
    setLanguage,
    getLanguage: () => currentLang,
    translateEntireDOM,
    translations,
    phraseMap,
    reverseIndex
  };

  // Auto-run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setLanguage(currentLang));
  } else {
    setLanguage(currentLang);
  }

})();
