import { describe, it, expect, vi, beforeEach } from "vitest";
import { initFaqAccordion } from "../../js/faq-accordion.js";

describe("faq-accordion", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="faq">
        <details class="faq__item">
          <summary class="faq__question">Question 1</summary>
          <div class="faq__answer">Answer 1</div>
        </details>
        <details class="faq__item">
          <summary class="faq__question">Question 2</summary>
          <div class="faq__answer">Answer 2</div>
        </details>
      </div>
    `;
  });

  it("closes other items when one is opened (exclusive accordion)", () => {
    initFaqAccordion();
    const items = document.querySelectorAll(".faq__item");

    // Open first item
    items[0].setAttribute("open", "");
    items[0].querySelector("summary").click();

    // Open second item
    items[1].querySelector("summary").click();

    // First should now be closed
    const toggleEvent = new Event("toggle");
    items[1].setAttribute("open", "");
    items[1].dispatchEvent(toggleEvent);

    expect(items[0].hasAttribute("open")).toBe(false);
  });

  it("does nothing when there are no FAQ items", () => {
    document.body.innerHTML = `<div class="faq"></div>`;
    expect(() => initFaqAccordion()).not.toThrow();
  });
});
