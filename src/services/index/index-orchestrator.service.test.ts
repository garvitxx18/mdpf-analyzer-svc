import { describe, it, expect, vi, beforeEach } from "vitest";
import { IndexOrchestratorService } from "./index-orchestrator.service";
import { IndexService } from "./index.service";
import { ScoringService } from "../scoring/scoring.service";
import { db } from "../../db/index";
import { indexScoreRuns, constituentScores } from "../../db/schemas";
import { eq } from "drizzle-orm";

vi.mock("../../db/index", () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue(undefined),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("./index.service");
vi.mock("../scoring/scoring.service");

describe("IndexOrchestratorService", () => {
  const mockIndexService = {
    getIndexConstituents: vi.fn(),
  };

  const mockScoringService = {
    scoreSecurity: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(IndexService).mockImplementation(() => mockIndexService as never);
    vi.mocked(ScoringService).mockImplementation(() => mockScoringService as never);
  });

  it("should create index score run and score all constituents", async () => {
    const runId = "550e8400-e29b-41d4-a716-446655440000";
    const effectiveDate = new Date("2025-11-08");

    mockIndexService.getIndexConstituents.mockResolvedValue({
      indexId: "NIFTY50",
      constituents: [
        { ticker: "RELIANCE", weight: 10.5, sector: "Energy" },
        { ticker: "TCS", weight: 7.2, sector: "Technology" },
      ],
    });

    mockScoringService.scoreSecurity
      .mockResolvedValueOnce({
        ticker: "RELIANCE",
        score: 0.75,
        confidence: 0.85,
        direction: "up",
        inputHash: "hash1",
      })
      .mockResolvedValueOnce({
        ticker: "TCS",
        score: 0.80,
        confidence: 0.90,
        direction: "up",
        inputHash: "hash2",
      });

    const service = new IndexOrchestratorService({
      alphaApiKey: "test-alpha-key",
      geminiApiKey: "test-gemini-key",
    });

    const result = await service.scoreIndex({
      indexId: "NIFTY50",
      effectiveDate,
      runId,
    });

    expect(result.indexRunId).toBe(runId);
    expect(result.indexId).toBe("NIFTY50");
    expect(result.effectiveDate).toEqual(effectiveDate);
    expect(mockIndexService.getIndexConstituents).toHaveBeenCalledWith({
      indexId: "NIFTY50",
    });
    expect(mockScoringService.scoreSecurity).toHaveBeenCalledTimes(2);
  });

  it("should save constituent scores with pending state", async () => {
    const runId = "550e8400-e29b-41d4-a716-446655440000";
    const effectiveDate = new Date("2025-11-08");

    mockIndexService.getIndexConstituents.mockResolvedValue({
      indexId: "NIFTY50",
      constituents: [{ ticker: "RELIANCE", weight: 10.5, sector: "Energy" }],
    });

    mockScoringService.scoreSecurity.mockResolvedValue({
      ticker: "RELIANCE",
      score: 0.75,
      confidence: 0.85,
      direction: "up",
      inputHash: "hash1",
    });

    const insertSpy = vi.fn();
    vi.mocked(db.insert).mockReturnValue({
      values: insertSpy.mockResolvedValue(undefined),
    } as never);

    const service = new IndexOrchestratorService({
      alphaApiKey: "test-alpha-key",
      geminiApiKey: "test-gemini-key",
    });

    await service.scoreIndex({
      indexId: "NIFTY50",
      effectiveDate,
      runId,
    });

    expect(insertSpy).toHaveBeenCalled();
  });

  it("should handle empty index constituents", async () => {
    const runId = "550e8400-e29b-41d4-a716-446655440000";
    const effectiveDate = new Date("2025-11-08");

    mockIndexService.getIndexConstituents.mockResolvedValue({
      indexId: "UNKNOWN_INDEX",
      constituents: [],
    });

    const service = new IndexOrchestratorService({
      alphaApiKey: "test-alpha-key",
      geminiApiKey: "test-gemini-key",
    });

    const result = await service.scoreIndex({
      indexId: "UNKNOWN_INDEX",
      effectiveDate,
      runId,
    });

    expect(result.indexRunId).toBe(runId);
    expect(mockScoringService.scoreSecurity).not.toHaveBeenCalled();
  });
});

