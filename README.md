# PulseCare OS - Healthcare & Clinical Portal Suite

A modern, responsive, and feature-complete healthcare web application featuring a **Unified Authentication Gateway**, an interactive **Patient Care Portal**, and a **Doctor Clinical Dashboard**.

![PulseCare OS Preview](https://img.shields.io/badge/Status-Live-emerald?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Design](https://img.shields.io/badge/Design-Glassmorphism-purple?style=for-the-badge)

---

## 🌟 Key Features

### 1. 🔐 Unified Authentication Gateway (`index.html`)
- **Dual Role Selector**: Switch dynamically between **Patient Portal** and **Doctor / MD** sign-in modes.
- **⚡ 1-Click Demo Quick Logins**:
  - `Alex Johnson (Patient)` - Instant access to patient telemetry, bookings, and prescriptions.
  - `Dr. Sarah Lin, MD (Doctor)` - Instant access to the clinical queue and EHR.
- **Biometric Simulation**: Touch ID / Face ID mock sign-in.
- **Security & Registration**: Encrypted session simulation, forgot password, and new account modals.

### 2. 🩺 Patient Care Portal (`patient.html`)
- **Health Overview Dashboard**: Personalized greeting, blood type badge, and active conditions summary.
- **Live Biometric Telemetry**: Real-time trackers for Heart Rate (BPM), Blood Pressure (mmHg), Blood Oxygen (SpO2), and Fasting Glucose.
- **7-Day Telemetry Trend**: Interactive SVG sparkline chart tracking resting vitals over time.
- **Appointment Booking System**: Integrated wizard with doctor selection, calendar date picker, time slot selector, and consultation type (Telehealth Video vs In-Clinic).
- **Medication & Prescription Hub**: Active prescriptions list with pill supply progress bars and a working **1-Click Refill Request** button.
- **Diagnostic Lab Reports**: Official CMP, Lipid Panel, and 12-Lead ECG reports with PDF download simulation.
- **Care Team Chat & WebRTC Room**: Direct encrypted chat with Dr. Sarah Lin with auto-replies, plus mock HD Telehealth video rooms.

### 3. 👨‍⚕️ Doctor Clinical Dashboard (`doctor.html`)
- **Clinical Command Center**: Live metrics for Total Registered Patients, Today's Scheduled Consultations, Patients in Waiting Room, and Completed Charts.
- **Interactive Daily Patient Queue**: Filterable schedule table (Waiting, In-Consult, Confirmed, Completed) with status transition controls.
- **Slide-Over EHR Drawer**: Comprehensive Electronic Health Record viewer displaying demographics, insurance, allergies, chronic conditions, telemetry vitals, and SOAP notes history.
- **E-Prescription & SOAP Note Writer**: Interactive authoring tool to authorize medications, specify dosage instructions, and write SOAP treatment plans that **instantly sync with the patient portal in real-time via persistent local storage**.
- **Patient Directory Search**: Instant search filtering across all clinic patient charts.

---

## 📂 Project Structure

```
├── index.html           # 🔐 Unified Authentication Gateway
├── patient.html         # 🩺 Patient Care Portal
├── doctor.html          # 👨‍⚕️ Doctor Clinical Dashboard
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

## 🚀 Getting Started

### Local Setup (No Dependencies Required)

You can run this project locally using any static web server:

```bash
# Python 3
python3 -m http.server 8080

# Or open index.html directly in any modern browser
open index.html
```

---

## 🎨 Design System & Aesthetics
- **Color Palette**: Clinical Sapphire (`#0284C7`), Emerald (`#10B981`), Cyan (`#06B6D4`), Slate Dark Mode (`#090D16`, `#0F172A`).
- **Typography**: Google Fonts (*Plus Jakarta Sans* & *Outfit*).
- **Aesthetic**: Glassmorphism with `backdrop-filter: blur(16px)`, animated pulse status indicators, and smooth transitions.
- **Dark Mode**: 1-click persistent theme toggle.

---

## 📄 License
MIT License. Free for medical tech prototyping and educational use.
