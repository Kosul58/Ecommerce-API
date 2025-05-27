import { inject, injectable } from "tsyringe";
import OtpRepository from "../repositories/otpRepository";
import { privateca } from "googleapis/build/src/apis/privateca";
import EmailService from "./emailService";
import Utils from "../utils/utils";
import logger from "../utils/logger";

@injectable()
export default class OtpServices {
  constructor(
    @inject(OtpRepository) private otpRepository: OtpRepository,
    @inject(EmailService) private emailService: EmailService
  ) {}

  private otpData(email: string, otp: string) {
    return {
      email: email,
      otp: otp,
    };
  }

  public async send(email: string) {
    try {
      const otp = Utils.generateOtp();
      const data = this.otpData(email, otp);
      const create = await this.otpRepository.create(data);
      if (!create || Object.keys(create).length === 0) {
        logger.warn("Failed to store otp data in the database");
        const error = new Error("Failed to store otp data");
        (error as any).statusCode = 500;
        throw error;
      }
      const sendResult = await this.emailService.sendOtp(email, otp);
      if (!sendResult) {
        logger.warn("OTP created but failed to send it via mail.");
        const error = new Error("OTP created but failed to send it via mail.");
        (error as any).statusCode = 500;
        throw error;
      }
      return sendResult;
    } catch (err) {
      logger.error("Failed to send otp for email verification");
      throw err;
    }
  }
  public async resend(email: string) {
    try {
      const otp = await this.otpRepository.search(email);
      if (!otp || Object.keys(otp).length === 0) {
        logger.warn("No previous otp sent");
        const error = new Error("Invalid request");
        (error as any).statusCode = 401;
        throw error;
      }
      const deleteData = await this.otpRepository.deleteOne(email);
      if (!deleteData || Object.keys(deleteData).length === 0) {
        logger.warn("Failed to delete previous otp data");
        const error = new Error("Failed to delete previous otp data");
        (error as any).statusCode = 500;
        throw error;
      }
      return await this.send(email);
    } catch (err) {
      throw err;
    }
  }
  public async verify(email: string, otp: string) {
    try {
      const data = await this.otpRepository.search(email);
      if (!data || !data.otp) {
        logger.warn("No matching OTP found in the database");
        const error = new Error("No matching OTP data found");
        (error as any).statusCode = 404;
        throw error;
      }
      const otpAge = Date.now() - new Date(data.timestamp).getTime();
      const ttl = 15 * 60 * 1000;
      if (otpAge > ttl) {
        logger.warn("OTP has expired");
        return "otpexpired";
      } else if (otp !== data.otp) {
        logger.warn("Invalid OTP provided");
        return "otpinvalid";
      }
      await this.otpRepository.deleteOne(email);
      return true;
    } catch (err) {
      throw err;
    }
  }
}
