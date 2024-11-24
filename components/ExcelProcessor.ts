import { GoogleGenerativeAI } from "@google/generative-ai";
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

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
    totalPurchaseAmount: string | null;
  };
  invoices: {
    serialNumber: string;
    customerName: string;
    productName: string;
    quantity: string;
    priceWithTax: string;
    date: string;
    bankDetails: string | null;
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
    - invoices: (serialNumber, customerName, productName, quantity,price with Tax, bankDetails, Date)
    Look at the sample data and determine which fields best match each required field.
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
          "priceWithTax": "<matching field name>",
          "date": "<matching field name>",
          "bankDetails": null
        ]
      }
    `;

  const response = await model.generateContent(prompt);
  const result = response.response.text();

  if (!result) {
    throw new Error('Empty response from AI');
  }
  try {
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

  const productMap = new Map<string, Product>();
  const customerMap = new Map<string, Customer>();

  jsonData.forEach(row => {
    const getValue = (fieldPath: string | null): string | number | null => {
      if (!fieldPath) return null;

      if (fieldPath.includes('/')) {
        const [numerator, denominator] = fieldPath.split('/').map(p => p.trim());
        const numeratorValue = parseFloat(String(row[numerator] || '0'));
        const denominatorValue = parseFloat(String(row[denominator] || '1'));
        return isNaN(numeratorValue / denominatorValue) ? 0 : numeratorValue / denominatorValue;
      }

      return row[fieldPath] ?? null;
    };

    const parseNumber = (value: string | number | null): number => {
      if (value === null) return 0;
      const parsed = typeof value === 'string' ? parseFloat(value) : value;
      return isNaN(parsed) ? 0 : parsed;
    };

    // Map products
    const productName = String(getValue(mapping.products.productName) || '');
    if (productName) {
      let product = productMap.get(productName);
      if (!product) {
        product = {
          id: uuidv4(),
          productName,
          quantity: 0,
          unitPrice: 0,
          tax: 0,
          priceWithTax: 0
        };
        productMap.set(productName, product);
      }
      product.quantity += parseNumber(getValue(mapping.products.quantity));
      product.unitPrice = parseNumber(getValue(mapping.products.unitPrice));
      product.tax = parseNumber(getValue(mapping.products.tax));
      product.priceWithTax = parseNumber(getValue(mapping.products.priceWithTax));
    }

    // Map customers
    const customerName = String(getValue(mapping.customers.customerName) || '');
    const phoneNumber = String(getValue(mapping.customers.phoneNumber) || '');
    if (customerName && phoneNumber) {
      let customer = customerMap.get(phoneNumber);
      if (!customer) {
        customer = {
          id: uuidv4(),
          customerName,
          phoneNumber,
          address: String(getValue(mapping.customers.address) || ''),
          totalPurchaseAmount: 0
        };
        customerMap.set(phoneNumber, customer);
      }
      customer.totalPurchaseAmount += parseNumber(getValue(mapping.customers.totalPurchaseAmount) || getValue('Item Total Amount'));
    }

    // Map invoices
    const invoice: Invoice = {
      id: uuidv4(),
      serialNumber: String(getValue(mapping.invoices.serialNumber) || ''),
      customerName: String(getValue(mapping.invoices.customerName) || ''),
      productName: String(getValue(mapping.invoices.productName) || ''),
      quantity: parseNumber(getValue(mapping.invoices.quantity)),
      priceWithTax: parseNumber(getValue(mapping.invoices.priceWithTax)),
      date: String(getValue(mapping.invoices.date) || ''),
      bankDetails: getValue(mapping.invoices.bankDetails) as string | null
    };
    result.invoices.push(invoice);
  });

  result.products = Array.from(productMap.values());
  result.customers = Array.from(customerMap.values());

  return result;
}
