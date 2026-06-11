import { and, eq } from "drizzle-orm";
import db from "../../../db";
import {
  applicationsTable,
  revokedTokensTable,
  shortCodesTable,
} from "../../../db/schema";
import {
  CreateNewApplicationPropsType,
  RotateApplicationSecretByApplicationIdProps,
  UpdateApplicationByIdProps,
} from "./oidc.types";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../../common/utils/api-error";
import { hashToken } from "../../common/utils/jwt";
import { SUPER_ADMIN } from "../../common/constants";

const getApplicationDetailsByUserIdAndApplicationUrl = async (
  userId: string,
  applicationUrl: string,
) => {
  const applications = await db
    .select({
      name: applicationsTable.name,
      url: applicationsTable.url,
      redirectUri: applicationsTable.redirectUri,
    })
    .from(applicationsTable)
    .where(
      and(
        eq(applicationsTable.userId, userId),
        eq(applicationsTable.url, applicationUrl),
      ),
    );

  if (applications.length === 0) return false;
  const application = applications[0];
  if (!applications) return false;
  return application;
};

const createNewApplication = async (props: CreateNewApplicationPropsType) => {
  const {
    userId,
    applicationDisplayName,
    applicationUrl,
    redirectUri,
    clientId,
    clientSecret,
  } = props;
  const createdApplication = await db
    .insert(applicationsTable)
    .values({
      userId,
      name: applicationDisplayName,
      url: applicationUrl,
      redirectUri: redirectUri,
      clientId,
      clientSecret,
    })
    .returning({
      id: applicationsTable.id,
      applicationDisplayName: applicationsTable.name,
      applicationURL: applicationsTable.url,
      redirectURI: applicationsTable.redirectUri,
      clientId: applicationsTable.clientId,
      clientSecret: applicationsTable.clientSecret,
    });

  return createdApplication;
};

const getApplicationDetails = async (userId: string, role: string) => {
  console.log({ role });
  const condition =
    role === SUPER_ADMIN ? undefined : eq(applicationsTable.userId, userId);
  const applications = await db
    .select({
      id: applicationsTable.id,
      name: applicationsTable.name,
      url: applicationsTable.url,
      redirectUri: applicationsTable.redirectUri,
      clientId: applicationsTable.clientId,
    })
    .from(applicationsTable)
    .where(condition);

  return applications;
};

const deleteClientById = async (applicationId: string) => {
  const deletedItems = await db
    .delete(applicationsTable)
    .where(eq(applicationsTable.id, applicationId))
    .returning({ id: applicationsTable.id });

  if (deletedItems.length === 0)
    throw new BadRequestError(
      `Client Application not found with ${applicationId}`,
    );
  let deletedApplicationId = deletedItems[0];
  if (!deletedApplicationId)
    throw new BadRequestError(
      `Something went wrong in deleting the client application with id: ${applicationId}`,
    );
  return deletedApplicationId;
};

const verifyClientSecretAndShortCode = async (
  shortCode: string,
  clientSecret: string,
) => {
  const matchedDataRows = await db
    .select({
      clientId: shortCodesTable.clientId,
      clientSecret: applicationsTable.clientSecret,
      shortCode: shortCodesTable.shortcode,
      userId: shortCodesTable.userId,
    })
    .from(shortCodesTable)
    .innerJoin(
      applicationsTable,
      eq(applicationsTable.clientId, shortCodesTable.clientId),
    )
    .where(
      and(
        eq(shortCodesTable.shortcode, shortCode),
        eq(applicationsTable.clientSecret, clientSecret),
      ),
    );

  if (matchedDataRows.length === 0) throw new BadRequestError();
  let matchedRow = matchedDataRows[0];
  if (!matchedRow)
    throw new NotFoundError(
      "No data found with matching client_secret, client_id and sort_code",
    );
  return matchedRow;
};

const getApplicationByClientId = async (clientId: string) => {
  const apps = await db
    .select({
      name: applicationsTable.name,
      redirectUri: applicationsTable.redirectUri,
    })
    .from(applicationsTable)
    .where(eq(applicationsTable.clientId, clientId));

  if (apps.length === 0) throw new NotFoundError("Application not found");
  return apps[0]!;
};

const verifyClientCredentials = async (
  clientId: string,
  rawClientSecret: string,
) => {
  const hashedSecret = hashToken(rawClientSecret);
  const apps = await db
    .select({ id: applicationsTable.id })
    .from(applicationsTable)
    .where(
      and(
        eq(applicationsTable.clientId, clientId),
        eq(applicationsTable.clientSecret, hashedSecret),
      ),
    );
  if (apps.length === 0)
    throw new UnauthorizedError("Invalid client credentials");
  return apps[0];
};

const rotateApplicationSecretByApplicationId = async (
  props: RotateApplicationSecretByApplicationIdProps,
) => {
  const { role, applicationId, userId, hashedClientSecret } = props;

  const condition =
    role === SUPER_ADMIN ?
      eq(applicationsTable.id, applicationId)
    : and(
        eq(applicationsTable.id, applicationId),
        eq(applicationsTable.userId, userId),
      );

  const updated = await db
    .update(applicationsTable)
    .set({ clientSecret: hashedClientSecret, updatedAt: new Date() })
    .where(condition)
    .returning({
      id: applicationsTable.id,
      clientId: applicationsTable.clientId,
    });

  if (updated.length === 0)
    throw new NotFoundError(
      "Application not found or you do not have permission to rotate this secret",
    );

  return updated[0]!;
};

const getApplicationById = async (
  applicationId: string,
  userId: string,
  role: string,
) => {
  const condition =
    role === SUPER_ADMIN ?
      eq(applicationsTable.id, applicationId)
    : and(
        eq(applicationsTable.id, applicationId),
        eq(applicationsTable.userId, userId),
      );

  const apps = await db
    .select({
      id: applicationsTable.id,
      name: applicationsTable.name,
      url: applicationsTable.url,
      redirectUri: applicationsTable.redirectUri,
      clientId: applicationsTable.clientId,
      createdAt: applicationsTable.createdAt,
      updatedAt: applicationsTable.updatedAt,
    })
    .from(applicationsTable)
    .where(condition);

  if (apps.length === 0)
    throw new NotFoundError(
      "Application not found or you do not have permission to view it",
    );

  return apps[0]!;
};

const updateApplicationById = async (props: UpdateApplicationByIdProps) => {
  const { applicationId, userId, role, data } = props;

  const condition =
    role === SUPER_ADMIN ?
      eq(applicationsTable.id, applicationId)
    : and(
        eq(applicationsTable.id, applicationId),
        eq(applicationsTable.userId, userId),
      );

  const updated = await db
    .update(applicationsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(condition)
    .returning({
      id: applicationsTable.id,
      name: applicationsTable.name,
      url: applicationsTable.url,
      redirectUri: applicationsTable.redirectUri,
      clientId: applicationsTable.clientId,
    });

  if (updated.length === 0)
    throw new NotFoundError(
      "Application not found or you do not have permission to update it",
    );

  return updated[0]!;
};

const insertRevokedToken = async (jti: string, exp: Date) => {
  await db.insert(revokedTokensTable).values({ jti, exp });
};

const isTokenRevoked = async (jti: string): Promise<boolean> => {
  const rows = await db
    .select({ jti: revokedTokensTable.jti })
    .from(revokedTokensTable)
    .where(eq(revokedTokensTable.jti, jti));
  return rows.length > 0;
};

export {
  getApplicationDetailsByUserIdAndApplicationUrl,
  createNewApplication,
  getApplicationDetails,
  deleteClientById,
  verifyClientSecretAndShortCode,
  verifyClientCredentials,
  insertRevokedToken,
  isTokenRevoked,
  getApplicationByClientId,
  rotateApplicationSecretByApplicationId,
  updateApplicationById,
  getApplicationById,
};
