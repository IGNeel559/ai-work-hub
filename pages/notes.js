/* ============================================
   Notes Page
   ============================================ */

let currentNoteId = null;
let noteAutoSaveTimer = null;

function renderNotes() {
  const notes = StorageService.getNotes();
  const categories = ['ทั้งหมด', 'IT', 'Excel', 'งานเอกสาร', 'โครงการ', 'ส่วนตัว', 'อื่นๆ'];

  return `
    <div class="page-enter" style="height:calc(100vh - 108px); display:flex; flex-direction:column;">
      <div class="page-header" style="flex-shrink:0;">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div>
            <h1 class="page-title">📝 โน้ต</h1>
            <p class="page-subtitle">${notes.length} โน้ต</p>
          </div>
          <button class="btn btn-primary" id="create-note-btn" onclick="openNewNote()">+ โน้ตใหม่</button>
        </div>
      </div>

      <div style="display:flex; gap:4px; margin-bottom:16px; flex-wrap:wrap; flex-shrink:0;">
        ${categories.map((c, i) => `
          <button class="knowledge-cat ${i === 0 ? 'active' : ''}" onclick="filterNotesByCategory(this, '${c}')">${c}</button>
        `).join('')}
      </div>

      <div class="search-filter-bar" style="flex-shrink:0;">
        <input type="text" class="form-input" placeholder="🔍 ค้นหาโน้ต..." oninput="searchNotes(this.value)" style="max-width:300px;" />
      </div>

      <div style="flex:1; overflow:hidden; display:flex; gap:20px;">
        <!-- Notes List -->
        <div style="width:300px; min-width:300px; overflow-y:auto;" id="notes-list">
          ${renderNotesList()}
        </div>
        <!-- Note Editor -->
        <div style="flex:1; overflow:hidden;" id="note-editor-area">
          ${renderNoteEditorEmpty()}
        </div>
      </div>
    </div>
  `;
}

function renderNotesList(filter = '', category = 'ทั้งหมด') {
  let notes = StorageService.getNotes();
  if (filter) notes = notes.filter(n => (n.title || '').toLowerCase().includes(filter.toLowerCase()) || (n.content || '').toLowerCase().includes(filter.toLowerCase()));
  if (category !== 'ทั้งหมด') notes = notes.filter(n => n.category === category);

  if (notes.length === 0) {
    return `
      <div class="empty-state" style="padding:32px 16px;">
        <div class="empty-state-icon">📝</div>
        <h3>${filter ? 'ไม่พบโน้ต' : 'ยังไม่มีโน้ต'}</h3>
        <p>คลิก + โน้ตใหม่ เพื่อเริ่มเขียน</p>
      </div>
    `;
  }

  return notes.map(n => `
    <div class="note-card ${n.id === currentNoteId ? 'active' : ''}" onclick="loadNote('${n.id}')" style="${n.id === currentNoteId ? 'border-color:var(--primary); background:rgba(37,99,235,0.06);' : ''} margin-bottom:8px;">
      <div class="note-card-header">
        <div class="note-title">${escapeHtml(n.title || 'ไม่มีชื่อ')}</div>
        <div class="note-actions">
          <button onclick="event.stopPropagation(); deleteNote('${n.id}')" style="padding:3px 6px; border-radius:5px; font-size:12px; color:var(--danger);">🗑️</button>
        </div>
      </div>
      <div class="note-preview">${escapeHtml(n.content || '')}</div>
      <div class="note-footer">
        ${n.category ? `<span class="note-category">${n.category}</span>` : '<span></span>'}
        <span>${formatDate(new Date(n.updatedAt || n.createdAt), 'relative')}</span>
      </div>
    </div>
  `).join('');
}

function renderNoteEditorEmpty() {
  return `
    <div class="empty-state" style="height:100%;">
      <div class="empty-state-icon">📝</div>
      <h3>เลือกโน้ตที่ต้องการแก้ไข</h3>
      <p>หรือสร้างโน้ตใหม่</p>
      <button class="btn btn-primary mt-16" onclick="openNewNote()">+ โน้ตใหม่</button>
    </div>
  `;
}

function renderNoteEditor(note) {
  const categories = ['IT', 'Excel', 'งานเอกสาร', 'โครงการ', 'ส่วนตัว', 'อื่นๆ'];
  return `
    <div style="height:100%; display:flex; flex-direction:column; background:var(--card); border:1px solid var(--border); border-radius:16px; overflow:hidden;">
      <div style="padding:16px; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:12px; flex-shrink:0;">
        <select class="form-input" id="note-cat-select" style="max-width:140px; font-size:12px;" onchange="updateNoteCategory(this.value)">
          <option value="">ไม่มีหมวดหมู่</option>
          ${categories.map(c => `<option value="${c}" ${note.category === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
        <span style="font-size:11px; color:var(--text-muted); margin-left:auto;" id="note-save-status">บันทึกอัตโนมัติ</span>
        <button class="btn btn-sm btn-ghost" onclick="copyToClipboard(getNoteContent())" title="คัดลอก">📋</button>
        <button class="btn btn-sm btn-ghost" onclick="downloadNote()" title="ดาวน์โหลด">📥</button>
        <button class="btn btn-sm btn-danger" onclick="deleteNote('${note.id}')">🗑️ ลบ</button>
      </div>
      <div style="padding:20px; flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:12px;">
        <input
          type="text"
          class="note-editor-title form-input"
          id="note-title-input"
          placeholder="ชื่อโน้ต..."
          value="${escapeHtml(note.title || '')}"
          oninput="scheduleNoteSave()"
          style="font-size:20px; font-weight:800; border:none; background:none; padding:0;"
        />
        <div class="divider"></div>
        <textarea
          class="note-editor-body"
          id="note-content-input"
          placeholder="เริ่มเขียนโน้ตที่นี่...\n\nรองรับ Markdown:\n**ตัวหนา** *ตัวเอียง* \`code\`\n# หัวข้อใหญ่\n## หัวข้อรอง\n- รายการ"
          oninput="scheduleNoteSave()"
        >${escapeHtml(note.content || '')}</textarea>
      </div>
    </div>
  `;
}

function openNewNote() {
  const note = {
    id: generateId(),
    title: '',
    content: '',
    category: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  StorageService.saveNote(note);
  currentNoteId = note.id;
  refreshNoteUI(note);
}

function loadNote(id) {
  const note = StorageService.getNotes().find(n => n.id === id);
  if (!note) return;
  currentNoteId = id;
  refreshNoteUI(note);
}

function refreshNoteUI(note) {
  const editorArea = document.getElementById('note-editor-area');
  if (editorArea) editorArea.innerHTML = renderNoteEditor(note);
  const list = document.getElementById('notes-list');
  if (list) {
    const items = list.querySelectorAll('.note-card');
    items.forEach(el => el.style.borderColor = '');
  }
  document.getElementById('notes-list').innerHTML = renderNotesList();
}

function scheduleNoteSave() {
  clearTimeout(noteAutoSaveTimer);
  const status = document.getElementById('note-save-status');
  if (status) status.textContent = 'กำลังบันทึก...';
  noteAutoSaveTimer = setTimeout(() => {
    saveCurrentNote();
    if (status) status.textContent = 'บันทึกแล้ว ✓';
    document.getElementById('notes-list').innerHTML = renderNotesList();
  }, 800);
}

function saveCurrentNote() {
  if (!currentNoteId) return;
  const notes = StorageService.getNotes();
  const note = notes.find(n => n.id === currentNoteId);
  if (!note) return;
  note.title = document.getElementById('note-title-input')?.value || '';
  note.content = document.getElementById('note-content-input')?.value || '';
  note.updatedAt = new Date().toISOString();
  StorageService.saveNote(note);
}

function updateNoteCategory(cat) {
  if (!currentNoteId) return;
  const note = StorageService.getNotes().find(n => n.id === currentNoteId);
  if (!note) return;
  note.category = cat;
  StorageService.saveNote(note);
  document.getElementById('notes-list').innerHTML = renderNotesList();
}

function deleteNote(id) {
  if (!confirm('ลบโน้ตนี้?')) return;
  StorageService.deleteNote(id);
  if (id === currentNoteId) {
    currentNoteId = null;
    const editorArea = document.getElementById('note-editor-area');
    if (editorArea) editorArea.innerHTML = renderNoteEditorEmpty();
  }
  document.getElementById('notes-list').innerHTML = renderNotesList();
  showToast('ลบโน้ตแล้ว', 'success');
}

function getNoteContent() {
  const title = document.getElementById('note-title-input')?.value || '';
  const content = document.getElementById('note-content-input')?.value || '';
  return title ? `${title}\n\n${content}` : content;
}

function downloadNote() {
  if (!currentNoteId) return;
  const note = StorageService.getNotes().find(n => n.id === currentNoteId);
  downloadText(getNoteContent(), `${note?.title || 'note'}.md`);
}

function searchNotes(value) {
  document.getElementById('notes-list').innerHTML = renderNotesList(value);
}

let noteCurrentCategory = 'ทั้งหมด';
function filterNotesByCategory(el, cat) {
  noteCurrentCategory = cat;
  document.querySelectorAll('.knowledge-cat').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('notes-list').innerHTML = renderNotesList('', cat);
}
