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

## REST API

`useRestApi` is the only way the apps talk to their back end. `RestApiProvider` sets the base URL, the session headers and what to do on a 401. `prepare` runs before every request, retries included, and may replace the body, add headers and return the reader for that request's response, which is how an app encrypts a request and opens its answer with the same key:

```tsx
const config = {
  baseUrl: import.meta.env.VITE_API_URL,
  getHeaders: buildAuthHeaders,
  onUnauthorized: refreshSession,
  prepare: encryptWhenRequired,
};

<RestApiProvider config={config}>
  <App />
</RestApiProvider>;

const { data, loading, doPost } = useRestApi<Room[]>(roomsApi.list);
```

`doFetchFile(path)` goes through the same pipeline and returns `{ blob, fileName }`, or `null` after recording the failure, so a document can be shown in `DocumentViewer` instead of downloaded. `fileName` comes from `Content-Disposition`, which the API has to expose through CORS.

## Brand

The brand palette lives in `--color-brand-50` … `--color-brand-900` (UdeA green by default). Another brand overrides those variables after importing the theme:

```css
@theme {
  --color-brand-600: #16a34a;
}
```

Dark mode follows the `dark` class on `<html>`.

## Dates

`DatePicker` and `DateRangePicker` take and emit ISO dates (`YYYY-MM-DD`, or `""` when empty), the same strings the apps keep in the URL and send to the API, and show them as `dd/mm/aaaa`:

```tsx
<DateRangePicker
  aria-label="Fechas de la comisión"
  placeholder="Fechas de la comisión"
  from={filters.from}
  to={filters.to}
  onChange={({ from, to }) => setFilters({ ...filters, from, to })}
/>
```

## Documents

`DocumentViewer` shows PDF, Word `.docx` and image files inside a modal and offers the download for anything else. `pdfjs-dist` and `docx-preview` load with a dynamic `import()` the first time a document opens, so apps that never open one do not ship them in their main bundle. The PDF worker runs in the page, which needs no bundler setup in the consuming app.

## What is inside

| Group | Components |
| --- | --- |
| Atoms | Button, StatusBadge, PingDot, Avatar, CodePill, Chip, Label, Spinner, Tooltip, Input, Textarea, Checkbox, SegmentedToggle, AnimatedCount, Card, CountryFlag, SearchableSelect, SearchableMultiSelect |
| Molecules | FormField, Select, DatePicker, DateRangePicker, Modal, Toast, Toaster and `toast`, EmptyState, Pagination, SummaryCard, CollapsiblePanel, Dropdown, DropdownAcademicUnit, MultiSelectChips, PhoneInput, SelectionSummaryCard, TableSkeleton |
| Tiles | NavTile, HeroNavTile, StatusTile |
| Process | Stepper, Timeline, TimelineItem, FileDrop, FileItem |
| Records | RecordCard, RecordRow |
| Tables | Table, DataTable and table cell components |
| Organisms | TopBar, UserMenu, PageHeader, Footer, AppShell, EntityPickerModal, DocumentViewer |

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

`main` is the only branch.

1. Raise `version` in `package.json` together with the change.
2. When the pull request is merged, the `Release` workflow checks whether that version is already on npm. If it is not, it waits in the `npm` environment, which only accepts `main`, until one of its reviewers approves it on GitHub.
3. Once approved, it runs the checks, publishes the version on npm through trusted publishing, with provenance, and creates the GitHub release `v<version>`.

A merge that does not raise `version` publishes nothing.
