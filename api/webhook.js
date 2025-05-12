import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const events = req.body.events;
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  for (const event of events) {
    // 👉 避免 bot 回應自己的訊息（避免死循環）
    if (event.source?.userId === 'Udeadbeefdeadbeefdeadbeefdeadbeef') continue;

    if (
      event.type === 'message' &&
      event.message.type === 'text'
    ) {
      const text = event.message.text.trim();

      // ✅ 指令觸發
      if (text === '/出缺席通知') {
        // 1. 發送通知訊息
        await axios.post(
          'https://api.line.me/v2/bot/message/reply',
          {
            replyToken: event.replyToken,
            messages: [{ type: 'text', text: '✅ 已觸發出缺席通知流程' }],
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // 2. 寫入 Google Sheet（你原本的流程）
        await axios.post(
          'https://line-bni-bot-new.vercel.app/api/attendance',
          {
            data: ['測試', '病假', '1', '2025-05-12', '敬請確認', '', '', ''],
          }
        );
      }
    }
  }

  res.status(200).end();
}
