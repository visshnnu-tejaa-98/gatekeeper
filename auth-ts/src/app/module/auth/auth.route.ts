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
  verifyEmailRequest,
  refreshToken,
} from "./auth.controller";
import { validate } from "../../common/zod/zod.midleware";
import {
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
  uploadAvatarSchema,
  verifyEmailPayloadSchema,
  verifyEmailSchema,
} from "./auth.schema";
import { restrictTo, restrictToAuthenticatedUser } from "./auth.middleware";
import { upload } from "../../common/utils/multer";
import { ADMIN } from "../../common/constants";
import ApiResponse from "../../common/utils/api-response";

const router = express.Router();

// ==========================================
// 🔓 PUBLIC ROUTES (No Auth Required)
// ==========================================

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/refresh", validate(refreshTokenSchema), refreshToken);
router.post("/verify", validate(verifyEmailSchema), verifyUserEmail);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

// ==========================================
// 🔒 PROTECTED ROUTES (Requires Authentication)
// ==========================================
const protectedRouter = express.Router();
protectedRouter.use(restrictToAuthenticatedUser());

protectedRouter.get("/profile", getUserProfile);
protectedRouter.post("/logout", logoutUser);
protectedRouter.get(
  "/verify-email-request",
  // validate(verifyEmailPayloadSchema),
  verifyEmailRequest,
);
protectedRouter.post(
  "/upload",
  upload.single("avatar"),
  validate(uploadAvatarSchema),
  uploadUserAvatar,
);

// ==========================================
// 🛡️ ADMIN-ONLY ROUTES (Requires Admin Role)
// ==========================================

router.get("/admin", restrictTo(ADMIN), (req, res) => {
  ApiResponse.success(res, "This is admin only route");
});

router.use("/", protectedRouter);

export default router;
