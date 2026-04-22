import { kv } from '@vercel/kv';
import crypto from 'crypto';

function isAdmin(req) {
  const match = (req.headers.cookie || '').match(/admin_auth=([^;]+)/);
  const token = match ? decodeURIComponent(match[1]) : null;
  const secret = process.env.ADMIN_PASSWORD || '';
  if (!secret || !token) return false;
  const expected = crypto.createHash('sha256').update(secret + 'fundingos_salt').digest('hex');
  return token === expected;
}

function generateAccessCode(name) {
  const prefix = (name || 'user').split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '').slice(0, 12) || 'user';
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = crypto.randomBytes(8);
  let s1 = '', s2 = '';
  for (let i = 0; i < 4; i++) {
    s1 += chars[bytes[i] % chars.length];
    s2 += chars[bytes[i + 4] % chars.length];
  }
  return `${prefix}-${s1}-${s2}`;
}

export default async function handler(req, res) {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  // GET — list all affiliates
  if (req.method === 'GET') {
    try {
      const index = (await kv.get('affiliate:index')) || [];
      const affiliates = await Promise.all(index.map(email => kv.get(`affiliate:${email}`)));
      return res.status(200).json({ affiliates: affiliates.filter(Boolean) });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // POST — add or update affiliate (adds credits to existing balance)
  if (req.method === 'POST') {
    try {
      const { email, name, credits, notes } = req.body;
      if (!email || !credits) return res.status(400).json({ error: 'Email and credits required' });
      const creditsNum = parseInt(credits, 10);
      if (isNaN(creditsNum) || creditsNum < 1) return res.status(400).json({ error: 'Invalid credits value' });

      const existing = await kv.get(`affiliate:${email}`);
      const updated = existing ? {
        ...existing,
        name: name || existing.name,
        credits: (existing.credits || 0) + creditsNum,
        notes: notes || existing.notes,
        active: true,
      } : {
        email,
        name: name || '',
        credits: creditsNum,
        totalUsed: 0,
        notes: notes || '',
        active: true,
        accessCode: generateAccessCode(name),
        createdAt: new Date().toISOString(),
      };

      await kv.set(`affiliate:${email}`, updated);
      if (!existing) {
        const index = (await kv.get('affiliate:index')) || [];
        if (!index.includes(email)) {
          index.push(email);
          await kv.set('affiliate:index', index);
        }
      }
      return res.status(200).json({ success: true, affiliate: updated });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // PATCH — deactivate / reactivate / regenerate code
  if (req.method === 'PATCH') {
    try {
      const { email, action } = req.body;
      if (!email || !action) return res.status(400).json({ error: 'Email and action required' });
      const affiliate = await kv.get(`affiliate:${email}`);
      if (!affiliate) return res.status(404).json({ error: 'Affiliate not found' });

      if (action === 'deactivate') affiliate.active = false;
      else if (action === 'activate') affiliate.active = true;
      else if (action === 'regenerate_code') affiliate.accessCode = generateAccessCode(affiliate.name);
      else return res.status(400).json({ error: 'Unknown action' });

      await kv.set(`affiliate:${email}`, affiliate);
      return res.status(200).json({ success: true, affiliate });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // DELETE — remove affiliate entirely
  if (req.method === 'DELETE') {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email required' });
      await kv.del(`affiliate:${email}`);
      const index = (await kv.get('affiliate:index')) || [];
      await kv.set('affiliate:index', index.filter(e => e !== email));
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
