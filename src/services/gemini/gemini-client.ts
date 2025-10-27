import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

export type GeminiScoreResponse = {
  score: number;
  confidence: number;
  direction: "up" | "flat" | "down";
  rationale: {
    summary: string;
    factors: string[];
    sentiment: string;
  };
  risks: {
    market: string;
    specific: string;
  };
  horizon_days: number;
};

const GeminiResponseSchema = z.object({
  score: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  direction: z.enum(["up", "flat", "down"]),
  rationale: z.object({
    summary: z.string(),
    factors: z.array(z.string()),
    sentiment: z.string(),
  }),
  risks: z.object({
    market: z.string(),
    specific: z.string(),
  }),
  horizon_days: z.number().int().positive(),
});

export type GeminiClientOptions = {
  apiKey: string;
  model?: string;
  maxRetries?: number;
};

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: string;
  private maxRetries: number;

  constructor(options: GeminiClientOptions) {
    const { apiKey, model = "gemini-2.0-flash-exp", maxRetries = 3 } = options;
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = model;
    this.maxRetries = maxRetries;
  }

  async scoreSecurity(prompt: string): Promise<GeminiScoreResponse> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const genModel = this.genAI.getGenerativeModel({ model: this.model });

        const result = await genModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const cleanedText = this.extractJsonFromMarkdown(text);
        const parsed = JSON.parse(cleanedText);
        this.validateResponse(parsed);

        return parsed as GeminiScoreResponse;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < this.maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError ?? new Error("Failed to score security");
  }

  private extractJsonFromMarkdown(text: string): string {
    // Remove markdown code blocks (```json ... ``` or ``` ... ```)
    let cleaned = text.replace(/^```(?:json)?$/gm, '').trim();
    
    // Remove leading/trailing backticks if they exist
    cleaned = cleaned.replace(/^`+|`+$/g, '');
    
    return cleaned.trim();
  }

  private validateResponse(response: unknown): void {
    GeminiResponseSchema.parse(response);
  }
}

