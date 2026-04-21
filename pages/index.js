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
  body { background:${S.navy}; color:${S.cream}; font-family:'DM Mono',monospace; min-height:100vh; }
  ::placeholder { color:${S.dim}; opacity:0.6; }
  input, textarea, select { outline:none; }
  ::-webkit-scrollbar { width:6px; }
  ::-webkit-scrollbar-track { background:${S.navyMid}; }
  ::-webkit-scrollbar-thumb { background:${S.gold}; border-radius:3px; }
  .output-content { white-space:pre-wrap; font-size:13px; line-height:1.8; color:${S.cream}; }
  .chat-bubble-user { background:${S.navyLight}; border:1px solid rgba(201,168,76,.2); border-radius:10px 10px 2px 10px; padding:12px 16px; font-size:12px; color:${S.cream}; line-height:1.6; margin-left:40px; }
  .chat-bubble-ai { background:${S.navyMid}; border:1px solid rgba(201,168,76,.1); border-radius:10px 10px 10px 2px; padding:12px 16px; font-size:12px; color:${S.cream}; line-height:1.6; white-space:pre-wrap; }
  .field-label { font-size:9px; letter-spacing:.15em; text-transform:uppercase; color:${S.dim}; margin-bottom:5px; display:block; }
  .field-input { width:100%; background:rgba(10,22,40,.6); border:1px solid rgba(201,168,76,.2); border-radius:7px; padding:10px 13px; font-size:12px; color:${S.cream}; font-family:'DM Mono',monospace; transition:border .2s; }
  .field-input:focus { border-color:${S.gold}; }
  .field-input.textarea { resize:vertical; min-height:80px; }
  .section-title { font-family:'Fraunces',serif; font-size:14px; font-weight:600; color:${S.cream}; letter-spacing:.05em; margin-bottom:14px; display:flex; align-items:center; gap:8px; }
  .section-dot { width:7px; height:7px; border-radius:50%; background:${S.gold}; flex-shrink:0; }
  .btn { font-family:'DM Mono',monospace; font-size:11px; letter-spacing:.12em; text-transform:uppercase; border:none; cursor:pointer; border-radius:8px; transition:all .2s; display:inline-flex; align-items:center; gap:8px; }
  .btn-primary { background:${S.gold}; color:${S.navy}; padding:13px 28px; font-weight:500; }
  .btn-primary:hover { background:${S.goldLight}; transform:translateY(-1px); }
  .btn-primary:disabled { opacity:.4; cursor:not-allowed; transform:none; }
  .btn-ghost { background:transparent; border:1px solid rgba(201,168,76,.3); color:${S.gold}; padding:9px 18px; font-size:10px; }
  .btn-ghost:hover { border-color:${S.gold}; background:rgba(201,168,76,.06); }
  .btn-send { background:${S.gold}; color:${S.navy}; padding:10px 20px; font-size:10px; flex-shrink:0; }
  .btn-send:hover { background:${S.goldLight}; }
  .btn-send:disabled { opacity:.4; cursor:not-allowed; }
  .tag { font-size:9px; letter-spacing:.12em; text-transform:uppercase; padding:3px 10px; border-radius:20px; border:1px solid; display:inline-block; }
  .tag-green { color:${S.greenLight}; border-color:rgba(82,183,136,.3); background:rgba(45,106,79,.15); }
  .tag-orange { color:${S.orange}; border-color:rgba(255,140,66,.3); background:rgba(196,92,0,.1); }
  .tag-gold { color:${S.gold}; border-color:rgba(201,168,76,.3); background:rgba(201,168,76,.08); }
  .checkbox-row { display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:6px; cursor:pointer; transition:background .15s; }
  .checkbox-row:hover { background:rgba(201,168,76,.05); }
  .checkbox-row input { width:15px; height:15px; accent-color:${S.gold}; cursor:pointer; }
  .checkbox-label { font-size:11px; color:${S.cream}; }
  .pulse { animation:pulse 1.5s infinite; }
  @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
`;

const PERSONAL_FIELDS = [
  { key: 'clientName', label: 'Full Name', ph: 'e.g. John Smith' },
  { key: 'dob', label: 'Date of Birth', ph: 'e.g. January 1, 1990' },
  { key: 'ssn', label: 'SSN', ph: 'XXX-XX-XXXX' },
  { key: 'dl', label: "Driver's License #", ph: 'DL Number' },
  { key: 'homeAddress', label: 'Home Address', ph: '123 Main St, City, State 00000' },
  { key: 'email', label: 'Email', ph: 'client@email.com' },
  { key: 'phone', label: 'Phone', ph: '(000) 000-0000' },
  { key: 'housing', label: 'Housing (Rent/Own + Monthly Amount)', ph: 'e.g. Rent — $1,500/month' },
  { key: 'employer', label: 'Employer', ph: 'Employer Name' },
  { key: 'jobTitle', label: 'Job Title', ph: 'Job Title' },
  { key: 'yearsJob', label: 'Years at Current Job', ph: 'e.g. 2' },
  { key: 'personalIncome', label: 'Personal Annual Income', ph: 'e.g. $75,000' },
  { key: 'maidenName', label: "Mother's Maiden Name", ph: 'Maiden Name' },
];

const BUSINESS_FIELDS = [
  { key: 'bizName', label: 'Business Legal Name', ph: 'Business Name LLC' },
  { key: 'bizStructure', label: 'Structure (LLC / Corp / S-Corp)', ph: 'LLC' },
  { key: 'ein', label: 'EIN', ph: 'XX-XXXXXXX' },
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

function Field({ label, fieldKey, value, onChange, textarea }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label className="field-label">{label}</label>
      {textarea
        ? <textarea className="field-input textarea" value={value} onChange={e => onChange(fieldKey, e.target.value)} placeholder={textarea} />
        : <input className="field-input" value={value} onChange={e => onChange(fieldKey, e.target.value)} placeholder={label} />
      }
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
  const [step, setStep] = useState('form'); // form | output
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
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      setPdfBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const buildPrompt = () => {
    const f = form;
    const tierLabel = tier === 'starter' ? 'Starter (4 R1 cards)' : tier === 'full' ? 'Full Roadmap (R1 + Double Down + 60-day follow-up)' : 'Done With You (Full Roadmap + phone on application day)';
    const bankingStr = banking.length > 0 ? banking.join(', ') : 'None confirmed';

    return `Generate a complete funding package for this client.

PACKAGE TIER: ${tierLabel}

PERSONAL INFORMATION
Full Name: ${f.clientName || '—'}
Date of Birth: ${f.dob || '—'}
SSN: ${f.ssn || '—'}
Driver's License: ${f.dl || '—'}
Home Address: ${f.homeAddress || '—'}
Email: ${f.email || '—'}
Phone: ${f.phone || '—'}
Housing: ${f.housing || '—'}
Employer: ${f.employer || '—'}
Job Title: ${f.jobTitle || '—'}
Years at Job: ${f.yearsJob || '—'}
Personal Annual Income: ${f.personalIncome || '—'}
Mother's Maiden Name: ${f.maidenName || '—'}

BUSINESS INFORMATION
Business Legal Name: ${f.bizName || '—'}
Business Structure: ${f.bizStructure || '—'}
EIN: ${f.ein || '—'}
Business Start Date: ${f.bizStart || '—'}
Industry: ${f.industry || '—'}
NAICS Code: ${f.naics || '—'}
Business Address: ${f.bizAddress || '—'}
Business Phone: ${f.bizPhone || '—'}
Business Email: ${f.bizEmail || '—'}
Est. Annual Revenue: ${f.revenue || '—'}
Est. Annual Expenses: ${f.expenses || '—'}
Number of Employees: ${f.employees || '—'}

CREDIT PROFILE
Equifax Score: ${f.eqScore || '—'}
Experian Score: ${f.exScore || '—'}
TransUnion Score: ${f.tuScore || '—'}
Fraud Alert Active: ${f.fraudAlert || '—'}
Total Revolving Balance: ${f.revolving || '—'}
Total Revolving Limit: ${f.revLimit || '—'}
Hard Inquiries: ${f.inquiries || '—'}
Late Payments: ${f.latePay || 'None'}
Collections / Derogatory: ${f.collections || 'None'}
Open Installment Loans: ${f.installment || 'None listed'}

EXISTING BANKING RELATIONSHIPS: ${bankingStr}

NOTES / SPECIAL CIRCUMSTANCES:
${notes || 'None'}

${pdfBase64 ? 'A credit report PDF has been attached — use it to supplement or correct any information above.' : 'No credit report PDF attached — work from the data provided above.'}`;
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
        body: JSON.stringify({
          messages: msgs,
          pdfBase64: isFirst ? pdfBase64 : undefined,
        }),
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

      if (isFirst) {
        setMessages(prev => [...prev, { role: 'assistant', content: fullText }]);
      }
    } catch (err) {
      if (isFirst) setOutput('Error generating package. Check your API key in Vercel environment variables.');
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

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  const copyAll = () => {
    const allText = messages
      .filter(m => m.role === 'assistant')
      .map(m => m.content)
      .join('\n\n---\n\n');
    navigator.clipboard.writeText(allText);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div style={{ minHeight: '100vh', background: `radial-gradient(ellipse 60% 40% at 20% 5%, rgba(201,168,76,.07) 0%, transparent 50%), radial-gradient(ellipse 50% 60% at 80% 90%, rgba(28,47,85,.8) 0%, transparent 60%), ${S.navy}` }}>

        {/* NAV */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,22,40,.97)', backdropFilter: 'blur(12px)', borderBottom: `1px solid rgba(201,168,76,.15)`, padding: '0 32px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: `linear-gradient(135deg, ${S.gold}, ${S.goldLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: S.navy }}>F</div>
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, color: S.white }}>FundingOS</span>
              <span style={{ fontSize: 9, letterSpacing: '.15em', color: S.dim, textTransform: 'uppercase', marginLeft: 4 }}>Internal Tool</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {step === 'output' && (
                <>
                  <button className="btn btn-ghost" onClick={() => { setStep('form'); setOutput(''); setMessages([]); }}>← New Client</button>
                  <button className="btn btn-ghost" onClick={copyAll}>Copy Full Package</button>
                </>
              )}
            </div>
          </div>
        </nav>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px 80px' }}>

          {step === 'form' && (
            <>
              {/* HEADER */}
              <div style={{ marginBottom: 36 }}>
                <div style={{ fontSize: 10, letterSpacing: '.25em', color: S.gold, textTransform: 'uppercase', marginBottom: 10 }}>0% Business Credit</div>
                <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900, color: S.white, lineHeight: 1.05, marginBottom: 8 }}>
                  New Funding<br /><span style={{ color: S.gold, fontStyle: 'italic', fontWeight: 300 }}>Package</span>
                </h1>
                <p style={{ fontSize: 12, color: S.dim, letterSpacing: '.05em' }}>Complete the intake form and generate a full client package in seconds.</p>
              </div>

              {/* TIER SELECT */}
              <div style={{ background: S.navyMid, border: `1px solid rgba(201,168,76,.15)`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <div className="section-title"><div className="section-dot" style={{ background: S.purple }} />Package Tier</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                  {[
                    { val: 'starter', label: 'Starter', desc: 'Basic Plan' },
                    { val: 'full', label: 'Full Roadmap', desc: 'Complete Gameplan & Summary for Max Funding' },
                    { val: 'dwu', label: 'Done With You', desc: 'Full Roadmap + hands-on support on application day' },
                  ].map(t => (
                    <div key={t.val} onClick={() => setTier(t.val)} style={{ padding: '14px 16px', borderRadius: 9, border: `1px solid ${tier === t.val ? S.gold : 'rgba(201,168,76,.15)'}`, background: tier === t.val ? 'rgba(201,168,76,.08)' : 'transparent', cursor: 'pointer', transition: 'all .2s' }}>
                      <div style={{ fontSize: 11, fontWeight: 500, color: tier === t.val ? S.gold : S.cream, marginBottom: 3 }}>{t.label}</div>
                      <div style={{ fontSize: 10, color: S.dim }}>{t.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

                {/* PERSONAL */}
                <div style={{ background: S.navyMid, border: `1px solid rgba(201,168,76,.15)`, borderRadius: 12, padding: 22 }}>
                  <div className="section-title"><div className="section-dot" />Personal Information</div>
                  {PERSONAL_FIELDS.map(f => (
                    <div key={f.key} style={{ marginBottom: 12 }}>
                      <label className="field-label">{f.label}</label>
                      <input className="field-input" value={form[f.key] || ''} onChange={e => handleField(f.key, e.target.value)} placeholder={f.ph} />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                  {/* BUSINESS */}
                  <div style={{ background: S.navyMid, border: `1px solid rgba(201,168,76,.15)`, borderRadius: 12, padding: 22 }}>
                    <div className="section-title"><div className="section-dot" style={{ background: S.greenLight }} />Business Information</div>
                    {BUSINESS_FIELDS.map(f => (
                      <div key={f.key} style={{ marginBottom: 12 }}>
                        <label className="field-label">{f.label}</label>
                        <input className="field-input" value={form[f.key] || ''} onChange={e => handleField(f.key, e.target.value)} placeholder={f.ph} />
                      </div>
                    ))}
                  </div>

                  {/* CREDIT */}
                  <div style={{ background: S.navyMid, border: `1px solid rgba(201,168,76,.15)`, borderRadius: 12, padding: 22 }}>
                    <div className="section-title"><div className="section-dot" style={{ background: S.orange }} />Credit Profile</div>
                    {CREDIT_FIELDS.map(f => (
                      <div key={f.key} style={{ marginBottom: 12 }}>
                        <label className="field-label">{f.label}</label>
                        <input className="field-input" value={form[f.key] || ''} onChange={e => handleField(f.key, e.target.value)} placeholder={f.ph} />
                      </div>
                    ))}
                  </div>

                  {/* BANKING RELATIONSHIPS */}
                  <div style={{ background: S.navyMid, border: `1px solid rgba(201,168,76,.15)`, borderRadius: 12, padding: 22 }}>
                    <div className="section-title"><div className="section-dot" style={{ background: S.purpleL }} />Existing Banking Relationships</div>
                    <p style={{ fontSize: 10, color: S.dim, marginBottom: 12, lineHeight: 1.6 }}>Check all banks where the client has an active checking or savings account.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                      {BANK_OPTIONS.map(b => (
                        <label key={b} className="checkbox-row">
                          <input type="checkbox" checked={banking.includes(b)} onChange={e => setBanking(prev => e.target.checked ? [...prev, b] : prev.filter(x => x !== b))} />
                          <span className="checkbox-label">{b}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* CREDIT REPORT UPLOAD */}
                  <div style={{ background: S.navyMid, border: `1px solid rgba(201,168,76,.15)`, borderRadius: 12, padding: 22 }}>
                    <div className="section-title"><div className="section-dot" style={{ background: S.goldLight }} />Credit Report PDF</div>
                    <label style={{ display: 'block', border: `2px dashed rgba(201,168,76,.25)`, borderRadius: 9, padding: '20px 16px', textAlign: 'center', cursor: 'pointer', transition: 'border .2s' }}>
                      <input type="file" accept=".pdf" onChange={handlePDF} style={{ display: 'none' }} />
                      <div style={{ fontSize: 22, marginBottom: 8 }}>📄</div>
                      {pdfFile
                        ? <><div style={{ fontSize: 11, color: S.greenLight, fontWeight: 500 }}>✓ {pdfFile.name}</div><div style={{ fontSize: 10, color: S.dim, marginTop: 3 }}>Click to change</div></>
                        : <><div style={{ fontSize: 11, color: S.dim }}>Click to upload credit report PDF</div><div style={{ fontSize: 10, color: S.dim, marginTop: 3 }}>Optional — AI will use form data if not provided</div></>
                      }
                    </label>
                  </div>

                  {/* NOTES */}
                  <div style={{ background: S.navyMid, border: `1px solid rgba(201,168,76,.15)`, borderRadius: 12, padding: 22 }}>
                    <div className="section-title"><div className="section-dot" style={{ background: S.dim }} />Notes / Special Circumstances</div>
                    <textarea className="field-input textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional context — business relationships, unusual income sources, recent derogatory items, specific lender instructions, etc." style={{ minHeight: 100 }} />
                  </div>

                </div>
              </div>

              {/* GENERATE */}
              <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={generate} disabled={generating || !form.clientName} style={{ fontSize: 13, padding: '15px 48px' }}>
                  {generating ? <><span className="pulse">●</span> Generating...</> : '⚡ Generate Full Package'}
                </button>
              </div>
            </>
          )}

          {step === 'output' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>

              {/* OUTPUT PANEL */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: '.2em', color: S.gold, textTransform: 'uppercase', marginBottom: 4 }}>Generated Package</div>
                    <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700, color: S.white }}>{form.clientName || 'Client'}</h2>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {generating && <span className="tag tag-orange pulse">● Generating</span>}
                    {!generating && output && <span className="tag tag-green">✓ Complete</span>}
                    {!generating && output && <button className="btn btn-ghost" onClick={copyOutput}>Copy</button>}
                  </div>
                </div>

                <div ref={outputRef} style={{ background: S.navyMid, border: `1px solid rgba(201,168,76,.15)`, borderRadius: 12, padding: 24, maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                  {output
                    ? <div className="output-content">{output}{generating && <span className="pulse" style={{ color: S.gold }}>▌</span>}</div>
                    : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: S.dim, fontSize: 12 }}><span className="pulse">Generating your package...</span></div>
                  }
                </div>
              </div>

              {/* CHAT PANEL */}
              <div style={{ position: 'sticky', top: 76 }}>
                <div style={{ fontSize: 10, letterSpacing: '.2em', color: S.gold, textTransform: 'uppercase', marginBottom: 12 }}>Refine with Follow-ups</div>

                <div style={{ background: S.navyMid, border: `1px solid rgba(201,168,76,.15)`, borderRadius: 12, overflow: 'hidden' }}>
                  {/* Chat header */}
                  <div style={{ padding: '14px 18px', borderBottom: `1px solid rgba(201,168,76,.1)` }}>
                    <div style={{ fontSize: 11, color: S.cream, fontWeight: 500, marginBottom: 3 }}>Ask a follow-up</div>
                    <div style={{ fontSize: 10, color: S.dim, lineHeight: 1.5 }}>Add variables, correct info, or ask for specific sections to be adjusted.</div>
                  </div>

                  {/* Example prompts */}
                  <div style={{ padding: '12px 14px', borderBottom: `1px solid rgba(201,168,76,.08)`, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      'He has a Chase checking account — adjust the strategy',
                      'She has a high DTI from personal loans — adjust approach',
                      'Rewrite the Chase intro letter only',
                      'Add Wells Fargo to the banking relationships',
                      'What if Equifax score is actually 750?',
                    ].map(ex => (
                      <button key={ex} onClick={() => setChatInput(ex)} style={{ background: 'rgba(201,168,76,.06)', border: `1px solid rgba(201,168,76,.12)`, borderRadius: 6, padding: '7px 10px', fontSize: 10, color: S.dim, cursor: 'pointer', textAlign: 'left', transition: 'all .15s', fontFamily: "'DM Mono',monospace" }}
                        onMouseEnter={e => { e.target.style.color = S.cream; e.target.style.borderColor = 'rgba(201,168,76,.3)'; }}
                        onMouseLeave={e => { e.target.style.color = S.dim; e.target.style.borderColor = 'rgba(201,168,76,.12)'; }}>
                        {ex}
                      </button>
                    ))}
                  </div>

                  {/* Chat messages */}
                  {messages.length > 2 && (
                    <div style={{ maxHeight: 300, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {messages.slice(2).map((m, i) => (
                        <div key={i} className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                          {m.role === 'assistant' && chatting && i === messages.slice(2).length - 1
                            ? <>{m.content}<span className="pulse" style={{ color: S.gold }}>▌</span></>
                            : m.content}
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                  )}

                  {/* Chat input */}
                  <div style={{ padding: 14, borderTop: `1px solid rgba(201,168,76,.08)` }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <textarea
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                        placeholder="Add info or ask for changes..."
                        disabled={generating || chatting}
                        style={{ flex: 1, background: 'rgba(10,22,40,.6)', border: `1px solid rgba(201,168,76,.2)`, borderRadius: 7, padding: '9px 12px', fontSize: 11, color: S.cream, fontFamily: "'DM Mono',monospace", resize: 'none', height: 70, outline: 'none' }}
                      />
                    </div>
                    <button className="btn btn-send" onClick={sendChat} disabled={!chatInput.trim() || generating || chatting} style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}>
                      {chatting ? <span className="pulse">Updating...</span> : 'Send ↵'}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                  <button className="btn btn-ghost" onClick={copyAll} style={{ width: '100%', justifyContent: 'center' }}>Copy Full Conversation</button>
                  <button className="btn btn-ghost" onClick={() => { setStep('form'); setOutput(''); setMessages([]); }} style={{ width: '100%', justifyContent: 'center' }}>← Start New Client</button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </>
  );
}
