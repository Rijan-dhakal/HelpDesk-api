import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../../config/prisma";
import { redisClient } from "../../config/redis";
import { emailQueue } from "../../queues/email.queue";
import { ApiError } from "../../utils/apiError";
import { generateToken } from "../../helper/jwt";
import { hashToken } from "../../helper/hash-reset-token";
import type {
  IChangePassword,
  ILoginUser,
  IParsedData,
  IRegisterUser,
  IResetPassword,
  IVerifyEmail,
} from "./auth.types";

const OTP_COOLDOWN = 120; // 120 seconds cooldown for resend OTP

const registerUserService = async ({
  fullName,
  email,
  password,
}: IRegisterUser) => {
  // Check if user with the same email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
    },
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

const resendOtpService = async ({ email }: { email: string }) => {
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

const verifyEmailService = async ({ email, otp }: IVerifyEmail) => {
  const userData = await redisClient.get(`register:${email}`);

  if (!userData) {
    throw new ApiError(400, "Data not found for this email");
  }

  const parsedData: IParsedData = JSON.parse(userData);

  const existingUser = await prisma.user.findUnique({
    where: { email: parsedData.email },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    throw new ApiError(400, "User already exist");
  }

  if (parsedData.otp !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  // Create the user in the database
  const newUser = await prisma.user.create({
    data: {
      fullName: parsedData.fullName,
      email: parsedData.email,
      // password is already hashed before storing in redis, so we can directly use it here
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

const loginUserService = async ({ email, password }: ILoginUser) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      password: true,
    },
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
  //  Check if user exist
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      fullName: true,
    },
  });

  //  return message even if user does not exist to prevent email enumeration
  if (!user) {
    return {
      message:
        "Password reset link sent to your email. Link is valid for 5 minutes.",
    };
  }

  // cooldown key for redis to limit multiple request
  const cooldownKey = `password-reset-cooldown:${email}`;

  // check if the cooldown is active
  const exists = await redisClient.exists(cooldownKey);

  // if cooldown is active prevent sending another email
  if (exists) {
    const ttl = await redisClient.ttl(cooldownKey);

    throw new ApiError(
      400,
      `Please wait ${ttl} seconds before requesting another reset email.`,
    );
  }

  // generate random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // hash the token before storing it in redis
  const hashedToken = hashToken(resetToken);

  // store the hashed token in redis
  await redisClient.set(
    `reset-password:${hashedToken}`,
    email,
    "EX",
    300,
    "NX",
  );

  // set cooldown after sending the email
  await redisClient.set(cooldownKey, "true", "EX", 300, "NX");

  // queue the password reset email to be sent
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

const resetPasswordService = async ({ token, newPassword }: IResetPassword) => {
  // hash the token before checking it in redis
  const hashedToken = hashToken(token);

  // check if the token exists in redis
  const email = await redisClient.get(`reset-password:${hashedToken}`);

  if (!email) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  // hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // update the user password in the database
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  // delete the reset token from redis after successful password reset
  await redisClient.del(`reset-password:${hashedToken}`);
  await redisClient.del(`password-reset-cooldown:${email}`);

  return {
    message: "Password reset successful",
  };
};

const changePasswordService = async ({
  userId,
  oldPassword,
  newPassword,
}: IChangePassword) => {
  // check if user exists or not
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      password: true,
    },
  });

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }

  // check if old password is valid or not
  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid old password");
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.password);

  if (isSamePassword) {
    throw new ApiError(
      400,
      "New password must be different from the current password",
    );
  }

  // hash new password
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  // update the new password
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedNewPassword,
    },
  });

  return {
    message: "Password changed successfully",
  };
};

const getMeService = async ({ userId }: { userId: string }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      role: true,
      email: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

export {
  registerUserService,
  resendOtpService,
  verifyEmailService,
  loginUserService,
  forgotPasswordService,
  resetPasswordService,
  changePasswordService,
  getMeService,
};
