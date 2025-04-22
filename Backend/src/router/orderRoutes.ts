import express from "express";
import OrderController from "../controllers/orderController.js";

const orderRoutes = express.Router();

orderRoutes.get("/:userid", OrderController.viewOrders);

orderRoutes.post("/", OrderController.createOrder);

orderRoutes.post("/createOrders", OrderController.createOrders);

orderRoutes.put("/", OrderController.updateOrderStatus);

orderRoutes.delete("/cancelWhole", OrderController.cancelWholeOrder);

orderRoutes.delete("/cancelSingle", OrderController.cancelSingleOrder);

export default orderRoutes;
