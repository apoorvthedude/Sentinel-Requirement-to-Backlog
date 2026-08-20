# Handoff: Sentinel Requirement-to-Backlog UI

## Overview
UI for the Sentinel pipeline: a user writes a plain-language requirement, AI analyzes it against the backlog, drafts a Jira Story or Epic+Stories, and the user approves before anything is created in Jira. Also includes a Dashboard/home, History, and Settings screen.

## About the Design Files
The bundled file (`Sentinel.dc.html`) is a **design reference built in HTML** — a clickable prototype showing layout, states, and copy. It is not production code. Recreate it in the existing `frontend/` app (React + TypeScript + React Router, per `frontend/src/pages/` and `frontend/src/components/` conventions already in the repo) rather than copying the HTML/inline styles directly.

## Fidelity
**High-fidelity.** Colors, spacing, and typography below are final; implement pixel-close using the codebase's existing component/styling conventions (each component gets its own folder with `Component.tsx` + `.css` + `index.ts`, per `frontend/src/components/`).

## Screens

### 1. Dashboard (landing view)
- Header row: "Welcome back, Amit" (h1, 24px/700) + subtitle (14px, `#64748b`), right-aligned primary button "New Requirement".
- Stat cards: 4-column grid, `gap:16px`. Each card: white bg, `1px solid rgba(15,23,42,.08)` border, `10px` radius, `18px` padding. Label (12px/600, `#64748b`), value (26px/700), delta line (12px, color varies: green `#16a34a` positive, amber `#b45309` warning, slate `#64748b` neutral).
  - Cards: Requirements processed, Approval rate, Tickets created this week, Duplicate/overlap catches.
- Recent activity: white card, list of rows separated by `1px solid rgba(15,23,42,.05)`, each row: activity text (13.5px, `#1e293b`) left, relative time (12px, `#94a3b8`) right.

### 2. Requirement (wizard step 1)
- Title "Describe the requirement" (24px/700) + subtitle (14px, `#64748b`).
- Card (white, bordered, `10px` radius, `24px` padding): label "Requirement text" (12.5px/600, `#475569`), textarea (min-height 170px, `8px` radius border), footer row: helper text left ("Step 1 of 4 — nothing is sent to Jira yet"), primary button "AI Analyze" right (disabled state: `#c7d2fe` bg until text entered).

### 3. AI Analyze (wizard step 2)
- Loading state: centered card, 3 pulsing dots (`#4f46e5`, staggered `animation-delay`), "Analyzing your requirement…" text.
- Result state: two-column grid (`1fr 1.4fr`).
  - Left: "ORIGINAL REQUIREMENT" label + original text, plain white card.
  - Right: AI response card, tinted bg `#f8f7ff`, border `#e4e0fb`. Header row: small rotated-square accent mark + "AI RESPONSE" label (`#4f46e5`) + latency/token pill badges. Title (16.5px/700), scope paragraph, a suggested-story sub-card, and a "SIMILAR TICKETS FOUND" list — each row shows ticket id/title/status plus a match-% pill (amber `#fffbeb`/`#b45309`).
  - Footer buttons: secondary "Start Over", primary "Continue to Jira Draft".

### 4. Jira Draft (wizard step 3)
- Two-column grid (`1.6fr 1fr`).
- Left card: issue-type pill selector (Story / Task / Epic — selected state: `#eef2ff` bg, `#4f46e5` text/border), Title input, Description textarea.
  - If type = **Story/Task**: "Acceptance criteria" — editable list of text rows with remove (×) and "+ Add criterion".
  - If type = **Epic**: "Stories in this epic" — list of bordered story cards, each with its own title input, short description textarea, and inline story-points + priority selects; "+ Add story" appends a new blank one.
- Right column: sidebar card (story points, priority, assignee, sprint selects; label chips) + amber "Possible duplicate" card with radio choice between "Create as new" vs "Update existing ticket PROJ-482".
- Footer: "Back" / "Continue to Approve".

### 5. Approve (wizard step 4)
- Pre-create: summary card of the draft (issue-type badge, project, title, description, 2×2 meta grid: priority/points/assignee/sprint). Buttons: "Edit draft" (secondary), "Create in Jira" (primary).
- Post-create: centered success card — green circular checkmark (`#f0fdf4` bg / `#16a34a` icon), "Story created in Jira", ticket id + title, "Open in Jira" + "New requirement" buttons.

### 6. History
- Table-style list: header row (REQUIREMENT / STATUS / TICKET / DATE, 11.5px/700 `#94a3b8`), rows with status pill (green=Created, amber=Pending Approval, slate=Draft).

### 7. Settings
- "Jira connection" card: connected-status pill, read-only site URL + project key fields, "Reconnect" button.
- "Defaults" card: default issue-type select.

## Interactions & Behavior
- Top nav (Dashboard / New Requirement / History / Settings) is a segmented pill control; active tab gets white bg + indigo text.
- Wizard stepper (Requirement → AI Analyze → Jira Draft → Approve): completed step = green filled circle with check, current = indigo filled circle, upcoming = outline circle; connecting line turns green once passed.
- "AI Analyze" transitions to a ~1.8s loading state, then reveals the analysis (mocked timer in the prototype — replace with the real Analyzer API call and its actual latency).
- Acceptance-criteria rows and child-story cards support add/remove; all draft fields are fully editable, nothing is sent to Jira until "Create in Jira" is clicked.
- Epic vs Story: the prototype's issue-type pill is a manual toggle standing in for the backend's AI classification — wire it to whatever field the Analyzer/SRS Generator returns.

## Design Tokens
- **Colors**: bg `#f4f5f7`, card white `#fff`, border `rgba(15,23,42,.08)` (light) / `.12` (inputs), text primary `#0f1720`, text secondary `#64748b` / `#475569` / `#94a3b8`, accent indigo `#4f46e5` (hover `#4338ca` not yet used but reserve it), success green `#16a34a` / bg `#f0fdf4`, amber `#b45309` / bg `#fffbeb`, tinted AI card bg `#f8f7ff` / border `#e4e0fb`.
- **Typography**: system font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`). Sizes: 24px/700 page titles, 17px/700 card titles, 14–14.5px body, 13–13.5px buttons, 11–12.5px labels/meta.
- **Radius**: 6–8px buttons/inputs, 10px cards, 20px pill badges.
- **Shadow**: cards use a very subtle `0 1px 2px rgba(15,23,42,.04)` or none.
- **Spacing**: page padding `40px 28px`, card padding `20–24px`, form field gaps `14–18px`.

## Assets
No external images/icons — all marks are simple CSS shapes (dots, rotated squares) or unicode glyphs (✓, ×). No brand assets used.

## Files
- `Sentinel.dc.html` — full interactive prototype (all 7 screens, click-through).
