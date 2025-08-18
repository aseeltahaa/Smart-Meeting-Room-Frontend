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
  const [meetingsLoading, setMeetingsLoading] = useState(false);

  // Fetch room info
  useEffect(() => {
    const fetchRoomInfo = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const roomResponse = await fetch(`https://localhost:7074/api/Room/${roomId}`, {
          headers: { 
            'Authorization': `Bearer ${token}`, 
            'Accept': 'application/json' 
          },
        });

        if (!roomResponse.ok) {
          throw new Error(`Failed to fetch room: ${roomResponse.status}`);
        }

        const roomData = await roomResponse.json();
        setRoom(roomData);

        // Fetch features if they exist
        if (roomData.featureIds && roomData.featureIds.length > 0) {
          const featurePromises = roomData.featureIds.map(async (id) => {
            try {
              const featureResponse = await fetch(`https://localhost:7074/api/Features/${id}`, {
                headers: { 
                  'Authorization': `Bearer ${token}`, 
                  'Accept': 'application/json' 
                },
              });
              return featureResponse.ok ? await featureResponse.json() : null;
            } catch (err) {
              console.error(`Error fetching feature ${id}:`, err);
              return null;
            }
          });

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

  // Fetch meetings for selected date
  useEffect(() => {
    const fetchMeetings = async () => {
      if (!roomId) return;
      
      setMeetingsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found for fetching meetings');
        setMeetingsLoading(false);
        return;
      }

      try {
        const response = await fetch('https://localhost:7074/api/Meeting', {
          headers: { 
            'Authorization': `Bearer ${token}`, 
            'Accept': 'application/json' 
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch meetings: ${response.status}`);
        }

        const allMeetings = await response.json();
        
        // Filter meetings for this room and selected date
        const roomMeetings = allMeetings.filter(meeting => {
          const meetingDate = new Date(meeting.startTime);
          const selectedDateStr = selectedDate.toDateString();
          const meetingDateStr = meetingDate.toDateString();
          
          return meeting.roomId.toLowerCase() === roomId.toLowerCase() && 
                 meetingDateStr === selectedDateStr;
        });

        setMeetings(roomMeetings);
        console.log('Filtered meetings for room and date:', roomMeetings);
      } catch (err) {
        console.error('Error fetching meetings:', err);
        // Don't set error state here as it's not critical for room display
      } finally {
        setMeetingsLoading(false);
      }
    };

    fetchMeetings();
  }, [roomId, selectedDate]);

  const addMeeting = (newMeeting) => {
    // Only add if it's for the selected date to refresh the timeline
    const meetingDate = new Date(newMeeting.startTime);
    if (meetingDate.toDateString() === selectedDate.toDateString()) {
      setMeetings(prev => {
        // Check if meeting already exists to avoid duplicates
        const exists = prev.some(m => m.id === newMeeting.id);
        if (!exists) {
          return [...prev, newMeeting];
        }
        return prev;
      });
    }
  };

  // Timeline rendering logic - only show blue divs for booked times
  const renderTimelineSlots = (meetings) => {
    return meetings.map((meeting, idx) => {
      const start = new Date(meeting.startTime);
      const end = new Date(meeting.endTime);
      const startHour = start.getHours() + start.getMinutes() / 60;
      const endHour = end.getHours() + end.getMinutes() / 60;
      
      // Timeline spans from 8 AM to 7 PM (12 hours)
      const totalHours = 12;
      const startTime = 8; // 8 AM
      
      // Calculate position and size
      const leftPercent = Math.max(0, ((startHour - startTime) / totalHours) * 100);
      const rightPercent = Math.min(100, ((endHour - startTime) / totalHours) * 100);
      const widthPercent = rightPercent - leftPercent;
      
      // Only show blue div if meeting is within timeline range and room is booked
      if (startHour >= startTime && startHour < startTime + totalHours && widthPercent > 0) {
        return (
          <div 
            key={`meeting-${idx}-${meeting.id || idx}`} 
            className="absolute top-0 h-full bg-blue-500"
            style={{ 
              left: `${leftPercent}%`, 
              width: `${Math.max(widthPercent, 0.5)}%` // Minimum 0.5% width for visibility
            }}
            title={`Booked: ${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
          />
        );
      }
      return null;
    });
  };

  const renderMobileTimelineSlots = (meetings) => {
    return meetings.map((meeting, idx) => {
      const start = new Date(meeting.startTime);
      const end = new Date(meeting.endTime);
      const startHour = start.getHours() + start.getMinutes() / 60;
      const endHour = end.getHours() + end.getMinutes() / 60;
      
      const totalHours = 12;
      const startTime = 8;
      
      const topPercent = Math.max(0, ((startHour - startTime) / totalHours) * 100);
      const bottomPercent = Math.min(100, ((endHour - startTime) / totalHours) * 100);
      const heightPercent = bottomPercent - topPercent;
      
      // Only show blue div if meeting is within timeline range and room is booked
      if (startHour >= startTime && startHour < startTime + totalHours && heightPercent > 0) {
        return (
          <div 
            key={`mobile-meeting-${idx}-${meeting.id || idx}`} 
            className="absolute left-0 w-full bg-blue-500"
            style={{ 
              top: `${topPercent}%`, 
              height: `${Math.max(heightPercent, 1)}%` // Minimum 1% height for visibility
            }}
            title={`Booked: ${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
          />
        );
      }
      return null;
    });
  };

  if (loading) return <div className="flex justify-center items-center h-64"><p>Loading room info...</p></div>;
  if (error) return <div className="flex justify-center items-center h-64"><p className="text-red-500">{error}</p></div>;

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="relative md:h-[689px] h-[450px] w-full flex items-center justify-center" style={{ overflow: 'hidden', top: '-140px' }}>
        <div className="absolute inset-0 w-full h-full">
          <div className="bg-black absolute inset-0 z-10 opacity-50"></div>
          <img src={roomImages[room?.name] || RoomImage} alt={room?.name} className="w-full h-full object-cover absolute inset-0"/>
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

      {/* Timeline Section */}
      <section className="mt-12 px-6">
        <h2 className="text-lg sm:text-2xl font-bold mb-4 flex flex-col sm:flex-row justify-center items-center gap-2 w-full">
          <span className="block mb-2 sm:mb-0 text-base sm:text-xl">Timeline for</span>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={e => setSelectedDate(new Date(e.target.value))}
            className="border px-2 py-1 rounded w-full sm:w-auto text-sm sm:text-base"
          />
          {meetingsLoading && <span className="text-sm text-gray-500">Loading...</span>}
        </h2>

        {/* Desktop Timeline */}
        <div className="hidden md:block relative border rounded-lg overflow-hidden bg-gray-100 max-w-5xl mx-auto h-20">
          {/* Hour markers */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="flex-1 border-l border-gray-300 relative first:border-l-0"></div>
            ))}
          </div>
          
          {/* Meeting slots */}
          {renderTimelineSlots(meetings)}
          
          {/* Hour labels */}
          <div className="absolute bottom-0 left-0 w-full flex justify-between px-1 text-xs text-gray-700">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} className="text-center" style={{width: `${100/12}%`}}>
                {8 + i}:00
              </span>
            ))}
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="md:hidden relative border rounded-lg overflow-hidden bg-gray-100 max-w-2xl mx-auto h-[300px]">
          {/* Hour markers */}
          <div className="absolute inset-0 flex flex-col">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="flex-1 border-t border-gray-300 relative first:border-t-0"></div>
            ))}
          </div>
          
          {/* Meeting slots */}
          {renderMobileTimelineSlots(meetings)}
          
          {/* Hour labels */}
          <div className="absolute left-0 top-0 flex flex-col justify-between h-full py-1 text-xs text-gray-700">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} className="text-center" style={{height: `${100/12}%`, display: 'flex', alignItems: 'center'}}>
                {8 + i}:00
              </span>
            ))}
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

      <Footer />
    </>
  );
}

export default RoomInfo;