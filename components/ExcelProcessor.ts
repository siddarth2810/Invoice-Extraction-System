import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import { getAIMapping } from './gemini';
interface ProcessedData {
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
}

interface Product {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  priceWithTax: number;
}

interface Customer {
  id: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  totalPurchaseAmount: number;
}

interface Invoice {
  id: string;
  serialNumber: string;
  customerName: string;
  productName: string;
  quantity: number;
  priceWithTax: number;
  date: string;
  bankDetails: string | null;
}




export default async function processAllData(excelData: ArrayBuffer): Promise<ProcessedData> {
  const data = new Uint8Array(excelData);
  const workbook = XLSX.read(data, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Get raw data with position-based arrays
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (string | number)[][];
  const headers = (jsonData[0] || []) as string[];
  
  console.log('Excel Headers:', headers);

  // Get AI mapping using just the headers
  const mapping = await getAIMapping(headers);
  console.log('AI Mapping:', mapping);

  // Create header positions map
  const headerPositions = new Map<string, number>();
  headers.forEach((header, index) => {
    headerPositions.set(header, index);
  });

  const result: ProcessedData = {
    products: [],
    customers: [],
    invoices: []
  };

  // Keep customer map for combining customers with same phone number
  const customerMap = new Map<string, Customer>();

  // Process main data
  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || row.length === 0) continue;

    // Helper function to get value by mapped header
    const getValue = (category: keyof typeof mapping, field: string): string => {
      const headerName = mapping[category][field];
      const position = headerPositions.get(headerName);
      return position !== undefined ? String(row[position] || '') : '';
    };

    // Process each row as a unique product
    const productName = getValue('products', 'productName');
    if (productName) {
      const product: Product = {
        id: uuidv4(),
        productName,
        quantity: parseFloat(getValue('products', 'quantity') || '0'),
        unitPrice: parseFloat(getValue('products', 'unitPrice') || '0'),
        tax: parseFloat(getValue('products', 'tax') || '0'),
        priceWithTax: parseFloat(getValue('products', 'priceWithTax') || '0')
      };
      result.products.push(product);
    }

    // Process customers (combining based on phone number)
    const phoneNumber = getValue('customers', 'phoneNumber');
    if (phoneNumber) {
      let customer = customerMap.get(phoneNumber);
      if (!customer) {
        // New customer
        customer = {
          id: uuidv4(),
          customerName: getValue('customers', 'customerName'),
          phoneNumber,
          address: getValue('customers', 'address'),
          totalPurchaseAmount: parseFloat(getValue('customers', 'totalPurchaseAmount') || '0')
        };
        customerMap.set(phoneNumber, customer);
      } else {
        // Update existing customer's total purchase amount
        const currentAmount = parseFloat(getValue('customers', 'totalPurchaseAmount') || '0');
        customer.totalPurchaseAmount += currentAmount;
        
        // Optionally update other fields if needed
        if (getValue('customers', 'customerName')) {
          customer.customerName = getValue('customers', 'customerName');
        }
        if (getValue('customers', 'address')) {
          customer.address = getValue('customers', 'address');
        }
      }
    }

    // Process each row as a unique invoice
    const serialNumber = getValue('invoices', 'serialNumber');
    if (serialNumber) {
      const invoice: Invoice = {
        id: uuidv4(),
        serialNumber,
        customerName: getValue('invoices', 'customerName'),
        productName: getValue('invoices', 'productName'),
        quantity: parseFloat(getValue('invoices', 'quantity') || '0'),
        priceWithTax: parseFloat(getValue('invoices', 'priceWithTax') || '0'),
        date: getValue('invoices', 'date'),
        bankDetails: getValue('invoices', 'bankDetails')
      };
      result.invoices.push(invoice);
    }
  }

  // Convert customer map to array for final result
  result.customers = Array.from(customerMap.values());

  console.log('Processed Result:', result);
  return result;
}
