/* ============================================
   Settings Page
   ============================================ */

function renderSettings() {
  const settings = StorageService.getSettings();
  const apiKeys = StorageService.getApiKeys();

  return `
    <div class="page-enter">
      <div class="page-header">
        <h1 class="page-title">⚙️ ตั้งค่าระบบ</h1>
        <p class="page-subtitle">จัดการการตั้งค่า API และการใช้งาน</p>
      </div>

      <div class="settings-layout">
        <!-- Settings Nav -->
        <div class="settings-nav">
          <div class="setting-group">
            <div class="settings-nav-item active" onclick="switchSettingsSection(this, 'api')">🔑 API Keys</div>
            <div class="settings-nav-item" onclick="switchSettingsSection(this, 'general')">⚙️ ทั่วไป</div>
            <div class="settings-nav-item" onclick="switchSettingsSection(this, 'appearance')">🎨 ธีม</div>
            <div class="settings-nav-item" onclick="switchSettingsSection(this, 'ai')">🤖 AI Settings</div>
            <div class="settings-nav-item" onclick="switchSettingsSection(this, 'data')">💾 ข้อมูล</div>
            <div class="settings-nav-item" onclick="switchSettingsSection(this, 'about')">ℹ️ เกี่ยวกับ</div>
          </div>
        </div>

        <!-- Settings Content -->
        <div>
          <!-- API Keys Section -->
          <div class="settings-section active" id="section-api">
            <div class="settings-section-title">🔑 API Keys</div>

            <div class="setting-group">
              <div class="setting-group-title">AI Providers</div>
              ${Object.entries(AIService.PROVIDERS).map(([id, p]) => {
                const keyInfo = apiKeys[id];
                const hasKey = !!keyInfo?.key;
                const status = hasKey ? (keyInfo?.status || 'untested') : 'none';
                const statusDisplay = {
                  none: { dot: '⚫', label: 'ไม่มี API Key', color: 'var(--text-muted)' },
                  connected: { dot: '🟢', label: 'เชื่อมต่อแล้ว', color: 'var(--success)' },
                  untested: { dot: '🟡', label: 'ยังไม่ทดสอบ', color: 'var(--warning)' },
                  failed: { dot: '🔴', label: 'ล้มเหลว', color: 'var(--danger)' }
                }[status];

                return `
                  <div class="api-key-card">
                    <div class="api-key-provider">
                      <span class="api-key-logo">${p.logo}</span>
                      <div>
                        <div class="api-key-name">${p.name}</div>
                        <div class="api-key-status" style="color:${statusDisplay.color};">${statusDisplay.dot} ${statusDisplay.label}</div>
                      </div>
                    </div>
                    <div class="api-key-value" id="key-display-${id}">
                      ${hasKey ? maskApiKey(keyInfo.key) : '— ยังไม่ตั้งค่า —'}
                    </div>
                    <div class="api-key-actions">
                      <button class="btn btn-sm btn-secondary" onclick="openApiKeyModal('${id}')">${hasKey ? '✏️ แก้ไข' : '+ เพิ่ม'}</button>
                      ${hasKey ? `
                        <button class="btn btn-sm btn-ghost" onclick="testApiKey('${id}')" title="ทดสอบ">🧪</button>
                        <button class="btn btn-sm btn-ghost" onclick="deleteApiKey('${id}')" title="ลบ" style="color:var(--danger);">🗑️</button>
                      ` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <div class="card" style="padding:16px; background:rgba(37,99,235,0.06); border-color:rgba(37,99,235,0.2);">
              <div style="font-size:13px; color:var(--text-secondary); line-height:1.7;">
                🔒 <strong>ความปลอดภัย:</strong> API Key ทั้งหมดเก็บในเครื่องของคุณผ่าน localStorage ไม่มีการส่งข้อมูลไปยัง Server ใดๆ นอกจาก AI Provider ที่เลือก
              </div>
            </div>
          </div>

          <!-- General Section -->
          <div class="settings-section" id="section-general">
            <div class="settings-section-title">⚙️ ทั่วไป</div>
            <div class="setting-group">
              <div class="setting-group-title">การตั้งค่าทั่วไป</div>
              <div class="setting-item">
                <div class="setting-item-info">
                  <div class="setting-item-label">บันทึกอัตโนมัติ</div>
                  <div class="setting-item-desc">บันทึกโน้ตและงานโดยอัตโนมัติ</div>
                </div>
                <div class="toggle ${settings.autoSave !== false ? 'on' : ''}" onclick="toggleSetting(this, 'autoSave')"></div>
              </div>
              <div class="setting-item">
                <div class="setting-item-info">
                  <div class="setting-item-label">เสียงแจ้งเตือน</div>
                  <div class="setting-item-desc">เล่นเสียงเมื่อ AI ตอบกลับ</div>
                </div>
                <div class="toggle ${settings.soundEnabled ? 'on' : ''}" onclick="toggleSetting(this, 'soundEnabled')"></div>
              </div>
            </div>
          </div>

          <!-- Appearance Section -->
          <div class="settings-section" id="section-appearance">
            <div class="settings-section-title">🎨 ธีม & การแสดงผล</div>
            <div class="setting-group">
              <div class="setting-group-title">ธีม</div>
              <div class="setting-item">
                <div class="setting-item-info">
                  <div class="setting-item-label">โหมดมืด</div>
                  <div class="setting-item-desc">ใช้ธีมสีเข้ม</div>
                </div>
                <div class="toggle ${settings.theme === 'dark' ? 'on' : ''}" onclick="toggleThemeFromSettings(this)"></div>
              </div>
            </div>
            <div class="setting-group">
              <div class="setting-group-title">Sidebar</div>
              <div class="setting-item">
                <div class="setting-item-info">
                  <div class="setting-item-label">ย่อ Sidebar</div>
                  <div class="setting-item-desc">ย่อ sidebar ให้แสดงเฉพาะไอคอน</div>
                </div>
                <div class="toggle ${settings.sidebarCollapsed ? 'on' : ''}" onclick="toggleSidebarFromSettings(this)"></div>
              </div>
            </div>
          </div>

          <!-- AI Settings Section -->
          <div class="settings-section" id="section-ai">
            <div class="settings-section-title">🤖 AI Settings</div>
            <div class="setting-group">
              <div class="setting-group-title">Provider เริ่มต้น</div>
              <div class="setting-item">
                <div class="setting-item-info">
                  <div class="setting-item-label">AI Provider</div>
                  <div class="setting-item-desc">ผู้ให้บริการ AI ที่ใช้งานเป็นหลัก</div>
                </div>
                <select class="form-input" style="max-width:160px;" onchange="updateDefaultProvider(this.value)">
                  ${Object.entries(AIService.PROVIDERS).map(([id, p]) => `
                    <option value="${id}" ${settings.defaultProvider === id ? 'selected' : ''}>${p.logo} ${p.name}</option>
                  `).join('')}
                </select>
              </div>
              <div class="setting-item">
                <div class="setting-item-info">
                  <div class="setting-item-label">โมเดลเริ่มต้น</div>
                  <div class="setting-item-desc">โมเดลที่ใช้งานเป็นหลัก</div>
                </div>
                <select class="form-input" style="max-width:200px;" id="default-model-select" onchange="updateDefaultModel(this.value)">
                  ${AIService.getModels(settings.defaultProvider || 'claude').map(m => `
                    <option value="${m.id}" ${settings.defaultModel === m.id ? 'selected' : ''}>${m.name}</option>
                  `).join('')}
                </select>
              </div>
            </div>
            <div class="setting-group">
              <div class="setting-group-title">การทำงาน</div>
              <div class="setting-item">
                <div class="setting-item-info">
                  <div class="setting-item-label">Streaming Mode</div>
                  <div class="setting-item-desc">แสดงการตอบกลับแบบ Real-time</div>
                </div>
                <div class="toggle ${settings.streamingEnabled !== false ? 'on' : ''}" onclick="toggleSetting(this, 'streamingEnabled')"></div>
              </div>
            </div>
          </div>

          <!-- Data Section -->
          <div class="settings-section" id="section-data">
            <div class="settings-section-title">💾 จัดการข้อมูล</div>
            <div class="setting-group">
              <div class="setting-group-title">Export & Import</div>
              <div class="setting-item">
                <div class="setting-item-info">
                  <div class="setting-item-label">Export ข้อมูลทั้งหมด</div>
                  <div class="setting-item-desc">ดาวน์โหลดข้อมูลทั้งหมดเป็น JSON</div>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="exportAllData()">📥 Export</button>
              </div>
              <div class="setting-item">
                <div class="setting-item-info">
                  <div class="setting-item-label">Import ข้อมูล</div>
                  <div class="setting-item-desc">นำเข้าข้อมูลจากไฟล์ JSON</div>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="importData()">📤 Import</button>
              </div>
            </div>
            <div class="setting-group">
              <div class="setting-group-title" style="color:var(--danger);">⚠️ อันตราย</div>
              <div class="setting-item">
                <div class="setting-item-info">
                  <div class="setting-item-label">ล้างประวัติแชท</div>
                  <div class="setting-item-desc">ลบแชททั้งหมด (ไม่สามารถกู้คืนได้)</div>
                </div>
                <button class="btn btn-danger btn-sm" onclick="clearChats()">🗑️ ล้างแชท</button>
              </div>
              <div class="setting-item">
                <div class="setting-item-info">
                  <div class="setting-item-label">รีเซ็ต Onboarding</div>
                  <div class="setting-item-desc">แสดง wizard ตั้งค่าเริ่มต้นอีกครั้ง</div>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="resetOnboarding()">🔄 รีเซ็ต</button>
              </div>
              <div class="setting-item">
                <div class="setting-item-info">
                  <div class="setting-item-label">ล้างข้อมูลทั้งหมด</div>
                  <div class="setting-item-desc">ลบข้อมูลทั้งหมดในระบบ (ไม่สามารถกู้คืนได้)</div>
                </div>
                <button class="btn btn-danger btn-sm" onclick="clearAllData()">💣 ล้างทั้งหมด</button>
              </div>
            </div>
            <div class="card" style="padding:16px;">
              <div style="font-size:13px; color:var(--text-secondary);">
                <strong>พื้นที่ใช้งาน:</strong> ${formatBytes(StorageService.getSize())} / ~5 MB<br>
                <div class="progress mt-8">
                  <div class="progress-bar-fill" style="width:${Math.min(100, (StorageService.getSize() / (5*1024*1024))*100).toFixed(1)}%;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- About Section -->
          <div class="settings-section" id="section-about">
            <div class="settings-section-title">ℹ️ เกี่ยวกับ</div>
            <div class="card" style="text-align:center; padding:40px;">
              <div style="font-size:56px; margin-bottom:16px; animation:float 3s ease-in-out infinite;">🤖</div>
              <h2 class="gradient-text" style="font-size:22px; margin-bottom:8px;">ศูนย์ผู้ช่วย AI อัจฉริยะ</h2>
              <p style="color:var(--text-secondary); font-size:14px; margin-bottom:16px;">ผู้ช่วยทำงานอัตโนมัติสำหรับงานเอกสาร IT และการจัดการข้อมูล</p>
              <div style="display:inline-flex; gap:8px; margin-bottom:24px;">
                <span class="badge badge-primary">v1.0.0</span>
                <span class="badge badge-success">GitHub Pages</span>
                <span class="badge badge-info">Vanilla JS</span>
              </div>
              <div class="grid-2" style="max-width:400px; margin:0 auto; text-align:left;">
                ${[
                  ['🤖', 'Claude API', 'Default AI'],
                  ['⚡', 'OpenAI', 'GPT-4o'],
                  ['🔵', 'Gemini', 'Google AI'],
                  ['🐋', 'DeepSeek', 'Budget AI']
                ].map(([icon, name, desc]) => `
                  <div style="display:flex; align-items:center; gap:8px; padding:8px; background:var(--bg); border-radius:8px; font-size:12px;">
                    <span>${icon}</span>
                    <div><div style="font-weight:600;">${name}</div><div style="color:var(--text-muted);">${desc}</div></div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function switchSettingsSection(el, id) {
  document.querySelectorAll('.settings-nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
  document.getElementById(`section-${id}`)?.classList.add('active');
}

function openApiKeyModal(provider) {
  const p = AIService.getProvider(provider);
  const keyInfo = StorageService.getApiKeys()[provider];
  const hintMap = {
    claude: 'รับ API Key ที่ console.anthropic.com',
    openai: 'รับ API Key ที่ platform.openai.com',
    gemini: 'รับ API Key ที่ aistudio.google.com',
    deepseek: 'รับ API Key ที่ platform.deepseek.com'
  };
  const body = `
    <div style="text-align:center; margin-bottom:20px;">
      <div style="font-size:40px;">${p.logo}</div>
      <div style="font-size:16px; font-weight:700; margin-top:8px;">${p.name}</div>
    </div>
    <div class="form-group">
      <label class="form-label">API Key</label>
      <div class="input-with-icon">
        <input type="password" class="form-input" id="api-key-input" placeholder="วาง API Key ที่นี่..." value="${keyInfo?.key ? keyInfo.key : ''}" />
        <button class="btn-icon" onclick="togglePasswordVisibility('api-key-input')">👁</button>
      </div>
      <div class="input-hint">${hintMap[provider] || 'ดูเอกสาร API ของผู้ให้บริการ'}</div>
    </div>
    <div class="card" style="padding:12px; background:rgba(37,99,235,0.06); border-color:rgba(37,99,235,0.2);">
      <div style="font-size:12px; color:var(--text-secondary);">🔒 API Key จะเก็บในเครื่องคุณเท่านั้น ไม่ส่งออกไปที่ใดนอกจาก ${p.name}</div>
    </div>
  `;
  const footer = `
    <button class="btn btn-ghost" onclick="closeModal()">ยกเลิก</button>
    <button class="btn btn-secondary" onclick="testApiKeyInModal('${provider}')">🧪 ทดสอบ</button>
    <button class="btn btn-primary" onclick="saveApiKeyFromModal('${provider}')">💾 บันทึก</button>
  `;
  openModal(`${p.logo} ตั้งค่า ${p.name} API Key`, body, footer);
  setTimeout(() => document.getElementById('api-key-input')?.focus(), 100);
}

async function saveApiKeyFromModal(provider) {
  const key = document.getElementById('api-key-input')?.value.trim();
  if (!key) { showToast('กรุณาใส่ API Key', 'warning'); return; }
  StorageService.saveApiKey(provider, key);
  closeModal();
  showToast(`บันทึก ${AIService.getProvider(provider).name} API Key แล้ว`, 'success');
  navigateTo('settings');
  updateApiStatus();
}

async function testApiKeyInModal(provider) {
  const key = document.getElementById('api-key-input')?.value.trim();
  if (!key) { showToast('กรุณาใส่ API Key ก่อน', 'warning'); return; }
  const savedKey = StorageService.getApiKey(provider);
  StorageService.saveApiKey(provider, key);
  showToast('กำลังทดสอบ...', 'info');
  const result = await AIService.testConnection(provider);
  if (result.success) {
    showToast(`✅ เชื่อมต่อ ${AIService.getProvider(provider).name} สำเร็จ!`, 'success');
  } else {
    if (!savedKey) StorageService.deleteApiKey(provider);
    showToast(`❌ ${result.error}`, 'error', 5000);
  }
}

async function testApiKey(provider) {
  showToast(`กำลังทดสอบ ${AIService.getProvider(provider).name}...`, 'info');
  const result = await AIService.testConnection(provider);
  if (result.success) {
    showToast(`✅ ${AIService.getProvider(provider).name} เชื่อมต่อสำเร็จ!`, 'success');
  } else {
    showToast(`❌ ${result.error}`, 'error', 5000);
  }
  navigateTo('settings');
  updateApiStatus();
}

function deleteApiKey(provider) {
  if (!confirm(`ลบ API Key ของ ${AIService.getProvider(provider).name}?`)) return;
  StorageService.deleteApiKey(provider);
  showToast('ลบ API Key แล้ว', 'success');
  navigateTo('settings');
  updateApiStatus();
}

function toggleSetting(el, key) {
  el.classList.toggle('on');
  StorageService.updateSetting(key, el.classList.contains('on'));
}

function toggleThemeFromSettings(el) {
  el.classList.toggle('on');
  const isDark = el.classList.contains('on');
  StorageService.updateSetting('theme', isDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  document.getElementById('theme-btn').textContent = isDark ? '🌙' : '☀️';
}

function toggleSidebarFromSettings(el) {
  el.classList.toggle('on');
  const collapsed = el.classList.contains('on');
  StorageService.updateSetting('sidebarCollapsed', collapsed);
  document.getElementById('sidebar').classList.toggle('collapsed', collapsed);
}

function updateDefaultProvider(provider) {
  StorageService.updateSetting('defaultProvider', provider);
  const models = AIService.getModels(provider);
  const select = document.getElementById('default-model-select');
  if (select) {
    select.innerHTML = models.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    StorageService.updateSetting('defaultModel', models[0]?.id || '');
  }
  showToast(`เปลี่ยน Provider เป็น ${AIService.getProvider(provider).name}`, 'success');
  updateApiStatus();
}

function updateDefaultModel(model) {
  StorageService.updateSetting('defaultModel', model);
}

function exportAllData() {
  const data = {
    exportDate: new Date().toISOString(),
    chats: StorageService.getChats(),
    notes: StorageService.getNotes(),
    tasks: StorageService.getTasks(),
    prompts: StorageService.getPrompts(),
    knowledge: StorageService.getKnowledge(),
    settings: StorageService.getSettings(),
    tokenUsage: StorageService.getTokenUsage()
  };
  downloadJson(data, `ai-workspace-backup-${new Date().toISOString().split('T')[0]}.json`);
  showToast('Export สำเร็จ', 'success');
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!confirm('การ Import จะเพิ่มข้อมูลเข้าในระบบ ดำเนินการต่อ?')) return;
        if (data.chats) data.chats.forEach(c => StorageService.saveChat(c));
        if (data.notes) data.notes.forEach(n => StorageService.saveNote(n));
        if (data.tasks) data.tasks.forEach(t => StorageService.saveTask(t));
        if (data.prompts) data.prompts.forEach(p => StorageService.savePrompt(p));
        if (data.knowledge) data.knowledge.forEach(k => StorageService.saveKnowledge(k));
        showToast('Import สำเร็จ', 'success');
        navigateTo('home');
      } catch { showToast('ไฟล์ไม่ถูกต้อง', 'error'); }
    };
    reader.readAsText(file);
  };
  input.click();
}

function clearChats() {
  if (!confirm('ลบแชททั้งหมด? ไม่สามารถกู้คืนได้')) return;
  StorageService.saveChats([]);
  showToast('ล้างแชทแล้ว', 'success');
}

function resetOnboarding() {
  StorageService.set('onboarding_done', false);
  showToast('รีเซ็ต Onboarding แล้ว — รีโหลดหน้าเว็บ', 'info');
}

function clearAllData() {
  if (!confirm('⚠️ ล้างข้อมูลทั้งหมด? การกระทำนี้ไม่สามารถกู้คืนได้!')) return;
  if (!confirm('คุณแน่ใจหรือ? ข้อมูลทั้งหมดรวมถึงแชท โน้ต งาน และ API Key จะถูกลบ')) return;
  StorageService.clear();
  showToast('ล้างข้อมูลทั้งหมดแล้ว', 'success');
  setTimeout(() => location.reload(), 1000);
}
