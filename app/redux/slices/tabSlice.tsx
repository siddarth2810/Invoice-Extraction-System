import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type TabType = 'invoices' | 'products' | 'customers';

export interface TabState {
  activeTab: TabType;
}

const initialState: TabState = {
  activeTab: 'customers'
}

export const tabSlice = createSlice({
  name: 'tab',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<TabType>) => {
      state.activeTab = action.payload;
    }
  }
})

export const { setActiveTab } = tabSlice.actions;
export default tabSlice;
