import { api } from "./axios";
import { logout , setTokens } from "../slices/authSlice";
import { store } from "../store"; // مسیر استور خودت
import axios from "axios";

export const setupInterceptors = () => {
  // 1) Request: اضافه کردن access
  api.interceptors.request.use((config) => {
    const { access } = store.getState().auth;

    if (access) config.headers.Authorization = `Bearer ${access}`;
    return config;
  });

  // قفل برای اینکه همزمان چندتا رفرش نزنیم
  let isRefreshing = false;
  let queue = [];

  const redirectToLogin = () => {
    // جلوگیری از لوپ اگر همین الان توی /login هستی
    if (window.location.pathname !== "/login") {
      // اگر می‌خوای بعد از لاگین برگرده، می‌تونی state/redirect query هم بذاری
      window.location.assign("/login");
    }
  };
  const forceLogoutAndLogin = () => {
    store.dispatch(logout());
    redirectToLogin();
  };

  const processQueue = (error, token = null) => {
    queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
    queue = [];
  };

  // 2) Response: اگر 401 شد، رفرش کن و دوباره بفرست
  api.interceptors.response.use(
    (res) => res,
    async (err) => {
      const originalRequest = err.config;

      // اگر 401 بود و قبلاً برای این request تلاش نکردیم
      console.log("Response Error:", err.response?.status);
      if (
        (err?.response?.status === 403 || err?.response?.status === 401) &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        const { refresh } = store.getState().auth;
        if (!refresh) {
          forceLogoutAndLogin();

          return Promise.reject(err);
        }

        // اگر یک رفرش در حال اجراست، این درخواست رو صف کن
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            queue.push({ resolve, reject });
          }).then((newAccess) => {
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return api(originalRequest);
          });
        }

        isRefreshing = true;

        try {
          console.log("Refreshing...");
          console.log(store.getState().auth.refresh);
          const { data } = await axios.post(
            "http://127.0.0.1:8000/api/auth/token/refresh/",
            { refresh },
            { headers: { "Content-Type": "application/json" } },
          );
          console.log(data);
          const newAccess = data?.access;
          const newRefresh = data?.refresh;

          if (!newAccess || !newRefresh) {
            throw new Error("Tokens not returned");
          }

          store.dispatch(
            setTokens({
              access: newAccess,
              refresh: newRefresh,
            }),
          );
          processQueue(null, newAccess);

          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          store.dispatch(logout());
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(err);
    },
  );
};
