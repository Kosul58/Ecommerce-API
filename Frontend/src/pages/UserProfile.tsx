import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import NavBar from "../components/navbar/Navbar";
import { useDeleteuser, useUserData } from "../hooks/useAuth";
import { TbLockPassword } from "react-icons/tb";
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
const SUPPORTED_FORMATS = ["image/jpeg", "image/jpg", "image/png"];
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 2MB

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
    } catch (err) {
      console.log(err);
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
        className="w-full p-2 border border-gray-300 bg-white/50 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder={name}
      />
      <p className="text-red-500 text-sm mt-1">{errors[name]?.message}</p>
    </div>
  );

  if (!fetchedUser) {
    if (!isFetching) {
      alert("No user data found");
      navigate("/");
      return;
    }
  }
  if (isError) {
    alert("Failed to fetch user data");
    navigate("/");
    return;
  }
  return (
    <div className="w-full min-h-screen bg-gray-100 flex flex-col">
      <div className="sticky top-0 z-50 w-full">
        <NavBar />
      </div>

      {deletePop && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/25 bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md text-center max-sm:w-[80%]">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Confirm Deletion
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleDelete()}
                disabled={deletePending}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 cursor-pointer"
              >
                Confirm
              </button>
              <button
                disabled={deletePending}
                onClick={() => setDeletePop(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex-grow flex justify-center items-start py-10 px-4">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <div className="flex justify-between items-center mb-8 max-sm:flex-col gap-2 ">
            <h2 className="text-3xl font-extrabold text-gray-900">
              User Profile
            </h2>
            <div className="flex gap-2 ">
              <button
                className={`px-5 py-2 rounded-lg transition duration-300 ease-in-out flex items-center gap-2 cursor-pointer
                  ${
                    !passwordChange
                      ? "bg-purple-400 text-white hover:bg-purple-600 shadow-md"
                      : "bg-gray-400 text-white hover:bg-gray-500 shadow-md"
                  }
                `}
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
                    <TbLockPassword /> Change Password
                  </>
                )}
              </button>
              <button
                className={`px-5 py-2 rounded-lg transition duration-300 ease-in-out flex items-center gap-2 cursor-pointer ${
                  !edit
                    ? "bg-purple-400 text-white hover:bg-purple-600 shadow-md"
                    : "bg-gray-400 text-white hover:bg-gray-500 shadow-md"
                }`}
                onClick={() => {
                  setEdit((prev) => !prev);
                  setPasswordChange(false);
                }}
              >
                {edit ? (
                  <>
                    <FaTimes /> Cancel
                  </>
                ) : (
                  <>
                    <FaEdit /> Edit Profile
                  </>
                )}
              </button>
            </div>
          </div>
          {!edit && !passwordChange ? (
            <div className="flex flex-col items-center space-y-8">
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-purple-50 rounded-xl w-full shadow-inner border border-purple-100 relative">
                <div className="relative">
                  <img
                    src={
                      imagePreview || "https://avatar.iran.liara.run/public/boy"
                    }
                    alt="User Avatar"
                    className="w-32 h-32 rounded-full border-4 border-purple-400 shadow-lg object-cover transform transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-4xl font-extrabold text-gray-900 mb-1">
                    {user.firstname} {user.lastname}
                  </h1>
                  <p className="text-xl font-semibold text-purple-700">
                    @{user.username}
                  </p>
                </div>

                <button
                  className={` absolute bottom-4 right-4 px-5 py-2 rounded-lg transition duration-300 ease-in-out flex items-center gap-2 bg-red-400 text-white hover:bg-red-600 shadow-md  ${
                    deletePending
                      ? "cursor-not-allowed"
                      : "cursor-pointer max-sm:hidden"
                  }
                  `}
                  onClick={() => setDeletePop(true)}
                >
                  <MdDelete />
                  {deletePending ? "Deleting User..." : " Delete Account"}
                </button>

                <button
                  className={`px-5 py-2 rounded-lg transition duration-300 ease-in-out flex items-center gap-2 bg-red-400 text-white hover:bg-red-600 shadow-md  ${
                    deletePending
                      ? "cursor-not-allowed"
                      : "cursor-pointer min-sm:hidden"
                  }
                  `}
                  onClick={() => setDeletePop(true)}
                >
                  <MdDelete />
                  {deletePending ? "Deleting User..." : " Delete Account"}
                </button>
              </div>

              <div className="w-full bg-white p-6 sm:p-8 rounded-xl shadow-md border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 border-gray-200">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
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
                      className="flex flex-col px-4 py-1 rounded-md bg-purple-500/10 "
                    >
                      <p className="text-sm font-medium text-gray-500 mb-1 flex items-center text-center gap-2">
                        {icon} {label}
                      </p>
                      <p className="text-gray-800 text-lg font-medium">
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
              className="space-y-8 bg-purple-50 rounded-lg p-4"
            >
              <div className="flex flex-col items-center gap-4 mb-8">
                {imagePreview ? (
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      className="w-36 h-36 sm:w-40 sm:h-40 rounded-full object-cover shadow-lg transition-all duration-300 "
                    />
                    <button
                      type="button"
                      onClick={handleImageRemove}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full text-xs flex items-center justify-center size-6 hover:bg-red-600 transition cursor-pointer"
                      aria-label="Remove image"
                    >
                      <MdDeleteForever size={20} />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex items-center gap-2 px-6 py-2 bg-purple-400 text-white rounded-full hover:bg-purple-600 transition shadow-md">
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
              <div className="flex flex-wrap gap-4 p-4 m-4 bg-purple-100 rounded-t-md">
                {renderTextField("firstname", "First Name")}
                {renderTextField("lastname", "Last Name")}
                {renderTextField("username", "Username")}
                {renderTextField("email", "Email", "email")}
                {renderTextField("phone", "Phone Number")}
              </div>
              <div className=" px-4 ml-4 mr-4 mt-[-16px] bg-purple-100 pb-2 rounded-b-md">
                <label className="block font-medium text-sm mb-1 text-gray-700">
                  Address
                </label>
                <textarea
                  {...register("address")}
                  rows={3}
                  placeholder="Enter your address..."
                  className="w-full px-4 py-2 border border-gray-300 bg-white/50 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm min-h-[80px]"
                />
                <p className="text-red-500 text-sm mt-1">
                  {errors.address?.message}
                </p>
              </div>
              <div className="flex justify-end mt-10">
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 transition-all duration-300 font-semibold shadow-lg cursor-pointer"
                  disabled={updatePending}
                >
                  {updatePending ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : !edit && passwordChange ? (
            <ChangePassword close={() => setPasswordChange(false)} />
          ) : (
            <div>An unexpected state occurred.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
