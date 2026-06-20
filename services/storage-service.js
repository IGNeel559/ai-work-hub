/* ============================================
   Storage Service - LocalStorage abstraction
   ============================================ */

const StorageService = (() => {
  const PREFIX = 'ai_workspace_';

  function key(name) { return PREFIX + name; }

  function get(name, defaultValue = null) {
    try {
      const raw = localStorage.getItem(key(name));
      if (raw === null) return defaultValue;
      return JSON.parse(raw);
    } catch { return defaultValue; }
  }

  function set(name, value) {
    try {
      localStorage.setItem(key(name), JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  }

  function remove(name) {
    localStorage.removeItem(key(name));
  }

  function clear() {
    Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).forEach(k => localStorage.removeItem(k));
  }

  function getSize() {
    let total = 0;
    Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).forEach(k => {
      total += (localStorage.getItem(k) || '').length * 2;
    });
    return total;
  }

  // Chats
  function getChats() { return get('chats', []); }
  function saveChats(chats) { return set('chats', chats); }
  function getChat(id) { return getChats().find(c => c.id === id) || null; }
  function saveChat(chat) {
    const chats = getChats().filter(c => c.id !== chat.id);
    chats.unshift(chat);
    return saveChats(chats);
  }
  function deleteChat(id) { saveChats(getChats().filter(c => c.id !== id)); }

  // Notes
  function getNotes() { return get('notes', []); }
  function saveNote(note) {
    const notes = getNotes().filter(n => n.id !== note.id);
    notes.unshift(note);
    return set('notes', notes);
  }
  function deleteNote(id) { set('notes', getNotes().filter(n => n.id !== id)); }

  // Tasks
  function getTasks() { return get('tasks', []); }
  function saveTask(task) {
    const tasks = getTasks().filter(t => t.id !== task.id);
    tasks.unshift(task);
    return set('tasks', tasks);
  }
  function deleteTask(id) { set('tasks', getTasks().filter(t => t.id !== id)); }

  // Prompts
  function getPrompts() { return get('prompts', getDefaultPrompts()); }
  function savePrompt(prompt) {
    const prompts = getPrompts().filter(p => p.id !== prompt.id);
    prompts.unshift(prompt);
    return set('prompts', prompts);
  }
  function deletePrompt(id) { set('prompts', getPrompts().filter(p => p.id !== id)); }

  // Knowledge
  function getKnowledge() { return get('knowledge', []); }
  function saveKnowledge(item) {
    const items = getKnowledge().filter(k => k.id !== item.id);
    items.unshift(item);
    return set('knowledge', items);
  }
  function deleteKnowledge(id) { set('knowledge', getKnowledge().filter(k => k.id !== id)); }

  // Settings
  function getSettings() {
    return get('settings', {
      theme: 'dark',
      language: 'th',
      defaultProvider: 'claude',
      defaultModel: 'claude-opus-4-5',
      streamingEnabled: true,
      soundEnabled: false,
      autoSave: true,
      sidebarCollapsed: false
    });
  }
  function saveSettings(settings) { return set('settings', settings); }
  function updateSetting(key, value) {
    const settings = getSettings();
    settings[key] = value;
    saveSettings(settings);
  }

  // API Keys
  function getApiKeys() { return get('api_keys', {}); }
  function saveApiKey(provider, keyValue) {
    const keys = getApiKeys();
    keys[provider] = { key: keyValue, addedAt: new Date().toISOString(), status: 'untested' };
    return set('api_keys', keys);
  }
  function getApiKey(provider) {
    const keys = getApiKeys();
    return keys[provider]?.key || null;
  }
  function deleteApiKey(provider) {
    const keys = getApiKeys();
    delete keys[provider];
    set('api_keys', keys);
  }
  function updateApiKeyStatus(provider, status) {
    const keys = getApiKeys();
    if (keys[provider]) { keys[provider].status = status; keys[provider].testedAt = new Date().toISOString(); }
    set('api_keys', keys);
  }

  // Token usage
  function getTokenUsage() { return get('token_usage', { daily: [], monthly: {}, providers: {} }); }
  function recordTokenUsage(provider, inputTokens, outputTokens, model) {
    const usage = getTokenUsage();
    const today = new Date().toISOString().split('T')[0];
    const month = today.substring(0, 7);

    // Daily
    const dayEntry = usage.daily.find(d => d.date === today);
    if (dayEntry) {
      dayEntry.input += inputTokens;
      dayEntry.output += outputTokens;
      dayEntry.total += inputTokens + outputTokens;
    } else {
      usage.daily.unshift({ date: today, input: inputTokens, output: outputTokens, total: inputTokens + outputTokens });
      if (usage.daily.length > 30) usage.daily = usage.daily.slice(0, 30);
    }

    // Monthly
    if (!usage.monthly[month]) usage.monthly[month] = { input: 0, output: 0, total: 0 };
    usage.monthly[month].input += inputTokens;
    usage.monthly[month].output += outputTokens;
    usage.monthly[month].total += inputTokens + outputTokens;

    // Provider
    if (!usage.providers[provider]) usage.providers[provider] = { total: 0, model };
    usage.providers[provider].total += inputTokens + outputTokens;
    usage.providers[provider].model = model;

    set('token_usage', usage);
  }

  // Onboarding
  function isOnboardingDone() { return get('onboarding_done', false); }
  function setOnboardingDone() { return set('onboarding_done', true); }

  // Activity log
  function getActivity() { return get('activity', []); }
  function logActivity(type, title, icon = '📌') {
    const activity = getActivity();
    activity.unshift({ id: generateId(), type, title, icon, time: new Date().toISOString() });
    if (activity.length > 50) activity.length = 50;
    set('activity', activity);
  }

  function getDefaultPrompts() {
    return [
      { id: generateId(), name: 'สรุปเอกสาร', category: 'เอกสาร', content: 'กรุณาสรุปเนื้อหาต่อไปนี้ให้กระชับ ชัดเจน และครบประเด็นสำคัญ:\n\n[วางเนื้อหาที่นี่]', favorite: true, createdAt: new Date().toISOString() },
      { id: generateId(), name: 'เขียนอีเมลทางการ', category: 'เอกสาร', content: 'กรุณาเขียนอีเมลทางการภาษาไทยเกี่ยวกับ:\nเรื่อง: [ระบุเรื่อง]\nผู้รับ: [ระบุผู้รับ]\nเนื้อหาหลัก: [ระบุเนื้อหา]\n\nโปรดใช้ภาษาสุภาพ เป็นทางการ', favorite: true, createdAt: new Date().toISOString() },
      { id: generateId(), name: 'แก้ไขสูตร Excel', category: 'Excel', content: 'ฉันมีปัญหากับสูตร Excel:\n[วางสูตรหรืออธิบายปัญหา]\n\nกรุณาช่วย:\n1. อธิบายปัญหาที่พบ\n2. แก้ไขสูตรให้ถูกต้อง\n3. อธิบายการทำงานของสูตรที่แก้ไข', favorite: false, createdAt: new Date().toISOString() },
      { id: generateId(), name: 'แก้ปัญหา IT', category: 'IT', content: 'ปัญหา IT ที่พบ:\nระบบ/อุปกรณ์: [Windows/Server/Network]\nอาการ: [อธิบายอาการ]\nสิ่งที่ลองทำแล้ว: [ระบุ]\n\nกรุณาแนะนำวิธีแก้ไขทีละขั้นตอน', favorite: false, createdAt: new Date().toISOString() },
      { id: generateId(), name: 'วางแผนโครงการ', category: 'โครงการ', content: 'กรุณาช่วยวางแผนโครงการ:\nชื่อโครงการ: [ชื่อ]\nเป้าหมาย: [ระบุ]\nกำหนดเวลา: [ระบุ]\nทรัพยากร: [ระบุ]\n\nโปรดสร้าง: 1) แผนงานหลัก 2) Timeline 3) Risk assessment', favorite: false, createdAt: new Date().toISOString() },
      { id: generateId(), name: 'แปลและปรับปรุงภาษา', category: 'เอกสาร', content: 'กรุณา[แปล/ปรับปรุง]ข้อความต่อไปนี้:\nจาก: [ภาษาต้นทาง]\nเป็น: [ภาษาปลายทาง]\nสไตล์: [ทางการ/ไม่เป็นทางการ]\n\nข้อความ:\n[วางข้อความที่นี่]', favorite: false, createdAt: new Date().toISOString() },
    ];
  }

  return {
    get, set, remove, clear, getSize,
    getChats, saveChats, getChat, saveChat, deleteChat,
    getNotes, saveNote, deleteNote,
    getTasks, saveTask, deleteTask,
    getPrompts, savePrompt, deletePrompt,
    getKnowledge, saveKnowledge, deleteKnowledge,
    getSettings, saveSettings, updateSetting,
    getApiKeys, saveApiKey, getApiKey, deleteApiKey, updateApiKeyStatus,
    getTokenUsage, recordTokenUsage,
    isOnboardingDone, setOnboardingDone,
    getActivity, logActivity
  };
})();
