import { GoogleGenerativeAI } from "@google/generative-ai";
import * as XLSX from 'xlsx';
//import { Product, Customer, Invoice } from "@/app/redux/slices/dataSlice"

// ... keeping the interfaces as they are ...

interface ProcessedData {
  products: Array<{
    productName: string;
    quantity: string;
    unitPrice: string;
    tax: string;
    priceWithTax: string;
  }>;
  customers: Array<{
    customerName: string;
    phoneNumber: string;  // Changed to string since phone numbers should be strings
    address: string;
    totalPurchaseAmount: number;
  }>;
  invoices: Array<{
    serialNumber: string;
    customerName: string;
    productName: string;
    quantity: string;
    totalAmount: string;
    date: string;
    bankDetails: null;
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
    totalPurchaseAmount: null;
  };
  invoices: {
    serialNumber: string;
    customerName: string;
    productName: string;
    quantity: string;
    totalAmount: string;
    date: string;
    bankDetails: null;
  };
}


type StringRecord = Record<string, string>;



export default async function processAllData(excelData: ArrayBuffer): Promise<ProcessedData> {
  const data = new Uint8Array(excelData);
  const workbook = XLSX.read(data, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert worksheet to JSON
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (string | number)[][];

  const validData: StringRecord[] = [];
  const summaryData: Array<{ data: (string | number)[] }> = [];


  // Get headers from the first row
  const headers = (jsonData[0] || []) as string[];

  // Find the index where totals start
  const totalsIndex = jsonData.findIndex(row =>
    Array.isArray(row) &&
    row.length > 0 &&
    row[0] === 'Totals'
  );

  // Process main data (before totals)
  for (let i = 1; i < (totalsIndex === -1 ? jsonData.length : totalsIndex); i++) {
    const row = jsonData[i];

    // Skip empty rows
    if (!row || row.every(cell => cell === undefined || cell === null || cell === '')) {
      continue;
    }

    // Create record for the row
    const rowData: StringRecord = {};
    let hasData = false;

    headers.forEach((header, index) => {
      if (header && row[index] !== undefined && row[index] !== null && row[index] !== '') {
        // Convert all values to strings
        rowData[header] = row[index].toString();
        hasData = true;
      }
    });

    if (hasData) {
      validData.push(rowData);
    }
  }

  // Process all rows after 'Totals' as summary data
  if (totalsIndex !== -1) {
    for (let i = totalsIndex; i < jsonData.length; i++) {
      const row = jsonData[i];

      // Skip completely empty rows
      if (!row || row.every(cell => cell === undefined || cell === null || cell === '')) {
        continue;
      }

      // Add non-empty rows to summary data
      const cleanRow = row.filter(cell => cell !== undefined && cell !== null && cell !== '');
      if (cleanRow.length > 0) {
        summaryData.push({
          data: cleanRow
        });
      }
    }
  }
  console.log(validData)
  const res = await firstProcess(validData)
  return res;
}

async function getAIMapping(jsonData: StringRecord[]): Promise<AIMapping> {
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
        "products": [ 
          "productName": "<matching field name>",
          "quantity": "<matching field name>",
          "unitPrice": "<matching field name>",
          "tax": "<matching field name>",
          "priceWithTax": "<matching field name>"
        ],
        "customers": [
          "customerName": "<matching field name>",
          "phoneNumber": "<matching field name>",
          "address": "<matching field name>"
          "totalPurchaseAmount": "<matching field name>",
        ],
        "invoices": [
          "serialNumber": "<matching field name>",
          "customerName": "<matching field name>",
          "productName": "<matching field name>",
          "quantity": "<matching field name>",
          "totalAmount": "<matching field name>",
          "date": "<matching field name>",
          "bankDetails": null
        ]
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

  jsonData.forEach(row => {
    // Notice we're using row directly, not row.data
    const getValue = (fieldPath: string): string | number | null => {
      if (!fieldPath) return null;

      // Handle computed fields
      if (fieldPath.includes('/')) {
        const [total, qty] = fieldPath.split('/').map(p => p.trim());
        if (qty === 'Qty') {
          const totalAmount = parseFloat(String(row[total] || '0'));
          const quantity = parseFloat(String(row['Qty'] || '1'));
          return isNaN(totalAmount / quantity) ? 0 : totalAmount / quantity;
        }
      }

      // Handle direct field access
      return row[fieldPath] ?? null;
    };

    // Map products
    const product = {
      productName: String(getValue(mapping.products.productName) || ''),
      quantity: String(parseFloat(String(getValue(mapping.products.quantity) || '0'))),
      unitPrice: String(parseFloat(String(getValue(mapping.products.unitPrice) || '0'))),
      tax: String(parseFloat(String(getValue(mapping.products.tax) || '0'))),
      priceWithTax: String(parseFloat(String(getValue(mapping.products.priceWithTax) || '0')))
    };

    result.products.push(product);

    // Map customers
    const customer = {
      customerName: String(getValue(mapping.customers.customerName) || ''),
      phoneNumber: String(getValue(mapping.customers.phoneNumber) || ''),
      address: String(getValue(mapping.customers.address) || ''),
      totalPurchaseAmount: parseFloat(String(getValue('Item Total Amount') || '0'))
    };

    /*
    if (customer.customerName && customer.phoneNumber) {
      // Check if customer already exists
      const existingCustomer = result.customers.find(
        c => c.phoneNumber === customer.phoneNumber
      );

    if (existingCustomer) {
      // Update total purchase amount for existing customer
      existingCustomer.totalPurchaseAmount += customer.totalPurchaseAmount;
    } else {
    }
  }
      */
    result.customers.push(customer);

    // Map invoices
    const invoice = {
      serialNumber: String(getValue(mapping.invoices.serialNumber) || ''),
      customerName: String(getValue(mapping.invoices.customerName) || ''),
      productName: String(getValue(mapping.invoices.productName) || ''),
      quantity: String(parseFloat(String(getValue(mapping.invoices.quantity) || '0'))),
      totalAmount: String(parseFloat(String(getValue(mapping.invoices.totalAmount) || '0'))),
      date: String(getValue(mapping.invoices.date) || ''),
      bankDetails: null // Since it's null in mapping
    };
    result.invoices.push(invoice);

  });

  return result;
}

