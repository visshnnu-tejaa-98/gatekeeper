import express from "express";
import {
  forgotPassword,
  loginUser,
  logoutUser,
  getUserProfile,
  registerUser,
  verifyUserEmail,
  resetPassword,
  uploadUserAvatar,
} from "./auth.controller";
import { validate } from "../../common/zod/zod.midleware";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchemaFromBody,
  resetPasswordSchemaFromParams,
  uploadAvatarSchema,
  verifyEmailSchema,
} from "./auth.schema";
import { adminOnly, restrictToAuthenticatedUser } from "./auth.middleware";
import { upload } from "../../common/utils/multer";

const router = express.Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/verify", validate(verifyEmailSchema), verifyUserEmail);
router.post("/login", validate(loginSchema), loginUser);
router.get("/profile", restrictToAuthenticatedUser(), getUserProfile);
router.post("/logout", restrictToAuthenticatedUser(), logoutUser);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post(
  "/reset-password",
  validate(resetPasswordSchemaFromBody, "body"),
  validate(resetPasswordSchemaFromParams, "query"),
  resetPassword,
);
router.post(
  "/upload",
  restrictToAuthenticatedUser(),
  upload.single("avatar"),
  validate(uploadAvatarSchema, "file"),
  uploadUserAvatar,
);

router.get("/admin", restrictToAuthenticatedUser(), adminOnly(), (req, res) => {
  res.json({ message: "This is admin only route" });
});

export default router;
