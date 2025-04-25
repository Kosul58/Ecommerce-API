import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { RequestHandler } from "express";

dotenv.config();

class VerifyToken {
  public verify: RequestHandler = (req, res, next) => {
    let token: string | undefined;
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (typeof authHeader === "string" && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
      if (!token) {
        res.status(401).json({ message: "No token, authorization required" });
      }
      try {
        const secret = process.env.JWT_SECRET_KEY;
        if (!secret) {
          throw new Error("JWT_SECRET_KEY is not defined");
        }
        const decoded = jwt.verify(token, secret);
        // console.log(decoded);
        req.user = decoded;
        next();
      } catch (err) {
        res.status(400).json({ message: "Token is not valid" });
      }
    } else {
      res.status(401).json({ message: "No token, authorization required" });
    }
    return;
  };
}

export default new VerifyToken();
