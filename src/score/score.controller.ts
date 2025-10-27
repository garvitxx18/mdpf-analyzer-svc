import {
  Controller, Post, Get, Param, Body, HttpCode, HttpStatus, Inject,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { randomUUID } from 'crypto';
import { ScoreService } from './score.service';

@Controller('score')
export class ScoreController {
  constructor(@Inject(ScoreService) private readonly scoreService: ScoreService) {
    console.log('ScoreController initialized - scoreService exists?', !!this.scoreService);
  }

  @Post('batch')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a batch scoring job' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tickers: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of ticker symbols to score',
          example: ['AAPL', 'GOOGL', 'MSFT'],
        },
      },
      required: ['tickers'],
    },
  })
  @ApiResponse({ status: 201, description: 'Batch job created successfully' })
  async createBatch(@Body() body: { tickers: string[] }) {
    const { tickers } = body;
    const runId = randomUUID();
    await this.scoreService.enqueueBatch({ tickers, runId });
    return { runId, total: tickers.length, status: 'pending' };
  }

  @Get(':runId')
  @ApiOperation({ summary: 'Get batch scoring status and results' })
  @ApiParam({
    name: 'runId',
    type: 'string',
    description: 'The unique ID of the batch job',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Batch status and results' })
  async getBatchStatus(@Param('runId') runId: string) {
    return this.scoreService.getBatchStatus(runId);
  }

  @Get('ticker/:ticker')
  @ApiOperation({ summary: 'Get latest score for a specific ticker' })
  @ApiParam({
    name: 'ticker',
    type: 'string',
    description: 'Stock ticker symbol',
    example: 'AAPL',
  })
  @ApiResponse({ status: 200, description: 'Latest score for the ticker' })
  async getTickerScore(@Param('ticker') ticker: string) {
    return this.scoreService.getTickerScore(ticker);
  }
}
