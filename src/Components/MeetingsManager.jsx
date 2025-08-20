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

// Meeting Card Component
const MeetingCard = ({ meeting, onView, onEdit, isOrganized }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
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
            onMouseOver={(e) =>
              (e.target.style.backgroundColor = "#4A8A85")
            }
            onMouseOut={(e) =>
              (e.target.style.backgroundColor = "#539D98")
            }
          >
            <Edit className="h-4 w-4" />
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

// Main Meetings Dashboard Component
const MeetingsManager = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserMeetings();
  }, []);

  const fetchUserMeetings = async () => {
    try {
      setLoading(true);
      const userId =
        localStorage.getItem("userId") ||
        "CDB92B36-A923-4AAC-D7DE-08DDDBDAEEFE";

      const response = await axios.get(`/Users/${userId}`);
      setUserData(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch meetings. Please try again.");
      console.error("Error fetching meetings:", err);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: "#539D98" }}
          ></div>
          <p className="text-gray-600">Loading meetings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchUserMeetings}
            className="text-white px-6 py-2 rounded-md font-medium transition-colors"
            style={{ backgroundColor: "#539D98" }}
            onMouseOver={(e) =>
              (e.target.style.backgroundColor = "#4A8A85")
            }
            onMouseOut={(e) =>
              (e.target.style.backgroundColor = "#539D98")
            }
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Organized Meetings Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Users className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">
              My Organized Meetings
            </h2>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {userData?.organizedMeetings?.length || 0}
            </span>
          </div>

          {!userData?.organizedMeetings ||
          userData.organizedMeetings.length === 0 ? (
            <div className="bg-gray-100 rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No organized meetings
              </h3>
              <p className="text-gray-500">
                You haven't created any meetings yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userData.organizedMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onView={handleView}
                  onEdit={handleEdit}
                  isOrganized={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Invited Meetings Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="h-6 w-6 text-green-600" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Meetings I'm Invited To
            </h2>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {userData?.invitedMeetings?.length || 0}
            </span>
          </div>

          {!userData?.invitedMeetings ||
          userData.invitedMeetings.length === 0 ? (
            <div className="bg-gray-100 rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No meeting invitations
              </h3>
              <p className="text-gray-500">
                You haven't been invited to any meetings yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userData.invitedMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onView={handleView}
                  onEdit={null}
                  isOrganized={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchUserMeetings}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-md border border-gray-300 font-medium transition-colors"
          >
            Refresh Meetings
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingsManager;
