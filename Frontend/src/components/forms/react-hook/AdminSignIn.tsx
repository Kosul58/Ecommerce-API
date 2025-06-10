import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import type { SignInValues } from "../../../types/sellertypes";
import { SignInSchema } from "../../../validations/formValidations";
import { useAdminSignIn, useResendOtp } from "../../../hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faSignInAlt,
  faChartBar,
  faUsers,
  faBoxes,
  faClipboardCheck,
  faCog,
} from "@fortawesome/free-solid-svg-icons";
import type { AxiosError } from "axios";
import Notification from "../../notifications/Notification";

const AdminSignIn = () => {
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
    formState: { errors },
    reset,
  } = useForm<SignInValues>({
    resolver: yupResolver(SignInSchema),
    mode: "onTouched",
  });

  const { mutateAsync: signIn, isPending } = useAdminSignIn();
  const { mutateAsync: resendOtp } = useResendOtp();

  const onSubmit = async (values: SignInValues) => {
    try {
      const result = await signIn(values);
      if (result.success === true) {
        if (result.message === "Admin email is not verified") {
          sessionStorage.setItem("adminEmail", values.email);
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
          navigate("/admin/verify");
          return;
        }
        showNotification("Admin Sign In successful.", "success");
        reset();
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 1200);
      } else {
        showNotification(
          result.message || "Failed to Sign In as an Admin",
          "error"
        );
      }
    } catch (error) {
      const err = error as AxiosError;
      if (err.response) {
        const status = err.response.status;
        if (status === 401) {
          showNotification(
            "Invalid credentials. Please check your email and password.",
            "error"
          );
        } else if (status === 400) {
          showNotification(
            "Invalid input data. Please check your input fields.",
            "error"
          );
        } else if (status === 404) {
          showNotification(
            "Admin account not found. Please check your email.",
            "error"
          );
        } else if (status === 500) {
          showNotification("Server error. Please try again later.", "error");
        } else {
          showNotification(`An unexpected error occurred: ${status}`, "error");
        }
      } else {
        showNotification(
          "Network error or server is unreachable. Please try again.",
          "error"
        );
      }
      reset();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-row overflow-hidden">
      <div className="lg:w-1/2 w-full bg-gray-800 text-white p-10 flex flex-col justify-center items-center text-center space-y-8 max-sm:hidden border-r border-gray-700 shadow-xl">
        <h2 className="text-4xl font-extrabold text-purple-400 leading-tight">
          Welcome to the <br />
          <span className="bg-gradient-to-r from-purple-400 to-indigo-500 text-transparent bg-clip-text">
            Admin Portal
          </span>
        </h2>
        <p className="text-lg max-w-md text-gray-300">
          Your command center for seamless platform management. Access robust
          tools to oversee users, products, orders, and system configurations.
        </p>
        <ul className="space-y-4 text-base text-left max-w-sm">
          <li className="flex items-start gap-4">
            <FontAwesomeIcon
              icon={faChartBar}
              className="text-purple-400 w-6 h-6 mt-1 flex-shrink-0"
            />
            <span>
              Access **comprehensive dashboard analytics** and insightful
              reports.
            </span>
          </li>
          <li className="flex items-start gap-4">
            <FontAwesomeIcon
              icon={faUsers}
              className="text-purple-400 w-6 h-6 mt-1 flex-shrink-0"
            />
            <span>
              Efficiently **manage user accounts**, define roles, and adjust
              permissions.
            </span>
          </li>
          <li className="flex items-start gap-4">
            <FontAwesomeIcon
              icon={faBoxes}
              className="text-purple-400 w-6 h-6 mt-1 flex-shrink-0"
            />
            <span>
              **Oversee product listings**, facilitate approvals, and monitor
              inventory levels.
            </span>
          </li>
          <li className="flex items-start gap-4">
            <FontAwesomeIcon
              icon={faClipboardCheck}
              className="text-purple-400 w-6 h-6 mt-1 flex-shrink-0"
            />
            <span>
              **Streamline order processing** and track customer deliveries with
              ease.
            </span>
          </li>
          <li className="flex items-start gap-4">
            <FontAwesomeIcon
              icon={faCog}
              className="text-purple-400 w-6 h-6 mt-1 flex-shrink-0"
            />
            <span>
              **Configure critical system settings** and unlock advanced
              platform features.
            </span>
          </li>
        </ul>
      </div>

      <div className="lg:w-1/2 w-full p-8 flex items-center justify-center bg-gray-900">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-md bg-gray-800 rounded-xl p-10 shadow-2xl flex flex-col gap-7 transform  transition-transform duration-300 ease-in-out border border-gray-700"
        >
          <h3 className="text-4xl font-bold text-center text-purple-400 mb-6 drop-shadow-md">
            Admin Sign In
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
            <div key={field.name} className="flex flex-col gap-2">
              <label
                htmlFor={field.name}
                className="text-base px-1 font-semibold text-gray-300 flex items-center"
              >
                <FontAwesomeIcon
                  icon={field.icon}
                  className="mr-3 text-purple-400"
                />
                {field.label}
              </label>
              <input
                {...register(field.name as keyof SignInValues)}
                id={field.name}
                type={field.type}
                placeholder={`Enter your ${field.label.toLowerCase()}`}
                className="h-12 bg-gray-700 p-4 rounded-lg border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
              {errors[field.name as keyof SignInValues] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors[field.name as keyof SignInValues]?.message}
                </p>
              )}
            </div>
          ))}

          <button
            type="submit"
            className={`mt-4 bg-purple-600 text-white py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-purple-700 hover:shadow-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
              isPending ? "cursor-not-allowed" : "cursor-pointer"
            }
            `}
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

export default AdminSignIn;
