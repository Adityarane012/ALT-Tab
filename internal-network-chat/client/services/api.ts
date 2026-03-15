import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/api'
});

export const loginRequest = async (data: { username: string; password: string }) => {
  const res = await api.post('/auth/login', data);
  return res.data;
};

export const registerRequest = async (data: { username: string; password: string }) => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

export const fetchRooms = async (token: string) => {
  const res = await api.get('/rooms', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const createRoom = async (token: string, name: string) => {
  const res = await api.post('/rooms', { name }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const fetchRoomMessages = async (token: string, roomId: string) => {
  const res = await api.get(`/messages/${roomId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const fetchUsers = async (token: string) => {
  const res = await api.get('/users', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const updateUserRole = async (token: string, userId: string, role: 'admin' | 'moderator' | 'user') => {
  const res = await api.patch(`/users/${userId}/role`, { role }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const toggleUserBan = async (token: string, userId: string, banned: boolean) => {
  const res = await api.patch(`/users/${userId}/ban`, { banned }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const deleteRoom = async (token: string, roomId: string) => {
  const res = await api.delete(`/rooms/${roomId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const fetchRecentMessages = async (token: string, limit = 50) => {
  const res = await api.get(`/messages?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const requestJoinRoom = async (token: string, roomId: string) => {
  const res = await api.post(`/rooms/${roomId}/request`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const approveJoinRoom = async (token: string, roomId: string, targetUserId: string) => {
  const res = await api.post(`/rooms/${roomId}/approve`, { targetUserId }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

