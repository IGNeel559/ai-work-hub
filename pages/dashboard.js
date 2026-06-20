/* ============================================
   Dashboard / Analytics Page
   ============================================ */

function renderDashboard() {
  const usage = StorageService.getTokenUsage();
  const tasks = StorageService.getTasks();
  const notes = StorageService.getNotes();
  const chats = StorageService.getChats();
  const prompts = StorageService.getPrompts();
  const knowledge = StorageService.getKnowledge();
  const activity = StorageService.getActivity();

  const completedTasks = tasks.filter(t => t.completed).length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const todayChats = chats.filter(c => {
    const d = new Date(c.updatedAt || c.createdAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  const totalTokens = usage.daily.reduce((s, d) => s + d.total, 0);

  return `
    <div class="page-enter">
      <div class="page-header">
        <h1 class="page-title">📈 แดชบอร์ด</h1>
        <p class="page-subtitle">ภาพรวมการใช้งานระบบทั้งหมด</p>
      </div>

      <!-- Overview Stats -->
      <div class="grid-4 mb-24">
        <div class="stat-card">
          <div class="stat-label">แชท AI ทั้งหมด</div>
          <div class="stat-value">${chats.length}</div>
          <div class="stat-change">💬 ${todayChats} วันนี้</div>
          <div class="stat-icon">💬</div>
        </div>
        <div class="stat-card success">
          <div class="stat-label">งานที่เสร็จ</div>
          <div class="stat-value">${completedTasks}</div>
          <div class="stat-change">📊 ${completionRate}% สำเร็จ</div>
          <div class="stat-icon">✅</div>
        </div>
        <div class="stat-card info">
          <div class="stat-label">คลังความรู้</div>
          <div class="stat-value">${knowledge.length}</div>
          <div class="stat-change">📚 เอกสาร</div>
          <div class="stat-icon">📚</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-label">Token สะสม</div>
          <div class="stat-value">${formatNumber(totalTokens)}</div>
          <div class="stat-change">🤖 ทั้งหมด</div>
          <div class="stat-icon">🤖</div>
        </div>
      </div>

      <div class="grid-2 mb-24">
        <!-- Task Completion -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">✅ สถานะงาน</div>
            <button class="btn btn-sm btn-ghost" onclick="navigateTo('tasks')">ดูทั้งหมด →</button>
          </div>
          <div style="text-align:center; padding:20px 0;">
            <div style="position:relative; width:120px; height:120px; margin:0 auto 16px;">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" stroke-width="10"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--success)" stroke-width="10"
                  stroke-dasharray="${completionRate * 3.14} 314"
                  stroke-linecap="round"
                  transform="rotate(-90 60 60)"/>
              </svg>
              <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                <div style="font-size:24px; font-weight:800;">${completionRate}%</div>
                <div style="font-size:10px; color:var(--text-muted);">สำเร็จ</div>
              </div>
            </div>
            <div style="display:flex; justify-content:center; gap:24px; font-size:13px;">
              <div style="text-align:center;">
                <div style="font-size:20px; font-weight:700; color:var(--success);">${completedTasks}</div>
                <div style="color:var(--text-muted);">เสร็จแล้ว</div>
              </div>
              <div style="text-align:center;">
                <div style="font-size:20px; font-weight:700; color:var(--warning);">${tasks.length - completedTasks}</div>
                <div style="color:var(--text-muted);">รอดำเนินการ</div>
              </div>
              <div style="text-align:center;">
                <div style="font-size:20px; font-weight:700;">${tasks.length}</div>
                <div style="color:var(--text-muted);">ทั้งหมด</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Content Stats -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">📊 เนื้อหาในระบบ</div>
          </div>
          <div style="display:flex; flex-direction:column; gap:14px; padding:4px 0;">
            ${[
              { label: 'แชท AI', value: chats.length, max: Math.max(chats.length, 10), color: '#3B82F6', icon: '💬', page: 'chat' },
              { label: 'โน้ต', value: notes.length, max: Math.max(notes.length, 10), color: '#10B981', icon: '📝', page: 'notes' },
              { label: 'Prompt', value: prompts.length, max: Math.max(prompts.length, 10), color: '#8B5CF6', icon: '📂', page: 'prompts' },
              { label: 'คลังความรู้', value: knowledge.length, max: Math.max(knowledge.length, 10), color: '#F59E0B', icon: '📚', page: 'knowledge' }
            ].map(item => `
              <div style="display:flex; align-items:center; gap:10px; cursor:pointer;" onclick="navigateTo('${item.page}')">
                <span style="width:28px; text-align:center;">${item.icon}</span>
                <span style="min-width:80px; font-size:13px;">${item.label}</span>
                <div style="flex:1; height:8px; background:var(--border); border-radius:4px; overflow:hidden;">
                  <div style="height:100%; width:${item.max > 0 ? Math.round((item.value/item.max)*100) : 0}%; background:${item.color}; border-radius:4px; transition:width 0.6s;"></div>
                </div>
                <span style="min-width:24px; text-align:right; font-size:13px; font-weight:700;">${item.value}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Token Usage Trend -->
      <div class="card mb-24">
        <div class="card-header">
          <div class="card-title">📊 แนวโน้มการใช้ Token (14 วัน)</div>
          <button class="btn btn-sm btn-ghost" onclick="navigateTo('tokens')">ดูรายละเอียด →</button>
        </div>
        ${renderMiniBarChart(usage.daily.slice(0, 14).reverse())}
      </div>

      <!-- Recent Activity Timeline -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">🕐 Timeline กิจกรรม</div>
        </div>
        <div style="display:flex; flex-direction:column; gap:0;">
          ${activity.length === 0 ? `
            <div style="text-align:center; padding:32px; color:var(--text-muted); font-size:13px;">ยังไม่มีกิจกรรม</div>
          ` : activity.slice(0, 12).map((a, i) => `
            <div style="display:flex; gap:14px; padding:10px 0; ${i < activity.length - 1 ? 'border-bottom:1px solid var(--border);' : ''}">
              <div style="display:flex; flex-direction:column; align-items:center;">
                <div style="width:32px; height:32px; background:var(--bg); border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">${a.icon}</div>
                ${i < activity.length - 1 ? `<div style="width:1px; flex:1; background:var(--border); margin:4px 0;"></div>` : ''}
              </div>
              <div style="flex:1; padding-top:6px;">
                <div style="font-size:13px; font-weight:500;">${escapeHtml(a.title)}</div>
                <div style="font-size:11px; color:var(--text-muted);">${formatDate(new Date(a.time), 'full')}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderMiniBarChart(data) {
  if (!data || data.length === 0) {
    return `<div style="height:100px; display:flex; align-items:center; justify-content:center; color:var(--text-muted); font-size:13px;">ยังไม่มีข้อมูล — เริ่มแชทกับ AI เพื่อเก็บสถิติ</div>`;
  }
  const max = Math.max(...data.map(d => d.total), 1);
  return `
    <div style="display:flex; align-items:flex-end; gap:4px; height:100px; padding:0 4px;">
      ${data.map(d => {
        const h = Math.max(4, Math.round((d.total / max) * 80));
        return `
          <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:4px;" title="${d.date}: ${formatNumber(d.total)}">
            <div style="width:100%; height:${h}px; background:linear-gradient(180deg, var(--primary), var(--secondary)); border-radius:3px 3px 0 0;"></div>
            <div style="font-size:9px; color:var(--text-muted); transform:rotate(-45deg); white-space:nowrap;">${(d.date||'').slice(5)}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
