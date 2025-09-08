📅 Smart Space (Smart Meeting Room Frontend)

Smart Space serves as a React web app that incorporates the effective management of meetings. It allows users to schedule meetings, set action items, and even sends them pop-up notifications. This web frontend interfaces with the SmartMeetingRoomAPI backend to provide a complete solution for meeting management.


✨ Features:

🔐 User Authentication & Roles – Three user roles desenated with permissions:
   Admin: Admins have access to the panel, can manage users, and have access to the analytics overview.
   Employee: Responsible for arranging meetings, managing action items, and checking room availability.
   Guest: Very restricted access to join and view meetings along with some assigned tasks.
⚙️ Admin Panel – Specific user management, role allocation, and meetings data head user interface.
👤 User Profiles – Separate section with each user’s information along with customizable settings.
📈 Room Analytics – Keeping records of room occupancy, meeting room stats, and overall utilization.
📝 Meeting Notes – Notes and any documents to be shared only after the meeting has started.
🔁 Recurring meetings – Meetings can be scheduled to happen every day, week, or month.
🗓️ Rescheduling – Meeting details or time can be changed freely if done before the time set for the meeting.
🔔 Notifications – Dynamic meeting notifications along with action items and reschedules.
📆 Meeting Scheduling – Meetings can be created, viewed and managed easily.
📝 Action Items Tracking – Tasks associated with the meeting are assigned and monitored closely.


🛠️ Tech Stack

React – Frontend framework
Tailwind CSS – Styling and responsive layout
React Router – Client-side routing
React Icons – For consistent and customizable icons across the app
Axios – API communication
Vite – Fast development and build tool


⚙️ Setup Instructions

1- Clone the repository
   git clone https://github.com/your-username/smart-meeting-room-frontend.git
   cd smart-meeting-room-frontend
2- Install dependencies
   npm install
3- Start the development server
   npm run dev
4- Open the app in your browser 
   Visit http://localhost:5178


🔗 API Connection Details

This frontend is designed to work with the SmartMeetingRoomAPI backend, built with ASP.NET Core. 
For more details, check this repository:
https://github.com/jadan58/smart-meeting-room
