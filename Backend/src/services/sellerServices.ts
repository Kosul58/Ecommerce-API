import { inject, injectable } from "tsyringe";
import { AddSeller, Seller, SellerUpadte } from "../common/types/sellerType.js";
import Utills from "../utils/utils.js";
import { UserRole } from "../common/types/userType.js";
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

  public async getSeller(sellerid: string) {
    try {
      return await this.sellerRepository.findSeller(sellerid);
    } catch (err) {
      throw err;
    }
  }

  public async getSellers() {
    try {
      return await this.sellerRepository.findSellers();
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

      if (usernameTaken || emailTaken || phoneTaken) return { result: null };

      const newSeller = await this.generateSeller(seller);
      const result = await this.sellerRepository.signup(newSeller);
      const token = this.authService.generateToken(
        result._id.toString(),
        seller.username,
        seller.email,
        result.role
      );
      return { result, token };
    } catch (err) {
      throw err;
    }
  }
  public async signIn(username: string, email: string, password: string) {
    try {
      const result = await this.sellerRepository.signIn(username, email);
      let token;
      if (result) {
        const check = await this.utils.comparePassword(
          password,
          result.password
        );
        if (!check) return { result: "incorrectpwd" };
        token = this.authService.generateToken(
          result._id.toString(),
          username,
          email,
          result.role
        );
      }
      return { result, token };
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
      return await this.sellerRepository.updateSeller(sellerid, updateFields);
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
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
}
