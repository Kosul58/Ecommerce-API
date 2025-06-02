import * as yup from "yup";

export const EditProductSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  price: yup
    .number()
    .required("Price is required")
    .positive()
    .min(100)
    .typeError("Price must be a number"),
  inventory: yup
    .number()
    .required("Inventory is required")
    .min(1)
    .typeError("Inventory must be a number"),
  category: yup.string().required("Category is required"),
  description: yup.string().max(1000).required("Description is required"),
  discount: yup.number().max(99).min(0).required("Discount is required"),
});
