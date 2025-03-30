import { axiosJWT } from "./UserService";

const API_URL = `${import.meta.env.VITE_API_URL}/review`;

export const createReview = async (productId, reviewData, accessToken) => {
    const response = await axiosJWT.post(`${API_URL}/create/${productId}`, reviewData, {
        headers: {
            Authorization: `Bearer ${accessToken}`
            }
        });

    return response.data;
};

export const deleteReview = async (reviewId, accessToken) => {
    const response = await axiosJWT.delete(`${API_URL}/delete/${reviewId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    return response.data;
};

export const getReviewsByProductId = async (productId) => {
    const response = await axiosJWT.get(`${API_URL}/product/${productId}`);
    return response.data;
};


