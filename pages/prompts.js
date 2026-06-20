/* ============================================
   Prompt Library Page
   ============================================ */

function renderPrompts() {
  const categories = ['ทั้งหมด', 'เอกสาร', 'IT', 'Excel', 'โครงการ', 'วิจัย', 'อื่นๆ'];

  return `
    <div class="page-enter">
      <div class="page-header">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div>
            <h1 class="page-title">📂 คลัง Prompt</h1>
            <p class="page-subtitle">${StorageService.getPrompts().length} Prompt</p>
          </div>
          <button class="btn btn-primary" onclick="openPromptModal()">+ สร้าง Prompt ใหม่</button>
        </div>
      </div>

      <div style="display:flex; gap:4px; margin-bottom:16px; flex-wrap:wrap;">
        ${categories.map((c, i) => `
          <button class="knowledge-cat ${i === 0 ? 'active' : ''}" onclick="filterPromptsByCategory(this, '${c}')">${c}</button>
        `).join('')}
        <button class="knowledge-cat" onclick="filterPromptsByFavorite(this)">⭐ Favorites</button>
      </div>

      <div class="search-filter-bar">
        <input type="text" class="form-input" placeholder="🔍 ค้นหา Prompt..." oninput="searchPrompts(this.value)" style="max-width:300px;" />
      </div>

      <div class="prompt-grid" id="prompt-grid">
        ${renderPromptGrid()}
      </div>
    </div>
  `;
}

let promptFilter = { search: '', category: 'ทั้งหมด', favoritesOnly: false };

function renderPromptGrid() {
  let prompts = StorageService.getPrompts();
  if (promptFilter.search) prompts = prompts.filter(p => p.name.toLowerCase().includes(promptFilter.search.toLowerCase()) || p.content.toLowerCase().includes(promptFilter.search.toLowerCase()));
  if (promptFilter.category !== 'ทั้งหมด') prompts = prompts.filter(p => p.category === promptFilter.category);
  if (promptFilter.favoritesOnly) prompts = prompts.filter(p => p.favorite);

  if (prompts.length === 0) {
    return `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-state-icon">📂</div>
        <h3>ไม่พบ Prompt</h3>
        <p>สร้าง Prompt ใหม่หรือเปลี่ยนตัวกรอง</p>
        <button class="btn btn-primary mt-16" onclick="openPromptModal()">+ สร้าง Prompt ใหม่</button>
      </div>
    `;
  }

  return prompts.map(p => `
    <div class="prompt-card">
      <div class="prompt-card-header">
        <div class="prompt-name">${escapeHtml(p.name)}</div>
        <button onclick="togglePromptFavorite('${p.id}')" style="font-size:16px; flex-shrink:0;" title="Favorite">${p.favorite ? '⭐' : '☆'}</button>
      </div>
      <div class="prompt-preview">${escapeHtml(p.content)}</div>
      <div class="prompt-footer">
        <span class="badge badge-primary">${p.category || 'ทั่วไป'}</span>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-sm btn-primary" onclick="usePromptInChat('${p.id}')">💬 ใช้งาน</button>
          <button class="btn btn-sm btn-ghost" onclick="copyToClipboard(${JSON.stringify(p.content)})" title="คัดลอก">📋</button>
          <button class="btn btn-sm btn-ghost" onclick="openPromptModal('${p.id}')" title="แก้ไข">✏️</button>
          <button class="btn btn-sm btn-ghost" onclick="deletePrompt('${p.id}')" title="ลบ" style="color:var(--danger);">🗑️</button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterPromptsByCategory(el, cat) {
  promptFilter.category = cat;
  promptFilter.favoritesOnly = false;
  document.querySelectorAll('.knowledge-cat').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('prompt-grid').innerHTML = renderPromptGrid();
}

function filterPromptsByFavorite(el) {
  promptFilter.favoritesOnly = true;
  promptFilter.category = 'ทั้งหมด';
  document.querySelectorAll('.knowledge-cat').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('prompt-grid').innerHTML = renderPromptGrid();
}

function searchPrompts(value) {
  promptFilter.search = value;
  document.getElementById('prompt-grid').innerHTML = renderPromptGrid();
}

function togglePromptFavorite(id) {
  const prompts = StorageService.getPrompts();
  const p = prompts.find(x => x.id === id);
  if (!p) return;
  p.favorite = !p.favorite;
  StorageService.savePrompt(p);
  document.getElementById('prompt-grid').innerHTML = renderPromptGrid();
}

function deletePrompt(id) {
  if (!confirm('ลบ Prompt นี้?')) return;
  StorageService.deletePrompt(id);
  document.getElementById('prompt-grid').innerHTML = renderPromptGrid();
  showToast('ลบ Prompt แล้ว', 'success');
}

function usePromptInChat(id) {
  const p = StorageService.getPrompts().find(x => x.id === id);
  if (!p) return;
  navigateTo('chat');
  setTimeout(() => {
    if (window.ChatPage) window.ChatPage.useSuggestion(p.content);
  }, 200);
}

function openPromptModal(id = null) {
  const prompt = id ? StorageService.getPrompts().find(p => p.id === id) : null;
  const body = `
    <div class="form-group">
      <label class="form-label">ชื่อ Prompt *</label>
      <input type="text" class="form-input" id="prompt-name-input" placeholder="เช่น สรุปเอกสาร, เขียนอีเมล..." value="${escapeHtml(prompt?.name || '')}" />
    </div>
    <div class="form-group">
      <label class="form-label">หมวดหมู่</label>
      <select class="form-input" id="prompt-cat-input">
        <option value="เอกสาร" ${prompt?.category === 'เอกสาร' ? 'selected' : ''}>เอกสาร</option>
        <option value="IT" ${prompt?.category === 'IT' ? 'selected' : ''}>IT</option>
        <option value="Excel" ${prompt?.category === 'Excel' ? 'selected' : ''}>Excel</option>
        <option value="โครงการ" ${prompt?.category === 'โครงการ' ? 'selected' : ''}>โครงการ</option>
        <option value="วิจัย" ${prompt?.category === 'วิจัย' ? 'selected' : ''}>วิจัย</option>
        <option value="อื่นๆ" ${!prompt?.category || prompt?.category === 'อื่นๆ' ? 'selected' : ''}>อื่นๆ</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">เนื้อหา Prompt *</label>
      <textarea class="form-input" id="prompt-content-input" placeholder="เขียน Prompt ของคุณ..." rows="8">${escapeHtml(prompt?.content || '')}</textarea>
    </div>
    <div style="display:flex; align-items:center; gap:8px;">
      <div class="toggle ${prompt?.favorite ? 'on' : ''}" onclick="this.classList.toggle('on')" id="prompt-fav-toggle"></div>
      <span style="font-size:13px;">⭐ Favorite</span>
    </div>
  `;
  const footer = `
    ${id ? `<button class="btn btn-danger" onclick="deletePrompt('${id}'); closeModal();">🗑️ ลบ</button>` : ''}
    <button class="btn btn-ghost" onclick="closeModal()">ยกเลิก</button>
    <button class="btn btn-primary" onclick="savePromptFromModal('${id || ''}')">💾 บันทึก</button>
  `;
  openModal(id ? '✏️ แก้ไข Prompt' : '+ สร้าง Prompt ใหม่', body, footer);
  setTimeout(() => document.getElementById('prompt-name-input')?.focus(), 100);
}

function savePromptFromModal(id) {
  const name = document.getElementById('prompt-name-input')?.value.trim();
  const content = document.getElementById('prompt-content-input')?.value.trim();
  if (!name || !content) { showToast('กรุณาใส่ชื่อและเนื้อหา', 'warning'); return; }
  const prompt = {
    id: id || generateId(),
    name,
    content,
    category: document.getElementById('prompt-cat-input')?.value || 'อื่นๆ',
    favorite: document.getElementById('prompt-fav-toggle')?.classList.contains('on') || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  StorageService.savePrompt(prompt);
  StorageService.logActivity('prompt', `${id ? 'แก้ไข' : 'สร้าง'} Prompt: ${name}`, '📂');
  closeModal();
  document.getElementById('prompt-grid').innerHTML = renderPromptGrid();
  showToast(id ? 'แก้ไข Prompt แล้ว' : 'สร้าง Prompt ใหม่แล้ว', 'success');
}
