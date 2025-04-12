import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../../utils/api";

const DomainSuggestion = ({ 
  onClose, 
  onContinue, 
  initialKeywords = [], 
  initialDomains = [],
  onKeywordsUpdate,
}) => {
  // State variables
  const [keywords, setKeywords] = useState(initialKeywords);
  const [inputValue, setInputValue] = useState("");
  const [domains, setDomains] = useState(initialDomains);
  const [availabilityResults, setAvailabilityResults] = useState({});
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [redirectDomain, setRedirectDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [redirectError, setRedirectError] = useState(null);
  const [domainInput, setDomainInput] = useState("");
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [availableSlots, setAvailableSlots] = useState(null); // New state for available slots
  const [isLoadingSlots, setIsLoadingSlots] = useState(false); // Loading state for slots
  const apiUrl = import.meta.env.VITE_API_URL;

  // Prefixes to suggest alternative domain names
  const domainPrefixes = ["get", "try", "use", "join", "my", "the", "go"];

  // Initialize selected domains if going back from confirmation
  useEffect(() => {
    if (initialDomains.length > 0 && selectedDomains.length === 0) {
      // Restore selected domains if needed
    }
  }, [initialDomains]);

  // Fetch available domain slots
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      
      setIsLoadingSlots(true);
      
      try {
        const response = await fetchWithAuth(
          `${apiUrl}/api/user/available-slots/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            }
          }
        );
        
        const data = await response.json();
        
        if (data && data.available_slots) {
          setAvailableSlots(data.available_slots);
        } else {
          console.error("Failed to fetch domain slot information");
        }
      } catch (err) {
        console.error("Error fetching domain slots:", err);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [apiUrl]);

  // Update parent component when keywords or domains change
  useEffect(() => {
    if (onKeywordsUpdate) {
      onKeywordsUpdate(keywords, domains);
    }
  }, [keywords, domains]);

  // Clear feedback message after 5 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Handle adding tags
  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === " ") && inputValue.trim()) {
      e.preventDefault();
      if (keywords.length < 5 && !keywords.includes(inputValue.trim())) {
        const newKeywords = [...keywords, inputValue.trim()];
        setKeywords(newKeywords);
        // Generate domain suggestions based on keywords
        generateDomainSuggestions(inputValue.trim());
      } else if (keywords.length >= 5) {
        setFeedback({
          type: "warning",
          message: "Maximum 5 keywords allowed",
        });
      } else if (keywords.includes(inputValue.trim())) {
        setFeedback({
          type: "warning",
          message: "Keyword already added",
        });
      }
      setInputValue(""); // Clear input field
    }
  };

  // Remove tag
  const removeTag = (index) => {
    const newKeywords = keywords.filter((_, i) => i !== index);
    setKeywords(newKeywords);
  };

  // Generate domain suggestions based on keywords
  const generateDomainSuggestions = (keyword) => {
    const newSuggestions = [];
    
    // Clean the keyword (remove spaces, special chars)
    const cleanKeyword = keyword.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Add the base domain
    newSuggestions.push(`${cleanKeyword}.com`);
    
    // Add prefixed suggestions
    domainPrefixes.forEach(prefix => {
      newSuggestions.push(`${prefix}${cleanKeyword}.com`);
    });
    
    // Add other TLDs
    ['io', 'co', 'app', 'net', 'org'].forEach(tld => {
      newSuggestions.push(`${cleanKeyword}.${tld}`);
    });
    
    setSuggestions([...new Set([...suggestions, ...newSuggestions])]);
  };

  // Validate URL
  const validateUrl = (url) => {
    if (!url) return true; // Empty is valid (optional field)
    try {
      // Simple validation - must start with http:// or https://
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      return urlPattern.test(url);
    } catch (e) {
      return false;
    }
  };

  // Check domain availability
  const checkAvailability = async (domain) => {
    if (!domain) return;
    
    setIsCheckingAvailability(true);
    setError(null);
    
    try {
      const response = await fetchWithAuth(
        `${apiUrl}/api/domains/availability/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ domain_names: [domain] }),
        }
      );
      const data = await response.json();
      
      if (data.status === "success") {
        console.log(data);
        const isAvailable = data.data[0].Available === "yes";
        setAvailabilityResults(prev => ({
          ...prev,
          [domain]: isAvailable
        }));
        
        if (!domains.includes(domain) && isAvailable) {
          setDomains(prev => [...prev, domain]);
        }
        
        setFeedback({
          type: isAvailable ? "success" : "warning",
          message: isAvailable 
            ? `${domain} is available!` 
            : `${domain} is not available.`
        });
      } else {
        setError(data.message || "Failed to check domain availability");
      }
    } catch (error) {
      setError("Network error. Please try again.");
      console.error("Error checking domain availability:", error);
    } finally {
      setIsCheckingAvailability(false);
      setDomainInput("");
    }
  };

  // Handle checkbox select
  const handleSelect = (domain) => {
    setSelectedDomains((prev) => {
      return prev.includes(domain)
        ? prev.filter((d) => d !== domain)
        : [...prev, domain];
    });
  };

  // Handle Select All
  const handleSelectAll = () => {
    if (selectedDomains.length === domains.length) {
      setSelectedDomains([]); // Deselect all
    } else {
      // Only select available domains
      const availableDomains = domains.filter(domain => availabilityResults[domain]);
      setSelectedDomains(availableDomains);
    }
  };

  // Validate redirect domain
  const handleRedirectDomainChange = (value) => {
    setRedirectDomain(value);
    if (value && !validateUrl(value)) {
      setRedirectError("Please enter a valid URL (e.g., https://example.com)");
    } else {
      setRedirectError(null);
    }
  };

  // Handle Continue button click
  const handleContinue = () => {
    // Validate redirect domain if provided
    if (redirectDomain && !validateUrl(redirectDomain)) {
      setRedirectError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }
    
    // Create payload with selected domains and redirect domain
    const domainsData = {
      selectedDomains: selectedDomains,
      redirectDomain: redirectDomain
    };
    
    setFeedback({
      type: "success",
      message: "Domains selected successfully!",
    });
    
    // If parent component provided an onContinue callback, call it
    if (onContinue) {
      onContinue(domainsData);
    }
  };

  // Check availability of a suggestion
  const checkSuggestionAvailability = (domain) => {
    setDomainInput(domain);
    checkAvailability(domain);
  };

  // Render the Domain Slots information
  const renderDomainSlots = () => {
    if (isLoadingSlots) {
      return (
        <div className="flex items-center justify-center p-4 bg-gray-50 rounded-md mb-4">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
          <span className="text-sm text-gray-600">Loading domain slots...</span>
        </div>
      );
    }

    if (!availableSlots) return null;

    const { total_limit, used_domains, available_slots } = availableSlots;
    const usagePercentage = (used_domains / total_limit) * 100;

    return (
      <div className="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200 mt-8">
        <h4 className="font-semibold text-gray-800 mb-2">Your Domain Slots</h4>
        
        <div className="grid grid-cols-3 gap-3 mb-2 text-center">
          <div className="bg-white p-2 rounded border">
            <div className="font-semibold text-lg">{used_domains}</div>
            <div className="text-xs text-gray-500">Used</div>
          </div>
          <div className="bg-white p-2 rounded border">
            <div className="font-semibold text-lg text-green-600">{available_slots}</div>
            <div className="text-xs text-gray-500">Available</div>
          </div>
          <div className="bg-white p-2 rounded border">
            <div className="font-semibold text-lg">{total_limit}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-2 w-full bg-gray-200 rounded-full">
          <div 
            className={`h-2 rounded-full ${usagePercentage > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
            style={{ width: `${usagePercentage}%` }}
          ></div>
        </div>
        
        {available_slots === 0 && (
          <div className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
            You've used all your available domain slots. Please buy more package for more domains.
          </div>
        )}
        
        {selectedDomains.length > available_slots && (
          <div className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
            You've selected {selectedDomains.length} domains but only have {available_slots} slots available.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="">
      {/* Domain Slots Section */}
      {renderDomainSlots()}

      {/* Feedback Messages */}
      {feedback && (
        <div 
          className={`mb-4 p-3 rounded-md text-sm ${
            feedback.type === "success" 
              ? "bg-green-100 text-green-800" 
              : feedback.type === "warning"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {feedback.message}
        </div>
      )}
      
      {/* Error Messages */}
      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-100 text-red-800 text-sm">
          {error}
        </div>
      )}
    
      {/* Keywords Input */}
      {/* <label className="text-sm text-gray-600">
        Enter keywords to get domain suggestions:
      </label>
      <div className="flex flex-wrap items-center gap-2 p-2 border rounded-md">
        {keywords.map((tag, index) => (
          <div
            key={index}
            className="flex items-center bg-blue-500 text-white px-2 py-1 rounded-md text-sm"
          >
            {tag}
            <button
              onClick={() => removeTag(index)}
              className="ml-1 text-white hover:text-gray-300"
              aria-label={`Remove ${tag} keyword`}
            >
              &times;
            </button>
          </div>
        ))}
        <input
          type="text"
          className="flex-1 p-2 outline-none border-none bg-transparent"
          placeholder={`Enter keywords (${5 - keywords.length} remaining)`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={keywords.length >= 5}
        />
      </div>
      <div className="text-xs text-gray-500 mt-1 flex justify-between">
        <span>Press Space or Enter to add a keyword</span>
        <span>{keywords.length}/5 keywords used</span>
      </div> */}

      {/* Domain Input */}
      <div className="mt-6">
        <label className="text-sm text-gray-600 block mb-2">
          Check domain availability:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 p-2 border rounded-md outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter a domain name (e.g., example.com)"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && checkAvailability(domainInput)}
          />
          <button
            onClick={() => checkAvailability(domainInput)}
            disabled={!domainInput || isCheckingAvailability}
            className={`px-4 py-1.5 rounded-md text-sm border flex items-center ${
              domainInput && !isCheckingAvailability
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isCheckingAvailability ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Checking...
              </>
            ) : (
              "Check Availability"
            )}
          </button>
        </div>
      </div>

      {/* Domain Suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold mb-2">Domain Suggestions</h4>
          <p className="text-xs text-gray-500 mb-3">
            Try these domain variations based on your keywords:
          </p>
          
          <div className="flex flex-wrap gap-2">
            {suggestions.map((domain) => (
              <div 
                key={domain} 
                className={`text-sm border px-3 py-1.5 rounded-md cursor-pointer hover:bg-gray-50 flex items-center ${
                  availabilityResults[domain] === true 
                    ? "border-green-500 text-green-700" 
                    : availabilityResults[domain] === false
                    ? "border-red-300 text-red-600"
                    : "border-gray-300 text-gray-700"
                }`}
                onClick={() => checkSuggestionAvailability(domain)}
              >
                {domain}
                {availabilityResults[domain] === true && (
                  <span className="ml-2 text-green-500">✓</span>
                )}
                {availabilityResults[domain] === false && (
                  <span className="ml-2 text-red-500">✗</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Domains */}
      {domains.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold">Select Available Domains</h4>

          {/* Select All Checkbox */}
          <label className="flex items-center space-x-2 font-medium text-gray-700 mb-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedDomains.length === domains.filter(d => availabilityResults[d]).length && domains.some(d => availabilityResults[d])}
              onChange={handleSelectAll}
              className="w-4 h-4"
              disabled={!domains.some(d => availabilityResults[d])}
            />
            <span className="text-sm">
              Select All Available ({domains.filter(d => availabilityResults[d]).length})
            </span>
            {selectedDomains.length > 0 && (
              <span className="text-sm text-gray-500">
                ({selectedDomains.length} selected)
              </span>
            )}
          </label>

          <div className="max-h-60 overflow-y-auto border p-2 rounded-md">
            {domains.map((domain) => (
              <label
                key={domain}
                className={`flex items-center space-x-2 cursor-pointer text-sm mb-4 hover:bg-gray-50 p-2 rounded transition-colors ${
                  availabilityResults[domain] 
                    ? "text-green-700" 
                    : "text-red-600"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedDomains.includes(domain)}
                  onChange={() => handleSelect(domain)}
                  className="w-4 h-4"
                  disabled={!availabilityResults[domain]}
                />
                <span>{domain}</span>
                <span className="ml-2">
                  {availabilityResults[domain] 
                    ? "Available" 
                    : "Not Available"}
                </span>
              </label>
            ))}
          </div>

          {/* Redirect Domain Input */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Redirect domain
            </label>
            <p className="text-xs text-gray-500">
              We recommend adding the default redirect domain to ensure your
              clients can find you with any domain you use for your emails.
            </p>
            <input
              type="text"
              className={`mt-2 w-full border rounded-md p-2 outline-none focus:ring-1 ${
                redirectError ? "border-red-300 focus:ring-red-500" : "focus:ring-blue-500"
              }`}
              placeholder="https://"
              value={redirectDomain}
              onChange={(e) => handleRedirectDomainChange(e.target.value)}
            />
            {redirectError && (
              <p className="mt-1 text-xs text-red-500">{redirectError}</p>
            )}
          </div>

          <div className="mt-6 flex justify-between">
            <button
              className="border border-gray-300 text-gray-700 px-4 py-1.5 rounded-md text-sm hover:bg-gray-50"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className={`px-4 py-1.5 rounded-md text-sm ${
                selectedDomains.length === 0 || 
                (redirectDomain && redirectError) ||
                (availableSlots && selectedDomains.length > availableSlots.available_slots)
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
              onClick={handleContinue}
              disabled={
                selectedDomains.length === 0 || 
                (redirectDomain && redirectError) || 
                (availableSlots && selectedDomains.length > availableSlots.available_slots)
              }
            >
              Continue ({selectedDomains.length} domains)
            </button>
          </div>
        </div>
      )}
      
      {/* Domain Name Pattern Tips */}
      <div className="mt-6 bg-blue-50 p-4 rounded-md">
        <h4 className="font-semibold text-blue-800 mb-2">Tips for creating domain names:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use prefixes like "get", "try", "use", "join" for product domains</li>
          <li>• Consider different TLDs (.com, .io, .co, .app) if your preferred domain is taken</li>
          <li>• Keep it short, memorable, and easy to spell</li>
          <li>• Avoid hyphens and numbers when possible</li>
          <li>• Make sure it's relevant to your brand or business</li>
        </ul>
      </div>
    </div>
  );
};

export default DomainSuggestion;