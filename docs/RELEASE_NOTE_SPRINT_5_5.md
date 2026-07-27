# NOVIX Sprint 5.5 Release Note

Date: 2026-07-27
Scope: Stabilization only (no new features)

## Summary
- Resolved production build blocking TypeScript error from UI barrel export.
- Added ESLint flat config file so lint checks run consistently.
- Reduced duplicated member detail placeholder markup.
- Confirmed Next Action flow still works after stabilization.

## Changes
- Exported `BadgeVariant` type in shared UI badge component.
- Added `eslint.config.mjs` for project lint execution.
- Refactored duplicated "준비 중입니다" tab content in member detail panel to shared local component.

## Validation
- `npm run build`
- `npx tsc --noEmit`
- `npx eslint .`
- Browser smoke test for Next Action create/complete and dashboard/timeline reflection.

## Notes
- No data model or API behavior changes were introduced in this stabilization sprint.
