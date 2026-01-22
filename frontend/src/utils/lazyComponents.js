import React from 'react';

// Lazy load components for better performance
export const LazyLogin = React.lazy(() => import('../components/Login'));
export const LazyRegister = React.lazy(() => import('../components/Register'));
export const LazyForgotPassword = React.lazy(() => import('../components/ForgotPassword'));
export const LazyProfileEdit = React.lazy(() => import('../components/ProfileEdit'));

// Loading fallback component
export const LoadingFallback = () => (
  <div className="auth-container">
    <div className="auth-box">
      <h1>PSAI Chatbot</h1>
      <p>Loading...</p>
    </div>
  </div>
);
