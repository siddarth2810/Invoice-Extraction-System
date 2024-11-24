import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function getAIMapping(headers: string[]) {
  const prompt = `Given these exact Excel headers: ${JSON.stringify(headers)}

Your task is to create a mapping object that categorizes these headers into products, customers, and invoices. 
Use EXACT header names from the provided list, including spaces and capitalization.
Create a JSON mapping object that matches these exact headers to our required fields.
IMPORTANT: Return ONLY a valid JSON object with double quotes.
Required fields for each category:
- Products: product name, quantity, unit price, tax, price with tax
- Customers: customer name, phone number, address, total purchase amount
- Invoices: serial number, customer name, product name, quantity, price with tax, date

Example response format:
{
  "products": {
    "productName": "exact header for product name",
    "quantity": "exact header for quantity",
    "unitPrice": "exact header for unit price",
    "tax": "exact header for tax",
    "priceWithTax": "exact header for price with tax"
  },
  "customers": {
    "customerName": "exact header for customer name",
    "phoneNumber": "exact header for phone number",
    "address": "exact header for address",
    "totalPurchaseAmount": "exact header for total amount"
  },
  "invoices": {
    "serialNumber": "exact header for serial number",
    "customerName": "exact header for customer name",
    "productName": "exact header for product name",
    "quantity": "exact header for quantity",
    "priceWithTax": "exact header for price with tax",
    "date": "exact header for date",
    "bankDetails": "exact header for bank details"
  }
}

Only use headers that exist in the provided list. If a required field doesn't have a matching header, omit it from the mapping.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  try {
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Failed to parse AI mapping:', error);
    throw new Error('Failed to generate valid mapping');
  }
}