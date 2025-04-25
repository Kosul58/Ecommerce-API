import {
  DeliveryOrder,
  ReturnOrder,
  OrderProduct,
  DeliveryStatus,
  OrderProductStatus,
  OrderType,
  ReturnStatus,
} from "../common/types/orderType.js";
import CartService from "./cartServices.js";
import ProductServices from "./productServices.js";
import { CartProduct } from "../common/types/cartType.js";
import { inject, injectable } from "tsyringe";
import OrderRepository from "../repository/orderRepository.js";

@injectable()
export default class OrderService {
  constructor(
    @inject(ProductServices) private productService: ProductServices,
    @inject(CartService) private cartService: CartService,
    @inject(OrderRepository) private orderRepository: OrderRepository
  ) {}
  private generateOrder(
    userid: string,
    type: OrderType
  ): DeliveryOrder | ReturnOrder {
    if (type === OrderType.DELIVERY) {
      return {
        userid,
        status: DeliveryStatus.PENDING,
        items: [],
        total: 0,
        type: OrderType.DELIVERY,
        deliveryTime: "",
      };
    } else if (type === OrderType.REFUND) {
      return {
        userid,
        status: ReturnStatus.REQUESTED,
        items: [],
        total: 0,
        type: OrderType.REFUND,
        returnTime: "",
      };
    } else if (type === OrderType.REPLACE) {
      return {
        userid,
        status: ReturnStatus.REQUESTED,
        items: [],
        total: 0,
        type: OrderType.REPLACE,
        returnTime: "",
      };
    }
    throw new Error("Invalid order type");
  }

  private async generateOrderProduct(
    product: CartProduct
  ): Promise<OrderProduct> {
    const searchProduct = await this.productService.getProductById(
      product.productid
    );
    return {
      productid: product.productid,
      sellerid: product.sellerid,
      name: product.name,
      price: Number(searchProduct?.price),
      quantity: product.quantity,
      active: true,
      status: OrderProductStatus.REQUESTED,
    };
  }

  private calcTotal(items: OrderProduct[]): number {
    return items.reduce((a, p) => a + p.price * p.quantity, 0);
  }

  public async getOrder(userid: string) {
    try {
      return await this.orderRepository.getOrder(userid);
    } catch (err) {
      console.log("Failed to get order data", err);
      throw err;
    }
  }
  public async getOrders() {
    try {
      return await this.orderRepository.getOrders();
    } catch (err) {
      throw err;
    }
  }

  private async manageCart(items: CartProduct[], userid: string) {
    if (!items || items.length === 0) return;
    const productIds = items.map((p) => p.productid);
    try {
      await this.cartService.removeProducts(userid, productIds);
    } catch (err) {
      console.log("Failed to remove products from cart", err);
      throw err;
    }
  }

  public async addOrder(userid: string, productid: string) {
    try {
      const product = await this.cartService.getProductById(productid, userid);
      if (!product) {
        return "noproduct";
      }
      const order = this.generateOrder(userid, OrderType.DELIVERY);
      const productItem = await this.generateOrderProduct(
        product as CartProduct
      );
      order.items.push(productItem);
      order.total = this.calcTotal(order.items);
      const data = await this.orderRepository.addOrder(order);
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
      const searchProducts = await this.cartService.getProduct(userid);
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
        const productItem: OrderProduct = await this.generateOrderProduct(
          product as CartProduct
        );
        order.items.push(productItem);
      }

      order.total = this.calcTotal(order.items);

      const data = await this.orderRepository.addOrders(order);

      await this.manageCart(filteredProducts as CartProduct[], userid);
      await this.manageInventory(filteredProducts as CartProduct[], "decrease");
      return data;
    } catch (err) {
      console.log("Failed to add order of multiple products", err);
      throw err;
    }
  }

  public async orderedProducts(id: string) {
    try {
      const orders = await this.getOrders();
      if (orders.length === 0) return null;
      const sellerProducts = [];

      for (const order of orders) {
        const matchingItems = order.items.filter(
          (item: OrderProduct) => item.sellerid === id
        );
        for (const item of matchingItems) {
          sellerProducts.push({
            orderid: order._id,
            userid: order.userid,
            productid: item.productid,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            status: item.status,
          });
        }
      }

      return sellerProducts;
    } catch (err) {
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
      const order = await this.orderRepository.getOrderById(orderid);
      if (order) {
        if (order.status === "Delivered" || order.status === "Canceled") {
          return null;
        } else if (status === "Confirmed") {
          const products = order.items.filter((p) => p.status === "Accepted");
          if (products.length !== order.items.length) return null;
        } else if (status === "Processing") {
          const products = order.items.filter((p) => p.status === "Ready");
          if (products.length !== order.items.length) return null;
        }
      }
      const newStatus = status as DeliveryStatus | ReturnStatus;
      return await this.orderRepository.updateOrderStatus(
        orderid,
        userid,
        newStatus
      );
    } catch (err) {
      console.log("Failed to update order status", err);
      throw err;
    }
  }
  public async updateProductStatus(
    orderid: string,
    sellerid: string,
    productid: string,
    status: string
  ) {
    try {
      if (
        !Object.values(OrderProductStatus).includes(
          status as OrderProductStatus
        )
      ) {
        throw new Error("Invalid status value provided.");
      }
      const newStatus = status as OrderProductStatus;
      const order = await this.orderRepository.getOrderById(orderid);
      if (order) {
        const product = order.items.find((p) => p.productid === productid);
        if (product && product.sellerid !== sellerid) return null;
      }
      const data = await this.orderRepository.updateProductStatus(
        orderid,
        productid,
        newStatus
      );
      if (typeof data === "object" && status === "Rejected") {
        await this.cancelOrder(orderid, productid);
      }
      return data;
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
      await this.productService.modifyInventory(productid, quantity, target);
    }
  }

  public async cancelOrders(orderid: string) {
    try {
      const data = await this.orderRepository.cancelOrders(orderid);
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

  public async cancelOrder(orderid: string, productid: string) {
    try {
      const result = await this.orderRepository.cancelOrder(orderid, productid);
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
        const product = await this.orderRepository.returnOrder(
          orderid,
          userid,
          productid,
          OrderType.REFUND
        );
        return { orderid, userid, product };
      } else {
        const product = await this.orderRepository.returnOrder(
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
