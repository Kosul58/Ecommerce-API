import { getCurrentDateTimeStamp } from "../utils/utils.js";

import { Cart, CartProduct } from "../common/types/cartType.js";
import {
  Order,
  OrderType,
  DeliveryStatus,
  ReturnStatus,
  DeliveryOrder,
  ReturnOrder,
  OrderProduct,
} from "../common/types/orderType.js";
import OrderSchema from "../models/Order.js";

class OrderRepository {
  public async getOrder(userid: string) {
    try {
      const orders = await OrderSchema.find({ userid });
      if (!orders || orders.length === 0) return "noorder";
      // const activeItems = orders.flatMap((order) =>
      //   order.items.filter((item) => item.active === true)
      // );
      return orders;
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
  public async cancelOrder(orderid: string, userid: string, productid: string) {
    try {
      const order = await OrderSchema.findOne({ _id: orderid, userid });
      if (!order) return "noorder";

      const product = order.items.find((p: any) => p.productid === productid);

      if (!product) return "noproduct";
      product.active = false;

      const uncanceledProducts = order.items.filter(
        (p) => p.productid !== productid
      );
      if (uncanceledProducts.length === 0) {
        order.status = DeliveryStatus.CANCELED;
      }
      order.markModified("items");
      return await order.save();
    } catch (err) {
      console.log("Failed to remove the order of a product", err);
      throw err;
    }
  }
  public async cancelOrders(orderid: string, userid: string) {
    try {
      const order = await OrderSchema.findOne({ _id: orderid, userid });
      if (!order) return "noorder";
      order.items.forEach((item: any) => {
        item.active = false;
      });
      order.status = DeliveryStatus.CANCELED;
      order.markModified("items");
      const result = await order.save();
      const modifier = order.items;
      return { result, modifier };
    } catch (err) {
      console.log("Failed to remove a order", err);
      throw err;
    }
  }
  public async updateOrderStatus(
    orderid: string,
    userid: string,
    status: DeliveryStatus | ReturnStatus
  ) {
    try {
      const order = await OrderSchema.findById(orderid);
      if (!order) return "noorder";
      order.status = status;
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

export default new OrderRepository();
