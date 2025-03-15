import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: null,
};

export const calculateSlice = createSlice({
  name: "calculate",
  initialState,
  reducers: {
    setCalculated: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setCalculated } = calculateSlice.actions;

export const selectCalculated = (state) => state.calculate.value;

export default calculateSlice.reducer;