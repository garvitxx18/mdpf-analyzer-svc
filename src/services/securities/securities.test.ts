import { describe, it, expect, beforeEach, vi } from "vitest";
import { db } from "../../db/index";
import { getMockSecurity } from "../../db/test-factories";
import { insertSecurity, findByTicker } from "./securities.service";

describe("Securities Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("insertSecurity", () => {
    it("should insert a security into the database", async () => {
      const mockSecurityData = {
        ticker: "TEST",
        name: "Test Company",
      };

      const dbSpy = vi.spyOn(db, "insert").mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([getMockSecurity(mockSecurityData)]),
        }),
      } as never);

      await insertSecurity(mockSecurityData);

      expect(dbSpy).toHaveBeenCalled();
    });

    it("should return the inserted security", async () => {
      const mockSecurityData = {
        ticker: "TEST",
        name: "Test Company",
      };

      vi.spyOn(db, "insert").mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([getMockSecurity(mockSecurityData)]),
        }),
      } as never);

      const result = await insertSecurity(mockSecurityData);

      expect(result.ticker).toBe("TEST");
      expect(result.name).toBe("Test Company");
    });
  });

  describe("findByTicker", () => {
    it("should find a security by ticker", async () => {
      const mockSecurity = getMockSecurity({ ticker: "TEST" });

      const dbSpy = vi.spyOn(db, "select").mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockSecurity]),
      } as never);

      const result = await findByTicker("TEST");

      expect(result).toEqual(mockSecurity);
      expect(dbSpy).toHaveBeenCalled();
    });

    it("should return undefined for non-existent ticker", async () => {
      vi.spyOn(db, "select").mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      } as never);

      const result = await findByTicker("NONEXISTENT");

      expect(result).toBeUndefined();
    });
  });
});

