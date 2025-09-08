import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axiosInstance";
import Card from "./Card";
import RoomImage from "../assets/room.jpg";
import "../App.css";

function BiggestRooms() {
  const [rooms, setRooms] = useState([null, null, null]);
  const [loading, setLoading] = useState(true);

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

  const resolveImageUrl = (imageUrl) => {
    if (!imageUrl) return RoomImage;
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl; 
    const path = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
    return `${apiOrigin}${path}`;
  };


  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await axios.get("/Room/biggest-rooms");
        const list = Array.isArray(data) ? data : [];

        const normalized = [null, null, null];
        for (let i = 0; i < 3 && i < list.length; i++) {
          normalized[i] = list[i];
        }
        setRooms(normalized);
      } catch (error) {
        console.error("Error fetching top rooms:", error);
        setRooms([null, null, null]);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  return (
    <section className="mt-[-60px] mb-16 sm:mb-24 lg:mb-32">
      <p className="text-[36px] sm:text-[60px] font-bold text-center text-[#111827] mb-10">
        Biggest Rooms
      </p>

      <div className="p-4 sm:p-8 flex items-center justify-center">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
            {rooms.map((room, index) =>
              room ? (
                <Link
                  key={room.id}
                  to={`/room/${room.id}`} // ✅ match existing route (singular)
                  className="block hover:scale-[1.02] transition-transform duration-200"
                >
                  <Card
                    title={room.name}
                    description={`Capacity: ${room.capacity} • Location: ${room.location} • Features: ${Array.isArray(room.featureIds) ? room.featureIds.length : 0}`}
                    imageSrc={resolveImageUrl(room.imageUrl)} // ✅ build absolute URL or fallback
                    imageAlt={`Room ${room.name}`}
                  />
                </Link>
              ) : (
                <div
                  key={`empty-${index}`}
                  className="border border-gray-300 rounded-xl flex items-center justify-center h-64 text-gray-400 font-medium"
                >
                  No data
                </div>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default BiggestRooms;
