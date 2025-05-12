import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    console.warn('[！] Received non-POST request');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const events = req.body.events;
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  if (!token) {
    console.error('[！] Missing LINE access token');
    return res.status(500).json({ error: 'Missing LINE access token' });
  }

  for (const event of events) {
    // ✅ 忽略不是 user 的來源（例如 group、room 或 bot 自己）
    if (event.source.type !== 'user') {
      console.log('[⚠️] Skipped non-user message');
      continue;
    }

    if (
      event.type === 'message' &&
      event.message.type === 'text' &&
      event.message.text === '/ping'
    ) {
      await axios.post(
        'https://api.line.me/v2/bot/message/reply',
        {
          replyToken: event.replyToken,
          messages: [
            {
              type: 'text',
              text: 'pong 🏓',
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }
  }

  res.status(200).end();
}
