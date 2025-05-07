import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { injectable, inject } from "tsyringe";
import Utills from "../utils/utils";
import logger from "../utils/logger";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

@injectable()
export default class CloudService {
  constructor(@inject(Utills) private utils: Utills) {}
  public async uploadPDF(data: any): Promise<string> {
    try {
      const buffer = await this.generatePDFBuffer(data);
      const filename = `order_${data.orderid}`;
      return await this.uploadPDFBuffer(buffer, filename);
    } catch (error) {
      logger.error("Error in uploading pdf");
      throw error;
    }
  }
  public async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
    try {
      const urls = await Promise.all(
        files.map((file) =>
          this.uploadFile(file.path, {
            folder: "uploads",
            resource_type: "image",
          })
        )
      );
      return urls;
    } catch (err) {
      logger.error("Image upload failed");
      throw err;
    }
  }
  private async uploadFile(
    input: Buffer | string,
    options: {
      folder: string;
      public_id?: string;
      resource_type?: "image" | "raw" | "video";
      use_filename?: boolean;
      unique_filename?: boolean;
    }
  ): Promise<string> {
    if (typeof input === "string") {
      const result = await cloudinary.uploader.upload(input, options);
      fs.unlinkSync(input);
      return result.secure_url;
    } else {
      return await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          options,
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
  }
  private async generatePDFBuffer(data: any): Promise<Buffer> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const htmlContent = this.utils.pdfGenerator(data);
    logger.info("Generating pdf buffer");

    await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });

    const pdfBuffer = Buffer.from(await page.pdf({ format: "A4" }));
    await browser.close();

    return pdfBuffer;
  }
  private async uploadPDFBuffer(
    buffer: Buffer,
    filename: string
  ): Promise<string> {
    return await this.uploadFile(buffer, {
      folder: "pdfs",
      public_id: filename,
      resource_type: "raw",
      use_filename: true,
      unique_filename: false,
    });
  }
}
