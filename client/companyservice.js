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
