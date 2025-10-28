import {
  Controller, Post, Get, Param, Body, HttpCode, HttpStatus, Inject,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ScoreService } from './score.service';

@Controller('score')
export class ScoreController {
  constructor(@Inject(ScoreService) private readonly scoreService: ScoreService) {
    console.log('ScoreController initialized - scoreService exists?', !!this.scoreService);
  }

  @Post('batch')
  @HttpCode(HttpStatus.CREATED)
  async createBatch(@Body() body: { tickers: string[] }) {
    const { tickers } = body;
    const runId = randomUUID();
    await this.scoreService.enqueueBatch({ tickers, runId });
    return { runId, total: tickers.length, status: 'pending' };
  }

  @Get(':runId')
  async getBatchStatus(@Param('runId') runId: string) {
    return this.scoreService.getBatchStatus(runId);
  }

  @Get('ticker/:ticker')
  async getTickerScore(@Param('ticker') ticker: string) {
    return this.scoreService.getTickerScore(ticker);
  }
}
