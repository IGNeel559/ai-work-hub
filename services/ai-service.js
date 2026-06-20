/* ============================================
   AI Service - Multi-provider abstraction
   ============================================ */

const AIService = (() => {
  const PROVIDERS = {
    claude: {
      name: 'Claude',
      logo: '🟠',
      models: [
        { id: 'claude-opus-4-5', name: 'Claude Opus 4.5', description: 'ทรงพลังที่สุด' },
        { id: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5', description: 'สมดุล' },
        { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5', description: 'เร็วและประหยัด' }
      ],
      defaultModel: 'claude-sonnet-4-5',
      endpoint: 'https://api.anthropic.com/v1/messages',
      headers: (key) => ({
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      }),
      buildBody: (messages, model, stream, systemPrompt) => ({
        model,
        max_tokens: 4096,
        system: systemPrompt || 'คุณคือผู้ช่วย AI ที่ฉลาด มีประโยชน์ และตอบเป็นภาษาไทยเป็นหลัก หากผู้ใช้เขียนภาษาอื่น ให้ตอบด้วยภาษาเดียวกัน',
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        stream
      }),
      parseResponse: (data) => data.content?.[0]?.text || '',
      parseStream: (line) => {
        if (!line.startsWith('data: ')) return null;
        const json = line.slice(6).trim();
        if (json === '[DONE]') return null;
        try {
          const obj = JSON.parse(json);
          return obj.delta?.text || obj.delta?.value || null;
        } catch { return null; }
      },
      pricing: { input: 0.003, output: 0.015 }
    },

    openai: {
      name: 'OpenAI',
      logo: '⚫',
      models: [
        { id: 'gpt-4o', name: 'GPT-4o', description: 'ทรงพลังที่สุด' },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'เร็วและประหยัด' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Turbo' }
      ],
      defaultModel: 'gpt-4o',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      headers: (key) => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      }),
      buildBody: (messages, model, stream, systemPrompt) => ({
        model,
        messages: [
          { role: 'system', content: systemPrompt || 'คุณคือผู้ช่วย AI ที่ฉลาดและมีประโยชน์ ตอบเป็นภาษาไทยเป็นหลัก' },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ],
        stream,
        max_tokens: 4096
      }),
      parseResponse: (data) => data.choices?.[0]?.message?.content || '',
      parseStream: (line) => {
        if (!line.startsWith('data: ')) return null;
        const json = line.slice(6).trim();
        if (json === '[DONE]') return null;
        try {
          const obj = JSON.parse(json);
          return obj.choices?.[0]?.delta?.content || null;
        } catch { return null; }
      },
      pricing: { input: 0.005, output: 0.015 }
    },

    gemini: {
      name: 'Gemini',
      logo: '🔵',
      models: [
        { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'เร็วที่สุด' },
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'ทรงพลัง' }
      ],
      defaultModel: 'gemini-2.0-flash',
      endpoint: (key, model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      headers: () => ({ 'Content-Type': 'application/json' }),
      buildBody: (messages, model, stream, systemPrompt) => ({
        contents: messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
        generationConfig: { maxOutputTokens: 4096 }
      }),
      parseResponse: (data) => data.candidates?.[0]?.content?.parts?.[0]?.text || '',
      parseStream: null,
      pricing: { input: 0.00025, output: 0.0005 }
    },

    deepseek: {
      name: 'DeepSeek',
      logo: '🐋',
      models: [
        { id: 'deepseek-chat', name: 'DeepSeek Chat', description: 'ราคาประหยัด' },
        { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', description: 'Reasoning' }
      ],
      defaultModel: 'deepseek-chat',
      endpoint: 'https://api.deepseek.com/v1/chat/completions',
      headers: (key) => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      }),
      buildBody: (messages, model, stream, systemPrompt) => ({
        model,
        messages: [
          { role: 'system', content: systemPrompt || 'คุณคือผู้ช่วย AI ที่ฉลาดและมีประโยชน์ ตอบเป็นภาษาไทย' },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ],
        stream,
        max_tokens: 4096
      }),
      parseResponse: (data) => data.choices?.[0]?.message?.content || '',
      parseStream: (line) => {
        if (!line.startsWith('data: ')) return null;
        const json = line.slice(6).trim();
        if (json === '[DONE]') return null;
        try {
          const obj = JSON.parse(json);
          return obj.choices?.[0]?.delta?.content || null;
        } catch { return null; }
      },
      pricing: { input: 0.00014, output: 0.00028 }
    }
  };

  function getProvider(name) { return PROVIDERS[name] || PROVIDERS.claude; }
  function getAllProviders() { return PROVIDERS; }
  function getModels(provider) { return PROVIDERS[provider]?.models || []; }

  async function sendMessage({ provider, model, messages, systemPrompt, onToken, onDone, onError }) {
    const p = getProvider(provider);
    const apiKey = StorageService.getApiKey(provider);

    if (!apiKey) {
      const err = `ไม่พบ API Key สำหรับ ${p.name} กรุณาตั้งค่า API Key ในหน้าตั้งค่า`;
      if (onError) onError(err);
      return { error: err };
    }

    const useStream = !!(onToken && p.parseStream);
    const selectedModel = model || p.defaultModel;

    let endpoint = typeof p.endpoint === 'function'
      ? p.endpoint(apiKey, selectedModel)
      : p.endpoint;

    const body = p.buildBody(messages, selectedModel, useStream, systemPrompt);
    const headers = p.headers(apiKey);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errText = await response.text();
        let errMsg = `API Error ${response.status}`;
        try {
          const errJson = JSON.parse(errText);
          errMsg = errJson.error?.message || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      if (useStream) {
        return await handleStream(response, p.parseStream, onToken, onDone, provider, selectedModel);
      } else {
        const data = await response.json();
        const text = p.parseResponse(data);
        const usage = data.usage || {};
        const inputTokens = usage.input_tokens || usage.prompt_tokens || 0;
        const outputTokens = usage.output_tokens || usage.completion_tokens || 0;
        if (inputTokens || outputTokens) {
          StorageService.recordTokenUsage(provider, inputTokens, outputTokens, selectedModel);
        }
        if (onDone) onDone(text);
        return { text, usage: { input: inputTokens, output: outputTokens } };
      }
    } catch (err) {
      const msg = err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
      if (onError) onError(msg);
      return { error: msg };
    }
  }

  async function handleStream(response, parseStream, onToken, onDone, provider, model) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.trim()) continue;
          const token = parseStream(line);
          if (token) {
            fullText += token;
            if (onToken) onToken(token, fullText);
          }
        }
      }
      if (buffer.trim()) {
        const token = parseStream(buffer);
        if (token) { fullText += token; if (onToken) onToken(token, fullText); }
      }
    } catch (e) {
      console.error('Stream error:', e);
    }

    // Rough token estimation
    const inputEst = 0;
    const outputEst = Math.ceil(fullText.length / 4);
    if (outputEst > 0) StorageService.recordTokenUsage(provider, inputEst, outputEst, model);

    if (onDone) onDone(fullText);
    return { text: fullText };
  }

  async function testConnection(provider) {
    const p = getProvider(provider);
    const apiKey = StorageService.getApiKey(provider);
    if (!apiKey) return { success: false, error: 'ไม่พบ API Key' };

    try {
      const result = await sendMessage({
        provider,
        model: p.defaultModel,
        messages: [{ role: 'user', content: 'สวัสดี ตอบว่า "เชื่อมต่อสำเร็จ" เท่านั้น' }],
        systemPrompt: 'ตอบสั้นๆ'
      });

      if (result.error) return { success: false, error: result.error };
      StorageService.updateApiKeyStatus(provider, 'connected');
      return { success: true, response: result.text };
    } catch (e) {
      StorageService.updateApiKeyStatus(provider, 'failed');
      return { success: false, error: e.message };
    }
  }

  function estimateCost(provider, inputTokens, outputTokens) {
    const p = getProvider(provider);
    const pricing = p.pricing || { input: 0.003, output: 0.015 };
    return (inputTokens / 1000 * pricing.input) + (outputTokens / 1000 * pricing.output);
  }

  return { getProvider, getAllProviders, getModels, sendMessage, testConnection, estimateCost, PROVIDERS };
})();
