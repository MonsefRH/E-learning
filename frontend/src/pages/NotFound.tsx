import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import {useAuth} from "@/hooks/useAuth.tsx";

const NotFound = () => {
  const location = useLocation();
  const { logout } = useAuth();


  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);


  const handleLogout = () => {
      logout();
      window.location.href = "/";
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Logout
          </button>


      </div>
    </div>
  );
};

export default NotFound;
