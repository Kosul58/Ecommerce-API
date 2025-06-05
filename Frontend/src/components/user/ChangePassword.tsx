import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useChangeUserPassword } from "../../hooks/useAuth";

type PasswordFormData = {
  oldpassword: string;
  newpassword: string;
  confirmpassword: string;
};

const schema = yup.object().shape({
  oldpassword: yup
    .string()
    .required("Old password is required")
    .min(6, "Old password must be at least 6 characters"),
  newpassword: yup
    .string()
    .required("New password is required")
    .min(6, "New password must be at least 6 characters"),
  confirmpassword: yup
    .string()
    .required("Confirm password is required")
    .oneOf([yup.ref("newpassword")], "Passwords do not match"),
});

interface changeprops {
  close: () => void;
}

const ChangePassword: React.FC<changeprops> = ({ close }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: yupResolver(schema),
    mode: "onTouched",
  });

  const {
    mutateAsync: changePassword,
    isPending,
    isError,
    isSuccess,
    error,
  } = useChangeUserPassword();

  const onSubmit = async (data: PasswordFormData) => {
    try {
      const payload = {
        oldpassword: data.oldpassword,
        newpassword: data.newpassword,
      };
      await changePassword(payload);
      alert("Password updated successfully!");
      reset();
      close();
    } catch (err) {
      console.error("Change password error:", err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Change Password</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block font-medium">Old Password</label>
          <input
            type="password"
            {...register("oldpassword")}
            className="w-full border p-2 rounded"
          />
          {errors.oldpassword && (
            <p className="text-red-500 text-sm">{errors.oldpassword.message}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">New Password</label>
          <input
            type="password"
            {...register("newpassword")}
            className="w-full border p-2 rounded"
          />
          {errors.newpassword && (
            <p className="text-red-500 text-sm">{errors.newpassword.message}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Confirm Password</label>
          <input
            type="password"
            {...register("confirmpassword")}
            className="w-full border p-2 rounded"
          />
          {errors.confirmpassword && (
            <p className="text-red-500 text-sm">
              {errors.confirmpassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className={`w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${
            isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {isPending ? "Updating..." : "Update Password"}
        </button>

        {isError && (
          <p className="text-red-600 text-sm mt-2">
            {error instanceof Error
              ? error.message
              : "Failed to update password"}
          </p>
        )}
        {isSuccess && (
          <p className="text-green-600 text-sm mt-2">
            Password updated successfully!
          </p>
        )}
      </form>
    </div>
  );
};

export default ChangePassword;
