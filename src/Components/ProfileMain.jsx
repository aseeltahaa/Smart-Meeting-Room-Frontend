import React, { useEffect, useState } from "react";
import defaultPfp from "../assets/defaultPfp.png";
import { FiLogOut, FiKey, FiUpload, FiTrash, FiCamera } from "react-icons/fi";
import axios from "../api/axiosInstance";

function ProfileMain() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const Base_URL = "https://localhost:7074";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/Users/me");
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
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

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      await axios.post("/Users/me/upload-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Refresh user data
      const res = await axios.get("/Users/me");
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch (err) {
      console.error(err);
      alert("Failed to upload profile picture.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm("Are you sure you want to delete your profile picture?")
    )
      return;

    try {
      await axios.delete("/Users/me/delete-profile");
      // Refresh user data
      const res = await axios.get("/Users/me");
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch (err) {
      console.error(err);
      alert("Failed to delete profile picture.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div
      className="flex flex-col md:flex-row justify-start px-6 py-10 mx-auto w-full max-w-full overflow-x-hidden relative"
      style={{ top: "-25px" }}
    >
      {/* Profile Picture */}
      <div className="flex-shrink-0 flex flex-col items-center">
        <img
          src={
            user.profilePictureUrl
              ? `${Base_URL}${user.profilePictureUrl}`
              : defaultPfp
          }
          alt="Profile"
          className="w-50 h-50 object-cover rounded-full mb-2 object-center"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
          id="uploadPfp"
        />
        <div className="flex gap-2">
          <label
            htmlFor="uploadPfp"
            className="flex items-center gap-1 text-white py-1 px-3 rounded-lg cursor-pointer focus:outline-none"
            style={{ backgroundColor: "#539D98" }}
          >
            <FiUpload />
            {uploading ? "Uploading..." : "Upload"}
          </label>
          {user.profilePictureUrl && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 text-white py-1 px-3 rounded-lg"
              style={{ backgroundColor: "#E74C3C" }}
            >
              <FiTrash />
              Delete
            </button>
          )}
        </div>
      </div>

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
