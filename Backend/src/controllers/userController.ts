import { RequestHandler } from "express";
import { injectable, inject } from "tsyringe";
import { AddUser, UpdateUser } from "../common/types/userType";
import UserServices from "../services/userServices";
import ResponseHandler from "../utils/apiResponse";
import logger from "../utils/logger";

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
      const data = await this.userServices.signUp(user);
      const result = data;
      if (!result) {
        logger.error("Failed to sign up User", { user });
        return this.responseHandler.error(res, "Failed to sign up User");
      }
      logger.info(`${user.username} signed up successfully`);
      return this.responseHandler.created(res, "User registered successfully", {
        result,
      });
    } catch (err) {
      logger.error(`Signup failed for ${user.username}`, err);
      return next(err);
    }
  };

  public verifyUser: RequestHandler = async (req, res, next) => {
    const { email, otp } = req.body;
    try {
      logger.info(`Attempting to verify user`);
      const data = await this.userServices.verifyUser(
        email,
        otp
        //  file
      );

      if (data === "otpexpired" || data === "otpinvalid" || !data) {
        logger.error("Failed to sign up user");
        return this.responseHandler.error(res, "Failed to verify user");
      }
      const { result, token, refreshToken } = data;
      logger.info(`User created successfully: ${result.username}`);
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
      return this.responseHandler.created(res, "User verified successfully", {
        result,
        token,
      });
    } catch (err) {
      logger.error("Error during User Verification", err);
      return next(err);
    }
  };

  public signIn: RequestHandler = async (req, res, next) => {
    const { email, password } = req.body;
    try {
      logger.info(`User attempting to sign in: ${email}`);
      const { result, token, refreshToken } = await this.userServices.signIn(
        email,
        password,
        "User"
      );
      logger.info(`${email} signed in successfully`);
      if (!result || result === "adminnotverified") {
        logger.warn(`No user found for credentials: ${email}`);
        return this.responseHandler.notFound(res, "No user found");
      }
      if (result === "usernotverified") {
        return this.responseHandler.success(res, "User email is not verified");
      }

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
      return this.responseHandler.success(res, "Signin successful", {
        result,
        token,
      });
    } catch (err) {
      logger.error("Signin failed", err);
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

    logger.info("User signed out successfully");
    return this.responseHandler.success(res, "Signout successful");
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
    const file = req.file as Express.Multer.File;
    // console.log("file", file);
    // console.log("update", update);
    try {
      logger.info(
        `Attempting to update information for user with id: ${userid}`
      );
      const result = await this.userServices.updateUserInfo(
        userid,
        update,
        file
      );
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

  public changePassword: RequestHandler = async (req, res, next) => {
    const userid = req.user.id;
    const { oldpassword, newpassword } = req.body;
    try {
      logger.info(`Attempting to change password for user with id: ${userid}`);
      const result = await this.userServices.changePassword(
        userid,
        oldpassword,
        newpassword
      );
      if (result == "nouser") {
        return this.responseHandler.notFound(res, "User not found");
      }
      if (result == "nomatch") {
        return this.responseHandler.error(res, "Password does not match");
      }
      logger.info(`Password changed for User with id: ${userid}`);

      if (!result) {
        return this.responseHandler.serverError(
          res,
          "Failed to change user password"
        );
      }

      return this.responseHandler.success(
        res,
        "Password changed for the user",
        result
      );
    } catch (err) {
      logger.error(
        `Failed to change password for user with id: ${userid}`,
        err
      );
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
      const result = await this.userServices.SignUpMail();
      if (!result) {
        logger.error("Failed to send mail");
        return this.responseHandler.error(res, "Failed to send mail");
      }
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
      if (!files || files.length === 0) {
        return this.responseHandler.error(res, "No files provided");
      }
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
