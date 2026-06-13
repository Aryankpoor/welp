import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { fileUrl } = await req.json();

    const fileContent = await fetch(fileUrl).then((res) => res.text());

    const extractionPrompt = `Extract the following information from this invoice and format it as JSON: date, invoice number, total amount, vendor name, and line items. Here's the invoice content:\n\n${fileContent}`;

    const extractionResponse = await openai.completions.create({
      model: "text-davinci-002",
      prompt: extractionPrompt,
      max_tokens: 500,
    });

    const extractedText =
      extractionResponse.choices[0].text?.trim() || "{}";

    const summarizationPrompt = `Summarize the key details of this invoice in a short paragraph:\n\n${extractedText}`;

    const summarizationResponse = await openai.completions.create({
      model: "text-davinci-002",
      prompt: summarizationPrompt,
      max_tokens: 150,
    });

    const summary =
      summarizationResponse.choices[0].text?.trim() || "";

    return NextResponse.json({
      text: extractedText,
      summary,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Error processing invoice" },
      { status: 500 }
    );
  }
} 