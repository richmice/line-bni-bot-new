import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = '1Zp4glUPoVUkyGkHNY0uVPu05UMxsurFXaiay9L8cFoI';
    const range = '工作表1!A2';
    const value = [['Hello from LINE Bot']];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: { values: value },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('寫入失敗：', error);
    return res.status(500).json({ error: 'Google Sheets Error' });
  }
}
