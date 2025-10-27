import { describe, it, expect, beforeEach, vi } from "vitest";
import { CacheService } from "./cache.service";

describe("Cache Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("get", () => {
    it("should retrieve cached data by key", async () => {
      const cacheService = new CacheService({ url: "redis://localhost:6379" });

      const getMock = vi.fn().mockResolvedValue('{"value":"test"}');
      (cacheService as any).client = { get: getMock };

      const result = await cacheService.get("test:key");

      expect(result).toEqual({ value: "test" });
      expect(getMock).toHaveBeenCalledWith("test:key");
    });

    it("should return null for non-existent key", async () => {
      const cacheService = new CacheService({ url: "redis://localhost:6379" });

      const getMock = vi.fn().mockResolvedValue(null);
      (cacheService as any).client = { get: getMock };

      const result = await cacheService.get("nonexistent");

      expect(result).toBeNull();
    });

    it("should handle invalid JSON gracefully", async () => {
      const cacheService = new CacheService({ url: "redis://localhost:6379" });

      const getMock = vi.fn().mockResolvedValue("invalid json");
      (cacheService as any).client = { get: getMock };

      const result = await cacheService.get("invalid");

      expect(result).toBeNull();
    });
  });

  describe("set", () => {
    it("should store data in cache with TTL", async () => {
      const cacheService = new CacheService({ url: "redis://localhost:6379" });

      const setMock = vi.fn().mockResolvedValue("OK");
      (cacheService as any).client = { set: setMock };

      await cacheService.set("test:key", { value: "test" }, 3600);

      expect(setMock).toHaveBeenCalledWith(
        "test:key",
        '{"value":"test"}',
        "EX",
        3600
      );
    });

    it("should use default TTL when not provided", async () => {
      const cacheService = new CacheService({ url: "redis://localhost:6379" });

      const setMock = vi.fn().mockResolvedValue("OK");
      (cacheService as any).client = { set: setMock };

      await cacheService.set("test:key", { value: "test" });

      expect(setMock).toHaveBeenCalledWith(
        "test:key",
        '{"value":"test"}',
        "EX",
        21600
      );
    });
  });

  describe("delete", () => {
    it("should remove cached data", async () => {
      const cacheService = new CacheService({ url: "redis://localhost:6379" });

      const delMock = vi.fn().mockResolvedValue(1);
      (cacheService as any).client = { del: delMock };

      await cacheService.delete("test:key");

      expect(delMock).toHaveBeenCalledWith("test:key");
    });
  });
});

