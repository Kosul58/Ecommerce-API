import express from "express";
import OrderController from "../controllers/orderController.js";
import verifyRole from "../middleware/verifyRole.js";
import { container } from "tsyringe";
const orderRoutes = express.Router();

const orderController = container.resolve(OrderController);

orderRoutes.get(
  "/",
  verifyRole.verify("Seller"),
  orderController.orderedProducts
);

orderRoutes.get(
  "/:userid",
  verifyRole.verify("Admin", "User"),
  orderController.viewUserOrders
);
orderRoutes.get(
  "/orders",
  verifyRole.verify("Admin"),
  orderController.viewWholeOrders
);

orderRoutes.post("/", verifyRole.verify("User"), orderController.createOrder);

orderRoutes.post(
  "/createOrders",
  verifyRole.verify("User"),
  orderController.createOrders
);

orderRoutes.put(
  "/",
  verifyRole.verify("Admin"),
  orderController.updateOrderStatus
);

orderRoutes.put(
  "/orderproduct",
  verifyRole.verify("Seller"),
  orderController.updateProductStatus
);

orderRoutes.delete(
  "/cancelWhole",
  verifyRole.verify("User"),
  orderController.cancelWholeOrder
);

orderRoutes.delete(
  "/cancelSingle",
  verifyRole.verify("User"),
  orderController.cancelSingleOrder
);

export default orderRoutes;
