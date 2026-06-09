import jwt, { SignOptions } from "jsonwebtoken";
import { jwtConfig } from "../config/app.config.js";

export const generateToken = (userId: string): string => {
  const options: SignOptions = { expiresIn: jwtConfig.expiresIn as any };
  return jwt.sign({ userId }, jwtConfig.secret, options);
};

export const verifyToken = (token: string): { userId: string } => {
  return jwt.verify(token, jwtConfig.secret) as { userId: string };
};
