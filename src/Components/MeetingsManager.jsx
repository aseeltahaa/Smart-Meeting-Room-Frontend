import React, { useState, useEffect, useMemo } from "react";
import {
  FaCalendarAlt as Calendar,
  FaClock as Clock,
  FaExclamationCircle as AlertCircle,
  FaCheck as Check,
  FaTimes as Times,
  FaEdit as Edit,
  FaEye as Eye,
  FaSearch as Search,
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
const MeetingCard = ({ meetingWrapper, isOrganized, isPending, onAccept, onDecline }) => {
  const { meeting, inviteId } = meetingWrapper;
  const navigate = useNavigate();

  const handleAction = (type) => {
    if (type === "view") navigate(`/meetings/${meeting?.id}/detailsView`);
    if (type === "edit") navigate(`/meetings/${meeting?.id}/details`);
  };

  const formatDate = (date) =>
    convertUTCToBeirut(date)?.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    }) || "";

  const formatTime = (date) =>
    convertUTCToBeirut(date)?.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }) || "";

  const statusClasses = {
    scheduled: "text-white bg-[#539D98]",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    default: "bg-gray-100 text-gray-800",
  };

  const statusClass = statusClasses[meeting?.status?.toLowerCase()] || statusClasses.default;

  return (
    <div className="bg-gray-100 rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{meeting?.title || "No Title"}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{meeting?.agenda || "No Agenda"}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${statusClass}`}>
          {meeting?.status || "Unknown"}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-600 text-sm">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{formatDate(meeting?.startTime)}</span>
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <Clock className="h-4 w-4 mr-2" />
          <span>
            {formatTime(meeting?.startTime)} - {formatTime(meeting?.endTime)}
          </span>
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <button
          onClick={() => handleAction("view")}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2"
        >
          <Eye className="h-4 w-4" /> View
        </button>

        {isOrganized && (
          <button
            onClick={() => handleAction("edit")}
            className="flex-1 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2"
            style={{ backgroundColor: "#539D98" }}
          >
            <Edit className="h-4 w-4" /> Edit
          </button>
        )}
      </div>

      {isPending && (
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={() => onAccept(meeting?.id, inviteId)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2"
          >
            <Check className="h-4 w-4" /> Accept
          </button>
          <button
            onClick={() => onDecline(meeting?.id, inviteId)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2"
          >
            <Times className="h-4 w-4" /> Decline
          </button>
        </div>
      )}
    </div>
  );
};

// Meetings Section Component with Pagination
const MeetingsSection = ({ title, meetings, page, setPage, isOrganized = false, isPending = false, onAccept, onDecline }) => {
  const pageSize = 3; // still used for Next button

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{meetings.length}</span>
      </div>

      {meetings.length === 0 ? (
        <div className="bg-gray-100 rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings</h3>
          <p className="text-gray-500">
            {isOrganized ? "You haven't created any meetings yet" : "You don't have any meetings here"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetings.map((m) => (
              <MeetingCard
                key={m.meeting?.id + (m.inviteId || "")}
                meetingWrapper={m}
                isOrganized={isOrganized}
                isPending={isPending}
                onAccept={onAccept}
                onDecline={onDecline}
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
              disabled={meetings.length < pageSize} // only disable if backend returned less than pageSize
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

// Main Meetings Manager
const MeetingsManager = () => {
  const [organizedMeetings, setOrganizedMeetings] = useState([]);
  const [acceptedInvites, setAcceptedInvites] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [previousMeetings, setPreviousMeetings] = useState([]);
  const [allMeetings, setAllMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [organizedPage, setOrganizedPage] = useState(1);
  const [acceptedPage, setAcceptedPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const [previousPage, setPreviousPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");

  const pageSize = 3;

  useEffect(() => {
    fetchAllSections();
    fetchAllMeetingsForSearch();
  }, [organizedPage, acceptedPage, pendingPage, previousPage]);

  const fetchAllSections = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchData(`/Users/me/meetings/organized`, setOrganizedMeetings, organizedPage),
        fetchData(`/Users/me/invites/accepted`, setAcceptedInvites, acceptedPage),
        fetchData(`/Users/me/invites/pending`, setPendingInvites, pendingPage),
        fetchData(`/Users/me/meetings/previous/all`, setPreviousMeetings, previousPage),
      ]);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load meetings.");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (endpoint, setter, page) => {
    const res = await axios.get(`${endpoint}?page=${page}&pageSize=${pageSize}`);
    setter(res.data || []);
  };

  const fetchAllMeetingsForSearch = async () => {
    try {
      const res = await axios.get("/Users/me/meetings/all");
      setAllMeetings(res.data || []);
    } catch (err) {
      console.error("Failed to fetch all meetings for search:", err);
    }
  };

  const handleAccept = async (meetingId, inviteId) => {
    try {
      await axios.put(`/Meeting/${meetingId}/invitees/${inviteId}/accept`);
      fetchAllSections();
      fetchAllMeetingsForSearch();
    } catch (err) {
      console.error("Failed to accept invite:", err);
    }
  };

  const handleDecline = async (meetingId, inviteId) => {
    try {
      await axios.put(`/Meeting/${meetingId}/invitees/${inviteId}/decline`);
      fetchAllSections();
      fetchAllMeetingsForSearch();
    } catch (err) {
      console.error("Failed to decline invite:", err);
    }
  };

  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    return allMeetings.filter((m) => {
      const title = m.meeting?.title || "";
      const agenda = m.meeting?.agenda || "";
      return title.toLowerCase().includes(searchTerm.toLowerCase()) || agenda.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [searchTerm, allMeetings]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: "#539D98" }}></div>
          <p className="text-gray-600">Loading meetings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchAllSections}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-md font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md w-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Search Results Section */}
        {searchTerm && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Search Results</h2>
            {searchResults.length === 0 ? (
              <p className="text-gray-500">No meetings found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((m) => (
                  <MeetingCard
                    key={m.meeting?.id + (m.inviteId || "")}
                    meetingWrapper={m}
                    isOrganized={m.type === "organized"}
                    isPending={m.type === "invitee" && (m.status || "").toLowerCase() === "pending"}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sections with Pagination */}
        <MeetingsSection title="My Organized Meetings" meetings={organizedMeetings.map((m) => ({ meeting: m }))} page={organizedPage} setPage={setOrganizedPage} isOrganized />
        <MeetingsSection title="Accepted Meeting Invites" meetings={acceptedInvites} page={acceptedPage} setPage={setAcceptedPage} />
        <MeetingsSection title="Pending Meeting Invites" meetings={pendingInvites} page={pendingPage} setPage={setPendingPage} isPending onAccept={handleAccept} onDecline={handleDecline} />
        <MeetingsSection title="Previous Meetings" meetings={previousMeetings.map((m) => ({ meeting: m.meeting }))} page={previousPage} setPage={setPreviousPage} isOrganized />
      </div>
    </div>
  );
};

export default MeetingsManager;
