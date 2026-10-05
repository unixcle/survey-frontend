
import { useState } from "react";
import { api } from "../api/axios";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { getError } from "../errors/getError";

export default function PassChange() {
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [showPassword, setShowPassword] = useState({
    current: false,
    newP: false,
    confirm: false,
  });

  // use setter instead of using 3 handler functions
  const handleChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const fetchPass = async () => {
    try {
      const payload = {
        old_password: currentPass,
        new_password: newPass,
        confirm_new_password: confirmPass,
      };

      const res = await api.post(
        "/auth/profile/change-password/",
        payload,
      );

      if (res.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Password Changed",
          text: "Your Password has been updated successfully.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: getError(err),
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!currentPass || !newPass || !confirmPass) return;

    if (newPass !== confirmPass) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Your new Password and Confirm Password are not the same",
      });

      return;
    }

    if (newPass.length < 8) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Password should be more than 8 characters",
      });

      return;
    }

    fetchPass();
  };

  return (
    <div className="flex-1 p-3 sm:p-4 md:p-6">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-4 shadow-lg sm:p-6 md:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            Change Password
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
            Update your password to keep your account secure.
          </p>
        </div>

        <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
          {/* Current Password */}
          <div className="relative">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Current Password
            </label>

            <input
              type={showPassword.current ? "text" : "password"}
              placeholder="Enter your Current Password"
              value={currentPass}
              onChange={handleChange(setCurrentPass)}
              className="w-full rounded-xl border border-slate-300 px-3 py-3 pr-11 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 sm:px-4 sm:text-base"
            />

            <button
              type="button"
              aria-label={
                showPassword.current
                  ? "Hide current password"
                  : "Show current password"
              }
              onClick={() =>
                setShowPassword((prev) => ({
                  ...prev,
                  current: !prev.current,
                }))
              }
              className="absolute right-3 top-[42px] flex h-8 w-8 -translate-y-1/2 items-center justify-center text-gray-500 transition hover:text-gray-700 sm:right-4"
            >
              {showPassword.current ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* New Password */}
          <div className="relative">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              New Password
            </label>

            <input
              type={showPassword.newP ? "text" : "password"}
              value={newPass}
              onChange={handleChange(setNewPass)}
              required
              placeholder="Enter new password"
              className="w-full rounded-xl border border-slate-300 px-3 py-3 pr-11 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 sm:px-4 sm:text-base"
            />

            <button
              type="button"
              aria-label={
                showPassword.newP
                  ? "Hide new password"
                  : "Show new password"
              }
              onClick={() =>
                setShowPassword((prev) => ({
                  ...prev,
                  newP: !prev.newP,
                }))
              }
              className="absolute right-3 top-[42px] flex h-8 w-8 -translate-y-1/2 items-center justify-center text-gray-500 transition hover:text-gray-700 sm:right-4"
            >
              {showPassword.newP ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Confirm New Password
            </label>

            <input
              type={showPassword.confirm ? "text" : "password"}
              onChange={handleChange(setConfirmPass)}
              value={confirmPass}
              required
              placeholder="Confirm new password"
              className="w-full rounded-xl border border-slate-300 px-3 py-3 pr-11 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 sm:px-4 sm:text-base"
            />

            <button
              type="button"
              aria-label={
                showPassword.confirm
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
              onClick={() =>
                setShowPassword((prev) => ({
                  ...prev,
                  confirm: !prev.confirm,
                }))
              }
              className="absolute right-3 top-[42px] flex h-8 w-8 -translate-y-1/2 items-center justify-center text-gray-500 transition hover:text-gray-700 sm:right-4"
            >
              {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Password Tips */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 sm:p-4">
            <h3 className="mb-2 text-sm font-semibold text-indigo-700 sm:text-base">
              Password Requirements
            </h3>

            <ul className="list-inside list-disc space-y-1 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
              <li>At least 8 characters</li>
              <li>Include uppercase and lowercase letters</li>
              <li>Include at least one number</li>
              <li>Include at least one special character</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end sm:gap-4">
            <button
              type="button"
              className="w-full rounded-xl border border-slate-300 px-6 py-3 text-sm font-medium transition hover:bg-slate-100 sm:w-auto sm:text-base"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-95 sm:w-auto sm:text-base"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
