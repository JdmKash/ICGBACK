import React, { useState, useEffect, useCallback } from "react";
import { selectUser } from '../features/userSlice';
import { useDispatch, useSelector } from "react-redux";
import { setCalculated } from "../features/calculateSlice";

function CalculateNums() {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);

    const [waiting, setWaiting] = useState(true);
    const [mined, setMined] = useState(0);
    const [remainingTime, setRemainingTime] = useState({
      hours: 6,
      minutes: 0,
      seconds: 0,
    });
    const [progress, setProgress] = useState(0);
    const [canClaim, setCanClaim] = useState(false);
    const [updateError, setUpdateError] = useState(null);

    const MAX_MINE_RATE = 100.0;

    // Wrapping each calculation function in useCallback
    const calculateProgress = useCallback((miningStartedTime) => {
        if (!miningStartedTime) return 0;

        const now = Date.now();
        const totalMiningTime = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
        const elapsedTime = now - miningStartedTime;

        if (elapsedTime >= totalMiningTime) {
            setCanClaim(true);
            return 100; // Mining is complete
        }

        const progress = (elapsedTime / totalMiningTime) * 100;
        return Math.min(Math.max(progress, 0), 100); // Ensure progress is between
    }, [setCanClaim]);

    const calculateMinedValue = useCallback((miningStartedTime, mineRate) => {
        if (!miningStartedTime || !mineRate) return 0;

        const now = Date.now();
        const totalMiningTime = 6 * 60 * 60 * 1000; // hours in milliseconds
        let elapsedTime = now - miningStartedTime;

        elapsedTime = Math.round(elapsedTime / 1000) * 1000;

        if (elapsedTime >= totalMiningTime) {
          // Mining is complete, return maximum possible mined value
          return mineRate * (totalMiningTime / 1000);
        }

        // Calculate mined value based on elapsed time
        const minedValue = mineRate * (elapsedTime / 1000);

        // Round to 3 decimal places to avoid floating point precision issues
        return Math.round(minedValue * 1000) /1000;
    }, []);  

    const calculateRemainingTime = useCallback((miningStartedTime) => {
        if (!miningStartedTime) {
            return { hours: 6, minutes: 0, seconds: 0 };
        }

        const now = Date.now();
        const totalMiningTime = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
        const endTime = miningStartedTime + totalMiningTime;
        const remainingTime = Math.max(endTime - now, 0);

        if (remainingTime === 0) {
            return { hours: 0, minutes: 0, seconds: 0 };
        }

        const hours = Math.floor(remainingTime / (60 * 60 * 1000));
        const minutes = Math.floor(
            (remainingTime % (60 * 60 * 1000)) / (60 * 1000)
        );
        const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);

        return { hours, minutes, seconds };
    }, []);

    const addPrecise = (a, b) => {
      return parseFloat((a + b).toFixed(3));
    };

    const getUpgradeStep = (rate) => {
      if (rate < 0.01) return 0.001;
      if (rate < 0.1) return 0.01;
      if (rate < 1) return 0.1;
      return Math.pow(10, Math.floor(Math.log10(rate)));
    };

    const getUpgradePrice = (nextRate) => {
      return nextRate * 100000;
    };

    const getNextUpgradeRate = () => {
      if (!user || typeof user.mineRate !== 'number') return 0.001;
      const step = getUpgradeStep(user.mineRate);
      return Math.min(addPrecise(user.mineRate, step), MAX_MINE_RATE);
    };

    const canUpgrade = user && 
      user.balance >= getUpgradePrice(getNextUpgradeRate()) &&
      user.mineRate < MAX_MINE_RATE;

    // Update function to be called by interval - moved to useCallback
    const updateFunction = useCallback(() => {
      try {
        if (!user || !user.miningStartedTime) return;
        
        // Update progress
        const currentProgress = calculateProgress(user.miningStartedTime);
        setProgress(currentProgress);  
        
        // Update mined value
        const currentMinedValue = calculateMinedValue(
          user.miningStartedTime,
          user.mineRate  
        );
        setMined(currentMinedValue);
        
        // Update remaining time
        const timeLeft = calculateRemainingTime(user.miningStartedTime);
        setRemainingTime(timeLeft);
        
        if (
          timeLeft.hours === 0 &&
          timeLeft.minutes === 0 &&
          timeLeft.seconds === 0
        ) {
          setRemainingTime({ hours: 0, minutes: 0, seconds: 0 });
        }
        
        setWaiting(false);
        setUpdateError(null);
      } catch (error) {
        console.error("Error in update function:", error);
        setUpdateError(error.message);
        setWaiting(false);
      }
    }, [user, calculateProgress, calculateMinedValue, calculateRemainingTime]);

    // Use setInterval instead of Web Worker for better compatibility
    useEffect(() => {
      let intervalId = null;
      
      if (user && user.isMining && user.miningStartedTime) {
        // Initial update
        updateFunction();
        
        // Set up interval for updates
        intervalId = setInterval(updateFunction, 1000);
        console.log("Started mining interval updates");
      } else {
        setProgress(0);
        setMined(0);
        setRemainingTime({ hours: 6, minutes: 0, seconds: 0 });
        setCanClaim(false);
        setWaiting(false);
        console.log("Mining not active, reset values");
      }
      
      // Cleanup function
      return () => {
        if (intervalId) {
          clearInterval(intervalId);
          console.log("Cleared mining interval");
        }
      };
    }, [user, updateFunction]); // Added updateFunction to dependencies

    // Update calculated state in Redux
    useEffect(() => {
      if (!waiting) {
        dispatch(
          setCalculated({
            mined: mined,
            remainingTime: remainingTime,
            progress: progress,
            canClaim: canClaim,
            canUpgrade: canUpgrade,
            updateError: updateError,
          })  
        );
      }  
    }, [waiting, mined, remainingTime, progress, canClaim, canUpgrade, updateError, dispatch]);

  return <></>;
}

export default CalculateNums;