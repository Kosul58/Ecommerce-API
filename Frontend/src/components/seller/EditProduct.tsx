import React, { useState, useEffect } from "react";
import type { Datum } from "../../types/sellertypes";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { IoAddCircleOutline } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";
import { MdOutlineEditCalendar } from "react-icons/md";
import { RiImageEditLine } from "react-icons/ri";
import {
  useAddImages,
  useRemoveImages,
  useUpdateProduct,
} from "../../api/product";
import { EditProductSchema } from "../../validations/productValidation";
import ProductCategory from "./ProductCategory";
import { MdEditNote } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import { useDiscountTypes } from "../../hooks/discounts";
import type { Discounts } from "../dropdowns/DiscountDropdown";
import Button from "../buttons/Buttons";

interface EditProductForm {
  name: string;
  price: number;
  inventory: number;
  category: string;
  discount: number;
  description: string;
}

const EditProduct: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product: Datum | undefined = location.state?.product;
  console.log(product);
  console.log(product?.discountType);
  const [discountType, setDiscountType] = useState<string>(
    product?.discountType ?? ""
  );
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<Set<string>>(
    new Set()
  );

  const {
    data: discountTypesData,
    isLoading: discountTypesLoading,
    isError: discountTypesError,
  } = useDiscountTypes();
  const { mutateAsync: uploadImages, isPending: isUploading } = useAddImages();
  const { mutateAsync: removeImages, isPending: isRemoving } =
    useRemoveImages();
  const { mutateAsync: updateProduct, isPending: isUpdatingProduct } =
    useUpdateProduct();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EditProductForm>({
    defaultValues: product
      ? {
          name: product.name,
          price: product.price,
          inventory: product.inventory,
          category: product.category,
          description: product.description ?? "",
          discount: product.discount ?? 0,
        }
      : {
          discount: 0,
        },
    resolver: yupResolver(EditProductSchema),
    mode: "onTouched",
  });

  const currentDiscountValue = watch("discount");

  useEffect(() => {
    if (product) {
      setValue("name", product.name);
      setValue("price", product.price);
      setValue("inventory", product.inventory);
      setValue("category", product.category);
      setValue("description", product.description ?? "");
      setValue("discount", product.discount ?? 0);
      setDiscountType(product.discountType ?? "");
      setImages(product.images || []);
    }
  }, [product, setValue]);

  useEffect(() => {
    if (currentDiscountValue === 0) {
      setDiscountType("");
    }
  }, [currentDiscountValue]);

  const onSubmit = async (data: EditProductForm) => {
    if (!product) {
      console.error("Product data is missing. Cannot update.");
      return;
    }

    const payload = {
      name: data.name,
      price: data.price,
      inventory: data.inventory,
      category: data.category,
      description: data.description,
      discount: data.discount,
      discountType:
        data.discount > 0 && discountType ? discountType : undefined,
      url: `/product/${product.id}`,
    };

    try {
      const response = await updateProduct(payload);
      if (response && response.success) {
        console.log("Update successful:", response.data);
        alert("Product updated successfully!");
      } else {
        throw new Error(response?.message || "Product update failed");
      }
    } catch (err) {
      console.error("Error updating product:", err);
      alert(`Failed to update product: ${err || "Unknown error"}`);
    }
  };

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !product) return;

    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    const invalidFiles: string[] = [];
    const formData = new FormData();

    Array.from(files).forEach((file) => {
      if (validTypes.includes(file.type)) {
        formData.append("images", file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      alert(`Invalid file types provided: ${invalidFiles.join(", ")}`);
      e.target.value = "";
      return;
    }

    const values = { formData, url: `/product/image/${product.id}` };

    try {
      const response = await uploadImages(values);
      if (response && response.data) {
        const newImages = [...images, ...(response.data || [])];
        setImages(newImages);
        alert("Images uploaded successfully!");
      } else {
        throw new Error(response?.message || "Image upload failed");
      }
    } catch (err) {
      console.error("Error in adding images:", err);
      alert(`Failed to upload images: ${err || "Unknown error"}`);
    }
    e.target.value = "";
  };

  const toggleSelectImage = (url: string) => {
    setSelectedToDelete((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(url)) {
        newSet.delete(url);
      } else {
        newSet.add(url);
      }
      return newSet;
    });
  };

  const confirmDelete = async () => {
    if (selectedToDelete.size === 0 || !product) return;
    if (
      !window.confirm(
        "Are you sure you want to delete the selected images? This action cannot be undone."
      )
    ) {
      return;
    }

    const deleteImages = Array.from(selectedToDelete);
    const payload = {
      imageUrl: deleteImages,
      productid: product.id,
    };

    try {
      const response = await removeImages(payload);
      if (response && response.success) {
        const newImages = images.filter((i) => !deleteImages.includes(i));
        setImages(newImages);
        alert("Selected images deleted successfully!");
      } else {
        throw new Error(response?.message || "Image deletion failed");
      }
    } catch (err) {
      console.error("Error in removing images:", err);
      alert(`Failed to delete images: ${err || "Unknown error"}`);
    } finally {
      setSelectedToDelete(new Set());
      setDeleteMode(false);
    }
  };

  const cancelDeleteMode = () => {
    setSelectedToDelete(new Set());
    setDeleteMode(false);
  };

  const handleDiscountTypeSelect = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setDiscountType(e.target.value);
  };

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-4 text-center">
        <p className="text-3xl font-bold text-gray-800 mb-6 animate-pulse">
          Product data is missing!
        </p>
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          It looks like you've landed on this page without selecting a product
          for editing. Please navigate back to your product list to choose an
          item.
        </p>
        <Button
          onClick={() => navigate("/seller/products")}
          variant="secondary"
          className="cursor-pointer"
        >
          <MdEditNote size={24} /> Go to Products
        </Button>
      </div>
    );
  }

  return (
    <section className="w-full h-screen max-h-screen  bg-gray-100">
      <h2 className="w-full flex items-center gap-3 px-6 py-3 text-3xl font-extrabold text-gray-900 bg-white  shadow-lg  border border-gray-200">
        <MdEditNote size={36} className="text-indigo-600" />
        Edit Product
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-full max-h-[90vh] overflow-auto mx-auto space-y-8 p-8 bg-white  shadow-3xl border border-gray-200"
      >
        <div className="flex w-full justify-evenly  gap-4 max-md:flex-col">
          <div className="w-3/5 max-md:w-full p-7 rounded-xl shadow-lg border border-gray-200">
            <h3 className="flex items-center gap-3 text-2xl font-bold text-gray-700 mb-6 pb-3 border-b-2 border-gray-200">
              <MdOutlineEditCalendar size={30} className="text-gray-700" />
              Product Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              <div>
                <label
                  htmlFor="name"
                  className="block text-lg font-semibold text-gray-800 mb-2"
                >
                  Product Name
                </label>
                <input
                  id="name"
                  {...register("name")}
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder-gray-400 text-base transition duration-200 ease-in-out"
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-2 font-medium">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="block text-lg font-semibold text-gray-800 mb-2"
                >
                  Price (NPR)
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register("price")}
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder-gray-400 text-base transition duration-200 ease-in-out"
                  placeholder="e.g., 999.00"
                />
                {errors.price && (
                  <p className="text-red-600 text-sm mt-2 font-medium">
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="inventory"
                  className="block text-lg font-semibold text-gray-800 mb-2"
                >
                  Inventory Stock
                </label>
                <input
                  id="inventory"
                  type="number"
                  {...register("inventory")}
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder-gray-400 text-base transition duration-200 ease-in-out"
                  placeholder="e.g., 150"
                />
                {errors.inventory && (
                  <p className="text-red-600 text-sm mt-2 font-medium">
                    {errors.inventory.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col justify-start items-start pt-2">
                <label
                  htmlFor="category"
                  className="block text-lg font-semibold text-gray-800 mb-2"
                >
                  Category
                </label>
                <ProductCategory
                  onCategorySelect={(categoryName) =>
                    setValue("category", categoryName)
                  }
                />
                {errors.category && (
                  <p className="text-red-600 text-sm mt-2 font-medium">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-lg font-semibold text-gray-800 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  {...register("description")}
                  rows={6}
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder-gray-400 resize-y text-base transition duration-200 ease-in-out"
                  placeholder="Provide a detailed description of the product..."
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-2 font-medium">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="w-1/3 max-md:w-full p-7  rounded-xl shadow-lg border border-gray-200">
            <h3 className="flex items-center gap-3 text-2xl font-bold text-gray-700 mb-6 pb-3 border-b-2 border-gray-200">
              <MdOutlineEditCalendar size={30} />
              Set Discount
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7 items-start">
              <div>
                <label
                  htmlFor="discount"
                  className="block text-lg font-semibold text-gray-800 mb-2"
                >
                  Discount(%)
                </label>
                <input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  {...register("discount")}
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-gray-50 text-gray-900 placeholder-gray-400 text-base transition duration-200 ease-in-out"
                  placeholder="e.g., 10 (for 10%)"
                />
                {errors.discount && (
                  <p className="text-red-600 text-sm mt-2 font-medium">
                    {errors.discount.message}
                  </p>
                )}
              </div>

              {currentDiscountValue > 0 && (
                <div>
                  <label
                    htmlFor="discountType"
                    className="block text-lg font-semibold text-gray-800 mb-2"
                  >
                    Discount Type
                  </label>
                  {discountTypesLoading ? (
                    <p className="text-gray-600 px-5 py-3">
                      Loading discount types...
                    </p>
                  ) : discountTypesError ? (
                    <p className="text-red-600 px-5 py-3">
                      Error loading discount types.
                    </p>
                  ) : (
                    <select
                      id="discountType"
                      className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-gray-50 text-gray-900 text-base cursor-pointer transition duration-200 ease-in-out"
                      onChange={handleDiscountTypeSelect}
                      value={discountType}
                    >
                      <option value="">Select Discount Type</option>
                      {discountTypesData &&
                        discountTypesData.map((type: Discounts) => (
                          <option key={type.id} value={type.discountName}>
                            {type.discountName}
                          </option>
                        ))}
                    </select>
                  )}
                </div>
              )}
            </div>
            <div className="mt-6 p-4 border border-gary-200 rounded-lg text-gray-800">
              <p className="text-xl font-semibold mb-2">
                Current Discount:{" "}
                <span className="text-purple-700">{currentDiscountValue}%</span>
              </p>

              <p className="text-xl font-semibold mb-2">
                Current Discount Type:{" "}
                {currentDiscountValue > 0 && discountType && (
                  <span className="text-gray-600 font-normal">
                    {discountType}
                  </span>
                )}
              </p>
              {currentDiscountValue > 0 && product.price && (
                <p className="text-xl font-semibold">
                  Price after discount:{" "}
                  <span className="mr-2 line-through text-gray-500 font-normal text-sm ">
                    Rs.{product.price.toFixed(2)}
                  </span>
                  <span className="text-green-600">
                    Rs.
                    {(product.price * (1 - currentDiscountValue / 100)).toFixed(
                      2
                    )}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-7  rounded-xl shadow-lg border border-gray-200">
          <h3 className="flex items-center gap-3 text-2xl font-bold text-gray-700 mb-6 pb-3 border-b-2 border-gray-200">
            <RiImageEditLine size={30} className="text-gray-700" /> Manage
            Product Images
          </h3>
          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-7">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden flex justify-center items-center shadow-md group border border-gray-200 transition-transform duration-300 hover:scale-105"
                >
                  <img
                    src={img}
                    alt={`Product ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {deleteMode && (
                    <input
                      type="checkbox"
                      className="absolute top-4 left-4 w-6 h-6 cursor-pointer   border-2 border-black rounded-md transition duration-200 ease-in-out focus:ring-2 focus:outline-none"
                      style={{ transform: "scale(1.2)" }}
                      checked={selectedToDelete.has(img)}
                      onChange={() => toggleSelectImage(img)}
                      title="Select to delete"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6 text-lg">
              No images available for this product. Add some below!
            </p>
          )}

          <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mt-8">
            {!deleteMode && (
              <label
                htmlFor="add-image-input"
                className="flex items-center justify-center gap-1 px-4 py-2 bg-green-500 text-white rounded-xl shadow-lg hover:bg-green-700 transition duration-300 ease-in-out cursor-pointer text-lg font-bold w-full sm:w-auto transform"
              >
                <IoAddCircleOutline size={26} />
                {isUploading ? "Uploading..." : "Add New Image(s)"}
              </label>
            )}
            <input
              id="add-image-input"
              type="file"
              multiple
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleAddImage}
              className="hidden"
              disabled={isUploading || isRemoving || deleteMode}
            />

            {!deleteMode && images.length > 0 && (
              <Button
                type="button"
                variant="danger"
                onClick={() => setDeleteMode(true)}
                disabled={isUploading || isRemoving}
              >
                <MdDeleteForever size={26} />
                Delete Image(s)
              </Button>
            )}

            {deleteMode && (
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button
                  onClick={confirmDelete}
                  type="button"
                  variant="danger"
                  disabled={selectedToDelete.size === 0 || isRemoving}
                  className={` ${
                    selectedToDelete.size === 0 || isRemoving
                      ? "bg-red-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 cursor-pointer"
                  }`}
                >
                  {isRemoving ? "Deleting..." : "Confirm Delete"}
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={cancelDeleteMode}
                >
                  Cancel
                </Button>
              </div>
            )}
            {isUploading && (
              <p className="text-blue-600 mt-2">Uploading new images...</p>
            )}
            {isRemoving && (
              <p className="text-red-600 mt-2">Deleting selected images...</p>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-6 mt-10">
          <Button
            size="large"
            variant="danger"
            onClick={() => navigate(-1)}
            disabled={isUpdatingProduct || isUploading || isRemoving}
          >
            Cancel Edit
          </Button>
          <Button
            size="large"
            type="submit"
            disabled={isUpdatingProduct || isUploading || isRemoving}
          >
            {isUpdatingProduct ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </section>
  );
};

export default EditProduct;
