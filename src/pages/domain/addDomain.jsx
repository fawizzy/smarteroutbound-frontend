import React, { useState } from "react";
import Stepper from "../../components/stepper/stepper";
import ConfirmInformation from "../../components/confirm-information/confirmInformation";
import DomainSuggestion from "../../components/domain_suggestions/domain_suggestion";
import DomainRegistrationSuccess from "../../components/domain-registration-success/domain-registration-success";
import { fetchWithAuth } from "../../utils/api";

const AddDomain = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [domainData, setDomainData] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [registrationResults, setRegistrationResults] = useState([]);
  const [keywordsData, setKeywordsData] = useState({
    keywords: [],
    suggestions: []
  });
 
  const apiUrl = import.meta.env.VITE_API_URL;

  const steps = [
    { id: 1, name: "Generate domains" },
    { id: 2, name: "Confirm Information" },
    { id: 3, name: "Register domains" },
  ];

  // Handle continue from DomainSuggestion
  const handleDomainSelectionContinue = (data) => {
    setDomainData(data);
    setCurrentStep(2);
  };

  // Save keywords and suggestions when they change
  const handleKeywordsUpdate = (keywords, suggestions) => {
    setKeywordsData({
      keywords: keywords,
      suggestions: suggestions
    });
  };

  // Handle back button in ConfirmInformation
  const handleConfirmBack = () => {
    setCurrentStep(1);
  };

  const registerDomains = async (domains, redirectDomain) => {
    const response = await fetchWithAuth(`${apiUrl}/api/register-domains-bulk/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domains: domains,
        redirect_domain: redirectDomain,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to register domains');
    }

    return response.json();
  };

  // Handle final confirmation
  const handleConfirmation = (data) => {
    setRegistering(true);
    registerDomains(data.selectedDomains, data.redirectDomain)
      .then((response) => {
        console.log("Domains registration response:", response);
        setRegistrationResults(response); // Save the API response
        setRegistering(false);
        setCurrentStep(3);
      })
      .catch((error) => {
        console.error("Error registering domains:", error);
        setRegistering(false);
        // Optional: Display error message to user
      });
  };

  // Handle close/cancel in DomainSuggestion
  const handleDomainClose = () => {
    // Optional: Add logic for what happens when canceling domain selection
    window.location.href = "/";
  };

  // Handle create email button click
  const handleCreateEmail = () => {
    window.location.href = "/add-emails";
  };

  // Handle save for later
  const handleSaveLater = () => {
    window.location.href = "/";
  };

  return (
    <div className="p-4">
      {currentStep < 3 && (
        <div className="ml-[200px] mt-[40px]" style={{ display: 'flex', justifyContent: 'center', maxWidth: "1200px" }}>
          <Stepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={(stepId) => {
              if (stepId < currentStep) {
                setCurrentStep(stepId);
              }
            }}
          />
        </div>
      )}

      {currentStep === 1 && (
        <div className="mb-4">
          <DomainSuggestion 
            onContinue={handleDomainSelectionContinue} 
            onClose={handleDomainClose}
            initialKeywords={keywordsData.keywords}
            initialSuggestions={keywordsData.suggestions}
            onKeywordsUpdate={handleKeywordsUpdate}
          />
        </div>
      )}
      
      {currentStep === 2 && (
        <div className="mb-4">
          <ConfirmInformation 
            domainData={domainData} 
            onBack={handleConfirmBack}
            onConfirm={handleConfirmation}
            registering={registering}
          />
        </div>
      )}

      {currentStep === 3 && (
        <DomainRegistrationSuccess
          registrationResults={registrationResults}
          onCreateEmail={handleCreateEmail}
          onSaveLater={handleSaveLater}
        />
      )}
    </div>
  );
};

export default AddDomain;