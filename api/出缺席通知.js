import { google } from ‘googleapis’;

export default async function handler(req, res) {
try {
const body = req.method === ‘POST’ ? req.body : null;

const sheets = google.sheets('v4');
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const client = await auth.getClient();
const spreadsheetId = '1Zp4glUPoVUkyGkHNY0uVPu05UMxsurFXaiay9L8cFoI';

if (req.method === 'POST') {
  const data = body.data || [];

  // 補上系統欄位
  const notifiedBy = req.headers['x-forwarded-user'] || '系統';
  const notifiedAt = new Date().toISOString();

  const values = [[
    data[0] || '',   // 姓名
    data[1] || '',   // 狀態類型（病假/事假/遲到）
    data[2] || '',   // 次數
    data[3] || '',   // 日期
    data[4] || '',   // 草稿訊息
    '',              // ✅已通知（預留空白）
    notifiedBy,      // 🙋誰通知
    notifiedAt       // 🕐通知時間
  ]];

  await sheets.spreadsheets.values.append({
    auth: client,
    spreadsheetId,
    range: '工作表1!A1',
    valueInputOption: 'RAW',
    requestBody: { values },
  });

  res.status(200).json({ status: 'write success', inserted: values.length });
} else {
  res.status(405).json({ error: 'Method not allowed' });
}

} catch (error) {
console.error(‘出缺席通知寫入錯誤:’, error);
res.status(500).json({ status: ‘error’, message: error.message });
}
}
