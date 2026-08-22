import { useState, useRef, useLayoutEffect, useCallback } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, logoutUser } from "./slices/authSlice";
import Swal from "sweetalert2";

const NAV_ITEMS = [
  { label: "Home", to: "/", end: true },
  { label: "Surveys", to: "/surveys" },
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
      <header className="bg-white/70 backdrop-blur-md">
        <nav className="mx-auto shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-3xl mt-6 max-w-5xl flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">Survey App</h1>

          <div
            ref={containerRef}
            className="relative flex gap-1 bg-blue-950 rounded-full p-1"
          >
            {/* sliding pill */}
            <div
              className="absolute rounded-full bg-white transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]"
              style={selectorStyle}
            />

            {NAV_ITEMS.map((item, i) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                ref={(el) => (itemRefs.current[i] = el)}
                className={`relative z-10 px-4 py-2 text-sm rounded-full transition-colors duration-300 ${
                  activeIndex === i
                    ? "text-blue-950 font-medium"
                    : "text-blue-100 hover:text-white"
                }`}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div>
            {access ? (
              <button
                className="border border-red-300 text-red-500 px-4 py-2 rounded-full hover:bg-red-50 transition cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <NavLink to={"/login"}>
                <button className="bg-gradient-to-r from-indigo-600 to-blue-700 cursor-pointer text-white px-5 py-2 rounded-full shadow-md shadow-indigo-500/30 hover:shadow-lg hover:scale-[1.02] transition">
                  sign up
                </button>
              </NavLink>
            )}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl p-6">
        <Outlet />
      </main>
    </div>
  );
}