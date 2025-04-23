import express from "express";
import OrderController from "../controllers/orderController.js";
import verifyRole from "../middleware/verifyRole.js";
const orderRoutes = express.Router();

orderRoutes.get(
  "/:userid",
  verifyRole.verify("Admin", "User"),
  OrderController.viewOrders
);

orderRoutes.post("/", verifyRole.verify("User"), OrderController.createOrder);

orderRoutes.post(
  "/createOrders",
  verifyRole.verify("User"),
  OrderController.createOrders
);

orderRoutes.put(
  "/",
  verifyRole.verify("Admin"),
  OrderController.updateOrderStatus
);

orderRoutes.put(
  "/product",
  verifyRole.verify("Seller"),
  OrderController.updateProductStatus
);

orderRoutes.delete(
  "/cancelWhole",
  verifyRole.verify("User"),
  OrderController.cancelWholeOrder
);

orderRoutes.delete(
  "/cancelSingle",
  verifyRole.verify("User"),
  OrderController.cancelSingleOrder
);

export default orderRoutes;
