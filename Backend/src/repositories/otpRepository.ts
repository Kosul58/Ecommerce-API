import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepository";
import OtpSchema from "../models/otp";
@injectable()
export default class OtpRepository extends BaseRepository {
  constructor() {
    super(OtpSchema);
  }
  public async search(email: string) {
    try {
      return await OtpSchema.findOne({ email });
    } catch (error) {
      console.error("Failed to search for otp:", error);
      throw error;
    }
  }
  public async deleteOne(email: string) {
    try {
      return await OtpSchema.deleteOne({ email });
    } catch (err) {
      throw err;
    }
  }
}
