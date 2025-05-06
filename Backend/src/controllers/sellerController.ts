import { inject, injectable } from "tsyringe";
import { RequestHandler } from "express";
import { AddSeller, SellerUpadte } from "../common/types/sellerType";
import SellerServices from "../services/sellerServices";
import ResponseHandler from "../utils/apiResponse";
import logger from "../utils/logger";

@injectable()
export default class SellerController {
  constructor(
    @inject(SellerServices) private sellerServices: SellerServices,
    @inject(ResponseHandler) private responseHandler: ResponseHandler
  ) {}

  private logError(context: string, err: unknown, extra?: object) {
    if (err instanceof Error) {
      logger.error(context, { error: err.message });
    } else {
      logger.error(`${context} - Unknown error`, { error: err, ...extra });
    }
  }

  public getSeller: RequestHandler = async (req, res, next) => {
    const sellerid = req.user.id;
    try {
      logger.info(`Fetching seller with id: ${sellerid}`);
      const seller = await this.sellerServices.getSeller(sellerid);
      if (!seller) {
        logger.warn(`No seller found with id: ${sellerid}`);
        return this.responseHandler.notFound(res, "No seller found");
      }
      logger.info(`Seller found with id: ${sellerid}`);
      return this.responseHandler.success(res, "Seller found", seller);
    } catch (err) {
      this.logError(`Error fetching seller with id: ${sellerid}`, err);
      return next(err);
    }
  };

  public getSellers: RequestHandler = async (req, res, next) => {
    try {
      logger.info("Fetching all sellers");
      const sellers = await this.sellerServices.getSellers();
      if (!sellers || sellers.length === 0) {
        logger.warn("No sellers found");
        return this.responseHandler.notFound(res, "No sellers found");
      }
      logger.info("Sellers fetched successfully");
      return this.responseHandler.success(res, "Sellers found", sellers);
    } catch (err) {
      this.logError("Error fetching all sellers", err);
      return next(err);
    }
  };

  public signUp: RequestHandler = async (req, res, next) => {
    const seller: AddSeller = req.body;
    try {
      logger.info(`Attempting to register seller: ${seller.username}`);
      const { result, token } = await this.sellerServices.signUp(
        seller,
        "Seller"
      );
      if (!result) {
        logger.warn(`Seller signup failed: ${seller.username}`);
        return this.responseHandler.error(res, "Failed to sign up seller");
      }
      logger.info(`Seller signed up successfully: ${seller.username}`);
      return this.responseHandler.created(res, "Seller created successfully", {
        result,
        token,
      });
    } catch (err) {
      this.logError("Error during seller signup", err, { seller });
      return next(err);
    }
  };

  public signIn: RequestHandler = async (req, res, next) => {
    const { username, email, password } = req.body;
    try {
      logger.info(`Seller login attempt: ${username || email}`);
      const { result, token } = await this.sellerServices.signIn(
        username,
        email,
        password
      );
      if (!result) {
        logger.warn(`Invalid seller credentials: ${username || email}`);
        return this.responseHandler.error(res, "No seller found");
      }
      logger.info(`Seller logged in successfully: ${username || email}`);
      return this.responseHandler.success(res, "Seller sign in successful", {
        result,
        token,
      });
    } catch (err) {
      this.logError("Error during seller sign in", err);
      return next(err);
    }
  };

  public updateSeller: RequestHandler = async (req, res, next) => {
    const sellerid = req.user.id;
    const update: SellerUpadte = req.body;
    try {
      logger.info(`Updating seller with id: ${sellerid}`);
      const result = await this.sellerServices.updateSeller(sellerid, update);
      if (!result) {
        logger.warn(`Seller update failed for id: ${sellerid}`);
        return this.responseHandler.error(res, "Failed to update seller data");
      }
      logger.info(`Seller updated successfully: ${sellerid}`);
      return this.responseHandler.success(
        res,
        "Updated seller successfully",
        result
      );
    } catch (err) {
      this.logError(`Error updating seller with id: ${sellerid}`, err);
      return next(err);
    }
  };

  public deleteSeller: RequestHandler = async (req, res, next) => {
    const { sellerid } = req.params;
    const { id, role } = req.user;
    try {
      logger.info(
        `User ${id} (role: ${role}) attempting to delete seller with id: ${sellerid}`
      );
      const result = await this.sellerServices.deleteSeller(sellerid, id, role);
      if (!result) {
        logger.warn(`Seller deletion failed for id: ${sellerid}`);
        return this.responseHandler.error(res, "Failed to delete seller");
      }
      logger.info(`Seller deleted successfully: ${sellerid}`);
      return this.responseHandler.success(
        res,
        "Seller deleted successfully",
        result
      );
    } catch (err) {
      this.logError(`Error deleting seller with id: ${sellerid}`, err);
      return next(err);
    }
  };
}
