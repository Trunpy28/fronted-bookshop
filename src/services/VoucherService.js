import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/voucher`;

// Tạo mới voucher
export const createVoucher = async (data, token) => {
  const response = await axios.post(`${API_URL}/create`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

// Lấy danh sách tất cả voucher
export const getAllVouchers = async (token) => {
  const response = await axios.get(`${API_URL}/getAll`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Lấy chi tiết voucher
export const getVoucherDetails = async (id, token) => {
  const response = await axios.get(`${API_URL}/get/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Cập nhật voucher
export const updateVoucher = async (id, data, token) => {
  const response = await axios.put(`${API_URL}/update/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

// Xóa voucher
export const deleteVoucher = async (id, token) => {
  const response = await axios.delete(`${API_URL}/delete/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Áp dụng voucher
export const applyVoucher = async (data, token) => {
  const response = await axios.post(`${API_URL}/apply`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};
