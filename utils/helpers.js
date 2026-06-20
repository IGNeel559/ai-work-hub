/* ============================================
   Helpers Utility
   ============================================ */

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(date, format = 'short') {
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (format === 'relative') {
    if (mins < 1) return 'เมื่อกี้';
    if (mins < 60) return `${mins} นาทีที่แล้ว`;
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    if (days < 7) return `${days} วันที่แล้ว`;
  }

  if (format === 'short') {
    if (days === 0) return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    if (days < 7) return d.toLocaleDateString('th-TH', { weekday: 'short' });
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  }

  if (format === 'full') {
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  if (format === 'date') {
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  if (format === 'time') {
    return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  }

  return d.toLocaleDateString('th-TH');
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString('th-TH');
}

function formatCurrency(amount, currency = 'USD') {
  if (currency === 'USD') return '$' + amount.toFixed(4);
  return amount.toFixed(2);
}

function truncate(str, length = 60) {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => showToast('คัดลอกแล้ว', 'success'));
  } else {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showToast('คัดลอกแล้ว', 'success');
  }
}

function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}

function getInitials(name) {
  if (!name) return 'U';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
}

function randomColor() {
  const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getAvatarColor(str) {
  const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#14B8A6'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function isValidApiKey(key, provider) {
  if (!key || key.trim().length < 8) return false;
  const patterns = {
    claude: /^sk-ant-/,
    openai: /^sk-/,
    gemini: /^AIza/,
    deepseek: /^sk-/
  };
  if (patterns[provider]) return patterns[provider].test(key.trim());
  return key.trim().length > 16;
}

function maskApiKey(key) {
  if (!key || key.length < 8) return '••••••••';
  return key.substring(0, 8) + '••••••••' + key.substring(key.length - 4);
}

function downloadText(content, filename) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadJson(data, filename) {
  const content = JSON.stringify(data, null, 2);
  downloadText(content, filename);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Toast notification system
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Modal system
function openModal(title, body, footerHtml = '') {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = body;
  document.getElementById('modal-footer').innerHTML = footerHtml;
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal(event) {
  if (!event || event.target === document.getElementById('modal-overlay')) {
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('modal-body').innerHTML = '';
    document.getElementById('modal-footer').innerHTML = '';
  }
}

// Auto-resize textarea
function autoResize(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 140) + 'px';
}

// Close dropdowns on outside click
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('user-dropdown');
  const menu = document.querySelector('.user-menu');
  if (dropdown && menu && !menu.contains(e.target)) {
    dropdown.classList.add('hidden');
  }
  const notifPanel = document.getElementById('notification-panel');
  const notifBtn = document.getElementById('notif-btn');
  if (notifPanel && notifBtn && !notifBtn.contains(e.target) && !notifPanel.contains(e.target)) {
    notifPanel.classList.add('hidden');
  }
});

// Global search open/close
function openSearch() {
  const modal = document.getElementById('search-modal');
  modal.classList.remove('hidden');
  setTimeout(() => document.getElementById('global-search-input')?.focus(), 50);
}

function closeSearch() {
  document.getElementById('search-modal').classList.add('hidden');
  document.getElementById('global-search-input').value = '';
}

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    openSearch();
  }
  if (e.key === 'Escape') {
    closeSearch();
    closeModal();
  }
});

document.getElementById('search-modal')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('search-modal')) closeSearch();
});

function toggleUserMenu() {
  document.getElementById('user-dropdown').classList.toggle('hidden');
}

function toggleNotifications() {
  document.getElementById('notification-panel').classList.toggle('hidden');
}

// Notification system
const notifications = [];

function addNotification(title, message, icon = 'ℹ️') {
  const notif = { id: generateId(), title, message, icon, time: new Date() };
  notifications.unshift(notif);
  renderNotifications();
  document.getElementById('notif-dot').classList.add('show');
}

function renderNotifications() {
  const list = document.getElementById('notif-list');
  if (!list) return;
  if (notifications.length === 0) {
    list.innerHTML = '<div class="notif-empty">ไม่มีการแจ้งเตือน</div>';
    return;
  }
  list.innerHTML = notifications.slice(0, 10).map(n => `
    <div class="notif-item">
      <div class="notif-icon">${n.icon}</div>
      <div class="notif-content">
        <div class="notif-title">${escapeHtml(n.title)}</div>
        <div class="notif-msg">${escapeHtml(n.message)}</div>
        <div class="notif-time">${formatDate(n.time, 'relative')}</div>
      </div>
    </div>
  `).join('');
}

function clearNotifications() {
  notifications.length = 0;
  renderNotifications();
  document.getElementById('notif-dot').classList.remove('show');
}
