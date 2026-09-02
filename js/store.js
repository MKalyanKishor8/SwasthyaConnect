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

  // Messages
  getMessages(patientId, doctorId) {
    return (this.data.messages || []).filter(
      m => (m.senderId === patientId && m.receiverId === doctorId) ||
           (m.senderId === doctorId && m.receiverId === patientId)
    );
  }

  sendMessage(senderId, senderName, receiverId, text) {
    const newMsg = {
      id: 'msg-' + Date.now(),
      senderId,
      senderName,
      receiverId,
      text,
      timestamp: 'Just now',
      read: false
    };
    this.data.messages.push(newMsg);
    this.saveData();
    return newMsg;
  }
}

// Global Single Instance
window.PulseCareStore = new UnifiedStore();
window.SwasthyaStore = window.PulseCareStore;
