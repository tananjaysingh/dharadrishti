import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BioStateProvider, useBioState } from './context/BioStateContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FeedPreview from './pages/FeedPreview';
import FocusMode from './pages/FocusMode';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import SleepMode from './pages/SleepMode';
import Settings from './pages/Settings';
import Splash from './pages/Splash';
import Auth from './pages/Auth';
import DopamineScore from './pages/DopamineScore';
import ReverseStats from './pages/ReverseStats';
import DailyInsights from './pages/DailyInsights';
import WeeklyProgress from './pages/WeeklyProgress';

function AppRoutes() {
  const { hasSeenSplash, hasAuthenticated, hasCompletedOnboarding, isSleepModeActive } = useBioState();

  if (!hasSeenSplash) {
    return (
      <Routes>
        <Route path="*" element={<Splash />} />
      </Routes>
    );
  }

  if (!hasAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<Auth />} />
      </Routes>
    );
  }

  if (!hasCompletedOnboarding) {
    return (
      <Routes>
        <Route path="*" element={<Onboarding />} />
      </Routes>
    );
  }

  if (isSleepModeActive) {
    return (
      <Routes>
        <Route path="*" element={<SleepMode />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="feed" element={<FeedPreview />} />
        <Route path="focus" element={<FocusMode />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="dopamine-score" element={<DopamineScore />} />
        <Route path="reverse-stats" element={<ReverseStats />} />
        <Route path="insights" element={<DailyInsights />} />
        <Route path="weekly-progress" element={<WeeklyProgress />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BioStateProvider>
      <Router>
        <AppRoutes />
      </Router>
    </BioStateProvider>
  );
}

export default App;
