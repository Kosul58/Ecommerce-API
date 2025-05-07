import bcrypt from "bcrypt";
import { inject, injectable } from "tsyringe";
// interface Options {
//   [key: string]: string | number | boolean;
// }
// // CLI parser
// export function parseOptions(args: string[]) {
//   const options: Options = {};
//   for (let i = 0; i < args.length; i++) {
//     if (args[i].startsWith("--")) {
//       const key = args[i].slice(2);
//       console.log(key);
//       let nextArg: string | number | boolean = args[i + 1];
//       if (nextArg !== undefined && !nextArg.startsWith("--")) {
//         if (key === "price" || key === "inventory") {
//           nextArg = Number(nextArg);
//         }
//         if (key === "isActive") {
//           nextArg = nextArg === "true";
//         }
//         options[key] = nextArg;
//         i++;
//       }
//     }
//   }
//   return options;
// }

//creation part

@injectable()
export default class Utills {
  public generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  };

  public getCurrentDateTimeStamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}-${hours}:${minutes}`;
  }

  //bcrypt part
  public encryptPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 10);
  };

  public comparePassword = async (
    password: string,
    hash: string
  ): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
  };

  public emailGenerator(data: any) {
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
  public pdfGenerator(data: any): string {
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
