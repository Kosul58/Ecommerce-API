import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { IoIosCloseCircleOutline } from "react-icons/io";
const validationSchema = Yup.object({
  firstname: Yup.string().min(2).required("First name is required"),
  lastname: Yup.string().required("Last name is required"),
  username: Yup.string().required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6).required("Password is required"),
  confirmpassword: Yup.string().min(6).required("Confirm Password is required"),
  phone: Yup.string()
    .required("Phone is required")
    .matches(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  address: Yup.string().required("Address is required"),
  image: Yup.mixed()
    .required("Image is required")
    .test(
      "fileType",
      "Only JPG/PNG allowed",
      (value: unknown): value is File => {
        return (
          value instanceof File &&
          ["image/jpeg", "image/jpg", "image/png"].includes(value.type)
        );
      }
    ),
});

const initialValues = {
  firstname: "",
  lastname: "",
  username: "",
  email: "",
  password: "",
  confirmpassword: "",
  phone: "",
  address: "",
  image: null as File | null,
};

const AdminSignUp = () => {
  const [formState, setFormState] = useState(false);
  const handleSubmit = async (
    values: typeof initialValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    const form = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key === "image" && value instanceof File) {
        form.append(key, value);
      } else {
        form.append(key, value as string);
      }
    });
    if (values.password !== values.confirmpassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/api/user/signup", {
        method: "POST",
        body: form,
      });
      const result = await res.json();
      if (result.success === true) {
        resetForm();
        initialValues.image = null;
      }
      console.log("Server response:", result);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <>
      <button
        className="bg-white px-6 py-2 rounded-md text-xl cursor-pointer hover:scale-105 "
        onClick={() => setFormState(true)}
      >
        Admin Sign Up
      </button>

      {formState && (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue }) => (
            <Form className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-auto bg-indigo-100 rounded-2xl p-6">
              <IoIosCloseCircleOutline
                className="absolute top-2 right-2 text-2xl font-bold text-red-600 cursor-pointer"
                onClick={() => setFormState(false)}
              />
              <div className="w-full flex justify-center items-center mb-8">
                <p>Admin Sign Up</p>
              </div>
              <div className="flex flex-wrap gap-4 justify-center">
                {[
                  { label: "Firstname:", name: "firstname", type: "text" },
                  { label: "Lastname:", name: "lastname", type: "text" },
                  { label: "Username:", name: "username", type: "text" },
                  { label: "Email:", name: "email", type: "email" },
                  { label: "Password:", name: "password", type: "password" },
                  {
                    label: "Confirm Password:",
                    name: "confirmpassword",
                    type: "password",
                  },
                  { label: "Phone:", name: "phone", type: "tel" },
                  { label: "Address:", name: "address", type: "text" },
                ].map((field) => (
                  <div
                    key={field.name}
                    className="flex flex-col w-[48%] min-w-[300px]"
                  >
                    <label
                      htmlFor={field.name}
                      className="text-sm font-semibold text-gray-700 ml-1 mb-[-1px] z-10"
                    >
                      {field.label}
                    </label>
                    <Field
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      placeholder={field.label}
                      className="h-[40px] bg-amber-50 p-2 shadow-xl rounded-lg"
                    />
                    <ErrorMessage
                      name={field.name}
                      component="div"
                      className="text-red-600 ml-1 text-xs"
                    />
                  </div>
                ))}

                <div className="flex flex-col w-[400px] max-md:w-[300px]">
                  <label
                    htmlFor="image"
                    className="text-[14px] font-semibold text-gray-700 ml-1 mb-[-2px] z-10"
                  >
                    Image:
                  </label>
                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const file = e.currentTarget.files?.[0] || null;
                      setFieldValue("image", file);
                    }}
                    className="h-[40px] bg-amber-50 shadow-xl rounded-lg cursor-pointer text-base p-2"
                  />
                  <ErrorMessage
                    name="image"
                    component="div"
                    className="text-red-600 ml-1 text-xs"
                  />
                </div>
              </div>
              <div className="w-full flex justify-center mt-4">
                <button
                  type="submit"
                  className="px-10 py-2 bg-indigo-500 text-white rounded-lg shadow-lg cursor-pointer hover:scale-110"
                >
                  Sign Up
                </button>
              </div>
            </Form>
          )}
        </Formik>
      )}
    </>
  );
};

export default AdminSignUp;
