// Vercel Serverless Function for Central Multi-Device Database Sync
let sharedDatabase = null;

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json(sharedDatabase || {});
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (data && typeof data === 'object') {
        // Merge or replace shared database
        sharedDatabase = {
          ...sharedDatabase,
          ...data,
          lastSyncedAt: Date.now()
        };
        return res.status(200).json({ success: true, syncedAt: sharedDatabase.lastSyncedAt });
      }
    } catch (err) {
      return res.status(400).json({ error: 'Invalid payload format' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
