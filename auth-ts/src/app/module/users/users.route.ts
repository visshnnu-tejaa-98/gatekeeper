import express from "express";
import { restrictTo, restrictToAuthenticatedUser } from "../auth/auth.middleware";
import { validate } from "../../common/zod/zod.midleware";
import { userParamsSchema, updateUserSchema } from "./users.schema";
import { SUPER_ADMIN } from "../../common/constants";
import { getUsers, getUser, updateUserProfile, deleteUser } from "./users.controller";

const router = express.Router();
router.use(restrictToAuthenticatedUser());

router.get("/", restrictTo(SUPER_ADMIN), getUsers);
router.get("/:id", validate(userParamsSchema), getUser);
router.patch("/:id", validate(updateUserSchema), updateUserProfile);
router.delete("/:id", restrictTo(SUPER_ADMIN), validate(userParamsSchema), deleteUser);

export default router;
