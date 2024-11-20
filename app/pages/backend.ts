'use server'
// app/actions/backend.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import path from "path";

interface ExtractedData {
	products: Array<{
		id: string;
		name: string;
		quantity: number;
		unitPrice: number;
		tax: number;
		priceWithTax: number;
	}>;
	customers: Array<{
		id: string;
		name: string;
		phoneNumber: string;
		totalPurchaseAmount: number;
	}>;
	invoices: Array<{
		serialNumber: string;
		customerName: string;
		productName: string;
		quantity: number;
		tax: number;
		totalAmount: number;
		date: string;
	}>;
}

export async function generateContent(): Promise<ExtractedData> {
	try {
		// Get the correct path to the PDF file
		const pdfPath = path.join(process.cwd(), 'public', 'simple.pdf');
		const genAI = new GoogleGenerativeAI(process.env.API_KEY as string);
		const fileManager = new GoogleAIFileManager(process.env.API_KEY as string);

		const uploadResponse = await fileManager.uploadFile(pdfPath, {
			mimeType: "application/pdf",
			displayName: "simple.pdf",
		});

		const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
		const result = await model.generateContent([
			{
				fileData: {
					mimeType: uploadResponse.file.mimeType,
					fileUri: uploadResponse.file.uri,
				},
			},
			{ text: "Extract and organize the following information from this document into JSON format with these sections: products (containing name, quantity, unit price, tax, price with tax), customers (containing name, phone number, total purchase amount), and invoices (containing serial number, customer details, product details, tax, total amount, date). Format the response as valid JSON." },
		]);

		const responseText = result.response.text();
		const cleanedText = responseText.replace(/```json\n|\n```/g, '').trim();

		// Add more robust parsing
		const extractedData = JSON.parse(cleanedText);

		// Validate and sanitize data
		const sanitizedData = {
			products: Array.isArray(extractedData.products) ? extractedData.products.map(product => ({
				id: product.id || crypto.randomUUID().toString().substring(0, 10),
				name: product.name || 'Unknown',
				quantity: product.quantity || 'N/A',
				unitPrice: product.unitPrice || 'N/A',
				tax: product.tax || 'N/A',
				priceWithTax: product.priceWithTax || 'N/A'

			})) : [],

			customers: Array.isArray(extractedData.customers)
				? extractedData.customers.map(customer => ({
					id: customer.id || crypto.randomUUID().toString().substring(0, 10),
					name: customer.name || 'Unknown',
					phoneNumber: customer.phoneNumber || 'N/A',
					totalPurchaseAmount: typeof customer.totalPurchaseAmount === 'number'
						? customer.totalPurchaseAmount
						: 0
				}))
				: [],
			invoices: Array.isArray(extractedData.invoices) ? extractedData.invoices.map(invoice => ({
				serialNumber: invoice.serialNumber || 'Unknown',
				customerName: invoice.customerName || 'Unknown',
				invoiceName: invoice.invoiceName || 'Unknown',
				quantity: invoice.quantity || 'N/A',
				tax: invoice.tax || 'N/A',
				totalAmount: invoice.totalAmount || 'N/A',
				date: invoice.date || 'Unknown',
			})) : []
		};

		return sanitizedData;
	} catch (error) {
		console.error("Error in generateContent:", error);
		throw new Error(error instanceof Error ? error.message : 'Failed to generate content');
	}
}
