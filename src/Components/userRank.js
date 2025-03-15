import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";

function UserRank() {
  const user = useSelector(selectUser);
  const levelNames = useMemo(
    () => [
      "Beginner",
      "Wood",
      "Bronze",
      "Silver",
      "Gold",
      "Platinum",
      "Diamond",
      "Epic",
      "Legendary",
      "Master",
      "GrandMaster",
      "Boss",
    ],
    []
  );
  const levelMinPoints = useMemo(
    () => [
      0, 1000, 10000, 50000, 100000, 500000, 1000000, 10000000, 50000000,
      100000000, 500000000, 1000000000,
    ],
    []
  );
  const [levelIndex, setLevelIndex] = useState(0);

  const calculateProgress = () => {
    if (!user) return 0; // Return 0 progress if user doesn't exist
    
    if (levelIndex >= levelNames.length - 1) {
      return 100;
    }
    const currentLevelMin = levelMinPoints[levelIndex];
    const nextLevelMin = levelMinPoints[levelIndex + 1];
    const progress =
      ((user.balance - currentLevelMin) / (nextLevelMin - currentLevelMin)) *
      100;
    return Math.min(progress, 100);
  };

  useEffect(() => {
    // Only run this effect if user exists
    if (user) {
      const currentLevelMin = levelMinPoints[levelIndex];
      const nextLevelMin = levelMinPoints[levelIndex + 1];
      if (user.balance >= nextLevelMin && levelIndex < levelNames.length - 1) { 
        setLevelIndex(levelIndex + 1); // Changed from decrementing to incrementing
      } else if (user.balance < currentLevelMin && levelIndex > 0) {
        setLevelIndex(levelIndex - 1);
      }
    }
  }, [user, levelIndex, levelMinPoints, levelNames]);

  // Return loading state if user data isn't available yet
  if (!user) {
    return <div className="flex items-center mx-4 mt-6">Loading user data...</div>;
  }

  return (
    <div className="flex items-center mx-4 mt-6">
      <div className="z-20">
        <div className="border-4 border-blue-700 flex items-center justify-center rounded-full bg-gray-800 w-14 h-14 overflow-hidden">
          {user.userImage ? (
            <img
              className="object-contain"
              src={user.userImage}
              alt={user.firstName[0].toUpperCase()}
            />
          ) : (
            <div className="text-2x1 text-white bg-black w-14 h-14 flex items-center justify-center">
              {user.firstName[0].toUpperCase()}    
            </div>
          )}
        </div>
      </div>
      <div className="-ml-3 w-full z-10">
        <p className="text-sm mb-1 tracking-wider text-white ml-6">
          Your rank is {levelNames[levelIndex]}
          <span className="mx-4">{">"}</span>
          {levelIndex + 1}/{levelNames.length}  
        </p>
        <div className="flex items-center border-2 border-[#43434b] rounded-r-full">
          <div className="w-full h-3 bg-[#43433b]/[0.6] rounded-full">
            <div
              className="progress-gradient h-3 rounded-full"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>  
        </div>
      </div>
    </div>
  );
}

export default UserRank;