import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/userSlice";
import messageReducer from "../features/messageSlice";
import calculateReducer from "../features/calculateSlice";
import coinShowReducer from "../features/coinShowSlice";
import topUsersReducer from "../features/topUsersSlice" ;

export const store = configureStore({
  reducer: {
    user: userReducer,
    message: messageReducer,
    calculate: calculateReducer,
    coinShow: coinShowReducer,
    topUsers: topUsersReducer
  },
});