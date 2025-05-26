import express from "express";
import OrderController from "../controllers/orderController";
import verifyRole from "../middlewares/verifyRole";
import { container } from "tsyringe";
import DataValidation from "../middlewares/validateData";
import { idSchema } from "../validation/userSchema";
import {
  cancelSingleSchema,
  cancelWholeSchema,
  orderParamsSchema,
  orderSchema,
  ordersSchema,
  orderStatusSchema,
  productStatusSchema,
} from "../validation/orderSchema";
import { createAudit } from "../middlewares/auditMiddleware";

const orderRoutes = express.Router();

const orderController = container.resolve(OrderController);
const dataValidation = container.resolve(DataValidation);

// READ ROUTES
orderRoutes.get(
  "/",
  verifyRole.verify("Seller"),
  dataValidation.validateTokenData(idSchema),
  orderController.orderedProducts
);

orderRoutes.get(
  "/user",
  verifyRole.verify("User"),
  dataValidation.validateTokenData(idSchema),
  orderController.viewUserOrders
);

orderRoutes.get(
  "/orders",
  verifyRole.verify("Admin"),
  dataValidation.validateTokenData(idSchema),
  orderController.viewWholeOrders
);

// CREATE
orderRoutes.post(
  "/",
  verifyRole.verify("User"),
  dataValidation.validateTokenData(idSchema),
  dataValidation.validateBody(orderSchema),
  createAudit({ action: "create order" }),
  orderController.createOrder
);

orderRoutes.post(
  "/createOrders",
  verifyRole.verify("User"),
  dataValidation.validateTokenData(idSchema),
  dataValidation.validateBody(ordersSchema),
  createAudit({ action: "create bulk orders" }),
  orderController.createOrders
);

// UPDATE
orderRoutes.put(
  "/",
  verifyRole.verify("Admin"),
  dataValidation.validateTokenData(idSchema),
  dataValidation.validateBody(orderStatusSchema),
  createAudit({ action: "update order status" }),
  orderController.updateOrderStatus
);

orderRoutes.put(
  "/orderdata",
  verifyRole.verify("Seller"),
  dataValidation.validateTokenData(idSchema),
  dataValidation.validateBody(productStatusSchema),
  createAudit({ action: "update product order status" }),
  orderController.updateProductStatus
);

// DELETE
orderRoutes.delete(
  "/cancelWhole",
  verifyRole.verify("User"),
  dataValidation.validateTokenData(idSchema),
  dataValidation.validateBody(cancelWholeSchema),
  createAudit({ action: "cancel whole order" }),
  orderController.cancelWholeOrder
);

orderRoutes.delete(
  "/cancelSingle",
  verifyRole.verify("User"),
  dataValidation.validateBody(cancelSingleSchema),
  createAudit({ action: "cancel single item in order" }),
  orderController.cancelSingleOrder
);

export default orderRoutes;
