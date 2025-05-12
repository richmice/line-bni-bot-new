import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    const body = req.method === 'POST' ? req.body : null;

    const sheets = google.sheets('v4');
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const client = await auth.getClient();
    const spreadsheetId = '1Zp4glUPoVUkyGkHNY0uVPu05UMxsurFXaiay9L8cFoI';

    if (req.method === 'GET') {
      const response = await sheets.spreadsheets.values.get({
        auth: client,
        spreadsheetId,
        range: '工作表1!A1:I1', // A~I 欄
      });
      res.status(200).json({ status: 'success', headers: response.data.values[0] });
    } else if (req.method === 'POST') {
      // 測試資料：對應 A~I 欄
      const values = [
        ["阿強", "病假", "1", "2025/05/13", "補充說明", "", "", "", ""]
      ];

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
    console.error('Google Sheets error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
}
