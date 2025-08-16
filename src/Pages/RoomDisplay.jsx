import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Components/Header';
import Card from '../Components/Card';
import Footer from '../Components/Footer';
import RoomImage from '../assets/room.jpg'; // fallback image

// Import all room images
import Room101 from '../assets/rooms/room101.jpg';
import Room102 from '../assets/rooms/room102.jpg';
import Room201 from '../assets/rooms/room201.jpg';
import Room202 from '../assets/rooms/room202.jpg';
import Room301 from '../assets/rooms/room301.jpg';
import Room302 from '../assets/rooms/room302.jpg';
import Room401 from '../assets/rooms/room401.jpg';

// Map room names to images
const roomImages = {
  'Room 101': Room101,
  'Room 102': Room102,
  'Room 201': Room201,
  'Room 202': Room202,
  'Room 301': Room301,
  'Room 302': Room302,
  'Room 401': Room401,
};

function RoomDisplay() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setError('No token found. Please log in.');
      setLoading(false);
      return;
    }

    fetch('https://localhost:7074/api/Room', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setRooms(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching rooms:', err);
        setError('Failed to fetch rooms.');
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Header showSearchBar={true} showGradient={false} />
      <section className="mt-[-60px] mb-16 sm:mb-24 lg:mb-32">
        <div className="p-4 sm:p-8 flex items-center justify-center">
          {loading ? (
            <p>Loading rooms...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
              {rooms.map((room) => (
                <Link to={`/room/${room.id}`} key={room.id}>
                  <Card
                    title={room.name}
                    description={`Capacity: ${room.capacity}, Location: ${room.location}`}
                    imageSrc={roomImages[room.name] || RoomImage} // fallback
                    imageAlt={room.name}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}

export default RoomDisplay;
