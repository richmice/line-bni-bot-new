const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

app.post('/api/webhook', async (req, res) => {
  try {
    // 處理來自 LINE 的 webhook 請求
    console.log('Received webhook:', req.body);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = app;
