import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "../api/axiosInstance";
import ViewHeader from "../Components/ViewHeader.jsx";

/**
 * Utilities
 */
const formatBeirut = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  // Use Intl timezone conversion (handles DST automatically)
  return new Date(d.toLocaleString("en-US", { timeZone: "Asia/Beirut" }));
};

const formatDateTime = (iso, fallback = "N/A") => {
  const dt = formatBeirut(iso);
  return dt ? dt.toLocaleString() : fallback;
};

const getFileInfo = (url = "") => {
  const fileName = url.split("/").pop() || "unknown";
  const extension = (fileName.split(".").pop() || "file").toLowerCase();
  const iconMap = {
    pdf: "📄", doc: "📝", docx: "📝",
    jpg: "🖼️", jpeg: "🖼️", png: "🖼️", gif: "🖼️", webp: "🖼️",
    mp4: "🎥", mov: "🎥", avi: "🎥",
    mp3: "🎵", wav: "🎵",
    zip: "📦", rar: "📦",
    txt: "📃", csv: "📊", xlsx: "📊", xls: "📊"
  };
  return { fileName, extension, icon: iconMap[extension] || "📎" };
};

const BASE_URL = "https://localhost:7074"; // Centralize base URL for attachments

export default function MeetingDetailsView() {
  const { id } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch meeting by id
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`/Meeting/${id}`);
        if (active) setMeeting(res.data);
      } catch (err) {
        console.error("Failed to fetch meeting:", err);
        if (active) setError("Failed to load meeting.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  // Open an attachment in a new tab/window
  const handleAttachmentClick = useCallback((attachmentUrl) => {
    if (!attachmentUrl) return;
    const full = `${BASE_URL}${attachmentUrl}`;
    window.open(full, "_blank", "noopener,noreferrer");
  }, []);

  // Download a single attachment (blob first, then fallback)
  // Replace your previous handleDownload with this one
const handleDownload = useCallback(async (attachmentUrl, e) => {
  e?.stopPropagation();
  if (!attachmentUrl || !meeting) return;

  const fileName = attachmentUrl.split("/").pop() || "download";

  try {
    const response = await axios.get(`/files/meetings/${meeting.id}/${fileName}`, {
      responseType: "blob",
    });

    const blob = new Blob([response.data]);
    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error("Download failed:", err);
    alert("You are not authorized to view this file or it failed to load.");
  }
}, [meeting]);


  // Create a human-readable summary that includes EVERYTHING from GetMeetingById
  const summary = useMemo(() => {
    if (!meeting) return "";

    const lines = [];
    lines.push(`Title: ${meeting.title ?? "N/A"}`);
    lines.push(`Status: ${meeting.status ?? "N/A"}`);
    lines.push(`Meeting ID: ${meeting.id ?? "N/A"}`);
    lines.push(`Room ID: ${meeting.roomId ?? "N/A"}`);
    lines.push(`Organizer (User ID): ${meeting.userId ?? "N/A"}`);
    lines.push(`Recurring Booking ID: ${meeting.recurringBookingId ?? "None"}`);
    lines.push(`Start: ${formatDateTime(meeting.startTime)}`);
    lines.push(`End: ${formatDateTime(meeting.endTime)}`);
    lines.push(`Created: ${formatDateTime(meeting.createdAt)}`);
    lines.push(`Updated: ${formatDateTime(meeting.updatedAt)}`);

    lines.push("");
    lines.push("Agenda:");
    lines.push(`• ${meeting.agenda?.trim() || "No agenda provided"}`);

    // Invitees
    lines.push("");
    lines.push(`Invitees (${meeting.invitees?.length || 0}):`);
    if (meeting.invitees?.length) {
      meeting.invitees.forEach((inv, idx) => {
        lines.push(`• ${idx + 1}. ${inv.email || "(no email)"} — Status: ${inv.status || "N/A"}, Attendance: ${inv.attendance || "N/A"}`);
      });
    } else {
      lines.push("• None");
    }

    // Notes
    lines.push("");
    lines.push(`Notes (${meeting.notes?.length || 0}):`);
    if (meeting.notes?.length) {
      meeting.notes.forEach((n, idx) => {
        const content = typeof n === "string" ? n : (n?.content || n?.text || "(no content)");
        const created = n?.createdAt ? ` — ${formatDateTime(n.createdAt)}` : "";
        lines.push(`• ${idx + 1}. ${content}${created}`);
      });
    } else {
      lines.push("• None");
    }

    // Action Items
    lines.push("");
    lines.push(`Action Items (${meeting.actionItems?.length || 0}):`);
    if (meeting.actionItems?.length) {
      meeting.actionItems.forEach((item, idx) => {
        if (typeof item === "string") {
          lines.push(`• ${idx + 1}. ${item}`);
        } else {
          const desc = item?.description || item?.title || "(no description)";
          const assignee = item?.assignee ? ` — Assignee: ${item.assignee}` : "";
          const due = item?.dueDate ? ` — Due: ${formatDateTime(item.dueDate)}` : "";
          const st = item?.status ? ` — Status: ${item.status}` : "";
          lines.push(`• ${idx + 1}. ${desc}${assignee}${due}${st}`);
        }
      });
    } else {
      lines.push("• None");
    }

    // Attachments (mention count only in summary per request)
    lines.push("");
    lines.push(`Attachments: ${meeting.attachmentUrls?.length || 0} file(s)`);

    return lines.join("\n");
  }, [meeting]);

  // PDF export (includes the same complete summary + a separate detailed listing)
  const generatePDFSummary = useCallback(async () => {
    if (!meeting) return;

    const loadAndCreate = () => createPDF(meeting, summary);

    if (!window.jspdf) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.onload = loadAndCreate;
      script.onerror = () => alert("Failed to load PDF library. Try again.");
      document.head.appendChild(script);
    } else {
      loadAndCreate();
    }
  }, [meeting, summary]);

  const copySummary = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(summary);
      alert("Summary copied to clipboard.");
    } catch (err) {
      console.error("Copy failed:", err);
      // Fallback: create a hidden textarea
      const ta = document.createElement("textarea");
      ta.value = summary;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      alert("Summary copied to clipboard.");
    }
  }, [summary]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;
  if (!meeting) return <p className="text-center mt-10">Meeting not found</p>;

  return (
    <>
      <ViewHeader meetingId={id} />
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900">{meeting.title}</h1>

        {/* Start & End */}
        <div className="text-gray-700 text-lg space-y-1">
          <p><strong>Start:</strong> {formatDateTime(meeting.startTime)}</p>
          <p><strong>End:</strong> {formatDateTime(meeting.endTime)}</p>
        </div>

        {/* Status & Meta */}
        <div className="grid md:grid-cols-2 gap-4 text-gray-800">
          <div>
            <p><span className="font-semibold">Status:</span> {meeting.status || "N/A"}</p>
            <p><span className="font-semibold">Meeting ID:</span> {meeting.id}</p>
            <p><span className="font-semibold">Room ID:</span> {meeting.roomId || "N/A"}</p>
          </div>
          <div>
            <p><span className="font-semibold">Organizer (User ID):</span> {meeting.userId || "N/A"}</p>
            <p><span className="font-semibold">Recurring Booking ID:</span> {meeting.recurringBookingId ?? "None"}</p>
          </div>
        </div>

        {/* Agenda */}
        <div className="text-gray-800 text-lg">
          <h2 className="font-semibold mb-2">Agenda</h2>
          <p>{meeting.agenda || "No agenda provided"}</p>
        </div>

        {/* Invitees */}
        <div className="text-gray-800 text-lg">
          <h2 className="font-semibold mb-2">Invitees</h2>
          {meeting.invitees?.length ? (
            <ul className="list-disc list-inside space-y-1">
              {meeting.invitees.map(inv => (
                <li key={inv.id} className="flex flex-wrap gap-x-2">
                  <span>{inv.email || "(no email)"}</span>
                  <span className="text-gray-500">— Status: {inv.status || "N/A"}, Attendance: {inv.attendance || "N/A"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No invitees</p>
          )}
        </div>

        {/* Summary (always visible) */}
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-xl">Summary</h2>
            <div className="flex items-center gap-2">
              <button onClick={copySummary} className="px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-sm">Copy</button>
              <button onClick={generatePDFSummary} className="px-3 py-1.5 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm hover:from-purple-700 hover:to-blue-700">Export PDF</button>
            </div>
          </div>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-gray-800">{summary}</pre>
        </div>

        {/* Attachments gallery */}
        <div className="text-gray-800">
          <h2 className="font-semibold text-2xl mb-4 text-gray-900">📎 Attachments</h2>
          {meeting.attachmentUrls?.length ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {meeting.attachmentUrls.map((url, index) => {
                  const fileInfo = getFileInfo(url);
                  return (
                    <div
                      key={index}
                      onClick={() => handleAttachmentClick(url)}
                      className="group bg-white border-2 border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-400 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ease-in-out"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl group-hover:scale-110 transition-transform duration-200">
                          {fileInfo.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
                            {fileInfo.fileName}
                          </p>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            {fileInfo.extension} file
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 group-hover:bg-blue-100 group-hover:text-blue-800">
                          {fileInfo.extension.toUpperCase()}
                        </span>
                        <button
                          onClick={(e) => handleDownload(url, e)}
                          className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600 transition-colors duration-200 opacity-100"
                          title="Download file"
                        >
                          ⬇
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Download All */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={async () => {
                    for (let i = 0; i < meeting.attachmentUrls.length; i++) {
                      await handleDownload(meeting.attachmentUrls[i]);
                      if (i < meeting.attachmentUrls.length - 1) {
                        await new Promise(r => setTimeout(r, 400));
                      }
                    }
                  }}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors duration-200 space-x-2"
                >
                  <span>Download All ({meeting.attachmentUrls.length})</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <div className="text-4xl mb-4">📎</div>
              <p className="text-gray-500 text-lg">No attachments available</p>
              <p className="text-gray-400 text-sm">Files attached to this meeting will appear here</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/**
 * PDF creation helper
 */
function createPDF(meeting, summary) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 20;
  const lh = 8;
  const margin = 20;
  const pageH = doc.internal.pageSize.height;
  const maxW = doc.internal.pageSize.width - margin * 2;

  const add = (text, size = 12, bold = false) => {
    if (y > pageH - margin) { doc.addPage(); y = margin; }
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    const lines = doc.splitTextToSize(String(text || ""), maxW);
    if (y + lines.length * lh > pageH - margin) { doc.addPage(); y = margin; }
    lines.forEach(line => { doc.text(line, margin, y); y += lh; });
  };

  const space = (s = 5) => { y += s; if (y > pageH - margin) { doc.addPage(); y = margin; } };

  // Title
  add("MEETING SUMMARY REPORT", 18, true);
  space(6);

  // Quick info
  add(`Title: ${meeting.title || "N/A"}`);
  add(`Status: ${meeting.status || "N/A"}`);
  add(`Start: ${formatDateTime(meeting.startTime)}`);
  add(`End: ${formatDateTime(meeting.endTime)}`);
  add(`Created: ${formatDateTime(meeting.createdAt)}`);
  add(`Updated: ${formatDateTime(meeting.updatedAt)}`);
  add(`Meeting ID: ${meeting.id || "N/A"}`);
  add(`Room ID: ${meeting.roomId || "N/A"}`);
  add(`Organizer (User ID): ${meeting.userId || "N/A"}`);
  add(`Recurring Booking ID: ${meeting.recurringBookingId ?? "None"}`);

  space(8);
  add("AGENDA", 14, true);
  space(2);
  add(meeting.agenda || "No agenda provided");

  space(8);
  add("INVITEES", 14, true);
  space(2);
  if (meeting.invitees?.length) {
    meeting.invitees.forEach((inv, i) => add(`${i + 1}. ${inv.email || "(no email)"} — Status: ${inv.status || "N/A"}, Attendance: ${inv.attendance || "N/A"}`));
  } else {
    add("None");
  }

  space(8);
  add("NOTES", 14, true);
  space(2);
  if (meeting.notes?.length) {
    meeting.notes.forEach((n, i) => {
      const content = typeof n === "string" ? n : (n?.content || n?.text || "(no content)");
      const created = n?.createdAt ? ` — ${formatDateTime(n.createdAt)}` : "";
      add(`${i + 1}. ${content}${created}`);
    });
  } else {
    add("None");
  }

  space(8);
  add("ACTION ITEMS", 14, true);
  space(2);
  if (meeting.actionItems?.length) {
    meeting.actionItems.forEach((item, i) => {
      if (typeof item === "string") add(`${i + 1}. ${item}`);
      else {
        const desc = item?.description || item?.title || "(no description)";
        const assignee = item?.assignee ? ` — Assignee: ${item.assignee}` : "";
        const due = item?.dueDate ? ` — Due: ${formatDateTime(item.dueDate)}` : "";
        const st = item?.status ? ` — Status: ${item.status}` : "";
        add(`${i + 1}. ${desc}${assignee}${due}${st}`);
      }
    });
  } else {
    add("None");
  }

  space(8);
  add(`Attachments: ${meeting.attachmentUrls?.length || 0} file(s)`);

  space(10);
  add("FULL TEXT SUMMARY", 14, true);
  space(2);
  add(summary);

  space(10);
  add(`Generated on: ${new Date().toLocaleString()}`, 10);

  const sanitizedTitle = (meeting.title || "Meeting").replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_");
  doc.save(`Meeting_Summary_${sanitizedTitle}_${new Date().toISOString().split("T")[0]}.pdf`);
}
