import React, { useEffect, useState } from "react";
import airdrops from "../Assets/apple-touch-icon.png";
import refferals from "../Assets/telegramLogo.png";
import Daily from "../Assets/charge.png";
import Earn from "../Assets/walletpic.png";
import Home from "../Assets/pc.png";
import { useLocation, useNavigate } from "react-router-dom"; // Fixed import

function BottomNavigation() {
    const navigate = useNavigate();
    const location = useLocation();

    const [currentScreen, setCurrentScreen] = useState("/"); // Fixed typo

    useEffect(() => {
        setCurrentScreen(location.pathname);
    }, [location]);

    return (
      <nav className="fixed px-[6px] text-white bottom-2 left-4 right-4 rounded-lg bg-black flex justify-around items-center h-[76px] z-50">
        <div
          onClick={() => navigate("/")}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg ${
            currentScreen === "/" ? "bg-black" : "bg-gray-900"
          }`}
        >
          <div className="flex flex-col items-center justify-center">
            <img className="w-7 h-7 object-contain" src={Home} alt="M" />
            <p className="text-xs text-center">Home</p>
          </div>
        </div>
        <div
          onClick={() => navigate("/Earn")}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg ${
            currentScreen === "/" ? "bg-black" : "bg-gray-900"
          }`}
        >
          <div className="flex flex-col items-center justify-center">
            <img className="w-7 h-7 object-contain" src={Earn} alt="M" />
            <p className="text-xs text-center">Earn</p>
          </div>
        </div>
        <div
          onClick={() => navigate("/airdrops")}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg ${
            currentScreen === "/" ? "bg-black" : "bg-gray-900"
          }`}
        >
          <div className="flex flex-col items-center justify-center">
            <img className="w-7 h-7 object-contain" src={airdrops} alt="M" />
            <p className="text-xs text-center">AirDrops</p>
          </div>
        </div>
        <div
          onClick={() => navigate("/refferals")}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg ${
            currentScreen === "/" ? "bg-black" : "bg-gray-900"
          }`}
        >
          <div className="flex flex-col items-center justify-center">
            <img className="w-7 h-7 object-contain" src={refferals} alt="M" />
            <p className="text-xs text-center">Refferals</p>
          </div>
        </div>
        <div
          onClick={() => navigate("/Daily")}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg ${
            currentScreen === "/" ? "bg-black" : "bg-gray-900"
          }`}
        >
          <div className="flex flex-col items-center justify-center">
            <img className="w-7 h-7 object-contain" src={Daily} alt="M" />
            <p className="text-xs text-center">Daily</p>
          </div>
        </div>
      </nav>
    );
}

export default BottomNavigation;
