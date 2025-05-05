// import { injectable, container } from "tsyringe";
// import UserRepository from "../repository/userRepository.js";
// import SellerRepository from "../repository/sellerRepository.js";
// import ProductRepository from "../repository/productRepository.js";
// import OrderRepository from "../repository/orderRepository.js";

// import CategoryRepository from "../repository/categoryRepository.js";
// import CartRepository from "../repository/cartRepository.js";

// @injectable()
// export default class FactoryService {
//   private storageType: string;
//   constructor() {
//     this.storageType = process.env.STORAGE_TYPE || "MONGO";
//   }
//   getRepository(service: string) {
//     switch (service.toUpperCase()) {
//       case "USER":
//         return container.resolve(UserRepository);
//       case "SELLER":
//         return container.resolve(SellerRepository);
//       case "PRODUCT":
//         return container.resolve(ProductRepository);
//       case "ORDER":
//         return container.resolve(OrderRepository);
//       case "CART":
//         return container.resolve(CartRepository);
//       case "CATEGORY":
//         return container.resolve(CategoryRepository);
//     }
//     throw new Error(`Unsupported combination: ${service}, ${this.storageType}`);
//   }
// }
