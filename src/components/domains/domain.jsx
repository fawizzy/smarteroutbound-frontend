import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import DomainTableRow from "./domainRows";
import { fetchWithAuth } from "../../utils/api";
import Modal from "../modal/modal";
import DomainSuggestion from "../domain_suggestions/domain_suggestion";
import Stepper from "../stepper/stepper";

const DomainTable = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [domains, setDomains] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate(); // Initialize the navigate function

  const getDomains = () => {
    setIsLoading(true);
    fetchWithAuth(`${apiUrl}/api/user/domains`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setDomains(data.detail.domains);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getDomains();
  }, []);

  const navigateToAddDomains = () => {
    navigate("/add-domains"); // Use navigate instead of window.location.href
  };

  return (
    <>
      <div className="p-4 m-4 bg-white dark:bg-slate-800 rounded-md shadow">
        <div className="xl:w-full  min-h-[calc(100vh-138px)] relative pb-14 ">
          <div className="grid md:grid-cols-12 lg:grid-cols-12 xl:grid-cols-12 gap-4 mb-4">
            <div className="sm:col-span-12  md:col-span-12 lg:col-span-12 xl:col-span-12 ">
              <div className="bg-white dark:bg-slate-800 shadow  rounded-md w-full relative">
                <div className="border-b border-dashed border-slate-200 dark:border-slate-700 py-3 px-4 dark:text-slate-300/70 flex justify-between items-center">
                  <h4 className="font-medium">Domains</h4>
                  <button
                    onClick={navigateToAddDomains}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Add Domains
                  </button>
                </div>

                <div className="grid grid-cols-1 p-4">
                  <div className="sm:-mx-6 lg:-mx-8">
                    <div className="relative overflow-x-auto block w-full sm:px-6 lg:px-8">
                      {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      ) : (
                        <table
                          className="w-full border-collapse"
                          id="datatable_1"
                        >
                          <thead className="bg-gray-50 dark:bg-gray-600/20">
                            <tr>
                              <th
                                scope="col"
                                className="p-3 text-xs font-medium tracking-wider text-left text-gray-700 dark:text-gray-400 uppercase"
                              >
                                Domain Name
                              </th>
                              <th
                                scope="col"
                                className="p-3 text-xs font-medium tracking-wider text-left text-gray-700 dark:text-gray-400 uppercase"
                              >
                                Redirect Domain
                              </th>
                              <th
                                scope="col"
                                className="p-3 text-xs font-medium tracking-wider text-left text-gray-700 dark:text-gray-400 uppercase"
                              >
                                Active
                              </th>
                              <th
                                scope="col"
                                className="p-3 text-xs font-medium tracking-wider text-left text-gray-700 dark:text-gray-400 uppercase"
                              >
                                Created
                              </th>
                              {/* <th
                                scope="col"
                                className="p-3 text-xs font-medium tracking-wider text-left text-gray-700 dark:text-gray-400 uppercase"
                              >
                                Actions
                              </th> */}
                            </tr>
                          </thead>
                          <tbody>
                            {domains &&
                              domains.map((domain) => (
                                <DomainTableRow
                                  key={domain.id}
                                  email={domain.domain_name}
                                  domain={domain.redirect_domain}
                                  created={domain.created_at}
                                  active={domain.active}
                                />
                              ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal show={showModal} onClose={() => setShowModal(false)} title="Add Domain">
        <Stepper currentStep={1} />
        <DomainSuggestion />
      </Modal>
    </>
  );
};

export default DomainTable;