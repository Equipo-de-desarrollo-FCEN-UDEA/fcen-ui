# @fcen-udea/ui

React components of the FCEN UdeA development team, built on Tailwind CSS 4 and the SIGA brand.

## Install

```bash
npm install @fcen-udea/ui
```

React 19 and Tailwind CSS 4 are expected in the consuming app. Import the theme right after Tailwind; it brings the brand tokens, the animations and the classes the components use:

```css
@import "tailwindcss";
@import "@fcen-udea/ui/theme.css";
```

```tsx
import { Button, Toaster, toast } from "@fcen-udea/ui";

export function App() {
  return (
    <>
      <Toaster />
      <Button label="Guardar" onClick={() => toast.success("Comisión enviada", { message: "Queda en Solicitada." })} />
    </>
  );
}
```

## Brand

The brand palette lives in `--color-brand-50` … `--color-brand-900` (UdeA green by default). Another brand overrides those variables after importing the theme:

```css
@theme {
  --color-brand-600: #16a34a;
}
```

Dark mode follows the `dark` class on `<html>`.

## What is inside

| Group | Components |
| --- | --- |
| Atoms | Button, StatusBadge, PingDot, Avatar, CodePill, Chip, Label, Spinner, Tooltip, Input, Textarea, Checkbox, SegmentedToggle, AnimatedCount |
| Molecules | FormField, Select, Modal, Toast, Toaster and `toast`, EmptyState, Pagination, SummaryCard |
| Tiles | NavTile, HeroNavTile, StatusTile |
| Process | Stepper, Timeline, TimelineItem, FileDrop, FileItem |
| Records | RecordCard, RecordRow |
| Organisms | TopBar, UserMenu, PageHeader, Footer, AppShell |

Every component has its stories in Storybook, matching the Figma file of SIGA v4, with a light and dark toggle. The test suite also renders every story and checks it with axe.

## Development

```bash
npm ci
npm run storybook
npm run lint
npm run typecheck
npm run coverage
npm run build
```

## Release

1. Raise `version` in `package.json` on `develop` and promote it to `main`.
2. Create a GitHub release whose tag is `v<version>` on the head of `main`.
3. The `Release` workflow checks the tag, runs the checks and publishes to npm through trusted publishing; it waits for approval in the `npm` environment.
