import { injectable, container } from "tsyringe";
import SellerRepository from "../repositories/sellerRepository";
@injectable()
export default class SellerFactory {
  private storageType: string;
  constructor() {
    this.storageType = process.env.STORAGE_TYPE || "MONGO";
  }
  getRepository() {
    switch (this.storageType) {
      case "MONGO":
        return container.resolve(SellerRepository);
      case "FILE":
        return "FILE";
      case "POSTGRES":
        return "POSTGRES";
      default:
        throw new Error("Invalid storage type");
    }
  }
}
