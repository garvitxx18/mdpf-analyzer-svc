import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Inject,
} from "@nestjs/common";
import { IndexOrchestratorService } from "../services/index/index-orchestrator.service";
import { CustomIndexService } from "../services/custom-index/custom-index.service";
import { SignatureService } from "../services/signature/signature.service";
import { ScoreIndexDto, CreateCustomIndexDto } from "./index.dto";
import { CreateSignatureDto } from "./signature.dto";

@Controller("index")
export class IndexController {
  constructor(
    @Inject(IndexOrchestratorService)
    private readonly indexOrchestratorService: IndexOrchestratorService,
    @Inject(CustomIndexService)
    private readonly customIndexService: CustomIndexService,
    @Inject(SignatureService)
    private readonly signatureService: SignatureService
  ) {}

  @Post("score")
  @HttpCode(HttpStatus.CREATED)
  async scoreIndex(@Body() body: ScoreIndexDto) {
    const { indexId, effectiveDate } = body;

    const effectiveDateObj = new Date(effectiveDate);

    const result = await this.indexOrchestratorService.scoreIndex({
      indexId,
      effectiveDate: effectiveDateObj,
    });

    const effectiveDateStr = result.effectiveDate.toISOString().split("T")[0];
    return {
      indexRunId: result.indexRunId,
      indexId: result.indexId,
      effectiveDate: effectiveDateStr || "",
      status: "running",
    };
  }

  @Post("custom")
  @HttpCode(HttpStatus.CREATED)
  async createCustomIndex(@Body() body: CreateCustomIndexDto) {
    const { signatureId, name } = body;

    const result = await this.customIndexService.createCustomIndex({
      signatureId,
      name,
    });

    return {
      id: result.id,
      signatureId: result.signatureId,
      name: result.name,
      sectorsUsed: result.sectorsUsed as string[],
      constituentsSelected: result.constituentsSelected as string[],
      createdAt: result.createdAt,
    };
  }

  @Post("signature")
  @HttpCode(HttpStatus.CREATED)
  async createSignature(@Body() body: CreateSignatureDto) {
    const { name, description, composition, createdBy } = body;

    const result = await this.signatureService.createSignature({
      name,
      description,
      composition,
      createdBy,
    });

    return {
      id: result.id,
      name: result.name,
      description: result.description,
      composition: result.composition,
      createdBy: result.createdBy,
      createdAt: result.createdAt,
    };
  }

  @Get("signature")
  async getAllSignatures() {
    const signatures = await this.signatureService.getAllSignatures();

    return signatures.map((sig) => ({
      id: sig.id,
      name: sig.name,
      description: sig.description,
      composition: sig.composition,
      createdBy: sig.createdBy,
      createdAt: sig.createdAt,
    }));
  }

  @Get("signature/:id")
  async getSignatureById(@Param("id") id: string) {
    const signature = await this.signatureService.getSignatureById(id);

    if (!signature) {
      return { error: "Signature not found" };
    }

    return {
      id: signature.id,
      name: signature.name,
      description: signature.description,
      composition: signature.composition,
      createdBy: signature.createdBy,
      createdAt: signature.createdAt,
    };
  }
}

