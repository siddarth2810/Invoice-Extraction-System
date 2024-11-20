import { configureStore } from "@reduxjs/toolkit";
import { dataSlice } from "./slices/dataSlice"
import { tabSlice } from "./slices/tabSlice"

export const store = configureStore({
  reducer: {
    data: dataSlice.reducer,
    tab: tabSlice.reducer
  },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;



