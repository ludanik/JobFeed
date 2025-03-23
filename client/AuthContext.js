import React, { createContext, useContext, useState, useEffect } from 'react';
import { login, register, getCurrentUser, logout } from '../services/authService';
import { getUserSavedJobs } from '../services/jobService';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        
        if (user) {
          const jobs = await getUserSavedJobs();
          setSavedJobs(jobs);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);
  
  const handleLogin = async (email, password) => {
    const user = await login(email, password);
    setCurrentUser(user);
    
    const jobs = await getUserSavedJobs();
    setSavedJobs(jobs);
    
    return user;
  };
  
  const handleRegister = async (userData) => {
    const user = await register(userData);
    setCurrentUser(user);
    setSavedJobs([]);
    return user;
  };
  
  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    setSavedJobs([]);
  };
  
  const addSavedJob = (job) => {
    setSavedJobs(prev => [...prev, job]);
  };
  
  const removeSavedJob = (jobId) => {
    setSavedJobs(prev => prev.filter(job => job.id !== jobId));
  };
  
  const value = {
    currentUser,
    savedJobs,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    addSavedJob,
    removeSavedJob,
    isEmployer: currentUser?.role === 'EMPLOYER'
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
