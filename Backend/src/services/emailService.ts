import nodemailer from "nodemailer";
import { injectable, inject } from "tsyringe";
import Utils from "../utils/utils";
import logger from "../utils/logger";
import { UserReturn, UserRole } from "../common/types/userType";
import {
  OrderMailData,
  ProductMail,
  SignUpMail,
} from "../common/types/mailType";
import { DeliveryStatus } from "../common/types/orderType";

interface EmailServiceInterface {}
@injectable()
export default class EmailService implements EmailServiceInterface {
  private transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  private async sendMail(
    mailData: { email: string; subject: string },
    htmlContent: string
  ) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Kosul Gurung" <${process.env.EMAIL_USER}>`,
        to: mailData.email,
        subject: mailData.subject,
        html: htmlContent,
      });
      if (info.rejected.length > 0) {
        logger.error(`Email rejected for: ${info.rejected.join(", ")}`);
        return false;
      }
      return true;
    } catch (error) {
      logger.error("Error sending email");
      throw error;
    }
  }
  public async signUpMail(
    data: {
      email: string;
      username: string;
    },
    role: UserRole
  ) {
    try {
      logger.info("Sending mail for successfull sign up");
      const mailType = `${role.toLowerCase()}_signup`;
      const htmlContent = Utils.emailGenerator(data, mailType);
      if (!htmlContent) {
        logger.warn("Invalid mailtype");
        return false;
      }
      const mailData = {
        email: data.email,
        subject: "SignUp Complete.",
      };
      return await this.sendMail(mailData, htmlContent);
    } catch (err) {
      logger.error("Failed to send singup mail", err);
      throw err;
    }
  }

  public async sendOtp(email: string, otp: string) {
    try {
      logger.info("Sending otp for email verification");
      const htmlContent = Utils.otpMail(otp);
      if (!htmlContent) {
        logger.warn("Invalid mailtype");
        return false;
      }
      const mailData = {
        email: email,
        subject: "Email Verification",
      };
      return await this.sendMail(mailData, htmlContent);
    } catch (err) {
      throw err;
    }
  }

  public async deleteAcountMail(
    data: {
      email: string;
      username: string;
    },
    role: UserRole
  ) {
    try {
      logger.info("Sending mail for successfull deletion of account");
      const mailType = `${role.toLowerCase()}_delete`;
      const htmlContent = Utils.emailGenerator(data, mailType);
      if (!htmlContent) {
        logger.warn("Invalid mailtype");
        return false;
      }
      const mailData = {
        email: data.email,
        subject: "Account Deletion Complete.",
      };
      return await this.sendMail(mailData, htmlContent);
    } catch (err) {
      logger.error("Failed to send singup mail", err);
      throw err;
    }
  }
  public async orderStatusMail(data: OrderMailData, status: DeliveryStatus) {
    try {
      logger.info("Sending mail for updated order status.");
      const mailType = `order_${status.toLowerCase()}`;
      const htmlContent = Utils.emailGenerator(data, mailType);
      if (!htmlContent) {
        logger.warn("Invalid mailtype");
        return false;
      }
      const mailData = {
        email: data.email,
        subject: `Order ${status} for ${data.username}`,
      };
      return await this.sendMail(mailData, htmlContent);
    } catch (err) {
      logger.error("Failed to send singup mail", err);
      throw err;
    }
  }

  // public async addProductMail(
  //   productData: ProductMail[],
  //   sellerData: SignUpMail,
  //   email: string
  // ) {
  //   try {
  //     logger.info("Sending mail for successfull addition of products.");
  //     const mailType = `product_add`;
  //     const data = {
  //       productData,
  //       sellerData,
  //     };
  //     const htmlContent = Utils.emailGenerator(data, mailType);
  //     if (!htmlContent) {
  //       logger.warn("Invalid mailtype");
  //       return false;
  //     }
  //     const mailData = {
  //       email: email,
  //       subject: "Account Deletion Complete.",
  //     };
  //     return await this.sendMail(mailData, htmlContent);
  //   } catch (err) {
  //     logger.error("Failed to send singup mail", err);
  //     throw err;
  //   }
  // }
  // public async hideProductMail(data: any) {
  //   try {
  //   } catch (error) {}
  // }
  // public async deleteProductMail(data: any) {
  //   try {
  //   } catch (error) {}
  // }
  // public async orderedProductMail(data: any) {
  //   try {
  //   } catch (error) {}
  // }
  // public async canceledProductMail(data: any) {
  //   try {
  //   } catch (error) {}
  // }
}
