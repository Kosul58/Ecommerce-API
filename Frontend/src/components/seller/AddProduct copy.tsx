import { Formik, Form, Field, ErrorMessage } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import ProductCategory from "./ProductCategory";
import { useAddProduct } from "../../api/product";
import { FaBoxOpen } from "react-icons/fa";
import { CiCirclePlus } from "react-icons/ci";
import { MdDelete } from "react-icons/md";

const validationSchema = Yup.object({
  name: Yup.string().required("Product name is required"),
  price: Yup.number()
    .min(20, "Price must be at least 20")
    .required("Invalid price"),
  inventory: Yup.number()
    .min(1, "Inventory must be at least 1")
    .required("Inventory is required"),
  category: Yup.string()
    .required("Category is required")
    .notOneOf([""], "Category is required"),
  description: Yup.string().required("Description is required"),
  discount: Yup.number().min(0).max(99).required("Discount is required"),
  images: Yup.mixed()
    .required("At least one image is required")
    .test(
      "is-file-array",
      "Must be an array of image files",
      (value: unknown): value is File[] => {
        return (
          Array.isArray(value) &&
          value.length > 0 &&
          value.every(
            (file) =>
              file instanceof File &&
              ["image/jpeg", "image/jpg", "image/png"].includes(file.type)
          )
        );
      }
    ),
});

const initialValues = {
  name: "",
  price: 0,
  inventory: 0,
  discount: 0,
  category: "",
  description: "",
  images: [] as File[],
};

const AddProduct = () => {
  const { mutateAsync, isPending, isSuccess, isError } = useAddProduct();
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleSubmit = async (
    values: typeof initialValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    const form = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key === "images" && Array.isArray(value)) {
        value.forEach((file) => form.append("images", file));
      } else {
        form.append(key, String(value));
      }
    });

    try {
      const result = await mutateAsync(form);
      if (result.success === true) {
        sessionStorage.setItem("productdata", JSON.stringify(result.data));
        resetForm();
        setImagePreviews([]);
      } else {
        console.log("Failed to add product:", result.message);
      }
      console.log("Server response:", result);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleRemoveImage = (
    index: number,
    setFieldValue: (field: string, value: unknown) => void
  ) => {
    setImagePreviews((prev) => {
      const newPreviews = [...prev];
      newPreviews.splice(index, 1);
      return newPreviews;
    });

    setFieldValue("images", (prevImages: File[]) => {
      const newImages = [...prevImages];
      newImages.splice(index, 1);
      return newImages;
    });
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ setFieldValue }) => (
        <Form className=" w-full min-w-[250px] h-screen flex flex-col items-center p-6 max-sm:p-1 relative bg-slate-100 overflow-auto">
          <div className="w-full flex justify-start items-center mb-4">
            <p className="text-2xl font-bold flex justify-center items-center gap-2 p-4">
              <FaBoxOpen /> Add New Product:
            </p>
          </div>
          <div className="w-full h-fit flex flex-row max-md:flex-col max-md:justify-center items-center gap-4">
            <div className="w-[60%] h-fit p-1  flex flex-col max-md:w-[90%]">
              <div className="flex flex-col justify-center p-6  max-md:p-2 items-start  w-full min-h-[500px] min-w-[90%] gap-2 max-md:flex-col bg-slate-200 rounded-lg shadow-md">
                <p className="text-xl">General Information</p>
                <div className="flex flex-col w-full min-w-[200px]">
                  <label
                    htmlFor="name"
                    className="text-sm font-semibold text-gray-700 ml-1 mb-[-1px] z-10"
                  >
                    Product Name:
                  </label>
                  <Field
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Product Name"
                    className="h-[40px] bg-slate-300/60 p-2 shadow-md rounded-md"
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-red-600 ml-1 text-xs"
                  />
                </div>
                <div className="flex flex-col w-full min-w-[200px] h-[70%]">
                  <label
                    htmlFor="description"
                    className="text-sm font-semibold text-gray-700 ml-1 mb-[-1px] z-10"
                  >
                    Description:
                  </label>
                  <Field
                    id="description"
                    name="description"
                    as="textarea"
                    rows={4}
                    placeholder="Product Description"
                    className="w-full bg-slate-300/60 p-2 shadow-md rounded-md min-h-[300px] h-[100%]"
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="text-red-600 ml-1 text-xs"
                  />
                </div>
              </div>
              <div className="mt-5 w-full h-fit rounded-md p-4  bg-slate-200 shadow-md">
                <p className="text-xl">Pricing and Inventory</p>
                <div className="flex flex-row justify-evenly items-center m-4 max-[730px]:flex-col p-4">
                  <div className="flex flex-col w-[30%] min-w-[60px] max-[730px]:w-[80%]">
                    <label
                      htmlFor="price"
                      className="text-sm font-semibold text-gray-700 ml-1 mb-[-1px] z-10"
                    >
                      Price
                    </label>
                    <Field
                      id="price"
                      name="price"
                      type="number"
                      min={20}
                      className="h-[40px] bg-amber-50/50 p-2 shadow-md rounded-md"
                    />
                    <ErrorMessage
                      name="price"
                      component="div"
                      className="text-red-600 ml-1 text-xs"
                    />
                  </div>
                  <div className="flex flex-col w-[30%] min-w-[60px] max-[730px]:w-[80%]">
                    <label
                      htmlFor="inventory"
                      className="text-sm font-semibold text-gray-700 ml-1 mb-[-1px] z-10"
                    >
                      Inventory
                    </label>
                    <Field
                      id="inventory"
                      name="inventory"
                      type="number"
                      min={1}
                      max={1000}
                      className="h-[40px] bg-amber-50/50 p-2 shadow-md rounded-md"
                    />
                    <ErrorMessage
                      name="inventory"
                      component="div"
                      className="text-red-600 ml-1 text-xs"
                    />
                  </div>
                  <div className="flex flex-col w-[30%] min-w-[60px] max-[730px]:w-[80%]">
                    <label
                      htmlFor="discount"
                      className="text-sm font-semibold text-gray-700 ml-1 mb-[-1px] z-10"
                    >
                      Discount
                    </label>
                    <Field
                      id="discount"
                      name="discount"
                      type="number"
                      min={0}
                      max={99}
                      className="h-[40px] bg-amber-50/50 p-2 shadow-md rounded-md"
                    />
                    <ErrorMessage
                      name="discount"
                      component="div"
                      className="text-red-600 ml-1 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="w-[40%] h-fit p-1 flex flex-col max-md:w-[90%]">
              <div className="w-full min-h-[500px] max-lg:min-w-[80%] max-sm:min-w-[100%] bg-gray-200 shadow-md rounded-2xl p-6 space-y-6 max-h-[800px]">
                <h3 className="text-xl text-gray-700">Upload Product Images</h3>

                <div className="w-full flex justify-center items-center">
                  {imagePreviews.length === 0 ? (
                    <div className="flex justify-center items-center text-gray-400 text-sm w-full h-[200px]">
                      <h2 className=""> No images selected</h2>
                    </div>
                  ) : (
                    <div className="w-full flex flex-col items-center space-y-4">
                      <div className="w-[90%] h-[50%] max-sm:w-[80%] rounded-xl overflow-hidden shadow-lg relative">
                        <img
                          src={imagePreviews[0]}
                          alt="main-preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(0, setFieldValue)}
                          className="absolute top-2 right-2 text-red-500 rounded-full p-1 cursor-pointer hover:text-red-700 transition-colors"
                          title="Remove image"
                        >
                          <MdDelete size={20} />
                        </button>
                      </div>
                      <div className="w-full overflow-x-auto">
                        <div className="flex gap-4 w-max px-2">
                          {imagePreviews.slice(1).map((src, index) => (
                            <div
                              key={index + 1}
                              className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden shadow relative"
                            >
                              <img
                                src={src}
                                alt={`preview-${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveImage(index + 1, setFieldValue)
                                }
                                className="absolute top-1 right-1 text-red-500 rounded-full p-0.5 text-xs cursor-pointer hover:text-red-700 transition-colors"
                                title="Remove image"
                              >
                                <MdDelete size={15} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 transition hover:border-indigo-400 hover:bg-indigo-50">
                  <label
                    htmlFor="images"
                    className="cursor-pointer text-indigo-600 text-sm text-center hover:underline"
                  >
                    Click to select images
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Only JPG, JPEG or PNG formats allowed
                  </p>
                  <input
                    id="images"
                    name="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(event) => {
                      const files = Array.from(event.currentTarget.files || []);
                      setFieldValue("images", files);
                      const previews = files.map((file) =>
                        URL.createObjectURL(file)
                      );
                      setImagePreviews(previews);
                    }}
                    className="hidden"
                  />
                </div>

                <ErrorMessage
                  name="images"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              <div className="flex flex-col w-full min-w-[200px] items-center justify-center  mt-4 p-8 bg-indigo-100 rounded-md shadow-md">
                <label className="text-sm font-semibold text-gray-700 mb-1">
                  Category:
                </label>
                <div className="w-full flex justify-center items-center">
                  <ProductCategory
                    onCategorySelect={(categoryName) => {
                      if (
                        categoryName === "select" ||
                        categoryName === "" ||
                        !categoryName
                      ) {
                        setFieldValue("category", "");
                      } else {
                        setFieldValue("category", categoryName);
                      }
                    }}
                  />
                </div>
                <ErrorMessage
                  name="category"
                  component="div"
                  className="text-red-600 ml-1 text-xs"
                />
              </div>
            </div>
          </div>
          <div className="w-full flex justify-center mt-6">
            <button
              type="submit"
              disabled={isPending}
              className="px-10 py-2 bg-indigo-500 text-white rounded-lg shadow-lg cursor-pointer hover:scale-105 transition-transform flex gap-2 justify-center items-center mb-10 "
            >
              <CiCirclePlus size={20} />
              {isPending ? "Adding Product..." : "AddProduct"}
            </button>
          </div>
          {isSuccess && (
            <div className="text-sm text-green-800">
              Added Product Successfully
            </div>
          )}
          {isError && (
            <div className="text-sm text-red-600">Failed to Add Product</div>
          )}
        </Form>
      )}
    </Formik>
  );
};

export default AddProduct;
