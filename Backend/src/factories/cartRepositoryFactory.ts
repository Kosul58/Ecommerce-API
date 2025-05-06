import { injectable, container } from "tsyringe";
import UserRepository from "../repositories/userRepository";
import CartRepository from "../repositories/cartRepository";
@injectable()
export default class CartFactory {
  private storageType: string;
  constructor() {
    this.storageType = process.env.STORAGE_TYPE || "MONGO";
  }
  getRepository() {
    switch (this.storageType) {
      case "MONGO":
        return container.resolve(CartRepository);
      case "FILE":
        return "FILE";
      case "POSTGRES":
        return "POSTGRES";
      default:
        throw new Error("Invalid storage type");
    }
  }
}
