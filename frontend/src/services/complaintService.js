import apiClient from './apiClient';

export const fetchPublicComplaintsApi = async (params = {}) => {
  const res = await apiClient.get('/complaints', { params });
  return res.data;
};

export const fetchMyComplaintsApi = async () => {
  const res = await apiClient.get('/complaints/my');
  return res.data;
};

export const fetchComplaintByIdApi = async (id) => {
  const res = await apiClient.get(`/complaints/${id}`);
  return res.data;
};

export const createComplaintApi = async (complaintData) => {
  const res = await apiClient.post('/complaints', complaintData);
  return res.data;
};

export const assignOfficerApi = async (id, data) => {
  const res = await apiClient.put(`/complaints/${id}/assign`, data);
  return res.data;
};

export const updateComplaintStatusApi = async (id, data) => {
  const res = await apiClient.put(`/complaints/${id}/status`, data);
  return res.data;
};

export const addCommentApi = async (id, data) => {
  const res = await apiClient.post(`/complaints/${id}/comments`, data);
  return res.data;
};

export const uploadFileApi = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
};
