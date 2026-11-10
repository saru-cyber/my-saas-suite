# UI/UX Design Guidelines (DESIGN.md)

This document establishes the visual standards, design principles, and interaction patterns for this project. All AI code generation and modifications must strictly comply with these rules.

---

## 1. Core Principles
1. **Flat with Subtle Borders**: Eliminate heavy shadows and decorative noise. Structure layouts using whitespace, clear typography, subtle background tints, and precise hairline dividers.
2. **In-Place Interactions**: Minimize routing/page transitions. Preserve user context by handling details, edits, and state switching within the current view.
3. **Dual Theme First**: Treat Light and Dark modes with equal priority. Fully support both out-of-the-box using semantic color tokens.
4. **Intuitive Over Explanatory**: Prioritize self-explanatory UI over inline descriptive text. Avoid cluttering the screen with static explanatory paragraphs.
5. **Optimistic & Resilient Feedback**: Keep interactions instantaneous. Reflect UI state changes immediately without waiting for server responses, providing seamless recovery on error.

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

Prioritize in-place components and low-friction patterns over full-page reloads, routing, or interrupting user momentum:

- **Contextual Help via Tooltip Badges (`?` Badge)**:
  - Avoid inline instructional text or verbose explanatory copy in page bodies.
  - When clarification is strictly necessary, provide a subtle help badge (e.g., a small circular `?` icon button) that reveals a contextual tooltip or popover on hover/focus/click without cluttering the layout.
- **Modal / Dialog (with Docked Minimization)**:
  - **Standard Use**: Complex forms, focused multi-step workflows, and high-impact administrative settings.
  - **Minimization Behavior (Gmail-style)**:
    - If a modal contains active form inputs, provide a **Minimize** action instead of forcing dismissal.
    - When minimized, dock the window to the bottom-right corner as a persistent floating bar displaying title and progress.
    - Clicking the docked bar restores the modal to its full size without losing form state.
    - Support three states: `normal`, `minimized`, and `closed`.
    - Limit concurrently minimized windows to 2 to prevent viewport clutter.
- **Undo over Confirmation Modals**:
  - Do not interrupt user workflows with blocking confirmation modals for reversible, low-to-medium risk operations (e.g., delete, archive, toggle status).
  - Execute the action immediately and display a non-blocking toast with an actionable **Undo** trigger (5–8 second timeout).
  - Reserve blocking confirmation dialogs strictly for irreversible, destructive, or catastrophic actions.
- **Tabs / Segmented Controls**:
  - Switch perspectives, sub-views, or content categories within the same entity without page navigation.
- **Accordion & Progressive Disclosure**:
  - Keep initial view density low by revealing controls and fields strictly when needed.
  - Reveal secondary row-level actions (e.g., edit, delete, duplicate) only on hover/focus.
  - Collapse optional fields, advanced parameters, and FAQs within accordions.
- **Chips / Tags**:
  - Provide instant filtering and selection. Toggling chips must update views immediately without full-page re-rendering.
- **Toast Notifications**:
  - Non-blocking, auto-dismissing notifications for background events, autosave alerts, and undo prompts.

---

## 4. Performance, Feedback & State Patterns

- **Optimistic UI Updates**:
  - Mutate local state and update the UI immediately upon user trigger (e.g., toggles, likes, sorting, reordering, item removal).
  - Sync with the backend asynchronously. If the operation fails, gracefully roll back local state to the previous snapshot and present an error toast.
- **Inline & Real-Time Form Validation**:
  - Validate field inputs upon blur (`onBlur`) or after a short debounce during correction—do not defer feedback entirely to final form submission.
  - Display validation feedback immediately adjacent to the relevant field, styling the boundary state (`border-destructive`) and showing clear, concise inline error text.
- **Skeleton Screens over Full-Page Spinners**:
  - Replace blocking full-page loading spinners with skeleton placeholders (`bg-muted animate-pulse`) matching the exact layout geometry of incoming content.
  - Prevent Cumulative Layout Shift (CLS) by maintaining fixed placeholder dimensions during data fetch.
- **Actionable Empty States**:
  - Never display a blank screen or plain text like "No data found."
  - When a container, list, or filter result is empty, provide a structured empty state comprising:
    - A simple, neutral icon.
    - A clear heading and single-sentence context.
    - A primary Call-to-Action (CTA) button (e.g., "Create item", "Clear filters", "Import template").

---

## 5. Mobile & Responsive Adaptations
- **Modal Fallback on Mobile**:
  - On viewports narrower than 768px (`md`), render modals as a full-screen view or a bottom drawer (Bottom Sheet).
  - If minimized on mobile, collapse into a slim sticky bottom bar rather than a desktop-style floating card.
- **Horizontal Overflow**:
  - Horizontal items like Tabs and Filter Chips must support horizontal scrolling (`overflow-x-auto`) instead of wrapping into multi-line rows.
- **Touch Targets**:
  - Ensure all interactive elements (chips, badges, buttons, row triggers) maintain an accessible touch target of at least 44x44px on mobile viewports.

---

## 6. Theme System (Dark & Light Mode)
- **Zero Hardcoded Colors**: Strictly prohibit raw hex values (`#fff`, `#000`) or static classes (`text-black`, `bg-white`) in markup.
- **Semantic Tokens Only**: Always use semantic variables (e.g., `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `border-destructive`).
- **Accessibility**: Ensure all text and UI boundaries meet WCAG AA contrast standards across both themes.

---

## 7. Motion & Animation

Animations must be purposeful, fast, and subtle—used exclusively to communicate state transitions and preserve spatial orientation, never for decorative flair.

### Rules:
- **Duration Constraints**:
  - Micro-interactions (hover, active, focus): **100ms - 150ms**.
  - Layout & surface transitions (dialog open/close, accordion expansion, skeleton fade-in): **200ms - 250ms**.
  - Avoid animations longer than 300ms to keep the interface fast and responsive.
- **Easing**:
  - Entrances: `ease-out` (quick initial appearance, soft landing).
  - Exits: `ease-in` (accelerate out of view).
  - Movement/Resize: Standard fluid easing (`ease-in-out` or `cubic-bezier(0.16, 1, 0.3, 1)`).
- **Docked Minimization Transition**:
  - When minimizing a modal into the bottom-right corner (and vice versa), provide a smooth translate/scale animation so the user clearly sees where the window docked.
- **Reduced Motion (Accessibility)**:
  - Respect `prefers-reduced-motion: reduce`. When active, disable all spatial motion/scaling and skeleton pulsing, falling back to instantaneous state changes or subtle instant fades (`opacity`).