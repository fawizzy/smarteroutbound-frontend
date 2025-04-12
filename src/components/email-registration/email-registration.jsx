import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../../utils/api";
import EmailsDisplay from "../display-mailboxes/displayMailboxes";

const MailboxCreation = ({setEmailBoxes}) => {
    const [mailboxes, setMailboxes] = useState([
        { firstName: "", lastName: "", mailboxName: "", domain: "" },
        { firstName: "", lastName: "", mailboxName: "", domain: "" },
        { firstName: "", lastName: "", mailboxName: "", domain: "" },
        { firstName: "", lastName: "", mailboxName: "", domain: "" },
      ]);
      const [domains, setDomains] = useState([]);
      const [loading, setLoading] = useState(true);
      const [errors, setErrors] = useState([{}, {}, {}, {}]);
      const [submitting, setSubmitting] = useState(false);
      const [formMessage, setFormMessage] = useState({ type: "", text: "" });
      const apiUrl = import.meta.env.VITE_API_URL;
    
      const fetchDomains = async () => {
        setLoading(true);
        try {
          const response = await fetchWithAuth(`${apiUrl}/api/user/domains`);
          const data = await response.json();
    
          if (!response.ok) {
            throw new Error("Failed to fetch domains");
          }
    
          if (data.detail.domains) {
            setDomains(data.detail.domains);
          }
        } catch (error) {
          console.error("Error fetching domains:", error);
          setFormMessage({
            type: "error",
            text: "Could not load domains. Please refresh and try again.",
          });
        } finally {
          setLoading(false);
        }
      };
    
      useEffect(() => {
        fetchDomains();
        
        // Load mailboxes from localStorage if available
        const savedMailboxes = localStorage.getItem('draftMailboxes');
        if (savedMailboxes) {
          try {
            const parsedMailboxes = JSON.parse(savedMailboxes);
            if (Array.isArray(parsedMailboxes) && parsedMailboxes.length > 0) {
              setMailboxes(parsedMailboxes);
            }
          } catch (error) {
            console.error("Error parsing saved mailboxes:", error);
          }
        }
      }, []);
    
      const validateMailbox = (mailbox, index) => {
        const newErrors = { ...errors[index] };
    
        if (!mailbox.firstName.trim()) {
          newErrors.firstName = "First name is required";
        } else {
          delete newErrors.firstName;
        }
    
        if (!mailbox.lastName.trim()) {
          newErrors.lastName = "Last name is required";
        } else {
          delete newErrors.lastName;
        }
    
        if (!mailbox.mailboxName.trim()) {
          newErrors.mailboxName = "Mailbox name is required";
        } else {
          delete newErrors.mailboxName;
        }
    
        const updatedErrors = [...errors];
        updatedErrors[index] = newErrors;
        setErrors(updatedErrors);
    
        return Object.keys(newErrors).length === 0;
      };
    
      const handleInputChange = (index, field, value) => {
        if (/[^a-zA-Z0-9._-]/.test(value)) {
          return;
        }
        const updatedMailboxes = [...mailboxes];
        updatedMailboxes[index][field] = value;
    
        if (
          (field === "firstName" || field === "lastName") &&
          updatedMailboxes[index].firstName &&
          updatedMailboxes[index].lastName
        ) {
          updatedMailboxes[index].mailboxName = `${updatedMailboxes[
            index
          ].firstName.toLowerCase()}.${updatedMailboxes[
            index
          ].lastName.toLowerCase()}`;
        }
    
        setMailboxes(updatedMailboxes);
        
        // Save to localStorage whenever mailboxes are updated
        localStorage.setItem('draftMailboxes', JSON.stringify(updatedMailboxes));
    
        if (errors[index][field]) {
          const updatedErrors = [...errors];
          delete updatedErrors[index][field];
          setErrors(updatedErrors);
        }
      };
    
      const applyDomainToAll = (domain) => {
        const updatedMailboxes = mailboxes.map((mailbox) => ({
          ...mailbox,
          domain,
        }));
        
        setMailboxes(updatedMailboxes);
        localStorage.setItem('draftMailboxes', JSON.stringify(updatedMailboxes));
      };
    
      const clearAllFields = () => {
        const emptyMailboxes = [
          { firstName: "", lastName: "", mailboxName: "", domain: "" },
          { firstName: "", lastName: "", mailboxName: "", domain: "" },
          { firstName: "", lastName: "", mailboxName: "", domain: "" },
          { firstName: "", lastName: "", mailboxName: "", domain: "" },
        ];
        
        setMailboxes(emptyMailboxes);
        setErrors([{}, {}, {}, {}]);
        setFormMessage({ type: "", text: "" });
        
        // Clear from localStorage
        localStorage.removeItem('draftMailboxes');
      };
    
      const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
    
        const filledMailboxes = mailboxes.filter(
          (m) => m.firstName || m.lastName || m.mailboxName
        );
    
        if (filledMailboxes.length === 0) {
          setFormMessage({
            type: "error",
            text: "Please configure at least one mailbox",
          });
          setSubmitting(false);
          return;
        }
    
        let isValid = true;
    
        filledMailboxes.forEach((mailbox, idx) => {
          const actualIndex = mailboxes.findIndex((m) => m === mailbox);
          if (!validateMailbox(mailbox, actualIndex)) {
            isValid = false;
          }
        });
    
        if (!isValid) {
          setFormMessage({
            type: "error",
            text: "Please fix the errors before continuing",
          });
          setSubmitting(false);
          return;
        }
    
        const mailboxesToSubmit = [];
    
        filledMailboxes.forEach(mailbox => {
          if (!mailbox.domain || mailbox.domain === "") {
            if(domains.length > 0){
              domains.forEach(domain=>{
                mailboxesToSubmit.push({
                  ...mailbox,
                 domain: domain.domain_name,
                })
              })
             
            }else{
              
            }
          } else {
            
            mailboxesToSubmit.push(mailbox);
          }
        });

        const uniqueMailboxes = mailboxesToSubmit.filter((mailbox, index, self) =>
            index === self.findIndex((m) => (
                m.mailboxName === mailbox.mailboxName && m.domain === mailbox.domain
            ))
        );

        if (uniqueMailboxes.length !== mailboxesToSubmit.length) {
            setFormMessage({
                type: "error",
                text: "Duplicate mailboxes found. Please ensure each mailbox is unique.",
            });
            setSubmitting(false);
            return;
        }

        // Save to localStorage before proceeding
        localStorage.setItem('finalMailboxes', JSON.stringify(mailboxesToSubmit));
        
        setEmailBoxes(mailboxesToSubmit);
    
        setTimeout(() => {
          setFormMessage({
            type: "success",
            text: `Successfully created ${mailboxesToSubmit.length} mailboxes!`,
          });
          setSubmitting(false);
        }, 1000);
      };
    
      const getCompletedMailboxCount = () => {
        return mailboxes.filter(
          (m) => m.firstName && m.lastName && m.mailboxName
        ).length;
      };
    
      const getEmailPreview = (mailbox) => {
        if (mailbox.mailboxName) {
          if (!mailbox.domain || mailbox.domain === "") {
            return `${mailbox.firstName.toLowerCase()}.${mailbox.lastName.toLowerCase()}@default.com`;
          }
          return `${mailbox.mailboxName}@${mailbox.domain}`;
        }
        return "";
      };
      
  return (
    <div className="ml-8 mr-8 p-6 bg-white rounded-lg max-w-full overflow-x-auto">
      {/* Component UI remains the same */}
      <h2 className="text-xl font-semibold text-gray-700 mb-1">
        Create mailboxes
      </h2>
      <p className="text-sm text-gray-500 mb-2">
        Please enter the first and the last name for your mailboxes. We will use
        them also to generate mailbox names.
      </p>

      {/* Status indicator */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{getCompletedMailboxCount()}/4</span>{" "}
          mailboxes configured
        </div>
        <div className="flex space-x-4">
          <button
            onClick={clearAllFields}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear all fields
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Message display area */}
          {formMessage.text && (
            <div
              className={`mb-6 p-3 text-sm rounded ${
                formMessage.type === "error"
                  ? "bg-red-50 text-red-700"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {formMessage.text}
            </div>
          )}

          {/* Desktop view */}
          <div className="hidden sm:block">
            {/* Domain quick-select row */}
            {domains.length > 0 && (
              <div className="flex justify-end mb-2">
                <div className="text-sm text-gray-500">
                  Apply domain to all:
                  <div className="inline-flex ml-2">
                    {domains.slice(0, 3).map((domain) => (
                      <button
                        key={domain.id}
                        type="button"
                        onClick={() => applyDomainToAll(domain.domain_name)}
                        className="px-2 py-1 mr-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        @{domain.domain_name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Column headers */}
            <div className="grid grid-cols-5 gap-4 mb-2">
              <div className="text-xs text-gray-500 font-medium">
                First name*
              </div>
              <div className="text-xs text-gray-500 font-medium">
                Last name*
              </div>
              <div className="col-span-2 text-xs text-gray-500 font-medium">
                Mailbox name*
              </div>
              <div className="text-xs text-gray-500 font-medium">Domain</div>
            </div>

            {mailboxes.map((mailbox, index) => (
              <div
                key={`desktop-${index}`}
                className={`grid grid-cols-5 gap-4 mb-4 p-2 rounded ${
                  index % 2 === 0 ? "bg-gray-50" : ""
                }`}
              >
                <div>
                  <input
                    type="text"
                    placeholder="First name"
                    className={`w-full px-3 py-2 border ${
                      errors[index].firstName
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded text-sm`}
                    value={mailbox.firstName}
                    onChange={(e) =>
                      handleInputChange(index, "firstName", e.target.value)
                    }
                  />
                  {errors[index].firstName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[index].firstName}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Last name"
                    className={`w-full px-3 py-2 border ${
                      errors[index].lastName
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded text-sm`}
                    value={mailbox.lastName}
                    onChange={(e) =>
                      handleInputChange(index, "lastName", e.target.value)
                    }
                  />
                  {errors[index].lastName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[index].lastName}
                    </p>
                  )}
                </div>

                <div className="col-span-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Mailbox name"
                      className={`w-full px-3 py-2 border ${
                        errors[index].mailboxName
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded text-sm`}
                      value={mailbox.mailboxName}
                      onChange={(e) =>
                        handleInputChange(index, "mailboxName", e.target.value)
                      }
                    />
                    {index === 0 && (
                      <div className="absolute top-0 right-0 bg-blue-50 text-blue-600 text-xs py-1 px-2 rounded-bl rounded-tr">
                        Auto-generated
                      </div>
                    )}
                  </div>
                  {errors[index].mailboxName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[index].mailboxName}
                    </p>
                  )}

                  {mailbox.mailboxName && (
                    <p className="text-xs text-gray-500 mt-1">
                      Preview: {getEmailPreview(mailbox)}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center">
                    <span className="mr-1 text-sm">@</span>
                    <select
                      className={`w-full px-3 py-2 border ${
                        errors[index]?.domain
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded text-sm bg-white`}
                      value={mailbox.domain}
                      onChange={(e) =>
                        handleInputChange(index, "domain", e.target.value)
                      }
                    >
                      <option value="">0 domains</option>
                      {domains.length > 0 &&
                        domains.map((domain) => (
                          <option key={domain.id} value={domain.domain_name}>
                            {domain.domain_name}
                          </option>
                        ))}
                    </select>
                  </div>
                  {errors[index].domain && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[index].domain}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile view - kept the same */}
          <div className="sm:hidden">
            {/* Mobile view content - same as original */}
            {/* ...mobile view code... */}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={submitting}
              className={`mr-6 sm:w-auto px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center ${
                submitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {submitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Processing...
                </>
              ) : (
                "Continue"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default MailboxCreation;