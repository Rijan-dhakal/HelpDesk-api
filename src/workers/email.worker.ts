import { Worker } from "bullmq";
import { bullmqRedisConnection } from "../config/redis";
import { sendEmail } from "../services/email.service";
import { ApiError } from "../utils/apiError";
import { registerEmailTemplate } from "../utils/emailTemplates";

const emailWorker = new Worker(
  "email",
  async (job) => {
    switch (job.name) {
      case "send-otp":
        const { email, otp, firstName } = job.data;
        const subject = "Your OTP Code";
        const html = registerEmailTemplate(firstName, otp).html;
        const text = registerEmailTemplate(firstName, otp).text;
        await sendEmail(email, subject, html, text);
        break;

      default:
        throw new ApiError(400, `Unknown job name: ${job.name}`);
    }
  },
  {
    connection: bullmqRedisConnection,
  },
);

export { emailWorker };
