/**
 * Determine which element stage is closest to the viewport centre.
 * @returns {string|null} The id of the closest element stage
 */
export function getActiveElement() {
  const stages = document.querySelectorAll(".element-stage");
  if (stages.length === 0) return null;

  const viewportCenter = window.innerHeight / 2;
  let closestId = null;
  let closestDist = Infinity;

  for (const stage of stages) {
    const rect = stage.getBoundingClientRect();
    const stageCenter = (rect.top + rect.bottom) / 2;
    const dist = Math.abs(stageCenter - viewportCenter);
    if (dist < closestDist) {
      closestDist = dist;
      closestId = stage.id;
    }
  }

  return closestId;
}

/**
 * Initialise element tab navigation.
 * - Click: smooth-scroll to target element
 * - Scroll: update active tab to match current element
 */
export function initElementTabs() {
  const nav = document.getElementById("element-tabs");
  if (!nav) return;

  const buttons = nav.querySelectorAll(".element-tabs__btn");

  // Click handler
  for (const btn of buttons) {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const target = document.getElementById(targetId);
      if (!target) return;

      target.scrollIntoView({ behavior: "smooth" });
      setActive(buttons, btn);
    });
  }

  // Scroll sync — throttled via rAF
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const activeId = getActiveElement();
      if (activeId) {
        const activeBtn = nav.querySelector(`[data-target="${activeId}"]`);
        if (activeBtn) setActive(buttons, activeBtn);
      }
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  return {
    destroy() {
      window.removeEventListener("scroll", onScroll);
    },
  };
}

/**
 * @param {NodeListOf<Element>} allButtons
 * @param {Element} activeButton
 */
function setActive(allButtons, activeButton) {
  for (const btn of allButtons) {
    btn.classList.remove("is-active");
    btn.removeAttribute("aria-current");
  }
  activeButton.classList.add("is-active");
  activeButton.setAttribute("aria-current", "true");
}
