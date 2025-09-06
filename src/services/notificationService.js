import api from "../api/axiosInstance";

class NotificationService {
  constructor() {
    this.hasPermission = false;
    this.init();
  }

  async init() {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        this.hasPermission = true;
      } else if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        this.hasPermission = permission === "granted";
      }
    }
  }

  // Show browser notification
  showNotification(title, options = {}) {
    if (!this.hasPermission) return;

    const notification = new Notification(title, {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      ...options,
    });

    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);

    return notification;
  }

  // Send notification to specific user via API
  async sendNotification(userId, subject, body) {
    try {
      await api.post("/Notifications", {
        subject,
        body,
        userId,
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  }

  // Send notifications to multiple users
  async sendBulkNotifications(userIds, subject, body) {
    try {
      const promises = userIds.map((userId) =>
        this.sendNotification(userId, subject, body)
      );
      await Promise.all(promises);
    } catch (error) {
      console.error("Failed to send bulk notifications:", error);
    }
  }

  // Notification helpers for specific scenarios
  async notifyActionItemAssignment(assignedUserId, actionItem, meetingTitle) {
    const subject = "📋 New Action Item Assigned";
    const body = `You have been assigned a new action item: "${actionItem.description}" for meeting "${meetingTitle}"`;

    await this.sendNotification(assignedUserId, subject, body);
    this.showNotification(subject, { body, tag: "action-item-assignment" });
  }

  async notifyUserInvited(invitedUserId, meetingTitle, inviterEmail) {
    const subject = "📅 Meeting Invitation";
    const body = `You have been invited to "${meetingTitle}" by ${inviterEmail}`;

    await this.sendNotification(invitedUserId, subject, body);
    this.showNotification(subject, { body, tag: "meeting-invitation" });
  }

  async notifyNoteAdded(inviteeUserIds, meetingTitle, noteContent, authorEmail) {
    const subject = "📝 New Note Added";
    const body = `${authorEmail} added a note to "${meetingTitle}": "${noteContent.substring(
      0,
      100
    )}${noteContent.length > 100 ? "..." : ""}"`;

    await this.sendBulkNotifications(inviteeUserIds, subject, body);
    this.showNotification(subject, { body, tag: "note-added" });
  }

  async notifyMeetingUpdated(inviteeUserIds, meetingTitle, editorEmail) {
    const subject = "✏️ Meeting Updated";
    const body = `${editorEmail} updated the meeting: "${meetingTitle}"`;

    await this.sendBulkNotifications(inviteeUserIds, subject, body);
    this.showNotification(subject, { body, tag: "meeting-updated" });
  }

  // ✅ New: Notify users of uploaded files
  async notifyFilesUploaded(userIds, meetingTitle, fileNames) {
    if (!userIds || !userIds.length) return;

    const subject = "📤 New Files Uploaded";
    const body = `New file${fileNames.length > 1 ? "s" : ""} uploaded to "${meetingTitle}": ${fileNames.join(
      ", "
    )}`;

    try {
      await this.sendBulkNotifications(userIds, subject, body);
      this.showNotification(subject, { body, tag: "files-uploaded" });
    } catch (error) {
      console.error("Failed to send file upload notifications:", error);
    }
  }
}

export default new NotificationService();
