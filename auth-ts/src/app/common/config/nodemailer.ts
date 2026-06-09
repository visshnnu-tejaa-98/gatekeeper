import nodemailer from "nodemailer";
import { env } from "../zod/env";
import { BadRequestError, InternalServerError } from "../utils/api-error";
import { getVerificationEmailTemplate } from "../utils/emailTemplates";

const host = env.NODEMAILER_SMTP_HOST;
const port = Number(env.NODEMAILER_PORT);
const user = env.NODEMAILER_EMAIL_USER;
const pass = env.NODEMAILER_EMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
  host: env.NODEMAILER_SMTP_HOST,
  port,
  secure: true,
  auth: {
    user,
    pass,
  },
});

const connectToNodemailer = async () => {
  try {
    await transporter.verify();
    console.log("✉️ Nodemailer Connected!");
  } catch (error) {
    throw new BadRequestError("Failed to connect Nodemailer!");
  }
};

const sendVerificationEmail = async (to: string, token: string) => {
  const verificationLink = `${env.BASE_URL}api/auth/verify?token=${token}`;
  try {
    await transporter.sendMail({
      from: user,
      to,
      subject: "Auth - Verify your Email",
      html: getVerificationEmailTemplate(verificationLink),
    });
    console.log(`Email sent to ${to}!`);
  } catch (error) {
    throw new InternalServerError("Send email failed");
  }
};

export { connectToNodemailer, sendVerificationEmail };
