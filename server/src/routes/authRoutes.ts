import { Router } from "express";
import {
  changePassword,
  login,
  me,
  register,
  updateProfile
} from "../controllers/authController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, me);
router.put("/me", authenticate, updateProfile);
router.patch("/me", authenticate, updateProfile);
router.put("/password", authenticate, changePassword);

export default router;
