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
    const encryptedPassword = await this.utils.encryptPassword(seller.password);
    return {
      shopname: seller.shopname,
      username: seller.username,
      email: seller.email,
      password: encryptedPassword,
      phone: seller.phone,
      address: seller.address,
      role: UserRole.SELLER,
    };
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
      if (!seller || Object.keys(seller).length === 0) return null;
      return this.returnData(seller);
    } catch (err) {
      throw err;
    }
  }

  public async getSellers() {
    try {
      const sellers = await this.sellerRepository.findSellers();
      if (!sellers || sellers.length === 0) return null;
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

      if (usernameTaken || emailTaken || phoneTaken) return { result: "taken" };

      const newSeller = await this.generateSeller(seller);
      const result = await this.sellerRepository.signup(newSeller);
      if (!result) return { result: null };
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
      if (!result) return { result: null };
      let token;
      if (result) {
        const check = await this.utils.comparePassword(
          password,
          result.password
        );
        if (!check) return { result: "incorrectpwd" };
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
      if (!check) return null;
      const updateFields = Object.fromEntries(
        Object.entries(update).filter(([_, value]) => value !== undefined)
      ) as Partial<SellerUpadte>;
      if (updateFields.username) {
        const usernameTaken = await this.sellerRepository.findUserName(
          updateFields.username,
          sellerid
        );
        if (usernameTaken) return "utaken";
      }
      if (updateFields.phone) {
        const phoneTaken = await this.sellerRepository.findPhone(
          updateFields.phone,
          sellerid
        );
        if (phoneTaken) return "phonetaken";
      }
      const result = await this.sellerRepository.updateSeller(
        sellerid,
        updateFields
      );
      if (!result || Object.keys(result).length === 0) return null;
      return "success";
    } catch (err) {
      throw err;
    }
  }
  public async deleteSeller(sellerid: string) {
    try {
      const check = await this.getSeller(sellerid);
      if (!check) return null;
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
