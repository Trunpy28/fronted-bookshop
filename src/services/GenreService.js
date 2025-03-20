import axios from "axios";
import { axiosJWT } from "./UserService";

const API_URL = `${import.meta.env.VITE_API_URL}/genre`;

export const getAllGenres = async () => {
  const response = await axios.get(`${API_URL}/get-all`);
  return response.data;
};

export const getGenreById = async (id) => {
  const response = await axios.get(`${API_URL}/detail/${id}`);
  return response.data;
};

export const createGenre = async (genreData, accessToken) => {
  const response = await axiosJWT.post(`${API_URL}/create`, genreData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const updateGenre = async ({ id, genreData }, accessToken) => {
  try {
    const response = await axiosJWT.put(`${API_URL}/update/${id}`, genreData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

export const deleteGenre = async (id, accessToken) => {
  const response = await axiosJWT.delete(`${API_URL}/delete/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};
