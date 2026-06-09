import { and, eq } from "drizzle-orm";
import db from "../../../db";
import { applicationsTable } from "../../../db/schema";
import { createNewApplicationPropsType } from "./oidc.types";
import { BadRequestError } from "../../common/utils/api-error";

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

const createNewApplication = async (props: createNewApplicationPropsType) => {
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

const deleteClientById = async (applicationId: string) => {
  const deletedItems = await db
    .delete(applicationsTable)
    .where(eq(applicationsTable.id, applicationId))
    .returning({ id: applicationsTable.id });

  if (deletedItems.length === 0)
    throw new BadRequestError(
      `Client Application not found with ${applicationId}`,
    );
  let deletedApplicationId = applicationId[0];
  if (!deletedApplicationId)
    throw new BadRequestError(
      `Something went wrong in devleting the client appliction with id: ${applicationId}`,
    );
  return deletedApplicationId;
};

export {
  getApplicationDetailsByUserIdAndApplicationUrl,
  createNewApplication,
  deleteClientById,
};
