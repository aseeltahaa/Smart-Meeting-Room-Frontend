import React, { useState, useEffect, useMemo } from "react";

const MeetingHeatmap = () => {
  const [meetingData, setMeetingData] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "https://localhost:7074/api/Users/me/meetings/heatmap",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await res.json();
        setMeetingData(data);
      } catch (err) {
        console.error("Error fetching meeting heatmap data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const values = Object.values(meetingData);
    const totalMeetings = values.reduce((sum, count) => sum + count, 0);
    const activeDays = values.filter((count) => count > 0).length;
    const maxStreak = calculateMaxStreak(meetingData);
    const currentStreak = calculateCurrentStreak(meetingData);
    return { totalMeetings, activeDays, maxStreak, currentStreak };
  }, [meetingData]);

  function calculateMaxStreak(data) {
    const dates = Object.keys(data).sort();
    let maxStreak = 0,
      streak = 0;
    for (const d of dates) {
      if (data[d] > 0) streak++;
      else streak = 0;
      maxStreak = Math.max(maxStreak, streak);
    }
    return maxStreak;
  }

  function calculateCurrentStreak(data) {
    const dates = Object.keys(data).sort().reverse();
    let streak = 0;
    for (const d of dates) {
      if (data[d] > 0) streak++;
      else break;
    }
    return streak;
  }

  const getIntensity = (count) => {
    if (count === 0) return "bg-gray-100 dark:bg-gray-200";
    if (count <= 2) return "bg-blue-200 dark:bg-blue-900";
    if (count <= 4) return "bg-blue-400 dark:bg-blue-700";
    if (count <= 6) return "bg-blue-600 dark:bg-blue-500";
    return "bg-blue-800 dark:bg-blue-300";
  };

  // Generate fixed 4x7 grid per month
  const monthlyData = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const months = [];

    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);
      const daysInMonth = monthEnd.getDate();

      // Create 4x7 grid (4 columns, 7 rows)
      const grid = Array.from({ length: 7 }, () => Array(4).fill(null));

      let dayCounter = 1;
      for (let col = 0; col < 4; col++) {
        for (let row = 0; row < 7; row++) {
          if (dayCounter <= daysInMonth) {
            const date = new Date(year, month, dayCounter);
            const dateStr = date.toISOString().split("T")[0];
            grid[row][col] = {
              date: dateStr,
              count: meetingData[dateStr] || 0,
            };
            dayCounter++;
          }
        }
      }

      months.push({
        name: monthStart.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        shortName: monthStart.toLocaleDateString("en-US", { month: "short" }),
        grid, // 7 rows × 4 columns
      });
    }

    return months;
  }, [meetingData]);

  if (loading) return <div className="text-center py-10">Loading heatmap...</div>;

  return (
    <div className="flex justify-center my-6 px-3">
      <div className="p-3 sm:p-6 bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg shadow-lg w-full max-w-6xl">
        {/* Header Stats */}
        <div className="mb-4 sm:mb-6 flex justify-center">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-center">
            {[
              { value: stats.totalMeetings, label: "meetings attended" },
              { value: stats.activeDays, label: "active days" },
              { value: stats.maxStreak, label: "longest streak" },
              { value: stats.currentStreak, label: "current streak" },
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap */}
        <div className="flex justify-center overflow-x-auto overflow-y-hidden pb-2">
          <div className="inline-block">
            <div className="flex">
              {monthlyData.map((month, monthIndex) => (
                <div
                  key={monthIndex}
                  className="flex flex-col items-center mr-6 last:mr-0 flex-shrink-0"
                >
                  {/* Month label */}
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">
                    {month.shortName}
                  </div>

                  {/* 4x7 grid */}
                  <div className="flex gap-1">
                    {Array.from({ length: 4 }, (_, colIndex) => (
                      <div key={colIndex} className="flex flex-col gap-1">
                        {Array.from({ length: 7 }, (_, rowIndex) => {
                          const cell = month.grid[rowIndex][colIndex];
                          return cell ? (
                            <div
                              key={rowIndex}
                              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm transition-all active:scale-95 sm:hover:ring-2 sm:hover:ring-blue-300 sm:dark:hover:ring-blue-600 ${getIntensity(
                                cell.count
                              )}`}
                              title={`${cell.date}: ${cell.count} meetings`}
                            />
                          ) : (
                            <div
                              key={rowIndex}
                              className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                            ></div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-3 sm:mt-4 text-xs text-gray-600 dark:text-gray-400 gap-2 sm:gap-0">
          <div className="text-center sm:text-left">Past 12 months</div>
          <div className="flex items-center gap-2">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-gray-200 dark:bg-gray-200"></div>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-blue-200 dark:bg-blue-900"></div>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-blue-400 dark:bg-blue-700"></div>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-blue-600 dark:bg-blue-500"></div>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-blue-800 dark:bg-blue-300"></div>
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingHeatmap;
