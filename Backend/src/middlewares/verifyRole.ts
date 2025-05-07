import { RequestHandler } from "express";
import logger from "../utils/logger"; // Import your logger

class VerifyRole {
  public verify(...allowedRoles: string[]): RequestHandler {
    return (req, res, next): void => {
      const userRole = req.user.role;
      logger.info(`Checking role for user: ${req.user.id}, Role: ${userRole}`);
      if (!allowedRoles.includes(userRole)) {
        logger.warn(
          `Access denied for user: ${
            req.user.id
          }, Role: ${userRole}. Required roles: ${allowedRoles.join(", ")}`
        );
        res.status(403).json({ message: "Access denied" });
        return;
      }
      logger.info(`Access granted for user: ${req.user.id}, Role: ${userRole}`);
      next();
    };
  }
}

export default new VerifyRole();
