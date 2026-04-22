import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Fraunces:ital,wght@0,300;0,600;0,900;1,300&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#0a1628; color:#f5f0e8; font-family:'DM Mono',monospace; min-height:100vh; }
  ::placeholder { color:#8899bb; opacity:0.6; }
  input,textarea,select { outline:none; }
  ::-webkit-scrollbar { width:6px; }
  ::-webkit-scrollbar-track { background:#132040; }
  ::-webkit-scrollbar-thumb { background:#c9a84c; border-radius:3px; }

  .md-body { color:#f5f0e8; font-size:12px; line-height:1.7; }
  .md-body > *:first-child { margin-top:0; }
  .md-body h1, .md-body h2, .md-body h3 { font-family:'Fraunces',serif; color:#e8c97a; margin:10px 0 5px; }
  .md-body h1 { font-size:15px; }
  .md-body h2 { font-size:14px; }
  .md-body h3 { font-size:13px; }
  .md-body p { font-size:12px; margin-bottom:8px; }
  .md-body strong { color:#e8c97a; font-weight:600; }
  .md-body ul, .md-body ol { margin:6px 0 10px 20px; }
  .md-body li { font-size:12px; margin-bottom:3px; }
  .md-body hr { border:none; border-top:1px solid rgba(201,168,76,.2); margin:12px 0; }
  .md-body code { background:rgba(10,22,40,.7); padding:2px 6px; border-radius:4px; font-size:11px; color:#e8c97a; }

  .chat-bubble-user { background:#1c2f55; border:1px solid rgba(201,168,76,.2); border-radius:10px 10px 2px 10px; padding:12px 16px; font-size:12px; color:#f5f0e8; line-height:1.6; margin-left:40px; white-space:pre-wrap; }
  .chat-bubble-ai { background:#132040; border:1px solid rgba(201,168,76,.1); border-radius:10px 10px 10px 2px; padding:12px 16px; font-size:12px; color:#f5f0e8; line-height:1.6; }

  .output-frame { width:100%; height:calc(100vh - 180px); border:1px solid rgba(201,168,76,.15); border-radius:12px; background:#0a1628; }
  .stream-preview { background:#0a1628; border:1px solid rgba(201,168,76,.15); border-radius:12px; padding:20px; font-family:'DM Mono',monospace; font-size:10px; color:#8899bb; line-height:1.5; max-height:calc(100vh - 200px); overflow-y:auto; white-space:pre-wrap; word-break:break-all; }

  .loading-card { background:linear-gradient(135deg,#132040 0%,#0a1628 100%); border:1px solid rgba(201,168,76,.2); border-radius:16px; padding:48px 40px; min-height:calc(100vh - 200px); display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; position:relative; overflow:hidden; }
  .loading-card::before { content:''; position:absolute; top:0; left:-100%; width:100%; height:2px; background:linear-gradient(90deg,transparent,#c9a84c,transparent); animation:shimmer 2.5s infinite; }
  @keyframes shimmer { 0%{left:-100%}100%{left:100%} }
  .loading-icon { width:64px; height:64px; border-radius:50%; background:radial-gradient(circle,rgba(201,168,76,.2) 0%,transparent 70%); display:flex; align-items:center; justify-content:center; margin-bottom:24px; position:relative; }
  .loading-icon::before { content:''; position:absolute; inset:0; border-radius:50%; border:2px solid transparent; border-top-color:#c9a84c; border-right-color:#c9a84c; animation:spin 1.5s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg)} }
  .loading-icon-inner { width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,#c9a84c,#e8c97a); display:flex; align-items:center; justify-content:center; font-family:'Fraunces',serif; font-weight:900; font-size:16px; color:#0a1628; }
  .loading-title { font-family:'Fraunces',serif; font-size:26px; font-weight:700; color:#f5f0e8; margin-bottom:10px; letter-spacing:.01em; }
  .loading-subtitle { font-size:12px; color:#8899bb; letter-spacing:.08em; margin-bottom:36px; max-width:440px; line-height:1.7; }
  .loading-stages { display:flex; flex-direction:column; gap:8px; width:100%; max-width:420px; margin-bottom:28px; }
  .stage { display:flex; align-items:center; gap:12px; padding:12px 16px; background:rgba(255,255,255,.02); border:1px solid rgba(201,168,76,.08); border-radius:8px; transition:all .3s; }
  .stage.active { background:rgba(201,168,76,.08); border-color:rgba(201,168,76,.3); }
  .stage.done { background:rgba(45,106,79,.08); border-color:rgba(82,183,136,.2); }
  .stage-dot { width:10px; height:10px; border-radius:50%; background:rgba(136,153,187,.3); flex-shrink:0; transition:all .3s; }
  .stage.active .stage-dot { background:#c9a84c; box-shadow:0 0 10px rgba(201,168,76,.5); animation:pulse-dot 1.2s infinite; }
  .stage.done .stage-dot { background:#52b788; }
  @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.15)} }
  .stage-label { font-size:11px; color:#8899bb; letter-spacing:.05em; text-align:left; flex:1; }
  .stage.active .stage-label { color:#e8c97a; font-weight:500; }
  .stage.done .stage-label { color:#52b788; }
  .stage-check { font-size:12px; color:#52b788; opacity:0; transition:opacity .3s; }
  .stage.done .stage-check { opacity:1; }
  .loading-meta { display:flex; gap:24px; font-size:10px; color:#8899bb; letter-spacing:.1em; text-transform:uppercase; }
  .loading-meta-value { color:#c9a84c; font-family:'Fraunces',serif; font-size:16px; margin-left:6px; font-weight:600; }
  .debug-toggle { position:absolute; bottom:16px; right:20px; font-size:9px; color:rgba(136,153,187,.5); background:transparent; border:none; cursor:pointer; letter-spacing:.1em; text-transform:uppercase; padding:4px 8px; border-radius:4px; transition:color .2s; }
  .debug-toggle:hover { color:#c9a84c; }

  .field-label { font-size:9px; letter-spacing:.15em; text-transform:uppercase; color:#8899bb; margin-bottom:5px; display:block; }
  .field-input { width:100%; background:rgba(10,22,40,.6); border:1px solid rgba(201,168,76,.2); border-radius:7px; padding:10px 13px; font-size:12px; color:#f5f0e8; font-family:'DM Mono',monospace; transition:border .2s; }
  .field-input:focus { border-color:#c9a84c; }
  .field-input.has-error { border-color:#9b2226 !important; }
  .field-input.textarea { resize:vertical; min-height:80px; }
  .field-wrap { position:relative; }
  .reveal-btn { position:absolute; right:10px; top:50%; transform:translateY(-50%); background:transparent; border:none; color:#8899bb; cursor:pointer; font-size:10px; font-family:'DM Mono',monospace; letter-spacing:.08em; padding:4px; transition:color .2s; }
  .reveal-btn:hover { color:#c9a84c; }
  .section-title { font-family:'Fraunces',serif; font-size:14px; font-weight:600; color:#f5f0e8; letter-spacing:.05em; margin-bottom:14px; display:flex; align-items:center; gap:8px; }
  .section-dot { width:7px; height:7px; border-radius:50%; background:#c9a84c; flex-shrink:0; }
  .btn { font-family:'DM Mono',monospace; font-size:11px; letter-spacing:.12em; text-transform:uppercase; border:none; cursor:pointer; border-radius:8px; transition:all .2s; display:inline-flex; align-items:center; justify-content:center; gap:8px; }
  .btn-primary { background:#c9a84c; color:#0a1628; padding:13px 28px; font-weight:500; }
  .btn-primary:hover { background:#e8c97a; transform:translateY(-1px); }
  .btn-primary:disabled { opacity:.4; cursor:not-allowed; transform:none; }
  .btn-ghost { background:transparent; border:1px solid rgba(201,168,76,.3); color:#c9a84c; padding:9px 18px; font-size:10px; }
  .btn-ghost:hover { border-color:#c9a84c; background:rgba(201,168,76,.06); }
  .btn-danger { background:transparent; border:1px solid rgba(155,34,38,.4); color:#ff6b6b; padding:9px 18px; font-size:10px; }
  .btn-danger:hover { background:rgba(155,34,38,.15); }
  .btn-send { background:#c9a84c; color:#0a1628; padding:10px 20px; font-size:10px; }
  .btn-send:hover { background:#e8c97a; }
  .btn-send:disabled { opacity:.4; cursor:not-allowed; }
  .checkbox-row { display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:6px; cursor:pointer; transition:background .15s; }
  .checkbox-row:hover { background:rgba(201,168,76,.05); }
  .checkbox-row input { width:15px; height:15px; accent-color:#c9a84c; cursor:pointer; }
  .checkbox-label { font-size:11px; color:#f5f0e8; }
  .pulse { animation:pulse 1.5s infinite; }
  @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
  .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.75); z-index:1000; display:flex; align-items:center; justify-content:center; padding:20px; }
  .modal { background:#132040; border:1px solid rgba(201,168,76,.25); border-radius:14px; padding:28px; max-width:420px; width:100%; }
  .modal-title { font-family:'Fraunces',serif; font-size:18px; font-weight:700; color:#f5f0e8; margin-bottom:10px; }
  .modal-body { font-size:12px; color:#8899bb; line-height:1.7; margin-bottom:22px; }
  .modal-actions { display:flex; gap:10px; justify-content:flex-end; }
  .val-bar { background:rgba(155,34,38,.1); border:1px solid rgba(155,34,38,.3); border-radius:8px; padding:14px 16px; margin-bottom:20px; }
  .val-bar-title { font-size:11px; font-weight:500; color:#ff6b6b; margin-bottom:8px; }
  .val-bar-item { font-size:11px; color:#ff6b6b; margin-bottom:3px; }
  @media print { .no-print { display:none !important; } }
`;

const PERSONAL_FIELDS = [
  { key: 'clientName', label: 'Full Name', ph: 'e.g. John Smith', required: true },
  { key: 'dob', label: 'Date of Birth', ph: 'e.g. January 1, 1990' },
  { key: 'ssn', label: 'SSN', ph: 'XXX-XX-XXXX', sensitive: true },
  { key: 'dl', label: "Driver's License #", ph: 'DL Number', sensitive: true },
  { key: 'homeAddress', label: 'Home Address', ph: '123 Main St, City, State 00000' },
  { key: 'email', label: 'Email', ph: 'client@email.com' },
  { key: 'phone', label: 'Phone', ph: '(000) 000-0000' },
  { key: 'housing', label: 'Housing (Rent/Own + Monthly Amount)', ph: 'e.g. Rent — $1,500/month' },
  { key: 'employer', label: 'Employer', ph: 'Employer Name' },
  { key: 'jobTitle', label: 'Job Title', ph: 'Job Title' },
  { key: 'yearsJob', label: 'Years at Current Job', ph: 'e.g. 2' },
  { key: 'personalIncome', label: 'Personal Annual Income', ph: 'e.g. $75,000', required: true },
  { key: 'maidenName', label: "Mother's Maiden Name", ph: 'Maiden Name', sensitive: true },
];

const BUSINESS_FIELDS = [
  { key: 'bizName', label: 'Business Legal Name', ph: 'Business Name LLC' },
  { key: 'bizStructure', label: 'Structure (LLC / Corp / S-Corp)', ph: 'LLC' },
  { key: 'ein', label: 'EIN', ph: 'XX-XXXXXXX', required: true },
  { key: 'bizStart', label: 'Business Start Date', ph: 'e.g. January 1, 2024' },
  { key: 'industry', label: 'Industry', ph: 'e.g. Consulting' },
  { key: 'naics', label: 'NAICS Code', ph: 'e.g. 541600' },
  { key: 'bizAddress', label: 'Business Address', ph: '123 Business Ave, City, State 00000' },
  { key: 'bizPhone', label: 'Business Phone', ph: '(000) 000-0000' },
  { key: 'bizEmail', label: 'Business Email', ph: 'business@email.com' },
  { key: 'revenue', label: 'Est. Annual Revenue', ph: 'e.g. $250,000' },
  { key: 'expenses', label: 'Est. Annual Expenses', ph: 'e.g. $200,000' },
  { key: 'employees', label: 'Number of Employees', ph: 'e.g. 1' },
];

const CREDIT_FIELDS = [
  { key: 'eqScore', label: 'Equifax Score', ph: 'e.g. 750' },
  { key: 'exScore', label: 'Experian Score', ph: 'e.g. 755' },
  { key: 'tuScore', label: 'TransUnion Score', ph: 'e.g. 748' },
  { key: 'fraudAlert', label: 'Fraud Alert Active?', ph: 'Yes or No' },
  { key: 'revolving', label: 'Total Revolving Balance', ph: 'e.g. $2,500' },
  { key: 'revLimit', label: 'Total Revolving Limit', ph: 'e.g. $30,000' },
  { key: 'inquiries', label: 'Hard Inquiries (creditor + date)', ph: 'e.g. Capital One — March 2025' },
  { key: 'latePay', label: 'Late Payments', ph: 'None or describe' },
  { key: 'collections', label: 'Collections / Derogatory', ph: 'None or describe' },
  { key: 'installment', label: 'Open Installment Loans (list + balance)', ph: 'e.g. Auto loan $15,000 — $350/month' },
];

const BANK_OPTIONS = ['Chase', 'Wells Fargo', 'Bank of America', 'Amex', 'Capital One', 'Citi', 'US Bank', 'Truist'];

function LoadingCard({ output, streamRef }) {
  const [showRaw, setShowRaw] = useState(false);
  const charCount = output.length;

  const stages = [
    { label: 'Analyzing credit profile', markers: ['score-card', 'Key Credit Metrics', 'Credit Score'] },
    { label: 'Flagging risks & red flags', markers: ['Red Flags', 'red-card', 'CRITICAL', 'HARD STOP'] },
    { label: 'Building application schedule', markers: ['SCHEDULE', 'time-block', '9:00 AM', 'Schedule'] },
    { label: 'Pre-filling banker forms', markers: ['BANKER FORMS', 'Chase Ink', 'Truist Business'] },
    { label: 'Drafting intro letters', markers: ['INTRODUCTIONS', 'letter-bank', 'Dear '] },
    { label: 'Finalizing tracker & affiliate links', markers: ['TRACKER', 'tracker', 'Commission'] },
  ];

  const stageStatus = stages.map((s, i) => {
    const hasAny = s.markers.some(m => output.includes(m));
    const nextHasAny = i < stages.length - 1 && stages[i + 1].markers.some(m => output.includes(m));
    if (nextHasAny) return 'done';
    if (hasAny) return 'active';
    return 'pending';
  });

  if (charCount > 100 && !stageStatus.includes('active') && !stageStatus.includes('done')) {
    stageStatus[0] = 'active';
  }

  const formattedCount = charCount.toLocaleString();

  if (showRaw) {
    return (
      <div style={{ position: 'relative' }}>
        <div ref={streamRef} className="stream-preview">
          {output || 'Waiting for response...'}
          <span style={{ color: '#c9a84c' }} className="pulse">▌</span>
        </div>
        <button className="debug-toggle" onClick={() => setShowRaw(false)} style={{ position: 'absolute', top: 16, right: 20 }}>
          ← Hide Raw View
        </button>
      </div>
    );
  }

  return (
    <div className="loading-card">
      <div className="loading-icon">
        <div className="loading-icon-inner">F</div>
      </div>
      <div className="loading-title">Building your funding package</div>
      <div className="loading-subtitle">
        Claude is analyzing the credit profile and generating a complete, custom SOP with banker forms, intro letters, and application schedule. Typically takes 30–60 seconds.
      </div>
      <div className="loading-stages">
        {stages.map((s, i) => (
          <div key={i} className={`stage ${stageStatus[i]}`}>
            <div className="stage-dot" />
            <div className="stage-label">{s.label}</div>
            <div className="stage-check">✓</div>
          </div>
        ))}
      </div>
      <div className="loading-meta">
        <div>Streaming<span className="loading-meta-value">{formattedCount}</span> chars</div>
      </div>
      <button className="debug-toggle" onClick={() => setShowRaw(true)}>
        Show Raw HTML
      </button>
    </div>
  );
}

function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-title">Start a new client?</div>
        <div className="modal-body">
          This will clear the current package and all chat history permanently.
          Make sure you have copied or printed anything you need before continuing.
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel — Keep Working</button>
          <button className="btn btn-danger" onClick={onConfirm}>Yes, Clear Everything</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [form, setForm] = useState({});
  const [banking, setBanking] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfBase64, setPdfBase64] = useState('');
  const [notes, setNotes] = useState('');
  const [tier, setTier] = useState('full');
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatting, setChatting] = useState(false);
  const [step, setStep] = useState('form');
  const [showConfirm, setShowConfirm] = useState(false);
  const [revealed, setRevealed] = useState({});
  const [errors, setErrors] = useState([]);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [affiliate, setAffiliate] = useState(null);
  const streamRef = useRef(null);
  const chatEndRef = useRef(null);

  const fetchMe = async () => {
    try {
      const r = await fetch('/api/me');
      if (r.ok) setAffiliate(await r.json());
    } catch (e) {}
  };

  useEffect(() => { fetchMe(); }, []);

  const handleLogout = async () => {
    document.cookie = 'affiliate_auth=; Path=/; Max-Age=0';
    window.location.href = '/login';
  };
  useEffect(() => {
    if (streamRef.current && generating) streamRef.current.scrollTop = streamRef.current.scrollHeight;
  }, [output, generating]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const setField = (key, val) => { setForm(f => ({ ...f, [key]: val })); setErrors([]); };

  const handlePDF = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfFile(file);
    const reader = new FileReader();
    reader.onload = () => setPdfBase64(reader.result.split(',')[1]);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs = [];
    if (!form.clientName?.trim()) errs.push('Client Full Name');
    if (!form.personalIncome?.trim()) errs.push('Personal Annual Income');
    if (!form.ein?.trim()) errs.push('EIN');
    if (!form.eqScore?.trim() && !form.exScore?.trim() && !form.tuScore?.trim()) errs.push('At least one credit score');
    return errs;
  };

  const cleanHTML = (raw) => {
    if (!raw) return '';
    let cleaned = raw.trim();
    cleaned = cleaned.replace(/^```html\s*/i, '');
    cleaned = cleaned.replace(/^```\s*/i, '');
    cleaned = cleaned.replace(/\s*```\s*$/, '');
    const docStart = cleaned.indexOf('<!DOCTYPE');
    if (docStart > 0) cleaned = cleaned.slice(docStart);
    const navScript = '<script>(function(){function activate(idx){var secs=document.querySelectorAll(".section");var btns=document.querySelectorAll(".nav-btn");secs.forEach(function(s,i){s.classList.toggle("active",i===idx)});btns.forEach(function(b,i){b.classList.toggle("active",i===idx)});window.scrollTo({top:0,behavior:"smooth"})}window.show=function(idx,btn){activate(idx)};function wire(){document.querySelectorAll(".nav-btn").forEach(function(b,i){b.addEventListener("click",function(){activate(i)})})}if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",wire)}else{wire()}})();</script>';
    if (/<\/body>/i.test(cleaned)) {
      cleaned = cleaned.replace(/<\/body>/i, navScript + '</body>');
    } else {
      cleaned = cleaned + navScript;
    }
    return cleaned;
  };

  const buildPrompt = () => {
    const f = form;
    const tierLabel = tier === 'starter' ? 'Starter — Basic Plan' : tier === 'full' ? 'Full Roadmap — Complete Gameplan & Summary for Max Funding' : 'Done With You — Full Roadmap + hands-on support on application day';
    return `Generate a complete funding package as a self-contained HTML document for this client.

PACKAGE TIER: ${tierLabel}

PERSONAL INFORMATION
Full Name: ${f.clientName||'Not provided'}
Date of Birth: ${f.dob||'Not provided'}
SSN: ${f.ssn||'Not provided'}
Drivers License: ${f.dl||'Not provided'}
Home Address: ${f.homeAddress||'Not provided'}
Email: ${f.email||'Not provided'}
Phone: ${f.phone||'Not provided'}
Housing: ${f.housing||'Not provided'}
Employer: ${f.employer||'Not provided'}
Job Title: ${f.jobTitle||'Not provided'}
Years at Job: ${f.yearsJob||'Not provided'}
Personal Annual Income: ${f.personalIncome||'Not provided'}
Mothers Maiden Name: ${f.maidenName||'Not provided'}

BUSINESS INFORMATION
Business Legal Name: ${f.bizName||'Not provided'}
Business Structure: ${f.bizStructure||'Not provided'}
EIN: ${f.ein||'Not provided'}
Business Start Date: ${f.bizStart||'Not provided'}
Industry: ${f.industry||'Not provided'}
NAICS Code: ${f.naics||'Not provided'}
Business Address: ${f.bizAddress||'Not provided'}
Business Phone: ${f.bizPhone||'Not provided'}
Business Email: ${f.bizEmail||'Not provided'}
Est Annual Revenue: ${f.revenue||'Not provided'}
Est Annual Expenses: ${f.expenses||'Not provided'}
Number of Employees: ${f.employees||'Not provided'}

CREDIT PROFILE
Equifax Score: ${f.eqScore||'Not provided'}
Experian Score: ${f.exScore||'Not provided'}
TransUnion Score: ${f.tuScore||'Not provided'}
Fraud Alert Active: ${f.fraudAlert||'Not provided'}
Total Revolving Balance: ${f.revolving||'Not provided'}
Total Revolving Limit: ${f.revLimit||'Not provided'}
Hard Inquiries: ${f.inquiries||'Not provided'}
Late Payments: ${f.latePay||'None'}
Collections Derogatory: ${f.collections||'None'}
Open Installment Loans: ${f.installment||'None listed'}

EXISTING BANKING RELATIONSHIPS: ${banking.length > 0 ? banking.join(', ') : 'None confirmed'}

NOTES: ${notes||'None'}

${pdfBase64 ? 'A credit report PDF is attached. Use it to supplement or correct any information above.' : 'No PDF attached. Work from the data provided above.'}

Output the complete HTML document now, starting with <!DOCTYPE html> and ending with </html>.`;
  };

  const generate = async () => {
    const errs = validate();
    if (errs.length > 0) { setErrors(errs); return; }
    setErrors([]);
    setGenerating(true);
    setSaved(false);
    setStep('output');
    setOutput('');
    const prompt = buildPrompt();
    const initMsgs = [{ role: 'user', content: prompt }];
    setMessages(initMsgs);
    const fullText = await streamResponse(initMsgs, true, false);
    setGenerating(false);
    if (fullText) await savePackage(fullText);
  };

  const streamResponse = async (msgs, isFirst, isFollowUp) => {
    let fullText = '';
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: msgs, pdfBase64: isFirst ? pdfBase64 : undefined, isFollowUp }),
      });
      if (!res.ok) throw new Error('Failed');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const { text } = JSON.parse(data);
            if (text) {
              fullText += text;
              if (isFirst) {
                setOutput(p => p + text);
              } else {
                setMessages(prev => {
                  const u = [...prev];
                  const last = u[u.length - 1];
                  if (last?.role === 'assistant') u[u.length - 1] = { ...last, content: last.content + text };
                  else u.push({ role: 'assistant', content: text });
                  return u;
                });
              }
            }
          } catch (e) {}
        }
      }
      if (isFirst) setMessages(p => [...p, { role: 'assistant', content: fullText }]);
    } catch (err) {
      if (isFirst) setOutput('<html><body style="background:#0a1628;color:#ff6b6b;font-family:monospace;padding:40px">Error: Check your ANTHROPIC_API_KEY in Vercel environment variables, then redeploy.</body></html>');
    }
    return fullText;
  };

  const savePackage = async (content) => {
    setSaving(true);
    try {
      await fetch('/api/save_package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: form.clientName,
          bizName: form.bizName || '',
          tier,
          eqScore: form.eqScore || '',
          exScore: form.exScore || '',
          tuScore: form.tuScore || '',
          personalIncome: form.personalIncome || '',
          banking,
          content,
          createdAt: new Date().toISOString(),
        }),
      });
      setSaved(true);
      fetchMe();
    } catch (e) { console.error('Save error', e); }
    setSaving(false);
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatting) return;
    const userMsg = { role: 'user', content: chatInput.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setChatInput('');
    setChatting(true);
    await streamResponse(updated, false, true);
    setChatting(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanHTML(output)).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  };

  const handleDownload = () => {
    const blob = new Blob([cleanHTML(output)], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (form.clientName || 'client').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.download = `${safeName}_funding_package.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenInNewTab = () => {
    const blob = new Blob([cleanHTML(output)], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const requestClear = () => { if (output) setShowConfirm(true); else clearAll(); };
  const clearAll = () => { setStep('form'); setOutput(''); setMessages([]); setShowConfirm(false); setSaved(false); };

  const renderField = (f) => {
    const isSensitive = !!f.sensitive;
    const isShown = revealed[f.key];
    const hasError = errors.length > 0 && f.required && !form[f.key]?.trim();
    return (
      <div key={f.key} style={{ marginBottom: 12 }}>
        <label className="field-label">
          {f.label}{f.required && <span style={{ color: '#ff8c42', marginLeft: 4 }}>*</span>}
        </label>
        <div className="field-wrap">
          <input
            className={`field-input${hasError ? ' has-error' : ''}`}
            type={isSensitive && !isShown ? 'password' : 'text'}
            value={form[f.key] || ''}
            onChange={e => setField(f.key, e.target.value)}
            placeholder={f.ph}
            style={isSensitive ? { paddingRight: 56 } : {}}
          />
          {isSensitive && (
            <button className="reveal-btn" onClick={() => setRevealed(r => ({ ...r, [f.key]: !r[f.key] }))} type="button">
              {isShown ? 'HIDE' : 'SHOW'}
            </button>
          )}
        </div>
      </div>
    );
  };

  const N = '#0a1628'; const M = '#132040'; const G = '#c9a84c'; const GL = '#e8c97a';
  const C = '#f5f0e8'; const D = '#8899bb'; const W = '#ffffff'; const GR = '#52b788';
  const OR = '#ff8c42'; const PU = '#9b59b6'; const PL = '#c39bd3';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {showConfirm && <ConfirmModal onConfirm={clearAll} onCancel={() => setShowConfirm(false)} />}

      <div style={{ minHeight: '100vh', background: N }}>
        <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,22,40,.97)', borderBottom: '1px solid rgba(201,168,76,.15)', padding: '0 32px' }} className="no-print">
          <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: `linear-gradient(135deg,${G},${GL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: N }}>F</div>
              <span style={{ fontFamily: 'serif', fontSize: 16, fontWeight: 600, color: W }}>FundingOS</span>
              <span style={{ fontSize: 9, letterSpacing: '.15em', color: D, textTransform: 'uppercase' }}>Internal Tool</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {step === 'output' && (
                <>
                  {saving && <span style={{ fontSize: 10, color: D }} className="pulse">Saving...</span>}
                  {saved && !saving && <span style={{ fontSize: 10, color: GR }}>✓ Saved</span>}
                  <button className="btn btn-ghost" onClick={handleOpenInNewTab} disabled={generating}>Open Full Page ↗</button>
                  <button className="btn btn-ghost" onClick={handleDownload} disabled={generating}>Download HTML</button>
                  <button className="btn btn-ghost" onClick={handleCopy} disabled={generating}>{copied ? '✓ Copied' : 'Copy HTML'}</button>
                  <button className="btn btn-danger" onClick={requestClear}>← New Client</button>
                </>
              )}
              {affiliate && (
                <div style={{ display:'flex', alignItems:'center', gap:14, marginRight:8, paddingRight:14, borderRight:'1px solid rgba(136,153,187,.15)' }}>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:9, letterSpacing:'.15em', color:D, textTransform:'uppercase' }}>Credits</div>
                    <div style={{ fontFamily:'serif', fontSize:18, fontWeight:700, color: affiliate.credits>0 ? G : '#ff6b6b', lineHeight:1 }}>{affiliate.credits}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:9, letterSpacing:'.15em', color:D, textTransform:'uppercase' }}>Signed In</div>
                    <div style={{ fontSize:11, color:C, lineHeight:1.2, marginTop:2 }}>{affiliate.name}</div>
                  </div>
                  <button onClick={handleLogout} style={{ fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:'.12em', textTransform:'uppercase', color:D, background:'transparent', border:'1px solid rgba(136,153,187,.2)', borderRadius:7, padding:'7px 12px', cursor:'pointer' }}>Sign Out</button>
                </div>
              )}
              <a href="/admin" style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: D, textDecoration: 'none', padding: '9px 14px', border: '1px solid rgba(136,153,187,.2)', borderRadius: 8 }}>Admin ↗</a>
            </div>
          </div>
        </nav>

        <div style={{ maxWidth: step === 'output' ? 1400 : 1100, margin: '0 auto', padding: '40px 32px 80px' }}>

          {step === 'form' && (
            <>
              <div style={{ marginBottom: 36 }}>
                <div style={{ fontSize: 10, letterSpacing: '.25em', color: G, textTransform: 'uppercase', marginBottom: 10 }}>0% Business Credit</div>
                <h1 style={{ fontFamily: 'serif', fontSize: 48, fontWeight: 900, color: W, lineHeight: 1.05, marginBottom: 8 }}>New Funding Package</h1>
                <p style={{ fontSize: 12, color: D }}>Complete the intake form and generate a full client package in seconds.</p>
              </div>

              {errors.length > 0 && (
                <div className="val-bar">
                  <div className="val-bar-title">Complete these required fields before generating:</div>
                  {errors.map((e, i) => <div key={i} className="val-bar-item">• {e}</div>)}
                </div>
              )}

              <div style={{ background: M, border: '1px solid rgba(201,168,76,.15)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <div className="section-title"><div className="section-dot" style={{ background: PU }} />Package Tier</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                  {[
                    { val: 'starter', label: 'Starter', desc: 'Basic Plan' },
                    { val: 'full', label: 'Full Roadmap', desc: 'Complete Gameplan & Summary for Max Funding' },
                    { val: 'dwu', label: 'Done With You', desc: 'Full Roadmap + hands-on support on application day' },
                  ].map(t => (
                    <div key={t.val} onClick={() => setTier(t.val)} style={{ padding: '14px 16px', borderRadius: 9, border: `1px solid ${tier === t.val ? G : 'rgba(201,168,76,.15)'}`, background: tier === t.val ? 'rgba(201,168,76,.08)' : 'transparent', cursor: 'pointer', transition: 'all .2s' }}>
                      <div style={{ fontSize: 11, fontWeight: 500, color: tier === t.val ? G : C, marginBottom: 3 }}>{t.label}</div>
                      <div style={{ fontSize: 10, color: D }}>{t.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ background: M, border: '1px solid rgba(201,168,76,.15)', borderRadius: 12, padding: 22 }}>
                  <div className="section-title"><div className="section-dot" />Personal Information</div>
                  <p style={{ fontSize: 10, color: D, marginBottom: 14, lineHeight: 1.6 }}>
                    Fields marked <span style={{ color: OR }}>*</span> are required. Sensitive fields are masked — click SHOW to reveal.
                  </p>
                  {PERSONAL_FIELDS.map(f => renderField(f))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ background: M, border: '1px solid rgba(201,168,76,.15)', borderRadius: 12, padding: 22 }}>
                    <div className="section-title"><div className="section-dot" style={{ background: GR }} />Business Information</div>
                    {BUSINESS_FIELDS.map(f => renderField(f))}
                  </div>

                  <div style={{ background: M, border: '1px solid rgba(201,168,76,.15)', borderRadius: 12, padding: 22 }}>
                    <div className="section-title"><div className="section-dot" style={{ background: OR }} />Credit Profile</div>
                    {CREDIT_FIELDS.map(f => renderField(f))}
                  </div>

                  <div style={{ background: M, border: '1px solid rgba(201,168,76,.15)', borderRadius: 12, padding: 22 }}>
                    <div className="section-title"><div className="section-dot" style={{ background: PL }} />Existing Banking Relationships</div>
                    <p style={{ fontSize: 10, color: D, marginBottom: 12, lineHeight: 1.6 }}>Check all banks where client has an active checking or savings account.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                      {BANK_OPTIONS.map(b => (
                        <label key={b} className="checkbox-row">
                          <input type="checkbox" checked={banking.includes(b)} onChange={e => setBanking(p => e.target.checked ? [...p, b] : p.filter(x => x !== b))} />
                          <span className="checkbox-label">{b}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: M, border: '1px solid rgba(201,168,76,.15)', borderRadius: 12, padding: 22 }}>
                    <div className="section-title"><div className="section-dot" style={{ background: GL }} />Credit Report PDF</div>
                    <label style={{ display: 'block', border: '2px dashed rgba(201,168,76,.25)', borderRadius: 9, padding: '20px 16px', textAlign: 'center', cursor: 'pointer' }}>
                      <input type="file" accept=".pdf" onChange={handlePDF} style={{ display: 'none' }} />
                      <div style={{ fontSize: 22, marginBottom: 8 }}>📄</div>
                      {pdfFile
                        ? <div style={{ fontSize: 11, color: GR, fontWeight: 500 }}>✓ {pdfFile.name}</div>
                        : <div style={{ fontSize: 11, color: D }}>Click to upload credit report PDF (optional)</div>}
                    </label>
                  </div>

                  <div style={{ background: M, border: '1px solid rgba(201,168,76,.15)', borderRadius: 12, padding: 22 }}>
                    <div className="section-title"><div className="section-dot" style={{ background: D }} />Notes / Special Circumstances</div>
                    <textarea className="field-input textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional context, edge cases, or special instructions..." style={{ minHeight: 100 }} />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center' }}>
                {affiliate && affiliate.credits <= 0 ? (
                  <div style={{ background: 'rgba(155,34,38,.1)', border: '1px solid rgba(155,34,38,.3)', borderRadius: 10, padding: '20px 28px', textAlign: 'center', maxWidth: 560 }}>
                    <div style={{ fontFamily: 'serif', fontSize: 18, fontWeight: 700, color: '#ff6b6b', marginBottom: 6 }}>Out of credits</div>
                    <div style={{ fontSize: 12, color: D, lineHeight: 1.6 }}>
                      You've used all of your generation credits. Contact the account owner to add more — your past packages are still accessible above.
                    </div>
                  </div>
                ) : (
                  <button className="btn btn-primary" onClick={generate} disabled={generating || !affiliate} style={{ fontSize: 13, padding: '15px 48px' }}>
                    {generating ? <span className="pulse">Generating...</span> : '⚡ Generate Full Package'}
                  </button>
                )}
              </div>
            </>
          )}

          {step === 'output' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: '.2em', color: G, textTransform: 'uppercase', marginBottom: 4 }}>Generated Package</div>
                    <h2 style={{ fontFamily: 'serif', fontSize: 24, fontWeight: 700, color: W }}>{form.clientName || 'Client'}</h2>
                    <div style={{ fontSize: 10, color: D, marginTop: 4 }}>
                      {tier === 'starter' ? 'Starter' : tier === 'full' ? 'Full Roadmap' : 'Done With You'} · {new Date().toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {generating && <span style={{ fontSize: 10, color: OR }} className="pulse">● Building...</span>}
                    {!generating && output && <span style={{ fontSize: 10, color: GR }}>✓ Complete</span>}
                  </div>
                </div>

                {generating && (
                  <LoadingCard output={output} streamRef={streamRef} />
                )}

                {!generating && output && (
                  <iframe
                    className="output-frame"
                    srcDoc={cleanHTML(output)}
                    title="Generated Funding Package"
                    sandbox="allow-scripts allow-same-origin"
                  />
                )}
              </div>

              <div style={{ position: 'sticky', top: 76 }} className="no-print">
                <div style={{ fontSize: 10, letterSpacing: '.2em', color: G, textTransform: 'uppercase', marginBottom: 12 }}>Refine with Follow-ups</div>
                <div style={{ background: M, border: '1px solid rgba(201,168,76,.15)', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(201,168,76,.1)' }}>
                    <div style={{ fontSize: 11, color: C, fontWeight: 500, marginBottom: 3 }}>Ask a follow-up</div>
                    <div style={{ fontSize: 10, color: D, lineHeight: 1.5 }}>For small edits like rewriting a letter or adjusting one section. For big changes, start a new client.</div>
                  </div>
                  <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(201,168,76,.08)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {['Rewrite the Chase intro letter only', 'Make the Truist form figures match Chase', 'What if Equifax score is actually 750?', 'Add Wells Fargo banking relationship', 'Explain the double down strategy in more detail'].map(ex => (
                      <button key={ex} onClick={() => setChatInput(ex)} style={{ background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.12)', borderRadius: 6, padding: '7px 10px', fontSize: 10, color: D, cursor: 'pointer', textAlign: 'left', fontFamily: 'monospace', transition: 'all .15s' }}>
                        {ex}
                      </button>
                    ))}
                  </div>
                  {messages.length > 2 && (
                    <div style={{ maxHeight: 360, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {messages.slice(2).map((m, i) => (
                        <div key={i} className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                          {m.role === 'assistant'
                            ? <div className="md-body">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                                {chatting && i === messages.slice(2).length - 1 && <span style={{ color: G }} className="pulse">▌</span>}
                              </div>
                            : m.content}
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                  )}
                  <div style={{ padding: 14, borderTop: '1px solid rgba(201,168,76,.08)' }}>
                    <textarea value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }} placeholder="Add info or ask for changes..." disabled={generating || chatting} style={{ width: '100%', background: 'rgba(10,22,40,.6)', border: '1px solid rgba(201,168,76,.2)', borderRadius: 7, padding: '9px 12px', fontSize: 11, color: C, fontFamily: 'monospace', resize: 'none', height: 70, outline: 'none' }} />
                    <button className="btn btn-send" onClick={sendChat} disabled={!chatInput.trim() || generating || chatting} style={{ width: '100%', marginTop: 8 }}>
                      {chatting ? <span className="pulse">Updating...</span> : 'Send ↵'}
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                  <button className="btn btn-ghost" onClick={handleOpenInNewTab} disabled={generating} style={{ width: '100%' }}>Open Full Page ↗</button>
                  <button className="btn btn-ghost" onClick={handleDownload} disabled={generating} style={{ width: '100%' }}>Download HTML</button>
                  <button className="btn btn-ghost" onClick={handleCopy} disabled={generating} style={{ width: '100%' }}>{copied ? '✓ Copied!' : 'Copy HTML'}</button>
                  <button className="btn btn-danger" onClick={requestClear} style={{ width: '100%' }}>← Start New Client</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
// END OF FILE - DO NOT REMOVE THIS LINE
import crypto from 'crypto';
import { kv as __kv } from '@vercel/kv';

export async function getServerSideProps(ctx) {
  const cookies = ctx.req.headers.cookie || '';
  const match = cookies.match(/affiliate_auth=([^;]+)/);
  const cookie = match ? decodeURIComponent(match[1]) : null;
  if (!cookie) return { redirect: { destination: '/login', permanent: false } };
  try {
    const decoded = Buffer.from(cookie, 'base64').toString();
    const [email, hash] = decoded.split(':');
    if (!email || !hash) return { redirect: { destination: '/login', permanent: false } };
    const affiliate = await __kv.get(`affiliate:${email}`);
    if (!affiliate || !affiliate.active || !affiliate.accessCode) {
      return { redirect: { destination: '/login', permanent: false } };
    }
    const expected = crypto.createHash('sha256').update(affiliate.accessCode + 'fundingos_affiliate_salt').digest('hex');
    if (hash !== expected) return { redirect: { destination: '/login', permanent: false } };
    return { props: {} };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
}
