import { useState, useEffect } from "react";
import AppRoutes from "./routes";
import Topbar from "./components/topbar/topbar";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Bounce, ToastContainer } from "react-toastify";

function App() {
  // State to track the current pathname
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  
  // Listen for route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentPath(window.location.pathname);
    };
    
    // Listen for popstate event (browser back/forward navigation)
    window.addEventListener('popstate', handleRouteChange);
    
    // Clean up the event listener
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  
  const hideTopbar = 
    currentPath === "/login" || currentPath === "/signup";

  return (
    <>
      {!hideTopbar && <Topbar />}
      <AppRoutes />
      <ToastContainer
        position="top-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
        />
    </>
  );
}

export default App;