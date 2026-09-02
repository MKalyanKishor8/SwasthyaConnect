/**
 * SwasthyaConnect - 24/7 AI Clinical Triage & Immediate Response Assistant (js/chat-assistant.js)
 */

(function () {
  const assistantHTML = `
    <!-- Floating Medical Assistant Chat Widget -->
    <div id="swasthya-assistant-container">
      
      <!-- Floating Launch Button -->
      <button id="swasthya-assistant-launcher" class="assistant-btn-pulse" aria-label="Open 24/7 Medical Assistant" title="Need Immediate Help? Chat with 24/7 Medical AI">
        <div class="assistant-icon-wrap">
          <svg class="icon" style="width:24px; height:24px; color:#ffffff;" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span class="assistant-badge-dot"></span>
        </div>
        <span class="assistant-btn-text">24/7 Medical Help</span>
      </button>

      <!-- Chat Window Popup -->
      <div id="swasthya-assistant-window" class="glass-panel">
        
        <!-- Header -->
        <div class="assistant-header">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div class="brand-icon" style="width:36px; height:36px; background:var(--primary-gradient);">
              <svg class="icon" style="width:20px; height:20px;" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <div>
              <h4 style="font-size:0.95rem; margin-bottom:1px; color:var(--text-primary);">Swasthya AI Care Assistant</h4>
              <p style="font-size:0.75rem; color:var(--hospital-healing-green); margin:0;">● Online • Instant Clinical Response</p>
            </div>
          </div>
          <button id="swasthya-assistant-close" class="btn-icon" style="width:32px; height:32px;" aria-label="Close Chat">
            <svg class="icon" style="width:16px; height:16px;" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Body Messages -->
        <div id="assistant-messages-body" class="assistant-messages">
          <!-- Initial Welcome Message -->
          <div class="assistant-msg bot-msg">
            <div class="msg-author">Swasthya Care Triage</div>
            <div class="msg-bubble">
              Hello! 👋 I am your <strong>24/7 Clinical Triage Assistant</strong>. How can I assist you right now?
            </div>
            <div class="msg-time">Just now</div>
          </div>

          <!-- Quick Suggestion Chips -->
          <div id="assistant-chips-container" class="assistant-chips">
            <button class="chip-btn" onclick="sendQuickPrompt('Check my latest vitals')">🩺 Check my vitals</button>
            <button class="chip-btn" onclick="sendQuickPrompt('When is my next appointment?')">🗓️ Next appointment</button>
            <button class="chip-btn" onclick="sendQuickPrompt('How do I request a medicine refill?')">💊 Refill medicine</button>
            <button class="chip-btn" onclick="sendQuickPrompt('I have high blood pressure symptoms')">❤️ BP guidance</button>
            <button class="chip-btn chip-danger" onclick="sendQuickPrompt('I have severe chest pain or emergency')">🚨 Emergency SOS</button>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div id="assistant-typing" class="assistant-typing" style="display:none;">
          <span></span><span></span><span></span>
        </div>

        <!-- Input Bar -->
        <form id="assistant-form" class="assistant-input-bar">
          <input type="text" id="assistant-input-field" class="form-control" placeholder="Ask symptoms, medicines, lab reports, appointments..." autocomplete="off" required>
          <button type="submit" class="btn btn-primary btn-sm" style="padding:0.6rem 1rem;">
            <svg class="icon" style="width:16px; height:16px;" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>

      </div>

    </div>
  `;

  // Inject Assistant Styles
  const style = document.createElement('style');
  style.innerHTML = `
    #swasthya-assistant-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2100;
      font-family: var(--font-sans, system-ui, sans-serif);
    }

    #swasthya-assistant-launcher {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.65rem 1.15rem;
      background: var(--primary-gradient, linear-gradient(135deg, #0d9488 0%, #0284c7 100%));
      color: #ffffff;
      border: 1.5px solid rgba(255, 255, 255, 0.3);
      border-radius: 9999px;
      box-shadow: 0 8px 24px rgba(13, 148, 136, 0.45);
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    #swasthya-assistant-launcher:hover {
      transform: translateY(-3px) scale(1.03);
      box-shadow: 0 12px 30px rgba(13, 148, 136, 0.6);
    }

    .assistant-icon-wrap {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .assistant-badge-dot {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 10px;
      height: 10px;
      background: #10b981;
      border: 2px solid #ffffff;
      border-radius: 50%;
    }

    .assistant-btn-text {
      font-weight: 700;
      font-size: 0.9rem;
      letter-spacing: 0.02em;
    }

    #swasthya-assistant-window {
      position: absolute;
      bottom: 60px;
      right: 0;
      width: 380px;
      height: 520px;
      max-width: calc(100vw - 32px);
      max-height: calc(100vh - 100px);
      display: none;
      flex-direction: column;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(11, 34, 56, 0.25);
      border: 1.5px solid var(--border-light, #d8e5ee);
      background: var(--bg-surface, #ffffff);
      transform-origin: bottom right;
      animation: assistantPop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes assistantPop {
      from { opacity: 0; transform: scale(0.9) translateY(20px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    .assistant-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-light, #d8e5ee);
      background: var(--bg-surface-elevated, #ffffff);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .assistant-messages {
      flex: 1;
      padding: 1rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .assistant-msg {
      display: flex;
      flex-direction: column;
      max-width: 85%;
    }

    .assistant-msg.bot-msg {
      align-self: flex-start;
    }

    .assistant-msg.user-msg {
      align-self: flex-end;
    }

    .msg-author {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--text-muted, #627d98);
      margin-bottom: 2px;
    }

    .user-msg .msg-author {
      text-align: right;
    }

    .msg-bubble {
      padding: 0.75rem 1rem;
      border-radius: 14px;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .bot-msg .msg-bubble {
      background: var(--bg-input, #edf4f9);
      color: var(--text-primary, #0b2238);
      border-bottom-left-radius: 2px;
    }

    .user-msg .msg-bubble {
      background: var(--primary-gradient, linear-gradient(135deg, #0d9488 0%, #0284c7 100%));
      color: #ffffff;
      border-bottom-right-radius: 2px;
    }

    .msg-time {
      font-size: 0.65rem;
      color: var(--text-muted, #627d98);
      margin-top: 2px;
    }

    .user-msg .msg-time {
      text-align: right;
    }

    .assistant-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-top: 0.5rem;
    }

    .chip-btn {
      padding: 0.35rem 0.65rem;
      border-radius: 9999px;
      background: var(--bg-surface-elevated, #ffffff);
      border: 1px solid var(--border-light, #d8e5ee);
      color: var(--hospital-teal-700, #0f766e);
      font-size: 0.775rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .chip-btn:hover {
      background: var(--hospital-teal-50, #f0fdfa);
      border-color: var(--hospital-teal-500, #14b8a6);
      transform: translateY(-1px);
    }

    .chip-btn.chip-danger {
      color: #e11d48;
      border-color: rgba(225, 29, 72, 0.3);
      background: rgba(225, 29, 72, 0.06);
    }
    .chip-btn.chip-danger:hover {
      background: rgba(225, 29, 72, 0.15);
    }

    .assistant-typing {
      padding: 0.5rem 1rem;
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .assistant-typing span {
      width: 6px;
      height: 6px;
      background: var(--hospital-teal-600, #0d9488);
      border-radius: 50%;
      animation: blink 1.2s infinite ease-in-out both;
    }

    .assistant-typing span:nth-child(1) { animation-delay: -0.32s; }
    .assistant-typing span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes blink {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }

    .assistant-input-bar {
      padding: 0.75rem 1rem;
      border-top: 1px solid var(--border-light, #d8e5ee);
      background: var(--bg-surface-elevated, #ffffff);
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    @media (max-width: 480px) {
      #swasthya-assistant-window {
        right: -8px;
        width: calc(100vw - 32px);
        height: 480px;
      }
      .assistant-btn-text {
        display: none;
      }
      #swasthya-assistant-launcher {
        padding: 0.75rem;
      }
    }
  `;

  document.head.appendChild(style);

  // Inject HTML into DOM when loaded
  function initWidget() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = assistantHTML;
    document.body.appendChild(wrapper);

    const launcher = document.getElementById('swasthya-assistant-launcher');
    const win = document.getElementById('swasthya-assistant-window');
    const closeBtn = document.getElementById('swasthya-assistant-close');
    const form = document.getElementById('assistant-form');
    const input = document.getElementById('assistant-input-field');

    if (launcher && win) {
      launcher.addEventListener('click', () => {
        const isHidden = win.style.display === 'none' || win.style.display === '';
        win.style.display = isHidden ? 'flex' : 'none';
        if (isHidden && input) input.focus();
      });
    }

    if (closeBtn && win) {
      closeBtn.addEventListener('click', () => {
        win.style.display = 'none';
      });
    }

    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        handleUserMessage(text);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

  // Quick prompt handler
  window.sendQuickPrompt = function(promptText) {
    handleUserMessage(promptText);
  };

  // Immediate AI Clinical Triage Response Logic
  function handleUserMessage(query) {
    appendMessage(query, 'user');

    const typing = document.getElementById('assistant-typing');
    if (typing) typing.style.display = 'flex';

    const messagesBody = document.getElementById('assistant-messages-body');
    if (messagesBody) messagesBody.scrollTop = messagesBody.scrollHeight;

    // Simulate instant medical intelligence response
    setTimeout(() => {
      if (typing) typing.style.display = 'none';
      const botResponse = generateClinicalResponse(query);
      appendMessage(botResponse, 'bot');
    }, 600);
  }

  function appendMessage(text, sender) {
    const messagesBody = document.getElementById('assistant-messages-body');
    if (!messagesBody) return;

    const div = document.createElement('div');
    div.className = `assistant-msg ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;

    const author = sender === 'user' ? 'You' : 'Swasthya Care Triage';
    div.innerHTML = `
      <div class="msg-author">${author}</div>
      <div class="msg-bubble">${text}</div>
      <div class="msg-time">Just now</div>
    `;

    messagesBody.appendChild(div);
    messagesBody.scrollTop = messagesBody.scrollHeight;
  }

  function generateClinicalResponse(q) {
    const text = q.toLowerCase();
    const session = window.PulseCareStore ? window.PulseCareStore.getSession() : null;
    const pat = window.PulseCareStore ? (window.PulseCareStore.getPatientById(session?.id || 'pat-1') || window.PulseCareStore.getPatients()[0]) : null;

    // 1. Emergency / Chest Pain / Shortness of Breath
    if (text.includes('chest pain') || text.includes('emergency') || text.includes('breathing') || text.includes('severe') || text.includes('sos')) {
      return `
        🚨 <strong style="color:#e11d48;">CRITICAL EMERGENCY ALERT:</strong><br>
        If you or the patient are experiencing acute crushing chest pain, severe shortness of breath, sudden numbness, or facial drooping, please do not wait.<br><br>
        📞 <strong>Call 108 immediately</strong> or click the button below to dispatch a trauma ambulance:<br>
        <button class="btn btn-danger btn-sm" style="margin-top:0.5rem;" onclick="if(window.triggerEmergencySOS) window.triggerEmergencySOS();">🚨 Trigger Emergency Ambulance (108)</button>
      `;
    }

    // 2. Vitals Check
    if (text.includes('vital') || text.includes('heart rate') || text.includes('pulse') || text.includes('bp') || text.includes('blood pressure')) {
      if (pat && pat.vitals) {
        return `
          🩺 <strong>Latest Telemetry for ${pat.name}:</strong><br>
          • <strong>Blood Pressure:</strong> ${pat.vitals.bloodPressure} mmHg (Normal)<br>
          • <strong>Heart Rate:</strong> ${pat.vitals.heartRate} BPM (Normal Sinus Rhythm)<br>
          • <strong>Oxygen (SpO₂):</strong> ${pat.vitals.spO2}% (Optimal)<br>
          • <strong>Temperature:</strong> ${pat.vitals.temperature || '98.6 °F'}<br><br>
          <em>Status: All cardiovascular parameters are stable. Continue current daily routine.</em>
        `;
      }
      return `🩺 Your vitals are streaming live via Bluetooth cuff. Resting blood pressure is <strong>118/78 mmHg</strong> and pulse is <strong>72 BPM</strong>.`;
    }

    // 3. Appointments & Schedule
    if (text.includes('appointment') || text.includes('schedule') || text.includes('dr. lin') || text.includes('doctor') || text.includes('consult')) {
      return `
        🗓️ <strong>Upcoming Consultation:</strong><br>
        You have a <strong>Telehealth Video Visit</strong> with <strong>Dr. Sarah Lin, MD (Cardiologist)</strong> scheduled for <strong>Friday, Sep 04 at 10:30 AM (EDT)</strong>.<br><br>
        <button class="btn btn-emerald btn-sm" onclick="if(window.joinTelehealthRoom) window.joinTelehealthRoom('apt-101');">📹 Join Telehealth Video Room</button>
      `;
    }

    // 4. Refill / Medications
    if (text.includes('refill') || text.includes('medicine') || text.includes('prescription') || text.includes('lisinopril') || text.includes('pills') || text.includes('pharmacy')) {
      return `
        💊 <strong>Active Prescriptions & Refills:</strong><br>
        • <strong>Lisinopril 10mg:</strong> 68/90 pills remaining (3 refills left)<br>
        • <strong>Atorvastatin 20mg:</strong> 42/90 pills remaining (2 refills left)<br>
        • <strong>Omega-3 1000mg:</strong> 95/120 capsules remaining<br><br>
        You can request an instant refill directly in the <a href="patient.html#prescriptions" style="font-weight:700; color:var(--hospital-teal-600);" onclick="if(window.switchTab) window.switchTab('prescriptions');">Prescriptions Tab</a> or with your assigned pharmacy (CVS #4192).
      `;
    }

    // 5. Labs & Diagnostics
    if (text.includes('lab') || text.includes('report') || text.includes('ecg') || text.includes('blood test') || text.includes('scan') || text.includes('x-ray')) {
      return `
        📑 <strong>Diagnostic Records Available:</strong><br>
        1. <strong>Comprehensive Metabolic Panel (CMP-14):</strong> Normal (Aug 25)<br>
        2. <strong>Lipid Profile Panel:</strong> Optimal LDL 94 mg/dL (Aug 20)<br>
        3. <strong>12-Lead ECG:</strong> Normal Sinus Rhythm (Aug 15)<br><br>
        View full parameter tables & download official PDFs in the <a href="patient.html#records" style="font-weight:700; color:var(--hospital-teal-600);" onclick="if(window.switchTab) window.switchTab('records');">Medical Records Tab</a>.
      `;
    }

    // 6. Default Fallback
    return `
      🏥 <strong>Swasthya Care Assistance:</strong><br>
      I can help you review your latest vitals, schedule consultations with Dr. Sarah Lin, check medication refills, or download diagnostic lab reports.<br><br>
      For urgent clinical concerns, call our 24x7 hospital hotline at <strong>108 / +91-800-SWASTHYA</strong> or start an encrypted chat with your care team.
    `;
  }
})();
