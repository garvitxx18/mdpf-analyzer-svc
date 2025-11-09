export type IndexConstituent = {
  ticker: string;
  weight: number;
  sector: string;
};

export type IndexConstituentsResult = {
  indexId: string;
  constituents: IndexConstituent[];
};

export type GetIndexConstituentsOptions = {
  indexId: string;
};

const MOCK_INDEX_DATA: Record<string, IndexConstituent[]> = {
  NIFTY50: [
    { ticker: "RELIANCE", weight: 10.5, sector: "Energy" },
    { ticker: "TCS", weight: 7.2, sector: "Technology" },
    { ticker: "HDFCBANK", weight: 6.8, sector: "Finance" },
    { ticker: "INFY", weight: 5.9, sector: "Technology" },
    { ticker: "HINDUNILVR", weight: 4.3, sector: "Consumer Goods" },
    { ticker: "ICICIBANK", weight: 4.1, sector: "Finance" },
    { ticker: "BHARTIARTL", weight: 3.8, sector: "Telecommunications" },
    { ticker: "SBIN", weight: 3.5, sector: "Finance" },
    { ticker: "BAJFINANCE", weight: 3.2, sector: "Finance" },
    { ticker: "ITC", weight: 2.9, sector: "Consumer Goods" },
  ],
  BANKNIFTY: [
    { ticker: "HDFCBANK", weight: 25.5, sector: "Finance" },
    { ticker: "ICICIBANK", weight: 20.2, sector: "Finance" },
    { ticker: "SBIN", weight: 15.8, sector: "Finance" },
    { ticker: "KOTAKBANK", weight: 12.3, sector: "Finance" },
    { ticker: "AXISBANK", weight: 10.1, sector: "Finance" },
    { ticker: "INDUSINDBK", weight: 6.2, sector: "Finance" },
    { ticker: "PNB", weight: 4.5, sector: "Finance" },
    { ticker: "BANKBARODA", weight: 3.2, sector: "Finance" },
    { ticker: "FEDERALBNK", weight: 2.2, sector: "Finance" },
  ],
  US_TOP5: [
    { ticker: "AAPL", weight: 25.0, sector: "Technology" },
    { ticker: "MSFT", weight: 22.0, sector: "Technology" },
    { ticker: "AMZN", weight: 18.0, sector: "Consumer Discretionary" },
    { ticker: "GOOGL", weight: 20.0, sector: "Communication Services" },
    { ticker: "TSLA", weight: 15.0, sector: "Automotive" },
  ],
};

export class IndexService {
  async getIndexConstituents(
    options: GetIndexConstituentsOptions
  ): Promise<IndexConstituentsResult> {
    const { indexId } = options;

    const constituents = MOCK_INDEX_DATA[indexId] || [];

    return {
      indexId,
      constituents,
    };
  }
}
