import React from "react";

const ConfirmInformation = ({ domainData, onBack, onConfirm, registering }) => {
  const { selectedDomains, redirectDomain } = domainData;
  return (
    <div className="max-w-[700px]">
      <h3 className="text-xl font-semibold mb-6">Confirm Your Domain Selections</h3>
      
      {/* Summary Information */}
      <div className="bg-blue-50 p-4 rounded-md mb-6">
        <p className="text-sm text-blue-800">
          You've selected <span className="font-bold">{selectedDomains.length}</span> domain{selectedDomains.length !== 1 && 's'}.
          {redirectDomain && (
            <> Your redirect domain is set to <span className="font-bold">{redirectDomain}</span>.</>
          )}
        </p>
      </div>
      
      {/* Selected Domains Section */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Selected Domains</h4>
        <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
          {selectedDomains.length > 0 ? (
            <ul className="space-y-2">
              {selectedDomains.map((domain, index) => (
                <li key={index} className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-700">{domain}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm italic">No domains selected</p>
          )}
        </div>
      </div>
      
      {/* Redirect Domain Section */}
      <div className="mb-8">
        <h4 className="font-medium mb-2">Redirect Domain</h4>
        <div className="border rounded-md p-4">
          {redirectDomain ? (
            <div className="flex items-center">
              <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
              <a href={redirectDomain} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {redirectDomain}
              </a>
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">No redirect domain configured</p>
          )}
        </div>
      </div>
      
      {/* What happens next */}
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <h4 className="font-medium mb-2">What happens next?</h4>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex">
            <span className="mr-2">•</span>
            <span>Your selected domains will be registered for your account</span>
          </li>
          <li className="flex">
            <span className="mr-2">•</span>
            <span>The redirect domain will be set as the default landing page when your email domains are accessed directly</span>
          </li>
          <li className="flex">
            <span className="mr-2">•</span>
            <span>You can manage these domains from your account settings at any time</span>
          </li>
        </ul>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Back to Selection
        </button>
        <button
          onClick={() => onConfirm(domainData)}
          className="px-6 py-2 bg-blue-500 text-white flex items-center text-sm rounded-md hover:bg-blue-600"
          disabled={selectedDomains.length === 0}
        >
          {registering ? (<>
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
                    Registering Domains
                  </>):"Confirm and Continue"}
          
        </button>
      </div>
    </div>
  );
};

export default ConfirmInformation;