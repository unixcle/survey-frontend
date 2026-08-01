import { Outlet, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "./slices/authSlice";

export default function App() {
  const dispatch = useDispatch();

  const { access } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    window.location.assign("/login");
  };

  return (
    <div className="min-h-dvh bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <nav className="mx-auto max-w-5xl flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">Survey App</h1>
          <div className="flex gap-4">
            <NavLink to="/" className="hover:underline">
              Home
            </NavLink>
            <NavLink to="/surveys" className="hover:underline">
              Surveys
            </NavLink>
            <NavLink to="/survey/new" className="hover:underline">
              Create New Survey
            </NavLink>
            {access && <button className="bg-red-400 text-white rounded-lg p-1 cursor-pointer" onClick={handleLogout}>Logout</button>}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl p-6">
        <Outlet />
      </main>
    </div>
  );
}
