import bcrypt from "bcrypt";
import { inject, injectable } from "tsyringe";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import logger from "../utils/logger";

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

  public generatePath() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  }
  public emailGenerator(data: { username: string; email: string }): string {
    const templatePath = path.join(process.cwd(), "src/templates/mail.html");
    let template = fs.readFileSync(templatePath, "utf-8");
    template = template
      .replace(/{{username}}/g, data.username)
      .replace(/{{email}}/g, data.email);
    return template;
  }

  public pdfGenerator(data: any): string {
    const templatePath = path.join(process.cwd(), "src/templates/pdf.html");
    //  "backend/src/templates/pdf.html";
    let template = fs.readFileSync(templatePath, "utf-8");
    const productList = data.products
      .map((productId: string) => `<li>Product ID: ${productId}</li>`)
      .join("");
    template = template
      .replace(/{{username}}/g, data.username)
      .replace(/{{orderid}}/g, data.orderid)
      .replace(/{{paymentType}}/g, data.paymentType)
      .replace(
        /{{deliveryTime}}/g,
        new Date(data.deliveryTime).toLocaleString()
      )
      .replace(/{{productList}}/g, productList)
      .replace(/{{total}}/g, data.total);
    return template;
  }

  public async generatePDFBuffer(data: any): Promise<Buffer> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const htmlContent = this.pdfGenerator(data);
    logger.info("Generating pdf buffer");
    await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });
    const pdfBuffer = Buffer.from(await page.pdf({ format: "A4" }));
    await browser.close();
    return pdfBuffer;
  }
}
