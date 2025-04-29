import React, { useState } from "react";
import logo from "../../assets/images/logo.svg";

const LoginPage = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Reset error message
    setLoading(true); // Start loading
    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      const response = await fetch(`${apiUrl}/api/signin/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("is_admin", data.is_admin);
      const is_admin = data.is_admin;
      if (is_admin) {
        window.location.href = "/admin-dashboard";
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Invalid email or password");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div
      data-layout-mode="light"
      data-sidebar-size="default"
      data-theme-layout="vertical"
      className="bg-gray-100 dark:bg-gray-900 bg-[url('https://smarteroutbound.com/404/')] dark:bg-[url('https://smarteroutbound.com/404/')]"
    >
      <div className="relative flex flex-col justify-center min-h-screen overflow-hidden">
        <div className="w-full m-auto bg-white dark:bg-slate-800/60 rounded shadow-lg ring-2 ring-slate-300/50 dark:ring-slate-700/50 lg:max-w-md">
          <div className="text-center p-6 bg-slate-900 rounded-t">
            <a href="/">
              <img src={logo} alt="Logo" className="w-14 h-14 mx-auto mb-2" />
            </a>
            <h3 className="font-semibold text-white text-xl mb-1">
              Let's Get Started Smarteroutbound
            </h3>
            <p className="text-xs text-slate-400">
              Sign in to continue to Smarteroutbound.
            </p>
          </div>

          <form className="p-6" onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="text-red-500 text-center text-sm mb-4">
                {errorMessage}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="font-medium text-sm text-slate-600 dark:text-slate-400"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                className="form-input w-full rounded-md mt-1 border border-slate-300/60 dark:border-slate-700 dark:text-slate-300 bg-transparent px-3 py-1 focus:outline-none focus:ring-0 placeholder:text-slate-400/70 placeholder:font-normal placeholder:text-sm hover:border-slate-400 focus:border-primary-500 dark:focus:border-primary-500 dark:hover:border-slate-700"
                placeholder="Your Email"
                required
                disabled={loading}
              />
            </div>
            <div className="mt-4">
              <label
                htmlFor="password"
                className="font-medium text-sm text-slate-600 dark:text-slate-400"
              >
                Your password
              </label>
              <input
                type="password"
                id="password"
                className="form-input w-full rounded-md mt-1 border border-slate-300/60 dark:border-slate-700 dark:text-slate-300 bg-transparent px-3 py-1 focus:outline-none focus:ring-0 placeholder:text-slate-400/70 placeholder:font-normal placeholder:text-sm hover:border-slate-400 focus:border-primary-500 dark:focus:border-primary-500 dark:hover:border-slate-700"
                placeholder="Password"
                required
                disabled={loading}
              />
            </div>
            <a
              href="#"
              className="text-xs font-medium text-primary-500 underline "
            >
              Forgot Password?
            </a>

            <div className="block mt-3">
              <label className="custom-label block dark:text-slate-300">
                <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded w-4 h-4 inline-block leading-4 text-center -mb-[3px]">
                  <input type="checkbox" className="hidden" />
                  <i className="fas fa-check hidden text-xs text-slate-700 dark:text-slate-200"></i>
                </div>
                Remember me
              </label>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600 flex justify-center items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </div>
          </form>

          <p className="mb-5 text-sm font-medium text-center text-slate-500">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="font-medium text-blue-600 hover:underline"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
