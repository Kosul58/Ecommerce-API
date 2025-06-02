import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

const validationSchema = Yup.object({
  username: Yup.string().required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(1).required("Password is required"),
});

const initialValues = {
  username: "",
  email: "",
  password: "",
};

const SellerSignIn = () => {
  const navigate = useNavigate();

  const handleSubmit = async (
    values: typeof initialValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const res = await fetch("http://localhost:3000/api/seller/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });
      const result = await res.json();
      if (result.success === true) {
        resetForm();
        sessionStorage.setItem("sellerdata", JSON.stringify(result.data));
        navigate("/sellerdashboard");
      }
      console.log("Server response:", result);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-indigo-300 p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side Info */}
        <div className="lg:w-1/2 w-full bg-indigo-500 text-white p-8 flex flex-col justify-center">
          <h2 className="text-4xl font-bold mb-4">Welcome Back Seller!</h2>
          <p className="text-lg mb-6">
            Sign in to manage your products, view sales, and access exclusive
            tools to grow your business.
          </p>
          <ul className="space-y-3 text-md">
            {[
              "Real-time Order Management",
              "Sales Dashboard & Insights",
              "Fast and Secure Payments",
              "24/7 Dedicated Support",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-white rounded-full inline-block" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side Form */}
        <div className="lg:w-1/2 w-full p-8">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {() => (
              <Form className="flex flex-col gap-6">
                <h3 className="text-2xl font-bold text-center text-indigo-700 mb-4">
                  Seller Sign In
                </h3>
                {[
                  { label: "Username", name: "username", type: "text" },
                  { label: "Email", name: "email", type: "email" },
                  { label: "Password", name: "password", type: "password" },
                ].map((field) => (
                  <div key={field.name} className="flex flex-col gap-1">
                    <label
                      htmlFor={field.name}
                      className="text-sm font-semibold text-gray-700"
                    >
                      {field.label}
                    </label>
                    <Field
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      className="h-10 bg-indigo-50 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <ErrorMessage
                      name={field.name}
                      component="div"
                      className="text-red-600 text-xs"
                    />
                  </div>
                ))}

                <button
                  type="submit"
                  className="bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  Sign In
                </button>

                <p className="text-sm text-center text-gray-600">
                  Don’t have an account?{" "}
                  <a
                    href="/sellersignup"
                    className="text-indigo-600 font-medium hover:underline"
                  >
                    Sign Up
                  </a>
                </p>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default SellerSignIn;
