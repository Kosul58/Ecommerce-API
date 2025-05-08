import { Request, Response, NextFunction } from "express";
import AuditSchema from "../models/audit.js";

interface AuditOptions {
  action: string;
  targetId?: string;
}
export const createAudit = ({ action, targetId }: AuditOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id || "unkown";
      const data: Record<string, any> = {
        body: req.body,
      };
      const audit = new AuditSchema({
        path: req.path,
        action,
        targetId: targetId || req.params.id || "unknown",
        data,
        userId,
      });
      await audit.save();
    } catch (err) {
      console.error("Audit log failed:", err);
    }
    next();
  };
};
