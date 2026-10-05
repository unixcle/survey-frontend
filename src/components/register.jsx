
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  registerRequest,
  registerSuccess,
  registerFailure,
} from "../slices/authSlice";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { getError } from "../errors/getError";

const Register = () => {
  const [name, setName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const navigate = useNavigate();

  const [touched, setTouched] = useState({
    firstName: false,
    familyName: false,
    email: false,
    userName: false,
    password: false,
    confirmPass: false,
  });

  const validators = {
    firstName: (v) => v.trim() === "" || v.trim().length >= 2,
    familyName: (v) => v.trim() === "" || v.trim().length >= 2,
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    userName: (v) => v.trim().length >= 3,
    password: (v) => v.length >= 8,
    confirmPass: (v) => v === password,
  };

  const inputClass = (name, value) => {
    if (!touched[name]) return "border-gray-200";

    return validators[name](value)
      ? "border-green-500 focus:ring-green-100"
      : "border-red-500 focus:ring-red-100";
  };

  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isFormValid =
      validators.firstName(name) &&
      validators.familyName(familyName) &&
      validators.email(email) &&
      validators.userName(userName) &&
      validators.password(password) &&
      validators.confirmPass(confirmPass);

    if (!isFormValid) {
      setTouched({
        firstName: true,
        familyName: true,
        email: true,
        userName: true,
        password: true,
        confirmPass: true,
      });

      Swal.fire({
        icon: "warning",
        title: "Invalid form",
        text: "Please fix the highlighted fields and try again.",
        confirmButtonText: "OK",
      });

      return;
    }

    dispatch(registerRequest());

    try {
      const payload = {
        username: userName.trim(),
        email: email.trim(),
        password,
        confirm_password: confirmPass,
        ...(name.trim() && { first_name: name.trim() }),
        ...(familyName.trim() && { last_name: familyName.trim() }),
      };

      const { data } = await api.post("/auth/register/", payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (data?.access) {
        dispatch(
          registerSuccess({
            access: data.access,
            refresh: data.refresh,
            user: data.user ?? null,
          })
        );
      } else {
        dispatch(
          registerSuccess({
            access: null,
            refresh: null,
            user: data.user ?? null,
          })
        );
      }

      Swal.fire({
        icon: "success",
        title: "Registration successful!",
        text: "Your account has been created successfully.",
        confirmButtonText: "Continue",
      }).then(() => navigate("/login"));
    } catch (err) {
      const errorMsg = getError(err);

      dispatch(registerFailure(errorMsg));

      Swal.fire({
        icon: "error",
        title: "Registration failed",
        text: errorMsg,
        confirmButtonText: "Try again",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-3 py-6 sm:px-4 sm:py-8">
      <div className="w-full max-w-3xl rounded-2xl border border-gray-100 bg-white p-4 shadow-lg sm:p-6 md:p-8">
        <div className="mb-5 text-center sm:mb-6">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Register
          </h2>

          <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-gray-500 sm:text-sm">
            Enter Your Email, UserName and Password for Registration.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2"
        >
          {/* First Name */}
          <div className="min-w-0">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              First Name (Optional)
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() =>
                setTouched((prev) => ({
                  ...prev,
                  firstName: true,
                }))
              }
              placeholder="Ali"
              className={`w-full rounded-xl border bg-white px-3 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 sm:px-4 sm:text-base ${inputClass(
                "firstName",
                name
              )}`}
            />
          </div>

          {/* Last Name */}
          <div className="min-w-0">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Last Name (Optional)
            </label>

            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              onBlur={() =>
                setTouched((prev) => ({
                  ...prev,
                  familyName: true,
                }))
              }
              placeholder="Taghizade"
              className={`w-full rounded-xl border bg-white px-3 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 sm:px-4 sm:text-base ${inputClass(
                "familyName",
                familyName
              )}`}
            />
          </div>

          {/* Email */}
          <div className="min-w-0">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() =>
                setTouched((prev) => ({
                  ...prev,
                  email: true,
                }))
              }
              placeholder="user@gmail.com"
              autoComplete="email"
              className={`w-full rounded-xl border bg-white px-3 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 sm:px-4 sm:text-base ${inputClass(
                "email",
                email
              )}`}
              required
            />
          </div>

          {/* Username */}
          <div className="min-w-0">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              UserName
            </label>

            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onBlur={() =>
                setTouched((prev) => ({
                  ...prev,
                  userName: true,
                }))
              }
              placeholder="Alireza"
              autoComplete="username"
              className={`w-full rounded-xl border bg-white px-3 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 sm:px-4 sm:text-base ${inputClass(
                "userName",
                userName
              )}`}
              required
            />
          </div>

          {/* Password */}
          <div className="min-w-0">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() =>
                setTouched((prev) => ({
                  ...prev,
                  password: true,
                }))
              }
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={8}
              className={`w-full rounded-xl border bg-white px-3 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 sm:px-4 sm:text-base ${inputClass(
                "password",
                password
              )}`}
              required
            />

            <p className="mt-1 text-[11px] text-gray-400 sm:text-xs">
              8 characters at least
            </p>
          </div>

          {/* Confirm Password */}
          <div className="min-w-0">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              onBlur={() =>
                setTouched((prev) => ({
                  ...prev,
                  confirmPass: true,
                }))
              }
              placeholder="••••••••"
              autoComplete="new-password"
              className={`w-full rounded-xl border bg-white px-3 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 sm:px-4 sm:text-base ${inputClass(
                "confirmPass",
                confirmPass
              )}`}
              required
            />

            {touched.confirmPass &&
              confirmPass &&
              confirmPass !== password && (
                <p className="mt-1 text-xs text-red-500">
                  Passwords do not match.
                </p>
              )}
          </div>

          {/* Register Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition sm:text-base ${
                loading
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-gray-900 hover:bg-gray-800 active:bg-gray-950"
              }`}
            >
              {loading ? "Registering" : "Register"}
            </button>
          </div>

          {/* Login Link */}
          <div className="flex justify-center md:col-span-2">
            <a
              href="/login"
              className="text-center text-sm font-medium text-gray-900 hover:underline"
            >
              Click here for login
            </a>
          </div>
        </form>

        <p className="mt-5 text-center text-[11px] text-gray-400 sm:mt-6 sm:text-xs">
          I Accept the Terms.
        </p>
      </div>
    </div>
  );
};

export default Register;
