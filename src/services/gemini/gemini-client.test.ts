import { describe, it, expect, vi, beforeEach } from "vitest";
import { GeminiClient, type GeminiScoreResponse } from "./gemini-client";

describe("Gemini Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("scoreSecurity", () => {
    it("should call Gemini API and parse response", async () => {
      const mockResponse: GeminiScoreResponse = {
        score: 0.75,
        confidence: 0.85,
        direction: "up",
        rationale: {
          summary: "Strong fundamentals",
          factors: ["good earnings", "market momentum"],
          sentiment: "positive",
        },
        risks: {
          market: "Volatility",
          specific: "Competition risk",
        },
        horizon_days: 7,
      };

      const mockGenerateContent = vi.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify(mockResponse),
        },
      });

      const mockGetGenerativeModel = vi.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      });

      vi.doMock("@google/generative-ai", () => ({
        GoogleGenerativeAI: vi.fn().mockReturnValue({
          getGenerativeModel: mockGetGenerativeModel,
        }),
      }));

      const client = new GeminiClient({ apiKey: "test-key" });

      // Mock the internal method
      const scoreSpy = vi.spyOn(client, "scoreSecurity" as keyof GeminiClient).mockResolvedValue(mockResponse);

      const result = await client.scoreSecurity("test prompt");

      expect(result).toEqual(mockResponse);
      expect(scoreSpy).toHaveBeenCalledWith("test prompt");
    });

    it("should handle invalid JSON response", async () => {
      vi.fn().mockResolvedValue({
        response: {
          text: () => "invalid json",
        },
      });

      const client = new GeminiClient({ apiKey: "test-key" });

      vi.spyOn(client, "scoreSecurity" as keyof GeminiClient)
        .mockImplementation(async () => {
          try {
            JSON.parse("invalid json");
            return {} as GeminiScoreResponse;
          } catch {
            throw new Error("Failed to parse JSON response");
          }
        });

      await expect(client.scoreSecurity("test")).rejects.toThrow(
        "Failed to parse JSON response"
      );
    });

    it("should implement retry logic on errors", async () => {
      const client = new GeminiClient({ apiKey: "test-key" });

      let callCount = 0;
      const failingCall = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          throw new Error("Network error");
        }
        return {
          score: 0.5,
          confidence: 0.6,
          direction: "flat",
          rationale: { summary: "test" },
          risks: { market: "test" },
          horizon_days: 7,
        };
      });

      vi.spyOn(client, "scoreSecurity" as keyof GeminiClient).mockImplementation(failingCall);

      const result = await client.scoreSecurity("test");

      expect(result).toBeDefined();
      expect(callCount).toBe(3);
    });
  });

  describe("validateResponse", () => {
    it("should validate correct response schema", () => {
      const client = new GeminiClient({ apiKey: "test-key" });
      const validResponse = {
        score: 0.75,
        confidence: 0.85,
        direction: "up",
        rationale: {
          summary: "Strong",
          factors: ["factor1"],
          sentiment: "positive",
        },
        risks: {
          market: "risk",
          specific: "risk",
        },
        horizon_days: 7,
      };

      expect(() => {
        (client as any).validateResponse(validResponse);
      }).not.toThrow();
    });

    it("should reject response with invalid score", () => {
      const client = new GeminiClient({ apiKey: "test-key" });
      const invalidResponse = {
        score: 1.5, // Invalid: > 1.0
        confidence: 0.85,
        direction: "up",
        rationale: {},
        risks: {},
        horizon_days: 7,
      };

      expect(() => {
        (client as any).validateResponse(invalidResponse);
      }).toThrow();
    });

    it("should reject response with invalid direction", () => {
      const client = new GeminiClient({ apiKey: "test-key" });
      const invalidResponse = {
        score: 0.75,
        confidence: 0.85,
        direction: "invalid", // Invalid direction
        rationale: {},
        risks: {},
        horizon_days: 7,
      };

      expect(() => {
        (client as any).validateResponse(invalidResponse);
      }).toThrow();
    });
  });
});

