import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma";
import { redisClient } from "../../config/redis";
import { emailQueue } from "../../queues/email.queue";
import { ApiError } from "../../utils/apiError";

interface IRegisterUser {
  fullName: string;
  email: string;
  password: string;
}

const OTP_COOLDOWN = 120; // 120 seconds cooldown for resend OTP

const registerUser = async ({ fullName, email, password }: IRegisterUser) => {
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

  try {
    // check if the user details is in redis or not
    const isCreated = await redisClient.set(
      `register:${email}`,
      JSON.stringify({
        fullName,
        email,
        password: hashedPassword,
        otp,
      }),
      "EX",
      900,
      "NX",
    );

    if (!isCreated) {
      throw new ApiError(
        400,
        "OTP already sent. Please wait for 15 minutes before requesting a new OTP.",
      );
    }

    // Set a cooldown for the resend OTP request
    await redisClient.set(`otp-cooldown:${email}`, "true", "EX", OTP_COOLDOWN);

    // queue the otp email to be sent
    await emailQueue.add("send-otp", {
      firstName: fullName.split(" ")[0],
      email,
      otp,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    await redisClient.del(`otp-cooldown:${email}`);
    await redisClient.del(`register:${email}`);

    throw new ApiError(500, "Failed to send OTP");
  }

  return {
    email,
    message: "OTP sent to your email. OTP is valid for 15 minutes. ",
  };
};

export { registerUser };
