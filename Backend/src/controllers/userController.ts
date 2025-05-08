import { RequestHandler } from "express";
import { injectable, inject } from "tsyringe";
import { AddUser, UpdateUser } from "../common/types/userType.js";
import UserServices from "../services/userServices.js";
import ResponseHandler from "../utils/apiResponse.js";
import logger from "../utils/logger.js";

@injectable()
export default class UserController {
  constructor(
    @inject(UserServices) private userServices: UserServices,
    @inject(ResponseHandler) private responseHandler: ResponseHandler
  ) {}

  public signUp: RequestHandler = async (req, res, next) => {
    const user: AddUser = req.body;
    try {
      logger.info(`Attempting to register user: ${user.username}`);
      const data = await this.userServices.signUp(user, "User");
      const { result, token } = data;
      logger.info(`${user.username} signed up successfully`);
      return this.responseHandler.created(res, "User registered successfully", {
        result,
        token,
      });
    } catch (err) {
      logger.error(`Signup failed for ${user.username}`, err);
      return next(err);
    }
  };

  public signIn: RequestHandler = async (req, res, next) => {
    const { username, email, password } = req.body;
    try {
      logger.info(`User attempting to sign in: ${username || email}`);
      const { result, token } = await this.userServices.signIn(
        username,
        email,
        password
      );
      logger.info(`${username || email} signed in successfully`);
      return this.responseHandler.success(res, "Signin successful", {
        result,
        token,
      });
    } catch (err) {
      logger.error("Signin failed", err);
      return next(err);
    }
  };

  public deleteUser: RequestHandler = async (req, res, next) => {
    const { userid } = req.params;
    const { id, role } = req.user;
    try {
      logger.info(
        `Attempting to delete user with id: ${userid} by ${id} with role ${role}`
      );
      const result = await this.userServices.deleteUser(userid, id, role);
      logger.info(`User with id ${userid} deleted successfully`);
      return this.responseHandler.success(
        res,
        "User deleted successfully",
        result
      );
    } catch (err) {
      logger.error(`Failed to delete user with id: ${userid}`, err);
      return next(err);
    }
  };

  public updateUserInfo: RequestHandler = async (req, res, next) => {
    const userid = req.user.id;
    const update: UpdateUser = req.body;
    try {
      logger.info(
        `Attempting to update information for user with id: ${userid}`
      );
      const result = await this.userServices.updateUserInfo(userid, update);
      if (!result) {
        logger.warn(`User with id: ${userid} not found for update`);
        return this.responseHandler.notFound(res, "User not found");
      }
      logger.info(`User with id: ${userid} updated successfully`);
      return this.responseHandler.success(
        res,
        "User information updated",
        result
      );
    } catch (err) {
      logger.error(`Failed to update user with id: ${userid}`, err);
      return next(err);
    }
  };

  public getUser: RequestHandler = async (req, res, next) => {
    const userid = req.user.id;
    try {
      logger.info(`Fetching user with id: ${userid}`);
      const result = await this.userServices.getUser(userid);
      if (!result) {
        logger.warn(`User with id: ${userid} not found`);
        return this.responseHandler.notFound(res, "User not found");
      }
      logger.info(`User with id: ${userid} found`);
      return this.responseHandler.success(
        res,
        "User search successful",
        result
      );
    } catch (err) {
      logger.error(`Failed to retrieve user with id: ${userid}`, {
        error: err,
      });
      return next(err);
    }
  };

  public getUsers: RequestHandler = async (req, res, next) => {
    try {
      logger.info("Fetching all users");
      const result = await this.userServices.getUsers();
      if (!result || result.length === 0) {
        logger.warn("No users found");
        return this.responseHandler.notFound(res, "Users not found");
      }
      logger.info("Users fetched successfully");
      return this.responseHandler.success(
        res,
        "Users search successful",
        result
      );
    } catch (err) {
      logger.error("Failed to fetch users", err);
      return next(err);
    }
  };

  public sendMail: RequestHandler = async (req, res, next) => {
    try {
      logger.info("Attempting to send mail");
      const result = await this.userServices.sendMail();
      if (!result) {
        logger.error("Failed to send mail");
        return this.responseHandler.error(res, "Failed to send mail");
      }
      logger.info("Mail sent successfully");
      return this.responseHandler.success(
        res,
        "Mail sent successfully",
        result
      );
    } catch (err) {
      logger.error("Failed to send mail", err);
      return next(err);
    }
  };

  public pdf: RequestHandler = async (req, res, next) => {
    try {
      logger.info("Attempting to create pdf");
      const result = await this.userServices.pdf();
      if (!result) {
        logger.error("Failed to create pdf");
        return this.responseHandler.error(res, "Failed to create pdf");
      }
      logger.info("PDF created successfully");
      return this.responseHandler.success(
        res,
        "PDF created successfully",
        result
      );
    } catch (err) {
      logger.error("Failed to create pdf", err);
      return next(err);
    }
  };

  public image: RequestHandler = async (req, res, next) => {
    try {
      logger.info("Attempting to upload images");
      const files = req.files as Express.Multer.File[];
      const result = await this.userServices.uploadImages(files);
      if (!result || result.length === 0) {
        logger.error("Failed to upload image");
        return this.responseHandler.error(res, "Failed to upload image");
      }
      logger.info(`Uploaded ${result.length} image(s) successfully`);
      return this.responseHandler.success(
        res,
        "Images uploaded successfully",
        result
      );
    } catch (err) {
      logger.error("Failed to upload images", err);
      return next(err);
    }
  };
}
