import { injectable, container } from "tsyringe";
import ProductRepository from "../repositories/productRepository";
@injectable()
export default class ProductFactory {
  private storageType: string;
  constructor() {
    this.storageType = process.env.STORAGE_TYPE || "MONGO";
  }
  getRepository() {
    switch (this.storageType) {
      case "MONGO":
        return container.resolve(ProductRepository);
      case "FILE":
        return "FILE";
      case "POSTGRES":
        return "POSTGRES";
      default:
        throw new Error("Invalid storage type");
    }
  }
}
