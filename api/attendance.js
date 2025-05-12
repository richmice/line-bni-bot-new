// attendance.js
import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const body = req.body.data;
    if (!Array.isArray(body) || body.length < 4) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    const sheets = google.sheets('v4');
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const client = await auth.getClient();
    const spreadsheetId = process.env.SPREADSHEET_ID;

    const today = new Date();
    const options = { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' };
    const taiwanDate = today.toLocaleDateString('sv-SE', options); // e.g. 2025-05-12

    const row = [
      body[0],        // 姓名
      body[1],        // 狀態類型（缺席/遲到/代理人）
      body[2],        // 次數
      body[3] || taiwanDate, // 日期，預設為今天
      body[4] || '',  // 草稿訊息
      '',             // ✅ 已通知（手動打勾）
      '',             // 🙋 誰通知（自動）
      '',             // 🕐 通知時間（自動）
    ];

    await sheets.spreadsheets.values.append({
      auth: client,
      spreadsheetId,
      range: '工作表1!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });

    return res.status(200).json({ status: 'ok', inserted: row });
  } catch (error) {
    console.error('✖️ Google Sheets Append Error:', error);
    return res.status(500).json({ error: 'Internal error', detail: error.message });
  }
}
