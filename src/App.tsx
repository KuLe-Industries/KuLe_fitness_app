import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from './stores/authStore';
import SignIn from './pages/SignIn';
import Home from './pages/Home';
import Plans from './pages/Plans';
import Session from './pages/Session';
import Progress from './pages/Progress';
import History from './pages/History';
import Settings from './pages/Settings';
import Layout from './components/Layout';

// Component to handle browser back button
function NavigationHandler() {
  const location = useLocation();

  useEffect(() => {
    // Ensure page loads correctly on back/forward navigation
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

function App() {
  const { user, isLoading, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <NavigationHandler />
      <Routes>
        <Route path="/signin" element={!user ? <SignIn /> : <Navigate to="/" replace />} />
        <Route
          path="/"
          element={
            user ? (
              <Layout>
                <Home />
              </Layout>
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route
          path="/plans"
          element={
            user ? (
              <Layout>
                <Plans />
              </Layout>
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route
          path="/session"
          element={
            user ? (
              <Layout>
                <Session />
              </Layout>
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route
          path="/progress"
          element={
            user ? (
              <Layout>
                <Progress />
              </Layout>
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route
          path="/history"
          element={
            user ? (
              <Layout>
                <History />
              </Layout>
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route
          path="/settings"
          element={
            user ? (
              <Layout>
                <Settings />
              </Layout>
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
      </Routes>
      <Toaster position="top-center" />
    </>
  );
}

export default App;

