const CODE_REVIEW_NOTI = "CODE_REVIEW_NOTI";

const createNotifications = () => {
  const config = {
    type: "basic",
    iconUrl: "../images/icon-128.png",
    title: "Track time clickup",
    message: "Please start your tracking time",
    priority: 1,
    requireInteraction: true,
  };
  return {
    show: false,
    create() {
      if (this.show) return;
      chrome.notifications.create(CODE_REVIEW_NOTI, {
        ...config,
      });
      chrome.notifications.onClosed.addListener(() => {
        this.show = false;
      });
      this.show = true;
    },
  };
};

export const Notifications = createNotifications();
