/**
 * SwasthyaConnect - Internationalization (i18n) Engine
 * Supports: English ('en'), Hindi ('hi'), Telugu ('te')
 */

(function () {
  'use strict';

  const translations = {
    en: {
      // General & Common
      brandName: 'SwasthyaConnect',
      brandSubtitle: 'Unified Rural & Urban Digital Healthcare Ecosystem',
      langName: 'English',
      langSelect: 'Language',
      online: 'Online',
      offline: 'Offline',
      offlineMode: 'Offline Mode (Local Storage)',
      offlineNotice: '🔴 Working in offline mode. Changes will sync automatically when back online.',
      search: 'Search',
      filter: 'Filter',
      all: 'All',
      cancel: 'Cancel',
      close: 'Close',
      submit: 'Submit',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      details: 'Details',
      directions: 'Directions',
      share: 'Share',
      call: 'Call',
      book: 'Book',
      confirm: 'Confirm',
      loading: 'Loading...',
      actions: 'Actions',
      status: 'Status',
      date: 'Date',
      time: 'Time',
      distance: 'Distance',
      verified: 'Verified',
      pinOnMap: '📍 Pin',
      viewAll: 'View All',
      km: 'km',

      // Navigation & Menu
      navDashboard: 'Dashboard & Telemetry',
      navRecords: 'Health Records & Rx',
      navNearby: 'Nearby Healthcare Centres',
      navAppointments: 'Appointments & Tele-OPD',
      navSchemes: 'Government Health Schemes',
      navEmergency: 'Emergency Support (108)',
      navDoctorPortal: 'Doctor Portal (EMR)',
      navPatientPortal: 'Patient Portal',
      navSwitchDoctor: 'Switch to Doctor View',
      navSwitchPatient: 'Switch to Patient View',
      navSignOut: 'Log Out',
      navPatientSignIn: 'Patient Sign In',
      navDoctorSignIn: 'Doctor Sign In',

      // Topbar
      topbarDataSaver: 'Data Saver',
      topbarNotifications: 'Notifications',
      topbarEmergencySOS: 'Emergency SOS',
      topbarBookVisit: 'Book Visit',
      topbarClearAll: 'Clear All',
      topbarNotificationsTitle: 'Notifications Center',

      // Patient Dashboard
      dashWelcome: 'Welcome back,',
      dashAbhaNumber: 'ABHA Number',
      dashAbhaAddress: 'ABHA Address',
      dashPmjayStatus: 'PM-JAY Golden Card Status',
      dashEligible: 'Active & Verified',
      dashCoverage: 'Coverage: ₹5,00,000 / Year',
      dashDownloadAbha: 'Download ABHA QR',
      dashShareCard: 'Share Card',
      dashQuickActions: 'Quick Health Actions',
      dashFindNearbyBtn: 'Find Healthcare Near Me',
      dashBookConsultBtn: 'Book Tele-Consultation',
      dashUploadReportBtn: 'Upload Lab Report',
      dashEmergencySOSBtn: 'Instant 108 SOS Dispatch',
      dashVitalsTitle: 'Latest Vital Signs Telemetry',
      dashBluetoothConnected: 'Bluetooth Sensor Connected',
      dashBp: 'Blood Pressure',
      dashHeartRate: 'Heart Rate',
      dashSpo2: 'Blood Oxygen (SpO2)',
      dashTemp: 'Body Temperature',
      dashGlucose: 'Blood Glucose',
      dashNormal: 'Normal',
      dashElevated: 'Elevated',
      dashOptimal: 'Optimal',
      dashRecentActivity: 'Recent Clinical Consultations',
      dashUpcomingVisits: 'Upcoming Appointments',

      // Nearby Healthcare Centres
      nearbyTitle: 'Nearby Healthcare Centres & Hospitals',
      nearbySubtitle: 'Find verified government hospitals, PHCs, pharmacies, diagnostics, and 24x7 emergency services near your current location.',
      nearbyGpsAuto: 'Auto-Detect GPS Location',
      nearbyManualPrompt: 'Or search by City, Town, Village, or PIN code',
      nearbyDetectedLoc: 'Detected Location:',
      nearbyAll: 'All Facilities',
      nearbyGovtHospitals: 'Government Hospitals',
      nearbyPhc: 'PHC (Primary Health)',
      nearbyChc: 'CHC (Community Health)',
      nearbyArogya: 'Ayushman Arogya Mandir',
      nearbyClinics: 'Clinics & Dispensaries',
      nearbyDiagnostics: 'Diagnostic Labs',
      nearbyPharmacies: 'Pharmacies & Jan Aushadhi',
      nearbyEmergency: '24x7 Emergency Trauma',
      nearbyRadius: 'Search Radius:',
      nearbyWithin1km: 'Within 1 km',
      nearbyWithin5km: 'Within 5 km',
      nearbyWithin10km: 'Within 10 km',
      nearbyWithin25km: 'Within 25 km',
      nearbySortedProximity: 'Sorted by Proximity',
      nearbyShowingCount: 'Showing healthcare facilities near you',
      nearbyDirectionsBtn: 'Directions (Google Maps)',
      nearbyCallBtn: 'Call Facility',
      nearbyWhatsAppBtn: 'WhatsApp',
      nearbyPmjayBadge: 'PM-JAY Empanelled',
      nearbyEmergencyBadge: '24x7 Emergency',
      nearbyPrivacyNote: 'Privacy Notice: Your location is used only to help find nearby healthcare services.',

      // Health Records
      recordsTitle: 'Digital Health Records & Prescriptions',
      recordsSubtitle: 'ABHA-linked electronic medical records, digital prescriptions, lab diagnostic reports, and vaccination history.',
      recordsTabAll: 'All Records',
      recordsTabPrescriptions: 'Prescriptions (Rx)',
      recordsTabLabReports: 'Lab & Diagnostic Reports',
      recordsTabVaccines: 'Vaccinations',
      recordsTabDischarge: 'Discharge Summaries',
      recordsDoctor: 'Doctor',
      recordsDiagnosis: 'Diagnosis',
      recordsMedications: 'Prescribed Medications',
      recordsDownloadPdf: 'Download Record (PDF)',
      recordsShareAbha: 'Share via ABHA',

      // Appointments
      aptTitle: 'Appointments & Tele-Consultation',
      aptSubtitle: 'Book in-person visits at government hospitals and PHCs or connect with doctors via video tele-OPD.',
      aptBookNew: 'Book New Appointment',
      aptUpcoming: 'Upcoming Appointments',
      aptPast: 'Past Consultations',
      aptSpecialty: 'Specialty / Department',
      aptDoctor: 'Select Doctor',
      aptDate: 'Consultation Date',
      aptTimeSlot: 'Preferred Time Slot',
      aptType: 'Appointment Type',
      aptInPerson: 'In-Person Hospital Visit',
      aptTeleOPD: 'Video Tele-OPD Consultation',
      aptReason: 'Reason for Visit / Symptoms',
      aptConfirmBtn: 'Confirm Appointment Booking',
      aptJoinCall: 'Join Video Call',
      aptReschedule: 'Reschedule',
      aptCancel: 'Cancel Visit',

      // Government Schemes
      schemesTitle: 'Government Health Schemes & Subsidies',
      schemesSubtitle: 'Central and state public health welfare programs, cashless hospitalization benefits, and free generic medicine schemes.',
      schemesPmjayTitle: 'Ayushman Bharat PM-JAY',
      schemesPmjayDesc: '₹5 Lakh per family per year cashless treatment across 27,000+ empanelled government and private hospitals.',
      schemesAushadhiTitle: 'Pradhan Mantri Jan Aushadhi Kendra',
      schemesAushadhiDesc: 'Quality generic medicines and surgical products at 50% to 90% lower prices than branded medicines.',
      schemesNhmTitle: 'National Health Mission (NHM)',
      schemesNhmDesc: 'Free maternal and child healthcare, universal immunization, and primary preventive care at all PHCs.',
      schemesAarogyasriTitle: 'Aarogyasri / State Health Assurance',
      schemesAarogyasriDesc: 'State financial protection for poor families covering critical surgeries and advanced tertiary care.',
      schemesCheckEligibility: 'Check Eligibility',
      schemesEmpanelledHospitals: 'Find Empanelled Hospitals',
      schemesApplyNow: 'Apply for Card',

      // Emergency Support
      emergencyTitle: 'Emergency Medical Dispatch & Trauma Care',
      emergencySubtitle: 'Instant 24x7 emergency dispatch, ambulance tracking, nearest trauma center navigation, and emergency first aid guide.',
      emergencyDial108: 'Dial 108 Emergency Ambulance',
      emergencyDial104: 'Dial 104 Health Helpline',
      emergencyNearestTrauma: 'Nearest Emergency Trauma Hospital',
      emergencyFirstAidTitle: 'Emergency First Aid Quick Guides',
      emergencyCpr: 'CPR & Cardiac Arrest',
      emergencySnakeBite: 'Snake Bite First Aid',
      emergencyBurns: 'Burns & Scalds Care',
      emergencyBleeding: 'Severe Bleeding Control',
      emergencyTriggerSos: 'Trigger Instant SOS Alert',

      // Auth & Login
      loginPatientTitle: 'Patient Portal Sign In',
      loginDoctorTitle: 'Doctor & Hospital EMR Sign In',
      loginAadhaarPlaceholder: 'Enter 12-digit Aadhaar / ABHA Number',
      loginPasswordPlaceholder: 'Enter Password',
      loginOtpPlaceholder: 'Enter 6-digit SMS OTP',
      loginSendOtp: 'Send OTP',
      loginVerifyOtp: 'Verify & Sign In',
      loginWithBiometric: 'Biometric / Fingerprint Sign In',
      loginQuickDemoPatient: 'Demo Patient Login',
      loginQuickDemoDoctor: 'Demo Doctor Login',
      loginDontHaveAccount: 'Don\'t have an ABHA ID?',
      loginCreateAbha: 'Create New ABHA Account',

      // Doctor Portal
      docCommandCenter: 'Clinical Command Center',
      docQueueTitle: 'Today\'s Patient Queue & Triage',
      docWaitingCount: 'Patients Waiting',
      docCompletedCount: 'Consultations Done',
      docWriteRx: 'Write Rx / SOAP Note',
      docPatientHistory: 'Patient Medical History',
      docSubjective: 'Subjective (Symptoms / Chief Complaint)',
      docObjective: 'Objective (Vitals & Physical Exam)',
      docAssessment: 'Assessment & Clinical Diagnosis',
      docPlan: 'Plan (Rx & Lab Orders)',
      docSaveSync: 'Save & Sync to ABHA',

      // Modals
      modalBookAptTitle: 'Book Doctor Consultation',
      modalPrescribeTitle: 'Digital Prescription & SOAP Note',
      modalSosTitle: 'Emergency SOS Confirmation',
      modalSosDesc: 'Are you sure you want to trigger an Emergency 108 Ambulance Dispatch with your current GPS coordinates?'
    },

    hi: {
      // General & Common
      brandName: 'स्वास्थ्यकनेक्ट',
      brandSubtitle: 'एकीकृत ग्रामीण और शहरी डिजिटल स्वास्थ्य सेवा पारिस्थितिकी तंत्र',
      langName: 'हिंदी',
      langSelect: 'भाषा',
      online: 'ऑनलाइन',
      offline: 'ऑफ़लाइन',
      offlineMode: 'ऑफ़लाइन मोड (स्थानीय संग्रहण)',
      offlineNotice: '🔴 ऑफ़लाइन मोड में काम कर रहे हैं। ऑनलाइन आने पर डेटा स्वतः सिंक हो जाएगा।',
      search: 'खोजें',
      filter: 'फ़िल्टर',
      all: 'सभी',
      cancel: 'रद्द करें',
      close: 'बंद करें',
      submit: 'जमा करें',
      save: 'सहेजें',
      edit: 'संपादित करें',
      delete: 'हटाएं',
      details: 'विवरण',
      directions: 'दिशा-निर्देश',
      share: 'साझा करें',
      call: 'कॉल करें',
      book: 'बुक करें',
      confirm: 'पुष्टि करें',
      loading: 'लोड हो रहा है...',
      actions: 'कार्रवाई',
      status: 'स्थिति',
      date: 'तारीख',
      time: 'समय',
      distance: 'दूरी',
      verified: 'सत्यापित',
      pinOnMap: '📍 पिन',
      viewAll: 'सभी देखें',
      km: 'किमी',

      // Navigation & Menu
      navDashboard: 'डैशबोर्ड और टेलीमेट्री',
      navRecords: 'स्वास्थ्य रिकॉर्ड और पर्चे',
      navNearby: 'नजदीकी स्वास्थ्य केंद्र',
      navAppointments: 'अपॉइंटमेंट और टेली-ओपीडी',
      navSchemes: 'सरकारी स्वास्थ्य योजनाएं',
      navEmergency: 'आपातकालीन सहायता (108)',
      navDoctorPortal: 'डॉक्टर पोर्टल (ईएमआर)',
      navPatientPortal: 'मरीज पोर्टल',
      navSwitchDoctor: 'डॉक्टर व्यू पर जाएं',
      navSwitchPatient: 'मरीज व्यू पर जाएं',
      navSignOut: 'लॉग आउट',
      navPatientSignIn: 'मरीज साइन इन',
      navDoctorSignIn: 'डॉक्टर साइन इन',

      // Topbar
      topbarDataSaver: 'डेटा सेवर',
      topbarNotifications: 'सूचनाएं',
      topbarEmergencySOS: 'आपातकालीन एसओएस',
      topbarBookVisit: 'अपॉइंटमेंट लें',
      topbarClearAll: 'सभी हटाएं',
      topbarNotificationsTitle: 'सूचना केंद्र',

      // Patient Dashboard
      dashWelcome: 'स्वागत है,',
      dashAbhaNumber: 'आभा (ABHA) संख्या',
      dashAbhaAddress: 'आभा पता',
      dashPmjayStatus: 'पीएम-जय गोल्डन कार्ड स्थिति',
      dashEligible: 'सक्रिय एवं सत्यापित',
      dashCoverage: 'कवरेज: ₹5,00,000 / वर्ष',
      dashDownloadAbha: 'आभा क्यूआर डाउनलोड करें',
      dashShareCard: 'कार्ड साझा करें',
      dashQuickActions: 'त्वरित स्वास्थ्य सेवाएं',
      dashFindNearbyBtn: 'नजदीकी अस्पताल खोजें',
      dashBookConsultBtn: 'टेली-परामर्श बुक करें',
      dashUploadReportBtn: 'लैब रिपोर्ट अपलोड करें',
      dashEmergencySOSBtn: 'तत्काल 108 एम्बुलेंस बुलाएं',
      dashVitalsTitle: 'नवीनतम वाइटल साइन्स टेलीमेट्री',
      dashBluetoothConnected: 'ब्लूटूथ सेंसर कनेक्टेड',
      dashBp: 'रक्तचाप (BP)',
      dashHeartRate: 'हृदय गति (Heart Rate)',
      dashSpo2: 'रक्त ऑक्सीजन (SpO2)',
      dashTemp: 'शरीर का तापमान',
      dashGlucose: 'रक्त शर्करा (Glucose)',
      dashNormal: 'सामान्य',
      dashElevated: 'बढ़ा हुआ',
      dashOptimal: 'उत्तम',
      dashRecentActivity: 'हाल के परामर्श',
      dashUpcomingVisits: 'आगामी अपॉइंटमेंट',

      // Nearby Healthcare Centres
      nearbyTitle: '📍 नजदीकी स्वास्थ्य केंद्र एवं अस्पताल',
      nearbySubtitle: 'अपने वर्तमान स्थान के पास सत्यापित सरकारी अस्पताल, पीएचसी, सीएचसी, दवा की दुकानें और 24x7 आपातकालीन सेवाएं खोजें।',
      nearbyGpsAuto: 'जीपीएस स्थान स्वतः पहचानें',
      nearbyManualPrompt: 'या शहर, कस्बा, गांव या पिन कोड द्वारा खोजें',
      nearbyDetectedLoc: 'पहचाना गया स्थान:',
      nearbyAll: 'सभी सुविधाएं',
      nearbyGovtHospitals: 'सरकारी अस्पताल',
      nearbyPhc: 'प्राथमिक स्वास्थ्य केंद्र (PHC)',
      nearbyChc: 'सामुदायिक स्वास्थ्य केंद्र (CHC)',
      nearbyArogya: 'आयुष्मान आरोग्य मंदिर',
      nearbyClinics: 'क्लिनिक एवं औषधालय',
      nearbyDiagnostics: 'डायग्नोस्टिक लैब',
      nearbyPharmacies: 'फार्मेसी एवं जन औषधि',
      nearbyEmergency: '24x7 आपातकालीन ट्रॉमा',
      nearbyRadius: 'खोज का दायरा:',
      nearbyWithin1km: '1 किमी के भीतर',
      nearbyWithin5km: '5 किमी के भीतर',
      nearbyWithin10km: '10 किमी के भीतर',
      nearbyWithin25km: '25 किमी के भीतर',
      nearbySortedProximity: 'दूरी के अनुसार व्यवस्थित',
      nearbyShowingCount: 'आपके पास स्वास्थ्य सुविधाएं दिखाई जा रही हैं',
      nearbyDirectionsBtn: 'दिशा-निर्देश (गूगल मैप्स)',
      nearbyCallBtn: 'कॉल करें',
      nearbyWhatsAppBtn: 'व्हाट्सएप',
      nearbyPmjayBadge: 'पीएम-जय सूचीबद्ध',
      nearbyEmergencyBadge: '24x7 आपातकालीन',
      nearbyPrivacyNote: 'गोपनीयता सूचना: आपके स्थान का उपयोग केवल नजदीकी स्वास्थ्य सेवाएं खोजने के लिए किया जाता है।',

      // Health Records
      recordsTitle: 'डिजिटल स्वास्थ्य रिकॉर्ड और पर्चे',
      recordsSubtitle: 'आभा से जुड़े इलेक्ट्रॉनिक मेडिकल रिकॉर्ड, डिजिटल नुस्खे, लैब रिपोर्ट और टीकाकरण इतिहास।',
      recordsTabAll: 'सभी रिकॉर्ड',
      recordsTabPrescriptions: 'पर्चे (Rx)',
      recordsTabLabReports: 'लैब और टेस्ट रिपोर्ट',
      recordsTabVaccines: 'टीकाकरण',
      recordsTabDischarge: 'डिस्चार्ज सारांश',
      recordsDoctor: 'डॉक्टर',
      recordsDiagnosis: 'निदान (Diagnosis)',
      recordsMedications: 'निर्धारित दवाएं',
      recordsDownloadPdf: 'पीडीएफ डाउनलोड करें',
      recordsShareAbha: 'आभा के माध्यम से साझा करें',

      // Appointments
      aptTitle: 'अपॉइंटमेंट और टेली-परामर्श',
      aptSubtitle: 'सरकारी अस्पतालों और पीएचसी में व्यक्तिगत मुलाकात बुक करें या वीडियो टेली-ओपीडी से डॉक्टरों से जुड़ें।',
      aptBookNew: 'नया अपॉइंटमेंट बुक करें',
      aptUpcoming: 'आगामी अपॉइंटमेंट',
      aptPast: 'पिछले परामर्श',
      aptSpecialty: 'विशेषज्ञता / विभाग',
      aptDoctor: 'डॉक्टर चुनें',
      aptDate: 'परामर्श की तारीख',
      aptTimeSlot: 'पसंदीदा समय',
      aptType: 'अपॉइंटमेंट का प्रकार',
      aptInPerson: 'अस्पताल में व्यक्तिगत मुलाकात',
      aptTeleOPD: 'वीडियो टेली-ओपीडी परामर्श',
      aptReason: 'मुलाकात का कारण / लक्षण',
      aptConfirmBtn: 'अपॉइंटमेंट बुकिंग की पुष्टि करें',
      aptJoinCall: 'वीडियो कॉल में शामिल हों',
      aptReschedule: 'तारीख बदलें',
      aptCancel: 'रद्द करें',

      // Government Schemes
      schemesTitle: 'सरकारी स्वास्थ्य योजनाएं एवं सब्सिडी',
      schemesSubtitle: 'केंद्र और राज्य सरकार के सार्वजनिक स्वास्थ्य कल्याण कार्यक्रम, कैशलेस अस्पताल भर्ती और मुफ्त दवा योजनाएं।',
      schemesPmjayTitle: 'आयुष्मान भारत पीएम-जय (PM-JAY)',
      schemesPmjayDesc: '27,000+ सूचीबद्ध अस्पतालों में प्रति परिवार प्रति वर्ष ₹5 लाख का मुफ्त कैशलेस इलाज।',
      schemesAushadhiTitle: 'प्रधानमंत्री भारतीय जन औषधि केंद्र',
      schemesAushadhiDesc: 'ब्रांडेड दवाओं की तुलना में 50% से 90% कम कीमत पर उच्च गुणवत्ता वाली जेनेरिक दवाएं।',
      schemesNhmTitle: 'राष्ट्रीय स्वास्थ्य मिशन (NHM)',
      schemesNhmDesc: 'सभी पीएचसी में मुफ्त मातृ एवं शिशु स्वास्थ्य देखभाल, सार्वभौमिक टीकाकरण और प्राथमिक उपचार।',
      schemesAarogyasriTitle: 'आरोग्यश्री / राज्य स्वास्थ्य योजनाएं',
      schemesAarogyasriDesc: 'गंभीर बीमारियों और सर्जरी के लिए राज्य सरकार द्वारा वित्तीय सुरक्षा।',
      schemesCheckEligibility: 'पात्रता जांचें',
      schemesEmpanelledHospitals: 'सूचीबद्ध अस्पताल खोजें',
      schemesApplyNow: 'कार्ड के लिए आवेदन करें',

      // Emergency Support
      emergencyTitle: 'आपातकालीन चिकित्सा सहायता एवं ट्रॉमा केयर',
      emergencySubtitle: 'तत्काल 24x7 आपातकालीन सेवा, 108 एम्बुलेंस सहायता, नजदीकी ट्रॉमा सेंटर और प्राथमिक चिकित्सा गाइड।',
      emergencyDial108: '108 आपातकालीन एम्बुलेंस को कॉल करें',
      emergencyDial104: '104 स्वास्थ्य हेल्पलाइन पर कॉल करें',
      emergencyNearestTrauma: 'निकटतम आपातकालीन ट्रॉमा अस्पताल',
      emergencyFirstAidTitle: 'आपातकालीन प्राथमिक चिकित्सा गाइड',
      emergencyCpr: 'सीपीआर और कार्डियक अरेस्ट',
      emergencySnakeBite: 'सांप काटने पर प्राथमिक उपचार',
      emergencyBurns: 'जलने पर प्राथमिक उपचार',
      emergencyBleeding: 'रक्तस्राव रोकने का उपाय',
      emergencyTriggerSos: 'तत्काल 108 एसओएस अलर्ट भेजें',

      // Auth & Login
      loginPatientTitle: 'मरीज पोर्टल साइन इन',
      loginDoctorTitle: 'डॉक्टर एवं अस्पताल ईएमआर साइन इन',
      loginAadhaarPlaceholder: '12-अंकों का आधार / आभा नंबर दर्ज करें',
      loginPasswordPlaceholder: 'पासवर्ड दर्ज करें',
      loginOtpPlaceholder: '6-अंकों का एसएमएस ओटीपी दर्ज करें',
      loginSendOtp: 'ओटीपी भेजें',
      loginVerifyOtp: 'सत्यापित करें और साइन इन करें',
      loginWithBiometric: 'बायोमेट्रिक / फिंगरप्रिंट साइन इन',
      loginQuickDemoPatient: 'डेमो मरीज लॉगिन',
      loginQuickDemoDoctor: 'डेमो डॉक्टर लॉगिन',
      loginDontHaveAccount: 'क्या आपके पास आभा आईडी नहीं है?',
      loginCreateAbha: 'नया आभा खाता बनाएं',

      // Doctor Portal
      docCommandCenter: 'क्लिनिकल कमांड सेंटर',
      docQueueTitle: 'आज के मरीजों की कतार',
      docWaitingCount: 'प्रतीक्षारत मरीज',
      docCompletedCount: 'परामर्श पूर्ण',
      docWriteRx: 'पर्चा / सोप नोट लिखें',
      docPatientHistory: 'मरीज का मेडिकल इतिहास',
      docSubjective: 'सब्जेक्टिव (लक्षण / मुख्य शिकायत)',
      docObjective: 'ऑब्जेक्टिव (वाइटल्स एवं शारीरिक जांच)',
      docAssessment: 'आकलन एवं निदान',
      docPlan: 'योजना (दवाएं एवं टेस्ट)',
      docSaveSync: 'आभा में सहेजें और सिंक करें',

      // Modals
      modalBookAptTitle: 'डॉक्टर परामर्श बुक करें',
      modalPrescribeTitle: 'डिजिटल पर्चा एवं सोप नोट',
      modalSosTitle: 'आपातकालीन एसओएस पुष्टि',
      modalSosDesc: 'क्या आप सुनिश्चित हैं कि आप अपने वर्तमान जीपीएस स्थान के साथ 108 आपातकालीन एम्बुलेंस डिस्पैच शुरू करना चाहते हैं?'
    },

    te: {
      // General & Common
      brandName: 'స్వాస్థ్యకనెక్ట్',
      brandSubtitle: 'సమగ్ర గ్రామీణ & పట్టణ డిజిటల్ ఆరోగ్య సంరక్షణ వేదిక',
      langName: 'తెలుగు',
      langSelect: 'భాష',
      online: 'ఆన్‌లైన్',
      offline: 'ఆఫ్‌లైన్',
      offlineMode: 'ఆఫ్‌లైన్ మోడ్ (లోకల్ స్టోరేజ్)',
      offlineNotice: '🔴 ఆఫ్‌లైన్ మోడ్‌లో పనిచేస్తున్నారు. ఆన్‌లైన్‌కి వచ్చినప్పుడు డేటా ఆటోమేటిక్‌గా సింక్ అవుతుంది.',
      search: 'శోధించండి',
      filter: 'ఫిల్టర్',
      all: 'అన్నీ',
      cancel: 'రద్దు చేయండి',
      close: 'మూసివేయండి',
      submit: 'సమర్పించండి',
      save: 'భద్రపరచండి',
      edit: 'సవరించండి',
      delete: 'తొలగించండి',
      details: 'వివరాలు',
      directions: 'రూట్ / మార్గం',
      share: 'షేర్ చేయండి',
      call: 'కాల్ చేయండి',
      book: 'బుక్ చేయండి',
      confirm: 'ధృవీకరించండి',
      loading: 'లోడ్ అవుతోంది...',
      actions: 'చర్యలు',
      status: 'స్థితి',
      date: 'తేదీ',
      time: 'సమయం',
      distance: 'దూరం',
      verified: 'ధృవీకరించబడింది',
      pinOnMap: '📍 పిన్',
      viewAll: 'అన్నీ చూడండి',
      km: 'కి.మీ',

      // Navigation & Menu
      navDashboard: 'డ్యాష్‌బోర్డ్ & వైటల్స్',
      navRecords: 'ఆరోగ్య రికార్డులు & ప్రిస్క్రిప్షన్లు',
      navNearby: 'సమీప ఆరోగ్య కేంద్రాలు',
      navAppointments: 'అపాయింట్‌మెంట్లు & టెలీ-ఓపీడీ',
      navSchemes: 'ప్రభుత్వ ఆరోగ్య పథకాలు',
      navEmergency: 'అత్యవసర సహాయం (108)',
      navDoctorPortal: 'డాక్టర్ పోర్టల్ (ఈఎంఆర్)',
      navPatientPortal: 'పేషెంట్ పోర్టల్',
      navSwitchDoctor: 'డాక్టర్ వ్యూకి మారండి',
      navSwitchPatient: 'పేషెంట్ వ్యూకి మారండి',
      navSignOut: 'లాగ్ అవుట్',
      navPatientSignIn: 'పేషెంట్ సైన్ ఇన్',
      navDoctorSignIn: 'డాక్టర్ సైన్ ఇన్',

      // Topbar
      topbarDataSaver: 'డేటా సేవర్',
      topbarNotifications: 'నోటిఫికేషన్లు',
      topbarEmergencySOS: 'అత్యవసర SOS',
      topbarBookVisit: 'అపాయింట్‌మెంట్',
      topbarClearAll: 'అన్నీ తొలగించు',
      topbarNotificationsTitle: 'నోటిఫికేషన్ల కేంద్రం',

      // Patient Dashboard
      dashWelcome: 'స్వాగతం,',
      dashAbhaNumber: 'ఆభా (ABHA) నంబర్',
      dashAbhaAddress: 'ఆభా చిరునామా',
      dashPmjayStatus: 'పీఎం-జేవై గోల్డెన్ కార్డ్ స్థితి',
      dashEligible: 'యాక్టివ్ & వెరిఫైడ్',
      dashCoverage: 'కవరేజ్: ₹5,00,000 / సంవత్సరం',
      dashDownloadAbha: 'ఆభా QR డౌన్‌లోడ్',
      dashShareCard: 'కార్డ్ షేర్ చేయండి',
      dashQuickActions: 'త్వరిత ఆరోగ్య చర్యలు',
      dashFindNearbyBtn: 'సమీప ఆసుపత్రులను కనుగొనండి',
      dashBookConsultBtn: 'టెలీ-కన్సల్టేషన్ బుక్ చేయండి',
      dashUploadReportBtn: 'ల్యాబ్ రిపోర్ట్ అప్‌లోడ్',
      dashEmergencySOSBtn: 'తక్షణ 108 అంబులెన్స్ SOS',
      dashVitalsTitle: 'తాజా వైటల్స్ టెలిమెట్రీ',
      dashBluetoothConnected: 'బ్లూటూత్ సెన్సార్ కనెక్ట్ అయింది',
      dashBp: 'రక్తపోటు (BP)',
      dashHeartRate: 'గుండె వేగం (Heart Rate)',
      dashSpo2: 'ఆక్సిజన్ స్థాయి (SpO2)',
      dashTemp: 'శరీర ఉష్ణోగ్రత',
      dashGlucose: 'బ్లడ్ షుగర్ (Glucose)',
      dashNormal: 'సాధారణం',
      dashElevated: 'ఎక్కువ',
      dashOptimal: 'ఉత్తమం',
      dashRecentActivity: 'ఇటీవలి సంప్రదింపులు',
      dashUpcomingVisits: 'రాబోయే అపాయింట్‌మెంట్లు',

      // Nearby Healthcare Centres
      nearbyTitle: '📍 సమీప ఆరోగ్య కేంద్రాలు & ఆసుపత్రులు',
      nearbySubtitle: 'మీ ప్రస్తుత ప్రదేశం దగ్గర ఉన్న ప్రభుత్వ ఆసుపత్రులు, పీహెచ్‌సీలు, మందుల దుకాణాలు మరియు 24x7 అత్యవసర సేవలను కనుగొనండి.',
      nearbyGpsAuto: 'జీపీఎస్ లొకేషన్ ఆటో గుర్తింపు',
      nearbyManualPrompt: 'లేదా నగరం, గ్రామం లేదా పిన్ కోడ్ ద్వారా శోధించండి',
      nearbyDetectedLoc: 'గుర్తించిన ప్రదేశం:',
      nearbyAll: 'అన్ని సదుపాయాలు',
      nearbyGovtHospitals: 'ప్రభుత్వ ఆసుపత్రులు',
      nearbyPhc: 'ప్రాథమిక ఆరోగ్య కేంద్రాలు (PHC)',
      nearbyChc: 'కమ్యూనిటీ ఆరోగ్య కేంద్రాలు (CHC)',
      nearbyArogya: 'ఆయుష్మాన్ ఆరోగ్య మందిరం',
      nearbyClinics: 'క్లినిక్‌లు & డిస్పెన్సరీలు',
      nearbyDiagnostics: 'డయాగ్నస్టిక్ ల్యాబ్‌లు',
      nearbyPharmacies: 'ఫార్మసీలు & జన్ ఔషధి',
      nearbyEmergency: '24x7 అత్యవసర ట్రూమా',
      nearbyRadius: 'శోధన పరిధి:',
      nearbyWithin1km: '1 కి.మీ పరిధిలో',
      nearbyWithin5km: '5 కి.మీ పరిధిలో',
      nearbyWithin10km: '10 కి.మీ పరిధిలో',
      nearbyWithin25km: '25 కి.మీ పరిధిలో',
      nearbySortedProximity: 'సమీప దూరం ప్రకారం',
      nearbyShowingCount: 'మీ సమీపంలో ఉన్న ఆరోగ్య కేంద్రాలు',
      nearbyDirectionsBtn: 'రూట్ మార్గం (గూగుల్ మ్యాప్స్)',
      nearbyCallBtn: 'కాల్ చేయండి',
      nearbyWhatsAppBtn: 'వాట్సాప్',
      nearbyPmjayBadge: 'పీఎం-జేవై నెట్‌వర్క్',
      nearbyEmergencyBadge: '24x7 అత్యవసరం',
      nearbyPrivacyNote: 'గోప్యతా గమనిక: మీ లొకేషన్ కేవలం సమీప ఆరోగ్య కేంద్రాలను చూపించడానికి మాత్రమే ఉపయోగపడుతుంది.',

      // Health Records
      recordsTitle: 'డిజిటల్ ఆరోగ్య రికార్డులు & ప్రిస్క్రిప్షన్లు',
      recordsSubtitle: 'ఆభా అనుసంధాన మెడికల్ రికార్డులు, డిజిటల్ ప్రిస్క్రిప్షన్లు, ల్యాబ్ టెస్ట్ ఫలితాలు మరియు వ్యాక్సినేషన్ వివరాలు.',
      recordsTabAll: 'అన్ని రికార్డులు',
      recordsTabPrescriptions: 'ప్రిస్క్రిప్షన్లు (Rx)',
      recordsTabLabReports: 'ల్యాబ్ రిపోర్టులు',
      recordsTabVaccines: 'వ్యాక్సినేషన్లు',
      recordsTabDischarge: 'డిశ్చార్జ్ సారాంశం',
      recordsDoctor: 'డాక్టర్',
      recordsDiagnosis: 'రోగ నిర్ధారణ (Diagnosis)',
      recordsMedications: 'సూచించిన మందులు',
      recordsDownloadPdf: 'పీడీఎఫ్ డౌన్‌లోడ్',
      recordsShareAbha: 'ఆభా ద్వారా షేర్ చేయండి',

      // Appointments
      aptTitle: 'అపాయింట్‌మెంట్లు & టెలీ-కన్సల్టేషన్',
      aptSubtitle: 'ప్రభుత్వ ఆసుపత్రులు, పీహెచ్‌సీలలో డాక్టర్ల సమయాన్ని బుక్ చేసుకోండి లేదా వీడియో టెలీ-ఓపీడీ ద్వారా సంప్రదించండి.',
      aptBookNew: 'కొత్త అపాయింట్‌మెంట్ బుక్ చేయండి',
      aptUpcoming: 'రాబోయే అపాయింట్‌మెంట్లు',
      aptPast: 'గత సంప్రదింపులు',
      aptSpecialty: 'విభాగం / స్పెషాలిటీ',
      aptDoctor: 'డాక్టర్‌ను ఎంచుకోండి',
      aptDate: 'సంప్రదింపు తేదీ',
      aptTimeSlot: 'అనుకూల సమయం',
      aptType: 'అపాయింట్‌మెంట్ రకం',
      aptInPerson: 'ఆసుపత్రిలో ప్రత్యక్ష సందర్శన',
      aptTeleOPD: 'వీడియో టెలీ-ఓపీడీ సంప్రదింపు',
      aptReason: 'లక్షణాలు / సందర్శన కారణం',
      aptConfirmBtn: 'అపాయింట్‌మెంట్ బుకింగ్ నిర్ధారించండి',
      aptJoinCall: 'వీడియో కాల్‌లో చేరండి',
      aptReschedule: 'తేదీ మార్చండి',
      aptCancel: 'రద్దు చేయండి',

      // Government Schemes
      schemesTitle: 'ప్రభుత్వ ఆరోగ్య పథకాలు & రాయితీలు',
      schemesSubtitle: 'కేంద్ర మరియు రాష్ట్ర ప్రభుత్వాల ప్రజా ఆరోగ్య పథకాలు, నగదు రహిత చికిత్సలు మరియు ఉచిత మందుల పథకాలు.',
      schemesPmjayTitle: 'ఆయుష్మాన్ భారత్ పీఎం-జేవై (PM-JAY)',
      schemesPmjayDesc: '27,000+ ఆసుపత్రులలో ప్రతి కుటుంబానికి సంవత్సరానికి ₹5 లక్షల ఉచిత నగదు రహిత వైద్య చికిత్స.',
      schemesAushadhiTitle: 'ప్రధాన మంత్రి భారతీయ జన్ ఔషధి కేంద్రం',
      schemesAushadhiDesc: 'బ్రాండెడ్ మందుల కంటే 50% నుండి 90% తక్కువ ధరకే నాణ్యమైన జెనరిక్ మందులు.',
      schemesNhmTitle: 'జాతీయ ఆరోగ్య మిషన్ (NHM)',
      schemesNhmDesc: 'అన్ని పీహెచ్‌సీలలో ఉచిత మాతా శిశు సంరక్షణ, టీకాలు మరియు ప్రాథమిక ఆరోగ్య సేవలు.',
      schemesAarogyasriTitle: 'ఆరోగ్యశ్రీ / రాష్ట్ర ఆరోగ్య పథకాలు',
      schemesAarogyasriDesc: 'పేద కుటుంబాలకు శస్త్రచికిత్సలు మరియు తీవ్ర అనారోగ్యాల నివారణకు ఆర్థిక భరోసా.',
      schemesCheckEligibility: 'అర్హతను తనిఖీ చేయండి',
      schemesEmpanelledHospitals: 'నెట్‌వర్క్ ఆసుపత్రులను కనుగొనండి',
      schemesApplyNow: 'కార్డు కోసం దరఖాస్తు చేయండి',

      // Emergency Support
      emergencyTitle: 'అత్యవసర వైద్య సేవలు & ట్రూమా కేర్',
      emergencySubtitle: 'తక్షణ 24x7 అత్యవసర సేవలు, 108 అంబులెన్స్ సహాయం, సమీప ట్రూమా ఆసుపత్రి మార్గం మరియు ప్రథమ చికిత్స గైడ్.',
      emergencyDial108: '108 అత్యవసర అంబులెన్స్‌కి కాల్ చేయండి',
      emergencyDial104: '104 ఆరోగ్య హెల్ప్‌లైన్‌కి కాల్ చేయండి',
      emergencyNearestTrauma: 'సమీప అత్యవసర ట్రూమా ఆసుపత్రి',
      emergencyFirstAidTitle: 'అత్యవసర ప్రథమ చికిత్స గైడ్',
      emergencyCpr: 'సీపీఆర్ (CPR) & గుండెపోటు',
      emergencySnakeBite: 'పాము కాటుకు ప్రథమ చికిత్స',
      emergencyBurns: 'కాలిన గాయాల సంరక్షణ',
      emergencyBleeding: 'రక్తస్రావం ఆపే పద్ధతులు',
      emergencyTriggerSos: 'తక్షణ 108 SOS అలర్ట్ పంపండి',

      // Auth & Login
      loginPatientTitle: 'పేషెంట్ పోర్టల్ సైన్ ఇన్',
      loginDoctorTitle: 'డాక్టర్ & ఆసుపత్రి EMR సైన్ ఇన్',
      loginAadhaarPlaceholder: '12 అంకెల ఆధార్ / ఆభా నంబర్ నమోదు చేయండి',
      loginPasswordPlaceholder: 'పాస్‌వర్డ్ నమోదు చేయండి',
      loginOtpPlaceholder: '6 అంకెల ఎస్ఎంఎస్ ఓటీపీ నమోదు చేయండి',
      loginSendOtp: 'ఓటీపీ పంపండి',
      loginVerifyOtp: 'ధృవీకరించి సైన్ ఇన్ అవ్వండి',
      loginWithBiometric: 'బయోమెట్రిక్ / వేలిముద్ర సైన్ ఇన్',
      loginQuickDemoPatient: 'డెమో పేషెంట్ లాగిన్',
      loginQuickDemoDoctor: 'డెమో డాక్టర్ లాగిన్',
      loginDontHaveAccount: 'ఆభా (ABHA) ఐడీ లేదా?',
      loginCreateAbha: 'కొత్త ఆభా ఖాతా సృష్టించండి',

      // Doctor Portal
      docCommandCenter: 'క్లినికల్ కమాండ్ సెంటర్',
      docQueueTitle: 'నేటి రోగుల జాబితా (క్యూ)',
      docWaitingCount: 'వేచి ఉన్న రోగులు',
      docCompletedCount: 'పూర్తయిన సంప్రదింపులు',
      docWriteRx: 'ప్రిస్క్రిప్షన్ / సోప్ నోట్ రాయండి',
      docPatientHistory: 'రోగి వైద్య చరిత్ర',
      docSubjective: 'సబ్జెక్టివ్ (లక్షణాలు / సమస్యలు)',
      docObjective: 'ఆబ్జెక్టివ్ (వైటల్స్ & శారీరక పరీక్ష)',
      docAssessment: 'అంచనా & క్లినికల్ నిర్ధారణ',
      docPlan: 'చికిత్సా ప్రణాళిక (మందులు & టెస్టులు)',
      docSaveSync: 'ఆభాలో భద్రపరచి సింక్ చేయండి',

      // Modals
      modalBookAptTitle: 'డాక్టర్ అపాయింట్‌మెంట్ బుక్ చేయండి',
      modalPrescribeTitle: 'డిజిటల్ ప్రిస్క్రిప్షన్ & సోప్ నోట్',
      modalSosTitle: 'అత్యవసర SOS నిర్ధారణ',
      modalSosDesc: 'మీ ప్రస్తుత జీపీఎస్ లొకేషన్‌తో 108 ఎమర్జెన్సీ అంబులెన్స్ డిస్పాచ్ పంపాలనుకుంటున్నారా?'
    }
  };

  // State
  let currentLang = 'en';

  // Load saved preference from localStorage
  try {
    const saved = localStorage.getItem('swasthya_lang');
    if (saved && (saved === 'en' || saved === 'hi' || saved === 'te')) {
      currentLang = saved;
    }
  } catch (e) {}

  // Translation Function
  function t(key, fallback = '') {
    const langDict = translations[currentLang] || translations.en;
    return langDict[key] || translations.en[key] || fallback || key;
  }

  // Set Language and update DOM
  function setLanguage(lang) {
    if (!lang || !translations[lang]) return;
    currentLang = lang;
    try {
      localStorage.setItem('swasthya_lang', lang);
    } catch (e) {}

    // Update html lang attribute
    document.documentElement.lang = lang;

    // Apply translations to all DOM elements with data-i18n attributes
    applyTranslations();

    // Sync all language dropdown selectors on the page
    const selectors = document.querySelectorAll('.swasthya-lang-dropdown, #topbar-lang-select, #nav-lang-select, #wa-lang-select');
    selectors.forEach(sel => {
      if (sel && sel.value !== lang) {
        sel.value = lang;
      }
    });

    // Notify WhatsApp Assistant if available
    if (window.SwasthyaWhatsAppAI && typeof window.SwasthyaWhatsAppAI.setLanguage === 'function') {
      window.SwasthyaWhatsAppAI.setLanguage(lang);
    }

    // Trigger custom event for dynamic components to re-render
    window.dispatchEvent(new CustomEvent('swasthyaLanguageChanged', { detail: { lang } }));
  }

  // Apply translations to all marked elements in the document
  function applyTranslations() {
    // 1. Text content: data-i18n="key"
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = t(key, el.textContent);
      }
    });

    // 2. HTML content: data-i18n-html="key"
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (key) {
        el.innerHTML = t(key, el.innerHTML);
      }
    });

    // 3. Placeholders: data-i18n-placeholder="key"
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        el.placeholder = t(key, el.placeholder);
      }
    });

    // 4. Titles / Tooltips: data-i18n-title="key"
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        el.title = t(key, el.title);
      }
    });
  }

  // Generate reusable Language Switcher HTML
  function renderLanguageSwitcherHTML(selectId = 'topbar-lang-select', extraClass = '') {
    return `
      <div class="lang-switcher-wrap ${extraClass}">
        <svg class="icon lang-globe-icon" viewBox="0 0 24 24" style="width:16px; height:16px; margin-right:4px;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
        <select id="${selectId}" class="swasthya-lang-dropdown" onchange="SwasthyaI18n.setLanguage(this.value)" aria-label="Select Language">
          <option value="en" ${currentLang === 'en' ? 'selected' : ''}>English</option>
          <option value="hi" ${currentLang === 'hi' ? 'selected' : ''}>हिंदी (Hindi)</option>
          <option value="te" ${currentLang === 'te' ? 'selected' : ''}>తెలుగు (Telugu)</option>
        </select>
      </div>
    `;
  }

  // Public API
  window.SwasthyaI18n = {
    t,
    setLanguage,
    getLanguage: () => currentLang,
    applyTranslations,
    renderLanguageSwitcherHTML,
    translations
  };

  // Run on DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLang);
  });

})();
