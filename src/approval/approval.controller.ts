import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Inject,
} from "@nestjs/common";
import { ApprovalService } from "../services/approval/approval.service";
import {
  ApproveScoreDto,
  RejectScoreDto,
  HoldScoreDto,
} from "./approval.dto";

@Controller("approval")
export class ApprovalController {
  constructor(
    @Inject(ApprovalService)
    private readonly approvalService: ApprovalService
  ) {}

  @Get(":effectiveDate/summary")
  async getApprovalSummary(@Param("effectiveDate") effectiveDate: string) {
    const summary = await this.approvalService.getApprovalSummary({
      effectiveDate: new Date(effectiveDate),
    });

    return {
      effectiveDate,
      ...summary,
    };
  }

  @Get(":effectiveDate/pending")
  async getPendingScores(@Param("effectiveDate") effectiveDate: string) {
    const effectiveDateObj = new Date(effectiveDate);

    const scores = await this.approvalService.getPendingScores({
      effectiveDate: effectiveDateObj,
    });

    return {
      effectiveDate,
      pendingScores: scores,
      count: scores.length,
    };
  }

  @Get(":effectiveDate")
  async getAllScores(@Param("effectiveDate") effectiveDate: string) {
    const effectiveDateObj = new Date(effectiveDate);

    const scores = await this.approvalService.getAllScoresByEffectiveDate({
      effectiveDate: effectiveDateObj,
    });

    return {
      effectiveDate,
      scores,
      count: scores.length,
      byState: {
        pending: scores.filter((s) => s.state === "pending").length,
        approved: scores.filter((s) => s.state === "approved").length,
        rejected: scores.filter((s) => s.state === "rejected").length,
        onHold: scores.filter((s) => s.state === "on_hold").length,
      },
    };
  }

  @Post(":effectiveDate/approve")
  @HttpCode(HttpStatus.OK)
  async approveScore(
    @Param("effectiveDate") effectiveDate: string,
    @Body() body: ApproveScoreDto
  ) {
    const { scoreId, approvedBy, comments } = body;

    await this.approvalService.approveScore({
      scoreId,
      approvedBy,
      comments,
    });

    const summary = await this.approvalService.getApprovalSummary({
      effectiveDate: new Date(effectiveDate),
    });

    return {
      message: "Score approved",
      summary,
    };
  }

  @Post(":effectiveDate/reject")
  @HttpCode(HttpStatus.OK)
  async rejectScore(
    @Param("effectiveDate") effectiveDate: string,
    @Body() body: RejectScoreDto
  ) {
    const { scoreId, approvedBy, comments } = body;

    await this.approvalService.rejectScore({
      scoreId,
      approvedBy,
      comments,
    });

    const summary = await this.approvalService.getApprovalSummary({
      effectiveDate: new Date(effectiveDate),
    });

    return {
      message: "Score rejected",
      summary,
    };
  }

  @Post(":effectiveDate/hold")
  @HttpCode(HttpStatus.OK)
  async holdScore(
    @Param("effectiveDate") effectiveDate: string,
    @Body() body: HoldScoreDto
  ) {
    const { scoreId, approvedBy, comments } = body;

    await this.approvalService.holdScore({
      scoreId,
      approvedBy,
      comments,
    });

    const summary = await this.approvalService.getApprovalSummary({
      effectiveDate: new Date(effectiveDate),
    });

    return {
      message: "Score put on hold",
      summary,
    };
  }

}

