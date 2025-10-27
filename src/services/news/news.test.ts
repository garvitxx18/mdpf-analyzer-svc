import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchNews } from "./news.service";

describe("News Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchNews", () => {
    it("should fetch recent news for a ticker", async () => {
      const mockResponse = {
        feed: [
          {
            title: "Apple Reports Strong Earnings",
            url: "https://example.com/news1",
            time_published: "20240115120000",
            summary: "Apple reports strong quarterly earnings",
            source: "Reuters",
          },
        ],
      };

      const fetchMock = vi.spyOn(global, "fetch");
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fetchNews({
        ticker: "AAPL",
        apiKey: "test-key",
        limit: 10,
      });

      expect(result.ticker).toBe("AAPL");
      expect(result.articles.length).toBeGreaterThan(0);
      expect(result.articles[0]?.title).toBe("Apple Reports Strong Earnings");
    });

    it("should limit news articles to top N", async () => {
      const mockResponse = {
        feed: Array.from({ length: 20 }, (_, i) => ({
          title: `News ${i + 1}`,
          url: `https://example.com/news${i + 1}`,
          time_published: new Date(Date.now() - i * 3600000)
            .toISOString()
            .replace(/[-:T.Z]/g, "")
            .slice(0, 14),
          summary: `Summary ${i + 1}`,
          source: "Reuters",
        })),
      };

      const fetchMock = vi.spyOn(global, "fetch");
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fetchNews({
        ticker: "AAPL",
        apiKey: "test-key",
        limit: 5,
      });

      expect(result.articles.length).toBeLessThanOrEqual(5);
    });

    it("should handle missing news feed", async () => {
      const mockResponse = {
        "Error Message": "Invalid API call",
      };

      const fetchMock = vi.spyOn(global, "fetch");
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fetchNews({
        ticker: "INVALID",
        apiKey: "test-key",
        limit: 10,
      });

      expect(result.articles).toEqual([]);
    });
  });
});

