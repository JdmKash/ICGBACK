import React from "react";
import m from "../Assets/m.png"

function daily() {
  return (
    <div className="text-white">
      <div className="flex items-center justify-center pt-28 pb-10">
        <div className="rounded-full p-4">
          <img className="w-28 h-28 object-contain" src={m} alt="M" />  
        </div>
      </div>  
      <p className="text-center font-bold text-3x1">AirDrop</p>
      <p className="text-center text-lg mt-2">Coming very soon!</p>
    </div>
  );
}

export default daily;