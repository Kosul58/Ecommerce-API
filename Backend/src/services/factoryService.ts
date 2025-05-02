import { injectable, container } from "tsyringe";
import UserRepository from "../repository/userRepository.js";
import SellerRepository from "../repository/sellerRepository.js";
import ProductRepository from "../repository/productRepository.js";
import OrderRepository from "../repository/orderRepository.js";

import CategoryRepository from "../repository/categoryRepository.js";
import CartRepository from "../repository/cartRepository.js";

@injectable()
export default class FactoryService {
  private storageType: string;

  constructor() {
    this.storageType = process.env.STORAGE_TYPE || "MONGO";
  }

  getRepository(service: string) {
    switch (service.toUpperCase()) {
      case "USER":
        if (this.storageType === "MONGO")
          return container.resolve(UserRepository);
        break;
      case "SELLER":
        if (this.storageType === "MONGO")
          return container.resolve(SellerRepository);
        break;
      case "PRODUCT":
        if (this.storageType === "MONGO")
          return container.resolve(ProductRepository);
        break;
      case "ORDER":
        if (this.storageType === "MONGO")
          return container.resolve(OrderRepository);
        break;
      case "CART":
        if (this.storageType === "MONGO")
          return container.resolve(CartRepository);
        break;
      case "CATEGORY":
        if (this.storageType === "MONGO")
          return container.resolve(CategoryRepository);
        break;
    }
    throw new Error(`Unsupported combination: ${service}, ${this.storageType}`);
  }
}
