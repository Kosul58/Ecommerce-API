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
interface CloudServiceInterface {
  uploadFile(
    input: Buffer | string,
    options: {
      folder: string;
      public_id?: string;
      resource_type?: "image" | "raw" | "video";
      use_filename?: boolean;
      unique_filename?: boolean;
    }
  ): Promise<string>;
}

@injectable()
export default class CloudService implements CloudServiceInterface {
  private readonly imageSizeLimit: number = parseInt(
    process.env.IMAGE_SIZE_LIMIT || `${8 * 1024 * 1024}`,
    10
  );
  constructor(@inject(Utills) private utils: Utills) {}
  public async uploadFile(
    input: Buffer,
    UploadApiOptions: UploadApiOptions
  ): Promise<string> {
    return await new Promise<string>((resolve, reject) => {
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
  }

  public async signedURL(folderPath: string, fileName: string) {
    const expiresAt = Math.floor(Date.now() / 1000) + 1 * 60;
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
      return signedUrl;
    } catch (err) {
      logger.error("Error in signedURL");
      throw err;
    }
  }

  public async getFile() {}

  public async getFiles() {}

  public async deleteFile() {}

  public async deleteFiles() {}
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
