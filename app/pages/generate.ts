// app/actions/generate.ts
'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateContent(prompt: string) {
	if (!prompt) {
		throw new Error("Prompt is required");
	}

	try {
		console.log(prompt)
		console.log(process.env.API_KEY)
		const genAI = new GoogleGenerativeAI(process.env.API_KEY as string);
		const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
		const result = await model.generateContent(prompt);
		const generatedText = result.response.text(); // Ensure this fetches the text properly

		console.log(generatedText)
		return generatedText


	} catch (error) {
		console.error("Error communicating with API:", error);
		throw new Error("Failed to generate content");
	}
}
