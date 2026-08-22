import { useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { loginRequest, loginSuccess, loginFailure } from "../slices/authSlice";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { api } from "../api/axios";
// import getError from "../errors/getError"

const LoginForm = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate()

  // const Message = getError(errorCode,statusCode)

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    dispatch(loginRequest());

    try {
      const { data } = await api.post(
        "/auth/token/",
        { username:userName, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (data.access) {
        dispatch(
          loginSuccess({
            access: data.access,
            refresh: data.refresh,
            user: null,
          }),
        );
        navigate("/surveys")
      } else {
        dispatch(loginFailure(data.error || "failed login"));
      }
    } catch (err) {
      console.log(err)
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        err?.message ||
        "cant connect to server";

      dispatch(loginFailure(msg));
      Swal.fire({
      icon: "error",
      title: "Error",
      text: msg,
      confirmButtonText: "OK",
    });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg border border-gray-100 p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Login</h2>
          <p className="mt-2 text-sm text-gray-500">
            Enter Your User and Password to Login
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              User
            </label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Alireza"
              autoComplete="userName"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
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
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-xl px-4 py-3 font-semibold text-white transition
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-900 hover:bg-gray-800 active:bg-gray-950"
              }
            `}
          >
            {loading ? "Entering..." : "login"}
          </button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              className="text-gray-600 hover:text-gray-900 transition"
              onClick={() => {
                // بعداً می‌تونی روت فراموشی رمز بزاری
                alert("بعداً بخش فراموشی رمز رو اضافه می‌کنیم 🙂");
              }}
            >
              Forgot your Password
            </button>

            <Link
              to="/register"
              className="text-gray-900 font-medium hover:underline"
            >
              Register Here
            </Link>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Accept the terms
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
