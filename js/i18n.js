/**
 * SwasthyaConnect - Full Website Internationalization (i18n) Engine
 * Translates the ENTIRE website: English ('en'), Telugu ('te'), and Hindi ('hi').
 * Features:
 * - Direct Key-to-Translation Dictionary
 * - Full Phrase Text Node & Attribute Auto-Translator (walks full DOM tree)
 * - Lossless Bi-directional translation memory (caches original text)
 * - Dynamic component re-rendering triggers
 */

(function () {
  'use strict';

  // Phrase Translation Database (English -> Telugu & Hindi)
  const phraseMap = {
    // Branding & Header
    "SwasthyaConnect": { te: "స్వాస్థ్యకనెక్ట్", hi: "स्वास्थ्यकनेक्ट" },
    "Connecting Care. Improving Lives.": { te: "ఆరోగ్య సంరక్షణ అనుసంధానం. జీవితాల మెరుగుదల.", hi: "स्वास्थ्य सेवा का संयोजन। जीवन में सुधार।" },
    "Unified Rural & Urban Digital Healthcare Ecosystem": { te: "సమగ్ర గ్రామీణ & పట్టణ డిజిటల్ ఆరోగ్య సంరక్షణ వేదిక", hi: "एकीकृत ग्रामीण और शहरी डिजिटल स्वास्थ्य सेवा पारिस्थितिकी तंत्र" },
    "24x7 Emergency Trauma & Ambulance:": { te: "24x7 అత్యవసర ట్రూమా & అంబులెన్స్:", hi: "24x7 आपातकालीन ट्रॉमा एवं एम्बुलेंस:" },
    "108 / +91-800-SWASTHYA": { te: "108 / +91-800-స్వాస్థ్య", hi: "108 / +91-800-स्वास्थ्य" },
    "Metro Health Academic Medical Center": { te: "మెట్రో హెల్త్ అకడమిక్ మెడికల్ సెంటర్", hi: "मेट्रो हेल्थ एकेडेमिक मेडिकल सेंटर" },
    "NABH & JCI Accredited Hospital": { te: "NABH & JCI గుర్తింపు పొందిన ఆసుపత్రి", hi: "NABH और JCI मान्यता प्राप्त अस्पताल" },
    "24x7 Hospital Code Blue / Trauma Alarm:": { te: "24x7 ఆసుపత్రి కోడ్ బ్లూ / ట్రూమా అలారం:", hi: "24x7 अस्पताल कोड ब्लू / ट्रॉमा अलार्म:" },
    "Physician Clinical Station": { te: "వైద్యుల క్లినికల్ స్టేషన్", hi: "चिकित्सक क्लिनिकल स्टेशन" },

    // Navigation Links
    "Patient Portal Menu": { te: "పేషెంట్ పోర్టల్ మెనూ", hi: "मरीज पोर्टल मेनू" },
    "Dashboard & Telemetry": { te: "డ్యాష్‌బోర్డ్ & వైటల్స్", hi: "डैशबोर्ड और टेलीमेट्री" },
    "Dashboard": { te: "డ్యాష్‌బోర్డ్", hi: "डैशबोर्ड" },
    "My Profile": { te: "నా ప్రొఫైల్", hi: "मेरी प्रोफाइल" },
    "Health Records & Rx": { te: "ఆరోగ్య రికార్డులు & ప్రిస్క్రిప్షన్లు", hi: "स्वास्थ्य रिकॉर्ड और पर्चे" },
    "Medical Records": { te: "వైద్య రికార్డులు", hi: "मेडिकल रिकॉर्ड" },
    "Prescriptions": { te: "ప్రిస్క్రిప్షన్లు", hi: "पर्चे" },
    "Lab Reports": { te: "ల్యాబ్ రిపోర్టులు", hi: "लैब रिपोर्ट" },
    "Appointments & Tele-OPD": { te: "అపాయింట్‌మెంట్లు & టెలీ-ఓపీడీ", hi: "अपॉइंटमेंट और टेली-ओपीडी" },
    "Appointments": { te: "అపాయింట్‌మెంట్లు", hi: "अपॉइंटमेंट" },
    "Telemedicine": { te: "టెలిమెడిసిన్", hi: "टेलीमेडिसिन" },
    "Government Health Schemes": { te: "ప్రభుత్వ ఆరోగ్య పథకాలు", hi: "सरकारी स्वास्थ्य योजनाएं" },
    "Government Schemes": { te: "ప్రభుత్వ పథకాలు", hi: "सरकारी योजनाएं" },
    "Nearby Healthcare Centres": { te: "సమీప ఆరోగ్య కేంద్రాలు", hi: "नजदीकी स्वास्थ्य केंद्र" },
    "Emergency Support (108)": { te: "అత్యవసర సహాయం (108)", hi: "आपातकालीन सहायता (108)" },
    "Emergency Support": { te: "అత్యవసర సహాయం", hi: "आपातकालीन सहायता" },
    "Doctor Portal (EMR)": { te: "డాక్టర్ పోర్టల్ (ఈఎంఆర్)", hi: "डॉक्टर पोर्टल (ईएमआर)" },
    "Doctor Portal": { te: "డాక్టర్ పోర్టల్", hi: "डॉक्टर पोर्टल" },
    "Patient Portal": { te: "పేషెంట్ పోర్టల్", hi: "मरीज पोर्टल" },
    "Switch to Doctor View": { te: "డాక్టర్ వ్యూకి మారండి", hi: "डॉक्टर व्यू पर जाएं" },
    "Switch to Patient View": { te: "పేషెంట్ వ్యూకి మారండి", hi: "मरीज व्यू पर जाएं" },
    "Log Out": { te: "లాగ్ అవుట్", hi: "लॉग आउट" },
    "Patient Sign In": { te: "పేషెంట్ సైన్ ఇన్", hi: "मरीज साइन इन" },
    "Doctor Sign In": { te: "డాక్టర్ సైన్ ఇన్", hi: "डॉक्टर साइन इन" },

    // Topbar Actions & Status
    "Data Saver": { te: "డేటా సేవర్", hi: "डेटा सेवर" },
    "Notifications": { te: "నోటిఫికేషన్లు", hi: "सूचनाएं" },
    "Notifications Center": { te: "నోటిఫికేషన్ల కేంద్రం", hi: "सूचना केंद्र" },
    "Clear All": { te: "అన్నీ తొలగించు", hi: "सभी हटाएं" },
    "Emergency SOS": { te: "అత్యవసర SOS", hi: "आपातकालीन एसओएस" },
    "Book Visit": { te: "అపాయింట్‌మెంట్", hi: "अपॉइंटमेंट लें" },
    "Write Rx / SOAP Note": { te: "ప్రిస్క్రిప్షన్ / సోప్ నోట్ రాయండి", hi: "पर्चा / सोप नोट लिखें" },
    "Online Mode": { te: "ఆన్‌లైన్ మోడ్", hi: "ऑनलाइन मोड" },
    "Offline Mode": { te: "ఆఫ్‌లైన్ మోడ్", hi: "ऑफ़लाइन मोड" },
    "Live": { te: "ప్రత్యక్షం", hi: "लाइव" },
    "GPS": { te: "జీపీఎస్", hi: "जीपीएस" },
    "India": { te: "భారత్", hi: "भारत" },

    // Patient Dashboard Overview
    "Welcome back,": { te: "తిరిగి స్వాగతం,", hi: "वापसी पर स्वागत है," },
    "ABHA Number": { te: "ఆభా (ABHA) నంబర్", hi: "आभा (ABHA) संख्या" },
    "ABHA Address": { te: "ఆభా చిరునామా", hi: "आभा पता" },
    "PM-JAY Golden Card Status": { te: "పీఎం-జేవై గోల్డెన్ కార్డ్ స్థితి", hi: "पीएम-जय गोल्डन कार्ड स्थिति" },
    "Active & Verified": { te: "యాక్టివ్ & వెరిఫైడ్", hi: "सक्रिय एवं सत्यापित" },
    "Coverage: ₹5,00,000 / Year": { te: "కవరేజ్: ₹5,00,000 / సంవత్సరం", hi: "कवरेज: ₹5,00,000 / वर्ष" },
    "Download ABHA QR": { te: "ఆభా QR డౌన్‌లోడ్", hi: "आभा क्यूआर डाउनलोड करें" },
    "Share Card": { te: "కార్డ్ షేర్ చేయండి", hi: "कार्ड साझा करें" },
    "Quick Health Actions": { te: "త్వరిత ఆరోగ్య చర్యలు", hi: "त्वरित स्वास्थ्य सेवाएं" },
    "Find Healthcare Near Me": { te: "సమీప ఆసుపత్రులను కనుగొనండి", hi: "नजदीकी अस्पताल खोजें" },
    "Book Tele-Consultation": { te: "టెలీ-కన్సల్టేషన్ బుక్ చేయండి", hi: "टेली-परामर्श बुक करें" },
    "Upload Lab Report": { te: "ల్యాబ్ రిపోర్ట్ అప్‌లోడ్", hi: "लैब रिपोर्ट अपलोड करें" },
    "Instant 108 SOS Dispatch": { te: "తక్షణ 108 అంబులెన్స్ SOS", hi: "तत्काल 108 एम्बुलेंस बुलाएं" },
    "Latest Vital Signs Telemetry": { te: "తాజా వైటల్స్ టెలిమెట్రీ", hi: "नवीनतम वाइटल साइन्स टेलीमेट्री" },
    "Bluetooth Sensor Connected": { te: "బ్లూటూత్ సెన్సార్ కనెక్ట్ అయింది", hi: "ब्लूटूथ सेंसर कनेक्टेड" },
    "Blood Pressure": { te: "రక్తపోటు (BP)", hi: "रक्तचाप (BP)" },
    "Heart Rate": { te: "గుండె వేగం", hi: "हृदय गति" },
    "Blood Oxygen (SpO2)": { te: "ఆక్సిజన్ స్థాయి (SpO2)", hi: "रक्त ऑक्सीजन (SpO2)" },
    "Body Temperature": { te: "శరీర ఉష్ణోగ్రత", hi: "शरीर का तापमान" },
    "Blood Glucose": { te: "బ్లడ్ షుగర్ (Glucose)", hi: "रक्त शर्करा (Glucose)" },
    "Normal": { te: "సాధారణం", hi: "सामान्य" },
    "Elevated": { te: "ఎక్కువ", hi: "बढ़ा हुआ" },
    "Optimal": { te: "ఉత్తమం", hi: "उत्तम" },
    "Recent Clinical Consultations": { te: "ఇటీవలి సంప్రదింపులు", hi: "हाल के परामर्श" },
    "Upcoming Appointments": { te: "రాబోయే అపాయింట్‌మెంట్లు", hi: "आगामी अपॉइंटमेंट" },

    // Nearby Healthcare Facilities
    "Nearby Healthcare Centres & Hospitals": { te: "సమీప ఆరోగ్య కేంద్రాలు & ఆసుపత్రులు", hi: "नजदीकी स्वास्थ्य केंद्र एवं अस्पताल" },
    "Find verified government hospitals, PHCs, pharmacies, diagnostics, and 24x7 emergency services near your current location.": { te: "మీ ప్రస్తుత ప్రదేశం దగ్గర ఉన్న ప్రభుత్వ ఆసుపత్రులు, పీహెచ్‌సీలు, మందుల దుకాణాలు మరియు 24x7 అత్యవసర సేవలను కనుగొనండి.", hi: "अपने वर्तमान स्थान के पास सत्यापित सरकारी अस्पताल, पीएचसी, सीएचसी, दवा की दुकानें और 24x7 आपातकालीन सेवाएं खोजें।" },
    "Auto-Detect GPS Location": { te: "జీపీఎస్ లొకేషన్ ఆటో గుర్తింపు", hi: "जीपीएस स्थान स्वतः पहचानें" },
    "Or search by City, Town, Village, or PIN code": { te: "లేదా నగరం, గ్రామం లేదా పిన్ కోడ్ ద్వారా శోధించండి", hi: "या शहर, कस्बा, गांव या पिन कोड द्वारा खोजें" },
    "Detected Location:": { te: "గుర్తించిన ప్రదేశం:", hi: "पहचाना गया स्थान:" },
    "All Facilities": { te: "అన్ని సదుపాయాలు", hi: "सभी सुविधाएं" },
    "Government Hospitals": { te: "ప్రభుత్వ ఆసుపత్రులు", hi: "सरकारी अस्पताल" },
    "PHC (Primary Health)": { te: "ప్రాథమిక ఆరోగ్య కేంద్రాలు (PHC)", hi: "प्राथमिक स्वास्थ्य केंद्र (PHC)" },
    "CHC (Community Health)": { te: "కమ్యూనిటీ ఆరోగ్య కేంద్రాలు (CHC)", hi: "सामुदायिक स्वास्थ्य केंद्र (CHC)" },
    "Ayushman Arogya Mandir": { te: "ఆయుష్మాన్ ఆరోగ్య మందిరం", hi: "आयुष्मान आरोग्य मंदिर" },
    "Clinics & Dispensaries": { te: "క్లినిక్‌లు & డిస్పెన్సరీలు", hi: "क्लिनिक एवं औषधालय" },
    "Diagnostic Labs": { te: "డయాగ్నస్టిక్ ల్యాబ్‌లు", hi: "डायग्नोस्टिक लैब" },
    "Pharmacies & Jan Aushadhi": { te: "ఫార్మసీలు & జన్ ఔషధి", hi: "फार्मेसी एवं जन औषधि" },
    "24x7 Emergency Trauma": { te: "24x7 అత్యవసర ట్రూమా", hi: "24x7 आपातकालीन ट्रॉमा" },
    "Search Radius:": { te: "శోధన పరిధి:", hi: "खोज का दायरा:" },
    "Within 1 km": { te: "1 కి.మీ పరిధిలో", hi: "1 किमी के भीतर" },
    "Within 5 km": { te: "5 కి.మీ పరిధిలో", hi: "5 किमी के भीतर" },
    "Within 10 km": { te: "10 కి.మీ పరిధిలో", hi: "10 किमी के भीतर" },
    "Within 25 km": { te: "25 కి.మీ పరిధిలో", hi: "25 किमी के भीतर" },
    "Sorted by Proximity": { te: "సమీప దూరం ప్రకారం", hi: "दूरी के अनुसार व्यवस्थित" },
    "Showing all facilities": { te: "అన్ని కేంద్రాలు చూపబడుతున్నాయి", hi: "सभी सुविधाएं दिखाई जा रही हैं" },
    "Directions": { te: "రూట్ / మార్గం", hi: "दिशा-निर्देश" },
    "Details": { te: "వివరాలు", hi: "विवरण" },
    "WhatsApp": { te: "వాట్సాప్", hi: "व्हाट्सएप" },
    "Pin": { te: "పిన్", hi: "पिन" },
    "📍 Pin": { te: "📍 పిన్", hi: "📍 पिन" },
    "Address:": { te: "చిరునామా:", hi: "पता:" },
    "Contact:": { te: "సంప్రదించండి:", hi: "संपर्क:" },
    "Availability:": { te: "లభ్యత:", hi: "उपलब्धता:" },
    "Available Services:": { te: "అందుబాటులో ఉన్న సేవలు:", hi: "उपलब्ध सेवाएं:" },
    "✓ PM-JAY Empanelled Golden Card Desk Available": { te: "✓ పీఎం-జేవై గోల్డెన్ కార్డ్ సేవలు అందుబాటులో ఉన్నాయి", hi: "✓ पीएम-जय सूचीबद्ध गोल्डन कार्ड डेस्क उपलब्ध है" },
    "Privacy Notice: Your location is used only to help find nearby healthcare services.": { te: "గోప్యతా గమనిక: మీ లొకేషన్ కేవలం సమీప ఆరోగ్య కేంద్రాలను చూపించడానికి మాత్రమే ఉపయోగపడుతుంది.", hi: "गोपनीयता सूचना: आपके स्थान का उपयोग केवल नजदीकी स्वास्थ्य सेवाएं खोजने के लिए किया जाता है।" },

    // Government Schemes
    "Government Health Schemes & Subsidies": { te: "ప్రభుత్వ ఆరోగ్య పథకాలు & రాయితీలు", hi: "सरकारी स्वास्थ्य योजनाएं एवं सब्सिडी" },
    "Central and state public health welfare programs, cashless hospitalization benefits, and free generic medicine schemes.": { te: "కేంద్ర మరియు రాష్ట్ర ప్రభుత్వాల ప్రజా ఆరోగ్య పథకాలు, నగదు రహిత చికిత్సలు మరియు ఉచిత మందుల పథకాలు.", hi: "केंद्र और राज्य सरकार के सार्वजनिक स्वास्थ्य कल्याण कार्यक्रम, कैशलेस अस्पताल भर्ती और मुफ्त दवा योजनाएं।" },
    "Ayushman Bharat PM-JAY": { te: "ఆయుష్మాన్ భారత్ పీఎం-జేవై", hi: "आयुष्मान भारत पीएम-जय (PM-JAY)" },
    "Pradhan Mantri Jan Aushadhi Kendra": { te: "ప్రధాన మంత్రి భారతీయ జన్ ఔషధి కేంద్రం", hi: "प्रधानमंत्री भारतीय जन औषधि केंद्र" },
    "National Health Mission (NHM)": { te: "జాతీయ ఆరోగ్య మిషన్ (NHM)", hi: "राष्ट्रीय स्वास्थ्य मिशन (NHM)" },
    "Aarogyasri / State Health Assurance": { te: "ఆరోగ్యశ్రీ / రాష్ట్ర ఆరోగ్య పథకాలు", hi: "आरोग्यश्री / राज्य स्वास्थ्य योजनाएं" },
    "Check Eligibility": { te: "అర్హతను తనిఖీ చేయండి", hi: "पात्रता जांचें" },
    "Find Empanelled Hospitals": { te: "నెట్‌వర్క్ ఆసుపత్రులను కనుగొనండి", hi: "सूचीबद्ध अस्पताल खोजें" },
    "Apply for Card": { te: "కార్డు కోసం దరఖాస్తు చేయండి", hi: "कार्ड के लिए आवेदन करें" },

    // Emergency Module
    "Emergency Medical Dispatch & Trauma Care": { te: "అత్యవసర వైద్య సేవలు & ట్రూమా కేర్", hi: "आपातकालीन चिकित्सा सहायता एवं ट्रॉमा केयर" },
    "Instant 24x7 emergency dispatch, ambulance tracking, nearest trauma center navigation, and emergency first aid guide.": { te: "తక్షణ 24x7 అత్యవసర సేవలు, 108 అంబులెన్స్ సహాయం, సమీప ట్రూమా ఆసుపత్రి మార్గం మరియు ప్రథమ చికిత్స గైడ్.", hi: "तत्काल 24x7 आपातकालीन सेवा, 108 एम्बुलेंस सहायता, नजदीकी ट्रॉमा सेंटर और प्राथमिक चिकित्सा गाइड।" },
    "Dial 108 Emergency Ambulance": { te: "108 అత్యవసర అంబులెన్స్‌కి కాల్ చేయండి", hi: "108 आपातकालीन एम्बुलेंस को कॉल करें" },
    "Dial 104 Health Helpline": { te: "104 ఆరోగ్య హెల్ప్‌లైన్‌కి కాల్ చేయండి", hi: "104 स्वास्थ्य हेल्पलाइन पर कॉल करें" },
    "Nearest Emergency Trauma Hospital": { te: "సమీప అత్యవసర ట్రూమా ఆసుపత్రి", hi: "निकटतम आपातकालीन ट्रॉमा अस्पताल" },
    "Emergency First Aid Quick Guides": { te: "అత్యవసర ప్రథమ చికిత్స గైడ్", hi: "आपातकालीन प्राथमिक चिकित्सा गाइड" },
    "CPR & Cardiac Arrest": { te: "సీపీఆర్ (CPR) & గుండెపోటు", hi: "सीपीआर और कार्डियक अरेस्ट" },
    "Snake Bite First Aid": { te: "పాము కాటుకు ప్రథమ చికిత్స", hi: "सांप काटने पर प्राथमिक उपचार" },
    "Burns & Scalds Care": { te: "కాలిన గాయాల సంరక్షణ", hi: "जलने पर प्राथमिक उपचार" },
    "Severe Bleeding Control": { te: "రక్తస్రావం ఆపే పద్ధతులు", hi: "रक्तस्राव रोकने का उपाय" },
    "Trigger Instant SOS Alert": { te: "తక్షణ 108 SOS అలర్ట్ పంపండి", hi: "तत्काल 108 एसओएस अलर्ट भेजें" },

    // Common Buttons & Actions
    "Search": { te: "శోధించండి", hi: "खोजें" },
    "Filter": { te: "ఫిల్టర్", hi: "फ़िल्टर" },
    "All": { te: "అన్నీ", hi: "सभी" },
    "Cancel": { te: "రద్దు చేయండి", hi: "रद्द करें" },
    "Close": { te: "మూసివేయండి", hi: "बंद करें" },
    "Submit": { te: "సమర్పించండి", hi: "जमा करें" },
    "Save": { te: "భద్రపరచండి", hi: "सहेजें" },
    "Edit": { te: "సవరించండి", hi: "संपादित करें" },
    "Delete": { te: "తొలగించండి", hi: "हटाएं" },
    "Download Record (PDF)": { te: "పీడీఎఫ్ డౌన్‌లోడ్", hi: "पीडीएफ डाउनलोड करें" },
    "Share via ABHA": { te: "ఆభా ద్వారా షేర్ చేయండి", hi: "आभा के माध्यम से साझा करें" },
    "Confirm Appointment Booking": { te: "అపాయింట్‌మెంట్ బుకింగ్ నిర్ధారించండి", hi: "अपॉइंटमेंट बुकिंग की पुष्टि करें" },
    "Book New Appointment": { te: "కొత్త అపాయింట్‌మెంట్ బుక్ చేయండి", hi: "नया अपॉइंटमेंट बुक करें" },
    "Join Video Call": { te: "వీడియో కాల్‌లో చేరండి", hi: "वीडियो कॉल में शामिल हों" },

    // Clinical Command Center (Doctor)
    "Clinical Command Center": { te: "క్లినికల్ కమాండ్ సెంటర్", hi: "क्लिनिकल कमांड सेंटर" },
    "Today's Patient Queue & Triage": { te: "నేటి రోగుల జాబితా (క్యూ)", hi: "आज के मरीजों की कतार" },
    "Patients Waiting": { te: "వేచి ఉన్న రోగులు", hi: "प्रतीक्षारत मरीज" },
    "Consultations Done": { te: "పూర్తయిన సంప్రదింపులు", hi: "परामर्श पूर्ण" },
    "Patient Medical History": { te: "రోగి వైద్య చరిత్ర", hi: "मरीज का मेडिकल इतिहास" },
    "Save & Sync to ABHA": { te: "ఆభాలో భద్రపరచి సింక్ చేయండి", hi: "आभा में सहेजें और सिंक करें" }
  };

  // State
  let currentLang = 'en';

  // Load saved language preference
  try {
    const saved = localStorage.getItem('swasthya_lang');
    if (saved && (saved === 'en' || saved === 'hi' || saved === 'te')) {
      currentLang = saved;
    }
  } catch (e) {}

  // Translate a single key or phrase
  function t(phraseOrKey, fallback = '') {
    if (!phraseOrKey) return fallback;
    const clean = phraseOrKey.trim();

    // Check direct phraseMap
    if (phraseMap[clean] && phraseMap[clean][currentLang]) {
      return phraseMap[clean][currentLang];
    }

    if (currentLang === 'en') return clean;
    return fallback || clean;
  }

  // Full DOM Walker: Translates all text nodes across the entire page
  function translateEntireDOM() {
    if (currentLang === 'en') {
      // Revert to original English
      document.querySelectorAll('[data-swasthya-orig-text]').forEach(el => {
        el.textContent = el.getAttribute('data-swasthya-orig-text');
      });
      document.querySelectorAll('[data-swasthya-orig-ph]').forEach(el => {
        el.placeholder = el.getAttribute('data-swasthya-orig-ph');
      });
      document.querySelectorAll('[data-swasthya-orig-title]').forEach(el => {
        el.title = el.getAttribute('data-swasthya-orig-title');
      });
      return;
    }

    // 1. Process elements with explicit data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key && phraseMap[key] && phraseMap[key][currentLang]) {
        el.textContent = phraseMap[key][currentLang];
      }
    });

    // 2. Walk all visible text elements across the page
    const textSelectors = 'h1, h2, h3, h4, h5, h6, p, span, a, button, label, strong, em, b, th, td, div.nav-section-title, span.badge';
    document.querySelectorAll(textSelectors).forEach(el => {
      // Skip script, style, code, and language dropdown options
      if (el.closest('.lang-switcher-wrap') || el.tagName === 'SELECT' || el.tagName === 'OPTION') return;

      // Only translate leaf text nodes or simple inline elements
      if (el.children.length === 0 && el.textContent.trim().length > 0) {
        const text = el.textContent.trim();
        
        // Cache original text if not already stored
        if (!el.hasAttribute('data-swasthya-orig-text')) {
          el.setAttribute('data-swasthya-orig-text', text);
        }

        const origText = el.getAttribute('data-swasthya-orig-text');
        if (phraseMap[origText] && phraseMap[origText][currentLang]) {
          el.textContent = phraseMap[origText][currentLang];
        }
      }
    });

    // 3. Process Input Placeholders
    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(input => {
      const ph = input.placeholder.trim();
      if (!input.hasAttribute('data-swasthya-orig-ph')) {
        input.setAttribute('data-swasthya-orig-ph', ph);
      }
      const origPh = input.getAttribute('data-swasthya-orig-ph');
      if (phraseMap[origPh] && phraseMap[origPh][currentLang]) {
        input.placeholder = phraseMap[origPh][currentLang];
      } else if (origPh.includes('Search') || origPh.includes('search')) {
        input.placeholder = currentLang === 'te' ? 'ఇక్కడ శోధించండి...' : 'यहाँ खोजें...';
      }
    });

    // 4. Process Tooltips / Titles
    document.querySelectorAll('[title]').forEach(el => {
      const title = el.title.trim();
      if (!el.hasAttribute('data-swasthya-orig-title')) {
        el.setAttribute('data-swasthya-orig-title', title);
      }
      const origTitle = el.getAttribute('data-swasthya-orig-title');
      if (phraseMap[origTitle] && phraseMap[origTitle][currentLang]) {
        el.title = phraseMap[origTitle][currentLang];
      }
    });
  }

  // Set Language Function
  function setLanguage(lang) {
    if (!lang || (lang !== 'en' && lang !== 'hi' && lang !== 'te')) return;
    currentLang = lang;

    try {
      localStorage.setItem('swasthya_lang', lang);
    } catch (e) {}

    // Update html lang attribute
    document.documentElement.lang = lang;

    // Apply translation to all elements on the entire page
    translateEntireDOM();

    // Sync all language dropdown selectors on the page
    const dropdowns = document.querySelectorAll('.swasthya-lang-dropdown, #topbar-lang-select, #nav-lang-select, #va-lang-select, #wa-lang-select');
    dropdowns.forEach(sel => {
      if (sel && sel.value !== lang) {
        sel.value = lang;
      }
    });

    // Notify Voice Assistant if available
    if (window.SwasthyaVoiceAssistant && typeof window.SwasthyaVoiceAssistant.setLanguage === 'function') {
      window.SwasthyaVoiceAssistant.setLanguage(lang);
    }

    // Notify WhatsApp Assistant if available
    if (window.SwasthyaWhatsAppAI && typeof window.SwasthyaWhatsAppAI.setLanguage === 'function') {
      window.SwasthyaWhatsAppAI.setLanguage(lang);
    }

    // Dispatch global custom event for dynamic components to re-render
    window.dispatchEvent(new CustomEvent('swasthyaLanguageChanged', { detail: { lang } }));
  }

  // Public API
  window.SwasthyaI18n = {
    t,
    setLanguage,
    getLanguage: () => currentLang,
    translateEntireDOM,
    phraseMap
  };

  // Auto-run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setLanguage(currentLang));
  } else {
    setLanguage(currentLang);
  }

})();
