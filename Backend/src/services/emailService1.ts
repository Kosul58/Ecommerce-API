import nodemailer from "nodemailer";
import { injectable } from "tsyringe";

@injectable()
export default class EmailService {
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

  private contentGenerator(data: any) {
    return `
        <div style="font-family: Arial, sans-serif; background-color: #f4f7fa; padding: 20px;">
          <div style="background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
            <h1 style="text-align: center; color: #4CAF50;">Welcome to the Platform!</h1>
            <p style="font-size: 16px; color: #333;">Hi ${data.username},</p>
            <p style="font-size: 16px; color: #333;">Congratulations! Your signup was successful. You can now start ordering all the products we offer.</p>
            
            <h2 style="color: #4CAF50; font-size: 20px;">Your Account Details:</h2>
            <table style="width: 100%; margin-bottom: 20px;">
              <tr>
                <td style="font-size: 16px; color: #333; padding: 5px 0;">Username:</td>
                <td style="font-size: 16px; color: #333; padding: 5px 0; font-weight: bold;">${data.username}</td>
              </tr>
              <tr>
                <td style="font-size: 16px; color: #333; padding: 5px 0;">Email:</td>
                <td style="font-size: 16px; color: #333; padding: 5px 0; font-weight: bold;">${data.email}</td>
              </tr>
            </table>

            <p style="font-size: 16px; color: #333;">Feel free to log in and explore your dashboard.</p>
            <div style="text-align: center;">
              <a href="https://yourwebsite.com/login" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; font-size: 16px; border-radius: 5px;">Go to Login</a>
            </div>

            <footer style="margin-top: 30px; text-align: center; font-size: 12px; color: #aaa;">
              <p>Thank you for choosing our platform.</p>
              <p>Need help? Contact us at <a href="mailto:support@yourwebsite.com" style="color: #4CAF50;">support@yourwebsite.com</a></p>
            </footer>
          </div>
        </div>
      `;
  }

  public sendMail = async (
    to: string,
    subject: string,
    type: string,
    data: any
  ) => {
    try {
      const htmlContent = this.contentGenerator(data);

      const info = await this.transporter.sendMail({
        from: `"Kosul Gurung" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: htmlContent,
      });
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  };
}
