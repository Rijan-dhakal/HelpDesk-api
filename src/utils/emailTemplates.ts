import { env } from "../config/env";

export const registerEmailTemplate = (name: string, otp: string) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 10px;">
      <h2 style="color: #2563eb;">Welcome to HelpDesk, ${name}!</h2>

      <p style="font-size: 16px; color: #374151;">
        Thanks for creating an account with HelpDesk. 
        Please use the verification code below to complete your registration.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <span style="
          display: inline-block;
          background: #f3f4f6;
          padding: 16px 32px;
          border-radius: 8px;
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          color: #111827;
        ">
          ${otp}
        </span>
      </div>

      <p style="font-size: 14px; color: #6b7280;">
        This verification code will expire in 15 minutes.
      </p>

      <p style="font-size: 14px; color: #6b7280;">
        If you did not request this account, you can safely ignore this email.
      </p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

      <p style="font-size: 13px; color: #9ca3af; text-align: center;">
        © ${new Date().getFullYear()} HelpDesk. All rights reserved.
      </p>
    </div>
  `;

  const text = `
Welcome to HelpDesk, ${name}!

Your verification code is: ${otp}

This code will expire in 15 minutes.

If you did not request this account, you can ignore this email.
`;

  return { html, text };
};

export const passwordResetEmailTemplate = (
  name: string,
  resetToken: string,
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 10px;">
      <h2 style="color: #2563eb;">Reset your HelpDesk password</h2>

      <p style="font-size: 16px; color: #374151;">
        Hi ${name},
      </p>

      <p style="font-size: 16px; color: #374151;">
        We received a request to reset your HelpDesk account password.
        Click the button below to create a new password.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a
          href="${env.FRONTEND_URL}/reset-password?token=${resetToken}"
          style="
            display: inline-block;
            background: #2563eb;
            color: #ffffff;
            padding: 14px 28px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 16px;
            font-weight: bold;
          "
        >
          Reset Password
        </a>
      </div>

      <p style="font-size: 14px; color: #6b7280;">
        This password reset link will expire in 5 minutes.
      </p>

      <p style="font-size: 14px; color: #6b7280;">
        If you did not request a password reset, you can safely ignore this email.
        Your password will remain unchanged.
      </p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

      <p style="font-size: 13px; color: #9ca3af;">
        If the button does not work, copy and paste this link into your browser:
      </p>

      <p style="font-size: 13px; color: #2563eb; word-break: break-all;">
        ${env.FRONTEND_URL}/reset-password?token=${resetToken}
      </p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

      <p style="font-size: 13px; color: #9ca3af; text-align: center;">
        © ${new Date().getFullYear()} HelpDesk. All rights reserved.
      </p>
    </div>
  `;

  const text = `
Hi ${name},

We received a request to reset your HelpDesk password.

Reset your password using this link:
${env.FRONTEND_URL}/reset-password?token=${resetToken}

This password reset link will expire in 5 minutes.

If you did not request this password reset, you can ignore this email.

© ${new Date().getFullYear()} HelpDesk. All rights reserved.
`;

  return { html, text };
};
