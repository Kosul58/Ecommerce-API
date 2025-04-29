import express from "express";
import OrderController from "../controllers/orderController.js";
import verifyRole from "../middleware/verifyRole.js";
import { container } from "tsyringe";
import DataValidation from "../middleware/validateData.js";
import { idSchema } from "../validation/userSchema.js";
import {
  cancelSingleSchema,
  cancelWholeSchema,
  orderParamsSchema,
  orderSchema,
  ordersSchema,
  orderStatusSchema,
  productStatusSchema,
} from "../validation/orderSchema.js";
const orderRoutes = express.Router();

const orderController = container.resolve(OrderController);
const dataValidation = container.resolve(DataValidation);
orderRoutes.get(
  "/",
  verifyRole.verify("Seller"),
  dataValidation.validateTokenData(idSchema),
  orderController.orderedProducts
);

orderRoutes.get(
  "/:userid",
  verifyRole.verify("Admin", "User"),
  dataValidation.validateParams(orderParamsSchema),
  orderController.viewUserOrders
);
orderRoutes.get(
  "/orders",
  verifyRole.verify("Admin"),
  dataValidation.validateTokenData(idSchema),
  orderController.viewWholeOrders
);

orderRoutes.post(
  "/",
  verifyRole.verify("User"),
  dataValidation.validateTokenData(idSchema),
  dataValidation.validateBody(orderSchema),
  orderController.createOrder
);

orderRoutes.post(
  "/createOrders",
  verifyRole.verify("User"),
  dataValidation.validateTokenData(idSchema),
  dataValidation.validateBody(ordersSchema),
  orderController.createOrders
);

orderRoutes.put(
  "/",
  verifyRole.verify("Admin"),
  dataValidation.validateTokenData(idSchema),
  dataValidation.validateBody(orderStatusSchema),
  orderController.updateOrderStatus
);

orderRoutes.put(
  "/orderproduct",
  verifyRole.verify("Seller"),
  dataValidation.validateTokenData(idSchema),
  dataValidation.validateBody(productStatusSchema),
  orderController.updateProductStatus
);

orderRoutes.delete(
  "/cancelWhole",
  verifyRole.verify("User"),
  dataValidation.validateTokenData(idSchema),
  dataValidation.validateBody(cancelWholeSchema),
  orderController.cancelWholeOrder
);

orderRoutes.delete(
  "/cancelSingle",
  verifyRole.verify("User"),
  dataValidation.validateBody(cancelSingleSchema),
  orderController.cancelSingleOrder
);

export default orderRoutes;
