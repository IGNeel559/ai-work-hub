/* ============================================
   Token Dashboard Page
   ============================================ */

function renderTokens() {
  const usage = StorageService.getTokenUsage();
  const today = new Date().toISOString().split('T')[0];
  const monthKey = today.substring(0, 7);
  const todayUsage = usage.daily[0]?.total || 0;
  const monthUsage = usage.monthly[monthKey]?.total || 0;

  const providerData = Object.entries(usage.providers || {}).map(([id, data]) => ({
    id, ...data, provider: AIService.getProvider(id)
  }));

  const totalAllTime = usage.daily.reduce((s, d) => s + d.total, 0);
  const settings = StorageService.getSettings();
  const activeProvider = settings.defaultProvider || 'claude';
  const estimatedCost = AIService.estimateCost(activeProvider, monthUsage * 0.4, monthUsage * 0.6);

  return `
    <div class="page-enter">
      <div class="page-header">
        <h1 class="page-title">💰 การใช้งาน Token</h1>
        <p class="page-subtitle">ติดตามการใช้งานและต้นทุน AI ของคุณ</p>
      </div>

      <!-- Stats -->
      <div class="grid-4 mb-24">
        <div class="stat-card">
          <div class="stat-label">Token วันนี้</div>
          <div class="stat-value">${formatNumber(todayUsage)}</div>
          <div class="stat-change">📊 ${usage.daily[0]?.input || 0} in / ${usage.daily[0]?.output || 0} out</div>
          <div class="stat-icon">📊</div>
        </div>
        <div class="stat-card success">
          <div class="stat-label">Token เดือนนี้</div>
          <div class="stat-value">${formatNumber(monthUsage)}</div>
          <div class="stat-change">📅 ${monthKey}</div>
          <div class="stat-icon">📅</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-label">ต้นทุนโดยประมาณ</div>
          <div class="stat-value" style="font-size:22px;">$${estimatedCost.toFixed(4)}</div>
          <div class="stat-change">💵 เดือนนี้</div>
          <div class="stat-icon">💵</div>
        </div>
        <div class="stat-card info">
          <div class="stat-label">Token ทั้งหมด</div>
          <div class="stat-value">${formatNumber(totalAllTime)}</div>
          <div class="stat-change">🤖 สะสม</div>
          <div class="stat-icon">🤖</div>
        </div>
      </div>

      <div class="grid-2 mb-24">
        <!-- Daily Usage Chart -->
        <div class="chart-card">
          <div class="card-header">
            <div class="card-title">📈 การใช้งาน 7 วันล่าสุด</div>
          </div>
          ${renderBarChart(usage.daily.slice(0, 7).reverse())}
        </div>

        <!-- Provider Distribution -->
        <div class="chart-card">
          <div class="card-header">
            <div class="card-title">🤖 การใช้งานแยกตาม Provider</div>
          </div>
          ${renderProviderChart(providerData, totalAllTime)}
        </div>
      </div>

      <!-- Monthly Summary -->
      <div class="card mb-24">
        <div class="card-header">
          <div class="card-title">📅 สรุปรายเดือน</div>
          <button class="btn btn-sm btn-ghost" onclick="exportTokenReport()">📥 Export</button>
        </div>
        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:13px;">
            <thead>
              <tr style="background:var(--bg-secondary);">
                <th style="padding:10px 12px; text-align:left; border-bottom:1px solid var(--border);">เดือน</th>
                <th style="padding:10px 12px; text-align:right; border-bottom:1px solid var(--border);">Input</th>
                <th style="padding:10px 12px; text-align:right; border-bottom:1px solid var(--border);">Output</th>
                <th style="padding:10px 12px; text-align:right; border-bottom:1px solid var(--border);">รวม</th>
                <th style="padding:10px 12px; text-align:right; border-bottom:1px solid var(--border);">ต้นทุนโดยประมาณ</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(usage.monthly || {}).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 6).map(([month, data]) => `
                <tr style="border-bottom:1px solid var(--border);">
                  <td style="padding:10px 12px;">${month}</td>
                  <td style="padding:10px 12px; text-align:right; color:var(--info);">${formatNumber(data.input || 0)}</td>
                  <td style="padding:10px 12px; text-align:right; color:var(--success);">${formatNumber(data.output || 0)}</td>
                  <td style="padding:10px 12px; text-align:right; font-weight:700;">${formatNumber(data.total || 0)}</td>
                  <td style="padding:10px 12px; text-align:right; color:var(--warning);">$${AIService.estimateCost(activeProvider, (data.input || 0), (data.output || 0)).toFixed(4)}</td>
                </tr>
              `).join('')}
              ${Object.keys(usage.monthly || {}).length === 0 ? `
                <tr><td colspan="5" style="padding:24px; text-align:center; color:var(--text-muted);">ยังไม่มีข้อมูล</td></tr>
              ` : ''}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Daily Detail -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">📊 รายละเอียดรายวัน (30 วัน)</div>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${usage.daily.slice(0, 14).map(d => {
            const pct = totalAllTime > 0 ? Math.min(100, (d.total / Math.max(...usage.daily.map(x => x.total), 1)) * 100) : 0;
            return `
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:12px; color:var(--text-muted); min-width:80px;">${d.date}</span>
                <div style="flex:1; height:8px; background:var(--border); border-radius:4px; overflow:hidden;">
                  <div style="height:100%; width:${pct}%; background:linear-gradient(90deg, var(--primary), var(--accent)); border-radius:4px;"></div>
                </div>
                <span style="font-size:12px; font-weight:600; min-width:60px; text-align:right;">${formatNumber(d.total)}</span>
              </div>
            `;
          }).join('')}
          ${usage.daily.length === 0 ? `<div style="text-align:center; color:var(--text-muted); padding:32px;">ยังไม่มีข้อมูลการใช้งาน เริ่มแชทกับ AI เพื่อดูสถิติ</div>` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderBarChart(data) {
  if (!data || data.length === 0) {
    return `<div style="height:200px; display:flex; align-items:center; justify-content:center; color:var(--text-muted); font-size:13px;">ยังไม่มีข้อมูล</div>`;
  }
  const max = Math.max(...data.map(d => d.total), 1);
  return `
    <div class="bar-chart">
      ${data.map(d => {
        const h = Math.max(4, Math.round((d.total / max) * 160));
        return `
          <div class="bar-item">
            <div class="bar" style="height:${h}px;" title="${d.date}: ${formatNumber(d.total)} tokens">
              <span class="bar-value" style="font-size:9px;">${formatNumber(d.total)}</span>
            </div>
            <div class="bar-label">${d.date ? d.date.split('-').slice(1).join('/') : ''}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderProviderChart(providers, total) {
  if (!providers || providers.length === 0) {
    return `<div style="height:200px; display:flex; align-items:center; justify-content:center; color:var(--text-muted); font-size:13px;">ยังไม่มีข้อมูล</div>`;
  }

  const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'];
  return `
    <div class="token-provider-list">
      ${providers.map((p, i) => {
        const pct = total > 0 ? Math.round((p.total / total) * 100) : 0;
        return `
          <div class="token-provider-item">
            <div class="token-provider-icon">${p.provider.logo}</div>
            <div class="token-provider-info">
              <div class="token-provider-name">${p.provider.name}</div>
              <div class="token-provider-bar">
                <div class="token-provider-fill" style="width:${pct}%; background:${colors[i % colors.length]};"></div>
              </div>
            </div>
            <div class="token-provider-count">${formatNumber(p.total)}<br><span style="font-size:10px; color:var(--text-muted);">${pct}%</span></div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function exportTokenReport() {
  const usage = StorageService.getTokenUsage();
  const csv = [
    'วันที่,Input Tokens,Output Tokens,รวม',
    ...usage.daily.map(d => `${d.date},${d.input || 0},${d.output || 0},${d.total || 0}`)
  ].join('\n');
  downloadText(csv, `token-report-${new Date().toISOString().split('T')[0]}.csv`);
  showToast('Export รายงานแล้ว', 'success');
}
