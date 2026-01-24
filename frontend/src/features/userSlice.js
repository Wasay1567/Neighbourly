import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userData: null, // logged-in user
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      state.userData = action.payload; // set user
    },
    logout: (state) => {
      state.userData = null; // clear user
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
