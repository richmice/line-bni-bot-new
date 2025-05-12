import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    const sheets = google.sheets({ version: 'v4' });
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const client = await auth.getClient();
    const spreadsheetId = '1Zp4glUPoVUkyGkHNY0uVPu05UMxsurFXaiay9L8cFoI';

    if (req.method === 'POST') {
      const { data } = req.body;

      if (!Array.isArray(data) || data.length !== 8) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid data format',
        });
      }

      const now = new Date();
      const formattedTime = now.toLocaleString('zh-TW', { hour12: false });
      const email = req.headers['x-vercel-user-email'] || '未知';

      const values = [[
        data[0], // 姓名
        data[1], // 狀態類型
        data[2], // 次數
        data[3], // 日期
        data[4], // 草稿訊息
        '✅',     // 已通知（固定打勾）
        email,   // 誰通知（從 request header 抓）
        formattedTime // 通知時間
      ]];

      await sheets.spreadsheets.values.append({
        auth: client,
        spreadsheetId,
        range: '工作表1!A1',
        valueInputOption: 'RAW',
        requestBody: {
          values,
        },
      });

      return res.status(200).json({ status: 'success', inserted: values.length });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Google Sheets Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
}
