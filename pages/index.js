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
Fraud Alert Active: ${f.fraudAlert || 'Not provided'}
Total Revolving Balance: ${f.revolving || 'Not provided'}
Total Revolving Limit: ${f.revLimit || 'Not provided'}
Hard Inquiries: ${f.inquiries || 'Not provided'}
Late Payments: ${f.latePay || 'None'}
Collections Derogatory: ${f.collections || 'None'}
Open Installment Loans: ${f.installment || 'None listed'}

EXISTING BANKING RELATIONSHIPS: ${bankingStr}

NOTES: ${notes || 'None'}

${pdfBase64 ? 'A credit report PDF is attached. Use it to supplement or correct any information above.' : 'No PDF attached. Work from the data provided above.'}`;
  };

  const generate = async () => {
    setGenerating(true);
    setStep('output');
    setOutput('');
    const prompt = buildPrompt();
    const initialMessages = [{ role: 'user', content: prompt }];
    setMessages(initialMessages);
    await streamResponse(initialMessages, true);
    setGenerating(false);
  };

  const streamResponse = async (msgs, isFirst) => {
    let fullText = '';
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: msgs, pdfBase64: isFirst ? pdfBase64 : undefined }),
      });
      if (!res.ok) throw new Error('Generation failed');
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
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') break;
            try {
              const { text } = JSON.parse(data);
              if (text) {
                fullText += text;
                if (isFirst) {
                  setOutput(prev => prev + text);
                } else {
                  setMessages(prev => {
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    if (last.role === 'assistant') {
                      updated[updated.length - 1] = { ...last, content: last.content + text };
                    } else {
                      updated.push({ role: 'assistant', content: text });
                    }
                    return updated;
                  });
                }
              }
            } catch (e) {}
          }
        }
      }
      if (isFirst) setMessages(prev => [...prev, { role: 'assistant', content: fullText }]);
    } catch (err) {
      if (isFirst) setOutput('Error: Check your ANTHROPIC_API_KEY in Vercel environment variables, then redeploy.');
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatting) return;
    const userMsg = { role: 'user', content: chatInput.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setChatInput('');
    setChatting(true);
    await streamResponse(updatedMessages, false);
    setChatting(false);
  };

  const nav = '#0a1628';
  const mid = '#132040';
  const light = '#1c2f55';
  const gold = '#c9a84c';
  const goldL = '#e8c97a';
  const cream = '#f5f0e8';
  const dim = '#8899bb';
  const white = '#ffffff';
  const green = '#52b788';
  const orange = '#ff8c42';
  const purple = '#9b59b6';
  const purpleL = '#c39bd3';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div style={{ minHeight: '100vh', background: nav }}>

        <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,22,40,.97)', borderBottom: '1px solid rgba(201,168,76,.15)', padding: '0 32px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg,#c9a84c,#e8c97a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: nav }}>F</div>
              <span style={{ fontFamily: 'serif', fontSize: 16, fontWeight: 600, color: white }}>FundingOS</span>
              <span style={{ fontSize: 9, letterSpacing: '.15em', color: dim, textTransform: 'uppercase' }}>Internal Tool</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {step === 'output' && (
                <>
                  <button className="btn btn-ghost" onClick={() => { setStep('form'); setOutput(''); setMessages([]); }}>New Client</button>
                  <button className="btn btn-ghost" onClick={() => navigator.clipboard.writeText(messages.filter(m => m.role === 'assistant').map(m => m.content).join('\n\n---\n\n'))}>Copy Package</button>
                </>
              )}
            </div>
          </div>
        </nav>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px 80px' }}>

          {step === 'form' && (
            <>
              <div style={{ marginBottom: 36 }}>
                <div style={{ fontSize: 10, letterSpacing: '.25em', color: gold, textTransform: 'uppercase', marginBottom: 10 }}>0% Business Credit</div>
                <h1 style={{ fontFamily: 'serif', fontSize: 48, fontWeight: 900, color: white, lineHeight: 1.05, marginBottom: 8 }}>New Funding Package</h1>
                <p style={{ fontSize: 12, color: dim }}>Fill in the client intake form and generate a complete funding package in seconds.</p>
              </div>

              <div style={{ background: mid, border: '1px solid rgba(201,168,76,.15)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <div className="section-title"><div className="section-dot" style={{ background: purple }} />Package Tier</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                  {[
                    { val: 'starter', label: 'Starter', desc: '4 R1 cards', price: '$497' },
                    { val: 'full', label: 'Full Roadmap', desc: 'R1 + Double Down + 60-day', price: '$997' },
                    { val: 'dwu', label: 'Done With You', desc: 'Full + phone on app day', price: '$1,497' },
                  ].map(t => (
                    <div key={t.val} onClick={() => setTier(t.val)} style={{ padding: '14px 16px', borderRadius: 9, border: `1px solid ${tier === t.val ? gold : 'rgba(201,168,76,.15)'}`, background: tier === t.val ? 'rgba(201,168,76,.08)' : 'transparent', cursor: 'pointer', transition: 'all .2s' }}>
                      <div style={{ fontSize: 11, fontWeight: 500, color: tier === t.val ? gold : cream, marginBottom: 3 }}>{t.label}</div>
                      <div style={{ fontSize: 10, color: dim, marginBottom: 4 }}>{t.desc}</div>
                      <div style={{ fontSize: 13, fontFamily: 'serif', fontWeight: 700, color: gold }}>{t.price}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

                <div style={{ background: mid, border: '1px solid rgba(201,168,76,.15)', borderRadius: 12, padding: 22 }}>
                  <div className="section-title"><div className="section-dot" />Personal Information</div>
                  {PERSONAL_FIELDS.map(f => (
                    <div key={f.key} style={{ marginBottom: 12 }}>
                      <label className="field-label">{f.label}</label>
                      <input className="field-input" value={form[f.key] || ''} onChange={e => handleField(f.key, e.target.value)} placeholder={f.ph} />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                  <div style={{ background: mid, border: '1px solid rgba(201,168,76,.15)', borderRadius: 12, padding: 22 }}>
                    <div className="section-title"><div className="section-dot" style={{ background: green }} />Business Information</div>
                    {BUSINESS_FIELDS.map(f => (
                      <div key={f.key} style={{ marginBottom: 12 }}>
                        <label className="field-label">{f.label}</label>
                        <input className="field-input" value={form[f.key] || ''} onChange={e => handleField(f.key, e.target.value)} placeholder={f.ph} />
                      </div>
                    ))}
                  </div>

                  <div style={{ background: mid, border: '1px solid rgba(201,168,76,.15)', borderRadius: 12, padding: 22 }}>
                    <div className="section-title"><div className="section-dot" style={{ background: orange }} />Credit Profile</div>
                    {CREDIT_FIELDS.map(f => (
                      <div key={f.key} style={{ marginBottom: 12 }}>
                        <label className="field-label">{f.label}</label>
                        <input className="field-input" value={form[f.key] || ''} onChange={e => handleField(f.key, e.target.value)} placeholder={f.ph} />
                      </div>
                    ))}
                  </div>

                  <div style={{ background: mid, border: '1px solid rgba(201,168,76,.15)', borderRadius: 12, padding: 22 }}>
                    <div className="section-title"><div className="section-dot" style={{ background: purpleL }} />Existing Banking Relationships</div>
                    <p style={{ fontSize: 10, color: dim, marginBottom: 12, lineHeight: 1.6 }}>Check all banks where the client has an active checking or savings account.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                      {BANK_OPTIONS.map(b => (
                        <label key={b} className="checkbox-row">
                          <input type="checkbox" checked={banking.includes(b)} onChange={e => setBanking(prev => e.target.checked ? [...prev, b] : prev.filter(x => x !== b))} />
                          <span className="checkbox-label">{b}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: mid, border: '1px solid rgba(201,168,76,.15)', borderRadius: 12, padding: 22 }}>
                    <div className="section-title"><div className="section-dot" style={{ background: goldL }} />Credit Report PDF</div>
                    <label style={{ display: 'block', border: '2px dashed rgba(201,168,76,.25)', borderRadius: 9, padding: '20px 16px', textAlign: 'center', cursor: 'pointer' }}>
                      <input type="file" accept=".pdf" onChange={handlePDF} style={{ display: 'none' }} />
                      <div style={{ fontSize: 22, marginBottom: 8 }}>📄</div>
                      {pdfFile
                        ? <div style={{ fontSize: 11, color: green, fontWeight: 500 }}>Uploaded: {pdfFile.name}</div>
                        : <div style={{ fontSize: 11, color: dim }}>Click to upload credit report PDF (optional)</div>
                      }
                    </label>
                  </div>

                  <div style={{ background: mid, border: '1px solid rgba(201,168,76,.15)', borderRadius: 12, padding: 22 }}>
                    <div className="section-title"><div className="section-dot" style={{ background: dim }} />Notes / Special Circumstances</div>
                    <textarea className="field-input textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional context, edge cases, or special instructions..." style={{ minHeight: 100 }} />
                  </div>

                </div>
              </div>

              <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={generate} disabled={generating || !form.clientName} style={{ fontSize: 13, padding: '15px 48px' }}>
                  {generating ? 'Generating...' : 'Generate Full Package'}
                </button>
              </div>
            </>
          )}

          {step === 'output' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: '.2em', color: gold, textTransform: 'uppercase', marginBottom: 4 }}>Generated Package</div>
                    <h2 style={{ fontFamily: 'serif', fontSize: 24, fontWeight: 700, color: white }}>{form.clientName || 'Client'}</h2>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {generating && <span style={{ fontSize: 10, color: orange }}>Generating...</span>}
                    {!generating && output && <span style={{ fontSize: 10, color: green }}>Complete</span>}
                    {!generating && output && <button className="btn btn-ghost" onClick={() => navigator.clipboard.writeText(output)}>Copy</button>}
                  </div>
                </div>
                <div ref={outputRef} style={{ background: mid, border: '1px solid rgba(201,168,76,.15)', borderRadius: 12, padding: 24, maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                  {output
                    ? <div className="output-content">{output}{generating && <span style={{ color: gold }}>|</span>}</div>
                    : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: dim, fontSize: 12 }}>Generating your package...</div>
                  }
                </div>
              </div>

              <div style={{ position: 'sticky', top: 76 }}>
                <div style={{ fontSize: 10, letterSpacing: '.2em', color: gold, textTransform: 'uppercase', marginBottom: 12 }}>Refine with Follow-ups</div>
                <div style={{ background: mid, border: '1px solid rgba(201,168,76,.15)', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(201,168,76,.1)' }}>
                    <div style={{ fontSize: 11, color: cream, fontWeight: 500, marginBottom: 3 }}>Ask a follow-up</div>
                    <div style={{ fontSize: 10, color: dim, lineHeight: 1.5 }}>Add variables, correct info, or adjust any section.</div>
                  </div>
                  <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(201,168,76,.08)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      'He has a Chase checking account — adjust strategy',
                      'She has high DTI from personal loans — adjust',
                      'Rewrite the Chase intro letter only',
                      'Add Wells Fargo banking relationship',
                      'What if Equifax score is actually 750?',
                    ].map(ex => (
                      <button key={ex} onClick={() => setChatInput(ex)} style={{ background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.12)', borderRadius: 6, padding: '7px 10px', fontSize: 10, color: dim, cursor: 'pointer', textAlign: 'left', fontFamily: 'monospace', transition: 'all .15s' }}>
                        {ex}
                      </button>
                    ))}
                  </div>
                  {messages.length > 2 && (
                    <div style={{ maxHeight: 280, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {messages.slice(2).map((m, i) => (
                        <div key={i} className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                          {m.content}
                          {m.role === 'assistant' && chatting && i === messages.slice(2).length - 1 && <span style={{ color: gold }}>|</span>}
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                  )}
                  <div style={{ padding: 14, borderTop: '1px solid rgba(201,168,76,.08)' }}>
                    <textarea value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }} placeholder="Add info or ask for changes..." disabled={generating || chatting} style={{ width: '100%', background: 'rgba(10,22,40,.6)', border: '1px solid rgba(201,168,76,.2)', borderRadius: 7, padding: '9px 12px', fontSize: 11, color: cream, fontFamily: 'monospace', resize: 'none', height: 70, outline: 'none' }} />
                    <button className="btn btn-send" onClick={sendChat} disabled={!chatInput.trim() || generating || chatting} style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}>
                      {chatting ? 'Updating...' : 'Send'}
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                  <button className="btn btn-ghost" onClick={() => { setStep('form'); setOutput(''); setMessages([]); }} style={{ width: '100%', justifyContent: 'center' }}>Start New Client</button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </>
  );
}
