import axios from "axios";

export type NewsFetchOptions = {
  ticker: string;
  apiKey: string;
  limit?: number;
};

export type NewsArticle = {
  title: string;
  url: string;
  summary: string;
  source: string;
  ts: Date;
  relevanceScore: number;
};

export type NewsResult = {
  ticker: string;
  articles: NewsArticle[];
};

const parseTimestamp = (timePublished: string): Date => {
  const year = timePublished.slice(0, 4);
  const month = timePublished.slice(4, 6);
  const day = timePublished.slice(6, 8);
  const hour = timePublished.slice(9, 11);
  const minute = timePublished.slice(11, 13);
  const second = timePublished.slice(13, 15);

  return new Date(
    `${year}-${month}-${day}T${hour}:${minute}:${second}Z`
  );
};

const calculateRelevanceScore = (article: {
  summary: string;
  title: string;
}): number => {
  let score = 1.0;
  const ticker = "AAPL";

  const titleLower = article.title.toLowerCase();
  const summaryLower = article.summary.toLowerCase();
  const tickerLower = ticker.toLowerCase();

  if (titleLower.includes(tickerLower)) {
    score += 0.5;
  }
  if (summaryLower.includes(tickerLower)) {
    score += 0.3;
  }

  const financialKeywords = [
    "earnings",
    "revenue",
    "profit",
    "dividend",
    "growth",
    "expansion",
    "acquisition",
    "partnership",
  ];

  financialKeywords.forEach((keyword) => {
    if (titleLower.includes(keyword)) {
      score += 0.1;
    }
  });

  return Math.min(score, 5.0);
};

export const fetchNews = async (
  options: NewsFetchOptions
): Promise<NewsResult> => {
  const { ticker, apiKey, limit = 10 } = options;

  try {
    const response = await axios.get(
      "https://www.alphavantage.co/query",
      {
        params: {
          function: "NEWS_SENTIMENT",
          tickers: ticker,
          apikey: apiKey,
          limit: 50,
        },
      }
    );

    const data = response.data;

    console.log("News data for ticker:", ticker, "is:", data);

    if (data["Error Message"] || !data.feed) {
      return {
        ticker,
        articles: [],
      };
    }

    const articles = data.feed
      .map((item: {
        title: string;
        url: string;
        summary: string;
        source: string;
        time_published: string;
      }) => ({
        title: item.title,
        url: item.url,
        summary: item.summary,
        source: item.source,
        ts: parseTimestamp(item.time_published),
        relevanceScore: calculateRelevanceScore({
          summary: item.summary,
          title: item.title,
        }),
      }))
      .sort((a: NewsArticle, b: NewsArticle) => {
        const recencyScore = (article: NewsArticle) => {
          const hoursSincePublished =
            (Date.now() - article.ts.getTime()) / (1000 * 60 * 60);
          return Math.max(0, 1 - hoursSincePublished / 168);
        };

        const aScore = a.relevanceScore + recencyScore(a);
        const bScore = b.relevanceScore + recencyScore(b);

        return bScore - aScore;
      })
      .slice(0, limit);

    return {
      ticker,
      articles,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch news");
  }
};

