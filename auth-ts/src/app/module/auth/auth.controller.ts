import type { Request, Response } from "express";
import ApiResponse from "../../common/utils/api-response";
import {
  forgot,
  login,
  logout,
  profile,
  register,
  resetUserPassword,
  uploadAvatar,
  verifyEmail,
} from "./auth.service";
import { UnauthorizedError } from "../../common/utils/api-error";

const registerUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const data = await register({ name, email, password });
  ApiResponse.created(res, "User created successfully", data);
};

const verifyUserEmail = async (req: Request, res: Response) => {
  const { token } = req.body;
  const user = await verifyEmail({ token });
  ApiResponse.created(res, "User Email Verified Successfully", user);
};

const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { clientId } = req.query;

  const { id: userId, accessToken } = await login({
    email,
    password,
    clientId,
  });

  ApiResponse.created(res, "User loggedin successfully", {
    accessToken,
    id: userId,
  });
};

const getUserProfile = async (req: Request, res: Response) => {
  if (!req.user || typeof req.user === "string") {
    throw new UnauthorizedError("Invalid session content");
  }
  const { sub } = req.user;
  const userDetails = await profile(sub!);
  ApiResponse.success(res, "Fetched user details successfully", {
    user: userDetails,
  });
};

const logoutUser = async (req: Request, res: Response) => {
  await logout();
  ApiResponse.success(res, "User logout successfully");
};

const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const { resetToken } = await forgot({ email });
  ApiResponse.success(res, "Email sent", { resetToken });
};

const resetPassword = async (req: Request, res: Response) => {
  const { password } = req.body;
  const { token } = req.query;
  const user = await resetUserPassword({ password, token: token?.toString()! });
  ApiResponse.success(res, "Password reset successfully", user);
};

const uploadUserAvatar = async (req: Request, res: Response) => {
  const userId = req.user.sub;
  const response = await uploadAvatar(userId!, req.file!);
  ApiResponse.success(res, "File uploaded successfully", response);
};

export {
  registerUser,
  verifyUserEmail,
  loginUser,
  profile,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  uploadUserAvatar,
};
