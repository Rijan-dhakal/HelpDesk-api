import z from "zod";

const loginSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

const verifyEmailSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  otp: z.string().min(6, { message: "OTP must be at least 6 characters long" }),
});

const registerSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required" }),
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

export { loginSchema, registerSchema, verifyEmailSchema };
