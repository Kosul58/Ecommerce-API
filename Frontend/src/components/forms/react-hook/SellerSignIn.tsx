import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import type { SignInValues } from "../../../types/sellertypes";
import { SignInSchema } from "../../../validations/formValidations";
import { useSellerSignIn } from "../../../hooks/useAuth";
interface SignInProps {
  setSellerSigned: React.Dispatch<React.SetStateAction<boolean>>;
}

const SellerSignIn: React.FC<SignInProps> = ({ setSellerSigned }) => {
  const [formState, setFormState] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: yupResolver(SignInSchema),
    mode: "onTouched",
  });
  const { mutateAsync: signIn, isPending } = useSellerSignIn();

  const onSubmit = async (values: SignInValues) => {
    try {
      const result = await signIn(values);
      console.log(result);
      if (result.success === true) {
        if (result.message === "Seller email is not verified") {
          alert("Email is not verifed");
          navigate("/verify/seller");
          return;
        }
        reset();
        setSellerSigned(true);
        navigate("/sellerdashboard");
      } else {
        alert("Failed to Sign In as a Seller");
        navigate("/");
      }
      console.log("Server response:", result);
    } catch (err) {
      console.error("Error:", err);
      navigate("/");
    }
  };

  return (
    <>
      <button
        className="bg-white px-6 py-2 rounded-md text-xl cursor-pointer hover:scale-105"
        onClick={() => setFormState(true)}
      >
        Seller Sign In
      </button>

      {formState && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] bg-indigo-100 rounded-2xl p-6"
        >
          <IoIosCloseCircleOutline
            className="absolute top-2 right-2 text-2xl font-bold text-red-600 cursor-pointer"
            onClick={() => setFormState(false)}
          />
          <div className="w-full flex justify-center items-center mb-8">
            <p>Seller Sign In</p>
          </div>

          <div className="flex flex-col gap-4 justify-center items-center">
            {[
              { label: "Email", name: "email", type: "email" },
              { label: "Password", name: "password", type: "password" },
            ].map((field) => (
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
                  {...register(field.name as keyof SignInValues)}
                  id={field.name}
                  type={field.type}
                  placeholder={field.label}
                  className="h-[40px] bg-amber-50 p-2 shadow-xl rounded-lg"
                />
                {errors[field.name as keyof SignInValues] && (
                  <p className="text-red-600 ml-1 text-xs">
                    {errors[field.name as keyof SignInValues]?.message}
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
              {isPending ? "Signining in ..." : "Sign In"}
            </button>
          </div>
        </form>
      )}
    </>
  );
};

export default SellerSignIn;
