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
