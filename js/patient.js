/**
 * PulseCare OS - Patient Portal Controller (js/patient.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check active session or fallback to default patient
  let session = PulseCareStore.getCurrentSession();
  if (!session || session.role !== 'patient') {
    session = {
      id: 'pat-1',
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      role: 'patient'
    };
    PulseCareStore.setSession(session);
  }

  const patient = PulseCareStore.getPatientById(session.id) || PulseCareStore.getPatients()[0];

  // Initialize UI components
  initUserInfo(patient);
  initNavigation();
  renderOverview(patient);
  renderVitals(patient);
  renderAppointments(patient.id);
  renderPrescriptions(patient.id);
  renderLabReports(patient.id);
  renderDoctorDirectory();
  renderChatMessages(patient.id, 'doc-1');
  bindInteractiveActions(patient);

  // Listen for storage updates across windows/tabs
  window.addEventListener('pulsecare:state_change', () => {
    const updatedPat = PulseCareStore.getPatientById(patient.id) || patient;
    renderOverview(updatedPat);
    renderVitals(updatedPat);
    renderAppointments(updatedPat.id);
    renderPrescriptions(updatedPat.id);
  });
});

// Update User info in Topbar & Sidebar
function initUserInfo(patient) {
  const nameEls = document.querySelectorAll('.patient-name');
  nameEls.forEach(el => el.textContent = patient.name);

  const emailEls = document.querySelectorAll('.patient-email');
  emailEls.forEach(el => el.textContent = patient.email);

  const avatarEls = document.querySelectorAll('.patient-avatar-initials');
  const initials = patient.name.split(' ').map(n => n[0]).join('').substring(0, 2);
  avatarEls.forEach(el => el.textContent = initials);

  const bloodTypeEl = document.getElementById('pat-blood-type');
  if (bloodTypeEl) bloodTypeEl.textContent = patient.bloodType;

  const ageEl = document.getElementById('pat-age');
  if (ageEl) ageEl.textContent = `${patient.age} yrs (${patient.gender})`;

  const conditionsEl = document.getElementById('pat-conditions');
  if (conditionsEl) conditionsEl.textContent = patient.chronicConditions.join(', ');
}

// Navigation Tabs Handling
function initNavigation() {
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link[data-tab]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = link.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  // Also support hash navigation (e.g. #appointments)
  if (window.location.hash) {
    const hashTab = window.location.hash.replace('#', '');
    if (document.getElementById(`tab-${hashTab}`)) {
      switchTab(hashTab);
    }
  }
}

function switchTab(tabId) {
  // Update sidebar active states
  document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
    if (link.getAttribute('data-tab') === tabId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Switch visible tab panel
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  const targetPanel = document.getElementById(`tab-${tabId}`);
  if (targetPanel) {
    targetPanel.classList.add('active');
  }

  // Update Page Title Header
  const titleMap = {
    overview: 'Patient Health Overview',
    vitals: 'Biometric Telemetry & Vitals',
    appointments: 'Appointments & Consultations',
    prescriptions: 'Medications & Prescriptions',
    labs: 'Lab Results & Diagnostics',
    messages: 'Telehealth Secure Messaging'
  };

  const pageTitle = document.getElementById('current-page-title');
  if (pageTitle && titleMap[tabId]) {
    pageTitle.textContent = titleMap[tabId];
  }

  // Close mobile nav if open
  const sidebar = document.querySelector('.portal-sidebar');
  if (sidebar) sidebar.classList.remove('open');
}

// Render Overview Dashboard
function renderOverview(patient) {
  // Vitals summary
  const hrEl = document.getElementById('ov-heart-rate');
  const bpEl = document.getElementById('ov-bp');
  const o2El = document.getElementById('ov-spo2');
  const glEl = document.getElementById('ov-glucose');

  if (hrEl) hrEl.textContent = patient.vitals.heartRate;
  if (bpEl) bpEl.textContent = patient.vitals.bloodPressure;
  if (o2El) o2El.textContent = patient.vitals.spO2;
  if (glEl) glEl.textContent = patient.vitals.glucose;

  // Upcoming appointments list
  const apts = PulseCareStore.getAppointments({ patientId: patient.id })
    .filter(a => a.status !== 'cancelled' && a.status !== 'completed');

  const container = document.getElementById('ov-appointments-list');
  if (!container) return;

  if (apts.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 2rem; color: var(--text-muted);">
        <p>No upcoming appointments scheduled.</p>
        <button class="btn btn-sm btn-outline" style="margin-top: 0.75rem;" onclick="PulseCareUI.openModal('book-apt-modal')">Book New Consultation</button>
      </div>
    `;
    return;
  }

  container.innerHTML = apts.slice(0, 3).map(apt => {
    const d = new Date(apt.date + 'T00:00:00');
    const day = d.getDate();
    const month = d.toLocaleString('default', { month: 'short' });
    const isVideo = apt.type.includes('Video') || apt.type.includes('Telehealth');

    return `
      <div class="appointment-item">
        <div class="appointment-meta">
          <div class="appointment-time-box">
            <span class="day">${day}</span>
            <span class="month">${month}</span>
          </div>
          <div class="appointment-info">
            <h4>${PulseCareUI.escapeHTML(apt.doctorName)}</h4>
            <p>${PulseCareUI.escapeHTML(apt.doctorSpecialty)} • ${apt.time} (${apt.type})</p>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap: 0.5rem;">
          <span class="badge ${apt.status === 'waiting' ? 'badge-amber' : 'badge-emerald'}">
            ${apt.status}
          </span>
          ${isVideo ? `
            <button class="btn btn-sm btn-primary" onclick="joinTelehealthRoom('${apt.id}')">
              <svg class="icon" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              Join Call
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Render Vitals tab
function renderVitals(patient) {
  const vitals = patient.vitals;
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setVal('vit-hr-val', vitals.heartRate);
  setVal('vit-bp-val', vitals.bloodPressure);
  setVal('vit-spo2-val', vitals.spO2);
  setVal('vit-glu-val', vitals.glucose);
  setVal('vit-temp-val', vitals.temperature);
  setVal('vit-weight-val', vitals.weight);
  setVal('vit-bmi-val', vitals.bmi);

  // Render SVG Sparkline for Vitals History
  const svgContainer = document.getElementById('vitals-sparkline');
  if (svgContainer && patient.vitalsHistory) {
    const history = patient.vitalsHistory;
    const points = history.map((h, i) => {
      const x = 30 + (i * 80);
      const y = 140 - ((h.hr - 60) * 3); // Map HR (60-100) to Y coordinates
      return `${x},${y}`;
    }).join(' ');

    const labels = history.map((h, i) => {
      const x = 30 + (i * 80);
      return `<text x="${x}" y="175" fill="var(--text-muted)" font-size="11" text-anchor="middle">${h.date}</text>`;
    }).join('');

    const circles = history.map((h, i) => {
      const x = 30 + (i * 80);
      const y = 140 - ((h.hr - 60) * 3);
      return `
        <circle cx="${x}" cy="${y}" r="4" fill="#0284c7" stroke="#ffffff" stroke-width="2"/>
        <text x="${x}" y="${y - 10}" fill="var(--text-primary)" font-size="11" font-weight="700" text-anchor="middle">${h.hr} bpm</text>
      `;
    }).join('');

    svgContainer.innerHTML = `
      <svg viewBox="0 0 480 190" width="100%" height="190" style="overflow: visible;">
        <defs>
          <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        <line x1="20" y1="140" x2="450" y2="140" stroke="var(--border-light)" stroke-dasharray="4"/>
        <line x1="20" y1="80" x2="450" y2="80" stroke="var(--border-light)" stroke-dasharray="4"/>
        <polyline fill="none" stroke="url(#primaryGrad)" stroke="#0284c7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${points}" />
        ${circles}
        ${labels}
      </svg>
    `;
  }
}

// Render Appointments tab
function renderAppointments(patientId) {
  const apts = PulseCareStore.getAppointments({ patientId });
  const container = document.getElementById('appointments-full-list');
  if (!container) return;

  if (apts.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 3rem; color: var(--text-muted);">
        <p>No appointment records found.</p>
        <button class="btn btn-primary" style="margin-top: 1rem;" onclick="PulseCareUI.openModal('book-apt-modal')">Book Your First Consultation</button>
      </div>
    `;
    return;
  }

  container.innerHTML = apts.map(apt => {
    const d = new Date(apt.date + 'T00:00:00');
    const day = d.getDate();
    const month = d.toLocaleString('default', { month: 'short' });
    const isVideo = apt.type.includes('Video') || apt.type.includes('Telehealth');

    let badgeClass = 'badge-primary';
    if (apt.status === 'confirmed') badgeClass = 'badge-emerald';
    if (apt.status === 'waiting') badgeClass = 'badge-amber';
    if (apt.status === 'cancelled') badgeClass = 'badge-rose';
    if (apt.status === 'completed') badgeClass = 'badge-purple';

    return `
      <div class="appointment-item" style="padding: 1.25rem;">
        <div class="appointment-meta">
          <div class="appointment-time-box">
            <span class="day">${day}</span>
            <span class="month">${month}</span>
          </div>
          <div class="appointment-info">
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom: 0.25rem;">
              <h4>${PulseCareUI.escapeHTML(apt.doctorName)}</h4>
              <span class="badge ${badgeClass}">${apt.status}</span>
            </div>
            <p><strong>Specialty:</strong> ${PulseCareUI.escapeHTML(apt.doctorSpecialty)} | <strong>Time:</strong> ${apt.time} (${apt.type})</p>
            <p style="margin-top:0.25rem; font-size: 0.8rem; color: var(--text-secondary);"><strong>Reason:</strong> ${PulseCareUI.escapeHTML(apt.reason)}</p>
            ${apt.notes ? `<p style="font-size: 0.775rem; color: var(--text-muted); margin-top: 0.2rem;"><em>Clinical Note: ${PulseCareUI.escapeHTML(apt.notes)}</em></p>` : ''}
          </div>
        </div>
        <div style="display:flex; flex-direction:column; gap:0.5rem; align-items: flex-end;">
          ${isVideo && apt.status !== 'cancelled' ? `
            <button class="btn btn-sm btn-primary" onclick="joinTelehealthRoom('${apt.id}')">
              <svg class="icon" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              Join Telehealth
            </button>
          ` : ''}
          ${apt.status !== 'cancelled' && apt.status !== 'completed' ? `
            <button class="btn btn-sm btn-secondary" style="color: var(--accent-rose);" onclick="cancelAppointmentAction('${apt.id}')">Cancel</button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Render Prescriptions tab
function renderPrescriptions(patientId) {
  const rxs = PulseCareStore.getPrescriptions(patientId);
  const container = document.getElementById('prescriptions-list');
  if (!container) return;

  if (rxs.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); grid-column: 1/-1;">No active prescriptions recorded.</p>`;
    return;
  }

  container.innerHTML = rxs.map(rx => {
    const percentLeft = Math.round((rx.pillsRemaining / rx.totalPills) * 100);

    return `
      <div class="rx-card">
        <div class="rx-badge-top">
          <span class="badge badge-emerald">Active Rx</span>
          <span style="font-size: 0.775rem; color: var(--text-muted);">Refills: <strong>${rx.refillsRemaining}</strong> left</span>
        </div>
        <div>
          <div class="rx-name">${PulseCareUI.escapeHTML(rx.medicationName)}</div>
          <div class="rx-dosage">${PulseCareUI.escapeHTML(rx.strength)} • ${PulseCareUI.escapeHTML(rx.dosage)}</div>
          <p style="font-size: 0.775rem; color: var(--text-muted); margin-top: 0.35rem;">
            <strong>Indication:</strong> ${PulseCareUI.escapeHTML(rx.purpose)}<br/>
            <strong>Prescribed By:</strong> ${PulseCareUI.escapeHTML(rx.doctorName)}
          </p>
        </div>

        <div>
          <div style="display:flex; justify-content:space-between; font-size: 0.8rem; margin-bottom: 0.35rem;">
            <span>Supply: ${rx.pillsRemaining} of ${rx.totalPills} left</span>
            <strong>${percentLeft}%</strong>
          </div>
          <div class="rx-progress-bar">
            <div class="rx-progress-fill" style="width: ${percentLeft}%;"></div>
          </div>
        </div>

        <button class="btn btn-sm btn-outline" style="width: 100%; margin-top: auto;" 
                onclick="refillPrescriptionAction('${rx.id}')"
                ${rx.refillsRemaining <= 0 ? 'disabled' : ''}>
          <svg class="icon" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
          ${rx.refillsRemaining > 0 ? '1-Click Refill Request' : 'No Refills Left'}
        </button>
      </div>
    `;
  }).join('');
}

// Render Lab Reports tab
function renderLabReports(patientId) {
  const labs = PulseCareStore.getLabReports(patientId);
  const container = document.getElementById('lab-reports-list');
  if (!container) return;

  container.innerHTML = labs.map(lab => `
    <div class="portal-card" style="margin-bottom: 1rem;">
      <div class="portal-card-header">
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <div class="metric-icon-wrap cyan">
            <svg class="icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <div>
            <h4 style="font-size: 1rem;">${PulseCareUI.escapeHTML(lab.testName)}</h4>
            <p style="font-size: 0.775rem; color: var(--text-muted);">${lab.category} • ${lab.date} • ${PulseCareUI.escapeHTML(lab.labFacility)}</p>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span class="badge badge-emerald">${lab.status}</span>
          <button class="btn btn-sm btn-secondary" onclick="viewLabReportModal('${lab.id}')">View Report</button>
        </div>
      </div>
      <div class="portal-card-body" style="padding: 1rem 1.5rem; font-size: 0.875rem;">
        <p><strong>Clinical Summary:</strong> ${PulseCareUI.escapeHTML(lab.summary)}</p>
      </div>
    </div>
  `).join('');
}

// Render Doctors in dropdown for appointment booking
function renderDoctorDirectory() {
  const select = document.getElementById('book-doctor-select');
  if (!select) return;

  const docs = PulseCareStore.getDoctors();
  select.innerHTML = docs.map(d => `
    <option value="${d.id}">${d.name} (${d.specialty})</option>
  `).join('');
}

// Render Chat messages
function renderChatMessages(patientId, doctorId) {
  const container = document.getElementById('chat-messages-container');
  if (!container) return;

  const msgs = PulseCareStore.getMessages(patientId, doctorId);
  container.innerHTML = msgs.map(m => {
    const isPatient = m.senderRole === 'patient';
    return `
      <div class="chat-bubble ${isPatient ? 'outgoing' : 'incoming'}">
        <div style="font-size: 0.75rem; opacity: 0.8; margin-bottom: 2px;">
          ${isPatient ? 'You' : PulseCareUI.escapeHTML(m.senderName)} • ${m.timestamp}
        </div>
        <div>${PulseCareUI.escapeHTML(m.text)}</div>
      </div>
    `;
  }).join('');

  container.scrollTop = container.scrollHeight;
}

// Bind Action Handlers
function bindInteractiveActions(patient) {
  // Appointment Form
  const bookForm = document.getElementById('book-appointment-form');
  if (bookForm) {
    bookForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const doctorId = document.getElementById('book-doctor-select').value;
      const doc = PulseCareStore.getDoctorById(doctorId);
      const date = document.getElementById('book-date').value;
      const time = document.getElementById('book-time').value;
      const type = document.getElementById('book-type').value;
      const reason = document.getElementById('book-reason').value.trim();

      if (!date || !reason) {
        PulseCareUI.showToast('Incomplete Booking', 'Please select a date and enter the reason for your visit.', 'error');
        return;
      }

      PulseCareStore.addAppointment({
        patientId: patient.id,
        patientName: patient.name,
        doctorId: doc.id,
        doctorName: doc.name,
        doctorSpecialty: doc.specialty,
        date,
        time,
        type,
        reason
      });

      PulseCareUI.closeModal('book-apt-modal');
      PulseCareUI.showToast('Appointment Confirmed', `Scheduled consultation with ${doc.name} on ${date} at ${time}.`, 'success');
      bookForm.reset();
      renderAppointments(patient.id);
      renderOverview(patient);
    });
  }

  // Chat Send Form
  const chatForm = document.getElementById('chat-form');
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('chat-input-msg');
      const text = input.value.trim();
      if (!text) return;

      PulseCareStore.addMessage({
        senderId: patient.id,
        senderName: patient.name,
        senderRole: 'patient',
        recipientId: 'doc-1',
        recipientName: 'Dr. Sarah Lin, MD',
        text
      });

      input.value = '';
      renderChatMessages(patient.id, 'doc-1');

      // Auto response simulation from Dr. Sarah Lin
      setTimeout(() => {
        PulseCareStore.addMessage({
          senderId: 'doc-1',
          senderName: 'Dr. Sarah Lin, MD',
          senderRole: 'doctor',
          recipientId: patient.id,
          recipientName: patient.name,
          text: `Thank you for the update, Alex. I have logged this into your medical record. Please let me know if any symptoms change before our visit!`
        });
        renderChatMessages(patient.id, 'doc-1');
        PulseCareUI.showToast('New Clinical Reply', 'Dr. Sarah Lin sent you a reply.', 'info');
      }, 1400);
    });
  }
}

// Global action helpers accessible in template
window.refillPrescriptionAction = function (rxId) {
  const updated = PulseCareStore.refillPrescription(rxId);
  if (updated) {
    PulseCareUI.showToast('Refill Transmitted', `Refill submitted for ${updated.medicationName}. Sent to CVS Pharmacy.`, 'success');
    renderPrescriptions(updated.patientId);
  } else {
    PulseCareUI.showToast('Refill Unavailable', 'No refills remaining. Please consult your physician.', 'error');
  }
};

window.cancelAppointmentAction = function (aptId) {
  if (confirm('Are you sure you want to cancel this appointment?')) {
    PulseCareStore.updateAppointmentStatus(aptId, 'cancelled');
    PulseCareUI.showToast('Appointment Cancelled', 'Your appointment has been cancelled.', 'info');
    const pat = PulseCareStore.getCurrentSession();
    renderAppointments(pat.id);
    renderOverview(pat);
  }
};

window.joinTelehealthRoom = function (aptId) {
  const apt = PulseCareStore.getAppointments().find(a => a.id === aptId);
  const roomDocName = apt ? apt.doctorName : 'Dr. Sarah Lin, MD';
  const modalContent = document.getElementById('telehealth-modal-body');
  if (modalContent) {
    modalContent.innerHTML = `
      <div style="text-align:center; padding: 1.5rem 0;">
        <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--primary-gradient); color: #fff; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; font-size: 2rem;">
          <svg class="icon" style="width: 40px; height: 40px;" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
        </div>
        <h3 style="margin-bottom: 0.5rem;">Connected to Secure Telehealth Room</h3>
        <p style="color: var(--text-secondary); margin-bottom: 1.25rem;">Encrypted WebRTC Session with <strong>${PulseCareUI.escapeHTML(roomDocName)}</strong></p>
        
        <div style="background: var(--bg-input); border-radius: var(--radius-md); padding: 1.5rem; margin-bottom: 1.5rem;">
          <div style="display:flex; justify-content:space-around; align-items:center;">
            <div style="text-align:center;">
              <span class="pulse-dot" style="color: var(--accent-emerald);"></span>
              <p style="font-size:0.75rem; margin-top:4px;">Audio HD: Active</p>
            </div>
            <div style="text-align:center;">
              <span class="pulse-dot" style="color: var(--accent-emerald);"></span>
              <p style="font-size:0.75rem; margin-top:4px;">Video 1080p: Active</p>
            </div>
            <div style="text-align:center;">
              <span class="pulse-dot" style="color: var(--primary-500);"></span>
              <p style="font-size:0.75rem; margin-top:4px;">Latency: 18ms</p>
            </div>
          </div>
        </div>

        <button class="btn btn-danger" onclick="PulseCareUI.closeModal('telehealth-modal')">End Consultation</button>
      </div>
    `;
  }
  PulseCareUI.openModal('telehealth-modal');
};

window.viewLabReportModal = function (labId) {
  const lab = PulseCareStore.data.labReports.find(l => l.id === labId);
  if (!lab) return;

  const modalBody = document.getElementById('lab-modal-body');
  if (modalBody) {
    modalBody.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-light);">
        <div>
          <h3>${PulseCareUI.escapeHTML(lab.testName)}</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted);">${lab.category} • ${lab.date}</p>
        </div>
        <span class="badge badge-emerald">${lab.status}</span>
      </div>

      <div style="background: var(--bg-input); padding: 1rem; border-radius: var(--radius-sm); margin-bottom: 1.25rem; font-size: 0.9rem;">
        <p><strong>Testing Facility:</strong> ${PulseCareUI.escapeHTML(lab.labFacility)}</p>
        <p><strong>Ordering Physician:</strong> ${PulseCareUI.escapeHTML(lab.doctorName)}</p>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h4 style="margin-bottom: 0.5rem; font-size: 0.95rem;">Biomarker Analysis & Clinical Findings:</h4>
        <p style="font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary);">${PulseCareUI.escapeHTML(lab.summary)}</p>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
        <button class="btn btn-secondary" onclick="PulseCareUI.closeModal('lab-report-modal')">Close</button>
        <button class="btn btn-primary" onclick="PulseCareUI.showToast('Downloaded', 'Mock report PDF saved to downloads', 'success')">
          <svg class="icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download Official PDF
        </button>
      </div>
    `;
  }
  PulseCareUI.openModal('lab-report-modal');
};
