import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Components/Header';
import Card from '../Components/Card';
import Footer from '../Components/Footer';
import DefaultRoomImage from '../assets/room.jpg'; // fallback

function RoomDisplay() {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
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
        const roomList = Array.isArray(data) ? data : [];
        setRooms(roomList);
        setFilteredRooms(roomList);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching rooms:', err);
        setError('Failed to fetch rooms.');
        setLoading(false);
      });
  }, []);

  const handleSearch = (query) => {
    const filtered = rooms.filter(room =>
      room.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredRooms(filtered);
  };

  return (
    <>
      <Header showSearchBar={true} showGradient={false} onSearch={handleSearch} />

      <section className="mt-[-60px] mb-16 sm:mb-24 lg:mb-32">
        <div className="p-4 sm:p-8 flex flex-col items-center justify-center">
          {loading ? (
            <p>Loading rooms...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : filteredRooms.length === 0 ? (
            <p>No rooms found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full mt-4">
              {filteredRooms.map((room) => {
                const imageSrc = room.imageUrl
                  ? `https://localhost:7074${room.imageUrl}`
                  : DefaultRoomImage;
                return (
                  <Link to={`/room/${room.id}`} key={room.id}>
                    <Card
                      title={room.name}
                      description={`Capacity: ${room.capacity}, Location: ${room.location}`}
                      imageSrc={imageSrc}
                      imageAlt={room.name}
                    />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}

export default RoomDisplay;
