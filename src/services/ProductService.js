import axios from 'axios';
import { axiosJWT } from './UserService';

const apiUrl = import.meta.env.VITE_API_URL;
const productApiUrl = `${apiUrl}/product`;

export const getProductType = async (type, page, limit) => {
    if (type) {
        const res = await axios.get(`${productApiUrl}/get-all?filter=type&filter=${type}&limit=${limit}&page=${page}`);
        return res.data;
    }
};

export const getProductsByGenre = async (genreId, page = 1, limit = 10) => {
    const res = await axios.get(`${productApiUrl}/by-genre/${genreId}?page=${page}&limit=${limit}`);
    return res.data;
};

export const createProduct = async (data, access_token) => {
    const res = await axios.post(`${productApiUrl}/create`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${access_token}`,
      },
    });
    return res.data;
};

export const updateProduct = async (id, access_token, data) => {
    const res = await axiosJWT.put(`${productApiUrl}/update/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${access_token}`,
      },
    });
    return res.data;
};

export const getDetailsProduct = async (id) => {
    const res = await axios.get(`${productApiUrl}/get-details/${id}`);
    return res.data;
};

export const deleteProduct = async (id, access_token) => {
    const res = await axiosJWT.delete(`${productApiUrl}/delete/${id}`, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
    return res.data;
};

export const getProductsPaginated = async (options, access_token) => {
    if(options.genres && options.genres.length > 0) {
        options.genres = options.genres.join(',');
    }
    
    const response = await axiosJWT.get(`${productApiUrl}/get-products-paginated`, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
        params: options
    });
    return response.data;
};

export const getAllProductsForSelect = async () => {
    const response = await axios.get(`${productApiUrl}/products-for-select`);
    return response.data;
};

//Tìm kiếm sản phẩm sử dụng Elasticsearch
export const searchProducts = async (params) => {
  try {
    const response = await axios.get(`${productApiUrl}/search`, { params });
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

//Lấy các sản phẩm tương tự dựa trên tiêu chí ngữ nghĩa
export const getSimilarProducts = async (productId, limit = 10) => {
  try {
    const response = await axios.get(`${productApiUrl}/similar/${productId}`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting similar products:', error);
    throw error;
  }
}; 