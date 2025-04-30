import { idText } from "typescript";
import {
  Order,
  OrderType,
  DeliveryStatus,
  ReturnStatus,
  DeliveryOrder,
  ReturnOrder,
  OrderProductStatus,
  OrderDocumnet,
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
      throw err;
    }
  }
  public async getOrderById(orderid: string): Promise<OrderDocumnet | null> {
    try {
      return await OrderSchema.findById(orderid);
    } catch (err) {
      throw err;
    }
  }
  public async addOrder(order: Order) {
    try {
      const newOrder = new OrderSchema(order);
      return newOrder.save();
    } catch (err) {
      throw err;
    }
  }
  public async addOrders(order: Order) {
    try {
      const newOrder = new OrderSchema(order);
      return await newOrder.save();
    } catch (err) {
      throw err;
    }
  }

  // public async saveOrder(order: OrderDocumnet, productIndex: number) {
  //   try {
  //     order.items[productIndex].active = false;
  //     order.markModified("items");
  //     return order.save();
  //   } catch (err) {
  //     throw err;
  //   }
  // }

  public async cancelDeliveryOrder(order: OrderDocumnet, productIndex: number) {
    try {
      order.items[productIndex].active = false;
      order.markModified("items");
      return order.save();
    } catch (err) {
      throw err;
    }
  }
  public async cancelDeliveryOrders(order: OrderDocumnet) {
    try {
      order.markModified("items");
      return await order.save();
    } catch (err) {
      throw err;
    }
  }

  public async updateProductStatus(order: OrderDocumnet) {
    try {
      order.markModified("items");
      return await order.save();
    } catch (err) {
      throw err;
    }
  }
  public async updateOrderStatus(order: OrderDocumnet) {
    try {
      return await order.save();
    } catch (err) {
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
      throw err;
    }
  }
}
