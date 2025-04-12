import React from "react";

const DomainTableRow = ({ email, domain, created, active }) => {
  const formattedCreated = new Date(created).toLocaleDateString();
  return (
    <tr className="bg-white border-b border-dashed dark:bg-gray-800 dark:border-gray-700">
      <td className="p-3 text-sm font-medium whitespace-nowrap dark:text-white">
        {email}
      </td>
      <td className="p-3 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
        {domain}
      </td>
      <td className="p-3 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
        {`${active}`}
      </td>
      <td className="p-3 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
        {formattedCreated}
      </td>
    </tr>
  );
};

export default DomainTableRow;