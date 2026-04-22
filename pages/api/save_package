import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      clientName, bizName, tier, eqScore, exScore, tuScore,
      personalIncome, banking, content, createdAt,
    } = req.body;

    if (!clientName || !content) {
      return res.status(400).json({ error: 'clientName and content are required' });
    }

    const id = `pkg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const pkg = {
      id,
      clientName,
      bizName: bizName || '',
      tier: tier || 'full',
      eqScore: eqScore || '',
      exScore: exScore || '',
      tuScore: tuScore || '',
      personalIncome: personalIncome || '',
      banking: banking || [],
      content,
      status: 'New',
      createdAt: createdAt || new Date().toISOString(),
    };

    // Save the full package
    await kv.set(`package:${id}`, JSON.stringify(pkg));

    // Add ID to the master index list
    const existingIndex = await kv.get('package:index');
    const index = existingIndex ? JSON.parse(existingIndex) : [];
    index.unshift(id); // newest first
    await kv.set('package:index', JSON.stringify(index));

    return res.status(200).json({ success: true, id });
  } catch (err) {
    console.error('Save package error:', err);
    return res.status(500).json({ error: err.message });
  }
}
