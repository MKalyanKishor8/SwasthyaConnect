/**
 * SwasthyaConnect - Comprehensive Patient Portal Controller (js/patient.js)
 * Manages Dashboard, Profile, Appointments, Medical Records, Prescriptions, Labs,
 * Telehealth, Indian Government Healthcare Schemes, Eligibility Checker, and Nearby Centres.
 */

let currentPatient = null;
let currentSchemeCategory = 'All';

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
  renderGovernmentSchemes();
  renderNearbyCentres();
  initSchemesSearchAndFilter();
  initEligibilityChecker();
  initBookingWizard();

  // Listen to cross-portal state changes
  window.addEventListener('swasthya:state_change', () => {
    currentPatient = PulseCareStore.getPatientById(currentPatient.id) || PulseCareStore.getPatients()[0];
    renderPatientData();
    renderAppointments();
    renderPrescriptions();
    renderMedicalRecords();
    renderScans();
    renderTelehealthHistory();
    renderGovernmentSchemes(currentSchemeCategory);
    renderNearbyCentres();
  });
});

// Tab Navigation
function initNavigation() {
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link[data-tab]');
  const pageTitle = document.getElementById('current-page-title');

  const titles = {
    overview: 'Patient Health Dashboard',
    profile: 'My Patient Profile & Demographics',
    appointments: 'Scheduled Consultations & Appointments',
    records: 'Electronic Medical Records (EHR)',
    prescriptions: 'Active Medications & Pharmacy Refills',
    labs: 'Diagnostic Lab Reports & Pathology',
    telehealth: 'Encrypted Telemedicine Video Consultations',
    schemes: 'Indian Government Healthcare Schemes',
    nearby: 'Find Nearby Government Healthcare Centres',
    emergency: 'Emergency Information & Rapid Response'
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
    profile: 'My Patient Profile & Demographics',
    appointments: 'Scheduled Consultations & Appointments',
    records: 'Electronic Medical Records (EHR)',
    prescriptions: 'Active Medications & Pharmacy Refills',
    labs: 'Diagnostic Lab Reports & Pathology',
    telehealth: 'Encrypted Telemedicine Video Consultations',
    schemes: 'Indian Government Healthcare Schemes',
    nearby: 'Find Nearby Government Healthcare Centres',
    emergency: 'Emergency Information & Rapid Response'
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

  const bpEl = document.getElementById('ov-bp');
  if (bpEl) bpEl.textContent = vit.bloodPressure || '118/78';

  const tempEl = document.getElementById('ov-temp');
  if (tempEl) tempEl.textContent = vit.temperature ? vit.temperature.split(' ')[0] : '98.6';

  const o2El = document.getElementById('ov-spo2');
  if (o2El) o2El.textContent = vit.spO2 || 99;
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

// ==========================================================================
// GOVERNMENT HEALTHCARE SCHEMES CONTROLLER
// ==========================================================================

function renderGovernmentSchemes(category = 'All', search = '') {
  const container = document.getElementById('schemes-grid-container');
  if (!container) return;

  const schemes = PulseCareStore.getGovernmentSchemes(category, search);

  if (schemes.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding:3rem 1rem; background:var(--bg-surface); border-radius:var(--radius-md); border:1px solid var(--border-light);">
        <p style="font-size:1.1rem; color:var(--text-muted); margin-bottom:1rem;">No government schemes found matching your search or category filter.</p>
        <button class="btn btn-sm btn-primary" onclick="document.getElementById('scheme-search-input').value=''; filterSchemes('All');">View All Schemes</button>
      </div>
    `;
    return;
  }

  container.innerHTML = schemes.map(s => `
    <div class="portal-card" style="border-top:4px solid ${getCategoryColor(s.category)}; display:flex; flex-direction:column; height:100%;">
      
      <!-- Card Header -->
      <div class="portal-card-header" style="background:var(--bg-surface-elevated); align-items:flex-start; gap:0.5rem;">
        <div style="flex:1;">
          <span class="badge ${getCategoryBadgeClass(s.category)}" style="margin-bottom:0.35rem;">${s.category}</span>
          <h3 style="font-size:1.15rem; font-weight:700; line-height:1.3; color:var(--text-primary);">${s.name}</h3>
          ${s.hindiName ? `<p style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">${s.hindiName}</p>` : ''}
        </div>
        <span class="badge badge-emerald" style="white-space:nowrap;">${s.badge}</span>
      </div>

      <!-- Card Body -->
      <div class="portal-card-body" style="display:flex; flex-direction:column; gap:1rem; flex:1;">
        
        <!-- Short Desc -->
        <p style="font-size:0.875rem; line-height:1.5; color:var(--text-secondary);">
          ${s.shortDesc}
        </p>

        <!-- Department Tag -->
        <div style="font-size:0.775rem; color:var(--text-muted); display:flex; align-items:center; gap:0.4rem;">
          <svg class="icon" style="width:14px; height:14px; flex-shrink:0; color:var(--hospital-teal-600);" viewBox="0 0 24 24"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7M4 4h16a1 1 0 0 1 1 1v2H3V5a1 1 0 0 1 1-1z"/></svg>
          <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${s.department}</span>
        </div>

        <!-- Key Benefits List -->
        <div style="background:var(--bg-input); padding:0.85rem; border-radius:var(--radius-sm); font-size:0.825rem;">
          <strong style="color:var(--text-primary); display:block; margin-bottom:0.35rem;">Key Benefits & Highlights:</strong>
          <ul style="padding-left:1.15rem; margin:0; color:var(--text-secondary); line-height:1.45;">
            ${s.benefits.slice(0, 2).map(b => `<li style="margin-bottom:3px;">${b}</li>`).join('')}
          </ul>
        </div>

        <!-- Eligibility Snapshot -->
        <div style="font-size:0.8rem; color:var(--text-muted);">
          <strong>Eligibility:</strong> ${s.eligibility[0]}
        </div>

        <!-- Actions -->
        <div style="margin-top:auto; padding-top:0.75rem; border-top:1px solid var(--border-light); display:flex; flex-direction:column; gap:0.5rem;">
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-sm btn-primary" style="flex:1;" onclick="openSchemeDetailsModal('${s.id}')">
              <span>View Full Details</span>
              <svg class="icon" style="width:14px; height:14px;" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
            <button class="btn btn-sm btn-secondary" style="flex:1;" onclick="openSchemeEligibilityFor('${s.id}')">
              <span>Check Eligibility</span>
            </button>
          </div>

          <a href="${s.officialUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline" style="text-align:center;">
            <span>Official Government Portal</span>
            <svg class="icon" style="width:12px; height:12px;" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>

      </div>
    </div>
  `).join('');
}

function getCategoryColor(cat) {
  if (cat.includes('Insurance')) return 'var(--hospital-teal-600)';
  if (cat.includes('Telemedicine')) return 'var(--hospital-blue)';
  if (cat.includes('Vaccination')) return 'var(--hospital-healing-green)';
  if (cat.includes('Maternal')) return '#d946ef';
  if (cat.includes('Disease')) return 'var(--hospital-cross-red)';
  return 'var(--hospital-teal-700)';
}

function getCategoryBadgeClass(cat) {
  if (cat.includes('Insurance')) return 'badge-primary';
  if (cat.includes('Telemedicine')) return 'badge-purple';
  if (cat.includes('Vaccination')) return 'badge-emerald';
  if (cat.includes('Maternal')) return 'badge-purple';
  if (cat.includes('Disease')) return 'badge-danger';
  return 'badge-primary';
}

function initSchemesSearchAndFilter() {
  const searchInput = document.getElementById('scheme-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value;
      renderGovernmentSchemes(currentSchemeCategory, q);
    });
  }
}

window.filterSchemes = function(category) {
  currentSchemeCategory = category;
  const pills = document.querySelectorAll('#scheme-category-pills .chip-btn');
  pills.forEach(p => {
    if (p.getAttribute('data-cat') === category) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });
  const searchInput = document.getElementById('scheme-search-input');
  const q = searchInput ? searchInput.value : '';
  renderGovernmentSchemes(category, q);
};

// Open Scheme Full Details Modal
window.openSchemeDetailsModal = function(schemeId) {
  const scheme = PulseCareStore.getSchemeById(schemeId);
  if (!scheme) return;

  const modalDept = document.getElementById('modal-scheme-dept');
  const modalTitle = document.getElementById('modal-scheme-title');
  const modalBody = document.getElementById('scheme-modal-body');

  if (modalDept) modalDept.textContent = scheme.department;
  if (modalTitle) modalTitle.textContent = scheme.name;

  modalBody.innerHTML = `
    <!-- Top Highlights Banner -->
    <div class="welcome-banner" style="padding:1.25rem; margin-bottom:1.5rem; background:linear-gradient(135deg, rgba(13, 148, 136, 0.12) 0%, rgba(2, 132, 199, 0.12) 100%);">
      <div class="welcome-text">
        <span class="badge badge-emerald" style="margin-bottom:0.25rem;">${scheme.badge}</span>
        <h4 style="font-size:1.15rem; margin-bottom:0.2rem;">${scheme.shortName} Strategic Purpose</h4>
        <p style="font-size:0.875rem; color:var(--text-secondary);">${scheme.purpose}</p>
      </div>
    </div>

    <!-- Status Guidance Disclaimer -->
    <div style="background:rgba(2, 132, 199, 0.08); border-left:4px solid var(--hospital-blue); padding:0.85rem 1rem; border-radius:var(--radius-xs); margin-bottom:1.5rem; font-size:0.85rem;">
      <strong style="color:var(--hospital-blue);">📌 Beneficiary Status:</strong>
      <span>You are <strong>Potentially Eligible</strong> for this scheme based on general public healthcare entitlements. Final determination is conducted at the respective government portal / hospital desk.</span>
    </div>

    <!-- Key Benefits -->
    <div style="margin-bottom:1.5rem;">
      <h4 style="font-size:1.05rem; margin-bottom:0.6rem; color:var(--hospital-teal-700);">Key Benefits & Coverage Entitlements</h4>
      <div style="display:flex; flex-direction:column; gap:0.5rem;">
        ${scheme.benefits.map(b => `
          <div style="display:flex; align-items:flex-start; gap:0.5rem; font-size:0.875rem; background:var(--bg-input); padding:0.65rem 0.85rem; border-radius:var(--radius-xs);">
            <svg class="icon" style="color:var(--hospital-healing-green); width:16px; height:16px; margin-top:2px; flex-shrink:0;" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            <span>${b}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Eligibility & Required Documents -->
    <div class="dashboard-grid-2" style="margin-bottom:1.5rem;">
      
      <div class="glass-panel" style="padding:1.15rem;">
        <h4 style="font-size:0.95rem; margin-bottom:0.5rem; color:var(--text-primary);">Eligibility Criteria</h4>
        <ul style="padding-left:1.15rem; font-size:0.825rem; color:var(--text-secondary); line-height:1.5;">
          ${scheme.eligibility.map(e => `<li style="margin-bottom:4px;">${e}</li>`).join('')}
        </ul>
      </div>

      <div class="glass-panel" style="padding:1.15rem;">
        <h4 style="font-size:0.95rem; margin-bottom:0.5rem; color:var(--text-primary);">Required Documents</h4>
        <ul style="padding-left:1.15rem; font-size:0.825rem; color:var(--text-secondary); line-height:1.5;">
          ${scheme.documents.map(d => `<li style="margin-bottom:4px;">${d}</li>`).join('')}
        </ul>
      </div>

    </div>

    <!-- How to Apply Step-by-Step -->
    <div style="margin-bottom:1.5rem;">
      <h4 style="font-size:1.05rem; margin-bottom:0.6rem; color:var(--hospital-teal-700);">How to Apply / How to Avail</h4>
      <div style="display:flex; flex-direction:column; gap:0.5rem;">
        ${scheme.howToApply.map((step, idx) => `
          <div style="display:flex; align-items:flex-start; gap:0.75rem; font-size:0.875rem;">
            <span style="width:24px; height:24px; border-radius:50%; background:var(--primary-gradient); color:#fff; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:800; flex-shrink:0;">${idx + 1}</span>
            <p style="margin:0; font-size:0.85rem; color:var(--text-secondary);">${step}</p>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- FAQs -->
    ${scheme.faqs && scheme.faqs.length ? `
      <div style="margin-bottom:1.5rem;">
        <h4 style="font-size:1.05rem; margin-bottom:0.6rem; color:var(--hospital-teal-700);">Frequently Asked Questions (FAQs)</h4>
        <div style="display:flex; flex-direction:column; gap:0.5rem;">
          ${scheme.faqs.map(f => `
            <div style="background:var(--bg-input); padding:0.75rem 1rem; border-radius:var(--radius-xs);">
              <strong style="font-size:0.85rem; color:var(--text-primary); display:block; margin-bottom:2px;">Q: ${f.q}</strong>
              <p style="font-size:0.825rem; color:var(--text-secondary); margin:0;">${f.a}</p>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Official Actions -->
    <div style="display:flex; justify-content:space-between; align-items:center; padding-top:1rem; border-top:1px solid var(--border-light); flex-wrap:wrap; gap:0.75rem;">
      <a href="${scheme.portalUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-emerald">
        <svg class="icon" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        <span>Open Official Portal / Apply Online</span>
      </a>
      <button class="btn btn-primary" data-close-modal="scheme-details-modal">Close</button>
    </div>
  `;

  PulseCareUI.openModal('scheme-details-modal');
};

// Open Eligibility Modal Pre-Selected for a scheme
window.openSchemeEligibilityFor = function(schemeId) {
  PulseCareUI.openModal('eligibility-modal');
};

// ==========================================================================
// INTERACTIVE SCHEME ELIGIBILITY CHECKER ENGINE
// ==========================================================================

function initEligibilityChecker() {
  const form = document.getElementById('eligibility-form');
  const resultsContainer = document.getElementById('eligibility-results-container');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const ageGroup = document.getElementById('elig-age').value;
      const state = document.getElementById('elig-state').value;
      const location = document.getElementById('elig-location').value;
      const incomeCategory = document.getElementById('elig-income').value;
      const specialStatus = document.getElementById('elig-status').value;

      const results = PulseCareStore.evaluateSchemeEligibility({
        ageGroup,
        state,
        location,
        incomeCategory,
        specialStatus
      });

      if (resultsContainer) {
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
          <div style="border-top:2px solid var(--hospital-teal-600); padding-top:1.25rem;">
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
              <h4 style="font-size:1.15rem; color:var(--text-primary);">🎯 Personalized Scheme Eligibility Evaluation</h4>
              <span class="badge badge-emerald">Evaluated</span>
            </div>

            <!-- Disclaimer Notice -->
            <div style="background:rgba(245, 158, 11, 0.12); border:1px solid rgba(245, 158, 11, 0.4); border-radius:var(--radius-xs); padding:0.85rem 1rem; margin-bottom:1.25rem; font-size:0.825rem; color:var(--text-primary);">
              <strong>⚠️ Guidance Disclaimer:</strong> Eligibility information shown here is for guidance only. SwasthyaConnect does not make final legal determinations. Please verify eligibility through the respective official government portal.
            </div>

            <!-- Results List -->
            <div style="display:flex; flex-direction:column; gap:0.75rem;">
              ${results.map(r => `
                <div class="glass-panel" style="padding:1rem; border-left:4px solid ${getEligibilityStatusColor(r.status)};">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.25rem; flex-wrap:wrap; gap:0.4rem;">
                    <div>
                      <strong style="font-size:0.95rem; color:var(--text-primary);">${r.schemeName}</strong>
                      <span class="badge ${getCategoryBadgeClass(r.category)}" style="margin-left:6px; font-size:0.65rem;">${r.category}</span>
                    </div>
                    ${getEligibilityBadgeHTML(r.status)}
                  </div>
                  <p style="font-size:0.825rem; color:var(--text-secondary); margin:0.35rem 0 0.5rem;">
                    ${r.reason}
                  </p>
                  <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
                    <a href="${r.portalUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline" style="font-size:0.75rem; padding:0.25rem 0.6rem;">
                      <span>Verify on Official Portal</span>
                      <svg class="icon" style="width:10px; height:10px;" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>
                  </div>
                </div>
              `).join('')}
            </div>

          </div>
        `;
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        PulseCareUI.showToast('Evaluation Complete', 'Your scheme eligibility report has been generated.', 'success');
      }
    });
  }
}

function getEligibilityStatusColor(status) {
  if (status === 'Eligible') return 'var(--hospital-healing-green)';
  if (status === 'Verify') return 'var(--hospital-blue)';
  return 'var(--text-muted)';
}

function getEligibilityBadgeHTML(status) {
  if (status === 'Eligible') {
    return `<span class="badge badge-emerald">🟢 Potentially Eligible</span>`;
  } else if (status === 'Verify') {
    return `<span class="badge badge-purple">🟡 Please Verify Officially</span>`;
  } else {
    return `<span class="badge" style="background:rgba(100, 116, 139, 0.2); color:#64748b;">⚪ May Not Be Eligible</span>`;
  }
}

// ==========================================================================
// NEARBY HEALTHCARE CENTRES CONTROLLER
// ==========================================================================

let currentNearbyFilter = 'all';

function renderNearbyCentres(filterType = 'all') {
  const container = document.getElementById('nearby-centres-grid');
  if (!container) return;

  const centres = PulseCareStore.getNearbyCentres(filterType);

  if (centres.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">No healthcare centres found matching criteria.</p>`;
    return;
  }

  container.innerHTML = centres.map(c => `
    <div class="portal-card" style="border-top:4px solid var(--hospital-teal-600); display:flex; flex-direction:column;">
      <div class="portal-card-header" style="background:var(--bg-surface-elevated);">
        <div>
          <span class="badge badge-primary">${c.type}</span>
          <h4 style="font-size:1.1rem; margin-top:4px; font-weight:700;">${c.name}</h4>
        </div>
        <span class="badge badge-emerald">${c.distance} away</span>
      </div>

      <div class="portal-card-body" style="display:flex; flex-direction:column; gap:0.85rem; flex:1;">
        
        <p style="font-size:0.85rem; color:var(--text-secondary); margin:0;">
          📍 <strong>Location:</strong> ${c.location}
        </p>

        <p style="font-size:0.825rem; color:var(--text-muted); margin:0;">
          🕒 <strong>Timings:</strong> ${c.timing}
        </p>

        <p style="font-size:0.85rem; color:var(--hospital-teal-700); font-weight:700; margin:0;">
          📞 <strong>Emergency Helpline:</strong> ${c.phone}
        </p>

        <!-- Available Services -->
        <div style="margin-top:0.25rem;">
          <strong style="font-size:0.8rem; color:var(--text-primary); display:block; margin-bottom:0.35rem;">Available Public Health Services:</strong>
          <div style="display:flex; flex-wrap:wrap; gap:0.35rem;">
            ${c.services.map(s => `
              <span class="badge" style="background:var(--bg-input); color:var(--text-primary); font-size:0.7rem; font-weight:600; text-transform:none;">${s}</span>
            `).join('')}
          </div>
        </div>

        ${c.pmjayEmpanelled ? `
          <div style="margin-top:auto; padding:0.5rem 0.75rem; background:rgba(13, 148, 136, 0.1); border-radius:var(--radius-xs); font-size:0.775rem; color:var(--hospital-teal-800); font-weight:700;">
            ✓ PM-JAY Empanelled &bull; Free Golden Card Hospitalization Desk Available
          </div>
        ` : ''}

        <!-- Actions -->
        <div style="margin-top:auto; padding-top:0.75rem; border-top:1px solid var(--border-light); display:flex; gap:0.5rem;">
          <a href="${c.directionsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary" style="flex:1; text-align:center;">
            <svg class="icon" style="width:14px; height:14px;" viewBox="0 0 24 24"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            <span>Get Directions</span>
          </a>
          <a href="tel:${c.phone.split(' ')[0]}" class="btn btn-sm btn-secondary" style="flex:1; text-align:center;">
            <svg class="icon" style="width:14px; height:14px;" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/></svg>
            <span>Call Centre</span>
          </a>
        </div>

      </div>
    </div>
  `).join('');
}

window.filterNearbyCentres = function(type) {
  currentNearbyFilter = type;
  const btns = document.querySelectorAll('[data-nearby-filter]');
  btns.forEach(b => {
    if (b.getAttribute('data-nearby-filter') === type) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });
  renderNearbyCentres(type);
};

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
