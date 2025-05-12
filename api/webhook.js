export default async function handler(req, res) {
  if (req.method === 'POST') {
    console.log('[✓] Webhook received');
    res.status(200).end();
  } else {
    console.warn('[×] Non-POST request');
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
