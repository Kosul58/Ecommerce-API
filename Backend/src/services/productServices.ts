import categoryService from "./categoryServices.js";
import {
  AddProduct,
  Product,
  UpdateProdcut,
} from "../common/types/productType.js";
import productRepositroy from "../repository/productRepositroy.js";

class ProductServices {
  private async categoryManager(name: string) {
    if (name) {
      const newCategory = {
        name: name,
        description: "",
        parentId: "",
      };
      await categoryService.createCategory(newCategory);
    }
  }

  private async createProduct(productData: AddProduct): Promise<Product> {
    const { name, price, inventory, description, category } = productData;
    if (category) {
      await this.categoryManager(category);
    }
    return {
      name,
      sellerid: productData.sellerid,
      price: Number(price),
      inventory: Number(inventory),
      description,
      category,
    };
  }

  public async getProducts() {
    try {
      return await productRepositroy.getProducts();
    } catch (err) {
      console.log("Failed to get the data of all products", err);
      throw err;
    }
  }

  public async getProductById(productid: string) {
    try {
      return await productRepositroy.getProductById(productid);
    } catch (err) {
      console.log(
        "Failed to get the data of a product based on productid",
        err
      );
      throw err;
    }
  }

  public async addProduct(product: AddProduct) {
    try {
      const check = await productRepositroy.checkProduct(product);
      console.log(check);
      if (check.length > 0) return null;
      const newProduct: Product = await this.createProduct(product);
      return await productRepositroy.addProduct(newProduct);
    } catch (err) {
      console.log("Failed to add a new product", err);
      throw err;
    }
  }

  public async addProducts(products: AddProduct[]) {
    try {
      const filteredProducts = await productRepositroy.checkProducts(products);
      const productList: Product[] = [];
      for (let i = 0; i < filteredProducts.length; i++) {
        const product = await this.createProduct(filteredProducts[i]);
        productList.push(product);
      }
      return await productRepositroy.addProducts(productList);
    } catch (err) {
      console.log("Failed to add a batch of new products", err);
      throw err;
    }
  }

  public async updateProduct(productid: string, update: UpdateProdcut) {
    try {
      const updateFields = Object.fromEntries(
        Object.entries(update).filter(([_, value]) => value !== undefined)
      ) as Partial<UpdateProdcut>;
      if (update.category) {
        await this.categoryManager(update.category);
      }
      return await productRepositroy.updateProduct(productid, updateFields);
    } catch (err) {
      console.log("Failed to update a product", err);
      throw err;
    }
  }

  public async deleteProduct(productid: string) {
    try {
      return await productRepositroy.deleteProduct(productid);
    } catch (err) {
      console.log("Failed to delete a product", err);
      throw err;
    }
  }

  public async modifyInventory(
    id: string,
    quantity: number,
    modification: "increase" | "decrease"
  ) {
    try {
      return await productRepositroy.manageInventory(
        id,
        quantity,
        modification
      );
    } catch (err) {
      console.log("Failed to update the inventory of a product", err);
      throw err;
    }
  }
}

export default new ProductServices();
