import { kv } from '@vercel/kv';

export default async function handler(req, res) {

  // GET — fetch all packages
  if (req.method === 'GET') {
    try {
      const existingIndex = await kv.get('package:index');
      const index = existingIndex ? JSON.parse(existingIndex) : [];

      if (index.length === 0) return res.status(200).json({ packages: [] });

      const packages = await Promise.all(
        index.map(async (id) => {
          const raw = await kv.get(`package:${id}`);
          if (!raw) return null;
          const pkg = JSON.parse(raw);
          // Return metadata only — not full content — for table view performance
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
            content: pkg.content, // include for modal view
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

      const raw = await kv.get(`package:${id}`);
      if (!raw) return res.status(404).json({ error: 'Package not found' });

      const pkg = JSON.parse(raw);
      pkg.status = status;
      await kv.set(`package:${id}`, JSON.stringify(pkg));

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

      const existingIndex = await kv.get('package:index');
      const index = existingIndex ? JSON.parse(existingIndex) : [];
      const updated = index.filter(i => i !== id);
      await kv.set('package:index', JSON.stringify(updated));

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Delete package error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
