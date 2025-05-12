import { google } from ‘googleapis’;

function buildAbsenceMessage(name, count, date) {
if (count === ‘1’) {
return ${name}您好，\n會員委員會要和您確認一下 ${date}，您未出席例會，這是您六個月內的第一次缺席，請問此紀錄是否正確呢？;
} else if (count === ‘2’) {
return 親愛的${name}會員，\n您是我們分會重要的一份子，我們每週都很期待見到您！\n\n這次（${date}）您再次缺席，這是您六個月內第二次。我們想提醒您：若實在無法出席，可安排替代人參加，這樣可以避免累積缺席次數。\n\n請協助確認這筆紀錄是否正確，謝謝您的配合 🙏;
} else if (count === ‘3’) {
return 親愛的${name}會員：\n根據本分會的紀錄，您在六個月內已經有 3 次未出席（最後一次為 ${date}）。\n\n提醒您：BNI 的規定是每位會員每六個月最多只能缺席三次，超過可能影響代表權資格。\n\n請您再次確認是否正確，並建議未來若有安排不便，盡量安排替代人協助出席，感謝您的配合 🙏;
} else {
return ${name}｜${date}｜第${count}次缺席;
}
}

export default async function handler(req, res) {
try {
const sheets = google.sheets(‘v4’);
const auth = new google.auth.GoogleAuth({
credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
scopes: [‘https://www.googleapis.com/auth/spreadsheets.readonly’],
});
const client = await auth.getClient();
const spreadsheetId = ‘1Zp4glUPoVUkyGkHNY0uVPu05UMxsurFXaiay9L8cFoI’;

if (req.method === 'GET') {
  const getRes = await sheets.spreadsheets.values.get({
    auth: client,
    spreadsheetId,
    range: '工作表1!A2:I1000',
  });

  const rows = getRes.data.values || [];
  const messages = [];

  for (const row of rows) {
    const [name, status, count, date, , notified] = row;
    if (status === '缺席' && notified !== '✅') {
      messages.push({ type: 'text', text: buildAbsenceMessage(name, count, date) });
    }
  }

  if (messages.length === 0) {
    messages.push({ type: 'text', text: '✅ 目前沒有未通知的缺席成員' });
  }

  return res.status(200).json({ messages });
} else {
  res.status(405).json({ error: 'Method not allowed' });
}

} catch (error) {
console.error(‘草稿產生錯誤:’, error);
res.status(500).json({ status: ‘error’, message: error.message });
}
}
