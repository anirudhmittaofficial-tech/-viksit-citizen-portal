import apiClient from './apiClient';

export const fetchNotificationsApi = async (email) => {
  const res = await apiClient.get('/notifications', { params: { email } });
  return res.data;
};

export const markNotificationReadApi = async (id) => {
  const res = await apiClient.put(`/notifications/${id}/read`);
  return res.data;
};

export const markAllNotificationsReadApi = async () => {
  const res = await apiClient.put('/notifications/read-all');
  return res.data;
};
