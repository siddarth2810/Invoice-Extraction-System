import { GoogleGenerativeAI } from "@google/generative-ai";
import * as XLSX from 'xlsx';

// Define interfaces for processed data
interface Product {
  productName: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  priceWithTax: number;
}

interface Customer {
  customerName: string;
  phoneNumber: number;
  address: string;
}

interface Invoice {
  serialNumber: string;
  totalAmount: number;
  date: string;
  bankDetails: null;
}

interface ProcessedData {
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
}

interface AIMapping {
  products: {
    productName: string;
    quantity: string;
    unitPrice: string;
    tax: string;
    priceWithTax: string;
  };
  customers: {
    customerName: string;
    phoneNumber: string;
    address: string;
  };
  invoices: {
    serialNumber: string;
    totalAmount: string;
    date: string;
    bankDetails: null;
  };
}

export default async function processAllData(excelData: ArrayBuffer): Promise<ProcessedData> {
  // Read the Excel file
  const data = new Uint8Array(excelData);
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert worksheet to JSON with headers
  const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, string | number>[];

  // First get the AI mapping from sample rows
  const mapping = await getAIMapping(jsonData);

  // Then process all rows using the mapping
  return applyMapping(jsonData, mapping);
}

function applyMapping(jsonData: Record<string, string | number>[], mapping: AIMapping): ProcessedData {
  const result: ProcessedData = {
    products: [],
    customers: [],
    invoices: []
  };

  // Process each row
  jsonData.forEach(data => {
    // Safely get values with fallbacks
    const getValue = (fieldPath: string): string | number | null => {
      const parts = fieldPath.split('/').map(p => p.trim());
      if (parts.length === 1) {
        return data[fieldPath] ?? null;
      }
      // Handle computed fields like "Item Total Amount / Qty"
      if (parts[1] === 'Qty') {
        const total = parseFloat(String(data[parts[0]] || '0'));
        const qty = parseFloat(String(data['Qty'] || '1'));
        return total / qty;
      }
      return null;
    };

    // Map products
    const product: Product = {
      productName: String(getValue(mapping.products.productName) || ''),
      quantity: parseFloat(String(getValue(mapping.products.quantity) || '0')),
      unitPrice: Number(getValue(mapping.products.unitPrice) || 0),
      tax: parseFloat(String(getValue(mapping.products.tax) || '0')),
      priceWithTax: parseFloat(String(getValue(mapping.products.priceWithTax) || '0'))
    };

    if (product.productName && product.quantity > 0) {
      result.products.push(product);
    }

    // Map customers
    const customer: Customer = {
      customerName: String(getValue(mapping.customers.customerName) || ''),
      phoneNumber: parseInt(String(getValue(mapping.customers.phoneNumber) || '0')),
      address: String(getValue(mapping.customers.address) || '')
    };

    if (customer.customerName && customer.phoneNumber &&
      !result.customers.some(c => c.phoneNumber === customer.phoneNumber)) {
      result.customers.push(customer);
    }

    // Map invoices
    const invoice: Invoice = {
      serialNumber: String(getValue(mapping.invoices.serialNumber) || ''),
      totalAmount: parseFloat(String(getValue(mapping.invoices.totalAmount) || '0')),
      date: String(getValue(mapping.invoices.date) || ''),
      bankDetails: null
    };

    if (invoice.serialNumber &&
      !result.invoices.some(i => i.serialNumber === invoice.serialNumber)) {
      result.invoices.push(invoice);
    }
  });

  return result;
}

async function getAIMapping(jsonData: Record<string, string | number>[]): Promise<AIMapping> {
  // Get 3 random sample rows
  const sampleRows = [...jsonData]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-002",
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.1,
    },
  });

  const prompt = `
    Given these sample rows from my dataset: ${JSON.stringify(sampleRows, null, 2)}

    Analyze these rows and create a mapping to this structure:
    - products: (productName, quantity, unitPrice, tax, priceWithTax)
    - customers: (customerName, phoneNumber, address)
    - invoices: (serialNumber, totalAmount, date, bankDetails)

    Look at the sample data and determine which fields best match each required field.
    For computed fields like unitPrice, you can specify calculations (e.g. "Item Total Amount / Qty").
    If a field doesn't have a clear match, return null.

    Return ONLY a valid JSON object with the structure:
    {
      "mapping": {
        "products": {
          "productName": "<matching field name>",
          "quantity": "<matching field name>",
          "unitPrice": "<matching field name or calculation>",
          "tax": "<matching field name>",
          "priceWithTax": "<matching field name>"
        },
        "customers": {
          "customerName": "<matching field name>",
          "phoneNumber": "<matching field name>",
          "address": "<matching field name>"
        },
        "invoices": {
          "serialNumber": "<matching field name>",
          "totalAmount": "<matching field name>",
          "date": "<matching field name>",
          "bankDetails": null
        }
      }
    }`;

  try {
    const response = await model.generateContent(prompt);
    const result = response.response.text();

    if (!result) {
      throw new Error('Empty response from AI');
    }

    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON object found in response');
    }

    const parsedResult = JSON.parse(jsonMatch[0]) as { mapping: AIMapping };
    return parsedResult.mapping;
  } catch (error) {
    console.error('Error getting AI mapping:', error);
    throw error;
  }
}
