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
}
