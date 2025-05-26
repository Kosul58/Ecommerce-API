import { Request, Response, NextFunction } from "express";
import { container } from "tsyringe";
import AuditService from "../services/auditService";
import logger from "../utils/logger";
interface AuditOptions {
  action: string;
  targetId?: string;
}

const auditService = container.resolve(AuditService);

export const createAudit = ({ action }: AuditOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const params = req.params;
    const body = req.body;
    res.on("finish", async () => {
      try {
        let targetId = "unknown";
        const sourceId: string = req.user?.id || "unknown";
        const method = req.method;
        const status = res.statusCode >= 400 ? "failure" : "success";
        const url = req.originalUrl;
        const role: string = req.user?.role || "unknown";
        const data = { targetId, sourceId, method, status, url, role, action };
        await auditService.createAudit(data, body, params);
        logger.info(
          `[Audit] Finished ${method} ${url} with status ${res.statusCode}`
        );
      } catch (err) {
        logger.error("Audit log failed:", err);
        return next(err);
      }
    });
    next();
  };
};
