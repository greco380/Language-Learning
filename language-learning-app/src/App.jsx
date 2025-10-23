import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import PracticePage from './pages/PracticePage';
import HistoryPage from './pages/HistoryPage';
import CurriculumPage from './pages/CurriculumPage';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {/* Main Content */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/curriculum" element={<CurriculumPage />} />
          </Routes>

          {/* Bottom Navigation */}
          <BottomNav />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
