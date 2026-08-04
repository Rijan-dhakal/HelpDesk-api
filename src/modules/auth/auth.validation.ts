import z from "zod";

const loginSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

const verifyEmailSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  otp: z.union([
    z.string().length(6, { message: "OTP must be 6 characters long" }),
    z
      .number()
      .int()
      .min(100000, { message: "OTP must be a 6 characters long" })
      .max(999999, { message: "OTP must be a 6 characters long" }),
  ]),
});

const registerSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required" }),
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

const resendOtpSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
});

const forgotPasswordSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
});

const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

const resetPasswordQuerySchema = z.object({
  token: z.string().min(1, { message: "Token is required" }),
});

const changePasswordSchema = z.object({
  oldPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
  newPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

export {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resetPasswordQuerySchema,
  changePasswordSchema,
};
