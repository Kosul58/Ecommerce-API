import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import ProductCategory from "./ProductCategory";
import { useAddProduct } from "../../api/product";

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
  const { mutateAsync } = useAddProduct();
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
      } else {
        console.log("Failed to add product:", result.message);
      }
      console.log("Server response:", result);
    } catch (err) {
      console.error("Error:", err);
    }
  };
  return (
    <section className="w-[90%] h-[90vh] flex justify-center items-center ">
      {" "}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue }) => (
          <Form className="w-[90%] min-w-[300px]  h-[90vh] flex flex-col  items-center bg-indigo-100 rounded-2xl p-6 relative md:left-24 overflow-y-auto">
            <div className="w-[90%] flex justify-center items-center mb-8">
              <p className="text-xl font-bold">Add Product</p>
            </div>
            <div className="flex  flex-row justify-center items-center w-[100%] gap-2 max-sm:flex-col max-sm:mb-8">
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
              <div className="flex flex-col w-[50%] min-w-[200px] items-center justify-center">
                <label className="text-sm font-semibold text-gray-700 mb-1">
                  Category:
                </label>
                <div className="w-full flex justify-center">
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

            <div className="w-[400px] mt-6 max-sm:w-[80%]">
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
