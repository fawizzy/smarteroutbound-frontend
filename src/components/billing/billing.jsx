import React, { useState, useEffect } from "react";
import {
  CreditCardIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  TrashIcon,
  ArrowPathIcon
} from "@heroicons/react/24/solid";
import { fetchWithAuth } from "../../utils/api";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";

const apiUrl = import.meta.env.VITE_API_URL;
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const Billing = () => {
  const [plans, setPlans] = useState([]);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelingSubscription, setCancelingSubscription] = useState(false);
  const [changingSubscription, setChangingSubscription] = useState(false);

  // Check if user has any active subscription
  const hasActiveSubscription = userSubscriptions.some(sub => sub.status === 'active');

  // Fetch subscription plans and user's current subscriptions
  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setLoading(true);
        
        // Fetch subscription plans
        const plansResponse = await fetchWithAuth(`${apiUrl}/api/subscription-plans/`);
        const plansData = await plansResponse.json();
        
        // Fetch user's subscriptions
        const statusResponse = await fetchWithAuth(`${apiUrl}/api/subscription-status/`);
        const statusData = await statusResponse.json();
        
        setPlans(plansData);
        setUserSubscriptions(Array.isArray(statusData) ? statusData : [statusData]);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching billing data:", err);
        setError("Failed to load billing information. Please try again later.");
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  // Handle Stripe checkout for new subscription
  const handleStripeCheckout = async (subscriptionId) => {
    try {
      const response = await fetchWithAuth(`${apiUrl}/api/checkout-session/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription_id: subscriptionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { sessionId } = await response.json();
      console.log("Session ID:", sessionId);
      
      // Redirect to Stripe checkout
      const stripe = await stripePromise;

      stripe.redirectToCheckout({ sessionId })
        .then((result) => {
          if (result.error) {
            console.error("Stripe checkout error:", result.error.message);
            toast.error(result.error.message);
          }
        })
      if (!stripe) {
        throw new Error("Stripe has not been initialized properly.");
      }
      
      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Failed to process payment. Please try again later.");
    }
  };

  // Handle subscription change
  const handleChangeSubscription = async (newSubscriptionId) => {
    try {
      setChangingSubscription(true);
      
      // Find current active subscription
      const activeSubscription = userSubscriptions.find(sub => sub.status === 'active');
      
      if (!activeSubscription) {
        throw new Error("No active subscription found to change");
      }
      
      const response = await fetchWithAuth(`${apiUrl}/api/change-subscription/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_subscription_id: activeSubscription.id,
          new_subscription_id: newSubscriptionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to change subscription");
      }

      const { sessionId } = await response.json();
      
      // If there's a price difference, redirect to Stripe checkout
      if (sessionId) {
        const stripe = await stripePromise;
        stripe.redirectToCheckout({ sessionId })
          .then((result) => {
            if (result.error) {
              console.error("Stripe checkout error:", result.error.message);
              toast.error(result.error.message);
            }
          });
      } else {
        // If no price difference or proration, refresh subscription data
        toast.success("Subscription changed successfully");
        
        // Refresh subscription status
        const statusResponse = await fetchWithAuth(`${apiUrl}/api/subscription-status/`);
        const statusData = await statusResponse.json();
        setUserSubscriptions(Array.isArray(statusData) ? statusData : [statusData]);
      }
    } catch (error) {
      console.error("Error changing subscription:", error);
      toast.error(error.message || "Failed to change subscription. Please try again later.");
    } finally {
      setChangingSubscription(false);
    }
  };

  // Handle subscription cancellation
  const handleCancelSubscription = async (subscriptionId) => {
    try {
      setCancelingSubscription(true);
      
      const response = await fetchWithAuth(`${apiUrl}/api/cancel-subscription/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription_id: subscriptionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      toast.success("Subscription cancelled successfully");
      
      // Refresh subscription status
      const statusResponse = await fetchWithAuth(`${apiUrl}/api/subscription-status/`);
      const statusData = await statusResponse.json();
      setUserSubscriptions(Array.isArray(statusData) ? statusData : [statusData]);
      
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("Failed to cancel subscription. Please try again later.");
    } finally {
      setCancelingSubscription(false);
    }
  };

  // Display subscription expiry date in readable format
  const formatExpiryDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Calculate total domains available across all subscriptions
  const calculateTotalDomains = () => {
    if (!userSubscriptions || userSubscriptions.length === 0) return 0;
    
    return userSubscriptions.reduce((total, sub) => {
      // If any subscription has unlimited domains, return "Unlimited"
      if (sub.domains_limit === 0) return "Unlimited";
      // Otherwise add to the total
      return total === "Unlimited" ? total : total + sub.domains_limit;
    }, 0);
  };

  // Get subscription name from ID
  const getSubscriptionName = (subscriptionId) => {
    const subscription = plans.find(plan => plan.id === subscriptionId);
    return subscription ? subscription.name : "Unknown Plan";
  };

  // Get active subscription for current user
  const getActiveSubscription = () => {
    return userSubscriptions.find(sub => sub.status === 'active');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 flex justify-center">
        <svg
          className="animate-spin h-10 w-10 text-blue-500"
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
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-red-50 p-4 rounded-md border border-red-200">
          <div className="flex items-center">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 mt-4">
      {/* Subscription Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Your Subscription</h2>
          <div className="text-gray-700">
            <span className="font-medium">Total Domains Available: </span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              {calculateTotalDomains()}
            </span>
          </div>
        </div>
        
        {userSubscriptions && userSubscriptions.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {userSubscriptions.map((subscription) => (
              <div key={subscription.id} className="py-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-lg">
                      {getSubscriptionName(subscription.subscription_id)}
                    </span>
                    {subscription.status === 'active' && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Active
                      </span>
                    )}
                    {subscription.status === 'cancelled' && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        Cancelled
                      </span>
                    )}
                    {subscription.status === 'expired' && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        Expired
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4" />
                      <span>
                        {subscription.status === 'active' 
                          ? `Expires on ${formatExpiryDate(subscription.end_date)}`
                          : subscription.status === 'cancelled'
                          ? `Cancelled - Access until ${formatExpiryDate(subscription.end_date)}`
                          : `Expired on ${formatExpiryDate(subscription.end_date)}`
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      <span>
                        {subscription.domains_limit === 0 
                          ? "Unlimited domains" 
                          : `${subscription.domains_used || 0} of ${subscription.domains_limit} domains used`
                        }
                      </span>
                    </div>
                  </div>
                </div>
                
                {subscription.status === 'active' && (
                  <button
                    onClick={() => handleCancelSubscription(subscription.id)}
                    disabled={cancelingSubscription}
                    className="ml-4 p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full disabled:opacity-50"
                    title="Cancel Subscription"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">You don't have any active subscriptions.</p>
            <p className="mt-2">Choose a plan below to get started.</p>
          </div>
        )}
      </div>

      {/* Available Plans */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold mb-6">
          {hasActiveSubscription ? "Change Your Subscription" : "Available Plans"}
        </h3>
        
        {hasActiveSubscription && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-3">
              <ExclamationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-blue-800">
                  You already have an active subscription. Choosing a new plan will replace your current subscription.
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  Any remaining time on your current plan will be prorated towards your new subscription.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const activeSubscription = getActiveSubscription();
            const isCurrentPlan = activeSubscription && activeSubscription.subscription_id === plan.id;
            
            return (
              <div 
                key={plan.id} 
                className={`border rounded-lg p-6 ${isCurrentPlan ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}
              >
                {isCurrentPlan && (
                  <div className="mb-3">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}
                
                <h3 className="text-xl font-medium capitalize">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-gray-500">/quarter</span>
                </div>
                
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <span>
                      {plan.domains_limit === 0 
                        ? "Unlimited domains" 
                        : `Up to ${plan.domains_limit} domains`
                      }
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <span>Custom domain redirects</span>
                  </li>
                  {plan.features && plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {isCurrentPlan ? (
                  <button
                    disabled={true}
                    className="w-full mt-6 bg-blue-100 text-blue-500 py-2 px-4 rounded-md cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>Current Plan</span>
                  </button>
                ) : hasActiveSubscription ? (
                  <button
                    onClick={() => handleChangeSubscription(plan.id)}
                    disabled={changingSubscription}
                    className="w-full mt-6 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {changingSubscription ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <ArrowPathIcon className="h-4 w-4" />
                        <span>Switch to This Plan</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleStripeCheckout(plan.id)}
                    className="w-full mt-6 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 flex items-center justify-center gap-2"
                  >
                    <CreditCardIcon className="h-4 w-4" />
                    <span>Purchase Plan</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Billing History */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold mb-4">Billing History</h3>
        
        <div className="border-t border-gray-200">
          {userSubscriptions && userSubscriptions.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userSubscriptions.map((subscription) => (
                  <tr key={subscription.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getSubscriptionName(subscription.subscription_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatExpiryDate(subscription.start_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatExpiryDate(subscription.end_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${subscription.status === 'active' ? 'bg-green-100 text-green-800' : 
                          subscription.status === 'cancelled' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-4 flex items-center justify-between text-sm text-gray-500">
              <span>No payment records found</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Billing;