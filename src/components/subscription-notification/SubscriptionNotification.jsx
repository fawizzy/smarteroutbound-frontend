import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const SubscriptionNotification = () => {
  const [notification, setNotification] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const subscriptionStatus = urlParams.get("subscription");
    
    if (subscriptionStatus === "success") {
      setNotification({
        type: "success",
        message: "Your subscription was successful! Thank you for your purchase.",
      });
      setVisible(true);
      
      // Clean up the URL without affecting navigation
      const url = new URL(window.location);
      url.searchParams.delete("subscription");
      window.history.replaceState({}, document.title, url);
    } else if (subscriptionStatus === "cancelled") {
      setNotification({
        type: "info",
        message: "Your subscription process was cancelled.",
      });
      setVisible(true);
      
      // Clean up the URL without affecting navigation
      const url = new URL(window.location);
      url.searchParams.delete("subscription");
      window.history.replaceState({}, document.title, url);
    }
  }, []);

  const closeNotification = () => {
    setVisible(false);
  };

  if (!visible || !notification) return null;

  return (
    <div className={`fixed top-4 right-4 w-96 p-4 rounded-lg shadow-lg ${
      notification.type === "success" 
        ? "bg-green-100 border border-green-400 text-green-800" 
        : "bg-blue-100 border border-blue-400 text-blue-800"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="font-medium">{notification.message}</div>
        </div>
        <button 
          onClick={closeNotification} 
          className="ml-4 text-gray-600 hover:text-gray-800"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default SubscriptionNotification;