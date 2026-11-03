# SpinDesk — Color System

Design a modern, premium sports-tech interface for a table tennis tournament management platform.

The color palette should feel energetic, competitive, professional, and easy on the eyes during long tournament sessions.

## 1. Primary Colors

- **Primary Green:** `#14532D`
  Use for primary branding, active navigation, primary buttons, and important interface elements.

- **Accent Lime:** `#84CC16`
  Use sparingly for highlights, active indicators, progress elements, and positive actions.

- **Action Orange:** `#F97316`
  Use for live match indicators, urgent actions, attention states, and important competitive highlights.

## 2. Background Colors

- **Main Background:** `#F8FAFC`
  The default application background.

- **Card Background:** `#FFFFFF`
  Use for dashboard cards, tables, forms, dialogs, and panels.

- **Secondary Background:** `#F1F5F9`
  Use for secondary sections, table headers, inactive tabs, and subtle content grouping.

- **Sidebar Background:** `#14532D`
  Use a deep green sidebar to establish a recognizable brand identity.

- **Hover Background:** `#ECFDF5`
  Use for subtle green hover states and selected list items.

## 3. Typography Colors

- **Primary Text:** `#0F172A`
  Page titles, headings, player names, scores, and important information.

- **Secondary Text:** `#475569`
  Descriptions, supporting information, and secondary labels.

- **Muted Text:** `#64748B`
  Timestamps, metadata, placeholders, and less prominent labels.

- **Text on Dark Background:** `#FFFFFF`
  Text and icons displayed on dark green surfaces.

## 4. Match Status Colors

Use distinct colors and readable labels to communicate tournament states.

- **Live / In Progress:** `#F97316`
- **Completed / Winner:** `#16A34A`
- **Scheduled:** `#2563EB`
- **Paused:** `#D97706`
- **Delayed / Needs Attention:** `#DC2626`
- **Available Table:** `#16A34A`
- **Occupied Table:** `#F97316`
- **Reserved Table:** `#2563EB`

Use subtle tinted backgrounds for status badges rather than filling large interface areas with saturated colors.

Suggested badge backgrounds:
- Green: `#DCFCE7`
- Orange: `#FFEDD5`
- Blue: `#DBEAFE`
- Red: `#FEE2E2`
- Amber: `#FEF3C7`
- Neutral: `#F1F5F9`

## 5. Borders and Dividers

- **Default Border:** `#E2E8F0`
- **Strong Border:** `#CBD5E1`
- **Selected Border:** `#16A34A`
- **Focus Ring:** `#86EFAC`

Keep borders subtle and consistent throughout the application.

## 6. Buttons

### Primary Button
- Background: `#14532D`
- Text: `#FFFFFF`
- Hover: `#166534`

Use for actions such as Create Tournament, Save Changes, and Confirm Result.

### Secondary Button
- Background: `#FFFFFF`
- Text: `#14532D`
- Border: `#CBD5E1`
- Hover: `#F1F5F9`

Use for secondary actions such as Cancel, View Details, and Edit.

### Accent Button
- Background: `#F97316`
- Text: `#FFFFFF`
- Hover: `#EA580C`

Reserve for contextually important actions such as starting a live match.

### Destructive Button
- Background: `#DC2626`
- Text: `#FFFFFF`
- Hover: `#B91C1C`

Use for destructive actions and make sure they require confirmation when appropriate.

## 7. Live Match Score Interface

The live scoring interface should prioritize readability over decoration.

- Main surface: `#FFFFFF`
- Main score text: `#0F172A`
- Active player highlight: `#14532D`
- Live indicator: `#F97316`
- Positive result: `#16A34A`
- Divider: `#E2E8F0`

Make current game scores significantly larger than player metadata.

Highlight the leading player subtly without making the score difficult to read.

Do not rely on color alone to distinguish the leading player; also use labels, typography, or other visual indicators.

## 8. Tournament Bracket Colors

- Default Match Card: `#FFFFFF`
- Match Card Border: `#E2E8F0`
- Completed Match: `#F8FAFC`
- Winner Highlight: `#DCFCE7`
- Live Match Border: `#F97316`
- Upcoming Match: `#FFFFFF`
- Bracket Connector Lines: `#CBD5E1`
- Champion Highlight: `#14532D`

The bracket should remain visually clean, with clear player progression and easily readable scores.

## 9. Design Rules

1. Use deep green as the primary brand color.
2. Use orange primarily for live matches and important attention states.
3. Use lime green sparingly as a decorative or progress accent.
4. Keep most content surfaces white or very light gray.
5. Maintain strong text contrast and accessible color combinations.
6. Avoid excessive gradients, neon effects, and highly saturated backgrounds.
7. Apply colors consistently across all screens and reusable components.
8. Keep status colors consistent throughout the dashboard, match center, bracket, and table management screens.
9. Never communicate status through color alone.
10. Support both light and dark text surfaces where appropriate, but prioritize the light theme for the initial design.

## Desired Result

Create a polished, consistent visual identity that combines the professionalism of a modern SaaS dashboard with the energy of a competitive table tennis tournament.

The interface should feel distinctive without being visually overwhelming.