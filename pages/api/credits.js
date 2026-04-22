import crypto from 'crypto';

function isAdmin(req) {
  const match = (req.headers.cookie || '').match(/admin_auth=([^;]+)/);
  const token = match ? decodeURIComponent(match[1]) : null;
  const secret = process.env.ADMIN_PASSWORD || '';
  if (!secret || !token) return false;
  const expected = crypto.createHash('sha256').update(secret + 'fundingos_salt').digest('hex');
  return token === expected;
}
import { kv } from '@vercel/kv';

// GET /api/credits?email=natasha@example.com — check credits
// POST /api/credits — add or set credits for an affiliate
// PATCH /api/credits — deduct one credit when package is generated
// GET /api/credits?all=true — get all affiliates (admin view)

export default async function handler(req, res) {
if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  // GET — check credits for a user OR get all affiliates
  if (req.method === 'GET') {
    try {
      const { email, all } = req.query;

      if (all === 'true') {
        // Return all affiliates
        const raw = await kv.get('affiliates:index');
        const emails = raw ? JSON.parse(raw) : [];
        const affiliates = await Promise.all(
          emails.map(async (e) => {
            const data = await kv.get(`affiliate:${e}`);
            return data ? JSON.parse(data) : null;
          })
        );
        return res.status(200).json({ affiliates: affiliates.filter(Boolean) });
      }

      if (!email) return res.status(400).json({ error: 'email required' });

      const raw = await kv.get(`affiliate:${email}`);
      if (!raw) return res.status(200).json({ found: false, credits: 0 });

      const affiliate = JSON.parse(raw);
      return res.status(200).json({ found: true, ...affiliate });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // POST — create or update affiliate with credits
  if (req.method === 'POST') {
    try {
      const { email, name, credits, notes } = req.body;
      if (!email || credits === undefined) return res.status(400).json({ error: 'email and credits required' });

      const existing = await kv.get(`affiliate:${email}`);
      const prev = existing ? JSON.parse(existing) : {};

      const affiliate = {
        email: email.toLowerCase().trim(),
        name: name || prev.name || email,
        credits: parseInt(credits),
        totalUsed: prev.totalUsed || 0,
        totalAdded: (prev.totalAdded || 0) + parseInt(credits),
        notes: notes || prev.notes || '',
        createdAt: prev.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true,
      };

      await kv.set(`affiliate:${email.toLowerCase().trim()}`, JSON.stringify(affiliate));

      // Add to index if new
      const indexRaw = await kv.get('affiliates:index');
      const index = indexRaw ? JSON.parse(indexRaw) : [];
      if (!index.includes(email.toLowerCase().trim())) {
        index.push(email.toLowerCase().trim());
        await kv.set('affiliates:index', JSON.stringify(index));
      }

      return res.status(200).json({ success: true, affiliate });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // PATCH — deduct one credit (called when package is generated)
  if (req.method === 'PATCH') {
    try {
      const { email, action } = req.body;
      if (!email) return res.status(400).json({ error: 'email required' });

      const raw = await kv.get(`affiliate:${email.toLowerCase().trim()}`);
      if (!raw) return res.status(404).json({ error: 'Affiliate not found' });

      const affiliate = JSON.parse(raw);

      if (action === 'deduct') {
        if (affiliate.credits <= 0) {
          return res.status(403).json({ error: 'No credits remaining', credits: 0 });
        }
        affiliate.credits -= 1;
        affiliate.totalUsed = (affiliate.totalUsed || 0) + 1;
        affiliate.updatedAt = new Date().toISOString();
        await kv.set(`affiliate:${email.toLowerCase().trim()}`, JSON.stringify(affiliate));
        return res.status(200).json({ success: true, creditsRemaining: affiliate.credits });
      }

      if (action === 'deactivate') {
        affiliate.active = false;
        affiliate.updatedAt = new Date().toISOString();
        await kv.set(`affiliate:${email.toLowerCase().trim()}`, JSON.stringify(affiliate));
        return res.status(200).json({ success: true });
      }

      return res.status(400).json({ error: 'Invalid action' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // DELETE — remove affiliate
  if (req.method === 'DELETE') {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'email required' });

      await kv.del(`affiliate:${email.toLowerCase().trim()}`);

      const indexRaw = await kv.get('affiliates:index');
      const index = indexRaw ? JSON.parse(indexRaw) : [];
      await kv.set('affiliates:index', JSON.stringify(index.filter(e => e !== email.toLowerCase().trim())));

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
