# UI/UX Upgrade Plan (Haoqi.design-inspired)

This plan details the steps to completely overhaul the UI/UX of the AI Study Hub frontend to match a premium, high-end minimalist design with smooth scrolling, custom cursors, and custom GSAP micro-interactions.

---

## [ ] 1. Global Setup & Smooth Scrolling (Lenis)
- [ ] Create a `LenisProvider` or wrap `App.tsx` using `lenis` to enable smooth scrolling.
- [ ] Add base styles for Lenis in `src/styles/globals.css` (e.g. `html.lenis`, `body`, `.lenis-smooth`).
- [ ] Verify standard scroll position indicators and layout integrity.

---

## [ ] 2. Core Design System & Minimalism Refactor
- [ ] Shift from blocky shadows and solid borders to thin clean lines (`border-slate-200/40`), monochrome tones, and large, breathable negative space.
- [ ] Enhance contrast using a refined typography hierarchy.
- [ ] Clean up redundant Tailwind classes in main page layouts (e.g., `LandingPage.tsx`, `DashboardPage.tsx`).

---

## [ ] 3. Context-Aware Custom Cursor & Magnetic Interactions
- [ ] Build a custom cursor component (`CustomCursor.tsx`) that follows mouse movement with smooth inertia using GSAP.
- [ ] Enforce context-awareness:
  - Add `cursor-none` to root elements.
  - Hide custom cursor and show standard `cursor-text` over inputs, textareas, selectable chat messages, and document content.
  - Scale up/morph the custom cursor over interactive links and action buttons.
- [ ] Create a magnetic hover utility hook or component (`Magnetic.tsx`) for primary buttons and upload zones.

---

## [ ] 4. Staggered Document List Animations (Dashboard / Documents)
- [ ] Integrate a GSAP stagger animation in `DashboardPage.tsx` using the `useGSAP` hook from `@gsap/react`.
- [ ] Animate document list items on load (fade in + translate-Y).
- [ ] Add premium hover interactions to document list cards (smooth scaling of icons, sliding underline effects for titles).

---

## [ ] 5. Cinematic Chat Transitions & Input Focus
- [ ] Refactor the Chat interface in `ChatPage.tsx` / `AIChat.tsx` to slide-up new messages smoothly using mask reveals or fluid GSAP animations.
- [ ] Design fluid line-based focus borders for the chat message input field.
- [ ] Ensure user experience for text selection and scrolling is fully preserved.

---

## [ ] 6. Verification & Stability Checks
- [ ] Verify that all existing API calls, mockups, and routes function perfectly.
- [ ] Run `npm run build` to ensure types, esbuild, and bundler configurations pass successfully.
