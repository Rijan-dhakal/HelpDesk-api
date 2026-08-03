import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../../config/prisma";
import { redisClient } from "../../config/redis";
import { emailQueue } from "../../queues/email.queue";
import { ApiError } from "../../utils/apiError";
import { generateToken } from "../../helper/jwt";
import { hashToken } from "../../helper/hash-reset-token";

interface IRegisterUser {
  fullName: string;
  email: string;
  password: string;
}

interface IVerifyEmail {
  email: string;
  otp: string;
}

interface ILoginUser {
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

const resendOtp = async ({ email }: { email: string }) => {
  const cooldownKey = `otp-cooldown:${email}`;

  const isCooldownActive = await redisClient.exists(cooldownKey);

  // check if the cooldown is active
  if (isCooldownActive) {
    const ttl = await redisClient.ttl(cooldownKey);

    throw new ApiError(
      429,
      `Please wait ${ttl} seconds before requesting another OTP`,
    );
  }

  // Check if the user data exists in Redis
  const userDataString = await redisClient.get(`register:${email}`);

  if (!userDataString) {
    throw new ApiError(400, "No registration data found for this email");
  }

  const userData = JSON.parse(userDataString);

  // Generate a new OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // Set a new cooldown for the resend OTP request
    const isCooldownSet = await redisClient.set(
      cooldownKey,
      "true",
      "EX",
      OTP_COOLDOWN,
      "NX",
    );

    if (!isCooldownSet) {
      throw new ApiError(429, "Please wait before requesting another OTP");
    }

    // Update the user data in Redis with the new OTP and reset the expiration time
    await redisClient.set(
      `register:${email}`,
      JSON.stringify({ ...userData, otp }),
      "EX",
      900,
    );

    // Send the new OTP email
    await emailQueue.add("send-otp", {
      firstName: userData.fullName.split(" ")[0],
      email,
      otp,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Remove cooldown if sending fails
    await redisClient.del(cooldownKey);
    throw new ApiError(500, "Failed to resend OTP");
  }

  return {
    email,
    message: "OTP resent to your email. OTP is valid for 15 minutes.",
  };
};

const verifyEmail = async ({ email, otp }: IVerifyEmail) => {
  const userData = await redisClient.get(`register:${email}`);

  if (!userData) {
    throw new ApiError(400, "Data not found for this email");
  }

  const parsedData = JSON.parse(userData);

  if (parsedData.otp !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  // Create the user in the database
  const newUser = await prisma.user.create({
    data: {
      fullName: parsedData.fullName,
      email: parsedData.email,
      password: parsedData.password,
    },
  });

  // Clean up Redis data after successful registration
  await redisClient.del(`register:${email}`);
  await redisClient.del(`otp-cooldown:${email}`);

  return {
    message: "User registered successfully",
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
    },
  };
};

const loginUser = async ({ email, password }: ILoginUser) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(400, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid email or password");
  }

  // generate jwt token
  const token = generateToken({ userId: user.id, role: user.role });

  if (!token) {
    throw new ApiError(500, "Failed to generate token");
  }

  return {
    message: "Login successful",
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  };
};

const forgotPasswordService = async ({ email }: { email: string }) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return {
      message: "If the email exists, a password reset link will be sent.",
    };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = hashToken(resetToken);

  const isResetTokenSet = await redisClient.set(
    `reset-password:${hashedToken}`,
    email,
    "EX",
    300,
    "NX",
  );

  if (!isResetTokenSet) {
    const ttl = await redisClient.ttl(`reset-password:${hashedToken}`);

    throw new ApiError(
      400,
      `Wait for ${ttl} seconds before requesting another password reset.`,
    );
  }

  await emailQueue.add("send-reset-password", {
    firstName: user.fullName.split(" ")[0],
    email,
    resetToken,
  });

  return {
    message:
      "Password reset link sent to your email. Link is valid for 5 minutes.",
  };
};

export {
  registerUser,
  resendOtp,
  verifyEmail,
  loginUser,
  forgotPasswordService,
};
