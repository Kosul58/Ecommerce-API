import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import NavBar from "../components/navbar/Navbar";
import { useDeleteuser, useUserData } from "../hooks/useAuth";
import { TbLockPassword } from "react-icons/tb";
import Notification from "../components/notifications/Notification";
import {
  FaEdit,
  FaTimes,
  FaCamera,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { MdDelete, MdDeleteForever } from "react-icons/md";
import { useUserUpdate } from "../hooks/useAuth";

import ChangePassword from "../components/user/ChangePassword";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";

const SUPPORTED_FORMATS = ["image/jpeg", "image/jpg", "image/png"];
const MAX_FILE_SIZE = 8 * 1024 * 1024;

const schema = yup.object().shape({
  firstname: yup
    .string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(30, "First name must be at most 30 characters")
    .matches(/^[A-Za-z\s]+$/, "First name can only contain letters and spaces"),

  lastname: yup
    .string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(30, "Last name must be at most 30 characters")
    .matches(/^[A-Za-z\s]+$/, "Last name can only contain letters and spaces"),

  username: yup
    .string()
    .required("Username is required")
    .min(4, "Username must be at least 4 characters")
    .max(20, "Username must be at most 20 characters")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),

  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Email is required"),

  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits"),

  address: yup
    .string()
    .required("Address is required")
    .min(5, "Address must be at least 5 characters")
    .max(100, "Address must be at most 100 characters"),

  image: yup
    .mixed<File | string>()
    .nullable()
    .required("Image is required")
    .test("fileType", "Only JPG, JPEG, or PNG files are allowed", (value) => {
      if (!value || typeof value === "string") return true;
      return SUPPORTED_FORMATS.includes(value.type);
    })
    .test("fileSize", "Image must be less than 2MB", (value) => {
      if (!value || typeof value === "string") return true;
      return value.size <= MAX_FILE_SIZE;
    }),
});

type UserData = {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  image: File | string;
};

const defaultUser = {
  firstname: "firstname",
  lastname: "lastname",
  address: "address",
  phone: "98XXXXXXXX",
};

const UserProfile = () => {
  const { data: fetchedUser, isFetching, isError } = useUserData();
  const navigate = useNavigate();

  const [notification, setNotification] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const { mutateAsync: deleteUser, isPending: deletePending } = useDeleteuser();

  const [deletePop, setDeletePop] = useState(false);
  const handleDelete = async () => {
    const id = fetchedUser?.id;
    if (!id) {
      alert("No id data found");
      return;
    }
    const payload = {
      userid: id,
    };
    try {
      const deleteResult = await deleteUser(payload);
      alert(deleteResult.message);
      console.log(deleteResult.data);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  const completeUser = React.useMemo(() => {
    return {
      ...defaultUser,
      ...fetchedUser,
    };
  }, [fetchedUser]);

  const [edit, setEdit] = useState(false);
  const [passwordChange, setPasswordChange] = useState(false);
  const [user, setUser] = useState(completeUser);
  const [imagePreview, setImagePreview] = useState<string | null>(
    completeUser.image as string | null
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    watch,
  } = useForm<UserData>({
    resolver: yupResolver(schema),
    defaultValues: user,
    mode: "onTouched",
  });

  const formValues = watch();
  useEffect(() => {}, [formValues]);
  useEffect(() => {
    setUser(completeUser);
    reset(completeUser);
    setImagePreview(completeUser.image as string | null);
  }, [completeUser, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setValue("image", file, { shouldValidate: true });
    } else {
      setImagePreview(null);
      setValue("image", "", { shouldValidate: true });
    }
  };

  const handleImageRemove = () => {
    setImagePreview(null);
    setValue("image", "", { shouldValidate: true });
  };

  const { mutateAsync: updateUser, isPending: updatePending } = useUserUpdate();

  const onSubmit = async (data: UserData) => {
    showNotification("success", "Updating user data");
    const formData = new FormData();
    formData.append("firstname", data.firstname);
    formData.append("lastname", data.lastname);
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("address", data.address);
    if (data.image instanceof File) {
      formData.append("image", data.image);
    } else if (
      typeof data.image === "string" &&
      data.image === "" &&
      imagePreview === null
    ) {
      formData.append("image_removed", "true");
    }
    try {
      const updateResult = await updateUser(formData);
      const data = updateResult.data;
      console.log(data, updateResult);
      showNotification("success", "User data updated successfully");
    } catch (error) {
      const err = error as AxiosError;
      if (err.response) {
        const data = err.response.data;
        if (typeof data === "object" && data !== null && "message" in data) {
          const message = (data as { message: string }).message;
          showNotification("error", message);
        } else {
          showNotification("error", "Unexpected error format.");
        }
      } else {
        showNotification("error", "Network error or server is unreachable.");
      }
    }
    setEdit(false);
  };

  const renderTextField = (
    name: keyof UserData,
    label: string,
    type: string = "text"
  ) => (
    <div className="w-full sm:w-[48%]">
      <label className="block font-medium text-sm mb-1 text-gray-700">
        {label}
      </label>
      <input
        {...register(name)}
        type={type}
        className="w-full p-2 border border-gray-300 bg-white/50 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-150 ease-in-out"
        placeholder={name}
      />
      <p className="text-red-500 text-sm mt-1">{errors[name]?.message}</p>
    </div>
  );

  if (!fetchedUser) {
    if (!isFetching) {
      showNotification("error", "No user data found");
      navigate("/");
      return;
    }
  }
  if (isError) {
    showNotification("error", "Failed to fetch user data");
    navigate("/");
    return;
  }
  return (
    <div className="w-full min-h-screen max-h-screenflex flex-col">
      <div className="sticky top-0 z-50 w-full">
        <NavBar />
      </div>
      {deletePop && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md text-center max-sm:w-[90%] transform transition-all duration-300 scale-105">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Confirm Deletion
            </h2>
            <p className="text-gray-700 mb-6 text-lg">
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleDelete()}
                disabled={deletePending}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:ring-4 focus:ring-red-200 transition duration-300 ease-in-out font-semibold cursor-pointer"
              >
                Confirm
              </button>
              <button
                disabled={deletePending}
                onClick={() => setDeletePop(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:ring-4 focus:ring-gray-100 transition duration-300 ease-in-out font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex max-h-[88vh] min-h-[88vh]">
        <div className="w-full min-h-full max-h-full p-6 flex items-start gap-6 bg-gray-50 overflow-hidden">
          <div className="flex h-full border border-gray-200 rounded-xl shadow-md items-center flex-col p-4 bg-white sticky top-0 sm:self-start min-md:min-w-[250px]">
            <div className="w-full border-b border-gray-200 mb-4">
              <h2
                className="w-full text-2xl font-bold text-gray-600 px-4 py-2 flex justify-start items-center gap-2"
                title="User Profile"
              >
                <FaUser className="text-purple-500" />
                <span className="max-md:hidden">User Profile</span>
              </h2>
            </div>
            <div className="flex flex-col gap-4 w-full mt-8">
              <button
                className={`px-5 py-3 rounded-xl transition duration-300 ease-in-out flex items-center gap-2 cursor-pointer text-lg font-medium shadow-md
                  ${
                    !passwordChange
                      ? "bg-purple-500 text-white hover:bg-purple-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }
                `}
                title="Change Password"
                onClick={() => {
                  setPasswordChange((prev) => !prev);
                  setEdit(false);
                }}
              >
                {passwordChange ? (
                  <>
                    <FaTimes /> Cancel
                  </>
                ) : (
                  <>
                    <TbLockPassword />
                    <span className="max-md:hidden">Change Password</span>
                  </>
                )}
              </button>
              <button
                className={`px-5 py-3 rounded-xl transition duration-300 ease-in-out flex justify-center items-center gap-2 bg-red-500 text-white hover:bg-red-600 shadow-md text-lg font-medium 
                  ${
                    deletePending
                      ? "cursor-not-allowed opacity-70"
                      : "cursor-pointer"
                  }
                `}
                onClick={() => setDeletePop(true)}
                title="Delete Account"
              >
                <MdDelete />
                <span className="max-md:hidden">
                  {deletePending ? "Deleting User..." : " Delete Account"}
                </span>
              </button>
            </div>
          </div>
          {!edit && !passwordChange ? (
            <div className="flex flex-col items-center h-full w-full overflow-auto bg-white border border-gray-300 rounded-xl shadow-lg">
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 w-full shadow-inner border-b border-gray-200 relative">
                <div className="relative">
                  <img
                    src={
                      imagePreview || "https://avatar.iran.liara.run/public/boy"
                    }
                    alt="User Avatar"
                    className="w-36 h-36 rounded-full border-4 border-purple-400 shadow-xl object-cover transform transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                    {user.firstname} {user.lastname}
                  </h1>
                  <p className="text-lg font-semibold text-purple-600">
                    @{user.username}
                  </p>
                </div>
                <button
                  className={`absolute top-4 right-4 px-5 py-2 rounded-lg transition duration-300 ease-in-out flex items-center gap-2 cursor-pointer font-semibold
                    ${
                      !edit
                        ? "bg-purple-500 text-white hover:bg-purple-600 shadow-md"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-md"
                    }`}
                  onClick={() => {
                    setEdit((prev) => !prev);
                    setPasswordChange(false);
                  }}
                >
                  <FaEdit /> <span className="max-md:hidden">Edit Profile</span>
                </button>
              </div>
              <div className="w-full  p-6 sm:p-8 rounded-b-xl">
                <h3 className="text-lg font-bold text-gray-600 mb-6 border-b pb-3 border-gray-200">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {[
                    {
                      label: "Email",
                      value: completeUser.email,
                      icon: <FaEnvelope className="text-purple-500" />,
                    },
                    {
                      label: "Phone Number",
                      value: completeUser.phone || defaultUser.phone,
                      icon: <FaPhone className="text-purple-500" />,
                    },
                    {
                      label: "First Name",
                      value: completeUser.firstname || defaultUser.firstname,
                      icon: <FaUser className="text-purple-500" />,
                    },
                    {
                      label: "Last Name",
                      value: completeUser.lastname || defaultUser.lastname,
                      icon: <FaUser className="text-purple-500" />,
                    },
                    {
                      label: "Address",
                      value: completeUser.address || defaultUser.address,
                      icon: <FaMapMarkerAlt className="text-purple-500" />,
                    },
                  ].map(({ label, value, icon }) => (
                    <div
                      key={label}
                      className="flex flex-col px-5 py-3 rounded-lg bg-purple-50/70 shadow-sm transition duration-200 hover:bg-purple-100"
                    >
                      <p className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                        {icon} {label}
                      </p>
                      <p className="text-gray-600 text-md font-semibold break-all">
                        {" "}
                        {/* Added break-all here */}
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : edit && !passwordChange ? (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-8 bg-white rounded-xl shadow-xl p-8 w-full max-h-full border border-gray-200 overflow-y-auto"
            >
              <h2 className="w-full flex justify-start items-center gap-2 text-2xl font-bold text-gray-700 text-center mb-6">
                <FaEdit className="mt-[-4px]" />
                Edit Profile
              </h2>
              <div className="flex flex-col items-center gap-4 mb-8">
                {imagePreview ? (
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      className="w-26 h-26 rounded-full object-cover shadow-lg transition-all duration-300 border-4 border-purple-300"
                    />
                    <button
                      type="button"
                      onClick={handleImageRemove}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full text-xs flex items-center justify-center size-6 hover:bg-red-600 transition cursor-pointer transform -translate-y-1 translate-x-1"
                      aria-label="Remove image"
                    >
                      <MdDeleteForever size={20} />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex items-center gap-3 px-8 py-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition shadow-lg text-lg font-medium">
                    <FaCamera />
                    <span className="text-sm font-medium">
                      Upload Profile Picture
                    </span>
                    <input
                      {...register("image")}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
                {errors.image && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.image.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 bg-purple-50 p-6 rounded-lg shadow-inner">
                {renderTextField("firstname", "First Name")}
                {renderTextField("lastname", "Last Name")}
                {renderTextField("username", "Username")}
                {renderTextField("email", "Email", "email")}
                {renderTextField("phone", "Phone Number")}
                <div className="w-full sm:col-span-2">
                  <label className="block font-medium text-sm mb-1 text-gray-700">
                    Address
                  </label>
                  <textarea
                    {...register("address")}
                    rows={3}
                    placeholder="Enter your address..."
                    className="w-full px-4 py-2 border border-gray-300 bg-white/50 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm min-h-[80px] transition duration-150 ease-in-out"
                  />
                  <p className="text-red-500 text-sm mt-1">
                    {errors.address?.message}
                  </p>
                </div>
              </div>
              <div className="flex justify-end mt-10 gap-2">
                <button
                  type="button"
                  disabled={updatePending}
                  onClick={() => {
                    reset(completeUser);
                    setImagePreview(completeUser.image as string | null);
                    setEdit(false);
                  }}
                  className={`px-6 py-2 text-lg font-bold bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-150 ease-in-out ${
                    updatePending ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={` bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 focus:ring-4 focus:ring-purple-200 transition-all duration-300 font-semibold shadow-lg text-lg ${
                    updatePending ? "cursor-not-allowed " : "cursor-pointer"
                  } `}
                  disabled={updatePending}
                >
                  {updatePending ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : !edit && passwordChange ? (
            <div className="w-full h-full flex justify-center items-center">
              <ChangePassword close={() => setPasswordChange(false)} />
            </div>
          ) : (
            <div className="text-center text-gray-600 text-lg p-8">
              An unexpected state occurred.
            </div>
          )}
        </div>
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
  );
};

export default UserProfile;
