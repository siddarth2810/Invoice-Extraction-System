import { configureStore } from "@reduxjs/toolkit";
import { counterSlice } from "./slices/counter"
import { dataSlice } from "./slices/dataSlice"

export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
    data: dataSlice.reducer
  },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;



