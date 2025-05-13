import { axiosJWT } from "./UserService";

const API_URL = `${import.meta.env.VITE_API_URL}/vnpay`;

export const createVNPayPayment = async (accessToken, orderId) => {
  const response = await axiosJWT.post(
    `${API_URL}/create`,
    { orderId },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );
  
  return response.data;
}; 