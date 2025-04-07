import { axiosJWT } from "./UserService";

const API_URL = `${import.meta.env.VITE_API_URL}/shipping-address`;

export const getUserAddresses = async (accessToken) => {
  const response = await axiosJWT.get(`${API_URL}/get/user`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const addAddress = async (addressData, accessToken) => {
  const response = await axiosJWT.post(`${API_URL}/add`, addressData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const updateAddress = async (addressId, addressData, accessToken) => {
  const response = await axiosJWT.put(
    `${API_URL}/update/${addressId}`,
    addressData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
};

export const deleteAddress = async (addressId, accessToken) => {
  const response = await axiosJWT.delete(`${API_URL}/delete/${addressId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const setDefaultAddress = async (addressId, accessToken) => {
  const response = await axiosJWT.patch(
    `${API_URL}/set-default/${addressId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
};
