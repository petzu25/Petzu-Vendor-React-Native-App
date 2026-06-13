# Design System: Petzu React Native Vendor App

## 1. Visual Theme & Atmosphere
A highly polished, balanced, and modern mobile interface designed to feel both approachable (pet-focused) and deeply professional (vendor/admin tools). The atmosphere relies on "Art Gallery Airy" spacing with confident, generous border radii and tactile micro-interactions. The design rejects flat, uninspired screens in favor of distinct, elevated cards, clear typographic hierarchy, and a singular vibrant accent color to guide the user's focus.

## 2. Color Palette & Roles
- **Canvas Backdrop** (#f8fafc) — Primary background for screens, providing a cool, airy foundation.
- **Pure Surface** (#ffffff) — Foreground cards, modals, and isolated containers.
- **Deep Ink** (#0f172a) — Primary text (headlines, critical data).
- **Slate Ash** (#64748b) — Secondary text, descriptions, and placeholder values.
- **Whisper Border** (#f1f5f9) — Subtle 1px structural lines for cards and dividers.
- **Vibrant Violet Accent** (#7c3aed) — Singular primary accent for active states, primary buttons, and focus rings. (No neon gradients, no over-saturation).
- **Emerald Success** (#10b981) — Semantic color for approved/verified states.
- **Rose Error** (#f43f5e) — Semantic color for destructive actions or rejection.

## 3. Typography Rules
- **Display/Headlines:** System Font (San Francisco/Roboto) — Heavy weight (700-900), tight tracking. Hierarchy is driven by deep contrast against the Canvas Backdrop.
- **Body:** System Font — Relaxed leading, Medium weight (500) for standard text.
- **Banned:** Generic serif fonts. No purely black (#000000) text anywhere.

## 4. Component Stylings
- **Buttons:** Tactile, deeply rounded (`borderRadius: 16px`). Primary buttons use the Violet Accent with a subtle shadow. No custom outer glows. Active state (press) must have a slight opacity/scale reduction.
- **Cards:** Very generously rounded corners (`borderRadius: 24px`). Diffused, elegant shadow (low opacity, wide radius). Cards never touch the edge of the screen; they always maintain a `16px` to `24px` margin.
- **Inputs:** Label above the input field. The input field has a substantial height (`52px`), a solid whisper border, and a subtle background (`#ffffff` or `#f8fafc`).
- **Lists/Grids:** No dense 3-column equal grids. Use spacious, vertical single-column cards with asymmetric interior layouts (e.g., Avatar on the left, data on the right).

## 5. Layout Principles
- **No Overlapping:** Every element must occupy its own clean spatial zone. 
- **Containment:** Use SafeAreaViews. All scrollable content must have ample bottom padding (`40px+`) so content doesn't abruptly cut off.
- **Negative Space:** Use negative space to group elements logically rather than drawing boxes around everything.

## 6. Motion & Interaction
- **Tactile Feedback:** Use `TouchableOpacity` with an active opacity of `0.8` or `0.85` to give a premium, weighty feel.
- **Modal Animations:** Use native slide or fade animations. Ensure modal backdrops are dark and blur the background slightly if possible.

## 7. Anti-Patterns (Banned)
- No emojis anywhere.
- No pure black (`#000000`).
- No neon/outer glow shadows.
- No generic, tightly-packed data tables on mobile.
- No AI copywriting clichés ("Elevate", "Seamless").
- No fabricated placeholder data.
