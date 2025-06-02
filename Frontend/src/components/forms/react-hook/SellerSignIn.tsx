import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import type { SignInValues } from "../../../types/sellertypes";
import { SignInSchema } from "../../../validations/formValidations";
import { useSellerSignIn, useResendOtp } from "../../../hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen,
  faChartLine,
  faUndo,
  faHeadset,
  faHandshake,
  faStore,
} from "@fortawesome/free-solid-svg-icons";
import type { AxiosError } from "axios";
import Notification from "../../notifications/Notification";

interface SignInProps {
  toggleToSignUp: () => void;
}

const SellerSignIn: React.FC<SignInProps> = ({ toggleToSignUp }) => {
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
  const { mutateAsync: resendOtp } = useResendOtp();

  const [notification, setNotification] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const onSubmit = async (values: SignInValues) => {
    try {
      const result = await signIn(values);
      if (result.success === true) {
        if (result.message === "Seller email is not verified") {
          sessionStorage.setItem("selleremail", values.email);
          try {
            showNotification(
              "error",
              "Email not verified. OTP has been resent."
            );
            await resendOtp({ email: values.email });
          } catch (resendErr) {
            console.error("Resend OTP Error:", resendErr);
            showNotification(
              "error",
              "Failed to resend OTP. Please try again."
            );
          }
          navigate("/seller/verify");
          return;
        }
        showNotification("success", "Sign In successful.");
        reset();
        setTimeout(() => {
          navigate("/sellerdashboard");
        }, 1200);
      } else {
        showNotification("error", "Failed to sign in as a seller.");
        navigate("/");
      }
    } catch (error) {
      const err = error as AxiosError;
      if (err.response) {
        const status = err.response.status;
        if (status === 401) {
          showNotification("error", "Password does not match.");
        } else if (status === 400) {
          showNotification("error", "Invalid input. Please check your fields.");
        } else if (status === 404) {
          showNotification(
            "error",
            "No seller found. Please check your inputs."
          );
        } else if (status === 500) {
          showNotification("error", "Server error. Please try again later.");
        }
      } else {
        showNotification("error", "Network error or server unreachable.");
      }
      reset();
    }
  };

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-row overflow-hidden relative">
      {notification && (
        <div className="absolute bottom-4 right-4 z-50">
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        </div>
      )}

      <div className="lg:w-1/2 w-full bg-gray-800 text-white p-10 flex flex-col justify-center items-center text-center space-y-6 max-sm:hidden border-r border-gray-700">
        <img
          src="https://cdn-icons-png.flaticon.com/512/891/891462.png"
          alt="Seller dashboard"
          className="w-24 h-24 md:w-28 md:h-28 filter brightness-0 invert"
        />
        <h2 className="text-3xl md:text-4xl font-extrabold text-blue-400">
          Welcome to Seller Portal
        </h2>
        <p className="text-base md:text-lg max-w-md text-gray-300">
          Power up your online business with smart tools to manage your
          products, orders, and customers — all in one place.
        </p>
        <ul className="space-y-4 text-sm md:text-md text-left max-w-sm">
          <li className="flex items-start gap-3">
            <FontAwesomeIcon
              icon={faBoxOpen}
              className="text-blue-400 w-5 h-5 mt-1"
            />
            <span>Track and manage inventory & orders in real-time</span>
          </li>
          <li className="flex items-start gap-3">
            <FontAwesomeIcon
              icon={faChartLine}
              className="text-blue-400 w-5 h-5 mt-1"
            />
            <span>Access analytics and performance insights</span>
          </li>
          <li className="flex items-start gap-3">
            <FontAwesomeIcon
              icon={faUndo}
              className="text-blue-400 w-5 h-5 mt-1"
            />
            <span>Handle returns and refunds with ease</span>
          </li>
          <li className="flex items-start gap-3">
            <FontAwesomeIcon
              icon={faHeadset}
              className="text-blue-400 w-5 h-5 mt-1"
            />
            <span>24/7 dedicated seller support</span>
          </li>
          <li className="flex items-start gap-3">
            <FontAwesomeIcon
              icon={faHandshake}
              className="text-blue-400 w-5 h-5 mt-1"
            />
            <span>Grow your customer trust with verified service</span>
          </li>
          <li className="flex items-start gap-3">
            <FontAwesomeIcon
              icon={faStore}
              className="text-blue-400 w-5 h-5 mt-1"
            />
            <span>Customize and manage your storefront</span>
          </li>
        </ul>
      </div>

      <div className="lg:w-1/2 w-full p-8 flex items-center justify-center bg-gray-900">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-md flex flex-col gap-6"
        >
          <h3 className="text-2xl font-bold text-center text-blue-400 mb-4">
            Seller Sign In
          </h3>

          {[
            { label: "Email", name: "email", type: "email" },
            { label: "Password", name: "password", type: "password" },
          ].map((field) => (
            <div key={field.name} className="flex flex-col gap-1">
              <label
                htmlFor={field.name}
                className="text-sm font-semibold text-gray-300"
              >
                {field.label}
              </label>
              <input
                {...register(field.name as keyof SignInValues)}
                id={field.name}
                type={field.type}
                placeholder={`Enter your ${field.label.toLowerCase()}`}
                className="h-10 bg-gray-700 p-2 rounded-lg border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-70 cursor-pointer"
            disabled={isPending}
          >
            {isPending ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-sm text-center text-gray-400">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={toggleToSignUp}
              className="text-blue-400 font-medium hover:underline cursor-pointer"
            >
              Sign Up
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SellerSignIn;
