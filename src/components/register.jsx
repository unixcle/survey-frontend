import { useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  registerRequest,
  registerSuccess,
  registerFailure,
} from "../slices/authSlice";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

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
  const { loading, error } = useSelector((state) => state.auth);

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

      const { data } = await axios.post(
        "http://127.0.0.1:8000/api/auth/register/",
        payload,
        { headers: { "Content-Type": "application/json" } },
      );

      // حالت 1: بک‌اند بعد ثبت‌نام توکن می‌ده
      if (data?.access) {
        dispatch(
          registerSuccess({
            access: data.access,
            refresh: data.refresh,
            user: data.user ?? null,
          }),
        );
      } else {
        // حالت 2: بک‌اند فقط پیام/یوزر می‌ده (توکن نه)
        dispatch(
          registerSuccess({
            access: null,
            refresh: null,
            user: data.user ?? null,
          }),
        );
      }
      Swal.fire({
        icon: "success",
        title: "Registration successful!",
        text: "Your account has been created successfully.",
        confirmButtonText: "Continue",
      }).then(() => navigate("/login"));
    } catch (err) {
      console.log("STATUS:", err?.response?.status);
      console.log("DATA:", err?.response?.data);

      const api = err?.response?.data;

      const msg =
        api?.detail ||
        (typeof api === "string" ? api : null) ||
        Object.entries(api || {})
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" , ") : v}`)
          .join(" | ") ||
        err?.message ||
        "cant connect to servers";

      dispatch(registerFailure(msg));
      // ❌ ERROR ALERT
      Swal.fire({
        icon: "error",
        title: "Registration failed",
        text: msg,
        confirmButtonText: "Try again",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-lg border border-gray-100 p-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Register</h2>
          <p className="mt-2 text-sm text-gray-500">
            Enter Your Email, UserName and Password for Registration.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name (Optional)
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched({ ...touched, firstName: true })}
              placeholder="Ali"
              className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition ${inputClass("firstName", name)}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name (Optional)
            </label>

            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              onBlur={() => setTouched({ ...touched, familyName: true })}
              placeholder="Taghizade"
              className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition ${inputClass("familyName", familyName)}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched({ ...touched, email: true })}
              placeholder="user@gmail.com"
              autoComplete="email"
              className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition ${inputClass("email", email)}`}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              UserName
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onBlur={() => setTouched({ ...touched, userName: true })}
              placeholder="Alireza"
              autoComplete="username"
              className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition ${inputClass("userName", userName)}`}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched({ ...touched, password: true })}
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={8}
              className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition ${inputClass("password", password)}`}
              required
            />
            <p className="mt-1 text-xs text-gray-400">8 characters atleast</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              onBlur={() => setTouched({ ...touched, confirmPass: true })}
              placeholder="••••••••"
              autoComplete="new-password"
              className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition ${inputClass("confirmPass", confirmPass)}`}
              required
            />

            {touched.confirmPass && confirmPass && confirmPass !== password && (
              <p className="mt-1 text-xs text-red-500">
                Passwords do not match.
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-xl px-4 py-3 font-semibold text-white transition
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-900 hover:bg-gray-800 active:bg-gray-950"
              }`}
            >
              {loading ? "Registering" : "Register"}
            </button>
          </div>

          <div className="md:col-span-2 flex justify-center">
            <a
              href="/login"
              className="text-gray-900 font-medium hover:underline"
            >
              Click here for login
            </a>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          I Accept the Terms.
        </p>
      </div>
    </div>
  );
};

export default Register;
