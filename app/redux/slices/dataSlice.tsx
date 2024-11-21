// store/slices/dataSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState, Product, Customer, Invoice, FinalDataItem } from "../types"

export const initialState: AppState = {
  products: [],
  customers: [],
  invoices: [],
  finalData: [],
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
      finalData: FinalDataItem[];
    }>) => {
      state.products = action.payload.products;
      state.customers = action.payload.customers;
      state.invoices = action.payload.invoices;
      state.finalData = action.payload.finalData;
    },
  },
});

export const {
  setLoading,
  setError,
  setData,
} = dataSlice.actions;
export default dataSlice;
