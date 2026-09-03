/**
 * SwasthyaConnect - Full Website Internationalization (i18n) Engine
 * Translates the ENTIRE website: English ('en'), Telugu ('te'), and Hindi ('hi').
 * Features:
 * - Comprehensive Healthcare Phrase & Word Translation Database
 * - Full TextNode TreeWalker Auto-Translator (walks all DOM text nodes)
 * - Lossless Bi-directional Reverse Phrase Index (Seamless English <-> Telugu <-> Hindi)
 * - Synchronizes with Voice AI, WhatsApp AI, and dynamic UI components
 */

(function () {
  'use strict';

  // Comprehensive Multilingual Translation Database
  const phraseMap = {
    // Branding & Global Header
    "SwasthyaConnect": { te: "స్వాస్థ్యకనెక్ట్", hi: "स्वास्थ्यकनेक्ट" },
    "Connecting Care. Improving Lives.": { te: "ఆరోగ్య సంరక్షణ అనుసంధానం. జీవితాల మెరుగుదల.", hi: "स्वास्थ्य सेवा का संयोजन। जीवन में सुधार।" },
    "Unified Rural & Urban Digital Healthcare Ecosystem": { te: "సమగ్ర గ్రామీణ & పట్టణ డిజిటల్ ఆరోగ్య సంరక్షణ వేదిక", hi: "एकीकृत ग्रामीण और शहरी डिजिटल स्वास्थ्य सेवा पारिस्थितिकी तंत्र" },
    "24x7 Emergency Trauma & Ambulance:": { te: "24x7 అత్యవసర ట్రూమా & అంబులెన్స్:", hi: "24x7 आपातकालीन ट्रॉमा एवं एम्बुलेंस:" },
    "108 / +91-800-SWASTHYA": { te: "108 / +91-800-స్వాస్థ్య", hi: "108 / +91-800-स्वास्थ्य" },
    "Metro Health Academic Medical Center": { te: "మెట్రో హెల్త్ అకడమిక్ మెడికల్ సెంటర్", hi: "मेट्रो हेल्थ एकेडेमिक मेडिकल सेंटर" },
    "NABH & JCI Accredited Hospital": { te: "NABH & JCI గుర్తింపు పొందిన ఆసుపత్రి", hi: "NABH और JCI मान्यता प्राप्त अस्पताल" },
    "24x7 Hospital Code Blue / Trauma Alarm:": { te: "24x7 ఆసుపత్రి కోడ్ బ్లూ / ట్రూమా అలారం:", hi: "24x7 अस्पताल कोड ब्लू / ट्रॉमा अलार्म:" },
    "Physician Clinical Station": { te: "వైద్యుల క్లినికల్ స్టేషన్", hi: "चिकित्सक क्लिनिकल स्टेशन" },
    "Voice AI": { te: "వాయిస్ AI", hi: "वॉयस AI" },
    "Voice Assistant": { te: "వాయిస్ అసిస్టెంట్", hi: "वॉयस असिस्टेंट" },

    // Navigation Items & Sections
    "Patient Portal Menu": { te: "పేషెంట్ పోర్టల్ మెనూ", hi: "मरीज पोर्टल मेनू" },
    "Doctor Portal Menu": { te: "డాక్టర్ పోర్టల్ మెనూ", hi: "डॉक्टर पोर्टल मेनू" },
    "Patient Services": { te: "రోగి సేవలు", hi: "मरीज सेवाएं" },
    "Clinical Management": { te: "క్లినికల్ నిర్వహణ", hi: "क्लिनिकल प्रबंधन" },
    "System Navigation": { te: "సిస్టమ్ నావిగేషన్", hi: "सिस्टम नेविगेशन" },
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
    "Govt Schemes": { te: "ప్రభుత్వ పథకాలు", hi: "सरकारी योजनाएं" },
    "Nearby Healthcare Centres": { te: "సమీప ఆరోగ్య కేంద్రాలు", hi: "नजदीकी स्वास्थ्य केंद्र" },
    "Nearby Facilities": { te: "సమీప కేంద్రాలు", hi: "नजदीकी केंद्र" },
    "Emergency Support (108)": { te: "అత్యవసర సహాయం (108)", hi: "आपातकालीन सहायता (108)" },
    "Emergency Support": { te: "అత్యవసర సహాయం", hi: "आपातकालीन सहायता" },
    "Emergency Assistance": { te: "అత్యవసర సహాయం", hi: "आपातकालीन सहायता" },
    "Doctor Portal (EMR)": { te: "డాక్టర్ పోర్టల్ (ఈఎంఆర్)", hi: "डॉक्टर पोर्टल (ईएमआर)" },
    "Doctor Portal": { te: "డాక్టర్ పోర్టల్", hi: "डॉक्टर पोर्टल" },
    "Patient Portal": { te: "పేషెంట్ పోర్టల్", hi: "मरीज पोर्टल" },
    "Switch to Doctor View": { te: "డాక్టర్ వ్యూకి మారండి", hi: "डॉक्टर व्यू पर जाएं" },
    "Switch to Patient View": { te: "పేషెంట్ వ్యూకి మారండి", hi: "मरीज व्यू पर जाएं" },
    "Log Out": { te: "లాగ్ అవుట్", hi: "लॉग आउट" },
    "Patient Sign In": { te: "పేషెంట్ సైన్ ఇన్", hi: "मरीज साइन इन" },
    "Doctor Sign In": { te: "డాక్టర్ సైన్ ఇన్", hi: "डॉक्टर साइन इन" },

    // Status Banner & Topbar
    "Data Saver": { te: "డేటా సేవర్", hi: "डेटा सेवर" },
    "Toggle Data Saver": { te: "డేటా సేవర్ మార్చండి", hi: "डेटा सेवर बदलें" },
    "Notifications": { te: "నోటిఫికేషన్లు", hi: "सूचनाएं" },
    "Notifications Center": { te: "నోటిఫికేషన్ల కేంద్రం", hi: "सूचना केंद्र" },
    "Clear All": { te: "అన్నీ తొలగించు", hi: "सभी हटाएं" },
    "Emergency SOS": { te: "అత్యవసర SOS", hi: "आपातकालीन एसओएस" },
    "Book Visit": { te: "అపాయింట్‌మెంట్", hi: "अपॉइंटमेंट लें" },
    "Write Rx / SOAP Note": { te: "ప్రిస్క్రిప్షన్ / సోప్ నోట్ రాయండి", hi: "पर्चा / सोप नोट लिखें" },
    "Online Mode": { te: "ఆన్‌లైన్ మోడ్", hi: "ऑनलाइन मोड" },
    "Offline Mode": { te: "ఆఫ్‌లైన్ మోడ్", hi: "ऑफ़लाइन मोड" },
    "🟢 Online Mode": { te: "🟢 ఆన్‌లైన్ మోడ్", hi: "🟢 ऑनलाइन मोड" },
    "🔴 Offline Mode": { te: "🔴 ఆఫ్‌లైన్ మోడ్", hi: "🔴 ऑफ़लाइन मोड" },
    "Connected to the internet. All live services active.": { te: "ఇంటర్నెట్‌తో కనెక్ట్ చేయబడింది. అన్ని సేవలు ప్రత్యక్షంగా పనిచేస్తున్నాయి.", hi: "इंटरनेट से जुड़ा हुआ है। सभी सेवाएं सक्रिय हैं।" },
    "Live": { te: "ప్రత్యక్షం", hi: "लाइव" },
    "Live Synced": { te: "లైవ్ సింక్ అయింది", hi: "लाइव सिंक हुआ" },
    "GPS": { te: "జీపీఎస్", hi: "जीपीएस" },
    "India": { te: "భారత్", hi: "भारत" },

    // Patient Dashboard Overview
    "Hello,": { te: "నమస్కారం,", hi: "नमस्ते," },
    "Current Health Status:": { te: "ప్రస్తుత ఆరోగ్య స్థితి:", hi: "वर्तमान स्वास्थ्य स्थिति:" },
    "Stable • Controlled Stage-1 Hypertension": { te: "స్థిరంగా ఉంది • నియంత్రణలో ఉన్న స్టేజ్-1 రక్తపోటు", hi: "स्थिर • नियंत्रित स्टेज-1 उच्च रक्तचाप" },
    "Blood Group:": { te: "రక్త గ్రూపు:", hi: "रक्त समूह:" },
    "Attending: Dr. Sarah Lin, MD": { te: "వైద్యులు: డాక్టర్ సారా లిన్, ఎండీ", hi: "चिकित्सक: डॉ. सारा लिन, एमडी" },
    "Join Telehealth Visit": { te: "టెలీ-కన్సల్టేషన్ చేరండి", hi: "टेली-परामर्श में शामिल हों" },
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
    "Normal Sinus": { te: "సాధారణ సైన్స్", hi: "सामान्य साइनस" },
    "Elevated": { te: "ఎక్కువ", hi: "बढ़ा हुआ" },
    "Optimal": { te: "ఉత్తమం", hi: "उत्तम" },
    "Optimal Range": { te: "సరైన పరిధి", hi: "उत्तम दायरा" },
    "Room Air": { te: "గది గాలి", hi: "सामान्य हवा" },
    "Oral": { te: "నోటి ద్వారా", hi: "मौखिक" },
    "Fasting": { te: "ఉపవాసం (ఖాళీ కడుపుతో)", hi: "खाली पेट (फास्टिंग)" },
    "Systolic / Diastolic": { te: "సిస్టోలిక్ / డయాస్టోలిక్", hi: "सिस्टोलिक / डायस्टोलिक" },
    "Pulse BPM": { te: "పల్స్ (BPM)", hi: "पल्स (BPM)" },
    "Target: < 120/80": { te: "లక్ష్యం: < 120/80", hi: "लक्ष्य: < 120/80" },
    "Recent Clinical Consultations": { te: "ఇటీవలి సంప్రదింపులు", hi: "हाल के परामर्श" },
    "Upcoming Appointments": { te: "రాబోయే అపాయింట్‌మెంట్లు", hi: "आगामी अपॉइंटमेंट" },
    "View All Records": { te: "అన్ని రికార్డులను చూడండి", hi: "सभी रिकॉर्ड देखें" },

    // Nearby Healthcare Facilities
    "📍 Nearby Healthcare Centres & Hospitals": { te: "📍 సమీప ఆరోగ్య కేంద్రాలు & ఆసుపత్రులు", hi: "📍 नजदीकी स्वास्थ्य केंद्र एवं अस्पताल" },
    "Nearby Healthcare Centres & Hospitals": { te: "సమీప ఆరోగ్య కేంద్రాలు & ఆసుపత్రులు", hi: "नजदीकी स्वास्थ्य केंद्र एवं अस्पताल" },
    "Find Nearby Government Healthcare Centres": { te: "సమీప ప్రభుత్వ ఆరోగ్య కేంద్రాలను కనుగొనండి", hi: "नजदीकी सरकारी स्वास्थ्य केंद्र खोजें" },
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
    "🗺️ Directions": { te: "🗺️ మార్గం", hi: "🗺️ दिशा-निर्देश" },
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
    "Indian Government Healthcare Schemes": { te: "భారత ప్రభుత్వ ఆరోగ్య పథకాలు", hi: "भारत सरकार की स्वास्थ्य योजनाएं" },
    "Government Health Schemes & Subsidies": { te: "ప్రభుత్వ ఆరోగ్య పథకాలు & రాయితీలు", hi: "सरकारी स्वास्थ्य योजनाएं एवं सब्सिडी" },
    "Central and state public health welfare programs, cashless hospitalization benefits, and free generic medicine schemes.": { te: "కేంద్ర మరియు రాష్ట్ర ప్రభుత్వాల ప్రజా ఆరోగ్య పథకాలు, నగదు రహిత చికిత్సలు మరియు ఉచిత మందుల పథకాలు.", hi: "केंद्र और राज्य सरकार के सार्वजनिक स्वास्थ्य कल्याण कार्यक्रम, कैशलेस अस्पताल भर्ती और मुफ्त दवा योजनाएं।" },
    "Ayushman Bharat PM-JAY": { te: "ఆయుష్మాన్ భారత్ పీఎం-జేవై", hi: "आयुष्मान भारत पीएम-जय (PM-JAY)" },
    "Pradhan Mantri Jan Aushadhi Kendra": { te: "ప్రధాన మంత్రి భారతీయ జన్ ఔషధి కేంద్రం", hi: "प्रधानमंत्री भारतीय जन औषधि केंद्र" },
    "National Health Mission (NHM)": { te: "జాతీయ ఆరోగ్య మిషన్ (NHM)", hi: "राष्ट्रीय स्वास्थ्य मिशन (NHM)" },
    "Aarogyasri / State Health Assurance": { te: "ఆరోగ్యశ్రీ / రాష్ట్ర ఆరోగ్య పథకాలు", hi: "आरोग्यश्री / राज्य स्वास्थ्य योजनाएं" },
    "Check Eligibility": { te: "అర్హతను తనిఖీ చేయండి", hi: "पात्रता जांचें" },
    "Find Empanelled Hospitals": { te: "నెట్‌వర్క్ ఆసుపత్రులను కనుగొనండి", hi: "सूचीबद्ध अस्पताल खोजें" },
    "Apply for Card": { te: "కార్డు కోసం దరఖాస్తు చేయండి", hi: "कार्ड के लिए आवेदन करें" },
    "Free treatment up to ₹5 Lakh": { te: "₹5 లక్షల వరకు ఉచిత వైద్యం", hi: "₹5 लाख तक का मुफ्त इलाज" },
    "85% Savings on Generic Medicines": { te: "జెనరిక్ మందులపై 85% వరకు తగ్గింపు", hi: "जेनेरिक दवाओं पर 85% तक की बचत" },
    "Maternal & Child Health Support": { te: "తల్లీబిడ్డల ఆరోగ్య సంరక్షణ", hi: "मातृ एवं शिशु स्वास्थ्य सहायता" },

    // Emergency Module
    "Emergency Information & Rapid Response": { te: "అత్యవసర సమాచారం & తక్షణ సహాయం", hi: "आपातकालीन जानकारी एवं त्वरित सहायता" },
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

    // Profile & Records & Appointments
    "My Patient Profile & Demographics": { te: "నా రోగి ప్రొఫైల్ & వివరాలు", hi: "मेरी मरीज प्रोफाइल और विवरण" },
    "Personal Information": { te: "వ్యక్తిగత వివరాలు", hi: "व्यक्तिगत जानकारी" },
    "Full Name": { te: "పూర్తి పేరు", hi: "पूरा नाम" },
    "Date of Birth": { te: "పుట్టిన తేదీ", hi: "जन्म तिथि" },
    "Gender": { te: "లింగం", hi: "लिंग" },
    "Male": { te: "పురుషుడు", hi: "पुरुष" },
    "Female": { te: "స్త్రీ", hi: "महिला" },
    "Contact Number": { te: "ఫోన్ నంబర్", hi: "फोन नंबर" },
    "Email Address": { te: "ఈమెయిల్ చిరునామా", hi: "ईमेल पता" },
    "Residential Address": { te: "నివాస చిరునామా", hi: "आवासीय पता" },
    "Save Profile Changes": { te: "మార్పులను భద్రపరచండి", hi: "प्रोफ़ाइल सहेजें" },
    "Scheduled Consultations & Appointments": { te: "షెడ్యూల్ చేయబడిన సంప్రదింపులు & అపాయింట్‌మెంట్లు", hi: "निर्धारित परामर्श एवं अपॉइंटमेंट" },
    "Book New Appointment": { te: "కొత్త అపాయింట్‌మెంట్ బుక్ చేయండి", hi: "नया अपॉइंटमेंट बुक करें" },
    "Upcoming Visits": { te: "రాబోయే అపాయింట్‌మెంట్లు", hi: "आगामी अपॉइंटमेंट" },
    "Past Appointments": { te: "గత అపాయింట్‌మెంట్లు", hi: "पुराने अपॉइंटमेंट" },
    "Doctor": { te: "డాక్టర్", hi: "डॉक्टर" },
    "Specialty": { te: "ప్రత్యేకత", hi: "विशेषज्ञता" },
    "Date & Time": { te: "తేదీ & సమయం", hi: "दिनांक एवं समय" },
    "Mode": { te: "విధానం", hi: "माध्यम" },
    "Status": { te: "స్థితి", hi: "स्थिति" },
    "Action": { te: "చర్య", hi: "कार्रवाई" },
    "Actions": { te: "చర్యలు", hi: "कार्रवाइयां" },
    "In-Person": { te: "ప్రత్యక్షంగా (ఆసుపత్రిలో)", hi: "व्यक्तिगत रूप से" },
    "Telehealth Video": { te: "టెలీహెల్త్ వీడియో కాల్", hi: "टेलीहेल्थ वीडियो" },
    "Confirmed": { te: "నిర్ధారించబడింది", hi: "पुष्टि की गई" },
    "Completed": { te: "పూర్తయింది", hi: "पूर्ण" },
    "Cancelled": { te: "రద్దు చేయబడింది", hi: "रद्द" },
    "Join Video Call": { te: "వీడియో కాల్‌లో చేరండి", hi: "वीडियो कॉल में शामिल हों" },
    "Electronic Medical Records (EHR)": { te: "ఎలక్ట్రానిక్ మెడికల్ రికార్డులు (EHR)", hi: "इलेक्ट्रॉनिक मेडिकल रिकॉर्ड (EHR)" },
    "Upload Clinical Document": { te: "వైద్య పత్రం అప్‌లోడ్ చేయండి", hi: "दस्तावेज़ अपलोड करें" },
    "All Records": { te: "అన్ని రికార్డులు", hi: "सभी रिकॉर्ड" },
    "Active Medications & Pharmacy Refills": { te: "క్రియాశీల మందులు & రీఫిల్స్", hi: "सक्रिय दवाएं एवं फार्मेसी रिफिल" },
    "Diagnostic Lab Reports & Pathology": { te: "డయాగ్నస్టిక్ ల్యాబ్ రిపోర్టులు & పాథాలజీ", hi: "डायग्नोस्टिक लैब रिपोर्ट" },
    "Encrypted Telemedicine Video Consultations": { te: "రక్షిత టెలిమెడిసిన్ వీడియో సంప్రదింపులు", hi: "सुरक्षित टेलीमेडिसिन वीडियो परामर्श" },

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
    "Send": { te: "పంపండి", hi: "भेजें" },
    "Download": { te: "డౌన్‌లోడ్", hi: "डाउनलोड" },
    "Download Record (PDF)": { te: "పీడీఎఫ్ డౌన్‌లోడ్", hi: "पीडीएफ डाउनलोड करें" },
    "Share via ABHA": { te: "ఆభా ద్వారా షేర్ చేయండి", hi: "आभा के माध्यम से साझा करें" },
    "Confirm Appointment Booking": { te: "అపాయింట్‌మెంట్ బుకింగ్ నిర్ధారించండి", hi: "अपॉइंटमेंट बुकिंग की पुष्टि करें" },
    "Confirm Emergency Assistance Request": { te: "అత్యవసర సహాయ అభ్యర్థనను నిర్ధారించండి", hi: "आपातकालीन सहायता अनुरोध की पुष्टि करें" },
    "Confirm & Dispatch": { te: "నిర్ధారించి పంపండి", hi: "पुष्टि करें और भेजें" },

    // Doctor Clinical Portal
    "Clinical Command Center": { te: "క్లినికల్ కమాండ్ సెంటర్", hi: "क्लिनिकल कमांड सेंटर" },
    "Today's Patient Queue & Triage": { te: "నేటి రోగుల జాబితా (క్యూ)", hi: "आज के मरीजों की कतार" },
    "Patients Waiting": { te: "వేచి ఉన్న రోగులు", hi: "प्रतीक्षारत मरीज" },
    "Consultations Done": { te: "పూర్తయిన సంప్రదింపులు", hi: "परामर्श पूर्ण" },
    "Patient Medical History": { te: "రోగి వైద్య చరిత్ర", hi: "मरीज का मेडिकल इतिहास" },
    "Save & Sync to ABHA": { te: "ఆభాలో భద్రపరచి సింక్ చేయండి", hi: "आभा में सहेजें और सिंक करें" }
  };

  // Build Comprehensive Bidirectional Translation Index
  const reverseIndex = {};
  Object.keys(phraseMap).forEach(enKey => {
    const entry = phraseMap[enKey];
    reverseIndex[enKey.trim()] = enKey;
    if (entry.te) reverseIndex[entry.te.trim()] = enKey;
    if (entry.hi) reverseIndex[entry.hi.trim()] = enKey;
  });

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

  // Translate a single key or phrase
  function t(phraseOrKey, fallback = '') {
    if (!phraseOrKey) return fallback;
    const clean = String(phraseOrKey).trim();
    const canonical = reverseIndex[clean] || clean;

    if (phraseMap[canonical] && phraseMap[canonical][currentLang]) {
      return phraseMap[canonical][currentLang];
    }

    if (currentLang === 'en') return canonical;
    return fallback || clean;
  }

  /**
   * Full Page DOM Translator
   * Walks every text node across the entire DOM tree and translates text,
   * placeholders, titles, aria-labels, using bidirectional reverse index.
   */
  function translateEntireDOM() {
    const FILTER_SHOW_TEXT = (typeof NodeFilter !== 'undefined' && NodeFilter.SHOW_TEXT) || 4;
    const FILTER_ACCEPT = (typeof NodeFilter !== 'undefined' && NodeFilter.FILTER_ACCEPT) || 1;
    const FILTER_REJECT = (typeof NodeFilter !== 'undefined' && NodeFilter.FILTER_REJECT) || 2;
    const FILTER_SKIP = (typeof NodeFilter !== 'undefined' && NodeFilter.FILTER_SKIP) || 3;

    // 1. Text Nodes Walker
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
                tagName === 'TEXTAREA' ||
                tagName === 'SELECT' ||
                tagName === 'OPTION' ||
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
          const canonicalKey = node._swasthyaOrigText || reverseIndex[currentTrim] || currentTrim;

          if (!node._swasthyaOrigText && reverseIndex[currentTrim]) {
            node._swasthyaOrigText = reverseIndex[currentTrim];
          }

          const leadingSpace = node.nodeValue.match(/^\s*/)[0];
          const trailingSpace = node.nodeValue.match(/\s*$/)[0];

          if (currentLang === 'en') {
            const enText = reverseIndex[currentTrim] || node._swasthyaOrigText || currentTrim;
            node.nodeValue = leadingSpace + enText + trailingSpace;
          } else {
            if (phraseMap[canonicalKey] && phraseMap[canonicalKey][currentLang]) {
              node.nodeValue = leadingSpace + phraseMap[canonicalKey][currentLang] + trailingSpace;
            }
          }
        });
      } catch (e) {
        console.warn('TreeWalker translation error:', e);
      }
    }

    // 2. Elements with data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key && phraseMap[key] && phraseMap[key][currentLang]) {
        el.textContent = phraseMap[key][currentLang];
      }
    });

    // 3. Leaf / Container Elements with direct text
    const leafSelectors = 'h1, h2, h3, h4, h5, h6, p, span, a, button, label, strong, em, b, th, td, div.nav-section-title, span.badge';
    document.querySelectorAll(leafSelectors).forEach(el => {
      if (el.closest('.lang-switcher-wrap') || el.tagName === 'SELECT' || el.tagName === 'OPTION') return;

      if (el.children.length === 0 && el.textContent.trim().length > 0) {
        const currentTrim = el.textContent.trim();
        const canonical = reverseIndex[currentTrim] || el.getAttribute('data-swasthya-orig-text') || currentTrim;

        if (!el.hasAttribute('data-swasthya-orig-text') && reverseIndex[currentTrim]) {
          el.setAttribute('data-swasthya-orig-text', reverseIndex[currentTrim]);
        }

        if (currentLang === 'en') {
          el.textContent = reverseIndex[currentTrim] || el.getAttribute('data-swasthya-orig-text') || canonical;
        } else if (phraseMap[canonical] && phraseMap[canonical][currentLang]) {
          el.textContent = phraseMap[canonical][currentLang];
        }
      }
    });

    // 4. Input Placeholders
    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(input => {
      const ph = input.placeholder.trim();
      const canonicalPh = reverseIndex[ph] || input.getAttribute('data-swasthya-orig-ph') || ph;

      if (!input.hasAttribute('data-swasthya-orig-ph') && reverseIndex[ph]) {
        input.setAttribute('data-swasthya-orig-ph', reverseIndex[ph]);
      }

      if (currentLang === 'en') {
        input.placeholder = canonicalPh;
      } else if (phraseMap[canonicalPh] && phraseMap[canonicalPh][currentLang]) {
        input.placeholder = phraseMap[canonicalPh][currentLang];
      } else if (canonicalPh.toLowerCase().includes('search')) {
        input.placeholder = currentLang === 'te' ? 'ఇక్కడ శోధించండి...' : 'यहाँ खोजें...';
      }
    });

    // 5. Tooltips & Titles
    document.querySelectorAll('[title]').forEach(el => {
      const title = el.title.trim();
      if (title.length > 0 && !el.closest('.lang-switcher-wrap')) {
        const canonicalTitle = reverseIndex[title] || el.getAttribute('data-swasthya-orig-title') || title;

        if (!el.hasAttribute('data-swasthya-orig-title') && reverseIndex[title]) {
          el.setAttribute('data-swasthya-orig-title', reverseIndex[title]);
        }

        if (currentLang === 'en') {
          el.title = canonicalTitle;
        } else if (phraseMap[canonicalTitle] && phraseMap[canonicalTitle][currentLang]) {
          el.title = phraseMap[canonicalTitle][currentLang];
        }
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

    // Update html lang attribute
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

    // Notify Voice Assistant if available
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

    // Dispatch global custom event for dynamic components to re-render
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
