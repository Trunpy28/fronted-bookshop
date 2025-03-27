import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  name: '',
  email: '',
  phone: '',
  address: {
    city: '',
    district: '',
    ward: '',
    detailedAddress: ''
  },
  avatar: '',
  id: '',
  access_token: '',
  isAdmin: false,
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateUser: (state, action) => {
      const {
        name = '',
        email = '',
        phone = '',
        address = {},
        avatar = '',
        access_token = '',
        _id = '',
        isAdmin
      } = action.payload;
      
      state.name = name || email;
      state.email = email;
      state.phone = phone;
      
      state.address = {
        city: address.city || '',
        district: address.district || '',
        ward: address.ward || '',
        detailedAddress: address.detailedAddress || address.detail || ''
      };
      
      state.avatar = avatar;
      state.id = _id;
      state.access_token = access_token;
      state.isAdmin = isAdmin;
    },
    resetUser: (state) => {
      state.name = '';
      state.email = '';
      state.phone = '';
      state.address = {
        city: '',
        district: '',
        ward: '',
        detailedAddress: ''
      };
      state.avatar = '';
      state.id = '';
      state.access_token = '';
      state.isAdmin = false;
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateUser, resetUser } = userSlice.actions

export default userSlice.reducer