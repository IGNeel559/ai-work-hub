/* ============================================
   Task Manager Page
   ============================================ */

function renderTasks() {
  const tasks = StorageService.getTasks();
  const categories = ['ทั้งหมด', 'IT', 'Office', 'โครงการ', 'ส่วนตัว', 'อื่นๆ'];

  return `
    <div class="page-enter">
      <div class="page-header">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div>
            <h1 class="page-title">✅ งานของฉัน</h1>
            <p class="page-subtitle">${tasks.filter(t=>!t.completed).length} งานที่รอดำเนินการ จาก ${tasks.length} งานทั้งหมด</p>
          </div>
          <button class="btn btn-primary" id="create-task-btn" onclick="openTaskModal()">+ สร้างงานใหม่</button>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="search-filter-bar">
        <input type="text" class="form-input" placeholder="🔍 ค้นหางาน..." oninput="filterTasks(this.value)" style="max-width:300px;" />
        <select class="form-input" onchange="filterTasksByCategory(this.value)" style="max-width:140px;">
          ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
        <select class="form-input" onchange="filterTasksByPriority(this.value)" style="max-width:140px;">
          <option value="all">ทุกความสำคัญ</option>
          <option value="high">สำคัญมาก 🔴</option>
          <option value="medium">ปานกลาง 🟡</option>
          <option value="low">ต่ำ 🟢</option>
        </select>
        <button class="btn btn-ghost btn-sm" onclick="toggleShowCompleted()">
          <span id="show-completed-label">แสดงที่เสร็จแล้ว</span>
        </button>
      </div>

      <!-- Task Tabs -->
      <div class="tabs">
        <div class="tab active" onclick="switchTaskTab(this, 'pending')">🔄 รอดำเนินการ</div>
        <div class="tab" onclick="switchTaskTab(this, 'today')">📅 วันนี้</div>
        <div class="tab" onclick="switchTaskTab(this, 'completed')">✅ เสร็จแล้ว</div>
        <div class="tab" onclick="switchTaskTab(this, 'all')">📋 ทั้งหมด</div>
      </div>

      <div id="task-list-container">
        ${renderTaskList('pending')}
      </div>
    </div>
  `;
}

let taskFilter = { search: '', category: 'ทั้งหมด', priority: 'all', tab: 'pending', showCompleted: false };

function renderTaskList(tab = taskFilter.tab) {
  taskFilter.tab = tab;
  let tasks = StorageService.getTasks();

  if (taskFilter.search) {
    tasks = tasks.filter(t => t.title.toLowerCase().includes(taskFilter.search.toLowerCase()) || (t.description || '').toLowerCase().includes(taskFilter.search.toLowerCase()));
  }
  if (taskFilter.category !== 'ทั้งหมด') {
    tasks = tasks.filter(t => t.category === taskFilter.category);
  }
  if (taskFilter.priority !== 'all') {
    tasks = tasks.filter(t => t.priority === taskFilter.priority);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (tab === 'pending') tasks = tasks.filter(t => !t.completed);
  else if (tab === 'today') tasks = tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) >= today && new Date(t.dueDate) < tomorrow);
  else if (tab === 'completed') tasks = tasks.filter(t => t.completed);

  // Sort: high priority first, then by due date
  tasks.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const pa = priorityOrder[a.priority] ?? 1;
    const pb = priorityOrder[b.priority] ?? 1;
    if (pa !== pb) return pa - pb;
    if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
    return 0;
  });

  if (tasks.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">✅</div>
        <h3>${tab === 'completed' ? 'ยังไม่มีงานที่เสร็จ' : tab === 'today' ? 'ไม่มีงานวันนี้' : 'ไม่มีงาน'}</h3>
        <p>${tab === 'completed' ? 'เมื่อทำงานเสร็จแล้วจะแสดงที่นี่' : 'คลิก + สร้างงานใหม่ เพื่อเพิ่มงาน'}</p>
        ${tab !== 'completed' ? `<button class="btn btn-primary mt-16" onclick="openTaskModal()">+ สร้างงานใหม่</button>` : ''}
      </div>
    `;
  }

  return `<div class="task-board">${tasks.map(t => renderTaskItem(t)).join('')}</div>`;
}

function renderTaskItem(t) {
  const isOverdue = t.dueDate && !t.completed && new Date(t.dueDate) < new Date();
  return `
    <div class="task-item ${t.completed ? 'completed' : ''}" id="task-${t.id}">
      <div class="task-check ${t.completed ? 'checked' : ''}" onclick="toggleTask('${t.id}')">
        ${t.completed ? '✓' : ''}
      </div>
      <div class="task-body" onclick="openTaskModal('${t.id}')">
        <div class="task-title">${escapeHtml(t.title)}</div>
        ${t.description ? `<div style="font-size:12px; color:var(--text-secondary); margin-bottom:4px;">${escapeHtml(truncate(t.description, 60))}</div>` : ''}
        <div class="task-meta">
          <span class="priority-dot priority-${t.priority || 'medium'}"></span>
          <span>${t.priority === 'high' ? '🔴 สำคัญมาก' : t.priority === 'low' ? '🟢 ต่ำ' : '🟡 ปานกลาง'}</span>
          ${t.category ? `<span class="badge badge-muted">${t.category}</span>` : ''}
          ${t.dueDate ? `<span style="color:${isOverdue ? 'var(--danger)' : 'var(--text-muted)'};">${isOverdue ? '⚠️ ' : '📅 '}${formatDate(new Date(t.dueDate), 'date')}</span>` : ''}
        </div>
      </div>
      <div style="display:flex; gap:6px; align-items:center;">
        <button class="btn btn-sm btn-ghost" onclick="openTaskModal('${t.id}')" title="แก้ไข">✏️</button>
        <button class="btn btn-sm btn-ghost" onclick="deleteTask('${t.id}')" title="ลบ" style="color:var(--danger);">🗑️</button>
      </div>
    </div>
  `;
}

function switchTaskTab(el, tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('task-list-container').innerHTML = renderTaskList(tab);
}

function filterTasks(search) {
  taskFilter.search = search;
  document.getElementById('task-list-container').innerHTML = renderTaskList(taskFilter.tab);
}

function filterTasksByCategory(cat) {
  taskFilter.category = cat;
  document.getElementById('task-list-container').innerHTML = renderTaskList(taskFilter.tab);
}

function filterTasksByPriority(priority) {
  taskFilter.priority = priority;
  document.getElementById('task-list-container').innerHTML = renderTaskList(taskFilter.tab);
}

function toggleTask(id) {
  const tasks = StorageService.getTasks();
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date().toISOString() : null;
  StorageService.saveTask(task);
  if (task.completed) StorageService.logActivity('task', `เสร็จงาน: ${task.title}`, '✅');
  document.getElementById('task-list-container').innerHTML = renderTaskList(taskFilter.tab);
  updateTaskBadge();
}

function deleteTask(id) {
  if (!confirm('ลบงานนี้?')) return;
  StorageService.deleteTask(id);
  document.getElementById('task-list-container').innerHTML = renderTaskList(taskFilter.tab);
  updateTaskBadge();
  showToast('ลบงานแล้ว', 'success');
}

function updateTaskBadge() {
  const count = StorageService.getTasks().filter(t => !t.completed).length;
  const badge = document.getElementById('tasks-badge');
  if (badge) badge.textContent = count > 0 ? count : '';
}

function openTaskModal(id = null) {
  const task = id ? StorageService.getTasks().find(t => t.id === id) : null;
  const body = `
    <div class="form-group">
      <label class="form-label">ชื่องาน *</label>
      <input type="text" class="form-input" id="task-title-input" placeholder="ชื่องาน..." value="${escapeHtml(task?.title || '')}" />
    </div>
    <div class="form-group">
      <label class="form-label">รายละเอียด</label>
      <textarea class="form-input" id="task-desc-input" placeholder="รายละเอียดเพิ่มเติม..." rows="3">${escapeHtml(task?.description || '')}</textarea>
    </div>
    <div class="grid-2">
      <div class="form-group">
        <label class="form-label">ความสำคัญ</label>
        <select class="form-input" id="task-priority-input">
          <option value="high" ${task?.priority === 'high' ? 'selected' : ''}>🔴 สำคัญมาก</option>
          <option value="medium" ${!task?.priority || task?.priority === 'medium' ? 'selected' : ''}>🟡 ปานกลาง</option>
          <option value="low" ${task?.priority === 'low' ? 'selected' : ''}>🟢 ต่ำ</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">หมวดหมู่</label>
        <select class="form-input" id="task-cat-input">
          <option value="" ${!task?.category ? 'selected' : ''}>ไม่มีหมวดหมู่</option>
          <option value="IT" ${task?.category === 'IT' ? 'selected' : ''}>IT</option>
          <option value="Office" ${task?.category === 'Office' ? 'selected' : ''}>Office</option>
          <option value="โครงการ" ${task?.category === 'โครงการ' ? 'selected' : ''}>โครงการ</option>
          <option value="ส่วนตัว" ${task?.category === 'ส่วนตัว' ? 'selected' : ''}>ส่วนตัว</option>
          <option value="อื่นๆ" ${task?.category === 'อื่นๆ' ? 'selected' : ''}>อื่นๆ</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">กำหนดส่ง</label>
      <input type="date" class="form-input" id="task-due-input" value="${task?.dueDate ? task.dueDate.split('T')[0] : ''}" />
    </div>
  `;
  const footer = `
    ${id ? `<button class="btn btn-danger" onclick="deleteTask('${id}'); closeModal();">🗑️ ลบ</button>` : ''}
    <button class="btn btn-ghost" onclick="closeModal()">ยกเลิก</button>
    <button class="btn btn-primary" onclick="saveTaskFromModal('${id || ''}')">💾 บันทึก</button>
  `;
  openModal(id ? '✏️ แก้ไขงาน' : '+ สร้างงานใหม่', body, footer);
  setTimeout(() => document.getElementById('task-title-input')?.focus(), 100);
}

function saveTaskFromModal(id) {
  const title = document.getElementById('task-title-input')?.value.trim();
  if (!title) { showToast('กรุณาใส่ชื่องาน', 'warning'); return; }
  const task = {
    id: id || generateId(),
    title,
    description: document.getElementById('task-desc-input')?.value.trim(),
    priority: document.getElementById('task-priority-input')?.value || 'medium',
    category: document.getElementById('task-cat-input')?.value,
    dueDate: document.getElementById('task-due-input')?.value || null,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  if (id) {
    const existing = StorageService.getTasks().find(t => t.id === id);
    if (existing) { task.completed = existing.completed; task.completedAt = existing.completedAt; task.createdAt = existing.createdAt; }
  }
  StorageService.saveTask(task);
  StorageService.logActivity('task', `${id ? 'แก้ไข' : 'สร้าง'}งาน: ${title}`, '✅');
  closeModal();
  document.getElementById('task-list-container').innerHTML = renderTaskList(taskFilter.tab);
  updateTaskBadge();
  showToast(id ? 'แก้ไขงานแล้ว' : 'สร้างงานใหม่แล้ว', 'success');
}
