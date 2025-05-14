import { v2 as cloudinary } from "cloudinary";
import { injectable, inject } from "tsyringe";
import logger from "../utils/logger";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME2!,
  api_key: process.env.CLOUDINARY_API_KEY2!,
  api_secret: process.env.CLOUDINARY_API_SECRET2!,
});

import { UploadApiOptions } from "cloudinary";
import FileRepository from "../repositories/fileRepository";
export interface CloudinaryService {
  uploadFile(
    input: Buffer | string,
    options: UploadApiOptions,
    additionalData: {
      id: string;
      type: string;
      mimetype: string;
      size?: number;
    }
  ): Promise<string | null>;

  presignedURL(folderPath: string, fileName: string): Promise<string>;

  getCloudFile(publicId: string): Promise<any>;

  getCloudFiles(
    folder: string,
    type: string,
    resourceType: string
  ): Promise<any[]>;

  deleteCloudFile(
    filePath: string,
    type: string,
    resourceType: string
  ): Promise<any>;

  deleteCloudFiles(
    filePaths: string[],
    type: string,
    resourceType: string
  ): Promise<any[]>;

  renameFile(
    oldId: string,
    newId: string,
    type: string,
    resourceType: string
  ): Promise<any>;

  getFileData(): Promise<any[]>;
}

@injectable()
export default class CloudService implements CloudinaryService {
  private readonly imageSizeLimit: number = parseInt(
    process.env.IMAGE_SIZE_LIMIT || `${8 * 1024 * 1024}`,
    10
  );
  constructor(@inject(FileRepository) private fileRepository: FileRepository) {}

  public async uploadFile(
    input: Buffer,
    UploadApiOptions: UploadApiOptions,
    additionalData: {
      id: string;
      type: string;
      mimetype: string;
      size?: number;
    }
  ): Promise<string | null> {
    try {
      const upload = await new Promise<string>((resolve, reject) => {
        if (
          UploadApiOptions.resource_type === "image" &&
          input.length > this.imageSizeLimit
        ) {
          return reject("Image size exceeds the limit");
        }

        const uploadStream = cloudinary.uploader.upload_stream(
          UploadApiOptions,
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result?.secure_url) {
              resolve(result.secure_url);
            } else {
              reject(new Error("Cloudinary upload returned no result"));
            }
          }
        );

        uploadStream.end(input);
      });

      if (upload) {
        await this.fileRepository.create({
          publicid: UploadApiOptions.public_id,
          original_name: additionalData.id,
          type: additionalData.type,
          blob_path: UploadApiOptions.folder,
          mimetype: additionalData.mimetype,
          size: additionalData.size,
          secureUrl: upload,
          status: true,
          resourceType: UploadApiOptions.resource_type,
          action: "upload file to cloud",
        });
      }

      return upload;
    } catch (error) {
      console.error("Upload failed:", error);
      return null;
    }
  }

  public async presignedURL(folderPath: string, fileName: string) {
    const expiresAt = Math.floor(Date.now() / 1000) + 2 * 60;
    try {
      const signedUrl = cloudinary.utils.private_download_url(
        `${folderPath}/${fileName}`,
        "pdf",
        {
          resource_type: "raw",
          type: "private",
          expires_at: expiresAt,
        }
      );
      if (!signedUrl) {
        const error = new Error("Failed to generate a signed URL");
        (error as any).statusCode = 500;
        throw error;
      }
      await this.fileRepository.create({
        publicid: fileName,
        type: "private",
        blob_path: folderPath,
        mimetype: "orders/pdf",
        status: true,
        resourceType: "raw",
        action: "create presigned URL",
      });
      return signedUrl;
    } catch (err) {
      logger.error("Error in signedURL");
      throw err;
    }
  }

  public async getCloudFile(publicId: string) {
    try {
      const result = await cloudinary.api.resource(publicId);
      await this.fileRepository.create({
        publicid: result.public_id,
        type: result.type,
        blob_path: result.asset_folder,
        mimetype: `${result.resource_type}/${result.format}`,
        status: true,
        resourceType: result.resource_type,
        action: "fetch file data from cloud",
      });

      return result;
    } catch (err) {
      logger.error("Error fetching file metadata", err);
      throw err;
    }
  }

  public async getCloudFiles(
    folder: string,
    type: string,
    resourceType: string
  ) {
    try {
      const result = await cloudinary.api.resources({
        type: type,
        prefix: folder,
        resource_type: resourceType,
      });
      const mimeType = folder.split("/")[0] + "/" + resourceType;
      await this.fileRepository.create({
        publicid: folder,
        type: type,
        blob_path: folder,
        mimetype: mimeType,
        status: true,
        resourceType: resourceType,
        action: "fetched multiple file data from cloud",
      });
      return result.resources;
    } catch (err) {
      logger.error("Error listing files");
      throw err;
    }
  }

  public async deleteCloudFile(
    filePath: string,
    type: string,
    resourceType: string
  ) {
    try {
      const data = await cloudinary.uploader.destroy(filePath, {
        type: type,
        resource_type: resourceType,
      });
      if (data.result !== "ok") {
        logger.warn("Resource not found");
        const error = new Error("Resource not found");
        (error as any).statusCode = 404;
        throw error;
      }
      const mimeType = filePath.split("/")[0] + "/" + resourceType;
      await this.fileRepository.create({
        publicid: filePath,
        type: type,
        blob_path: filePath,
        mimetype: mimeType,
        status: true,
        resourceType: resourceType,
        action: "Deleted a file from cloud",
      });
      return data;
    } catch (err) {
      logger.error("Error deleting file");
      throw err;
    }
  }
  public async deleteCloudFiles(
    filePaths: string[],
    type: string,
    resourceType: string
  ) {
    try {
      const results = await Promise.allSettled(
        filePaths.map(async (id) => {
          const result = await cloudinary.uploader.destroy(id, {
            resource_type: resourceType,
            type: type,
          });
          return { id, result };
        })
      );
      for (const res of results) {
        if (res.status === "fulfilled") {
          const { id, result } = res.value;
          if (result.result !== "ok") {
            logger.warn(`File not found while deleting: ${id}`, { result });
          } else {
            logger.info(`Deleted file: ${id}`, { result });
          }
        } else {
          logger.error(`Failed to delete file: ${res.reason}`);
        }
      }
      const mimeType = filePaths[0].split("/")[0] + "/" + resourceType;
      const data = [];
      for (const filePath of filePaths) {
        const saveData = {
          publicid: filePath,
          type: type,
          blob_path: filePath,
          mimetype: mimeType,
          status: true,
          resourceType: resourceType,
          action: "Deleted a file from cloud",
        };
        data.push(saveData);
      }
      await this.fileRepository.insertMany(data);
      return results.filter((r) => {
        if (r.status === "fulfilled" && r.value.result.result === "ok") {
          return r.value.result;
        }
      });
    } catch (err) {
      logger.error("Error deleting multiple files", { error: err });
      throw err;
    }
  }

  public async renameFile(
    oldId: string,
    newId: string,
    type: string,
    resourceType: string
  ) {
    try {
      const renameResult = await cloudinary.uploader.rename(oldId, newId, {
        resource_type: resourceType,
        type: type,
      });
      return renameResult;
    } catch (err) {
      logger.error("Error renaming a file in cloud");
      throw err;
    }
  }

  // public async replaceFile(publicId: string, newFile: Express.Multer.File) {
  //   try {
  //     const oldFile = await this.getCloudFile(publicId);
  //     const folder = oldFile.asset_folder;
  //     const newPublicId = publicId.split("/").pop();

  //     const deleteResult = await this.deleteCloudFile(
  //       publicId,
  //       oldFile.type,
  //       oldFile.resource_type
  //     );

  //     if (!deleteResult || deleteResult.result !== "ok") {
  //       const error = new Error("Failed to delete old file");
  //       (error as any).statusCode = 500;
  //       throw error;
  //     }

  //     const replaceResult = await this.uploadFile(
  //       newFile.buffer,
  //       {
  //         folder,
  //         public_id: newPublicId,
  //         resource_type: oldFile.resource_type,
  //         use_filename: true,
  //         unique_filename: false,
  //         type: oldFile.type,
  //         overwrite: true,
  //       },
  //       {
  //         id: newPublicId || "",
  //         type: oldFile.resource_type,
  //         size: newFile.size,
  //         mimetype: newFile.mimetype,
  //       }
  //     );

  //     await this.fileRepository.create({
  //       publicid: newPublicId,
  //       type: oldFile.type,
  //       blob_path: folder,
  //       mimetype: newFile.mimetype,
  //       status: true,
  //       resourceType: oldFile.resource_type,
  //       action: "Replaced a file in cloud",
  //     });
  //     return replaceResult;
  //   } catch (err) {
  //     logger.error("Error replacing a file in cloud", { error: err });
  //     throw err;
  //   }
  // }

  public async filterData(imageUrl: string) {
    try {
      const data = await this.fileRepository.filterFile(imageUrl);
      if (!data) {
        logger.warn("No data found for the given url");
        return null;
      }
      const public_id = `${data.blob_path}/${data.publicid}`;
      return public_id;
    } catch (err) {
      throw err;
    }
  }
  public async getFileData() {
    try {
      return await this.fileRepository.findAll();
    } catch (err) {
      logger.error("Failed to get data from the database");
      throw err;
    }
  }
}
