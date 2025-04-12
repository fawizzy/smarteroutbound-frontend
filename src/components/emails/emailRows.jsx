import React, { useState } from "react";
import { fetchWithAuth } from "../../utils/api";
import DeleteConfirmationModal from "../delete-confirmation/delete-confirmation";

const EmailTableRow = ({ email, domain, created, onDelete }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const formattedCreated = new Date(created).toLocaleDateString();
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleDelete = async () => {
    try {
      const response = await fetchWithAuth(`${apiUrl}/api/delete-mailboxes/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emails: [email]
        })
      });

      if (response.ok) {
        setIsDeleteModalOpen(false);
        onDelete();
      } else {
        console.error("Failed to delete mailbox");
      }
    } catch (error) {
      console.error("Error deleting mailbox:", error);
    }
  };

  return (
    <>
      <tr className="bg-white border-b border-dashed dark:bg-gray-800 dark:border-gray-700">
        <td className="p-3 text-sm font-medium whitespace-nowrap dark:text-white">
          {email}
        </td>
        <td className="p-3 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
          {domain}
        </td>
        <td className="p-3 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
          {formattedCreated}
        </td>
        <td className="p-3 text-sm whitespace-nowrap">
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-red-600 hover:text-red-800 font-medium flex items-center"
          >
            <svg 
              className="w-4 h-4 mr-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
        </td>
      </tr>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        email={email}
      />
    </>
  );
};

export default EmailTableRow;