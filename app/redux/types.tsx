export interface Product {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  priceWithTax: number;
  discount?: number;
}

export interface Customer {
  id: string;
  name: string;
  phoneNumber: string;
  totalPurchaseAmount: number;
  // Additional fields can be added
}

export interface Invoice {
  serialNumber: string;
  // customerId: string;
  customerName: string;
  //productId: string;
  productName: string;
  quantity: number;
  tax: number;
  totalAmount: number;
  date: string;
}

export interface AppState {
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
}

