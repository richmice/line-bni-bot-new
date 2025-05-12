// webhook.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const events = req.body.events;
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  if (!token) {
    return res.status(500).json({ error: 'Missing LINE access token' });
  }

  for (const event of events) {
    if (event.type !== 'message' || event.message.type !== 'text') continue;

    const text = event.message.text.trim();

    // ✅ /ping 指令測試
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

    // ✅ /出缺席通知 指令
    if (text === '/出缺席通知' || text === '/attendance') {
      try {
        const response = await axios.post(
          `${process.env.BASE_URL}/api/attendance`,
          {
            data: ['測試', '病假', '1', '2025-05-12', '敬請確認', '', '', ''],
          }
        );

        await axios.post(
          'https://api.line.me/v2/bot/message/reply',
          {
            replyToken: event.replyToken,
            messages: [
              {
                type: 'text',
                text: `✅ 已觸發出缺席通知（寫入 ${response.data.inserted} 筆資料）`,
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
        console.error('通知處理失敗', error);
        await axios.post(
          'https://api.line.me/v2/bot/message/reply',
          {
            replyToken: event.replyToken,
            messages: [
              {
                type: 'text',
                text: '⚠️ 無法觸發通知，請稍後再試。',
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
  }

  res.status(200).end();
}
