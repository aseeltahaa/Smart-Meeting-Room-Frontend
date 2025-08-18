import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import Card from "./Card";
import RoomImage from "../assets/room.jpg"; 
import "../App.css";

function PopularRooms() {
  const [rooms, setRooms] = useState([null, null, null]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get("/Meeting/top-rooms");
        const data = response.data;

        // Normalize to 3 slots
        const normalized = [null, null, null];
        for (let i = 0; i < 3; i++) {
          if (data[i]) normalized[i] = data[i];
        }

        setRooms(normalized);
      } catch (error) {
        console.error("Error fetching top rooms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  return (
    <section className="mt-[-60px] mb-16 sm:mb-24 lg:mb-32">
      <p className="text-[36px] sm:text-[60px] font-bold text-center text-[#111827] mb-10">
        Popular Rooms
      </p>

      <div className="p-4 sm:p-8 flex items-center justify-center">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
            {rooms.map((room, index) =>
              room ? (
                <Card
                  key={room.id}
                  title={room.name}
                  description={`Capacity: ${room.capacity} • Location: ${room.location} • Features: ${room.featureIds.length}`}
                  imageSrc={RoomImage} // placeholder
                  imageAlt={`Room ${room.name}`}
                />
              ) : (
                <div
                  key={`empty-${index}`}
                  className="border border-gray-300 rounded-xl flex items-center justify-center h-64 text-gray-400 font-medium"
                >
                  null
                </div>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default PopularRooms;
