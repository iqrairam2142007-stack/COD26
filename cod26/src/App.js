 import React, { useState } from 'react';
import './App.css';
import logo from './logo.jpg.jpeg';
import scanner from './scanner.jpg.jpeg';
import { unitdata } from './unitdata';

function App() {
  const [role, setRole] = useState('guest');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [isPaid, setIsPaid] = useState(false);
  const [projectSubmitted, setProjectSubmitted] = useState(false);

  return (
    <div className="App">
      {role === 'guest' ? (
        <div className="login-wrapper">
          <img src={logo} className="logo-top" alt="Logo" />
          <div className="login-card">
            <h2>Login</h2>
            <input type="text" placeholder="Username" />
            <input type="password" placeholder="Password" />
            <button onClick={() => setRole('student')}>Sign In</button>
          </div>
        </div>
      ) : (
        <div className="main-layout">
          <header className="top-bar">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)}>☰</button>
            <img src={logo} className="logo-small" alt="Logo" />
          </header>

          <nav className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
            {['dashboard', 'Units', 'Quiz', 'Assignments', 'Chatbot', 'Project', 'Certificate'].map(item => (
              <button key={item} onClick={() => setActiveView(item)}>{item}</button>
            ))}
          </nav>

          <main className="content">
            {!isPaid ? (
              <div className="payment-gate">
                <h3>Scan to complete your subscription (₹500)</h3>
                <img src={scanner} className="scanner-img" alt="Payment QR" />
                <button onClick={() => setIsPaid(true)}>Confirm Payment</button>
              </div>
            ) : (
              <>
                <h2>{activeView.toUpperCase()}</h2>
                
                {activeView === 'Units' && (
                  <div className="units-grid">
                    {unitdata.map(u => (
                      <div key={u.id} className="unit-card">
                        <h3>{u.title}</h3>
                        <p>Deep notes (4+ pages)</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeView === 'Project' && (
                  <div>
                    <input type="file" />
                    <button onClick={() => setProjectSubmitted(true)}>Submit Project</button>
                  </div>
                )}

                {activeView === 'Certificate' && (
                  <div className="cert-section">
                    {projectSubmitted ? (
                      <div className="certificate-box">
                        <h1>Certificate of Achievement</h1>
                        <p>Awarded to student for completing all modules.</p>
                      </div>
                    ) : (
                      <p>Submit your project to unlock your certificate.</p>
                    )}
                  </div>
                )}
                
                {/* Add other views (Quiz/Assignments/Chatbot) similarly here */}
              </>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

export default App;