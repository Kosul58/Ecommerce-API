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

  public getSeller: RequestHandler = async (req, res) => {
    const sellerid = req.user.id;
    try {
      const seller = await this.sellerServices.getSeller(sellerid);
      if (!seller) {
        return this.responseHandler.notFound(res, "No seller found");
      }
      return this.responseHandler.success(res, "Seller found", seller);
    } catch (err) {
      console.error("Get seller error:", err);
      return this.responseHandler.error(res, "Server error");
    }
  };

  public getSellers: RequestHandler = async (_req, res) => {
    try {
      const sellers = await this.sellerServices.getSellers();
      if (!sellers || sellers.length === 0) {
        return this.responseHandler.notFound(res, "No sellers found");
      }
      return this.responseHandler.success(res, "Sellers found", sellers);
    } catch (err) {
      console.error("Get sellers error:", err);
      return this.responseHandler.error(res, "Server error");
    }
  };

  public signUp: RequestHandler = async (req, res) => {
    const seller: AddSeller = req.body;
    try {
      const { result, token } = await this.sellerServices.signUp(
        seller,
        "Seller"
      );

      if (result === "taken") {
        return this.responseHandler.conflict(
          res,
          "Seller with the same credentials already exists"
        );
      }
      if (!result) {
        return this.responseHandler.error(res, "Failed to sign up seller");
      }

      return this.responseHandler.created(res, "Seller created successfully", {
        result,
        token,
      });
    } catch (err) {
      console.error("Sign up error:", err);
      return this.responseHandler.error(res, "Server error");
    }
  };

  public signIn: RequestHandler = async (req, res) => {
    const { username, email, password } = req.body;
    try {
      const { result, token } = await this.sellerServices.signIn(
        username,
        email,
        password
      );

      if (result === "incorrectpwd") {
        return this.responseHandler.error(res, "Password does not match");
      }
      if (!result) {
        return this.responseHandler.error(res, "No seller found");
      }

      return this.responseHandler.success(res, "Seller sign in successful", {
        result,
        token,
      });
    } catch (err) {
      console.error("Sign in error:", err);
      return this.responseHandler.error(res, "Server error");
    }
  };

  public updateSeller: RequestHandler = async (req, res) => {
    const sellerid = req.user.id;
    const update: SellerUpadte = req.body;

    try {
      const result = await this.sellerServices.updateSeller(sellerid, update);

      if (result === "utaken") {
        return this.responseHandler.conflict(res, "Username already taken");
      }
      if (result === "phonetaken") {
        return this.responseHandler.conflict(res, "Phone number already taken");
      }
      if (!result) {
        return this.responseHandler.error(res, "Failed to update seller data");
      }

      return this.responseHandler.success(
        res,
        "Updated seller successfully",
        result
      );
    } catch (err) {
      console.error("Update seller error:", err);
      return this.responseHandler.error(res, "Server error");
    }
  };

  public deleteSeller: RequestHandler = async (req, res) => {
    const sellerid = req.user.id;
    try {
      const result = await this.sellerServices.deleteSeller(sellerid);
      if (!result) {
        return this.responseHandler.error(res, "Failed to delete seller");
      }

      return this.responseHandler.success(
        res,
        "Seller deleted successfully",
        result
      );
    } catch (err) {
      console.error("Delete seller error:", err);
      return this.responseHandler.error(res, "Server error");
    }
  };
}
