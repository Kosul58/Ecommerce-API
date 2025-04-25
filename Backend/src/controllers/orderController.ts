import { RequestHandler, response } from "express";
import { inject, injectable } from "tsyringe";
import OrderService from "../services/orderServices.js";

@injectable()
export default class OrderController {
  constructor(@inject(OrderService) private orderService: OrderService) {}
  //view all the order of a user
  public viewUserOrders: RequestHandler = async (req, res) => {
    const { userid } = req.params;
    try {
      const result = await this.orderService.getOrder(userid);
      if (!result) {
        res
          .status(404)
          .json({ message: "Error fetching order data", response: [] });
        return;
      }
      res
        .status(200)
        .json({ message: "Order search successful", response: result });
    } catch (err) {
      console.error("Failed to search for orders", err);
      res.status(500).json({ message: "Internal server error", response: [] });
    }
  };
  public viewWholeOrders: RequestHandler = async (req, res) => {
    try {
      const result = await this.orderService.getOrders();
      if (!result) {
        res.status(404).json({ message: "No order found" });
        return;
      }
      res
        .status(200)
        .json({ message: "Order Search Successfull", response: result });
      return;
    } catch (err) {
      res.status(500).json({ message: "Server Error" });
      return;
    }
  };
  public createOrder: RequestHandler = async (req, res) => {
    const { userid, productid } = req.body;
    try {
      // if (!userid) {
      //   res.status(400).json({ message: "Userid required", response: [] });
      //   return;
      // }
      const result = await this.orderService.addOrder(userid, productid);
      if (result === "noproduct") {
        res.status(404).json({ message: "No Product found" });
        return;
      }
      if (!result || Object.keys(result).length === 0) {
        res
          .status(400)
          .json({ message: "Order creation unsuccessful", response: [] });
        return;
      }
      res
        .status(201)
        .json({ message: "Order creation successful", response: result });
    } catch (err) {
      console.error("Failed to create an order of a product", err);
      res.status(500).json({ message: "Internal server error", response: [] });
    }
  };

  public createOrders: RequestHandler = async (req, res) => {
    const { userid, products } = req.body;
    try {
      // if (!userid || products.length < 1) {
      //   res.status(400).json({
      //     message: "Userid and products array required",
      //     response: [],
      //   });
      //   return;
      // }
      const result = await this.orderService.addOrders(userid, products);
      if (!result || Object.keys(result).length === 0) {
        res
          .status(400)
          .json({ message: "Order creation unsuccessful", response: [] });
        return;
      }
      if (result === "noproducts") {
        res
          .status(400)
          .json({ message: "Order creation unsuccessful", response: result });
        return;
      }
      res
        .status(201)
        .json({ message: "Order creation successful", response: result });
    } catch (err) {
      console.error("Failed to create order of multiple products", err);
      res.status(500).json({ message: "Internal server error", response: [] });
    }
  };

  public orderedProducts: RequestHandler = async (req, res) => {
    const id = req.user.id;
    try {
      // if (!id) {
      //   res.status(400).json({ message: "Failed to get id" });
      //   return;
      // }
      const result = await this.orderService.orderedProducts(id);
      if (!result) {
        res.status(400).json({ message: "No products found" });
      }
      res.status(200).json({ message: "Search successfull", response: result });
    } catch (err) {
      res.status(500).json({ message: "Server Error" });
      return;
    }
  };
  public updateOrderStatus: RequestHandler = async (req, res) => {
    const { orderid, userid, status } = req.body;
    try {
      // if (!orderid || !userid || !status) {
      //   res.status(400).json({ message: "Enter all fields", response: [] });
      //   return;
      // }
      const result = await this.orderService.updateOrderStatus(
        orderid,
        userid,
        status
      );
      if (result === "noorder") {
        res.status(400).json({ message: "No order found" });
        return;
      }
      if (!result || Object.keys(result).length === 0) {
        res
          .status(400)
          .json({ message: "Order status update unsuccessful", response: [] });
        return;
      }
      res
        .status(200)
        .json({ message: "Order status update successful", response: result });
    } catch (err) {
      console.error("Failed to update order status", err);
      res.status(500).json({ message: "Internal server error", response: [] });
    }
  };

  public cancelWholeOrder: RequestHandler = async (req, res) => {
    const { orderid } = req.body;
    try {
      // if (!orderid) {
      //   res.status(400).json({ message: "Enter all fields", response: [] });
      //   return;
      // }
      const result = await this.orderService.cancelOrders(orderid);
      if (!result || Object.keys(result).length === 0) {
        res
          .status(400)
          .json({ message: "Order removal unsuccessful", response: [] });
        return;
      }
      res
        .status(200)
        .json({ message: "Order removal successful", response: result });
    } catch (err) {
      console.error("Failed to cancel an order", err);
      res.status(500).json({ message: "Internal server error", response: [] });
    }
  };

  public cancelSingleOrder: RequestHandler = async (req, res) => {
    const { orderid, productid } = req.body;
    try {
      // if (!orderid || !productid) {
      //   res.status(400).json({ message: "Enter all fields", response: [] });
      //   return;
      // }
      const result = await this.orderService.cancelOrder(orderid, productid);
      if (result === "noorder") {
        res.status(400).json({ message: "No order found" });
        return;
      }
      if (result === "noproduct") {
        res.status(400).json({ message: "No product found" });
        return;
      }
      if (!result || Object.keys(result).length === 0) {
        res.status(400).json({
          message: "Cancellation of a product order unsuccessful",
          response: [],
        });
        return;
      }
      res.status(200).json({
        message: "Order of a product canceled successfully",
        response: result,
      });
    } catch (err) {
      console.error("Failed to cancel the order of a product", err);
      res.status(500).json({ message: "Internal server error", response: [] });
    }
  };

  public returnOrder: RequestHandler = async (req, res) => {
    const { orderid, userid, productid, type } = req.body;
    try {
      // if (!orderid || !userid) {
      //   res.status(400).json({ message: "Enter all fields" });
      //   return;
      // }
      const result = await this.orderService.returnOrder(
        orderid,
        userid,
        productid,
        type
      );
      if (!result) {
        res.status(400).json({ message: "Return unsuccessful" });
        return;
      }
      res.status(200).json({ message: "Return successful", response: result });
    } catch (err) {
      console.error("Failed to process ", err);
      res.status(500).json({ message: "Server error" });
    }
  };

  public updateProductStatus: RequestHandler = async (req, res) => {
    const { orderid, productid, status } = req.body;
    const sellerid = req.user.id;
    try {
      // if (!orderid || !productid || !status) {
      //   res.status(400).json({ message: "Enter all fields" });
      //   return;
      // }
      const result = await this.orderService.updateProductStatus(
        orderid,
        sellerid,
        productid,
        status
      );

      if (result === "noproduct") {
        res.status(400).json({ message: "Product not in the order" });
      }
      if (!result) {
        res.status(400).json({ message: "Product status update unsuccessful" });
        return;
      }
      res.status(200).json({
        message: "Product status update successful",
        response: result,
      });
    } catch (err) {
      console.error("Failed to process ", err);
      res.status(500).json({ message: "Server error" });
    }
  };
}
