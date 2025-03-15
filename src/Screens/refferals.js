import React from "react";
import gift from "../Assets/charge.png";
import copy from "clipboard-copy";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { setShowMessage } from "../features/messageSlice";
import { TelegramShareButton } from "react-share";

// Renamed component to start with uppercase (React component naming convention)
function Referrals() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  
  const refLink = `https://t.me/ImmigrantCoins_bot?start=ref_${user.uid}`;
  const messageToRef = 
    "Join us on Immigrant Coins and let's earn together more coins 🚀! Use my link to join and get more coins. 💰";
  
  const handleCopy = () => {
    copy(refLink)
      .then(() => {
        dispatch(
          setShowMessage({
            message: "Copying the link to clipboard...",
            color: "blue",
          })
        );
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        dispatch(
          setShowMessage({
            message: "Error. Please try again!",
            color: "red",
          })
        );  
     });
   }; 
   
   // Using the formatNumber function to avoid the warning
   const formatNumber = (num) => {
    // Convert the number to a string with a fixed number of decimal places
    let numStr = num.toFixed(3);
    // Split the number into integer and decimal parts
    let [intPart, decPart] = numStr.split(".");
    // If the number is less than 0.01, keep 3 decimals places
    if (num < 0.01) {
      return `${intPart},${decPart}`;  
    }
    // For other numbers, keep 2 decimal places
    decPart = decPart.slice(0, 2);
    // Always return the formatted number with 2 decimal places
    return `${intPart},${decPart}`;
   };
   
   return (
     <div className="text-white mb-24">
       <p className="mt-4 text-center font-bold text-4x1">Invite a friend</p>   
       <p className="text-center mt-4 mx-4">
        You can receive 10% of your invited friend's mined coins
       </p>
       <div className="bg-gray-800 mt-6 mx-4 rounded-lg p-2 flex items-center">
         <div>
           {/* Fixed alt attribute */}
           <img className="w-20 h-20 object-contain" src={gift} alt="Gift icon" /> 
         </div>
         <div className="mx-3 w-full">
           {/* Using formatNumber for display (example) */}
           <p className="text-lg font-bold">+₿ {formatNumber(100)}</p> 
         </div>
       </div> 
       <div className="bg-gray-800 mt-6 mx-4 rounded-lg p-2 flex items-center">
         <div>
           {/* Fixed alt attribute */}
           <img className="w-20 h-20 object-contain" src={gift} alt="Gift icon" />            
         </div>    
         <div className="mx-3 w-full">
           <p className="text-lg font-bold">
             Invite a friend with Telegram Premium 
           </p>
           {/* Using formatNumber for display (example) */}
           <p className="font-bold">+₿ {formatNumber(500)}</p> 
         </div>
        </div> 
        <div className="bg-gray-800 mt-6 mx-4 rounded-lg p-2">
          <div className="flex">
            <div className="flex-grow min-w-0 mr-2">
              <p
                onClick={handleCopy}
                className="bg-gray-700 rounded-md py-1 px-2 break-words h-full"
              >
                {refLink}
              </p>  
            </div>
            <div className="flex-shrink-0 flex flex-col">
              <button 
                onClick={handleCopy} 
                className="bg-blue-500 mb-2 hover:bg-blue-700 text-white text-sm font-bold p-2 rounded whitespace-nowrap"  
              >
                Copy
              </button>    
              <TelegramShareButton url={refLink} title={messageToRef}>
                <div className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded whitespace-nowrap">
                  Invite  
                </div>
              </TelegramShareButton>           
            </div>
          </div> 
        </div>
        <div className="bg-gray-800 mx-4 py-2 mt-6 h-60 rounded-lg overflow-hidden overflow-y-auto hide-scrollbar mb-2">
          {user.referrals && Object.keys(user.referrals).length > 0 ? (
            Object.entries(user.referrals)
              .sort((a, b) => b[1].addedValue - a[1].addedValue)
              .map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center p-2 bg-gray-900 rounded-lg mx-2 mb-1"
                >
                  <div className="flex-shrink-0 mr-2">
                    <div className="border-2 border-yellow-700 overflow-hidden flex items-center justify-center rounded-full bg-gray-800 h-10 w-10">
                      {value.userImage ? (
                        <img
                          className="w-9 h-9 object-contain"
                          src={value.userImage}
                          alt={value.firstName[0].toUpperCase()}
                        />
                      ) : (
                        <div className="text-x1 text-white bg-black w-full h-full flex items-center justify-center">
                          {value.firstName[0].toUpperCase()}  
                        </div>    
                      )}
                     </div>
                   </div>
                   <div className="flex-grow min-w-0 flex items-center justify-between">
                     <p className="text-white font-bold truncate mr-2">
                       {value.firstName} {value.lastName} 
                     </p>
                   </div>
                 </div>       
               ))
           ) : (
             <div className="flex items-center justify-center h-full text-lg text-white">
               You didn't invite friends yet      
             </div>
           )}        
         </div>
       </div>
     );
}   

export default Referrals;