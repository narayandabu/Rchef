const { getUserChatDB } = require('../utils/db_chat');
const { call_user_choice } = require('../utils/api_call');

exports.handleChat = async (req, res) => {
  const { message } = req.body;
  const email = req.user.email;
  const {section} = req.body; // e.g., 'Sentiment', 'Gemini', etc.
  if (!message) return res.status(400).json({ error: 'No message' });

  try {
    const reply = await call_user_choice(section || 'Sentiment', message);
    const chatDB = getUserChatDB(email);

    chatDB.run(
      `INSERT INTO chats (user_message, bot_reply, tool_name) VALUES (?, ?, ?)`,
      [message, reply, section],
      function (err) {
        if (err) console.error("Error saving chat:", err);
      }
    );    
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: 'Chat error' });
  }
};

exports.getHistory = (req, res) => {
  const email = req.user.email;
  const toolName = req.query.tool_name; // e.g., 'Sentiment', 'Gemini', etc.
  const chatDB = getUserChatDB(email);

  let query = `SELECT user_message, bot_reply FROM chats`;
  let params = [];

  if (toolName) {
    query += ` WHERE tool_name = ?`;
    params.push(toolName);
  }
  query += ` ORDER BY timestamp ASC`;
  chatDB.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ message: 'History fetch error' });
    return res.status(200).json({ history: rows });
  });
};