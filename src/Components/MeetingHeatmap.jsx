import React, { useState, useMemo } from "react";

const MeetingHeatmap = () => {
  // Generate fake data for the past year
  const generateFakeData = () => {
    const data = {};
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    // Start from the beginning of the week that contains one year ago
    const startDate = new Date(oneYearAgo);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      const meetingCount = Math.random() < 0.3 ? 0 : Math.floor(Math.random() * 8) + 1;
      data[dateStr] = meetingCount;
    }

    return data;
  };

  const [meetingData] = useState(generateFakeData());

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
    let maxStreak = 0;
    let currentStreak = 0;

    for (const date of dates) {
      if (data[date] > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return maxStreak;
  }

  function calculateCurrentStreak(data) {
    const dates = Object.keys(data).sort().reverse();
    let streak = 0;

    for (const date of dates) {
      if (data[date] > 0) streak++;
      else break;
    }

    return streak;
  }

  // Get color intensity based on meeting count
  const getIntensity = (count) => {
    if (count === 0) return "bg-gray-100 dark:bg-gray-800";
    if (count <= 2) return "bg-blue-200 dark:bg-blue-900";
    if (count <= 4) return "bg-blue-400 dark:bg-blue-700";
    if (count <= 6) return "bg-blue-600 dark:bg-blue-500";
    return "bg-blue-800 dark:bg-blue-300";
  };

  // Generate grid data organized by months
  const generateMonthlyGrid = () => {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    const months = [];
    let currentDate = new Date(oneYearAgo);
    currentDate.setDate(1);

    while (currentDate <= today) {
      const monthStart = new Date(currentDate);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      if (monthEnd > today) monthEnd.setTime(today.getTime());

      const firstDay = new Date(monthStart);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - startDate.getDay());

      const lastDay = new Date(monthEnd);
      const endDate = new Date(lastDay);
      endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

      const weeks = [];
      let currentWeek = [];

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        const dayOfWeek = d.getDay();
        const isCurrentMonth = d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();

        currentWeek.push({
          date: dateStr,
          count: isCurrentMonth ? meetingData[dateStr] || 0 : 0,
          dayOfWeek,
          isCurrentMonth,
        });

        if (dayOfWeek === 6) {
          weeks.push([...currentWeek]);
          currentWeek = [];
        }
      }
      if (currentWeek.length > 0) weeks.push([...currentWeek]);

      months.push({
        name: currentDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        shortName: currentDate.toLocaleDateString("en-US", { month: "short" }),
        weeks,
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return months;
  };

  const monthlyData = generateMonthlyGrid();

  return (
    <div className="flex justify-center my-6 px-3">
      <div className="p-3 sm:p-6 bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg shadow-lg w-full max-w-6xl">
        {/* Header Stats */}
        <div className="mb-4 sm:mb-6 flex justify-center">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-center">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalMeetings}</div>
              <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">meetings attended</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.activeDays}</div>
              <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">active days</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.maxStreak}</div>
              <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">longest streak</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.currentStreak}</div>
              <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">current streak</div>
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="overflow-x-auto overflow-y-hidden pb-2">
          <div className="inline-block min-w-full">
            {/* Month labels */}
            <div className="flex mb-1 sm:mb-2">
              <div className="w-6 sm:w-8 flex-shrink-0"></div>
              {monthlyData.map((month, monthIndex) => {
                const monthWidth = month.weeks.length * (12 + 4);
                return (
                  <div
                    key={monthIndex}
                    className="flex-shrink-0 text-xs text-gray-600 dark:text-gray-400 text-left px-1"
                    style={{ width: monthWidth + "px" }}
                  >
                    {month.shortName}
                  </div>
                );
              })}
            </div>

            <div className="flex">
              {/* Day labels */}
              <div className="flex flex-col mr-1 sm:mr-2 flex-shrink-0">
                {["", "M", "", "W", "", "F", ""].map((day, index) => (
                  <div
                    key={index}
                    className="h-2.5 sm:h-3 mb-1 text-xs text-gray-600 dark:text-gray-400 leading-3 w-4 sm:w-6"
                  >
                    <span className="hidden sm:inline">
                      {["", "Mon", "", "Wed", "", "Fri", ""][index]}
                    </span>
                    <span className="sm:hidden">{day}</span>
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="flex">
                {monthlyData.map((month, monthIndex) => (
                  <div key={monthIndex} className="flex gap-1 mr-1 sm:mr-2">
                    {month.weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-1">
                        {Array.from({ length: 7 }, (_, dayIndex) => {
                          const day = week.find((d) => d.dayOfWeek === dayIndex);
                          const isVisible = day && day.isCurrentMonth;
                          return (
                            <div
                              key={dayIndex}
                              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm transition-all active:scale-95 sm:hover:ring-2 sm:hover:ring-blue-300 sm:dark:hover:ring-blue-600 ${
                                isVisible ? getIntensity(day.count) : "bg-gray-100 dark:bg-gray-800 opacity-30"
                              }`}
                              title={isVisible ? `${day.date}: ${day.count} meetings` : ""}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-3 sm:mt-4 text-xs text-gray-600 dark:text-gray-400 gap-2 sm:gap-0">
          <div className="text-center sm:text-left">Past 12 months</div>
          <div className="flex items-center gap-2">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-gray-100 dark:bg-gray-800"></div>
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
