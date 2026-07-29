# Nordic Glass-Cut Sharp Edge Design System Specification

A comprehensive design guideline and CSS implementation spec to replicate the **Nordic Glass-Cut Sharp Edge** aesthetic across any web application or website.

---

## 1. Design Philosophy

- **Geometric Precision**: Elimination of rounded pill shapes (`border-radius: 2px` across all containers, inputs, cards, and buttons).
- **Hairline Elegance**: Ultra-thin 1px crisp borders (`#D4D4D8` / `#27272A`) replacing heavy drop shadows.
- **Monochrome Inversion**: Eye-friendly off-black & off-white active/selected states (`#18181B` text on white surface inverted to `#18181B` background with `#FAFAFA` text for reduced visual fatigue).
- **Micro-Grid Spacing**: Tight typography tracking (`letter-spacing: -0.015em` to `-0.03em`), uppercase micro-labels (`10px`–`11px`, `letter-spacing: 0.18em`).

---

## 2. Design Tokens (CSS Variables)

Copy and paste these CSS variables into your root stylesheet:

```css
:root {
  /* Surface & Background */
  --nordic-bg: #FAFAFA;
  --nordic-surface: #FFFFFF;
  --nordic-surface-subtle: #F4F4F5;
  --nordic-border: #D4D4D8;
  --nordic-border-strong: #18181B;

  /* Typography */
  --text-primary: #18181B;
  --text-secondary: #3F3F46;
  --text-muted: #71717A;

  /* Accent & Active Inversion */
  --accent-color: #18181B;
  --accent-surface: #18181B;
  --accent-text: #FAFAFA;

  /* Sharp Edge Radii (Strict 2px Rules) */
  --card-radius: 2px;
  --cell-radius: 2px;
  --pill-radius: 2px;

  /* Status Dots */
  --status-available: #10B981;
  --status-negotiate: #F59E0B;
  --status-unavailable: #EF4444;

  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Dark Mode Overrides */
@media (prefers-color-scheme: dark) {
  :root {
    --nordic-bg: #09090B;
    --nordic-surface: #121215;
    --nordic-surface-subtle: #18181B;
    --nordic-border: #27272A;
    --nordic-border-strong: #E4E4E7;

    --text-primary: #E4E4E7;
    --text-secondary: #A1A1AA;
    --text-muted: #71717A;

    --accent-color: #E4E4E7;
    --accent-surface: #E4E4E7;
    --accent-text: #18181B;
  }
}
```

---

## 3. Core Component Guidelines

### A. Cards & Containers
- Use `background: var(--nordic-surface)`, `border: 1px solid var(--nordic-border)`, and `border-radius: var(--card-radius)`.
- Avoid heavy drop shadows. Rely on crisp 1px borders and subtle elevation `box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04)`.

```css
.sharp-card {
  background: var(--nordic-surface);
  border: 1px solid var(--nordic-border);
  border-radius: var(--card-radius);
  padding: 32px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04);
}
```

### B. Micro Tags & Labels
- Section labels, status tags, and brand logos must be **uppercase**, **small (`10px`–`11px`)**, with **wide tracking (`0.16em`–`0.18em`)** and a small square or dot indicator.

```css
.sharp-tag {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--text-primary);
  background: var(--nordic-surface-subtle);
  padding: 5px 12px;
  border-radius: var(--pill-radius);
  border: 1px solid var(--nordic-border);
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.sharp-tag::before {
  content: '';
  width: 4px;
  height: 4px;
  background-color: var(--accent-surface);
}
```

### C. Buttons & Controls
- Primary actions use solid monochrome inversion (`background: var(--accent-surface)`, `color: var(--accent-text)`).
- Secondary/Icon actions use a 1px border outline with clean background transition on hover.

```css
/* Primary Button */
.btn-sharp-primary {
  background: var(--accent-surface);
  color: var(--accent-text);
  border: 1px solid var(--accent-surface);
  border-radius: var(--pill-radius);
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.12s ease;
}

.btn-sharp-primary:hover {
  opacity: 0.9;
}

/* Secondary Button */
.btn-sharp-outline {
  background: var(--nordic-surface);
  color: var(--text-primary);
  border: 1px solid var(--nordic-border);
  border-radius: var(--pill-radius);
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;
}

.btn-sharp-outline:hover {
  background: var(--nordic-surface-subtle);
  border-color: var(--nordic-border-strong);
}
```

### D. Inputs & Form Elements
- Inputs feature `2px` corners, hairline borders, and a sharp outline focus ring.

```css
.input-sharp {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--nordic-border);
  border-radius: var(--cell-radius);
  background: var(--nordic-surface);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.12s ease;
}

.input-sharp:focus {
  border-color: var(--nordic-border-strong);
  box-shadow: 0 0 0 1px var(--nordic-border-strong);
}
```

### E. Grid Items & Active States
- Grid cells (such as calendar days, table cells, or option selectors) must use sharp `2px` corners.
- Hover state: Slight background tint (`var(--nordic-surface-subtle)`) and strong border line (`var(--nordic-border-strong)`).
- Selected state: Pure inverted block (`background: var(--accent-surface)`, `color: var(--accent-text)`).

```css
.grid-item-sharp {
  border-radius: var(--cell-radius);
  border: 1px solid transparent;
  transition: all 0.12s ease;
}

.grid-item-sharp:hover {
  background: var(--nordic-surface-subtle);
  border-color: var(--nordic-border-strong);
}

.grid-item-sharp.selected {
  background-color: var(--accent-surface) !important;
  color: var(--accent-text) !important;
  border-color: var(--accent-surface) !important;
}
```

---

## 4. Typography Rules

| Role | Font Size | Weight | Tracking (letter-spacing) | Transform |
| :--- | :--- | :--- | :--- | :--- |
| **Main Heading (H1)** | `28px`–`32px` | 600 (Semi-bold) | `-0.03em` | None |
| **Section Title (H2/H3)** | `15px`–`18px` | 600 (Semi-bold) | `-0.015em` | None |
| **Micro Tag / Label** | `10px`–`11px` | 700 (Bold) | `0.18em` | Uppercase |
| **Nav & Table Header** | `11px`–`12px` | 600 (Semi-bold) | `0.08em` | Uppercase |
| **Body Text** | `13.5px`–`14px`| 400~500 | `-0.015em` | None |

---

## 5. Summary Checklist for Implementation

- [ ] Import font: `Inter` or `DM Sans`.
- [ ] Set all `border-radius` variables to `2px` (Cards, Inputs, Buttons, Badges).
- [ ] Ensure all borders are `1px solid var(--nordic-border)`.
- [ ] Ensure selected/active elements use eye-friendly off-black (`#18181B`) / off-white (`#FAFAFA`) inverted styling.
- [ ] Use uppercase `0.18em` letter-spacing for micro tags and labels.
- [ ] Support Light Mode (`#FAFAFA` bg) and Dark Mode (`#09090B` bg).
