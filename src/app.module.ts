import { Module } from "@nestjs/common";
import { ScoreModule } from "./score/score.module";
import { IndexModule } from "./index/index.module";
import { ApprovalModule } from "./approval/approval.module";

@Module({
  imports: [ScoreModule, IndexModule, ApprovalModule],
})
export class AppModule {}

