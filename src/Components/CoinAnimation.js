import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCoinShow } from "../features/coinShowSlice";
import "./CoinAnimation.css";

const CoinAnimation = ({ showAnimation }) => {
   const [coins, setCoins] = useState([]);
   const dispatch = useDispatch();
   
   useEffect(() => {
     if (showAnimation) {
       const newCoins = Array.from({ length: 70}, (_, i) => ({
         id: i,
         left: `${Math.random() * 100}%`,
         delay: `${Math.random() * 1.4}s`,
       }));
       setCoins(newCoins);

       const timer = setTimeout(() => {
         dispatch(setCoinShow(false));
         setCoinShow([]);
       }, 3000);

       return () => clearTimeout(timer);
     }
   }, [showAnimation, dispatch]);

   return (
     <div className="coin-animation-container">
       {showAnimation && (
          <div className="coin-overlay">
            {coins.map((coin) => (
              <div
                key={coin.id}
                className="coin"
                style={{ left: coin.left, animationDelay: coin.delay }}
              />   
            ))}
          </div>  
       )}
     </div>  
   );
};

export default CoinAnimation;