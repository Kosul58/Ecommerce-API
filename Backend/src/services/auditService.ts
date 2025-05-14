import { inject, injectable } from "tsyringe";
import AuditRepository from "../repositories/auditRepository";

@injectable()
export default class AuditService {
  constructor(
    @inject(AuditRepository) private auditRepository: AuditRepository
  ) {}
  public async createAudit(
    data: {
      targetId: string;
      sourceId: string;
      method: string;
      status: string;
      url: string;
      role: string;
      action: string;
    },
    body: any,
    params: any
  ) {
    try {
      let targetId = data.targetId;
      const { sourceId, method, status, url, role, action } = data;
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
        if (action === "update order status") {
          targetId = body.orderid;
        } else if (action === "update product order status") {
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
      const savedata = {
        path: url,
        action,
        targetId: targetId,
        data: body || "unknown",
        sourceId,
        sourceType: role,
        method,
        status,
      };
      await this.auditRepository.create(savedata);
    } catch (err) {
      throw err;
    }
  }
}
