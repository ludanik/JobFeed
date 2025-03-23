// File: src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import EmployerRoute from './components/EmployerRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobSearchPage from './pages/JobSearchPage';
import JobDetailsPage from './pages/JobDetailsPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import CompanyProfilePage from './pages/CompanyProfilePage';
import PostJobPage from './pages/PostJobPage';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <main className="container mx-auto px-4 py-8 min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/jobs" element={<JobSearchPage />} />
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
            
            {/* Protected routes */}
            <Route 
              path="/profile" 
              element={<PrivateRoute><ProfilePage /></PrivateRoute>} 
            />
            <Route 
              path="/dashboard" 
              element={<PrivateRoute><DashboardPage /></PrivateRoute>} 
            />
            <Route 
              path="/company/:id" 
              element={<CompanyProfilePage />} 
            />
            <Route 
              path="/post-job" 
              element={<EmployerRoute><PostJobPage /></EmployerRoute>} 
            />
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
