import { useState } from 'react';

const N='#0a1628',M='#132040',G='#c9a84c',GL='#e8c97a',C='#f5f0e8',D='#8899bb',W='#ffffff';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) window.location.href = '/admin';
      else setError(data.error || 'Login failed');
    } catch (err) {
      setError('Connection error');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh', background:N, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Mono', monospace", padding:20 }}>
      <form onSubmit={submit} style={{ background:M, border:'1px solid rgba(201,168,76,.2)', borderRadius:14, padding:40, maxWidth:400, width:'100%' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
          <div style={{ width:36, height:36, borderRadius:8, background:`linear-gradient(135deg,${G},${GL})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:N, fontFamily:'serif' }}>F</div>
          <div>
            <div style={{ fontFamily:'serif', fontSize:18, fontWeight:600, color:W }}>FundingOS</div>
            <div style={{ fontSize:9, letterSpacing:'.2em', color:G, textTransform:'uppercase', marginTop:2 }}>Admin Access</div>
          </div>
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:9, letterSpacing:'.15em', textTransform:'uppercase', color:D, marginBottom:8, display:'block' }}>Admin Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoFocus placeholder="Enter admin password"
            style={{ width:'100%', background:'rgba(10,22,40,.6)', border:`1px solid ${error ? 'rgba(155,34,38,.5)' : 'rgba(201,168,76,.2)'}`, borderRadius:7, padding:'11px 14px', fontSize:12, color:C, fontFamily:"'DM Mono', monospace", outline:'none' }} />
        </div>
        {error && (
          <div style={{ fontSize:11, color:'#ff6b6b', marginBottom:16, padding:'9px 12px', background:'rgba(155,34,38,.08)', border:'1px solid rgba(155,34,38,.2)', borderRadius:7 }}>{error}</div>
        )}
        <button type="submit" disabled={loading || !password}
          style={{ width:'100%', background:G, color:N, border:'none', borderRadius:8, padding:'13px', fontSize:11, letterSpacing:'.12em', textTransform:'uppercase', fontWeight:500, cursor: loading || !password ? 'not-allowed' : 'pointer', opacity: loading || !password ? 0.5 : 1, fontFamily:"'DM Mono', monospace" }}>
          {loading ? 'Verifying...' : 'Sign In →'}
        </button>
        <div style={{ marginTop:24, fontSize:10, color:D, textAlign:'center', lineHeight:1.6 }}>
          Protected area. Contact the account owner if you need access.
        </div>
      </form>
    </div>
  );
}
