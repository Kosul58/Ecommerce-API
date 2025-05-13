import { inject, injectable } from "tsyringe";
import { AddSeller, Seller, SellerUpadte } from "../common/types/sellerType.js";
import { UserReturn, UserRole } from "../common/types/userType.js";
import AuthService from "./authServices.js";
import ProductServices from "./productServices.js";
import SellerFactory from "../factories/sellerRepositoryFactory.js";
import { SellerRepositoryInterface } from "../common/types/classInterfaces.js";
import logger from "../utils/logger.js";
import Utils from "../utils/utils.js";
import CloudService from "./cloudService.js";
import EmailService from "./emailService.js";

@injectable()
export default class SellerServices {
  private sellerRepository: SellerRepositoryInterface;

  constructor(
    @inject(SellerFactory) private sellerFactory: SellerFactory,
    @inject(EmailService) private emailService: EmailService,
    @inject(AuthService) private authService: AuthService,
    @inject(ProductServices) private productServices: ProductServices,
    @inject(CloudService) private cloudService: CloudService
  ) {
    this.sellerRepository =
      this.sellerFactory.getRepository() as SellerRepositoryInterface;
  }

  private async generateSeller(seller: AddSeller): Promise<Seller> {
    try {
      const encryptedPassword = await Utils.encryptPassword(seller.password);
      return {
        shopname: seller.shopname,
        username: seller.username,
        email: seller.email,
        password: encryptedPassword,
        phone: seller.phone,
        address: seller.address,
        role: UserRole.SELLER,
      };
    } catch (err) {
      logger.error("Password encryption failed");
      throw new Error("Password encryption failed");
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

  public async signUp(seller: AddSeller, file: Express.Multer.File) {
    try {
      const [usernameTaken, emailTaken, phoneTaken] = await Promise.all([
        this.sellerRepository.findUserName(seller.username),
        this.sellerRepository.findEmail(seller.email),
        this.sellerRepository.findPhone(seller.phone),
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

      const newSeller = await this.generateSeller(seller);
      const result = await this.sellerRepository.signup(newSeller);
      const sellerid = result._id.toString();
      if (!result || Object.keys(result).length === 0) {
        const error = new Error("Signup failed");
        await this.sellerRepository.deleteOne(sellerid);
        (error as any).statusCode = 500;
        throw error;
      }
      const uploadResult = await this.uploadImage(file, sellerid);
      if (!uploadResult) {
        await this.sellerRepository.deleteOne(sellerid);
        const error = new Error("Image upload failed");
        (error as any).statusCode = 500;
        throw error;
      }
      const savedSeller = await this.sellerRepository.updateOne(sellerid, {
        image: uploadResult,
      });
      if (!savedSeller) {
        await this.sellerRepository.deleteOne(sellerid);
        const error = new Error("Failed to save user after image upload");
        (error as any).statusCode = 500;
        throw error;
      }
      const emailSent = await this.emailService.signUpMail(
        {
          email: savedSeller.email,
          username: savedSeller.username,
        },
        UserRole.SELLER
      );
      if (!emailSent) {
        logger.warn(
          `Sign-up succeeded but email failed to send to ${savedSeller.email}`
        );
      }
      return {
        result: this.returnData(savedSeller),
        token: this.authService.generateToken(
          sellerid,
          seller.username,
          seller.email,
          result.role
        ),
      };
    } catch (err) {
      logger.error("Failed to sign up seller");
      throw err;
    }
  }

  public async signIn(username: string, email: string, password: string) {
    try {
      const result = await this.sellerRepository.signIn(username, email);
      if (!result) {
        const error = new Error("Signin failed. No seller found");
        (error as any).statusCode = 404;
        throw error;
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
          username,
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
