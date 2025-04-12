// Function to refresh the token
const refreshAccessToken = async () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
        const refreshToken = localStorage.getItem("refreshToken"); // Retrieve refresh token
        const response = await fetch(`${apiUrl}/api/token/refresh/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const newAccessToken = data.access;
        localStorage.setItem("accessToken", newAccessToken); // Save new token
        localStorage.setItem("refreshToken",data.refresh)
        return newAccessToken;
    } catch (error) {
        console.error("Refresh token failed:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login"; // Redirect to login
    }
};

// Fetch interceptor to handle expired tokens
const fetchWithAuth = async (url, options = {}) => {
    const accessToken = localStorage.getItem("accessToken");
    options.headers = {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
    };

    const response = await fetch(url, options);

    if (response.status === 401) {
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
            options.headers.Authorization = `Bearer ${newAccessToken}`;
            return fetch(url, options); // Retry the failed request
        }
    }

    return response;
};

export { refreshAccessToken, fetchWithAuth };

