/**
 * SwasthyaConnect - Comprehensive Patient Portal Controller (js/patient.js)
 */

let currentPatient = null;

document.addEventListener('DOMContentLoaded', () => {
  // Ensure authenticated session
  const session = PulseCareStore.getSession();
  if (!session || session.role !== 'patient') {
    const pat = PulseCareStore.getPatientById('pat-1') || PulseCareStore.getPatients()[0];
    PulseCareStore.setSession({
      id: pat.id,
      name: pat.name,
      email: pat.email,
      role: 'patient',
      bloodType: pat.bloodType,
      mrn: pat.mrn
    }, true);
  }

  const activeSession = PulseCareStore.getSession();
  currentPatient = PulseCareStore.getPatientById(activeSession?.id || 'pat-1') || PulseCareStore.getPatients()[0];

  initNavigation();
  initNotificationCenter();
  renderPatientData();
  renderAppointments();
  renderPrescriptions();
  renderMedicalRecords();
  renderScans();
  renderTelehealthHistory();
  renderChat();
  initBookingWizard();
  initChatForm();

  // Listen to cross-portal state changes
  window.addEventListener('swasthya:state_change', () => {
    currentPatient = PulseCareStore.getPatientById(currentPatient.id) || PulseCareStore.getPatients()[0];
    renderPatientData();
    renderAppointments();
    renderPrescriptions();
    renderMedicalRecords();
    renderScans();
    renderTelehealthHistory();
  });
});

// Tab Navigation
function initNavigation() {
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link[data-tab]');
  const pageTitle = document.getElementById('current-page-title');

  const titles = {
    overview: 'Patient Health Dashboard',
    profile: 'Patient Demographics & Profile',
    vitals: 'Biometric Vitals & Live Telemetry',
    appointments: 'Consultations & Scheduling',
    records: 'Electronic Medical Records (EHR)',
    prescriptions: 'Active Medications & Refills',
    telehealth: 'Encrypted Telehealth Virtual Consultations',
    emergency: 'Emergency Information & Rapid Response',
    messages: 'Care Team Encrypted Chat'
  };

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = link.getAttribute('data-tab');
      switchTab(tab);
    });
  });

  const hash = window.location.hash.replace('#', '');
  if (hash && titles[hash]) {
    switchTab(hash);
  }
}

function switchTab(tabId) {
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link[data-tab]');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const pageTitle = document.getElementById('current-page-title');

  const titles = {
    overview: 'Patient Health Dashboard',
    profile: 'Patient Demographics & Profile',
    vitals: 'Biometric Vitals & Live Telemetry',
    appointments: 'Consultations & Scheduling',
    records: 'Electronic Medical Records (EHR)',
    prescriptions: 'Active Medications & Refills',
    telehealth: 'Encrypted Telehealth Virtual Consultations',
    emergency: 'Emergency Information & Rapid Response',
    messages: 'Care Team Encrypted Chat'
  };

  navLinks.forEach(l => {
    if (l.getAttribute('data-tab') === tabId) {
      l.classList.add('active');
    } else {
      l.classList.remove('active');
    }
  });

  tabPanels.forEach(p => {
    if (p.id === `tab-${tabId}`) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });

  if (pageTitle && titles[tabId]) {
    pageTitle.textContent = titles[tabId];
  }

  window.location.hash = tabId;
  const sidebar = document.querySelector('.portal-sidebar');
  if (sidebar && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
  }
}

// Render Patient Profile & Dashboard Data
function renderPatientData() {
  if (!currentPatient) return;

  // Header & sidebar names
  document.querySelectorAll('.patient-name').forEach(el => el.textContent = currentPatient.name);
  const initials = currentPatient.name.split(' ').map(n => n[0]).join('');
  document.querySelectorAll('.patient-avatar-initials').forEach(el => el.textContent = initials);

  // MRN & Blood Group
  const mrn = currentPatient.mrn || 'MRN-2026-9082';
  const mrnEl = document.getElementById('sidebar-mrn');
  if (mrnEl) mrnEl.textContent = mrn;
  const profMrn = document.getElementById('prof-mrn');
  if (profMrn) profMrn.textContent = mrn;
  const mrnBadge = document.getElementById('pat-mrn-badge');
  if (mrnBadge) mrnBadge.textContent = mrn;

  const bloodEl = document.getElementById('pat-blood-type');
  if (bloodEl) bloodEl.textContent = currentPatient.bloodType || 'O+';
  const profBlood = document.getElementById('prof-blood');
  if (profBlood) profBlood.textContent = currentPatient.bloodType || 'O+';

  // Age & Gender
  const ageGenderEl = document.getElementById('pat-age-gender');
  if (ageGenderEl) ageGenderEl.textContent = `${currentPatient.age} yrs • ${currentPatient.gender}`;
  const profAge = document.getElementById('prof-age');
  if (profAge) profAge.textContent = `${currentPatient.age} years`;
  const profGender = document.getElementById('prof-gender');
  if (profGender) profGender.textContent = currentPatient.gender;
  const profDob = document.getElementById('prof-dob');
  if (profDob) profDob.textContent = currentPatient.dob || '1992-04-15';

  // Contact Info
  const profPhone = document.getElementById('prof-phone');
  if (profPhone) profPhone.textContent = currentPatient.phone;
  const profEmail = document.getElementById('prof-email');
  if (profEmail) profEmail.textContent = currentPatient.email;
  const profAddress = document.getElementById('prof-address');
  if (profAddress) profAddress.textContent = currentPatient.address;

  // Insurance
  const profInsurance = document.getElementById('prof-insurance');
  if (profInsurance) {
    profInsurance.textContent = typeof currentPatient.insurance === 'object' ? currentPatient.insurance.provider : currentPatient.insurance;
  }

  // Health Status
  const healthStatusEl = document.getElementById('dash-health-status');
  if (healthStatusEl && currentPatient.healthStatus) {
    healthStatusEl.innerHTML = `Current Health Status: <strong style="color:var(--hospital-healing-green);">${currentPatient.healthStatus}</strong>`;
  }

  // Vitals
  const vit = currentPatient.vitals || {};
  const hrEl = document.getElementById('ov-heart-rate');
  if (hrEl) hrEl.textContent = vit.heartRate || 72;
  const vitHr = document.getElementById('vit-hr-val');
  if (vitHr) vitHr.textContent = vit.heartRate || 72;

  const bpEl = document.getElementById('ov-bp');
  if (bpEl) bpEl.textContent = vit.bloodPressure || '118/78';
  const vitBp = document.getElementById('vit-bp-val');
  if (vitBp) vitBp.textContent = vit.bloodPressure || '118/78';

  const tempEl = document.getElementById('ov-temp');
  if (tempEl) tempEl.textContent = vit.temperature ? vit.temperature.split(' ')[0] : '98.6';
  const vitTemp = document.getElementById('vit-temp-val');
  if (vitTemp) vitTemp.textContent = vit.temperature || '98.6 °F';

  const o2El = document.getElementById('ov-spo2');
  if (o2El) o2El.textContent = vit.spO2 || 99;
  const vitO2 = document.getElementById('vit-spo2-val');
  if (vitO2) vitO2.textContent = vit.spO2 || 99;

  const vitRr = document.getElementById('vit-rr-val');
  if (vitRr) vitRr.textContent = vit.respiratoryRate ? vit.respiratoryRate.split(' ')[0] : '16';

  const vitWeight = document.getElementById('vit-weight-val');
  if (vitWeight) vitWeight.textContent = vit.weight ? vit.weight.split(' ')[0] : '168';

  // Render SVG Sparkline
  renderSparkline(currentPatient.vitalsHistory || []);
}

// 7-Day Vitals Sparkline
function renderSparkline(history) {
  const container = document.getElementById('vitals-sparkline');
  if (!container || !history.length) return;

  const width = 600;
  const height = 150;
  const padding = 25;

  const dates = history.map(h => h.date);
  const hrs = history.map(h => h.hr);
  const minHr = Math.min(...hrs) - 5;
  const maxHr = Math.max(...hrs) + 5;

  const points = hrs.map((hr, idx) => {
    const x = padding + (idx / (hrs.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((hr - minHr) / (maxHr - minHr)) * (height - 2 * padding);
    return { x, y, hr, date: dates[idx] };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const dotsSvg = points.map(p => `
    <circle cx="${p.x}" cy="${p.y}" r="4.5" fill="#0d9488" stroke="#ffffff" stroke-width="2" />
    <text x="${p.x}" y="${p.y - 10}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--text-primary)">${p.hr} bpm</text>
    <text x="${p.x}" y="${height - 5}" text-anchor="middle" font-size="10" fill="var(--text-muted)">${p.date}</text>
  `).join('');

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" style="width:100%; height:auto; overflow:visible;">
      <defs>
        <linearGradient id="sparkline-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0d9488" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#0d9488" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      <path d="${pathD} L ${points[points.length-1].x} ${height - padding} L ${points[0].x} ${height - padding} Z" fill="url(#sparkline-grad)"/>
      <path d="${pathD}" fill="none" stroke="#0d9488" stroke-width="3" stroke-linecap="round"/>
      ${dotsSvg}
    </svg>
  `;
}

// Render Appointments (Upcoming vs Past)
function renderAppointments() {
  const allApts = PulseCareStore.getAppointments(currentPatient.id);
  const upcomingContainer = document.getElementById('appointments-upcoming-list');
  const pastContainer = document.getElementById('appointments-past-list');
  const ovContainer = document.getElementById('ov-appointments-list');

  const upcoming = allApts.filter(a => a.status !== 'completed' && a.status !== 'cancelled');
  const past = allApts.filter(a => a.status === 'completed');

  // Overview quick view
  if (ovContainer) {
    if (upcoming.length === 0) {
      ovContainer.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">No upcoming appointments scheduled.</p>`;
    } else {
      ovContainer.innerHTML = upcoming.slice(0, 2).map(apt => createAppointmentItemHTML(apt)).join('');
    }
  }

  // Full Upcoming list
  if (upcomingContainer) {
    if (upcoming.length === 0) {
      upcomingContainer.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">No upcoming appointments. Click "Book New Appointment" to schedule.</p>`;
    } else {
      upcomingContainer.innerHTML = upcoming.map(apt => createAppointmentItemHTML(apt, true)).join('');
    }
  }

  // Full Past list
  if (pastContainer) {
    if (past.length === 0) {
      pastContainer.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">No past appointment records found.</p>`;
    } else {
      pastContainer.innerHTML = past.map(apt => createPastAppointmentHTML(apt)).join('');
    }
  }
}

function createAppointmentItemHTML(apt, full = false) {
  const dateObj = new Date(apt.date + 'T00:00:00');
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = monthNames[dateObj.getMonth()] || 'SEP';
  const day = dateObj.getDate() || '04';

  const isTelehealth = apt.type.toLowerCase().includes('telehealth') || apt.type.toLowerCase().includes('video');
  const isReadyForCall = isTelehealth && (apt.status === 'confirmed' || apt.status === 'in-consultation');

  return `
    <div class="appointment-item">
      <div class="appointment-meta">
        <div class="appointment-time-box">
          <span class="day">${day}</span>
          <span class="month">${month}</span>
        </div>
        <div class="appointment-info">
          <h4>${apt.reason}</h4>
          <p><strong>${apt.doctorName}</strong> &bull; ${apt.doctorSpecialty || 'Specialist'}</p>
          <p style="font-size:0.775rem; color:var(--text-muted); margin-top:2px;">
            ${apt.time} &bull; <span class="badge ${isTelehealth ? 'badge-purple' : 'badge-emerald'}" style="padding:0.1rem 0.4rem;">${apt.type}</span>
            ${apt.doctorRoom ? `&bull; ${apt.doctorRoom}` : ''}
          </p>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:0.5rem;">
        <span class="badge ${apt.status === 'waiting' ? 'badge-amber' : 'badge-emerald'}">${apt.status}</span>
        ${isReadyForCall ? `
          <button class="btn btn-sm btn-emerald" onclick="joinTelehealthRoom('${apt.id}')">
            <svg class="icon" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            <span>Join Video</span>
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

function createPastAppointmentHTML(apt) {
  return `
    <div class="appointment-item" style="opacity:0.9;">
      <div class="appointment-meta">
        <div class="appointment-time-box" style="background:var(--bg-hover); color:var(--text-primary);">
          <span class="day">${apt.date.split('-')[2]}</span>
          <span class="month">${apt.date.split('-')[1]}</span>
        </div>
        <div class="appointment-info">
          <h4>${apt.reason}</h4>
          <p><strong>${apt.doctorName}</strong> &bull; ${apt.doctorSpecialty || 'Specialist'}</p>
          <p style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">
            Encounter Note: <em>"${apt.notes || 'Consultation concluded successfully.'}"</em>
          </p>
        </div>
      </div>
      <div>
        <span class="badge badge-purple">Completed</span>
      </div>
    </div>
  `;
}

// Render Prescriptions
function renderPrescriptions() {
  const rxs = PulseCareStore.getPrescriptions(currentPatient.id);
  const fullContainer = document.getElementById('prescriptions-list');
  const ovContainer = document.getElementById('ov-prescriptions-list');

  if (ovContainer) {
    ovContainer.innerHTML = rxs.slice(0, 2).map(rx => `
      <div class="glass-panel" style="padding:1rem; margin-bottom:0.75rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
          <strong style="font-size:1rem;">${rx.medicationName} ${rx.strength}</strong>
          <span class="badge badge-emerald">Active</span>
        </div>
        <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.5rem;">${rx.dosage}</p>
        <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted);">
          <span>${rx.pillsRemaining} of ${rx.totalPills} remaining</span>
          <span>${rx.refillsRemaining} refills left</span>
        </div>
      </div>
    `).join('');
  }

  if (fullContainer) {
    if (rxs.length === 0) {
      fullContainer.innerHTML = `<p style="color:var(--text-muted);">No active prescriptions found.</p>`;
      return;
    }

    fullContainer.innerHTML = rxs.map(rx => {
      const pct = Math.round((rx.pillsRemaining / rx.totalPills) * 100);
      return `
        <div class="rx-card">
          <div class="rx-badge-top">
            <span class="badge badge-emerald">Active Rx</span>
            <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted);">Rx #${rx.id}</span>
          </div>

          <div>
            <h4 class="rx-name">${rx.medicationName} <span style="font-size:0.95rem; color:var(--hospital-teal-600);">${rx.strength}</span></h4>
            <p class="rx-dosage">${rx.dosage}</p>
            <p style="font-size:0.775rem; color:var(--text-muted); margin-top:4px;">
              <strong>Indication:</strong> ${rx.purpose} &bull; <strong>Prescribed by:</strong> ${rx.doctorName}
            </p>
            <p style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
              <strong>Pharmacy:</strong> ${rx.pharmacy || 'CVS Pharmacy #4192'}
            </p>
          </div>

          <div>
            <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;">
              <span>Supply: <strong>${rx.pillsRemaining}</strong> / ${rx.totalPills} units</span>
              <span><strong>${rx.refillsRemaining}</strong> Refills Left</span>
            </div>
            <div class="rx-progress-bar">
              <div class="rx-progress-fill" style="width: ${pct}%;"></div>
            </div>
          </div>

          <div style="margin-top:auto; pt:0.5rem;">
            <button class="btn btn-sm btn-primary" style="width:100%;" onclick="handleRefillRequest('${rx.id}')">
              <svg class="icon" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              <span>1-Click Refill Request</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
}

function handleRefillRequest(rxId) {
  const res = PulseCareStore.requestRefill(rxId);
  if (res.success) {
    PulseCareUI.showToast('Refill Authorized', `Refill order for ${res.rx.medicationName} transmitted to pharmacy network!`, 'success');
    renderPrescriptions();
  } else {
    PulseCareUI.showToast('Refill Failed', res.message, 'error');
  }
}

// Render Medical Records (Allergies, Diagnoses, History, Labs)
function renderMedicalRecords() {
  if (!currentPatient) return;

  // Allergies
  const allergyContainer = document.getElementById('allergies-container');
  if (allergyContainer && currentPatient.allergies) {
    allergyContainer.innerHTML = `
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:1rem;">
        ${currentPatient.allergies.map(al => `
          <div class="glass-panel" style="padding:1rem; border-left:3px solid var(--hospital-cross-red);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
              <strong style="color:var(--hospital-cross-red); font-size:1rem;">${al.allergen}</strong>
              <span class="badge badge-danger">${al.severity}</span>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted);">Reaction: ${al.reaction}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Previous Diagnoses
  const diagnosesContainer = document.getElementById('diagnoses-container');
  if (diagnosesContainer && currentPatient.previousDiagnoses) {
    diagnosesContainer.innerHTML = currentPatient.previousDiagnoses.map(d => `
      <div style="padding:0.75rem 0; border-bottom:1px solid var(--border-light);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong>${d.name}</strong>
          <span class="badge badge-primary">${d.code}</span>
        </div>
        <p style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">
          Diagnosed: ${d.date} by ${d.doctor} ${d.status ? `(${d.status})` : ''}
        </p>
      </div>
    `).join('');
  }

  // Medical History
  const historyContainer = document.getElementById('history-container');
  if (historyContainer && currentPatient.medicalHistory) {
    historyContainer.innerHTML = currentPatient.medicalHistory.map(h => `
      <div style="padding:0.75rem 0; border-bottom:1px solid var(--border-light);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong>${h.event}</strong>
          <span class="badge badge-purple">${h.year}</span>
        </div>
        <p style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">
          Facility: ${h.facility} &bull; Outcome: ${h.outcome}
        </p>
      </div>
    `).join('');
  }

  // Diagnostic Labs
  const labs = PulseCareStore.getLabReports(currentPatient.id);
  const labContainer = document.getElementById('lab-reports-list');
  if (labContainer) {
    if (labs.length === 0) {
      labContainer.innerHTML = `<p style="color:var(--text-muted);">No lab reports uploaded.</p>`;
    } else {
      labContainer.innerHTML = labs.map(lab => `
        <div class="appointment-item">
          <div class="appointment-meta">
            <div class="appointment-time-box" style="background:var(--hospital-healing-green);">
              <span class="day">LAB</span>
              <span class="month">REP</span>
            </div>
            <div class="appointment-info">
              <h4>${lab.title}</h4>
              <p><strong>${lab.facility}</strong> &bull; Authenticated: ${lab.date}</p>
              <p style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">
                ${lab.summary}
              </p>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span class="badge badge-emerald">${lab.status}</span>
            <button class="btn btn-sm btn-outline" onclick="openLabModal('${lab.id}')">
              <svg class="icon" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <span>View Full Report</span>
            </button>
          </div>
        </div>
      `).join('');
    }
  }
}

// Render Scans and Imaging Records
function renderScans() {
  const scans = PulseCareStore.getScans(currentPatient.id);
  const scanContainer = document.getElementById('scans-list');
  if (!scanContainer) return;

  if (scans.length === 0) {
    scanContainer.innerHTML = `<p style="color:var(--text-muted);">No imaging scan records archived.</p>`;
  } else {
    scanContainer.innerHTML = scans.map(sc => `
      <div class="appointment-item">
        <div class="appointment-meta">
          <div class="appointment-time-box" style="background:var(--hospital-blue);">
            <span class="day">SCAN</span>
            <span class="month">IMG</span>
          </div>
          <div class="appointment-info">
            <h4>${sc.title}</h4>
            <p><strong>${sc.modality}</strong> &bull; Date: ${sc.date}</p>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">
              Radiologist: ${sc.radiologist} &bull; Impression: <em>"${sc.impression}"</em>
            </p>
          </div>
        </div>
        <div>
          <span class="badge badge-primary">${sc.status}</span>
        </div>
      </div>
    `).join('');
  }
}

// Telehealth History
function renderTelehealthHistory() {
  const container = document.getElementById('telehealth-history-container');
  if (!container) return;

  const prevApts = PulseCareStore.getAppointments(currentPatient.id).filter(a => a.type.toLowerCase().includes('telehealth') && a.status === 'completed');

  if (prevApts.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">No completed video consultation archives yet.</p>`;
  } else {
    container.innerHTML = prevApts.map(apt => `
      <div class="appointment-item">
        <div class="appointment-meta">
          <div class="appointment-time-box" style="background:var(--primary-gradient);">
            <span class="day">HD</span>
            <span class="month">VIDEO</span>
          </div>
          <div class="appointment-info">
            <h4>${apt.reason}</h4>
            <p><strong>${apt.doctorName}</strong> &bull; Completed on ${apt.date}</p>
            <p style="font-size:0.8rem; color:var(--text-muted);">Summary: ${apt.notes}</p>
          </div>
        </div>
        <span class="badge badge-purple">Archived</span>
      </div>
    `).join('');
  }
}

// Interactive Telehealth WebRTC Room Simulator
window.joinTelehealthRoom = function(aptId) {
  const apt = PulseCareStore.getAppointments().find(a => a.id === aptId) || PulseCareStore.getAppointments()[0];
  const modalBody = document.getElementById('telehealth-modal-body');

  modalBody.innerHTML = `
    <div style="background:#000000; border-radius:var(--radius-md); overflow:hidden; position:relative; aspect-ratio:16/9; display:flex; align-items:center; justify-content:center; margin-bottom:1rem;">
      <div style="text-align:center; color:#ffffff;">
        <div class="user-avatar" style="width:80px; height:80px; font-size:2rem; margin:0 auto 1rem; background:var(--primary-gradient);">SL</div>
        <h3 style="color:#ffffff; font-size:1.3rem;">Dr. Sarah Lin, MD (Cardiologist)</h3>
        <p style="color:#10b981; font-size:0.9rem;">● Encrypted WebRTC HD Stream Live (1080p 60fps)</p>
        <p style="font-size:0.8rem; color:#94a3b8; margin-top:4px;">Encounter: ${apt ? apt.reason : 'Cardiology Consultation'}</p>
      </div>

      <!-- Self PIP feed -->
      <div style="position:absolute; bottom:16px; right:16px; width:140px; aspect-ratio:4/3; background:#1e293b; border:2px solid #0d9488; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#ffffff; font-size:0.75rem;">
        <span>Self (Patient)</span>
      </div>
    </div>

    <!-- Call Control Bar -->
    <div style="display:flex; justify-content:center; gap:1rem; padding:0.5rem 0;">
      <button class="btn btn-secondary btn-icon" title="Toggle Microphone" onclick="PulseCareUI.showToast('Microphone', 'Audio unmuted', 'info')">
        <svg class="icon" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
      </button>
      <button class="btn btn-secondary btn-icon" title="Toggle Camera" onclick="PulseCareUI.showToast('Camera', 'HD Camera stream active', 'info')">
        <svg class="icon" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
      </button>
      <button class="btn btn-secondary btn-icon" title="Share Screen" onclick="PulseCareUI.showToast('Screen Share', 'Sharing vitals telemetry monitor...', 'info')">
        <svg class="icon" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
      </button>
      <button class="btn btn-danger" onclick="PulseCareUI.closeModal('telehealth-modal'); PulseCareUI.showToast('Call Ended', 'Telehealth consultation session saved to health chart.', 'info')">
        <svg class="icon" viewBox="0 0 24 24"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/></svg>
        <span>End Call</span>
      </button>
    </div>
  `;

  PulseCareUI.openModal('telehealth-modal');
};

// Emergency SOS Trigger
window.triggerEmergencySOS = function() {
  PulseCareUI.openModal('emergency-sos-modal');
  PulseCareUI.showToast('Emergency SOS Broadcast', 'Ambulance & Emergency Room team alerted with your live GPS location.', 'error');
};

// Lab Modal Detail View
window.openLabModal = function(labId) {
  const lab = PulseCareStore.getLabReports().find(l => l.id === labId);
  if (!lab) return;

  const modalBody = document.getElementById('lab-modal-body');
  modalBody.innerHTML = `
    <div style="border-bottom:2px solid var(--hospital-teal-600); padding-bottom:1rem; margin-bottom:1rem;">
      <h3 style="font-size:1.3rem;">${lab.title}</h3>
      <p style="font-size:0.85rem; color:var(--text-muted);">${lab.facility} &bull; Specimen Date: ${lab.date}</p>
      <p style="font-size:0.85rem; color:var(--text-muted);">Attending Physician: ${lab.doctorName}</p>
    </div>

    <div style="margin-bottom:1.5rem;">
      <h4 style="font-size:1rem; margin-bottom:0.5rem;">Pathologist Clinical Summary</h4>
      <p style="font-size:0.9rem; line-height:1.6; background:var(--bg-input); padding:1rem; border-radius:var(--radius-sm);">${lab.summary}</p>
    </div>

    <h4 style="font-size:1rem; margin-bottom:0.5rem;">Test Biomarkers</h4>
    <div class="doctor-table-wrap" style="margin-bottom:1.5rem;">
      <table class="doctor-table">
        <thead>
          <tr>
            <th>Analyte / Parameter</th>
            <th>Patient Result</th>
            <th>Reference Interval</th>
            <th>Interpretation</th>
          </tr>
        </thead>
        <tbody>
          ${(lab.results || []).map(r => `
            <tr>
              <td><strong>${r.test}</strong></td>
              <td style="font-weight:700; color:var(--hospital-teal-700);">${r.value}</td>
              <td>${r.normalRange}</td>
              <td><span class="badge badge-emerald">${r.flag}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
      <button class="btn btn-secondary" onclick="PulseCareUI.showToast('Download PDF', 'Generating authenticated diagnostic PDF document...', 'info')">
        <svg class="icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <span>Download Official PDF</span>
      </button>
      <button class="btn btn-primary" data-close-modal="lab-report-modal">Done</button>
    </div>
  `;

  PulseCareUI.openModal('lab-report-modal');
};

// Notification Center
function initNotificationCenter() {
  const bellBtn = document.getElementById('notif-bell-btn');
  const dropdown = document.getElementById('notif-dropdown');
  const itemsContainer = document.getElementById('notif-items-container');
  const dot = document.getElementById('notif-badge-dot');

  function renderNotifs() {
    const notifs = PulseCareStore.getNotifications(currentPatient.id);
    const unread = notifs.filter(n => !n.read).length;

    if (dot) {
      dot.style.display = unread > 0 ? 'inline-block' : 'none';
    }

    if (itemsContainer) {
      if (notifs.length === 0) {
        itemsContainer.innerHTML = `<p style="font-size:0.8rem; color:var(--text-muted); text-align:center; padding:1rem;">No notifications.</p>`;
      } else {
        itemsContainer.innerHTML = notifs.map(n => `
          <div style="padding:0.6rem; border-radius:6px; background:${n.read ? 'transparent' : 'var(--bg-hover)'}; border:1px solid var(--border-light); font-size:0.8rem;">
            <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
              <strong style="color:var(--text-primary);">${n.title}</strong>
              <span style="font-size:0.7rem; color:var(--text-muted);">${n.time}</span>
            </div>
            <p style="font-size:0.775rem; color:var(--text-secondary); margin:0;">${n.message}</p>
          </div>
        `).join('');
      }
    }
  }

  if (bellBtn && dropdown) {
    bellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.style.display === 'block';
      dropdown.style.display = isOpen ? 'none' : 'block';
      if (!isOpen) {
        renderNotifs();
      }
    });

    document.addEventListener('click', () => {
      dropdown.style.display = 'none';
    });
  }

  window.clearAllNotifications = function() {
    const notifs = PulseCareStore.getNotifications(currentPatient.id);
    notifs.forEach(n => PulseCareStore.markNotificationRead(n.id));
    renderNotifs();
    PulseCareUI.showToast('Notifications', 'All notifications cleared.', 'info');
  };

  renderNotifs();
}

// Appointment Booking Wizard
function initBookingWizard() {
  const form = document.getElementById('book-appointment-form');
  const docSelect = document.getElementById('book-doctor-select');

  if (docSelect) {
    const doctors = PulseCareStore.getDoctors();
    docSelect.innerHTML = doctors.map(d => `
      <option value="${d.id}">${d.name} (${d.specialty}) &bull; ${d.hospital}</option>
    `).join('');
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const docId = docSelect.value;
      const doc = PulseCareStore.getDoctorById(docId);
      const date = document.getElementById('book-date').value;
      const time = document.getElementById('book-time').value;
      const type = document.getElementById('book-type').value;
      const reason = document.getElementById('book-reason').value;

      PulseCareStore.addAppointment({
        patientId: currentPatient.id,
        patientName: currentPatient.name,
        doctorId: doc.id,
        doctorName: doc.name,
        doctorSpecialty: doc.specialty,
        doctorRoom: doc.department,
        date,
        time,
        type,
        reason,
        status: 'confirmed'
      });

      PulseCareUI.closeModal('book-apt-modal');
      PulseCareUI.showToast('Consultation Booked', `Appointment confirmed with ${doc.name} for ${date} at ${time}.`, 'success');
      renderAppointments();
      switchTab('appointments');
    });
  }
}

// Chat Functionality
function renderChat() {
  const container = document.getElementById('chat-messages-container');
  if (!container) return;

  const msgs = PulseCareStore.getMessages(currentPatient.id, 'doc-1');
  container.innerHTML = msgs.map(m => `
    <div class="chat-bubble ${m.senderId === currentPatient.id ? 'outgoing' : 'incoming'}">
      <div style="font-size:0.75rem; font-weight:700; margin-bottom:2px; opacity:0.85;">${m.senderName}</div>
      <div>${m.text}</div>
      <div style="font-size:0.65rem; margin-top:4px; text-align:right; opacity:0.75;">${m.timestamp}</div>
    </div>
  `).join('');

  container.scrollTop = container.scrollHeight;
}

function initChatForm() {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input-msg');

  if (form && input) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      PulseCareStore.sendMessage(currentPatient.id, currentPatient.name, 'doc-1', text);
      input.value = '';
      renderChat();

      // Simulated auto-reply from cardiologist
      setTimeout(() => {
        PulseCareStore.sendMessage('doc-1', 'Dr. Sarah Lin, MD', currentPatient.id, 'Thank you Alex! Your note is logged in your medical record. I will review this during our encounter.');
        renderChat();
      }, 1200);
    });
  }
}
