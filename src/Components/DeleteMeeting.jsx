import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "../api/axiosInstance";

function DeleteMeeting({ meetingId }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleDelete = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this meeting?");
        if (!confirmed) return;

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("You must be logged in to delete a meeting.");
                setLoading(false);
                return;
            }

            await axios.delete(`/Meeting/${meetingId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate('/profile');
        } catch (err) {
            console.error('Failed to delete meeting:', err);
            setError("Failed to delete meeting. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <button
                onClick={handleDelete}
                className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
            >
                {loading ? "Deleting..." : "Delete Meeting"}
            </button>
        </>
    );
}

export default DeleteMeeting;
