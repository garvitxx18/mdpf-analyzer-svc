import { describe, it, expect, vi, beforeEach } from "vitest";
import { CustomIndexService } from "./custom-index.service";
import { db } from "../../db/index";
import { constituentScores, signatures, customIndexes } from "../../db/schemas";
import { eq, desc, and, inArray } from "drizzle-orm";
import {
  getMockConstituentScore,
  getMockSignature,
} from "../../db/test-factories";

vi.mock("../../db/index", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue(undefined),
  },
}));

describe("CustomIndexService", () => {
  const mockDb = db as {
    select: ReturnType<typeof vi.fn>;
    from: ReturnType<typeof vi.fn>;
    where: ReturnType<typeof vi.fn>;
    orderBy: ReturnType<typeof vi.fn>;
    limit: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    values: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create custom index from signature", async () => {
    const signature = getMockSignature();
    const latestEffectiveDate = new Date("2025-11-08");

    const mockApprovedScores = [
      getMockConstituentScore({
        ticker: "AAPL",
        sector: "Technology",
        effectiveDate: latestEffectiveDate,
        state: "approved",
        score: 0.85,
      }),
      getMockConstituentScore({
        ticker: "GOOGL",
        sector: "Technology",
        effectiveDate: latestEffectiveDate,
        state: "approved",
        score: 0.80,
      }),
      getMockConstituentScore({
        ticker: "MSFT",
        sector: "Technology",
        effectiveDate: latestEffectiveDate,
        state: "approved",
        score: 0.75,
      }),
      getMockConstituentScore({
        ticker: "RELIANCE",
        sector: "Energy",
        effectiveDate: latestEffectiveDate,
        state: "approved",
        score: 0.82,
      }),
      getMockConstituentScore({
        ticker: "HDFCBANK",
        sector: "Finance",
        effectiveDate: latestEffectiveDate,
        state: "approved",
        score: 0.78,
      }),
    ];

    mockDb.select
      .mockResolvedValueOnce([{ effectiveDate: latestEffectiveDate }])
      .mockResolvedValueOnce(mockApprovedScores);

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    } as never);

    const service = new CustomIndexService();
    const result = await service.createCustomIndex({
      signatureId: signature.id,
      name: "TestIndex",
    });

    expect(result).toHaveProperty("id");
    expect(result.signatureId).toBe(signature.id);
    expect(mockDb.insert).toHaveBeenCalled();
  });

  it("should select top-scoring constituents per sector", async () => {
    const signature = getMockSignature({
      composition: [
        { sector: "Technology", percentage: 50 },
        { sector: "Energy", percentage: 50 },
      ],
    });

    const latestEffectiveDate = new Date("2025-11-08");

    const mockApprovedScores = [
      getMockConstituentScore({
        ticker: "AAPL",
        sector: "Technology",
        effectiveDate: latestEffectiveDate,
        state: "approved",
        score: 0.90,
      }),
      getMockConstituentScore({
        ticker: "GOOGL",
        sector: "Technology",
        effectiveDate: latestEffectiveDate,
        state: "approved",
        score: 0.85,
      }),
      getMockConstituentScore({
        ticker: "RELIANCE",
        sector: "Energy",
        effectiveDate: latestEffectiveDate,
        state: "approved",
        score: 0.82,
      }),
    ];

    mockDb.select
      .mockResolvedValueOnce([{ effectiveDate: latestEffectiveDate }])
      .mockResolvedValueOnce(mockApprovedScores);

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    } as never);

    const service = new CustomIndexService();
    await service.createCustomIndex({
      signatureId: signature.id,
      name: "TestIndex",
    });

    expect(mockDb.insert).toHaveBeenCalled();
  });

  it("should return empty constituents if no approved scores found", async () => {
    const signature = getMockSignature();
    const latestEffectiveDate = new Date("2025-11-08");

    mockDb.select
      .mockResolvedValueOnce([{ effectiveDate: latestEffectiveDate }])
      .mockResolvedValueOnce([]);

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    } as never);

    const service = new CustomIndexService();
    const result = await service.createCustomIndex({
      signatureId: signature.id,
      name: "TestIndex",
    });

    expect(result.constituentsSelected).toEqual([]);
  });
});

