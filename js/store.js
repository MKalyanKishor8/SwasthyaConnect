/**
 * SwasthyaConnect - Unified Persistent Data Store (js/store.js)
 * Manages patients, doctors, appointments, vitals, prescriptions, lab results, scans, emergency & notifications.
 */

const STORAGE_KEY = 'swasthyaconnect_data_v2';
const SESSION_KEY = 'swasthyaconnect_session_v2';

// Initial Mock Seed Data
const initialSeedData = {
  currentUser: null,
  doctors: [
    {
      id: 'doc-1',
      name: 'Dr. Sarah Lin, MD',
      email: 'sarah.lin@swasthyaconnect.health',
      role: 'doctor',
      specialty: 'Cardiology & Internal Medicine',
      department: 'Cardiovascular Care Unit (Room 304, 3rd Floor)',
      hospital: 'Metro Health Academic Medical Center',
      rating: 4.9,
      reviewsCount: 142,
      avatar: 'SL',
      availability: 'Mon, Tue, Thu, Fri (09:00 - 17:00)',
      bio: 'Board-certified Cardiologist with 12+ years of clinical experience specializing in preventive cardiovascular care, hypertension management, and non-invasive diagnostics.',
      stats: {
        totalPatients: 384,
        experienceYears: 12,
        consultationsToday: 6,
        satisfactionRate: '99%'
      }
    },
    {
      id: 'doc-2',
      name: 'Dr. Marcus Vance, MD',
      email: 'marcus.vance@swasthyaconnect.health',
      role: 'doctor',
      specialty: 'Neurology & Sleep Medicine',
      department: 'Brain & Spine Institute (Room 412, 4th Floor)',
      hospital: 'Metro Health Academic Medical Center',
      rating: 4.85,
      reviewsCount: 98,
      avatar: 'MV',
      availability: 'Mon - Wed (10:00 - 16:00)',
      bio: 'Neurologist specialized in migraine disorders, neuro-rehabilitation, and circadian sleep disorders.',
      stats: {
        totalPatients: 215,
        experienceYears: 9,
        consultationsToday: 4,
        satisfactionRate: '98%'
      }
    },
    {
      id: 'doc-3',
      name: 'Dr. Elena Rostova, MD',
      email: 'elena.rostova@swasthyaconnect.health',
      role: 'doctor',
      specialty: 'Endocrinology & Diabetes',
      department: 'Metabolic Health Clinic (Room 205, 2nd Floor)',
      hospital: 'Metro Health Academic Medical Center',
      rating: 4.95,
      reviewsCount: 160,
      avatar: 'ER',
      availability: 'Tue - Fri (08:30 - 15:30)',
      bio: 'Leading specialist in Type 1 & Type 2 Diabetes management, thyroid disorders, and lifestyle metabolic optimization.',
      stats: {
        totalPatients: 420,
        experienceYears: 15,
        consultationsToday: 7,
        satisfactionRate: '99%'
      }
    }
  ],
  patients: [
    {
      id: 'pat-1',
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      role: 'patient',
      gender: 'Male',
      age: 34,
      dob: '1992-04-15',
      bloodType: 'O+',
      mrn: 'MRN-2026-9082',
      phone: '+1 (555) 234-8910',
      address: '742 Evergreen Terrace, Springfield, IL',
      emergencyContact: {
        name: 'Emma Johnson',
        relation: 'Spouse',
        phone: '+1 (555) 987-6543',
        address: '742 Evergreen Terrace, Springfield, IL'
      },
      insurance: {
        provider: 'BlueCross BlueShield Premier',
        policyNumber: 'BCS-994218-A',
        groupNumber: 'GRP-7741',
        status: 'Active'
      },
      assignedDoctorId: 'doc-1',
      healthStatus: 'Stable • Controlled Stage-1 Hypertension • Good Cardiovascular Fitness',
      allergies: [
        { allergen: 'Penicillin', severity: 'Severe (Anaphylaxis Risk)', reaction: 'Hives, Angioedema' },
        { allergen: 'Peanuts', severity: 'Moderate', reaction: 'Skin rash, Bronchospasm' },
        { allergen: 'Sulfa Drugs', severity: 'Mild', reaction: 'Cutaneous erythema' }
      ],
      chronicConditions: [
        { condition: 'Stage 1 Hypertension', diagnosed: '2024-03-10', status: 'Controlled with Lisinopril 10mg' },
        { condition: 'Seasonal Allergic Rhinitis', diagnosed: '2021-06-15', status: 'Managed as needed' }
      ],
      previousDiagnoses: [
        { code: 'ICD-10 I10', name: 'Essential (Primary) Hypertension', date: 'Mar 2024', doctor: 'Dr. Sarah Lin, MD' },
        { code: 'ICD-10 J30.2', name: 'Other Seasonal Allergic Rhinitis', date: 'Jun 2021', doctor: 'Dr. Sarah Lin, MD' },
        { code: 'ICD-10 S93.4', name: 'Sprain of Calcaneofibular Ligament (Right Ankle)', date: 'Nov 2023', doctor: 'Dr. Marcus Vance, MD', status: 'Resolved' }
      ],
      medicalHistory: [
        { event: 'Appendectomy (Laparoscopic)', year: '2018', facility: 'Metro Health Hospital', outcome: 'Uncomplicated' },
        { event: 'Childhood Mild Asthma', year: '2004', facility: 'Springfield Pediatric Center', outcome: 'Resolved in adolescence' },
        { event: 'Family History: Maternal Hypertension', year: 'N/A', facility: 'Clinical Genetics', outcome: 'Noted for risk profiling' }
      ],
      vitals: {
        heartRate: 72,
        bloodPressure: '118/78',
        spO2: 99,
        temperature: '98.6 °F (37.0 °C)',
        respiratoryRate: '16 breaths/min',
        glucose: '94 mg/dL',
        weight: '168 lbs (76.2 kg)',
        bmi: '23.4 (Normal BMI)',
        lastUpdated: 'Today at 08:30 AM'
      },
      vitalsHistory: [
        { date: 'Aug 28', hr: 75, bpSys: 122, bpDia: 80, o2: 98, temp: 98.4 },
        { date: 'Aug 29', hr: 71, bpSys: 120, bpDia: 78, o2: 99, temp: 98.6 },
        { date: 'Aug 30', hr: 74, bpSys: 119, bpDia: 79, o2: 99, temp: 98.5 },
        { date: 'Aug 31', hr: 70, bpSys: 117, bpDia: 77, o2: 98, temp: 98.6 },
        { date: 'Sep 01', hr: 73, bpSys: 118, bpDia: 78, o2: 99, temp: 98.7 },
        { date: 'Sep 02', hr: 72, bpSys: 118, bpDia: 78, o2: 99, temp: 98.6 }
      ]
    },
    {
      id: 'pat-2',
      name: 'Sophia Patel',
      email: 'sophia.patel@example.com',
      role: 'patient',
      gender: 'Female',
      age: 29,
      dob: '1997-09-22',
      bloodType: 'A+',
      mrn: 'MRN-2026-4103',
      phone: '+1 (555) 456-7890',
      address: '120 Ocean View Blvd, San Diego, CA',
      emergencyContact: {
        name: 'Raj Patel',
        relation: 'Father',
        phone: '+1 (555) 321-7654',
        address: '120 Ocean View Blvd, San Diego, CA'
      },
      insurance: {
        provider: 'Aetna Health Gold',
        policyNumber: 'AET-887123-B',
        groupNumber: 'GRP-9901',
        status: 'Active'
      },
      assignedDoctorId: 'doc-1',
      healthStatus: 'Under Observation • Evaluating Exercise-induced Palpitations',
      allergies: [
        { allergen: 'Sulfa Drugs', severity: 'Moderate', reaction: 'Pruritic rash' }
      ],
      chronicConditions: [
        { condition: 'Mild Asthma', diagnosed: '2019-11-04', status: 'Albuterol inhaler PRN' }
      ],
      previousDiagnoses: [
        { code: 'ICD-10 R00.2', name: 'Palpitations (Post-exertional)', date: 'Aug 2026', doctor: 'Dr. Sarah Lin, MD' }
      ],
      medicalHistory: [
        { event: 'Tonsillectomy', year: '2012', facility: 'San Diego General', outcome: 'Resolved' }
      ],
      vitals: {
        heartRate: 78,
        bloodPressure: '114/72',
        spO2: 98,
        temperature: '98.4 °F',
        respiratoryRate: '15 breaths/min',
        glucose: '88 mg/dL',
        weight: '132 lbs',
        bmi: '21.5',
        lastUpdated: '2 hours ago'
      },
      vitalsHistory: [
        { date: 'Aug 28', hr: 76, bpSys: 115, bpDia: 72, o2: 98, temp: 98.4 },
        { date: 'Aug 30', hr: 78, bpSys: 114, bpDia: 72, o2: 98, temp: 98.4 }
      ]
    },
    {
      id: 'pat-3',
      name: 'Robert Miller',
      email: 'robert.miller@example.com',
      role: 'patient',
      gender: 'Male',
      age: 58,
      dob: '1968-11-03',
      bloodType: 'B+',
      mrn: 'MRN-2026-1189',
      phone: '+1 (555) 789-0123',
      address: '450 Pine Forest Rd, Denver, CO',
      emergencyContact: {
        name: 'Clara Miller',
        relation: 'Wife',
        phone: '+1 (555) 654-9870',
        address: '450 Pine Forest Rd, Denver, CO'
      },
      insurance: {
        provider: 'Medicare Plus Advantage',
        policyNumber: 'MED-541290-X',
        groupNumber: 'GRP-3310',
        status: 'Active'
      },
      assignedDoctorId: 'doc-1',
      healthStatus: 'Post-CABG Recovery • Active Glucose & Lipid Titration',
      allergies: [
        { allergen: 'Latex', severity: 'Severe', reaction: 'Contact dermatitis, Respiratory distress' }
      ],
      chronicConditions: [
        { condition: 'Type 2 Diabetes Mellitus', diagnosed: '2017-02-14', status: 'Metformin 500mg BID' },
        { condition: 'Coronary Artery Disease', diagnosed: '2022-09-20', status: 'Post-CABG Stable' }
      ],
      previousDiagnoses: [
        { code: 'ICD-10 I25.10', name: 'Atherosclerotic Heart Disease', date: 'Sep 2022', doctor: 'Dr. Sarah Lin, MD' },
        { code: 'ICD-10 E11.9', name: 'Type 2 Diabetes Mellitus without complications', date: 'Feb 2017', doctor: 'Dr. Elena Rostova, MD' }
      ],
      medicalHistory: [
        { event: 'Coronary Artery Bypass Graft (CABG x 2)', year: '2023', facility: 'Metro Health Cardiology', outcome: 'Successful' }
      ],
      vitals: {
        heartRate: 84,
        bloodPressure: '136/88',
        spO2: 96,
        temperature: '98.9 °F',
        respiratoryRate: '18 breaths/min',
        glucose: '142 mg/dL',
        weight: '195 lbs',
        bmi: '28.1',
        lastUpdated: '1 hour ago'
      },
      vitalsHistory: [
        { date: 'Aug 28', hr: 86, bpSys: 138, bpDia: 90, o2: 96, temp: 98.8 },
        { date: 'Sep 02', hr: 84, bpSys: 136, bpDia: 88, o2: 96, temp: 98.9 }
      ]
    }
  ],
  appointments: [
    {
      id: 'apt-101',
      patientId: 'pat-1',
      patientName: 'Alex Johnson',
      doctorId: 'doc-1',
      doctorName: 'Dr. Sarah Lin, MD',
      doctorSpecialty: 'Cardiology & Internal Medicine',
      doctorRoom: 'Room 304, 3rd Floor (Cardiology Wing)',
      date: '2026-09-04',
      time: '10:30 AM',
      type: 'Telehealth Video',
      reason: 'Hypertension 6-Month Review & Medication Evaluation',
      status: 'confirmed', // confirmed, waiting, in-consultation, completed, cancelled
      notes: 'Patient reports steady morning readings (118/78). No dizziness reported.',
      telehealthLink: '#telehealth-room-apt-101',
      created: '2026-08-30'
    },
    {
      id: 'apt-102',
      patientId: 'pat-1',
      patientName: 'Alex Johnson',
      doctorId: 'doc-3',
      doctorName: 'Dr. Elena Rostova, MD',
      doctorSpecialty: 'Endocrinology & Diabetes',
      doctorRoom: 'Room 205, 2nd Floor (Metabolic Clinic)',
      date: '2026-09-18',
      time: '02:00 PM',
      type: 'In-Clinic Consultation',
      reason: 'Routine Annual Metabolic Health & Fasting Lipid Profile Review',
      status: 'confirmed',
      notes: 'Fasting lipid blood test required 2 days prior at Metro Health Diagnostic Lab.',
      created: '2026-09-01'
    },
    {
      id: 'apt-100-prev',
      patientId: 'pat-1',
      patientName: 'Alex Johnson',
      doctorId: 'doc-1',
      doctorName: 'Dr. Sarah Lin, MD',
      doctorSpecialty: 'Cardiology & Internal Medicine',
      doctorRoom: 'Room 304, 3rd Floor',
      date: '2026-06-12',
      time: '11:00 AM',
      type: 'Telehealth Video',
      reason: 'Lisinopril Titration Check & Home Blood Pressure Log Review',
      status: 'completed',
      notes: 'Blood pressure controlled well at 120/80. Maintained Lisinopril 10mg daily.',
      created: '2026-06-01'
    },
    {
      id: 'apt-99-prev',
      patientId: 'pat-1',
      patientName: 'Alex Johnson',
      doctorId: 'doc-2',
      doctorName: 'Dr. Marcus Vance, MD',
      doctorSpecialty: 'Neurology & Sleep Medicine',
      doctorRoom: 'Room 412, 4th Floor',
      date: '2026-03-20',
      time: '03:30 PM',
      type: 'In-Clinic Consultation',
      reason: 'Evaluation of Tension Headaches & Sleep Hygiene Consultation',
      status: 'completed',
      notes: 'Advised stress-reduction ergonomics and sleep schedule consistency. Normal neurological exam.',
      created: '2026-03-10'
    }
  ],
  prescriptions: [
    {
      id: 'rx-201',
      patientId: 'pat-1',
      doctorId: 'doc-1',
      doctorName: 'Dr. Sarah Lin, MD (Cardiologist)',
      medicationName: 'Lisinopril',
      strength: '10 mg',
      dosage: 'Take 1 tablet by mouth once daily in the morning with a full glass of water',
      purpose: 'Essential Hypertension Management & ACE Inhibition',
      quantity: 90,
      refillsRemaining: 3,
      pillsRemaining: 68,
      totalPills: 90,
      prescribedDate: '2026-07-15',
      expiryDate: '2027-07-15',
      pharmacy: 'CVS Pharmacy #4192, Springfield (Tel: 555-0192)',
      status: 'active'
    },
    {
      id: 'rx-202',
      patientId: 'pat-1',
      doctorId: 'doc-1',
      doctorName: 'Dr. Sarah Lin, MD (Cardiologist)',
      medicationName: 'Atorvastatin Calcium',
      strength: '20 mg',
      dosage: 'Take 1 tablet by mouth at bedtime',
      purpose: 'Cardiovascular Prophylaxis & Primary Lipid Optimization',
      quantity: 90,
      refillsRemaining: 2,
      pillsRemaining: 42,
      totalPills: 90,
      prescribedDate: '2026-06-10',
      expiryDate: '2027-06-10',
      pharmacy: 'CVS Pharmacy #4192, Springfield',
      status: 'active'
    },
    {
      id: 'rx-203',
      patientId: 'pat-1',
      doctorId: 'doc-1',
      doctorName: 'Dr. Sarah Lin, MD (Cardiologist)',
      medicationName: 'Omega-3 Acid Ethyl Esters',
      strength: '1000 mg',
      dosage: 'Take 1 capsule twice daily with meals',
      purpose: 'Triglyceride Regulation & Endothelial Support',
      quantity: 120,
      refillsRemaining: 4,
      pillsRemaining: 95,
      totalPills: 120,
      prescribedDate: '2026-08-01',
      expiryDate: '2027-08-01',
      pharmacy: 'CVS Pharmacy #4192, Springfield',
      status: 'active'
    }
  ],
  labReports: [
    {
      id: 'lab-301',
      patientId: 'pat-1',
      doctorId: 'doc-1',
      doctorName: 'Dr. Sarah Lin, MD',
      title: 'Comprehensive Metabolic Panel (CMP-14)',
      category: 'Blood Chemistry',
      date: '2026-08-25',
      facility: 'Quest Diagnostics & Metro Health Central Pathology',
      status: 'Normal',
      summary: 'All 14 metabolic biomarkers including eGFR (>90 mL/min), Serum Creatinine (0.9 mg/dL), BUN (14 mg/dL), Sodium (140 mEq/L), Potassium (4.2 mEq/L), and AST/ALT are within optimal physiological reference ranges.',
      results: [
        { test: 'Serum Sodium', value: '140 mEq/L', normalRange: '135 - 145 mEq/L', flag: 'Normal' },
        { test: 'Serum Potassium', value: '4.2 mEq/L', normalRange: '3.5 - 5.1 mEq/L', flag: 'Normal' },
        { test: 'eGFR (Kidney Function)', value: '> 90 mL/min/1.73m²', normalRange: '> 60 mL/min', flag: 'Optimal' },
        { test: 'Serum Creatinine', value: '0.90 mg/dL', normalRange: '0.70 - 1.30 mg/dL', flag: 'Normal' },
        { test: 'Fasting Blood Glucose', value: '94 mg/dL', normalRange: '70 - 99 mg/dL', flag: 'Normal' }
      ]
    },
    {
      id: 'lab-302',
      patientId: 'pat-1',
      doctorId: 'doc-1',
      doctorName: 'Dr. Sarah Lin, MD',
      title: 'Advanced Lipid Panel with Atherogenic Ratios',
      category: 'Cardiovascular Lipidology',
      date: '2026-08-20',
      facility: 'Metro Health Academic Medical Center Laboratory',
      status: 'Normal',
      summary: 'Total Cholesterol 168 mg/dL, HDL 54 mg/dL, LDL-C 94 mg/dL (target <100), and Triglycerides 110 mg/dL indicate optimal therapeutic response to Atorvastatin therapy.',
      results: [
        { test: 'Total Cholesterol', value: '168 mg/dL', normalRange: '< 200 mg/dL', flag: 'Desirable' },
        { test: 'HDL Cholesterol ("Good")', value: '54 mg/dL', normalRange: '> 40 mg/dL', flag: 'Normal' },
        { test: 'LDL Cholesterol ("Bad")', value: '94 mg/dL', normalRange: '< 100 mg/dL', flag: 'Optimal' },
        { test: 'Triglycerides', value: '110 mg/dL', normalRange: '< 150 mg/dL', flag: 'Normal' }
      ]
    },
    {
      id: 'lab-303',
      patientId: 'pat-1',
      doctorId: 'doc-1',
      doctorName: 'Dr. Sarah Lin, MD',
      title: '12-Lead Diagnostic Electrocardiogram (ECG)',
      category: 'Diagnostic Cardiology',
      date: '2026-08-15',
      facility: 'Cardiology Non-Invasive Diagnostic Suite',
      status: 'Normal',
      summary: 'Normal Sinus Rhythm at 72 bpm. PR interval 158 ms, QRS duration 86 ms, QTc 418 ms. No evidence of ST-segment elevation, depression, chamber hypertrophy, or acute ischemic changes.',
      results: [
        { test: 'Rhythm Interpretation', value: 'Normal Sinus Rhythm (NSR)', normalRange: 'Sinus 60-100 bpm', flag: 'Normal' },
        { test: 'Heart Rate', value: '72 BPM', normalRange: '60 - 100 BPM', flag: 'Normal' },
        { test: 'PR Interval', value: '158 ms', normalRange: '120 - 200 ms', flag: 'Normal' },
        { test: 'QTc Interval', value: '418 ms', normalRange: '< 450 ms', flag: 'Normal' }
      ]
    }
  ],
  scansAndReports: [
    {
      id: 'scan-401',
      patientId: 'pat-1',
      title: 'Digital Chest Radiograph (X-Ray PA & Lateral)',
      modality: 'Digital X-Ray Radiography',
      date: '2026-07-28',
      radiologist: 'Dr. Kevin Zhao, MD (Diagnostic Radiologist)',
      findings: 'Lungs are clear bilaterally without focal consolidation, pneumothorax, or pleural effusion. Cardiothoracic silhouette is within normal limits. Normal bony thorax.',
      impression: 'No acute cardiopulmonary disease.',
      status: 'Normal'
    },
    {
      id: 'scan-402',
      patientId: 'pat-1',
      title: '2D Transthoracic Echocardiogram with Doppler',
      modality: 'Ultrasound Echocardiography',
      date: '2026-05-14',
      radiologist: 'Dr. Sarah Lin, MD (Cardiologist)',
      findings: 'Left ventricular ejection fraction (LVEF) is 62% (Normal >= 55%). Normal wall motion and cavity dimensions. Normal valve morphology with trace physiological tricuspid regurgitation.',
      impression: 'Normal left ventricular systolic and diastolic function.',
      status: 'Optimal'
    }
  ],
  governmentSchemes: [
    {
      id: 'pmjay',
      name: 'Ayushman Bharat – PM-JAY (Pradhan Mantri Jan Arogya Yojana)',
      hindiName: 'आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना',
      shortName: 'PM-JAY',
      category: 'Insurance/Financial Assistance',
      department: 'National Health Authority (NHA), Ministry of Health & Family Welfare',
      badge: '₹5 Lakhs Annual Cover',
      shortDesc: 'World’s largest government-funded health assurance scheme providing ₹5,00,000 cashless hospitalization cover per eligible family per year across 28,000+ empanelled hospitals.',
      purpose: 'To provide financial protection against catastrophic health expenditures and ensure universal access to secondary and tertiary medical care across India.',
      benefits: [
        '₹5,00,000 annual health cover per family on a floater basis with no restrictions on family size, age, or gender.',
        'Cashless and paperless treatment at all empanelled public hospitals and private healthcare facilities nationwide.',
        'Comprehensive coverage of 1,949+ medical procedures including oncology, cardiology, neurosurgery, and intensive care.',
        'Pre-hospitalization expenses (up to 3 days) and post-hospitalization care (up to 15 days) including diagnostics and medicines.',
        'All pre-existing diseases are covered from the very first day of scheme enrollment.'
      ],
      eligibility: [
        'Households identified under Socio-Economic Caste Census (SECC 2011) rural deprivation criteria (D1 to D7) or 11 urban occupational worker categories.',
        'Active beneficiaries of National Food Security Act (NFSA) / Ration Card programs in participating States.',
        'All Senior Citizens aged 70 years and above (under PM-JAY Vistrit Coverage) irrespective of socio-economic status.'
      ],
      documents: [
        'Aadhaar Card of all family members',
        'Ration Card / NFSA Family ID / State Beneficiary Card',
        'Active Mobile Number linked with Aadhaar (for OTP e-KYC)',
        'PMJAY Beneficiary Letter / Family ID (if received)'
      ],
      howToApply: [
        'Visit the official NHA portal (beneficiary.nha.gov.in) or download the Ayushman App.',
        'Login using your active mobile number and enter the received OTP.',
        'Search beneficiary list using State, Scheme (PMJAY), Ration Card Number, or Aadhaar Number.',
        'Complete online e-KYC via Aadhaar OTP or Face Authentication and download your Ayushman Card instantly.',
        'Alternatively, visit any nearby Empanelled Hospital (Ayushman Mitra Helpdesk) or Common Service Centre (CSC) with your documents.'
      ],
      faqs: [
        { q: 'Is there any registration fee for PM-JAY?', a: 'No, PM-JAY registration and the Ayushman Card generation are 100% free of cost at all government hospitals and online portals.' },
        { q: 'Can I use the Ayushman Card in another state?', a: 'Yes, PM-JAY offers nationwide portability. An Ayushman card issued in one state is fully valid at any empanelled hospital across India.' },
        { q: 'Are OPD consultations covered?', a: 'PM-JAY primarily covers in-patient secondary and tertiary hospitalizations (IPD). Free OPD consultations and primary medicines are provided under Ayushman Arogya Mandirs.' }
      ],
      officialUrl: 'https://pmjay.gov.in/',
      portalUrl: 'https://beneficiary.nha.gov.in/'
    },
    {
      id: 'esanjeevani',
      name: 'eSanjeevani (National Teleconsultation Service)',
      hindiName: 'ई-संजीवनी राष्ट्रीय टेली-परामर्श सेवा',
      shortName: 'eSanjeevani',
      category: 'Telemedicine',
      department: 'Ministry of Health & Family Welfare (MoHFW) & C-DAC Mohali',
      badge: 'Free Specialist Video Consult',
      shortDesc: 'Official national doctor-to-patient (eSanjeevaniOPD) and doctor-to-doctor (eSanjeevani HWC) telemedicine platform providing free medical consultations from home.',
      purpose: 'To democratize access to specialist doctors, eliminate geographical barriers, and offer free digital clinical consultations across all States and UTs.',
      benefits: [
        '100% Free video and audio consultations with verified government medical officers, MD specialists, and AIIMS faculty.',
        'Legally recognized, digitally signed e-Prescriptions generated instantly after the consultation.',
        'Dedicated specialty OPDs: Cardiology, Endocrinology, Pediatrics, Gynecology, Dermatology, and Psychiatry.',
        'Completely contact-free with zero travel time and zero hospital queue waiting.'
      ],
      eligibility: [
        'Open to all Indian citizens and residents across all States and Union Territories.',
        'No income ceiling, age limitation, or geographic restrictions.'
      ],
      documents: [
        'Valid Indian Mobile Number for SMS OTP authentication',
        'Previous medical records / lab reports / prescriptions (optional, to upload during consult)'
      ],
      howToApply: [
        'Visit esanjeevani.mohfw.gov.in or download the official eSanjeevani Android/iOS app.',
        'Register or login with your mobile number using SMS OTP.',
        'Select your State, choose the required OPD Clinic, and fill in patient demographics.',
        'Join the digital virtual queue. When the doctor is ready, accept the encrypted video call.',
        'Consult with the doctor and download your signed prescription immediately to your device.'
      ],
      faqs: [
        { q: 'What are the operating hours for eSanjeevani?', a: 'General OPDs are active Monday through Saturday (09:00 AM to 05:00 PM), while specialized super-specialty clinics operate according to state-wise timetables.' },
        { q: 'Is the eSanjeevani prescription accepted at local pharmacies?', a: 'Yes, eSanjeevani digital prescriptions are signed by registered medical practitioners and are legally valid under the Telemedicine Practice Guidelines issued by the National Medical Commission (NMC).' }
      ],
      officialUrl: 'https://esanjeevani.mohfw.gov.in/',
      portalUrl: 'https://esanjeevani.mohfw.gov.in/#/patient/signin'
    },
    {
      id: 'nhm',
      name: 'National Health Mission (NHM)',
      hindiName: 'राष्ट्रीय स्वास्थ्य मिशन',
      shortName: 'NHM',
      category: 'Rural Healthcare',
      department: 'Ministry of Health & Family Welfare (MoHFW)',
      badge: 'Universal Public Health',
      shortDesc: 'Comprehensive national flagship mission uniting NRHM & NUHM to deliver free essential healthcare, diagnostics, and generic medicines across urban and rural India.',
      purpose: 'To establish a community-owned, decentralized health delivery system with universal access to equitable, affordable, and high-quality public healthcare.',
      benefits: [
        'Free Essential Drugs Initiative: 100% free quality generic medicines at all government PHCs, CHCs, and District Hospitals.',
        'Free Essential Diagnostics Initiative: Over 50+ free diagnostic tests at PHCs and 100+ at District Hospitals.',
        'Free National Ambulance Network: Emergency trauma response (108) and maternal-infant transport (102).',
        'Network of 1,60,000+ Ayushman Arogya Mandirs providing comprehensive primary healthcare closer to homes.'
      ],
      eligibility: [
        'Universal public access for all citizens visiting any government primary health center (PHC), community health center (CHC), or district hospital.',
        'Special focus on rural villages, tribal communities, urban slums, and economically vulnerable households.'
      ],
      documents: [
        'No mandatory documents required for basic OPD consultation and free medicines.',
        'Aadhaar / Government ID beneficial for Ayushman Bharat Health Account (ABHA) digital record creation.'
      ],
      howToApply: [
        'Walk into any nearest Government Sub-Centre, PHC, CHC, or District Civil Hospital.',
        'Consult the medical officer on duty and receive prescribed generic medicines and diagnostic tests on-site free of cost.',
        'Connect with local community ASHA or ANM workers for maternal and infant health support.'
      ],
      faqs: [
        { q: 'What is an Ayushman Arogya Mandir?', a: 'Ayushman Arogya Mandirs (formerly Health and Wellness Centres) are upgraded health posts providing 12 packages of comprehensive primary healthcare, free diagnostic testing, and teleconsultations.' }
      ],
      officialUrl: 'https://nhm.gov.in/',
      portalUrl: 'https://nhm.gov.in/'
    },
    {
      id: 'indradhanush',
      name: 'Mission Indradhanush (Universal Immunization Programme - UIP)',
      hindiName: 'मिशन इन्द्रधनुष - सार्वभौमिक टीकाकरण कार्यक्रम',
      shortName: 'Mission Indradhanush',
      category: 'Vaccination',
      department: 'Ministry of Health & Family Welfare (MoHFW)',
      badge: '100% Free Vaccination',
      shortDesc: 'Intensive national immunization campaign providing free vaccines against 12 life-threatening diseases to all infants, children under 5 years, and pregnant mothers.',
      purpose: 'To achieve over 90% full immunization coverage across all districts and eliminate vaccine-preventable childhood and maternal mortality.',
      benefits: [
        '100% Free immunization against 12 diseases: Tuberculosis, Diphtheria, Pertussis, Tetanus, Polio, Measles, Rubella, Hepatitis B, Rotavirus, Hib Meningitis, Pneumococcal Pneumonia (PCV), and Japanese Encephalitis.',
        'Digital vaccine tracking and verifiable digital immunization certificates powered by the national U-WIN platform.',
        'Doorstep community vaccination camps organized at Anganwadi centers, primary schools, and urban slums.'
      ],
      eligibility: [
        'All children from birth up to 5 years of age who have missed routine vaccine doses.',
        'All pregnant women requiring Tetanus and adult Diphtheria (Td) immunization.'
      ],
      documents: [
        'Mother & Child Protection (MCP) Card / RCH Booklet',
        'Aadhaar Card / Birth Certificate (optional, no child is denied vaccination for lack of documents)'
      ],
      howToApply: [
        'Visit the nearest Anganwadi Center, Government PHC, or Urban Health Post on Village Health and Nutrition Days (VHND).',
        'Or register online on the U-WIN Portal (uwin.mohfw.gov.in) to view vaccination slots and schedules.',
        'Administer vaccines according to the National Immunization Schedule and receive digital confirmation.'
      ],
      faqs: [
        { q: 'Are vaccines provided under Mission Indradhanush free?', a: 'Yes, all vaccines under Mission Indradhanush and the Universal Immunization Programme are 100% free of charge at all public facilities.' }
      ],
      officialUrl: 'https://www.mohfw.gov.in/',
      portalUrl: 'https://uwin.mohfw.gov.in/'
    },
    {
      id: 'jsy',
      name: 'Janani Suraksha Yojana (JSY)',
      hindiName: 'जननी सुरक्षा योजना',
      shortName: 'JSY',
      category: 'Maternal & Child Health',
      department: 'National Health Mission, Ministry of Health & Family Welfare',
      badge: 'Direct Cash Assistance',
      shortDesc: 'Safe motherhood intervention under NHM promoting institutional delivery among pregnant women through direct benefit transfer (DBT) cash assistance and free delivery care.',
      purpose: 'To reduce maternal and neonatal mortality by encouraging institutional deliveries in accredited government and private health facilities.',
      benefits: [
        'Cash Assistance (Low Performing States): ₹1,400 for rural mothers and ₹1,000 for urban mothers delivering in institutional healthcare centers.',
        'Cash Assistance (High Performing States): ₹700 for rural BPL/SC/ST mothers and ₹600 for urban BPL mothers.',
        'Combined with JSSK (Janani Shishu Suraksha Karyakram): 100% free normal delivery & C-section, free diagnostics, free hospital diet, and free ambulance transport.',
        'Incentives for ASHA health workers who motivate and accompany pregnant women to health facilities.'
      ],
      eligibility: [
        'All pregnant women delivering in government health centers in Low Performing States (UP, Bihar, MP, Rajasthan, Odisha, Jharkhand, Chhattisgarh, Uttarakhand, Assam, J&K).',
        'BPL / SC / ST pregnant women aged 19 years and above in High Performing States.'
      ],
      documents: [
        'Mother & Child Protection (MCP) Card with recorded Antenatal Checkups (ANCs)',
        'Aadhaar-linked active Bank Account details / Passbook copy for DBT transfer',
        'BPL Card / SC / ST Caste Certificate (where applicable in HPS states)'
      ],
      howToApply: [
        'Register the pregnancy with the local ASHA or ANM worker at the nearest Sub-Centre / PHC during the first trimester.',
        'Obtain an MCP Card and complete all mandatory Antenatal Checkups (ANCs).',
        'Deliver in a Government Health Facility (PHC/CHC/District Hospital).',
        'The JSY financial assistance is directly credited to the mother’s bank account via DBT.'
      ],
      faqs: [
        { q: 'Are Cesarean deliveries covered?', a: 'Yes, both normal deliveries and Cesarean sections (C-sections) are completely free of charge, including anesthesia, blood transfusion, and hospital stay.' }
      ],
      officialUrl: 'https://nhm.gov.in/',
      portalUrl: 'https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=309'
    },
    {
      id: 'ntep',
      name: 'National TB Elimination Programme (NTEP) & Ni-kshay',
      hindiName: 'राष्ट्रीय क्षय रोग उन्मूलन कार्यक्रम एवं निक्षయ్',
      shortName: 'NTEP / Ni-kshay',
      category: 'Disease Prevention',
      department: 'Central TB Division, Ministry of Health & Family Welfare',
      badge: 'Free Treatment + ₹500/mo DBT',
      shortDesc: 'National public health initiative to eliminate Tuberculosis with free high-precision diagnostics (CB-NAAT/TrueNat), free daily anti-TB drug regimens, and ₹500/month nutritional financial grant.',
      purpose: 'To eliminate Tuberculosis in India through universal access to rapid diagnostics, free quality treatment, and community nutritional support.',
      benefits: [
        '100% Free rapid molecular testing (CB-NAAT / GeneXpert / TrueNat) and digital chest radiography.',
        'Free, quality-assured Fixed-Dose Combination (FDC) anti-TB medicine courses for 6+ months under daily DOTS protocol.',
        'Ni-kshay Poshan Yojana: ₹500 per month direct benefit transfer (DBT) directly into the patient’s bank account throughout the treatment period.',
        'Ni-kshay Mitra community nutritional support (food baskets, diagnostic assistance, and vocational training).'
      ],
      eligibility: [
        'All individuals diagnosed with Drug-Sensitive (DS-TB) or Drug-Resistant (DR-TB) Tuberculosis across public and private healthcare sectors.'
      ],
      documents: [
        'Ni-kshay ID (generated by NTEP staff upon diagnostic confirmation)',
        'Aadhaar Card copy',
        'Bank Account Passbook copy for DBT nutritional grant transfer'
      ],
      howToApply: [
        'Visit any Government Hospital, Designated Microscopy Centre (DMC), or PHC with symptoms (cough > 2 weeks, evening fever, weight loss).',
        'Undergo free sputum molecular test (CB-NAAT).',
        'Upon positive confirmation, the patient is enrolled in the Ni-kshay portal and assigned a treatment supporter.',
        'Receive free medicine blister packs and register bank details for the monthly ₹500 nutritional support.'
      ],
      faqs: [
        { q: 'What is Ni-kshay Poshan Yojana?', a: 'It is a Centrally Sponsored Scheme providing financial incentive of ₹500/month to each notified TB patient for the entire duration of their anti-TB treatment.' }
      ],
      officialUrl: 'https://tbcindia.gov.in/',
      portalUrl: 'https://nikshay.in/'
    }
  ],
  nearbyCentres: [
    {
      id: 'centre-1',
      name: 'Metro Health District Civil Hospital & Trauma Centre',
      type: 'Government Hospital',
      category: 'Government Hospitals',
      latOffset: 0.008,
      lngOffset: 0.006,
      distanceKm: 1.2,
      distance: '1.2 km',
      location: 'Civil Lines, Ring Road, Springfield (Pincode: 500001)',
      services: ['24x7 Emergency Trauma Care', 'PM-JAY Golden Card Desk', 'Free Essential Diagnostics & Pathology', 'Blood Bank (24x7)', 'Dialysis Unit', 'Maternal & Neonatal ICU (NICU)', 'Jan Aushadhi Generic Pharmacy'],
      phone: '+91 800-792-7841 / Ext. 108',
      timing: '24x7 Emergency & IPD | OPD: 08:30 AM - 01:30 PM',
      emergencyReady: true,
      pmjayEmpanelled: true,
      beds: '500 Beds',
      doctorsCount: 45,
      directionsUrl: 'https://maps.google.com/?q=District+Civil+Hospital'
    },
    {
      id: 'centre-2',
      name: 'Sector 12 Community Health Centre (CHC)',
      type: 'CHC',
      category: 'CHC',
      latOffset: -0.015,
      lngOffset: 0.012,
      distanceKm: 2.8,
      distance: '2.8 km',
      location: 'Plot 45, Near Main Market, Sector 12, Springfield',
      services: ['General OPD (Medicine, Gynecology, Pediatrics)', 'Free Routine Diagnostics & X-Ray', 'Mission Indradhanush Immunization (Wed/Sat)', 'Janani Suraksha Yojana Deliveries', 'DOTS TB Diagnostic Centre (NTEP)', 'eSanjeevani Teleconsultation Hub'],
      phone: '+91 800-792-3320',
      timing: 'OPD: 08:30 AM - 02:00 PM | Emergency: 24x7',
      emergencyReady: true,
      pmjayEmpanelled: true,
      beds: '30 Beds',
      doctorsCount: 12,
      directionsUrl: 'https://maps.google.com/?q=Community+Health+Centre'
    },
    {
      id: 'centre-3',
      name: 'Central Urban Primary Health Centre (PHC) - Ward 4',
      type: 'PHC',
      category: 'PHC',
      latOffset: 0.012,
      lngOffset: -0.018,
      distanceKm: 3.5,
      distance: '3.5 km',
      location: 'Ward 4 Health Complex, North Springfield Road',
      services: ['Comprehensive Primary Healthcare (CPHC)', 'Free Essential Drugs (EDL)', 'NCD Screening (Hypertension, Diabetes)', 'Antenatal Care (ANC) & Mother Health', 'eSanjeevani Tele-OPD with Specialists'],
      phone: '+91 800-792-5501',
      timing: '09:00 AM - 04:00 PM (Monday - Saturday)',
      emergencyReady: false,
      pmjayEmpanelled: false,
      beds: '6 Beds (Day Care)',
      doctorsCount: 4,
      directionsUrl: 'https://maps.google.com/?q=Primary+Health+Centre'
    },
    {
      id: 'centre-4',
      name: 'Ayushman Arogya Mandir - Sub-Centre West',
      type: 'Ayushman Arogya Mandir',
      category: 'Ayushman Arogya Mandir',
      latOffset: -0.006,
      lngOffset: -0.009,
      distanceKm: 0.9,
      distance: '0.9 km',
      location: 'Panchayat Bhavan Road, West Enclave, Springfield',
      services: ['12 Packages Comprehensive Primary Healthcare', 'Free Point-of-Care Diagnostics (Sugar, HB, BP)', 'Yoga & Wellness Sessions', 'ASHA & ANM Mother-Child Care', 'Tele-consultation to District Specialists'],
      phone: '+91 800-792-4419',
      timing: '08:30 AM - 04:30 PM (Daily)',
      emergencyReady: false,
      pmjayEmpanelled: true,
      beds: 'Day Care Observation',
      doctorsCount: 2,
      directionsUrl: 'https://maps.google.com/?q=Ayushman+Arogya+Mandir'
    },
    {
      id: 'centre-5',
      name: 'Apollo Life Care Specialist Poly-Clinic',
      type: 'Clinic',
      category: 'Clinics',
      latOffset: 0.004,
      lngOffset: 0.003,
      distanceKm: 0.6,
      distance: '0.6 km',
      location: 'Suite 201, Green Glen Commercial Towers, Springfield',
      services: ['Cardiology & Internal Medicine Consultations', 'Pediatrics & Child Wellness', 'Minor Procedures & Wound Dressing', 'ECG & Digital Vitals Telemetry Sync', 'Digital Health Record Integration'],
      phone: '+91 800-792-9900',
      timing: '08:00 AM - 08:00 PM (Monday - Saturday)',
      emergencyReady: false,
      pmjayEmpanelled: false,
      beds: 'Outpatient Clinic',
      doctorsCount: 8,
      directionsUrl: 'https://maps.google.com/?q=Apollo+Clinic'
    },
    {
      id: 'centre-6',
      name: 'Quest Central Diagnostics & Pathology Laboratory',
      type: 'Diagnostic Centre',
      category: 'Diagnostic Centres',
      latOffset: -0.009,
      lngOffset: 0.008,
      distanceKm: 1.4,
      distance: '1.4 km',
      location: 'Diagnostic Plaza, 2nd Avenue, Springfield',
      services: ['Automated Blood Chemistry (CMP, Lipid, CBC)', 'Digital X-Ray & 2D Echo', 'Molecular PCR / TrueNat TB Testing', 'Home Sample Collection Available', 'Real-time Digital Lab Report Sync to App'],
      phone: '+91 800-792-1144',
      timing: '06:30 AM - 09:00 PM (Open 7 Days)',
      emergencyReady: false,
      pmjayEmpanelled: true,
      beds: 'Diagnostic Testing Centre',
      doctorsCount: 6,
      directionsUrl: 'https://maps.google.com/?q=Quest+Diagnostics'
    },
    {
      id: 'centre-7',
      name: 'PMBJP Pradhan Mantri Jan Aushadhi Kendra #108',
      type: 'Pharmacy',
      category: 'Pharmacies',
      latOffset: 0.002,
      lngOffset: -0.004,
      distanceKm: 0.4,
      distance: '0.4 km',
      location: 'Shop 12, Civil Hospital Gate 2, Ring Road, Springfield',
      services: ['100% Quality Generic Medicines (50-90% Discount)', 'Chronic Care Meds (Lisinopril, Atorvastatin, Metformin)', 'Surgical Consumables & Blood Glucose Strips', '1-Click Refill Pickup Desk', 'Digital Prescription Dispensing'],
      phone: '+91 800-792-6622',
      timing: '08:00 AM - 10:00 PM (Daily)',
      emergencyReady: false,
      pmjayEmpanelled: true,
      beds: 'Pharmacy Store',
      doctorsCount: 2,
      directionsUrl: 'https://maps.google.com/?q=Jan+Aushadhi+Kendra'
    },
    {
      id: 'centre-8',
      name: 'Metro 24x7 Acute Trauma & Resuscitation Center',
      type: 'Emergency Services',
      category: 'Emergency Services',
      latOffset: 0.010,
      lngOffset: 0.007,
      distanceKm: 1.3,
      distance: '1.3 km',
      location: 'Emergency Red Gate, Metro Health Campus, Springfield',
      services: ['Level-1 Emergency Trauma & Cardiac Arrest Resuscitation', '24x7 Advanced Life Support (ALS) Ambulance Dispatch (108)', 'Emergency Catheterization Lab (Cath Lab)', 'Immediate Blood Transfusion & Burn Unit', 'Direct SOS App Dispatch Link'],
      phone: '+91 800-792-9111 / Toll Free: 108',
      timing: '24x7 Non-Stop Emergency Services',
      emergencyReady: true,
      pmjayEmpanelled: true,
      beds: '60 ICU/Trauma Beds',
      doctorsCount: 20,
      directionsUrl: 'https://maps.google.com/?q=Trauma+Center'
    }
  ],
  notifications: [
    {
      id: 'notif-1',
      patientId: 'pat-1',
      title: 'Upcoming Cardiology Video Visit',
      message: 'Consultation with Dr. Sarah Lin scheduled for Sep 04 at 10:30 AM (Telehealth WebRTC).',
      category: 'appointment',
      time: '1 hour ago',
      read: false
    },
    {
      id: 'notif-2',
      patientId: 'pat-1',
      title: 'Prescription Refill Ready',
      message: 'Your 90-day refill for Lisinopril 10mg is ready for pickup or courier delivery at CVS Pharmacy #4192.',
      category: 'prescription',
      time: 'Yesterday',
      read: false
    },
    {
      id: 'notif-3',
      patientId: 'pat-1',
      title: 'New Diagnostic Lab Available',
      message: 'Comprehensive Metabolic Panel (CMP-14) report uploaded by Metro Health Laboratories.',
      category: 'lab',
      time: '3 days ago',
      read: true
    }
  ],
  messages: [
    {
      id: 'msg-1',
      senderId: 'doc-1',
      senderName: 'Dr. Sarah Lin, MD',
      receiverId: 'pat-1',
      text: 'Hello Alex! I reviewed your 7-day home telemetry logs. Your resting pulse of 72 BPM and blood pressure averaging 118/78 mmHg look excellent. Continue taking Lisinopril 10mg each morning.',
      timestamp: 'Yesterday at 04:15 PM',
      read: true
    },
    {
      id: 'msg-2',
      senderId: 'pat-1',
      senderName: 'Alex Johnson',
      receiverId: 'doc-1',
      text: 'Thank you Dr. Lin! Feeling great. I scheduled our telehealth follow-up for Sep 04. Should I log my fasting glucose before then?',
      timestamp: 'Yesterday at 05:20 PM',
      read: true
    },
    {
      id: 'msg-3',
      senderId: 'doc-1',
      senderName: 'Dr. Sarah Lin, MD',
      receiverId: 'pat-1',
      text: 'Yes please, 2 fasting morning readings before our session will be very helpful. See you on video Friday!',
      timestamp: 'Today at 08:15 AM',
      read: false
    }
  ]
};

// Store Engine Class
class UnifiedStore {
  constructor() {
    this.data = this.loadData();
    this.session = this.loadSession();
  }

  loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Storage read error, using defaults:', e);
    }
    this.saveData(initialSeedData);
    return JSON.parse(JSON.stringify(initialSeedData));
  }

  saveData(dataToSave) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave || this.data));
      window.dispatchEvent(new CustomEvent('swasthya:state_change', { detail: { data: this.data } }));
    } catch (e) {
      console.error('Storage write error:', e);
    }
  }

  loadSession() {
    try {
      const s = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
      if (s) return JSON.parse(s);
    } catch (e) {
      console.warn('Session load error:', e);
    }
    return null;
  }

  setSession(userSession, remember = true) {
    this.session = userSession;
    if (remember) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(userSession));
    } else {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(userSession));
    }
  }

  clearSession() {
    this.session = null;
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }

  getSession() {
    return this.session;
  }

  // Patients
  getPatients() {
    return this.data.patients || [];
  }

  getPatientById(id) {
    return (this.data.patients || []).find(p => p.id === id);
  }

  updatePatient(id, updates) {
    const idx = this.data.patients.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.patients[idx] = { ...this.data.patients[idx], ...updates };
      this.saveData();
      return this.data.patients[idx];
    }
    return null;
  }

  // Doctors
  getDoctors() {
    return this.data.doctors || [];
  }

  getDoctorById(id) {
    return (this.data.doctors || []).find(d => d.id === id);
  }

  // Appointments
  getAppointments(patientId = null, doctorId = null) {
    let list = this.data.appointments || [];
    if (patientId) list = list.filter(a => a.patientId === patientId);
    if (doctorId) list = list.filter(a => a.doctorId === doctorId);
    return list;
  }

  addAppointment(aptData) {
    const newApt = {
      id: 'apt-' + Date.now(),
      created: new Date().toISOString().split('T')[0],
      status: 'confirmed',
      ...aptData
    };
    this.data.appointments.unshift(newApt);
    
    // Add corresponding notification
    this.addNotification({
      patientId: newApt.patientId,
      title: 'Appointment Confirmed',
      message: `Your ${newApt.type} consultation with ${newApt.doctorName} is confirmed for ${newApt.date} at ${newApt.time}.`,
      category: 'appointment'
    });

    this.saveData();
    return newApt;
  }

  updateAppointmentStatus(id, status) {
    const apt = (this.data.appointments || []).find(a => a.id === id);
    if (apt) {
      apt.status = status;
      this.saveData();
      return apt;
    }
    return null;
  }

  // Prescriptions
  getPrescriptions(patientId = null) {
    let list = this.data.prescriptions || [];
    if (patientId) list = list.filter(r => r.patientId === patientId);
    return list;
  }

  addPrescription(rxData) {
    const newRx = {
      id: 'rx-' + Date.now(),
      prescribedDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
      status: 'active',
      pharmacy: 'CVS Pharmacy #4192, Springfield',
      pillsRemaining: rxData.quantity || 90,
      totalPills: rxData.quantity || 90,
      refillsRemaining: rxData.refillsRemaining || 3,
      ...rxData
    };
    this.data.prescriptions.unshift(newRx);

    // Notify patient
    this.addNotification({
      patientId: newRx.patientId,
      title: 'New Prescription Issued',
      message: `Dr. Sarah Lin prescribed ${newRx.medicationName} ${newRx.strength}. Synced with pharmacy.`,
      category: 'prescription'
    });

    this.saveData();
    return newRx;
  }

  requestRefill(prescriptionId) {
    const rx = (this.data.prescriptions || []).find(r => r.id === prescriptionId);
    if (rx) {
      if (rx.refillsRemaining > 0) {
        rx.pillsRemaining = rx.totalPills;
        rx.refillsRemaining -= 1;
        
        this.addNotification({
          patientId: rx.patientId,
          title: 'Refill Transmitted',
          message: `Refill order for ${rx.medicationName} ${rx.strength} processed with CVS Pharmacy.`,
          category: 'prescription'
        });

        this.saveData();
        return { success: true, rx };
      } else {
        return { success: false, message: 'No refills remaining. Doctor re-authorization needed.' };
      }
    }
    return { success: false, message: 'Prescription record not found.' };
  }

  // Lab & Diagnostic Reports
  getLabReports(patientId = null) {
    let list = this.data.labReports || [];
    if (patientId) list = list.filter(l => l.patientId === patientId);
    return list;
  }

  getScans(patientId = null) {
    let list = this.data.scansAndReports || [];
    if (patientId) list = list.filter(s => s.patientId === patientId);
    return list;
  }

  // Notifications
  getNotifications(patientId = null) {
    let list = this.data.notifications || [];
    if (patientId) list = list.filter(n => n.patientId === patientId);
    return list;
  }

  addNotification(notifData) {
    const notif = {
      id: 'notif-' + Date.now(),
      time: 'Just now',
      read: false,
      ...notifData
    };
    if (!this.data.notifications) this.data.notifications = [];
    this.data.notifications.unshift(notif);
    this.saveData();
    return notif;
  }

  markNotificationRead(id) {
    const notif = (this.data.notifications || []).find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveData();
    }
  }

  // Government Healthcare Schemes
  getGovernmentSchemes(category = null, search = '') {
    let list = this.data.governmentSchemes || [];
    if (category && category !== 'All') {
      list = list.filter(s => s.category.toLowerCase() === category.toLowerCase() || (category === 'Maternal & Child Health' && (s.category.includes('Maternal') || s.category.includes('Vaccination'))));
    }
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      list = list.filter(s => 
        s.name.toLowerCase().includes(q) || 
        (s.hindiName && s.hindiName.toLowerCase().includes(q)) || 
        s.shortName.toLowerCase().includes(q) || 
        s.shortDesc.toLowerCase().includes(q) || 
        s.category.toLowerCase().includes(q)
      );
    }
    return list;
  }

  getSchemeById(id) {
    return (this.data.governmentSchemes || []).find(s => s.id === id);
  }

  // Nearby Healthcare Centres
  getNearbyCentres({ filterType = 'All', maxDistanceKm = null, search = '', userCoords = null } = {}) {
    let list = JSON.parse(JSON.stringify(this.data.nearbyCentres || []));

    // Calculate dynamic distance if user coordinates provided
    if (userCoords && userCoords.lat && userCoords.lng) {
      list.forEach(c => {
        const cLat = userCoords.lat + (c.latOffset || 0);
        const cLng = userCoords.lng + (c.lngOffset || 0);
        c.lat = cLat;
        c.lng = cLng;

        const d = this.calculateDistanceKm(userCoords.lat, userCoords.lng, cLat, cLng);
        c.distanceKm = Math.round(d * 10) / 10;
        c.distance = `${c.distanceKm} km`;
      });
    } else {
      // Default reference Springfield coords (lat 17.3850, lng 78.4867)
      const baseLat = 17.3850;
      const baseLng = 78.4867;
      list.forEach(c => {
        c.lat = baseLat + (c.latOffset || 0);
        c.lng = baseLng + (c.lngOffset || 0);
      });
    }

    // Sort ascending by distance
    list.sort((a, b) => a.distanceKm - b.distanceKm);

    // Filter by Facility Type
    if (filterType && filterType !== 'All' && filterType !== 'all') {
      list = list.filter(c => 
        c.category.toLowerCase() === filterType.toLowerCase() || 
        c.type.toLowerCase() === filterType.toLowerCase() ||
        (filterType.toLowerCase().includes('emergency') && c.emergencyReady)
      );
    }

    // Filter by Max Distance
    if (maxDistanceKm && maxDistanceKm > 0) {
      list = list.filter(c => c.distanceKm <= maxDistanceKm);
    }

    // Filter by Search Term
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      list = list.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.type.toLowerCase().includes(q) || 
        c.location.toLowerCase().includes(q) || 
        c.services.some(s => s.toLowerCase().includes(q))
      );
    }

    return list;
  }

  // Haversine Great Circle Distance Formula (km)
  calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  getNearbyCentreById(id) {
    return (this.data.nearbyCentres || []).find(c => c.id === id);
  }

  // Interactive Scheme Eligibility Evaluator
  evaluateSchemeEligibility({ ageGroup, state, location, incomeCategory, specialStatus }) {
    const results = [];
    const schemes = this.getGovernmentSchemes();

    schemes.forEach(scheme => {
      let status = 'Verify'; // 'Eligible', 'Verify', 'Ineligible'
      let reason = '';

      if (scheme.id === 'pmjay') {
        if (ageGroup === 'senior') {
          status = 'Eligible';
          reason = 'Eligible under PM-JAY Vistrit Senior Citizen (70+) universal coverage.';
        } else if (incomeCategory === 'bpl' || incomeCategory === 'secc') {
          status = 'Eligible';
          reason = 'Meets PM-JAY socio-economic deprivation and NFSA/Ration Card criteria.';
        } else if (incomeCategory === 'low') {
          status = 'Verify';
          reason = 'May qualify subject to State-specific expanded ration card rosters.';
        } else {
          status = 'Ineligible';
          reason = 'General income category is typically not covered unless holding valid SECC/NFSA ration card.';
        }
      } else if (scheme.id === 'esanjeevani') {
        status = 'Eligible';
        reason = 'Universal access for all Indian citizens across all States & UTs.';
      } else if (scheme.id === 'nhm') {
        status = 'Eligible';
        reason = 'Free public healthcare, diagnostics, and generic medicines available at all government health centers.';
      } else if (scheme.id === 'indradhanush') {
        if (ageGroup === 'infant' || specialStatus === 'child' || specialStatus === 'pregnant') {
          status = 'Eligible';
          reason = 'Target beneficiary group for universal vaccination (children 0-5 yrs and pregnant mothers).';
        } else {
          status = 'Verify';
          reason = 'Routine vaccination primarily focuses on infants, children, and pregnant women.';
        }
      } else if (scheme.id === 'jsy') {
        if (specialStatus === 'pregnant') {
          if (incomeCategory === 'bpl' || location === 'rural') {
            status = 'Eligible';
            reason = 'Meets institutional delivery cash assistance and JSSK free transport criteria.';
          } else {
            status = 'Verify';
            reason = 'Eligible for JSSK free hospital care; verify direct cash DBT rules for state.';
          }
        } else {
          status = 'Ineligible';
          reason = 'Scheme specifically covers pregnant women for institutional child deliveries.';
        }
      } else if (scheme.id === 'ntep') {
        if (specialStatus === 'tb') {
          status = 'Eligible';
          reason = 'Full entitlement to 100% free molecular diagnostics, DOTS medicines, and ₹500/month Ni-kshay nutritional grant.';
        } else {
          status = 'Eligible';
          reason = 'Universal free diagnostic testing available for any individual with respiratory or fever symptoms.';
        }
      }

      results.push({
        schemeId: scheme.id,
        schemeName: scheme.name,
        category: scheme.category,
        badge: scheme.badge,
        status, // 'Eligible', 'Verify', 'Ineligible'
        reason,
        officialUrl: scheme.officialUrl,
        portalUrl: scheme.portalUrl
      });
    });

    return results;
  }
}

// Global Single Instance
window.PulseCareStore = new UnifiedStore();
window.SwasthyaStore = window.PulseCareStore;
