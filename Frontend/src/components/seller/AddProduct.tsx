import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import CategorySelect from "./category";
import { useEffect, useState } from "react";

type CategoryTree = {
  [key: string]: string | CategoryTree;
};

const validationSchema = Yup.object({
  name: Yup.string().required("Username is required"),
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
  category: "",
  description: "",
  images: [] as File[],
};

const AddProduct = () => {
  const [categoryData, setCategoryData] = useState<CategoryTree | null>(null);
  const [token, setToken] = useState<string>("");
  useEffect(() => {
    const sellerDataString = sessionStorage.getItem("sellerdata");
    if (sellerDataString) {
      try {
        const sellerData = JSON.parse(sellerDataString);
        setToken(sellerData.token);
      } catch {
        console.warn("Failed to parse sellerdata from sessionStorage");
      }
    }
  }, []);

  const handleSubmit = async (
    values: typeof initialValues
    // { resetForm }: { resetForm: () => void }
  ) => {
    const form = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key === "images" && Array.isArray(value)) {
        value.forEach((file) => {
          form.append("images", file);
        });
      } else {
        form.append(key, String(value));
      }
    });

    for (const [key, value] of form.entries()) {
      console.log(`${key}:`, value);
    }
    try {
      const res = await fetch("http://localhost:3000/api/product", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });
      const result = await res.json();
      if (result.success === true) {
        sessionStorage.setItem("productdata", JSON.stringify(result.data));
        // resetForm();
      }
      console.log("Server response:", result);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/category/list",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (data.data) {
          setCategoryData(data.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategoryData(null);
      }
    };

    fetchCategories();
  }, [token]);

  return (
    <section className="w-[95%] h-[95%] flex flex-col justify-center items-center gap-4 overflow-y-auto bg-red-50">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue }) => (
          <Form className="w-[90%] h-auto flex justify-center items-center flex-col bg-indigo-100 rounded-2xl p-6">
            <div className="w-[90%] flex justify-center items-center mb-8">
              <p className="text-xl font-bold">Add Product</p>
            </div>
            <div className="flex  flex-row justify-center items-center w-[100%] gap-2">
              <div className="flex flex-col justify-center items-center gap-2 w-1/2 p-4 rounded">
                <div className="flex flex-col w-full min-w-[200px]">
                  <label
                    htmlFor="name"
                    className="text-sm font-semibold text-gray-700 ml-1 mb-[-1px] z-10"
                  >
                    Name:
                  </label>
                  <Field
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Product Name"
                    className="h-[40px] bg-amber-50 p-2 shadow-xl rounded-lg"
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-red-600 ml-1 text-xs"
                  />
                </div>
                <div className="flex flex-col w-full min-w-[200px]">
                  <label
                    htmlFor="price"
                    className="text-sm font-semibold text-gray-700 ml-1 mb-[-1px] z-10"
                  >
                    Price:
                  </label>
                  <Field
                    id="price"
                    name="price"
                    type="number"
                    min={20}
                    className="h-[40px] bg-amber-50 p-2 shadow-xl rounded-lg"
                  />
                  <ErrorMessage
                    name="price"
                    component="div"
                    className="text-red-600 ml-1 text-xs"
                  />
                </div>
                <div className="flex flex-col w-full min-w-[200px]">
                  <label
                    htmlFor="inventory"
                    className="text-sm font-semibold text-gray-700 ml-1 mb-[-1px] z-10"
                  >
                    Inventory:
                  </label>
                  <Field
                    id="inventory"
                    name="inventory"
                    type="number"
                    min={1}
                    max={1000}
                    className="h-[40px] bg-amber-50 p-2 shadow-xl rounded-lg"
                  />
                  <ErrorMessage
                    name="inventory"
                    component="div"
                    className="text-red-600 ml-1 text-xs"
                  />
                </div>
              </div>
              <div className="flex flex-col w-[50%] min-w-[200px]">
                <label className="text-sm font-semibold text-gray-700 ml-1 mb-[-1px] z-10">
                  Category:
                </label>
                <CategorySelect
                  data={categoryData || {}}
                  onSelect={(categoryId) => {
                    if (
                      categoryId === "select" ||
                      categoryId === "" ||
                      !categoryId
                    ) {
                      // if the user selects the placeholder option
                      setFieldValue("category", "");
                    } else {
                      setFieldValue("category", categoryId);
                    }
                  }}
                />
                <ErrorMessage
                  name="category"
                  component="div"
                  className="text-red-600 ml-1 text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col w-[80%] min-w-[200px]">
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
                className="w-full bg-amber-50 p-2 shadow-xl rounded-lg"
              />
              <ErrorMessage
                name="description"
                component="div"
                className="text-red-600 ml-1 text-xs"
              />
            </div>

            <div className="w-[400px] mt-6 sm:w-[50%]">
              <label htmlFor="images" className="block font-medium">
                Upload Images:
              </label>
              <input
                name="images"
                type="file"
                multiple
                accept="image/*"
                onChange={(event) => {
                  const files = Array.from(event.currentTarget.files || []);
                  setFieldValue("images", files);
                }}
                className="w-full bg-amber-50 cursor-pointer mt-1 p-2 border rounded"
              />
              <ErrorMessage
                name="images"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            {/* Submit button */}
            <div className="w-full flex justify-center mt-6">
              <button
                type="submit"
                className="px-10 py-2 bg-indigo-500 text-white rounded-lg shadow-lg cursor-pointer hover:scale-110 transition-transform"
              >
                Add Product
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </section>
  );
};

export default AddProduct;
