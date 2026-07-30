import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Playground } from './pages/Playground';
import { Auth } from './pages/Auth';
import { Challenges } from './pages/Challenges';
import { Leaderboard } from './pages/Leaderboard';
import { Analytics } from './pages/Analytics';
import { useAuthStore } from './store/useAuthStore';

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Playground />
            </ProtectedRoute>
          } 
        />
        <Route path="/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
