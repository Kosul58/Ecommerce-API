import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { IoIosCloseCircleOutline } from "react-icons/io";
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
interface SignInProps {
  formState: boolean;
  setFormState: React.Dispatch<React.SetStateAction<boolean>>;
  setSellerSigned: React.Dispatch<React.SetStateAction<boolean>>;
}
const SellerSignIn: React.FC<SignInProps> = ({ setSellerSigned }) => {
  const [formState, setFormState] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (
    values: typeof initialValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const res = await fetch("http://localhost:3000/api/seller/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(values),
      });
      const result = await res.json();
      if (result.success === true) {
        resetForm();
        setSellerSigned(true);
        sessionStorage.setItem("sellerdata", JSON.stringify(result.data));
        console.log("Navigating to sellerdashboard");
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
        className="bg-white px-6 py-2 rounded-md text-xl cursor-pointer hover:scale-105 "
        onClick={() => {
          setFormState(true);
        }}
      >
        Seller Sign In
      </button>

      {formState && (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-auto bg-indigo-100 rounded-2xl p-6">
              <IoIosCloseCircleOutline
                className="absolute top-2 right-2 text-2xl font-bold text-red-600 cursor-pointer"
                onClick={() => setFormState(false)}
              />
              <div className="w-full flex justify-center items-center mb-8">
                <p>Seller Sign In</p>
              </div>
              <div className="flex flex-col gap-4 justify-center items-center">
                {[
                  { label: "Username:", name: "username", type: "text" },
                  { label: "Email:", name: "email", type: "email" },
                  { label: "Password:", name: "password", type: "password" },
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
              </div>
              <div className="w-full flex justify-center mt-4">
                <button
                  type="submit"
                  className="px-10 py-2 bg-indigo-500 text-white rounded-lg shadow-lg cursor-pointer hover:scale-110"
                >
                  Sign In
                </button>
              </div>
            </Form>
          )}
        </Formik>
      )}
    </>
  );
};

export default SellerSignIn;
