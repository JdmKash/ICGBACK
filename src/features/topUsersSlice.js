import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: [],
};

export const topUsersSlice = createSlice({
  name: "topUsers",
  initialState,
  reducers: {
    setTopUsers: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setTopUsers } = topUsersSlice.actions;

export const selectTopUsers = (state) => state.topUsers.value;

export default topUsersSlice.reducer;