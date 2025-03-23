// File: src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include the JWT token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't retried yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token available, redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        // Attempt to refresh the token
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken
        });
        
        const { token } = response.data;
        localStorage.setItem('token', token);
        
        // Retry the original request with the new token
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (err) {
        // Refresh token failed, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

// File: src/services/authService.js
import api from './api';

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { token, refreshToken, user } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    
    return user;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    const { token, refreshToken, user } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    
    return user;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const logout = async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    return null;
  }
};

// File: src/services/jobService.js
import api from './api';

export const searchJobs = async (filters) => {
  try {
    const { keyword, location, jobTypes, experienceLevels, skillIds, page, size } = filters;
    
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (location) params.append('location', location);
    if (jobTypes) jobTypes.forEach(type => params.append('jobTypes', type));
    if (experienceLevels) experienceLevels.forEach(level => params.append('experienceLevels', level));
    if (skillIds) skillIds.forEach(id => params.append('skillIds', id));
    params.append('page', page);
    params.append('size', size || 10);
    
    const response = await api.get(`/jobs?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to search jobs');
  }
};

export const getJobById = async (id) => {
  try {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get job details');
  }
};

export const applyForJob = async (jobId, coverLetter) => {
  try {
    const response = await api.post(`/jobs/${jobId}/apply`, { coverLetter });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to apply for job');
  }
};

export const saveJob = async (jobId) => {
  try {
    const response = await api.post(`/jobs/${jobId}/save`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to save job');
  }
};

export const unsaveJob = async (jobId) => {
  try {
    const response = await api.delete(`/jobs/${jobId}/save`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to unsave job');
  }
};

export const getUserSavedJobs = async () => {
  try {
    const response = await api.get('/users/saved-jobs');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get saved jobs');
  }
};

export const getUserApplications = async () => {
  try {
    const response = await api.get('/users/applications');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get applications');
  }
};

export const createJob = async (jobData) => {
  try {
    const response = await api.post('/jobs', jobData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create job');
  }
};

export const updateJob = async (id, jobData) => {
  try {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update job');
  }
};

export const deleteJob = async (id) => {
  try {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete job');
  }
};

// File: src/services/userService.js
import api from './api';

export const getUserProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get user profile');
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

export const addEducation = async (educationData) => {
  try {
    const response = await api.post('/users/education', educationData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add education');
  }
};

export const updateEducation = async (id, educationData) => {
  try {
    const response = await api.put(`/users/education/${id}`, educationData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update education');
  }
};

export const deleteEducation = async (id) => {
  try {
    const response = await api.delete(`/users/education/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete education');
  }
};

export const addExperience = async (experienceData) => {
  try {
    const response = await api.post('/users/experience', experienceData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add experience');
  }
};

export const updateExperience = async (id, experienceData) => {
  try {
    const response = await api.put(`/users/experience/${id}`, experienceData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update experience');
  }
};

export const deleteExperience = async (id) => {
  try {
    const response = await api.delete(`/users/experience/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete experience');
  }
};

export const addSkill = async (skillName) => {
  try {
    const response = await api.post('/users/skills', { name: skillName });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add skill');
  }
};

export const removeSkill = async (skillId) => {
  try {
    const response = await api.delete(`/users/skills/${skillId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to remove skill');
  }
};

// File: src/services/companyService.js
import api from './api';

export const getCompanyById = async (id) => {
  try {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get company details');
  }
};

export const createCompany = async (companyData) => {
  try {
    const response = await api.post('/companies', companyData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create company');
  }
};

export const updateCompany = async (id, companyData) => {
  try {
    const response = await api.put(`/companies/${id}`, companyData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update company');
  }
};

export const getCompanyJobs = async (id) => {
  try {
    const response = await api.get(`/companies/${id}/jobs`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get company jobs');
  }
};

export const uploadCompanyLogo = async (id, logoFile) => {
  try {
    const formData = new FormData();
    formData.append('logo', logoFile);
    
    const response = await api.post(`/companies/${id}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to upload company logo');
  }
};
