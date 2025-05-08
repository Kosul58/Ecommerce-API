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
import Utills from "../utils/utils.js";
import EmailService from "./emailService1.js";
import CloudService from "./cloudService.js";
import UserFactory from "../factories/userRepositoryFactory.js";
import logger from "../utils/logger.js";

@injectable()
export default class UserServices {
  private userRepository: UserRepositoryInterface;

  constructor(
    @inject(UserFactory) private userFactory: UserFactory,
    @inject(EmailService) private emailService: EmailService,
    @inject(CloudService) private cloudService: CloudService,
    @inject(CartService) private cartService: CartService,
    @inject(AuthServices) private authService: AuthServices,
    @inject(Utills) private utils: Utills
  ) {
    this.userRepository =
      this.userFactory.getRepository() as UserRepositoryInterface;
  }

  private async generateUser(user: AddUser, role: string): Promise<User> {
    try {
      const encryptedPassword = await this.utils.encryptPassword(user.password);
      const userRole = role === "User" ? UserRole.USER : UserRole.ADMIN;
      return {
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        password: encryptedPassword,
        phone: user.phone,
        address: user.address,
        role: userRole,
      };
    } catch (err) {
      logger.error(
        `Password encryption failed for user: ${user.username}`,
        err
      );
      const error = new Error("Password encryption failed");
      (error as any).statusCode = 500;
      throw error;
    }
  }

  public async signUp(user: AddUser, role: string) {
    try {
      const [usernameTaken, emailTaken, phoneTaken] = await Promise.all([
        this.userRepository.findUserName(user.username),
        this.userRepository.findEmail(user.email),
        this.userRepository.findPhoneNumber(user.phone),
      ]);
      if (usernameTaken || emailTaken || phoneTaken) {
        const reasons = [];
        if (usernameTaken) reasons.push("Username already taken");
        if (emailTaken) reasons.push("Email already registered");
        if (phoneTaken) reasons.push("Phone number already registered");
        const error = new Error("User already exists");
        (error as any).statusCode = 409;
        (error as any).details = reasons;
        logger.error("User creation failed due to duplicate data");
        throw error;
      }

      const newUser = await this.generateUser(user, role);
      const result = await this.userRepository.signUp(newUser);

      if (!result || Object.keys(result).length === 0) {
        const error = new Error("User creation failed");
        (error as any).statusCode = 500;
        throw error;
      }

      if (result.role === "User") {
        await this.cartService.createCart(result._id.toString());
      }

      return {
        result: this.returnData(result),
        token: this.authService.generateToken(
          result._id.toString(),
          user.username,
          user.email,
          result.role
        ),
      };
    } catch (err) {
      logger.error("Error during sign-up process");
      throw err;
    }
  }

  public async signIn(username: string, email: string, password: string) {
    try {
      const result = await this.userRepository.signIn(username, email);
      if (!result || Object.keys(result).length === 0) {
        const error = new Error("Signin failed. User not found");
        (error as any).statusCode = 404;
        throw error;
      }

      const check = await this.utils.comparePassword(password, result.password);
      if (!check) {
        const error = new Error("Signin failed. Incorrect password");
        (error as any).statusCode = 401;
        throw error;
      }

      return {
        result: this.returnData(result),
        token: this.authService.generateToken(
          result._id.toString(),
          username,
          email,
          result.role
        ),
      };
    } catch (err) {
      logger.error("Error during sign-in process");
      throw err;
    }
  }

  public async getUser(userid: string) {
    try {
      const result = await this.userRepository.findOne(userid);
      if (!result || Object.keys(result).length === 0) {
        const error = new Error("User not found");
        (error as any).statusCode = 404;
        throw error;
      }
      return this.returnData(result);
    } catch (err) {
      logger.error("Error fetching user data for userId:");
      throw err;
    }
  }

  public async getUsers() {
    try {
      const result = await this.userRepository.findAll();
      if (!result || result.length === 0) {
        const error = new Error("No users found");
        (error as any).statusCode = 404;
        throw error;
      }
      return result.map((user: any) => this.returnData(user));
    } catch (err) {
      logger.error("Error fetching all users");
      throw err;
    }
  }

  public async deleteUser(userid: string, id: string, role: string) {
    try {
      if (role === "User" && userid !== id) {
        logger.warn(`User ${userid} not authorized to delete others`);
        const error = new Error("User not authorized to delete others");
        (error as any).statusCode = 401;
        throw error;
      }
      const data = await this.userRepository.deleteOne(userid);
      if (!data) {
        const error = new Error("User not found or already deleted");
        (error as any).statusCode = 404;
        throw error;
      }
      await this.cartService.deleteCart(userid);
      logger.info(`User deleted successfully. User cart also deleted`);

      return "success";
    } catch (err) {
      logger.error("Error deleting user with userId:");
      throw err;
    }
  }

  public async updateUserInfo(userid: string, update: UpdateUser) {
    try {
      const updateFields = Object.fromEntries(
        Object.entries(update).filter(([_, value]) => value !== undefined)
      ) as Partial<UpdateUser>;

      if (updateFields.username) {
        const usernameTaken = await this.userRepository.findUserName(
          updateFields.username,
          userid
        );
        if (usernameTaken) {
          const error = new Error("Username is already taken");
          (error as any).statusCode = 409;
          throw error;
        }
      }

      if (updateFields.phone) {
        const phoneTaken = await this.userRepository.findPhoneNumber(
          updateFields.phone,
          userid
        );
        if (phoneTaken) {
          const error = new Error("Phone number is already in use");
          (error as any).statusCode = 409;
          throw error;
        }
      }

      const result = await this.userRepository.updateOne(userid, updateFields);
      if (!result) {
        logger.error("Failed to update user data for userId:", userid);
        return;
      }
      logger.info(`User ${result.username} updated successfully`);
      return "success";
    } catch (err) {
      logger.error("Error updating user info for userId:");
      throw err;
    }
  }

  public async sendMail() {
    try {
      const data = await this.emailService.sendMail(
        "gurungkosul@gmail.com",
        "Signup complete",
        "Thank you for creating an account. Hope you enjoy your shopping.",
        { username: "Kosul", email: "kosulgrg@gmail.com" }
      );
      if (!data) {
        const error = new Error("Failed to send email");
        (error as any).statusCode = 500;
        throw error;
      }
      logger.info("Email sent successfully");
      return "Email sent successfully";
    } catch (err) {
      logger.error("Error sending email");
      throw err;
    }
  }

  public async pdf(): Promise<string> {
    try {
      const userInfo = {
        username: "Kosul",
        email: "kosulgrg@gmail.com",
        orderid: "6814790a716d460249dc6fb1",
        userid: "6814671ea1815d08f1ecc20a",
        products: ["68145bfe8a486d9766ec9b88"],
        total: 7980,
        paymentType: "Cash on delivery",
        deliveryTime: Date.now(),
      };

      const buffer = await this.utils.generatePDFBuffer(userInfo);
      const { userid } = userInfo;
      const fileExtension = "pdf";
      const fileName = `${userid}.${fileExtension}`;
      const folderPath = `orders/${this.utils.generatePath()}`;

      const uploadResult = await this.cloudService.uploadFile(buffer, {
        folder: folderPath,
        public_id: fileName,
        resource_type: "raw",
        use_filename: true,
        unique_filename: false,
        type: "private",
      });

      if (!uploadResult) {
        const error = new Error("Failed to upload PDF");
        (error as any).statusCode = 500;
        throw error;
      }

      const signedURL = await this.cloudService.signedURL(folderPath, fileName);
      logger.info("PDF uploaded successfully", { signedURL });
      return signedURL;
    } catch (err) {
      logger.error("Error uploading PDF", { error: err });
      throw err;
    }
  }

  public async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
    try {
      if (!files || files.length === 0) {
        const error = new Error("No files provided for upload");
        (error as any).statusCode = 400;
        throw error;
      }
      const sellerId = "6814671ea1815d08f1ecc20a";
      const filePath = this.utils.generatePath();
      const results = await Promise.allSettled(
        files.map((file, index) =>
          this.cloudService.uploadFile(file.buffer, {
            resource_type: "image",
            folder: `products/${filePath}`,
            public_id: `${sellerId}_${index}`,
            use_filename: true,
            unique_filename: false,
          })
        )
      );

      const successfulUploads: string[] = [];
      const failedUploads: { index: number; reason: any }[] = [];

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          successfulUploads.push(result.value);
        } else {
          failedUploads.push({ index, reason: result.reason });
          logger.warn(`Upload failed for file ${index}`, {
            reason: result.reason,
          });
        }
      });

      if (successfulUploads.length === 0) {
        const error = new Error("All image uploads failed");
        (error as any).statusCode = 500;
        throw error;
      }

      const links = successfulUploads.map((url, index) => ({
        [`image_${index + 1}`]: url,
      }));

      logger.info("Some or all images uploaded successfully.", {
        links,
        failedUploads,
      });

      return successfulUploads;
    } catch (err) {
      logger.error("Error uploading images", { error: err });
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
    }
  >(data: T): UserReturn {
    return {
      id: data._id.toString(),
      username: data.username,
      email: data.email,
      phone: data.phone,
      address: data.address,
    };
  }
}
