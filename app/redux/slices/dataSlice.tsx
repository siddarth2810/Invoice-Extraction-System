import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Product {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  priceWithTax: number;
}

export interface Customer {
  id: string;
  customerName: string;
  phoneNumber: string;
  totalPurchaseAmount: number;
}

export interface Invoice {
  id: string;
  serialNumber: string;
  customerName: string;
  productName: string;
  quantity: number;
  priceWithTax: number;
  date: string;
}

interface AppState {
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
}

interface ExtractedData {
  products?: Product[];
  customers?: Customer[];
  invoices?: Invoice[];
}

const initialState: AppState = {
  products: [],
  customers: [],
  invoices: []
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    updateProduct: (state, action: PayloadAction<{ id: string } & Partial<Product>>) => {
      const { id, ...updates } = action.payload;
      const productIndex = state.products.findIndex(product => product.id === id);
      if (productIndex !== -1) {
        const oldProductName = state.products[productIndex].productName;
        const updatedProduct = {
          ...state.products[productIndex],
          ...updates,
        };
        state.products[productIndex] = updatedProduct;

        // Update related invoices
        state.invoices = state.invoices.map(invoice => {
          if (invoice.productName === oldProductName) {
            return {
              ...invoice,
              productName: updatedProduct.productName,
              priceWithTax: updatedProduct.priceWithTax,
              quantity: updateProduct.quantity// Preserve the original quantity from the invoice
            };
          }
          return invoice;
        });
      }
    },
    updateCustomer: (state, action: PayloadAction<{ id: string } & Partial<Customer>>) => {
      const { id, ...updates } = action.payload;
      const customerIndex = state.customers.findIndex(customer => customer.id === id);
      if (customerIndex !== -1) {
        const oldCustomerName = state.customers[customerIndex].customerName;
        const updatedCustomer = {
          ...state.customers[customerIndex],
          ...updates
        };
        state.customers[customerIndex] = updatedCustomer;

        // Update related invoices
        if (updates.customerName) {
          state.invoices = state.invoices.map(invoice => {
            if (invoice.customerName === oldCustomerName) {
              return {
                ...invoice,
                customerName: updatedCustomer.customerName
              };
            }
            return invoice;
          });
        }
      }
    },
    updateInvoice: (state, action: PayloadAction<{ id: string } & Partial<Invoice>>) => {
      const { id, ...updates } = action.payload;
      const invoiceIndex = state.invoices.findIndex(invoice => invoice.id === id);
      if (invoiceIndex !== -1) {
        const updatedInvoice = {
          ...state.invoices[invoiceIndex],
          ...updates
        };
        state.invoices[invoiceIndex] = updatedInvoice;

        // Update related product
        if (updates.productName || updates.quantity) {
          const productIndex = state.products.findIndex(product => product.productName === updatedInvoice.productName);
          if (productIndex !== -1) {
            state.products[productIndex] = {
              ...state.products[productIndex],
              quantity: updates.quantity || state.products[productIndex].quantity
            };
          }
        }

        // Update related customer
        if (updates.customerName) {
          const customerIndex = state.customers.findIndex(customer => customer.customerName === updatedInvoice.customerName);
          if (customerIndex !== -1) {
            // Recalculate totalPurchaseAmount for the customer
            const customerInvoices = state.invoices.filter(inv => inv.customerName === updatedInvoice.customerName);
            const totalPurchaseAmount = customerInvoices.reduce((sum, inv) => sum + inv.priceWithTax, 0);
            state.customers[customerIndex] = {
              ...state.customers[customerIndex],
              totalPurchaseAmount
            };
          }
        }
      }
    },
    setInitialData: (state, action: PayloadAction<ExtractedData>) => {
      // Safely map invoices, ensuring all required fields are present
      const mappedInvoices = (action.payload.invoices || []).map(invoice => ({
        id: invoice.id || '',
        serialNumber: invoice.serialNumber || '',
        customerName: invoice.customerName || '',
        productName: invoice.productName || '',
        quantity: invoice.quantity || 0,
        priceWithTax: invoice.priceWithTax || 0,
        date: invoice.date || ''
      }));

      return {
        ...state,
        products: action.payload.products || state.products,
        customers: action.payload.customers || state.customers,
        invoices: mappedInvoices
      };
    }
  }
});

export const { updateProduct, updateCustomer, updateInvoice, setInitialData } = dataSlice.actions;
export default dataSlice.reducer;
