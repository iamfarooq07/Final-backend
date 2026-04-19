import express from "express";
import {
  getNotifications,
  createNotification,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  getLeaderboard,
  getUserStats,
  getAIInsights
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Notifications
router.get("/", getNotifications);
router.post("/", createNotification);
router.patch("/:notificationId/read", markNotificationAsRead);
router.patch("/mark-all/read", markAllAsRead);
router.delete("/:notificationId", deleteNotification);

// Leaderboard
router.get("/leaderboard/top", getLeaderboard);

// User stats
router.get("/stats/user", getUserStats);

// AI Insights
router.get("/insights/ai", getAIInsights);

export default router;
