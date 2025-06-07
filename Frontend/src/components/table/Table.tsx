import React from "react";
import { Switch } from "@headlessui/react";
import { FaRegEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { type Datum } from "../../types/sellertypes";

interface ProductTableProps {
  products: Datum[];
  onProductView: (product: Datum) => void;
  onToggleStatus: (productId: string, newStatus: boolean) => void;
  onProductDelete: (productId: string) => void;
  onProductEdit: (product: Datum) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onProductView,
  onToggleStatus,
  onProductDelete,
  onProductEdit,
}) => {
  const columnHeaders = {
    images: "Image",
    name: "Product Name",
    category: "Category",
    price: "Price",
    inventory: "Stock",
    active: "Status",
    discount: "Discount",
    actions: "Actions",
  };

  const headerKeys = Object.keys(columnHeaders) as Array<
    keyof typeof columnHeaders
  >;

  return (
    <div className="w-full overflow-x-auto rounded-md shadow-md border border-gray-300">
      <table className="min-w-full divide-y divide-gray-200 border-b border-gray-200">
        <thead className="bg-blue-50">
          <tr>
            {headerKeys.map((key) => (
              <th
                key={key}
                className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap
                  ${key === "images" ? "w-16" : ""}
                  ${key === "name" ? "min-w-[150px] max-w-[150px]" : ""}
                  ${key === "category" ? "min-w-[100px]" : ""}
                  ${key === "price" ? "w-24" : ""}
                  ${key === "inventory" ? "w-20" : ""}
                  ${key === "active" ? "w-24" : ""}
                  ${key === "discount" ? "w-24" : ""}
                  ${key === "actions" ? "w-24" : ""}
                `}
              >
                {columnHeaders[key]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white text-sm">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              {headerKeys.map((key) => (
                <td
                  key={key}
                  className="px-4 py-4 text-left text-gray-800 whitespace-nowrap"
                >
                  {key === "images" ? (
                    product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 italic">No Image</span>
                    )
                  ) : key === "name" ? (
                    <div className="max-w-[150px] truncate overflow-hidden text-ellipsis">
                      {product.name}
                    </div>
                  ) : key === "active" ? (
                    <Switch
                      checked={product.active}
                      onChange={() =>
                        onToggleStatus(product.id, !product.active)
                      }
                      className={`${
                        product.active ? "bg-blue-400" : "bg-gray-300"
                      } relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors`}
                    >
                      <span
                        className={`${
                          product.active ? "translate-x-6" : "translate-x-1"
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </Switch>
                  ) : key === "actions" ? (
                    <div className="flex gap-1 items-center">
                      <button
                        className="text-gray-600 hover:text-blue-500"
                        onClick={() => onProductView(product)}
                        title="View Product"
                      >
                        <FaRegEye className="w-5 h-5 cursor-pointer" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-blue-500"
                        onClick={() => onProductEdit(product)}
                        title="View Product"
                      >
                        <FaRegEdit className="w-5 h-5 cursor-pointer" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-red-600"
                        onClick={() => onProductDelete(product.id)}
                        title="Delete Product"
                      >
                        <MdDelete className="w-5 h-5 cursor-pointer" />
                      </button>
                    </div>
                  ) : key === "price" ? (
                    `₹${product.price.toFixed(2)}`
                  ) : key === "discount" ? (
                    product.discount && product.discount > 0 ? (
                      `${product.discount}%`
                    ) : (
                      "0"
                    )
                  ) : (
                    product[
                      key as keyof Omit<
                        Datum,
                        "images" | "active" | "price" | "discount"
                      >
                    ]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
