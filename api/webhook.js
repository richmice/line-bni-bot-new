if (
  event.type === 'message' &&
  event.message.type === 'text' &&
  event.message.text.startsWith('/ping')
) {
  await axios.post(
    'https://api.line.me/v2/bot/message/reply',
    {
      replyToken: event.replyToken,
      messages: [
        {
          type: 'text',
          text: 'pong 🏓',
        },
      ],
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
}
