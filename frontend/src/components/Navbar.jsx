import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { getCurrentUser } from "../utils/auth";

const Navbar = () => {
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  const user = getCurrentUser();

  // 🔹 Load projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects/my");
        setProjects(res.data || []);
      } catch (err) {
        console.error("Failed to load projects", err);
      }
    };

    fetchProjects();
  }, []);

  // 🔹 Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const userInitial = user?.email?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="h-14 bg-[#0747A6] text-white flex items-center justify-between px-6 shadow-md">
      
      {/* LEFT */}
      <div className="flex items-center gap-6 text-sm font-medium relative">
        <span
          className="font-bold text-base cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          🐛 Bug Tracker
        </span>

        <span className="cursor-pointer opacity-90 hover:opacity-100">
          Dashboards
        </span>

        {/* 🔥 PROJECT DROPDOWN */}
        <div ref={dropdownRef} className="relative">
          <span
            className="cursor-pointer opacity-90 hover:opacity-100"
            onClick={() => setOpen(!open)}
          >
            Projects ▾
          </span>

          {open && (
            <div className="absolute top-8 left-0 bg-white text-black rounded shadow-md w-48 z-50">
              {projects.length === 0 && (
                <div className="px-4 py-2 text-gray-500">
                  No projects
                </div>
              )}

              {projects.map((p) => (
                <div
                  key={p.id}
                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                  onClick={() => {
                    navigate(`/tickets/${p.id}`);
                    setOpen(false);
                  }}
                >
                  {p.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <span className="cursor-pointer opacity-90 hover:opacity-100">
          Issues
        </span>

        <span className="cursor-pointer opacity-90 hover:opacity-100">
          Boards
        </span>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4 relative" ref={userMenuRef}>
        <input
          placeholder="Search"
          className="text-sm px-3 py-1.5 rounded bg-white text-black focus:outline-none"
        />

        {/* 🔥 USER DROPDOWN */}
        <div
          className="w-8 h-8 rounded-full bg-white text-[#0747A6] flex items-center justify-center font-semibold cursor-pointer"
          onClick={() => setUserMenuOpen(!userMenuOpen)}
        >
          {userInitial}
        </div>

        {userMenuOpen && (
          <div className="absolute right-0 top-10 bg-white text-black rounded shadow-md w-44 z-50">
            <div className="px-4 py-2 text-sm border-b">
              <div className="font-semibold">{user?.email}</div>
              <div className="text-xs text-gray-500 capitalize">
                {user?.role}
              </div>
            </div>

            <div
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer text-sm"
              onClick={logout}
            >
              Logout
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
