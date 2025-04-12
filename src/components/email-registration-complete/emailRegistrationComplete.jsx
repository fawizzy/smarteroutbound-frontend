import React, { useState } from 'react';
import { fetchWithAuth } from '../../utils/api';

const EmailSetupScreens = ({emails, registering}) => {
  const apiUrl = import.meta.env.VITE_API_URL
  localStorage.removeItem('finalMailboxes')
  localStorage.removeItem('draftMailboxes')

  const handleGoBack = () => {
    window.location.href = "/"
  };

  const handleComplete = () => {
    window.location.href = "/"
  };

  const exportCSV = () => {
    fetchWithAuth(`${apiUrl}/api/user/export-emails`, {
      method: 'GET'
    })
      .then(response => response.blob())
      .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'emails.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      })
      .catch(error => console.error('Error exporting emails:', error));
  }

  const CreatingScreen = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm max-w-md mx-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-2">Your mailboxes are being created</h1>
      <p className="text-sm text-gray-600 mb-4">The process can take up to 2 minutes</p>
      
      <div className="text-sm text-gray-500 text-center mb-8">
        <p>You can leave the page, the process will continue.</p>
        <p>You will receive a confirmational email when it is done.</p>
      </div>
      
      <div className='flex space-x-2 justify-center items-center dark:invert'>
    <div className='h-4 w-4 bg-blue-500 rounded-full animate-pulse [animation-delay:-0.3s]'></div>
  <div className='h-4 w-4 bg-blue-500 rounded-full animate-pulse [animation-delay:-0.15s]'></div>
  <div className='h-4 w-4 bg-blue-500 rounded-full animate-pulse'></div>
</div>
      
      <button 
        onClick={handleComplete} 
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full text-sm font-medium transition-colors hover:bg-blue-600"
      >
        GO TO DASHBOARD
      </button>
    </div>
  );

  const CompletedScreen = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm max-w-md mx-auto">
      <div className="relative mb-4">
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <div className="absolute -inset-1">
          <div className="w-full h-full flex items-center justify-center">
            <div className="absolute w-1 h-4 bg-blue-300 transform rotate-45 -translate-x-6 -translate-y-6"></div>
            <div className="absolute w-1 h-3 bg-blue-300 transform rotate-12 translate-x-8 -translate-y-4"></div>
            <div className="absolute w-1 h-2 bg-blue-300 transform -rotate-45 translate-x-4 translate-y-8"></div>
            <div className="absolute w-1 h-3 bg-blue-300 transform -rotate-12 -translate-x-8 translate-y-6"></div>
          </div>
        </div>
      </div>

      <h1 className="text-xl font-bold text-gray-800 mb-4">Congratulations!</h1>
      <p className="text-sm text-gray-700 mb-6">Your {emails.length} mailboxes have been successfully registered!</p>
      
      <div onClick={exportCSV} className="flex items-center justify-center mb-6 text-blue-600 text-sm font-medium cursor-pointer">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
        </svg>
        Export to CSV
      </div>
      
      {/* <p className="text-sm text-gray-500 mb-4">We highly recommend configuring the Master Inbox and Warm-Up Filters.</p> */}
      
      {/* <button 
        className="px-6 py-2 bg-blue-500 text-white rounded-full text-sm font-medium transition-colors hover:bg-blue-600 mb-2"
      >
        Configure
      </button> */}
      
      <button 
        onClick={handleGoBack}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        Save and finish later
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {registering ?<CompletedScreen />: <CreatingScreen /> }
    </div>
  );
};

export default EmailSetupScreens;