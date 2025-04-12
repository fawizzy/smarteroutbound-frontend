import React, { useState, useEffect } from "react";
import {
  CreditCardIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { fetchWithAuth } from "../../utils/api";
import { toast } from "react-toastify";


const apiUrl = import.meta.env.VITE_API_URL;

const Billing = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleBuyPackage = async (subscriptionId) => {
    try {
      const response = await fetchWithAuth(`${apiUrl}/api/add-subscription/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          subscription_id: subscriptionId,
          duration_days: 90,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to purchase subscription");
      }

      const data = await response.json();
      console.log("Subscription purchased successfully:", data);
      toast.success("Subscription purchased successfully!");
      // Optionally, you can redirect the user or update the UI here
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    } catch (error) {
      console.error("Error purchasing subscription:", error);
      setError("Failed to purchase subscription. Please try again later.");
      toast.error("Failed to purchase subscription. Please try again later.");
    }
  };
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await fetchWithAuth(`${apiUrl}/api/subscriptions`);
        const data = await response.json();
        
        // Transform the backend data to match the expected format
        const formattedPlans = data.subscriptions
          .sort((a, b) => a.id - b.id)
          .map(plan => ({
            id: plan.id,
            name: plan.name.toLowerCase(),
            price: plan.price,
            domains: plan.domains_limit === 0 ? "Unlimited" : plan.domains_limit
          }));
        
        setPlans(formattedPlans);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching subscription plans:", err);
        setError("Failed to load subscription plans. Please try again later.");
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 mt-4">
      {/* Current Plan Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold">Current Plan: Pro</h2>
            <p className="text-gray-600 mt-1">
              Your next payment of $49 will be processed on March 22, 2025
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancel Plan
            </button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              Change Plan
            </button>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Available Plans</h3>
        </div>
        
        {loading ? (
          <div className="flex justify-center p-8">
          <svg
            className="animate-spin h-5 w-5 text-gray-500"
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
          </div>
        ) : error ? (
          <div className="flex justify-center p-8 text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-medium capitalize">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-bold">{plan.price ? `$${plan.price}` : "Contact us"}</span>
                  <span className="text-gray-500">{plan.price ? "/quarter" : ""}</span>
                </div>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <span>{plan.domains === "Unlimited" ? `${plan.domains} domains` : `Up to ${plan.domains} domains`}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <span>Custom domain redirects</span>
                  </li>
                </ul>
                <button onClick={()=>handleBuyPackage(plan.id)} className="w-full mt-6 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
                  Buy Package
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Billing;