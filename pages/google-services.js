/* ============================================
   Google Services Pages (Gmail, Drive, Calendar, Sheets, Photos)
   ============================================ */

// ===== GMAIL =====
function renderGmail() {
  const emails = getMockEmails();
  const avatarColors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899'];

  return `
    <div class="page-enter">
      <div class="page-header">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div>
            <h1 class="page-title">📧 Gmail</h1>
            <p class="page-subtitle">กล่องจดหมาย</p>
          </div>
          <div style="display:flex; gap:10px;">
            <button class="btn btn-primary" onclick="showGmailConnect()">🔗 เชื่อมต่อ Gmail</button>
            <button class="btn btn-ghost btn-sm" onclick="composeEmail()">✏️ เขียนอีเมล</button>
          </div>
        </div>
      </div>

      <div class="service-connect-banner">
        <div class="service-connect-icon">📧</div>
        <div class="service-connect-content">
          <div class="service-connect-title">เชื่อมต่อ Gmail เพื่อใช้งานจริง</div>
          <div class="service-connect-desc">ขณะนี้แสดงข้อมูลตัวอย่าง • เชื่อมต่อ Google Account เพื่อดูอีเมลจริง</div>
        </div>
        <button class="btn btn-primary" onclick="showGmailConnect()">🔗 เชื่อมต่อ</button>
      </div>

      <div style="display:flex; gap:20px;">
        <!-- Gmail Sidebar -->
        <div style="width:180px; flex-shrink:0;">
          <div style="display:flex; flex-direction:column; gap:2px;">
            ${[
              { label: 'กล่องจดหมาย', icon: '📥', count: 3 },
              { label: 'ส่งแล้ว', icon: '📤', count: 0 },
              { label: 'สำคัญ', icon: '⭐', count: 2 },
              { label: 'ร่าง', icon: '📝', count: 1 },
              { label: 'สแปม', icon: '🚫', count: 0 },
              { label: 'ถังขยะ', icon: '🗑️', count: 0 }
            ].map((item, i) => `
              <div style="display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:8px; cursor:pointer; ${i === 0 ? 'background:rgba(37,99,235,0.1); color:var(--accent);' : ''} transition:background 0.15s;" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='${i===0?'rgba(37,99,235,0.1)':''}'">
                <span>${item.icon}</span>
                <span style="flex:1; font-size:13px;">${item.label}</span>
                ${item.count > 0 ? `<span style="font-size:11px; font-weight:700; background:var(--primary); color:white; padding:1px 5px; border-radius:8px;">${item.count}</span>` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Email List -->
        <div style="flex:1;">
          <div class="card" style="padding:0; overflow:hidden;">
            <div style="padding:12px 16px; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:10px;">
              <input type="text" class="form-input" placeholder="🔍 ค้นหาอีเมล..." style="max-width:300px; font-size:13px;" />
              <button class="btn btn-sm btn-ghost">กรอง ▾</button>
              <span style="margin-left:auto; font-size:12px; color:var(--text-muted);">ตัวอย่าง (Mock Data)</span>
            </div>
            <div class="email-list">
              ${emails.map(e => `
                <div class="email-item ${e.unread ? 'unread' : ''}" onclick="openEmail(${JSON.stringify(e).replace(/"/g, '&quot;')})">
                  <div class="email-avatar" style="background:${avatarColors[e.from.charCodeAt(0) % avatarColors.length]};">${e.from[0]}</div>
                  <div class="email-content">
                    <div class="email-from" style="${e.unread ? 'color:var(--text);' : ''}">${e.from}</div>
                    <div class="email-subject" style="${e.unread ? 'color:var(--text); font-weight:600;' : ''}">${e.subject}</div>
                    <div class="email-preview">${e.preview}</div>
                  </div>
                  <div class="email-meta">
                    <div class="email-time">${e.time}</div>
                    <div class="email-star">${e.starred ? '⭐' : '☆'}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getMockEmails() {
  return [
    { from: 'ผู้จัดการ IT', subject: 'อัปเดต: นโยบายความปลอดภัยใหม่', preview: 'กรุณาอ่านและปฏิบัติตามนโยบายความปลอดภัย IT ที่อัปเดตใหม่...', time: '09:15', unread: true, starred: true },
    { from: 'ทีมพัฒนา', subject: 'Deploy ระบบใหม่สำเร็จ ✅', preview: 'ระบบ Production ถูก deploy เรียบร้อยแล้ว ไม่พบ Error ใดๆ...', time: 'เมื่อวาน', unread: true, starred: false },
    { from: 'HR Department', subject: 'แบบฟอร์มประเมินผล Q4', preview: 'กรุณากรอกแบบฟอร์มประเมินผลงานประจำไตรมาส 4 ภายในวันที่...', time: 'เมื่อวาน', unread: false, starred: true },
    { from: 'Finance Team', subject: 'ใบแจ้งหนี้ประจำเดือน', preview: 'ใบแจ้งหนี้ค่าบริการ Cloud ประจำเดือนแนบมาด้วย กรุณาตรวจสอบ...', time: '2 วันที่แล้ว', unread: true, starred: false },
    { from: 'Google Workspace', subject: 'เชิญประชุมออนไลน์', preview: 'คุณได้รับเชิญเข้าร่วมประชุม Weekly Team Sync ทุกวันจันทร์...', time: '3 วันที่แล้ว', unread: false, starred: false },
    { from: 'Support Ticket', subject: '[Ticket #4521] ปัญหา VPN', preview: 'ปัญหาการเชื่อมต่อ VPN ที่รายงานได้รับการแก้ไขแล้ว...', time: '4 วันที่แล้ว', unread: false, starred: false },
    { from: 'Microsoft 365', subject: 'การต่ออายุ License', preview: 'License Microsoft 365 ของคุณจะหมดอายุใน 30 วัน กรุณาต่ออายุ...', time: 'ศ.', unread: false, starred: true },
    { from: 'IT Helpdesk', subject: 'ตอบกลับ: ปัญหาพิมพ์งาน', preview: 'ทีม IT ได้รับแจ้งปัญหาของคุณแล้ว เจ้าหน้าที่จะติดต่อกลับ...', time: 'พ.', unread: false, starred: false }
  ];
}

function openEmail(email) {
  const body = `
    <div style="margin-bottom:16px;">
      <div style="font-size:18px; font-weight:700; margin-bottom:12px;">${escapeHtml(email.subject)}</div>
      <div style="display:flex; align-items:center; gap:10px; padding:12px; background:var(--bg); border-radius:10px; margin-bottom:12px;">
        <div style="width:36px; height:36px; border-radius:50%; background:var(--primary); display:flex; align-items:center; justify-content:center; color:white; font-weight:700;">${email.from[0]}</div>
        <div>
          <div style="font-size:13px; font-weight:700;">${escapeHtml(email.from)}</div>
          <div style="font-size:11px; color:var(--text-muted);">${email.time}</div>
        </div>
      </div>
      <div style="font-size:14px; line-height:1.8; color:var(--text-secondary); padding:16px; background:var(--bg); border-radius:10px;">
        ${escapeHtml(email.preview)}<br><br>
        <em style="color:var(--text-muted);">[เนื้อหาอีเมลจริงจะแสดงเมื่อเชื่อมต่อ Gmail Account]</em>
      </div>
    </div>
  `;
  const footer = `
    <button class="btn btn-secondary" onclick="replyWithAI('${escapeHtml(email.subject)}')">🤖 ตอบด้วย AI</button>
    <button class="btn btn-ghost" onclick="closeModal()">ปิด</button>
    <button class="btn btn-primary">↩️ ตอบกลับ</button>
  `;
  openModal('📧 อ่านอีเมล', body, footer);
}

function replyWithAI(subject) {
  closeModal();
  navigateTo('chat');
  setTimeout(() => {
    if (window.ChatPage) window.ChatPage.useSuggestion(`กรุณาช่วยเขียนอีเมลตอบกลับเรื่อง: "${subject}"\n\nใช้ภาษาสุภาพและเป็นทางการ`);
  }, 200);
}

function composeEmail() {
  const body = `
    <div class="form-group"><label class="form-label">ถึง</label><input type="email" class="form-input" placeholder="อีเมลผู้รับ..." /></div>
    <div class="form-group"><label class="form-label">เรื่อง</label><input type="text" class="form-input" placeholder="หัวข้ออีเมล..." /></div>
    <div class="form-group"><label class="form-label">ข้อความ</label><textarea class="form-input" rows="8" placeholder="เขียนข้อความ..."></textarea></div>
  `;
  const footer = `
    <button class="btn btn-ghost" onclick="closeModal()">ยกเลิก</button>
    <button class="btn btn-secondary" onclick="closeModal(); navigateTo('chat')">🤖 ขอความช่วยจาก AI</button>
    <button class="btn btn-primary" onclick="closeModal(); showToast('ฟีเจอร์นี้ต้องเชื่อมต่อ Gmail', 'info');">📤 ส่ง</button>
  `;
  openModal('✏️ เขียนอีเมลใหม่', body, footer);
}

function showGmailConnect() {
  const body = `
    <div style="text-align:center;">
      <div style="font-size:48px; margin-bottom:16px;">📧</div>
      <h3 style="margin-bottom:12px;">เชื่อมต่อ Gmail</h3>
      <p style="font-size:14px; color:var(--text-secondary); margin-bottom:24px;">ฟีเจอร์นี้ต้องการ Google OAuth 2.0 และต้องรันบน Server (ไม่สามารถใช้งานบน GitHub Pages โดยตรง)</p>
      <div class="card" style="text-align:left; margin-bottom:16px;">
        <div style="font-size:13px; font-weight:700; margin-bottom:8px;">วิธีเปิดใช้งาน:</div>
        <ol style="font-size:13px; color:var(--text-secondary); padding-left:16px; line-height:2;">
          <li>Deploy บน Cloudflare Workers หรือ Supabase</li>
          <li>ตั้งค่า Google OAuth 2.0 Credentials</li>
          <li>เพิ่ม Callback URL ใน Google Console</li>
          <li>กด Authorize เพื่อเชื่อมต่อ</li>
        </ol>
      </div>
      <div class="badge badge-info">Coming Soon - Cloud Version</div>
    </div>
  `;
  openModal('🔗 เชื่อมต่อ Gmail', body, '<button class="btn btn-primary" onclick="closeModal()">เข้าใจแล้ว</button>');
}

// ===== GOOGLE DRIVE =====
function renderDrive() {
  const files = getMockDriveFiles();
  return `
    <div class="page-enter">
      <div class="page-header">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div>
            <h1 class="page-title">☁️ Google Drive</h1>
            <p class="page-subtitle">ไฟล์และโฟลเดอร์ของคุณ</p>
          </div>
          <button class="btn btn-primary" onclick="showGmailConnect()">🔗 เชื่อมต่อ Drive</button>
        </div>
      </div>

      <div class="service-connect-banner">
        <div class="service-connect-icon">☁️</div>
        <div class="service-connect-content">
          <div class="service-connect-title">เชื่อมต่อ Google Drive เพื่อใช้งานจริง</div>
          <div class="service-connect-desc">ขณะนี้แสดงข้อมูลตัวอย่าง</div>
        </div>
        <button class="btn btn-primary" onclick="showGmailConnect()">🔗 เชื่อมต่อ</button>
      </div>

      <div class="search-filter-bar">
        <input type="text" class="form-input" placeholder="🔍 ค้นหาไฟล์..." style="max-width:300px;" />
        <button class="btn btn-ghost btn-sm">🗂️ ทั้งหมด ▾</button>
        <button class="btn btn-ghost btn-sm" id="drive-view-btn" onclick="toggleDriveView()">☰ รายการ</button>
      </div>

      <div class="knowledge-grid" id="drive-grid">
        ${files.map(f => `
          <div class="knowledge-card">
            <div class="knowledge-file-icon">${getDriveIcon(f.type)}</div>
            <div class="knowledge-title">${escapeHtml(f.name)}</div>
            <div class="knowledge-meta">
              <span>${f.size}</span>
              <span>${f.modified}</span>
            </div>
            <div style="display:flex; gap:6px; margin-top:10px;">
              <button class="btn btn-sm btn-secondary">👁 ดู</button>
              <button class="btn btn-sm btn-primary" onclick="showToast('ต้องเชื่อมต่อ Google Drive', 'info');">📥 ดาวน์โหลด</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function getDriveIcon(type) {
  const icons = { doc: '📘', sheet: '📗', slide: '📙', pdf: '📕', folder: '📁', image: '🖼️', video: '🎬', other: '📄' };
  return icons[type] || '📄';
}

function getMockDriveFiles() {
  return [
    { name: 'รายงานประจำเดือน Q4', type: 'doc', size: '245 KB', modified: 'วันนี้' },
    { name: 'Budget 2024', type: 'sheet', size: '1.2 MB', modified: 'เมื่อวาน' },
    { name: 'Presentation IT Plan', type: 'slide', size: '8.5 MB', modified: '3 วันที่แล้ว' },
    { name: 'Network Diagram', type: 'image', size: '340 KB', modified: 'ส.' },
    { name: 'โฟลเดอร์ IT Documents', type: 'folder', size: '45 ไฟล์', modified: 'ม.' },
    { name: 'คู่มือระบบ.pdf', type: 'pdf', size: '2.1 MB', modified: '2 ส.' }
  ];
}

function toggleDriveView() {
  const btn = document.getElementById('drive-view-btn');
  const grid = document.getElementById('drive-grid');
  if (grid.style.display === 'flex') {
    grid.style.display = '';
    grid.className = 'knowledge-grid';
    btn.textContent = '☰ รายการ';
  } else {
    grid.style.display = 'flex';
    grid.style.flexDirection = 'column';
    grid.style.gap = '8px';
    btn.textContent = '⊞ ตาราง';
  }
}

// ===== GOOGLE CALENDAR =====
function renderCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const events = getMockCalendarEvents();

  return `
    <div class="page-enter">
      <div class="page-header">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div>
            <h1 class="page-title">📅 ปฏิทินงาน</h1>
            <p class="page-subtitle">${today.toLocaleDateString('th-TH', {month:'long', year:'numeric'})}</p>
          </div>
          <div style="display:flex; gap:10px;">
            <button class="btn btn-secondary" onclick="showGmailConnect()">🔗 Google Calendar</button>
            <button class="btn btn-primary" onclick="addCalendarEvent()">+ เพิ่มนัดหมาย</button>
          </div>
        </div>
      </div>

      <div class="service-connect-banner">
        <div class="service-connect-icon">📅</div>
        <div class="service-connect-content">
          <div class="service-connect-title">เชื่อมต่อ Google Calendar</div>
          <div class="service-connect-desc">ขณะนี้แสดงข้อมูลตัวอย่าง</div>
        </div>
        <button class="btn btn-primary" onclick="showGmailConnect()">🔗 เชื่อมต่อ</button>
      </div>

      <div class="grid-2">
        <!-- Calendar -->
        <div class="card">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
            <button class="btn btn-ghost btn-sm">◀</button>
            <div style="font-weight:700;">${today.toLocaleDateString('th-TH', {month:'long', year:'numeric'})}</div>
            <button class="btn btn-ghost btn-sm">▶</button>
          </div>
          <div class="calendar-header">
            ${['อา','จ','อ','พ','พฤ','ศ','ส'].map(d => `<div class="calendar-day-name">${d}</div>`).join('')}
          </div>
          <div class="calendar-grid">
            ${renderCalendarGrid(year, month, events)}
          </div>
        </div>

        <!-- Events List -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">📋 นัดหมายวันนี้ & ที่กำลังมา</div>
          </div>
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${events.map(e => `
              <div style="display:flex; gap:12px; padding:12px; background:var(--bg); border-radius:10px; border-left:3px solid ${e.color || 'var(--primary)'};">
                <div style="flex-shrink:0; text-align:center; min-width:40px;">
                  <div style="font-size:20px; font-weight:800;">${e.day}</div>
                  <div style="font-size:10px; color:var(--text-muted);">${e.month}</div>
                </div>
                <div style="flex:1;">
                  <div style="font-size:13px; font-weight:700; margin-bottom:3px;">${e.title}</div>
                  <div style="font-size:11px; color:var(--text-muted);">🕐 ${e.time} • 📍 ${e.location}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderCalendarGrid(year, month, events) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().getDate();
  const todayMonth = new Date().getMonth();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(`<div class="calendar-day other-month"></div>`);
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today && month === todayMonth;
    const dayEvents = events.filter(e => parseInt(e.day) === d);
    cells.push(`
      <div class="calendar-day ${isToday ? 'today' : ''}">
        <div class="calendar-day-num">${d}</div>
        ${dayEvents.slice(0, 2).map(e => `<div class="calendar-event" style="background:${e.color || 'var(--primary)'}20; color:${e.color || 'var(--primary)'};">${e.title}</div>`).join('')}
      </div>
    `);
  }
  return cells.join('');
}

function getMockCalendarEvents() {
  const today = new Date();
  return [
    { title: 'Weekly Team Sync', day: today.getDate(), month: 'ม.ค.', time: '09:00-10:00', location: 'Zoom', color: '#3B82F6' },
    { title: 'IT Security Training', day: today.getDate() + 1, month: 'ม.ค.', time: '13:00-15:00', location: 'ห้องอบรม B', color: '#8B5CF6' },
    { title: 'Project Review', day: today.getDate() + 3, month: 'ม.ค.', time: '14:00-16:00', location: 'ห้องประชุม 1', color: '#10B981' },
    { title: 'Server Maintenance', day: today.getDate() + 5, month: 'ม.ค.', time: '22:00-00:00', location: 'Data Center', color: '#F59E0B' }
  ];
}

function addCalendarEvent() {
  const body = `
    <div class="form-group"><label class="form-label">ชื่อนัดหมาย *</label><input type="text" class="form-input" placeholder="ชื่อนัดหมาย..." /></div>
    <div class="grid-2">
      <div class="form-group"><label class="form-label">วันที่</label><input type="date" class="form-input" /></div>
      <div class="form-group"><label class="form-label">เวลา</label><input type="time" class="form-input" /></div>
    </div>
    <div class="form-group"><label class="form-label">สถานที่</label><input type="text" class="form-input" placeholder="ออนไลน์ / สถานที่..." /></div>
    <div class="form-group"><label class="form-label">หมายเหตุ</label><textarea class="form-input" rows="3"></textarea></div>
  `;
  const footer = `
    <button class="btn btn-ghost" onclick="closeModal()">ยกเลิก</button>
    <button class="btn btn-primary" onclick="closeModal(); showToast('ต้องเชื่อมต่อ Google Calendar จริง', 'info');">💾 บันทึก</button>
  `;
  openModal('📅 เพิ่มนัดหมาย', body, footer);
}

// ===== GOOGLE SHEETS =====
function renderSheets() {
  return `
    <div class="page-enter">
      <div class="page-header">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div>
            <h1 class="page-title">📊 Google Sheets</h1>
            <p class="page-subtitle">สเปรดชีตของคุณ</p>
          </div>
          <button class="btn btn-primary" onclick="showGmailConnect()">🔗 เชื่อมต่อ Sheets</button>
        </div>
      </div>

      <div class="service-connect-banner">
        <div class="service-connect-icon">📊</div>
        <div class="service-connect-content">
          <div class="service-connect-title">เชื่อมต่อ Google Sheets</div>
          <div class="service-connect-desc">ขณะนี้แสดงข้อมูลตัวอย่าง</div>
        </div>
        <button class="btn btn-primary" onclick="showGmailConnect()">🔗 เชื่อมต่อ</button>
      </div>

      <!-- Quick Excel AI Actions -->
      <div class="card mb-24">
        <div class="card-header">
          <div class="card-title">🤖 Excel & Sheets AI Helper</div>
        </div>
        <div class="quick-action-grid">
          ${[
            ['📈', 'สร้างสูตร VLOOKUP', 'ช่วยสร้างสูตร VLOOKUP ให้หน่อย'],
            ['📊', 'สร้าง Pivot Table', 'อธิบายวิธีสร้าง Pivot Table'],
            ['🔢', 'แก้ไขสูตรที่ Error', 'สูตรนี้ Error ช่วยแก้ไขหน่อย: '],
            ['📉', 'สร้าง Dashboard', 'วิธีสร้าง Dashboard ใน Excel'],
            ['🤖', 'เขียน VBA Macro', 'เขียน VBA Macro สำหรับ'],
            ['📋', 'สร้าง Template', 'ช่วยสร้าง Template รายงาน']
          ].map(([icon, label, prompt]) => `
            <div class="quick-action-card" onclick="useExcelAI(${JSON.stringify(prompt)})">
              <div class="quick-action-icon">${icon}</div>
              <div class="quick-action-label">${label}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Spreadsheet List -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">📋 สเปรดชีตล่าสุด (ตัวอย่าง)</div>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${[
            { name: 'รายงานยอดขาย 2024', modified: 'วันนี้', size: '245 KB' },
            { name: 'Budget IT Department', modified: 'เมื่อวาน', size: '1.1 MB' },
            { name: 'Inventory Tracking', modified: '3 วันที่แล้ว', size: '560 KB' },
            { name: 'Employee Data', modified: '1 ส.', size: '890 KB' }
          ].map(f => `
            <div style="display:flex; align-items:center; gap:14px; padding:12px; background:var(--bg); border-radius:10px; cursor:pointer; transition:background 0.15s;" onmouseover="this.style.background='var(--card-hover)'" onmouseout="this.style.background='var(--bg)'">
              <span style="font-size:28px;">📗</span>
              <div style="flex:1;">
                <div style="font-size:14px; font-weight:600;">${f.name}</div>
                <div style="font-size:11px; color:var(--text-muted);">แก้ไขล่าสุด: ${f.modified} • ${f.size}</div>
              </div>
              <button class="btn btn-sm btn-primary" onclick="showToast('เปิดสเปรดชีต (ต้องเชื่อมต่อ)', 'info');">เปิด</button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function useExcelAI(prompt) {
  navigateTo('chat');
  setTimeout(() => {
    if (window.ChatPage) {
      window.ChatPage.createNewChatWithAgent('ผู้เชี่ยวชาญ Excel', 'คุณเป็นผู้เชี่ยวชาญ Microsoft Excel และ Google Sheets ด้านสูตร, Pivot Table, VBA, Dashboard ตอบเป็นภาษาไทย ให้ตัวอย่างสูตรที่ใช้ได้จริง');
      setTimeout(() => window.ChatPage.useSuggestion(prompt), 200);
    }
  }, 150);
}

// ===== GOOGLE PHOTOS =====
function renderPhotos() {
  const photos = getMockPhotos();
  return `
    <div class="page-enter">
      <div class="page-header">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div>
            <h1 class="page-title">📸 Google Photos</h1>
            <p class="page-subtitle">รูปภาพและวิดีโอ</p>
          </div>
          <button class="btn btn-primary" onclick="showGmailConnect()">🔗 เชื่อมต่อ Photos</button>
        </div>
      </div>

      <div class="service-connect-banner">
        <div class="service-connect-icon">📸</div>
        <div class="service-connect-content">
          <div class="service-connect-title">เชื่อมต่อ Google Photos</div>
          <div class="service-connect-desc">ขณะนี้แสดงข้อมูลตัวอย่าง</div>
        </div>
        <button class="btn btn-primary" onclick="showGmailConnect()">🔗 เชื่อมต่อ</button>
      </div>

      <div style="display:flex; gap:4px; margin-bottom:16px; flex-wrap:wrap;">
        ${['ทั้งหมด', 'ล่าสุด', 'อัลบั้ม', 'โปรด'].map((label, i) => `
          <button class="knowledge-cat ${i === 0 ? 'active' : ''}" onclick="this.parentElement.querySelectorAll('.knowledge-cat').forEach(b=>b.classList.remove('active')); this.classList.add('active')">${label}</button>
        `).join('')}
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(160px, 1fr)); gap:8px;">
        ${photos.map(p => `
          <div style="aspect-ratio:1; background:${p.color}; border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; transition:transform 0.2s; position:relative; overflow:hidden;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
            <span style="font-size:40px;">${p.icon}</span>
            <div style="position:absolute; bottom:0; left:0; right:0; padding:8px; background:linear-gradient(transparent, rgba(0,0,0,0.6)); color:white;">
              <div style="font-size:11px; font-weight:600;">${p.name}</div>
              <div style="font-size:10px; opacity:0.8;">${p.date}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function getMockPhotos() {
  const icons = ['🖥️', '🖨️', '🔧', '📡', '💻', '⌨️', '🖱️', '📱', '🔌', '📷', '🎮', '🖲️'];
  const colors = ['#1E293B', '#0F172A', '#1a2744', '#162032', '#1f1635', '#1a2a1a'];
  return Array.from({length: 12}, (_, i) => ({
    icon: icons[i],
    name: `ภาพที่ ${i+1}`,
    date: `${i + 1} ม.ค.`,
    color: colors[i % colors.length]
  }));
}
