import { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import notificationService from "../services/notificationService";

export default function MeetingFileUpload({ meetingId }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingMeeting, setFetchingMeeting] = useState(true);
  const [meetingData, setMeetingData] = useState(null);

  const maxFiles = 5;
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf", ".docx", ".xlsx", ".txt"];
  const maxSize = 5 * 1024 * 1024; // 5MB
  const baseUrl = "https://localhost:7074"; // backend base URL

  // Fetch meeting details and attachments
  useEffect(() => {
    const fetchMeetingData = async () => {
      if (!meetingId) return;
      try {
        const { data } = await api.get(`/Meeting/${meetingId}`);
        setMeetingData(data);

        if (data.attachmentUrls && Array.isArray(data.attachmentUrls)) {
          setExistingAttachments(
            data.attachmentUrls.map(url => {
              const fileName = url.split("/").pop();
              return { name: fileName };
            })
          );
        }
      } catch (error) {
        console.error("Failed to fetch meeting data:", error);
      } finally {
        setFetchingMeeting(false);
      }
    };

    fetchMeetingData();
  }, [meetingId]);

  const getFileIcon = (fileName) => {
    const ext = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
    const iconMap = {
      ".pdf": "📄",
      ".docx": "📝",
      ".doc": "📝",
      ".xlsx": "📊",
      ".xls": "📊",
      ".txt": "📄",
      ".jpg": "🖼️",
      ".jpeg": "🖼️",
      ".png": "🖼️",
      ".gif": "🖼️"
    };
    return iconMap[ext] || "📎";
  };

  const handleAttachmentClick = async (attachment) => {
    try {
      const response = await api.get(`/files/meetings/${meetingId}/${attachment.name}`, {
        responseType: "blob", // get the file as blob
      });

      // Create a temporary URL for the blob
      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute("download", attachment.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(fileURL);
    } catch (err) {
      console.error("Failed to download file:", err);
      alert("You are not authorized to view this file or it failed to load.");
    }
  };

  const validateFiles = (filesArray) => {
    return filesArray.filter(file => {
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        alert(`Invalid file type: ${file.name}`);
        return false;
      }
      if (file.size > maxSize) {
        alert(`File too large (max 5MB): ${file.name}`);
        return false;
      }
      return true;
    });
  };

  const handleFiles = (filesArray) => {
    const validFiles = validateFiles(filesArray);
    setSelectedFiles(prev => [...prev, ...validFiles].slice(0, maxFiles));
  };

  const handleInputChange = (e) => {
    handleFiles(Array.from(e.target.files));
    e.target.value = null;
  };

  const handleRemove = (index) => setSelectedFiles(prev => prev.filter((_, i) => i !== index));

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleSubmit = async () => {
    if (!selectedFiles.length) return alert("Please select files before submitting.");
    setLoading(true);

    const formData = new FormData();
    selectedFiles.forEach(file => formData.append("files", file));

    try {
      await api.post(`/Meeting/${meetingId}/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Files uploaded successfully!");
      setSelectedFiles([]);

      // Refresh attachments
      const { data: refreshedData } = await api.get(`/Meeting/${meetingId}`);
      setExistingAttachments(
        refreshedData.attachmentUrls.map(url => {
          const fileName = url.split("/").pop();
          return { name: fileName };
        })
      );

      // 🔔 Send notifications
      if (meetingData && meetingData.invitees) {
        const inviteeUserIds = meetingData.invitees.map(i => i.userId).filter(Boolean);
        if (inviteeUserIds.length > 0) {
          await notificationService.notifyFilesUploaded(
            inviteeUserIds,
            meetingData.title || "Meeting",
            selectedFiles.map(f => f.name)
          );
          console.log("✅ File upload notifications sent");
        }
      }

    } catch (err) {
      console.error(err);
      alert(err?.response?.data || err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Existing Attachments */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            📎 Meeting Attachments
            {fetchingMeeting && <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>}
          </h2>
        </div>
        <div className="p-6">
          {fetchingMeeting ? (
            <p className="text-gray-500 text-center">Loading attachments...</p>
          ) : existingAttachments.length > 0 ? (
            <div className="grid gap-3">
              {existingAttachments.map((attachment, idx) => (
                <div
                  key={idx}
                  onClick={() => handleAttachmentClick(attachment)}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{getFileIcon(attachment.name)}</span>
                    <span className="text-sm font-medium text-gray-900 truncate">{attachment.name}</span>
                  </div>
                  <span className="text-blue-600 font-medium text-xs">Download</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No attachments found for this meeting</p>
          )}
        </div>
      </div>

      {/* Upload New Files */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <h2 className="text-xl font-bold text-gray-800">📤 Upload New Attachments</h2>
        </div>
        <div className="p-6 space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <div className="text-4xl mb-2">☁️</div>
            <p className="text-gray-600 font-medium">Drag & drop files here, or click to select</p>
            <p className="text-sm text-gray-500 mt-1">Maximum 5 files, 5MB each</p>
            <input
              id="fileInput"
              type="file"
              multiple
              onChange={handleInputChange}
              className="hidden"
              accept={allowedExtensions.join(",")}
            />
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{getFileIcon(file.name)}</span>
                    <span className="text-sm font-medium text-gray-900 truncate">{file.name}</span>
                  </div>
                  <button onClick={() => handleRemove(idx)} className="text-red-500 font-bold">✕</button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || selectedFiles.length === 0}
            className={`w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium ${
              loading || selectedFiles.length === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {loading ? "Uploading..." : `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
