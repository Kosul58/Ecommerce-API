import React, { useState } from "react";
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

interface EditProps {
  product: Datum;
  onCancel: (val: Datum | null) => void;
}

interface EditProductForm {
  name: string;
  price: number;
  inventory: number;
  category: string;
  discount: number;
  description: string;
}

const EditProduct: React.FC<EditProps> = ({ product, onCancel }) => {
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
      discount: product.discount ?? 0,
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
    } catch (err) {
      console.log("Error in adding images", err);
      alert("Failed to upload images.");
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

  if (!product) {
    return <div>Please Select a Product</div>;
  }
  return (
    <section className="w-full h-screen p-4 bg-white/50">
      <h2 className="w-fit flex justify-start px-4 py-2 text-2xl font-bold items-center gap-1 bg-slate-300 rounded-md ml-2 mt-2 mb-2">
        <MdEditNote size={30} />
        Edit Product:
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full overflow-y-auto flex items-center flex-col"
      >
        <div className="w-full p-4 bg-neutral-400/20">
          <h2 className="text-2xl font-bold mb-2 flex justify-start items-center gap-2 ">
            <MdOutlineEditCalendar />
            Edit Details:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-400/20 p-4 rounded-md">
              <div>
                <label className="block font-medium">Name</label>
                <input
                  {...register("name")}
                  className="w-full border-none rounded px-3 py-2 mt-1 bg-slate-400/40"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block font-medium">Price</label>
                <input
                  type="number"
                  {...register("price")}
                  className="w-full border-none rounded px-3 py-2 mt-1  bg-slate-400/40"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block font-medium">Inventory</label>
                <input
                  type="number"
                  {...register("inventory")}
                  className="w-full border-none rounded px-3 py-2 mt-1  bg-slate-400/40"
                />
                {errors.inventory && (
                  <p className="text-red-500 text-sm">
                    {errors.inventory.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block font-medium">Discount</label>
                <input
                  type="number"
                  {...register("discount")}
                  className="w-full border-none rounded px-3 py-2 mt-1  bg-slate-400/40"
                />
                {errors.discount && (
                  <p className="text-red-500 text-sm">
                    {errors.discount.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-center  items-center flex-col bg-gray-400/30 rounded-md">
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
                className="w-full border-none rounded px-3 py-2 mt-1 bg-stone-400/30"
              />
              {errors.description && (
                <p className="text-red-500 text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col w-full mt-2 p-4 bg-sky-200/20">
          <h2 className="w-full text-2xl font-bold mb-3 flex items-center justify-start gap-2">
            <RiImageEditLine /> Edit Images:
          </h2>
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
          <div className="text-xl font-bold mt-4 mb-4 flex flex-col justify-between items-center">
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
                      : "bg-red-600 hover:bg-red-700 cursor-pointer"
                  }`}
                >
                  Confirm Delete
                </button>
                <button
                  type="button"
                  onClick={cancelDeleteMode}
                  className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="w-full justify-center mt-4 mb-6 flex  gap-4">
          <button
            type="submit"
            className="px-4 py-2 bg-green-400 text-black rounded hover:bg-green-600 cursor-pointer"
          >
            {updatePending ? "Saving Changes..." : "    Save Changes"}
          </button>
          <button
            className="px-4 py-2 bg-red-400 text-white rounded hover:bg-red-600 cursor-pointer"
            onClick={() => {
              onCancel(null);
            }}
          >
            Cancel Edit
          </button>
        </div>
      </form>
    </section>
  );
};

export default EditProduct;
