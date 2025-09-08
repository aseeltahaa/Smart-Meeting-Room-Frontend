# 📅 Smart Space (Smart Meeting Room Frontend)

**Smart Space** is a React web application for managing meetings efficiently. It allows users to schedule meetings, set action items, and receive real-time notifications. This frontend interfaces with the **SmartMeetingRoomAPI backend** to provide a complete solution for meeting management.

---

## ✨ Features

- 🔐 **User Authentication & Roles** – Three user roles with designated permissions:  
  - **Admin**: Access to the admin panel, manage users, rooms, and features.  
  - **Employee**: Schedule meetings, manage and view minutes of meeting, and check room availability.  
  - **Guest**: Limited access to join/view meetings and assigned tasks.  

- ⚙️ **Admin Panel** – Manage users, roles, rooms, and features through a dedicated interface.  
- 👤 **User Profiles** – Personalized profiles with user information, analytics, meetings dashboard, and customizable settings.  
- 📈 **Room Analytics** – Track room usage, meeting statistics, and overall utilization.
- 📆 **Meeting Scheduling** – Easily create, view, and manage meetings.    
- 📝 **Meeting Notes and Attachments** – Notes and documents accessible by meeting attendees.  
- 🔁 **Recurring Meetings** – Schedule meetings to repeat daily, weekly, or monthly.  
- 🗓️ **Rescheduling** – Update meeting details or time before the meeting starts.  
- 🔔 **Notifications** – Real-time alerts for meetings, action items, and reschedules.  
- 📝 **Action Items Tracking** – Assign and monitor tasks linked to meetings, **includes**: submissions, attachments, and judgment.
  
---

## 🛠️ Tech Stack

- **React** – Frontend framework  
- **Tailwind CSS** – Styling and responsive layout  
- **React Router** – Client-side routing  
- **React Icons** – Consistent and customizable icons  
- **Axios** – API communication  
- **Vite** – Fast development and build tool  

---

## ⚙️ Setup Instructions

1. **Clone the repository**  
   ```bash
   git clone https://github.com/your-username/smart-meeting-room-frontend.git
   cd smart-meeting-room-frontend
2. **Install dependencies**
   ```bash
   npm install
3. **Start the development server**
   ```bash
   npm run dev
4. **Open the app in your browser**
   Visit http://localhost:5178

---

## 🔗 API Connection Details

This frontend is designed to work with the SmartMeetingRoomAPI backend, built with ASP.NET Core. 
For more details, check this repository:
https://github.com/jadan58/smart-meeting-room
