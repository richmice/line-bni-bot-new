import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    console.warn('[！] Received non-POST request');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const events = req.body?.events;
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  if (!token) {
    console.error('[！] Missing LINE access token');
    return res.status(500).json({ error: 'Missing LINE access token' });
  }

  if (!Array.isArray(events)) {
    console.error('[！] Invalid events payload:', req.body);
    return res.status(400).json({ error: 'Invalid events payload' });
  }

  for (const event of events) {
    if (
      event.type === 'message' &&
      event.message.type === 'text' &&
      event.message.text === '/ping'
    ) {
      try {
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
      } catch (error) {
        console.error('[！] LINE API Error:', error?.response?.data || error.message);
      }
    }
  }

  res.status(200).end();
}

export const config = {
  api: {
    bodyParser: true,
  },
};
