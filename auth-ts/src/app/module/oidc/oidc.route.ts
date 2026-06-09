import express from "express";
import {
  authorize,
  deleteClient,
  getKeys,
  registerClient,
} from "./oidc.controller";
import { getUserProfile } from "../auth/auth.controller";
import {
  adminOnly,
  restrictToAuthenticatedUser,
} from "../auth/auth.middleware";
import { validate } from "../../common/zod/zod.midleware";
import {
  deleteClientApplicationByClientIdSchema,
  registerNewClientDataSchema,
} from "./oidc.schema";

const router = express.Router();

router.get("/jwks.json", getKeys);
router.get("/authorize", authorize);
router.get("/userInfo", getUserProfile);
router.post(
  "/register-client",
  restrictToAuthenticatedUser(),
  adminOnly(),
  validate(registerNewClientDataSchema),
  registerClient,
);

router.delete(
  "/delete-client/:id",
  restrictToAuthenticatedUser(),
  validate(deleteClientApplicationByClientIdSchema, "params"),
  // TODO: Change this to superAdmin only
  adminOnly(),
  deleteClient,
);

export default router;
