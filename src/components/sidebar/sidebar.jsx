import React from "react";

const Sidebar = () => {
  return (
    <>
      <div className="flex items-center">
        <div className="ltr:mr-2 ltr:lg:mr-4 rtl:mr-0 rtl:ml-2 rtl:lg:mr-0 rtl:lg:ml-4 ml-auto block">
          <button
            id="toggle-menu-hide-2"
            className="button-menu-mobile-2 flex rounded-full md:mr-0 relative"
            aria-label="Toggle Sidebar"
          >
            
            <i className="ti ti-chevrons-left top-icon text-3xl"></i>
          </button>
        </div>
      </div>

      <div className="menu-body h-[calc(100vh-60px)] p-4" data-simplebar>
        <div id="Icon-menu">
          <div className="show" id="Dashboards" role="tabpanel">
            <div className="title-box mb-3">
              <h6 className="text-sm font-medium uppercase text-slate-400">
                Dashboards
              </h6>
            </div>
            <ul className="nav flex-col flex flex-wrap pl-0 mb-0">
              {[
                { name: "Analytics", link: "index-2.html" },
                { name: "Crypto", link: "crypto-index.html" },
                { name: "CRM", link: "crm-index.html" },
                { name: "Project", link: "project-index.html" },
                { name: "Ecommerce", link: "ecommerce-index.html" },
                { name: "Helpdesk", link: "helpdesk-index.html" },
              ].map((item, index) => (
                <li key={index} className="nav-item relative block">
                  <a
                    href={item.link}
                    className="nav-link hover:bg-gray-50 hover:text-primary-500 dark:hover:bg-gray-800/20 rounded-md dark:hover:text-primary-500 relative font-medium text-sm flex items-center h-[38px] decoration-0 px-2 py-4"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
