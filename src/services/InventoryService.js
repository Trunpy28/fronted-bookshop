import { axiosJWT } from './UserService';

const API_URL = `${import.meta.env.VITE_API_URL}/inventory`;

export const getInventoryById = async (id) => {
  const response = await axiosJWT.get(`${API_URL}/detail/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  return response.data;
};

export const addInventory = async (inventoryData, accessToken) => {
  const response = await axiosJWT.post(`${API_URL}/add`, inventoryData, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  return response.data;
};

export const updateInventory = async (id, inventoryData, accessToken) => {
  const response = await axiosJWT.put(`${API_URL}/update/${id}`, inventoryData, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  return response.data;
};

export const deleteInventory = async (id, accessToken) => {
  const response = await axiosJWT.delete(`${API_URL}/delete/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  return response.data;
};

export const getInventoriesPaginated = async (page, limit, accessToken) => {
  const response = await axiosJWT.get(`${API_URL}/paginated`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    params: { page, limit }
  });

  return response.data;
};