/**
 * PulseCare OS - Unified Persistent Data Store (js/store.js)
 * Manages patients, doctors, appointments, vitals, prescriptions, lab results, and messages
 */

const STORAGE_KEY = 'pulsecare_os_data_v1';
const SESSION_KEY = 'pulsecare_os_session_v1';

// Initial Mock Seed Data
const initialSeedData = {
  currentUser: null,
  doctors: [
    {
      id: 'doc-1',
      name: 'Dr. Sarah Lin, MD',
      email: 'sarah.lin@pulsecare.health',
      role: 'doctor',
      specialty: 'Cardiology & Internal Medicine',
      department: 'Cardiovascular Care Unit',
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
      email: 'marcus.vance@pulsecare.health',
      role: 'doctor',
      specialty: 'Neurology & Sleep Medicine',
      department: 'Brain & Spine Institute',
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
      email: 'elena.rostova@pulsecare.health',
      role: 'doctor',
      specialty: 'Endocrinology & Diabetes',
      department: 'Metabolic Health Clinic',
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
      phone: '+1 (555) 234-8910',
      address: '742 Evergreen Terrace, Springfield, IL',
      emergencyContact: 'Emma Johnson (Spouse) - +1 (555) 987-6543',
      insurance: 'BlueCross Shield Premier #BCS-994218',
      assignedDoctorId: 'doc-1',
      allergies: ['Penicillin', 'Peanuts'],
      chronicConditions: ['Stage 1 Hypertension (Controlled)', 'Seasonal Rhinitis'],
      vitals: {
        heartRate: 72,
        bloodPressure: '118/78',
        spO2: 99,
        temperature: '98.6 °F',
        glucose: '94 mg/dL',
        weight: '168 lbs',
        bmi: '23.4',
        lastUpdated: 'Just now'
      },
      vitalsHistory: [
        { date: 'Aug 28', hr: 75, bpSys: 122, bpDia: 80, o2: 98 },
        { date: 'Aug 29', hr: 71, bpSys: 120, bpDia: 78, o2: 99 },
        { date: 'Aug 30', hr: 74, bpSys: 119, bpDia: 79, o2: 99 },
        { date: 'Aug 31', hr: 70, bpSys: 117, bpDia: 77, o2: 98 },
        { date: 'Sep 01', hr: 73, bpSys: 118, bpDia: 78, o2: 99 },
        { date: 'Sep 02', hr: 72, bpSys: 118, bpDia: 78, o2: 99 }
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
      phone: '+1 (555) 456-7890',
      address: '120 Ocean View Blvd, San Diego, CA',
      emergencyContact: 'Raj Patel (Father) - +1 (555) 321-7654',
      insurance: 'Aetna Health Gold #AET-887123',
      assignedDoctorId: 'doc-1',
      allergies: ['Sulfa Drugs'],
      chronicConditions: ['Mild Asthma'],
      vitals: {
        heartRate: 78,
        bloodPressure: '114/72',
        spO2: 98,
        temperature: '98.4 °F',
        glucose: '88 mg/dL',
        weight: '132 lbs',
        bmi: '21.5',
        lastUpdated: '2 hours ago'
      },
      vitalsHistory: [
        { date: 'Aug 28', hr: 76, bpSys: 115, bpDia: 72, o2: 98 },
        { date: 'Aug 30', hr: 78, bpSys: 114, bpDia: 72, o2: 98 }
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
      phone: '+1 (555) 789-0123',
      address: '450 Pine Forest Rd, Denver, CO',
      emergencyContact: 'Clara Miller (Wife) - +1 (555) 654-9870',
      insurance: 'Medicare Plus Advantage #MED-541290',
      assignedDoctorId: 'doc-1',
      allergies: ['Latex'],
      chronicConditions: ['Type 2 Diabetes', 'Coronary Artery Disease'],
      vitals: {
        heartRate: 84,
        bloodPressure: '136/88',
        spO2: 96,
        temperature: '98.9 °F',
        glucose: '142 mg/dL',
        weight: '195 lbs',
        bmi: '28.1',
        lastUpdated: '1 hour ago'
      },
      vitalsHistory: [
        { date: 'Aug 28', hr: 86, bpSys: 138, bpDia: 90, o2: 96 },
        { date: 'Sep 02', hr: 84, bpSys: 136, bpDia: 88, o2: 96 }
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
      doctorSpecialty: 'Cardiology',
      date: '2026-09-04',
      time: '10:30 AM',
      type: 'Telehealth Video',
      reason: 'Hypertension 6-Month Review & Medication Evaluation',
      status: 'confirmed', // confirmed, waiting, in-consultation, completed, cancelled
      notes: 'Patient reports steady morning readings (118/78). No dizziness reported.',
      created: '2026-08-30'
    },
    {
      id: 'apt-102',
      patientId: 'pat-1',
      patientName: 'Alex Johnson',
      doctorId: 'doc-3',
      doctorName: 'Dr. Elena Rostova, MD',
      doctorSpecialty: 'Endocrinology',
      date: '2026-09-18',
      time: '02:00 PM',
      type: 'In-Clinic Consultation',
      reason: 'Routine Annual Metabolic Health & Lipid Profile Review',
      status: 'confirmed',
      notes: 'Fasting lipid blood test required 2 days prior.',
      created: '2026-09-01'
    },
    {
      id: 'apt-103',
      patientId: 'pat-2',
      patientName: 'Sophia Patel',
      doctorId: 'doc-1',
      doctorName: 'Dr. Sarah Lin, MD',
      doctorSpecialty: 'Cardiology',
      date: '2026-09-03',
      time: '09:00 AM',
      type: 'In-Clinic Consultation',
      reason: 'Palpitation assessment after light cardio exercise',
      status: 'waiting',
      notes: 'Holter monitor report attached.',
      created: '2026-08-31'
    },
    {
      id: 'apt-104',
      patientId: 'pat-3',
      patientName: 'Robert Miller',
      doctorId: 'doc-1',
      doctorName: 'Dr. Sarah Lin, MD',
      doctorSpecialty: 'Cardiology',
      date: '2026-09-03',
      time: '11:15 AM',
      type: 'Telehealth Video',
      reason: 'Post-CABG Follow-up & Glucose Management',
      status: 'confirmed',
      notes: 'Review HbA1c lab result and titration of Atorvastatin.',
      created: '2026-09-01'
    }
  ],
  prescriptions: [
    {
      id: 'rx-201',
      patientId: 'pat-1',
      doctorId: 'doc-1',
      doctorName: 'Dr. Sarah Lin, MD',
      medicationName: 'Lisinopril',
      strength: '10 mg',
      dosage: '1 tablet once daily in morning',
      purpose: 'Blood Pressure Management',
      quantity: 90,
      refillsRemaining: 3,
      pillsRemaining: 68,
      totalPills: 90,
      prescribedDate: '2026-07-15',
      expiryDate: '2027-07-15',
      pharmacy: 'CVS Pharmacy #4192, Springfield',
      status: 'active'
    },
    {
      id: 'rx-202',
      patientId: 'pat-1',
      doctorId: 'doc-1',
      doctorName: 'Dr. Sarah Lin, MD',
      medicationName: 'CoQ10 Ubiquinol High Absorption',
      strength: '200 mg',
      dosage: '1 softgel daily with meal',
      purpose: 'Cardiovascular Cellular Support',
      quantity: 60,
      refillsRemaining: 2,
      pillsRemaining: 18,
      totalPills: 60,
      prescribedDate: '2026-08-01',
      expiryDate: '2027-08-01',
      pharmacy: 'CVS Pharmacy #4192, Springfield',
      status: 'active'
    },
    {
      id: 'rx-203',
      patientId: 'pat-1',
      doctorId: 'doc-1',
      doctorName: 'Dr. Sarah Lin, MD',
      medicationName: 'Atorvastatin Calcium',
      strength: '20 mg',
      dosage: '1 tablet at bedtime',
      purpose: 'Cholesterol & Lipid Control',
      quantity: 90,
      refillsRemaining: 4,
      pillsRemaining: 82,
      totalPills: 90,
      prescribedDate: '2026-08-10',
      expiryDate: '2027-08-10',
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
      testName: 'Comprehensive Metabolic Panel (CMP)',
      category: 'Blood Chemistry',
      date: '2026-08-20',
      status: 'Normal',
      labFacility: 'Quest Diagnostics Regional Lab',
      summary: 'Kidney & liver enzyme biomarkers within optimal baseline range (eGFR >90, AST 22 U/L, ALT 24 U/L).',
      fileUrl: '#mock-cmp-report'
    },
    {
      id: 'lab-302',
      patientId: 'pat-1',
      doctorId: 'doc-1',
      doctorName: 'Dr. Sarah Lin, MD',
      testName: 'Lipid Panel + Cardio CRP',
      category: 'Cardiovascular Biomarkers',
      date: '2026-08-20',
      status: 'Optimal',
      labFacility: 'Quest Diagnostics Regional Lab',
      summary: 'Total Cholesterol: 168 mg/dL | HDL: 56 mg/dL | LDL: 94 mg/dL | Triglycerides: 90 mg/dL | hs-CRP: 0.8 mg/L.',
      fileUrl: '#mock-lipid-report'
    },
    {
      id: 'lab-303',
      patientId: 'pat-1',
      doctorId: 'doc-1',
      doctorName: 'Dr. Sarah Lin, MD',
      testName: '12-Lead Electrocardiogram (ECG)',
      category: 'Cardiac Diagnostics',
      date: '2026-07-15',
      status: 'Normal Sinus Rhythm',
      labFacility: 'Metro Health Academic Cardiology Lab',
      summary: 'Normal sinus rhythm at 72 bpm. PR interval 142ms, QRS 88ms, QTc 410ms. No ischemic ST-T changes noted.',
      fileUrl: '#mock-ecg-report'
    }
  ],
  clinicalNotes: [
    {
      id: 'note-401',
      patientId: 'pat-1',
      doctorId: 'doc-1',
      doctorName: 'Dr. Sarah Lin, MD',
      date: '2026-07-15',
      subject: 'Hypertension Follow-Up & Lifestyle Counseling',
      soapNote: {
        subjective: '34yo male presenting for routine BP monitoring. Tolerating Lisinopril 10mg without dry cough or orthostasis. Exercising 4x/week (jogging/cycling).',
        objective: 'Vitals: BP 118/78 mmHg, HR 72 bpm, BMI 23.4. Heart sounds regular S1/S2, no murmurs. Lungs clear to auscultation.',
        assessment: 'Primary hypertension, excellently controlled under current low-dose ACE inhibitor regimen.',
        plan: 'Continue Lisinopril 10mg daily. Repeat routine lipid panel in 1 month. Telehealth follow-up scheduled in 6-8 weeks.'
      }
    }
  ],
  messages: [
    {
      id: 'msg-501',
      senderId: 'pat-1',
      senderName: 'Alex Johnson',
      senderRole: 'patient',
      recipientId: 'doc-1',
      recipientName: 'Dr. Sarah Lin, MD',
      text: 'Good morning Dr. Lin! My home BP readings have consistently stayed around 118/78 for the last two weeks. Should I continue the same morning schedule for Lisinopril?',
      timestamp: '2026-09-02 08:30 AM',
      read: true
    },
    {
      id: 'msg-502',
      senderId: 'doc-1',
      senderName: 'Dr. Sarah Lin, MD',
      senderRole: 'doctor',
      recipientId: 'pat-1',
      recipientName: 'Alex Johnson',
      text: 'Excellent news, Alex! That is right in our target zone. Continue taking it at 8:00 AM with a glass of water. Looking forward to our video consultation on Friday!',
      timestamp: '2026-09-02 09:15 AM',
      read: true
    }
  ]
};

// Data Store Class
class PulseCareStore {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load storage, using seed data:', e);
    }
    this.saveData(initialSeedData);
    return JSON.parse(JSON.stringify(initialSeedData));
  }

  saveData(data = this.data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('pulsecare:state_change', { detail: { data } }));
    } catch (e) {
      console.error('Storage write error:', e);
    }
  }

  // Session & Auth
  getCurrentSession() {
    try {
      const session = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
      return session ? JSON.parse(session) : null;
    } catch (e) {
      return null;
    }
  }

  setSession(user, remember = false) {
    const sessionData = JSON.stringify(user);
    if (remember) {
      localStorage.setItem(SESSION_KEY, sessionData);
    } else {
      sessionStorage.setItem(SESSION_KEY, sessionData);
    }
  }

  clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  }

  // Getters
  getDoctors() {
    return this.data.doctors || [];
  }

  getDoctorById(id) {
    return this.data.doctors.find(d => d.id === id);
  }

  getPatients() {
    return this.data.patients || [];
  }

  getPatientById(id) {
    return this.data.patients.find(p => p.id === id);
  }

  getAppointments(filter = {}) {
    let apts = [...(this.data.appointments || [])];
    if (filter.patientId) apts = apts.filter(a => a.patientId === filter.patientId);
    if (filter.doctorId) apts = apts.filter(a => a.doctorId === filter.doctorId);
    if (filter.status) apts = apts.filter(a => a.status === filter.status);
    return apts;
  }

  getPrescriptions(patientId) {
    let rxs = [...(this.data.prescriptions || [])];
    if (patientId) rxs = rxs.filter(r => r.patientId === patientId);
    return rxs;
  }

  getLabReports(patientId) {
    let labs = [...(this.data.labReports || [])];
    if (patientId) labs = labs.filter(l => l.patientId === patientId);
    return labs;
  }

  getClinicalNotes(patientId) {
    let notes = [...(this.data.clinicalNotes || [])];
    if (patientId) notes = notes.filter(n => n.patientId === patientId);
    return notes;
  }

  getMessages(userId1, userId2) {
    return (this.data.messages || []).filter(
      m => (m.senderId === userId1 && m.recipientId === userId2) ||
           (m.senderId === userId2 && m.recipientId === userId1)
    );
  }

  // Actions
  addAppointment(aptData) {
    const newApt = {
      id: 'apt-' + Date.now(),
      created: new Date().toISOString().split('T')[0],
      status: 'confirmed',
      ...aptData
    };
    this.data.appointments.unshift(newApt);
    this.saveData();
    return newApt;
  }

  updateAppointmentStatus(aptId, status) {
    const apt = this.data.appointments.find(a => a.id === aptId);
    if (apt) {
      apt.status = status;
      this.saveData();
      return apt;
    }
    return null;
  }

  addPrescription(rxData) {
    const newRx = {
      id: 'rx-' + Date.now(),
      prescribedDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
      status: 'active',
      ...rxData
    };
    this.data.prescriptions.unshift(newRx);
    this.saveData();
    return newRx;
  }

  refillPrescription(rxId) {
    const rx = this.data.prescriptions.find(r => r.id === rxId);
    if (rx && rx.refillsRemaining > 0) {
      rx.refillsRemaining -= 1;
      rx.pillsRemaining = rx.totalPills;
      this.saveData();
      return rx;
    }
    return null;
  }

  addClinicalNote(noteData) {
    const newNote = {
      id: 'note-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      ...noteData
    };
    this.data.clinicalNotes.unshift(newNote);
    this.saveData();
    return newNote;
  }

  addMessage(msgData) {
    const date = new Date();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = date.toISOString().split('T')[0];
    const newMsg = {
      id: 'msg-' + Date.now(),
      timestamp: `${dateStr} ${timeStr}`,
      read: false,
      ...msgData
    };
    this.data.messages.push(newMsg);
    this.saveData();
    return newMsg;
  }

  updatePatientVitals(patientId, vitalsUpdate) {
    const patient = this.data.patients.find(p => p.id === patientId);
    if (patient) {
      patient.vitals = { ...patient.vitals, ...vitalsUpdate, lastUpdated: 'Just now' };
      this.saveData();
      return patient;
    }
    return null;
  }

  resetToDefault() {
    this.data = JSON.parse(JSON.stringify(initialSeedData));
    this.saveData();
  }
}

// Global instance
window.PulseCareStore = new PulseCareStore();
