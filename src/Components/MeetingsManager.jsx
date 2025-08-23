import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt as Calendar,
  FaClock as Clock,
  FaEdit as Edit,
  FaEye as Eye,
  FaUsers as Users,
  FaMapMarkerAlt as MapPin,
  FaExclamationCircle as AlertCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";

// Convert UTC → Beirut time
const convertUTCToBeirut = (utcString) => {
  if (!utcString) return null;
  const utcDate = new Date(utcString);
  const beirutOffset = 3 * 60; // +3 hours
  return new Date(utcDate.getTime() + beirutOffset * 60 * 1000);
};

// Meeting Card Component
const MeetingCard = ({ meeting, onView, onEdit, isOrganized }) => {
  const formatDate = (dateString) => {
    const beirutDate = convertUTCToBeirut(dateString);
    return beirutDate
      ? beirutDate.toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "";
  };

  const formatTime = (dateString) => {
    const beirutDate = convertUTCToBeirut(dateString);
    return beirutDate
      ? beirutDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "text-white";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusStyle = (status) => {
    if (status.toLowerCase() === "scheduled") {
      return { backgroundColor: "#539D98", color: "white" };
    }
    return {};
  };

  return (
    <div className="bg-gray-100 rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {meeting.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">{meeting.agenda}</p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${getStatusColor(
            meeting.status
          )}`}
          style={getStatusStyle(meeting.status)}
        >
          {meeting.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-600 text-sm">
          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{formatDate(meeting.startTime)}</span>
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>
            {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
          </span>
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <button
          onClick={() => onView(meeting.id)}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Eye className="h-4 w-4" />
          View
        </button>
        {isOrganized && (
          <button
            onClick={() => onEdit(meeting.id)}
            className="flex-1 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
            style={{ backgroundColor: "#539D98" }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#4A8A85")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#539D98")}
          >
            <Edit className="h-4 w-4" />
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

// Main Meetings Manager Component
const MeetingsManager = () => {
  const [userData, setUserData] = useState(null);
  const [organizedMeetings, setOrganizedMeetings] = useState([]);
  const [invitedMeetings, setInvitedMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [organizedPage, setOrganizedPage] = useState(1);
  const [invitedPage, setInvitedPage] = useState(1);
  const pageSize = 3;

  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData) {
      fetchOrganizedMeetings();
      fetchInvitedMeetings();
    }
  }, [userData, organizedPage, invitedPage]);

  // Fetch user info
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/Users/me");
      setUserData(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch user info.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch organized meetings
  const fetchOrganizedMeetings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `/Users/me/meetings/organized?page=${organizedPage}&pageSize=${pageSize}`
      );
      const now = new Date();
      const upcoming = res.data
        .filter((m) => new Date(m.startTime) >= now)
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      setOrganizedMeetings(upcoming);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch organized meetings.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch invited meetings
  const fetchInvitedMeetings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `/Users/me/meetings/invited?page=${invitedPage}&pageSize=${pageSize}`
      );
      const now = new Date();
      const upcoming = res.data
        .filter((m) => new Date(m.startTime) >= now)
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      setInvitedMeetings(upcoming);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch invited meetings.");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (meetingId) => {
    navigate(`/meetings/view/${meetingId}`);
  };

  const handleEdit = (meetingId) => {
    navigate(`/meetings/edit/${meetingId}`);
  };

  return loading ? (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
          style={{ borderColor: "#539D98" }}
        ></div>
        <p className="text-gray-600">Loading meetings...</p>
      </div>
    </div>
  ) : error ? (
    <div className="min-h-screen flex items-center justify-center text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-red-600 mb-4">{error}</p>
      <button
        onClick={() => {
          fetchUserData();
          fetchOrganizedMeetings();
          fetchInvitedMeetings();
        }}
        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-md font-medium"
      >
        Try Again
      </button>
    </div>
  ) : (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Info */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            {userData?.firstName} {userData?.lastName}
          </h1>
          <p className="text-gray-600">Roles: {userData?.roles?.join(", ")}</p>
        </div>

        {/* Organized Meetings Section */}
        <MeetingsSection
          title="My Organized Meetings"
          icon={Users}
          meetings={organizedMeetings}
          page={organizedPage}
          setPage={setOrganizedPage}
          handleView={handleView}
          handleEdit={handleEdit}
          isOrganized
        />

        {/* Invited Meetings Section */}
        <MeetingsSection
          title="Meetings I'm Invited To"
          icon={MapPin}
          meetings={invitedMeetings}
          page={invitedPage}
          setPage={setInvitedPage}
          handleView={handleView}
          handleEdit={null}
          isOrganized={false}
        />
      </div>
    </div>
  );
};

// Reusable section component
const MeetingsSection = ({
  title,
  icon: Icon,
  meetings,
  page,
  setPage,
  handleView,
  handleEdit,
  isOrganized,
}) => {
  const pageSize = 3;

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <Icon className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {meetings.length}
        </span>
      </div>

      {meetings.length === 0 ? (
        <div className="bg-gray-100 rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No meetings
          </h3>
          <p className="text-gray-500">
            {isOrganized ? "You haven't created any meetings yet" : "You haven't been invited to any meetings yet"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onView={handleView}
                onEdit={handleEdit}
                isOrganized={isOrganized}
              />
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setPage(Math.max(page - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={meetings.length < pageSize}
              className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MeetingsManager;
