import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import type { SignInValues } from "../../../types/sellertypes";
import { SignInSchema } from "../../../validations/formValidations";
import { useUserSignIn, useResendOtp } from "../../../hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faLock,
  faShoppingCart,
  faHeart,
  faMapMarkerAlt,
  faSignInAlt,
} from "@fortawesome/free-solid-svg-icons";
import type { AxiosError } from "axios";
import Notification from "../../notifications/Notification";

interface SignInProps {
  toggleToSignUp: () => void;
}

const UserSignIn: React.FC<SignInProps> = ({ toggleToSignUp }) => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: yupResolver(SignInSchema),
    mode: "onTouched",
  });

  const { mutateAsync: signIn, isPending } = useUserSignIn();
  const { mutateAsync: resendOtp } = useResendOtp();

  const onSubmit = async (values: SignInValues) => {
    try {
      const result = await signIn(values);
      if (result.success === true) {
        if (result.message === "User email is not verified") {
          sessionStorage.setItem("useremail", values.email);
          try {
            await resendOtp({ email: values.email });
            showNotification(
              "Email is not verified. A new OTP has been sent.",
              "error"
            );
          } catch {
            showNotification(
              "Failed to resend OTP. Please try again.",
              "error"
            );
          }
          navigate("/user/verify");
          return;
        }
        showNotification("Sign In successful.", "success");
        reset();
        setTimeout(() => {
          navigate("/");
        }, 1200);
      } else {
        showNotification("Failed to Sign In as a User", "error");
        navigate("/");
      }
    } catch (error) {
      const err = error as AxiosError;
      if (err.response) {
        const status = err.response.status;
        if (status === 401) {
          showNotification("Password does not match", "error");
        } else if (status === 400) {
          showNotification(
            "Invalid input data. Please check your input fields.",
            "error"
          );
        } else if (status === 404) {
          showNotification(
            "No user found. Please check your input fields.",
            "error"
          );
        } else if (status === 500) {
          showNotification("Server error. Please try again later.", "error");
        }
      } else {
        showNotification("Network error or server is unreachable.", "error");
      }
      reset();
    }
  };

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-row overflow-hidden">
      <div className="lg:w-1/2 w-full bg-gray-800 text-white p-10 flex flex-col justify-center items-center text-center space-y-6 max-sm:hidden border-r border-gray-700">
        <h2 className="text-3xl md:text-4xl font-extrabold text-teal-400">
          Welcome Back, Valued User!
        </h2>
        <p className="text-base md:text-lg max-w-md text-gray-300">
          Sign in to continue your seamless shopping experience, manage your
          orders, and enjoy personalized recommendations.
        </p>
        <ul className="space-y-4 text-sm md:text-md text-left max-w-sm">
          <li className="flex items-start gap-3">
            <FontAwesomeIcon
              icon={faShoppingCart}
              className="text-teal-400 w-5 h-5 mt-1"
            />
            <span>Easily track your current and past orders.</span>
          </li>
          <li className="flex items-start gap-3">
            <FontAwesomeIcon
              icon={faHeart}
              className="text-teal-400 w-5 h-5 mt-1"
            />
            <span>Manage your cart and saved items.</span>
          </li>
          <li className="flex items-start gap-3">
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className="text-teal-400 w-5 h-5 mt-1"
            />
            <span>Update and save multiple shipping addresses.</span>
          </li>
          <li className="flex items-start gap-3">
            <FontAwesomeIcon
              icon={faUser}
              className="text-teal-400 w-5 h-5 mt-1"
            />
            <span>Access and modify your personal account details.</span>
          </li>
        </ul>
      </div>

      <div className="lg:w-1/2 w-full p-8 flex items-center justify-center bg-gray-900">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-md flex flex-col gap-6"
        >
          <h3 className="text-2xl font-bold text-center text-teal-400 mb-4">
            User Sign In
          </h3>

          {[
            { label: "Email", name: "email", type: "email", icon: faEnvelope },
            {
              label: "Password",
              name: "password",
              type: "password",
              icon: faLock,
            },
          ].map((field) => (
            <div key={field.name} className="flex flex-col gap-1">
              <label
                htmlFor={field.name}
                className="text-sm px-2 font-semibold text-gray-300"
              >
                <FontAwesomeIcon
                  icon={field.icon}
                  className="mr-2 text-teal-400"
                />
                {field.label}
              </label>
              <input
                {...register(field.name as keyof SignInValues)}
                id={field.name}
                type={field.type}
                placeholder={`Enter your ${field.label.toLowerCase()}`}
                className="h-10 bg-gray-700 p-2 rounded-lg border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {errors[field.name as keyof SignInValues] && (
                <p className="text-red-500 text-xs">
                  {errors[field.name as keyof SignInValues]?.message}
                </p>
              )}
            </div>
          ))}

          <button
            type="submit"
            className="bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-70 cursor-pointer flex items-center justify-center gap-2"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing In...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSignInAlt} /> Sign In
              </>
            )}
          </button>

          <p className="text-sm text-center text-gray-400">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={toggleToSignUp}
              className="text-teal-400 font-medium hover:underline cursor-pointer"
            >
              Sign Up
            </button>
          </p>
        </form>
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default UserSignIn;
