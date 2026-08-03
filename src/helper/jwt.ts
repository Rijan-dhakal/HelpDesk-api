import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "../utils/apiError";

interface IGenerateTokenPayload {
  userId: string;
  role: string;
}

const options: SignOptions = {
  expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
};

const generateToken = (payload: IGenerateTokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, options);
};

const verifyToken = (token: string): IGenerateTokenPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as IGenerateTokenPayload;
    return decoded;
  } catch (error) {
    throw new ApiError(401, "Invalid token");
  }
};

export { generateToken, verifyToken };
