import { Order, OrderType, OrderDocumnet } from "../common/types/orderType";
import OrderSchema from "../models/order";
import { injectable } from "tsyringe";
import {
  Repository,
  OrderRepositoryInterface,
} from "../common/types/classInterfaces";
import { BaseRepository } from "./baseRepository";

@injectable()
export default class OrderRepository
  extends BaseRepository
  implements OrderRepositoryInterface
{
  constructor() {
    super(OrderSchema);
  }

  public async getSellerOrders() {
    try {
      return await this.model.find({
        status: { $nin: ["Canceled", "Delivered"] },
      });
    } catch (err) {
      throw err;
    }
  }

  public async getUserOrders(userid: string) {
    try {
      return await this.model.find({ userid });
    } catch (err) {
      throw err;
    }
  }

  public async cancelDeliveryOrder(order: OrderDocumnet, productids: string[]) {
    try {
      order.items.forEach((item) => {
        if (productids.includes(item.productid) && item.active !== false) {
          item.active = false;
        }
      });
      order.markModified("items");
      return await order.save();
    } catch (err) {
      throw err;
    }
  }

  public async orderSave(order: OrderDocumnet) {
    try {
      order.markModified("items");
      return await order.save();
    } catch (err) {
      throw err;
    }
  }

  public async insertMany(orders: any) {
    try {
      return await this.model.insertMany(orders);
    } catch (err) {
      throw err;
    }
  }

  // public async cancelDeliveryOrders(order: OrderDocumnet) {
  //   try {
  //     order.markModified("items");
  //     return await order.save();
  //   } catch (err) {
  //     throw err;
  //   }
  // }

  // public async updateProductStatus(order: OrderDocumnet) {
  //   try {
  //     order.markModified("items");
  //     return await order.save();
  //   } catch (err) {
  //     throw err;
  //   }
  // }

  // public async updateOrderStatus(order: OrderDocumnet) {
  //   try {
  //     return await order.save();
  //   } catch (err) {
  //     throw err;
  //   }
  // }

  public async returnOrder(
    orderid: string,
    userid: string,
    productid: string,
    type: OrderType.REFUND | OrderType.REPLACE
  ) {
    try {
      // const order = await this.model.findOne({ _id: orderid, userid });
      // const product = order?.items.find((p) => p.productid === productid);
      // return { order, product, type };
      throw new Error("returnOrder not implemented yet.");
    } catch (err) {
      throw err;
    }
  }
}
