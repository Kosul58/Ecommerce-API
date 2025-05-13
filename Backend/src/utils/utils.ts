import bcrypt from "bcrypt";
import { inject, injectable } from "tsyringe";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import logger from "../utils/logger";
import {
  Options,
  DeleteMail,
  ProductMail,
  SignUpMail,
  OrderMailData,
} from "../common/types/mailType";
@injectable()
export default class Utils {
  // CLI parser
  static parseOptions(args: string[]) {
    const options: Options = {};
    for (let i = 0; i < args.length; i++) {
      if (args[i].startsWith("--")) {
        const key = args[i].slice(2);
        console.log(key);
        let nextArg: string | number | boolean = args[i + 1];
        if (nextArg !== undefined && !nextArg.startsWith("--")) {
          if (key === "price" || key === "inventory") {
            nextArg = Number(nextArg);
          }
          if (key === "isActive") {
            nextArg = nextArg === "true";
          }
          options[key] = nextArg;
          i++;
        }
      }
    }
    return options;
  }
  static generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  };
  static getCurrentDateTimeStamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}-${hours}:${minutes}`;
  }

  //bcrypt part
  static encryptPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 10);
  };

  static comparePassword = async (
    password: string,
    hash: string
  ): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
  };

  static generatePath() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  }
  static emailGenerator(
    data: DeleteMail | SignUpMail | OrderMailData,
    mailType: string
  ) {
    switch (mailType) {
      case "user_signup":
      case "seller_signup":
      case "admin_signup":
        return this.signUpMail(data as SignUpMail, mailType);
      case "user_delete":
      case "seller_delete":
        return this.deleteMail(data as DeleteMail, mailType);
      case "order_placed":
        return this.orderPlacedMail(data as OrderMailData, mailType);
      case "order_confirmed":
      case "order_delivered":
      case "order_canceled":
        return this.orderStatusMail(data as OrderMailData, mailType);
    }
  }

  static orderStatusMail(data: OrderMailData, mailType: string): string {
    const templatePath = path.join(process.cwd(), `templates/${mailType}.html`);
    let template = fs.readFileSync(templatePath, "utf-8");
    template = template
      .replace(/{{username}}/g, data.username)
      .replace(/{{email}}/g, data.email)
      .replace(/{{cost}}/g, String(data.cost))
      .replace(/{{paymentMethod}}/g, data.paymentMethod);
    const productRows = data.products
      .map(
        (product) => `
        <tr>
          <td>${product.name}</td>
          <td>${product.price}</td>
          <td>${product.quantity}</td>
        </tr>`
      )
      .join("");
    template = template.replace(
      /{{#each products}}([\s\S]*?){{\/each}}/,
      productRows
    );
    return template;
  }

  static orderPlacedMail(data: OrderMailData, mailType: string): string {
    const templatePath = path.join(process.cwd(), `templates/${mailType}.html`);
    let template = fs.readFileSync(templatePath, "utf-8");
    template = template
      .replace(/{{username}}/g, data.username)
      .replace(/{{email}}/g, data.email)
      .replace(/{{cost}}/g, `${data.cost}`);
    const productRows = data.products
      .map(
        (product: { name: string; price: number; quantity: number }) => `
      <tr>
        <td>${product.name}</td>
        <td>${product.price}</td>
        <td>${product.quantity}</td>
      </tr>`
      )
      .join("");

    template = template.replace(
      /{{#each products}}[\s\S]*?{{\/each}}/,
      productRows
    );
    return template;
  }

  static deleteMail(data: DeleteMail, mailType: string) {
    const templatePath = path.join(process.cwd(), `templates/${mailType}.html`);
    let template = fs.readFileSync(templatePath, "utf-8");
    template = template
      .replace(/{{username}}/g, data.username)
      .replace(/{{email}}/g, data.email);
    return template;
  }

  static signUpMail(data: SignUpMail, mailType: string) {
    const templatePath = path.join(process.cwd(), `templates/${mailType}.html`);
    let template = fs.readFileSync(templatePath, "utf-8");
    template = template
      .replace(/{{username}}/g, data.username)
      .replace(/{{email}}/g, data.email);
    return template;
  }

  static pdfGenerator(data: any): string {
    const templatePath = path.join(process.cwd(), "templates/pdf.html");
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

  static async generatePDFBuffer(data: any): Promise<Buffer> {
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
