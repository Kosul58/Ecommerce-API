import { inject, injectable } from "tsyringe";
import { RequestHandler, response } from "express";
import { AddSeller, SellerUpadte } from "../common/types/sellerType";
import SellerServices from "../services/sellerServices";
@injectable()
export default class SellerController {
  constructor(@inject(SellerServices) private sellerServices: SellerServices) {}

  public getSeller: RequestHandler = async (req, res) => {
    const sellerid = req.user.id;
    try {
      if (!sellerid) {
        res.status(400).json({ message: "Seller ID required" });
        return;
      }
      const seller = await this.sellerServices.getSeller(sellerid);
      if (!seller) {
        res.status(404).json({ message: "No seller found" });
        return;
      }
      res.status(200).json({ message: "seller found", response: seller });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
      return;
    }
  };

  public getSellers: RequestHandler = async (req, res) => {
    try {
      const sellers = await this.sellerServices.getSellers();
      if (!sellers || sellers.length === 0) {
        res.status(404).json({ message: "No seller found" });
        return;
      }
      res.status(200).json({ message: "sellers found", response: sellers });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
      return;
    }
  };

  public signUp: RequestHandler = async (req, res) => {
    const seller: AddSeller = req.body;
    try {
      if (
        !seller.shopname ||
        !seller.username ||
        !seller.email ||
        !seller.password
      ) {
        res
          .status(400)
          .json({ message: "Please provide all required seller info" });
        return;
      }
      const { result, token } = await this.sellerServices.signUp(
        seller,
        "Seller"
      );
      if (!result) {
        res.status(400).json({ message: "Username or Email already taken" });
        return;
      }

      res.status(201).json({
        message: "Seller created successfully",
        response: { result, token },
      });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
      return;
    }
  };
  public signIn: RequestHandler = async (req, res) => {
    const { username, email, password } = req.body;
    try {
      if (!username || !email || !password) {
        res
          .status(400)
          .json({ message: "Please provide username, email, and password" });
        return;
      }
      const { result, token } = await this.sellerServices.signIn(
        username,
        email,
        password
      );
      if (result === "incorrectpwd") {
        res.status(400).json({ message: "Password do not match" });
        return;
      }
      if (!result) {
        res.status(400).json({ message: "No seller found" });
        return;
      }
      res.status(200).json({
        message: "Seller sign in successfull",
        response: { result, token },
      });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
      return;
    }
  };
  public updateSeller: RequestHandler = async (req, res) => {
    try {
      const sellerid = req.user.id;
      const update: SellerUpadte = req.body;
      // if (
      //   !update.username ||
      //   !update.shopname ||
      //   !update.phone ||
      //   !update.address
      // ) {
      //   res.status(400).json({ message: "Enter all fields" });
      //   return;
      // }
      const result = await this.sellerServices.updateSeller(sellerid, update);
      if (result === "utaken") {
        res.status(400).json({ message: "Username already taken" });
        return;
      }
      if (!result) {
        res.status(400).json({
          message: "Failed to update seller datas",
        });
        return;
      }

      res
        .status(200)
        .json({ message: "Updated seller successfully", response: result });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
      return;
    }
  };
  public deleteSeller: RequestHandler = async (req, res) => {
    const sellerid = req.user.id;
    try {
      if (!sellerid) {
        res.status(400).json({ message: "Seller ID required" });
        return;
      }
      const result = await this.sellerServices.deleteSeller(sellerid);
      if (!result) {
        res.status(400).json({ message: "Failed to delete seller" });
        return;
      }
      res.status(200).json({
        message: "Seller deleted successfully",
        response: result,
      });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
      return;
    }
  };
}
