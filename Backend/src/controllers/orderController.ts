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
  public viewUserOrders: RequestHandler = async (req, res, next) => {
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
      return next(err);
    }
  };

  // View all orders
  public viewWholeOrders: RequestHandler = async (req, res, next) => {
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
      return next(err);
    }
  };

  // Create a single order
  public createOrder: RequestHandler = async (req, res, next) => {
    const { userid, productid } = req.body;
    try {
      const result = await this.orderService.addOrder(userid, productid);
      if (!result || Object.keys(result).length === 0) {
        return this.responseHandler.error(res, "Order creation unsuccessful");
      }
      return this.responseHandler.created(
        res,
        "Order creation successful",
        result
      );
    } catch (err) {
      return next(err);
    }
  };

  // Create multiple orders
  public createOrders: RequestHandler = async (req, res, next) => {
    const { userid, products } = req.body;
    try {
      const result = await this.orderService.addOrders(userid, products);
      if (!result || Object.keys(result).length === 0) {
        return this.responseHandler.error(res, "Order creation unsuccessful");
      }
      return this.responseHandler.created(
        res,
        "Order creation successful",
        result
      );
    } catch (err) {
      return next(err);
    }
  };

  // View ordered products
  public orderedProducts: RequestHandler = async (req, res, next) => {
    const id = req.user.id;
    try {
      const result = await this.orderService.orderedProducts(id);
      if (!result) {
        return this.responseHandler.error(res, "No products found");
      }
      return this.responseHandler.success(res, "Search successful", result);
    } catch (err) {
      return next(err);
    }
  };

  // Update order status
  public updateOrderStatus: RequestHandler = async (req, res, next) => {
    const { orderid, status } = req.body;
    try {
      const result = await this.orderService.updateOrderStatus(orderid, status);
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
      return next(err);
    }
  };

  // Cancel an entire order
  public cancelWholeOrder: RequestHandler = async (req, res, next) => {
    const { orderid } = req.body;
    try {
      const result = await this.orderService.cancelDeliveryOrders(orderid);
      if (!result || Object.keys(result).length === 0) {
        return this.responseHandler.error(res, "Order removal unsuccessful");
      }
      return this.responseHandler.success(
        res,
        "Order removal successful",
        result
      );
    } catch (err) {
      return next(err);
    }
  };

  // Cancel a single product in an order
  public cancelSingleOrder: RequestHandler = async (req, res, next) => {
    const { orderid, productid } = req.body;
    try {
      const result = await this.orderService.cancelDeliveryOrder(
        orderid,
        productid
      );
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
      return next(err);
    }
  };

  // Return an order
  public returnOrder: RequestHandler = async (req, res, next) => {
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
      return next(err);
    }
  };

  // Update product status in an order
  public updateProductStatus: RequestHandler = async (req, res, next) => {
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
      return next(err);
    }
  };
}
