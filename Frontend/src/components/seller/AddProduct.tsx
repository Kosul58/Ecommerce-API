import { Formik, Form, Field, ErrorMessage } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import ProductCategory from "./ProductCategory";
import { useAddProduct } from "../../api/product";
import { FaBoxOpen } from "react-icons/fa";
import { CiCirclePlus } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import ProductCard from "./ProductCard";
import { useDiscountTypes } from "../../hooks/discounts";
import DiscountDropdown, {
  type Discounts,
} from "../dropdowns/DiscountDropdown";
import Button from "../buttons/Buttons";

const validationSchema = [
  Yup.object({
    name: Yup.string().required("Product name is required"),
    price: Yup.number()
      .typeError("Invalid price")
      .min(20, "Price must be at least $20")
      .required("Price is required"),
    inventory: Yup.number()
      .typeError("Invalid inventory")
      .min(1, "Inventory must be at least 1")
      .required("Inventory is required"),
    discount: Yup.number()
      .typeError("Invalid discount")
      .min(0, "Discount cannot be negative")
      .max(99, "Discount cannot exceed 99%")
      .typeError("Discount must be a number"),

    discountType: Yup.string().when("discount", {
      is: (discount: number) => discount > 0,
      then: (schema) =>
        schema.required("Discount type is required when discount is applied"),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
  }),
  Yup.object({
    description: Yup.string().required("Description is required"),
    category: Yup.string()
      .required("Category is required")
      .notOneOf(["", "Select a Category"], "Category is required"),
  }),
  Yup.object({
    images: Yup.mixed<File[]>()
      .required("At least one image is required")
      .test(
        "is-file-array",
        "Must be an array of valid image files (JPG, JPEG, PNG)",
        (value): value is File[] => {
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
  }),
];

interface FormValues {
  name: string;
  price: number;
  inventory: number;
  discount: number;
  discountType: string;
  category: string;
  description: string;
  images: File[];
}

const initialValues: FormValues = {
  name: "",
  price: 0,
  inventory: 0,
  discount: 0,
  discountType: "",
  category: "",
  description: "",
  images: [],
};

const AddProduct = () => {
  const { mutateAsync, isPending, isSuccess, isError } = useAddProduct();
  const {
    data: discountData,
    isLoading: discountLoading,
    isError: discountError,
  } = useDiscountTypes();

  const [currentStep, setCurrentStep] = useState(0);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedDiscountForDropdown, setSelectedDiscountForDropdown] =
    useState<Discounts | null>(null);

  const stepTitles = ["General", "Details", "Images"];

  const handleSubmit = async (
    values: FormValues,
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
        setCurrentStep(0);
        setSelectedDiscountForDropdown(null); // Reset selected discount as well
        alert("Product added successfully!");
      } else {
        console.error("Failed to add product:", result.message);
      }
      console.log("Server response:", result);
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  const handleRemoveImage = (
    index: number,
    setFieldValue: (
      field: string,
      value: unknown,
      shouldValidate?: boolean
    ) => void
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

  const handleNextStep = async (
    values: FormValues,
    setTouched: (
      touched: {
        [field: string]: boolean;
      },
      shouldValidate?: boolean
    ) => void
  ) => {
    try {
      await validationSchema[currentStep].validate(values, {
        abortEarly: false,
      });
      setCurrentStep((prev) => prev + 1);
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const newTouched: { [key: string]: boolean } = {};
        err.inner.forEach((error) => {
          if (error.path) {
            newTouched[error.path] = true;
          }
        });
        setTouched(newTouched, true);
      }
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center items-center gap-4 sm:gap-6 mb-6 sm:mb-10">
      {validationSchema.map((_, index) => {
        const isActive = currentStep === index;
        const isCompleted = currentStep > index;
        const baseCircle =
          "w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full font-bold text-sm sm:text-base transition-all duration-300";
        const circleStyles = isActive
          ? "bg-purple-600 text-white ring-4 ring-purple-200 shadow-md scale-110"
          : isCompleted
          ? "bg-green-500 text-white shadow-sm"
          : "bg-gray-300 text-gray-700";

        const labelStyles = isActive
          ? "text-purple-700 font-semibold"
          : "text-gray-600";

        return (
          <div key={index} className="flex flex-col items-center group">
            <div className={`${baseCircle} ${circleStyles}`}>{index + 1}</div>
            <p
              className={`mt-2 text-xs sm:text-sm text-center transition-colors duration-300 ${labelStyles}`}
            >
              {stepTitles[index]}
            </p>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="w-full max-h-screen h-screen bg-slate-100 ">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema[currentStep]}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ setFieldValue, values, setTouched }) => {
          const isDiscountTypeDisabled = values.discount <= 0;
          if (isDiscountTypeDisabled && values.discountType !== "") {
            setFieldValue("discountType", "", false); // Set to empty, don't re-validate immediately
            setSelectedDiscountForDropdown(null); // Clear internal dropdown state
          }

          return (
            <section className="w-full h-screen max-h-screen flex flex-col ">
              <div className="w-full flex justify-between px-4 py-2 bg-white max-h-[100px]">
                <div className="flex flex-col">
                  <h2 className="text-sm text-gray-400">Seller /</h2>
                  <h1 className="text-lg">Add Product</h1>
                </div>

                {/* <div>
                  <button className="px-4 py-2 bg-blue-200 rounded-md">
                    Go Back
                  </button>
                </div> */}
              </div>

              <div className="w-full  overflow-auto flex  items-center justify-evenly p-6 max-md:flex-col min-h-[90vh] ">
                <Form className="w-full max-w-lg bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-gray-200 mb-6 lg:mb-0 lg:mr-6 h-fit">
                  <div className="w-full flex flex-col items-center mb-6 sm:mb-8">
                    <h1 className="text-2xl max-sm:text-xl font-extrabold text-gray-800 flex items-center gap-2 mb-2">
                      <FaBoxOpen className="text-purple-600" /> Add New Product
                    </h1>
                    <p className="text-sm sm:text-md text-gray-600 text-center">
                      Effortlessly list your products.
                    </p>
                  </div>
                  {renderStepIndicator()}
                  {currentStep === 0 && (
                    <div className="w-full bg-gray-50 p-6 rounded-xl shadow-inner animate-slide-in-right">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">
                        General Information
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label
                            htmlFor="name"
                            className="text-sm font-semibold text-gray-700 mb-1"
                          >
                            Product Name:
                          </label>
                          <Field
                            id="name"
                            name="name"
                            type="text"
                            placeholder="e.g., Running Shoes"
                            className="h-9 sm:h-10 px-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 transition duration-300 text-sm text-gray-800 shadow-sm"
                          />
                          <ErrorMessage
                            name="name"
                            component="div"
                            className="text-red-600 text-xs mt-0.5"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label
                            htmlFor="price"
                            className="text-sm font-semibold text-gray-700 mb-1"
                          >
                            Price ($):
                          </label>
                          <Field
                            id="price"
                            name="price"
                            type="number"
                            min={20}
                            placeholder="Min 20"
                            className="h-9 sm:h-10 px-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 transition duration-300 text-sm text-gray-800 shadow-sm"
                          />
                          <ErrorMessage
                            name="price"
                            component="div"
                            className="text-red-600 text-xs mt-0.5"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label
                            htmlFor="inventory"
                            className="text-sm font-semibold text-gray-700 mb-1"
                          >
                            Inventory:
                          </label>
                          <Field
                            id="inventory"
                            name="inventory"
                            type="number"
                            min={1}
                            max={1000}
                            placeholder="1 - 1000 units"
                            className="h-9 sm:h-10 px-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 transition duration-300 text-sm text-gray-800 shadow-sm"
                          />
                          <ErrorMessage
                            name="inventory"
                            component="div"
                            className="text-red-600 text-xs mt-0.5"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label
                            htmlFor="discount"
                            className="text-sm font-semibold text-gray-700 mb-1"
                          >
                            Discount (%):
                          </label>
                          <Field
                            id="discount"
                            name="discount"
                            type="number"
                            min={0}
                            max={99}
                            placeholder="0 - 99%"
                            className="h-9 sm:h-10 px-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 transition duration-300 text-sm text-gray-800 shadow-sm"
                          />
                          <ErrorMessage
                            name="discount"
                            component="div"
                            className="text-red-600 text-xs mt-0.5"
                          />
                        </div>
                        <div className="flex flex-col md:col-span-2">
                          <label
                            className={`text-sm font-semibold mb-1 ${
                              isDiscountTypeDisabled
                                ? "text-gray-500"
                                : "text-gray-700"
                            }`}
                          >
                            Discount Type:
                          </label>
                          {discountLoading ? (
                            <p className="text-gray-500 text-sm">
                              Loading discount types...
                            </p>
                          ) : discountError ? (
                            <p className="text-red-600 text-sm">
                              Error loading discount types.
                            </p>
                          ) : (
                            <div
                              className={
                                isDiscountTypeDisabled
                                  ? "pointer-events-none opacity-50"
                                  : ""
                              }
                            >
                              <DiscountDropdown
                                discounts={discountData || []}
                                onSelectDiscount={(selectedDiscount) => {
                                  setFieldValue(
                                    "discountType",
                                    selectedDiscount.discountName
                                  );
                                  setSelectedDiscountForDropdown(
                                    selectedDiscount
                                  );
                                }}
                                buttonText={
                                  selectedDiscountForDropdown?.discountName ||
                                  "Select Discount Type"
                                }
                              />
                            </div>
                          )}
                          <ErrorMessage
                            name="discountType"
                            component="div"
                            className="text-red-600 text-xs mt-0.5"
                          />
                          {values.discountType && (
                            <p className="mt-2 text-xs text-gray-600">
                              Selected Discount Type:{" "}
                              <span className="font-semibold text-purple-700">
                                {values.discountType}
                              </span>
                            </p>
                          )}
                          {isDiscountTypeDisabled && (
                            <p className="mt-1 text-xs text-gray-500">
                              (Enter a discount value greater than 0 to select a
                              type)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {currentStep === 1 && (
                    <div className="w-full bg-gray-50 p-6 rounded-xl shadow-inner animate-slide-in-right">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">
                        Details & Category
                      </h2>
                      <div className="flex flex-col mb-4 max-h-[200px]">
                        <label
                          htmlFor="description"
                          className="text-sm font-semibold text-gray-700 mb-1"
                        >
                          Description:
                        </label>
                        <Field
                          id="description"
                          name="description"
                          as="textarea"
                          rows={5}
                          placeholder="Provide a detailed description..."
                          className="w-full p-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 transition duration-300 resize-y text-sm text-gray-800 shadow-sm"
                        />
                        <ErrorMessage
                          name="description"
                          component="div"
                          className="text-red-600 text-xs mt-0.5"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-1">
                          Category:
                        </label>
                        <div className="w-full">
                          <ProductCategory
                            onCategorySelect={(categoryName) => {
                              setFieldValue("category", categoryName);
                            }}
                          />
                        </div>
                        <ErrorMessage
                          name="category"
                          component="div"
                          className="text-red-600 text-xs mt-0.5"
                        />
                        {values.category && (
                          <p className="mt-2 text-xs text-gray-600">
                            Selected Category:{" "}
                            <span className="font-semibold text-purple-700">
                              {values.category}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {currentStep === 2 && (
                    <div className="w-full bg-gray-50 p-6 rounded-xl shadow-inner animate-slide-in-right">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">
                        Upload Product Images
                      </h3>
                      <div className="w-full flex flex-col justify-center items-center mb-6">
                        {imagePreviews.length === 0 ? (
                          <div className="flex flex-col justify-center items-center text-gray-400 text-lg sm:text-xl font-medium w-full h-48 sm:h-56 border-2 border-dashed border-gray-300 rounded-lg bg-white p-4">
                            <FaBoxOpen
                              size={40}
                              className="mb-2 text-gray-300"
                            />
                            <p className="text-center text-sm">
                              No images selected
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Click below to add images
                            </p>
                          </div>
                        ) : (
                          <div className="w-full flex flex-col items-center space-y-4">
                            <div className="w-4/5 sm:w-3/5 max-w-sm h-32 sm:h-40 min-w-[150px] min-h-[80px] rounded-lg overflow-hidden shadow-md relative border border-gray-200 group">
                              <img
                                src={imagePreviews[0]}
                                alt="main-preview"
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveImage(0, setFieldValue)
                                }
                                className="absolute top-2 right-2 bg-white text-red-500 rounded-full p-1 sm:p-1.5 shadow-md cursor-pointer hover:bg-red-100 hover:text-red-700 transition-all duration-200"
                                title="Remove main image"
                              >
                                <MdDelete size={18} />
                              </button>
                            </div>
                            <div className="w-full overflow-x-auto pb-2 custom-scrollbar">
                              <div className="flex gap-2 px-1 w-max mx-auto">
                                {imagePreviews.slice(1).map((src, index) => (
                                  <div
                                    key={index + 1}
                                    className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-md overflow-hidden shadow-sm relative border border-gray-200 group"
                                  >
                                    <img
                                      src={src}
                                      alt={`preview-${index + 1}`}
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveImage(
                                          index + 1,
                                          setFieldValue
                                        )
                                      }
                                      className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-0.5 sm:p-1 shadow-xs text-xs cursor-pointer hover:bg-red-100 hover:text-red-700 transition-all duration-200"
                                      title="Remove image"
                                    >
                                      <MdDelete size={14} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-white transition hover:border-purple-500 hover:bg-purple-50 cursor-pointer">
                        <label
                          htmlFor="images"
                          className="flex items-center text-purple-600 text-sm sm:text-md font-semibold text-center hover:underline cursor-pointer transition-colors duration-200"
                        >
                          <CiCirclePlus size={20} className="mr-2" /> Click to
                          select images
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Only JPG, JPEG or PNG (Max 5 images, up to 5MB each)
                        </p>
                        <input
                          id="images"
                          name="images"
                          type="file"
                          multiple
                          accept="image/jpeg, image/jpg, image/png"
                          onChange={(event) => {
                            const files = Array.from(
                              event.currentTarget.files || []
                            );
                            const selectedFiles = files.slice(0, 5);
                            setFieldValue("images", selectedFiles);
                            const previews = selectedFiles.map((file) =>
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
                        className="text-red-500 text-xs mt-2 text-center"
                      />
                    </div>
                  )}
                  <div className="w-full flex justify-between items-center mt-6 p-1">
                    {currentStep > 0 && (
                      <Button
                        type="button"
                        onClick={handlePrevStep}
                        variant="secondary"
                      >
                        <FaArrowLeft className="mr-1" /> Previous
                      </Button>
                    )}
                    {currentStep < validationSchema.length - 1 && (
                      <Button
                        type="button"
                        onClick={() => handleNextStep(values, setTouched)}
                        variant="secondary"
                        className={` ${currentStep === 0 ? "ml-auto" : ""}`}
                      >
                        Next <FaArrowRight className="ml-1" />
                      </Button>
                    )}
                    {currentStep === validationSchema.length - 1 && (
                      <Button
                        type="submit"
                        disabled={isPending}
                        variant="primary"
                      >
                        <CiCirclePlus size={20} className="mr-1" />
                        {isPending ? "Adding Product..." : "Add Product"}
                      </Button>
                    )}
                  </div>
                  {isSuccess && (
                    <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg shadow-sm animate-fade-in text-center text-sm font-medium">
                      Product added successfully! 🎉
                    </div>
                  )}
                  {isError && (
                    <div className="mt-4 p-3 bg-red-100 text-red-600 rounded-lg shadow-sm animate-fade-in text-center text-sm font-medium">
                      Failed to add product. Please try again. 😢
                    </div>
                  )}
                </Form>

                <ProductCard
                  name={values.name}
                  price={values.price}
                  inventory={values.inventory}
                  discount={values.discount}
                  category={values.category}
                  description={values.description}
                  imageUrls={imagePreviews}
                />
              </div>
            </section>
          );
        }}
      </Formik>
    </div>
  );
};

export default AddProduct;
