/**
 * SwasthyaConnect - 24/7 AI Clinical Triage & Immediate Response Assistant (js/chat-assistant.js)
 * Supports Multilingual Clinical Triage: English, Hindi (हिंदी), and Telugu (తెలుగు).
 */

(function () {
  let currentLang = 'en'; // 'en', 'hi', 'te'

  const i18n = {
    en: {
      title: 'Swasthya AI Care Assistant',
      onlineStatus: '● Online • Instant Clinical Response',
      welcome: 'Hello! 👋 I am your <strong>24/7 Clinical Triage Assistant</strong>. How can I assist you right now?',
      inputPlaceholder: 'Ask symptoms, medicines, lab reports, appointments...',
      chips: [
        { text: '🩺 Check my vitals', prompt: 'Check my latest vitals' },
        { text: '🗓️ Next appointment', prompt: 'When is my next appointment?' },
        { text: '💊 Refill medicine', prompt: 'How do I request a medicine refill?' },
        { text: '❤️ BP guidance', prompt: 'I have high blood pressure symptoms' },
        { text: '🚨 Emergency SOS', prompt: 'I have severe chest pain or emergency', danger: true }
      ],
      authorBot: 'Swasthya Care Triage',
      authorUser: 'You',
      justNow: 'Just now',
      emergencyTitle: 'CRITICAL EMERGENCY ALERT:',
      emergencyText: 'If you or the patient are experiencing acute crushing chest pain, severe shortness of breath, sudden numbness, or facial drooping, please do not wait.',
      call108: 'Call 108 immediately or click below to dispatch a trauma ambulance:',
      sosBtn: '🚨 Trigger Emergency Ambulance (108)',
      vitalsTitle: 'Latest Telemetry for',
      vitalsStatus: 'Status: All cardiovascular parameters are stable. Continue current daily routine.',
      aptTitle: 'Upcoming Consultation:',
      aptBtn: '📹 Join Telehealth Video Room',
      rxTitle: 'Active Prescriptions & Refills:',
      labsTitle: 'Diagnostic Records Available:',
      fallback: 'I can help you review your latest vitals, schedule consultations with Dr. Sarah Lin, check medication refills, or download diagnostic lab reports.<br><br>For urgent clinical concerns, call our 24x7 hospital hotline at <strong>108 / +91-800-SWASTHYA</strong>.'
    },
    hi: {
      title: 'स्वास्थ्य एआई सहायक',
      onlineStatus: '● ऑनलाइन • त्वरित चिकित्सा सहायता',
      welcome: 'नमस्ते! 👋 मैं आपका <strong>24/7 स्वास्थ्य क्लिनिकल सहायक</strong> हूँ। मैं आज आपकी क्या मदद कर सकता हूँ?',
      inputPlaceholder: 'लक्षण, दवाइयाँ, लैब रिपोर्ट, अपॉइंटमेंट के बारे में पूछें...',
      chips: [
        { text: '🩺 मेरी वाइटल्स जांचें', prompt: 'मेरी वाइटल्स जांचें' },
        { text: '🗓️ अगली अपॉइंटमेंट', prompt: 'मेरी अगली अपॉइंटमेंट कब है?' },
        { text: '💊 दवा रीफिल करें', prompt: 'दवाइयाँ रीफिल कैसे करें?' },
        { text: '❤️ बीपी (BP) सलाह', prompt: 'हाई ब्लड प्रेशर में क्या करें?' },
        { text: '🚨 आपातकालीन SOS', prompt: 'मुझे सीने में तेज दर्द या इमरजेंसी है', danger: true }
      ],
      authorBot: 'स्वास्थ्य केयर सहायता',
      authorUser: 'आप',
      justNow: 'अभी-अभी',
      emergencyTitle: 'गंभीर आपातकालीन चेतावनी (CRITICAL ALERT):',
      emergencyText: 'यदि मरीज को सीने में तेज दर्द, सांस लेने में अत्यधिक तकलीफ, चक्कर या शरीर सुन्न होने की समस्या हो रही है, तो कृपया तुरंत कार्रवाई करें।',
      call108: 'तुरंत 108 पर कॉल करें या आपातकालीन एम्बुलेंस बुलाने के लिए नीचे क्लिक करें:',
      sosBtn: '🚨 आपातकालीन एम्बुलेंस बुलाएं (108)',
      vitalsTitle: 'का नवीनतम वाइटल्स रिकॉर्ड',
      vitalsStatus: 'स्थिति: सभी हृदय और स्वास्थ्य पैरामीटर सामान्य हैं। डॉक्टर के निर्देशानुसार दैनिक दिनचर्या जारी रखें।',
      aptTitle: 'आगामी डॉक्टर परामर्श:',
      aptBtn: '📹 वीडियो टेलीहेल्थ रूम में शामिल हों',
      rxTitle: 'सक्रिय दवाइयाँ और रीफिल स्थिति:',
      labsTitle: 'उपलब्ध डायग्नोस्टिक लैब रिपोर्ट:',
      fallback: 'मैं आपके वाइटल्स चेक करने, डॉ. सारा लिन के साथ अपॉइंटमेंट बुक करने, दवाओं के रीफिल या लैब रिपोर्ट डाउनलोड करने में आपकी सहायता कर सकता हूँ।<br><br>आपात स्थिति के लिए हमारी 24x7 हेल्पलाइन <strong>108 / +91-800-SWASTHYA</strong> पर कॉल करें।'
    },
    te: {
      title: 'స్వాస్థ్య AI హెల్త్ అసిస్టెంట్',
      onlineStatus: '● ఆన్‌లైన్ • తక్షణ వైద్య సహాయం',
      welcome: 'నమస్కారం! 👋 నేను మీ <strong>24/7 స్వాస్థ్య వైద్య సహాయకుడిని</strong>. మీకు ఎలా సహాయపడగలను?',
      inputPlaceholder: 'లక్షణాలు, మందులు, ల్యాబ్ రిపోర్టులు, అపాయింట్‌మెంట్ల గురించి అడగండి...',
      chips: [
        { text: '🩺 నా వైటల్స్ చూడండి', prompt: 'నా తాజా వైటల్స్ ఎలా ఉన్నాయి?' },
        { text: '🗓️ తదుపరి అపాయింట్‌మెంట్', prompt: 'నా తదుపరి డాక్టర్ అపాయింట్‌మెంట్ ఎప్పుడు?' },
        { text: '💊 మందుల రీఫిల్', prompt: 'మందులు రీఫిల్ ఎలా చేయాలి?' },
        { text: '❤️ రక్తపోటు (BP) సలహా', prompt: 'రక్తపోటు లక్షణాలు మరియు జాగ్రత్తలు' },
        { text: '🚨 అత్యవసర సహాయం', prompt: 'నాకు తీవ్రమైన ఛాతీ నొప్పి లేదా ఎమర్జెన్సీ ఉంది', danger: true }
      ],
      authorBot: 'స్వాస్థ్య కేర్ అసిస్టెంట్',
      authorUser: 'మీరు',
      justNow: 'ఇప్పుడే',
      emergencyTitle: 'తీవ్రమైన అత్యవసర హెచ్చరిక (EMERGENCY):',
      emergencyText: 'మీకు లేదా రోగికి తీవ్రమైన ఛాతీ నొప్పి, శ్వాస తీసుకోవడంలో ఇబ్బంది, అకస్మాత్తుగా శరీర భాగాలు తిమ్మిరి ఎక్కడం వంటి లక్షణాలు ఉంటే ఆలస్యం చేయవద్దు.',
      call108: 'వెంటనే 108 నంబరుకు కాల్ చేయండి లేదా అంబులెన్స్ కోసం క్రింది బటన్ నొక్కండి:',
      sosBtn: '🚨 అత్యవసర అంబులెన్స్ పిలవండి (108)',
      vitalsTitle: 'యొక్క తాజా వైటల్స్ నివేదిక',
      vitalsStatus: 'స్థితి: మీ గుండె మరియు శరీర కొలతలు సాధారణంగా ఉన్నాయి. వైద్యుల సలహా ప్రకారం మందులు వాడండి.',
      aptTitle: 'రాబోయే డాక్టర్ అపాయింట్‌మెంట్:',
      aptBtn: '📹 వీడియో టెలిహెల్త్ కన్సల్టేషన్ లో చేరండి',
      rxTitle: 'ప్రస్తుత మందులు & రీఫిల్ వివరాలు:',
      labsTitle: 'లభ్యమయ్యే డయాగ్నోస్టిక్ ల్యాబ్ రిపోర్టులు:',
      fallback: 'నేను మీ తాజా వైటల్స్ చెక్ చేయడం, డాక్టర్ సారా లిన్‌తో అపాయింట్‌మెంట్‌లు షెడ్యూల్ చేయడం, మందుల రీఫిల్ లేదా ల్యాబ్ రిపోర్ట్‌లను డౌన్‌లోడ్ చేయడంలో మీకు సహాయపడగలను.<br><br>అత్యవసర వైద్య సహాయం కొరకు మా 24x7 హెల్ప్‌లైన్ <strong>108 / +91-800-SWASTHYA</strong> కు కాల్ చేయండి.'
    }
  };

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
          <div style="display:flex; align-items:center; gap:0.6rem; flex:1; min-width:0;">
            <div class="brand-icon" style="width:34px; height:34px; background:var(--primary-gradient); flex-shrink:0;">
              <svg class="icon" style="width:18px; height:18px;" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <div style="min-width:0;">
              <h4 id="assistant-header-title" style="font-size:0.9rem; margin-bottom:1px; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Swasthya AI Care Assistant</h4>
              <p id="assistant-header-status" style="font-size:0.7rem; color:var(--hospital-healing-green); margin:0;">● Online • Instant Response</p>
            </div>
          </div>

          <!-- Language Selector -->
          <div style="display:flex; align-items:center; gap:0.35rem;">
            <select id="assistant-lang-select" class="form-control" style="padding:0.2rem 0.4rem; font-size:0.75rem; height:auto; width:auto; background:var(--bg-input); border:1px solid var(--border-light); border-radius:6px; cursor:pointer;">
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="te">తెలుగు (Telugu)</option>
            </select>
            <button id="swasthya-assistant-close" class="btn-icon" style="width:28px; height:28px;" aria-label="Close Chat">
              <svg class="icon" style="width:14px; height:14px;" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        <!-- Body Messages -->
        <div id="assistant-messages-body" class="assistant-messages">
          <!-- Initial Welcome Message -->
          <div class="assistant-msg bot-msg" id="assistant-initial-msg">
            <div class="msg-author" id="initial-msg-author">Swasthya Care Triage</div>
            <div class="msg-bubble" id="initial-msg-bubble">
              Hello! 👋 I am your <strong>24/7 Clinical Triage Assistant</strong>. How can I assist you right now?
            </div>
            <div class="msg-time">Just now</div>
          </div>

          <!-- Quick Suggestion Chips -->
          <div id="assistant-chips-container" class="assistant-chips">
            <!-- Injected via JS based on language -->
          </div>
        </div>

        <!-- Typing Indicator -->
        <div id="assistant-typing" class="assistant-typing" style="display:none;">
          <span></span><span></span><span></span>
        </div>

        <!-- Input Bar -->
        <form id="assistant-form" class="assistant-input-bar">
          <input type="text" id="assistant-input-field" class="form-control" placeholder="Ask symptoms, medicines, lab reports, appointments..." autocomplete="off" required>
          <button type="submit" class="btn btn-primary btn-sm" style="padding:0.6rem 0.85rem;">
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
      width: 390px;
      height: 540px;
      max-width: calc(100vw - 32px);
      max-height: calc(100vh - 90px);
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
      padding: 0.85rem 1.15rem;
      border-bottom: 1px solid var(--border-light, #d8e5ee);
      background: var(--bg-surface-elevated, #ffffff);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
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
      max-width: 88%;
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

  // Initialize Widget
  function initWidget() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = assistantHTML;
    document.body.appendChild(wrapper);

    const launcher = document.getElementById('swasthya-assistant-launcher');
    const win = document.getElementById('swasthya-assistant-window');
    const closeBtn = document.getElementById('swasthya-assistant-close');
    const form = document.getElementById('assistant-form');
    const input = document.getElementById('assistant-input-field');
    const langSelect = document.getElementById('assistant-lang-select');

    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        setLanguage(e.target.value);
      });
    }

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

    // Initial language setup
    setLanguage('en');
  }

  function setLanguage(lang) {
    currentLang = lang;
    const t = i18n[lang] || i18n.en;

    const titleEl = document.getElementById('assistant-header-title');
    if (titleEl) titleEl.textContent = t.title;

    const statusEl = document.getElementById('assistant-header-status');
    if (statusEl) statusEl.textContent = t.onlineStatus;

    const initialAuthor = document.getElementById('initial-msg-author');
    if (initialAuthor) initialAuthor.textContent = t.authorBot;

    const initialBubble = document.getElementById('initial-msg-bubble');
    if (initialBubble) initialBubble.innerHTML = t.welcome;

    const inputField = document.getElementById('assistant-input-field');
    if (inputField) inputField.placeholder = t.inputPlaceholder;

    // Render chips for selected language
    const chipsContainer = document.getElementById('assistant-chips-container');
    if (chipsContainer) {
      chipsContainer.innerHTML = t.chips.map(c => `
        <button class="chip-btn ${c.danger ? 'chip-danger' : ''}" onclick="sendQuickPrompt('${escapeSingleQuotes(c.prompt)}')">
          ${c.text}
        </button>
      `).join('');
    }
  }

  function escapeSingleQuotes(str) {
    return str.replace(/'/g, "\\'");
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

    const t = i18n[currentLang] || i18n.en;
    const div = document.createElement('div');
    div.className = `assistant-msg ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;

    const author = sender === 'user' ? t.authorUser : t.authorBot;
    div.innerHTML = `
      <div class="msg-author">${author}</div>
      <div class="msg-bubble">${text}</div>
      <div class="msg-time">${t.justNow}</div>
    `;

    messagesBody.appendChild(div);
    messagesBody.scrollTop = messagesBody.scrollHeight;
  }

  function generateClinicalResponse(q) {
    const text = q.toLowerCase();
    const t = i18n[currentLang] || i18n.en;
    const session = window.PulseCareStore ? window.PulseCareStore.getSession() : null;
    const pat = window.PulseCareStore ? (window.PulseCareStore.getPatientById(session?.id || 'pat-1') || window.PulseCareStore.getPatients()[0]) : null;

    // 1. Emergency / Chest Pain / Shortness of Breath
    if (
      text.includes('chest pain') || text.includes('emergency') || text.includes('breathing') || text.includes('severe') || text.includes('sos') ||
      text.includes('दर्द') || text.includes('इमरजेंसी') || text.includes('सांस') || text.includes('आपातकालीन') ||
      text.includes('నొప్పి') || text.includes('ఛాతీ') || text.includes('ఎమర్జెన్సీ') || text.includes('శ్వాస') || text.includes('అత్యవసర')
    ) {
      if (currentLang === 'hi') {
        return `
          🚨 <strong style="color:#e11d48;">गंभीर आपातकालीन चेतावनी (CRITICAL ALERT):</strong><br>
          यदि मरीज को सीने में तेज दबाव, सांस लेने में अत्यधिक तकलीफ, चक्कर या शरीर सुन्न होने की समस्या हो रही है, तो कृपया तुरंत कार्रवाई करें।<br><br>
          📞 <strong>तुरंत 108 पर कॉल करें</strong> या आपातकालीन एम्बुलेंस बुलाने के लिए नीचे क्लिक करें:<br>
          <button class="btn btn-danger btn-sm" style="margin-top:0.5rem;" onclick="if(window.triggerEmergencySOS) window.triggerEmergencySOS();">🚨 आपातकालीन एम्बुलेंस बुलाएं (108)</button>
        `;
      } else if (currentLang === 'te') {
        return `
          🚨 <strong style="color:#e11d48;">తీవ్రమైన అత్యవసర హెచ్చరిక (EMERGENCY ALERT):</strong><br>
          మీకు లేదా రోగికి తీవ్రమైన ఛాతీ నొప్పి, శ్వాస ఆడకపోవడం, తలతిరగడం లేదా అకస్మాత్తుగా శరీర భాగాలు తిమ్మిరి ఎక్కడం వంటి లక్షణాలు ఉంటే ఆలస్యం చేయవద్దు.<br><br>
          📞 <strong>వెంటనే 108 నంబరుకు కాల్ చేయండి</strong> లేదా క్రింది బటన్ నొక్కండి:<br>
          <button class="btn btn-danger btn-sm" style="margin-top:0.5rem;" onclick="if(window.triggerEmergencySOS) window.triggerEmergencySOS();">🚨 అత్యవసర అంబులెన్స్ పిలవండి (108)</button>
        `;
      } else {
        return `
          🚨 <strong style="color:#e11d48;">${t.emergencyTitle}</strong><br>
          ${t.emergencyText}<br><br>
          📞 <strong>${t.call108}</strong><br>
          <button class="btn btn-danger btn-sm" style="margin-top:0.5rem;" onclick="if(window.triggerEmergencySOS) window.triggerEmergencySOS();">${t.sosBtn}</button>
        `;
      }
    }

    // 2. Vitals Check
    if (
      text.includes('vital') || text.includes('heart rate') || text.includes('pulse') || text.includes('bp') || text.includes('blood pressure') ||
      text.includes('वाइटल्स') || text.includes('बीपी') || text.includes('ब्लड प्रेशर') || text.includes('धड़कन') ||
      text.includes('వైటల్స్') || text.includes('రక్తపోటు') || text.includes('గుండె')
    ) {
      if (currentLang === 'hi') {
        return `
          🩺 <strong>${pat ? pat.name : 'अलेक्स जॉनसन'} का नवीनतम वाइटल्स रिकॉर्ड:</strong><br>
          • <strong>रक्तचाप (Blood Pressure):</strong> ${pat?.vitals?.bloodPressure || '118/78'} mmHg (सामान्य)<br>
          • <strong>हृदय गति (Heart Rate):</strong> ${pat?.vitals?.heartRate || 72} BPM (संतुलित)<br>
          • <strong>ऑक्सीजन (SpO₂):</strong> ${pat?.vitals?.spO2 || 99}% (उत्कृष्ट)<br>
          • <strong>तापमान (Temperature):</strong> ${pat?.vitals?.temperature || '98.6 °F'}<br><br>
          <em>स्थिति: आपके सभी कार्डियोवैस्कुलर पैरामीटर स्थिर और सामान्य हैं।</em>
        `;
      } else if (currentLang === 'te') {
        return `
          🩺 <strong>${pat ? pat.name : 'అలెక్స్ జాన్సన్'} యొక్క తాజా వైటల్స్ నివేదిక:</strong><br>
          • <strong>రక్తపోటు (Blood Pressure):</strong> ${pat?.vitals?.bloodPressure || '118/78'} mmHg (సాధారణం)<br>
          • <strong>గుండె స్పందన (Heart Rate):</strong> ${pat?.vitals?.heartRate || 72} BPM (ఆప్టిమల్)<br>
          • <strong>ఆక్సిజన్ (SpO₂):</strong> ${pat?.vitals?.spO2 || 99}% (చాలా బాగుంది)<br>
          • <strong>శరీర ఉష్ణోగ్రత:</strong> ${pat?.vitals?.temperature || '98.6 °F'}<br><br>
          <em>స్థితి: మీ గుండె మరియు శరీర కొలతలు స్థిరంగా ఉన్నాయి.</em>
        `;
      } else {
        return `
          🩺 <strong>Latest Telemetry for ${pat ? pat.name : 'Patient'}:</strong><br>
          • <strong>Blood Pressure:</strong> ${pat?.vitals?.bloodPressure || '118/78'} mmHg (Normal)<br>
          • <strong>Heart Rate:</strong> ${pat?.vitals?.heartRate || 72} BPM (Normal Sinus Rhythm)<br>
          • <strong>Oxygen (SpO₂):</strong> ${pat?.vitals?.spO2 || 99}% (Optimal)<br>
          • <strong>Temperature:</strong> ${pat?.vitals?.temperature || '98.6 °F'}<br><br>
          <em>${t.vitalsStatus}</em>
        `;
      }
    }

    // 3. Appointments & Schedule
    if (
      text.includes('appointment') || text.includes('schedule') || text.includes('dr. lin') || text.includes('doctor') || text.includes('consult') ||
      text.includes('अपॉइंटमेंट') || text.includes('डॉक्टर') || text.includes('परामर्श') ||
      text.includes('అపాయింట్‌మెంట్') || text.includes('డాక్టర్') || text.includes('కన్సల్టేషన్')
    ) {
      if (currentLang === 'hi') {
        return `
          🗓️ <strong>आगामी डॉक्टर परामर्श:</strong><br>
          आपकी <strong>डॉ. सारा लिन (MD, कार्डियोलॉजिस्ट)</strong> के साथ <strong>शुक्रवार, 04 सितंबर को सुबह 10:30 बजे</strong> वीडियो टेलीहेल्थ परामर्श तय है।<br><br>
          <button class="btn btn-emerald btn-sm" onclick="if(window.joinTelehealthRoom) window.joinTelehealthRoom('apt-101');">📹 वीडियो टेलीहेल्थ रूम में शामिल हों</button>
        `;
      } else if (currentLang === 'te') {
        return `
          🗓️ <strong>రాబోయే డాక్టర్ అపాయింట్‌మెంట్:</strong><br>
          మీకు <strong>డాక్టర్ సారా లిన్ (MD, కార్డియాలజిస్ట్)</strong> గారితో <strong>శుక్రవారం, సెప్టెంబర్ 04 ఉదయం 10:30 గంటలకు</strong> టెలిహెల్త్ వీడియో కన్సల్టేషన్ ఉంది.<br><br>
          <button class="btn btn-emerald btn-sm" onclick="if(window.joinTelehealthRoom) window.joinTelehealthRoom('apt-101');">📹 వీడియో టెలిహెల్త్ రూమ్‌లో చేరండి</button>
        `;
      } else {
        return `
          🗓️ <strong>Upcoming Consultation:</strong><br>
          You have a <strong>Telehealth Video Visit</strong> with <strong>Dr. Sarah Lin, MD (Cardiologist)</strong> scheduled for <strong>Friday, Sep 04 at 10:30 AM (EDT)</strong>.<br><br>
          <button class="btn btn-emerald btn-sm" onclick="if(window.joinTelehealthRoom) window.joinTelehealthRoom('apt-101');">📹 Join Telehealth Video Room</button>
        `;
      }
    }

    // 4. Refill / Medications
    if (
      text.includes('refill') || text.includes('medicine') || text.includes('prescription') || text.includes('lisinopril') || text.includes('pills') || text.includes('pharmacy') ||
      text.includes('दवा') || text.includes('रीफिल') || text.includes('गोली') || text.includes('फार्मेसी') ||
      text.includes('మందులు') || text.includes('రీఫిల్') || text.includes('మాత్రలు') || text.includes('ఫార్మసీ')
    ) {
      if (currentLang === 'hi') {
        return `
          💊 <strong>सक्रिय दवाइयाँ और रीफिल स्थिति:</strong><br>
          • <strong>Lisinopril 10mg:</strong> 68/90 गोलियां शेष (3 रीफिल बाकी)<br>
          • <strong>Atorvastatin 20mg:</strong> 42/90 गोलियां शेष (2 रीफिल बाकी)<br>
          • <strong>Omega-3 1000mg:</strong> 95/120 कैप्सूल शेष<br><br>
          आप <a href="patient.html#prescriptions" style="font-weight:700; color:var(--hospital-teal-600);" onclick="if(window.switchTab) window.switchTab('prescriptions');">दवाइयाँ (Prescriptions) टैब</a> से 1-क्लिक में तुरंत रीफिल मंगा सकते हैं।
        `;
      } else if (currentLang === 'te') {
        return `
          💊 <strong>ప్రస్తుత మందులు & రీఫిల్ వివరాలు:</strong><br>
          • <strong>Lisinopril 10mg:</strong> 68/90 మాత్రలు మిగిలి ఉన్నాయి (3 రీఫిల్స్ మిగిలి ఉన్నాయి)<br>
          • <strong>Atorvastatin 20mg:</strong> 42/90 మాత్రలు మిగిలి ఉన్నాయి (2 రీఫిల్స్)<br>
          • <strong>Omega-3 1000mg:</strong> 95/120 క్యాప్సూల్స్ మిగిలి ఉన్నాయి<br><br>
          మీరు <a href="patient.html#prescriptions" style="font-weight:700; color:var(--hospital-teal-600);" onclick="if(window.switchTab) window.switchTab('prescriptions');">Prescriptions ట్యాబ్</a> ద్వారా 1-క్లిక్ రీఫిల్ ఆర్డర్ చేయవచ్చు.
        `;
      } else {
        return `
          💊 <strong>Active Prescriptions & Refills:</strong><br>
          • <strong>Lisinopril 10mg:</strong> 68/90 pills remaining (3 refills left)<br>
          • <strong>Atorvastatin 20mg:</strong> 42/90 pills remaining (2 refills left)<br>
          • <strong>Omega-3 1000mg:</strong> 95/120 capsules remaining<br><br>
          You can request an instant refill directly in the <a href="patient.html#prescriptions" style="font-weight:700; color:var(--hospital-teal-600);" onclick="if(window.switchTab) window.switchTab('prescriptions');">Prescriptions Tab</a>.
        `;
      }
    }

    // 5. Government Healthcare Schemes (PM-JAY, eSanjeevani, NHM, Indradhanush, JSY, NTEP)
    if (
      text.includes('scheme') || text.includes('ayushman') || text.includes('pmjay') || text.includes('pm-jay') || text.includes('esanjeevani') || text.includes('telemedicine') || text.includes('vaccin') || text.includes('indradhanush') || text.includes('jsy') || text.includes('matern') || text.includes('tb') || text.includes('nikshay') || text.includes('government') ||
      text.includes('योजना') || text.includes('आयुष्मान') || text.includes('संजीवनी') || text.includes('टीका') || text.includes('सरकारी') ||
      text.includes('పథక') || text.includes('ఆయుష్మాన్') || text.includes('సంజీవని') || text.includes('టీకా') || text.includes('ప్రభుత్వ')
    ) {
      if (currentLang === 'hi') {
        return `
          🇮🇳 <strong>सरकारी स्वास्थ्य योजनाएं (Government Healthcare Schemes):</strong><br>
          • <strong>आयुष्मान भारत (PM-JAY):</strong> पात्र परिवारों के लिए प्रति वर्ष ₹5 लाख का कैशलेस अस्पताल बीमा।<br>
          • <strong>ई-संजीवनी (eSanjeevani):</strong> सरकारी डॉक्टरों और विशेषज्ञों से 100% मुफ्त वीडियो टेली-परामर्श।<br>
          • <strong>मिशन इन्द्रधनुष:</strong> 12 जानलेवा बीमारियों से मुफ्त टीकाकरण।<br>
          • <strong>जननी सुरक्षा योजना (JSY):</strong> संस्थागत प्रसव के लिए वित्तीय सहायता।<br>
          • <strong>निक्षय पोषण योजना (NTEP):</strong> टीबी के मरीजों के लिए मुफ्त जांच, दवाएं और ₹500/माह पोषण राशि।<br><br>
          <button class="btn btn-primary btn-sm" onclick="if(window.switchTab) window.switchTab('schemes');">🏛️ सभी योजनाएं और पात्रता देखें</button>
        `;
      } else if (currentLang === 'te') {
        return `
          🇮🇳 <strong>ప్రభుత్వ ఆరోగ్య పథకాలు (Government Healthcare Schemes):</strong><br>
          • <strong>ఆయుష్మాన్ భారత్ (PM-JAY):</strong> కుటుంబానికి సంవత్సరానికి ₹5 లక్షల ఉచిత హాస్పిటల్ కవరేజ్.<br>
          • <strong>ఈ-సంజీవని (eSanjeevani):</strong> నిపుణులైన డాక్టర్లతో 100% ఉచిత ఆన్‌లైన్ వీడియో కన్సల్టేషన్.<br>
          • <strong>మిషన్ ఇంద్రధనుష్:</strong> పిల్లలు మరియు గర్భిణులకు ఉచిత ప్రాణరక్షక టీకాలు.<br>
          • <strong>జననీ సురక్ష యోజన (JSY):</strong> సురక్షిత కాన్పుల కోసం ప్రభుత్వ ఆర్థిక సహాయం.<br>
          • <strong>నక్షయ్ పోషణ్ యోజన (NTEP):</strong> టీబీ ఉచిత నిర్ధారణ, మందులు & నెలకు ₹500 పోషకాహార గ్రాంట్.<br><br>
          <button class="btn btn-primary btn-sm" onclick="if(window.switchTab) window.switchTab('schemes');">🏛️ ప్రభుత్వ పథకాల వివరాలు చూడండి</button>
        `;
      } else {
        return `
          🇮🇳 <strong>Indian Government Healthcare Schemes Available:</strong><br>
          • <strong>Ayushman Bharat (PM-JAY):</strong> ₹5,00,000 annual cashless hospital coverage per family across 28,000+ empanelled hospitals.<br>
          • <strong>eSanjeevani Teleconsultation:</strong> 100% free video consultations with government specialist doctors from home.<br>
          • <strong>Mission Indradhanush:</strong> Free immunization against 12 vaccine-preventable diseases.<br>
          • <strong>Janani Suraksha Yojana (JSY):</strong> Institutional delivery care and direct cash transfer support.<br>
          • <strong>NTEP & Ni-kshay:</strong> Free TB molecular diagnostics, DOTS treatment, and ₹500/month nutritional DBT grant.<br><br>
          <button class="btn btn-primary btn-sm" onclick="if(window.switchTab) window.switchTab('schemes');">🏛️ Explore Government Schemes & Check Eligibility</button>
        `;
      }
    }

    // 6. Fallback Response
    return t.fallback;
  }
})();
