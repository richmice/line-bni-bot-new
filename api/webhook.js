import axios from ‘axios’;

export default async function handler(req, res) {
if (req.method !== ‘POST’) {
return res.status(405).json({ error: ‘Method not allowed’ });
}

const events = req.body.events;
const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;

if (!token) {
return res.status(500).json({ error: ‘Missing LINE access token’ });
}

for (const event of events) {
if (event.type === ‘message’ && event.message.type === ‘text’) {
const text = event.message.text.trim();

  // 指令對應
  if (text === '/ping') {
    await axios.post(
      'https://api.line.me/v2/bot/message/reply',
      {
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: 'pong 🏓' }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  if (text === '/attendance' || text === '/出缺席通知') {
    await axios.post(
      'https://line-bni-bot-new.vercel.app/api/attendance',
      { data: ['測試', '病假', '1', '2025-05-12', '敬請確認', '', '', ''] },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    await axios.post(
      'https://api.line.me/v2/bot/message/reply',
      {
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: '✅ 已觸發出缺席通知流程（/attendance）' }],
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

}

res.status(200).end();
}
