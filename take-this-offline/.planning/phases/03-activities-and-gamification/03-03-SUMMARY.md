---
phase: 03-activities-and-gamification
plan: 03
subsystem: activity-components
tags: [react, components, activities, gamification, client-components, css-animation]
dependency_graph:
  requires: [03-01]
  provides: [flashcard-activity, fill-blank-activity, context-match-activity]
  affects: [03-04, 03-05, 03-06]
tech_stack:
  added: []
  patterns:
    - CSS 3D flip animation using perspective/preserve-3d/backface-visibility Tailwind arbitrary values
    - useRef guard for one-time onComplete callback invocation
    - useMemo with Fisher-Yates shuffle for stable option ordering
    - Stateless activity components accepting word + isCompleted + onComplete props
key_files:
  created:
    - src/components/activities/flashcard-activity.tsx
    - src/components/activities/fill-blank-activity.tsx
    - src/components/activities/context-match-activity.tsx
  modified:
    - tests/activities/fill-blank.test.ts
decisions:
  - generateFillBlank unit tests implemented as real vitest assertions (not todos) since they test a pure function with no DOM dependency
  - FlashcardActivity DOM behavior tests kept as it.todo() — vitest configured with environment:node, not jsdom
  - ContextMatchActivity DOM behavior tests kept as it.todo() — E2E via Playwright will cover interactive behavior
  - Fisher-Yates shuffle uses Math.random() (not seeded) — content correctness does not depend on stable order
  - FillBlankActivity calls generateFillBlank in render body (pure/deterministic function, safe to call without useMemo)
metrics:
  duration: "2 minutes"
  completed_date: "2026-03-14"
  tasks_completed: 3
  files_changed: 4
---

# Phase 3 Plan 3: Activity Components Summary

**One-liner:** Three anonymous-accessible 'use client' activity components — CSS 3D flashcard flip, fill-in-the-blank with input validation, and context match multiple-choice — with 3 passing generateFillBlank unit tests.

## What Was Built

### Task 1: FlashcardActivity component

Created `src/components/activities/flashcard-activity.tsx` exporting `FlashcardActivity`.

- CSS 3D flip using Tailwind arbitrary values: `[perspective:1000px]` on wrapper, `[transform-style:preserve-3d]` on inner div, `transition-transform duration-500`, `[transform:rotateY(180deg)]` when flipped, `[backface-visibility:hidden]` on each face
- Front face: "Flashcard" label + word title in large bold text
- Back face: definition text centered
- `useRef` guard (`completedOnce`) ensures `onComplete` fires exactly once on first flip regardless of subsequent flips
- `isCompleted=true` renders `CheckCircle2` (lucide-react) in absolute top-right corner
- Keyboard accessible via `onKeyDown` (Enter/Space)
- No Supabase or auth imports — fully anonymous-accessible

### Task 2: FillBlankActivity component

Updated `tests/activities/fill-blank.test.ts` with 3 real vitest unit tests for `generateFillBlank`:
- Replaces first occurrence of word title in definition with `___________`
- Case-insensitive replacement
- Returns word title as answer

All 3 tests pass.

Created `src/components/activities/fill-blank-activity.tsx` exporting `FillBlankActivity`:

- Calls `generateFillBlank(word)` in render body (pure function, no memoization needed)
- Renders blanked text in a styled blockquote
- Input + Submit button below; Submit disabled while input is empty
- Correct answer: green "Correct! The answer is {word.title}" feedback, calls `onComplete`, disables input/button
- Wrong answer: red "Not quite — try again" feedback, clears input, does not call `onComplete`
- `isCompleted=true` shows `CheckCircle2` and disables the form

### Task 3: ContextMatchActivity component

Created `src/components/activities/context-match-activity.tsx` exporting `ContextMatchActivity`:

- `useMemo` shuffles `[word.definition, ...distractors]` into 4 options on mount (Fisher-Yates, `Math.random()`)
- Question: "Which definition matches '{word.title}'?"
- 4 outline buttons, one per option; after any selection all buttons are disabled
- Correct selection: green border + background highlight, calls `onComplete`
- Wrong selection: red border + background on selected, green reveal on correct option
- `isCompleted=true` shows `CheckCircle2` in card header

## Verification Results

- `npx tsc --noEmit` — no new errors (pre-existing Playwright test.todo TS errors in tests/profile/ are unchanged, previously documented in plan 01)
- `npx vitest run tests/activities/fill-blank.test.ts` — 3 passed, 5 todo
- `npx vitest run tests/activities/flashcard.test.ts` — 5 todo (node env, no jsdom)
- `npx vitest run tests/activities/context-match.test.ts` — 6 todo (node env, no jsdom)
- All three components export their named component
- No Supabase or auth imports in any of the three components

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

All created files exist on disk. All three task commits verified.
