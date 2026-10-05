
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loginRequest,
  loginSuccess,
  loginFailure,
} from "../slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { api } from "../api/axios";
import { getError } from "../errors/getError";

const LoginForm = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    dispatch(loginRequest());

    try {
      const { data } = await api.post(
        "/auth/token/",
        { username: userName, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (data.access) {
        dispatch(
          loginSuccess({
            access: data.access,
            refresh: data.refresh,
            user: null,
          }),
        );

        navigate("/profile");
      } else {
        dispatch(loginFailure(data.error || "failed login"));
      }
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        err?.message ||
        "cant connect to server";

      dispatch(loginFailure(msg));

      Swal.fire({
        icon: "error",
        title: "Error",
        text: getError(err),
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-3 py-6 sm:px-4 sm:py-8">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-4 shadow-lg sm:p-8">
        {/* Header */}
        <div className="mb-5 text-center sm:mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Login
          </h2>

          <p className="mt-2 text-xs leading-5 text-gray-500 sm:text-sm">
            Enter Your User and Password to Login
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label
              htmlFor="userName"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              User
            </label>

            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Alireza"
              autoComplete="username"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 sm:px-4 sm:text-base"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 sm:px-4 sm:text-base"
              required
            />
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition sm:text-base ${
              loading
                ? "cursor-not-allowed bg-gray-400"
                : "bg-gray-900 hover:bg-gray-800 active:bg-gray-950"
            }`}
          >
            {loading ? "Entering..." : "Login"}
          </button>

          {/* Actions */}
          <div className="flex flex-col items-center gap-3 pt-1 text-xs sm:flex-row sm:justify-between sm:text-sm">
            <button
              type="button"
              className="text-center text-gray-600 transition hover:text-gray-900"
              onClick={() => {
                alert("we will add this action soon 🙂");
              }}
            >
              Forgot your Password
            </button>

            <Link
              to="/register"
              className="font-medium text-gray-900 hover:underline"
            >
              Register Here
            </Link>
          </div>
        </form>

        <p className="mt-5 text-center text-[10px] text-gray-400 sm:mt-6 sm:text-xs">
          Accept the terms
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
