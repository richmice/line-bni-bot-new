// api/webhook.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const events = req.body.events;

  if (!token) {
    return res.status(500).json({ error: 'Missing LINE access token' });
  }

  for (const event of events) {
    const message = event.message?.text?.trim();

    // 確保是文字訊息
    if (event.type !== 'message' || event.message.type !== 'text') continue;

    // 防止自動回覆自己（如機器人回傳訊息後觸發 webhook）
    if (event.source?.type === 'user' && event.source?.userId === process.env.LINE_BOT_USER_ID) continue;

    // /ping 指令
    if (message === '/ping') {
      await axios.post('https://api.line.me/v2/bot/message/reply', {
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: 'pong 🏓' }],
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // /出缺席通知 指令
    if (message === '/出缺席通知') {
      await axios.post(`${process.env.BASE_URL}/api/attendance`, {
        data: ['測試', '病假', '1', new Date().toISOString().slice(0, 10), '敬請確認', '', '', ''],
      });

      await axios.post('https://api.line.me/v2/bot/message/reply', {
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: '✅ 已觸發出缺席通知流程' }],
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    }
  }

  res.status(200).end();
}
