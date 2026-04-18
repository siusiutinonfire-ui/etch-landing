import { describe, it, expect, vi, beforeEach } from "vitest";
import { shouldShowNav } from "../../js/sticky-nav.js";

describe("sticky-nav", () => {
  describe("shouldShowNav", () => {
    it("returns false when hero is fully visible", () => {
      expect(shouldShowNav(0, 800)).toBe(false);
      expect(shouldShowNav(200, 800)).toBe(false);
    });

    it("returns true when scrolled past hero height", () => {
      expect(shouldShowNav(850, 800)).toBe(true);
      expect(shouldShowNav(1200, 800)).toBe(true);
    });

    it("returns true at exactly hero height", () => {
      expect(shouldShowNav(800, 800)).toBe(true);
    });
  });
});
