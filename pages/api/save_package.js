import { kv } from '@vercel/kv';
import crypto from 'crypto';

async function getAffiliate(req) {
  const match = (req.headers.cookie || '').match(/affiliate_auth=([^;]+)/);
  const cookie = match ? decodeURIComponent(match[1]) : null;
  if (!cookie) return null;
  try {
    const [email, hash] = Buffer.from(cookie, 'base64').toString().split(':');
    if (!email || !hash) return null;
    const aff = await kv.get(`affiliate:${email}`);
    if (!aff || !aff.active || !aff.accessCode) return null;
    const expected = crypto.createHash('sha256').update(aff.accessCode + 'fundingos_affiliate_salt').digest('hex');
    if (hash !== expected) return null;
    return aff;
  } catch (err) {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const affiliate = await getAffiliate(req);
  if (!affiliate) return res.status(401).json({ error: 'Not authenticated' });

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
      affiliateEmail: affiliate.email,
      affiliateName: affiliate.name || '',
    };

    // Save the full package
    await kv.set(`package:${id}`, pkg);

    // Add ID to global index
    const index = (await kv.get('package:index')) || [];
    index.unshift(id);
    await kv.set('package:index', index);

    // Add ID to this affiliate's package index
    const affiliateIndex = (await kv.get(`affiliate-packages:${affiliate.email}`)) || [];
    affiliateIndex.unshift(id);
    await kv.set(`affiliate-packages:${affiliate.email}`, affiliateIndex);

    // Decrement credit balance, increment total used
    const updatedAffiliate = {
      ...affiliate,
      credits: Math.max(0, (affiliate.credits || 0) - 1),
      totalUsed: (affiliate.totalUsed || 0) + 1,
    };
    await kv.set(`affiliate:${affiliate.email}`, updatedAffiliate);

    return res.status(200).json({
      success: true,
      id,
      remainingCredits: updatedAffiliate.credits,
    });
  } catch (err) {
    console.error('Save package error:', err);
    return res.status(500).json({ error: err.message });
  }
}
