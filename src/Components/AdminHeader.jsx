import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

function AdminHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const tabs = [
    { id: "users", label: "Manage Users", path: "/UserManagement" },
    { id: "features", label: "Manage Features", path: "/FeatureManagement" },
    { id: "rooms", label: "Manage Rooms", path: "/RoomManagement" },
  ];

  const isActiveTab = (tabPath) => location.pathname === tabPath;

  return (
    <div className="relative" style={{ top: "-25px" }}>
      <header
        className="relative z-50 mx-auto px-6 py-10 flex justify-between items-center text-black"
        style={{ maxWidth: "1200px", color: "#111" }}
      >
        <div className="flex justify-center items-center relative">
          <Link to="/">
            <img
              src={logo}
              alt="Logo"
              style={{ marginRight: "50px", width: "50px" }}
            />
          </Link>
          <nav className="hidden md:inline">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                to={tab.path}
                className={`text-black py-8 px-4 no-underline hover:text-gray-600 ${
                  isActiveTab(tab.path)
                    ? "font-bold bg-gray-100 rounded-lg shadow-sm"
                    : ""
                }`}
                style={
                  isActiveTab(tab.path)
                    ? {
                        backgroundColor: "#f3f4f6",
                        borderRadius: "0.75rem",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                      }
                    : {}
                }
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-4 relative">
          <Link to="/">
            <button className="border-none rounded-full py-3 px-5 text-lg cursor-pointer bg-[#539D98] hover:bg-[#437e79] transition-colors duration-300 ease-in-out text-white">
              Back to Home
            </button>
          </Link>
        </div>

        <div className="md:hidden relative z-60">
          <button
            className="focus:outline-none focus:ring-0"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="32px"
              viewBox="0 -960 960 960"
              width="32px"
              className="fill-black"
            >
              <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
            </svg>
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed top-0 right-0 h-full w-3/4 bg-white bg-opacity-80 z-70 flex flex-col items-center justify-center md:hidden transition-all duration-300 ease-in-out">
          <nav className="flex flex-col gap-8">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                to={tab.path}
                onClick={() => setMenuOpen(false)}
                className={`text-xl flex items-center gap-2 no-underline ${
                  isActiveTab(tab.path) ? "font-bold" : ""
                }`}
              >
                {tab.label}
              </Link>
            ))}
            <Link
              to="/"
              className="text-xl flex items-center gap-2"
              onClick={() => setMenuOpen(false)}
            >
              Back to Home
            </Link>
          </nav>

          <button
            className="absolute top-6 right-6 text-3xl focus:outline-none focus:ring-0 bg-white"
            onClick={() => setMenuOpen(false)}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminHeader;
