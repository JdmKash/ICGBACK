import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: null,
};

export const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setShowMessage: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setShowMessage } = messageSlice.actions;

export const  selectShowMessage = (state) => state.message.value;

export default messageSlice.reducer;