import { describe, it, expect, vi, beforeEach } from "vitest";
import { SignatureService } from "./signature.service";
import { db } from "../../db/index";
import { signatures } from "../../db/schemas";
import { eq } from "drizzle-orm";
import { getMockSignature } from "../../db/test-factories";

vi.mock("../../db/index", () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue(undefined),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
  },
}));

describe("SignatureService", () => {
  const mockDb = db as {
    insert: ReturnType<typeof vi.fn>;
    values: ReturnType<typeof vi.fn>;
    select: ReturnType<typeof vi.fn>;
    from: ReturnType<typeof vi.fn>;
    where: ReturnType<typeof vi.fn>;
    limit: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a signature", async () => {
    const signature = getMockSignature();
    const createdSignature = { ...signature, id: "new-uuid" };

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    } as never);

    mockDb.select.mockResolvedValue([createdSignature]);

    const service = new SignatureService();
    const result = await service.createSignature({
      name: signature.name,
      description: signature.description || undefined,
      composition: signature.composition,
      createdBy: signature.createdBy,
    });

    expect(result.name).toBe(signature.name);
    expect(result.composition).toEqual(signature.composition);
    expect(mockDb.insert).toHaveBeenCalled();
  });

  it("should get all signatures", async () => {
    const mockSignatures = [
      getMockSignature({ name: "Signature1" }),
      getMockSignature({ name: "Signature2" }),
    ];

    mockDb.select.mockResolvedValue(mockSignatures);

    const service = new SignatureService();
    const result = await service.getAllSignatures();

    expect(result.length).toBe(2);
    expect(result[0].name).toBe("Signature1");
    expect(result[1].name).toBe("Signature2");
  });

  it("should get signature by id", async () => {
    const signature = getMockSignature();

    mockDb.select.mockResolvedValue([signature]);

    const service = new SignatureService();
    const result = await service.getSignatureById(signature.id);

    expect(result).toBeDefined();
    expect(result?.id).toBe(signature.id);
  });

  it("should return null if signature not found", async () => {
    mockDb.select.mockResolvedValue([]);

    const service = new SignatureService();
    const result = await service.getSignatureById("non-existent-id");

    expect(result).toBeNull();
  });
});

