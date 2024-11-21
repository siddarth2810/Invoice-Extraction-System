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
export interface FinalDataItem {
  id: number;
  invoiceId: string | null;
  customerName: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  priceWithTax: number;
  date: string | null;
}
export interface AppState {
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  finalData: FinalDataItem[];
  loading: boolean;
  error: string | null;
}

