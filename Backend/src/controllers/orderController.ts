import { RequestHandler } from "express";
import { inject, injectable } from "tsyringe";
import OrderService from "../services/orderServices.js";
import ResponseHandler from "../utils/apiResponse.js";
import logger from "../utils/logger.js";

@injectable()
export default class OrderController {
  constructor(
    @inject(OrderService) private orderService: OrderService,
    @inject(ResponseHandler) private responseHandler: ResponseHandler
  ) {}

  // View all the orders of a user
  public viewUserOrders: RequestHandler = async (req, res, next) => {
    const userid = req.user.id;
    logger.info(`Fetching orders for user with id: ${userid}`);
    try {
      const result = await this.orderService.getUserOrders(userid);
      if (!result) {
        logger.warn(`No orders found for user with id: ${userid}`);
        return this.responseHandler.notFound(res, "No order found");
      }
      logger.info(`Found orders for user with id: ${userid}`);
      return this.responseHandler.success(
        res,
        "Order search successful",
        result
      );
    } catch (err) {
      logger.error(`Error fetching orders for user with id: ${userid}`, err);
      return next(err);
    }
  };

  // View all orders
  public viewWholeOrders: RequestHandler = async (req, res, next) => {
    logger.info("Fetching all orders");
    try {
      const result = await this.orderService.getOrders();
      if (!result) {
        logger.warn("No orders found");
        return this.responseHandler.notFound(res, "No order found");
      }
      logger.info("Orders fetched successfully");
      return this.responseHandler.success(
        res,
        "Order Search Successful",
        result
      );
    } catch (err) {
      logger.error(`Error fetching all orders`, err);
      return next(err);
    }
  };

  // Create a single order
  public createOrder: RequestHandler = async (req, res, next) => {
    const { productid } = req.body;
    const userid = req.user.id;
    logger.info(
      `Creating order for user ${userid} with product id: ${productid}`
    );
    try {
      const result = await this.orderService.addOrder(userid, productid);
      if (!result || Object.keys(result).length === 0) {
        logger.warn(
          `Order creation failed for user ${userid} with product id: ${productid}`
        );
        return this.responseHandler.error(res, "Order creation unsuccessful");
      }
      logger.info(
        `Order created successfully for user ${userid} with product id: ${productid}`
      );
      return this.responseHandler.created(
        res,
        "Order creation successful",
        result
      );
    } catch (err) {
      logger.error(
        `Error creating order for user ${userid} with product id: ${productid}`,
        err
      );
      return next(err);
    }
  };

  // Create order of multiple products
  public createOrders: RequestHandler = async (req, res, next) => {
    const { products } = req.body;
    const userid = req.user.id;
    logger.info(
      `Creating order of multiple products for user ${userid} with products: ${JSON.stringify(
        products
      )}`
    );
    try {
      const result = await this.orderService.addOrders(userid, products);
      if (!result || Object.keys(result).length === 0) {
        logger.warn(
          `Multiple product order creation failed for user ${userid}`
        );
        return this.responseHandler.error(res, "Order creation unsuccessful");
      }
      logger.info(
        `Multiple product order created successfully for user ${userid}`
      );
      return this.responseHandler.created(
        res,
        "Order creation successful",
        result
      );
    } catch (err) {
      logger.error(`Error creating multiple orders for user ${userid}`, err);
      return next(err);
    }
  };

  // View ordered products
  public orderedProducts: RequestHandler = async (req, res, next) => {
    const id = req.user.id;
    logger.info(`Fetching ordered products for user ${id}`);
    try {
      const result = await this.orderService.orderedProducts(id);
      if (!result) {
        logger.warn(`No ordered products found for user ${id}`);
        return this.responseHandler.error(res, "No products found");
      }
      logger.info(`Ordered products fetched successfully for user ${id}`);
      return this.responseHandler.success(res, "Search successful", result);
    } catch (err) {
      logger.error(`Error fetching ordered products for user ${id}`, err);
      return next(err);
    }
  };

  // Update order status
  public updateOrderStatus: RequestHandler = async (req, res, next) => {
    const { orderid, status } = req.body;
    logger.info(`Updating order status for order id: ${orderid} to ${status}`);
    try {
      const result = await this.orderService.updateOrderStatus(orderid, status);
      if (!result || Object.keys(result).length === 0) {
        logger.warn(`Order status update failed for order id: ${orderid}`);
        return this.responseHandler.error(
          res,
          "Order status update unsuccessful"
        );
      }
      logger.info(`Order status updated successfully for order id: ${orderid}`);
      return this.responseHandler.success(
        res,
        "Order status update successful",
        result
      );
    } catch (err) {
      logger.error(`Error updating order status for order id: ${orderid}`, err);
      return next(err);
    }
  };

  // Cancel an entire order
  public cancelWholeOrder: RequestHandler = async (req, res, next) => {
    const { orderid } = req.body;
    logger.info(`Canceling entire order with id: ${orderid}`);
    try {
      const result = await this.orderService.cancelDeliveryOrders(orderid);
      if (!result || Object.keys(result).length === 0) {
        logger.warn(`Order cancellation failed for order id: ${orderid}`);
        return this.responseHandler.error(res, "Order removal unsuccessful");
      }
      logger.info(`Order with id: ${orderid} canceled successfully`);
      return this.responseHandler.success(
        res,
        "Order removal successful",
        result
      );
    } catch (err) {
      logger.error(`Error canceling order with id: ${orderid}`, err);
      return next(err);
    }
  };

  // Cancel a single product in an order
  public cancelSingleOrder: RequestHandler = async (req, res, next) => {
    const { orderid, productid } = req.body;
    logger.info(
      `Canceling product with id: ${productid} in order id: ${orderid}`
    );
    try {
      const result = await this.orderService.cancelDeliveryOrder(
        orderid,
        productid
      );
      if (!result || Object.keys(result).length === 0) {
        logger.warn(
          `Product cancellation failed for product id: ${productid} in order id: ${orderid}`
        );
        return this.responseHandler.error(
          res,
          "Cancellation of a product order unsuccessful"
        );
      }
      logger.info(
        `Product with id: ${productid} canceled successfully in order id: ${orderid}`
      );
      return this.responseHandler.success(
        res,
        "Order of a product canceled successfully",
        result
      );
    } catch (err) {
      logger.error(
        `Error canceling product with id: ${productid} in order id: ${orderid}`,
        err
      );
      return next(err);
    }
  };

  // Return an order
  public returnOrder: RequestHandler = async (req, res, next) => {
    const { orderid, userid, productid, type } = req.body;
    logger.info(
      `Returning order with id: ${orderid} for user ${userid}, product id: ${productid}, type: ${type}`
    );
    try {
      const result = await this.orderService.returnOrder(
        orderid,
        userid,
        productid,
        type
      );
      if (!result) {
        logger.warn(`Order return failed for order id: ${orderid}`);
        return this.responseHandler.error(res, "Return unsuccessful");
      }
      logger.info(`Order with id: ${orderid} returned successfully`);
      return this.responseHandler.success(res, "Return successful", result);
    } catch (err) {
      logger.error(`Error returning order with id: ${orderid}`, err);
      return next(err);
    }
  };

  // Update product status in an order
  public updateProductStatus: RequestHandler = async (req, res, next) => {
    const { orderid, productid, status } = req.body;
    const sellerid = req.user.id;
    logger.info(
      `Updating product status for product id: ${productid} in order id: ${orderid} to ${status}`
    );
    try {
      const result = await this.orderService.updateProductStatus(
        orderid,
        sellerid,
        productid,
        status
      );
      if (!result) {
        logger.warn(
          `Product status update failed for product id: ${productid} in order id: ${orderid}`
        );
        return this.responseHandler.error(
          res,
          "Product status update unsuccessful"
        );
      }
      logger.info(
        `Product status updated successfully for product id: ${productid} in order id: ${orderid}`
      );
      return this.responseHandler.success(
        res,
        "Product status update successful",
        result
      );
    } catch (err) {
      logger.error(
        `Error updating product status for product id: ${productid} in order id: ${orderid}`,
        err
      );
      return next(err);
    }
  };
}
