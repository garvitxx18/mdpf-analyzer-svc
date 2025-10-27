import { vi } from "vitest";

export const mockAlphaVantageMarketData = (overrides?: Record<string, unknown>) => {
  return {
    "Time Series (Daily)": {
      "2024-01-15": {
        "1. open": "150.0",
        "2. high": "155.0",
        "3. low": "149.0",
        "4. close": "153.0",
        "5. volume": "1000000",
      },
    },
    ...overrides,
  };
};

export const mockAlphaVantageNews = (overrides?: Record<string, unknown>) => {
  return {
    feed: [
      {
        title: "Sample News Article",
        url: "https://example.com/news",
        time_published: new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14),
        summary: "Sample news summary",
        source: "Reuters",
      },
    ],
    ...overrides,
  };
};

export const setupMockFetch = (
  marketDataResponse: unknown = mockAlphaVantageMarketData(),
  newsResponse: unknown = mockAlphaVantageNews()
) => {
  global.fetch = vi.fn((url: string | URL | Request) => {
    const urlStr = typeof url === "string" ? url : url.toString();
    
    if (urlStr.includes("TIME_SERIES_DAILY")) {
      return Promise.resolve({
        ok: true,
        json: async () => marketDataResponse,
      } as Response);
    }

    if (urlStr.includes("NEWS_SENTIMENT")) {
      return Promise.resolve({
        ok: true,
        json: async () => newsResponse,
      } as Response);
    }

    return Promise.resolve({
      ok: true,
      json: async () => ({}),
    } as Response);
  });
};

