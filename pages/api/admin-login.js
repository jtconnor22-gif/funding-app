import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password required' });
    const stored = process.env.ADMIN_PASSWORD;
    if (!stored) return res.status(500).json({ error: 'ADMIN_PASSWORD env var not set' });
    if (password !== stored) {
      await new Promise(r => setTimeout(r, 600)); // slow down brute force
      return res.status(401).json({ error: 'Incorrect password' });
    }
    const token = crypto.createHash('sha256').update(stored + 'fundingos_salt').digest('hex');
    const maxAge = 60 * 60 * 24 * 7; // 7 days
    res.setHeader(
      'Set-Cookie',
      `admin_auth=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`
    );
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
