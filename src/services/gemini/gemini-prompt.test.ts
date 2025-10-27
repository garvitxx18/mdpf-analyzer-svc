import { describe, it, expect } from "vitest";
import { buildGeminiPrompt, GEMINI_PROMPT_TEMPLATE } from "./gemini-prompt";
import type { EnrichmentResult } from "../data-enrichment/data-enrichment.service";

describe("Gemini Prompt", () => {
  describe("buildGeminiPrompt", () => {
    it("should build prompt from enriched data", () => {
      const enrichedData: EnrichmentResult = {
        ticker: "AAPL",
        marketData: {
          ticker: "AAPL",
          prices: [
            {
              ts: new Date("2024-01-15"),
              open: 150.0,
              high: 155.0,
              low: 149.0,
              close: 153.0,
              volume: 1000000,
            },
          ],
        },
        news: {
          ticker: "AAPL",
          articles: [
            {
              title: "Apple Reports Strong Earnings",
              url: "https://example.com/news",
              summary: "Apple reports strong earnings",
              source: "Reuters",
              ts: new Date(),
              relevanceScore: 1.5,
            },
          ],
        },
      };

      const prompt = buildGeminiPrompt(enrichedData);

      expect(prompt).toContain("AAPL");
      expect(prompt).toContain("Apple Reports Strong Earnings");
      expect(prompt).toContain(GEMINI_PROMPT_TEMPLATE);
    });

    it("should include JSON schema instructions", () => {
      const enrichedData: EnrichmentResult = {
        ticker: "GOOGL",
        marketData: {
          ticker: "GOOGL",
          prices: [],
        },
        news: {
          ticker: "GOOGL",
          articles: [],
        },
      };

      const prompt = buildGeminiPrompt(enrichedData);

      expect(prompt).toContain("score");
      expect(prompt).toContain("confidence");
      expect(prompt).toContain("direction");
      expect(prompt).toContain("rationale");
      expect(prompt).toContain("risks");
    });
  });

  describe("GEMINI_PROMPT_TEMPLATE", () => {
    it("should contain required JSON schema fields", () => {
      expect(GEMINI_PROMPT_TEMPLATE).toContain("score");
      expect(GEMINI_PROMPT_TEMPLATE).toContain("confidence");
      expect(GEMINI_PROMPT_TEMPLATE).toContain("direction");
      expect(GEMINI_PROMPT_TEMPLATE).toContain("rationale");
      expect(GEMINI_PROMPT_TEMPLATE).toContain("risks");
    });
  });
});

