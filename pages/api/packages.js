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

export default async function handler(req, res) {
if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  // GET — fetch all packages
  if (req.method === 'GET') {
    try {
      const index = (await kv.get('package:index')) || [];
      if (index.length === 0) return res.status(200).json({ packages: [] });
      const packages = await Promise.all(
        index.map(async (id) => {
          const pkg = await kv.get(`package:${id}`);
          if (!pkg) return null;
          return {
            id: pkg.id,
            clientName: pkg.clientName,
            bizName: pkg.bizName,
            tier: pkg.tier,
            eqScore: pkg.eqScore,
            exScore: pkg.exScore,
            tuScore: pkg.tuScore,
            personalIncome: pkg.personalIncome,
            banking: pkg.banking,
            status: pkg.status,
            createdAt: pkg.createdAt,
            content: pkg.content,
          };
        })
      );
      return res.status(200).json({ packages: packages.filter(Boolean) });
    } catch (err) {
      console.error('Get packages error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // PATCH — update status
  if (req.method === 'PATCH') {
    try {
      const { id, status } = req.body;
      if (!id || !status) return res.status(400).json({ error: 'id and status required' });
      const pkg = await kv.get(`package:${id}`);
      if (!pkg) return res.status(404).json({ error: 'Package not found' });
      pkg.status = status;
      await kv.set(`package:${id}`, pkg);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Update status error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // DELETE — remove a package
  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      await kv.del(`package:${id}`);
      const index = (await kv.get('package:index')) || [];
      const updated = index.filter(i => i !== id);
      await kv.set('package:index', updated);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Delete package error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
