import { Router } from "express";
import { check } from "express-validator";
import { validate } from "../middleware/validation";
import { register, login, logout, getMe } from "../controllers/auth.controller";
import { auth } from "../middleware/auth";

const router = Router();

router.post(
  "/register",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
    validate,
  ],
  register
);

router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
    validate,
  ],
  login
);

router.post("/logout", logout);
router.get("/me", auth, getMe);

export default router;
