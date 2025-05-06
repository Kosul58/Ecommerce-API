import { injectable, container } from "tsyringe";
import OrderRepository from "../repositories/orderRepository";
@injectable()
export default class OrderFactory {
  private storageType: string;
  constructor() {
    this.storageType = process.env.STORAGE_TYPE || "MONGO";
  }
  getRepository() {
    switch (this.storageType) {
      case "MONGO":
        return container.resolve(OrderRepository);
      case "FILE":
        return "FILE";
      case "POSTGRES":
        return "POSTGRES";
      default:
        throw new Error("Invalid storage type");
    }
  }
}
