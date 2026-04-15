// src/App.jsx
import { useState, useEffect } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import './App.css'; // Import your pure CSS

export default function App() {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds

  useEffect(() => {
    let timer;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  // Determine CSS class based on time left
  const getStatusClass = () => {
    if (!isActive) return 'state-off';
    if (timeLeft > 900) return 'state-green';  // > 15 mins left
    if (timeLeft > 0) return 'state-yellow';   // Last 15 mins
    return 'state-red';                        // 0 mins
  };

  const handleReset = async () => {
    setTimeLeft(3600); 
    
    try {
      await setDoc(doc(db, "status", "tanmay"), {
        lastCheckIn: serverTimestamp(),
        isActive: true,
        stage1Sent: false,
        stage2Sent: false
      }, { merge: true });
      console.log("Telemetry synced to Firebase.");
    } catch (error) {
      console.error("Firebase write error:", error);
    }
  };

  const toggleSystem = async () => {
    const nextState = !isActive;
    setIsActive(nextState);

    if (nextState) {
      // Turning ON: Start the timer and tell Firebase we are active
      handleReset(); 
    } else {
      // Turning OFF: Explicitly tell Firebase to stop watching
      try {
        await setDoc(doc(db, "status", "tanmay"), {
          isActive: false
        }, { merge: true });
        console.log("System safely disarmed in cloud.");
      } catch (error) {
        console.error("Firebase write error:", error);
      }
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="container">
      <div className="dashboard">
        
        <h1 className="title">SENTINEL AI</h1>
        <p className={`subtitle ${!isActive ? 'offline' : ''}`}>
          {isActive ? '● Live Biometrics Active' : '○ System Offline'}
        </p>

        {/* The Big Pulse Button */}
        <div 
          onClick={isActive ? handleReset : null}
          className={`pulse-button ${getStatusClass()}`}
        >
          <p className="timer-text">
            {isActive ? formatTime(timeLeft) : 'OFF'}
          </p>
          <span className="reset-label">
            {isActive ? 'TAP TO RESET' : 'STANDBY'}
          </span>
        </div>

        {/* Master Toggle */}
        <button 
          onClick={toggleSystem}
          className={`toggle-btn ${isActive ? 'btn-disarm' : 'btn-arm'}`}
        >
          {isActive ? 'Disarm System' : 'Arm System'}
        </button>

      </div>
    </div>
  );
}