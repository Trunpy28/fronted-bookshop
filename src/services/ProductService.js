import axios from 'axios';
import { axiosJWT } from './UserService';

const apiUrl = import.meta.env.VITE_API_URL;
const productApiUrl = `${apiUrl}/product`;

export const getAllProduct = async (search, limit) => {
    let res = {};
    if (search?.length > 0) {
        res = await axios.get(`${productApiUrl}/get-all/?filter=name&filter=${search}&limit=${limit}`);
    } else {
        res = await axios.get(`${productApiUrl}/get-all?limit=${limit}`);
    }
    return res.data;
};

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

export const deleteManyProduct = async (data, access_token) => {
    const res = await axiosJWT.post(`${productApiUrl}/delete-many`, data, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
    return res.data;
};

export const getProductsPaginated = async (page, limit, access_token) => {
    const response = await axios.get(`${productApiUrl}/get-products-paginated?page=${page}&limit=${limit}`, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
    return response.data;
};

export const getAllProductsName = async () => {
    const response = await axios.get(`${productApiUrl}/product-names`);
    return response.data;
};

export const getAllProductsForSelect = async () => {
    const response = await axios.get(`${productApiUrl}/products-for-select`);
    return response.data;
}; 