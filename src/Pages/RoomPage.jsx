import React, { useState, useEffect } from 'react';

function RoomPage({ roomId }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meetings, setMeetings] = useState([]);
  const [roomDetails, setRoomDetails] = useState({ name: '', capacity: 0, features: [] });

  // Fetch room info
  useEffect(() => {
    fetch(`/api/rooms/${roomId}`)
      .then(res => res.json())
      .then(data => setRoomDetails(data));
  }, [roomId]);

  // Fetch meetings for selected date
  useEffect(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    fetch(`/api/rooms/${roomId}/meetings?date=${dateStr}`)
      .then(res => res.json())
      .then(data => setMeetings(data));
  }, [roomId, selectedDate]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{roomDetails.name}</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Book This Room
        </button>
      </header>

      {/* Room Info */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <p><strong>Capacity:</strong> {roomDetails.capacity}</p>
        <p><strong>Features:</strong> {roomDetails.features.join(', ')}</p>
      </div>

      {/* Date Picker */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">Select Date:</label>
        <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={e => setSelectedDate(new Date(e.target.value))}
          className="border rounded px-2 py-1"
        />
      </div>

      {/* Meeting Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {meetings.length === 0 ? (
          <p className="col-span-full text-gray-500">No meetings scheduled for this date.</p>
        ) : (
          meetings.map(meeting => (
            <div key={meeting.id} className="p-4 border rounded shadow hover:shadow-md transition">
              <p className="font-bold">{meeting.title}</p>
              <p>{meeting.startTime} - {meeting.endTime}</p>
              <p className="text-gray-600">{meeting.organizer}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RoomPage;
