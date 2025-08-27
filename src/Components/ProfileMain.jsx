import React, { useEffect, useState } from "react";
import defaultPfp from "../assets/defaultPfp.png";
import { FiLogOut, FiKey } from "react-icons/fi";
import axios from "../api/axiosInstance";

function ProfileMain() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/Users/me");
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data)); // optional cache
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch user info.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);
  console.log(user);
  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div
      className="flex flex-col md:flex-row justify-start px-6 py-10 mx-auto w-full max-w-full overflow-x-hidden relative"
      style={{ top: "-25px" }}
    >
      {/* Profile Picture */}
      <img
        src={defaultPfp}
        alt="Profile"
        className="w-32 h-32 md:w-52 md:h-48 object-cover rounded-full mb-6 md:mb-0 md:mr-12 mx-auto md:mx-0 md:mx-20"
      />

      {/* User Info */}
      <div className="w-full rounded-2xl p-8 md:pt-8 md:mx-30 md:my-5">
        <h1 className="text-2xl font-bold mb-4">
          {user.firstName} {user.lastName}
        </h1>
        <p>
          <span className="font-semibold">Email:</span> {user.email}
        </p>

        <p className="text-gray-600">
          Roles:{" "}
          {user.roles?.length > 0 ? user.roles.join(", ") : "No roles assigned"}
        </p>

        <div className="mt-6 flex flex-col md:flex-row gap-4 w-full">
          {/* Logout Button */}
          <button
            className="w-full md:flex-1 text-white py-2 rounded-lg flex items-center justify-center gap-2"
            style={{ backgroundColor: "#539D98" }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#4A8A85")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#539D98")}
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              localStorage.removeItem("isAdmin");
              window.location.href = "/";
            }}
          >
            <FiLogOut size={20} />
            Logout
          </button>

          {/* Reset Password Button */}
          <button
            className="w-full md:flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
            onClick={() => {
              window.location.href = "/reset-password";
            }}
          >
            <FiKey size={20} />
            Reset Password
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileMain;
