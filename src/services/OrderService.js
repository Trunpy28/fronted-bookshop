import { axiosJWT } from "./UserService";

const apiUrl = import.meta.env.VITE_API_URL;

export const createOrder = async (access_token, data) => {
  const res = await axiosJWT.post(
    `${apiUrl}/order/create/${data.user}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};

export const getOrdersByUserId = async (id, access_token) => {
  const res = await axiosJWT.get(
    `${apiUrl}/order/get-all-orders-details/${id}`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};

export const getDetailsOrder = async (id, access_token) => {
  const res = await axiosJWT.get(
    `${apiUrl}/order/get-details-order/${id}`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};

export const cancelOrder = async (id, access_token, orderItems) => {
  const res = await axiosJWT.delete(
    `${apiUrl}/order/cancel-order/${id}`,
    { data: orderItems },
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};

export const getAllOrder = async (access_token) => {
  const res = await axiosJWT.get(
    `${apiUrl}/order/get-all`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};

export const updateOrder = async (id, access_token, data) => {
  const res = await axiosJWT.put(`${apiUrl}/order/update-order/${id}`, data, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  return res.data;
};

export const deleteOrder = async (id, access_token) => {
  const res = await axiosJWT.delete(`${apiUrl}/order/delete-order/${id}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  return res.data;
};

export const deleteManyOrder = async (data, access_token) => {
  const res = await axiosJWT.post(`${apiUrl}/order/delete-many`, data, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  return res.data;
};