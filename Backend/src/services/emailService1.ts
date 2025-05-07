import nodemailer from "nodemailer";
import { injectable, inject } from "tsyringe";
import Utills from "../utils/utils";
import logger from "../utils/logger";

@injectable()
export default class EmailService {
  private transporter;
  constructor(@inject(Utills) private utils: Utills) {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  public sendMail = async (
    to: string,
    subject: string,
    type: string,
    data: any
  ) => {
    try {
      const htmlContent = this.utils.emailGenerator(data);
      const text = "This is nodemailer email service";
      const info = await this.transporter.sendMail({
        from: `"Kosul Gurung" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html: htmlContent,
      });
      return true;
    } catch (error) {
      logger.error("Error sending email:", error);
      return false;
    }
  };
}
