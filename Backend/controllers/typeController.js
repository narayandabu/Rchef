exports.setType = (req, res) => {
    const { button_type } = req.body;
    if (!button_type) return res.status(400).json({ error: 'No type selected' });
  
    global.userChoice = button_type;
    return res.status(200).json({ reply: `${button_type} has been selected` });
  };
  