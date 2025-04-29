import {
  Order,
  OrderType,
  DeliveryStatus,
  ReturnStatus,
  DeliveryOrder,
  ReturnOrder,
  OrderProductStatus,
} from "../common/types/orderType.js";
import OrderSchema from "../models/order.js";
import { injectable } from "tsyringe";

@injectable()
export default class OrderRepository {
  public async getOrders() {
    try {
      return await OrderSchema.find();
    } catch (err) {
      throw err;
    }
  }
  public async getUserOrders(userid: string) {
    try {
      return await OrderSchema.find({ userid });
    } catch (err) {
      console.log("Failed to search orders of user", err);
      throw err;
    }
  }
  public async getOrderById(orderid: string) {
    try {
      return await OrderSchema.findById(orderid);
    } catch (err) {
      console.log("Failed to search orders of user", err);
      throw err;
    }
  }
  public async addOrder(order: Order) {
    try {
      const newOrder = new OrderSchema(order);
      return newOrder.save();
    } catch (err) {
      console.log("Failed to add order for user", err);
      throw err;
    }
  }
  public async addOrders(order: Order) {
    try {
      const newOrder = new OrderSchema(order);
      return await newOrder.save();
    } catch (err) {
      console.log("Failed to add order", err);
      throw err;
    }
  }
  public async cancelDeliveryOrder(orderid: string, productid: string) {
    try {
      const order = await OrderSchema.findOne({ _id: orderid });
      if (!order) return;
      const product = order.items.find((p: any) => p.productid === productid);
      if (!product) return;
      product.active = false;
      order.markModified("items");
      return await order.save();
    } catch (err) {
      console.log("Failed to remove the order of a product", err);
      throw err;
    }
  }
  public async cancelDeliveryOrders(orderid: string) {
    try {
      const order = await OrderSchema.findOne({ _id: orderid });
      if (!order) return;
      order.items.forEach((item: any) => {
        item.active = false;
      });
      order.markModified("items");
      return await order.save();
    } catch (err) {
      console.log("Failed to remove a order", err);
      throw err;
    }
  }

  public async updateOrderStatus(
    orderid: string,
    status: DeliveryStatus | ReturnStatus
  ) {
    try {
      const order = await OrderSchema.findById(orderid);
      if (!order) return;
      order.status = status;
      return order.save();
    } catch (err) {
      console.log("Failed to update order status", err);
      throw err;
    }
  }
  public async updateProductStatus(
    orderid: string,
    productid: string,
    status: OrderProductStatus
  ) {
    try {
      const order = await OrderSchema.findById(orderid);
      if (!order) return;
      const product = order.items.find(
        (i) =>
          i.productid === productid &&
          i.active === true &&
          i.status !== "Rejected"
      );
      if (product) {
        product.status = status;
      } else {
        return;
      }
      order.markModified("items");
      return order.save();
    } catch (err) {
      console.log("Failed to update order status", err);
      throw err;
    }
  }

  public async returnOrder(
    orderid: string,
    userid: string,
    productid: string,
    type: OrderType.REFUND | OrderType.REPLACE
  ) {
    try {
      // const order = await OrderSchema.findOne({ _id: orderid, userid });
      // const product = order?.items.find((p) => p.productid === productid);
      // const returnOrder = this.generateOrder(userid, type);
      // return { orderid, usserid, product };
    } catch (err) {
      console.log("Failed to return a order");
      throw err;
    }
  }
}
