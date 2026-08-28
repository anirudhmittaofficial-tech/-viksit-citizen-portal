import apiClient from './apiClient';

export const registerCitizenApi = async (formData) => {
  try {
    const res = await apiClient.post('/auth/citizen/register', formData);
    return res.data;
  } catch (error) {
    if (!error.response) throw new Error('Network Error: Cannot connect to the backend server.');
    throw new Error(error.response?.data?.message || 'Authentication failed');
  }
};

export const loginCitizenApi = async (credentials) => {
  try {
    const res = await apiClient.post('/auth/citizen/login', credentials);
    return res.data;
  } catch (error) {
    if (!error.response) throw new Error('Network Error: Cannot connect to the backend server.');
    throw new Error(error.response?.data?.message || 'Authentication failed');
  }
};


export const getMeApi = async () => {
  try {
    const res = await apiClient.get('/auth/me');
    return res.data;
  } catch (error) {
    if (!error.response) throw new Error('Network Error: Cannot connect to the backend server.');
    throw new Error(error.response?.data?.message || 'Failed to fetch user data');
  }
};

export const forgotPasswordApi = async (email) => {
  try {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data;
  } catch (error) {
    if (!error.response) throw new Error('Network Error: Cannot connect to the backend server.');
    throw new Error(error.response?.data?.message || 'Failed to request password reset');
  }
};

export const resetPasswordApi = async (token, password) => {
  try {
    const res = await apiClient.post(`/auth/reset-password/${token}`, { password });
    return res.data;
  } catch (error) {
    if (!error.response) throw new Error('Network Error: Cannot connect to the backend server.');
    throw new Error(error.response?.data?.message || 'Failed to reset password');
  }
};

export const loginGoogleApi = async (supabaseToken) => {
  try {
    const res = await apiClient.post('/auth/supabase-oauth', { token: supabaseToken });
    return res.data;
  } catch (error) {
    if (!error.response) throw new Error('Network Error: Cannot connect to the backend server.');
    throw new Error(error.response?.data?.message || 'Google authentication failed');
  }
};

export const updateProfileApi = async (profileData) => {
  try {
    const res = await apiClient.put('/auth/profile', profileData);
    return res.data;
  } catch (error) {
    if (!error.response) throw new Error('Network Error: Cannot connect to the backend server.');
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};


