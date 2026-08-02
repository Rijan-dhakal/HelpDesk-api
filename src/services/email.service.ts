import { Resend } from "resend";
import { env } from "../config/env";
import { ApiError } from "../utils/apiError";
import { logger } from "../config/logger";

const resend = new Resend(process.env.RESEND_API_KEY);

const from = env.EMAIL_FROM as string;

export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text: string,
) => {
  const { error } = await resend.emails.send({
    from,
    to: [to],
    subject: subject,
    html: html,
    text: text,
  });

  if (error) {
    logger.error({ error }, "Failed to send email");
    throw new ApiError(500, "Failed to send email");
  }
};
