import React from 'react';

function Login() {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Welcome to COD 26</h1>
      <input type="text" placeholder="Enter School Code or Username" />
      <button>Login</button>
      <hr />
      <button>Pay ₹500 via PayPal</button>
    </div>
  );
}

export default Login;
const handlePayment = () => {
  const options = {
    key: "YOUR_RAZORPAY_KEY", 
    amount: "35000", // ₹500 in paise
    currency: "INR",
    name: "COD 26 Subscription",
    description: "Monthly Access",
    handler: function(response) {
        // After successful payment, update student status in Firebase
        updateStudentStatus(studentEmail, true); 
    },
    theme: { color: "#ff8c00" }
  };
  const rzp = new window.Razorpay(options);
  rzp.open(); // This opens the modal with the scanner
};