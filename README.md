# 🤖 ศูนย์ผู้ช่วย AI อัจฉริยะ

**ผู้ช่วยทำงานอัตโนมัติสำหรับงานเอกสาร IT และการจัดการข้อมูล**

[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-blue)](https://pages.github.com)
[![No Framework](https://img.shields.io/badge/Framework-Vanilla%20JS-yellow)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Dark Mode](https://img.shields.io/badge/Theme-Dark%20%2F%20Light-purple)](.)

---

## 🚀 การติดตั้งและ Deploy

### วิธีที่ 1: GitHub Pages (แนะนำ)

1. **Fork หรือ Upload** ไฟล์ทั้งหมดไปยัง GitHub Repository ใหม่

2. **เปิด GitHub Pages:**
   - ไปที่ Repository → Settings → Pages
   - Source: Deploy from a branch → main → / (root)
   - กด Save

3. **รอ 1-2 นาที** แล้วเข้าที่ `https://yourusername.github.io/repository-name`

### วิธีที่ 2: รันในเครื่อง (Local)

```bash
# ไม่ต้องติดตั้งอะไร — เปิดไฟล์ index.html ในเบราว์เซอร์
# หรือใช้ Live Server:
npx serve .
# หรือ
python -m http.server 8080
```

---

## 🔑 การตั้งค่า API Key

### Claude (Anthropic) — แนะนำ

1. สมัครที่ [console.anthropic.com](https://console.anthropic.com)
2. ไปที่ API Keys → Create Key
3. คัดลอก Key ที่ขึ้นต้นด้วย `sk-ant-api03-...`
4. เปิดแอป → ⚙️ ตั้งค่า → API Keys → Claude → เพิ่ม Key

### OpenAI

1. สมัครที่ [platform.openai.com](https://platform.openai.com)
2. API Keys → Create new secret key
3. Key ขึ้นต้นด้วย `sk-...`

### Google Gemini

1. ไปที่ [aistudio.google.com](https://aistudio.google.com)
2. Get API Key → Create API Key
3. Key ขึ้นต้นด้วย `AIza...`

### DeepSeek

1. สมัครที่ [platform.deepseek.com](https://platform.deepseek.com)
2. API Keys → Create API Key
3. Key ขึ้นต้นด้วย `sk-...`

---

## 📁 โครงสร้างไฟล์

```
/
├── index.html              # SPA Shell
├── style.css               # Design System
├── app.js                  # Router & App Logic
├── README.md
│
├── utils/
│   ├── helpers.js          # Utility Functions
│   └── markdown.js         # Markdown Renderer
│
├── services/
│   ├── storage-service.js  # LocalStorage Abstraction
│   └── ai-service.js       # AI Provider Abstraction
│
└── pages/
    ├── home.js             # Dashboard
    ├── chat.js             # AI Chat
    ├── agents.js           # AI Agents
    ├── tasks.js            # Task Manager
    ├── notes.js            # Notes
    ├── prompts.js          # Prompt Library
    ├── knowledge.js        # Knowledge Base
    ├── tokens.js           # Token Dashboard
    ├── dashboard.js        # Analytics
    ├── settings.js         # Settings
    └── google-services.js  # Gmail, Drive, Calendar, Sheets, Photos
```

---

## 🎯 ฟีเจอร์หลัก

| ฟีเจอร์ | รายละเอียด |
|---------|-----------|
| 🤖 AI Chat | แชทกับ Claude, OpenAI, Gemini, DeepSeek |
| 🧠 AI Agents | ผู้ช่วย IT, Excel, เอกสาร, โครงการ, วิจัย |
| ✅ Task Manager | จัดการงาน พร้อมลำดับความสำคัญ |
| 📝 Notes | บันทึกโน้ต + Markdown |
| 📂 Prompt Library | คลัง Prompt สำเร็จรูป |
| 📚 Knowledge Base | อัปโหลดเอกสารเพื่อใช้กับ AI |
| 💰 Token Dashboard | ติดตามการใช้งานและต้นทุน |
| 🌙 Dark/Light Mode | สลับธีมได้ |

---

## 🔒 ความปลอดภัย

- **ไม่มี Server** — ทุกอย่างรันในเบราว์เซอร์
- **API Key เก็บใน localStorage** — ไม่ส่งไปที่ใดนอกจาก AI Provider
- **ไม่มีการเก็บข้อมูลบน Cloud** — ข้อมูลอยู่ในเครื่องคุณเท่านั้น

---

## 🔮 Future Roadmap

- [ ] Cloudflare Workers Backend
- [ ] Supabase / PostgreSQL Database
- [ ] User Accounts & Team Workspace
- [ ] Google OAuth Integration
- [ ] Voice Assistant
- [ ] RAG (Retrieval-Augmented Generation)
- [ ] MCP (Model Context Protocol)
- [ ] Workflow Builder
- [ ] Memory System

---

## ☁️ Future: Cloudflare Workers Setup

```bash
# 1. Install Wrangler
npm install -g wrangler

# 2. Login
wrangler login

# 3. Create Worker
wrangler init ai-workspace-worker

# 4. Deploy
wrangler deploy
```

---

## 📄 License

MIT License — ใช้งานและแก้ไขได้อิสระ
