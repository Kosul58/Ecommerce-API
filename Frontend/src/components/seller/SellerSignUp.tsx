import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const validationSchema = Yup.object({
  shopname: Yup.string().min(2).required("Shop name is required"),
  username: Yup.string().required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6).required("Password is required"),
  confirmpassword: Yup.string()
    .min(6)
    .required("Confirm Password is required")
    .oneOf([Yup.ref("password")], "Passwords must match"),
  phone: Yup.string()
    .required("Phone is required")
    .matches(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  address: Yup.string().required("Address is required"),
});

const initialValues = {
  shopname: "",
  username: "",
  email: "",
  password: "",
  confirmpassword: "",
  phone: "",
  address: "",
};

const SellerSignUp = () => {
  const [formState, setFormState] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (
    values: typeof initialValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    if (values.confirmpassword !== values.password) {
      alert("Passwords do not match");
      return;
    }
    if (!image) {
      alert("Image is required");
      return;
    }

    const form = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      form.append(key, value);
    });
    form.append("image", image);

    try {
      const res = await fetch("http://localhost:3000/api/seller/signup", {
        method: "POST",
        credentials: "include",
        body: form,
      });

      const result = await res.json();
      if (result.success === true) {
        resetForm();
        setImage(null);
        sessionStorage.setItem("sellerdata", JSON.stringify(result.data));
        navigate("/sellerdashboard");
      }
      console.log("Server response:", result);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <>
      <button
        className="bg-white px-6 py-2 rounded-md text-xl cursor-pointer hover:scale-105"
        onClick={() => setFormState(true)}
      >
        Seller Sign Up
      </button>

      {formState && (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-auto bg-indigo-100 rounded-2xl p-6">
              <IoIosCloseCircleOutline
                className="absolute top-2 right-2 text-2xl font-bold text-red-600 cursor-pointer"
                onClick={() => setFormState(false)}
              />
              <div className="w-full flex justify-center items-center mb-8">
                <p className="text-xl font-semibold">Seller Sign Up</p>
              </div>

              <div className="flex flex-wrap gap-4 justify-center">
                {[
                  { label: "Shop Name", name: "shopname", type: "text" },
                  { label: "Username", name: "username", type: "text" },
                  { label: "Email", name: "email", type: "email" },
                  { label: "Phone", name: "phone", type: "tel" },
                  { label: "Password", name: "password", type: "password" },
                  {
                    label: "Confirm Password",
                    name: "confirmpassword",
                    type: "password",
                  },
                  { label: "Address", name: "address", type: "text" },
                ].map((field) => (
                  <div
                    key={field.name}
                    className="flex flex-col w-[48%] min-w-[300px]"
                  >
                    <label
                      htmlFor={field.name}
                      className="text-sm font-semibold text-gray-700 ml-1 mb-[-1px]"
                    >
                      {field.label}:
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
                    className="text-sm font-semibold text-gray-700 ml-1 mb-[-2px]"
                  >
                    Image:
                  </label>
                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.currentTarget.files?.[0] || null;
                      setImage(file);
                    }}
                    className="h-[40px] bg-amber-50 shadow-xl rounded-lg cursor-pointer text-base p-2"
                  />
                  {!image && (
                    <div className="text-red-600 ml-1 text-xs">
                      Image is required
                    </div>
                  )}
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

export default SellerSignUp;
