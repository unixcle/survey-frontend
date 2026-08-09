import { useState } from "react";
import { api } from "../api/axios";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { setUser } from "../slices/authSlice";

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
      const res = await api.patch("/api/auth/profile/", payload);
      if (res.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Changed",
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
      console.log(err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) return;

    // API request goes here
    console.log(formData);
    fetchEditProfile();
  };

  const handleCancel = () => {
    // Reset form or navigate back
  };

  return (
    <div className="flex-1 p-6">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Edit Profile</h1>

          <p className="mt-2 text-slate-500">
            Update your personal information and profile details.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* First Name */}
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
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          {/* Last Name */}
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
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          {/* Information Box */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
            <h3 className="mb-2 font-semibold text-indigo-700">
              Profile Information
            </h3>

            <p className="text-sm leading-6 text-slate-600">
              Make sure your information is accurate. Your email address may be
              used for account notifications and password recovery.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-xl border border-slate-300 px-6 py-3 font-medium transition hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 active:scale-95"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
