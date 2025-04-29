import React, { useState, useEffect } from "react";
import EmailTableRow from "./emailRows";
import { fetchWithAuth } from "../../utils/api";
import { useNavigate } from "react-router-dom";

const EmailTable = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [emails, setEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const getEmails = () => {
    setIsLoading(true);
    fetchWithAuth(`${apiUrl}/api/user/emails`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.detail.emails) {
          setEmails(data.detail.emails);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getEmails();
  }, []);


  
  const navigateToAddEmails = () => {
    navigate("/add-emails");
  };

  const exportCSV = () => {
    fetchWithAuth(`${apiUrl}/api/user/export-emails`, {
      method: "GET",
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "emails.csv";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => console.error("Error exporting emails:", error));
  };

  const handleDelete = () => {
    // Refresh the email list after deletion
    getEmails();
  };

  return (
    <>
      <div className="p-4 m-4 bg-white dark:bg-slate-800 rounded-md shadow">
        <div className="xl:w-full  min-h-[calc(100vh-138px)] relative pb-14 ">
          <div className="grid md:grid-cols-12 lg:grid-cols-12 xl:grid-cols-12 gap-4 mb-4">
            <div className="sm:col-span-12  md:col-span-12 lg:col-span-12 xl:col-span-12 ">
              <div className="bg-white dark:bg-slate-800 shadow  rounded-md w-full relative">
                <div className="border-b border-dashed border-slate-200 dark:border-slate-700 py-3 px-4 dark:text-slate-300/70 flex justify-between items-center">
                  <h4 className="font-medium">My Email Accounts</h4>
                  <div className="flex items-center gap-3">
                    {emails.length > 0 && (
                      <div
                        onClick={exportCSV}
                        className="flex items-center justify-center h-full text-blue-600 text-sm font-medium cursor-pointer"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          ></path>
                        </svg>
                        Export to CSV
                      </div>
                    )}

                    <button
                      onClick={navigateToAddEmails}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Add Emails
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 p-4">
                  <div className="sm:-mx-6 lg:-mx-8">
                    <div className="relative overflow-x-auto block w-full sm:px-6 lg:px-8">
                      {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      ) : (
                        <table
                          className="w-full border-collapse"
                          id="datatable_1"
                        >
                          <thead className="bg-gray-50 dark:bg-gray-600/20">
                            <tr>
                              <th
                                scope="col"
                                className="p-3 text-xs font-medium tracking-wider text-left text-gray-700 dark:text-gray-400 uppercase"
                              >
                                Email Account
                              </th>
                              <th
                                scope="col"
                                className="p-3 text-xs font-medium tracking-wider text-left text-gray-700 dark:text-gray-400 uppercase"
                              >
                                Domain
                              </th>
                              <th
                                scope="col"
                                className="p-3 text-xs font-medium tracking-wider text-left text-gray-700 dark:text-gray-400 uppercase"
                              >
                                Created
                              </th>
                              <th
                                scope="col"
                                className="p-3 text-xs font-medium tracking-wider text-left text-gray-700 dark:text-gray-400 uppercase"
                              >
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {emails &&
                              emails.map((email) => (
                                <EmailTableRow
                                  key={email.id}
                                  email={email.email_address}
                                  domain={email.domain_name}
                                  created={email.created_at}
                                  onDelete={handleDelete}
                                />
                              ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailTable;