import Stepper from "../../components/stepper/stepper";
import MailboxCreation from "../../components/email-registration/email-registration";
import EmailsDisplay from "../../components/display-mailboxes/displayMailboxes";
import EmailSetupScreens from "../../components/email-registration-complete/emailRegistrationComplete";
import { fetchWithAuth } from "../../utils/api";
import { useState, useEffect } from "react";

const AddEmail = () => {
    const apiUrl = import.meta.env.VITE_API_URL;

    const [registering, setRegistering] = useState(false);
    const [emailBoxes, setEmailBoxes] = useState([]);
    const [currentStep, setCurrentStep] = useState(1);
    const steps = [
        { id: 1, name: "Enter Mailboxes Names" },
        { id: 2, name: "Check Created Mailboxes" },
        { id: 3, name: "Register Mailboxes" },
    ];

    // Load saved emails from localStorage when component mounts
    useEffect(() => {
        const savedStep = localStorage.getItem('currentEmailStep');
        const savedEmails = localStorage.getItem('finalMailboxes');
        
        if (savedStep) {
            setCurrentStep(parseInt(savedStep));
        }
        
        if (savedEmails) {
            try {
                const parsedEmails = JSON.parse(savedEmails);
                if (Array.isArray(parsedEmails) && parsedEmails.length > 0) {
                    setEmailBoxes(parsedEmails);
                }
            } catch (error) {
                console.error("Error parsing saved emails:", error);
            }
        }
    }, []);

    // Update localStorage whenever step changes
    useEffect(() => {
        localStorage.setItem('currentEmailStep', currentStep.toString());
    }, [currentStep]);

    const handleCreateEmailBoxes = (mailboxes) => {
        setEmailBoxes(mailboxes);
        setCurrentStep(2);
        // No need to save to localStorage here as it's already done in the MailboxCreation component
    };

    const handleRegister = (emails) => {
        setCurrentStep(3);
        setRegistering(false);
        
        // Save the final registered emails
        localStorage.removeItem('draftMailboxes');
        
        const formattedEmails = emails.map(item => ({
            local_part: item.mailboxName,
            domain: item.domain,
            first_name: item.firstName,
            last_name: item.lastName
        }));
        
        fetchWithAuth(`${apiUrl}/api/create-mailboxes/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mailboxes: formattedEmails }),
        })
        .then(response => response.json())
        .then(data => {
            setRegistering(true);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    };

    // Function to handle step changes, including going back
    const handleStepChange = (stepId) => {
        if (stepId < currentStep) {
            setCurrentStep(stepId);
            
            // If going back to step 2 from step 3, load the emails from localStorage
            if (currentStep === 3 && stepId === 2) {
                const savedEmails = localStorage.getItem('finalMailboxes');
                if (savedEmails) {
                    try {
                        const parsedEmails = JSON.parse(savedEmails);
                        setEmailBoxes(parsedEmails);
                    } catch (error) {
                        console.error("Error parsing saved emails:", error);
                    }
                }
            }
        }
    };

    return (
        <>
            {currentStep !== 3 && <div className="ml-[200px] mt-[40px]" style={{ display: 'flex', justifyContent: 'center', maxWidth: "1200px" }}>
                <Stepper
                    steps={steps}
                    currentStep={currentStep}
                    onStepClick={handleStepChange}
                />
            </div>}
            {currentStep === 1 && <MailboxCreation setEmailBoxes={handleCreateEmailBoxes} />}
            {currentStep === 2 && (
                <EmailsDisplay 
                    emails={emailBoxes} 
                    onRegister={handleRegister} 
                    onDelete={(_, updatedList) => {
                        setEmailBoxes(updatedList);
                        // Update localStorage when emails are deleted
                        localStorage.setItem('finalMailboxes', JSON.stringify(updatedList));
                    }} 
                />
            )}
            {currentStep === 3 && <EmailSetupScreens emails={emailBoxes} registering={registering} />}
        </>
    );
};

export default AddEmail;