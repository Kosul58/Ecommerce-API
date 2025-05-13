import { Request, Response, NextFunction } from "express";
import AuditSchema from "../models/audit.js";

interface AuditOptions {
  action: string;
  targetId?: string;
}

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

        if (url.includes("user") || url.includes("seller")) {
          if (action.includes("user") || action.includes("seller")) {
            targetId = sourceId;
          }
        }

        if (url.includes("product")) {
          if (action === "update product status") {
            targetId = body.products;
          } else if (action === "update product") {
            targetId = params.productid;
          } else if (action === "modify product inventory") {
            targetId = params.productid;
          } else if (action === "delete a product") {
            targetId = params.productid;
          } else if (action === "delete all products") {
            targetId = "all seller products";
          }
        } else if (url.includes("order")) {
          console.log("x");
          if (action === "update order status") {
            targetId = body.orderid;
          } else if (action === "update product order status") {
            console.log(body);
            targetId = body.productid;
          } else if (action === "cancel whole order") {
            targetId = body.orderid;
          } else if (action === "cancel single item in order") {
            targetId = body.productid;
          }
        } else if (url.includes("category")) {
          if (action === "update category status") {
            targetId = body.categoryid;
          } else if (action === "update category") {
            targetId = params.categoryid;
          } else if (action === "delete category") {
            targetId = params.categoryid;
          }
        } else if (url.includes("cart")) {
          if (action === "update cart") {
            targetId = body.productid;
          } else if (action === "remove from cart") {
            targetId = params.productid;
          } else if (action === "remove multiple from cart") {
            targetId = body.products;
          } else if (action === "add to cart") {
            targetId = sourceId;
          }
        }
        const audit = new AuditSchema({
          path: url,
          action,
          targetId: targetId || "unknown",
          data: body || "unknown",
          sourceId,
          sourceType: req.user?.role || "unknown",
          method,
          status,
          timestamp: new Date(),
        });

        await audit.save();
        // console.log(
        //   `[Audit] Finished ${method} ${url} with status ${res.statusCode}`
        // );
      } catch (err) {
        // console.error("Audit log failed:", err);
      }
    });

    next();
  };
};
