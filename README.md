# Task 3 — TaskFlow Landing Page + Interactive Task Manager (Three.js Background)

## Introduction
This project is **Task 3** of my **Elevvo Front-End Web Development Tasks** series.  
It’s a modern one-page marketing website for a fictional task app called **TaskFlow**. The site includes all essential landing-page sections (Hero, Features, Reviews, Pricing, CTA, Footer) and goes further by adding a **functional in-page Task Manager demo** with persistence.

To elevate the UI, the page also features a **custom Three.js shader background** (glassy metaball-style blobs) that reacts subtly to the user’s pointer movement.

## Key Features / Functions
### 1) Landing Page Sections (Marketing Layout)
- **Hero** with strong headline, call-to-actions, and product preview card.
- **Features** section laid out in a responsive grid.
- **Reviews/Testimonials** section using quote cards.
- **Pricing** section with a highlighted “Most popular” plan.
- **CTA** section encouraging users to try the demo.
- **Footer** with quick links + social icons and auto-updating year.

### 2) Responsive Navigation (Desktop + Mobile)
- Desktop navigation links for quick section jumps.
- Mobile burger menu:
  - Toggles open/close state.
  - Updates `aria-expanded` and `aria-hidden` for accessibility.
  - Auto-closes when a user clicks a nav link.

### 3) Scroll Reveal Animations
- Uses **IntersectionObserver** to animate sections into view smoothly (`.reveal → .in`).
- Respects performance by unobserving elements after they reveal.

### 4) Pricing Plan Selection (Demo)
- Clicking a pricing CTA sets a “Selected plan” badge in the Task Manager section.
- Persists the selected plan using **localStorage**.

### 5) Task Manager (Functional Demo App)
A fully working mini task app built in vanilla JavaScript:
- **Add tasks** with priority (Low / Medium / High).
- **Mark tasks as done** using checkboxes.
- **Edit tasks** (prompt-based title editing).
- **Delete tasks**.
- **Filters:** All / Open / Done.
- **Clear done** or **clear all** tasks.
- **Persistence:** tasks stored in **localStorage**.
- Includes seeded tasks on first run for a better first impression.

### 6) Three.js Shader Background (Interactive)
- Uses **Three.js** with an orthographic camera and a fullscreen plane.
- Custom **GLSL fragment shader** creates a “glass morphing blobs / metaball-like” look.
- Animated over time (`uTime`) and reacts to pointer movement (`uMouse`) for subtle parallax.
- Canvas stays behind all content and doesn’t block clicks.

## Tech Stack / Tools Used
- **HTML5** — semantic single-page layout
- **CSS3**
  - Responsive layout (grid, media queries)
  - Modern UI styling (glass panels, gradients, shadows)
  - Scroll reveal animation styles
- **JavaScript (Vanilla)**
  - DOM interactions + event handling
  - Task CRUD + filtering logic
  - localStorage persistence (tasks + selected plan)
  - IntersectionObserver for reveal-on-scroll
- **Three.js (module via CDN)**
  - WebGL renderer + shader materials
  - Custom GLSL shader for animated background effects

## How to Run Locally
1. Clone/download the repository.
2. Open `index.html` in a modern browser (internet required for the Three.js CDN import).
3. Scroll through sections and try the Task Manager demo.

## Notes
- This project is front-end only (no backend).
- The task manager is intentionally lightweight but demonstrates real CRUD + persistence.
- The shader background can be customized inside `app.js` by adjusting the GLSL uniforms and color palette.

---
✅ *Completed as part of the Elevvo internship front-end task set.*
