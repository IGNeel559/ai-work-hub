/* ============================================
   Knowledge Base Page
   ============================================ */

function renderKnowledge() {
  const items = StorageService.getKnowledge();
  const categories = ['ทั้งหมด', 'IT', 'Excel', 'บัญชี', 'งานเอกสาร', 'ส่วนตัว'];

  return `
    <div class="page-enter">
      <div class="page-header">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div>
            <h1 class="page-title">📚 คลังความรู้</h1>
            <p class="page-subtitle">${items.length} เอกสาร</p>
          </div>
          <div style="display:flex; gap:10px;">
            <button class="btn btn-secondary" onclick="openKnowledgeTextModal()">📝 เพิ่มข้อความ</button>
            <button class="btn btn-primary" onclick="openKnowledgeUploadModal()">📁 อัปโหลดไฟล์</button>
          </div>
        </div>
      </div>

      <div class="knowledge-categories">
        ${categories.map((c, i) => `
          <button class="knowledge-cat ${i === 0 ? 'active' : ''}" onclick="filterKnowledge(this, '${c}')">${c}</button>
        `).join('')}
      </div>

      <div class="search-filter-bar">
        <input type="text" class="form-input" placeholder="🔍 ค้นหาเอกสาร..." oninput="searchKnowledge(this.value)" style="max-width:300px;" />
        <select class="form-input" onchange="sortKnowledge(this.value)" style="max-width:140px;">
          <option value="recent">ล่าสุด</option>
          <option value="name">ชื่อ A-Z</option>
          <option value="size">ขนาดไฟล์</option>
        </select>
      </div>

      <!-- Drop Zone -->
      <div class="drop-zone mb-24" id="knowledge-drop-zone"
        onclick="openKnowledgeUploadModal()"
        ondragover="event.preventDefault(); this.classList.add('drag-over')"
        ondragleave="this.classList.remove('drag-over')"
        ondrop="handleKnowledgeDrop(event)">
        <div class="drop-zone-icon">📁</div>
        <div class="drop-zone-text">ลากไฟล์มาวางที่นี่</div>
        <div class="drop-zone-hint">รองรับ .txt, .md, .csv, .json หรือคลิกเพื่อเลือกไฟล์</div>
      </div>

      <div class="knowledge-grid" id="knowledge-grid">
        ${renderKnowledgeGrid()}
      </div>
    </div>
  `;
}

let knowledgeFilter = { search: '', category: 'ทั้งหมด', sort: 'recent' };

function renderKnowledgeGrid() {
  let items = StorageService.getKnowledge();
  if (knowledgeFilter.search) items = items.filter(k => k.title.toLowerCase().includes(knowledgeFilter.search.toLowerCase()) || (k.content || '').toLowerCase().includes(knowledgeFilter.search.toLowerCase()));
  if (knowledgeFilter.category !== 'ทั้งหมด') items = items.filter(k => k.category === knowledgeFilter.category);
  if (knowledgeFilter.sort === 'name') items.sort((a, b) => a.title.localeCompare(b.title));
  else if (knowledgeFilter.sort === 'size') items.sort((a, b) => (b.size || 0) - (a.size || 0));

  if (items.length === 0) {
    return `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-state-icon">📚</div>
        <h3>ยังไม่มีเอกสาร</h3>
        <p>อัปโหลดไฟล์หรือเพิ่มข้อความเพื่อสร้างคลังความรู้</p>
      </div>
    `;
  }

  return items.map(k => `
    <div class="knowledge-card">
      <div class="knowledge-file-icon">${getFileIcon(k.type)}</div>
      <div class="knowledge-title">${escapeHtml(k.title)}</div>
      <div style="font-size:12px; color:var(--text-secondary); margin-bottom:10px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${escapeHtml(truncate(k.content || '', 80))}</div>
      <div class="knowledge-meta">
        <span class="badge badge-primary">${k.category || 'ทั่วไป'}</span>
        ${k.size ? `<span>${formatBytes(k.size)}</span>` : ''}
        <span>${formatDate(new Date(k.createdAt), 'relative')}</span>
      </div>
      <div style="display:flex; gap:6px; margin-top:10px;">
        <button class="btn btn-sm btn-secondary" onclick="viewKnowledgeItem('${k.id}')">👁 ดู</button>
        <button class="btn btn-sm btn-primary" onclick="useInChat('${k.id}')">💬 ใช้ใน AI</button>
        <button class="btn btn-sm btn-ghost" onclick="deleteKnowledgeItem('${k.id}')" style="color:var(--danger);">🗑️</button>
      </div>
    </div>
  `).join('');
}

function getFileIcon(type) {
  const icons = { txt: '📄', md: '📝', pdf: '📕', csv: '📊', json: '🔧', docx: '📘', xlsx: '📗', text: '📄' };
  return icons[type] || '📄';
}

function filterKnowledge(el, cat) {
  knowledgeFilter.category = cat;
  document.querySelectorAll('.knowledge-cat').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('knowledge-grid').innerHTML = renderKnowledgeGrid();
}

function searchKnowledge(value) {
  knowledgeFilter.search = value;
  document.getElementById('knowledge-grid').innerHTML = renderKnowledgeGrid();
}

function sortKnowledge(value) {
  knowledgeFilter.sort = value;
  document.getElementById('knowledge-grid').innerHTML = renderKnowledgeGrid();
}

function viewKnowledgeItem(id) {
  const item = StorageService.getKnowledge().find(k => k.id === id);
  if (!item) return;
  const body = `
    <div style="margin-bottom:12px;">
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <span class="badge badge-primary">${item.category || 'ทั่วไป'}</span>
        ${item.size ? `<span class="badge badge-muted">${formatBytes(item.size)}</span>` : ''}
        <span class="badge badge-muted">${formatDate(new Date(item.createdAt), 'date')}</span>
      </div>
    </div>
    <div style="max-height:400px; overflow-y:auto; background:var(--bg); border-radius:10px; padding:16px; font-size:13px; line-height:1.8; white-space:pre-wrap;">${escapeHtml(item.content || 'ไม่มีเนื้อหา')}</div>
  `;
  const footer = `
    <button class="btn btn-ghost" onclick="copyToClipboard(${JSON.stringify(item.content || '')})" >📋 คัดลอก</button>
    <button class="btn btn-primary" onclick="useInChat('${id}'); closeModal();">💬 ใช้ใน AI</button>
  `;
  openModal(`${getFileIcon(item.type)} ${item.title}`, body, footer);
}

function useInChat(id) {
  const item = StorageService.getKnowledge().find(k => k.id === id);
  if (!item) return;
  const text = `กรุณาช่วยวิเคราะห์เอกสารต่อไปนี้:\n\n**${item.title}**\n\n${item.content}`;
  navigateTo('chat');
  setTimeout(() => {
    if (window.ChatPage) window.ChatPage.useSuggestion(text);
  }, 200);
}

function deleteKnowledgeItem(id) {
  if (!confirm('ลบเอกสารนี้?')) return;
  StorageService.deleteKnowledge(id);
  document.getElementById('knowledge-grid').innerHTML = renderKnowledgeGrid();
  showToast('ลบเอกสารแล้ว', 'success');
}

function openKnowledgeTextModal() {
  const body = `
    <div class="form-group">
      <label class="form-label">ชื่อเอกสาร *</label>
      <input type="text" class="form-input" id="kb-title" placeholder="ชื่อเอกสาร..." />
    </div>
    <div class="form-group">
      <label class="form-label">หมวดหมู่</label>
      <select class="form-input" id="kb-cat">
        <option value="IT">IT</option>
        <option value="Excel">Excel</option>
        <option value="บัญชี">บัญชี</option>
        <option value="งานเอกสาร">งานเอกสาร</option>
        <option value="ส่วนตัว">ส่วนตัว</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">เนื้อหา *</label>
      <textarea class="form-input" id="kb-content" placeholder="วางเนื้อหาที่นี่..." rows="10"></textarea>
    </div>
    <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:4px;">
      <span style="font-size:12px; color:var(--text-muted);">แท็ก:</span>
      <input type="text" class="form-input" id="kb-tags" placeholder="tag1, tag2" style="flex:1; font-size:12px;" />
    </div>
  `;
  const footer = `
    <button class="btn btn-ghost" onclick="closeModal()">ยกเลิก</button>
    <button class="btn btn-primary" onclick="saveKnowledgeText()">💾 บันทึก</button>
  `;
  openModal('📝 เพิ่มข้อความ', body, footer);
  setTimeout(() => document.getElementById('kb-title')?.focus(), 100);
}

function saveKnowledgeText() {
  const title = document.getElementById('kb-title')?.value.trim();
  const content = document.getElementById('kb-content')?.value.trim();
  if (!title || !content) { showToast('กรุณาใส่ชื่อและเนื้อหา', 'warning'); return; }
  const item = {
    id: generateId(),
    title,
    content,
    category: document.getElementById('kb-cat')?.value || 'IT',
    tags: (document.getElementById('kb-tags')?.value || '').split(',').map(t => t.trim()).filter(Boolean),
    type: 'text',
    size: new Blob([content]).size,
    createdAt: new Date().toISOString()
  };
  StorageService.saveKnowledge(item);
  StorageService.logActivity('knowledge', `เพิ่มเอกสาร: ${title}`, '📚');
  closeModal();
  document.getElementById('knowledge-grid').innerHTML = renderKnowledgeGrid();
  showToast('เพิ่มเอกสารแล้ว', 'success');
}

function openKnowledgeUploadModal() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.txt,.md,.csv,.json';
  input.multiple = true;
  input.onchange = (e) => processKnowledgeFiles(e.target.files);
  input.click();
}

function handleKnowledgeDrop(e) {
  e.preventDefault();
  document.getElementById('knowledge-drop-zone').classList.remove('drag-over');
  processKnowledgeFiles(e.dataTransfer.files);
}

function processKnowledgeFiles(files) {
  if (!files || files.length === 0) return;
  let processed = 0;
  Array.from(files).forEach(file => {
    const ext = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();
    reader.onload = (e) => {
      const item = {
        id: generateId(),
        title: file.name.replace(/\.[^.]+$/, ''),
        content: e.target.result,
        category: 'IT',
        type: ext,
        size: file.size,
        filename: file.name,
        createdAt: new Date().toISOString()
      };
      StorageService.saveKnowledge(item);
      processed++;
      if (processed === files.length) {
        document.getElementById('knowledge-grid').innerHTML = renderKnowledgeGrid();
        showToast(`อัปโหลด ${processed} ไฟล์แล้ว`, 'success');
        StorageService.logActivity('knowledge', `อัปโหลด ${processed} ไฟล์`, '📚');
      }
    };
    reader.readAsText(file);
  });
}
