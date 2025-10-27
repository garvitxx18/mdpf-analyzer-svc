import { describe, it, expect, vi } from "vitest";
import { calculateInputHash, shouldSkipScoring } from "./deduplication";
import { getMockScore } from "../../db/test-factories";
import type { EnrichmentResult } from "../data-enrichment/data-enrichment.service";

describe("Deduplication", () => {
  describe("calculateInputHash", () => {
    it("should generate consistent hash for same input", () => {
      const data1: EnrichmentResult = {
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
              title: "Test",
              url: "https://example.com",
              summary: "Summary",
              source: "Reuters",
              ts: new Date(),
              relevanceScore: 1.0,
            },
          ],
        },
      };

      const data2: EnrichmentResult = {
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
              title: "Test",
              url: "https://example.com",
              summary: "Summary",
              source: "Reuters",
              ts: new Date(),
              relevanceScore: 1.0,
            },
          ],
        },
      };

      const hash1 = calculateInputHash(data1);
      const hash2 = calculateInputHash(data2);

      expect(hash1).toBe(hash2);
    });

    it("should generate different hash for different input", () => {
      const data1: EnrichmentResult = {
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
          articles: [],
        },
      };

      const data2: EnrichmentResult = {
        ticker: "AAPL",
        marketData: {
          ticker: "AAPL",
          prices: [
            {
              ts: new Date("2024-01-16"),
              open: 151.0,
              high: 156.0,
              low: 150.0,
              close: 154.0,
              volume: 1000000,
            },
          ],
        },
        news: {
          ticker: "AAPL",
          articles: [],
        },
      };

      const hash1 = calculateInputHash(data1);
      const hash2 = calculateInputHash(data2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("shouldSkipScoring", () => {
    it("should return false for new ticker", async () => {
      const db = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue([]),
        }),
      };

      const result = await shouldSkipScoring("AAPL", "hash123", db as never);

      expect(result).toBe(false);
    });

    it("should return true if recent score exists with same hash", async () => {
      const sixHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);
      const recentScore = getMockScore({
        inputHash: "hash123",
        ts: sixHoursAgo,
      });

      const db = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue([recentScore]),
        }),
      };

      const result = await shouldSkipScoring("AAPL", "hash123", db as never);

      expect(result).toBe(true);
    });

    it("should return false if score is older than 6 hours", async () => {
      const eightHoursAgo = new Date(Date.now() - 8 * 60 * 60 * 1000);
      const oldScore = getMockScore({
        inputHash: "hash123",
        ts: eightHoursAgo,
      });

      const db = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue([oldScore]),
        }),
      };

      const result = await shouldSkipScoring("AAPL", "hash123", db as never);

      expect(result).toBe(false);
    });
  });
});

