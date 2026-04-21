import { useState, useRef, useEffect } from 'react';

const S = {
  navy: '#0a1628',
  navyMid: '#132040',
  navyLight: '#1c2f55',
  gold: '#c9a84c',
  goldLight: '#e8c97a',
  cream: '#f5f0e8',
  green: '#2d6a4f',
  greenLight: '#52b788',
  red: '#9b2226',
  orange: '#ff8c42',
  dim: '#8899bb',
  white: '#ffffff',
  purple: '#9b59b6',
  purpleL: '#c39bd3',
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Fraunces:ital,wght@0,300;0,600;0,900;1,300&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#0a1628; color:#f5f0e8; font-family:'DM Mono',monospace; min-height:100vh; }
  ::placeholder { color:#8899bb; opacity:0.6; }
  input, textarea, select { outline:none; }
  ::-webkit-scrollbar { width:6px; }
  ::-webkit-scrollbar-track { background:#132040; }
  ::-webkit-scrollbar-thumb { background:#c9a84c; border-radius:3px; }
  .output-content { white-space:pre-wrap; font-size:13px; line-height:1.8; color:#f5f0e8; }
  .chat-bubble-user { background:#1c2f55; border:1px solid rgba(201,168,76,.2); border-radius:10px 10px 2px 10px; padding:12px 16px; font-size:12px; color:#f5f0e8; line-height:1.6; margin-left:40px; }
  .chat-bubble-ai { background:#132040; border:1px solid rgba(201,168,76,.1); border-radius:10px 10px 10px 2px; padding:12px 16px; font-size:12px; color:#f5f0e8; line-height:1.6; white-space:pre-wrap; }
  .field-label { font-size:9px; letter-spacing:.15em; text-transform:uppercase; color:#8899bb; margin-bottom:5px; display:block; }
  .field-input { width:100%; background:rgba(10,22,40,.6); border:1px solid rgba(201,168,76,.2); border-radius:7px; padding:10px 13px; font-size:12px; color:#f5f0e8; font-family:'DM Mono',monospace; transition:border .2s; }
  .field-input:focus { border-color:#c9a84c; }
  .field-input.textarea { resize:vertical; min-height:80px; }
  .section-title { font-family:'Fraunces',serif; font-size:14px; font-weight:600; color:#f5f0e8; letter-spacing:.05em; margin-bottom:14px; display:flex; align-items:center; gap:8px; }
  .section-dot { width:7px; height:7px; border-radius:50%; background:#c9a84c; flex-shrink:0; }
  .btn { font-family:'DM Mono',monospace; font-size:11px; letter-spacing:.12em; text-transform:uppercase; border:none; cursor:pointer; border-radius:8px; transition:all .2s; display:inline-flex; align-items:center; gap:8px; }
  .btn-primary { background:#c9a84c; color:#0a1628; padding:13px 28px; font-weight:500; }
  .btn-primary:hover { background:#e8c97a; transform:translateY(-1px); }
  .btn-primary:disabled { opacity:.4; cursor:not-allowed; transform:none; }
  .btn-ghost { background:transparent; border:1px solid rgba(201,168,76,.3); color:#c9a84c; padding:9px 18px; font-size:10px; }
  .btn-ghost:hover { border-color:#c9a84c; background:rgba(201,168,76,.06); }
  .btn-send { background:#c9a84c; color:#0a1628; padding:10px 20px; font-size:10px; flex-shrink:0; }
  .btn-send:hover { background:#e8c97a; }
  .btn-send:disabled { opacity:.4; cursor:not-allowed; }
  .tag { font-size:9px; letter-spacing:.12em; text-transform:uppercase; padding:3px 10px; border-radius:20px; border:1px solid; display:inline-block; }
  .tag-green { color:#52b788; border-color:rgba(82,183,136,.3); background:rgba(45,106,79,.15); }
  .tag-orange { color:#ff8c42; border-color:rgba(255,140,66,.3); background:rgba(196,92,0,.1); }
  .tag-gold { color:#c9a84c; border-color:rgba(201,168,76,.3); background:rgba(201,168,76,.08); }
  .checkbox-row { display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:6px; cursor:pointer; transition:background .15s; }
  .checkbox-row:hover { background:rgba(201,168,76,.05); }
  .checkbox-row input { width:15px; height:15px; accent-color:#c9a84c; cursor:pointer; }
  .checkbox-label { font-size:11px; color:#f5f0e8; }
  .pulse { animation:pulse 1.5s infinite; }
  @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
`;

const PERSONAL_FIELDS = [
  { key: 'clientName', label: 'Full Name', ph: 'Vivek Patel' },
  { key: 'dob', label: 'Date of Birth', ph: 'December 3, 1998' },
  { key: 'ssn', label: 'SSN', ph: '202-84-4735' },
  { key: 'dl', label: "Driver's License #", ph: '31947037' },
  { key: 'homeAddress', label: 'Home Address', ph: '1365 Quakers Way, Quakertown, PA 18951' },
  { key: 'email', label: 'Email', ph: 'email@example.com' },
  { key: 'phone', label: 'Phone', ph: '(570) 350-7841' },
  { key: 'housing', label: 'Housing (Rent/Own + Monthly Amount)', ph: 'Rent $2,100/month' },
  { key: 'employer', label: 'Employer', ph: 'DaySmart Software' },
  { key: 'jobTitle', label: 'Job Title', ph: 'Senior Financial Analyst' },
  { key: 'yearsJob', label: 'Years at Current Job', ph: '1' },
  { key: 'personalIncome', label: 'Personal Annual Income', ph: '$118,000' },
  { key: 'maidenName', label: "Mother's Maiden Name", ph: 'Patel' },
];

const BUSINESS_FIELDS = [
  { key: 'bizName', label: 'Business Legal Name', ph: 'Trishula Group LLC' },
  { key: 'bizStructure', label: 'Structure (LLC / Corp / S-Corp)', ph: 'LLC' },
  { key: 'ein', label: 'EIN', ph: '41-3245939' },
  { key: 'bizStart', label: 'Business Start Date', ph: 'December 23, 2025' },
  { key: 'industry', label: 'Industry', ph: 'Advertising' },
  { key: 'naics', label: 'NAICS Code', ph: '541810' },
  { key: 'bizAddress', label: 'Business Address', ph: '1401 Arch St Unit 1010, Philadelphia, PA 19102' },
  { key: 'bizPhone', label: 'Business Phone', ph: '(570) 350-7841' },
  { key: 'bizEmail', label: 'Business Email', ph: 'email@example.com' },
  { key: 'revenue', label: 'Est. Annual Revenue', ph: '$400,000' },
  { key: 'expenses', label: 'Est. Annual Expenses', ph: '$360,000' },
  { key: 'employees', label: 'Number of Employees', ph: '0' },
];

const CREDIT_FIELDS = [
  { key: 'eqScore', label: 'Equifax Score', ph: '790' },
  { key: 'exScore', label: 'Experian Score', ph: '796' },
  { key: 'tuScore', label: 'TransUnion Score', ph: '796' },
  { key: 'fraudAlert', label: 'Fraud Alert Active?', ph: 'No' },
  { key: 'revolving', label: 'Total Revolving Balance', ph: '$1,083' },
  { key: 'revLimit', label: 'Total Revolving Limit', ph: '$71,000' },
  { key: 'inquiries', label: 'Hard Inquiries (creditor + date)', ph: 'Capital One x2 June 2025, US Dept of Ed' },
  { key: 'latePay', label: 'Late Payments', ph: 'None' },
  { key: 'collections', label: 'Collections / Derogatory', ph: 'None' },
  { key: 'installment', label: 'Open Installment Loans', ph: '5 student loans $16,800 total $202/month' },
];

const BANK_OPTIONS = ['Chase', 'Wells Fargo', 'Bank of America', 'Amex', 'Capital One', 'Citi', 'US Bank', 'Truist'];

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
  const outputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (outputRef.current && step === 'output') {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handlePDF = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfFile(file);
    const reader = new FileReader();
    reader.onload = () => setPdfBase64(reader.result.split(',')[1]);
    reader.readAsDataURL(file);
  };

  const buildPrompt = () => {
    const f = form;
    const tierLabel = tier === 'starter' ? 'Starter (4 R1 cards)' : tier === 'full' ? 'Full Roadmap (R1 + Double Down + 60-day follow-up)' : 'Done With You (Full Roadmap + phone on application day)';
    const bankingStr = banking.length > 0 ? banking.join(', ') : 'None confirmed';
    return `Generate a complete funding package for this client.

PACKAGE TIER: ${tierLabel}

PERSONAL INFORMATION
Full Name: ${f.clientName || 'Not provided'}
Date of Birth: ${f.dob || 'Not provided'}
SSN: ${f.ssn || 'Not provided'}
Drivers License: ${f.dl || 'Not provided'}
Home Address: ${f.homeAddress || 'Not provided'}
Email: ${f.email || 'Not provided'}
Phone: ${f.phone || 'Not provided'}
Housing: ${f.housing || 'Not provided'}
Employer: ${f.employer || 'Not provided'}
Job Title: ${f.jobTitle || 'Not provided'}
Years at Job: ${f.yearsJob || 'Not provided'}
Personal Annual Income: ${f.personalIncome || 'Not provided'}
Mothers Maiden Name: ${f.maidenName || 'Not provided'}

BUSINESS INFORMATION
Business Legal Name: ${f.bizName || 'Not provided'}
Business Structure: ${f.bizStructure || 'Not provided'}
EIN: ${f.ein || 'Not provided'}
Business Start Date: ${f.bizStart || 'Not provided'}
Industry: ${f.industry || 'Not provided'}
NAICS Code: ${f.naics || 'Not provided'}
Business Address: ${f.bizAddress || 'Not provided'}
Business Phone: ${f.bizPhone || 'Not provided'}
Business Email: ${f.bizEmail || 'Not provided'}
Est Annual Revenue: ${f.revenue || 'Not provided'}
Est Annual Expenses: ${f.expenses || 'Not provided'}
Number of Employees: ${f.employees || 'Not provided'}

CREDIT PROFILE
Equifax Score: ${f.eqScore || 'Not provided'}
Experian Score: ${f.exScore || 'Not provided'}
TransUnion Score: ${f.tuScore || 'Not provided'}
Fraud Alert A
