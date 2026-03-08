# Future Design Language System (DLS)

This document defines the core aesthetic principles for all future UI/UX enhancements. The goal is to move away from "brutalist/punchy" styles towards a **Refined Minimalism** that feels professional, breathable, and modern.

## 1. Typography (The "Thin & Large" Principle)
- **Hierarchy over Weight**: Use size and color contrast rather than extreme weights (`font-black`) or All-Caps to signify importance.
- **Headings**: Use `font-light` or `font-normal` for large headers (e.g., `text-3xl`). 
- **Sub-headings**: Use `font-semibold` in smaller sizes (`text-sm` or `text-xs`) with standard casing or subtle tracking.
- **Body**: Standard `font-normal` with high line-height (`leading-relaxed`) for readability.
- **NO MORE**: `uppercase`, `font-black`, or `tracking-widest` for primary content.

## 2. Card Architecture (The "Paper" Feel)
- **Structure**: White backgrounds with extremely subtle borders (`border-slate-100`).
- **Elevation**: Use very soft, large-radius shadows instead of heavy borders.
- **Corner Radius**: `rounded-xl` (12px) to `rounded-2xl` (16px) for a soft, friendly touch.
- **Padding**: Balanced padding (`p-6`). Avoid excessive whitespace that forces unnecessary scrolling.

## 3. Component Language
- **Buttons**:
    - Small, high-contrast buttons for secondary actions.
    - Soft background tints (e.g., `bg-blue-50/50`) for grouped actions.
    - Standard title casing.
- **Status Badges**:
    - Low-density colors. Instead of a solid red block, use a thin border and a colored dot.
- **Empty States**:
    - Minimalist line-art icons and soft gray text.

## 4. Color Palette
- **Base**: `slate-50` for backgrounds, `white` for surfaces.
- **Accents**: 
    - Deep Blues (`#2563eb`) for General Bookings & Transitions.
    - Emerald Greens (`#059669`) for Financials/Passes.
    - Amber/Yellows for Achievements/Rounds.
    - Crimson/Red for Critical Alerts.
- **Categorization**: Use high-visibility tinted backgrounds (e.g., `bg-blue-100/40`) and corresponding colored borders to clearly define content zones. Avoid "washed out" colors that blend into the white surface.

---
*Created on 2026-03-08*
