import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { injectable } from "tsyringe";

interface TokenPayload {
  id: string;
  username: string;
  email: string;
  role: any;
}

@injectable()
export default class AuthServices {
  public generateToken = (
    id: string,
    username: string,
    email: string,
    role: any
  ): string => {
    const payload: TokenPayload = { id, username, email, role };
    const secretKey = process.env.JWT_SECRET_KEY;
    if (!secretKey) {
      throw new Error("JWT_SECRET_KEY is not defined in environment variables");
    }
    const options: jwt.SignOptions = { expiresIn: "15min" };
    return jwt.sign(payload, secretKey, options);
  };

  public generateRefreshToken = (
    id: string,
    username: string,
    email: string,
    role: any
  ): string => {
    const payload: TokenPayload = { id, username, email, role };
    const secretKey = process.env.JWT_SECRET_KEY;
    if (!secretKey) {
      throw new Error("JWT_SECRET_KEY is not defined in environment variables");
    }
    const options: jwt.SignOptions = { expiresIn: "7d" };
    return jwt.sign(payload, secretKey, options);
  };

  public verifyRefreshToken = (token: string): TokenPayload | null => {
    const secretKey = process.env.JWT_SECRET_KEY || "";
    try {
      const decoded = jwt.verify(token, secretKey) as JwtPayload;
      const { id, username, email, role } = decoded as TokenPayload;
      if (id && username && email && role !== undefined) {
        return { id, username, email, role };
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  public newAccessToken = (token: string): string | null => {
    const payload = this.verifyRefreshToken(token);
    if (!payload) return null;
    return this.generateToken(
      payload.id,
      payload.username,
      payload.email,
      payload.role
    );
  };
}
