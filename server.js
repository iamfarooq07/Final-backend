import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { dataBase } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ 
  origin: [
    process.env.FRONTEND_URL, 
    "http://localhost:5173",
    "https://final-frontend-three-peach.vercel.app"
  ], 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

dataBase();

app.use("/api/auth", authRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
