import { FiHome, FiBookOpen, FiUser, FiLogIn, FiUsers, FiInfo, FiBell } from 'react-icons/fi';
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import RoomSearchBar from "./RoomSearchBar";
import api from "../api/axiosInstance";

function Header({ showSearchBar = false, showGradient = true }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const isLoggedIn = Boolean(localStorage.getItem("token"));

  // Fetch user role
  const fetchUserRole = async () => {
    if (!isLoggedIn) {
      setIsAdmin(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      let userId = localStorage.getItem("userId");
      if (!userId && token) {
        const tokenPayload = JSON.parse(atob(token.split(".")[1]));
        userId = tokenPayload.sub;
      }
      if (!userId) return;

      const response = await api.get(`/Users/${userId}`);
      const userData = response.data;
      const hasAdminRole = userData.roles && userData.roles.includes("Admin");
      setIsAdmin(hasAdminRole);
      localStorage.setItem("isAdmin", hasAdminRole.toString());
    } catch (error) {
      console.error("Error fetching user role:", error);
      setIsAdmin(false);
      localStorage.removeItem("isAdmin");
    }
  };

  // Fetch unread notifications
  const fetchUnreadNotifications = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await api.get("/Notifications"); // or your endpoint for notifications
      const unreadCount = res.data.filter(n => !n.isRead).length;
      setHasUnread(unreadCount > 0);
    } catch (err) {
      console.error("Failed to fetch unread notifications:", err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      const storedRole = localStorage.getItem("isAdmin");
      if (storedRole !== null) setIsAdmin(storedRole === "true");
      fetchUserRole();
      fetchUnreadNotifications();
    } else {
      setIsAdmin(false);
      setHasUnread(false);
      localStorage.removeItem("isAdmin");
    }
    const handleUpdate = () => fetchUnreadNotifications();
    window.addEventListener("notifications-updated", handleUpdate);
    return () => window.removeEventListener("notifications-updated", handleUpdate);
  }, [isLoggedIn]);

  return (
    <div className="relative" style={{ top: "-25px" }}>
      {showGradient && (
        <div
          className="absolute inset-0 bg-gradient-to-b from-black to-transparent z-10 hidden md:block"
          style={{ bottom: "-40px", pointerEvents: "none" }}
        ></div>
      )}

      <header
        className={`relative z-50 mx-auto px-6 py-10 flex justify-between items-center ${
          showGradient ? "" : "text-black"
        }`}
        style={{ maxWidth: "1200px", color: showGradient ? undefined : "#111" }}
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
            {isLoggedIn && (
              <Link
                to="/RoomDisplay"
                className={`${showGradient ? "text-white" : "text-black"} py-8 px-4 no-underline`}
              >
                Booking
              </Link>
            )}
            {isLoggedIn && isAdmin && (
              <Link
                to="/admin"
                className={`${showGradient ? "text-white" : "text-black"} py-8 px-4 no-underline`}
              >
                Admin Panel
              </Link>
            )}
            <Link
              to="/AboutUs"
              className={`${showGradient ? "text-white" : "text-black"} py-8 px-4 no-underline`}
            >
              About Us
            </Link>
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-4 relative">
          {showSearchBar && <RoomSearchBar />}

          {isLoggedIn && (
            <Link to="/notifications" className="flex items-center relative">
              <FiBell
                size={24}
                className="text-black hover:text-gray-700 transition-colors duration-300 ease-in-out mr-2"
              />
              {hasUnread && (
                <span className="absolute top-0 right-0 block w-2 h-2 rounded-full bg-red-500 ring-1 ring-white"></span>
              )}
            </Link>
          )}

          {isLoggedIn ? (
            <Link to="/profile">
              <button className="border-none rounded-full py-3 px-5 text-lg cursor-pointer bg-[#539D98] hover:bg-[#437e79] transition-colors duration-300 ease-in-out text-white">
                Profile
              </button>
            </Link>
          ) : (
            <Link to="/Login">
              <button className="border-none rounded-full py-3 px-5 text-lg cursor-pointer bg-[#539D98] hover:bg-[#437e79] transition-colors duration-300 ease-in-out text-white">
                Login
              </button>
            </Link>
          )}
        </div>

        {/* Burger menu icon */}
        <div className="md:hidden relative z-60 ">
          <div className="flex items-center gap-2">
            {isLoggedIn && (
              <Link to="/notifications" className="flex items-center relative">
                <FiBell
                  size={24}
                  className="text-black hover:text-gray-700 transition-colors duration-300 ease-in-out"
                />
                {hasUnread && (
                  <span className="absolute top-0 right-0 block w-2 h-2 rounded-full bg-red-500 ring-1 ring-white"></span>
                )}
              </Link>
            )}

            <button
              className="focus:outline-none focus:ring-0"
              aria-label="Open menu"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="32px"
                viewBox="0 -960 960 960"
                width="32px"
                className={showGradient ? "fill-white" : "fill-black"}
              >
                <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed top-0 right-0 h-full w-3/4 bg-white bg-opacity-80 z-70 flex flex-col items-center justify-center md:hidden transition-all duration-300 ease-in-out">
          <nav className="flex flex-col gap-8">
            <Link to="/" className="text-xl flex items-center gap-2" onClick={() => setMenuOpen(false)}>
              <FiHome size={22} /> Home
            </Link>
            {isLoggedIn && (
              <Link to="/RoomDisplay" className="text-xl flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                <FiBookOpen size={22} /> Booking
              </Link>
            )}
            {isLoggedIn && isAdmin && (
              <Link to="/AdminPanel" className="text-xl flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                <FiUsers size={22} /> Admin Panel
              </Link>
            )}
            <Link to="/AboutUs" className="text-xl flex items-center gap-2" onClick={() => setMenuOpen(false)}>
              <FiInfo size={22} /> About Us
            </Link>
            {isLoggedIn ? (
              <Link to="/profile" className="text-xl flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                <FiUser size={22} /> Profile
              </Link>
            ) : (
              <Link to="/Login" className="text-xl flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                <FiLogIn size={22} /> Login
              </Link>
            )}
          </nav>

          {/* Close button */}
          <button
            className="absolute top-6 right-6 text-3xl focus:outline-none focus:ring-0 bg-white"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}

export default Header;
