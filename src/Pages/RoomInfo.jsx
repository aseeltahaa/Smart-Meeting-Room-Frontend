import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import RoomImage from '../assets/room.jpg';

// Hardcoded room images
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

// BookingForm component
function BookingForm({ roomId, selectedDate, setSelectedDate, meetings, addMeeting }) {
  const [formData, setFormData] = useState({
    title: '',
    agenda: '',
    date: selectedDate.toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    status: 'Scheduled',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Update form date when selectedDate changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      date: selectedDate.toISOString().split('T')[0]
    }));
  }, [selectedDate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'date') {
      setSelectedDate(new Date(e.target.value));
    }
  };

  const validateTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return false;
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return start < end;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found. Please log in.');
      setLoading(false);
      return;
    }

    // Validate time range
    if (!validateTimeRange(formData.startTime, formData.endTime)) {
      setError('End time must be after start time.');
      setLoading(false);
      return;
    }

    try {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

      // Overlap check
      const overlap = meetings.some(m => {
        const mStart = new Date(m.startTime);
        const mEnd = new Date(m.endTime);
        return startDateTime < mEnd && endDateTime > mStart;
      });

      if (overlap) {
        setError('Selected time overlaps with an existing meeting.');
        setLoading(false);
        return;
      }

      const res = await fetch('https://localhost:7074/api/Meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          agenda: formData.agenda,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          status: formData.status,
          roomId: roomId,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to create booking: ${res.status} ${errorText}`);
      }
      
      const data = await res.json();

      // Update timeline immediately
      addMeeting(data);

      setSuccess('Meeting booked successfully!');
      setFormData({ 
        title: '', 
        agenda: '', 
        date: formData.date, 
        startTime: '', 
        endTime: '', 
        status: 'Scheduled' 
      });
    } catch (err) {
      setError(err.message);
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input 
        type="text" 
        name="title" 
        placeholder="Meeting Title" 
        value={formData.title} 
        onChange={handleChange} 
        required 
        className="border p-2 rounded"
      />
      <textarea 
        name="agenda" 
        placeholder="Agenda" 
        value={formData.agenda} 
        onChange={handleChange} 
        required 
        className="border p-2 rounded"
      />
      <input 
        type="date" 
        name="date" 
        value={formData.date} 
        onChange={handleChange} 
        required 
        className="border p-2 rounded"
      />
      <div className="flex gap-2">
        <input
          type="time"
          name="startTime"
          placeholder="Start Time"
          value={formData.startTime}
          onChange={handleChange}
          required
          className="border p-2 rounded flex-1"
        />
        <input
          type="time"
          name="endTime"
          placeholder="End Time"
          value={formData.endTime}
          onChange={handleChange}
          required
          className="border p-2 rounded flex-1"
        />
      </div>
      <button 
        type="submit" 
        disabled={loading} 
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
      >
        {loading ? 'Booking...' : 'Book Room'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
    </form>
  );
}

function RoomInfo() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Form state
  const [formData, setFormData] = useState({ title: '', agenda: '', startTime: '', endTime: '' });
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Convert UTC → Beirut time
  const convertUTCToBeirut = (utcString) => {
    if (!utcString) return null;
    const utcDate = new Date(utcString);
    const beirutOffset = 3 * 60; // +3 hours
    return new Date(utcDate.getTime() + beirutOffset * 60 * 1000);
  };

  // Fetch room info
  useEffect(() => {
    const fetchRoomInfo = async () => {
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
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching room info:', err);
        setError(`Failed to fetch room info: ${err.message}`);
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoomInfo();
    }
  }, [roomId]);

  // Fetch meetings for the room and selected date
  const fetchMeetings = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('https://localhost:7074/api/Meeting', {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const roomMeetings = data
          .filter(m => m.roomId.toLowerCase() === roomId.toLowerCase())
          .filter(m => {
            const meetingStart = convertUTCToBeirut(m.startTime);
            const meetingEnd = convertUTCToBeirut(m.endTime);
            return meetingEnd >= startOfDay && meetingStart <= endOfDay;
          })
          .map(m => ({
            ...m,
            startBeirut: convertUTCToBeirut(m.startTime),
            endBeirut: convertUTCToBeirut(m.endTime),
          }));

        setMeetings(roomMeetings);
      })
      .catch(err => console.error('Error fetching meetings:', err));
  };

  useEffect(() => {
    fetchMeetings();
  }, [roomId, selectedDate]);

  // Booking form submission
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError(null);
    setBookingSuccess(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setBookingError('You must be logged in to book a meeting.');
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      setBookingError('Start and End times are required.');
      return;
    }

    const startUTC = new Date(`${selectedDate.toISOString().split('T')[0]}T${formData.startTime}`).toISOString();
    const endUTC = new Date(`${selectedDate.toISOString().split('T')[0]}T${formData.endTime}`).toISOString();

    const body = {
      title: formData.title || 'Untitled',
      agenda: formData.agenda || '',
      startTime: startUTC,
      endTime: endUTC,
      status: 'Scheduled',
      roomId: roomId
    };

    try {
      const res = await fetch('https://localhost:7074/api/Meeting', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to book meeting.');
      }

      await res.json();
      setBookingSuccess('Meeting booked successfully!');
      setFormData({ title: '', agenda: '', startTime: '', endTime: '' });

      fetchMeetings(); // Refresh timeline
    } catch (err) {
      setBookingError(err.message);
    }
  };

  if (loading) return <p>Loading room info...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      <Header />

      {/* Main Section */}
      <section className="relative md:h-[689px] h-[450px] w-full flex items-center justify-center" style={{ overflow: 'hidden', top: '-140px' }}>
        <div className="absolute inset-0 w-full h-full">
          <div className="bg-black absolute inset-0 z-10 opacity-50"></div>
          <img src={roomImages[room?.name] || RoomImage} alt={room?.name} className="w-full h-full object-cover absolute inset-0" />
        </div>
        <div className="relative z-20 text-center text-white px-6 py-12 flex flex-col items-center justify-center mt-10 pt-20">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">{room?.name}</h1>
          <div className="text-lg md:text-2xl space-y-4">
            <p><strong>Capacity:</strong> {room?.capacity}</p>
            <p><strong>Location:</strong> {room?.location}</p>
            <p><strong>Features:</strong> {features.join(', ') || 'None'}</p>
          </div>
        </div>
      </section>

      <h1 className='text-[36px] sm:text-[60px] font-bold text-center text-[#111827] mb-10'>
        Book a Meeting
      </h1>

      {/* Date Input */}
      <section className="mt-8 px-6 max-w-xl mx-auto flex flex-col sm:flex-row justify-center items-center gap-4">
        <label className="flex flex-col sm:flex-row items-center gap-2">
          Select Date:
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={e => setSelectedDate(new Date(e.target.value))}
            className="border px-2 py-1 rounded"
          />
        </label>
      </section>

      {/* Timeline Section */}
      <section className="mt-4 px-6">
        {/* Desktop Timeline */}
        <div className="hidden md:block relative border rounded-lg overflow-hidden bg-gray-100 max-w-5xl mx-auto h-20">
          <div className="absolute inset-0 flex">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="flex-1 border-l border-gray-300 relative first:border-l-0"></div>
            ))}
          </div>
          {meetings.map((m, idx) => {
            const start = m.startBeirut.getHours() + m.startBeirut.getMinutes() / 60;
            const end = m.endBeirut.getHours() + m.endBeirut.getMinutes() / 60;
            const totalHours = 11;
            const leftPercent = ((start - 8) / totalHours) * 100;
            const widthPercent = ((end - start) / totalHours) * 100;
            return <div key={idx} className="absolute top-0 h-full bg-blue-500" style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}></div>;
          })}
          <div className="absolute bottom-0 left-0 w-full flex justify-between px-1 text-xs text-gray-700">
            {Array.from({ length: 11 }, (_, i) => <span key={i}>{8 + i}:00</span>)}
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="md:hidden relative border rounded-lg overflow-hidden bg-gray-100 max-w-2xl mx-auto h-[300px]">
          <div className="absolute inset-0 flex flex-col">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="flex-1 border-t border-gray-300 relative first:border-t-0"></div>
            ))}
          </div>
          {meetings.map((m, idx) => {
            const start = m.startBeirut.getHours() + m.startBeirut.getMinutes() / 60;
            const end = m.endBeirut.getHours() + m.endBeirut.getMinutes() / 60;
            const totalHours = 11;
            const topPercent = ((start - 8) / totalHours) * 100;
            const heightPercent = ((end - start) / totalHours) * 100;
            return <div key={idx} className="absolute left-0 w-full bg-blue-500" style={{ top: `${topPercent}%`, height: `${heightPercent}%` }}></div>;
          })}
          <div className="absolute left-0 top-0 flex flex-col justify-between h-full px-1 text-xs text-gray-700">
            {Array.from({ length: 11 }, (_, i) => <span key={i}>{8 + i}:00</span>)}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex justify-center space-x-6 items-center">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded-sm"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-200 border border-gray-300 rounded-sm"></div>
            <span>Free</span>
          </div>
        </div>

        {/* Booking Form */}
        <div className="mt-8 max-w-xl mx-auto">
          <h3 className="text-xl font-bold mb-4">Book this Room</h3>
          <BookingForm 
            roomId={roomId} 
            selectedDate={selectedDate} 
            setSelectedDate={setSelectedDate} 
            meetings={meetings} 
            addMeeting={addMeeting}
          />
        </div>
      </section>

      {/* Booking Form */}
      <section className="mt-8 px-6 max-w-xl mx-auto p-4 rounded-lg pb-20">
        {bookingError && <p className="text-red-500 mb-2">{bookingError}</p>}
        {bookingSuccess && <p className="text-green-500 mb-2">{bookingSuccess}</p>}

        <form className="flex flex-col gap-3" onSubmit={handleBookingSubmit}>
          <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="border px-2 py-1 rounded" />
          <input type="text" placeholder="Agenda" value={formData.agenda} onChange={e => setFormData({ ...formData, agenda: e.target.value })} className="border px-2 py-1 rounded" />
          <label className="flex flex-col">Start Time:
            <input type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} className="border px-2 py-1 rounded" />
          </label>
          <label className="flex flex-col">End Time:
            <input type="time" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} className="border px-2 py-1 rounded" />
          </label>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">Book Meeting</button>
        </form>
      </section>

      <Footer />
    </>
  );
}

export default RoomInfo;