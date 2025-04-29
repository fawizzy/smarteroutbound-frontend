import React, { useState, useEffect } from "react";
import {
  CreditCardIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  TrashIcon,
  ArrowPathIcon,
  LockClosedIcon,
} from "@heroicons/react/24/solid";
import { fetchWithAuth } from "../../utils/api";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";

const apiUrl = import.meta.env.VITE_API_URL;
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const Billing = () => {
  const [plans, setPlans] = useState([]);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [billingHistory, setBillingHistory] = useState([]);
  const [domainUsage, setDomainUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [domainLoading, setDomainLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelingSubscription, setCancelingSubscription] = useState(false);
  const [changingSubscription, setChangingSubscription] = useState(false);
  const [purchasingPlan, setPurchasingPlan] = useState(null); // New state to track which plan is being purchased

  // Check if user has any active subscription
  const hasActiveSubscription = userSubscriptions.some(
    (sub) => sub.status === "active"
  );

  // Fetch subscription plans, user's current subscriptions, and domain usage
  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setLoading(true);

        // Fetch subscription plans
        const plansResponse = await fetchWithAuth(
          `${apiUrl}/api/subscription-plans/`
        );
        const plansData = await plansResponse.json();

        // Filter out any enterprise plans
        const filteredPlans = plansData.filter(
          (plan) => !plan.name.toLowerCase().includes("enterprise")
        );

        // Fetch user's subscriptions
        const statusResponse = await fetchWithAuth(
          `${apiUrl}/api/subscription-status/`
        );
        const statusData = await statusResponse.json();

        setPlans(filteredPlans);
        setUserSubscriptions(
          Array.isArray(statusData) ? statusData : [statusData]
        );
        setLoading(false);
      } catch (err) {
        console.error("Error fetching billing data:", err);
        setError("Failed to load billing information. Please try again later.");
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  // Fetch domain usage info
  useEffect(() => {
    const fetchDomainUsage = async () => {
      try {
        setDomainLoading(true);
        const response = await fetchWithAuth(`${apiUrl}/api/user/available-slots/`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch domain usage");
        }
        
        const usageData = await response.json();
        setDomainUsage(usageData.available_slots);
        setDomainLoading(false);
      } catch (err) {
        console.error("Error fetching domain usage:", err);
        toast.error("Failed to load domain usage. Please try again later.");
        setDomainLoading(false);
      }
    };

    fetchDomainUsage();
  }, []);

  // Fetch billing history
  useEffect(() => {
    const fetchBillingHistory = async () => {
      try {
        setHistoryLoading(true);
        const response = await fetchWithAuth(`${apiUrl}/api/billing-history`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch billing history");
        }
        
        const historyData = await response.json();
        setBillingHistory(Array.isArray(historyData) ? historyData : [historyData]);
        setHistoryLoading(false);
      } catch (err) {
        console.error("Error fetching billing history:", err);
        toast.error("Failed to load billing history. Please try again later.");
        setHistoryLoading(false);
      }
    };

    fetchBillingHistory();
  }, []);

  // Handle Stripe checkout for new subscription
  const handleStripeCheckout = async (subscriptionId) => {
    try {
      setPurchasingPlan(subscriptionId); // Set which plan is being purchased
      
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

      // Redirect to Stripe checkout
      const stripe = await stripePromise;

      stripe.redirectToCheckout({ sessionId }).then((result) => {
        if (result.error) {
          console.error("Stripe checkout error:", result.error.message);
          toast.error(result.error.message);
          setPurchasingPlan(null); // Reset purchasing state on error
        }
      });
      if (!stripe) {
        throw new Error("Stripe has not been initialized properly.");
      }

      if (error) {
        toast.error(error.message);
        setPurchasingPlan(null); // Reset purchasing state on error
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Failed to process payment. Please try again later.");
      setPurchasingPlan(null); // Reset purchasing state on error
    }
  };

  // Handle subscription change (upgrade only)
  const handleChangeSubscription = async (newSubscriptionId) => {
    try {
      setChangingSubscription(true);

      // Find current active subscription
      const activeSubscription = userSubscriptions.find(
        (sub) => sub.status === "active"
      );

      if (!activeSubscription) {
        throw new Error("No active subscription found to change");
      }

      const response = await fetchWithAuth(
        `${apiUrl}/api/change-subscription/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            current_subscription_id: activeSubscription.id,
            new_subscription_id: newSubscriptionId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to change subscription");
      }

      const data = await response.json();

      // If there's a sessionId, redirect to Stripe checkout for price difference
      if (data.sessionId) {
        const stripe = await stripePromise;
        const { error } = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        });

        if (error) {
          console.error("Stripe checkout error:", error.message);
          toast.error(error.message);
        }
      } else {
        // If no sessionId, the change was processed immediately
        toast.success("Subscription changed successfully");

        // Refresh subscription status
        const statusResponse = await fetchWithAuth(
          `${apiUrl}/api/subscription-status/`
        );
        if (!statusResponse.ok) {
          throw new Error("Failed to refresh subscription status");
        }

        const statusData = await statusResponse.json();
        setUserSubscriptions(
          Array.isArray(statusData) ? statusData : [statusData]
        );
        
        // Refresh billing history
        const historyResponse = await fetchWithAuth(`${apiUrl}/api/billing-history`);
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setBillingHistory(Array.isArray(historyData) ? historyData : [historyData]);
        }
        
        // Refresh domain usage
        const usageResponse = await fetchWithAuth(`${apiUrl}/api/user/available-slots/`);
        if (usageResponse.ok) {
          const usageData = await usageResponse.json();
          setDomainUsage(usageData.available_slots);
        }
      }
    } catch (error) {
      console.error("Error changing subscription:", error);
      toast.error(
        error.message ||
          "Failed to change subscription. Please try again later."
      );
    } finally {
      setChangingSubscription(false);
    }
  };

  // Handle subscription cancellation
  const handleCancelSubscription = async (subscriptionId) => {
    try {
      setCancelingSubscription(true);

      const response = await fetchWithAuth(
        `${apiUrl}/api/cancel-subscription/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subscription_id: subscriptionId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel subscription");
      }

      toast.success("Subscription cancelled successfully");

      // Refresh subscription status
      const statusResponse = await fetchWithAuth(
        `${apiUrl}/api/subscription-status/`
      );
      if (!statusResponse.ok) {
        throw new Error("Failed to refresh subscription status");
      }

      const statusData = await statusResponse.json();
      setUserSubscriptions(
        Array.isArray(statusData) ? statusData : [statusData]
      );
      
      // Refresh billing history
      const historyResponse = await fetchWithAuth(`${apiUrl}/api/billing-history`);
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setBillingHistory(Array.isArray(historyData) ? historyData : [historyData]);
      }
      
      // Refresh domain usage
      const usageResponse = await fetchWithAuth(`${apiUrl}/api/user/available-slots/`);
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        setDomainUsage(usageData.available_slots);
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error(
        error.message ||
          "Failed to cancel subscription. Please try again later."
      );
    } finally {
      setCancelingSubscription(false);
    }
  };

  // Display subscription expiry date in readable format
  const formatExpiryDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get subscription name from ID
  const getSubscriptionName = (subscriptionId) => {
    const subscription = plans.find((plan) => plan.id === subscriptionId);
    return subscription ? subscription.name : "Unknown Plan";
  };

  // Get active subscription for current user
  const getActiveSubscription = () => {
    return userSubscriptions.find((sub) => sub.status === "active");
  };

  // Check if a plan is an upgrade from the current plan
  const isUpgrade = (planId) => {
    const activeSubscription = getActiveSubscription();
    if (!activeSubscription) return true; // All plans are available if no active subscription
    
    const currentPlan = plans.find(p => p.id === activeSubscription.subscription_id);
    const targetPlan = plans.find(p => p.id === planId);
    
    if (!currentPlan || !targetPlan) return false;
    
    // Higher price means it's an upgrade
    return targetPlan.price > currentPlan.price;
  };

  // Calculate domain usage percentages for progress bar
  const getDomainUsagePercentage = () => {
    if (!domainUsage || domainUsage.total_limit === 0) return 0;
    return (domainUsage.used_domains / domainUsage.total_limit) * 100;
  };

  if (loading || domainLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
      {/* Domain Usage Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">Domain Usage</h2>
        
        <div className="mt-2">
          <div className="flex justify-between mb-1">
            <span className="text-gray-700">
              {domainUsage?.used_domains || 0} of {domainUsage?.total_limit || 0} domains used
            </span>
            <span className="font-medium">
              {domainUsage ? `${domainUsage.available_slots} slots available` : 'No data'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${
                getDomainUsagePercentage() > 90
                  ? "bg-red-500"
                  : getDomainUsagePercentage() > 70
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${getDomainUsagePercentage()}%` }}
            ></div>
          </div>
          
          {getDomainUsagePercentage() > 90 && (
            <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-md border border-red-100 flex items-start gap-2">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p>You're running out of domain slots. Consider upgrading your plan to add more domains.</p>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-semibold mb-6">Your Subscription</h2>

        {userSubscriptions && userSubscriptions.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {userSubscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="py-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-lg">
                      {getSubscriptionName(subscription.subscription_id)}
                    </span>
                    {subscription.status === "active" && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Active
                      </span>
                    )}
                    {subscription.status === "cancelled" && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        Cancelled
                      </span>
                    )}
                    {subscription.status === "expired" && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        Expired
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4" />
                      <span>
                        {subscription.status === "active"
                          ? `Expires on ${formatExpiryDate(
                              subscription.current_period_end
                            )}`
                          : subscription.status === "cancelled"
                          ? `Cancelled - Access until ${formatExpiryDate(
                              subscription.current_period_end
                            )}`
                          : `Expired on ${formatExpiryDate(
                              subscription.current_period_end
                            )}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      <span>
                        {subscription.domains_limit === 0
                          ? "Unlimited domains"
                          : `${domainUsage?.used_domains || 0} of ${
                              subscription.domains_limit
                            } domains used`}
                      </span>
                    </div>
                  </div>
                </div>

                {subscription.status === "active" && (
                  <button
                    onClick={() => handleCancelSubscription(subscription.id)}
                    disabled={cancelingSubscription}
                    className="ml-4 p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full disabled:opacity-50"
                    title="Cancel Subscription"
                  >
                    {cancelingSubscription ? (
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    ) : (
                      <TrashIcon className="h-5 w-5" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">
              You don't have any active subscriptions.
            </p>
            <p className="mt-2">Choose a plan below to get started.</p>
          </div>
        )}
      </div>

      {/* Available Plans */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold mb-6">
          {hasActiveSubscription
            ? "Change Your Subscription"
            : "Available Plans"}
        </h3>

        {hasActiveSubscription && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-3">
              <ExclamationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-blue-800">
                  You can upgrade your current subscription at any time. Downgrades are not supported.
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
            const isCurrentPlan =
              activeSubscription &&
              activeSubscription.subscription_id === plan.id;
            const canUpgrade = !isCurrentPlan && (!hasActiveSubscription || isUpgrade(plan.id));
            const isDowngrade = hasActiveSubscription && !isCurrentPlan && !isUpgrade(plan.id);
            const isPurchasing = purchasingPlan === plan.id;

            // Skip enterprise plans
            if (plan.name.toLowerCase().includes("enterprise")) {
              return null;
            }

            return (
              <div
                key={plan.id}
                className={`border rounded-lg p-6 ${
                  isCurrentPlan
                    ? "border-blue-300 bg-blue-50"
                    : isDowngrade
                    ? "border-gray-200 opacity-60"
                    : "border-gray-200"
                }`}
              >
                {isCurrentPlan && (
                  <div className="mb-3">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}

                {isDowngrade && (
                  <div className="mb-3">
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <LockClosedIcon className="h-3 w-3" />
                      <span>Downgrade Not Available</span>
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
                        : `Up to ${plan.domains_limit} domains`}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <span>Custom domain redirects</span>
                  </li>
                  {plan.features &&
                    plan.features.map((feature, idx) => (
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
                ) : isDowngrade ? (
                  <button
                    disabled={true}
                    className="w-full mt-6 bg-gray-100 text-gray-400 py-2 px-4 rounded-md cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <LockClosedIcon className="h-4 w-4" />
                    <span>Downgrade Not Available</span>
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
                        <span>Upgrade to This Plan</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleStripeCheckout(plan.id)}
                    disabled={purchasingPlan !== null} // Disable all purchase buttons when any plan is being purchased
                    className="w-full mt-6 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isPurchasing ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCardIcon className="h-4 w-4" />
                        <span>Purchase Plan</span>
                      </>
                    )}
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
          {historyLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : billingHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Plan
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Start Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      End Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {billingHistory.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.plan_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatExpiryDate(record.start_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatExpiryDate(record.end_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${record.price.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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