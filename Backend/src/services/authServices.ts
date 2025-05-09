import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { injectable } from "tsyringe";

@injectable()
export default class AuthServices {
  public generateToken = (
    id: string,
    username: string,
    email: string,
    role: any
  ): string => {
    const payload = { id, username, email, role };
    const secretKey = process.env.JWT_SECRET_KEY;
    if (!secretKey) {
      throw new Error(
        "JWT_SECRET_KEY is not defined in the environment variables"
      );
    }
    const options: jwt.SignOptions = { expiresIn: "10h" };
    return jwt.sign(payload, secretKey, options);
  };
}
