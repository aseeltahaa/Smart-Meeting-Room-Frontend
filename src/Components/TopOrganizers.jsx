import { useEffect, useState, useMemo } from "react";
import axios from "../api/axiosInstance";
import "../App.css";
import defaultPfp from "../assets/defaultPfp.png";

function TopOrganizers() {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Determine API origin from axios baseURL
  const apiOrigin = useMemo(() => {
    try {
      const base = axios.defaults?.baseURL || "";
      if (/^https?:\/\//i.test(base)) {
        const u = new URL(base);
        return `${u.protocol}//${u.host}`;
      }
    } catch {}
    return window.location.origin || "https://localhost:7074";
  }, []);

  // Resolve image URL with fallback
  const resolveImageUrl = (imageUrl) => {
    if (!imageUrl) return defaultPfp; // Use local default profile picture
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl; // Absolute URL
    const path = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
    return `${apiOrigin}${path}`;
  };

  useEffect(() => {
    const fetchOrganizers = async () => {
      try {
        const { data } = await axios.get("/Users/top-organizers");
        setOrganizers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching top organizers:", error);
        setOrganizers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizers();
  }, []);

  return (
    <section className="mt-[-60px] mb-16 sm:mb-24 lg:mb-32">
      <p className="text-[36px] sm:text-[60px] font-bold text-center text-[#111827] mb-10">
        Top Organizers
      </p>

      <div className="p-4 sm:p-8 flex items-center justify-center">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : organizers.length === 0 ? (
          <p className="text-gray-400">No organizers found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
            {organizers.map((org) => (
              <div
                key={org.id}
                className="border border-gray-200 rounded-xl p-6 flex flex-col items-center shadow hover:shadow-lg transition-shadow"
              >
                <img
                  src={resolveImageUrl(org.profilePictureUrl)}
                  alt={`${org.firstName} ${org.lastName}`}
                  className="w-24 h-24 rounded-full object-cover mb-4"
                />
                <h3 className="text-xl font-semibold text-gray-800">
                  {org.firstName} {org.lastName}
                </h3>
                <p className="text-gray-500 text-sm mt-2">{org.email}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default TopOrganizers;
