import { Router } from "express";
import multer from "multer";
import path from "path";
import { register, login, getMe, completeOnboarding, updateProfilePicture } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/onboarding", protect, completeOnboarding);
router.put("/profile-picture", protect, upload.single('profilePicture'), updateProfilePicture);

export default router;
