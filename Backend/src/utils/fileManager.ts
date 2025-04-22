import { promises as fsPromises } from "fs";
import { ProductOptions } from "../common/types/productType.js";

class FileManager {
  // Method to read data from file
  // private readonly path: string;
  // constructor(path: string) {
  //   this.path = path;
  // }
  async readFromFile(path: string) {
    try {
      const data = await fsPromises.readFile(path, "utf8");
      return JSON.parse(data);
    } catch (err) {
      console.log("Failed to read from file", err);
      throw err;
    }
  }
  // Method to write data to file
  async writeToFile(path: string, data: ProductOptions[]) {
    try {
      await fsPromises.writeFile(path, JSON.stringify(data));
    } catch (err) {
      console.log("Failed to write to file", err);
      throw err;
    }
  }
}

export default new FileManager();

// export const appendToFile = async (path: string, data) => {
//   await fsPromises.appendFile(path, JSON.stringify(data));
// };
