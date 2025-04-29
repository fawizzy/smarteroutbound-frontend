import React, { useState } from "react";
import {
  EnvelopeIcon as Mail,
  UserIcon as User,
  PencilIcon as Edit,
  TrashIcon as Trash,
  CheckIcon as Check,
} from "@heroicons/react/24/solid";
import EditMailbox from "../edit-mailboxes/editMailboxes";

const EmailsDisplay = ({ emails, onDelete, onRegister }) => {
  // Default props if not provided
  onDelete = onDelete || (() => {});
  onRegister = onRegister || (() =>{});
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMailbox, setEditingMailbox] = useState(null);
  const [emailList, setEmailList] = useState(emails || []);

  // Update local state when props change
  React.useEffect(() => {
    setEmailList(emails || []);
  }, [emails]);

  const handleRegister = () => {
      onRegister(emailList);
  };

  const handleSaveEdit = (updatedMailbox) => {
    const updatedEmails = emailList.map(email => 
      email === editingMailbox ? updatedMailbox : email
    );
    setEmailList(updatedEmails);
    setShowEditModal(false);
    
    
  };

  const handleEditClick = (email) => {
    setEditingMailbox(email);
    setShowEditModal(true);
  };

  const handleDeleteMailbox = (mailboxToDelete) => {
    const filteredEmails = emailList.filter(email => email !== mailboxToDelete);
    setEmailList(filteredEmails);
    
    // Call parent onDelete if provided
    if (onDelete !== undefined && typeof onDelete === 'function') {
      onDelete(mailboxToDelete, filteredEmails);
    }
  };

  

  return (
    <div className="w-full px-6 mt-2 mx-auto">
      {showEditModal && (
        <EditMailbox
          mailbox={editingMailbox}
          onSave={handleSaveEdit}
          onCancel={() => setShowEditModal(false)}
          domains={["example.com", "mydomain.org"]} // Pass available domains
        />
      )}
      
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Your Mailboxes
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your configured email addresses
          </p>
        </div>

        {emailList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Mail className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              No mailboxes found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't created any mailboxes yet. Get started by adding your
              first mailbox.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            {/* Desktop view */}
            <div className="hidden md:block max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Email Address
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {emailList.map((email, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {email.firstName} {email.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {email.mailboxName}@{email.domain}
                        </div>
                        <div className="text-xs text-gray-500">
                          {email.domain}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(email)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMailbox(email)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile view */}
            <div className="md:hidden">
              <ul className="divide-y divide-gray-200">
                {emailList.map((email, index) => (
                  <li key={index} className="px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {email.firstName} {email.lastName}
                          </p>
                          <p className="text-sm text-gray-700 mt-1">
                            {email.mailboxName}@{email.domain}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClick(email)}
                          className="p-1 rounded-full text-indigo-600 hover:bg-indigo-50"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMailbox(email)}
                          className="p-1 rounded-full text-red-600 hover:bg-red-50"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Registration button section */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Ready to use these mailboxes?
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {emailList.length}{" "}
                    {emailList.length === 1 ? "mailbox" : "mailboxes"} configured
                  </p>
                </div>
                <button
                  onClick={handleRegister}
                  disabled={emailList.length === 0}
                  className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                    emailList.length === 0
                      ? "bg-green-300 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                 
                      <Check className="-ml-1 mr-2 h-4 w-4" />
                      Register Emails
                   
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailsDisplay;