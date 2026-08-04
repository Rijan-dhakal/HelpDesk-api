import type { Request } from "express";

export interface IRegisterUser {
  fullName: string;
  email: string;
  password: string;
}

export interface IVerifyEmail {
  email: string;
  otp: string;
}

export interface ILoginUser {
  email: string;
  password: string;
}

export interface IResetPassword {
  token: string;
  newPassword: string;
}

export interface IChangePassword {
  userId: string;
  oldPassword: string;
  newPassword: string;
}

export interface IParsedData {
  fullName: string;
  email: string;
  password: string;
  otp: string | number;
}

export interface AuthRequest extends Request {
  user: {
    userId: string;
    role: string;
  };
}
