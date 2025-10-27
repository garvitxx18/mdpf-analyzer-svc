import axios from "axios";

export type MarketDataOptions = {
  ticker: string;
  apiKey: string;
};

export type MarketDataResult = {
  ticker: string;
  prices: Array<{
    ts: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
};

export const fetchMarketData = async (
  options: MarketDataOptions
): Promise<MarketDataResult> => {
  const { ticker, apiKey } = options;

  try {
    const response = await axios.get(
      "https://www.alphavantage.co/query",
      {
        params: {
          function: "TIME_SERIES_DAILY",
          symbol: options.ticker,
          apikey: apiKey,
        },
      }
    );

    const data = response.data;

    console.log("Market data for ticker:", ticker, "is:", data);

    if (data["Error Message"] || !data["Time Series (Daily)"]) {
      return {
        ticker,
        prices: [],
      };
    }

    const timeSeries = data["Time Series (Daily)"];
    const prices = Object.entries(timeSeries).map(([dateStr, values]: [string, unknown]) => {
      const valueMap = values as Record<string, string>;
      return {
        ts: new Date(dateStr),
        open: parseFloat(valueMap["1. open"] || "0"),
        high: parseFloat(valueMap["2. high"] || "0"),
        low: parseFloat(valueMap["3. low"] || "0"),
        close: parseFloat(valueMap["4. close"] || "0"),
        volume: parseFloat(valueMap["5. volume"] || "0"),
      };
    });

    return {
      ticker,
      prices,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch market data");
  }
};

