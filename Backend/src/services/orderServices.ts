import {
  DeliveryOrder,
  ReturnOrder,
  OrderProduct,
  DeliveryStatus,
  OrderProductStatus,
  OrderType,
  ReturnStatus,
  OrderDocumnet,
  PaymentMethod,
  Order,
} from "../common/types/orderType.js";
import CartService from "./cartServices.js";
import ProductServices from "./productServices.js";
import { CartProduct } from "../common/types/cartType.js";
import { inject, injectable, container } from "tsyringe";
import OrderFactory from "../factories/orderRepositoryFactory.js";
import { OrderRepositoryInterface } from "../common/types/classInterfaces.js";
import logger from "../utils/logger.js";
import SellerServices from "./sellerServices.js";
import EmailService from "./emailService.js";
import UserServices from "./userServices.js";
import { OrderMailData } from "../common/types/mailType.js";

@injectable()
export default class OrderService {
  private orderRepository: OrderRepositoryInterface;
  constructor(
    @inject(OrderFactory) private orderFactory: OrderFactory,
    @inject(ProductServices) private productService: ProductServices,
    @inject(CartService) private cartService: CartService,
    @inject(SellerServices) private sellerService: SellerServices,
    @inject(EmailService) private emailService: EmailService,
    @inject(UserServices) private userService: UserServices
  ) {
    this.orderRepository =
      this.orderFactory.getRepository() as OrderRepositoryInterface;
  }
  private generateOrder(
    userid: string,
    type: OrderType,
    paymentMethod: PaymentMethod
  ): DeliveryOrder | ReturnOrder {
    logger.info(`Generating order for ${userid}`);
    if (type === OrderType.DELIVERY) {
      return {
        userid,
        status: DeliveryStatus.PLACED,
        items: [],
        total: 0,
        type: OrderType.DELIVERY,
        paymentMethod,
        deliveryTime: "",
      };
    } else if (type === OrderType.REFUND) {
      return {
        userid,
        status: ReturnStatus.REQUESTED,
        items: [],
        total: 0,
        type: OrderType.REFUND,
        paymentMethod,
        returnTime: "",
      };
    } else if (type === OrderType.REPLACE) {
      return {
        userid,
        status: ReturnStatus.REQUESTED,
        items: [],
        total: 0,
        type: OrderType.REPLACE,
        paymentMethod,
        returnTime: "",
      };
    }
    const error = new Error("Invalid order type");
    logger.error("Invalid order type");
    (error as any).statusCode = 400;
    throw error;
  }

  private async generateOrderProduct(
    product: CartProduct
  ): Promise<OrderProduct | null> {
    const searchProduct = await this.productService.getProductById(
      product.productid
    );
    if (!searchProduct) {
      const error = new Error("No product found");
      (error as any).statusCode = 404;
      throw error;
    }
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
    const vat: number = 1.13;
    return items.reduce((a, p) => a + p.price * p.quantity, 0) * vat;
  }

  private async returnData(data: any) {
    const orders = [];
    for (let order of data) {
      const myOrder = {
        orderid: order._id?.toString(),
        userid: order.userid,
        items: order.items,
        type: order.type,
        total: order.total,
        status: order.status,
      };
      orders.push(myOrder);
    }
    return orders;
  }

  public async getUserOrders(userid: string) {
    try {
      const userOrders = await this.orderRepository.getUserOrders(userid);
      if (!userOrders || userOrders.length === 0) {
        const error = new Error("No order found");
        (error as any).statusCode = 404;
        throw error;
      }
      return this.returnData(userOrders);
    } catch (err) {
      throw err;
    }
  }
  public async getOrders() {
    try {
      const orders = await this.orderRepository.findAll();
      if (!orders || orders.length === 0) {
        logger.warn("No orders found");
        const error = new Error("No orders found");
        (error as any).statusCode = 404;
        throw error;
      }
      return this.returnData(orders);
    } catch (err) {
      throw err;
    }
  }

  public async getOrder(orderid: string) {
    try {
      const order = await this.orderRepository.findOne(orderid);
      if (!order || Object.keys(order).length === 0) {
        const error = new Error("No order found");
        (error as any).statusCode = 404;
        throw error;
      }
    } catch (err) {
      throw err;
    }
  }

  private async manageCart(items: CartProduct[], userid: string) {
    logger.info("Removing products from cart");
    if (!items || items.length === 0) return;
    const productIds = items.map((p) => p.productid);
    try {
      await this.cartService.removeProducts(userid, productIds);
    } catch (err) {
      throw err;
    }
  }

  public async addOrder(
    userid: string,
    productid: string,
    paymentMethod: PaymentMethod
  ) {
    try {
      const cart = await this.cartService.getCart(userid);
      if (!cart) {
        const error = new Error("No Cart found");
        logger.error("No cart found");
        (error as any).statusCode = 404;
        throw error;
      }
      const product = cart.products.find((p: any) => p.productid === productid);
      if (!product) {
        const error = new Error("No product found in cart");
        logger.error("No product found in the user cart");
        (error as any).statusCode = 404;
        throw error;
      }
      const order = this.generateOrder(
        userid,
        OrderType.DELIVERY,
        paymentMethod
      );
      const productItem = await this.generateOrderProduct(
        product as CartProduct
      );
      if (!productItem) {
        const error = new Error("Product not in product database");
        logger.warn("Product not in product database");
        (error as any).statusCode = 404;
        throw error;
      }
      order.items.push(productItem);
      order.total = parseFloat(this.calcTotal(order.items).toFixed(2));
      const data = await this.orderRepository.create(order);
      if (!data || Object.keys(data).length === 0) {
        const error = new Error("Failed to create order");
        (error as any).statusCode = 500;
        throw error;
      }
      await this.manageCart(data.items, userid);
      await this.manageInventory([product] as CartProduct[], "decrease");
      await this.statusMail(userid, order);
      return "success";
    } catch (err) {
      throw err;
    }
  }

  public async addOrders(
    userid: string,
    products: string[],
    paymentMethod: PaymentMethod
  ) {
    try {
      const searchProducts = await this.cartService.getCart(userid);
      if (
        !searchProducts ||
        (Array.isArray(searchProducts.products) &&
          searchProducts.products.length < 1)
      ) {
        const error = new Error("No products found in the cart");
        (error as any).statusCode = 404;
        throw error;
      }

      const filteredProducts = searchProducts.products.filter((p: any) =>
        products.includes(p.productid)
      );

      if (!filteredProducts || filteredProducts.length === 0) {
        const error = new Error("Products do not match with cart");
        (error as any).statusCode = 404;
        throw error;
      }
      const sellerGroups: { [sellerid: string]: CartProduct[] } = {};
      for (const product of filteredProducts) {
        const sellerid = product.sellerid;
        if (!sellerGroups[sellerid]) {
          sellerGroups[sellerid] = [];
        }
        sellerGroups[sellerid].push(product);
      }
      const allProcessedProducts: CartProduct[] = [];
      const allOrders: Order[] = [];

      for (const sellerid in sellerGroups) {
        const sellerProducts = sellerGroups[sellerid];
        const order = this.generateOrder(
          userid,
          OrderType.DELIVERY,
          paymentMethod
        );

        for (const product of sellerProducts) {
          const productItem = await this.generateOrderProduct(product);
          if (productItem) order.items.push(productItem);
        }
        order.total = parseFloat(this.calcTotal(order.items).toFixed(2));
        allProcessedProducts.push(...sellerProducts);
        allOrders.push(order);
      }
      const data = await this.orderRepository.insertMany(allOrders);
      if (!data || Object.keys(data).length === 0) {
        const error = new Error("Failed to create an order");
        (error as any).statusCode = 500;
        throw error;
      }
      await this.manageCart(allProcessedProducts, userid);
      await this.manageInventory(allProcessedProducts, "decrease");
      for (const order of allOrders) {
        await this.statusMail(userid, order);
      }
      return "success";
    } catch (err) {
      throw err;
    }
  }

  //to find the products of a seller that are being ordered
  public async orderedProducts(id: string) {
    try {
      const orders = await this.orderRepository.findAll();
      if (!orders || orders.length === 0) {
        const error = new Error("No orders found");
        (error as any).statusCode = 404;
        throw error;
      }
      const sellerProducts = [];
      for (const order of orders) {
        const matchingItems = order.items.filter(
          (item: OrderProduct) => item.sellerid === id && item.active === true
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

  public async updateOrderStatus(orderid: string, status: string) {
    try {
      if (
        !Object.values(DeliveryStatus).includes(status as DeliveryStatus) &&
        !Object.values(ReturnStatus).includes(status as ReturnStatus)
      ) {
        const error = new Error("Invalid status value");
        (error as any).statusCode = 400;
        throw error;
      }
      const order = await this.orderRepository.findOne(orderid);
      if (!order || Object.keys(order).length === 0) {
        const error = new Error("No order found");
        (error as any).statusCode = 404;
        throw error;
      }
      if (order) {
        if (
          (order.status === "Delivered" ||
            order.status === "Canceled" ||
            order.status === "Shipped" ||
            order.status === "Ready for delivery" ||
            order.status === "Out for Delivery") &&
          status === "Canceled"
        ) {
          const error = new Error("Order cannot be canceled now");
          (error as any).statusCode = 403;
          throw error;
        }
      }
      const newStatus = status as DeliveryStatus | ReturnStatus;
      order.status = newStatus;
      const result = await this.orderRepository.orderSave(order);
      if (!result || Object.keys(result).length === 0) {
        const error = new Error("Failed to update order status");
        (error as any).statusCode = 400;
        throw error;
      }
      const userid = order.userid;
      if (
        order.status === DeliveryStatus.CONFIRMED ||
        order.status === DeliveryStatus.CANCELED ||
        order.status === DeliveryStatus.DELIVERED
      ) {
        await this.statusMail(userid, order);
      }
      return "success";
    } catch (err) {
      throw err;
    }
  }

  private async statusMail(userid: string, order: any) {
    const user = await this.userService.getUser(userid);
    const data: OrderMailData = {
      username: user.username,
      email: user.email,
      cost: order.total,
      paymentMethod: order.paymentMethod,
      products: order.items.map((p: any) => ({
        name: p.name,
        price: p.price,
        quantity: p.quantity,
      })),
    };
    const emailSent = await this.emailService.orderStatusMail(
      data,
      order.status
    );
    if (!emailSent) {
      logger.warn(`Order placed but email failed to send to ${user.email}`);
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
        const error = new Error("Invalid product status");
        (error as any).statusCode = 400;
        throw error;
      }
      if (status === "Requested") {
        logger.warn("Cannot change staus now");
        const error = new Error("Cannot change status now");
        (error as any).statusCode = 403;
        throw error;
      }
      const newStatus = status as OrderProductStatus;
      const order = await this.orderRepository.findOne(orderid);
      if (!order || !order.items || order.items.length === 0) {
        const error = new Error("No order found");
        (error as any).statusCode = 404;
        throw error;
      }
      const product = order.items.find(
        (p: any) => p.productid === productid && p.sellerid === sellerid
      );
      if (!product) {
        const error = new Error("No product found");
        (error as any).statusCode = 404;
        throw error;
      }
      // if (status === product.status) return "success";
      if (
        (product.status === "Rejected" && status === "Accepted") ||
        (product.status === "Accepted" && status === "Rejected")
      ) {
        logger.warn("Cannot change staus now");
        const error = new Error("Cannot change status now");
        (error as any).statusCode = 403;
        throw error;
      }

      if (product) product.status = newStatus;
      const updatedOrder = await this.orderRepository.orderSave(order);
      if (!updatedOrder || Object.keys(updatedOrder).length === 0) {
        const error = new Error("Failed to update status of a product");
        (error as any).statusCode = 500;
        throw error;
      }
      const totalItems = order.items.length;
      const countByStatus = {
        accepted: 0,
        ready: 0,
        active: 0,
        rejected: 0,
      };
      for (const item of order.items) {
        if (item.status === "Accepted") countByStatus.accepted++;
        if (item.status === "Ready") countByStatus.ready++;
        if (item.active === false) countByStatus.active++;
        if (item.status === "Rejected") countByStatus.rejected++;
      }
      if (countByStatus.accepted === totalItems) {
        await this.updateOrderStatus(orderid, DeliveryStatus.CONFIRMED);
      } else if (countByStatus.ready === totalItems) {
        await this.updateOrderStatus(orderid, DeliveryStatus.PROCESSING);
      } else if (
        countByStatus.active === totalItems ||
        countByStatus.rejected === totalItems
      ) {
        await this.updateOrderStatus(orderid, DeliveryStatus.CANCELED);
      }
      return "success";
    } catch (err) {
      throw err;
    }
  }

  private async manageInventory(
    items: CartProduct[],
    target: "increase" | "decrease"
  ) {
    logger.info("Changing product inventory");
    for (let { productid, quantity } of items) {
      await this.productService.modifyInventory(productid, quantity, target);
    }
  }

  public async cancelDeliveryOrders(orderid: string) {
    try {
      const order = await this.orderRepository.findOne(orderid);
      if (!order || Object.keys(order).length === 0) {
        const error = new Error("No order found");
        (error as any).statusCode = 404;
        throw error;
      }
      order.items.forEach((p: any) => (p.active = false));
      const data = await this.orderRepository.orderSave(order);
      if (!data || Object.keys(data).length === 0) {
        const error = new Error("Failed to cancel order of products");
        (error as any).statusCode = 500;
        throw error;
      }
      await this.manageInventory(data.items, "increase");
      await this.updateOrderStatus(orderid, "Canceled");
      return "success";
    } catch (err) {
      throw err;
    }
  }

  public async cancelDeliveryOrder(orderid: string, productid: string) {
    try {
      const order = await this.orderRepository.findOne(orderid);
      if (!order || Object.keys(order).length === 0) {
        const error = new Error("No order found");
        (error as any).statusCode = 404;
        throw error;
      }
      const productIndex = order.items.findIndex(
        (p: any) => p.productid === productid
      );
      if (productIndex < 0) {
        const error = new Error("No such product in the order");
        (error as any).statusCode = 404;
        throw error;
      }
      const result = await this.orderRepository.cancelDeliveryOrder(
        order,
        productIndex
      );

      if (!result || Object.keys(result).length === 0) {
        const error = new Error("Failed to cancel order of a product");
        (error as any).statusCode = 500;
        throw error;
      }
      const removed = result.items.find(
        (item: any) => item.productid === productid
      );

      if (removed) {
        await this.manageInventory([removed], "increase");
      }
      const remainingItems = result.items.filter((p: any) => p.active === true);
      if (remainingItems.length === 0) {
        await this.updateOrderStatus(orderid, "Canceled");
      }

      return "success";
    } catch (err) {
      logger.error("failed ot cancel a order");
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
