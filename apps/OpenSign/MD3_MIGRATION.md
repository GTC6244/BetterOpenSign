# OpenSign → Material Design 3 Migration Playbook

We are replacing the DaisyUI / Tailwind component layer with **Material UI v7**
themed as **Material Design 3 (Material You)**. Replace DaisyUI as you go.

## Foundation (already in place — do NOT recreate)

- `src/theme/md3Theme.js` — `createMd3Theme(mode)` returns the MD3 MUI theme.
- `src/theme/ThemeModeProvider.jsx` — wraps the app in `ThemeProvider` +
  `CssBaseline`, exposes `useThemeMode()` (`{ mode, isDark, toggleMode, setMode }`),
  and keeps the legacy `data-theme` attribute in sync for not-yet-migrated code.
- Reference examples already migrated: `src/primitives/Loader.jsx`,
  `Alert.jsx`, `Tooltip.jsx`, `ModalUi.jsx`, `LoaderWithMsg.jsx`,
  `CheckCircle.jsx`, `SessionExpiredModal.jsx`, `src/components/ThemeToggle.jsx`.

## Rules

1. **Preserve each component's public API** (props, exports, behavior). Callers
   must not need changes. `ModalUi` still accepts the same props, etc.
2. **Do not touch business logic** — only the presentation layer (JSX markup,
   classNames, inline styles). Keep all hooks, handlers, Parse/redux calls,
   i18n `t()` usage, refs, and effects exactly as-is.
3. Replace DaisyUI/Tailwind markup with MUI components. Remove the `op-*`
   DaisyUI classes you replace. You may keep plain layout utility classes if
   converting them is risky, but prefer MUI `sx`/`Box`.
4. **Do not** edit anything under `src/components/emailbuilder/` or
   `src/pages/EmailBuilder.tsx` (already MUI).
5. Keep imports minimal: `import Button from "@mui/material/Button"` style
   (path imports) to keep bundles lean.
6. Use theme colors, never hard-coded hex: `color="primary"`, `sx={{ color:
   "text.secondary", bgcolor: "surface.container" }}`. Custom MD3 roles
   available: `primary/secondary/tertiary/error/warning/info/success` each with
   `.container`/`.onContainer`; `surface.{main,variant,container,containerLow,
   containerHigh,containerHighest,onMain,onVariant}`; `outline.{main,variant}`.

## DaisyUI → MUI mapping

| DaisyUI | MUI (MD3) |
|---|---|
| `op-btn` / `op-btn-primary` | `<Button variant="contained">` |
| `op-btn-outline` / `op-btn-ghost` | `<Button variant="outlined">` / `variant="text"` |
| `op-btn-neutral` | `<Button variant="contained" color="inherit">` or `color="secondary"` |
| `op-btn-sm` / `op-btn-circle` | `size="small"` / `<IconButton>` |
| `op-input` / `op-textarea` | `<TextField>` (size="small") |
| `op-select` | `<TextField select>` or `<Select>` |
| `op-checkbox` | `<Checkbox>` (+ `<FormControlLabel>`) |
| `op-toggle` | `<Switch>` |
| `op-radio` | `<Radio>` / `<RadioGroup>` |
| `op-modal` / `op-modal-box` | `<Dialog>` (or reuse `ModalUi`) |
| `op-table` | `<Table>`/`<TableHead>`/`<TableRow>`/`<TableCell>` |
| `op-tabs` / `op-tab` | `<Tabs>` / `<Tab>` |
| `op-card` | `<Card>` / `<CardContent>` |
| `op-badge` | `<Chip size="small">` |
| `op-menu` / `op-dropdown` | `<Menu>` / `<MenuItem>` |
| `op-alert-*` | `<Alert severity="…">` (reuse `primitives/Alert`) |
| `op-loading` | `<CircularProgress>` (reuse `primitives/Loader`) |
| `op-tooltip` | `<Tooltip>` |
| `op-link` | `<Link>` |
| `op-divider` | `<Divider>` |
| layout `flex`,`grid`,`gap-*` | `<Box sx={{ display:'flex', gap:1 }}>` or `<Stack>` |

## Severity / color mapping

`danger` → `error`. DaisyUI `primary`/`secondary`/`accent` map to MD3
`primary`/`secondary`/`secondary` (accent is the brand red = `secondary`).

## When done with your files

- Do NOT run `vite build` (the coordinator runs the central build).
- Report: which files changed, any component whose markup was too risky to fully
  convert (left partially on DaisyUI), and any new cross-file concerns.
