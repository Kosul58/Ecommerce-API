import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

class AuthServices {
  public generateToken = (
    username: string,
    email: string,
    role: any
  ): string => {
    const payload = { username, email, role };
    const secretKey = process.env.JWT_SECRET_KEY;
    if (!secretKey) {
      throw new Error(
        "JWT_SECRET_KEY is not defined in the environment variables"
      );
    }
    const options: jwt.SignOptions = { expiresIn: "1h" };
    return jwt.sign(payload, secretKey, options);
  };
}

export default new AuthServices();
