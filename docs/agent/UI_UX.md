# Desktop Web UI and UX

Load this playbook for web UI creation, redesign, component or styling work,
interaction states, accessibility, motion, browser diagnosis, or screenshot
verification. Also apply the owning stack rules and apply the
`local-single-user-desktop` boundary only where its scope conditions hold.
Terminal and TUI work is governed by [`CLI_TUI.md`](CLI_TUI.md), not this
playbook.

## 1. Design intent and tool routing

Aim for premium, calm, modern, understated, professional quality comparable to Apple's clarity, restraint, precision, depth, smoothness, and immediate feedback. Do not copy proprietary interfaces, assets, layouts, or branding. Ground every choice in the product's subject, audience, data density, and the screen's single job; "Apple-grade" is a quality bar, not a substitute for product-specific direction.

When available and applicable:

- use `frontend-design` for new UI or a material visual direction;
- use `impeccable` for a broad interface audit and refinement pass;
- use Chrome DevTools MCP for live DOM, computed-style, console, network, rendering, memory, or performance diagnosis; and
- use Playwright CLI plus the `playwright-cli` Skill for deterministic flows, interaction-state setup, screenshots, and browser regression checks.

Verify capability availability before relying on it. If a preferred capability is unavailable, use the best repository-local Chrome-based workflow and state which assurance is missing. Never claim browser or screenshot verification from code inspection alone.

## 2. Audit before implementation

Before a material redesign, inspect the running interface and affected code, then record a compact audit covering:

- information hierarchy, navigation, page purpose, and primary action;
- current palette, contrast, semantic color use, and inconsistent or noisy color;
- typography, spacing rhythm, alignment, density, boundaries, elevation, and visual balance;
- default, hover, focus-visible, pressed, disabled, loading, success, error, empty, and long-content states;
- desktop resizing, overflow, clipping, overlap, layout shift, and dynamic-message space;
- keyboard flow, accessible names, labels, semantics, contrast, and non-color cues;
- duplicated or one-off styles, dead UI state, unused wrappers, and fragile dimensions; and
- console, network, hydration, rendering, and obvious performance failures.

Choose a restrained visual thesis and, when the product benefits, one memorable signature element. Spend visual emphasis on that element and the primary task; keep surrounding decoration quiet. Critique the direction against the actual product before coding.

## 3. Semantic design system

Use one coherent token system rather than scattered literal values. At minimum, define and consistently apply:

- `background`
- `surface`
- `surface-elevated`
- `border`
- `border-subtle`
- `text-primary`
- `text-secondary`
- `text-tertiary`
- `accent`
- `accent-hover`
- `accent-active`
- `success`
- `warning`
- `danger`
- `focus-ring`

The palette must be calm, cohesive, professional, distinguishable, and accessible. Avoid unnecessary saturation, decorative gradients, excessive shadows, and competing accents. State colors must remain understandable without color alone.

Use this system font stack unless the product already owns a deliberate, verified typography system:

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
```

Define a clear scale for headings, labels, body text, helper text, captions, and data. Keep line-height, letter-spacing, weight, and hierarchy consistent. Derive spacing, radii, borders, and elevation from compact tokens; align precisely and leave enough breathing room without wasting desktop space.

## 4. Desktop layout stability

This profile is desktop-only. Do not add phone/tablet layouts, mobile navigation, mobile-first breakpoints, touch-only flows, or mobile/tablet screenshot targets. Do not remove responsive behavior already required by an established product.

- Support the documented desktop minimum and stable resizing across the accepted desktop range.
- Use grid, flex, `minmax()`, `clamp()`, intrinsic sizing, and bounded content widths where they improve stability.
- Avoid fixed dimensions that clip localized, long, empty, loading, validation, success, or error content.
- Reserve or deliberately transition space for asynchronous feedback so content does not jump unexpectedly.
- Ensure text zoom and desktop window resizing do not make controls unreachable or obscure meaning.
- At each accepted viewport, eliminate unintended horizontal overflow, clipping, overlap, unstable alignment, unreadable text, and inconsistent control sizing.

## 5. Interaction quality

Every interactive control must have intentional behavior for each applicable state:

- default;
- hover;
- focus-visible;
- active or pressed;
- disabled;
- loading or submitting;
- success; and
- error or retry.

Feedback must be immediate, subtle, and unmistakable. Hover should communicate affordance, pressed state should feel tactile, focus must remain elegant and visible, disabled controls must look intentionally unavailable, and errors must explain a next action. Use semantic elements and preserve full keyboard operation.

Treat the primary asynchronous action as a critical interaction. If the product has a Send action, this requirement applies to that button; do not invent a Send action where none exists.

- Prevent duplicate submission while work is active.
- Keep the control's geometry stable while its label, spinner, result, or retry state changes.
- Communicate progress without pretending completion.
- Transition cleanly into success or actionable error, then restore an appropriate stable state.
- Preserve the user's input on recoverable failure unless the product requirement says otherwise.

## 6. Motion

Motion must improve causality, continuity, and feedback rather than decorate the page. Prefer opacity and transform over layout-affecting animation. Use natural easing and these starting ranges, adjusting only when the interaction evidence justifies it:

- micro-interactions: 120–200 ms;
- component transitions: 180–280 ms; and
- larger state transitions: 250–400 ms.

Avoid robotic linear timing, gratuitous bounce, looping attention effects, and scattered animation. Respect `prefers-reduced-motion`; reduced motion must retain state clarity without relying on movement.

## 7. Component and code quality

- Build cohesive, reusable components with focused responsibilities and consistent tokens.
- Prefer clear composition over deep wrapper trees and premature design-system abstraction.
- Remove dead state, unused CSS and imports, duplicate styling, stale variants, and redundant wrappers in the affected scope.
- Keep user-facing copy active, specific, and consistent: the action label and resulting feedback should use the same verb.
- Handle empty, loading, partial, success, validation, recoverable failure, unavailable, and disabled states deliberately.
- Do not introduce a dependency unless it materially improves the result and is compatible with the owning stack.

## 8. Accessibility

- Use semantic HTML and native controls where possible.
- Give every control a visible label or accurate accessible name.
- Make the entire flow operable by keyboard with logical focus order and no focus traps.
- Use consistent `focus-visible` treatment and never remove outlines without an equivalent replacement.
- Meet WCAG 2.2 AA by default, or the repository's stricter accepted target: at least 4.5:1 for normal text, 3:1 for large text (at least 24 CSS px regular or 18.66 CSS px bold), and 3:1 for meaningful non-text controls, states, graphics, and focus indicators against adjacent colors. Do not encode status by color alone.
- Associate validation messages with their controls and make errors calm, specific, and actionable.
- Respect text zoom, reduced motion, and assistive-technology state announcements.

## 9. Chrome verification gate

After implementation, run the application in a production-like mode when practical and inspect it in Chrome. Capture and review screenshots at all of these desktop viewports:

- 1280 × 800;
- 1440 × 900; and
- 1920 × 1080.

At every viewport, check the default screen and every reachable high-risk state. Exercise hover, focus-visible, pressed, disabled, loading/submitting, success, error/retry, long content, empty data, and any primary dialog or menu. For asynchronous actions, verify duplicate prevention and stable geometry.

Inspect screenshots and live behavior for:

- horizontal overflow, clipping, overlap, broken alignment, or unexpected layout shift;
- weak hierarchy, inconsistent spacing, typography, radii, borders, shadows, or control sizing;
- inaccessible contrast, missing focus, keyboard failure, or color-only communication;
- console errors, failed requests, hydration problems, and visibly unstable rendering; and
- awkward timing, unclear feedback, or reduced-motion failure.

Fix every observed in-scope defect and repeat the affected checks. A generated screenshot is evidence only after it has actually been inspected. If the app cannot run or Chrome cannot be controlled, mark visual verification blocked and do not substitute a claim of success.

## 10. Completion evidence

Run the owning project's formatter/linter, type checker, build, focused tests, and broader tests as required by its scripts and [`QUALITY_GATES.md`](QUALITY_GATES.md). In the final report, state:

- the visual direction and semantic color changes;
- interaction and primary asynchronous-action improvements;
- exact desktop viewport sizes inspected;
- key states exercised and defects found/fixed;
- build, lint, type-check, test, and browser outcomes; and
- any blocked verification, remaining issue, or deliberate trade-off.
