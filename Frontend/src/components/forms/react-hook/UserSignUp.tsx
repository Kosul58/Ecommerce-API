import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import type { UserValues } from "../../../types/sellertypes";
import { AxiosError } from "axios";
import { UserSignUpSchema } from "../../../validations/formValidations";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import {
  useUserSignUp,
  useUserVerification,
  useResendOtp,
} from "../../../hooks/useAuth";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import Notification from "../../notifications/Notification";

interface SignUpProps {
  toggleToSignIn: () => void;
}

const UserSignUp: React.FC<SignUpProps> = ({ toggleToSignIn }) => {
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
  } = useForm<UserValues>({
    resolver: yupResolver(UserSignUpSchema),
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

  const { mutateAsync: signUp, isPending } = useUserSignUp();
  const { mutateAsync: verifyUser, isPending: otpPending } =
    useUserVerification();
  const { mutateAsync: resendOtp } = useResendOtp();

  const step1Fields = [
    { label: "Username", name: "username", type: "text", icon: FaUser },
    { label: "Email", name: "email", type: "email", icon: FaEnvelope },
    { label: "Password", name: "password", type: "password", icon: FaLock },
    {
      label: "Confirm Password",
      name: "confirmpassword",
      type: "password",
      icon: FaLock,
    },
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
    const valid = await trigger(
      step1Fields.map((field) => field.name as keyof UserValues)
    );
    if (!valid) return;

    setIsSubmitting(true);
    try {
      const result = await signUp(getValues());
      console.log(result);
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
      const response = await verifyUser({ email, otp });
      if (response.success) {
        showNotification("success", "Email verified successfully!");
        resetForm();
        navigate("/userdashboard");
      } else {
        showNotification(
          "error",
          response.message || "Invalid OTP. Please try again."
        );
      }
    } catch {
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
    } catch {
      showNotification("error", "Failed to resend OTP. Please try again.");
    }
  };

  const resetForm = () => {
    reset();
    setStep(1);
    setOtp("");
    setResendCooldown(0);
    setIsSubmitting(false);
  };

  return (
    <>
      <div className="w-full h-screen bg-gray-900 flex flex-row justify-evenly items-center p-6">
        <div className="lg:w-2/5 w-full min-w-[320px] max-h-[700px] text-white rounded-2xl p-8 flex flex-col justify-center items-start max-sm:hidden">
          <h1 className="text-5xl lg:text-6xl md:text-4xl sm:text-3xl font-extrabold mb-4 leading-tight">
            Join Our Community!
          </h1>
          <p className="text-lg lg:text-xl max-w-md mb-6 leading-relaxed sm:text-base">
            Sign up to unlock your{" "}
            <span className="font-semibold text-teal-400">
              personalized shopping experience
            </span>
            , track your orders, and discover{" "}
            <span className="font-semibold text-teal-400">exclusive deals</span>{" "}
            tailored just for you.
          </p>
          <ul className="space-y-3 text-sm sm:text-xs">
            {[
              "Personalized Product Recommendations",
              "Effortless Order Tracking",
              "Exclusive Member Discounts",
              "Save Favorites in Wishlist",
              "Quick & Secure Checkout",
            ].map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-lg sm:text-base"
              >
                <IoIosCheckmarkCircleOutline
                  className="text-teal-400"
                  size={22}
                />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:w-2/5 max-lg:w-[50%] max-sm:min-w-[350px] md:min-w-[400px] max-h-[800px] bg-gray-800 rounded-2xl p-6 flex flex-col border border-gray-700">
          <div className="text-xl font-bold text-center mb-6 text-teal-400">
            User Sign Up
          </div>
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
                        ? "bg-teal-500 text-gray-900"
                        : isActive
                        ? "bg-teal-400 text-gray-900"
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
                step === 1 ? "bg-teal-500" : "bg-teal-600"
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
                    {...register(field.name as keyof UserValues)}
                    id={field.name}
                    type={field.type}
                    placeholder={field.label}
                    className="h-[40px] bg-gray-700 p-2 shadow-inner rounded-lg border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    disabled={isSubmitting}
                  />
                  {errors[field.name as keyof UserValues] && (
                    <p className="text-red-500 ml-1 text-xs">
                      {
                        errors[field.name as keyof UserValues]
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
                  className={`px-10 py-2 bg-teal-600 text-white rounded-lg shadow-lg cursor-pointer hover:bg-teal-700 transition ${
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
                  className="text-teal-400 font-medium hover:underline cursor-pointer"
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
                className="w-2/3 h-10 text-center bg-gray-700 border border-teal-400 rounded-md shadow-md text-white placeholder-teal-300 focus:ring-2 focus:ring-teal-500"
              />
              <div className="flex gap-4 flex-wrap justify-center">
                <button
                  onClick={handleOtpVerification}
                  disabled={otpPending}
                  className="px-6 py-2 bg-teal-600 cursor-pointer text-white rounded-lg shadow-lg hover:bg-teal-700 transition disabled:opacity-60"
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

export default UserSignUp;
