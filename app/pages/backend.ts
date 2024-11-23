'use server'
// app/actions/backend.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import processAllData from "@/components/ExcelProcessor";
//import fs from "fs";
//import path from "path";


//customerId, productId and unit price
interface Invoice {
	id: string;
	serialNumber: string;
	customerName: string;
	productName: string;
	quantity: number;
	priceWithTax: number;
	date: string;
	bankDetails: string;
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

		// Add file size check
		const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
		if (file.size > MAX_FILE_SIZE) {
			throw new Error('File size exceeds 5MB limit');
		}

		// Check if file is Excel
		if (
			file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
			file.type === 'application/vnd.ms-excel'
		) {
			// Convert File to ArrayBuffer before processing
			const buffer = await file.arrayBuffer();
			const extractedData = await processAllData(buffer);
			return processExtractedData(extractedData);
		}



		const extractedText: string = await extractPdfOrImageContent(file);
		const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY as string);
		const model = genAI.getGenerativeModel({
			model: "gemini-1.5-flash-002",
			generationConfig: {
				maxOutputTokens: 8192,
				temperature: 0.1,
			},
		});

		//Split into two parallel requests for faster processing
		const [productsResult, metadataResult] = await Promise.all([
			// Products extraction
			model.generateContent([
				{ inlineData: { mimeType: "application/pdf", data: extractedText } },
				{
					text: `Extract ONLY product details from the invoice. Return JSON with:
		                    products ( 
		                        product Name, quantity, unitPrice, tax, priceWithTax 
		                    ),
		                    Focus on accuracy of numbers and product details.`
				}
			]),

			// Customer and invoice details
			model.generateContent([
				{ inlineData: { mimeType: "application/pdf", data: extractedText } },
				{
					text: `Extract ONLY customer and invoice details. Return JSON with:
		                    customers ( 
		                        customer Name, phoneNumber, address
		                    ),
		                    invoices (
		                        serial Number,
		                        total Amount,
		                        date,
		                        bank Details
		                    )`
				}
			])
		]);
		const productsData = await parseAIResponse(productsResult.response.text());
		const metadataData = await parseAIResponse(metadataResult.response.text());

		// Combine the results
		const combinedData = {
			products: productsData.products || [],
			customers: metadataData.customers || [],
			invoices: metadataData.invoices || []
		};

		return processExtractedData(combinedData);
		/*
		const filePath = path.join(process.cwd(), 'public', 'final.json');
		const extractedData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
		const processedData = processExtractedData(extractedData);
		return processedData;*/

	} catch (error) {
		console.error("Error in generateContent:", error);
		throw new Error(error instanceof Error ? error.message : 'Failed to generate content');
	}
}

async function parseAIResponse(responseText: string) {
	try {
		// First try cleaning JSON markers
		const cleanedText = responseText.replace(/```json\n|\n```/g, '').trim();
		return JSON.parse(cleanedText);
	} catch (error) {
		// Fallback to extracting JSON from text
		const jsonMatch = responseText.match(/\{[\s\S]*\}/);
		if (jsonMatch) {
			return JSON.parse(jsonMatch[0]);
		}
		console.error("Error in parseAIResponse:", error);
	}
}

/*
function isExcelProcessedData(data: any): boolean {
	// Check if data has the exact structure we expect from Excel processing
	return (
		data &&
		Array.isArray(data.products) &&
		Array.isArray(data.customers) &&
		Array.isArray(data.invoices) &&
		data.products[0]?.hasOwnProperty('productName')
	);
}

*/
/* eslint-disable @typescript-eslint/no-explicit-any */
function processExtractedData(data: any): ExtractedData {
	/*
	if (isExcelProcessedData(data)) {
		// For Excel data, we can return it directly as it's already in the correct format
		return {
			customers: data.customers,
			products: data.products,
			invoices: data.invoices.map((invoice: any) => ({
				...invoice,
				products: data.products // Add products to each invoice
			}))
		};
	}*/

	// Initialize processed data structure
	const processedData: ExtractedData = {
		invoices: [],
		products: [],
		customers: []
	};

	// Process customers
	if (Array.isArray(data.customers)) {
		processedData.customers = data.customers.map((customer: any) => ({
			id: customer.id?.toString() || crypto.randomUUID(),
			customerName: customer.customerName || 'Unknown Customer',
			phoneNumber: customer.phoneNumber || '',
			address: customer.address || '-',
			totalPurchaseAmount: Number(customer.totalPurchaseAmount) || Number(data.invoices?.[0]?.totalAmount) || 0
		}));
	}

	// Process products
	if (Array.isArray(data.products)) {
		processedData.products = data.products.map((product: any) => ({
			id: crypto.randomUUID(),
			productName: product.productName || 'Unknown Product',
			quantity: Number(product.quantity) || 0,
			unitPrice: Number(product.unitPrice) || 0,
			tax: product.tax ? parseFloat(product.tax.toString().replace('%', '')) : 0,
			priceWithTax: Number(product.priceWithTax) || 0
		}));
	}
	const formatBankDetails = (bankDetails: any): string => {
		if (!bankDetails || typeof bankDetails !== 'object') return 'N/A';
		return Object.entries(bankDetails)
			.map(([key, value]) => `${key}: ${value || 'Unknown'}`)
			.join(', ');
	};

	// Map invoices based on products and other data
	const invoiceData = data.invoices?.[0] || {}; // Get the first (and only) invoice object
	processedData.invoices = processedData.products.map((product) => ({
		id: crypto.randomUUID(),
		serialNumber: invoiceData.serialNumber || 'Unknown Invoice',
		customerName: processedData.customers[0]?.customerName || 'Unknown Customer',
		productName: product.productName,
		quantity: product.quantity,
		bankDetails: formatBankDetails(invoiceData.bankDetails) || '-',
		priceWithTax: product.priceWithTax,
		date: invoiceData.date || null,
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
