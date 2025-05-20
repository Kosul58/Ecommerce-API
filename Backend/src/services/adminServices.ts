import { inject, injectable, container } from "tsyringe";
import {
  AddUser,
  UpdateUser,
  User,
  UserReturn,
  UserRole,
} from "../common/types/userType.js";
import AuthServices from "./authServices.js";
import CartService from "./cartServices.js";
import { UserRepositoryInterface } from "../common/types/classInterfaces.js";
import Utils from "../utils/utils.js";
import EmailService from "./emailService.js";
import CloudService from "./cloudService.js";
import UserFactory from "../factories/userRepositoryFactory.js";
import logger from "../utils/logger.js";
import { error } from "winston";
import UserServices from "./userServices.js";

@injectable()
export default class AdminServices {
  constructor(
    @inject(UserServices) private userServices: UserServices,
    @inject(AuthServices) private authService: AuthServices
  ) {}

  public async signUp(
    user: AddUser
    //  file: Express.Multer.File
  ) {
    try {
      const admin = await this.userServices.signUp(
        user,
        //  file,
        "Admin"
      );
      if (!admin) {
        const error = new Error("Failed to register admin");
        (error as any).statusCode = 500;
        throw error;
      }
      return admin;
    } catch (err) {
      logger.error("Error during sign-up process");
      throw err;
    }
  }

  public async signIn(email: string, password: string) {
    try {
      const result = await this.userServices.signIn(email, password);
      return result;
    } catch (err) {
      logger.error("Error during sign-in process");
      throw err;
    }
  }

  private returnData<
    T extends {
      _id: any;
      username: string;
      email: string;
      phone: number;
      address: string;
      image: string;
    }
  >(data: T): UserReturn {
    return {
      id: data._id.toString(),
      username: data.username,
      email: data.email,
      phone: data.phone,
      address: data.address,
      image: data.image,
    };
  }
}
