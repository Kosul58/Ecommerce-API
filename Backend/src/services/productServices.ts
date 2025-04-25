import { injectable, inject } from "tsyringe";
import categoryService from "./categoryServices.js";
import {
  AddProduct,
  Product,
  UpdateProdcut,
} from "../common/types/productType.js";
import ProductRepository from "../repository/productRepositroy.js";
import CategoryService from "./categoryServices.js";
@injectable()
export default class ProductServices {
  constructor(
    @inject(CategoryService) private categoryService: CategoryService,
    @inject(ProductRepository)
    private productRepositroy: ProductRepository
  ) {}

  private async categoryManager(name: string) {
    if (name) {
      const newCategory = { name, description: "", parentId: "" };
      await this.categoryService.createCategory(newCategory);
    }
  }

  private async createProduct(
    productData: AddProduct,
    sellerid: string
  ): Promise<Product> {
    const { name, price, inventory, description, category } = productData;
    if (category) {
      await this.categoryManager(category);
    }
    return {
      name,
      sellerid,
      price: Number(price),
      inventory: Number(inventory),
      description,
      category,
    };
  }

  public async getProducts() {
    try {
      return await this.productRepositroy.getProducts();
    } catch (err) {
      console.log("Failed to get the data of all products", err);
      throw err;
    }
  }

  public async getProduct(id: string) {
    try {
      return await this.productRepositroy.getProduct(id);
    } catch (err) {
      console.log("Failed to get the data of all products of a seller", err);
      throw err;
    }
  }

  public async getProductById(productid: string) {
    try {
      return await this.productRepositroy.getProductById(productid);
    } catch (err) {
      console.log(
        "Failed to get the data of a product based on productid",
        err
      );
      throw err;
    }
  }

  public async addProduct(product: AddProduct, sellerid: string) {
    try {
      const check = await this.productRepositroy.checkProduct({
        ...product,
        sellerid,
      });
      if (check && Object.keys(check).length > 0) return null;
      const newProduct: Product = await this.createProduct(product, sellerid);
      return await this.productRepositroy.addProduct(newProduct);
    } catch (err) {
      console.log("Failed to add a new product", err);
      throw err;
    }
  }

  public async addProducts(products: AddProduct[], sellerid: string) {
    try {
      //check if prodcuts already exists in db
      const searchedProducts = await this.productRepositroy.checkProducts(
        products
      );
      const existingSet = new Set(
        searchedProducts.map((p: any) => `${p.name}-${p.price}`)
      );
      const filteredProducts = products.filter(
        (p) => !existingSet.has(`${p.name}-${p.price}`)
      );
      const productList: Product[] = [];
      for (const product of filteredProducts) {
        const newProduct = await this.createProduct(product, sellerid);
        productList.push(newProduct);
      }
      return await this.productRepositroy.addProducts(productList);
    } catch (err) {
      console.log("Failed to add a batch of new products", err);
      throw err;
    }
  }

  public async updateProduct(
    productid: string,
    sellerid: string,
    update: UpdateProdcut
  ) {
    try {
      const updateFields = Object.fromEntries(
        Object.entries(update).filter(([_, value]) => value !== undefined)
      ) as Partial<UpdateProdcut>;
      const prodcut = await this.getProductById(productid);
      if (!prodcut || prodcut.sellerid !== sellerid) {
        return null;
      }
      if (update.category) {
        await this.categoryManager(update.category);
      }
      return await this.productRepositroy.updateProduct(
        productid,
        updateFields
      );
    } catch (err) {
      console.log("Failed to update a product", err);
      throw err;
    }
  }

  public async deleteProduct(
    productid: string,
    sellerid: string,
    role: string
  ) {
    try {
      const prodcut = await this.getProductById(productid);
      if (!prodcut || prodcut.sellerid !== sellerid) {
        if (role !== "Admin") {
          return null;
        }
      }
      return await this.productRepositroy.deleteProduct(productid);
    } catch (err) {
      console.log("Failed to delete a product", err);
      throw err;
    }
  }

  public async deleteProducts(id: string) {
    try {
      const products = await this.getProduct(id);
      if (!products || products.length === 0) return "noproducts";
      const deleteIds = products.map((p) => p._id.toString());
      return await this.productRepositroy.deleteProducts(deleteIds);
    } catch (err) {
      console.log("Failed to delete products", err);
      throw err;
    }
  }

  public async modifyInventory(
    id: string,
    quantity: number,
    modification: "increase" | "decrease"
  ) {
    try {
      const product = await this.getProductById(id);
      if (!product) return "noproduct";
      if (modification === "decrease" && product.inventory < quantity) {
        return "insufiicientinventory";
      }
      return await this.productRepositroy.manageInventory(
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
