export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const events = req.body.events;
  console.log('[✅ 收到事件]', JSON.stringify(events, null, 2));

  for (const event of events) {
    if (
      event.type === 'message' &&
      event.message.type === 'text' &&
      event.message.text === '/ping'
    ) {
      console.log('[🎯 偵測到 /ping 指令]');
    }
  }

  res.status(200).end();
}
