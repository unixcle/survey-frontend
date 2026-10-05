
import { useState } from "react";
import { api } from "../api/axios";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { setUser } from "../slices/authSlice";
import { getError } from "../errors/getError";

export default function EditProfile(user) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });

  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchEditProfile = async () => {
    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
      };

      const res = await api.patch("/auth/profile/", payload);

      if (res.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Profile Updated",
          text: "Your profile has been updated successfully.",
        });

        dispatch(
          setUser({
            ...user,
            first_name: formData.firstName,
            last_name: formData.lastName,
          }),
        );
      }
    } catch (err) {
      const msg = getError(err);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) return;

    fetchEditProfile();
  };

  const handleCancel = () => {
    setFormData({
      firstName: "",
      lastName: "",
    });
  };

  return (
    <div className="flex-1 p-3 sm:p-4 md:p-6">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-4 shadow-lg sm:p-6 md:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            Edit Profile
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
            Update your personal information and profile details.
          </p>
        </div>

        <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              First Name
            </label>

            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="Enter your first name"
              className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 sm:px-4 sm:text-base"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Last Name
            </label>

            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="Enter your last name"
              className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 sm:px-4 sm:text-base"
            />
          </div>

          {/* Information Box */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 sm:p-4">
            <h3 className="mb-2 text-sm font-semibold text-indigo-700 sm:text-base">
              Profile Information
            </h3>

            <p className="text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
              Make sure your information is accurate. Your email address may be
              used for account notifications and password recovery.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end sm:gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full rounded-xl border border-slate-300 px-6 py-3 text-sm font-medium transition hover:bg-slate-100 sm:w-auto sm:text-base"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-95 sm:w-auto sm:text-base"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
