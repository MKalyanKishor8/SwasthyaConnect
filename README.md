# SwasthyaConnect - Healthcare & Clinical Portal Suite

A modern, responsive, and feature-complete healthcare web application featuring a **Unified Authentication Gateway**, an interactive **Patient Care Portal**, and a **Doctor Clinical Dashboard**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMKalyanKishor8%2FSwasthyaConnect)
![Status](https://img.shields.io/badge/Status-Live-emerald?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Design](https://img.shields.io/badge/Design-Glassmorphism-purple?style=for-the-badge)

---

## 🔗 Live Deployments

- **🌐 GitHub Pages Live App**: [https://mkalyankishor8.github.io/SwasthyaConnect/](https://mkalyankishor8.github.io/SwasthyaConnect/)
- **🐙 GitHub Repository**: [https://github.com/MKalyanKishor8/SwasthyaConnect](https://github.com/MKalyanKishor8/SwasthyaConnect)
- **⚡ Production Vercel**: [https://pulsecare-healthcare-portal.vercel.app](https://pulsecare-healthcare-portal.vercel.app)

---

## 🌟 Key Features & Portals

### 1. 🔐 Authentication Gateway
- **Dual Selector Login**: [`login.html`](login.html)
- **Dedicated Patient Login**: [`patient-login.html`](patient-login.html) - MRN / Email sign-in, Touch/Face ID simulation, 1-click demo access for **Alex Johnson (Patient)**.
- **Dedicated Doctor Login**: [`doctor-login.html`](doctor-login.html) - Staff ID / NPI / Email sign-in, Hospital SSO, YubiKey 2FA simulation, 1-click demo access for **Dr. Sarah Lin, MD (Cardiologist)**.
- **Unified Portal Gateway**: [`index.html`](index.html)

### 2. 🩺 Patient Care Portal ([`patient.html`](patient.html))
- **Health Overview Dashboard**: Personalized greeting, blood group, and chronic conditions.
- **Live Biometric Telemetry**: Real-time trackers for Heart Rate (72 BPM), Blood Pressure (118/78 mmHg), Blood Oxygen (99% SpO2), and Fasting Glucose (94 mg/dL).
- **7-Day Telemetry Trend**: Interactive SVG sparkline chart tracking resting vitals over time.
- **Appointment Booking System**: Physician selection, calendar date picker, time slots, and consultation format (Telehealth Video vs In-Clinic).
- **Medication & Prescription Hub**: Active prescriptions list with pill supply progress bars and a working **1-Click Refill Request** button.
- **Diagnostic Lab Reports**: Official CMP, Lipid Panel, and 12-Lead ECG reports with PDF download simulation.
- **Care Team Chat & WebRTC Room**: Direct encrypted chat with Dr. Sarah Lin with auto-replies, plus mock HD Telehealth video rooms.

### 3. 👨‍⚕️ Doctor Clinical Dashboard ([`doctor.html`](doctor.html))
- **Clinical Command Center**: Live metrics for Total Registered Patients, Scheduled Encounters, Patients in Waiting Room, and Completed Charts.
- **Interactive Daily Patient Queue**: Filterable schedule table (Waiting, In-Consult, Confirmed, Completed) with status transition controls.
- **Slide-Over EHR Drawer**: Comprehensive Electronic Health Record viewer displaying demographics, insurance, allergies, chronic conditions, telemetry vitals, and SOAP notes history.
- **E-Prescription & SOAP Note Writer**: Interactive authoring tool to authorize medications, specify dosage instructions, and write SOAP treatment plans that **instantly sync with the patient portal in real-time via persistent local storage**.
- **Patient Directory Search**: Instant search filtering across all clinic patient charts.

---

## 📂 Project Structure

```
├── index.html           # 🔐 Unified Authentication Gateway
├── login.html           # 🔀 Dual Portal Selector
├── patient-login.html   # 🩺 Dedicated Patient Login
├── doctor-login.html    # 👨‍⚕️ Dedicated Doctor Clinical Login
├── patient.html         # 🩺 Patient Care Portal
├── doctor.html          # 👨‍⚕️ Doctor Clinical Dashboard
├── vercel.json          # ⚡ Vercel Deployment Configuration
├── README.md            # 📖 Documentation & Setup
├── css/
│   ├── style.css        # 🎨 Design System, CSS Variables, Typography & Themes
│   ├── auth.css         # 💎 Glassmorphic Login Cards & Ambient Backgrounds
│   └── portal.css       # 📊 Dashboard Layouts, Stats Cards, Timelines & Telehealth
└── js/
    ├── store.js         # 💾 Reactive LocalStorage State Engine & Seed Data
    ├── auth.js          # 🔑 Role Selector, Quick Demo Access & Biometrics
    ├── theme.js         # 🌓 Dark/Light Mode Engine, Toast Alerts & Modals
    ├── patient.js       # 📱 Patient Portal Logic & Telehealth
    └── doctor.js        # 📋 Doctor Queue, EHR Drawer & Clinical SOAP Notes
```

---

## 🚀 Local Setup

```bash
# Start local development server
python3 -m http.server 8080

# Open in browser
open http://localhost:8080/index.html
```

---

## 📄 License
MIT License. Free for medical tech prototyping and educational use.
