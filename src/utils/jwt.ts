import jwt, { SignOptions } from "jsonwebtoken";

export interface JwtPayload {
  id: string;
  role: "admin" | "manager" | "employee";
}

const JWT_SECRET: string = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ||
  "1d") as SignOptions["expiresIn"];

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
