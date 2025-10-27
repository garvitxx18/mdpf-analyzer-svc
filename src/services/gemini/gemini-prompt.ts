import type { EnrichmentResult } from "../data-enrichment/data-enrichment.service";

export const GEMINI_PROMPT_TEMPLATE = `You are an expert financial analyst. Analyze the provided market data and news to generate a performance score for the security.

Respond ONLY with valid JSON in this exact format:
{
  "score": 0.85,
  "confidence": 0.90,
  "direction": "up",
  "rationale": {
    "summary": "Brief summary of analysis",
    "factors": ["factor1", "factor2"],
    "sentiment": "positive"
  },
  "risks": {
    "market": "Market volatility risk",
    "specific": "Company-specific risks"
  },
  "horizon_days": 7
}

Rules:
- score: Number between 0.0 and 1.0 representing overall performance
- confidence: Number between 0.0 and 1.0 representing your confidence in the score
- direction: One of "up", "flat", or "down"
- rationale: Object with analysis details
- risks: Object with risk assessment
- horizon_days: Number of days for the prediction (typically 7, 30, or 90)

Consider:
1. Recent price trends and volatility
2. News sentiment and relevance
3. Volume patterns
4. Market context
5. Technical indicators`;

export const buildGeminiPrompt = (data: EnrichmentResult): string => {
  const marketContext = data.marketData.prices
    .map(
      (price) =>
        `${price.ts.toISOString()}: O=${price.open} H=${price.high} L=${price.low} C=${price.close} V=${price.volume}`
    )
    .join("\n");

  const newsContext = data.news.articles
    .map(
      (article) =>
        `[${article.source}] ${article.title}\n${article.summary}\n(Relevance: ${article.relevanceScore})`
    )
    .join("\n\n---\n\n");

  return `${GEMINI_PROMPT_TEMPLATE}

=== MARKET DATA FOR ${data.ticker.toUpperCase()} ===
${marketContext}

=== RECENT NEWS FOR ${data.ticker.toUpperCase()} ===
${newsContext}

Generate your analysis now.`;};

