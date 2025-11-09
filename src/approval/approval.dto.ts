export class ApproveScoreDto {
  scoreId!: string;
  approvedBy!: string;
  comments?: string;
}

export class RejectScoreDto {
  scoreId!: string;
  approvedBy!: string;
  comments?: string;
}

export class HoldScoreDto {
  scoreId!: string;
  approvedBy!: string;
  comments?: string;
}

