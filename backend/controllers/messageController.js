const Message = require("../models/message.model");
const { getReceiverSocketId, io } = require("../lib/socket");

const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    // NOTE: using query or body for senderId since global auth middleware is missing
    // In a prod app, this should come from req.user._id
    const myId = req.query.senderId || req.body.senderId;

    if (!myId) {
      return res.status(401).json({ error: "Unauthorized: Sender ID missing" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 }); // Sort by time

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { text, senderId } = req.body;
    const { id: receiverId } = req.params;

    // Optional: Validate senderId matches authenticated user if we had auth
    if (!senderId) {
      return res.status(401).json({ error: "Unauthorized: Sender ID missing" });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      // Send to receiver
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getMessages, sendMessage };
