
import { useState, useRef, useLayoutEffect, useCallback } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, logoutUser } from "./slices/authSlice";
import Swal from "sweetalert2";

const NAV_ITEMS = [
  { label: "Home", to: "/", end: true },
  { label: "Profile", to: "profile" },
  { label: "Create New Survey", to: "/survey/new" },
];

export default function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { access } = useSelector((state) => state.auth);
  const refresh = useSelector((state) => state.auth.refresh);

  // ---- animated pill selector ----
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const [selectorStyle, setSelectorStyle] = useState({ opacity: 0 });

  const activeIndex = NAV_ITEMS.findIndex((item) =>
    item.end
      ? location.pathname === item.to
      : location.pathname.startsWith(
          item.to.startsWith("/") ? item.to : `/${item.to}`
        )
  );

  const measure = useCallback(() => {
    const container = containerRef.current;
    const activeEl = itemRefs.current[activeIndex];

    if (!container || !activeEl) {
      setSelectorStyle({ opacity: 0 });
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const itemRect = activeEl.getBoundingClientRect();

    setSelectorStyle({
      opacity: 1,
      top: itemRect.top - containerRect.top,
      left: itemRect.left - containerRect.left,
      width: itemRect.width,
      height: itemRect.height,
    });
  }, [activeIndex]);

  useLayoutEffect(() => {
    measure();

    window.addEventListener("resize", measure);

    return () => window.removeEventListener("resize", measure);
  }, [measure]);
  // ---------------------------------

  const handleLogout = async () => {
    const result = await dispatch(logoutUser(refresh));

    if (logoutUser.fulfilled.match(result)) {
      dispatch(logout);

      Swal.fire({
        icon: "success",
        title: "Logged out",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/login");
    }
  };

  return (
    <div className="min-h-dvh text-gray-900">
      <header className="bg-white/70 px-3 backdrop-blur-md sm:px-4">
        <nav
          className="
            mx-auto mt-3 flex w-full max-w-5xl
            flex-col gap-3 rounded-3xl
            p-3
            shadow-[0_8px_30px_rgb(0,0,0,0.08)]
            sm:mt-6
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:p-4
          "
        >
          {/* Logo */}
          <div className="flex items-center justify-center sm:justify-start">
            <h1 className="text-lg font-bold sm:text-xl">
              Survey App
            </h1>
          </div>

          {/* Navigation */}
          <div
            ref={containerRef}
            className="
              relative flex w-full
              items-center justify-center
              gap-1 rounded-full
              bg-blue-950 p-1
              sm:w-auto
            "
          >
            {/* Sliding pill */}
            <div
              className="
                absolute rounded-full bg-white
                transition-all duration-500
                ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]
              "
              style={selectorStyle}
            />

            {NAV_ITEMS.map((item, i) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                ref={(el) => (itemRefs.current[i] = el)}
                className={`
                  relative z-10
                  flex-1 rounded-full
                  px-2 py-2
                  text-center text-[11px]
                  transition-colors duration-300
                  sm:flex-none
                  sm:px-4
                  sm:text-sm
                  ${
                    activeIndex === i
                      ? "font-medium text-blue-950"
                      : "text-blue-100 hover:text-white"
                  }
                `}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Auth button */}
          <div className="flex justify-center sm:justify-end">
            {access ? (
              <button
                className="
                  w-full rounded-full
                  border border-red-300
                  px-4 py-2
                  text-sm text-red-500
                  transition
                  hover:bg-red-50
                  cursor-pointer
                  sm:w-auto
                "
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <NavLink to="/login" className="w-full sm:w-auto">
                <button
                  className="
                    w-full rounded-full
                    bg-gradient-to-r
                    from-indigo-600 to-blue-700
                    px-5 py-2
                    text-sm text-white
                    shadow-md shadow-indigo-500/30
                    transition
                    hover:scale-[1.02]
                    hover:shadow-lg
                    cursor-pointer
                    sm:w-auto
                  "
                >
                  Sign up
                </button>
              </NavLink>
            )}
          </div>
        </nav>
      </header>

      <main className="p-3 sm:p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
