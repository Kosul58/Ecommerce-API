import { inject, injectable, container } from "tsyringe";
import {
  AddUser,
  UpdateUser,
  User,
  UserReturn,
  UserRole,
} from "../common/types/userType";
import AuthServices from "./authServices";
import CartService from "./cartServices";
import { UserRepositoryInterface } from "../common/types/classInterfaces";
import Utils from "../utils/utils";
import EmailService from "./emailService";
import CloudService from "./cloudService";
import UserFactory from "../factories/userRepositoryFactory";
import logger from "../utils/logger";
import { DeliveryStatus } from "../common/types/orderType";
import OtpServices from "./otpService";

@injectable()
export default class UserServices {
  private userRepository: UserRepositoryInterface;
  constructor(
    @inject(UserFactory) private userFactory: UserFactory,
    @inject(EmailService) private emailService: EmailService,
    @inject(CloudService) private cloudService: CloudService,
    @inject(CartService) private cartService: CartService,
    @inject(AuthServices) private authService: AuthServices,
    @inject(OtpServices) private otpServices: OtpServices
  ) {
    this.userRepository =
      this.userFactory.getRepository() as UserRepositoryInterface;
  }
  private async generateUser(user: AddUser, role?: string): Promise<User> {
    try {
      const encryptedPassword = await Utils.encryptPassword(user.password);
      return {
        // firstname: user.firstname,
        // lastname: user.lastname,
        username: user.username,
        email: user.email,
        password: encryptedPassword,
        // phone: user.phone,
        // address: user.address,
        role: role === "Admin" ? UserRole.ADMIN : UserRole.USER,
        image: "userimage",
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

  private async uploadImage(
    file: Express.Multer.File,
    userId: string,
    role?: string
  ) {
    const filePath = Utils.generatePath();
    const folder =
      role?.toLowerCase() === "admin"
        ? `admins/${filePath}`
        : `users/${filePath}`;

    const uploadResult = await this.cloudService.uploadFile(
      file.buffer,
      {
        resource_type: "image",
        folder,
        public_id: userId,
        use_filename: false,
        unique_filename: false,
      },
      {
        id: file.originalname,
        type: "upload",
        mimetype: file.mimetype,
        size: file.size,
      }
    );

    return uploadResult;
  }

  public async signUp(
    user: AddUser,
    //  file: Express.Multer.File,
    role?: string
  ) {
    try {
      logger.info("Checking input fields");
      const [
        usernameTaken,
        emailTaken,
        //  phoneTaken
      ] = await Promise.all([
        this.userRepository.findUserName(user.username),
        this.userRepository.findEmail(user.email),
        // this.userRepository.findPhoneNumber(user.phone),
      ]);
      if (
        usernameTaken ||
        emailTaken
        // || phoneTaken
      ) {
        const reasons = [];
        if (usernameTaken) reasons.push("Username already taken");
        if (emailTaken) reasons.push("Email already registered");
        // if (phoneTaken) reasons.push("Phone number already registered");
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
      const userid = result._id.toString();
      // const uploadResult = await this.uploadImage(file, userid, role);
      // if (!uploadResult) {
      //   await this.userRepository.deleteOne(userid);
      //   const error = new Error("Image upload failed");
      //   (error as any).statusCode = 500;
      //   throw error;
      // }
      // const savedUser = await this.userRepository.updateOne(userid, {
      //   image: uploadResult,
      // });
      // if (!savedUser) {
      //   await this.deleteUser(userid, userid, "User");
      //   const error = new Error("Failed to save user after image upload");
      //   (error as any).statusCode = 500;
      //   throw error;
      // }
      if (!role) await this.cartService.createCart(userid);
      // const emailSent = await this.emailService.signUpMail(
      //   {
      //     email: result.email,
      //     username: result.username,
      //   },
      //   role?.toLowerCase() === "admin" ? UserRole.ADMIN : UserRole.USER
      // );
      // if (!emailSent) {
      //   logger.warn(
      //     `Sign-up succeeded but email failed to send to ${result.email}`
      //   );
      // }
      // return {
      //   result: this.returnData(result),
      //   token: this.authService.generateToken(
      //     result._id.toString(),
      //     user.username,
      //     user.email,
      //     result.role
      //   ),
      // };
      await this.otpServices.send(user.email);
      return "success";
    } catch (err) {
      logger.error("Error during sign-up process");
      throw err;
    }
  }

  public async verifyUser(email: string, otp: string) {
    try {
      const verifyResult = await this.otpServices.verify(email, otp);
      const user = await this.userRepository.signIn(email);
      if (!user) {
        const error = new Error("No user found");
        (error as any).statusCode = 404;
        throw error;
      }
      if (verifyResult !== true) {
        return verifyResult;
      }
      const userid = user._id.toString();
      const result = await this.userRepository.updateOne(userid, {
        emailVerified: true,
      });
      if (!result || Object.keys(result).length === 0) {
        const error = new Error("Verification failed");
        await this.userRepository.deleteOne(userid);
        (error as any).statusCode = 500;
        throw error;
      }
      const emailSent = await this.emailService.signUpMail(
        {
          email: result.email,
          username: result.username,
        },
        UserRole.USER
      );
      if (!emailSent) {
        logger.warn(
          `Sign-up succeeded but email failed to send to ${result.email}`
        );
      }
      return {
        result: this.returnData(result),
        token: this.authService.generateToken(
          userid,
          user.username,
          user.email,
          result.role
        ),
        refreshToken: this.authService.generateRefreshToken(
          result._id.toString(),
          user.username,
          user.email,
          result.role
        ),
      };
    } catch (err) {
      logger.error("Failed to verify User");
      throw err;
    }
  }

  public async signIn(email: string, password: string, role: string) {
    try {
      const result = await this.userRepository.signIn(email);
      if (!result || Object.keys(result).length === 0) {
        const error = new Error("Signin failed. User not found");
        (error as any).statusCode = 404;
        throw error;
      }
      if (role === "Admin") {
        if (result.emailVerified === false) {
          if (result.role === role) {
            logger.warn("Admin email is not verified");
            return { result: "adminnotverified" };
          } else {
            return { result: "usernotverified" };
          }
        }
      }
      if (role === "User") {
        if (result.emailVerified === false) {
          if (result.role === role) {
            logger.warn("User email is not verified");
            return { result: "usernotverified" };
          } else {
            return { result: "adminnotverified" };
          }
        }
      }

      if (role !== result.role) {
        logger.warn("User email is not verified");
        return { result: "usernotverified" };
      }

      const check = await Utils.comparePassword(password, result.password);
      if (!check) {
        const error = new Error("Signin failed. Incorrect password");
        (error as any).statusCode = 401;
        throw error;
      }
      return {
        result: this.returnData(result),
        token: this.authService.generateToken(
          result._id.toString(),
          result.username,
          email,
          result.role
        ),
        refreshToken: this.authService.generateRefreshToken(
          result._id.toString(),
          result.username,
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
      // console.log(result);
      return {
        id: result._id.toString(),
        username: result.username,
        email: result.email,
        image: result.image,
        firstname: result.firstname ?? "",
        lastname: result.lastname ?? "",
        phone: result.phone?.toString() ?? "",
        address: result.address ?? "",
      };
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
      const userData = await this.userRepository.findOne(userid);
      if (userData.image && userData.image !== "userimage") {
        const filePath = await this.cloudService.filterData([userData.image]);
        if (!filePath) {
          logger.warn("Failed to find file path stored in the database");
          const error = new Error(
            "Failed to find file path stored in the database"
          );
          (error as any).statusCode = 500;
          throw error;
        }
        const deleteResult = await this.cloudService.deleteCloudFile(
          filePath[0],
          "upload",
          "image"
        );
        if (!deleteResult) {
          logger.warn("Failed to delete image data from the cloud");
        }
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

  public async changePassword(
    userid: string,
    oldpassword: string,
    newpassword: string
  ) {
    try {
      const userData = await this.userRepository.findOne(userid);
      if (!userData) {
        logger.warn("No user found");
        return "nouser";
      }
      const compareResult = await Utils.comparePassword(
        oldpassword,
        userData.password
      );
      if (!compareResult) {
        logger.warn("Old password does not match");
        return "nomatch";
      }
      const hashPassword = await Utils.encryptPassword(newpassword);
      const updateResult = await this.userRepository.updatePassword(
        userid,
        hashPassword
      );
      if (!updateResult) {
        logger.error("Failed to update new password in the database");
        return null;
      }
      return "success";
    } catch (err) {
      logger.error("Failed to change user password");
      throw err;
    }
  }
  public async updateUserInfo(
    userid: string,
    update: UpdateUser,
    file: Express.Multer.File
  ) {
    try {
      if (update.username) {
        const usernameTaken = await this.userRepository.findUserName(
          update.username,
          userid
        );
        if (usernameTaken) {
          const error = new Error("Username is already taken");
          (error as any).statusCode = 409;
          throw error;
        }
      }
      if (update.phone) {
        const phoneTaken = await this.userRepository.findPhoneNumber(
          update.phone,
          userid
        );
        if (phoneTaken) {
          const error = new Error("Phone number is already in use");
          (error as any).statusCode = 409;
          throw error;
        }
      }

      if (update.email) {
        const emailtaken = await this.userRepository.findEmail(
          update.email,
          userid
        );
        if (emailtaken) {
          const error = new Error("Email is already in use");
          (error as any).statusCode = 409;
          throw error;
        }
      }
      const userData = await this.userRepository.findOne(userid);
      if (update.email && update.email !== userData.email) {
        userData.emailVerified = false;
        await this.otpServices.send(update.email);
      }

      if (update.image_removed === "true") {
        if (userData.image && userData.image !== "userimage") {
          const filePath = await this.cloudService.filterData([userData.image]);
          if (!filePath) {
            logger.warn("Failed to find file path stored in the database");
            const error = new Error(
              "Failed to find file path stored in the database"
            );
            (error as any).statusCode = 500;
            throw error;
          }
          const deleteResult = await this.cloudService.deleteCloudFile(
            filePath[0],
            "upload",
            "image"
          );
          if (!deleteResult) {
            logger.warn("Failed to delete previous image data from the cloud");
          }
          update.image = "";
        }
      } else if (file) {
        if (userData.image && userData.image !== "userimage") {
          const filePath = await this.cloudService.filterData([userData.image]);
          if (!filePath) {
            logger.warn("Failed to find file path stored in the database");
            const error = new Error(
              "Failed to find file path stored in the database"
            );
            (error as any).statusCode = 500;
            throw error;
          }
          const deleteResult = await this.cloudService.deleteCloudFile(
            filePath[0],
            "upload",
            "image"
          );
          if (!deleteResult) {
            logger.warn("Failed to delete previous image data from the cloud");
          }
        }
        const uploadResult = await this.uploadImage(file, userid);
        if (!uploadResult) {
          const error = new Error("Image upload to cloud failed");
          (error as any).statusCode = 500;
          throw error;
        }
        update.image = uploadResult;
      }
      const result = await this.userRepository.updateOne(userid, update);
      if (!result) {
        logger.error("Failed to update user data for userId:", userid);
        return;
      }
      return this.returnData(result);
    } catch (err) {
      logger.error("Error updating user info for userId:");
      throw err;
    }
  }

  public async SignUpMail() {
    try {
      const mailData = {
        username: "userx3",
        email: "gurungkosul@gmail.com",
        cost: 1353.7399999999998,
        paymentMethod: "Cash On Delivery",
        products: [{ name: "product501", price: 599, quantity: 2 }],
      };
      const data = await this.emailService.orderStatusMail(
        mailData,
        DeliveryStatus.DELIVERED
      );
      if (!data) {
        const error = new Error("Failed to send email");
        (error as any).statusCode = 500;
        throw error;
      }
      logger.info("Email sent successfully");
      return "Email sent successfully";
    } catch (err) {
      logger.error("Error sending email", err);
      throw err;
    }
  }

  public async pdf(): Promise<string> {
    try {
      const userInfo = {
        username: "Kosul",
        email: "kosulgrg@gmail.com",
        orderid: "6814790a716d460249dc6fb1",
        userid: "6814671ea1815d08f1ecc30a",
        products: ["68145bfe8a486d9766ec9b88"],
        total: 7980,
        paymentType: "Cash on delivery",
        deliveryTime: Date.now(),
      };
      const buffer = await Utils.generatePDFBuffer(userInfo);
      const fileName = `${userInfo.orderid}.pdf`;
      const folderPath = `orders/${Utils.generatePath()}`;
      const uploadResult = await this.cloudService.uploadFile(
        buffer,
        {
          folder: folderPath,
          public_id: fileName,
          resource_type: "raw",
          use_filename: true,
          unique_filename: false,
          type: "private",
        },
        {
          id: userInfo.orderid,
          type: "private",
          size: buffer.length,
          mimetype: "orders/pdf",
        }
      );
      if (!uploadResult) {
        const error = new Error("Failed to upload PDF");
        (error as any).statusCode = 500;
        throw error;
      }
      const signedURL = await this.cloudService.presignedURL(
        folderPath,
        fileName
      );
      logger.info("PDF uploaded successfully", { signedURL });
      return signedURL;
    } catch (err) {
      logger.error("Error uploading PDF", { error: err });
      throw err;
    }
  }

  public async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
    try {
      const sellerId = "6814671ea1815d08f1ecc20a";
      const filePath = Utils.generatePath();
      const results = await Promise.allSettled(
        files.map((file, index) =>
          this.cloudService.uploadFile(
            file.buffer,
            {
              resource_type: "image",
              folder: `products/${filePath}`,
              public_id: `${sellerId}_${index}_${Date.now()}`,
              use_filename: true,
              unique_filename: false,
            },
            {
              id: file.originalname,
              type: "upload",
              mimetype: file.mimetype,
              size: file.size,
            }
          )
        )
      );
      const successfulUploads: string[] = [];
      const failedUploads: { index: number; reason: any }[] = [];
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          if (result.value) successfulUploads.push(result.value);
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
