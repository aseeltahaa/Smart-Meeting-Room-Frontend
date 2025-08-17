import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import RoomImage from '../assets/room.jpg';

// Hardcoded images
import Room101 from '../assets/rooms/room101.jpg';
import Room102 from '../assets/rooms/room102.jpg';
import Room201 from '../assets/rooms/room201.jpg';
import Room202 from '../assets/rooms/room202.jpg';
import Room301 from '../assets/rooms/room301.jpg';
import Room302 from '../assets/rooms/room302.jpg';
import Room401 from '../assets/rooms/room401.jpg';

const roomImages = {
  'Room 101': Room101,
  'Room 102': Room102,
  'Room 201': Room201,
  'Room 202': Room202,
  'Room 301': Room301,
  'Room 302': Room302,
  'Room 401': Room401,
};

function RoomInfo() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch room info
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found. Please log in.');
      setLoading(false);
      return;
    }

    fetch(`https://localhost:7074/api/Room/${roomId}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(async data => {
        setRoom(data);

        const featurePromises = data.featureIds.map(id =>
          fetch(`https://localhost:7074/api/Features/${id}`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
          })
            .then(res => (res.ok ? res.json() : null))
            .catch(() => null)
        );

        const featureData = await Promise.all(featurePromises);
        setFeatures(featureData.filter(f => f).map(f => f.name));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching room info:', err);
        setError('Failed to fetch room info.');
        setLoading(false);
      });
  }, [roomId]);

  // Fetch meetings for the room and selected date
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('https://localhost:7074/api/Meeting', {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
    })
      .then(res => res.json())
      .then(data => {
        const roomMeetings = data.filter(
          m =>
            m.roomId.toLowerCase() === roomId.toLowerCase() &&
            new Date(m.startTime).toDateString() === selectedDate.toDateString()
        );
        setMeetings(roomMeetings);
      })
      .catch(err => console.error(err));
  }, [roomId, selectedDate]);

  if (loading) return <p>Loading room info...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section
        className="relative md:h-[689px] h-[450px] w-full flex items-center justify-center"
        style={{ overflow: 'hidden', top: '-140px' }}
      >
        <div className="absolute inset-0 w-full h-full">
          <div className="bg-black absolute inset-0 z-10 opacity-50"></div>
          <img
            src={roomImages[room?.name] || RoomImage}
            alt={room?.name}
            className="w-full h-full object-cover absolute inset-0"
          />
        </div>
        <div className="relative z-20 text-center text-white px-6 py-12 flex flex-col items-center justify-center mt-10 pt-20">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">{room?.name}</h1>
          <div className="text-lg md:text-2xl space-y-4">
            <p>
              <strong>Capacity:</strong> {room?.capacity}
            </p>
            <p>
              <strong>Location:</strong> {room?.location}
            </p>
            <p>
              <strong>Features:</strong> {features.join(', ') || 'None'}
            </p>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="mt-12 px-6">
        {/* Centered date input */}
        <h2 className="text-lg sm:text-2xl font-bold mb-4 flex flex-col sm:flex-row justify-center items-center gap-2 w-full">
          <span className="block mb-2 sm:mb-0 text-base sm:text-xl">Timeline for</span>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={e => setSelectedDate(new Date(e.target.value))}
            className="border px-2 py-1 rounded w-full sm:w-auto text-sm sm:text-base"
          />
        </h2>

        {/* Desktop Timeline (horizontal) */}
        <div className="hidden md:block relative border rounded-lg overflow-hidden bg-gray-100 max-w-5xl mx-auto h-20">
          {/* Grid */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: 11 }, (_, i) => (
              <div key={i} className="flex-1 border-l border-gray-300 relative"></div>
            ))}
          </div>

          {/* Booked meetings */}
          {meetings.map((m, idx) => {
            const start = new Date(m.startTime).getHours() + new Date(m.startTime).getMinutes() / 60;
            const end = new Date(m.endTime).getHours() + new Date(m.endTime).getMinutes() / 60;
            const totalHours = 11;
            const leftPercent = ((start - 8) / totalHours) * 100;
            const widthPercent = ((end - start) / totalHours) * 100;

            return (
              <div
                key={idx}
                className="absolute top-0 h-full bg-blue-500"
                style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
              ></div>
            );
          })}

          {/* Time labels */}
          <div className="absolute bottom-0 left-0 w-full flex justify-between px-1 text-xs text-gray-700">
            {Array.from({ length: 11 }, (_, i) => (
              <span key={i}>{8 + i}:00</span>
            ))}
          </div>
        </div>

        {/* Mobile Timeline (vertical) */}
        <div className="md:hidden relative border rounded-lg overflow-hidden bg-gray-100 max-w-2xl mx-auto h-[300px]">
          {/* Grid */}
          <div className="absolute inset-0 flex flex-col">
            {Array.from({ length: 11 }, (_, i) => (
              <div key={i} className="flex-1 border-t border-gray-300 relative"></div>
            ))}
          </div>

          {/* Booked meetings */}
          {meetings.map((m, idx) => {
            const start = new Date(m.startTime).getHours() + new Date(m.startTime).getMinutes() / 60;
            const end = new Date(m.endTime).getHours() + new Date(m.endTime).getMinutes() / 60;
            const totalHours = 11;
            const topPercent = ((start - 8) / totalHours) * 100;
            const heightPercent = ((end - start) / totalHours) * 100;

            return (
              <div
                key={idx}
                className="absolute left-0 w-full bg-blue-500"
                style={{ top: `${topPercent}%`, height: `${heightPercent}%` }}
              ></div>
            );
          })}

          {/* Time labels */}
          <div className="absolute left-0 top-0 flex flex-col justify-between h-full px-1 text-xs text-gray-700">
            {Array.from({ length: 11 }, (_, i) => (
              <span key={i}>{8 + i}:00</span>
            ))}
          </div>
        </div>

        {/* Centered Legend */}
        <div className="mt-4 flex justify-center space-x-6 items-center">
          <div className="w-6 h-6 bg-blue-500 rounded-sm"></div>
          <span>Booked</span>
          <div className="w-6 h-6 bg-gray-200 border border-gray-300 rounded-sm"></div>
          <span>Free</span>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default RoomInfo;
