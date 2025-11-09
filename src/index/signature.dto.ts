export class CreateSignatureDto {
  name!: string;
  description?: string;
  composition!: Array<{
    sector: string;
    percentage: number;
  }>;
  createdBy!: string;
}

