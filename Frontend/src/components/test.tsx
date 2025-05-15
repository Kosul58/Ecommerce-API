// import React from "react";
// import { useFormik } from "formik";
// import * as Yup from "yup";

// const UserSignUp = () => {
//   const formik = useFormik({
//     initialValues: {
//       firstname: "",
//       lastname: "",
//       username: "",
//       email: "",
//       password: "",
//       phone: "",
//       address: "",
//       image: null as File | null,
//     },
//     validationSchema: Yup.object({
//       firstname: Yup.string().required("First name is required"),
//       lastname: Yup.string().required("Last name is required"),
//       username: Yup.string().required("Username is required"),
//       email: Yup.string().email("Invalid email").required("Email is required"),
//       password: Yup.string().min(6).required("Password is required"),
//       phone: Yup.string().required("Phone is required"),
//       address: Yup.string().required("Address is required"),
//       image: Yup.mixed()
//         .required("Image is required")
//         .test(
//           "fileType",
//           "Only JPG/PNG allowed",
//           (value: unknown): value is File => {
//             return (
//               value instanceof File &&
//               ["image/jpeg", "image/jpg", "image/png"].includes(value.type)
//             );
//           }
//         ),
//     }),
//     onSubmit: async (values) => {
//       const form = new FormData();
//       form.append("firstname", values.firstname);
//       form.append("lastname", values.lastname);
//       form.append("username", values.username);
//       form.append("email", values.email);
//       form.append("password", values.password);
//       form.append("phone", values.phone);
//       form.append("address", values.address);
//       if (values.image) form.append("image", values.image);

//       try {
//         const res = await fetch("http://localhost:3000/api/user/signup", {
//           method: "POST",
//           body: form,
//         });
//         const result = await res.json();
//         console.log("Server response:", result);
//       } catch (err) {
//         console.error("Error:", err);
//       }
//     },
//   });

//   type FormValues = {
//     firstname: string;
//     lastname: string;
//     username: string;
//     email: string;
//     password: string;
//     phone: string;
//     address: string;
//     image: File | null;
//   };

//   type FieldName = keyof FormValues;

//   const fields: {
//     label: string;
//     name: FieldName;
//     type: string;
//   }[] = [
//     { label: "Firstname:", name: "firstname", type: "text" },
//     { label: "Lastname:", name: "lastname", type: "text" },
//     { label: "Username:", name: "username", type: "text" },
//     { label: "Email:", name: "email", type: "email" },
//     { label: "Password:", name: "password", type: "password" },
//     { label: "Phone:", name: "phone", type: "tel" },
//     { label: "Address:", name: "address", type: "text" },
//     { label: "Image:", name: "image", type: "file" },
//   ];

//   return (
//     <form
//       onSubmit={formik.handleSubmit}
//       className="w-[400px] h-[700px] bg-indigo-100 rounded-2xl flex justify-center items-center flex-col gap-4 p-6 overflow-y-auto"
//     >
//       {fields.map((field) => (
//         <div key={field.name} className="flex flex-col w-[300px]">
//           <label
//             htmlFor={field.name}
//             className="text-sm font-semibold text-gray-700 ml-1 mb-[-2px] z-10"
//           >
//             {field.label}
//           </label>
//           {field.type === "file" ? (
//             <input
//               id={field.name}
//               name={field.name}
//               type="file"
//               accept=".jpg,.jpeg,.png"
//               onChange={(e) => {
//                 const file = e.currentTarget.files?.[0] ?? null;
//                 formik.setFieldValue(field.name, file);
//               }}
//               className="h-[40px] bg-amber-50 shadow-xl rounded-lg cursor-pointer text-lg p-2"
//             />
//           ) : (
//             <input
//               id={field.name}
//               name={field.name}
//               type={field.type}
//               placeholder={field.label}
//               value={
//                 field.name !== "image"
//                   ? formik.values[field.name as keyof Omit<FormValues, "image">]
//                   : undefined
//               }
//               onChange={formik.handleChange}
//               onBlur={formik.handleBlur}
//               className="h-[40px] bg-amber-50 p-2 shadow-xl rounded-lg"
//             />
//           )}
//           {formik.touched[field.name] && formik.errors[field.name] && (
//             <div className="text-red-600 text-sm mt-1">
//               {formik.errors[field.name]}
//             </div>
//           )}
//         </div>
//       ))}

//       <button
//         type="submit"
//         className="mt-4 px-6 py-2 bg-indigo-500 text-white rounded-lg shadow-lg cursor-pointer hover:scale-110"
//       >
//         Sign Up
//       </button>
//     </form>
//   );
// };

// export default UserSignUp;

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
const validationSchema = Yup.object({
  name: Yup.string().required("Username is required"),
  price: Yup.number().min(20).required("Invalid price"),
  inventory: Yup.number().required("Inventory is required"),
  category: Yup.string().required(),
  description: Yup.string().required(),
  images: Yup.mixed()
    .required("At least one image is required")
    .test(
      "is-file-array",
      "Must be an array of image files",
      (value: unknown): value is File[] => {
        return (
          Array.isArray(value) &&
          value.length > 0 &&
          value.every(
            (file) =>
              file instanceof File &&
              ["image/jpeg", "image/jpg", "image/png"].includes(file.type)
          )
        );
      }
    ),
});

const initialValues = {
  name: "",
  price: 0,
  inventory: 0,
  category: "",
  description: "",
  images: [] as File[],
};

const AddProduct = () => {
  const handleSubmit = async (
    values: typeof initialValues
    // { resetForm }: { resetForm: () => void }
  ) => {
    const form = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key === "images" && Array.isArray(value)) {
        value.forEach((file) => {
          form.append("images", file);
        });
      } else {
        form.append(key, value as string);
      }
    });

    for (const [key, value] of form.entries()) {
      console.log(`${key}:`, value);
    }
    // try {
    //   const res = await fetch("http://localhost:3000/api/product", {
    //     method: "POST",
    //     body: form,
    //   });
    //   const result = await res.json();
    //   if (result.success === true) {
    // resetForm();
    //     sessionStorage.setItem("userData", JSON.stringify(result.data));
    //   }

    //   console.log("Server response:", result);
    // } catch (err) {
    //   console.error("Error:", err);
    // }
  };

  return (
    <>
      <section className="w-[95%] h-[95%] flex flex-col justify-center items-center gap-4 overflow-y-auto  bg-red-50">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue }) => (
            <Form className="w-[900px] h-auto bg-indigo-100 rounded-2xl p-6">
              <div className="w-full flex justify-center items-center mb-8">
                <p>User Sign In</p>
              </div>
              <div className="flex flex-wrap  gap-4 justify-center items-center">
                {[
                  { label: "Name:", name: "name", type: "text" },
                  { label: "Price:", name: "price", type: "number" },
                  { label: "Inventory:", name: "inventory", type: "number" },
                  { label: "Category:", name: "category", type: "string" },
                  {
                    label: "Description:",
                    name: "description",
                    type: "string",
                  },
                ].map((field) => (
                  <div
                    key={field.name}
                    className="flex flex-col w-[40%] min-w-[300px] "
                  >
                    <label
                      htmlFor={field.name}
                      className="text-sm font-semibold text-gray-700 ml-1 mb-[-1px] z-10"
                    >
                      {field.label}
                    </label>
                    <Field
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      placeholder={field.label}
                      className={`h-[40px] bg-amber-50 p-2 shadow-xl rounded-lg`}
                    />
                    <ErrorMessage
                      name={field.name}
                      component="div"
                      className="text-red-600 ml-1 text-xs"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label htmlFor="images" className="block font-medium">
                  Upload Images
                </label>
                <input
                  name="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(event) => {
                    const files = Array.from(event.currentTarget.files || []);
                    setFieldValue("images", files);
                  }}
                  className="w-full bg-amber-50 cursor-pointer mt-1 p-2 border rounded"
                />
                <ErrorMessage
                  name="images"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              <div className="w-full flex justify-center mt-4">
                <button
                  type="submit"
                  className="px-10 py-2 bg-indigo-500 text-white rounded-lg shadow-lg cursor-pointer hover:scale-110"
                >
                  Add Product
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </section>
    </>
  );
};

export default AddProduct;
