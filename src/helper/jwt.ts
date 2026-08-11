import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "../utils/apiError";

interface IGenerateTokenPayload {
  userId: string;
  role: string;
}

const accessTokenOptions: SignOptions = {
  expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
};

const generateAccessToken = (payload: IGenerateTokenPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, accessTokenOptions);
};

const refreshTokenOptions: SignOptions = {
  expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
};

const generateRefreshToken = (payload: IGenerateTokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, refreshTokenOptions);
};

const verifyToken = (token: string): IGenerateTokenPayload => {
  try {
    const decoded = jwt.verify(
      token,
      env.JWT_ACCESS_SECRET,
    ) as IGenerateTokenPayload;
    return decoded;
  } catch (error) {
    throw new ApiError(401, "Invalid token");
  }
};

export { generateAccessToken, generateRefreshToken, verifyToken };
