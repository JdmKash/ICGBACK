import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: false,
};

export const coinShowSlice = createSlice({
  name: "coinShow",
  initialState,
  reducers: {
    setCoinShow: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setCoinShow } = coinShowSlice.actions;

export const selectCoinShow = (state) => state.coinShow.value;

export default coinShowSlice.reducer;