import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

type FormValues = {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  confirmpassword: string;
  phone: string;
  address: string;
};

const validationSchema = Yup.object({
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

const UserSignUp = () => {
  const [formState, setFormState] = useState(false);
  const [step, setStep] = useState(1);
  const [result, setResult] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    mode: "onTouched",
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:3000/api/user/signup", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = await res.json();
      if (result.success === true) {
        reset();
        setResult(true);
      } else {
        setResult(false);
        setIsSubmitting(false);
      }
    } catch (err) {
      setResult(false);
      setIsSubmitting(false);
      throw err;
    }
  };

  const step1Fields = [
    { label: "Username", name: "username", type: "text" },
    { label: "Email", name: "email", type: "email" },
    { label: "Password", name: "password", type: "password" },
    { label: "Confirm Password", name: "confirmpassword", type: "password" },
  ];

  const step2Fields = [
    { label: "Firstname", name: "firstname", type: "text" },
    { label: "Lastname", name: "lastname", type: "text" },
    { label: "Phone", name: "phone", type: "tel" },
    { label: "Address", name: "address", type: "text" },
  ];

  const handleNext = async () => {
    const result = await trigger(
      step1Fields.map((f) => f.name as keyof FormValues)
    );
    if (result) setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setResult(null);
  };

  const activeStep = result ? 3 : step;

  return (
    <>
      <button
        className="bg-white px-6 py-2 rounded-md text-xl cursor-pointer hover:scale-105"
        onClick={() => setFormState(true)}
      >
        User Sign Up
      </button>

      {formState && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] bg-indigo-100 rounded-2xl p-6"
          noValidate
        >
          <IoIosCloseCircleOutline
            className="absolute top-2 right-2 text-2xl font-bold text-red-600 cursor-pointer"
            onClick={() => {
              setFormState(false);
              setStep(1);
              reset();
              setResult(null);
            }}
          />

          <div className="w-full flex justify-center items-center mb-6">
            <p className="text-xl font-semibold">User Sign Up</p>
          </div>

          <div className="flex justify-between items-center mb-4">
            {[
              "Account Info",
              "Personal Info",
              result === true
                ? "Success"
                : result === false
                ? "Error"
                : "Result",
            ].map((label, index) => {
              const stepNumber = index + 1;
              const isActive = activeStep === stepNumber;
              const isCompleted = activeStep > stepNumber;
              return (
                <div key={label} className="flex flex-col items-center w-1/3">
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full mb-1 text-sm font-semibold
                    ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-indigo-500 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  <span
                    className={`text-xs ${
                      isActive ? "text-black font-semibold" : "text-gray-500"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="w-full bg-gray-300 rounded-full h-2 mb-8">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                result === null
                  ? "bg-indigo-500"
                  : result === true
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
              style={{
                width:
                  activeStep === 1 ? "33%" : activeStep === 2 ? "66%" : "100%",
              }}
            />
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            {(step === 1 ? step1Fields : step2Fields).map((field) => (
              <div
                key={field.name}
                className="flex flex-col w-[48%] min-w-[300px]"
              >
                <label
                  htmlFor={field.name}
                  className="text-sm font-semibold text-gray-700 ml-1"
                >
                  {field.label}
                </label>
                <input
                  {...register(field.name as keyof FormValues)}
                  id={field.name}
                  type={field.type}
                  placeholder={field.label}
                  className="h-[40px] bg-amber-50 p-2 shadow-xl rounded-lg"
                />
                {errors[field.name as keyof FormValues] && (
                  <p className="text-red-600 ml-1 text-xs">
                    {errors[field.name as keyof FormValues]?.message as string}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="w-full flex justify-center gap-4 mt-6">
            {step === 2 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2 bg-gray-400 text-white rounded-lg shadow-lg hover:bg-gray-500"
              >
                Back
              </button>
            )}
            {step === 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-indigo-500 text-white rounded-lg shadow-lg hover:bg-indigo-600"
              >
                Next
              </button>
            )}
            {step === 2 && (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-10 py-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 ${
                  isSubmitting === false ? "cursor-pointer" : "cursor-text"
                } `}
              >
                {isSubmitting ? "Submitting..." : "Sign Up"}
              </button>
            )}
          </div>
        </form>
      )}
    </>
  );
};

export default UserSignUp;
