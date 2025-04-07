import axios from "axios";
import { axiosJWT } from "./UserService";

const API_URL = `${import.meta.env.VITE_API_URL}/voucher`;

export const getActiveVouchers = async () => {
  const response = await axios.get(`${API_URL}/active`);
  return response.data;
};

export const createVoucher = async (data, token) => {
  const response = await axiosJWT.post(`${API_URL}/create`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const getAllVouchers = async (token) => {
  const response = await axiosJWT.get(`${API_URL}/getAll`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getVoucherDetails = async (id) => {
  const response = await axios.get(`${API_URL}/get/${id}`);
  return response.data;
};

export const updateVoucher = async (id, data, token) => {
  const response = await axiosJWT.put(`${API_URL}/update/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const deleteVoucher = async (id, token) => {
  const response = await axiosJWT.delete(`${API_URL}/delete/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const applyVoucher = async (data, token) => {
  const response = await axiosJWT.post(`${API_URL}/apply`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};
