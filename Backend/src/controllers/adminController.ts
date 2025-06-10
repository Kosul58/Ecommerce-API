import { RequestHandler } from "express";
import { injectable, inject } from "tsyringe";
import { AddUser, UpdateUser } from "../common/types/userType";
import ResponseHandler from "../utils/apiResponse";
import logger from "../utils/logger";
import CloudService from "../services/cloudService";
import AdminServices from "../services/adminServices";
@injectable()
export default class AdminController {
  constructor(
    @inject(AdminServices) private adminServices: AdminServices,
    @inject(ResponseHandler) private responseHandler: ResponseHandler,
    @inject(CloudService) private cloudService: CloudService
  ) {}

  public refreshToken: RequestHandler = async (req, res, next) => {
    const token = req.cookies.refreshToken;
    try {
      logger.info("Generating new access token based on refresh token");
      const data = await this.adminServices.accessToken(token);
      logger.info("New Access token generated successfully");
      res.cookie("token", data, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 2, // 15 min bro
        path: "/",
      });
      return this.responseHandler.created(
        res,
        "New Access token generated successfully"
      );
    } catch (err) {
      logger.error("Failed to generate new Access Token ", err);
      return next(err);
    }
  };
  public signUp: RequestHandler = async (req, res, next) => {
    const user: AddUser = req.body;
    // const file = req.file as Express.Multer.File;
    try {
      logger.info("Registering Admin.");
      const data = await this.adminServices.signUp(
        user
        // file
      );
      const result = data;
      if (!result) {
        logger.error("Failed to sign up Admin", { user });
        return this.responseHandler.error(res, "Failed to sign up Admin");
      }
      logger.info(`${user.username} signed up successfully`);
      return this.responseHandler.created(
        res,
        "Admin registered successfully",
        {
          result,
        }
      );
    } catch (err) {
      logger.error("Failed to register admin", err);
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

    logger.info("Admin signed out successfully");
    return this.responseHandler.success(res, "Signout successful");
  };
  public verifyAdmin: RequestHandler = async (req, res, next) => {
    const { email, otp } = req.body;
    try {
      logger.info(`Attempting to verify Admin`);
      const data = await this.adminServices.verifyAdmin(
        email,
        otp
        //  file
      );

      if (data === "otpexpired" || data === "otpinvalid" || !data) {
        logger.error("Failed to sign up user");
        return this.responseHandler.error(res, "Failed to verify admin");
      }
      const { result, token, refreshToken } = data;
      logger.info(`Admin created successfully: ${result.username}`);
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
      return this.responseHandler.created(res, "Admin verified successfully", {
        result,
        token,
      });
    } catch (err) {
      logger.error("Error during Admin Verification", err);
      return next(err);
    }
  };

  public getAdmin: RequestHandler = async (req, res, next) => {
    const userid = req.user.id;
    try {
      logger.info(`Fetching admin data with id: ${userid}`);
      const result = await this.adminServices.getAdmin(userid);
      if (!result) {
        logger.warn(`Admin with id: ${userid} not found`);
        return this.responseHandler.notFound(res, "Admin not found");
      }
      logger.info(`Admin with id: ${userid} found`);
      return this.responseHandler.success(
        res,
        "Admin data fetched successfully",
        result
      );
    } catch (err) {
      logger.error(`Failed to retrieve admin data with id: ${userid}`, {
        error: err,
      });
      return next(err);
    }
  };

  public signIn: RequestHandler = async (req, res, next) => {
    const { email, password } = req.body;
    try {
      logger.info(`Admin attempting to sign in: ${email}`);
      const { result, token, refreshToken } = await this.adminServices.signIn(
        email,
        password
      );

      if (!result || result === "usernotverified") {
        logger.warn(`No admin found for credentials: ${email}`);
        return this.responseHandler.notFound(res, "No admin found");
      }

      if (result === "adminnotverified") {
        return this.responseHandler.success(res, "Admin email is not verified");
      }

      logger.info(`${email} signed in successfully`);
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

  public getPresignedURL: RequestHandler = async (req, res, next) => {
    const folderPath = req.body.folderPath;
    const fileName = req.body.fileName;
    try {
      logger.info("Creating a signed URL");
      const data = await this.cloudService.presignedURL(folderPath, fileName);
      if (!data || data.length === 0) {
        logger.error("Failed to generate URL");
        return this.responseHandler.error(res, "Failed to generate URL");
      }
      logger.info("URL generated successfully");
      return this.responseHandler.success(res, "URL generated.", data);
    } catch (err) {
      logger.error("Error in getSignedURL", err);
      return next(err);
    }
  };

  public getCloudFile: RequestHandler = async (req, res, next) => {
    const publicId = req.body.publicId;

    try {
      logger.info("Getting a file info");
      const data = await this.cloudService.getCloudFile(publicId);
      if (!data || data.length === 0) {
        logger.error("Failed to get a file info");
        return this.responseHandler.error(res, "Failed to get a file info");
      }
      logger.info("File info fetched successfully");
      return this.responseHandler.success(res, "File Info:", data);
    } catch (err) {
      logger.error("Error in getCloudFile", err);
      return next(err);
    }
  };

  public getCloudFiles: RequestHandler = async (req, res, next) => {
    const folderPath = req.body.folderPath;
    const type = req.body.type;
    const resourceType = req.body.resourceType;
    try {
      logger.info("Getting files info");
      const data = await this.cloudService.getCloudFiles(
        folderPath,
        type,
        resourceType
      );
      if (!data || data.length === 0) {
        logger.error("Failed to get files info");
        return this.responseHandler.error(res, "Failed to get files info");
      }
      logger.info("Files info fetched successfully");
      return this.responseHandler.success(res, "Files info fetched.", data);
    } catch (err) {
      logger.error("Error in getCloudFiles", err);
      return next(err);
    }
  };

  public deleteCloudFile: RequestHandler = async (req, res, next) => {
    const filePath = req.body.filePath;
    const type = req.body.type;
    const resourceType = req.body.resourceType;
    try {
      logger.info("Deleting a file from cloud");
      const data = await this.cloudService.deleteCloudFile(
        filePath,
        type,
        resourceType
      );
      if (!data) {
        logger.error("Failed to delete a file");
        return this.responseHandler.error(res, "Failed to delete a file");
      }
      logger.info("file deleted successfully");
      return this.responseHandler.success(res, "File deleted.", data);
    } catch (err) {
      logger.error("Error in deleteCloudFile", err);
      throw err;
    }
  };

  public deleteCloudFiles: RequestHandler = async (req, res, next) => {
    const filePaths = req.body.filePaths;
    const type = req.body.type;
    const resourceType = req.body.resourceType;
    try {
      logger.info("Deleteing cloud fiels");
      const data = await this.cloudService.deleteCloudFiles(
        filePaths,
        type,
        resourceType
      );
      if (!data || data.length === 0) {
        logger.error("Failed to delete files");
        return this.responseHandler.error(res, "Failed to delete files");
      }
      logger.info("Files deleted successfully");
      return this.responseHandler.success(res, "Files deleted.", data);
    } catch (err) {
      logger.error("Error in deleteCloudFiles", err);
      throw err;
    }
  };

  public renameCloudFile: RequestHandler = async (req, res, next) => {
    const oldId = req.body.oldId;
    const newId = req.body.newId;
    const type = req.body.type;
    const resourceType = req.body.resourceType;

    try {
      logger.info("Renaming a file");
      const data = await this.cloudService.renameFile(
        oldId,
        newId,
        type,
        resourceType
      );
      if (!data || data.length === 0) {
        logger.error("Failed to rename a file");
        return this.responseHandler.error(res, "Failed to rename a file");
      }
      logger.info("File renamed successfully");
      return this.responseHandler.success(res, "File renamed.", data);
    } catch (err) {
      logger.error("Error in renameCloudFile", err);
      return next(err);
    }
  };
  public getFileData: RequestHandler = async (req, res, next) => {
    try {
      logger.info("Fetching file data from database");
      const data = await this.cloudService.getFileData();
      if (!data || data.length === 0) {
        logger.error("Failed to fetch data");
        return this.responseHandler.error(res, "Failed to fetch data");
      }
      logger.info("Data fetched successfully");
      return this.responseHandler.success(
        res,
        "Data fetched successfully.",
        data
      );
    } catch (err) {
      logger.error("Error in getFileData", err);
      return next(err);
    }
  };
}
