import { axiosJWT } from "./UserService";

const apiUrl = import.meta.env.VITE_API_URL;

// Tạo order PayPal
export const createPayPalPayment = async ({ orderId, accessToken }) => {
  const response = await axiosJWT.post(
    `${apiUrl}/paypal/create-payment`,
    {
      orderId,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data; // Trả về dữ liệu order
};

// Xác nhận thanh toán PayPal
export const capturePayPalOrder = async ({ paymentId, orderId, accessToken, userId }) => {
  const response = await axiosJWT.post(
    `${apiUrl}/paypal/capture-order/user/${userId}/order/${orderId}`,
    { paymentId },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data; // Trả về dữ liệu xác nhận thanh toán
};
