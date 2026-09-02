/**
 * PulseCare OS - Doctor Clinical Dashboard Controller (js/doctor.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check active session or fallback to Dr. Sarah Lin
  let session = PulseCareStore.getCurrentSession();
  if (!session || session.role !== 'doctor') {
    session = {
      id: 'doc-1',
      name: 'Dr. Sarah Lin, MD',
      email: 'sarah.lin@pulsecare.health',
      role: 'doctor',
      specialty: 'Cardiology & Internal Medicine',
      department: 'Cardiovascular Care Unit',
      avatar: 'SL'
    };
    PulseCareStore.setSession(session);
  }

  const doctor = PulseCareStore.getDoctorById(session.id) || PulseCareStore.getDoctors()[0];

  // Initialize UI
  initDoctorInfo(doctor);
  initDoctorNav();
  renderDoctorMetrics(doctor.id);
  renderPatientQueue(doctor.id);
  renderPatientDirectory();
  populatePatientSelects();
  bindDoctorActions(doctor);

  // Storage listener for live updates
  window.addEventListener('pulsecare:state_change', () => {
    renderDoctorMetrics(doctor.id);
    renderPatientQueue(doctor.id);
    renderPatientDirectory();
  });
});

// Update Doctor header & sidebar info
function initDoctorInfo(doctor) {
  document.querySelectorAll('.doctor-name').forEach(el => el.textContent = doctor.name);
  document.querySelectorAll('.doctor-specialty').forEach(el => el.textContent = doctor.specialty);
  document.querySelectorAll('.doctor-dept').forEach(el => el.textContent = doctor.department);
  document.querySelectorAll('.doctor-avatar-initials').forEach(el => el.textContent = doctor.avatar || 'DR');
}

// Navigation Tabs
function initDoctorNav() {
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link[data-tab]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = link.getAttribute('data-tab');
      switchDoctorTab(tabId);
    });
  });

  if (window.location.hash) {
    const hashTab = window.location.hash.replace('#', '');
    if (document.getElementById(`tab-${hashTab}`)) {
      switchDoctorTab(hashTab);
    }
  }
}

function switchDoctorTab(tabId) {
  document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
    if (link.getAttribute('data-tab') === tabId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  const targetPanel = document.getElementById(`tab-${tabId}`);
  if (targetPanel) {
    targetPanel.classList.add('active');
  }

  const titleMap = {
    overview: 'Clinical Command Center',
    queue: 'Patient Queue & Daily Schedule',
    patients: 'Patient Directory & Health Records',
    rx: 'Prescription & Pharmacy Orders',
    telehealth: 'Telehealth Consultation Station'
  };

  const pageTitle = document.getElementById('current-page-title');
  if (pageTitle && titleMap[tabId]) {
    pageTitle.textContent = titleMap[tabId];
  }

  const sidebar = document.querySelector('.portal-sidebar');
  if (sidebar) sidebar.classList.remove('open');
}

// Render Summary Metrics
function renderDoctorMetrics(doctorId) {
  const apts = PulseCareStore.getAppointments({ doctorId });
  const waitingApts = apts.filter(a => a.status === 'waiting');
  const completedApts = apts.filter(a => a.status === 'completed');
  const allPatients = PulseCareStore.getPatients();

  const totalPatEl = document.getElementById('doc-metric-patients');
  const todayAptsEl = document.getElementById('doc-metric-today');
  const waitingEl = document.getElementById('doc-metric-waiting');
  const completedEl = document.getElementById('doc-metric-completed');

  if (totalPatEl) totalPatEl.textContent = allPatients.length;
  if (todayAptsEl) todayAptsEl.textContent = apts.length;
  if (waitingEl) waitingEl.textContent = waitingApts.length;
  if (completedEl) completedEl.textContent = completedApts.length;
}

// Render Patient Queue Table
let currentQueueFilter = 'all';

function renderPatientQueue(doctorId) {
  let apts = PulseCareStore.getAppointments({ doctorId });

  if (currentQueueFilter !== 'all') {
    apts = apts.filter(a => a.status === currentQueueFilter);
  }

  const tbody = document.getElementById('doctor-queue-tbody');
  if (!tbody) return;

  if (apts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding: 2.5rem; color: var(--text-muted);">
          No patient encounters found for current filter.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = apts.map(apt => {
    const pat = PulseCareStore.getPatientById(apt.patientId) || { vitals: { bloodPressure: 'N/A', heartRate: 'N/A' }, bloodType: 'N/A' };
    
    let statusBadge = '<span class="badge badge-primary">Confirmed</span>';
    if (apt.status === 'waiting') statusBadge = '<span class="badge badge-amber"><span class="pulse-dot"></span> In Waiting</span>';
    if (apt.status === 'in-consultation') statusBadge = '<span class="badge badge-purple"><span class="pulse-dot"></span> In Consult</span>';
    if (apt.status === 'completed') statusBadge = '<span class="badge badge-emerald">Completed</span>';
    if (apt.status === 'cancelled') statusBadge = '<span class="badge badge-rose">Cancelled</span>';

    return `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div class="user-avatar" style="width:34px; height:34px; font-size:0.8rem; background: var(--accent-emerald-gradient);">
              ${apt.patientName.split(' ').map(n=>n[0]).join('')}
            </div>
            <div>
              <strong>${PulseCareUI.escapeHTML(apt.patientName)}</strong>
              <div style="font-size:0.75rem; color:var(--text-muted);">${pat.gender || 'Patient'} • Blood ${pat.bloodType || 'N/A'}</div>
            </div>
          </div>
        </td>
        <td>
          <div><strong>${apt.time}</strong></div>
          <div style="font-size:0.775rem; color:var(--text-muted);">${apt.date} (${apt.type})</div>
        </td>
        <td>
          <div style="font-size:0.85rem; max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${PulseCareUI.escapeHTML(apt.reason)}
          </div>
        </td>
        <td>
          <span style="font-weight:700; font-size:0.85rem;">${pat.vitals?.bloodPressure || '118/78'}</span>
          <span style="font-size:0.75rem; color:var(--text-muted);">(${pat.vitals?.heartRate || '72'} bpm)</span>
        </td>
        <td>${statusBadge}</td>
        <td>
          <div style="display:flex; gap:0.4rem; align-items:center;">
            <button class="btn btn-sm btn-outline" onclick="openPatientEHR('${apt.patientId}')" title="View Full Health Record">
              EHR
            </button>
            ${apt.status !== 'completed' && apt.status !== 'cancelled' ? `
              <button class="btn btn-sm btn-primary" onclick="advanceAppointmentStatus('${apt.id}')">
                ${apt.status === 'in-consultation' ? 'Finish' : 'Consult'}
              </button>
            ` : ''}
            <button class="btn btn-sm btn-secondary" onclick="openPrescribeModal('${apt.patientId}')" title="Prescribe Medication">
              Rx
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Render Patient Directory
function renderPatientDirectory() {
  const patients = PulseCareStore.getPatients();
  const container = document.getElementById('patient-directory-grid');
  if (!container) return;

  container.innerHTML = patients.map(pat => `
    <div class="portal-card" style="padding: 1.25rem;">
      <div style="display:flex; align-items:center; gap: 1rem; margin-bottom: 1rem;">
        <div class="user-avatar" style="width:48px; height:48px; font-size:1.1rem; background: var(--primary-gradient);">
          ${pat.name.split(' ').map(n=>n[0]).join('')}
        </div>
        <div>
          <h4 style="font-size: 1.1rem; margin-bottom: 2px;">${PulseCareUI.escapeHTML(pat.name)}</h4>
          <p style="font-size: 0.8rem; color: var(--text-muted);">${pat.age} yrs • ${pat.gender} • Blood ${pat.bloodType}</p>
        </div>
      </div>

      <div style="background: var(--bg-input); padding: 0.85rem; border-radius: var(--radius-sm); font-size: 0.825rem; margin-bottom: 1rem;">
        <p><strong>Conditions:</strong> ${pat.chronicConditions.join(', ')}</p>
        <p><strong>Allergies:</strong> <span style="color:var(--accent-rose); font-weight:600;">${pat.allergies.join(', ') || 'None'}</span></p>
        <p><strong>Recent BP / HR:</strong> ${pat.vitals.bloodPressure} (${pat.vitals.heartRate} bpm)</p>
      </div>

      <div style="display:flex; gap:0.5rem; margin-top: auto;">
        <button class="btn btn-sm btn-outline" style="flex:1;" onclick="openPatientEHR('${pat.id}')">
          View Health Record
        </button>
        <button class="btn btn-sm btn-primary" style="flex:1;" onclick="openPrescribeModal('${pat.id}')">
          Prescribe Rx
        </button>
      </div>
    </div>
  `).join('');
}

// Populate dropdowns with patients
function populatePatientSelects() {
  const patients = PulseCareStore.getPatients();
  const rxSelect = document.getElementById('rx-patient-select');
  if (rxSelect) {
    rxSelect.innerHTML = patients.map(p => `
      <option value="${p.id}">${p.name} (DOB: ${p.dob || 'N/A'})</option>
    `).join('');
  }
}

// Open Patient Electronic Health Record (EHR) Slide-over Drawer
window.openPatientEHR = function(patientId) {
  const pat = PulseCareStore.getPatientById(patientId);
  if (!pat) return;

  const rxs = PulseCareStore.getPrescriptions(patientId);
  const notes = PulseCareStore.getClinicalNotes(patientId);
  const labs = PulseCareStore.getLabReports(patientId);

  const drawerContent = document.getElementById('ehr-drawer-content');
  if (drawerContent) {
    drawerContent.innerHTML = `
      <div style="display:flex; align-items:center; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border-light);">
        <div class="user-avatar" style="width:54px; height:54px; font-size:1.25rem; background: var(--primary-gradient);">
          ${pat.name.split(' ').map(n=>n[0]).join('')}
        </div>
        <div>
          <h3 style="font-size: 1.35rem;">${PulseCareUI.escapeHTML(pat.name)}</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted);">${pat.age} yrs • ${pat.gender} • Blood Group ${pat.bloodType} • ID: #${pat.id.toUpperCase()}</p>
          <p style="font-size: 0.8rem; color: var(--primary-600);">${pat.insurance}</p>
        </div>
      </div>

      <!-- Quick Demographics -->
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem;">
        <div style="background:var(--bg-input); padding: 0.75rem; border-radius: var(--radius-sm); font-size:0.85rem;">
          <strong style="color:var(--text-muted); display:block; font-size:0.75rem;">PHONE & CONTACT</strong>
          ${pat.phone}<br/>${pat.address}
        </div>
        <div style="background:var(--bg-input); padding: 0.75rem; border-radius: var(--radius-sm); font-size:0.85rem;">
          <strong style="color:var(--text-muted); display:block; font-size:0.75rem;">EMERGENCY CONTACT</strong>
          ${pat.emergencyContact}
        </div>
      </div>

      <!-- Allergies & Chronic Conditions -->
      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem;">Clinical Alerts & Allergies</h4>
        <div style="display:flex; flex-wrap:wrap; gap: 0.5rem; margin-bottom: 0.5rem;">
          ${pat.allergies.map(a => `<span class="badge badge-rose">Allergy: ${a}</span>`).join('')}
          ${pat.chronicConditions.map(c => `<span class="badge badge-amber">${c}</span>`).join('')}
        </div>
      </div>

      <!-- Live Vitals Telemetry -->
      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem;">Telemetry & Current Vitals</h4>
        <div class="metrics-grid" style="grid-template-columns: repeat(2, 1fr); margin-bottom: 0; gap: 0.75rem;">
          <div style="background:var(--bg-input); padding: 0.85rem; border-radius: var(--radius-sm);">
            <div style="font-size:0.75rem; color:var(--text-muted);">Blood Pressure</div>
            <div style="font-size:1.25rem; font-weight:800;">${pat.vitals.bloodPressure}</div>
          </div>
          <div style="background:var(--bg-input); padding: 0.85rem; border-radius: var(--radius-sm);">
            <div style="font-size:0.75rem; color:var(--text-muted);">Heart Rate</div>
            <div style="font-size:1.25rem; font-weight:800;">${pat.vitals.heartRate} <span style="font-size:0.8rem; font-weight:normal;">bpm</span></div>
          </div>
          <div style="background:var(--bg-input); padding: 0.85rem; border-radius: var(--radius-sm);">
            <div style="font-size:0.75rem; color:var(--text-muted);">Oxygen Saturation</div>
            <div style="font-size:1.25rem; font-weight:800;">${pat.vitals.spO2}%</div>
          </div>
          <div style="background:var(--bg-input); padding: 0.85rem; border-radius: var(--radius-sm);">
            <div style="font-size:0.75rem; color:var(--text-muted);">Blood Glucose</div>
            <div style="font-size:1.25rem; font-weight:800;">${pat.vitals.glucose}</div>
          </div>
        </div>
      </div>

      <!-- Active Prescriptions -->
      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem;">Active Medications</h4>
        ${rxs.length === 0 ? '<p style="font-size:0.85rem; color:var(--text-muted);">No active prescriptions.</p>' : 
          rxs.map(r => `
            <div style="padding: 0.65rem 0.85rem; background: var(--bg-input); border-radius: var(--radius-sm); margin-bottom: 0.5rem; font-size: 0.85rem;">
              <strong>${PulseCareUI.escapeHTML(r.medicationName)} ${PulseCareUI.escapeHTML(r.strength)}</strong> - ${PulseCareUI.escapeHTML(r.dosage)}
              <div style="font-size:0.75rem; color:var(--text-muted);">Prescribed: ${r.prescribedDate} • ${r.pillsRemaining}/${r.totalPills} pills left</div>
            </div>
          `).join('')
        }
      </div>

      <!-- Previous SOAP Notes -->
      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem;">Physician SOAP Encounter Logs</h4>
        ${notes.length === 0 ? '<p style="font-size:0.85rem; color:var(--text-muted);">No prior encounter notes recorded.</p>' :
          notes.map(n => `
            <div style="padding: 0.85rem; border: 1px solid var(--border-light); border-radius: var(--radius-sm); margin-bottom: 0.75rem; font-size: 0.825rem;">
              <div style="display:flex; justify-content:space-between; margin-bottom: 0.35rem;">
                <strong>${PulseCareUI.escapeHTML(n.subject)}</strong>
                <span style="color:var(--text-muted);">${n.date}</span>
              </div>
              <p><strong>S:</strong> ${PulseCareUI.escapeHTML(n.soapNote.subjective)}</p>
              <p><strong>O:</strong> ${PulseCareUI.escapeHTML(n.soapNote.objective)}</p>
              <p><strong>A:</strong> ${PulseCareUI.escapeHTML(n.soapNote.assessment)}</p>
              <p><strong>P:</strong> ${PulseCareUI.escapeHTML(n.soapNote.plan)}</p>
            </div>
          `).join('')
        }
      </div>

      <div style="display:flex; gap:0.75rem; margin-top: 2rem;">
        <button class="btn btn-secondary" style="flex:1;" onclick="closePatientEHR()">Close EHR</button>
        <button class="btn btn-primary" style="flex:1;" onclick="closePatientEHR(); openPrescribeModal('${pat.id}');">Write Prescription</button>
      </div>
    `;
  }

  const drawer = document.getElementById('patient-ehr-drawer');
  if (drawer) drawer.classList.add('active');
};

window.closePatientEHR = function() {
  const drawer = document.getElementById('patient-ehr-drawer');
  if (drawer) drawer.classList.remove('active');
};

// Open Prescribe Modal
window.openPrescribeModal = function(patientId) {
  const select = document.getElementById('rx-patient-select');
  if (select && patientId) {
    select.value = patientId;
  }
  PulseCareUI.openModal('prescribe-modal');
};

// Advance Appointment Status
window.advanceAppointmentStatus = function(aptId) {
  const apt = PulseCareStore.getAppointments().find(a => a.id === aptId);
  if (!apt) return;

  if (apt.status === 'confirmed' || apt.status === 'waiting') {
    PulseCareStore.updateAppointmentStatus(aptId, 'in-consultation');
    PulseCareUI.showToast('Consultation Started', `Now consulting with ${apt.patientName}.`, 'info');
  } else if (apt.status === 'in-consultation') {
    PulseCareStore.updateAppointmentStatus(aptId, 'completed');
    PulseCareUI.showToast('Consultation Completed', `Encounter finalized for ${apt.patientName}.`, 'success');
  }

  const doc = PulseCareStore.getCurrentSession();
  renderDoctorMetrics(doc.id);
  renderPatientQueue(doc.id);
};

// Bind actions and forms
function bindDoctorActions(doctor) {
  // Queue Filter buttons
  document.querySelectorAll('[data-queue-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-queue-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentQueueFilter = btn.getAttribute('data-queue-filter');
      renderPatientQueue(doctor.id);
    });
  });

  // Prescription & Note form submission
  const rxForm = document.getElementById('prescribe-form');
  if (rxForm) {
    rxForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const patientId = document.getElementById('rx-patient-select').value;
      const medName = document.getElementById('rx-med-name').value.trim();
      const strength = document.getElementById('rx-strength').value.trim();
      const dosage = document.getElementById('rx-dosage').value.trim();
      const purpose = document.getElementById('rx-purpose').value.trim();
      const quantity = parseInt(document.getElementById('rx-quantity').value, 10) || 30;
      const refills = parseInt(document.getElementById('rx-refills').value, 10) || 2;
      const soapPlan = document.getElementById('rx-soap-plan').value.trim();

      if (!medName || !strength || !dosage) {
        PulseCareUI.showToast('Missing Details', 'Please complete medication name, strength, and dosage instructions.', 'error');
        return;
      }

      // Add Prescription
      PulseCareStore.addPrescription({
        patientId,
        doctorId: doctor.id,
        doctorName: doctor.name,
        medicationName: medName,
        strength,
        dosage,
        purpose: purpose || 'Cardiovascular Support',
        quantity,
        totalPills: quantity,
        pillsRemaining: quantity,
        refillsRemaining: refills,
        pharmacy: 'CVS Pharmacy #4192, Springfield'
      });

      // If clinical notes were typed, add SOAP note
      if (soapPlan) {
        PulseCareStore.addClinicalNote({
          patientId,
          doctorId: doctor.id,
          doctorName: doctor.name,
          subject: `Encounter - ${medName} Prescribed`,
          soapNote: {
            subjective: 'Patient seen for routine management and prescription adjustment.',
            objective: 'Clinical vitals stable. Comprehensive review performed.',
            assessment: 'Indication verified. Appropriate for medication therapy.',
            plan: soapPlan
          }
        });
      }

      PulseCareUI.closeModal('prescribe-modal');
      PulseCareUI.showToast('Prescription Issued', `E-Prescription for ${medName} ${strength} sent to pharmacy and synced to patient portal.`, 'success');
      rxForm.reset();
    });
  }

  // Patient Search input
  const searchInput = document.getElementById('patient-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const cards = document.querySelectorAll('#patient-directory-grid .portal-card');
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(term) ? '' : 'none';
      });
    });
  }
}
