/**
 * Phase boundaries as fractions of total element height (170vh).
 * Approach: 0-30vh → 0-0.176
 * Reveal:  30-130vh → 0.176-0.765
 * Exit:    130-170vh → 0.765-1.0
 */
const APPROACH_END = 30 / 170;
const REVEAL_END = 130 / 170;

/**
 * Determine which phase a scroll position falls in.
 * @param {number} scrollProgress — 0 to 1 fraction of total element scroll
 * @returns {"approach" | "reveal" | "exit"}
 */
export function computePhase(scrollProgress) {
  if (scrollProgress < APPROACH_END) return "approach";
  if (scrollProgress < REVEAL_END) return "reveal";
  return "exit";
}

/**
 * Compute normalised progress (0-1) within the current phase.
 * @param {number} scrollProgress — 0 to 1 fraction of total element scroll
 * @param {"approach" | "reveal" | "exit"} phase
 * @returns {number} 0 to 1
 */
export function computeProgress(scrollProgress, phase) {
  const clamp = (v) => Math.max(0, Math.min(1, v));

  switch (phase) {
    case "approach":
      return clamp(scrollProgress / APPROACH_END);
    case "reveal":
      return clamp((scrollProgress - APPROACH_END) / (REVEAL_END - APPROACH_END));
    case "exit":
      return clamp((scrollProgress - REVEAL_END) / (1 - REVEAL_END));
    default:
      return 0;
  }
}

/**
 * Initialise the scroll-driven animation for all element sections.
 * Each `.element-stage` must contain:
 *   - `.element-stage__bg` (background image)
 *   - `.element-stage__overlay` (dark overlay)
 *   - `.element-stage__content` (text content with staggered children)
 */
export function initElementScroll() {
  const stages = document.querySelectorAll(".element-stage");
  if (stages.length === 0) return;

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    for (const stage of stages) {
      stage.classList.add("element-stage--visible");
    }
    return;
  }

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      for (const stage of stages) {
        updateStage(stage);
      }
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  return {
    destroy() {
      window.removeEventListener("scroll", onScroll);
    },
  };
}

/**
 * Update a single element stage based on its scroll position.
 * @param {HTMLElement} stage
 */
function updateStage(stage) {
  const rect = stage.getBoundingClientRect();
  const stageHeight = stage.offsetHeight;
  const viewportHeight = window.innerHeight;

  // scrollProgress: 0 when stage top hits viewport bottom, 1 when stage bottom hits viewport top
  const scrolled = viewportHeight - rect.top;
  const totalTravel = stageHeight + viewportHeight;
  const rawProgress = scrolled / totalTravel;

  // Only process when stage is in or near viewport
  if (rawProgress < -0.05 || rawProgress > 1.05) return;

  const scrollProgress = Math.max(0, Math.min(1, rawProgress));
  const phase = computePhase(scrollProgress);
  const progress = computeProgress(scrollProgress, phase);

  const bg = stage.querySelector(".element-stage__bg");
  const overlay = stage.querySelector(".element-stage__overlay");
  const content = stage.querySelector(".element-stage__content");

  if (!bg || !overlay || !content) return;

  // Phase 1: Approach — zoom background from 1.08 to 1.0
  if (phase === "approach") {
    const scale = 1.08 - 0.08 * progress;
    bg.style.transform = `scale(${scale})`;
    overlay.style.opacity = "0";
    content.style.opacity = "0";
    content.style.transform = "translateY(24px)";
  }

  // Phase 2: Reveal — overlay fades in, text fades in with stagger
  if (phase === "reveal") {
    bg.style.transform = "scale(1)";
    overlay.style.opacity = String(0.5 * Math.min(progress * 2, 1));

    const textProgress = Math.max(0, (progress - 0.1) / 0.6);
    content.style.opacity = String(Math.min(textProgress, 1));
    content.style.transform = `translateY(${24 * (1 - Math.min(textProgress, 1))}px)`;

    // Stagger children
    const children = content.children;
    for (let i = 0; i < children.length; i++) {
      const childDelay = i * 0.08;
      const childProgress = Math.max(0, Math.min(1, (textProgress - childDelay) / 0.3));
      children[i].style.opacity = String(childProgress);
      children[i].style.transform = `translateY(${16 * (1 - childProgress)}px)`;
    }
  }

  // Phase 3: Exit — everything fades out
  if (phase === "exit") {
    bg.style.transform = "scale(1)";
    overlay.style.opacity = String(0.5 + 0.3 * progress);
    content.style.opacity = String(1 - progress);
    content.style.transform = `translateY(${-16 * progress}px)`;
  }
}
