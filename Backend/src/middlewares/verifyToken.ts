import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { RequestHandler } from "express";
import logger from "../utils/logger";
dotenv.config();

class VerifyToken {
  public verify: RequestHandler = (req, res, next) => {
    let token: string | undefined;
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (typeof authHeader === "string" && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
      if (!token) {
        logger.warn("No token provided in the authorization header");
        res.status(401).json({ message: "No token, authorization required" });
      }
      try {
        const secret = process.env.JWT_SECRET_KEY;
        if (!secret) {
          throw new Error("JWT_SECRET_KEY is not defined");
        }
        logger.info(
          `Verifying token for user, Token: ${
            token ? "present" : "not present"
          }`
        );
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        logger.info(`Token verified successfully for user: ${decoded}`);
        next();
      } catch (err) {
        logger.error("Invalid token or verification failed", err);
        res.status(400).json({ message: "Token is not valid" });
      }
    } else {
      logger.warn("Authorization header is missing or malformed");
      res.status(401).json({ message: "No token, authorization required" });
    }
    return;
  };
}

export default new VerifyToken();
