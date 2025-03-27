import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/review`;

export const createReview = async (reviewData) => {
    try {
        const response = await axios.post(`${API_URL}/create`, reviewData);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const updateReview = async (id, reviewData) => {
    try {
        const response = await axios.put(`${API_URL}/update/${id}`, reviewData);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const deleteReview = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/delete/${id}`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
}; 