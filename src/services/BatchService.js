import { axiosJWT } from './UserService';

const API_URL = `${import.meta.env.VITE_API_URL}/batch`;

export const getAllBatches = async (accessToken) => {
  const response = await axiosJWT.get(`${API_URL}/get-all`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const getAllBatchesForSelect = async (accessToken) => {
  const response = await axiosJWT.get(`${API_URL}/get-all`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const getBatchById = async (id, accessToken) => {
  const response = await axiosJWT.get(`${API_URL}/detail/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const createBatch = async (batchData, accessToken) => {
  const response = await axiosJWT.post(`${API_URL}/create`, batchData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const updateBatch = async ({ id, batchData }, accessToken) => {
  const response = await axiosJWT.put(`${API_URL}/update/${id}`, batchData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const deleteBatch = async (id, accessToken) => {
  const response = await axiosJWT.delete(`${API_URL}/delete/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const getBatchesPaginated = async (page, limit, accessToken) => {
  const response = await axiosJWT.get(`${API_URL}/paginated`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: { page, limit }
  });
  return response.data;
};

export const addItemToBatch = async (batchId, itemData, accessToken) => {
  const response = await axiosJWT.post(`${API_URL}/${batchId}/items`, itemData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const removeItemFromBatch = async (batchId, itemId, accessToken) => {
  const response = await axiosJWT.delete(`${API_URL}/${batchId}/items/${itemId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}; 