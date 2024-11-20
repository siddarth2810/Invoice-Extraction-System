// store/slices/dataSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState, Product, Customer, Invoice } from "../types"

export const initialState: AppState = {
  products: [],
  customers: [],
  invoices: [],
  loading: false,
  error: null
};

export const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setData: (state, action: PayloadAction<{
      products: Product[];
      customers: Customer[];
      invoices: Invoice[];
    }>) => {
      state.products = action.payload.products;
      state.customers = action.payload.customers;
      state.invoices = action.payload.invoices;
    },
  },
});

export const {
  setLoading,
  setError,
  setData,
} = dataSlice.actions;
export default dataSlice;
