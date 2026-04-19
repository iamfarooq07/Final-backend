import express from "express";
import {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  markConversationAsRead
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Get all conversations
router.get("/conversations", getConversations);

// Get or create conversation with specific user
router.get("/conversations/:recipientId", getOrCreateConversation);

// Get messages for a conversation
router.get("/:conversationId/messages", getMessages);

// Send message
router.post("/:conversationId/send", sendMessage);

// Mark message as read
router.patch("/:messageId/read", markAsRead);

// Mark conversation as read
router.patch("/:conversationId/mark-read", markConversationAsRead);

export default router;
