import { RequestHandler } from "express";
import { injectable, inject } from "tsyringe";
import { AddUser, UpdateUser } from "../common/types/userType.js";
import UserServices from "../services/userServices.js";
@injectable()
export default class UserController {
  constructor(@inject(UserServices) private userServices: UserServices) {}
  public signUp: RequestHandler = async (req, res) => {
    const user: AddUser = req.body;
    try {
      // if (
      //   !user.firstname ||
      //   !user.lastname ||
      //   !user.username ||
      //   !user.email ||
      //   !user.password
      // ) {
      //   res
      //     .status(400)
      //     .json({ message: "Please provide all required user info" });
      //   return;
      // }
      const data = await this.userServices.signUp(user, "User");
      if (!data) {
        res
          .status(409)
          .json({ message: "Sign up failed. User Already Exists" });
        return;
      }
      const { result, token } = data;
      res.status(201).json({
        message: "User registered successfully",
        response: { result, token },
      });
    } catch (err) {
      console.error("Sign up error:", err);
      res.status(500).json({ message: "Unexpected error during sign up" });
    }
  };

  public signIn: RequestHandler = async (req, res) => {
    const { username, email, password } = req.body;
    try {
      // if (!username || !email || !password) {
      //   res
      //     .status(400)
      //     .json({ message: "Please provide username, email, and password" });
      //   return;
      // }
      const { result, token } = await this.userServices.signIn(
        username,
        email,
        password
      );
      if (result === undefined) {
        res.status(404).json({ message: "Signin failed. User not found" });
        return;
      }
      if (result === "incorrectpwd") {
        res
          .status(400)
          .json({ message: "Signin failed. Password does not match" });
        return;
      }
      res
        .status(200)
        .json({ message: "Signin successful", response: { result, token } });
    } catch (err) {
      console.error("Sign in error:", err);
      res.status(500).json({ message: "Unexpected error during sign in" });
    }
  };

  public deleteUser: RequestHandler = async (req, res) => {
    const userid = req.user.id || req.body.userid;
    try {
      // if (!userid) {
      //   res.status(400).json({ message: "User ID required" });
      //   return;
      // }

      const result = await this.userServices.deleteUser(userid);
      if (!result) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res
        .status(200)
        .json({ message: "User deleted successfully", response: result });
    } catch (err) {
      console.error("Delete user error:", err);
      res
        .status(500)
        .json({ message: "Unexpected error during user deletion" });
    }
  };

  public updateUserInfo: RequestHandler = async (req, res) => {
    const userid = req.user.id;
    const update: UpdateUser = req.body;
    try {
      // if (!userid) {
      //   res.status(400).json({ message: "User ID is required" });
      //   return;
      // }

      // if (Object.keys(update).length === 0) {
      //   res
      //     .status(400)
      //     .json({ message: "Provide at least one field to update" });
      //   return;
      // }

      const result = await this.userServices.updateUserInfo(userid, update);
      if (result === undefined) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      if (result === null) {
        res
          .status(400)
          .json({ message: "Another user with the same username exists" });
        return;
      }

      res
        .status(200)
        .json({ message: "User information updated", response: result });
    } catch (err) {
      console.error("Update user error:", err);
      res.status(500).json({ message: "Unexpected error during update" });
    }
  };

  public getUser: RequestHandler = async (req, res) => {
    const userid = req.user.id;
    try {
      // if (!userid) {
      //   res.status(400).json({ message: "User ID is required" });
      //   return;
      // }

      const result = await this.userServices.getUser(userid);
      if (!result) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res
        .status(200)
        .json({ message: "User search successful", response: result });
    } catch (err) {
      console.error("Search user error:", err);
      res.status(500).json({ message: "Unexpected error during search" });
    }
  };
  public getUsers: RequestHandler = async (req, res) => {
    try {
      const result = await this.userServices.getUsers();
      if (!result) {
        res.status(404).json({ message: "Users not found" });
        return;
      }
      res
        .status(200)
        .json({ message: "Users search successful", response: result });
      return;
    } catch (err) {
      console.error("Search users error:", err);
      res.status(500).json({ message: "Unexpected error during search" });
      return;
    }
  };
}
