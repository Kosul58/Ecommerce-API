import { inject, injectable, container } from "tsyringe";
import {
  AddUser,
  UpdateUser,
  User,
  UserReturn,
  UserRole,
} from "../common/types/userType";
import AuthServices from "./authServices";
import logger from "../utils/logger";
import UserServices from "./userServices";

@injectable()
export default class AdminServices {
  constructor(
    @inject(UserServices) private userServices: UserServices,
    @inject(AuthServices) private authService: AuthServices
  ) {}

  public async getAdmin(userid: string) {
    try {
      return await this.userServices.getUser(userid);
    } catch (err) {
      logger.error("Error fetching user data for userId:");
      throw err;
    }
  }
  public async accessToken(refreshToken: string) {
    try {
      const verifyToken = this.authService.verifyRefreshToken(refreshToken);
      if (!verifyToken) {
        logger.error("Failed to verify refresh token");
        return null;
      }
      return this.authService.newAccessToken(refreshToken);
    } catch (err) {
      throw err;
    }
  }
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
      const result = await this.userServices.signIn(email, password, "Admin");
      return result;
    } catch (err) {
      logger.error("Error during sign-in process");
      throw err;
    }
  }

  public async verifyAdmin(email: string, otp: string) {
    try {
      const result = await this.userServices.verifyUser(email, otp);
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
