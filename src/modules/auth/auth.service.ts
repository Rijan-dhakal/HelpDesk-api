import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma";
import { redisClient } from "../../config/redis";
import { emailQueue } from "../../queues/email.queue";
import { ApiError } from "../../utils/apiError";

interface IRegisterUser {
  name: string;
  email: string;
  password: string;
}

const registerUser = async ({ name, email, password }: IRegisterUser) => {
  // Check if user with the same email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(400, "User with this email already exists");
  }

  //   generate a 6 digit otp
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedPassword = await bcrypt.hash(password, 10);

  // Save otp in Redis with a 15 minute expiration
  await redisClient.set(
    `register:${email}`,
    JSON.stringify({ name, email, password: hashedPassword, otp }),
    "EX",
    900,
  );

  // Add job to email queue
  await emailQueue.add("send-otp", {
    email,
    otp,
  });

  return {
    email,
    message: "OTP sent to your email.",
  };
};

export { registerUser };
