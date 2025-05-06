import { injectable, container } from "tsyringe";
import UserRepository from "../repositories/userRepository.js";
import SellerRepository from "../repositories/sellerRepository.js";
import ProductRepository from "../repositories/productRepository.js";
import OrderRepository from "../repositories/orderRepository.js";

import CategoryRepository from "../repositories/categoryRepository.js";
import CartRepository from "../repositories/cartRepository.js";

@injectable()
export default class FactoryService {
  private storageType: string;
  constructor() {
    this.storageType = process.env.STORAGE_TYPE || "MONGO";
  }
  getRepository(service: string) {
    switch (service.toUpperCase()) {
      case "USER":
        return container.resolve(UserRepository);
      case "SELLER":
        return container.resolve(SellerRepository);
      case "PRODUCT":
        return container.resolve(ProductRepository);
      case "ORDER":
        return container.resolve(OrderRepository);
      case "CART":
        return container.resolve(CartRepository);
      case "CATEGORY":
        return container.resolve(CategoryRepository);
    }
    throw new Error(`Unsupported combination: ${service}, ${this.storageType}`);
  }
}
