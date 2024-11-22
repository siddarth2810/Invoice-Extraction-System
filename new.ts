'use server'
// app/actions/backend.ts
//import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";


//customerId, productId and unit price
interface Invoice {
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
interface Product {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  priceWithTax: number;
};
interface Customer {
  id: string;
  customerName: string;
  phoneNumber: string;
  totalPurchaseAmount: number;
};

interface ExtractedData {
  invoices: Invoice[];
  products: Product[];
  customers: Customer[];
}


export async function generateContent(formData: FormData) {
  try {
    const file = formData.get('file') as File;

    if (!file || !(file instanceof File)) {
      throw new Error('No file uploaded');
    }

    const extractedText: string = await extractPdfOrImageContent(file);

    //		const genAI = new GoogleGenerativeAI(process.env.API_KEY as string);
    //		const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });
    //		const prompt = `
    //g
    //      Meticulously extract ALL invoice details. Your JSON response MUST include the below values:
    //        products : (id, product name, quantity, unitPrice, tax, priceWithTax),
    //        customers : (id, customer name ,  phoneNumber),  
    //        invoices: (serial number or invoice number, total amount, date)
    //
    //	Instructions:
    //      1. Map all extracted information to the appropriate fields in the structure above.
    //      2. If a field is missing or cannot be accurately determined, use null for that field.
    //      3. If there are multiple products or customers, include them all in their respective arrays.
    //      4. For any ambiguous or challenging extractions, add an "extractionNotes" field to the relevant object explaining the issue.
    //      5. Tax is usually found in percentage at the bottom of the invoice pdf or images
    //      Provide the most accurate and complete JSON possible based on the extracted information.
    //
    //`;
    //
    //		const result = await model.generateContent([
    //			{
    //				inlineData: {
    //					mimeType: "application/pdf",
    //					data: extractedText
    //				}
    //			},
    //			{ text: prompt }
    //		]);
    //
    //		const responseText = result.response.text();
    //		console.log("Raw AI Response:", responseText);
    //
    //		// eslint-disable-next-line @typescript-eslint/no-explicit-any
    //		let extractedData: any;
    //
    //		try {
    //			const cleanedText = responseText.replace(/```json\n|\n```/g, '').trim();
    //			extractedData = JSON.parse(cleanedText);
    //		} catch (error) {
    //			console.error("Error parsing cleaned AI response:", error);
    //			const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    //			if (jsonMatch) {
    //				try {
    //					extractedData = JSON.parse(jsonMatch[0]);
    //				} catch (innerError) {
    //					console.error("Error parsing extracted JSON:", innerError);
    //					throw new Error("Failed to extract valid JSON from AI response");
    //				}
    //			} else {
    //				throw new Error("No valid JSON structure found in AI response");
    //			}
    //		}
    //
    //		console.log("Parsed Extracted Data:", extractedData);

    // Process and validate the extracted data

    // Read and parse the JSON file
    const filePath = path.join(process.cwd(), 'public', 'test.json');
    const extractedData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const processedData = processExtractedData(extractedData);

    console.log(processedData)
    return processedData;

  } catch (error) {
    console.error("Error in generateContent:", error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate content');
  }
}
/* eslint-disable @typescript-eslint/no-explicit-any */
function processExtractedData(data: any): ExtractedData {
  const processedData: ExtractedData = {
    invoices: [],
    products: [],
    customers: [],
    baseInvoices: []
  };

  // Process invoices
  if (data.invoices && Array.isArray(data.invoices)) {
    processedData.baseInvoices = data.invoices.map((invoice: any) => ({
      id: invoice.id?.toString() || crypto.randomUUID(),
      serialNumber: invoice.serialNumber || 'Unknown Invoice',
      date: invoice.date || '',
      totalAmount: Number(invoice.totalAmount) || 0
    }));
  } else if (data.invoiceNumber) {
    // Fallback for the case when invoice data is not in an array
    processedData.invoices = [{
      id: crypto.randomUUID(),
      serialNumber: data.invoiceNumber || 'Unknown Invoice',
      date: data.invoiceDate || '',
      totalAmount: Number(data.totalAmount) || 0


    }];

  }

  // Process products
  if (data.products && Array.isArray(data.products)) {
    processedData.products = data.products.map((product: any) => ({
      id: product.id?.toString() || crypto.randomUUID(),
      productName: product.productName || 'Unknown Product',
      quantity: Number(product.quantity) || 0,
      unitPrice: Number(product.unitPrice) || 0,
      tax: product.tax ? parseFloat(product.tax.toString().replace('%', '')) : 0,
      priceWithTax: Number(product.priceWithTax) || 0
    }));
  }

  // Process customers
  if (data.customers && Array.isArray(data.customers)) {
    processedData.customers = data.customers.map((customer: any) => ({
      id: customer.id?.toString() || crypto.randomUUID(),
      customerName: customer.customerName || 'Unknown Customer',
      phoneNumber: customer.phoneNumber || '',
      totalPurchaseAmount: Number(customer.totalPurchaseAmount) || processedData.invoices[0]?.totalAmount || 0,
    }));
  }

  // Create Invoice from baseInvoice and products and customers 
  processedData.invoices = processedData.products.map((product, index) => ({
    id: index + 1,
    invoiceId: processedData.invoices[0]?.serialNumber || null,
    customerName: processedData.customers[0]?.customerName || null,
    productName: product.productName,
    quantity: product.quantity,
    unitPrice: product.unitPrice,
    tax: product.tax,
    priceWithTax: product.priceWithTax,
    date: processedData.invoices[0]?.date || null
  }));

  return processedData;
}
/* eslint-disable @typescript-eslint/no-explicit-any */
// Example usage
async function extractPdfOrImageContent(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const base64File = Buffer.from(arrayBuffer).toString('base64');
  return base64File;
}

