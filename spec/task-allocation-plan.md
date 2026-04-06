## Plan: Local Task Allocation

Add a local-only allocation flag to the existing per-quiz progress model, expose a toggle action in both the home task card and quiz screen header, and extend the home page from 2 tabs to 3 so "הרשימה שלי" shows only allocated quizzes that are not yet completed. The implementation must preserve the app’s RTL behavior, Hebrew-first language consistency, and current UX/design language rather than introducing a new interaction pattern. This keeps the feature aligned with the app’s current localStorage-only architecture and avoids introducing any new backend or content-file schema.

**Steps**
1. Extend the persisted progress schema in `c:\Projects\Mine\quiz-for-ronni\docs\app.js` so each quiz progress object includes an allocation field such as `isAllocated` (or `allocated`) with a safe default of `false`, and ensure `normalizeQuizProgress()` backfills the new field for existing saved state. This is the base dependency for all other steps.
2. Update derived home-page collections in `getDerivedStats()` in `c:\Projects\Mine\quiz-for-ronni\docs\app.js` to compute a third list for allocated-but-not-completed quizzes, while keeping the current pending/completed behavior intact. This depends on step 1.
3. Adjust home tab state handling in `c:\Projects\Mine\quiz-for-ronni\docs\app.js` so `state.activeTab` supports a third value for "הרשימה שלי", and make the home view choose between pending, allocated, and completed lists correctly. This depends on step 2.
4. Update the home tab UI in `renderHomeView()` in `c:\Projects\Mine\quiz-for-ronni\docs\app.js` to render 3 tabs instead of 2, with the new tab label "הרשימה שלי". Keep existing click handling through `data-tab` and `setActiveTab()` rather than introducing a second interaction model. This depends on step 3.
5. Add allocation button rendering to `renderTaskCard()` in `c:\Projects\Mine\quiz-for-ronni\docs\app.js` so cards for non-completed quizzes show either "הוסף לרשימה שלי" or "הסר מהרשימה שלי" depending on allocation state, and completed quizzes show no allocation button. Because the current card is itself a button, the implementation should avoid invalid nested buttons and accidental navigation by restructuring the card markup into a non-button container with separate action buttons, or by using a different safe interaction pattern already consistent with the app. This depends on steps 1 and 4.
6. Add the same allocation toggle to the top area of the quiz page in `renderQuizView()` in `c:\Projects\Mine\quiz-for-ronni\docs\app.js`, visible only while the quiz is not completed. Place it in the existing `question-topline` action area so the page keeps its current structure. This depends on step 1.
7. Extend `handleActionClick()` in `c:\Projects\Mine\quiz-for-ronni\docs\app.js` with an allocation toggle action that flips the allocation flag, persists it with `saveState()`, and rerenders the current view. Reuse the existing `data-action` event model. This depends on steps 5 and 6.
8. Update relevant layout and component styling in `c:\Projects\Mine\quiz-for-ronni\docs\styles.css` so the new third tab fits cleanly, the allocation buttons match the current design language, and the task card layout still works in RTL on desktop and mobile after any markup changes from step 5. Preserve the current visual hierarchy, spacing rhythm, pill/button patterns, and hover/active behavior instead of introducing a visually distinct control family. This is partly parallel with steps 5 to 7 once the target markup is known.
9. Check adjacent views in `renderProgressView()` and result flow in `c:\Projects\Mine\quiz-for-ronni\docs\app.js` for consistency so completed allocated quizzes do not keep surfacing in "הרשימה שלי" and allocation toggles are never shown where the requirement says they should be hidden.
10. Perform a content and RTL audit across all added strings and layout changes: every new visible label must remain in Hebrew, tab/button ordering must stay natural for RTL, math and existing LTR numeric expressions must remain visually stable, and no new control should break keyboard/focus behavior. This depends on steps 4 to 9.

**Relevant files**
- `c:\Projects\Mine\quiz-for-ronni\docs\app.js` — primary SPA logic; modify `createEmptyState()`, `normalizeQuizProgress()`, `getDerivedStats()`, `renderHomeView()`, `renderTaskCard()`, `renderQuizView()`, `handleActionClick()`, and possibly `setActiveTab()` handling assumptions.
- `c:\Projects\Mine\quiz-for-ronni\docs\styles.css` — update tab layout, card action layout, and quiz header button styling to support the new controls without breaking RTL responsiveness.
- `c:\Projects\Mine\quiz-for-ronni\docs\index.html` — likely no functional changes needed, but keep in scope only if markup outside `app.js` requires support for styling or header spacing.
- `c:\Projects\Mine\quiz-for-ronni\spec\SPECIFICATION.md` — reference only; confirms the product is local-only and progress is stored on-device, which supports local allocation state.

**Verification**
1. Load the app with a clean local state and confirm the home page shows 3 tabs: pending, "הרשימה שלי", and completed.
2. From a pending task card, toggle allocation on and verify the button text changes immediately in Hebrew and the task appears under "הרשימה שלי" while still remaining incomplete.
3. Open an allocated task and verify the same toggle appears at the top of the quiz page with the correct Hebrew text, aligned correctly in RTL, and that using it updates the home list after navigation.
4. Complete an allocated task and verify both allocation buttons disappear and the task no longer appears under "הרשימה שלי" but does appear under completed.
5. Reload the page and verify allocation state persists through localStorage for incomplete tasks.
6. Check RTL layout and responsive behavior for the 3-tab row, task card actions, and quiz header actions on the main viewport sizes used by this app, including visual order, alignment, spacing, and focus behavior.
7. Compare the updated controls against the current UI so the new button styling, card structure, and tab row still feel like part of the same product rather than a new design treatment.
8. Run any available manual smoke test of the existing flows: start quiz, continue quiz, submit answer, finish quiz, open results, and switch tabs, to ensure no regression from the card markup/event changes.

**Decisions**
- Allocation is local-only and stored in the same browser `localStorage` state as the existing progress model.
- "הרשימה שלי" includes only quizzes where allocation is on and completion is still false.
- Completed quizzes must hide both allocation buttons even if they were previously allocated.
- The feature should be implemented without modifying the quiz content JSON files because allocation is user/device state, not authored content.
- All newly introduced visible strings remain in Hebrew, and the feature must preserve existing RTL behavior and the current general design/UX language.

**Further Considerations**
1. Recommended naming: use a single boolean field such as `allocated` to minimize migration and rendering complexity.
2. The biggest implementation risk is the current clickable task card structure; the execution should explicitly refactor this safely to support a second action without nested interactive elements.
3. If the team later wants teacher-assigned lists across devices, that should be treated as a separate feature requiring a non-local persistence design rather than extending this local flag further.