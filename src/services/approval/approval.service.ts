import { db } from "../../db/index";
import { constituentScores, type ConstituentScore } from "../../db/schemas";
import { eq, and } from "drizzle-orm";

export type GetPendingScoresOptions = {
  effectiveDate: Date;
};

export type ApproveScoreOptions = {
  scoreId: string;
  approvedBy: string;
  comments?: string;
};

export type RejectScoreOptions = {
  scoreId: string;
  approvedBy: string;
  comments?: string;
};

export type HoldScoreOptions = {
  scoreId: string;
  approvedBy: string;
  comments?: string;
};

export type ApprovalSummary = {
  totalPending: number;
  approved: number;
  rejected: number;
  onHold: number;
};

export type GetApprovalSummaryOptions = {
  effectiveDate: Date;
};

export class ApprovalService {
  async getPendingScores(
    options: GetPendingScoresOptions
  ): Promise<ConstituentScore[]> {
    const { effectiveDate } = options;

    if (!db) {
      throw new Error("Database connection is not available");
    }

    const effectiveDateStr = effectiveDate.toISOString().split("T")[0];
    if (!effectiveDateStr) {
      throw new Error("Invalid effective date");
    }

    const scores = await db
      .select()
      .from(constituentScores)
      .where(
        and(
          eq(constituentScores.effectiveDate, effectiveDateStr),
          eq(constituentScores.state, "pending")
        )
      );

    return scores as unknown as ConstituentScore[];
  }

  async approveScore(options: ApproveScoreOptions): Promise<void> {
    const { scoreId, approvedBy, comments } = options;

    if (!db) {
      throw new Error("Database connection is not available");
    }

    await db
      .update(constituentScores)
      .set({
        state: "approved",
        approvedBy,
        approvedAt: new Date(),
        comments: comments || null,
      })
      .where(eq(constituentScores.id, scoreId));
  }

  async rejectScore(options: RejectScoreOptions): Promise<void> {
    const { scoreId, approvedBy, comments } = options;

    if (!db) {
      throw new Error("Database connection is not available");
    }

    await db
      .update(constituentScores)
      .set({
        state: "rejected",
        approvedBy,
        approvedAt: new Date(),
        comments: comments || null,
      })
      .where(eq(constituentScores.id, scoreId));
  }

  async holdScore(options: HoldScoreOptions): Promise<void> {
    const { scoreId, approvedBy, comments } = options;

    if (!db) {
      throw new Error("Database connection is not available");
    }

    await db
      .update(constituentScores)
      .set({
        state: "on_hold",
        approvedBy,
        approvedAt: new Date(),
        comments: comments || null,
      })
      .where(eq(constituentScores.id, scoreId));
  }

  async getAllScoresByEffectiveDate(
    options: GetPendingScoresOptions
  ): Promise<ConstituentScore[]> {
    const { effectiveDate } = options;

    if (!db) {
      throw new Error("Database connection is not available");
    }

    const effectiveDateStr = effectiveDate.toISOString().split("T")[0];
    if (!effectiveDateStr) {
      throw new Error("Invalid effective date");
    }

    const scores = await db
      .select()
      .from(constituentScores)
      .where(eq(constituentScores.effectiveDate, effectiveDateStr));

    return scores as unknown as ConstituentScore[];
  }

  async getApprovalSummary(
    options: GetApprovalSummaryOptions
  ): Promise<ApprovalSummary> {
    const { effectiveDate } = options;

    if (!db) {
      throw new Error("Database connection is not available");
    }

    const effectiveDateStr = effectiveDate.toISOString().split("T")[0];
    if (!effectiveDateStr) {
      throw new Error("Invalid effective date");
    }

    const allScores = await db
      .select()
      .from(constituentScores)
      .where(eq(constituentScores.effectiveDate, effectiveDateStr));

    const summary: ApprovalSummary = {
      totalPending: 0,
      approved: 0,
      rejected: 0,
      onHold: 0,
    };

    for (const score of allScores) {
      if (score.state === "pending") {
        summary.totalPending++;
      } else if (score.state === "approved") {
        summary.approved++;
      } else if (score.state === "rejected") {
        summary.rejected++;
      } else if (score.state === "on_hold") {
        summary.onHold++;
      }
    }

    return summary;
  }
}

