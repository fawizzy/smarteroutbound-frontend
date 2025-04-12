import React, { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/solid";
import { fetchWithAuth } from "../../utils/api";

const AdminEmailDashboard = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  // Mock data - in a real app, this would come from your database
  const [emails, setEmails] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterReputation, setFilterReputation] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "email",
    direction: "asc",
  });
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Filter and sort emails
  const filteredAndSortedEmails = emails
    .filter(
      (email) =>
        email.email_address.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterReputation === "all" || email.reputation === filterReputation)
    )
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

  useEffect(() => {
    const getAllEmails = async () => {
      const response = await fetchWithAuth(
        `${apiUrl}/api/admin-email-dashboard/`
      );
      const data = await response.json();
      if (response.ok) {
        setEmails(data.detail);
      }
    };
    getAllEmails();
  }, []);

  // Handle sorting
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const updateReputation = async (id, newReputation) => {
    try {
      const response = await fetchWithAuth(
        `${apiUrl}/api/admin-email-dashboard/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email_id: id,
            update_data: { reputation: newReputation },
          }),
        }
      );

      if (response.ok) {
        const updatedEmail = await response.json();
        const reputation = updatedEmail.detail.reputation;
        setEmails((prevEmails) =>
          prevEmails.map((email) =>
            email.id === id ? { ...email, reputation } : email
          )
        );
      } else {
        console.error("Failed to update reputation");
      }
    } catch (error) {
      console.error("Error updating reputation:", error);
    }
  };

  // Handle reputation change
  const handleReputationChange = (id, newReputation) => {
    updateReputation(id, newReputation);
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvContent = [
      ["ID", "Email", "Reputation"],
      ...emails.map((email) => [
        email.id,
        email.email_address,
        email.reputation,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "emails_email_reputation.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reputation badge color
  const getReputationColor = (reputation) => {
    switch (reputation) {
      case "good":
        return "bg-blue-100 text-blue-800";
      case "great":
        return "bg-green-100 text-green-800";
      case "bad":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto p-4 bg-white rounded-lg shadow mt-4">
      <h1 className="text-2xl font-bold mb-6">User Emails</h1>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="relative w-full md:w-1/2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="emails..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <button
              className="flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md bg-white"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
            >
              <FunnelIcon className="h-4 w-4 mr-2 text-gray-500" />
              <span>
                {filterReputation === "all"
                  ? "All"
                  : filterReputation.charAt(0).toUpperCase() +
                    filterReputation.slice(1)}
              </span>
              {showFilterMenu ? (
                <ChevronUpIcon className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 ml-2" />
              )}
            </button>

            {showFilterMenu && (
              <div className="absolute  mt-2 w-20 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <ul>
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setFilterReputation("all");
                      setShowFilterMenu(false);
                    }}
                  >
                    All
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setFilterReputation("good");
                      setShowFilterMenu(false);
                    }}
                  >
                    Good
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setFilterReputation("great");
                      setShowFilterMenu(false);
                    }}
                  >
                    Great
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setFilterReputation("bad");
                      setShowFilterMenu(false);
                    }}
                  >
                    Bad
                  </li>
                </ul>
              </div>
            )}
          </div>

          <button
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={exportToCSV}
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("email")}
              >
                <div className="flex items-center">
                  Email
                  {sortConfig.key === "email" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUpIcon className="h-4 w-4 ml-1" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4 ml-1" />
                    ))}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("reputation")}
              >
                <div className="flex items-center">
                  Reputation
                  {sortConfig.key === "reputation" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUpIcon className="h-4 w-4 ml-1" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4 ml-1" />
                    ))}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedEmails.length > 0 ? (
              filteredAndSortedEmails.map((email, index) => (
                <tr key={email.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {email.email_address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReputationColor(
                        email.reputation
                      )}`}
                    >
                      {email.reputation &&
                        email.reputation.charAt(0).toUpperCase() +
                          email.reputation.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <select
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={email.reputation}
                      onChange={(e) =>
                        handleReputationChange(email.id, e.target.value)
                      }
                    >
                      <option value="good">Good</option>
                      <option value="great">Great</option>
                      <option value="bad">Bad</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No emails found matching your search criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminEmailDashboard;
