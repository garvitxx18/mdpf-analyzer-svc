import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchMarketData } from "./market-data.service";

describe("Market Data Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchMarketData", () => {
    it("should fetch OHLCV data for a ticker", async () => {
      const mockResponse = {
        "Time Series (Daily)": {
          "2024-01-15": {
            "1. open": "150.0",
            "2. high": "155.0",
            "3. low": "149.0",
            "4. close": "153.0",
            "5. volume": "1000000",
          },
        },
      };

      const fetchMock = vi.spyOn(global, "fetch");
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fetchMarketData({
        ticker: "AAPL",
        apiKey: "test-key",
      });

      expect(result).toEqual({
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
      });
    });

    it("should handle missing daily time series", async () => {
      const mockResponse = {
        "Error Message": "Invalid API call",
      };

      const fetchMock = vi.spyOn(global, "fetch");
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fetchMarketData({
        ticker: "INVALID",
        apiKey: "test-key",
      });

      expect(result.prices).toEqual([]);
    });

    it("should handle network errors", async () => {
      const fetchMock = vi.spyOn(global, "fetch");
      fetchMock.mockRejectedValue(new Error("Network error"));

      await expect(
        fetchMarketData({
          ticker: "AAPL",
          apiKey: "test-key",
        })
      ).rejects.toThrow("Network error");
    });
  });
});

