import { axiosJWT } from './UserService';

const API_URL = `${import.meta.env.VITE_API_URL}/cart`;

export const getCartByUser = async (accessToken) => {
  const response = await axiosJWT.get(`${API_URL}/my-cart`, {
    headers: {
        Authorization: `Bearer ${accessToken}`
    }
  });
  return response.data;
};

export const addToCart = async (productId, quantity, accessToken) => {
  const response = await axiosJWT.post(`${API_URL}/add-item`, { productId, quantity }, {
    headers: {
        Authorization: `Bearer ${accessToken}`
    }
  });
  return response.data;
};

export const updateCartItem = async (productId, quantity, accessToken) => {
  const response = await axiosJWT.put(`${API_URL}/update-item`, { productId, quantity }, {
    headers: {
        Authorization: `Bearer ${accessToken}`
    }
  });
  return response.data;
};

export const removeFromCart = async (productId, accessToken) => {
  const response = await axiosJWT.delete(`${API_URL}/remove-item/${productId}`, {
    headers: {
        Authorization: `Bearer ${accessToken}`
    }
  });
  return response.data;
};

export const clearCart = async (accessToken) => {
  const response = await axiosJWT.delete(`${API_URL}/clear`, {
    headers: {
        Authorization: `Bearer ${accessToken}`
    }
  });
  return response.data;
};
