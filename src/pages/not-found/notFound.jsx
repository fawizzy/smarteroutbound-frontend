import React from "react";
import { Link } from "react-router-dom";
import { 
  ExclamationTriangleIcon, 
  HomeIcon, 
  ArrowLeftIcon 
} from "@heroicons/react/24/outline";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-full bg-yellow-100 p-3">
            <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500" />
          </div>
          
          <h1 className="mt-6 text-3xl font-bold text-gray-900">Page Not Found</h1>
          
          <p className="mt-3 text-base text-gray-600">
            We couldn't find the page you're looking for. The page might have been moved, 
            deleted, or might never have existed.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full">
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600"
            >
              <HomeIcon className="h-5 w-5" />
              Go Home
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Go Back
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          If you believe this is an error, please contact our support team.
        </p>
      </div>
    </div>
  );
};

export default NotFound;