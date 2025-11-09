import { describe, it, expect } from "vitest";
import { IndexService } from "./index.service";

describe("IndexService", () => {
  it("should fetch constituents for NIFTY50 index", async () => {
    const service = new IndexService();
    const result = await service.getIndexConstituents({
      indexId: "NIFTY50",
    });

    expect(result.indexId).toBe("NIFTY50");
    expect(result.constituents.length).toBeGreaterThan(0);
    expect(result.constituents[0]).toHaveProperty("ticker");
    expect(result.constituents[0]).toHaveProperty("weight");
    expect(result.constituents[0]).toHaveProperty("sector");
  });

  it("should fetch constituents for BANKNIFTY index", async () => {
    const service = new IndexService();
    const result = await service.getIndexConstituents({
      indexId: "BANKNIFTY",
    });

    expect(result.indexId).toBe("BANKNIFTY");
    expect(result.constituents.length).toBeGreaterThan(0);
  });

  it("should return empty array for unknown index", async () => {
    const service = new IndexService();
    const result = await service.getIndexConstituents({
      indexId: "UNKNOWN_INDEX",
    });

    expect(result.indexId).toBe("UNKNOWN_INDEX");
    expect(result.constituents).toEqual([]);
  });

  it("should include weight and sector for each constituent", async () => {
    const service = new IndexService();
    const result = await service.getIndexConstituents({
      indexId: "NIFTY50",
    });

    result.constituents.forEach((constituent) => {
      expect(constituent.ticker).toBeTruthy();
      expect(typeof constituent.weight).toBe("number");
      expect(constituent.weight).toBeGreaterThan(0);
      expect(constituent.weight).toBeLessThanOrEqual(100);
      expect(constituent.sector).toBeTruthy();
    });
  });
});

