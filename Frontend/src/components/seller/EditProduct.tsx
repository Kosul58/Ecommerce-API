import React, { useState } from "react";
import type { Datum } from "../../types/sellertypes";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { IoClose, IoAddCircleOutline } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";
import {
  useAddImages,
  useRemoveImages,
  useUpdateProduct,
} from "../../api/product";
import { EditProductSchema } from "../../validations/productValidation";
import ProductCategory from "./ProductCategory";

interface EditProps {
  product: Datum;
  onClose: () => void;
  onSave: (updatedProduct: Datum) => void;
}

interface EditProductForm {
  name: string;
  price: number;
  inventory: number;
  category: string;
  description: string;
}

const EditProduct: React.FC<EditProps> = ({ product, onClose, onSave }) => {
  const [images, setImages] = useState<string[]>(product.images || []);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<Set<string>>(
    new Set()
  );
  const { mutateAsync: uploadImages, isPending } = useAddImages();
  const { mutateAsync: removeImages, isPending: removalPending } =
    useRemoveImages();

  const { mutateAsync: updateProduct, isPending: updatePending } =
    useUpdateProduct();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<EditProductForm>({
    defaultValues: {
      name: product.name,
      price: product.price,
      inventory: product.inventory,
      category: product.category,
      description: product.description ?? "",
    },
    resolver: yupResolver(EditProductSchema),
    mode: "onTouched",
  });

  const onSubmit = async (data: EditProductForm) => {
    const updatedProduct: Datum = { ...product, ...data, images };
    const payload = {
      name: updatedProduct.name,
      price: updatedProduct.price,
      inventory: updatedProduct.inventory,
      category: updatedProduct.category,
      description: updatedProduct.description,
      url: `/product/${product.id}`,
    };
    try {
      const response = await updateProduct(payload);
      console.log(response);
      const updateResult = response.data;
      if (!response.success) throw new Error("No response data");
      console.log("Update successful:", updateResult);
    } catch (err) {
      console.log("error:", err);
    }
    onSave(updatedProduct);
    onClose();
  };

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
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
      const uploadData = response.data;
      const newImages = [...images, ...uploadData];
      setImages(newImages);
      const updatedProduct: Datum = { ...product, images: newImages };
      onSave(updatedProduct);
    } catch (err) {
      console.log("Error in adding images", err);
      alert("Failed to upload images.");
    }
    const updatedProduct: Datum = { ...product, images };
    onSave(updatedProduct);
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
    const deleteImages = [...selectedToDelete];
    console.log(deleteImages);
    const payload = {
      imageUrl: deleteImages,
      productid: product.id,
    };
    try {
      const response = await removeImages(payload);
      console.log(response);
      const newImages = images.filter((i) => !deleteImages.includes(i));
      setImages(newImages);
    } catch (err) {
      console.log("Error in removing images", err);
    }
    setSelectedToDelete(new Set());
    setDeleteMode(false);
  };

  const cancelDeleteMode = () => {
    setSelectedToDelete(new Set());
    setDeleteMode(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent z-60">
      <div className="relative w-[90vw] max-w-4xl max-h-[95vh] bg-white rounded-2xl shadow-2xl p-6 overflow-y-auto">
        <IoClose
          className="absolute top-4 right-4 size-6 text-gray-600 hover:text-red-500 cursor-pointer"
          onClick={onClose}
        />
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Edit Product Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div>
                  <label className="block font-medium">Name</label>
                  <input
                    {...register("name")}
                    className="w-full border rounded px-3 py-2 mt-1"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-medium">Price</label>
                  <input
                    type="number"
                    {...register("price")}
                    className="w-full border rounded px-3 py-2 mt-1"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-medium">Inventory</label>
                  <input
                    type="number"
                    {...register("inventory")}
                    className="w-full border rounded px-3 py-2 mt-1"
                  />
                  {errors.inventory && (
                    <p className="text-red-500 text-sm">
                      {errors.inventory.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block font-medium mb-2">Category</label>
                <ProductCategory
                  onCategorySelect={(categoryName) =>
                    setValue("category", categoryName)
                  }
                />
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block font-medium">Description</label>
                <textarea
                  {...register("description")}
                  rows={4}
                  className="w-full border rounded px-3 py-2 mt-1"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold mb-4">Edit Product Images</h2>
            <div className="text-xl font-bold mb-4 flex flex-col justify-between items-center">
              <div className="w-full flex justify-between max-sm:flex-col max-sm:h-fit">
                {!deleteMode && (
                  <div>
                    <label
                      htmlFor="add-image-input"
                      className="gap-1 text-black cursor-pointer bg-green-300 hover:bg-green-400 rounded flex justify-center items-center w-[200px] h-[40px] text-xl"
                    >
                      <IoAddCircleOutline size={20} />
                      Add Image
                    </label>
                    <input
                      id="add-image-input"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleAddImage}
                      className="hidden"
                      disabled={isPending}
                    />
                    <div className="mt-2 text-sm text-gray-700">
                      {isPending && <span>Uploading images...</span>}
                    </div>
                  </div>
                )}

                {!deleteMode && (
                  <button
                    type="button"
                    onClick={() => setDeleteMode(true)}
                    className="bg-red-600 text-white rounded hover:bg-red-700 flex justify-center items-center w-[200px] h-[40px] text-xl gap-1 cursor-pointer"
                  >
                    <MdDeleteForever />{" "}
                    {removalPending ? "Deleting Images..." : "Delete Images"}
                  </button>
                )}
              </div>
              {deleteMode && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={confirmDelete}
                    disabled={selectedToDelete.size === 0}
                    className={`px-3 py-1 rounded text-white ${
                      selectedToDelete.size === 0
                        ? "bg-red-300 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={cancelDeleteMode}
                    className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-full h-40 bg-gray-200 rounded overflow-hidden flex justify-center items-center"
                  >
                    <img
                      src={img}
                      alt={`Product ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {deleteMode && (
                      <input
                        type="checkbox"
                        className="absolute top-2 left-2 w-5 h-5 cursor-pointer"
                        checked={selectedToDelete.has(img)}
                        onChange={() => toggleSelectImage(img)}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No images available</p>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {updatePending ? "Saving Changes..." : "    Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
