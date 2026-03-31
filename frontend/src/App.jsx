import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CompleteProfile from './pages/CompleteProfile';
import Dashboard from './pages/Dashboard';
import LiveTracker from './pages/LiveTracker';
import ScrollToTop from './components/ScrollToTop';
import './index.css';

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        
        {/* Public SOS Live Tracking Page */}
        <Route path="/sos/track/:sessionId" element={<LiveTracker />} />

      </Routes>
    </Router>
  );
};

export default App;
