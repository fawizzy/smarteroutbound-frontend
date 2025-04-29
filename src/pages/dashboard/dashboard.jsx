import React, { useState, useEffect } from "react";
import EmailTable from "../../components/emails/emails";
import DomainTable from "../../components/domains/domain";
import Billing from "../../components/billing/billing";
import SubscriptionNotification from "../../components/subscription-notification/SubscriptionNotification";
import { useNavigate, useLocation } from "react-router-dom";

const DashboardPage = () => {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("domains");

  // Set the active tab based on URL parameters or path
  useEffect(() => {
    // Check if we should show the billing tab when redirected back from Stripe
    const urlParams = new URLSearchParams(location.search);
    const subscriptionParam = urlParams.get("subscription");
    
    if (subscriptionParam === "success" || subscriptionParam === "cancelled") {
      setActiveTab("billing");
    }
  }, [location]);

  const renderContent = () => {
    if (activeTab === "emails") {
      return <EmailTable />;
    } else if (activeTab === "domains") {
      return <DomainTable />;
    } else if (activeTab === "billing"){
      return <Billing/>;
    }
  };

  return (
    <>
      {/* Add the notification component */}
      <SubscriptionNotification />
      
      <div className="p-0 xl:p-4">
        <div className="mb-4 border-b border-dashed border-gray-200 dark:border-gray-700 flex flex-wrap justify-start lg:justify-between">
          <ul className="flex flex-wrap mb-5 lg:-mb-px" id="myTab">
            <li className="mr-2" role="presentation">
              <button
                onClick={() => setActiveTab("domains")}
                className={`inline-block py-4 px-4 text-sm font-medium text-center rounded-t-lg border-b-2 ${
                  activeTab === "domains"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
                id="Projects-tab"
                type="button"
                role="tab"
                aria-controls="Projects"
                aria-selected={activeTab === "domains"}
              >
                Domains
              </button>
            </li>
            <li className="mr-2" role="presentation">
              <button
                onClick={() => setActiveTab("emails")}
                className={`inline-block py-4 px-4 text-sm font-medium text-center rounded-t-lg border-b-2 ${
                  activeTab === "emails"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
                id="Groups-tab"
                type="button"
                role="tab"
                aria-controls="Groups"
                aria-selected={activeTab === "emails"}
              >
                Emails
              </button>
            </li>
            <li className="mr-2" role="presentation">
              <button
                onClick={() => setActiveTab("billing")}
                className={`inline-block py-4 px-4 text-sm font-medium text-center rounded-t-lg border-b-2 ${
                  activeTab === "billing"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
                id="Billing-tab"
                type="button"
                role="tab"
                aria-controls="Billing"
                aria-selected={activeTab === "billing"}
              >
                Billing
              </button>
            </li>
          </ul>
        </div>
      </div>
      {renderContent()}
    </>
  );
};

export default DashboardPage;