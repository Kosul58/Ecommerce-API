import { Seller, SellerUpadte } from "../common/types/sellerType";
import SellerSchema from "../models/seller";
import { injectable } from "tsyringe";
@injectable()
export default class SellerRepository {
  public async findUserName(username: string, excludeId?: string) {
    const seller = await SellerSchema.findOne({ username });
    return seller && seller._id.toString() !== excludeId;
  }

  public async findEmail(email: string, excludeId?: string) {
    const seller = await SellerSchema.findOne({ email });
    return seller && seller._id.toString() !== excludeId;
  }

  public async findPhone(phone: number, excludeId?: string) {
    const seller = await SellerSchema.findOne({ phone });
    return seller && seller._id.toString() !== excludeId;
  }

  public async findSeller(sellerid: string) {
    try {
      return await SellerSchema.findById(sellerid);
    } catch (err) {
      throw err;
    }
  }
  public async findSellers() {
    try {
      return await SellerSchema.find();
    } catch (err) {
      throw err;
    }
  }
  public async signIn(username: string, email: string) {
    try {
      return await SellerSchema.findOne({ username, email });
    } catch (err) {
      throw err;
    }
  }
  public async signup(seller: Seller) {
    try {
      const newSeller = new SellerSchema(seller);
      return await newSeller.save();
    } catch (err) {
      throw err;
    }
  }
  public async updateSeller(sellerid: string, update: SellerUpadte) {
    try {
      return await SellerSchema.findByIdAndUpdate(
        sellerid,
        { $set: update },
        { new: true }
      );
    } catch (err) {
      throw err;
    }
  }
  public async deleteSeller(sellerid: string) {
    try {
      return await SellerSchema.findByIdAndDelete(sellerid);
    } catch (err) {
      throw err;
    }
  }
}
