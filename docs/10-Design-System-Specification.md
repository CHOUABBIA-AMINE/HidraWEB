# 10 — Design System Specification

## Design system position

HidraWeb shall use Material UI as implementation base, but the product language shall be Hidra/SONATRACH operational enterprise style.

## Color strategy

- Primary: SONATRACH-inspired operational green.
- Secondary: petroleum/industrial blue-gray.
- Critical: red for emergency/alarm.
- Warning: amber for caution and pending validation.
- Success: green for safe/normal/completed.
- Information: blue for telemetry/status.

## Typography

Use a web-safe enterprise font stack. Recommended: Inter or Roboto for Latin/French; Noto Naskh Arabic or Noto Sans Arabic for Arabic. Numeric telemetry must use tabular figures.

## Spacing

Use 4 px base grid. Operational screens favor density while preserving touch targets for tablets.

## Icons

Use MUI icons mapped by module. Every icon must have an accessible label.

## Tables

- Server-side pagination and sorting.
- Sticky header.
- Column density toggle.
- Saved filters.
- Inline status chips.

## Forms

- Group fields by operational purpose.
- Use validation messages in French/Arabic-ready strings.
- Avoid modal forms for long operational records.

## Dialogs

- Confirmation dialogs for destructive or workflow-critical actions.
- Show affected record, action and consequence.

## Notifications

- Toast for transient success/failure.
- Notification center for persistent operational events.
- Alarm-style banners only for safety/operational criticality.

## Accessibility

- WCAG 2.2 AA target.
- Keyboard navigation for all critical actions.
- High contrast mode for control-room displays.
- Do not rely only on red/green.
