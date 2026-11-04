# UI/UX Design Guidelines (DESIGN.md)

This document establishes the visual standards, design principles, and interaction patterns for this project. All AI code generation and modifications must strictly comply with these rules.

---

## 1. Core Principles
1. **Flat with Subtle Borders**: Eliminate heavy shadows and decorative noise. Structure layouts using whitespace, clear typography, subtle background tints, and precise hairline dividers.
2. **In-Place Interactions**: Minimize routing/page transitions. Preserve user context by handling details, edits, and state switching within the current view.
3. **Dual Theme First**: Treat Light and Dark modes with equal priority. Fully support both out-of-the-box using semantic color tokens.

---

## 2. Visual Style: Flat with Functional Borders

Adopt a clean, flat aesthetic. Borders are permitted strictly for **functional separation**, not for decorative framing.

### Do:
- **Subtle Functional Dividers**: Use 1px, low-contrast borders (`border-border/40` or `divide-border/30`) specifically for:
  - Table row dividers and list separators.
  - Structural separators (e.g., between modal headers, content body, and footers).
  - Form input and control boundaries.
- **Whitespace First**: Prioritize padding/margin and subtle background shifts (`bg-muted/50`) over explicit borders to group related content.
- **Interactive States**: Always provide clear hover states (`hover:bg-muted/50`) and accessible focus rings (`focus-visible:ring-2`) for keyboard navigation.

### Don't:
- **No Heavy Container Boxes**: Avoid enclosing entire content cards inside prominent 4-sided borders (`border-2`, solid high-contrast outlines).
- **No Drop Shadows**: Do not apply elevation drop shadows (`shadow-md`, `shadow-lg`). Keep the interface strictly flat.

---

## 3. Interaction & Component Selection

Prioritize in-place components over triggering full page reloads or route changes (`router.push`):

- **Modal / Dialog (with Docked Minimization)**:
  - **Standard Use**: Confirmations, short focused tasks, and primary edit forms.
  - **Minimization Behavior (Gmail-style)**:
    - If a modal contains active form inputs, provide a **Minimize** action instead of forcing dismissal.
    - When minimized, dock the window to the bottom-right corner as a persistent floating bar displaying title and progress.
    - Clicking the docked bar restores the modal to its full size without losing form state.
    - Support three states: `normal`, `minimized`, and `closed`.
    - Limit concurrently minimized windows to 2 to prevent viewport clutter.
- **Tabs / Segmented Controls**:
  - Switch perspectives, sub-views, or content categories within the same entity without page navigation.
- **Accordion**:
  - Collapse secondary details, optional form fields, and FAQs to save vertical space.
- **Chips / Tags**:
  - Provide instant filtering and selection. Toggling chips must update views immediately without re-rendering the whole page.
- **Toast Notifications**:
  - Non-blocking, auto-dismissing notifications for background events, autosave alerts, and transient status updates.

---

## 4. Mobile & Responsive Adaptations
- **Modal Fallback on Mobile**:
  - On viewports narrower than 768px (`md`), render modals as a full-screen view or a bottom drawer (Bottom Sheet).
  - If minimized on mobile, collapse into a slim sticky bottom bar rather than a desktop-style floating card.
- **Horizontal Overflow**:
  - Horizontal items like Tabs and Filter Chips must support horizontal scrolling (`overflow-x-auto`) instead of wrapping into multi-line rows.

---

## 5. Theme System (Dark & Light Mode)
- **Zero Hardcoded Colors**: Strictly prohibit raw hex values (`#fff`, `#000`) or static classes (`text-black`, `bg-white`) in markup.
- **Semantic Tokens Only**: Always use semantic variables (e.g., `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`).
- **Accessibility**: Ensure all text and UI boundaries meet WCAG AA contrast standards across both themes.

---

## 6. Motion & Animation

Animations must be purposeful, fast, and subtle—used exclusively to communicate state transitions and preserve spatial orientation, never for decorative flair.

### Rules:
- **Duration Constraints**:
  - Micro-interactions (hover, active, focus): **100ms - 150ms**.
  - Layout & surface transitions (dialog open/close, accordion expansion): **200ms - 250ms**.
  - Avoid animations longer than 300ms to keep the interface fast and responsive.
- **Easing**:
  - Entrances: `ease-out` (quick initial appearance, soft landing).
  - Exits: `ease-in` (accelerate out of view).
  - Movement/Resize: Standard fluid easing (`ease-in-out` or `cubic-bezier(0.16, 1, 0.3, 1)`).
- **Docked Minimization Transition**:
  - When minimizing a modal into the bottom-right corner (and vice versa), provide a smooth translate/scale animation so the user clearly sees where the window docked.
- **Reduced Motion (Accessibility)**:
  - Respect `prefers-reduced-motion: reduce`. When active, disable all spatial motion/scaling and fall back to instantaneous state changes or subtle instant fades (`opacity`).
  - 