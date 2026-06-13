import express from "express";
import {
  authorize,
  consent,
  deleteClient,
  getAccessToken,
  getAllApplications,
  getApplication,
  getKeys,
  getTokenInfo,
  introspectToken,
  registerClient,
  revokeToken,
  generatToken,
  rotateSecret,
  updateApplication,
} from "./oidc.controller";
import { getUserProfile } from "../auth/auth.controller";
import {
  restrictTo,
  restrictToAuthenticatedUser,
} from "../auth/auth.middleware";
import { validate } from "../../common/zod/zod.midleware";
import {
  consentSchema,
  deleteClientApplicationByClientIdSchema,
  getAccessTokenSchema,
  introspectTokenSchema,
  registerNewClientDataSchema,
  rotateSecretParamsSchema,
  revokeTokenSchema,
  getApplicationByIdSchema,
  updateApplicationSchema,
  authorizeSchema,
  generatTokenSchema,
} from "./oidc.schema";
import { ADMIN, SUPER_ADMIN } from "../../common/constants";

const router = express.Router();

// =========================================================================
// 🌐 OPENID CONNECT / OAUTH2 CORE ENDPOINTS (Public Protocol Gateway)
// =========================================================================

router.get("/jwks.json", getKeys);
router.get("/authorize", validate(authorizeSchema), authorize);
router.post("/consent", validate(consentSchema), consent);
router.get("/access-token", validate(getAccessTokenSchema), getAccessToken);
router.post("/token", validate(generatTokenSchema), generatToken);

// Back-channel protocol endpoints (Relying parties call these with credentials)
router.post("/revoke", validate(revokeTokenSchema), revokeToken);
router.post("/introspect", validate(introspectTokenSchema), introspectToken);

// =========================================================================
// 🔒 PROTECTED CORE ENDPOINTS (Requires User Session Auth)
// =========================================================================
const protectedRouter = express.Router();
protectedRouter.use(restrictToAuthenticatedUser());

protectedRouter.get("/userInfo", getUserProfile);
protectedRouter.get("/token", getTokenInfo);
protectedRouter.get("/applications", getAllApplications);

// =========================================================================
// 🛡️ APPLICATION MANAGEMENT LAYER (Admin & Super Admin Controls)
// =========================================================================

const managementRouter = express.Router();
managementRouter.use(restrictTo(ADMIN, SUPER_ADMIN));

managementRouter.get(
  "/application/:id",
  validate(getApplicationByIdSchema),
  getApplication,
);
managementRouter.post(
  "/rotate-secret/:id",
  validate(rotateSecretParamsSchema),
  rotateSecret,
);
managementRouter.patch(
  "/applications/:id",
  validate(updateApplicationSchema),
  updateApplication,
);

// Granular route overrides for distinct capabilities

managementRouter.post(
  "/register-client",
  restrictTo(ADMIN, SUPER_ADMIN),
  validate(registerNewClientDataSchema),
  registerClient,
);

managementRouter.delete(
  "/delete-client/:id",
  restrictToAuthenticatedUser(),
  validate(deleteClientApplicationByClientIdSchema),
  restrictTo(SUPER_ADMIN),
  deleteClient,
);

router.use("/", protectedRouter);
protectedRouter.use("/", managementRouter);

export default router;
