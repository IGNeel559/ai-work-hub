/* ============================================
   AI Chat Page
   ============================================ */

window.ChatPage = (() => {
  let currentChatId = null;
  let currentMessages = [];
  let isGenerating = false;
  let currentProvider = null;
  let currentModel = null;
  let currentSystemPrompt = null;

  function render() {
    const settings = StorageService.getSettings();
    currentProvider = settings.defaultProvider || 'claude';
    currentModel = settings.defaultModel || AIService.getProvider(currentProvider).defaultModel;

    return `
      <div class="chat-layout">
        <!-- Chat Sidebar -->
        <div class="chat-sidebar">
          <div class="chat-sidebar-header">
            <button class="btn btn-primary btn-full" onclick="ChatPage.createNewChat()">
              <span>✏️</span> แชทใหม่
            </button>
          </div>
          <div style="padding:10px 8px 4px;">
            <input type="text" class="form-input" placeholder="🔍 ค้นหาแชท..." oninput="ChatPage.searchChats(this.value)" style="font-size:13px;" />
          </div>
          <div class="chat-history" id="chat-history-list">
            ${renderChatHistoryList()}
          </div>
        </div>

        <!-- Chat Main -->
        <div class="chat-main">
          <div class="chat-header-bar">
            <div style="display:flex; align-items:center; gap:12px;">
              <div class="chat-header-title" id="chat-title">เลือกหรือสร้างแชทใหม่</div>
            </div>
            <div class="chat-header-actions">
              <div class="model-selector" onclick="ChatPage.openModelSelector()">
                <span>${AIService.getProvider(currentProvider).logo}</span>
                <span id="model-display">${getModelDisplayName(currentProvider, currentModel)}</span>
                <span>▾</span>
              </div>
              <button class="btn btn-sm btn-ghost" onclick="ChatPage.exportChat()" title="Export">📤</button>
              <button class="btn btn-sm btn-ghost" onclick="ChatPage.clearCurrentChat()" title="ล้างแชท">🗑️</button>
            </div>
          </div>

          <div class="chat-messages" id="chat-messages">
            ${renderChatEmpty()}
          </div>

          <div class="chat-input-area">
            <div class="chat-input-toolbar">
              <button class="btn btn-sm btn-ghost" onclick="ChatPage.openPromptLibrary()" title="คลัง Prompt">📂 Prompt</button>
              <button class="btn btn-sm btn-ghost" onclick="ChatPage.openAgentSelector()" title="เลือก Agent">🤖 Agent</button>
              ${currentSystemPrompt ? `<span class="badge badge-primary">🧠 ${escapeHtml(truncate(currentSystemPrompt, 30))}</span>` : ''}
            </div>
            <div class="chat-input-wrapper">
              <textarea
                id="chat-input"
                placeholder="พิมพ์ข้อความ... (Enter ส่ง, Shift+Enter ขึ้นบรรทัด)"
                rows="1"
                oninput="autoResize(this)"
                onkeydown="ChatPage.handleInputKeydown(event)"
              ></textarea>
              <button class="chat-send-btn" id="send-btn" onclick="ChatPage.sendMessage()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
            <div class="chat-input-hint">Enter ส่ง • Shift+Enter ขึ้นบรรทัดใหม่</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderChatHistoryList(filter = '') {
    const chats = StorageService.getChats();
    const filtered = filter ? chats.filter(c => c.title.toLowerCase().includes(filter.toLowerCase())) : chats;

    if (filtered.length === 0) {
      return `<div style="text-align:center; padding:24px; color:var(--text-muted); font-size:13px;">${filter ? 'ไม่พบแชท' : 'ยังไม่มีประวัติแชท'}</div>`;
    }

    const groups = groupChatsByDate(filtered);
    return Object.entries(groups).map(([label, chats]) => `
      <div>
        <div style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--text-muted); padding:10px 10px 4px;">${label}</div>
        ${chats.map(c => `
          <div class="chat-history-item ${c.id === currentChatId ? 'active' : ''}" onclick="ChatPage.loadChat('${c.id}')">
            <span style="font-size:14px;">${c.icon || '💬'}</span>
            <div style="flex:1; min-width:0;">
              <div class="chat-history-title">${escapeHtml(c.title)}</div>
              <div class="chat-history-time">${formatDate(new Date(c.updatedAt || c.createdAt), 'relative')}</div>
            </div>
            <div class="chat-history-actions">
              <button onclick="event.stopPropagation(); ChatPage.favoriteChat('${c.id}')" title="Favorite">${c.favorite ? '⭐' : '☆'}</button>
              <button onclick="event.stopPropagation(); ChatPage.renameChat('${c.id}')" title="Rename">✏️</button>
              <button onclick="event.stopPropagation(); ChatPage.deleteChat('${c.id}')" title="Delete">🗑️</button>
            </div>
          </div>
        `).join('')}
      </div>
    `).join('');
  }

  function groupChatsByDate(chats) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const week = today - 7 * 86400000;
    const month = today - 30 * 86400000;

    const groups = { 'วันนี้': [], 'เมื่อวาน': [], '7 วันที่แล้ว': [], '30 วันที่แล้ว': [], 'เก่ากว่า': [] };
    for (const c of chats) {
      const t = new Date(c.updatedAt || c.createdAt).getTime();
      if (t >= today) groups['วันนี้'].push(c);
      else if (t >= yesterday) groups['เมื่อวาน'].push(c);
      else if (t >= week) groups['7 วันที่แล้ว'].push(c);
      else if (t >= month) groups['30 วันที่แล้ว'].push(c);
      else groups['เก่ากว่า'].push(c);
    }
    return Object.fromEntries(Object.entries(groups).filter(([, v]) => v.length > 0));
  }

  function renderChatEmpty() {
    const settings = StorageService.getSettings();
    const provider = AIService.getProvider(settings.defaultProvider || 'claude');
    return `
      <div class="chat-empty">
        <div class="chat-empty-icon">${provider.logo}</div>
        <h3>เริ่มการสนทนาใหม่</h3>
        <p>คุณกำลังใช้ ${provider.name} • ${getModelDisplayName(currentProvider, currentModel)}</p>
        <div class="chat-suggestions">
          <div class="chat-suggestion" onclick="ChatPage.useSuggestion('ช่วยสรุปเอกสารนี้ให้หน่อย')">
            <span>📄</span><span>สรุปเอกสาร</span>
          </div>
          <div class="chat-suggestion" onclick="ChatPage.useSuggestion('เขียนอีเมลทางการภาษาไทย เรื่อง...')">
            <span>📧</span><span>เขียนอีเมล</span>
          </div>
          <div class="chat-suggestion" onclick="ChatPage.useSuggestion('ช่วยแก้ไขสูตร Excel ให้หน่อย: ')">
            <span>📊</span><span>สูตร Excel</span>
          </div>
          <div class="chat-suggestion" onclick="ChatPage.useSuggestion('วิธีแก้ปัญหา Windows: ')">
            <span>🖥️</span><span>IT Support</span>
          </div>
          <div class="chat-suggestion" onclick="ChatPage.useSuggestion('ช่วยวางแผนโครงการ: ')">
            <span>📋</span><span>วางแผนโครงการ</span>
          </div>
          <div class="chat-suggestion" onclick="ChatPage.useSuggestion('อธิบายแนวคิดนี้ให้เข้าใจง่าย: ')">
            <span>💡</span><span>อธิบายแนวคิด</span>
          </div>
        </div>
      </div>
    `;
  }

  function getModelDisplayName(provider, model) {
    const models = AIService.getModels(provider);
    const m = models.find(m => m.id === model);
    return m ? m.name : model;
  }

  function createNewChat(title, systemPrompt) {
    currentChatId = generateId();
    currentMessages = [];
    currentSystemPrompt = systemPrompt || null;

    const chat = {
      id: currentChatId,
      title: title || 'แชทใหม่',
      icon: '💬',
      messages: [],
      provider: currentProvider,
      model: currentModel,
      systemPrompt: currentSystemPrompt,
      favorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    StorageService.saveChat(chat);
    StorageService.logActivity('chat', `สร้างแชท: ${chat.title}`, '💬');
    updateChatHistoryList();
    updateChatTitle(chat.title);
    renderMessages();
    document.getElementById('chat-input')?.focus();
    return chat;
  }

  function createNewChatWithAgent(agentName, systemPrompt) {
    createNewChat(`🤖 ${agentName}`, systemPrompt);
    const welcomeMsg = {
      id: generateId(),
      role: 'assistant',
      content: `สวัสดีครับ! ผมคือ **${agentName}** 🤖\n\nยินดีให้ความช่วยเหลือคุณ บอกได้เลยว่าต้องการความช่วยเหลือด้านใด?`,
      timestamp: new Date().toISOString()
    };
    currentMessages.push(welcomeMsg);
    saveCurrentChat();
    renderMessages();
  }

  function loadChat(id) {
    const chat = StorageService.getChat(id);
    if (!chat) return;
    currentChatId = id;
    currentMessages = chat.messages || [];
    currentSystemPrompt = chat.systemPrompt || null;
    currentProvider = chat.provider || currentProvider;
    currentModel = chat.model || currentModel;
    updateChatHistoryList();
    updateChatTitle(chat.title);
    renderMessages();
    scrollToBottom();
    document.getElementById('chat-input')?.focus();
  }

  function renderMessages() {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    if (currentMessages.length === 0 && !currentChatId) {
      container.innerHTML = renderChatEmpty();
      return;
    }

    if (currentMessages.length === 0) {
      container.innerHTML = renderChatEmpty();
      return;
    }

    container.innerHTML = currentMessages.map(m => renderMessage(m)).join('');
    scrollToBottom();
  }

  function renderMessage(msg) {
    const isUser = msg.role === 'user';
    const avatar = isUser ? 'AI' : (AIService.getProvider(currentProvider).logo);
    const content = isUser
      ? `<div class="message-bubble">${escapeHtml(msg.content).replace(/\n/g, '<br>')}</div>`
      : `<div class="message-bubble">${renderMarkdown(msg.content)}</div>`;

    return `
      <div class="message-wrapper ${isUser ? 'user' : 'assistant'}">
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
          ${content}
          <div class="message-meta">
            <span>${formatDate(new Date(msg.timestamp || Date.now()), 'time')}</span>
            <div class="message-actions">
              <button class="message-action-btn" onclick="copyToClipboard(${JSON.stringify(msg.content)})" title="คัดลอก">📋</button>
              ${!isUser ? `<button class="message-action-btn" onclick="ChatPage.regenerateMessage('${msg.id}')" title="สร้างใหม่">🔄</button>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async function sendMessage() {
    const input = document.getElementById('chat-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text || isGenerating) return;

    if (!currentChatId) createNewChat();

    const userMsg = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    currentMessages.push(userMsg);

    // Update title from first message
    const chat = StorageService.getChat(currentChatId);
    if (chat && chat.title === 'แชทใหม่' && currentMessages.length === 1) {
      const newTitle = truncate(text, 40);
      chat.title = newTitle;
      StorageService.saveChat(chat);
      updateChatTitle(newTitle);
      updateChatHistoryList();
    }

    input.value = '';
    input.style.height = 'auto';
    renderMessages();

    // Show typing indicator
    isGenerating = true;
    document.getElementById('send-btn').disabled = true;
    showTypingIndicator();

    const aiMsgId = generateId();
    let aiContent = '';

    const settings = StorageService.getSettings();
    const useStream = settings.streamingEnabled !== false;

    try {
      const result = await AIService.sendMessage({
        provider: currentProvider,
        model: currentModel,
        messages: currentMessages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })),
        systemPrompt: currentSystemPrompt,
        onToken: useStream ? (token, full) => {
          aiContent = full;
          updateStreamingMessage(aiMsgId, full);
        } : null,
        onDone: (full) => {
          aiContent = full;
        },
        onError: (err) => {
          removeTypingIndicator();
          addErrorMessage(err);
        }
      });

      if (result && !result.error) {
        removeTypingIndicator();
        const aiMsg = {
          id: aiMsgId,
          role: 'assistant',
          content: aiContent || result.text,
          timestamp: new Date().toISOString(),
          provider: currentProvider,
          model: currentModel
        };
        currentMessages.push(aiMsg);
        saveCurrentChat();
        renderMessages();
      }
    } catch (e) {
      removeTypingIndicator();
      addErrorMessage(e.message);
    } finally {
      isGenerating = false;
      document.getElementById('send-btn').disabled = false;
    }
  }

  function showTypingIndicator() {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    const indicator = document.createElement('div');
    indicator.id = 'typing-indicator';
    indicator.className = 'message-wrapper assistant';
    indicator.innerHTML = `
      <div class="message-avatar">${AIService.getProvider(currentProvider).logo}</div>
      <div class="message-content">
        <div class="message-bubble">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(indicator);
    scrollToBottom();
  }

  function updateStreamingMessage(id, content) {
    let el = document.getElementById(`streaming-${id}`);
    if (!el) {
      removeTypingIndicator();
      const container = document.getElementById('chat-messages');
      if (!container) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'message-wrapper assistant';
      wrapper.innerHTML = `
        <div class="message-avatar">${AIService.getProvider(currentProvider).logo}</div>
        <div class="message-content">
          <div class="message-bubble" id="streaming-${id}"></div>
        </div>
      `;
      container.appendChild(wrapper);
      el = document.getElementById(`streaming-${id}`);
    }
    if (el) {
      el.innerHTML = renderMarkdown(content);
      scrollToBottom();
    }
  }

  function removeTypingIndicator() {
    document.getElementById('typing-indicator')?.remove();
  }

  function addErrorMessage(msg) {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'message-wrapper assistant';
    el.innerHTML = `
      <div class="message-avatar">⚠️</div>
      <div class="message-content">
        <div class="message-bubble" style="border-color:var(--danger); background:rgba(239,68,68,0.08);">
          <strong>เกิดข้อผิดพลาด:</strong> ${escapeHtml(msg)}
          <br><br><button class="btn btn-sm btn-primary" onclick="navigateTo('settings')">⚙️ ตั้งค่า API Key</button>
        </div>
      </div>
    `;
    container.appendChild(el);
    scrollToBottom();
  }

  function saveCurrentChat() {
    if (!currentChatId) return;
    const chat = StorageService.getChat(currentChatId);
    if (!chat) return;
    chat.messages = currentMessages;
    chat.updatedAt = new Date().toISOString();
    chat.provider = currentProvider;
    chat.model = currentModel;
    StorageService.saveChat(chat);
    updateChatHistoryList();
  }

  function updateChatTitle(title) {
    const el = document.getElementById('chat-title');
    if (el) el.textContent = title;
  }

  function updateChatHistoryList(filter = '') {
    const el = document.getElementById('chat-history-list');
    if (el) el.innerHTML = renderChatHistoryList(filter);
    updateChatBadge();
  }

  function updateChatBadge() {
    const count = StorageService.getChats().length;
    const badge = document.getElementById('chat-badge');
    if (badge) badge.textContent = count > 0 ? count : '';
  }

  function scrollToBottom() {
    const el = document.getElementById('chat-messages');
    if (el) el.scrollTop = el.scrollHeight;
  }

  function handleInputKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function searchChats(value) {
    updateChatHistoryList(value);
  }

  function deleteChat(id) {
    if (!confirm('ลบแชทนี้?')) return;
    StorageService.deleteChat(id);
    if (id === currentChatId) {
      currentChatId = null;
      currentMessages = [];
      renderMessages();
      updateChatTitle('เลือกหรือสร้างแชทใหม่');
    }
    updateChatHistoryList();
    showToast('ลบแชทแล้ว', 'success');
  }

  function renameChat(id) {
    const chat = StorageService.getChat(id);
    if (!chat) return;
    const newTitle = prompt('ชื่อแชทใหม่:', chat.title);
    if (newTitle && newTitle.trim()) {
      chat.title = newTitle.trim();
      StorageService.saveChat(chat);
      updateChatHistoryList();
      if (id === currentChatId) updateChatTitle(chat.title);
    }
  }

  function favoriteChat(id) {
    const chat = StorageService.getChat(id);
    if (!chat) return;
    chat.favorite = !chat.favorite;
    StorageService.saveChat(chat);
    updateChatHistoryList();
  }

  function clearCurrentChat() {
    if (!currentChatId || !confirm('ล้างข้อความในแชทนี้?')) return;
    currentMessages = [];
    saveCurrentChat();
    renderMessages();
    showToast('ล้างแชทแล้ว', 'success');
  }

  function exportChat() {
    if (!currentChatId || currentMessages.length === 0) {
      showToast('ไม่มีข้อความที่จะ Export', 'warning');
      return;
    }
    const chat = StorageService.getChat(currentChatId);
    const text = currentMessages.map(m => `[${m.role.toUpperCase()}] ${m.content}`).join('\n\n---\n\n');
    downloadText(text, `chat-${chat?.title || 'export'}.txt`);
    showToast('Export สำเร็จ', 'success');
  }

  function useSuggestion(text) {
    const input = document.getElementById('chat-input');
    if (input) {
      input.value = text;
      input.focus();
      autoResize(input);
    }
  }

  function regenerateMessage(msgId) {
    const idx = currentMessages.findIndex(m => m.id === msgId);
    if (idx < 0) return;
    currentMessages = currentMessages.slice(0, idx);
    renderMessages();
    const lastUserMsg = [...currentMessages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      const input = document.getElementById('chat-input');
      if (input) {
        input.value = lastUserMsg.content;
        sendMessage();
      }
    }
  }

  function openModelSelector() {
    const providers = AIService.getAllProviders();
    const body = `
      <div style="display:flex; flex-direction:column; gap:16px;">
        ${Object.entries(providers).map(([id, p]) => {
          const key = StorageService.getApiKey(id);
          return `
            <div>
              <div style="font-size:12px; font-weight:700; color:var(--text-muted); margin-bottom:8px;">${p.logo} ${p.name}${!key ? ' (ไม่มี Key)' : ''}</div>
              <div style="display:flex; flex-direction:column; gap:4px;">
                ${p.models.map(m => `
                  <div onclick="ChatPage.selectModel('${id}', '${m.id}')" style="display:flex; align-items:center; gap:10px; padding:10px; background:var(--bg); border-radius:8px; cursor:pointer; border:2px solid ${id === currentProvider && m.id === currentModel ? 'var(--primary)' : 'transparent'}; transition:border-color 0.2s;" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='${id === currentProvider && m.id === currentModel ? 'var(--primary)' : 'transparent'}'">
                    <div style="flex:1;">
                      <div style="font-size:13px; font-weight:600;">${m.name}</div>
                      <div style="font-size:11px; color:var(--text-muted);">${m.description}</div>
                    </div>
                    ${id === currentProvider && m.id === currentModel ? '<span style="color:var(--primary);">✓</span>' : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    openModal('เลือกโมเดล AI', body);
  }

  function selectModel(provider, model) {
    currentProvider = provider;
    currentModel = model;
    const el = document.getElementById('model-display');
    if (el) el.textContent = getModelDisplayName(provider, model);
    closeModal();
    showToast(`เปลี่ยนเป็น ${AIService.getProvider(provider).name} - ${getModelDisplayName(provider, model)}`, 'success');
  }

  function openPromptLibrary() {
    const prompts = StorageService.getPrompts();
    const body = `
      <div style="display:flex; flex-direction:column; gap:8px; max-height:400px; overflow-y:auto;">
        ${prompts.map(p => `
          <div onclick="ChatPage.usePrompt(${JSON.stringify(p.content)})" style="padding:12px; background:var(--bg); border-radius:10px; cursor:pointer; transition:background 0.15s;" onmouseover="this.style.background='var(--card-hover)'" onmouseout="this.style.background='var(--bg)'">
            <div style="font-size:13px; font-weight:700; margin-bottom:4px;">${escapeHtml(p.name)}</div>
            <div style="font-size:11px; color:var(--text-secondary);">${escapeHtml(truncate(p.content, 80))}</div>
          </div>
        `).join('')}
      </div>
    `;
    openModal('📂 คลัง Prompt', body);
  }

  function usePrompt(content) {
    closeModal();
    const input = document.getElementById('chat-input');
    if (input) {
      input.value = content;
      input.focus();
      autoResize(input);
    }
  }

  function openAgentSelector() {
    const agents = [
      { id: 'it', icon: '🖥️', name: 'ผู้ช่วย IT Support', system: 'คุณเป็นผู้เชี่ยวชาญด้าน IT Support มีความรู้ด้าน Windows, Server, Network, Printer, Office, Active Directory ตอบเป็นภาษาไทย' },
      { id: 'excel', icon: '📊', name: 'ผู้เชี่ยวชาญ Excel', system: 'คุณเป็นผู้เชี่ยวชาญ Microsoft Excel ด้านสูตร, Pivot Table, VBA, Dashboard ตอบเป็นภาษาไทย' },
      { id: 'doc', icon: '📄', name: 'ผู้ช่วยเอกสาร', system: 'คุณเป็นผู้ช่วยด้านเอกสาร เชี่ยวชาญการสรุป เขียนอีเมล รายงาน ตอบเป็นภาษาไทย' },
      { id: 'pm', icon: '📋', name: 'ผู้จัดการโครงการ', system: 'คุณเป็นผู้จัดการโครงการ ช่วยวางแผน กำหนดลำดับความสำคัญ จัดการงานประจำวัน ตอบเป็นภาษาไทย' },
      { id: 'research', icon: '🔍', name: 'นักวิจัย AI', system: 'คุณเป็นนักวิจัยที่เชี่ยวชาญ ช่วยค้นคว้า วิเคราะห์ เปรียบเทียบ และให้คำแนะนำ ตอบเป็นภาษาไทย' }
    ];
    const body = `
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${agents.map(a => `
          <div onclick="ChatPage.selectAgent(${JSON.stringify(a.name)}, ${JSON.stringify(a.system)})" style="display:flex; align-items:center; gap:12px; padding:12px; background:var(--bg); border-radius:10px; cursor:pointer; transition:background 0.15s;" onmouseover="this.style.background='var(--card-hover)'" onmouseout="this.style.background='var(--bg)'">
            <span style="font-size:24px;">${a.icon}</span>
            <span style="font-size:14px; font-weight:600;">${a.name}</span>
          </div>
        `).join('')}
        <div onclick="ChatPage.clearSystemPrompt()" style="display:flex; align-items:center; gap:12px; padding:12px; background:var(--bg); border-radius:10px; cursor:pointer; border:1px dashed var(--border);" onmouseover="this.style.background='var(--card-hover)'" onmouseout="this.style.background='var(--bg)'">
          <span style="font-size:24px;">❌</span>
          <span style="font-size:14px; color:var(--text-secondary);">ไม่ใช้ Agent (โหมดปกติ)</span>
        </div>
      </div>
    `;
    openModal('🤖 เลือก Agent', body);
  }

  function selectAgent(name, systemPrompt) {
    closeModal();
    currentSystemPrompt = systemPrompt;
    createNewChatWithAgent(name, systemPrompt);
  }

  function clearSystemPrompt() {
    closeModal();
    currentSystemPrompt = null;
    showToast('ปิด Agent แล้ว', 'info');
  }

  return {
    render, renderChatHistoryList, updateChatHistoryList, updateChatBadge,
    createNewChat, createNewChatWithAgent, loadChat,
    sendMessage, handleInputKeydown, searchChats,
    deleteChat, renameChat, favoriteChat, clearCurrentChat, exportChat,
    useSuggestion, regenerateMessage,
    openModelSelector, selectModel,
    openPromptLibrary, usePrompt,
    openAgentSelector, selectAgent, clearSystemPrompt
  };
})();
