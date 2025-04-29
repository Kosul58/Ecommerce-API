import { RequestHandler } from "express";
import { inject, injectable } from "tsyringe";
import OrderService from "../services/orderServices.js";
import ResponseHandler from "../utils/apiResponse.js";

@injectable()
export default class OrderController {
  constructor(
    @inject(OrderService) private orderService: OrderService,
    @inject(ResponseHandler) private responseHandler: ResponseHandler
  ) {}

  // View all the orders of a user
  public viewUserOrders: RequestHandler = async (req, res) => {
    const { userid } = req.params;
    try {
      const result = await this.orderService.getUserOrders(userid);
      if (!result) {
        return this.responseHandler.notFound(res, "No order found");
      }
      return this.responseHandler.success(
        res,
        "Order search successful",
        result
      );
    } catch (err) {
      console.error("Failed to search for orders", err);
      return this.responseHandler.error(res, "Internal server error");
    }
  };

  // View all orders
  public viewWholeOrders: RequestHandler = async (req, res) => {
    try {
      const result = await this.orderService.getOrders();
      if (!result) {
        return this.responseHandler.notFound(res, "No order found");
      }
      return this.responseHandler.success(
        res,
        "Order Search Successful",
        result
      );
    } catch (err) {
      return this.responseHandler.error(res, "Server Error");
    }
  };

  // Create a single order
  public createOrder: RequestHandler = async (req, res) => {
    const { userid, productid } = req.body;
    try {
      const result = await this.orderService.addOrder(userid, productid);
      if (result === "noproduct") {
        return this.responseHandler.notFound(res, "No Product found");
      }
      if (!result || Object.keys(result).length === 0) {
        return this.responseHandler.error(res, "Order creation unsuccessful");
      }
      return this.responseHandler.created(
        res,
        "Order creation successful",
        result
      );
    } catch (err) {
      console.error("Failed to create an order of a product", err);
      return this.responseHandler.error(res, "Internal server error");
    }
  };

  // Create multiple orders
  public createOrders: RequestHandler = async (req, res) => {
    const { userid, products } = req.body;
    try {
      const result = await this.orderService.addOrders(userid, products);
      if (!result || Object.keys(result).length === 0) {
        return this.responseHandler.error(res, "Order creation unsuccessful");
      }
      if (result === "noproducts") {
        return this.responseHandler.error(res, "No products found");
      }
      return this.responseHandler.created(
        res,
        "Order creation successful",
        result
      );
    } catch (err) {
      console.error("Failed to create orders of multiple products", err);
      return this.responseHandler.error(res, "Internal server error");
    }
  };

  // View ordered products
  public orderedProducts: RequestHandler = async (req, res) => {
    const id = req.user.id;
    try {
      const result = await this.orderService.orderedProducts(id);
      if (!result) {
        return this.responseHandler.error(res, "No products found");
      }
      return this.responseHandler.success(res, "Search successful", result);
    } catch (err) {
      return this.responseHandler.error(res, "Server Error");
    }
  };

  // Update order status
  public updateOrderStatus: RequestHandler = async (req, res) => {
    const { orderid, status } = req.body;
    try {
      const result = await this.orderService.updateOrderStatus(orderid, status);
      if (result === "noorder") {
        return this.responseHandler.error(res, "No order found");
      }
      if (!result || Object.keys(result).length === 0) {
        return this.responseHandler.error(
          res,
          "Order status update unsuccessful"
        );
      }
      return this.responseHandler.success(
        res,
        "Order status update successful",
        result
      );
    } catch (err) {
      console.error("Failed to update order status", err);
      return this.responseHandler.error(res, "Internal server error");
    }
  };

  // Cancel an entire order
  public cancelWholeOrder: RequestHandler = async (req, res) => {
    const { orderid } = req.body;
    try {
      const result = await this.orderService.cancelDeliveryOrders(orderid);
      if (result === "noorder") {
        return this.responseHandler.notFound(res, "No order found");
      }
      if (!result || Object.keys(result).length === 0) {
        return this.responseHandler.error(res, "Order removal unsuccessful");
      }
      return this.responseHandler.success(
        res,
        "Order removal successful",
        result
      );
    } catch (err) {
      console.error("Failed to cancel an order", err);
      return this.responseHandler.error(res, "Internal server error");
    }
  };

  // Cancel a single product in an order
  public cancelSingleOrder: RequestHandler = async (req, res) => {
    const { orderid, productid } = req.body;
    try {
      const result = await this.orderService.cancelDeliveryOrder(
        orderid,
        productid
      );
      if (result === "noorder") {
        return this.responseHandler.error(res, "No order found");
      }
      if (!result || Object.keys(result).length === 0) {
        return this.responseHandler.error(
          res,
          "Cancellation of a product order unsuccessful"
        );
      }
      return this.responseHandler.success(
        res,
        "Order of a product canceled successfully",
        result
      );
    } catch (err) {
      console.error("Failed to cancel the order of a product", err);
      return this.responseHandler.error(res, "Internal server error");
    }
  };

  // Return an order
  public returnOrder: RequestHandler = async (req, res) => {
    const { orderid, userid, productid, type } = req.body;
    try {
      const result = await this.orderService.returnOrder(
        orderid,
        userid,
        productid,
        type
      );
      if (!result) {
        return this.responseHandler.error(res, "Return unsuccessful");
      }
      return this.responseHandler.success(res, "Return successful", result);
    } catch (err) {
      console.error("Failed to process return", err);
      return this.responseHandler.error(res, "Server error");
    }
  };

  // Update product status in an order
  public updateProductStatus: RequestHandler = async (req, res) => {
    const { orderid, productid, status } = req.body;
    const sellerid = req.user.id;
    try {
      const result = await this.orderService.updateProductStatus(
        orderid,
        sellerid,
        productid,
        status
      );
      if (!result) {
        return this.responseHandler.error(
          res,
          "Product status update unsuccessful"
        );
      }
      return this.responseHandler.success(
        res,
        "Product status update successful",
        result
      );
    } catch (err) {
      console.error("Failed to process product status update", err);
      return this.responseHandler.error(res, "Server error");
    }
  };
}
