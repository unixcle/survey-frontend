import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { logout, logoutUser, setUser } from "../slices/authSlice";
import { fetchSurveys } from "../slices/surveySlice";
import { api } from "../api/axios";

import PassChange from "./passChange";
import EditProfile from "./editProfile";
import SurveyDashboard from "./surveyDashboard";
import { getError } from "../errors/getError";

//  Keep tab identifiers in one place to avoid hardcoded strings.
const TABS = {
  SURVEYS: "surveys",
  PASSWORD: "password",
  EDIT_PROFILE: "editProfile",
};

const NAV_ITEMS = [
  { key: TABS.SURVEYS, label: "My Surveys" },
  { key: TABS.PASSWORD, label: "Change Password" },
  { key: TABS.EDIT_PROFILE, label: "Edit Profile" },
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState(TABS.SURVEYS);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const refresh = useSelector((state) => state.auth.refresh);
  const user = useSelector((state) => state.auth.user);
  const { surveys } = useSelector((state) => state.surveys);

  // Fetch profile + Load the user's profile and surveys when the dashboard mounts.
  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get("/auth/profile/");
        if (isMounted) dispatch(setUser(res.data));
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: getError(err),
        });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    dispatch(fetchSurveys());

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const handleLogout = useCallback(async () => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Log out?",
      text: "You will need to sign in again to continue.",
      showCancelButton: true,
      confirmButtonText: "Log out",
    });

    if (!confirm.isConfirmed) return;

    try {
      const result = await dispatch(logoutUser(refresh));

      if (logoutUser.fulfilled.match(result)) {
        dispatch(logout()); 
        await Swal.fire({
          icon: "success",
          title: "Logged out",
          timer: 1200,
          showConfirmButton: false,
        });
        navigate("/login");
      } else {
        throw new Error(result.payload?.detail || "Logout failed. Please try again.");
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: getError(err),
      });
    }
  }, [dispatch, refresh, navigate]);

  const activeContent = useMemo(() => {
    switch (activeTab) {
      case TABS.PASSWORD:
        return <PassChange />;
      case TABS.EDIT_PROFILE:
        return <EditProfile user={user} />;
      case TABS.SURVEYS:
      default:
        return <SurveyDashboard surveys={surveys} />;
    }
  }, [activeTab, user, surveys]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:flex w-64 flex-col bg-white border-r shadow-sm shrink-0">
          <SidebarContent
            user={user}
            activeTab={activeTab}
            onSelect={setActiveTab}
            onLogout={handleLogout}
          />
        </aside>

        {/* Top nav (mobile) */}
        <header className="md:hidden bg-white border-b shadow-sm">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-bold text-indigo-600">Dashboard</h2>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-red-500 hover:text-red-600"
            >
              Logout
            </button>
          </div>
          <nav className="flex overflow-x-auto border-t">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex-1 whitespace-nowrap px-4 py-3 text-sm font-medium ${
                  activeTab === item.key
                    ? "border-b-2 border-indigo-600 text-indigo-600"
                    : "text-slate-500"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8">{activeContent}</main>
      </div>
    </div>
  );
}

function SidebarContent({ user, activeTab, onSelect, onLogout }) {
  return (
    <>
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-indigo-600">Dashboard</h2>
        {user?.username && (
          <p className="mt-1 truncate text-sm text-slate-500">{user.username}</p>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            aria-current={activeTab === item.key ? "page" : undefined}
            className={
              activeTab === item.key
                ? "w-full rounded-lg bg-indigo-100 px-4 py-3 text-left font-medium text-indigo-600"
                : "w-full rounded-lg px-4 py-3 text-left hover:bg-slate-100"
            }
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={onLogout}
          className="w-full rounded-lg bg-red-500 py-3 text-white transition-colors hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </>
  );
}