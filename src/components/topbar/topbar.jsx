import React from "react";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import { fetchWithAuth } from "../../utils/api";

const Topbar = () => {
  const refresh = localStorage.getItem("refreshToken");
  const apiUrl = import.meta.env.VITE_API_URL;

  const logout = () => {
    fetchWithAuth(`${apiUrl}/api/logout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh,
      }),
    })
      .then((response) => {
        if (response.ok) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("is_admin")
          window.location.href = "/login";
        } else {
          // Handle errors
          console.error("Logout failed");
        }
      })
      .catch((error) => {
        console.error("An error occurred:", error);
      });
  };

  const goToHome = () => {
    window.location.href = "/";
  };

  return (
    <nav
      id="topbar"
      className="bg-blue-500 border-gray-200 relative w-full px-4 py-3 nav-sticky rounded-tl-lg rounded-tr-lg"
    >
      <div className="max-w-[1400px] flex justify-between items-center">
        {/* Smarteroutbound Logo/Text on the left */}
        <div
          onClick={goToHome}
          className="font-bold text-xl text-white cursor-pointer"
        >
          Smarteroutbound
        </div>

        {/* Logout Icon on the right */}
        <button
          className="flex items-center text-white text-sm justify-center p-2 rounded-full hover:bg-gray-100 gap-2"
          aria-label="Logout"
          onClick={logout}
        >
          Logout
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
        </button>
      </div>
    </nav>
  );
};

export default Topbar;
