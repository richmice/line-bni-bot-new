import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    const sheets = google.sheets('v4');
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const client = await auth.getClient();
    const spreadsheetId = '1Zp4glUPoVUkyGkHNY0uVPu05UMxsurFXaiay9L8cFoI';

    if (req.method === 'POST') {
      const { data } = req.body;

      // 驗證格式
      if (!Array.isArray(data) || data.length < 5) {
        return res.status(400).json({ status: 'error', message: 'Invalid data format' });
      }

      // 加上通知人（信箱）與通知時間
      const notifiedBy = req.headers['x-forwarded-user-email'] || '系統自動';
      const notifiedAt = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });

      const values = [[...data, notifiedBy, notifiedAt]];

      await sheets.spreadsheets.values.append({
        auth: client,
        spreadsheetId,
        range: '工作表1!A1',
        valueInputOption: 'RAW',
        requestBody: { values },
      });

      res.status(200).json({ status: 'success', inserted: values.length });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Google Sheets Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
}
