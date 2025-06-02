import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useResendOtp, useUserVerification } from "../../hooks/useAuth";

const VerifyUser = () => {
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60); // cooldown starts at 60s
  const navigate = useNavigate();

  const storedEmail = sessionStorage.getItem("useremail") || "";
  console.log(storedEmail);
  const { mutateAsync: verifyOtp, isPending: otpPending } =
    useUserVerification();
  const { mutateAsync: resendOtp, isPending: resendPending } = useResendOtp();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) clearInterval(timer);
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, []);

  const handleOtpVerification = async () => {
    if (otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP.");
      return;
    }
    if (!storedEmail) {
      alert("Email not found. Please sign in again.");
      navigate("/seller");
      return;
    }

    try {
      const response = await verifyOtp({ email: storedEmail, otp });
      if (response.success) {
        alert("Email verified successfully!");
        sessionStorage.removeItem("sellerEmail");
        navigate("/userdashboard");
      } else {
        alert(response.message || "Verification failed.");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      alert("An error occurred while verifying OTP.");
    }
  };

  const handleResendOtp = async () => {
    if (!storedEmail) {
      alert("Email not found. Please sign in again.");
      navigate("/user");
      return;
    }

    try {
      const response = await resendOtp({ email: storedEmail });
      if (response.success) {
        alert("OTP resent successfully.");
        setResendCooldown(60);
      } else {
        alert(response.message || "Failed to resend OTP.");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      alert("An error occurred while resending OTP.");
    }
  };

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden flex justify-center items-center px-4">
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-blue-500 filter blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full bg-indigo-600 filter blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-md w-full bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-blue-400 mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-400">
            We've sent a 6-digit code to{" "}
            <span className="text-blue-300">{storedEmail}</span>
          </p>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={otp}
            onChange={(e) => {
              const numericValue = e.target.value.replace(/\D/g, ""); // Remove non-digits
              setOtp(numericValue);
            }}
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            className="w-full h-12 px-4 text-center bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleOtpVerification}
            disabled={otpPending || otp.length !== 6}
            className={`flex-1 py-3 rounded-lg font-medium transition ${
              otpPending || otp.length !== 6
                ? "bg-blue-700 opacity-50 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 cursor-pointer"
            }`}
          >
            {otpPending ? (
              <span className="flex justify-center items-center gap-2">
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
                Verifying...
              </span>
            ) : (
              "Verify Email"
            )}
          </button>

          <button
            onClick={handleResendOtp}
            disabled={resendCooldown > 0 || resendPending}
            className={`flex-1 py-3 rounded-lg font-medium transition ${
              resendCooldown > 0 || resendPending
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-gray-700 hover:bg-gray-600 text-blue-400 cursor-pointer"
            }`}
          >
            {resendPending
              ? "Sending..."
              : resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : "Resend OTP"}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          Didn't receive the code? Check your email once again or resend otp
          {/* <button
            onClick={handleResendOtp}
            disabled={resendCooldown > 0}
            className={`text-blue-400 hover:underline ${
              resendCooldown > 0
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer"
            }`}
          >
            request a new one
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default VerifyUser;
