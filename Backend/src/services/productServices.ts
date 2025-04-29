import { injectable, inject } from "tsyringe";
import categoryService from "./categoryServices.js";
import {
  AddProduct,
  Product,
  ProductReturn,
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
  private returnProductData<
    T extends {
      _id: any;
      name: string;
      sellerid: string;
      price: number;
      description: string;
      category: string;
      inventory: number;
    }
  >(product: T): ProductReturn {
    return {
      id: product._id.toString(),
      name: product.name,
      sellerid: product.sellerid,
      price: product.price,
      description: product.description,
      category: product.category,
      inventory: product.inventory,
    };
  }
  public async getProducts() {
    try {
      const products = await this.productRepositroy.getProducts();
      if (!products || products.length === 0) return null;
      return products.map((p) => this.returnProductData(p));
    } catch (err) {
      console.log("Failed to get the data of all products", err);
      throw err;
    }
  }

  //to get the products of a seller
  public async getSellerProducts(id: string) {
    try {
      const products = await this.productRepositroy.getSellerProducts(id);
      if (!products || products.length === 0) return null;
      return products.map((p) => this.returnProductData(p));
    } catch (err) {
      console.log("Failed to get the data of all products of a seller", err);
      throw err;
    }
  }

  public async getProductById(productid: string) {
    try {
      const product = await this.productRepositroy.getProductById(productid);
      if (!product) return null;
      return this.returnProductData(product);
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
      if (check && Object.keys(check).length > 0) return "productexists";
      const newProduct: Product = await this.createProduct(product, sellerid);
      const result = await this.productRepositroy.addProduct(newProduct);
      if (!result) return null;
      return "success";
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
      const result = await this.productRepositroy.addProducts(productList);
      if (!result || result.length === 0) return null;
      return "success";
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
      const result = await this.productRepositroy.updateProduct(
        productid,
        updateFields
      );
      if (!result) return null;
      return "success";
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
      const result = await this.productRepositroy.deleteProduct(productid);
      if (!result || Object.keys(result).length === 0) return null;
      return "success";
    } catch (err) {
      console.log("Failed to delete a product", err);
      throw err;
    }
  }

  public async deleteProducts(id: string) {
    try {
      const products = await this.getSellerProducts(id);
      if (!products || products.length === 0) return "noproducts";
      const deleteIds = products.map((p) => p.id);
      const result = await this.productRepositroy.deleteProducts(deleteIds);
      if (!result || result.deletedCount === 0) return null;
      return "success";
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
      const product = await this.productRepositroy.getProductById(id);
      if (!product) return "noproduct";
      if (modification === "decrease" && product.inventory < quantity) {
        return "insufficientinventory";
      }
      let newInventory = product.inventory ?? 0;
      if (modification === "increase") {
        newInventory += quantity;
      } else {
        newInventory -= quantity;
      }
      const result = await this.productRepositroy.manageInventory(id, quantity);
      if (!result || Object.keys(result).length === 0) return null;
      return "success";
    } catch (err) {
      console.log("Failed to update the inventory of a product", err);
      throw err;
    }
  }
}
