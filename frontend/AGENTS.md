# AGENTS.md - Frontend & Design System Instructions

## Frontend Stack
* The recommended frontend stack is Vite plus React plus Tailwind CSS paired with Recharts or Chart.js.

## Design System: Technical Minimalism
* The user interface prioritizes strict operational predictability, utilizing high contrast values, clear table layouts, and mathematical clarity.
* Canvas Background: Strictly use `#000000` (Pure Black).
* Primary Typography: Strictly use `#FFFFFF` (Pure White) and a Monospace family such as 'JetBrains Mono' or 'SF Mono'.
* Secondary Content: Use `#888888` or `#A0A0A0` (Terminal Gray).
* Layout Structural Bounds: Use a `1px solid #1C1C1C` border for subtle dark gray divider grids.
* High Visibility Accent: Use `#C5FF00` (High-contrast Chartreuse / Lime Green).
* Border Radius Deflection: Absolutely enforce `border-radius: 0px !important;` for strict 90-degree angular intersections across all components.

## Layout & Components
* The dashboard interface is split structurally into a Global Control Sidebar, a Metrics Header Dashboard Row, and a Primary Analytical Visualization Canvas.
* Status Badges: Do not use background fills; render using a transparent container with a sharp 1px solid `#C5FF00` outline housing uppercase text.
* Action Buttons: Style with a solid `#FFFFFF` block fill and bold `#000000` text.
* Hover States: Button transformations must switch instantly without animation properties to a `#C5FF00` block fill or outline.
* Input Fields: Maintain an absolute black background bound by a sharp gray border, with placeholders rendering in `#888888`.

## Data Visualization (Charts) Rules
* Grid Layout Lines: Enable Cartesian grids with a color setting of `#1C1C1C` and a solid stroke-dasharray configuration.
* Interpolation Curve: Line charts must explicitly lock interpolation to linear or step.
* Curved Lines: Bezier curve approximations are strictly prohibited.
* Chart Styling: Avoid gradients, drop shadows, or background area fills beneath line strokes.
* Donut Geometry: Use a narrow inner radius gap and cycle through clean, high-contrast values (`#FFFFFF`, `#C5FF00`, `#888888`, `#A0A0A0`, and `#1C1C1C`).

## Node package management
* Always use pnpm to manage node packages.
* Install packages with `pnpm install <package-name>`.
* Update packages with `pnpm update <package-name>`.
* Remove packages with `pnpm remove <package-name>`.
* List installed packages with `pnpm list`.
* Search for packages with `pnpm search <package-name>`.
* Show package details with `pnpm info <package-name>`.
* Show package versions with `pnpm ls <package-name>`.
* Show package dependencies with `pnpm ls <package-name> --depth=0`.