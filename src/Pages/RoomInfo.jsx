import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import RoomImage from '../assets/room.jpg'; // fallback image

// Optional: hardcoded images
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found. Please log in.');
      setLoading(false);
      return;
    }

    // Fetch room info first
    fetch(`https://localhost:7074/api/Room/${roomId}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(async (data) => {
        setRoom(data);

        const featurePromises = data.featureIds.map(id =>
          fetch(`https://localhost:7074/api/Features/${id}`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
          })
            .then(res => res.ok ? res.json() : null)
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

  if (loading) return <p>Loading room info...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      <Header showGradient={false} />
      <section className="p-8 max-w-4xl mx-auto h-[75vh] flex flex-col justify-center">
        <h1 className="text-3xl font-bold mb-4">{room.name}</h1>
        <img
          src={roomImages[room.name] || RoomImage}
          alt={room.name}
          className="w-full h-64 object-cover mb-4 rounded-lg"
        />
        <p><strong>Capacity:</strong> {room.capacity}</p>
        <p><strong>Location:</strong> {room.location}</p>
        <p><strong>Features:</strong> {features.join(', ') || 'None'}</p>
      </section>
      <div style={{ height: '30vh' }}></div>
      <Footer />
    </>
  );
}

export default RoomInfo;
