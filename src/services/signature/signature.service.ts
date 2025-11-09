import { db } from "../../db/index";
import { signatures, type Signature, type SignatureComposition } from "../../db/schemas";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export type CreateSignatureOptions = {
  name: string;
  description?: string;
  composition: SignatureComposition[];
  createdBy: string;
};

export type CreateSignatureResult = Signature;

export class SignatureService {
  async createSignature(
    options: CreateSignatureOptions
  ): Promise<CreateSignatureResult> {
    const { name, description, composition, createdBy } = options;

    if (!db) {
      throw new Error("Database connection is not available");
    }

    const totalPercentage = composition.reduce(
      (sum, item) => sum + item.percentage,
      0
    );

    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new Error(
        `Composition percentages must sum to 100. Current sum: ${totalPercentage}`
      );
    }

    const signatureId = uuidv4();

    await db.insert(signatures).values({
      id: signatureId,
      name,
      description: description || null,
      composition,
      createdBy,
      createdAt: new Date(),
    });

    const createdSignature = await db
      .select()
      .from(signatures)
      .where(eq(signatures.id, signatureId))
      .limit(1);

    if (createdSignature.length === 0) {
      throw new Error("Failed to create signature");
    }

    return createdSignature[0] as Signature;
  }

  async getAllSignatures(): Promise<Signature[]> {
    if (!db) {
      throw new Error("Database connection is not available");
    }

    const allSignatures = await db.select().from(signatures);

    return allSignatures as Signature[];
  }

  async getSignatureById(signatureId: string): Promise<Signature | null> {
    if (!db) {
      throw new Error("Database connection is not available");
    }

    const signature = await db
      .select()
      .from(signatures)
      .where(eq(signatures.id, signatureId))
      .limit(1);

    if (signature.length === 0) {
      return null;
    }

    return signature[0] as Signature;
  }
}

