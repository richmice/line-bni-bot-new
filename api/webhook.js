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
        // 1. 連接 Google Sheets
        const sheets = google.sheets('v4');
        const auth = new google.auth.GoogleAuth({
          credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const client = await auth.getClient();
        const spreadsheetId = '1Zp4glUPoVUkyGkHNY0uVPu05UMxsurFXaiay9L8cFoI';

        const getRes = await sheets.spreadsheets.values.get({
          auth: client,
          spreadsheetId,
          range: '工作表1!A2:I1000', // 讀取第2列起的內容
        });

        const rows = getRes.data.values || [];
        const messages = [];

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const [name, status, times, date, note, notified] = row;

          if (notified !== '✅') {
            // 準備訊息
            const text = `🙋 ${name}｜${status}｜${date}｜${note || ''}`;
            messages.push({ type: 'text', text });

            // 寫入通知資料
            const rowIndex = i + 2; // 加2因為從 A2 開始讀
            const now = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });

            await sheets.spreadsheets.values.update({
              auth: client,
              spreadsheetId,
              range: `工作表1!G${rowIndex}:I${rowIndex}`,
              valueInputOption: 'RAW',
              requestBody: {
                values: [['✅', '系統', now]],
              },
            });
          }
        }

        // 發送訊息
        if (messages.length === 0) {
          messages.push({ type: 'text', text: '✅ 目前沒有人需要通知！' });
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
        console.error('處理出缺席通知失敗：', error.message);
        return res.status(500).json({ error: '通知失敗' });
      }
    }
  }

  res.status(200).end();
}
