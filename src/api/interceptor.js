import { api } from "./axios";
import { logout, setTokens } from "../slices/authSlice";
import { store } from "../store";
import axios from "axios";

export const setupInterceptors = () => {
  api.interceptors.request.use((config) => {
    const { access } = store.getState().auth;

    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }

    return config;
  });

  let isRefreshing = false;
  let queue = [];

  const redirectToLogin = () => {
    if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  };

  const forceLogoutAndLogin = () => {
    store.dispatch(logout());
    redirectToLogin();
  };

  const processQueue = (error, token = null) => {
    queue.forEach((p) => {
      if (error) {
        p.reject(error);
      } else {
        p.resolve(token);
      }
    });

    queue = [];
  };

  api.interceptors.response.use(
    (res) => res,

    async (err) => {
      const originalRequest = err.config;

      console.log("Response Error:", err.response?.status);

      // فقط 401
      if (
        err.response?.status !== 401 ||
        originalRequest._retry
      ) {
        return Promise.reject(err);
      }

      // اگر خود refresh request خطا داد،
      // دوباره وارد refresh نشو
      if (originalRequest.url === "/auth/token/refresh/") {
        forceLogoutAndLogin();
        return Promise.reject(err);
      }

      originalRequest._retry = true;

      const { refresh } = store.getState().auth;

      if (!refresh) {
        forceLogoutAndLogin();
        return Promise.reject(err);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((newAccess) => {
          originalRequest.headers.Authorization =
            `Bearer ${newAccess}`;

          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        console.log("Refreshing...");

        // مهم:
        // اینجا از axios معمولی استفاده می‌کنیم
        // نه api که interceptor روی آن نصب شده
        const { data } = await axios.post(
          "http://127.0.0.1:8000/api/auth/token/refresh/",
          { refresh },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const newAccess = data?.access;
        const newRefresh = data?.refresh;

        if (!newAccess || !newRefresh) {
          throw new Error("Tokens not returned");
        }

        store.dispatch(
          setTokens({
            access: newAccess,
            refresh: newRefresh,
          })
        );

        processQueue(null, newAccess);

        originalRequest.headers.Authorization =
          `Bearer ${newAccess}`;

        return api(originalRequest);

      } catch (refreshErr) {

        processQueue(refreshErr, null);

        forceLogoutAndLogin();

        return Promise.reject(refreshErr);

      } finally {
        isRefreshing = false;
      }
    }
  );
};