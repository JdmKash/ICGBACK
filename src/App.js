import { useEffect, useState, useCallback } from "react";
import "./App.css";
import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, setUser } from "./features/userSlice";
import { HashRouter as Router, Route, Routes } from "react-router-dom"; // Using HashRouter for better compatibility in Telegram WebView
import Home from "./Screens/Home";
import Daily from "./Screens/Daily";
import Earn from "./Screens/Earn";
import AirDrops from "./Screens/airdrops";
import Refferals from "./Screens/refferals";
import CalculateNums from "./Components/CalculateNums";
import CoinAnimation from "./Components/CoinAnimation";
import { selectShowMessage, setShowMessage } from "./features/messageSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { selectCoinShow } from "./features/coinShowSlice";
import { setTopUsers } from "./features/topUsersSlice";
import Loading from "./Screens/Loading";
import BottomNavigation from "./Components/BottomNavigation";
import { selectCalculated } from "./features/calculateSlice";

function App() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const calculate = useSelector(selectCalculated);
  const message = useSelector(selectShowMessage);
  const coinShow = useSelector(selectCoinShow);

  const [webApp, setWebApp] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [telegramError, setTelegramError] = useState(null);
  const [initStage, setInitStage] = useState("initializing");
  
  // Function to safely process links object
  const processLinks = (links) => {
    if (!links) return {};
    return Object.entries(links).reduce((acc, [key, value]) => {
      acc[key] = {
        ...value,
        time: value.time ? value.time.toMillis() : null,
      };
      return acc;
    }, {});
  };

  // Fetch top users - moved to useCallback to avoid dependency issues
  const fetchTopUsers = useCallback(async () => {
    try {
      console.log("Fetching top users");
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("balance", "desc"), limit(50));
      const querySnapshot = await getDocs(q);
      const topUsers = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id, 
        balance: docSnap.data().balance,
        userImage: docSnap.data().userImage,
        firstName: docSnap.data().firstName,
        lastName: docSnap.data().lastName,
      }));
      dispatch(setTopUsers(topUsers));
      console.log("Top users fetched successfully");
    } catch (error) {
      console.error("Error fetching top users:", error);
    }
  }, [dispatch]);

  // Add emergency timeout to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log("Emergency timeout triggered - forcing load completion");
        setIsLoading(false);
        setInitStage("emergency-timeout");
      }
    }, 10000); // 10 seconds timeout
    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  // Safely initialize Telegram WebApp
  useEffect(() => {
    console.log("Initializing Telegram WebApp");
    setInitStage("telegram-init-start");
    
    try {
      // Check if Telegram WebApp is available
      if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        console.log("Telegram WebApp found, calling ready()");
        
        // Call ready before trying to access properties
        tg.ready();
        tg.expand();
        
        // Log Telegram WebApp version
        console.log("Telegram WebApp version:", tg.version);
        
        // Only apply color settings for versions below 6.0
        if (tg.version && parseFloat(tg.version) < 6.0) {
          try { tg.setBackgroundColor("#0b0b0b"); } catch (e) { console.log("Background color error", e); }
          try { tg.setHeaderColor("#0b0b0b"); } catch (e) { console.log("Header color error", e); }
        } else {
          console.log("Skipping color settings for Telegram WebApp version 6.0+");
        }

        // Wait a bit longer for Telegram WebApp to fully initialize (increased timeout to 1000ms)
        setTimeout(() => {
          if (tg?.initDataUnsafe?.user?.id) {
            const userId = tg.initDataUnsafe.user.id;
            const userIdString = userId.toString();
            console.log("Telegram user identified:", userIdString);
            
            setWebApp({
              id: userIdString,
              firstName: tg?.initDataUnsafe?.user?.first_name || "User",
              lastName: tg?.initDataUnsafe?.user?.last_name || null,
              username: tg?.initDataUnsafe?.user?.username || null,
              languageCode: tg?.initDataUnsafe?.user?.language_code || "en",
            });
            
            setInitStage("telegram-init-success");
          } else {
            console.log("Running in browser mode, using fallback data");
            setWebApp({
              id: "82424881123",
              firstName: "Dev",
              lastName: "User",
              username: "@devuser",
              languageCode: "en",
            });
            setInitStage("telegram-init-browser-mode");
          }
        }, 1000); // Increased delay to 1000ms
      } else {
        console.log("Telegram WebApp not available, using fallback");
        setWebApp({
          id: "82424881123",
          firstName: "Test",
          lastName: "User",
          username: "@testuser",
          languageCode: "en",
        });
        setInitStage("telegram-init-fallback");
      }
    } catch (error) {
      console.error("Error initializing Telegram WebApp:", error);
      setTelegramError(error.message);
      setInitStage("telegram-init-error");
      
      // Fallback to ensure the app still works
      setWebApp({
        id: "82424881123",
        firstName: "Error",
        lastName: "User",
        username: "@erroruser",
        languageCode: "en",
      });
    }
  }, []);

  // Connect to Firestore once Telegram is initialized
  useEffect(() => {
    if (!webApp) return;
    
    console.log("Telegram user available, connecting to Firestore");
    setInitStage("firestore-connect");
    
    let unsub = null;
    
    try {
      console.log("Setting up Firestore listener for user:", webApp.id);
      unsub = onSnapshot(
        doc(db, "users", webApp.id),
        async (docSnap) => {
          try {
            if (docSnap.exists()) {
              console.log("User document exists, updating Redux state");
              const userData = docSnap.data();
              
              // Log important state before update
              console.log("User data before Redux update:", {
                uid: webApp.id,
                balance: userData.balance,
                mineRate: userData.mineRate,
                isMining: userData.isMining
              });
              
              dispatch(
                setUser({
                  uid: webApp.id,
                  userImage: userData.userImage,
                  firstName: userData.firstName,
                  lastName: userData.lastName,
                  userName: userData.username,
                  languageCode: userData.languageCode,
                  referrals: userData.referrals || {},
                  referredBy: userData.referredBy,
                  isPremium: userData.isPremium,
                  balance: userData.balance,
                  mineRate: userData.mineRate,
                  isMining: userData.isMining,
                  miningStartedTime: userData.miningStartedTime 
                    ? userData.miningStartedTime.toMillis()
                    : null,
                  daily: {
                    claimedTime: userData.daily?.claimedTime
                      ? userData.daily.claimedTime.toMillis() 
                      : null,
                    claimedDay: userData.daily?.claimedDay || 0,
                  },
                  links: processLinks(userData.links),
                })
              );
              
              // Set loading to false immediately after Redux update
              setIsLoading(false);
              setInitStage("user-data-loaded");
            } else {
              console.log("User document doesn't exist, creating new user");
              try {
                await setDoc(doc(db, "users", webApp.id), {
                  firstName: webApp.firstName,
                  lastName: webApp.lastName || null,
                  username: webApp.username || null,
                  languageCode: webApp.languageCode,
                  referrals: {},
                  referredBy: null,
                  balance: 0,
                  mineRate: 0.001,
                  isMining: false,
                  miningStartedTime: null,
                  daily: {
                    claimedTime: null,
                    claimedDay: 0,
                  },
                  links: null,
                });
                
                console.log("New user created successfully");
                setIsLoading(false);
                setInitStage("new-user-created");
              } catch (createError) {
                console.error("Error creating new user:", createError);
                setIsLoading(false);
                setInitStage("user-creation-error");
              }
            }
          } catch (docError) {
            console.error("Error processing user document:", docError);
            setIsLoading(false);
            setInitStage("doc-processing-error");
          }
        },
        (error) => {
          console.error("Firestore listener error:", error);
          setIsLoading(false);
          setInitStage("firestore-listener-error");
        }
      );
      
      // Fetch top users in the background
      fetchTopUsers();
      
    } catch (error) {
      console.error("Error setting up Firestore connection:", error);
      setIsLoading(false);
      setInitStage("firestore-setup-error");
    }
    
    return () => { 
      if (unsub) {
        console.log("Cleaning up Firestore listener");
        unsub();
      }
    };
  }, [dispatch, webApp, fetchTopUsers]);

  // Log Redux state changes
  useEffect(() => {
    console.log("Current Redux State - User:", user ? "exists" : "null");
    console.log("Current Redux State - Calculate:", calculate ? "true" : "false");
  }, [user, calculate]);

  // Handle toast messages
  useEffect(() => {
    if (message) {
      toast(message.message, {
        autoClose: 2500,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        closeButton: false,
      });
      dispatch(setShowMessage(null));
    }
  }, [message, dispatch]);

  // Simplified component structure with error handling
  const renderMainContent = () => {
    try {
      if (isLoading) {
        return <Loading stage={initStage} />;
      }
      
      return (
        <>
          {user && calculate && <BottomNavigation />}
          {user && (
            <>
              <CalculateNums />
              <ToastContainer
                style={{
                  width: "calc(100% - 40px)",
                  maxWidth: "none",
                  left: "20px",
                  right: "20px",
                  top: "20px",
                  height: "20px",
                }}
                toastStyle={{
                  minHeight: "20px",
                  padding: "0px 10px",
                  paddingBottom: "4px",
                  backgroundColor:
                    message?.color === "green"
                      ? "#00c000"
                      : message?.color === "blue"
                      ? "#1d4ed8"
                      : "red",
                  color: "white",
                  borderRadius: "6px",
                  marginBottom: "4px",
                }}
              />
              <CoinAnimation showAnimation={coinShow} />
            </>
          )}
          <Routes>
            <Route path="/" element={isLoading ? <Loading stage={initStage} /> : <Home />} />
            {user && <Route path="/daily" element={<Daily />} />}
            {user && <Route path="/earn" element={<Earn />} />}
            {user && <Route path="/airdrops" element={<AirDrops />} />}
            {user && <Route path="/refferals" element={<Refferals />} />}
            <Route path="*" element={isLoading ? <Loading stage={initStage} /> : <Home />} />
          </Routes>
        </>
      );
    } catch (error) {
      console.error("Error rendering main content:", error);
      return (
        <div style={{ padding: '20px', color: 'white', backgroundColor: '#0b0b0b', height: '100vh' }}>
          <h2>Rendering Error</h2>
          <p>There was a problem rendering the app: {error.message}</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }
  };

  // Show error message if Telegram initialization failed
  if (telegramError) {
    return (
      <div style={{ 
        padding: '20px', 
        color: 'white', 
        backgroundColor: '#0b0b0b',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h2>Initialization Error</h2>
        <p>There was a problem initializing the app: {telegramError}</p>
        <p>Please try refreshing the page or contact support.</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            margin: '20px 0',
            backgroundColor: '#1d4ed8',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Refresh Page
        </button>
        <div style={{
          marginTop: '20px',
          padding: '10px',
          border: '1px solid #333',
          borderRadius: '5px',
          fontSize: '12px'
        }}>
          <p>Debug info:</p>
          <p>- Telegram WebApp available: {window.Telegram?.WebApp ? 'Yes' : 'No'}</p>
          <p>- Init stage: {initStage}</p>
          <p>- Error: {telegramError}</p>
          <p>- Time: {new Date().toISOString()}</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {renderMainContent()}
      
      {/* Debug info - visible in all environments for troubleshooting */}
      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        backgroundColor: 'rgba(0,0,0,0.7)', 
        color: 'white', 
        padding: '4px', 
        fontSize: '10px', 
        zIndex: 9999 
      }}>
        Stage: {initStage} | Loading: {isLoading ? 'Yes' : 'No'} | User: {user ? 'Yes' : 'No'} | Calculate: {calculate ? 'Yes' : 'No'}
      </div>
    </Router>
  );
}

export default App;
