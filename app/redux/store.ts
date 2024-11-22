import { configureStore } from "@reduxjs/toolkit";
import dataReducer from "./slices/dataSlice"
import { tabSlice } from "./slices/tabSlice"

export const store = configureStore({
  reducer: {
    data: dataReducer,
    tab: tabSlice.reducer
  },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;



