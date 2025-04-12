import React from "react";

const DomainRegistrationSuccess = ({ 
  registrationResults = [],
  onCreateEmail,
  onSaveLater
}) => {
  // Calculate counts
  const successCount = registrationResults.filter(item => item.success).length;
  const failureCount = registrationResults.filter(item => !item.success).length;
  const totalCount = registrationResults.length;
  
  return (
    <div className="flex flex-col items-center justify-center max-w-md mx-auto text-center py-12 px-4">
      {/* Animated Success Icon */}
      <div className="relative mb-8">
        {/* Circle with checkmark */}
        <div className="bg-blue-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
          <svg 
            className="w-8 h-8 text-white" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={3} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
        
        {/* Decorative dots/particles */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-0 left-1/4 w-2 h-2 bg-blue-300 rounded-full"></div>
          <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-blue-200 rounded-full"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
          <div className="absolute bottom-0 right-1/3 w-2 h-2 bg-blue-300 rounded-full"></div>
          <div className="absolute top-1/2 right-0 w-1 h-1 bg-blue-200 rounded-full"></div>
        </div>
        
        {/* Mouse cursor */}
        <div className="absolute -top-1 -right-1 transform translate-x-4 translate-y-8">
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M4 4L12 20L15 15L20 12L4 4Z" 
              fill="black" 
              stroke="black" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Success Message */}
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Domain Registration Complete</h2>
      <p className="mb-1 text-gray-700">
        {successCount > 0 ? (
          <>Successfully registered {successCount} {successCount === 1 ? "domain" : "domains"}</>
        ) : (
          <>No domains were successfully registered</>
        )}
        {failureCount > 0 && ` (${failureCount} ${failureCount === 1 ? "domain" : "domains"} failed)`}
      </p>
      <p className="text-sm text-gray-500 mb-6">
        Please review the details below for more information.
      </p>

      {/* Registration Results */}
      <div className="w-full bg-gray-50 rounded-lg p-4 mb-8 max-h-60 overflow-y-auto">
        <div className="space-y-2">
          {registrationResults.map((result, index) => (
            <div 
              key={index} 
              className={`flex items-start p-2 rounded-md ${
                result.success ? "bg-green-50" : "bg-red-50"
              }`}
            >
              {/* Status Icon */}
              <div className={`mt-0.5 mr-2 ${result.success ? "text-green-500" : "text-red-500"}`}>
                {result.success ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                )}
              </div>
              
              {/* Domain Info */}
              <div className="flex-1 text-left">
                <p className={`font-medium ${result.success ? "text-green-800" : "text-red-800"}`}>
                  {result.domain_name}
                </p>
                <p className={`text-xs ${result.success ? "text-green-600" : "text-red-600"}`}>
                  {result.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex flex-col gap-3 max-w-xs mx-auto">
        {successCount > 0 && (
          <button 
            onClick={onCreateEmail}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full transition-colors"
          >
            Create email addresses
          </button>
        )}
        
        <button 
          onClick={onSaveLater}
          className="w-full py-2 text-blue-500 hover:text-blue-700 font-medium transition-colors"
        >
          {successCount > 0 ? "Save and finish later" : "Return to dashboard"}
        </button>
      </div>
    </div>
  );
};

export default DomainRegistrationSuccess;