import { kv } from '@vercel/kv';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email and access code required' });

    const affiliate = await kv.get(`affiliate:${email.toLowerCase().trim()}`);
    if (!affiliate) {
      await new Promise(r => setTimeout(r, 600));
      return res.status(401).json({ error: 'Invalid email or access code' });
    }
    if (!affiliate.active) {
      return res.status(403).json({ error: 'Account deactivated. Contact admin.' });
    }
    if (affiliate.accessCode !== code.trim()) {
      await new Promise(r => setTimeout(r, 600));
      return res.status(401).json({ error: 'Invalid email or access code' });
    }

    const hash = crypto.createHash('sha256').update(affiliate.accessCode + 'fundingos_affiliate_salt').digest('hex');
    const cookieValue = Buffer.from(`${affiliate.email}:${hash}`).toString('base64');
    const maxAge = 60 * 60 * 24 * 7; // 7 days
    res.setHeader(
      'Set-Cookie',
      `affiliate_auth=${cookieValue}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`
    );
    return res.status(200).json({ success: true, name: affiliate.name || affiliate.email, credits: affiliate.credits });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
