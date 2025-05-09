import { v2 as cloudinary } from "cloudinary";
import { injectable, inject } from "tsyringe";
import Utills from "../utils/utils";
import logger from "../utils/logger";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

import { UploadApiOptions } from "cloudinary";
import FileRepository from "../repositories/fileRepository";
import { RequestHandler } from "express";
interface CloudinaryService {
  uploadFile(
    input: Buffer | string,
    options: UploadApiOptions,
    additionalData: {
      id: string;
      type: string;
      mimetype: string;
      size?: number;
    }
  ): Promise<string>;
}

@injectable()
export default class CloudService implements CloudinaryService {
  private readonly imageSizeLimit: number = parseInt(
    process.env.IMAGE_SIZE_LIMIT || `${8 * 1024 * 1024}`,
    10
  );
  constructor(
    @inject(Utills) private utils: Utills,
    @inject(FileRepository) private fileRepository: FileRepository
  ) {}

  public async uploadFile(
    input: Buffer,
    UploadApiOptions: UploadApiOptions,
    additionalData: {
      id: string;
      type: string;
      mimetype: string;
      size?: number;
    }
  ): Promise<string> {
    const upload = await new Promise<string>((resolve, reject) => {
      if (
        UploadApiOptions.resource_type === "image" &&
        input.length > this.imageSizeLimit
      ) {
        reject("Image size exceeds the limit");
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
        status: true,
        resourceType: UploadApiOptions.resource_type,
        action: "create",
      });
    }
    return upload;
  }

  public async signedURL(folderPath: string, fileName: string) {
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
      // await this.fileRepository.create({
      //   publicid: fileName,
      //   type: "private",
      //   blob_path: folderPath,
      //   mimetype: "orders/pdf",
      //   status: true,
      //   resourceType: "raw",
      //   action: "create",
      // });

      return signedUrl;
    } catch (err) {
      logger.error("Error in signedURL");
      throw err;
    }
  }

  public async getCloudFile(
    folderPath: string,
    filename: string
    // resourceType: string
  ) {
    try {
      const filePath = `${folderPath}/${filename}`;
      const result = await cloudinary.api.resource(
        filePath
        //    {
        //   resource_type: resourceType,
        // }
      );
      return result;
    } catch (err) {
      logger.error("Error fetching file metadata");
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
      return result.resources;
    } catch (err) {
      logger.error("Error listing files");
      throw err;
    }
  }

  public async deleteCloudFile(filePath: string, type: string) {
    try {
      const data = await cloudinary.uploader.destroy(filePath, {
        resource_type: "raw",
        type: type,
      });
      if (data.result !== "ok") {
        logger.warn("Resource not found");
        const error = new Error("Resource not found");
        (error as any).statusCode = 404;
        throw error;
      }
      return data;
    } catch (err) {
      logger.error("Error deleting file");
      throw err;
    }
  }
  public async deleteCloudFiles(filePaths: string[], type: string) {
    try {
      const results = await Promise.allSettled(
        filePaths.map(async (id) => {
          const result = await cloudinary.uploader.destroy(id, {
            resource_type: "raw",
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

  public async renameCloudFile(
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

  public async getFileData() {
    try {
      return await this.fileRepository.findAll();
    } catch (err) {
      logger.error("Failed to get data from the database");
      throw err;
    }
  }

  // public async uploadPDF(data: any): Promise<string> {
  //   try {
  //     const buffer = await this.utils.generatePDFBuffer(data);
  //     const filename = `order_${data.orderid}`;
  //     return await this.uploadFile(buffer, {
  // folder: "pdfs",
  // public_id: filename,
  // resource_type: "raw",
  // use_filename: true,
  // unique_filename: false,
  //     });
  //   } catch (error) {
  //     logger.error("Error in uploading pdf");
  //     throw error;
  //   }
  // }
  // public async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
  //   try {
  //     const urls = await Promise.all(
  //       files.map((file) =>
  //         this.uploadFile(file.path, {
  //           folder: "uploads",
  //           resource_type: "image",
  //         })
  //       )
  //     );
  //     return urls;
  //   } catch (err) {
  //     logger.error("Image upload failed");
  //     throw err;
  //   }
  // }
}
