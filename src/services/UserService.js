import axios from "axios";

//Mỗi lần gọi đều đi qua
export const axiosJWT = axios.create();

const apiUrl = import.meta.env.VITE_API_URL;

export const loginUser = async (data) => {
  const res = await axios.post(
    `${apiUrl}/user/sign-in`,
    data, {
      withCredentials: true
    }
  );
  return res.data;
};

export const signUpUser = async (data) => {
  const res = await axios.post(
    `${apiUrl}/user/sign-up`,
    data
  );
  return res.data;
};

export const getDetailsUser = async (id, access_token) => {
  try {
    const res = await axiosJWT.get(
      `${apiUrl}/user/get-details/${id}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return res.data;
  }
  catch (error) {
    console.log(error);
  }
};

export const getAllUser = async (access_token) => {
  const res = await axiosJWT.get(
    `${apiUrl}/user/get-all`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};

export const refreshToken = async () => {
  try {
    const res = await axios.post(
      `${apiUrl}/user/refresh-token`,
      {},
      {
        withCredentials: true, //Tự động lấy cookie(refresh_token) đính vào req
      }
    );
    return res.data;
  }
  catch (error) {
    console.log(error);
  }
};

export const logoutUser = async () => {
  const res = await axios.post(`${apiUrl}/user/log-out`);
  return res.data;
};

export const updateUser = async (id, access_token, data) => {
  const res = await axiosJWT.put(`${apiUrl}/user/update-user/${id}`, data, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  return res.data;
};

export const deleteUser = async (id, access_token) => {
  const res = await axiosJWT.delete(`${apiUrl}/user/delete-user/${id}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  return res.data;
};

export const deleteManyUser = async (data, access_token) => {
  const res = await axiosJWT.post(`${apiUrl}/user/delete-many`, data, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  return res.data;
};

export const forgotPassword = async (email) => {
  const res = await axios.post(`${apiUrl}/user/forgot-password/${email}`);
  return res.data;
}

export const verifyResetPasswordOTP = async (email, otp) => {
  console.log(otp);
  
  const res = await axios.post(`${apiUrl}/user/verify-reset-password-token/${email}`, {
    OTP: otp
  });
  return res.data;
}

export const resetPassword = async (email, otp, password) => {
  console.log(email, otp, password);
  
  const res = await axios.patch(`${apiUrl}/user/reset-password`, {
    email,
    verify_code: otp,
    password
  });
  return res.data;
}