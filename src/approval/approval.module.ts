import { Module } from "@nestjs/common";
import { ApprovalController } from "./approval.controller";
import { ApprovalService } from "../services/approval/approval.service";

@Module({
  controllers: [ApprovalController],
  providers: [ApprovalService],
  exports: [ApprovalService],
})
export class ApprovalModule {}

