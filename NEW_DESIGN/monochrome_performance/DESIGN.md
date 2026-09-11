---
name: Monochrome Performance
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#4c4546'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e3e2e2'
  on-secondary-container: '#646464'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1b1b'
  on-tertiary-container: '#848484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e3e2e2'
  secondary-fixed-dim: '#c7c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-caps:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-data:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-margin: 24px
  gutter: 16px
---

## Brand & Style

The design system is rooted in a **High-Contrast Minimalism** aesthetic, blending the utility of high-end developer tools with the editorial elegance of premium wellness journals. It targets a disciplined audience that values clarity, efficiency, and focus over gamification or visual noise.

The UI is strictly monochrome, emphasizing content through negative space and typographic scale rather than color. It should evoke a sense of calm, precision, and intentionality. The visual language is "Binary Luxury"—everything is either essential (Black/White) or secondary (Soft Grays). Elements follow a strict 1px boundary logic, creating a structured, grid-based environment that feels both technical and sophisticated.

## Colors

This design system employs a strictly non-chromatic palette to ensure the user’s data (nutrition facts, workout metrics) remains the sole focus.

- **Primary:** Pure Black (#000000) for primary actions, headings, and high-emphasis icons.
- **Secondary:** Medium Gray (#737373) for supporting metadata and inactive states.
- **Surface:** Pure White (#FFFFFF) for all primary containers and background layers.
- **Stroke/Divider:** Light Gray (#E5E5E5) for all structural borders and 1px lines.
- **Subtle Surface:** Off-white (#F5F5F5) used sparingly for secondary backgrounds or input fields to distinguish them from the main canvas.

There are no semantic colors (red/green/yellow) for status updates. Use symbols, line weights, or typography to indicate "positive" or "negative" trends.

## Typography

The typography leverages **Geist** for its technical, mono-spaced influence in headings and data, paired with **Inter** for legible, neutral body copy. 

- **Headings:** Use Geist with tight letter-spacing for a sophisticated, "Pro" feel. High contrast in scale is preferred over font-weight variation.
- **Data Points:** Numbers, metrics, and timestamps should utilize Geist's systematic spacing to reflect accuracy.
- **Labels:** Small caps with slight letter-spacing should be used for category headers or secondary labels to provide an editorial feel.
- **Scaling:** On mobile, display headings should shrink to 24-28px to ensure they remain on a single line where possible.

## Layout & Spacing

This design system uses a strict **8px linear grid**. All spacing increments must be multiples of 8 (4px is allowed only for micro-adjustments within components).

- **Layout Model:** Use a 12-column grid for desktop and a 4-column grid for mobile.
- **Margins:** Generous side margins (min 24px) create a focused "column" of content in the center of the screen, mimicking an editorial layout.
- **Vertical Rhythm:** Large vertical gaps (40px+) should be used to separate distinct content sections (e.g., separating "Daily Activity" from "Logged Meals") to avoid visual clutter.

## Elevation & Depth

Depth is conveyed through **1px borders** and **Tonal Layering** rather than shadows. 

- **Borders:** Every primary container or card is defined by a 1px #E5E5E5 border. 
- **Z-Axis:** To indicate an element is "above" another (like a modal or a floating action button), use a solid black 1px border with a slightly higher contrast background (#FFFFFF) or a very subtle, sharp 2px "block shadow" (0px offset, 0px blur, 100% opacity black) if a brutalist accent is needed.
- **Interactions:** Hover states and active states should be indicated by inverted colors (Black background with White text) or a fill change from White to #F5F5F5.

## Shapes

The shape language is controlled and modern.
- **Base Components:** 8px (`rounded-md`) for standard cards and buttons.
- **Large Sections:** 16px (`rounded-lg`) for major container blocks.
- **Strictness:** Do not use full pills for buttons; maintain the 8px radius to keep the "structured" architectural feel. 
- **Icons:** Use 1.5px or 2px stroke weights. Icons should be geometric and avoid overly organic curves.

## Components

- **Buttons:** 
  - *Primary:* Solid Black background, White Geist Medium text. 8px radius.
  - *Secondary:* 1px #E5E5E5 border, White background, Black text.
- **Inputs:** 1px #E5E5E5 border, 8px radius. On focus, the border becomes 1px #000000. Use Geist Mono for numerical input.
- **Cards:** White background, 1px #E5E5E5 border. No shadow. Title in Geist 16px SemiBold.
- **Chips:** 1px #E5E5E5 border, 4px radius (sharper than buttons). Used for workout tags or macro categories.
- **Charts:** 
  - *Lines:* 2px Black line.
  - *Grid:* 1px #F5F5F5 horizontal lines. 
  - *Points:* 4px solid Black circles.
- **Lists:** Items separated by 1px #E5E5E5 dividers. No side borders for list items when they span the full width of a container.
- **Progress Bars:** Thin 4px track in #F5F5F5, with a solid #000000 fill.