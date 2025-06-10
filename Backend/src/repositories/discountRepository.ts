import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepository";
import DiscountSchema from "../models/discount";
import mongoose from "mongoose";
@injectable()
export default class DiscountRepository extends BaseRepository {
  constructor() {
    super(DiscountSchema);
  }
  public async check(name: string) {
    const existing = await this.model.findOne({ discountNmae: name });
    return !!existing;
  }
  public async deleteDiscounts(ids: string[]) {
    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
    return await this.model.deleteMany({ _id: { $in: objectIds } });
  }
}
