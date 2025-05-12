import axios from 'axios';
import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const events = req.body.events;

  for (const event of events) {
    if (
      event.type === 'message' &&
      event.message.type === 'text' &&
      event.message.text === '/出缺席通知'
    ) {
      const replyToken = event.replyToken;

      try {
        // 連接 Google Sheets
        const sheets = google.sheets('v4');
        const auth = new google.auth.GoogleAuth({
          credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
        const client = await auth.getClient();
        const spreadsheetId = '1Zp4glUPoVUkyGkHNY0uVPu05UMxsurFXaiay9L8cFoI';

        const getRes = await sheets.spreadsheets.values.get({
          auth: client,
          spreadsheetId,
          range: '工作表1!A2:I1000', // A~I，從第2列開始
        });

        const rows = getRes.data.values || [];
        const messages = [];

        for (const row of rows) {
          const [name, status, times, date, note, notified] = row;

          if (notified !== '✅') {
            const text = `🙋 ${name}｜${status}｜${date}｜${note || ''}`;
            messages.push({ type: 'text', text });
          }
        }

        if (messages.length === 0) {
          messages.push({ type: 'text', text: '✅ 目前沒有尚未通知的人員。' });
        }

        await axios.post(
          'https://api.line.me/v2/bot/message/reply',
          {
            replyToken,
            messages,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return res.status(200).end();
      } catch (error) {
        console.error('LINE Bot 發送錯誤：', error);
        return res.status(500).json({ error: '通知失敗' });
      }
    }
  }

  res.status(200).end();
}
