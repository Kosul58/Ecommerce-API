import { inject, injectable } from "tsyringe";
import DiscountRepository from "../repositories/discountRepository";
import logger from "../utils/logger";

@injectable()
export default class DiscountServices {
  constructor(
    @inject(DiscountRepository) private discountRepository: DiscountRepository
  ) {}

  public async create(type: string) {
    try {
      const discount = {
        discountName: type,
      };

      const check = await this.discountRepository.check(type);
      if (check === true) {
        logger.warn("Discount type already exists");
        return "exists";
      }
      const create = await this.discountRepository.create(discount);
      if (!create || Object.keys(create).length === 0) {
        logger.warn("Failed to create new discount type");
        const error = new Error("Failed to create new discount type");
        (error as any).statusCode = 500;
        throw error;
      }
      return "success";
    } catch (err) {
      logger.error("Failed to create new discount");
      throw err;
    }
  }
  public async get() {
    try {
      const discounts = await this.discountRepository.findAll();
      if (!discounts || Object.keys(discounts).length === 0) {
        logger.warn("No discounts found");
        const error = new Error("No discounts found");
        (error as any).statusCode = 400;
        throw error;
      }
      return discounts.map((d: any) => ({
        id: d._id.toString(),
        discountName: d.discountName,
        timestamp: d.timestamp,
      }));
    } catch (err) {
      throw err;
    }
  }
  public async delete(ids: string[]) {
    try {
      const data = await this.discountRepository.deleteDiscounts(ids);
      if (!data || data.deletedCount === 0) {
        logger.warn("No matching discounts found in the database");
        const error = new Error("No matching discounts found");
        (error as any).statusCode = 404;
        throw error;
      }
      return "success";
    } catch (err) {
      throw err;
    }
  }
}
