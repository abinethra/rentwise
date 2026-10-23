import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DisclaimerBanner from './components/DisclaimerBanner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BrickBackground from './components/BrickBackground';

// Pages
import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';
import ReportPage from './pages/ReportPage';
import NegotiationPage from './pages/NegotiationPage';
import ChecklistPage from './pages/ChecklistPage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#ECDFD2] text-[#081849] font-body antialiased selection:bg-[#893172] selection:text-white relative">
        {/* Interactive Toy-Brick City & Floating Bricks Parallax Canvas */}
        <BrickBackground />

        {/* Rule 9: Prominent Tenant Guidance / Not Legal Advice Banner */}
        <DisclaimerBanner />
        
        {/* Navigation Bar */}
        <Navbar />

        {/* Page Content Viewport */}
        <main className="flex-1 relative z-0">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/report/:id" element={<ReportPage />} />
            <Route path="/negotiation" element={<NegotiationPage />} />
            <Route path="/checklist" element={<ChecklistPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}
