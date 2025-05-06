import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { injectable } from "tsyringe";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

@injectable()
export default class PdfService {
  public async generatePDF(data: any): Promise<string> {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      const htmlContent = this.buildHtmlContent(data);
      await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });

      const pdfFolder = path.resolve(process.cwd(), "pdf");
      if (!fs.existsSync(pdfFolder)) {
        fs.mkdirSync(pdfFolder, { recursive: true });
      }

      const outputPath = path.join(pdfFolder, `mypdf_${data.username}.pdf`);
      await page.pdf({ path: outputPath, format: "A4" });
      await browser.close();

      const result = await cloudinary.uploader.upload(outputPath, {
        resource_type: "raw",
        folder: "pdfs",
        public_id: `order_${data.orderid}`,
        use_filename: true,
        unique_filename: false,
      });
      // Optional: delete local file after upload
      //fs.unlinkSync(outputPath);
      return result.secure_url;
    } catch (error) {
      console.error("PDF generation or upload failed:", error);
      throw error;
    }
  }

  private buildHtmlContent(data: any): string {
    const productList = data.products
      .map((productId: string) => `<li>Product ID: ${productId}</li>`)
      .join("");

    return `
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
            body { font-family: 'Inter', sans-serif; background: #f4f6f8; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px;
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05); padding: 40px; }
            h1 { color: #4CAF50; font-size: 28px; margin-bottom: 20px; }
            p { font-size: 16px; line-height: 1.6; color: #333333; margin: 8px 0; }
            .footer { margin-top: 30px; font-size: 14px; color: #888888; }
            .highlight { color: #4CAF50; font-weight: 600; }
            .order-summary { margin-top: 20px; padding: 15px; background: #f0f0f0; border-radius: 8px; }
            .order-summary h3 { margin-bottom: 10px; font-size: 20px; color: #333; }
            .order-summary p, .order-summary ul { font-size: 14px; color: #555; }
            .total { font-size: 18px; font-weight: bold; color: #333; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Order Confirmation 🎉</h1>
            <p>Hi <span class="highlight">${data.username}</span>,</p>
            <p>Your order has been successfully processed!</p>
            <div class="order-summary">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> ${data.orderid}</p>
              <p><strong>Payment Type:</strong> ${data.paymentType}</p>
              <p><strong>Delivery Time:</strong> ${new Date(
                data.deliveryTime
              ).toLocaleString()}</p>
              <p><strong>Products:</strong></p>
              <ul>${productList}</ul>
            </div>

            <div class="total">
              <p>Total: Rs. ${data.total}</p>
            </div>

            <div class="footer">
              ❤️ Thank you for shopping with us. Your items will be delivered soon!
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
