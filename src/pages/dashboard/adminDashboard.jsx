import React, { useState } from "react";
import EmailTable from "../../components/emails/emails";
import DomainTable from "../../components/domains/domain";
import Billing from "../../components/billing/billing";
import AdminEmailDashboard from "../../components/email-reputation/email-reputation";

const AdminDashboardPage = () => {
  const [count, setCount] = useState(0);

  const [activeTab, setActiveTab] = useState("domains");

  const renderContent = () => {
    if (activeTab === "emails") {
      return <EmailTable />;
    } else if (activeTab === "domains") {
      return <DomainTable />;
    } else if (activeTab === "billing"){
      return <Billing/>
    }
  };

  

  return (
    <>
      <AdminEmailDashboard/>
    </>
  );
};

export default AdminDashboardPage;
