import { SellerRepositoryInterface } from "../common/types/classInterfaces";
import { Seller, SellerUpadte } from "../common/types/sellerType";
import SellerSchema from "../models/seller";
import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepository.js";

@injectable()
export default class SellerRepository
  extends BaseRepository
  implements SellerRepositoryInterface
{
  constructor() {
    super(SellerSchema);
  }
  public async findUserName(username: string, excludeId?: string) {
    const seller = await this.model.findOne({ username });
    return seller && seller._id.toString() !== excludeId;
  }
  public async findEmail(email: string, excludeId?: string) {
    const seller = await this.model.findOne({ email });
    return seller && seller._id.toString() !== excludeId;
  }
  public async findPhone(phone: number, excludeId?: string) {
    const seller = await this.model.findOne({ phone });
    return seller && seller._id.toString() !== excludeId;
  }
  public async signIn(username: string, email: string) {
    return await this.model.findOne({ username, email });
  }
  public async signup(seller: Seller) {
    return await this.create(seller);
  }
}
