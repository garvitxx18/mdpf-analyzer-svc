import type { EnrichmentResult } from "../data-enrichment/data-enrichment.service";

export const GEMINI_PROMPT_TEMPLATE = `You are a conservative and rigorous financial analyst. Analyze the provided market data and news to generate a performance score for the security.

CRITICAL SCORING RULES - FOLLOW STRICTLY:

1. HIGH SCORES (0.70-1.0) - ONLY if:
   - Multiple strong positive indicators present
   - Clear evidence of growth, earnings beats, or positive catalysts
   - Strong technical patterns with confirmation
   - Multiple positive news articles with high relevance
   - NO significant negative factors or warnings
   - Volume trends support the positive outlook

2. MODERATE SCORES (0.50-0.69) - Use when:
   - Mixed signals present
   - Some positive indicators but also concerns
   - Neutral or slightly positive sentiment
   - Limited news/data available
   - Technical patterns are unclear or conflicting

3. LOW SCORES (0.30-0.49) - Use when:
   - Negative indicators outweigh positives
   - News contains warnings, downgrades, or concerns
   - Technical patterns show weakness
   - Volume trends are negative
   - Company-specific risks identified

4. VERY LOW SCORES (0.0-0.29) - Use when:
   - Strong negative signals
   - Major negative news (lawsuits, scandals, major losses)
   - Clear downward trends
   - High volatility suggesting uncertainty
   - Multiple red flags present

IMPORTANT: BE CONSERVATIVE
- Default to neutral scores unless there's clear evidence for deviation
- Any minor issues or concerns should LOWER the score
- High scores require STRONG justification with multiple positive factors
- When in doubt, choose a lower score
- One negative factor can offset multiple neutral factors

Respond ONLY with valid JSON in this exact format:
{
  "score": 0.65,
  "confidence": 0.85,
  "direction": "flat",
  "rationale": {
    "summary": "Brief but specific summary of analysis highlighting key factors",
    "factors": ["concrete factor 1", "concrete factor 2", "concrete factor 3"],
    "sentiment": "positive" | "neutral" | "negative"
  },
  "risks": {
    "market": "Specific market-wide risks identified",
    "specific": "Specific company/security risks identified"
  },
  "horizon_days": 30
}

Rules:
- score: Number between 0.0 and 1.0 - BE CONSERVATIVE, prefer middle range (0.4-0.6) unless clear evidence
- confidence: Number between 0.0 and 1.0 - Higher if more data available, lower if conflicting signals
- direction: "up" only if score > 0.6, "down" if score < 0.4, otherwise "flat"
- rationale.summary: 2-3 sentences explaining the score with specific references to data
- rationale.factors: Array of 3-5 specific, concrete factors that influenced the score
- rationale.sentiment: Must align with score (positive for >0.6, negative for <0.4, neutral otherwise)
- risks: Be specific - list actual risks found, don't use generic statements
- horizon_days: Choose based on data timeframe (7 for short-term, 30 for medium, 90 for longer-term views)

Analysis Framework:
1. Calculate price changes and trends from market data
2. Assess volume patterns (increasing/decreasing, above/below average)
3. Review all news articles for sentiment, relevance, and impact
4. Identify any warning signs, concerns, or negative signals
5. Look for confirmations across multiple data points
6. Apply conservative bias - downgrade if uncertainties exist`;

const calculatePriceMetrics = (prices: Array<{
  ts: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}>) => {
  if (prices.length === 0) {
    return {
      latest: null,
      change: null,
      changePercent: null,
      averageVolume: null,
      volatility: null,
      trend: null,
    };
  }

  const sortedPrices = [...prices].sort((a, b) => b.ts.getTime() - a.ts.getTime());
  const latest = sortedPrices[0];
  const previous = sortedPrices[1];

  if (!latest) {
    return {
      latest: null,
      change: null,
      changePercent: null,
      averageVolume: null,
      volatility: null,
      trend: null,
    };
  }

  const change = previous ? latest.close - previous.close : 0;
  const changePercent = previous ? (change / previous.close) * 100 : 0;

  const volumes = prices.map((p) => p.volume);
  const averageVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;

  const closes = sortedPrices.slice(0, 20).map((p) => p.close);
  const highClose = Math.max(...closes);
  const lowClose = Math.min(...closes);
  const volatility = highClose > 0 ? ((highClose - lowClose) / highClose) * 100 : 0;

  const recentPrices = sortedPrices.slice(0, 5).map((p) => p.close);
  const olderPrices = sortedPrices.slice(5, 10).map((p) => p.close);

  const recentAvg = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length;
  const olderAvg = olderPrices.length > 0
    ? olderPrices.reduce((sum, p) => sum + p, 0) / olderPrices.length
    : recentAvg;

  const trend = recentAvg > olderAvg ? "upward" : recentAvg < olderAvg ? "downward" : "sideways";

  return {
    latest: latest.close,
    change,
    changePercent,
    averageVolume,
    volatility: volatility.toFixed(2),
    trend,
    priceHistory: sortedPrices.slice(0, 10).map((p) => ({
      date: p.ts.toISOString().split("T")[0],
      open: p.open,
      high: p.high,
      low: p.low,
      close: p.close,
      volume: p.volume,
    })),
  };
};

export const buildGeminiPrompt = (data: EnrichmentResult): string => {
  const metrics = calculatePriceMetrics(data.marketData.prices);

  const marketContext = metrics.latest !== null
    ? `=== MARKET DATA FOR ${data.ticker.toUpperCase()} ===

Current Price: $${metrics.latest.toFixed(2)}
Price Change: ${metrics.change !== null ? (metrics.change >= 0 ? "+" : "") + metrics.change.toFixed(2) : "N/A"} (${metrics.changePercent !== null ? (metrics.changePercent >= 0 ? "+" : "") + metrics.changePercent.toFixed(2) : "N/A"}%)
Trend: ${metrics.trend || "N/A"}
Volatility: ${metrics.volatility || "N/A"}%
Average Volume: ${metrics.averageVolume ? Math.round(metrics.averageVolume).toLocaleString() : "N/A"}

Recent Price History (most recent first):
${metrics.priceHistory?.map((p) => 
  `${p.date}: O=$${p.open.toFixed(2)} H=$${p.high.toFixed(2)} L=$${p.low.toFixed(2)} C=$${p.close.toFixed(2)} V=${Math.round(p.volume).toLocaleString()}`
).join("\n") || "No price data available"}

Volume Analysis:
- Latest Volume: ${metrics.latest !== null && data.marketData.prices.length > 0 && data.marketData.prices[0]
  ? Math.round(data.marketData.prices[0].volume).toLocaleString()
  : "N/A"}
- Average Volume: ${metrics.averageVolume ? Math.round(metrics.averageVolume).toLocaleString() : "N/A"}
- Volume Trend: ${metrics.latest !== null && data.marketData.prices.length > 0 && data.marketData.prices[0] && metrics.averageVolume
  ? (() => {
      const latestVolume = data.marketData.prices[0]!.volume;
      const avgVol = metrics.averageVolume!;
      if (latestVolume > avgVol * 1.2) return "Above average (potentially significant)";
      if (latestVolume < avgVol * 0.8) return "Below average (low interest)";
      return "Near average";
    })()
  : "N/A"}`
    : `=== MARKET DATA FOR ${data.ticker.toUpperCase()} ===
No market data available for analysis.`;

  const newsContext = data.news.articles.length > 0
    ? `=== RECENT NEWS FOR ${data.ticker.toUpperCase()} ===

${data.news.articles
  .map(
    (article, index) => `Article ${index + 1}:
Source: ${article.source}
Published: ${article.ts.toISOString()}
Title: ${article.title}
Summary: ${article.summary}
URL: ${article.url}
Relevance Score: ${article.relevanceScore.toFixed(2)}/5.0

IMPORTANT: Review the full article at ${article.url} for complete context and details.`
  )
  .join("\n\n---\n\n")}

Total Articles Analyzed: ${data.news.articles.length}`
    : `=== RECENT NEWS FOR ${data.ticker.toUpperCase()} ===
No recent news articles available. This limits confidence in the analysis.`;

  return `${GEMINI_PROMPT_TEMPLATE}

${marketContext}

${newsContext}

=== ANALYSIS INSTRUCTIONS ===

1. Review all provided news articles carefully - check the URLs if needed for full context
2. Calculate price trends and momentum from the market data
3. Assess volume patterns for confirmation or divergence
4. Identify ANY negative signals, concerns, or warnings (even minor ones)
5. Apply conservative bias:
   - If you find any negative factors, reduce the score
   - Only use high scores (0.70+) if there are STRONG positive signals with NO significant concerns
   - Default to neutral scores (0.45-0.55) if signals are mixed or unclear
6. Ensure your score aligns with your rationale - if you mention concerns, the score should reflect them
7. Be specific in your factors - cite actual data points, not generic statements

Generate your analysis now. Respond with ONLY the JSON object, no other text.`;
};

