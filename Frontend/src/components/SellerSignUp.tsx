import React, { useState } from "react";

const SellerSignUp = () => {
  const [formData, setFormData] = useState<{
    shopname: string;
    username: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    image: File | string;
  }>({
    shopname: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    image: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files.length > 0) {
      const file = files[0];
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        alert("Only JPG, JPEG, and PNG files are allowed.");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData();
    form.append("shopname", formData.shopname);
    form.append("username", formData.username);
    form.append("email", formData.email);
    form.append("password", formData.password);
    form.append("phone", formData.phone);
    form.append("address", formData.address);
    if (formData.image instanceof File) {
      form.append("image", formData.image);
    }
    try {
      const res = await fetch("http://localhost:3000/api/seller/signup", {
        method: "POST",
        body: form,
      });
      const result = await res.json();
      console.log("Server response:", result);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const fields = [
    { label: "Shopname:", name: "shopname", type: "text" },
    { label: "Username:", name: "username", type: "text" },
    { label: "Email:", name: "email", type: "email" },
    { label: "Password:", name: "password", type: "password" },
    { label: "Phone:", name: "phone", type: "tel" },
    { label: "Address:", name: "address", type: "text" },
    { label: "Image:", name: "image", type: "file" },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="w-[400px] h-[700px] bg-indigo-100 rounded-2xl flex justify-center items-center flex-col gap-4 p-6 overflow-y-auto"
    >
      {fields.map((field) => (
        <div key={field.name} className="flex flex-col w-[300px]">
          <label
            htmlFor={field.name}
            className="text-sm font-semibold text-gray-700 ml-1 mb-[-2px] z-10"
          >
            {field.label}
          </label>
          {field.type === "file" ? (
            <input
              id={field.name}
              type="file"
              name={field.name}
              accept=".jpg,.jpeg,.png"
              onChange={handleChange}
              className="h-[40px] bg-amber-50 p-2 shadow-xl rounded-lg"
            />
          ) : (
            <input
              id={field.name}
              type={field.type}
              name={field.name}
              placeholder={field.label}
              value={formData[field.name as keyof typeof formData] as string}
              onChange={handleChange}
              className="h-[40px] bg-amber-50 p-2 shadow-xl rounded-lg"
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        className="mt-4 px-6 py-2 bg-indigo-500 text-white rounded-lg shadow-lg cursor-pointer hover:scale-110"
      >
        Sign Up
      </button>
      <p></p>
    </form>
  );
};

export default SellerSignUp;
