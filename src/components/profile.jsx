import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { logout, logoutUser, setUser } from "../slices/authSlice";
import { api } from "../api/axios";
import Swal from "sweetalert2";
import Dashboard from "./Dashboard";
import PassChange from "./passChange";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import EditProfile from "./editProfile";
import { fetchSurveys } from "../slices/surveySlice";
import SurveyDashboard from "./surveyDashboard";

export default function Profile() {
  const [order, setOrder] = useState(1);
  const [loading, setLoading] = useState(false);

  const refresh = useSelector((state) => state.auth.refresh);

  const { surveys, loadingList, error } = useSelector((s) => s.surveys);

  const navigate = useNavigate();

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get("/auth/profile/");
        const data = res.data;
        dispatch(setUser(data));
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    dispatch(fetchSurveys());
  }, []);

  const handleLogout = async () => {
    const result = await dispatch(logoutUser(refresh));

    console.log("LOGOUT RESULT:", result);
    console.log("LOGOUT TYPE:", result.type);

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
  const user = useSelector((state) => state.auth.user);
  console.log(user);
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col bg-white border-r shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-indigo-600">Dashboard</h2>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <button
              className={order === 1 ? `w-full bg-indigo-100 rounded-lg px-4 py-3 text-left font-medium text-indigo-600`: `w-full rounded-lg  px-4 py-3 text-left hover:bg-slate-100`}
              onClick={() => setOrder(1)}
            >
              Dashboard
            </button>

            <button className={order === 2 ? `w-full bg-indigo-100 rounded-lg px-4 py-3 text-left font-medium text-indigo-600`: `w-full rounded-lg  px-4 py-3 text-left hover:bg-slate-100`} onClick={() => setOrder(2)}>
              My Survey Results
            </button>

            <button className={order === 3 ? `w-full bg-indigo-100 rounded-lg px-4 py-3 text-left font-medium text-indigo-600`: `w-full rounded-lg  px-4 py-3 text-left hover:bg-slate-100`}>
              Wishlist
            </button>

            <button
              className={order === 4 ? `w-full bg-indigo-100 rounded-lg px-4 py-3 text-left font-medium text-indigo-600`: `w-full rounded-lg  px-4 py-3 text-left hover:bg-slate-100`}
              onClick={() => setOrder(4)}
            >
              Change Password
            </button>

            <button
              className={order === 5 ? `w-full bg-indigo-100 rounded-lg px-4 py-3 text-left font-medium text-indigo-600`: `w-full rounded-lg  px-4 py-3 text-left hover:bg-slate-100`}
              onClick={() => setOrder(5)}
            >
              Edit Profile
            </button>
          </nav>

          <div className="p-4 border-t">
            <button
              className="w-full rounded-lg bg-red-500 py-3 text-white hover:bg-red-600"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Content */}
        {order === 1 ? (
          <Dashboard user={user} loading={loading} />
        ) : order === 4 ? (
          <PassChange />
        ) : order === 5 ? (
          <EditProfile user={user} />
        ) : order === 2 ? (
          <SurveyDashboard surveys={surveys}/>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
