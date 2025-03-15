import React, { useEffect, useState } from "react";
import youtubeLogo from "../Assets/youtubeLogo.png";
import telegramLogo from "../Assets/telegramLogo.png";
import xLogo from "../Assets/apple-touch-icon.png";
import friends from "../Assets/f.png";
import monetagLogo from "../Assets/f.png"; // Import your Monetag logo
import checkLogo from "../Assets/checkLogo.png";
import LoadingModul from "./LoadingModul";
import { useDispatch, useSelector } from "react-redux";
import { setShowMessage } from "../features/messageSlice";
import { setCoinShow } from "../features/coinShowSlice";
import { db } from "../firebase";
import { doc, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";
import { selectUser } from "../features/userSlice";
import { useNavigate } from "react-router-dom";

function LinkButton ({ image, name, amount, link, onClick, disabled }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const [checking, setChecking] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [canClaim, setCanClaim] = useState(false);

  const handleClick = (e) => {
    if (disabled) return; // Prevent action if disabled
    if (onClick) {
      onClick(e);
    } else {
      getToLink();
    }
  };

  const formatNumber = (num) => {
    // Const the number to a string with a fixed number of decimal places
    let numStr = num.toFixed(3);

    //Split the number into integar and decimal parts
    let [intPart, decPart] = numStr.split(".");

    // Add thousand seperators to the integar part
    intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    //if the number ia less than 0.01, keep 3 decimal places
    if (num < 0.01) {
      return `${intPart}, ${decPart}`;
    }

    // For other numbers, keep 2 decimal places
    decPart = decPart.slice(0, 2);

    // Always return the formatted number
    return `${intPart},${decPart}`;
  };

  const getToLink = async () => {
    if (link === "referral") {
      navigate("/shares");
    } else if (link === "watch-ad") {
      // Call Monetag's rewarded popup function
      if (window.show_9041692) {
        try {
          await window.show_9041692('pop')
            .then(() => {
              // User watched ad or closed it in interstitial format
              // Update user's adsWatched count and reward them
              updateAdWatched();
            })
            .catch(e => {
              // User got error during playing ad
              console.error("Ad error:", e);
              dispatch(
                setShowMessage({
                  message: "Error loading ad. Please try again!",
                  color: "red",
                })
              );
            });
        } catch (error) {
          console.error("Error with ad:", error);
          dispatch(
            setShowMessage({
              message: "Error with ad. Please try again!",
              color: "red",
            })
          );
        }
      } else {
        dispatch(
          setShowMessage({
            message: "Ad service not available. Please try again later!",
            color: "red",
          })
        );
      }
    } else {
      if (user.links && user.links[link]) {
        window.open(link, "_blank");
      } else {
        try {
          window.open(link, "_blank");
          await setDoc(
            doc(db, "users", user.uid),
            {
              links:{
                [link]: {
                  claimed: false,
                  time: serverTimestamp(),
                },
              },
            },
            { merge: true }  
          );
        } catch (error) {  
          console.error("Error updating link data:", error);
          dispatch(
            setShowMessage({
              message: "Error. Please try again!",
              color: "red",
            })
          );
        } 
      }
    }
  };
  
  // Update adsWatched count and reward user after watching an ad
  const updateAdWatched = async () => {
    try {
      const newAdsWatched = (user.adsWatched || 0) + 1;
      
      await setDoc(
        doc(db, "users", user.uid),
        {
          adsWatched: newAdsWatched,
          balance: user.balance + amount,
        },
        { merge: true }
      );
      
      dispatch(
        setShowMessage({
          message: "Ad watched! Coins added to your balance.",
          color: "green",
        })
      );
      dispatch(setCoinShow(true));
    } catch (error) {
      console.error("Error updating ad watch count:", error);
      dispatch(
        setShowMessage({
          message: "Error updating rewards. Please try again!",
          color: "red",
        })
      );
    }
  };

  const claimRewards = async () => {
    try {
      dispatch(
        setShowMessage({
          message: "Claiming rewards in progress...",
          color: "green",
        })
      );
      dispatch(setCoinShow(true));
        await setDoc(
          doc(db, "users", user.uid),
          {
            links: {
              [link]: {
                claimed: true,
              },
            },
            balance: user.balance + amount,
          },
          { merge: true }  
        );
      } catch (error) {
        console.error("Error claiming rewards:", error);
        dispatch(
          setShowMessage({
            message:"Error please try again!",
            color: "red",
          })
        );
        dispatch(setCoinShow(false));     
      }
    };

    useEffect(() => {
      setIsClicked(false);
      setChecking(false);
      setIsClaimed(false);
      setCanClaim(false);

      // Check if user.links and user.links[link] exist
      if (user.links && user.links[link]) {
        setIsClicked(true);
        
        if (user.links[link].claimed) {
          setIsClaimed(true);
        } else {
          // Safely access time property with null checks
          const now = Timestamp.now();
          // Check if time exists and is a Timestamp object with toMillis method
          const linkTime = user.links[link].time;
          
          if (!linkTime) {
            setChecking(true);
          } else {
            try {
              const timeDiff = now.toMillis() - linkTime.toMillis();
              
              if (timeDiff < 3600000) {
                setChecking(true);
              } else if (timeDiff > 3600000) {
                setCanClaim(true);
              }
            } catch (error) {
              console.error("Error calculating time difference:", error);
              setChecking(true);
            }
          }
        }
      }
    }, [user.links, link]); 

    useEffect(() => {
      // Add null check for user.links
      if (
        link === "referral" &&
        user.referrals && 
        Object.keys(user.referrals).length >= 10 &&
        (!user.links || !user.links[link])
      ) {
        const setLink = async () => {
          try {
            await setDoc(
              doc(db, "users", user.uid),
              {
                links: {
                  [link]: {
                    claimed: false,
                    time: serverTimestamp(),
                  },
                },
              },
              { merge: true}
            );
          } catch (error) {
            console.error('Error updating link data:', error);
            dispatch(
              setShowMessage({
                message: "Error. Please try again!",
                color: "red",
              })
            );
          }
        };

        setLink();
      }
    }, [link, user, dispatch]);

   return (
    <div
      onClick={handleClick}
      className={`bg-gray-900 rounded-xl flex items-center p-2 mb-2 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <div className="flex items-center justify-center w-[80px]">
        <img
          className="object-contain"
          style={{
            height: image === "telegram" ? 50 : image === "referral" ? 50 : image === "monetag" ? 50 : 60,
            width: image === "telegram" ? 50 : image === "referral" ? 50 : image === "monetag" ? 50 : 60,
          }}
          src={
            image === "youtube"
              ? youtubeLogo
              : image === "telegram"
              ? telegramLogo
              : image === "x"
              ? xLogo
              : image === "referral"
              ? friends
              : image === "monetag"
              ? monetagLogo
              : null
          }
          alt="L"
        />
      </div>
      <div className="mx-3 w-full">
        <p className="text-sm">{name}</p>
        <p className="font-bold">+₿ {formatNumber(amount)}</p>
      </div>
      {!onClick && isClicked && (
        <div>
          {checking ? (
            <div className="mr-2">
              <LoadingModul size={26} />
            </div>
          ) : (
            <div className="mr-1" onClick={(e) => e.stopPropagation()}>
              {isClaimed ? (
                <img
                  className="w-12 h-12 object-contain"
                  src={checkLogo}
                  alt="C"
                />
              ) : canClaim ? (
                <button
                  onClick={claimRewards}
                  className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold px-2 py-1 rounded"
                >
                  Claim
                </button>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LinkButton;