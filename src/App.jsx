import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Website from './pages/Website';
import Admin from './pages/Admin';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <Router>
      {/* Toast Notification Container with customized aesthetics matching our Red/White/Dark Gray theme */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#ffffff',
            color: '#111827',
            borderRadius: '20px',
            border: '1px solid #f3f4f6',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
            fontSize: '14px',
            fontWeight: '600',
            padding: '12px 20px',
          },
          success: {
            iconTheme: {
              primary: '#dc2626', // Red accent
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#ffffff',
            },
          },
        }}
      />
      
      <Routes>
        {/* Public storefront route */}
        <Route path="/" element={<Website />} />

        {/* Admin portal route (protected by login logic inside ProtectedRoute) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
