import React from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { selectTopUsers } from "../features/topUsersSlice";

function Liders() {
  const user = useSelector(selectUser);
  const topUsers = useSelector(selectTopUsers) || [];
  
  // Remove the unused function
  // If you want to keep it, you need to actually use it somewhere
  
  const formatNumber = (num) => {
    // Ensure num is a number
    num = Number(num);
    
    // Handle invalid numbers
    if (isNaN(num)) return "0,00";
    
    // Convert the number to a string with a fixed number of decimal places
    let numStr = num.toFixed(3);
    
    // Split the number into integer and decimal parts
    let [intPart, decPart] = numStr.split(".");
    
    // Add thousand separators to the integer part
    intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    // If the number is less than 0.01, keep 3 decimal places
    if (num < 0.01) {
      return `${intPart},${decPart}`;
    }
    
    // For other numbers, keep 2 decimal places
    decPart = decPart.slice(0, 2);
    
    // Always return the formatted number with 2 decimal places
    return `${intPart},${decPart}`;
  };
  
  // Return a loading state or simplified view if there's no user data
  if (!user) {
    return (
      <div className="bg-gray-800 mx-4 mt-6 mb-24 h-60 rounded-lg flex items-center justify-center">
        <p className="text-white">Loading user data...</p>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800 mx-4 mt-6 mb-24 h-60 rounded-lg relative">
      <div
        className={`h-full overflow-y-auto hide-scrollbar ${
          !topUsers.some((topUser) => topUser.id === user.uid) ? "pb-12" : ""
        }`}
      >
        {topUsers.map((topUser, index) => {
          const { id, balance, firstName, lastName, userImage } = topUser;
          
          return (
            <div
              key={id || index}
              className={`${
                id === user.uid ? "bg-gray-900 rounded-lg" : ""
              } flex items-center px-2 py-1 w-full`}
            >
              <div className="flex-shrink-0 mr-4">
                <div className="bg-zinc-950 flex items-center justify-center rounded-full h-8 w-8">
                  <p className="text-white text-sm">{index + 1}</p>
                </div>
              </div>
              
              <div className="flex-shrink-0 mr-2">
                <div className="border-2 border-yellow-700 overflow-hidden flex items-center justify-center rounded-full bg-gray-800 h-10 w-10">
                  {userImage ? (
                    <img
                      className="w-9 h-9 object-contain"
                      src={userImage}
                      alt={firstName ? firstName[0].toUpperCase() : "U"}
                    />
                  ) : (
                    <div className="text-xl text-white bg-black w-full h-full flex items-center justify-center">
                      {firstName && firstName[0] ? firstName[0].toUpperCase() : "U"}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-grow min-w-0 flex items-center justify-between">
                <p className="text-white font-bold truncate mr-2">
                  {`${firstName || ""} ${lastName || ""}`.trim()}
                </p>
                <div className="flex items-center">
                  <p className="text-white whitespace-nowrap flex-shrink-0 mr-2">
                    ₿ {formatNumber(balance)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Liders;