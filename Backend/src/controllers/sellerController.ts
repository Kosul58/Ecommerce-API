import { inject, injectable } from "tsyringe";
import { RequestHandler } from "express";
import { AddSeller, SellerUpadte } from "../common/types/sellerType";
import SellerServices from "../services/sellerServices";
import ResponseHandler from "../utils/apiResponse";

@injectable()
export default class SellerController {
  constructor(
    @inject(SellerServices) private sellerServices: SellerServices,
    @inject(ResponseHandler) private responseHandler: ResponseHandler
  ) {}

  public getSeller: RequestHandler = async (req, res, next) => {
    const sellerid = req.user.id;
    try {
      const seller = await this.sellerServices.getSeller(sellerid);
      if (!seller) {
        return this.responseHandler.notFound(res, "No seller found");
      }
      return this.responseHandler.success(res, "Seller found", seller);
    } catch (err) {
      return next(err);
    }
  };

  public getSellers: RequestHandler = async (req, res, next) => {
    try {
      const sellers = await this.sellerServices.getSellers();
      if (!sellers || sellers.length === 0) {
        return this.responseHandler.notFound(res, "No sellers found");
      }
      return this.responseHandler.success(res, "Sellers found", sellers);
    } catch (err) {
      return next(err);
    }
  };

  public signUp: RequestHandler = async (req, res, next) => {
    const seller: AddSeller = req.body;
    try {
      const { result, token } = await this.sellerServices.signUp(
        seller,
        "Seller"
      );
      if (!result) {
        return this.responseHandler.error(res, "Failed to sign up seller");
      }

      return this.responseHandler.created(res, "Seller created successfully", {
        result,
        token,
      });
    } catch (err) {
      return next(err);
    }
  };

  public signIn: RequestHandler = async (req, res, next) => {
    const { username, email, password } = req.body;
    try {
      const { result, token } = await this.sellerServices.signIn(
        username,
        email,
        password
      );
      if (!result) {
        return this.responseHandler.error(res, "No seller found");
      }

      return this.responseHandler.success(res, "Seller sign in successful", {
        result,
        token,
      });
    } catch (err) {
      return next(err);
    }
  };

  public updateSeller: RequestHandler = async (req, res, next) => {
    const sellerid = req.user.id;
    const update: SellerUpadte = req.body;

    try {
      const result = await this.sellerServices.updateSeller(sellerid, update);
      if (!result) {
        return this.responseHandler.error(res, "Failed to update seller data");
      }
      return this.responseHandler.success(
        res,
        "Updated seller successfully",
        result
      );
    } catch (err) {
      return next(err);
    }
  };

  public deleteSeller: RequestHandler = async (req, res, next) => {
    const { sellerid } = req.params;
    const { id, role } = req.user;
    try {
      const result = await this.sellerServices.deleteSeller(sellerid, id, role);
      if (!result) {
        return this.responseHandler.error(res, "Failed to delete seller");
      }
      return this.responseHandler.success(
        res,
        "Seller deleted successfully",
        result
      );
    } catch (err) {
      return next(err);
    }
  };
}
