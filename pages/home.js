/* ============================================
   Home Page - Dashboard
   ============================================ */

function renderHome() {
  const settings = StorageService.getSettings();
  const tasks = StorageService.getTasks().filter(t => !t.completed).slice(0, 5);
  const notes = StorageService.getNotes().slice(0, 4);
  const activity = StorageService.getActivity().slice(0, 8);
  const tokenUsage = StorageService.getTokenUsage();
  const apiKeys = StorageService.getApiKeys();
  const connectedProviders = Object.entries(apiKeys).filter(([, v]) => v.status === 'connected').length;
  const totalProviders = Object.keys(AIService.PROVIDERS).length;

  const todayTokens = tokenUsage.daily[0]?.total || 0;
  const monthKey = new Date().toISOString().substring(0, 7);
  const monthTokens = tokenUsage.monthly[monthKey]?.total || 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'อรุณสวัสดิ์' : hour < 17 ? 'สวัสดีตอนบ่าย' : 'สวัสดีตอนเย็น';

  const pendingCount = StorageService.getTasks().filter(t => !t.completed).length;
  const notesCount = StorageService.getNotes().length;
  const chatsCount = StorageService.getChats().length;

  return `
    <div class="page-enter">
      <!-- Welcome Banner -->
      <div class="glass-card mb-24" style="background: linear-gradient(135deg, rgba(37,99,235,0.12), rgba(96,165,250,0.06)); border-color: rgba(37,99,235,0.2);">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px;">
          <div>
            <div style="font-size:14px; color:var(--text-secondary); margin-bottom:4px;">${greeting} 👋</div>
            <h1 style="font-size:26px; font-weight:800; margin-bottom:6px;">ยินดีต้อนรับสู่ <span class="gradient-text">ศูนย์ผู้ช่วย AI</span></h1>
            <p style="font-size:14px; color:var(--text-secondary);">วันนี้ ${new Date().toLocaleDateString('th-TH', {weekday:'long', day:'numeric', month:'long', year:'numeric'})}</p>
          </div>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <button class="btn btn-primary" onclick="navigateTo('chat')">💬 เริ่มแชท AI</button>
            <button class="btn btn-secondary" onclick="navigateTo('agents')">🤖 เลือกผู้ช่วย</button>
          </div>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="grid-4 mb-24">
        <div class="stat-card">
          <div class="stat-label">งานที่รอดำเนินการ</div>
          <div class="stat-value">${pendingCount}</div>
          <div class="stat-change">✅ งานรอทำ</div>
          <div class="stat-icon">✅</div>
        </div>
        <div class="stat-card success">
          <div class="stat-label">Token วันนี้</div>
          <div class="stat-value">${formatNumber(todayTokens)}</div>
          <div class="stat-change">📊 จาก ${formatNumber(monthTokens)} ต่อเดือน</div>
          <div class="stat-icon">💰</div>
        </div>
        <div class="stat-card info">
          <div class="stat-label">โน้ตทั้งหมด</div>
          <div class="stat-value">${notesCount}</div>
          <div class="stat-change">📝 บันทึกไว้</div>
          <div class="stat-icon">📝</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-label">ประวัติแชท</div>
          <div class="stat-value">${chatsCount}</div>
          <div class="stat-change">🤖 การสนทนา</div>
          <div class="stat-icon">🤖</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card mb-24">
        <div class="card-header">
          <div class="card-title">⚡ Quick Actions</div>
        </div>
        <div class="quick-action-grid">
          <div class="quick-action-card" onclick="navigateTo('chat')">
            <div class="quick-action-icon">💬</div>
            <div class="quick-action-label">แชท AI ใหม่</div>
          </div>
          <div class="quick-action-card" onclick="startAgentChat('it')">
            <div class="quick-action-icon">🖥️</div>
            <div class="quick-action-label">ผู้ช่วย IT</div>
          </div>
          <div class="quick-action-card" onclick="startAgentChat('excel')">
            <div class="quick-action-icon">📊</div>
            <div class="quick-action-label">ผู้เชี่ยวชาญ Excel</div>
          </div>
          <div class="quick-action-card" onclick="startAgentChat('document')">
            <div class="quick-action-icon">📄</div>
            <div class="quick-action-label">ผู้ช่วยเอกสาร</div>
          </div>
          <div class="quick-action-card" onclick="openCreateTask()">
            <div class="quick-action-icon">✅</div>
            <div class="quick-action-label">สร้างงานใหม่</div>
          </div>
          <div class="quick-action-card" onclick="openCreateNote()">
            <div class="quick-action-icon">📝</div>
            <div class="quick-action-label">จดโน้ต</div>
          </div>
          <div class="quick-action-card" onclick="navigateTo('prompts')">
            <div class="quick-action-icon">📂</div>
            <div class="quick-action-label">คลัง Prompt</div>
          </div>
          <div class="quick-action-card" onclick="navigateTo('settings')">
            <div class="quick-action-icon">⚙️</div>
            <div class="quick-action-label">ตั้งค่า API</div>
          </div>
        </div>
      </div>

      <!-- Two Column -->
      <div class="grid-2 mb-24">
        <!-- Today's Tasks -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">✅ งานวันนี้</div>
            <button class="btn btn-sm btn-ghost" onclick="navigateTo('tasks')">ดูทั้งหมด →</button>
          </div>
          ${tasks.length === 0 ? `
            <div class="empty-state" style="padding:24px;">
              <div class="empty-state-icon">🎉</div>
              <h3>ไม่มีงานที่รอดำเนินการ</h3>
              <button class="btn btn-primary btn-sm mt-16" onclick="openCreateTask()">+ เพิ่มงาน</button>
            </div>
          ` : `
            <div class="task-board">
              ${tasks.map(t => `
                <div class="task-item" style="padding:10px 12px;">
                  <div class="task-check ${t.completed ? 'checked' : ''}" onclick="toggleTaskFromHome('${t.id}')">
                    ${t.completed ? '✓' : ''}
                  </div>
                  <div class="task-body">
                    <div class="task-title" style="font-size:13px;">${escapeHtml(t.title)}</div>
                    <div class="task-meta">
                      <span class="priority-dot priority-${t.priority || 'medium'}"></span>
                      <span>${t.dueDate ? formatDate(new Date(t.dueDate), 'date') : 'ไม่มีกำหนด'}</span>
                    </div>
                  </div>
                </div>
              `).join('')}
              <button class="btn btn-ghost btn-sm" onclick="openCreateTask()" style="width:100%; margin-top:4px;">+ เพิ่มงาน</button>
            </div>
          `}
        </div>

        <!-- Recent Notes -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">📝 โน้ตล่าสุด</div>
            <button class="btn btn-sm btn-ghost" onclick="navigateTo('notes')">ดูทั้งหมด →</button>
          </div>
          ${notes.length === 0 ? `
            <div class="empty-state" style="padding:24px;">
              <div class="empty-state-icon">📝</div>
              <h3>ยังไม่มีโน้ต</h3>
              <button class="btn btn-primary btn-sm mt-16" onclick="openCreateNote()">+ จดโน้ต</button>
            </div>
          ` : `
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${notes.map(n => `
                <div onclick="navigateTo('notes')" style="padding:10px 12px; background:var(--bg); border-radius:10px; cursor:pointer; transition:background 0.15s;" onmouseover="this.style.background='var(--card-hover)'" onmouseout="this.style.background='var(--bg)'">
                  <div style="font-size:13px; font-weight:600; margin-bottom:3px;">${escapeHtml(n.title || 'ไม่มีชื่อ')}</div>
                  <div style="font-size:12px; color:var(--text-secondary); overflow:hidden; white-space:nowrap; text-overflow:ellipsis;">${escapeHtml(truncate(n.content || '', 50))}</div>
                  <div style="font-size:11px; color:var(--text-muted); margin-top:3px;">${formatDate(new Date(n.updatedAt || n.createdAt), 'relative')}</div>
                </div>
              `).join('')}
              <button class="btn btn-ghost btn-sm" onclick="openCreateNote()" style="width:100%;">+ จดโน้ต</button>
            </div>
          `}
        </div>
      </div>

      <!-- Activity & Status -->
      <div class="grid-2">
        <!-- Recent Activity -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">🕐 กิจกรรมล่าสุด</div>
          </div>
          ${activity.length === 0 ? `
            <div style="text-align:center; padding:24px; color:var(--text-muted); font-size:13px;">ยังไม่มีกิจกรรม</div>
          ` : `
            <div class="activity-list">
              ${activity.map(a => `
                <div class="activity-item">
                  <div class="activity-icon">${a.icon}</div>
                  <div class="activity-content">
                    <div class="activity-text">${escapeHtml(a.title)}</div>
                    <div class="activity-time">${formatDate(new Date(a.time), 'relative')}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- System Status -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">🔌 สถานะระบบ</div>
          </div>
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${Object.entries(AIService.PROVIDERS).map(([id, p]) => {
              const key = StorageService.getApiKey(id);
              const keyInfo = StorageService.getApiKeys()[id];
              const status = !key ? 'none' : (keyInfo?.status || 'untested');
              const statusMap = {
                none: { dot: '⚫', label: 'ไม่มี API Key', color: 'var(--text-muted)' },
                connected: { dot: '🟢', label: 'เชื่อมต่อแล้ว', color: 'var(--success)' },
                untested: { dot: '🟡', label: 'ยังไม่ทดสอบ', color: 'var(--warning)' },
                failed: { dot: '🔴', label: 'เชื่อมต่อล้มเหลว', color: 'var(--danger)' }
              };
              const s = statusMap[status];
              return `
                <div style="display:flex; align-items:center; gap:12px; padding:10px; background:var(--bg); border-radius:10px;">
                  <span style="font-size:18px;">${p.logo}</span>
                  <div style="flex:1;">
                    <div style="font-size:13px; font-weight:600;">${p.name}</div>
                    <div style="font-size:11px; color:${s.color};">${s.dot} ${s.label}</div>
                  </div>
                  ${!key ? `<button class="btn btn-sm btn-primary" onclick="navigateTo('settings')">ตั้งค่า</button>` : ''}
                </div>
              `;
            }).join('')}
          </div>
          <div style="margin-top:12px; padding:10px; background:var(--bg); border-radius:10px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:12px; color:var(--text-secondary);">Storage ที่ใช้งาน</span>
              <span style="font-size:12px; font-weight:600;">${formatBytes(StorageService.getSize())}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function toggleTaskFromHome(id) {
  const tasks = StorageService.getTasks();
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : null;
    StorageService.saveTask(task);
    navigateTo('home');
  }
}

function openCreateTask() {
  navigateTo('tasks');
  setTimeout(() => {
    const btn = document.getElementById('create-task-btn');
    if (btn) btn.click();
  }, 100);
}

function openCreateNote() {
  navigateTo('notes');
  setTimeout(() => {
    const btn = document.getElementById('create-note-btn');
    if (btn) btn.click();
  }, 100);
}

function startAgentChat(agentType) {
  const agents = {
    it: { name: 'ผู้ช่วย IT Support', system: 'คุณเป็นผู้เชี่ยวชาญด้าน IT Support มีความรู้ด้าน Windows, Windows Server, Network, Printer, Microsoft Office และ Active Directory ตอบเป็นภาษาไทย อธิบายขั้นตอนอย่างละเอียดและชัดเจน' },
    excel: { name: 'ผู้เชี่ยวชาญ Excel', system: 'คุณเป็นผู้เชี่ยวชาญด้าน Microsoft Excel มีความรู้ด้านสูตร, Pivot Table, VBA, Dashboard และ Reporting ตอบเป็นภาษาไทย ให้ตัวอย่างสูตรที่ใช้งานได้จริง' },
    document: { name: 'ผู้ช่วยเอกสาร', system: 'คุณเป็นผู้ช่วยด้านการจัดการเอกสาร เชี่ยวชาญในการสรุป, เขียนใหม่, สร้างรายงาน และเขียนอีเมล ตอบเป็นภาษาไทย ใช้ภาษาสุภาพและเป็นทางการ' }
  };
  const agent = agents[agentType];
  if (!agent) return;
  navigateTo('chat');
  setTimeout(() => {
    if (window.ChatPage) window.ChatPage.createNewChatWithAgent(agent.name, agent.system);
  }, 150);
}
