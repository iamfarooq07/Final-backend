import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";

// Get or create conversation between two users
export const getOrCreateConversation = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const userId = req.user._id;

    let conversation = await Conversation.findOne({
      participantIds: { $all: [userId, recipientId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participantIds: [userId, recipientId]
      });
      await conversation.save();
    }

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all conversations for user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await Conversation.find({
      participantIds: userId,
      active: true
    })
      .populate('participantIds', 'fullName profilePicture')
      .sort({ lastMessageTime: -1 });

    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherParticipant = conv.participantIds.find(p => p._id.toString() !== userId.toString());
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          receiverId: userId,
          read: false
        });
        return {
          ...conv.toObject(),
          otherParticipant,
          unreadCount,
          user: otherParticipant
        };
      })
    );

    res.status(200).json(enrichedConversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId })
      .populate('senderId', 'fullName profilePicture')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, receiverId } = req.body;
    const senderId = req.user._id;

    const message = new Message({
      conversationId,
      senderId,
      receiverId,
      content
    });

    await message.save();

    // Update last message in conversation
    await Conversation.findByIdAndUpdate(
      conversationId,
      {
        lastMessage: content,
        lastMessageTime: new Date()
      }
    );

    const populatedMessage = await message.populate('senderId', 'fullName profilePicture');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark message as read
export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    await Message.findByIdAndUpdate(messageId, { read: true });
    res.status(200).json({ message: "Message marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all messages in conversation as read
export const markConversationAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    await Message.updateMany(
      { conversationId, receiverId: userId, read: false },
      { read: true }
    );

    res.status(200).json({ message: "All messages marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
