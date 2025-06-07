import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import type { SellerValues } from "../../../types/sellertypes";
import { AxiosError } from "axios";
import { SellerSignUpSchema } from "../../../validations/formValidations";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import {
  useSellerSignUp,
  useSellerVerification,
  useResendOtp,
} from "../../../hooks/useAuth";
import Notification from "../../notifications/Notification";

interface SignUpProps {
  toggleToSignIn: () => void;
}

const SellerSignUp: React.FC<SignUpProps> = ({ toggleToSignIn }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();

  const {
    register,
    trigger,
    reset,
    getValues,
    formState: { errors },
  } = useForm<SellerValues>({
    resolver: yupResolver(SellerSignUpSchema),
    mode: "onTouched",
  });

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };
  const { mutateAsync: signUp, isPending } = useSellerSignUp();
  const { mutateAsync: verifySeller, isPending: otpPending } =
    useSellerVerification();
  const { mutateAsync: resendOtp } = useResendOtp();

  const step1Fields = [
    { label: "Username", name: "username", type: "text" },
    { label: "Email", name: "email", type: "email" },
    { label: "Password", name: "password", type: "password" },
    { label: "Confirm Password", name: "confirmpassword", type: "password" },
  ];

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout>;

    if (resendCooldown > 0) {
      timerId = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [resendCooldown]);

  const handleNext = async () => {
    const valid = await trigger();
    if (!valid) return;
    setIsSubmitting(true);
    try {
      const result = await signUp(getValues());
      if (result.success) {
        showNotification(
          "success",
          "Sign-up successful! Please verify your email."
        );
        setStep(2);
        setResendCooldown(60);
      } else {
        showNotification(
          "error",
          result.message || "Failed to sign up. Please try again."
        );
        navigate("/");
      }
    } catch (error) {
      const err = error as AxiosError;
      if (err.response) {
        const status = err.response.status;
        if (status === 409) {
          showNotification(
            "error",
            "An account with this email or username already exists."
          );
        } else if (status === 400) {
          showNotification(
            "error",
            "Invalid input data. Please check your fields."
          );
        } else if (status === 500) {
          showNotification("error", "Server error. Please try again later.");
        }
      } else {
        showNotification("error", "Network error or server is unreachable.");
      }
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerification = async () => {
    const email = getValues("email");
    try {
      const response = await verifySeller({ email, otp });
      if (response.success) {
        showNotification("success", "Email verified successfully!");
        resetForm();
        navigate("/seller/dashboard");
      } else {
        showNotification(
          "error",
          response.message || "Invalid OTP. Please try again."
        );
      }
    } catch (err) {
      console.error("OTP verification failed:", err);
      showNotification(
        "error",
        "An error occurred during OTP verification. Please try again."
      );
    }
  };

  const handleResendOtp = async () => {
    const email = getValues("email");
    try {
      await resendOtp({ email });
      showNotification("success", "OTP resent successfully to your email.");
      setResendCooldown(60);
    } catch (err) {
      console.error("Resend OTP failed:", err);
      showNotification("error", "Failed to resend OTP. Please try again.");
    }
  };

  const resetForm = () => {
    reset();
    setStep(1);
    setOtp("");
    setResendCooldown(0);
  };

  return (
    <>
      <div className="w-full h-screen bg-gray-900 flex flex-row justify-center items-center p-6">
        <div className="lg:w-2/4 w-full min-w-[320px] max-h-[700px] max-lg:w-[50%] text-white rounded-2xl p-8 flex flex-col justify-center items-start max-sm:hidden">
          <h1 className="text-5xl lg:text-6xl md:text-4xl sm:text-3xl font-extrabold mb-4 leading-tight">
            Join Our Marketplace!
          </h1>
          <p className="text-lg lg:text-xl max-w-md mb-6 leading-relaxed sm:text-base">
            Start selling your products to thousands of customers. Create your
            seller account today and enjoy{" "}
            <span className="font-semibold text-blue-400">exclusive tools</span>{" "}
            to grow your business online.
          </p>
          <ul className="space-y-3 text-sm sm:text-xs">
            {[
              "Instant Product Listings",
              "Analytics & Sales Tracking",
              "Secure & Fast Payouts",
              "24/7 Seller Support",
            ].map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-lg sm:text-base"
              >
                <IoIosCheckmarkCircleOutline
                  className="text-blue-400"
                  size={22}
                />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:w-2/5 max-lg:w-[50%] max-sm:min-w-[350px] md:min-w-[400px] max-h-[800px] bg-gray-800 rounded-2xl p-6 flex flex-col border border-gray-700">
          <h3 className="text-xl font-bold text-center mb-6 text-blue-400">
            Seller Sign Up
          </h3>
          <div className="flex justify-between items-center mb-6 px-2">
            {["Sign Up", "Verify Email"].map((label, index) => {
              const stepNumber = index + 1;
              const isActive = step === stepNumber;
              const isCompleted = step > stepNumber;
              return (
                <div key={label} className="flex flex-col items-center w-1/2">
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full mb-1 text-sm font-semibold transition ${
                      isCompleted
                        ? "bg-blue-500 text-gray-900"
                        : isActive
                        ? "bg-blue-400 text-gray-900"
                        : "bg-gray-600 text-gray-300"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  <span
                    className={`text-xs ${
                      isActive ? "text-white font-semibold" : "text-gray-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="w-full bg-gray-700 rounded-full h-2 mb-8">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                step === 1 ? "bg-blue-500" : "bg-blue-600"
              }`}
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>

          {step === 1 && (
            <form
              className="flex flex-wrap gap-4 justify-center"
              noValidate
              onSubmit={(e) => e.preventDefault()}
            >
              {step1Fields.map((field) => (
                <div
                  key={field.name}
                  className="flex flex-col w-full sm:w-[48%] min-w-[280px]"
                >
                  <label
                    htmlFor={field.name}
                    className="text-sm font-semibold text-slate-300 ml-1"
                  >
                    {field.label}
                  </label>
                  <input
                    {...register(field.name as keyof SellerValues)}
                    id={field.name}
                    type={field.type}
                    placeholder={field.label}
                    className="h-[40px] bg-gray-700 p-2 shadow-inner rounded-lg border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  {errors[field.name as keyof SellerValues] && (
                    <p className="text-red-500 ml-1 text-xs">
                      {
                        errors[field.name as keyof SellerValues]
                          ?.message as string
                      }
                    </p>
                  )}
                </div>
              ))}

              <div className="w-full flex justify-center mt-2">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting || isPending}
                  className={`px-10 py-2 bg-blue-500 text-white rounded-lg shadow-lg cursor-pointer hover:bg-blue-600 transition ${
                    isSubmitting || isPending
                      ? "cursor-not-allowed opacity-70"
                      : ""
                  } cursor-pointer `}
                >
                  {isSubmitting || isPending ? "Submitting..." : "Sign Up"}
                </button>
              </div>
              <p className="text-sm text-center text-gray-400 mt-4">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={toggleToSignIn}
                  className="text-blue-400 font-medium hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            </form>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center gap-6 px-4">
              <p className="text-center text-sm font-medium text-gray-400">
                Please check your email and enter the 6-digit OTP to verify your
                account.
              </p>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-2/3 h-10 text-center bg-gray-700 border border-blue-400 rounded-md shadow-md text-white placeholder-blue-300 focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-4 flex-wrap justify-center">
                <button
                  onClick={handleOtpVerification}
                  disabled={otpPending}
                  className="px-6 py-2 bg-blue-500 cursor-pointer text-white rounded-lg shadow-lg hover:bg-blue-600 transition disabled:opacity-60"
                >
                  {otpPending ? "Verifying..." : "Verify Email"}
                </button>

                <button
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0}
                  className={`px-6 py-2 rounded-lg shadow-lg cursor-pointer transition ${
                    resendCooldown > 0
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-gray-700 hover:bg-gray-600"
                  } text-white`}
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend OTP"}
                </button>
              </div>
            </div>
          )}
        </div>
        {notification && (
          <div className="absolute bottom-4 right-4 z-50">
            <Notification
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification(null)}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default SellerSignUp;
