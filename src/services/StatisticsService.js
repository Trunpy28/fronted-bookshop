import { axiosJWT } from './UserService';

const API_URL = `${import.meta.env.VITE_API_URL}/statistics`;
   
export const getGeneralStatistics = async (access_token) => {
  const res = await axiosJWT.get(`${API_URL}/general`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  return res.data;
};

export const getRatingStatistics = async (access_token) => {
  const res = await axiosJWT.get(`${API_URL}/rating`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  return res.data;
};

export const getOrderStatusStatistics = async (access_token) => {
  const res = await axiosJWT.get(`${API_URL}/order-status`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  return res.data;
};

export const getPaymentStatistics = async (access_token) => {
  const res = await axiosJWT.get(`${API_URL}/payment`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  return res.data;
};


export const getRevenueByMonth = async (access_token, month, year) => {
  const res = await axiosJWT.get(`${API_URL}/revenue/by-month`, {
    params: { month, year },
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  return res.data;
};

export const getRevenueByYear = async (access_token, year) => {
  const res = await axiosJWT.get(`${API_URL}/revenue/by-year`, {
    params: { year },
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  return res.data;
}; 