import { Module } from "@nestjs/common";
import { IndexController } from "./index.controller";
import { IndexOrchestratorService } from "../services/index/index-orchestrator.service";
import { CustomIndexService } from "../services/custom-index/custom-index.service";
import { IndexService } from "../services/index/index.service";
import { SignatureService } from "../services/signature/signature.service";

@Module({
  controllers: [IndexController],
  providers: [
    IndexService,
    CustomIndexService,
    SignatureService,
    {
      provide: IndexOrchestratorService,
      useFactory: () => {
        return new IndexOrchestratorService({
          alphaApiKey: process.env.ALPHA_API_KEY || "",
          geminiApiKey: process.env.GEMINI_API_KEY || "",
        });
      },
    },
  ],
  exports: [IndexOrchestratorService, CustomIndexService, SignatureService],
})
export class IndexModule {}

