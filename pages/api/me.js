import { kv } from '@vercel/kv';
import crypto from 'crypto';

export default async function handler(req, res) {
  const match = (req.headers.cookie || '').match(/affiliate_auth=([^;]+)/);
  const cookie = match ? decodeURIComponent(match[1]) : null;
  if (!cookie) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const [email, hash] = Buffer.from(cookie, 'base64').toString().split(':');
    if (!email || !hash) return res.status(401).json({ error: 'Invalid session' });
    const aff = await kv.get(`affiliate:${email}`);
    if (!aff || !aff.active || !aff.accessCode) return res.status(401).json({ error: 'Account not found' });
    const expected = crypto.createHash('sha256').update(aff.accessCode + 'fundingos_affiliate_salt').digest('hex');
    if (hash !== expected) return res.status(401).json({ error: 'Invalid session' });
    return res.status(200).json({
      email: aff.email,
      name: aff.name || aff.email,
      credits: aff.credits || 0,
      totalUsed: aff.totalUsed || 0,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
