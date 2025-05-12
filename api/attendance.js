// 原本為 /api/出缺席通知.js
// 改為 /api/attendance.js

import { google } from ‘googleapis’;

export default async function handler(req, res) {
try {
const sheets = google.sheets(‘v4’);
const auth = new google.auth.GoogleAuth({
credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
scopes: [‘https://www.googleapis.com/auth/spreadsheets’],
});
const client = await auth.getClient();
const spreadsheetId = ‘1Zp4glUPoVUkyGkHNY0uVPu05UMxsurFXaiay9L8cFoI’;

if (req.method === 'POST') {
  const { data } = req.body;
  if (!Array.isArray(data) || data.length !== 8) {
    return res.status(400).json({ status: 'error', message: 'Invalid data format' });
  }
  const now = new Date();
  const formattedTime = now.toLocaleString('zh-TW', { hour12: false });
  const email = req.headers['x-vercel-user-email'] || '未知';

  const values = [[
    data[0],
    data[1],
    data[2],
    data[3],
    data[4],
    '✅',
    email,
    formattedTime,
  ]];

  await sheets.spreadsheets.values.append({
    auth: client,
    spreadsheetId,
    range: '工作表1!A1:H1',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });

  res.status(200).json({ status: 'success', inserted: 1 });
} else {
  res.status(405).json({ error: 'Method not allowed' });
}

} catch (error) {
console.error(‘Google Sheets append error:’, error);
res.status(500).json({ status: ‘error’, message: error.message });
}
}
