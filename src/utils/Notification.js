// NotificationService.js
import { notification } from "antd";

notification.config({
  placement: "topLeft", // Sets the placement to the top-left corner
  top: 50,             // Optional: Adjust the distance from the top
  duration: 1,         // Optional: Sets the duration of the notification
});
/**
 * Displays a notification with the specified type, title, and message.
 *
 * @param {"success" | "error" | "info" | "warning"} type - The type of the notification.
 * @param {string} title - The title of the notification.
 * @param {string} message - The message/content of the notification.
 */
export const showNotification = (type, title, message) => {
  notification[type]({
    message: title,
    description: message,
  });
};
