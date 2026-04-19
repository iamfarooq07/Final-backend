import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Request from "../models/Request.js";

// Get all notifications for user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { filter = "all" } = req.query;

    let query = { userId };

    if (filter === "unread") {
      query.read = false;
    } else if (filter === "system") {
      query.type = { $in: ["system", "achievement"] };
    } else if (filter !== "all") {
      query.type = filter;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create notification
export const createNotification = async (req, res) => {
  try {
    const { userId, type, title, message, relatedId, icon, actionUrl } = req.body;

    const notification = new Notification({
      userId,
      type,
      title,
      message,
      relatedId,
      icon,
      actionUrl
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.findByIdAndUpdate(notificationId, { read: true });
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.updateMany({ userId, read: false }, { read: true });
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.findByIdAndDelete(notificationId);
    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const { timeframe = "month" } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (timeframe) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "all":
        startDate = new Date(0);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Get requests solved by each user in the timeframe
    const solvedRequests = await Request.aggregate([
      {
        $match: {
          status: "solved",
          solvedAt: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: "$helperId",
          helpsGiven: { $sum: 1 }
        }
      },
      {
        $sort: { helpsGiven: -1 }
      },
      {
        $limit: 50
      }
    ]);

    // Populate user details
    const leaderboard = await Promise.all(
      solvedRequests.map(async (record) => {
        const user = await User.findById(record._id).select('fullName profilePicture skills');
        return {
          rank: 0,
          userId: record._id,
          name: user?.fullName || "Unknown",
          avatar: user?.profilePicture || "",
          trustScore: 4.5 + Math.random() * 0.4, // Between 4.5-4.9
          helpsGiven: record.helpsGiven,
          badges: getBadges(record.helpsGiven),
          change: Math.floor(Math.random() * 5) - 2, // -2 to +3
        };
      })
    );

    // Add ranks
    leaderboard.forEach((item, index) => {
      item.rank = index + 1;
    });

    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper to get badges based on helps given
const getBadges = (helpsGiven) => {
  const badges = [];
  if (helpsGiven >= 40) badges.push("Award"); // Top Helper
  if (helpsGiven >= 30) badges.push("Zap"); // Fast Responder
  if (helpsGiven >= 20) badges.push("Users"); // Community Hero
  return badges;
};

// Get user statistics for dashboard/AI center
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's requests and helps
    const myRequests = await Request.countDocuments({ userId });
    const solved = await Request.countDocuments({ userId, status: "solved" });
    const active = await Request.countDocuments({ userId, status: "open" });
    const helpedCount = await Request.countDocuments({ helperId: userId, status: "solved" });

    // Calculate trust score (based on activity)
    const trustScore = Math.min(5, 3 + (helpedCount * 0.1));

    res.status(200).json({
      totalRequests: myRequests,
      activeRequests: active,
      solvedRequests: solved,
      helpsGiven: helpedCount,
      trustScore: parseFloat(trustScore.toFixed(2))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get AI insights
export const getAIInsights = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Mock AI insights based on user activity
    const insights = [
      {
        type: "activity",
        title: `You are most active in ${user?.skills?.[0] || "React"} help requests`,
        description: `You've helped users this week in these areas`,
        icon: "TrendingUp",
        color: "bg-blue-100 text-blue-600"
      },
      {
        type: "performance",
        title: "Your response rate is 2x above average",
        description: "You typically respond within reasonable time",
        icon: "Zap",
        color: "bg-green-100 text-green-600"
      },
      {
        type: "suggestion",
        title: `Suggested focus: ${user?.skills?.[1] || "Backend"} requests`,
        description: "High demand skills with fewer helpers available",
        icon: "Target",
        color: "bg-purple-100 text-purple-600"
      },
      {
        type: "trend",
        title: "Platform trend: AI/ML skills growing 45%",
        description: "Consider learning AI/ML for better matching",
        icon: "Rocket",
        color: "bg-orange-100 text-orange-600"
      }
    ];

    res.status(200).json(insights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
