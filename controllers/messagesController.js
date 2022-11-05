const Messages = require("../model/messageModel");

module.exports.addMessage = async (req, res, next) => {
  const { from, to, message } = req.body;
  console.log(from, to, message);
  try {
    const msg = new Messages({
      message: { text: message },
      users: [from, to],
      sender: from,
    });
    await msg.save();
    if (msg) {
      return res.json({ msg: "Message added successfully." });
    } else {
      return res.json({ msg: "Message failed." });
    }
  } catch (ex) {
    next(ex);
  }
};

module.exports.getMessage = async (req, res, next) => {
  const { from, to } = req.body;
  try {
    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });
    const projectMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
      };
    });
    res.json(projectMessages);
  } catch (ex) {
    next(ex);
  }
};
