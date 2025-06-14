import { inject, injectable } from "tsyringe";
import { AddSeller, Seller, SellerUpadte } from "../common/types/sellerType";
import { UserReturn, UserRole } from "../common/types/userType";
import AuthService from "./authServices";
import ProductServices from "./productServices";
import SellerFactory from "../factories/sellerRepositoryFactory";
import { SellerRepositoryInterface } from "../common/types/classInterfaces";
import logger from "../utils/logger";
import Utils from "../utils/utils";
import CloudService from "./cloudService";
import EmailService from "./emailService";
import OtpServices from "./otpService";

@injectable()
export default class SellerServices {
  private sellerRepository: SellerRepositoryInterface;

  constructor(
    @inject(SellerFactory) private sellerFactory: SellerFactory,
    @inject(EmailService) private emailService: EmailService,
    @inject(AuthService) private authService: AuthService,
    @inject(ProductServices) private productServices: ProductServices,
    @inject(CloudService) private cloudService: CloudService,
    @inject(OtpServices) private otpServices: OtpServices
  ) {
    this.sellerRepository =
      this.sellerFactory.getRepository() as SellerRepositoryInterface;
  }

  private async generateSeller(seller: AddSeller): Promise<Seller> {
    try {
      const encryptedPassword = await Utils.encryptPassword(seller.password);
      return {
        shopname: seller.username,
        username: seller.username,
        email: seller.email,
        password: encryptedPassword,
        // phone: seller.phone,
        // address: seller.address,
        role: UserRole.SELLER,
        emailVerified: false,
        image: "Seller image",
      };
    } catch (err) {
      logger.error("Password encryption failed");
      throw new Error("Password encryption failed");
    }
  }

  private returnData<
    T extends {
      _id: any;
      shopname: string;
      username: string;
      email: string;
      phone: number;
      address: string;
      image: string;
    }
  >(data: T): UserReturn {
    return {
      id: data._id.toString(),
      shopname: data.shopname,
      username: data.username,
      email: data.email,
      phone: data.phone,
      address: data.address,
      image: data.image,
    };
  }
  private async uploadImage(file: Express.Multer.File, userId: string) {
    const filePath = Utils.generatePath();
    const uploadResult = await this.cloudService.uploadFile(
      file.buffer,
      {
        resource_type: "image",
        folder: `sellers/${filePath}`,
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
  public async getSeller(sellerid: string) {
    try {
      const seller = await this.sellerRepository.findOne(sellerid);
      if (!seller || Object.keys(seller).length === 0) {
        const error = new Error("No seller found");
        (error as any).statusCode = 404;
        throw error;
      }
      return this.returnData(seller);
    } catch (err) {
      logger.error(`Failed to fetch seller with id: ${sellerid}`);
      throw err;
    }
  }

  public async getSellers() {
    try {
      const sellers = await this.sellerRepository.findAll();
      if (!sellers || sellers.length === 0) {
        const error = new Error("No sellers found");
        (error as any).statusCode = 404;
        throw error;
      }
      return sellers.map((s: any) => this.returnData(s));
    } catch (err) {
      logger.error("Failed to fetch all sellers");
      throw err;
    }
  }

  public async getSellersByIds(ids: string[]) {
    try {
      const sellers = await this.sellerRepository.findByIds(ids);
      if (!sellers || sellers.length === 0) {
        const error = new Error("No sellers found");
        (error as any).statusCode = 404;
        throw error;
      }
      return sellers.map((s: any) => this.returnData(s));
    } catch (err) {
      logger.error("Failed to fetch seller data based on seller ids");
      throw err;
    }
  }

  // public async signUp(
  //   seller: AddSeller
  //   // , file: Express.Multer.File
  // ) {
  //   try {
  //     const existingSeller = await this.sellerRepository.signIn(seller.email);
  //     if (existingSeller && existingSeller.emailVerified === true) {
  //       const error = new Error("User already exists");
  //       (error as any).statusCode = 409;
  //       (error as any).details = ["Email already registered and verified"];
  //       logger.error("User creation failed: email already verified");
  //       throw error;
  //     }
  //     if (existingSeller && existingSeller.emailVerified === false) {
  //       await this.sellerRepository.deleteOne(existingSeller._id.toString());
  //     }
  //     const usernameTaken = await this.sellerRepository.findUserName(
  //       seller.username
  //     );
  //     if (usernameTaken) {
  //       const error = new Error("User already exists");
  //       (error as any).statusCode = 409;
  //       (error as any).details = ["Username already taken"];
  //       logger.error("User creation failed: username taken");
  //       throw error;
  //     }
  //     const newSeller = await this.generateSeller(seller);
  //     const result = await this.sellerRepository.signup(newSeller);
  //     const sellerid = result._id.toString();

  //     if (!result || Object.keys(result).length === 0) {
  //       await this.sellerRepository.deleteOne(sellerid);
  //       const error = new Error("Signup failed");
  //       (error as any).statusCode = 500;
  //       throw error;
  //     }

  //     await this.otpServices.send(seller.email);
  //     return "success";
  //     // const uploadResult = await this.uploadImage(file, sellerid);
  //     // if (!uploadResult) {
  //     //   await this.sellerRepository.deleteOne(sellerid);
  //     //   const error = new Error("Image upload failed");
  //     //   (error as any).statusCode = 500;
  //     //   throw error;
  //     // }
  //     // const savedSeller = await this.sellerRepository.updateOne(sellerid, {
  //     //   image: uploadResult,
  //     // });
  //     // if (!savedSeller) {
  //     //   await this.sellerRepository.deleteOne(sellerid);
  //     //   const error = new Error("Failed to save user after image upload");
  //     //   (error as any).statusCode = 500;
  //     //   throw error;
  //     // }
  //   } catch (err) {
  //     logger.error("Failed to sign up seller");
  //     throw err;
  //   }
  // }

  public async signUp(
    seller: AddSeller
    // , file: Express.Multer.File
  ) {
    try {
      const [
        usernameTaken,
        emailTaken,
        // phoneTaken
      ] = await Promise.all([
        this.sellerRepository.findUserName(seller.username),
        this.sellerRepository.findEmail(seller.email),
        // this.sellerRepository.findPhone(seller.phone),
      ]);
      if (
        usernameTaken ||
        emailTaken
        //  || phoneTaken
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
      const newSeller = await this.generateSeller(seller);
      const result = await this.sellerRepository.signup(newSeller);
      const sellerid = result._id.toString();
      if (!result || Object.keys(result).length === 0) {
        const error = new Error("Signup failed");
        await this.sellerRepository.deleteOne(sellerid);
        (error as any).statusCode = 500;
        throw error;
      }
      // const uploadResult = await this.uploadImage(file, sellerid);
      // if (!uploadResult) {
      //   await this.sellerRepository.deleteOne(sellerid);
      //   const error = new Error("Image upload failed");
      //   (error as any).statusCode = 500;
      //   throw error;
      // }
      // const savedSeller = await this.sellerRepository.updateOne(sellerid, {
      //   image: uploadResult,
      // });
      // if (!savedSeller) {
      //   await this.sellerRepository.deleteOne(sellerid);
      //   const error = new Error("Failed to save user after image upload");
      //   (error as any).statusCode = 500;
      //   throw error;
      // }
      await this.otpServices.send(seller.email);
      return "success";
    } catch (err) {
      logger.error("Failed to sign up seller");
      throw err;
    }
  }
  public async verifySeller(email: string, otp: string) {
    try {
      const verifyResult = await this.otpServices.verify(email, otp);
      const seller = await this.sellerRepository.signIn(email);
      if (!seller) {
        const error = new Error("No seller found");
        (error as any).statusCode = 404;
        throw error;
      }
      if (verifyResult !== true) {
        return verifyResult;
      }
      const sellerid = seller._id.toString();
      const result = await this.sellerRepository.updateOne(sellerid, {
        emailVerified: true,
      });
      if (!result || Object.keys(result).length === 0) {
        const error = new Error("Signup failed");
        await this.sellerRepository.deleteOne(sellerid);
        (error as any).statusCode = 500;
        throw error;
      }
      const emailSent = await this.emailService.signUpMail(
        {
          email: result.email,
          username: result.username,
        },
        UserRole.SELLER
      );
      if (!emailSent) {
        logger.warn(
          `Sign-up succeeded but email failed to send to ${result.email}`
        );
      }

      return {
        result: this.returnData(result),
        token: this.authService.generateToken(
          sellerid,
          seller.username,
          seller.email,
          result.role
        ),
        refreshToken: this.authService.generateRefreshToken(
          result._id.toString(),
          seller.username,
          seller.email,
          result.role
        ),
      };
    } catch (err) {
      logger.error("Failed to verify seller");
      throw err;
    }
  }

  public async signIn(email: string, password: string) {
    try {
      const result = await this.sellerRepository.signIn(email);
      if (!result) {
        const error = new Error("Signin failed. No seller found");
        (error as any).statusCode = 404;
        throw error;
      }
      if (result.emailVerified === false) {
        logger.warn("Seller email is not verified");
        return { result: "notverified" };
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
      logger.error("Failed to sign in seller");
      throw err;
    }
  }

  public async updateSeller(sellerid: string, update: SellerUpadte) {
    try {
      const check = await this.getSeller(sellerid);
      if (!check) {
        const error = new Error("No seller found");
        (error as any).statusCode = 404;
        throw error;
      }
      const updateFields = Object.fromEntries(
        Object.entries(update).filter(([_, value]) => value !== undefined)
      ) as Partial<SellerUpadte>;

      if (updateFields.username) {
        const usernameTaken = await this.sellerRepository.findUserName(
          updateFields.username,
          sellerid
        );
        if (usernameTaken) {
          const error = new Error("Username is already taken");
          (error as any).statusCode = 409;
          throw error;
        }
      }
      if (updateFields.phone) {
        const phoneTaken = await this.sellerRepository.findPhone(
          updateFields.phone,
          sellerid
        );
        if (phoneTaken) {
          const error = new Error("Phone number is already in use");
          (error as any).statusCode = 409;
          throw error;
        }
      }
      const result = await this.sellerRepository.updateOne(
        sellerid,
        updateFields
      );
      if (!result || Object.keys(result).length === 0) {
        const error = new Error("Update failed");
        (error as any).statusCode = 500;
        throw error;
      }

      return "success";
    } catch (err) {
      logger.error(`Failed to update seller with id: ${sellerid}`);
      throw err;
    }
  }

  public async deleteSeller(sellerid: string, id: string, role: string) {
    try {
      if (role === "Seller" && sellerid !== id) {
        const error = new Error("Seller not authorized to delete others");
        (error as any).statusCode = 401;
        throw error;
      }

      const check = await this.getSeller(sellerid);
      if (!check) {
        const error = new Error("No seller found");
        (error as any).statusCode = 404;
        throw error;
      }

      const result = await this.sellerRepository.deleteOne(sellerid);
      if (result && role === "Seller") {
        await this.productServices.deleteProducts(sellerid);
        return "success";
      } else if (role === "Admin") {
        await this.productServices.hideSellerProducts(sellerid);
        return "success";
      }

      return null;
    } catch (err) {
      logger.error(`Failed to delete seller with id: ${sellerid}`);
      throw err;
    }
  }
}
