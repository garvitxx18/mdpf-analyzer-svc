import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApprovalService } from "./approval.service";
import { db } from "../../db/index";
import { constituentScores } from "../../db/schemas";
import { eq, and } from "drizzle-orm";
import { getMockConstituentScore } from "../../db/test-factories";

vi.mock("../../db/index", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockResolvedValue(undefined),
  },
}));

describe("ApprovalService", () => {
  const mockDb = db as {
    select: ReturnType<typeof vi.fn>;
    from: ReturnType<typeof vi.fn>;
    where: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch pending constituent scores for effective date", async () => {
    const effectiveDate = new Date("2025-11-08");
    const mockScores = [
      getMockConstituentScore({
        effectiveDate,
        state: "pending",
        ticker: "AAPL",
      }),
      getMockConstituentScore({
        effectiveDate,
        state: "pending",
        ticker: "GOOGL",
      }),
    ];

    mockDb.select.mockResolvedValue(mockScores);

    const service = new ApprovalService();
    const result = await service.getPendingScores({
      effectiveDate,
    });

    expect(result.length).toBe(2);
    expect(result[0].ticker).toBe("AAPL");
    expect(result[1].ticker).toBe("GOOGL");
    expect(mockDb.select).toHaveBeenCalled();
  });

  it("should approve a constituent score", async () => {
    const scoreId = "660e8400-e29b-41d4-a716-446655440000";
    const approvedBy = "pm_user";

    mockDb.update.mockReturnValue({
      set: vi.fn().mockResolvedValue(undefined),
      where: vi.fn().mockResolvedValue(undefined),
    } as never);

    const service = new ApprovalService();
    await service.approveScore({
      scoreId,
      approvedBy,
      comments: "Looks good",
    });

    expect(mockDb.update).toHaveBeenCalled();
  });

  it("should reject a constituent score", async () => {
    const scoreId = "660e8400-e29b-41d4-a716-446655440000";
    const approvedBy = "pm_user";

    mockDb.update.mockReturnValue({
      set: vi.fn().mockResolvedValue(undefined),
      where: vi.fn().mockResolvedValue(undefined),
    } as never);

    const service = new ApprovalService();
    await service.rejectScore({
      scoreId,
      approvedBy,
      comments: "Score too high",
    });

    expect(mockDb.update).toHaveBeenCalled();
  });

  it("should put a constituent score on hold", async () => {
    const scoreId = "660e8400-e29b-41d4-a716-446655440000";
    const approvedBy = "pm_user";

    mockDb.update.mockReturnValue({
      set: vi.fn().mockResolvedValue(undefined),
      where: vi.fn().mockResolvedValue(undefined),
    } as never);

    const service = new ApprovalService();
    await service.holdScore({
      scoreId,
      approvedBy,
      comments: "Need more data",
    });

    expect(mockDb.update).toHaveBeenCalled();
  });

  it("should return approval summary for effective date", async () => {
    const effectiveDate = new Date("2025-11-08");
    const mockScores = [
      getMockConstituentScore({ effectiveDate, state: "approved" }),
      getMockConstituentScore({ effectiveDate, state: "approved" }),
      getMockConstituentScore({ effectiveDate, state: "rejected" }),
      getMockConstituentScore({ effectiveDate, state: "on_hold" }),
      getMockConstituentScore({ effectiveDate, state: "pending" }),
    ];

    mockDb.select.mockResolvedValue(mockScores);

    const service = new ApprovalService();
    const summary = await service.getApprovalSummary({
      effectiveDate,
    });

    expect(summary.totalPending).toBe(1);
    expect(summary.approved).toBe(2);
    expect(summary.rejected).toBe(1);
    expect(summary.onHold).toBe(1);
  });
});

