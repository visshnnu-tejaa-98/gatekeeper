export const getVerificationEmailTemplate = (link: string) => {
  return `
      <h1>Welcome to Auth App!</h1>
      <p>Please click the link below to verify your email and activate your account:</p>
      <a href="${link}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
        Verify Email
      </a>
      <p>This link will expire in 5 min.</p>
    `;
};

export const getResetPasswordEmailTemplate = (link: string) => {
  return `
      <h1>Welcome to Auth App!</h1>
      <p>Please click the link below to Reset your password:</p>
      <a href="${link}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
      <p>This link will expire in 5 min.</p>
    `;
};
