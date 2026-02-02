import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import Home from './pages/Home';
import Status from './pages/Status';
import MySites from './pages/MySites';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthGuard>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/status/:id" element={<Status />} />
          <Route path="/sites" element={<MySites />} />
        </Routes>
      </AuthGuard>
    </BrowserRouter>
  </React.StrictMode>
);
