// Vercel Serverless Function for Central Multi-Device Database Sync
const CLOUD_STORAGE_URL = 'https://jsonblob.com/api/jsonBlob/019fdc46-f6b6-7163-83de-bba51678fca3';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const getRes = await fetch(CLOUD_STORAGE_URL, {
        headers: { 'Accept': 'application/json' }
      });
      if (getRes.ok) {
        const data = await getRes.json();
        return res.status(200).json(data);
      }
    } catch (e) {}
    return res.status(200).json({ empty: true });
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (data && typeof data === 'object') {
        const putRes = await fetch(CLOUD_STORAGE_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data)
        });
        if (putRes.ok) {
          return res.status(200).json({ success: true, timestamp: Date.now() });
        }
      }
    } catch (err) {
      return res.status(400).json({ error: 'Failed to update cloud database' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
