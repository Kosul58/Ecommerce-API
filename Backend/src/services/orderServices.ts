import apiOrderRepository from "../repository/orderRepository.js";
import {
  DeliveryStatus,
  OrderType,
  ReturnStatus,
} from "../common/types/orderType.js";
import { getCurrentDateTimeStamp } from "../utils/utils.js";
import {
  DeliveryOrder,
  ReturnOrder,
  OrderProduct,
} from "../common/types/orderType.js";
import cartServices from "./cartServices.js";
import productServices from "./productServices.js";
import { CartProduct } from "../common/types/cartType.js";

class OrderServices {
  private generateOrder(
    userid: string,
    type: OrderType
  ): DeliveryOrder | ReturnOrder {
    const timestamp = getCurrentDateTimeStamp();
    if (type === OrderType.DELIVERY) {
      return {
        userid,
        timestamp,
        status: DeliveryStatus.PENDING,
        items: [],
        total: 0,
        type: OrderType.DELIVERY,
        deliveryTime: "",
      };
    } else if (type === OrderType.REFUND) {
      return {
        userid,
        timestamp,
        status: ReturnStatus.REQUESTED,
        items: [],
        total: 0,
        type: OrderType.REFUND,
        returnTime: "",
      };
    } else if (type === OrderType.REPLACE) {
      return {
        userid,
        timestamp,
        status: ReturnStatus.REQUESTED,
        items: [],
        total: 0,
        type: OrderType.REPLACE,
        returnTime: "",
      };
    }
    throw new Error("Invalid order type");
  }

  private calcTotal(items: OrderProduct[]): number {
    return items.reduce((a, p) => a + p.price * p.quantity, 0);
  }

  public async getOrder(userid: string) {
    try {
      return await apiOrderRepository.getOrder(userid);
    } catch (err) {
      console.log("Failed to get order data", err);
      throw err;
    }
  }

  private async manageCart(items: CartProduct[], userid: string) {
    if (!items || items.length === 0) return;
    const productIds = items.map((p) => p.productid);
    try {
      await cartServices.removeProducts(userid, productIds);
    } catch (err) {
      console.log("Failed to remove products from cart", err);
      throw err;
    }
  }

  public async addOrder(userid: string, productid: string) {
    try {
      const product = await cartServices.getProductById(productid, userid);
      if (!product) {
        return "noproduct";
      }
      const order = this.generateOrder(userid, OrderType.DELIVERY);
      const productItem: OrderProduct = {
        productid: product.productid,
        sellerid: product.sellerid || "",
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        active: true,
      };
      order.items.push(productItem);
      order.total = this.calcTotal(order.items);
      const data = await apiOrderRepository.addOrder(order);
      await this.manageCart(data.items, userid);
      await this.manageInventory([product] as CartProduct[], "decrease");
      return data;
    } catch (err) {
      console.log("Failed to add order of single product", err);
      throw err;
    }
  }

  public async addOrders(userid: string, products: string[]) {
    try {
      const searchProducts = await cartServices.getProduct(userid);
      if (
        !searchProducts ||
        (Array.isArray(searchProducts.products) &&
          searchProducts.products.length < 1)
      ) {
        return "noproducts";
      }

      const filteredProducts = searchProducts.products.filter((p) =>
        products.includes(p.productid)
      );

      if (!filteredProducts || filteredProducts.length === 0)
        return "noproducts";
      const order = this.generateOrder(userid, OrderType.DELIVERY);

      for (let product of filteredProducts) {
        const productItem: OrderProduct = {
          productid: product.productid,
          sellerid: product.sellerid || "",
          name: product.name,
          price: product.price,
          quantity: product.quantity,
          active: true,
        };
        order.items.push(productItem);
      }

      order.total = this.calcTotal(order.items);

      const data = await apiOrderRepository.addOrders(order);

      await this.manageCart(filteredProducts as CartProduct[], userid);
      await this.manageInventory(filteredProducts as CartProduct[], "decrease");
      return data;
    } catch (err) {
      console.log("Failed to add order of multiple products", err);
      throw err;
    }
  }

  public async updateOrderStatus(
    orderid: string,
    userid: string,
    status: string
  ) {
    try {
      if (
        !Object.values(DeliveryStatus).includes(status as DeliveryStatus) &&
        !Object.values(ReturnStatus).includes(status as ReturnStatus)
      ) {
        throw new Error("Invalid status value provided.");
      }
      const newStatus = status as DeliveryStatus | ReturnStatus;
      return await apiOrderRepository.updateOrderStatus(
        orderid,
        userid,
        newStatus
      );
    } catch (err) {
      console.log("Failed to update order status", err);
      throw err;
    }
  }

  private async manageInventory(
    items: CartProduct[],
    target: "increase" | "decrease"
  ) {
    for (let { productid, quantity } of items) {
      await productServices.modifyInventory(productid, quantity, target);
    }
  }
  public async cancelOrders(orderid: string, userid: string) {
    try {
      const data = await apiOrderRepository.cancelOrders(orderid, userid);
      if (
        data &&
        typeof data === "object" &&
        "result" in data &&
        "modifier" in data
      ) {
        await this.manageInventory(data.modifier, "increase");
        return data.result;
      }
      return data;
    } catch (err) {
      console.log("Failed to remove order", err);
      throw err;
    }
  }

  public async cancelOrder(orderid: string, userid: string, productid: string) {
    try {
      const result = await apiOrderRepository.cancelOrder(
        orderid,
        userid,
        productid
      );

      if (result && typeof result === "object" && "items" in result) {
        const removed = result.items.find(
          (item: any) => item.productid === productid
        );
        if (removed) {
          await this.manageInventory([removed], "increase");
        }
      }
      return result;
    } catch (err) {
      console.log("Failed to remove product from order", err);
      throw err;
    }
  }
  public async returnOrder(
    orderid: string,
    userid: string,
    productid: string,
    type: "REFUND" | "REPLACE"
  ) {
    try {
      if (type === "REFUND") {
        const product = await apiOrderRepository.returnOrder(
          orderid,
          userid,
          productid,
          OrderType.REFUND
        );
        return { orderid, userid, product };
      } else {
        const product = await apiOrderRepository.returnOrder(
          orderid,
          userid,
          productid,
          OrderType.REPLACE
        );
        return { orderid, userid, product };
      }
    } catch (err) {
      throw err;
    }
  }
  public async replaceOrder(userid: string, productid: string) {}
  public async refundOrder(userid: string, productid: string) {}
}

export default new OrderServices();
