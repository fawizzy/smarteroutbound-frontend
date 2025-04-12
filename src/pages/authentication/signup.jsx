import React, { useState } from "react";
import logo from "../../assets/images/logo.svg";

const SignupPage = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;
  
  const handleSubmit = async (e) => {
    
    e.preventDefault();
    const first_name = e.target[0].value;
    const last_name = e.target[1].value;
    const email = e.target[2].value;
    const password = e.target[3].value;
    const confirm_password = e.target[4].value;

    if (password !== confirm_password) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/signup/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${first_name} ${last_name}`,
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      window.location.href = "/";

    } catch (error) {
      console.error("Error:", error);
      // Handle signup error here (e.g., show error message)
    } finally {
      setLoading(false); 
    }
  };



  return (
    <div
      data-layout-mode="light"
      data-sidebar-size="default"
      data-theme-layout="vertical"
      className="bg-gray-100 dark:bg-gray-900 bg-[url('https://12thstreetauto.com/404/')] dark:bg-[url('https://12thstreetauto.com/404/')]"
    >
      <div className="relative flex flex-col justify-center min-h-screen overflow-hidden">
        <div className="w-full  m-auto bg-white dark:bg-slate-800/60 rounded shadow-lg ring-2 ring-slate-300/50 dark:ring-slate-700/50 lg:max-w-md">
          <div className="text-center p-6 bg-slate-900 rounded-t">
            <a href="index-2.html">
              <img src={logo} alt="" className="w-14 h-14 mx-auto mb-2" />
            </a>
            <h3 className="font-semibold text-white text-xl mb-1">
              Let's Get Started
            </h3>
            <p className="text-xs text-slate-400">
              Sign in to continue to Smarteroutbound.
            </p>
          </div>

          <form className="p-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="first_name"
                className="font-medium text-sm text-slate-600 dark:text-slate-400"
              >
                First Name
              </label>
              <input
                type="text"
                id="first_name"
                className="form-input w-full rounded-md mt-1 border border-slate-300/60 dark:border-slate-700 dark:text-slate-300 bg-transparent px-3 py-1 focus:outline-none focus:ring-0 placeholder:text-slate-400/70 placeholder:font-normal placeholder:text-sm hover:border-slate-400 focus:border-primary-500 dark:focus:border-primary-500  dark:hover:border-slate-700"
                placeholder="Enter First Name"
                required
              />
            </div>
            <div>
              <label
                htmlFor="last_name"
                className="font-medium text-sm text-slate-600 dark:text-slate-400"
              >
                Last Name
              </label>
              <input
                type="text"
                id="last_name"
                className="form-input w-full rounded-md mt-1 border border-slate-300/60 dark:border-slate-700 dark:text-slate-300 bg-transparent px-3 py-1 focus:outline-none focus:ring-0 placeholder:text-slate-400/70 placeholder:font-normal placeholder:text-sm hover:border-slate-400 focus:border-primary-500 dark:focus:border-primary-500  dark:hover:border-slate-700"
                placeholder="Enter Last Name"
                required
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="email"
                className="font-medium text-sm text-slate-600 dark:text-slate-400"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                className="form-input w-full rounded-md mt-1 border border-slate-300/60 dark:border-slate-700 dark:text-slate-300 bg-transparent px-3 py-1 focus:outline-none focus:ring-0 placeholder:text-slate-400/70 placeholder:font-normal placeholder:text-sm hover:border-slate-400 focus:border-primary-500 dark:focus:border-primary-500  dark:hover:border-slate-700"
                placeholder="Enter Email"
                required
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="password"
                className="font-medium text-sm text-slate-600 dark:text-slate-400"
              >
                Your password
              </label>
              <input
                type="password"
                id="password"
                className="form-input w-full rounded-md mt-1 border border-slate-300/60 dark:border-slate-700 dark:text-slate-300 bg-transparent px-3 py-1 focus:outline-none focus:ring-0 placeholder:text-slate-400/70 placeholder:font-normal placeholder:text-sm hover:border-slate-400 focus:border-primary-500 dark:focus:border-primary-500  dark:hover:border-slate-700"
                placeholder="Enter Password"
                required
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="Confirm_Password"
                className="font-medium text-sm text-slate-600 dark:text-slate-400"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="Confirm_Password"
                className="form-input w-full rounded-md mt-1 border border-slate-300/60 dark:border-slate-700 dark:text-slate-300 bg-transparent px-3 py-1 focus:outline-none focus:ring-0 placeholder:text-slate-400/70 placeholder:font-normal placeholder:text-sm hover:border-slate-400 focus:border-primary-500 dark:focus:border-primary-500  dark:hover:border-slate-700"
                placeholder="Enter Confirm Password"
                required
              />
            </div>

            {errorMessage && (
              <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
            )}

            <div className="block mt-3">
              <label className="custom-label block dark:text-slate-300">
                <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded w-4 h-4 inline-block leading-4 text-center relative">
                  <input
                    type="checkbox"
                    className="absolute inset-0" 
                    id="terms-checkbox"
                    required
                  />
                  <i className="fas fa-check hidden text-xs text-slate-700 dark:text-slate-200 absolute inset-0 flex justify-center items-center">
                    {/* Checkmark icon will appear here when checked */}
                  </i>
                </div>
                <span className="ml-2">
                  By registering, you agree to the Smarteroutbound Terms of Use
                </span>
              </label>
            </div>

            <div className="mt-5">
              <button className="w-full px-4 py-2 flex justify-center tracking-wide text-white transition-colors duration-200 transform bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
               {loading ? ( <>
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
                  </>): ("Register")}
              </button>
            </div>
          </form>
          <p className="mb-5 text-sm font-medium text-center text-slate-500">
            {" "}
            Already have an account ?{" "}
            <a
              href="/login"
              className="font-medium text-blue-600 hover:underline"
            >
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
