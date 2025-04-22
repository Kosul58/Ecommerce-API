import { Request, Response, NextFunction, RequestHandler } from "express";

class VerifyRole {
  public verify(...allowedRoles: string[]): RequestHandler {
    return (req, res, next): void => {
      const userRole = req.user.role;
      if (!allowedRoles.includes(userRole)) {
        res.status(403).json({ message: "Access denied" });
        return;
      }
      next();
    };
  }
}

export default new VerifyRole();
