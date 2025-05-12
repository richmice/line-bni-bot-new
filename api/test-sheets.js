import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1Zp4glUPoVUkyGkHNY0uVPu05UMxsurFXaiay9L8cFoI';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: '工作表1!A1:H1', // 只讀取第一列標題
    });

    return res.status(200).json({
      status: 'success',
      headers: response.data.values?.[0] || [],
    });
  } catch (error) {
    console.error('[Google Sheets API error]', error);
    return res.status(500).json({ error: error.message });
  }
}
