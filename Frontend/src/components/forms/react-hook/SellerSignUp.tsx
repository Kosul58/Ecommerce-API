import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { IoIosCloseCircleOutline } from "react-icons/io";
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

const SellerSignUp = () => {
  const [formState, setFormState] = useState(false);
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

  const signUpMutation = useSellerSignUp();
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
      const result = await signUpMutation.mutateAsync(getValues());
      if (result.success) {
        alert("Sign-up successful! Please verify your email.");
        setStep(2);
        setResendCooldown(60);
      } else {
        alert(result.message || "Failed to sign up. Please try again.");
        navigate("/");
      }
    } catch (error) {
      console.error("Sign-up error:", error);
      const err = error as AxiosError;
      if (err.response) {
        const status = err.response.status;
        if (status === 409) {
          alert("An account with this email or username already exists.");
        } else if (status === 400) {
          alert("Invalid input data. Please check your fields.");
        } else if (status === 500) {
          alert("Server error. Please try again later.");
        }
      } else {
        alert("Network error or server is unreachable.");
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
        alert("Email verified successfully!");
        resetForm();
        navigate("/sellerdashboard");
      } else {
        alert(response.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("OTP verification failed:", err);
    }
  };

  const handleResendOtp = async () => {
    const email = getValues("email");
    try {
      await resendOtp({ email });
      alert("OTP resent successfully to your email.");
      setResendCooldown(60);
    } catch (err) {
      console.error("Resend OTP failed:", err);
    }
  };

  const resetForm = () => {
    reset();
    setFormState(false);
    setStep(1);
    setOtp("");
    setResendCooldown(0);
  };

  return (
    <>
      <button
        className="bg-white px-6 py-2 rounded-md text-xl cursor-pointer hover:scale-105 transition duration-300 shadow-md"
        onClick={() => setFormState(true)}
      >
        Seller Sign Up
      </button>

      {formState && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-300 p-4">
          <div className="relative w-full max-w-6xl h-[95vh] bg-gradient-to-br from-indigo-900 via-blue-800 to-cyan-700 rounded-2xl p-6 flex flex-col lg:flex-row justify-center items-center gap-6 shadow-2xl overflow-auto">
            <IoIosCloseCircleOutline
              className="absolute top-3 right-3 text-3xl text-cyan-300 cursor-pointer hover:scale-110 transition"
              onClick={resetForm}
            />

            {/* Left info panel */}
            <div className="lg:w-2/4 w-full min-w-[320px] text-white rounded-2xl p-8 flex flex-col justify-center items-start">
              <h1 className="text-5xl lg:text-6xl md:text-4xl sm:text-3xl font-extrabold mb-4 leading-tight">
                Join Our Marketplace!
              </h1>
              <p className="text-lg lg:text-xl max-w-md mb-6 leading-relaxed sm:text-base">
                Start selling your products to thousands of customers. Create
                your seller account today and enjoy{" "}
                <span className="font-semibold text-cyan-300">
                  exclusive tools
                </span>{" "}
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
                      className="text-cyan-300"
                      size={22}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right form panel */}
            <div className="lg:w-2/5 w-full min-w-[320px] bg-indigo-900 bg-opacity-70 rounded-2xl p-6 flex flex-col">
              <div className="text-xl font-bold text-center mb-6 text-cyan-300">
                Seller Sign Up
              </div>

              {/* Steps */}
              <div className="flex justify-between items-center mb-6 px-2">
                {["Sign Up", "Verify Email"].map((label, index) => {
                  const stepNumber = index + 1;
                  const isActive = step === stepNumber;
                  const isCompleted = step > stepNumber;
                  return (
                    <div
                      key={label}
                      className="flex flex-col items-center w-1/2"
                    >
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded-full mb-1 text-sm font-semibold transition ${
                          isCompleted
                            ? "bg-cyan-400 text-indigo-900"
                            : isActive
                            ? "bg-cyan-300 text-indigo-900"
                            : "bg-gray-400 text-gray-600"
                        }`}
                      >
                        {stepNumber}
                      </div>
                      <span
                        className={`text-xs ${
                          isActive
                            ? "text-white font-semibold"
                            : "text-gray-300"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-2 mb-8">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    step === 1 ? "bg-cyan-400" : "bg-cyan-600"
                  }`}
                  style={{ width: step === 1 ? "50%" : "100%" }}
                />
              </div>

              {/* Form Step 1 */}
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
                        className="text-sm font-semibold text-cyan-300 ml-1"
                      >
                        {field.label}
                      </label>
                      <input
                        {...register(field.name as keyof SellerValues)}
                        id={field.name}
                        type={field.type}
                        placeholder={field.label}
                        className="h-[40px] bg-cyan-50 bg-opacity-20 p-2 shadow-inner rounded-lg border border-cyan-300 text-black placeholder-black/25 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        disabled={isSubmitting}
                      />
                      {errors[field.name as keyof SellerValues] && (
                        <p className="text-red-400 ml-1 text-xs">
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
                      disabled={isSubmitting}
                      className={`px-10 py-2 bg-cyan-400 text-indigo-900 rounded-lg shadow-lg cursor-pointer hover:bg-cyan-500 transition ${
                        isSubmitting ? "cursor-not-allowed opacity-70" : ""
                      }`}
                    >
                      {isSubmitting ? "Submitting..." : "Sign Up"}
                    </button>
                  </div>
                  <a
                    href="#"
                    className="text-sm text-cyan-300 font-medium hover:underline hover:text-cyan-200 transition duration-200 mt-4 text-center block"
                  >
                    Already have an account?{" "}
                    <span className="underline">Sign In</span>
                  </a>
                </form>
              )}

              {/* Form Step 2 */}
              {step === 2 && (
                <div className="flex flex-col items-center gap-6 px-4">
                  <p className="text-center text-sm font-medium text-gray-300">
                    Please check your email and enter the 6-digit OTP to verify
                    your account.
                  </p>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    className="w-2/3 h-10 text-center bg-indigo-800 border border-cyan-300 rounded-md shadow-md text-white placeholder-cyan-200 focus:ring-2 focus:ring-cyan-400"
                  />
                  <div className="flex gap-4 flex-wrap justify-center">
                    <button
                      onClick={handleOtpVerification}
                      disabled={otpPending}
                      className="px-6 py-2 bg-cyan-400 text-indigo-900 rounded-lg shadow-lg hover:bg-cyan-500 transition disabled:opacity-60"
                    >
                      {otpPending ? "Verifying..." : "Verify Email"}
                    </button>

                    <button
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0}
                      className={`px-6 py-2 rounded-lg shadow-lg transition ${
                        resendCooldown > 0
                          ? "bg-gray-500 cursor-not-allowed"
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
          </div>
        </div>
      )}
    </>
  );
};

export default SellerSignUp;
