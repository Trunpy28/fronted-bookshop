import { axiosJWT } from "./UserService";

const API_URL = `${import.meta.env.VITE_API_URL}/order`;

export const createOrder = async (data) => {
  const { token, ...orderData } = data;
  try {
    const response = await axiosJWT.post(`${API_URL}/create`, orderData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMyOrders = async (accessToken) => {
  const response = await axiosJWT.get(`${API_URL}/my-orders`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  return response.data;
};

export const getDetailsOrder = async (orderId, accessToken) => {
  const response = await axiosJWT.get(`${API_URL}/get-details-order/${orderId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  return response.data;
};

export const cancelOrder = async (orderId, accessToken) => {
  const response = await axiosJWT.delete(`${API_URL}/cancel-order/${orderId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  return response.data;
};

export const updateOrder = async (id, accessToken, data) => {
  const res = await axiosJWT.put(`${API_URL}/update-order/${id}`, data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
};

export const deleteOrder = async (id, accessToken) => {
  const res = await axiosJWT.delete(`${API_URL}/delete-order/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
};

export const updateOrderStatus = async (orderId, accessToken, status) => {
  const response = await axiosJWT.put(`${API_URL}/update-status/${orderId}`, 
    { ...status },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );
  return response.data;
};

export const getPaginatedOrders = async (accessToken, options) => {
  // Loại bỏ các tham số rỗng
  const cleanedOptions = {};
  Object.keys(options).forEach(key => {
    // Kiểm tra mảng rỗng
    if (Array.isArray(options[key]) && options[key].length === 0) {
      return;
    }
    // Kiểm tra chuỗi rỗng
    if (typeof options[key] === 'string' && options[key].trim() === '') {
      return;
    }
    // Kiểm tra null hoặc undefined
    if (options[key] === null || options[key] === undefined) {
      return;
    }
    cleanedOptions[key] = options[key];
  });

  const response = await axiosJWT.get(`${API_URL}/get-orders`, {
    params: cleanedOptions,
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  return response.data;
};