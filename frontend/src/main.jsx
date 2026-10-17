// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index1.css';
// import { GoogleOAuthProvider } from '@react-oauth/google';
//     <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>

const GOOGLE_CLIENT_ID = "SEU_CLIENT_ID_DO_GOOGLE_AQUI";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <App />
  </React.StrictMode>,
);
