/* ============================================
   AI Agents Page
   ============================================ */

function renderAgents() {
  const agents = [
    {
      id: 'it',
      icon: '🖥️',
      name: 'ผู้ช่วย IT Support',
      description: 'ผู้เชี่ยวชาญด้านไอที ช่วยแก้ปัญหา Windows, Server, Network, Printer, Office และ Active Directory',
      skills: ['Windows', 'Windows Server', 'Network', 'Printer', 'Microsoft Office', 'Active Directory'],
      color: '#3B82F6',
      prompts: [
        '🖥️ วิธีแก้ปัญหา Windows ไม่เปิด',
        '🌐 ตั้งค่า IP Address แบบ Static',
        '🖨️ Printer ไม่ติดต่อกับคอมพิวเตอร์',
        '👥 สร้าง User ใน Active Directory'
      ],
      system: 'คุณเป็นผู้เชี่ยวชาญด้าน IT Support มีประสบการณ์มากกว่า 10 ปี เชี่ยวชาญด้าน Windows 10/11, Windows Server 2019/2022, Network Infrastructure, Printer Management, Microsoft Office 365, และ Active Directory ตอบเป็นภาษาไทย อธิบายขั้นตอนอย่างละเอียด ชัดเจน ทีละขั้นตอน'
    },
    {
      id: 'excel',
      icon: '📊',
      name: 'ผู้เชี่ยวชาญ Excel',
      description: 'เชี่ยวชาญสูตร Excel ขั้นสูง Pivot Table, VBA, Dashboard และ Reporting',
      skills: ['สูตร Excel', 'Pivot Table', 'VBA Macro', 'Dashboard', 'Power Query', 'Reporting'],
      color: '#10B981',
      prompts: [
        '📈 สอนสร้าง Pivot Table',
        '🔢 สูตร VLOOKUP / XLOOKUP',
        '🤖 เขียน VBA Macro อัตโนมัติ',
        '📊 สร้าง Dashboard ใน Excel'
      ],
      system: 'คุณเป็นผู้เชี่ยวชาญ Microsoft Excel ระดับสูง มีความเชี่ยวชาญด้านสูตร Excel ขั้นสูง, Pivot Table, VBA Macro Programming, การสร้าง Dashboard, Power Query, และ Data Analysis ตอบเป็นภาษาไทย ให้ตัวอย่างสูตรที่ copy-paste ได้เลย อธิบายการทำงานของสูตรด้วย'
    },
    {
      id: 'document',
      icon: '📄',
      name: 'ผู้ช่วยเอกสาร',
      description: 'ช่วยสรุป เขียนใหม่ สร้างรายงาน และร่างอีเมลในภาษาไทยและอังกฤษ',
      skills: ['สรุปเอกสาร', 'เขียนใหม่', 'รายงาน', 'อีเมลทางการ', 'แปลภาษา', 'ตรวจทาน'],
      color: '#8B5CF6',
      prompts: [
        '📝 สรุปรายงานนี้ให้หน่อย',
        '📧 เขียนอีเมลทางการภาษาไทย',
        '✍️ ปรับปรุงภาษาให้สละสลวย',
        '🌐 แปลเอกสารภาษาอังกฤษ'
      ],
      system: 'คุณเป็นผู้เชี่ยวชาญด้านการเขียนและจัดการเอกสารภาษาไทย มีทักษะการสรุปเอกสาร การเขียนอีเมลทางการ การร่างรายงาน การแปลภาษา และการตรวจทานภาษา ตอบเป็นภาษาไทย ใช้ภาษาสุภาพ เป็นทางการ และถูกต้องตามหลักภาษาไทย'
    },
    {
      id: 'pm',
      icon: '📋',
      name: 'ผู้จัดการโครงการ',
      description: 'ช่วยวางแผนโครงการ กำหนดลำดับความสำคัญ สร้าง Timeline และจัดการงานประจำวัน',
      skills: ['วางแผนโครงการ', 'ลำดับความสำคัญ', 'Timeline', 'งานประจำวัน', 'Risk Analysis', 'OKR'],
      color: '#F59E0B',
      prompts: [
        '📅 สร้าง Project Timeline',
        '🎯 กำหนด KPI และ OKR',
        '⚠️ วิเคราะห์ความเสี่ยงโครงการ',
        '📋 สร้าง Task List ประจำวัน'
      ],
      system: 'คุณเป็นผู้จัดการโครงการมืออาชีพ มีประสบการณ์บริหารโครงการขนาดใหญ่ เชี่ยวชาญด้านการวางแผน, การกำหนดลำดับความสำคัญ, การสร้าง Timeline, การวิเคราะห์ความเสี่ยง, OKR/KPI และการจัดการทีม ตอบเป็นภาษาไทย ให้คำแนะนำที่ปฏิบัติได้จริง'
    },
    {
      id: 'research',
      icon: '🔍',
      name: 'นักวิจัย AI',
      description: 'ช่วยค้นคว้า วิเคราะห์ข้อมูล เปรียบเทียบ และให้คำแนะนำที่มีหลักฐาน',
      skills: ['ค้นคว้าข้อมูล', 'วิเคราะห์', 'เปรียบเทียบ', 'สังเคราะห์', 'คำแนะนำ', 'ประเมินผล'],
      color: '#EF4444',
      prompts: [
        '🔬 วิเคราะห์เปรียบเทียบ A vs B',
        '📚 สรุปงานวิจัยเรื่องนี้',
        '💡 แนะนำทางเลือกที่ดีที่สุด',
        '📊 วิเคราะห์ข้อมูล/ตัวเลข'
      ],
      system: 'คุณเป็นนักวิจัยและนักวิเคราะห์มืออาชีพ มีทักษะการค้นคว้า วิเคราะห์ข้อมูล เปรียบเทียบทางเลือก สังเคราะห์ข้อมูลจากหลายแหล่ง และให้คำแนะนำที่มีหลักฐานรองรับ ตอบเป็นภาษาไทย ใช้หลักเหตุผลและข้อมูลเชิงประจักษ์'
    }
  ];

  return `
    <div class="page-enter">
      <div class="page-header">
        <h1 class="page-title">🧠 ผู้ช่วย AI</h1>
        <p class="page-subtitle">เลือกผู้ช่วย AI เฉพาะทางที่เหมาะกับงานของคุณ</p>
      </div>

      <div class="agent-grid">
        ${agents.map(a => `
          <div class="agent-card" onclick="startAgentFromPage('${a.id}')">
            <span class="agent-icon">${a.icon}</span>
            <div class="agent-name">${a.name}</div>
            <div class="agent-desc">${a.description}</div>
            <div class="agent-skills">
              ${a.skills.map(s => `<span class="agent-skill">${s}</span>`).join('')}
            </div>
            <div style="margin-bottom:12px;">
              <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--text-muted); margin-bottom:8px;">ลองถาม:</div>
              <div class="agent-prompts">
                ${a.prompts.map(p => `
                  <button class="agent-prompt-btn" onclick="event.stopPropagation(); useAgentPrompt('${a.id}', ${JSON.stringify(p)})">${p}</button>
                `).join('')}
              </div>
            </div>
            <button class="btn btn-primary btn-full" style="margin-top:auto;">
              💬 เริ่มสนทนา
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

const agentSystems = {
  it: 'คุณเป็นผู้เชี่ยวชาญด้าน IT Support มีประสบการณ์มากกว่า 10 ปี เชี่ยวชาญ Windows, Windows Server, Network, Printer, Office 365, Active Directory ตอบเป็นภาษาไทย อธิบายทีละขั้นตอน',
  excel: 'คุณเป็นผู้เชี่ยวชาญ Microsoft Excel ด้านสูตร, Pivot Table, VBA, Dashboard, Power Query ตอบเป็นภาษาไทย ให้ตัวอย่างสูตรที่ copy-paste ได้',
  document: 'คุณเป็นผู้ช่วยด้านเอกสาร เชี่ยวชาญการสรุป เขียนอีเมล รายงาน แปลภาษา ตอบเป็นภาษาไทย ใช้ภาษาสุภาพและเป็นทางการ',
  pm: 'คุณเป็นผู้จัดการโครงการมืออาชีพ เชี่ยวชาญวางแผน Timeline Risk Analysis OKR ตอบเป็นภาษาไทย',
  research: 'คุณเป็นนักวิจัยมืออาชีพ วิเคราะห์ข้อมูล เปรียบเทียบ สังเคราะห์ ให้คำแนะนำที่มีหลักฐาน ตอบเป็นภาษาไทย'
};

const agentNames = {
  it: 'ผู้ช่วย IT Support',
  excel: 'ผู้เชี่ยวชาญ Excel',
  document: 'ผู้ช่วยเอกสาร',
  pm: 'ผู้จัดการโครงการ',
  research: 'นักวิจัย AI'
};

function startAgentFromPage(id) {
  navigateTo('chat');
  setTimeout(() => {
    if (window.ChatPage) window.ChatPage.createNewChatWithAgent(agentNames[id], agentSystems[id]);
  }, 150);
}

function useAgentPrompt(agentId, promptText) {
  navigateTo('chat');
  setTimeout(() => {
    if (window.ChatPage) {
      window.ChatPage.createNewChatWithAgent(agentNames[agentId], agentSystems[agentId]);
      setTimeout(() => {
        const cleanPrompt = promptText.replace(/^[^\s]+\s/, '');
        window.ChatPage.useSuggestion(cleanPrompt);
      }, 200);
    }
  }, 150);
}
