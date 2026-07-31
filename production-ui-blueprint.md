# Production UI/UX Blueprint (Premium AI SaaS Theme)

This blueprint outlines the comprehensive design overhaul of the frontend UI to match high-end AI SaaS platforms like Linear and Vercel.

---

## 1. Global Navigation & Sidebar Layout
- **Files**:
  - `src/app/components/layout/MainLayout.tsx` (or sidebar component)
- **Task**:
  - Create a collapsible, glassmorphic left sidebar.
  - Implement workspace switcher at the top.
  - Add sliding background block indicator using Framer Motion (`layoutId`) for active states.
  - Render keyboard shortcut hints (e.g., `⌘K`) beside nav items.

---

## 2. Document Vault (Bento Grid & Hover Spotlight)
- **Files**:
  - `src/app/pages/documents/DocumentsPage.tsx`
  - `src/app/components/SpotlightCard.tsx` (New component)
- **Task**:
  - Convert document storage grid into an asymmetrical Bento Box layout.
  - Implement SpotlightCard wrapper to track mouse coords and render a radial spotlight gradient glow that follows the mouse.
  - Add shimmering Skeleton loaders for loading state.
  - Design a drag-and-drop zone empty state with dashed border animations.
  - Add vector embedding progress indicators and contextual menus.

---

## 3. Cinematic AI Chat Workspace
- **Files**:
  - `src/app/pages/ChatPage.tsx`
- **Task**:
  - Redesign the chat workspace to feel like an IDE.
  - Add Framer Motion staggered animations for streaming messages.
  - Add rounded headers, copy button, and syntax highlight container to Markdown code blocks.
  - Render citation badges showing text snippets on hover.
  - Implement dynamic floating input pill at the bottom with focus rings and file attachment indicator.

---

## 4. Global Command Palette & Polish
- **Files**:
  - `src/app/components/CommandPalette.tsx` (New component)
  - `src/app/App.tsx`
- **Task**:
  - Integrate global `⌘K` / `Ctrl+K` dialog Command Palette using Radix Command primitives.
  - Allow searching documents, toggling theme, and navigation.
  - Apply scale-tap physical micro-interactions on all buttons (`whileTap={{ scale: 0.98 }}`).
