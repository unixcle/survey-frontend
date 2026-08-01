import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser} from "../slices/authSlice";
import { api } from "../api/axios";
import Swal from "sweetalert2";
import Dashboard from "./Dashboard";
import PassChange from "./passChange";

import { useSelector } from "react-redux";



export default function Profile() {

  const [order,setOrder] = useState(1)
    
  const dispatch = useDispatch();

  useEffect(() => {
    
    const fetchProfile = async () => {

        try {
          const res = await api.get("/api/auth/profile/");
          const data = res.data
          dispatch(setUser(data));
          
        } catch (err) {
          Swal.fire({
            icon:"error",
            title:"Error",
            text:err.message
          })
        }
    };

    fetchProfile();
  }, []);

  const user = useSelector((state) => state.auth.user);
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col bg-white border-r shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-indigo-600">Dashboard</h2>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <button className="w-full rounded-lg bg-indigo-100 px-4 py-3 text-left font-medium text-indigo-600" onClick={()=>setOrder(1)}>
              Dashboard
            </button>

            <button className="w-full rounded-lg px-4 py-3 text-left hover:bg-slate-100" >
              My Survey Results
            </button>

            <button className="w-full rounded-lg px-4 py-3 text-left hover:bg-slate-100">
              Wishlist
            </button>

            <button className="w-full rounded-lg px-4 py-3 text-left hover:bg-slate-100" onClick={()=>setOrder(4)}>
              Change Password
            </button>

            <button className="w-full rounded-lg px-4 py-3 text-left hover:bg-slate-100">
              Edit Profile
            </button>
          </nav>

          <div className="p-4 border-t">
            <button className="w-full rounded-lg bg-red-500 py-3 text-white hover:bg-red-600">
              Logout
            </button>
          </div>
        </aside>

        {/* Content */}
        {order === 1 ? <Dashboard user={user}/> : order === 4 ? <PassChange/> : ""}
        
        
      </div>
    </div>
  );
}



