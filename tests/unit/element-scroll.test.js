import { describe, it, expect, vi, beforeEach } from "vitest";
import { computePhase, computeProgress } from "../../js/element-scroll.js";

describe("element-scroll", () => {
  describe("computePhase", () => {
    it("returns 'approach' when scroll is in first 30vh", () => {
      expect(computePhase(0)).toBe("approach");
      expect(computePhase(0.1)).toBe("approach");
      expect(computePhase(0.17)).toBe("approach");
    });

    it("returns 'reveal' when scroll is in 30-130vh range", () => {
      expect(computePhase(0.2)).toBe("reveal");
      expect(computePhase(0.5)).toBe("reveal");
      expect(computePhase(0.75)).toBe("reveal");
    });

    it("returns 'exit' when scroll is in 130-170vh range", () => {
      expect(computePhase(0.8)).toBe("exit");
      expect(computePhase(0.95)).toBe("exit");
      expect(computePhase(1.0)).toBe("exit");
    });
  });

  describe("computeProgress", () => {
    it("returns approach progress normalised to 0-1", () => {
      const result = computeProgress(0, "approach");
      expect(result).toBeCloseTo(0, 1);
    });

    it("returns reveal progress normalised to 0-1", () => {
      const result = computeProgress(0.47, "reveal");
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });

    it("returns exit progress normalised to 0-1", () => {
      const result = computeProgress(0.9, "exit");
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    it("clamps progress between 0 and 1", () => {
      expect(computeProgress(-0.5, "approach")).toBeGreaterThanOrEqual(0);
      expect(computeProgress(1.5, "exit")).toBeLessThanOrEqual(1);
    });
  });
});
