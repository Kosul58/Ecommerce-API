import { RequestHandler } from "express";
import { injectable, inject } from "tsyringe";
import ResponseHandler from "../utils/apiResponse";
import logger from "../utils/logger";
import DiscountServices from "../services/discountServices";

@injectable()
export default class DiscountController {
  constructor(
    @inject(ResponseHandler) private responseHandler: ResponseHandler,
    @inject(DiscountServices) private discountServices: DiscountServices
  ) {}

  public get: RequestHandler = async (req, res, next) => {
    try {
      logger.info("Fetching discount types from the database");
      const discounts = await this.discountServices.get();
      if (!discounts) {
        return this.responseHandler.error(res, "Failed to get discount data");
      }
      return this.responseHandler.success(
        res,
        "Discount data found",
        discounts
      );
    } catch (err) {
      return next(err);
    }
  };
  public create: RequestHandler = async (req, res, next) => {
    const name = req.body.name;
    try {
      logger.info("Creating new discount type");
      const result = await this.discountServices.create(name);
      if (result === "exists") {
        return this.responseHandler.conflict(
          res,
          "Discount type already exists"
        );
      }
      if (!result) {
        return this.responseHandler.error(
          res,
          "Failed to create new discount type"
        );
      }
      logger.info("New discount type created successfully");
      return this.responseHandler.success(
        res,
        "New Discount type created",
        result
      );
    } catch (err) {
      return next(err);
    }
  };

  public delete: RequestHandler = async (req, res, next) => {
    const ids = req.body.ids;
    try {
      logger.info("Deleteing discount types");
      const data = await this.discountServices.delete(ids);
      return this.responseHandler.success(
        res,
        "Discounts deleted successfully",
        data
      );
    } catch (err) {
      return next(err);
    }
  };
}
