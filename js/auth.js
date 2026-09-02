/**
 * PulseCare OS - Authentication Page Logic (js/auth.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  let selectedRole = 'patient'; // 'patient' or 'doctor'

  const rolePatientBtn = document.getElementById('role-patient-btn');
  const roleDoctorBtn = document.getElementById('role-doctor-btn');
  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('auth-email');
  const passwordInput = document.getElementById('auth-password');
  const rememberCheckbox = document.getElementById('remember-me');
  const passwordToggleBtn = document.getElementById('toggle-password-btn');
  const biometricBtn = document.getElementById('biometric-login-btn');
  const demoDoctorBtn = document.getElementById('demo-doctor-btn');
  const demoPatientBtn = document.getElementById('demo-patient-btn');
  const registerForm = document.getElementById('register-form');

  // Switch Role Tabs
  function setRole(role) {
    selectedRole = role;
    if (role === 'patient') {
      rolePatientBtn?.classList.add('active');
      roleDoctorBtn?.classList.remove('active');
      emailInput.placeholder = 'e.g. alex.johnson@example.com';
      document.getElementById('role-badge-text').textContent = 'Patient Portal Sign In';
    } else {
      roleDoctorBtn?.classList.add('active');
      rolePatientBtn?.classList.remove('active');
      emailInput.placeholder = 'e.g. sarah.lin@pulsecare.health';
      document.getElementById('role-badge-text').textContent = 'Physician & Staff Sign In';
    }
  }

  if (rolePatientBtn) rolePatientBtn.addEventListener('click', () => setRole('patient'));
  if (roleDoctorBtn) roleDoctorBtn.addEventListener('click', () => setRole('doctor'));

  // Password Visibility Toggle
  if (passwordToggleBtn && passwordInput) {
    passwordToggleBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      const icon = passwordToggleBtn.querySelector('svg');
      if (type === 'text') {
        icon.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;
      } else {
        icon.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
      }
    });
  }

  // Quick Demo Logins
  if (demoPatientBtn) {
    demoPatientBtn.addEventListener('click', () => {
      setRole('patient');
      emailInput.value = 'alex.johnson@example.com';
      passwordInput.value = 'PatientSecurePass123!';
      PulseCareUI.showToast('Demo Account Selected', 'Loaded credentials for Alex Johnson (Patient)', 'info');
      triggerLoginProcess('pat-1', 'patient');
    });
  }

  if (demoDoctorBtn) {
    demoDoctorBtn.addEventListener('click', () => {
      setRole('doctor');
      emailInput.value = 'sarah.lin@pulsecare.health';
      passwordInput.value = 'DoctorClinicalPass123!';
      PulseCareUI.showToast('Demo Account Selected', 'Loaded credentials for Dr. Sarah Lin, MD (Cardiologist)', 'info');
      triggerLoginProcess('doc-1', 'doctor');
    });
  }

  // Biometric Login Simulation
  if (biometricBtn) {
    biometricBtn.addEventListener('click', () => {
      PulseCareUI.showToast('Biometric Verification', 'Scanning Touch ID / Face ID sensor...', 'info');
      setTimeout(() => {
        if (selectedRole === 'doctor') {
          PulseCareUI.showToast('Biometric Verified', 'Welcome back Dr. Sarah Lin, MD', 'success');
          triggerLoginProcess('doc-1', 'doctor');
        } else {
          PulseCareUI.showToast('Biometric Verified', 'Welcome back Alex Johnson', 'success');
          triggerLoginProcess('pat-1', 'patient');
        }
      }, 900);
    });
  }

  // Login Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput.value.trim().toLowerCase();
      const pass = passwordInput.value;

      if (!email || !pass) {
        PulseCareUI.showToast('Validation Error', 'Please enter both your email and password.', 'error');
        return;
      }

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="pulse-dot"></span> Authenticating...`;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

        // Lookup or create session
        if (selectedRole === 'doctor' || email.includes('doc') || email.includes('dr')) {
          const doctor = PulseCareStore.getDoctors().find(d => d.email.toLowerCase() === email) || PulseCareStore.getDoctors()[0];
          triggerLoginProcess(doctor.id, 'doctor');
        } else {
          const patient = PulseCareStore.getPatients().find(p => p.email.toLowerCase() === email) || PulseCareStore.getPatients()[0];
          triggerLoginProcess(patient.id, 'patient');
        }
      }, 700);
    });
  }

  function triggerLoginProcess(userId, role) {
    const remember = rememberCheckbox?.checked || true;
    let userSession = null;

    if (role === 'doctor') {
      const doc = PulseCareStore.getDoctorById(userId) || PulseCareStore.getDoctors()[0];
      userSession = {
        id: doc.id,
        name: doc.name,
        email: doc.email,
        role: 'doctor',
        specialty: doc.specialty,
        department: doc.department,
        avatar: doc.avatar
      };
      PulseCareStore.setSession(userSession, remember);
      PulseCareUI.showToast('Authentication Successful', `Welcome, ${doc.name}! Redirecting to Clinical Hub...`, 'success');
      setTimeout(() => {
        window.location.href = 'doctor.html';
      }, 600);
    } else {
      const pat = PulseCareStore.getPatientById(userId) || PulseCareStore.getPatients()[0];
      userSession = {
        id: pat.id,
        name: pat.name,
        email: pat.email,
        role: 'patient',
        bloodType: pat.bloodType,
        gender: pat.gender,
        age: pat.age
      };
      PulseCareStore.setSession(userSession, remember);
      PulseCareUI.showToast('Authentication Successful', `Welcome back, ${pat.name}! Redirecting to Patient Portal...`, 'success');
      setTimeout(() => {
        window.location.href = 'patient.html';
      }, 600);
    }
  }

  // Registration Modal Form
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const role = document.getElementById('reg-role').value;

      if (!name || !email) {
        PulseCareUI.showToast('Missing Fields', 'Please complete all required fields.', 'error');
        return;
      }

      PulseCareUI.closeModal('register-modal');
      PulseCareUI.showToast('Account Created', `Welcome to PulseCare OS, ${name}! Logging you in now...`, 'success');

      if (role === 'doctor') {
        triggerLoginProcess('doc-1', 'doctor');
      } else {
        triggerLoginProcess('pat-1', 'patient');
      }
    });
  }
});
