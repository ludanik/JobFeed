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
