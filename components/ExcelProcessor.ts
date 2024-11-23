import { GoogleGenerativeAI } from "@google/generative-ai";
import * as XLSX from 'xlsx';
//import { Product, Customer, Invoice } from "@/app/redux/slices/dataSlice"

// ... keeping the interfaces as they are ...


interface ProcessedData {
  products: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    tax: number;
    priceWithTax: number;
  }>;
  customers: Array<{
    customerName: string;
    phoneNumber: string;  // Changed to string since phone numbers should be strings
    address: string;
    totalPurchaseAmount: number;
  }>;
  invoices: Array<{
    serialNumber: string;
    totalAmount: number;
    date: string;
    bankDetails: string;
  }>;
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
  const data = new Uint8Array(excelData);
  const workbook = XLSX.read(data, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  /* eslint-disable @typescript-eslint/no-explicit-any */
  // Convert worksheet to JSON
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const validData: unknown = [];
  const summaryData = [];
  const emptyRows = [];

  // Get headers from the first row
  const headers = jsonData[0] || [];

  jsonData.forEach((row, rowIndex) => {
    const rowNumber = rowIndex + 1;

    if (!row || row.every((cell) => cell === undefined || cell === null || cell === '')) {
      emptyRows.push(rowNumber);
      return;
    }

    if (!row[0] && row.some((cell) => cell !== undefined)) {
      summaryData.push({
        row_number: rowNumber,
        data: row.filter((cell) => cell !== undefined),
      });
      return;
    }

    const rowData = {};
    let hasData = false;

    headers.forEach((header, index) => {
      if (header) {
        const value = row[index] || row[index] === 0 ? row[index] : header;
        if (value !== undefined && value !== null && value !== '') {
          rowData[header] = value;
          hasData = true;
        }
      }
      null
    });

    if (hasData) {
      validData.push({
        row_number: rowNumber,
        data: rowData
      });
    }
  });

  return await firstProcess(validData);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function firstProcess(rawData: any[]): Promise<ProcessedData> {
  try {
    // Get AI mapping for the data structure
    const mapping = await getAIMapping(rawData);
    console.log('AI Mapping:', mapping);

    // Process the data using the mapping
    return applyMapping(rawData, mapping);
  } catch (error) {
    console.error('Error in firstProcess:', error);
    throw error;
  }
}

function applyMapping(jsonData: any[], mapping: AIMapping): ProcessedData {
  if (!Array.isArray(jsonData)) {
    console.error('Invalid jsonData:', jsonData);
    throw new Error('jsonData must be an array');
  }

  const result: ProcessedData = {
    products: [],
    customers: [],
    invoices: []
  };

  // Process each row
  jsonData.forEach(row => {
    const data = row.data; // Access the data property of the row object

    // Safely get values with fallbacks
    const getValue = (fieldPath: string): string | number | null => {
      if (!fieldPath) return null;

      const parts = fieldPath.split('/').map(p => p.trim());
      if (parts.length === 1) {
        return data[fieldPath] ?? null;
      }
      // Handle computed fields like "Item Total Amount / Qty"
      if (parts[1] === 'Qty') {
        const total = parseFloat(String(data[parts[0]] || '0'));
        const qty = parseFloat(String(data['Qty'] || '1'));
        return isNaN(total / qty) ? 0 : total / qty;
      }
      return null;
    };

    // Map products
    const product = {
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
    const customer = {
      customerName: String(getValue(mapping.customers.customerName) || ''),
      phoneNumber: parseInt(String(getValue(mapping.customers.phoneNumber) || '0')),
      address: String(getValue(mapping.customers.address) || '')
    };

    if (customer.customerName && customer.phoneNumber &&
      !result.customers.some(c => c.phoneNumber === customer.phoneNumber)) {
      result.customers.push(customer);
    }

    // Map invoices
    const invoice = {
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

async function getAIMapping(jsonData: any[]): Promise<AIMapping> {
  // Get 3 random sample rows
  const sampleRows = jsonData
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const genAI = new GoogleGenerativeAI(process.env.API_KEY as string);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-002",
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.1,
    },
  });

  const prompt = `
    Given these sample rows from my dataset: ${JSON.stringify(sampleRows, null, 2)}

    Analyze these rows and create a mapping to this structure, use their row numbers to keep track:
    - products: (productName, quantity, unitPrice, tax, priceWithTax)
    - customers: (customerName, phoneNumber, address, total Purchase Amount)
    - invoices: (serialNumber, customerName, productName, quantity totalAmount, bankDetails, Date)
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
          "totalPurchaseAmount": "<matching field name>",
        },
        "invoices": {
          "serialNumber": "<matching field name>",
          "customerName": "<matching field name>",
          "productName": "<matching field name>",
          "quantity": "<matching field name>",
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
