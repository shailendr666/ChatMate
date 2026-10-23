import { Command } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearUser } from "../store/Slices/AuthSlice";

const Navbar = () => {
  const [activeTab, setActiveTab] = useState("home");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (_) {
      // ignore errors — clear client state regardless
    }
    dispatch(clearUser());
    navigate("/");
  };

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-zinc-800 bg-zinc-950 backdrop-blur-md">
      <div className="h-14 flex items-center justify-between max-w-6xl mx-auto px-6 ">
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              setActiveTab("home");
              navigate("/");
            }}
          >
            <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
              <Command className="w-4 h-4 text-black" />
            </div>
            <span className="text-sm font-bold text-white">CHAT MATE</span>
          </div>
          <div className="hidden md:flex items-center gap-4 border-l border-zinc-800 pl-6">
            <button
              onClick={() => {
                setActiveTab("home");
                navigate("/");
              }}
              className={`text-xs font-medium cursor-pointer transition-colors  ${
                activeTab === "home"
                  ? "text-white"
                  : "text-zinc-500 hover:text-zinc-200"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => { setActiveTab("chat"); navigate("/chat"); }}
              className={`text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "chat"
                  ? "text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Workspace
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <button
              onClick={handleLogout}
              className="px-3 bg-white text-black py-1.5 text-xs font-bold hover:bg-zinc-200 rounded transition-colors cursor-pointer"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => {
                setActiveTab("login");
                navigate("/login");
              }}
              className="px-3 bg-white text-black py-1.5 text-xs font-bold hover:bg-zinc-200 rounded transition-colors cursor-pointer"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
