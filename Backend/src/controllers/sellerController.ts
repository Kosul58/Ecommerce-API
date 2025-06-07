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

  public getSeller: RequestHandler = async (req, res, next) => {
    const sellerid = req.user.id;
    try {
      logger.info(`Attempting to fetch seller with id: ${sellerid}`);
      const seller = await this.sellerServices.getSeller(sellerid);
      if (!seller) {
        logger.warn(`No seller found with id: ${sellerid}`);
        return this.responseHandler.notFound(res, "No seller found");
      }
      logger.info(`Seller found with id: ${sellerid}`);
      return this.responseHandler.success(res, "Seller found", seller);
    } catch (err) {
      logger.error(`Error fetching seller with id: ${sellerid}`, err);
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
      logger.error("Error fetching sellers", err);
      return next(err);
    }
  };

  public signUp: RequestHandler = async (req, res, next) => {
    const seller: AddSeller = req.body;
    // const file = req.file as Express.Multer.File;
    try {
      logger.info(`Attempting to create a  seller: ${seller.username}`);
      const result = await this.sellerServices.signUp(
        seller
        //  file
      );
      if (!result) {
        logger.error("Failed to create a seller", { seller });
        return this.responseHandler.error(res, "Failed to create a seller");
      }
      logger.info(`Seller created successfully: ${seller.username}`);
      return this.responseHandler.created(res, "Seller created successfully");
    } catch (err) {
      logger.error("Error during seller creation", err);
      return next(err);
    }
  };

  public verifySeller: RequestHandler = async (req, res, next) => {
    const { email, otp } = req.body;
    try {
      logger.info(`Attempting to verify seller`);
      const data = await this.sellerServices.verifySeller(
        email,
        otp
        //  file
      );

      if (data === "otpexpired" || data === "otpinvalid" || !data) {
        logger.error("Failed to sign up seller");
        return this.responseHandler.error(res, "Failed to sign up seller");
      }
      const { result, token, refreshToken } = data;
      logger.info(`Seller created successfully: ${result.username}`);
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 1000 * 60 * 15, // 15 min bro
          path: "/",
        })
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days bro
          path: "/",
        });
      return this.responseHandler.created(res, "Seller created successfully", {
        result,
        token,
      });
    } catch (err) {
      logger.error("Error during seller signup", err);
      return next(err);
    }
  };

  public signIn: RequestHandler = async (req, res, next) => {
    const { email, password } = req.body;
    try {
      logger.info(`Attempting to sign in seller: ${email}`);
      const { result, token, refreshToken } = await this.sellerServices.signIn(
        email,
        password
      );
      if (!result) {
        logger.warn(`No seller found for credentials: ${email}`);
        return this.responseHandler.notFound(res, "No seller found");
      }
      if (result === "notverified") {
        return this.responseHandler.success(
          res,
          "Seller email is not verified"
        );
      }
      logger.info(`Seller sign-in successful: ${email}`);
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 1000 * 60 * 1, // 15 min bro
          path: "/",
        })
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days bro
          path: "/",
        });
      return this.responseHandler.success(res, "Seller sign in successful", {
        result,
        token,
      });
    } catch (err) {
      logger.error("Error during seller sign in", err);
      return next(err);
    }
  };

  public signOut: RequestHandler = (req, res) => {
    res
      .clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
      })
      .clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
      });

    logger.info("Seller signed out successfully");
    return this.responseHandler.success(res, "Signout successful");
  };

  public updateSeller: RequestHandler = async (req, res, next) => {
    const sellerid = req.user.id;
    const update: SellerUpadte = req.body;

    try {
      logger.info(`Attempting to update seller with id: ${sellerid}`);
      const result = await this.sellerServices.updateSeller(sellerid, update);
      if (!result) {
        logger.error(`Failed to update seller with id: ${sellerid}`);
        return this.responseHandler.error(res, "Failed to update seller data");
      }
      logger.info(`Seller with id: ${sellerid} updated successfully`);
      return this.responseHandler.success(
        res,
        "Updated seller successfully",
        result
      );
    } catch (err) {
      logger.error(`Error updating seller with id: ${sellerid}`, err);
      return next(err);
    }
  };

  public deleteSeller: RequestHandler = async (req, res, next) => {
    const { sellerid } = req.params;
    const { id, role } = req.user;
    try {
      logger.info(
        `Attempting to delete seller with id: ${sellerid} by user ${id} with role ${role}`
      );
      const result = await this.sellerServices.deleteSeller(sellerid, id, role);
      if (!result) {
        logger.error(`Failed to delete seller with id: ${sellerid}`);
        return this.responseHandler.error(res, "Failed to delete seller");
      }
      logger.info(`Seller with id: ${sellerid} deleted successfully`);
      return this.responseHandler.success(
        res,
        "Seller deleted successfully",
        result
      );
    } catch (err) {
      logger.error(`Error deleting seller with id: ${sellerid}`, err);
      return next(err);
    }
  };
}
