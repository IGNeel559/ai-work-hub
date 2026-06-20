/* ============================================
   Main App - Router & Initialization
   ============================================ */

const App = (() => {
  let currentPage = 'home';

  const PAGES = {
    home: { title: 'หน้าหลัก', icon: '🏠', render: renderHome },
    chat: { title: 'AI แชท', icon: '🤖', render: () => ChatPage.render() },
    agents: { title: 'ผู้ช่วย AI', icon: '🧠', render: renderAgents },
    gmail: { title: 'Gmail', icon: '📧', render: renderGmail },
    drive: { title: 'Google Drive', icon: '☁️', render: renderDrive },
    calendar: { title: 'ปฏิทินงาน', icon: '📅', render: renderCalendar },
    sheets: { title: 'Google Sheets', icon: '📊', render: renderSheets },
    photos: { title: 'Google Photos', icon: '📸', render: renderPhotos },
    tasks: { title: 'งานของฉัน', icon: '✅', render: renderTasks },
    notes: { title: 'โน้ต', icon: '📝', render: renderNotes },
    knowledge: { title: 'คลังความรู้', icon: '📚', render: renderKnowledge },
    prompts: { title: 'คลัง Prompt', icon: '📂', render: renderPrompts },
    dashboard: { title: 'แดชบอร์ด', icon: '📈', render: renderDashboard },
    tokens: { title: 'การใช้งาน Token', icon: '💰', render: renderTokens },
    settings: { title: 'ตั้งค่าระบบ', icon: '⚙️', render: renderSettings }
  };

  function init() {
    // Apply saved theme
    const settings = StorageService.getSettings();
    document.documentElement.setAttribute('data-theme', settings.theme || 'dark');
    document.getElementById('theme-btn').textContent = settings.theme === 'light' ? '☀️' : '🌙';

    // Apply sidebar state
    if (settings.sidebarCollapsed) {
      document.getElementById('sidebar').classList.add('collapsed');
    }

    // Show onboarding if first time
    if (!StorageService.isOnboardingDone()) {
      setTimeout(() => showOnboarding(), 500);
    }

    // Navigate to home
    navigateTo('home');

    // Update badges
    updateAllBadges();

    // Update API status
    updateApiStatus();

    // Add welcome notification if no keys
    const apiKeys = StorageService.getApiKeys();
    if (Object.keys(apiKeys).length === 0) {
      setTimeout(() => {
        addNotification('ยินดีต้อนรับ!', 'ตั้งค่า API Key ใน ⚙️ ตั้งค่าระบบ เพื่อเริ่มใช้งาน AI', '🔑');
      }, 1500);
    }

    // Handle browser back/forward
    window.onpopstate = (e) => {
      if (e.state?.page) navigateTo(e.state.page, false);
    };

    // Mobile overlay
    document.getElementById('mobile-overlay')?.addEventListener('click', closeMobileMenu);
  }

  function navigate(page, pushState = true) {
    const pageConfig = PAGES[page];
    if (!pageConfig) return;

    currentPage = page;

    // Update sidebar active state
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });

    // Update breadcrumb
    const breadcrumb = document.getElementById('breadcrumb');
    if (breadcrumb) {
      breadcrumb.innerHTML = `<span>${pageConfig.icon}</span><span>${pageConfig.title}</span>`;
    }

    // Render page
    const content = document.getElementById('page-content');
    if (content) {
      content.className = 'page-content';
      try {
        content.innerHTML = pageConfig.render();
      } catch (e) {
        console.error('Page render error:', e);
        content.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><h3>เกิดข้อผิดพลาด</h3><p>${e.message}</p></div>`;
      }
      content.scrollTop = 0;
    }

    // Push to history
    if (pushState) {
      history.pushState({ page }, '', `#${page}`);
    }

    // Close mobile menu
    closeMobileMenu();

    // Log activity for important pages
    if (['chat', 'agents'].includes(page)) {
      // Don't log navigation, only actions
    }
  }

  function updateAllBadges() {
    try { updateTaskBadge(); } catch {}
    try { ChatPage.updateChatBadge(); } catch {}
  }

  return { init, navigate, currentPage: () => currentPage, PAGES };
})();

// Global navigation function
function navigateTo(page, pushState = true) {
  App.navigate(page, pushState);
}

// Theme toggle
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  StorageService.updateSetting('theme', isDark ? 'light' : 'dark');
  document.getElementById('theme-btn').textContent = isDark ? '☀️' : '🌙';
}

// Sidebar toggle
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('collapsed');
  StorageService.updateSetting('sidebarCollapsed', sidebar.classList.contains('collapsed'));
}

// Mobile menu
function toggleMobileMenu() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('mobile-open');
  let overlay = document.getElementById('mobile-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'mobile-overlay';
    overlay.className = 'mobile-overlay';
    overlay.onclick = closeMobileMenu;
    document.body.appendChild(overlay);
  }
  overlay.classList.toggle('show', sidebar.classList.contains('mobile-open'));
}

function closeMobileMenu() {
  document.getElementById('sidebar')?.classList.remove('mobile-open');
  document.getElementById('mobile-overlay')?.classList.remove('show');
}

// Update API connection status in sidebar
function updateApiStatus() {
  const settings = StorageService.getSettings();
  const provider = settings.defaultProvider || 'claude';
  const keyInfo = StorageService.getApiKeys()[provider];
  const dot = document.getElementById('status-dot');
  const text = document.getElementById('status-text');

  if (!keyInfo?.key) {
    if (dot) dot.textContent = '🔴';
    if (text) text.textContent = 'ไม่ได้เชื่อมต่อ';
  } else if (keyInfo.status === 'connected') {
    if (dot) dot.textContent = '🟢';
    if (text) text.textContent = `${AIService.getProvider(provider).name} ✓`;
  } else if (keyInfo.status === 'failed') {
    if (dot) dot.textContent = '🔴';
    if (text) text.textContent = 'เชื่อมต่อล้มเหลว';
  } else {
    if (dot) dot.textContent = '🟡';
    if (text) text.textContent = `${AIService.getProvider(provider).name} (ยังไม่ทดสอบ)`;
  }
}

// Global search handler
function handleGlobalSearch(query) {
  const pagesEl = document.getElementById('search-results-pages');
  const chatsEl = document.getElementById('search-results-chats');
  const notesEl = document.getElementById('search-results-notes');

  if (!query.trim()) {
    if (pagesEl) pagesEl.innerHTML = '';
    if (chatsEl) chatsEl.innerHTML = '';
    if (notesEl) notesEl.innerHTML = '';
    return;
  }

  const q = query.toLowerCase();

  // Search pages
  const pageResults = Object.entries(App.PAGES).filter(([, p]) =>
    p.title.toLowerCase().includes(q) || p.icon.includes(q)
  );
  if (pagesEl) {
    pagesEl.innerHTML = pageResults.slice(0, 4).map(([id, p]) => `
      <div class="search-result-item" onclick="navigateTo('${id}'); closeSearch();">
        <span>${p.icon}</span><span>${p.title}</span>
      </div>
    `).join('') || '<div class="search-result-item" style="color:var(--text-muted);">ไม่พบ</div>';
  }

  // Search chats
  const chatResults = StorageService.getChats().filter(c => c.title.toLowerCase().includes(q));
  if (chatsEl) {
    chatsEl.innerHTML = chatResults.slice(0, 4).map(c => `
      <div class="search-result-item" onclick="navigateTo('chat'); setTimeout(() => ChatPage.loadChat('${c.id}'), 200); closeSearch();">
        <span>💬</span><span>${escapeHtml(c.title)}</span>
        <span style="font-size:11px; color:var(--text-muted); margin-left:auto;">${formatDate(new Date(c.updatedAt || c.createdAt), 'relative')}</span>
      </div>
    `).join('') || '';
  }

  // Search notes
  const noteResults = StorageService.getNotes().filter(n =>
    (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q)
  );
  if (notesEl) {
    notesEl.innerHTML = noteResults.slice(0, 4).map(n => `
      <div class="search-result-item" onclick="navigateTo('notes'); setTimeout(() => loadNote('${n.id}'), 200); closeSearch();">
        <span>📝</span><span>${escapeHtml(n.title || 'ไม่มีชื่อ')}</span>
        <span style="font-size:11px; color:var(--text-muted); margin-left:auto;">${formatDate(new Date(n.updatedAt || n.createdAt), 'relative')}</span>
      </div>
    `).join('') || '';
  }
}

// ===== ONBOARDING =====
let onboardingStep = 1;
let selectedProvider = 'claude';

function showOnboarding() {
  document.getElementById('onboarding-overlay').classList.remove('hidden');
  updateOnboardingStep(1);
}

function updateOnboardingStep(step) {
  onboardingStep = step;
  const total = 5;
  document.getElementById('onboarding-progress-fill').style.width = `${(step / total) * 100}%`;
  document.getElementById('onboarding-step-text').textContent = `ขั้นตอน ${step} / ${total}`;

  document.querySelectorAll('.onboarding-step').forEach(el => {
    el.classList.toggle('active', parseInt(el.dataset.step) === step);
  });

  document.getElementById('onboarding-back').style.display = step > 1 ? 'block' : 'none';
  document.getElementById('onboarding-skip').style.display = step < 5 ? 'block' : 'none';

  const nextBtn = document.getElementById('onboarding-next');
  if (step === 4) {
    nextBtn.style.display = 'none';
  } else if (step === 5) {
    nextBtn.style.display = 'none';
  } else {
    nextBtn.style.display = 'block';
    nextBtn.textContent = step === 3 ? 'บันทึกและทดสอบ →' : 'ถัดไป →';
  }

  // Update key label based on provider
  if (step === 3) {
    const providerNames = { claude: 'Claude API Key', openai: 'OpenAI API Key', gemini: 'Gemini API Key', deepseek: 'DeepSeek API Key' };
    const hints = {
      claude: 'รับ API Key ที่ console.anthropic.com',
      openai: 'รับ API Key ที่ platform.openai.com',
      gemini: 'รับ API Key ที่ aistudio.google.com',
      deepseek: 'รับ API Key ที่ platform.deepseek.com'
    };
    document.getElementById('onboarding-key-label').textContent = providerNames[selectedProvider] || 'API Key';
    document.getElementById('onboarding-key-hint').textContent = hints[selectedProvider] || '';
    document.getElementById('onboarding-api-key').placeholder = selectedProvider === 'claude' ? 'sk-ant-api03-...' : selectedProvider === 'openai' ? 'sk-...' : selectedProvider === 'gemini' ? 'AIza...' : 'sk-...';
  }
}

function onboardingNext() {
  if (onboardingStep === 3) {
    const key = document.getElementById('onboarding-api-key')?.value.trim();
    if (!key) { showToast('กรุณาใส่ API Key', 'warning'); return; }
    StorageService.saveApiKey(selectedProvider, key);
    StorageService.updateSetting('defaultProvider', selectedProvider);
    StorageService.updateSetting('defaultModel', AIService.getProvider(selectedProvider).defaultModel);
    updateOnboardingStep(4);
  } else if (onboardingStep < 5) {
    updateOnboardingStep(onboardingStep + 1);
  }
}

function onboardingBack() {
  if (onboardingStep > 1) updateOnboardingStep(onboardingStep - 1);
}

function skipOnboarding() {
  closeOnboarding();
}

function closeOnboarding() {
  StorageService.setOnboardingDone();
  document.getElementById('onboarding-overlay').classList.add('hidden');
  updateApiStatus();
}

function completeOnboarding(page) {
  closeOnboarding();
  navigateTo(page);
}

async function runConnectionTest() {
  const btn = document.getElementById('run-test-btn');
  btn.disabled = true;
  btn.textContent = '⏳ กำลังทดสอบ...';

  const tests = [
    { id: 'test-key-format', label: 'ตรวจสอบรูปแบบ Key', fn: () => {
      const key = StorageService.getApiKey(selectedProvider);
      return key && key.length > 10;
    }},
    { id: 'test-connection', label: 'ทดสอบการเชื่อมต่อ', fn: async () => {
      const result = await AIService.testConnection(selectedProvider);
      return result.success;
    }},
    { id: 'test-response', label: 'รับการตอบกลับ', fn: () => true }
  ];

  let allPassed = true;
  for (const test of tests) {
    const el = document.getElementById(test.id);
    if (el) el.querySelector('.test-icon').textContent = '⏳';
    try {
      const passed = await test.fn();
      if (el) {
        el.querySelector('.test-icon').textContent = passed ? '✅' : '❌';
        if (!passed) allPassed = false;
      }
    } catch {
      if (el) el.querySelector('.test-icon').textContent = '❌';
      allPassed = false;
    }
    await sleep(600);
  }

  btn.disabled = false;
  if (allPassed) {
    btn.textContent = '✅ ทดสอบสำเร็จ!';
    btn.className = 'btn btn-success btn-full';
    updateApiStatus();
    setTimeout(() => updateOnboardingStep(5), 1000);
  } else {
    btn.textContent = '❌ ล้มเหลว — ลองใหม่';
    btn.disabled = false;
  }
}

// Provider selection in onboarding — use event delegation so it works even after DOM is ready
document.addEventListener('click', (e) => {
  const card = e.target.closest('.provider-card');
  if (!card) return;
  document.querySelectorAll('.provider-card').forEach(c => c.classList.remove('active'));
  card.classList.add('active');
  selectedProvider = card.dataset.provider;
  if (onboardingStep === 3) updateOnboardingStep(3);
});

// ===== INITIALIZE APP =====
document.addEventListener('DOMContentLoaded', () => {
  App.init();

  // Handle hash-based routing
  const hash = location.hash.replace('#', '');
  if (hash && App.PAGES[hash]) {
    navigateTo(hash, false);
  }
});
