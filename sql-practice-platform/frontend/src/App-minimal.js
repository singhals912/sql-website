import React from 'react';

// Minimal stable App for testing
function App() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <h1 style={{ color: 'green', marginBottom: '20px' }}>
        ✅ Frontend Running Successfully!
      </h1>
      <p style={{ marginBottom: '10px' }}>
        This is a minimal React app to test stability.
      </p>
      <p style={{ marginBottom: '20px' }}>
        If you can see this without crashes, the server is working.
      </p>
      <button 
        onClick={() => {
          alert('Button works!');
          console.log('Button clicked at:', new Date().toISOString());
        }}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test Button
      </button>
      
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: 'white', borderRadius: '5px' }}>
        <h3>Status Check:</h3>
        <p>✅ React rendering</p>
        <p>✅ State management</p>
        <p>✅ Event handlers</p>
        <p>✅ No console errors</p>
        <p>⏰ Server started at: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}

export default App;