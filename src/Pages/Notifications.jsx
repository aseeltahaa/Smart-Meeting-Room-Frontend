import React, { useState, useEffect } from "react";
import {
  FaBell,
  FaEllipsisV,
  FaCheck,
  FaTimes,
  FaCircle,
  FaInbox,
} from "react-icons/fa";
import axios from "../api/axiosInstance";
import Header from "../Components/Header";

// Individual Notification Card Component
const NotificationCard = ({ notification, onMarkRead, onMarkUnread, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  const formatTimestamp = (dateString) => {
    if (!dateString) return "";
    // Normalize and parse UTC date
    const normalized = dateString.includes(".") ? dateString.split(".")[0] + "Z" : dateString;
    const utcDate = new Date(normalized);
    if (isNaN(utcDate.getTime())) return "";
    // Convert to Beirut time (+3 hours)
    const beirutDate = new Date(utcDate.getTime() + 3 * 60 * 60 * 1000);
    // Get current time in Beirut
    const nowUtc = new Date();
    const nowBeirut = new Date(nowUtc.getTime() + 3 * 60 * 60 * 1000);
    const diffInMinutes = Math.floor((nowBeirut - beirutDate) / (1000 * 60));

    if (diffInMinutes < 1 && diffInMinutes >= 0) return "Just now";
    if (diffInMinutes < 60 && diffInMinutes >= 1) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440 && diffInMinutes >= 60) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return beirutDate.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 relative ${
        !notification.isRead ? "bg-blue-50 border-blue-200" : ""
      }`}
    >
      {/* Actions - always top right */}
  <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
        <button
          onClick={() => setShowActions(!showActions)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          aria-label="Show actions"
        >
          <FaEllipsisV className="w-3 h-3 text-gray-400" />
        </button>
        {showActions && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)}></div>
            <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-20 w-40 sm:w-44">
              {!notification.isRead ? (
                <button
                  onClick={() => {
                    onMarkRead(notification.id);
                    setShowActions(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FaCheck className="w-4 h-4 mr-3 text-[#539D98]" />
                  Mark as read
                </button>
              ) : (
                <button
                  onClick={() => {
                    onMarkUnread(notification.id);
                    setShowActions(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FaBell className="w-4 h-4 mr-3 text-[#539D98]" />
                  Mark as unread
                </button>
              )}
              <button
                onClick={() => {
                  onDelete(notification.id);
                  setShowActions(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <FaTimes className="w-4 h-4 mr-3" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
      {/* ...existing card content... */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div className="flex items-start sm:items-center space-x-4 flex-1">
          <div className="flex-shrink-0 mt-1">
            <div className={`p-2 rounded-full ${!notification.isRead ? "bg-[#539D98]" : "bg-gray-400"}`}>
              <FaBell className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-2 gap-2 flex-wrap">
              <h3 className={`text-base font-semibold ${!notification.isRead ? "text-gray-900" : "text-gray-700"} flex items-center gap-2`}>
                {notification.subject}
                {!notification.isRead && <FaCircle className="inline-block w-2 h-2 text-red-500 ml-2" />}
                <span className="text-xs text-gray-500 ml-2">{formatTimestamp(notification.date)}</span>
              </h3>
            </div>
            <p className={`text-sm ${!notification.isRead ? "text-gray-800" : "text-gray-600"} leading-relaxed`}>
              {notification.body}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notifications List Component
const NotificationsList = ({ notifications, onMarkRead, onMarkUnread, onDelete }) => {
  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
        <div className="p-4 rounded-full bg-gray-100 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <FaInbox className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
        <p className="text-gray-600">You have no new notifications at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onMarkRead={onMarkRead}
          onMarkUnread={onMarkUnread}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

// Main Notifications Component
const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("/Notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/Notifications/mark-as-read/${id}`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      window.dispatchEvent(new Event("notifications-updated"));
    } catch (err) {
      console.error(err);
    }
  };

  const markAsUnread = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)));
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`/Notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    try {
      await Promise.all(unreadNotifications.map((n) => axios.put(`/Notifications/mark-as-read/${n.id}`)));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading notifications...</div>;
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center text-red-600">
      <p>{error}</p>
      <button onClick={fetchNotifications} className="mt-4 bg-[#539D98] hover:bg-[#437e79] text-white px-6 py-3 rounded-md">Try Again</button>
    </div>
  );

  return (
    <>
      <Header showGradient={false} />
      <div className="min-h-screen bg-white py-6 sm:py-8 w-full overflow-x-hidden">
        <div className="mx-auto w-full max-w-4xl px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4 sm:gap-0">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-3 rounded-full bg-[#539D98] flex-shrink-0">
                <FaBell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notifications</h1>
                {unreadCount > 0 && (
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">
                    You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-0">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[#539D98] hover:text-[#437e79] font-medium transition-colors duration-300 text-lg sm:text-xl"
                  >
                    Mark all as read
                  </button>
                )}
                <button
                  onClick={fetchNotifications}
                  className="border-none rounded-full py-3 px-5 text-lg cursor-pointer bg-[#539D98] hover:bg-[#437e79] transition-colors duration-300 ease-in-out text-white"
                >
                  Refresh
                </button>
            </div>
          </div>
          <NotificationsList
            notifications={notifications}
            onMarkRead={markAsRead}
            onMarkUnread={markAsUnread}
            onDelete={deleteNotification}
          />
        </div>
      </div>
    </>
  );
};

export default Notifications;
