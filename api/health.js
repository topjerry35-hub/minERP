export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const hasDbUrl = !!process.env.DATABASE_URL;

  return res.status(200).json({
    status: 'OK',
    dbConnected: hasDbUrl,
    dbSource: hasDbUrl ? 'PostgreSQL (Prisma)' : 'Serverless Cloud DB Engine',
    timestamp: new Date().toISOString()
  });
}
