import axios from "axios";
import { axiosJWT } from "./UserService";

const API_URL = `${import.meta.env.VITE_API_URL}/voucher`;

export const getActiveVouchers = async () => {
  const response = await axios.get(`${API_URL}/active`);
  return response.data;
};

export const createVoucher = async (data, token) => {
  const formData = new FormData();
  
  // Thêm dữ liệu voucher vào FormData
  for (const key in data) {
    if (key !== 'image') {
      formData.append(key, data[key]);
    }
  }
  
  // Thêm file ảnh nếu có
  if (data.image && data.image instanceof File) {
    formData.append('image', data.image);
  }

  const response = await axiosJWT.post(`${API_URL}/create`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
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

export const getVoucherByCode = async (code) => {
  const response = await axios.get(`${API_URL}/getByCode/${code}`);
  return response.data;
};

export const checkVoucher = async (code, token) => {
  const response = await axiosJWT.get(`${API_URL}/check-voucher/${code}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateVoucher = async (id, data, token) => {
  const formData = new FormData();
  
  // Thêm dữ liệu voucher vào FormData
  for (const key in data) {
    if (key !== 'image') {
      formData.append(key, data[key]);
    }
  }
  
  // Thêm file ảnh nếu có và là đối tượng File
  if (data.image && data.image instanceof File) {
    formData.append('image', data.image);
  }

  const response = await axiosJWT.put(`${API_URL}/update/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
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
