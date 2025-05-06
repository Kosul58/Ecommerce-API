import { injectable, container } from "tsyringe";
import UserRepository from "../repositories/userRepository";
@injectable()
export default class UserFactory {
  private storageType: string;
  constructor() {
    this.storageType = process.env.STORAGE_TYPE || "MONGO";
  }
  getRepository() {
    switch (this.storageType) {
      case "MONGO":
        return container.resolve(UserRepository);
      case "FILE":
        return "FILE";
      case "POSTGRES":
        return "POSTGRES";
      default:
        throw new Error("Invalid storage type");
    }
  }
}
