import { Request, Response, NextFunction } from "express";
import AuditSchema from "../models/audit.js";

interface AuditOptions {
  action: string;
  targetId?: string;
}

export const createAudit = ({ action, targetId }: AuditOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    res.on("finish", async () => {
      try {
        console.log(req.user.id);
        const userId: string = req.user?.id || "unknown";
        const method = req.method;
        const status = res.statusCode >= 400 ? "failure" : "success";
        if (
          req.originalUrl.includes("user") ||
          req.originalUrl.includes("seller")
        ) {
          if (action.includes("user") || action.includes("seller")) {
            targetId = userId;
          }
        }
        switch (true) {
          case req.originalUrl.includes("product"):
            switch (true) {
              case action === "update product status":
                targetId = req.body.products;
                break;
              case action === "update product" ||
                action === "modify product inventory":
                targetId = req.params.productid;
                break;
              case action === "delete all products":
                targetId = "all seller products";
                break;
              case action === "delete a product":
                targetId === req.params.productid;
                break;
            }
            break;
          case req.originalUrl.includes("order"):
            switch (true) {
              case action === "update order status":
                targetId = req.body.orderid;
                break;
              case action === "update product order status":
                targetId = req.body.orderid;
                break;
              case action === "cancel whole order":
                targetId = req.body.orderid;
                break;
              case action === "cancel single item in order":
                targetId === req.body.productid;
                break;
            }
            break;
          case req.originalUrl.includes("category"):
            switch (true) {
              case action === "update category status":
                targetId = req.body.categoryid;
                break;
              case action === "update category":
                targetId = req.params.categoryid;
                break;
              case action === "delete category":
                targetId = req.params.categoryid;
                break;
            }
            break;
          case req.originalUrl.includes("cart"):
            switch (true) {
              case action === "update cart":
                targetId = req.body.productid;
                break;
              case action === "remove from cart":
                targetId = req.params.productid;
                break;
              case action === "remove multiple from cart":
                targetId = req.body.products;
                break;
            }
            break;
        }
        const audit = new AuditSchema({
          path: req.originalUrl,
          action,
          targetId: targetId || req.params.id || "unknown",
          data: req.body || "unknown",
          userId,
          userType: req.user.role || "unkown",
          method,
          status,
          timestamp: new Date(),
        });
        await audit.save();
        console.log(
          `[Audit] Finished ${req.method} ${req.originalUrl} with status ${res.statusCode}`
        );
      } catch (err) {
        console.error("Audit log failed:", err);
      }
    });
    next();
  };
};

// //user part
// if (req.originalUrl.includes("user")) {
//   if (action.includes("user")) {
//     targetId = userId;
//   }
// }
// //seller part
// if (req.originalUrl.includes("seller")) {
//   if (action.includes("seller")) {
//     targetId = userId;
//   }
// }
// //product part
// if (req.originalUrl.includes("product")) {
//   if (action === "update product status") {
//     targetId = req.body.products;
//   } else if (
//     action === "update product" ||
//     action === "modify product inventory"
//   ) {
//     targetId = req.params.productid;
//   } else if (action === "delete all products") {
//     targetId = "all seller products";
//   } else if (action === "delete a product") {
//     targetId === req.params.productid;
//   }
// }

// //order part
// if (req.originalUrl.includes("order")) {
//   if (action === "update order status") {
//     targetId = req.body.orderid;
//   } else if (action === "update product order status") {
//     targetId = req.body.orderid;
//   } else if (action === "cancel whole order") {
//     targetId = req.body.orderid;
//   } else if (action === "cancel single item in order") {
//     targetId === req.body.productid;
//   }
// }
// //cart part
// if (req.originalUrl.includes("cart")) {
//   if (action === "update cart") {
//     targetId = req.body.productid;
//   } else if (action === "remove from cart") {
//     targetId = req.params.productid;
//   } else if (action === "remove multiple from cart") {
//     targetId = req.body.products;
//   }
// }
// //category part
// if (req.originalUrl.includes("category")) {
//   if (action === "update category status") {
//     targetId = req.body.categoryid;
//   } else if (action === "update category") {
//     targetId = req.params.categoryid;
//   } else if (action === "delete category") {
//     targetId = req.params.categoryid;
//   }
// }
