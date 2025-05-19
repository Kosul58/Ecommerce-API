import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { IoIosCloseCircleOutline } from "react-icons/io";

type FormValues = {
  username: string;
  email: string;
  password: string;
};

const validationSchema = Yup.object({
  username: Yup.string().required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6).required("Password is required"),
});

const UserSignIn = () => {
  const [formState, setFormState] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    mode: "onTouched",
  });

  const onSubmit = async (values: FormValues) => {
    try {
      console.log(values);
      const res = await fetch("http://localhost:3000/api/user/signin", {
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
        sessionStorage.setItem("userData", result.data);
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
        Admin Sign In
      </button>

      {formState && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-auto bg-indigo-100 rounded-2xl p-6"
        >
          <IoIosCloseCircleOutline
            className="absolute top-2 right-2 text-2xl font-bold text-red-600 cursor-pointer"
            onClick={() => setFormState(false)}
          />
          <div className="w-full flex justify-center items-center mb-8">
            <p>Admin Sign In</p>
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
                <input
                  id={field.name}
                  type={field.type}
                  placeholder={field.label}
                  {...register(field.name as keyof FormValues)}
                  className="h-[40px] bg-amber-50 p-2 shadow-xl rounded-lg"
                />
                {errors[field.name as keyof FormValues] && (
                  <p className="text-red-600 ml-1 text-xs">
                    {errors[field.name as keyof FormValues]?.message}
                  </p>
                )}
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
        </form>
      )}
    </>
  );
};

export default UserSignIn;
