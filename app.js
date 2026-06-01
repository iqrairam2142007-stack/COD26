 import React, { useState } from 'react';
import './App.css';
import logo from './COD26.jpg.jpeg';
import scanner from './scanner.jpg.jpeg'; 
import data from`./unitdata/unitdata.js`;

function App() {
  const [hasAccess, setHasAccess] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const handleSchoolCode = (code) => {
    if (code === 'COD26-2026') setHasAccess(true);
    else alert("Invalid School Code");
  };

  return (
    <div className="login-container">
      {!hasAccess ? (
        <div className="login-box">
          <img src={logo} className="logo-top" alt="Logo" />
          <h2>Access Portal</h2>
          
          <button className="submit-btn" onClick={() => handleSchoolCode('COD26-2026')}>
            Access via School Code
          </button>
          
          <hr />
          
          {!showPayment ? (
            <button className="submit-btn orange" onClick={() => setShowPayment(true)}>
              Pay ₹300 & Access Lessons
            </button>
          ) : (
            <div className="payment-gate">
              <p>Scan to complete your payment:</p>
              <img src={scanner} className="scanner-img" alt="Payment Scanner" />
              <button className="submit-btn" onClick={() => setHasAccess(true)}>
                Confirm Payment
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="dashboard">
          <h1>Welcome to Your Lessons</h1>
        </div>
      )}
    </div>
  );
}

export default App;