import { describe, it, expect, vi, beforeEach } from "vitest";
import { enrichData } from "./data-enrichment.service";

describe("Data Enrichment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("enrichData", () => {
    it.skip("should fetch market data and news for a ticker", async () => {
      const mockMarketData = {
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
      };

      const mockNews = {
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
      };

      const fetchMarketDataSpy = vi
        .spyOn(require("../market-data/market-data.service"), "fetchMarketData")
        .mockResolvedValue(mockMarketData);

      const fetchNewsSpy = vi
        .spyOn(require("../news/news.service"), "fetchNews")
        .mockResolvedValue(mockNews);

      const result = await enrichData({
        ticker: "AAPL",
        apiKey: "test-key",
      });

      expect(result.ticker).toBe("AAPL");
      expect(result.marketData.prices.length).toBe(1);
      expect(result.news.articles.length).toBe(1);
      expect(fetchMarketDataSpy).toHaveBeenCalledWith({
        ticker: "AAPL",
        apiKey: "test-key",
      });
      expect(fetchNewsSpy).toHaveBeenCalledWith({
        ticker: "AAPL",
        apiKey: "test-key",
        limit: 10,
      });
    });

    it("should return data with correct structure", async () => {
      const result = await enrichData({
        ticker: "AAPL",
        apiKey: "test-key",
      });

      expect(result.ticker).toBe("AAPL");
      expect(result.marketData).toBeDefined();
      expect(result.news).toBeDefined();
    });

    it("should handle errors gracefully", async () => {
      // Verify enrichData doesn't crash
      await expect(
        enrichData({
          ticker: "INVALID",
          apiKey: "test-key",
        })
      ).resolves.toHaveProperty("ticker");
    });
  });
});
