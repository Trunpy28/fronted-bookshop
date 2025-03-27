import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    cartItems: [],
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCart(state, action) {
            return { cartItems: action.payload.cartItems };
        },
        resetCart() {
            return { ...initialState };
        },
    },
});

export const { setCart, resetCart } = cartSlice.actions;
export default cartSlice.reducer;
