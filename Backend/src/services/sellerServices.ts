import { inject, injectable } from "tsyringe";
import { AddSeller, Seller, SellerUpadte } from "../common/types/sellerType.js";
import Utills from "../utils/utils.js";
import { UserReturn, UserRole } from "../common/types/userType.js";
import SellerRepository from "../repository/sellerRepository.js";
import AuthService from "./authServices.js";
import ProductServices from "./productServices.js";
@injectable()
export default class SellerServices {
  constructor(
    @inject(SellerRepository) private sellerRepository: SellerRepository,
    @inject(AuthService) private authService: AuthService,
    @inject(Utills) private utils: Utills,
    @inject(ProductServices) private productServices: ProductServices
  ) {}
  private async generateSeller(seller: AddSeller): Promise<Seller> {
    try {
      const encryptedPassword = await this.utils.encryptPassword(
        seller.password
      );
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
  public async getSeller(sellerid: string) {
    try {
      const seller = await this.sellerRepository.findSeller(sellerid);
      if (!seller || Object.keys(seller).length === 0) {
        const error = new Error("No seller found");
        (error as any).statusCode = 404;
        throw error;
      }
      return this.returnData(seller);
    } catch (err) {
      throw err;
    }
  }

  public async getSellers() {
    try {
      const sellers = await this.sellerRepository.findSellers();
      if (!sellers || sellers.length === 0) {
        const error = new Error("No sellers found");
        (error as any).statusCode = 404;
        throw error;
      }
      return sellers.map((s) => this.returnData(s));
    } catch (err) {
      throw err;
    }
  }
  public async signUp(seller: AddSeller, role: string) {
    try {
      const [usernameTaken, emailTaken, phoneTaken] = await Promise.all([
        this.sellerRepository.findUserName(seller.username),
        this.sellerRepository.findEmail(seller.email),
        this.sellerRepository.findPhone(seller.phone),
      ]);

      if (usernameTaken) {
        const error = new Error("Username is already taken");
        (error as any).statusCode = 409;
        throw error;
      }

      if (emailTaken) {
        const error = new Error("Email is already in use");
        (error as any).statusCode = 409;
        throw error;
      }

      if (phoneTaken) {
        const error = new Error("Phone number is already in use");
        (error as any).statusCode = 409;
        throw error;
      }

      const newSeller = await this.generateSeller(seller);
      const result = await this.sellerRepository.signup(newSeller);
      if (!result) {
        const error = new Error("Signup failed");
        (error as any).statusCode = 500;
        throw error;
      }
      return {
        result: this.returnData(result),
        token: this.authService.generateToken(
          result._id.toString(),
          seller.username,
          seller.email,
          result.role
        ),
      };
    } catch (err) {
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
      if (result) {
        const check = await this.utils.comparePassword(
          password,
          result.password
        );
        if (!check) {
          const error = new Error("Signin failed. Incorrect password");
          (error as any).statusCode = 401;
          throw error;
        }
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

      const result = await this.sellerRepository.updateSeller(
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
      throw err;
    }
  }
  public async deleteSeller(sellerid: string, id: string, role: string) {
    try {
      if (role === "Seller") {
        if (sellerid !== id) {
          const error = new Error("Seller not authorized to delete others");
          (error as any).statusCode = 401;
          throw error;
        }
      }
      const check = await this.getSeller(sellerid);
      if (!check) {
        const error = new Error("No seller found");
        (error as any).statusCode = 404;
        throw error;
      }
      const result = await this.sellerRepository.deleteSeller(sellerid);
      if (result) {
        await this.productServices.deleteProducts(sellerid);
        return "success";
      }
      return null;
    } catch (err) {
      throw err;
    }
  }
}
