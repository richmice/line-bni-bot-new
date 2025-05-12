export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const events = req.body.events;
  console.log('[✅ 收到事件]', JSON.stringify(events, null, 2));

  res.status(200).end();
}
