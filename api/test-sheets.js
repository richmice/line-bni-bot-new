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

    if (req.method === 'GET') {
      const response = await sheets.spreadsheets.values.get({
        auth: client,
        spreadsheetId,
        range: '工作表1!A1:H1',
      });
      return res.status(200).json({ status: 'success', headers: response.data.values[0] });
    }

    if (req.method === 'POST') {
      const { data } = req.body;
      if (!Array.isArray(data)) {
        return res.status(400).json({ status: 'error', message: 'Invalid data format' });
      }

      const response = await sheets.spreadsheets.values.append({
        auth: client,
        spreadsheetId,
        range: '工作表1!A1',
        valueInputOption: 'RAW',
        requestBody: { values: [data] },
      });

      return res.status(200).json({ status: 'write success', result: response.data });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Google Sheets error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
}
