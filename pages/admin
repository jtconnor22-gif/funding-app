import { useState, useEffect } from 'react';

const N='#0a1628',M='#132040',NL='#1c2f55',G='#c9a84c',GL='#e8c97a',C='#f5f0e8',D='#8899bb',W='#ffffff',GR='#52b788',OR='#ff8c42',RD='#9b2226',PU='#9b59b6';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Fraunces:ital,wght@0,300;0,600;0,900;1,300&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;}
  body{background:${N};color:${C};font-family:'DM Mono',monospace;min-height:100vh;}
  ::-webkit-scrollbar{width:6px;} ::-webkit-scrollbar-track{background:${M};} ::-webkit-scrollbar-thumb{background:${G};border-radius:3px;}
  .btn{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;border:none;cursor:pointer;border-radius:7px;transition:all .2s;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px 16px;}
  .btn-gold{background:${G};color:${N};font-weight:500;} .btn-gold:hover{background:${GL};}
  .btn-ghost{background:transparent;border:1px solid rgba(201,168,76,.3);color:${G};} .btn-ghost:hover{background:rgba(201,168,76,.08);}
  .btn-red{background:transparent;border:1px solid rgba(155,34,38,.4);color:#ff6b6b;} .btn-red:hover{background:rgba(155,34,38,.12);}
  .btn-sm{padding:5px 10px;font-size:9px;}
  .tab{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:${D};padding:14px 20px;cursor:pointer;border:none;background:transparent;border-bottom:2px solid transparent;white-space:nowrap;transition:all .2s;}
  .tab.active{color:${G};border-bottom-color:${G};}
  .tab:hover{color:${C};}
  .card{background:${M};border:1px solid rgba(201,168,76,.12);border-radius:12px;padding:22px;}
  .field-label{font-size:9px;letter-spacing:.15em;text-transform:uppercase;color:${D};margin-bottom:5px;display:block;}
  .field-input{width:100%;background:rgba(10,22,40,.6);border:1px solid rgba(201,168,76,.2);border-radius:7px;padding:9px 12px;font-size:12px;color:${C};font-family:'DM Mono',monospace;transition:border .2s;outline:none;}
  .field-input:focus{border-color:${G};}
  .pill{font-size:9px;letter-spacing:.1em;text-transform:uppercase;padding:3px 10px;border-radius:20px;border:1px solid;display:inline-block;white-space:nowrap;}
  .pill-new{color:${G};border-color:rgba(201,168,76,.3);background:rgba(201,168,76,.08);}
  .pill-applied{color:${PU};border-color:rgba(155,89,182,.3);background:rgba(155,89,182,.08);}
  .pill-approved{color:${GR};border-color:rgba(82,183,136,.3);background:rgba(45,106,79,.15);}
  .pill-complete{color:${D};border-color:rgba(136,153,187,.2);background:rgba(136,153,187,.05);}
  .pill-active{color:${GR};border-color:rgba(82,183,136,.3);background:rgba(45,106,79,.1);}
  .pill-inactive{color:#ff6b6b;border-color:rgba(155,34,38,.3);background:rgba(155,34,38,.08);}
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:1000;display:flex;align-items:flex-start;justify-content:center;padding:40px 20px;overflow-y:auto;}
  .modal{background:${M};border:1px solid rgba(201,168,76,.2);border-radius:14px;padding:32px;max-width:800px;width:100%;}
  select.fs{background:${M};border:1px solid rgba(201,168,76,.2);border-radius:7px;color:${C};font-family:'DM Mono',monospace;font-size:10px;padding:6px 10px;cursor:pointer;outline:none;}
  input.fi{background:${M};border:1px solid rgba(201,168,76,.2);border-radius:7px;color:${C};font-family:'DM Mono',monospace;font-size:11px;padding:8px 12px;outline:none;width:220px;}
  input.fi::placeholder{color:${D};opacity:.6;}
  .pulse{animation:pulse 1.5s infinite;}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  tr.row:hover td{background:rgba(201,168,76,.03)!important;}
`;

const STATUS = ['New','Applied','Approved','Complete'];
const tierLabel = t => t==='starter'?'Starter':t==='full'?'Full Roadmap':t==='dwu'?'Done With You':t||'—';
const pill = s => { const m={New:'pill-new',Applied:'pill-applied',Approved:'pill-approved',Complete:'pill-complete'}; return <span className={`pill ${m[s]||'pill-new'}`}>{s||'New'}</span>; };

export default function Admin() {
  const [tab, setTab] = useState('packages');
  const [packages, setPackages] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [loadingPkgs, setLoadingPkgs] = useState(true);
  const [loadingAff, setLoadingAff] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // Affiliate form
  const [affForm, setAffForm] = useState({ email:'', name:'', credits:'', notes:'' });
  const [affSaving, setAffSaving] = useState(false);
  const [affMsg, setAffMsg] = useState('');

  const fetchPackages = async () => {
    setLoadingPkgs(true);
    try { const r = await fetch('/api/packages'); const d = await r.json(); setPackages(d.packages||[]); } catch(e) {}
    setLoadingPkgs(false);
  };

  const fetchAffiliates = async () => {
    setLoadingAff(true);
    try { const r = await fetch('/api/credits?all=true'); const d = await r.json(); setAffiliates(d.affiliates||[]); } catch(e) {}
    setLoadingAff(false);
  };

  useEffect(() => { fetchPackages(); fetchAffiliates(); }, []);

  const updateStatus = async (id, status) => {
    setUpdatingStatus(id);
    try {
      await fetch('/api/packages', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id,status}) });
      setPackages(p => p.map(x => x.id===id ? {...x, status} : x));
      if (selected?.id===id) setSelected(s=>({...s,status}));
    } catch(e) {}
    setUpdatingStatus(null);
  };

  const deletePackage = async (id) => {
    if (!confirm('Delete this package permanently?')) return;
    try {
      await fetch('/api/packages', { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id}) });
      setPackages(p => p.filter(x => x.id!==id));
      if (selected?.id===id) setSelected(null);
    } catch(e) {}
  };

  const saveAffiliate = async () => {
    if (!affForm.email || !affForm.credits) { setAffMsg('Email and credits are required.'); return; }
    setAffSaving(true);
    try {
      const r = await fetch('/api/credits', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(affForm) });
      const d = await r.json();
      if (d.success) {
        setAffMsg(`✓ ${affForm.name||affForm.email} — ${affForm.credits} credits saved.`);
        setAffForm({ email:'', name:'', credits:'', notes:'' });
        fetchAffiliates();
      } else { setAffMsg('Error: ' + d.error); }
    } catch(e) { setAffMsg('Save failed.'); }
    setAffSaving(false);
    setTimeout(() => setAffMsg(''), 4000);
  };

  const deactivateAffiliate = async (email) => {
    if (!confirm(`Deactivate ${email}?`)) return;
    await fetch('/api/credits', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email, action:'deactivate'}) });
    fetchAffiliates();
  };

  const deleteAffiliate = async (email) => {
    if (!confirm(`Permanently delete ${email}?`)) return;
    await fetch('/api/credits', { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email}) });
    fetchAffiliates();
  };

  const filtered = packages.filter(p => {
    const ms = !search || p.clientName?.toLowerCase().includes(search.toLowerCase()) || p.bizName?.toLowerCase().includes(search.toLowerCase());
    const mt = filterTier==='all' || p.tier===filterTier;
    const ms2 = filterStatus==='all' || (p.status||'New')===filterStatus;
    return ms && mt && ms2;
  });

  const thisMonth = packages.filter(p => { const d=new Date(p.createdAt); const n=new Date(); return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear(); }).length;
  const approved = packages.filter(p => p.status==='Approved'||p.status==='Complete').length;
  const totalCredits = affiliates.reduce((s,a)=>s+(a.credits||0),0);

  const TH = ({ children }) => <th style={{ padding:'12px 14px', textAlign:'left', fontSize:9, letterSpacing:'.15em', textTransform:'uppercase', color:D, fontWeight:500, borderBottom:`1px solid rgba(201,168,76,.1)` }}>{children}</th>;
  const TD = ({ children, style }) => <td style={{ padding:'12px 14px', fontSize:11, color:D, ...style }}>{children}</td>;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div style={{ minHeight:'100vh', background:N }}>

        {/* NAV */}
        <nav style={{ position:'sticky', top:0, zIndex:100, background:'rgba(10,22,40,.97)', borderBottom:'1px solid rgba(201,168,76,.15)', padding:'0 32px' }}>
          <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:56 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:28, height:28, borderRadius:6, background:`linear-gradient(135deg,${G},${GL})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:N }}>F</div>
              <span style={{ fontFamily:'serif', fontSize:16, fontWeight:600, color:W }}>FundingOS</span>
              <span style={{ fontSize:9, letterSpacing:'.15em', color:D, textTransform:'uppercase' }}>Admin</span>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-ghost" onClick={() => { fetchPackages(); fetchAffiliates(); }}>↻ Refresh</button>
              <a href="/" style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:'.12em', textTransform:'uppercase', color:D, textDecoration:'none', padding:'8px 16px', border:'1px solid rgba(136,153,187,.2)', borderRadius:7 }}>← App</a>
            </div>
          </div>
        </nav>

        {/* TABS */}
        <div style={{ borderBottom:'1px solid rgba(201,168,76,.1)', padding:'0 32px', background:'rgba(10,22,40,.5)' }}>
          <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', gap:0, overflowX:'auto' }}>
            <button className={`tab${tab==='packages'?' active':''}`} onClick={()=>setTab('packages')}>Packages ({packages.length})</button>
            <button className={`tab${tab==='affiliates'?' active':''}`} onClick={()=>setTab('affiliates')}>Affiliates & Credits ({affiliates.length})</button>
          </div>
        </div>

        <div style={{ maxWidth:1200, margin:'0 auto', padding:'36px 32px 80px' }}>

          {/* ── PACKAGES TAB ── */}
          {tab==='packages' && (
            <>
              <div style={{ marginBottom:32 }}>
                <h1 style={{ fontFamily:'serif', fontSize:36, fontWeight:900, color:W, marginBottom:6 }}>Package Dashboard</h1>
                <p style={{ fontSize:12, color:D }}>Every funding package generated across all users and affiliates.</p>
              </div>

              {/* STATS */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:28 }}>
                {[
                  { label:'Total Packages', val:packages.length, color:G },
                  { label:'This Month', val:thisMonth, color:GL },
                  { label:'Approved / Complete', val:approved, color:GR },
                  { label:'Applied / In Progress', val:packages.filter(p=>p.status==='Applied').length, color:OR },
                ].map(s => (
                  <div key={s.label} className="card">
                    <div style={{ fontSize:9, letterSpacing:'.15em', color:D, textTransform:'uppercase', marginBottom:8 }}>{s.label}</div>
                    <div style={{ fontFamily:'serif', fontSize:36, fontWeight:900, color:s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* FILTERS */}
              <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
                <input className="fi" placeholder="Search client or business..." value={search} onChange={e=>setSearch(e.target.value)} />
                <select className="fs" value={filterTier} onChange={e=>setFilterTier(e.target.value)}>
                  <option value="all">All Tiers</option>
                  <option value="starter">Starter</option>
                  <option value="full">Full Roadmap</option>
                  <option value="dwu">Done With You</option>
                </select>
                <select className="fs" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
                  <option value="all">All Statuses</option>
                  {STATUS.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
                <span style={{ fontSize:11, color:D }}>{filtered.length} result{filtered.length!==1?'s':''}</span>
              </div>

              {/* TABLE */}
              <div className="card" style={{ padding:0, overflow:'hidden' }}>
                {loadingPkgs ? (
                  <div style={{ padding:40, textAlign:'center', color:D, fontSize:12 }} className="pulse">Loading packages...</div>
                ) : filtered.length===0 ? (
                  <div style={{ padding:40, textAlign:'center', color:D, fontSize:12 }}>
                    {packages.length===0 ? 'No packages yet. Generate your first package from the app.' : 'No packages match your filters.'}
                  </div>
                ) : (
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead><tr><TH>Client</TH><TH>Business</TH><TH>Tier</TH><TH>Scores</TH><TH>Date</TH><TH>Status</TH><TH>Actions</TH></tr></thead>
                    <tbody>
                      {filtered.map((pkg,i) => (
                        <tr key={pkg.id} className="row">
                          <TD style={{ color:C, fontWeight:500, cursor:'pointer' }} ><span onClick={()=>setSelected(pkg)}>{pkg.clientName||'—'}</span></TD>
                          <TD><span onClick={()=>setSelected(pkg)} style={{ cursor:'pointer' }}>{pkg.bizName||'—'}</span></TD>
                          <TD><span style={{ fontSize:10, color:G, background:'rgba(201,168,76,.08)', border:'1px solid rgba(201,168,76,.15)', borderRadius:5, padding:'2px 8px' }}>{tierLabel(pkg.tier)}</span></TD>
                          <TD>{[pkg.eqScore,pkg.exScore,pkg.tuScore].filter(Boolean).join(' / ')||'—'}</TD>
                          <TD>{pkg.createdAt?new Date(pkg.createdAt).toLocaleDateString():'—'}</TD>
                          <TD>
                            <select className="fs" value={pkg.status||'New'} onChange={e=>updateStatus(pkg.id,e.target.value)} disabled={updatingStatus===pkg.id} style={{ fontSize:9, padding:'3px 8px' }}>
                              {STATUS.map(s=><option key={s} value={s}>{s}</option>)}
                            </select>
                          </TD>
                          <TD>
                            <div style={{ display:'flex', gap:6 }}>
                              <button className="btn btn-ghost btn-sm" onClick={()=>setSelected(pkg)}>View</button>
                              <button className="btn btn-red btn-sm" onClick={()=>deletePackage(pkg.id)}>Del</button>
                            </div>
                          </TD>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* ── AFFILIATES TAB ── */}
          {tab==='affiliates' && (
            <>
              <div style={{ marginBottom:32 }}>
                <h1 style={{ fontFamily:'serif', fontSize:36, fontWeight:900, color:W, marginBottom:6 }}>Affiliates & Credits</h1>
                <p style={{ fontSize:12, color:D }}>Manage access and credit balances for each affiliate or team member.</p>
              </div>

              {/* STATS */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:28 }}>
                {[
                  { label:'Total Affiliates', val:affiliates.length, color:G },
                  { label:'Active Affiliates', val:affiliates.filter(a=>a.active!==false).length, color:GR },
                  { label:'Total Credits Remaining', val:totalCredits, color:GL },
                ].map(s=>(
                  <div key={s.label} className="card">
                    <div style={{ fontSize:9, letterSpacing:'.15em', color:D, textTransform:'uppercase', marginBottom:8 }}>{s.label}</div>
                    <div style={{ fontFamily:'serif', fontSize:36, fontWeight:900, color:s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:20, alignItems:'start' }}>

                {/* AFFILIATE LIST */}
                <div className="card" style={{ padding:0, overflow:'hidden' }}>
                  {loadingAff ? (
                    <div style={{ padding:40, textAlign:'center', color:D, fontSize:12 }} className="pulse">Loading affiliates...</div>
                  ) : affiliates.length===0 ? (
                    <div style={{ padding:40, textAlign:'center', color:D, fontSize:12 }}>No affiliates yet. Add your first one using the form.</div>
                  ) : (
                    <table style={{ width:'100%', borderCollapse:'collapse' }}>
                      <thead><tr><TH>Name / Email</TH><TH>Credits Left</TH><TH>Total Used</TH><TH>Status</TH><TH>Actions</TH></tr></thead>
                      <tbody>
                        {affiliates.map((a,i) => (
                          <tr key={a.email} className="row">
                            <TD>
                              <div style={{ color:C, fontWeight:500, fontSize:12 }}>{a.name||a.email}</div>
                              {a.name && <div style={{ fontSize:10, color:D, marginTop:2 }}>{a.email}</div>}
                              {a.notes && <div style={{ fontSize:10, color:D, marginTop:2, fontStyle:'italic' }}>{a.notes}</div>}
                            </TD>
                            <TD>
                              <span style={{ fontFamily:'serif', fontSize:22, fontWeight:900, color:a.credits>0?GR:OR }}>{a.credits||0}</span>
                            </TD>
                            <TD style={{ color:D }}>{a.totalUsed||0}</TD>
                            <TD>
                              <span className={`pill ${a.active!==false?'pill-active':'pill-inactive'}`}>{a.active!==false?'Active':'Inactive'}</span>
                            </TD>
                            <TD>
                              <div style={{ display:'flex', gap:6 }}>
                                <button className="btn btn-ghost btn-sm" onClick={()=>setAffForm({email:a.email,name:a.name||'',credits:'',notes:a.notes||''})}>Edit</button>
                                <button className="btn btn-red btn-sm" onClick={()=>deactivateAffiliate(a.email)}>Deactivate</button>
                                <button className="btn btn-red btn-sm" onClick={()=>deleteAffiliate(a.email)}>Del</button>
                              </div>
                            </TD>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* ADD / EDIT AFFILIATE */}
                <div className="card" style={{ position:'sticky', top:76 }}>
                  <div style={{ fontFamily:'serif', fontSize:16, fontWeight:600, color:W, marginBottom:6 }}>Add / Update Affiliate</div>
                  <div style={{ fontSize:11, color:D, marginBottom:20, lineHeight:1.6 }}>
                    To add credits to an existing affiliate, enter their email and the number of new credits to add. Their balance will increase by that amount.
                  </div>

                  <div style={{ marginBottom:14 }}>
                    <label className="field-label">Email Address *</label>
                    <input className="field-input" value={affForm.email} onChange={e=>setAffForm(f=>({...f,email:e.target.value}))} placeholder="natasha@example.com" />
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <label className="field-label">Display Name</label>
                    <input className="field-input" value={affForm.name} onChange={e=>setAffForm(f=>({...f,name:e.target.value}))} placeholder="Natasha's Funding Co" />
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <label className="field-label">Credits to Add *</label>
                    <input className="field-input" type="number" min="1" value={affForm.credits} onChange={e=>setAffForm(f=>({...f,credits:e.target.value}))} placeholder="e.g. 3" />
                    <div style={{ fontSize:10, color:D, marginTop:5, lineHeight:1.5 }}>Each credit = 1 funding package generation.</div>
                  </div>
                  <div style={{ marginBottom:20 }}>
                    <label className="field-label">Notes (optional)</label>
                    <input className="field-input" value={affForm.notes} onChange={e=>setAffForm(f=>({...f,notes:e.target.value}))} placeholder="e.g. Paid $497 starter plan" />
                  </div>

                  <button className="btn btn-gold" onClick={saveAffiliate} disabled={affSaving} style={{ width:'100%', padding:'12px 0', fontSize:11 }}>
                    {affSaving ? <span className="pulse">Saving...</span> : '+ Add / Update Credits'}
                  </button>

                  {affMsg && (
                    <div style={{ marginTop:12, padding:'10px 14px', borderRadius:8, background: affMsg.startsWith('✓') ? 'rgba(45,106,79,.15)' : 'rgba(155,34,38,.1)', border:`1px solid ${affMsg.startsWith('✓')?'rgba(82,183,136,.3)':'rgba(155,34,38,.3)'}`, fontSize:11, color: affMsg.startsWith('✓') ? GR : '#ff6b6b', lineHeight:1.5 }}>
                      {affMsg}
                    </div>
                  )}

                  <div style={{ marginTop:20, padding:'14px', background:'rgba(201,168,76,.04)', border:'1px solid rgba(201,168,76,.1)', borderRadius:8 }}>
                    <div style={{ fontSize:10, color:G, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:8 }}>How credits work</div>
                    <div style={{ fontSize:11, color:D, lineHeight:1.7 }}>
                      • Each affiliate gets a credit balance you control<br/>
                      • 1 credit = 1 funding package generated<br/>
                      • When credits hit 0 — generation is blocked<br/>
                      • You add credits manually after payment<br/>
                      • No payment integration needed for this flow
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* PACKAGE VIEWER MODAL */}
      {selected && (
        <div className="modal-overlay" onClick={()=>setSelected(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20, gap:16 }}>
              <div>
                <div style={{ fontSize:10, letterSpacing:'.2em', color:G, textTransform:'uppercase', marginBottom:6 }}>Funding Package</div>
                <h2 style={{ fontFamily:'serif', fontSize:22, fontWeight:700, color:W, marginBottom:6 }}>{selected.clientName}</h2>
                <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
                  <span style={{ fontSize:10, color:D }}>{tierLabel(selected.tier)}</span>
                  <span style={{ fontSize:10, color:D }}>·</span>
                  <span style={{ fontSize:10, color:D }}>{selected.createdAt?new Date(selected.createdAt).toLocaleDateString():'—'}</span>
                  <span style={{ fontSize:10, color:D }}>·</span>
                  {pill(selected.status||'New')}
                </div>
              </div>
              <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                <select className="fs" value={selected.status||'New'} onChange={e=>updateStatus(selected.id,e.target.value)} style={{ fontSize:10 }}>
                  {STATUS.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
                <button className="btn btn-ghost btn-sm" onClick={()=>navigator.clipboard.writeText(selected.content||'')}>Copy</button>
                <button className="btn btn-ghost btn-sm" onClick={()=>setSelected(null)}>Close</button>
              </div>
            </div>
            {selected.banking?.length>0 && (
              <div style={{ background:'rgba(201,168,76,.06)', border:'1px solid rgba(201,168,76,.12)', borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:11, color:D }}>
                Banking relationships: {selected.banking.join(', ')}
              </div>
            )}
            <div style={{ background:'rgba(10,22,40,.6)', borderRadius:10, padding:20, maxHeight:500, overflowY:'auto' }}>
              <pre style={{ fontSize:12, lineHeight:1.8, color:C, whiteSpace:'pre-wrap', fontFamily:"'DM Mono',monospace" }}>
                {selected.content||'No content saved.'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
