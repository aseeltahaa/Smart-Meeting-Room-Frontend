import { useEffect, useState } from "react";
import NumberFlip from "./NumberFlip";
import api from "../api/axiosInstance"; // ✅ your axios instance
import "../App.css";

function Report() {
  const [meetings, setMeetings] = useState(0);
  const [rooms, setRooms] = useState(0);
  const [users, setUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [meetingsRes, roomsRes, usersRes] = await Promise.all([
          api.get("/Meeting/count"),
          api.get("/Room/count"),
          api.get("/Users/count"),
        ]);

        setMeetings(meetingsRes.data); // assuming /Meeting/count returns plain number
        setRooms(roomsRes.data);         // assuming /Room/count returns plain number
        setUsers(usersRes.data.count);   // /Users/count returns { count: X }
      } catch (error) {
        console.error("Error fetching report counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  return (
    <section className="px-6 relative" style={{ top: "-100px" }}>
      <div className="relative z-20" style={{ top: "-100px" }}>
        <div className="bg-brand-teal rounded-lg relative z-20 md:flex md:mx-auto md:max-w-[878px] md:divide-x md:divide-white">
          <div className="text-center py-10 border-b border-solid border-white md:w-1/3 md:border-b-0">
            {loading ? <p className="text-white">Loading...</p> : <NumberFlip value={meetings} />}
            <p className="text-white text-lg">Meetings</p>
          </div>

          <div className="text-center py-10 border-b border-solid border-white md:w-1/3 md:border-b-0">
            {loading ? <p className="text-white">Loading...</p> : <NumberFlip value={rooms} />}
            <p className="text-white text-lg">Rooms</p>
          </div>

          <div className="text-center py-10 md:w-1/3">
            {loading ? <p className="text-white">Loading...</p> : <NumberFlip value={users} />}
            <p className="text-gray-300 text-lg">Users</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Report;
