import * as Yup from "yup";

export const SignInSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6).required("Password is required"),
});

export const SellerSignUpSchema = Yup.object({
  // shopname: Yup.string().min(2).required("Shop name is required"),
  username: Yup.string().required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6).required("Password is required"),
  confirmpassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
  // phone: Yup.string()
  //   .required("Phone is required")
  //   .matches(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  // address: Yup.string().required("Address is required"),
});

export const UserSignUpSchema = Yup.object({
  firstname: Yup.string().min(2).required("First name is required"),
  lastname: Yup.string().required("Last name is required"),
  username: Yup.string().required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6).required("Password is required"),
  confirmpassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
  phone: Yup.string()
    .required("Phone is required")
    .matches(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  address: Yup.string().required("Address is required"),
});
