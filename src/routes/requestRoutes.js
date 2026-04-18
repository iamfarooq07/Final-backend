import { Router } from "express";
import {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
  getMyRequests
} from "../controllers/requestController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", protect, createRequest);
router.get("/", protect, getRequests);
router.get("/my", protect, getMyRequests);
router.get("/:id", protect, getRequestById);
router.patch("/:id/status", protect, updateRequestStatus);

export default router;