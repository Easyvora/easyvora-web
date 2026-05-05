# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EasyVora — an interactive landing page for an AI automation services company targeting Spanish-speaking enterprises. The project is pure HTML/CSS/JavaScript with no build system, no framework, and no external JS libraries.

## Development

No build step. Open files directly in a browser or use any static file server:

```bash
# Simple local server options
python -m http.server 8080
# or
npx serve .
```

No tests, no linting tools configured.

## File Structure

- **[index.html](index.html)** — Main landing page (~896 lines). All CSS (~300 lines inline), HTML, and JavaScript are in this single file.
- **[esfera_nebulosa_espacial.html](esfera_nebulosa_espacial.html)** — Standalone 3D nebula/sphere canvas visualization (248 lines), developed separately and shares particle physics patterns with the main page.
- **Logo.png** — Brand logo.

## Architecture: index.html

The file is organized in three main blocks:

### CSS (lines 21–308)
Custom CSS variables define the dark theme palette:
- `--primary`: `#2563EB` (blue)
- `--accent`: `#60A5FA` (sky blue)  
- `--bg-primary`: `#04091A` (navy)

Responsive breakpoints: 1024px, 768px, 480px (desktop-first approach).

### HTML (lines 310–560)
Single-page layout with these sections in order: splash screen → nav → hero → services → process → chatbot demo → why → contact → footer.

### JavaScript (lines 570–893)
All JS is inline at the bottom. Key systems:

- **Splash screen** — 2.7s fade-out on load
- **Custom cursor** — Dot + ring with lerp smoothing tracking mouse position
- **3D neural-canvas** — 1,800 particles with perspective projection, depth sorting, and mouse repulsion physics using `requestAnimationFrame`
- **Typewriter effect** — Rotates through 4 hero messages (line ~726)
- **Animated counters** — Cubic easing for hero stats (40h / 3x / 60%)
- **Modal system** — `MODALS` object (line ~804) keyed by service ID, each with title/description/features array
- **Card tilt** — 3D perspective transform on `mousemove`
- **Magnetic buttons** — DOM offset-based attraction on hover
- **Fade-in animations** — Intersection Observer triggers CSS class additions
- **Contact form** — Constructs a `mailto:info@easyvoraproyect.com` URI with encoded subject/body; no backend

## Key Patterns

- All animation uses `requestAnimationFrame` or CSS keyframes — no animation libraries.
- The particle sphere in `index.html` and the nebula in `esfera_nebulosa_espacial.html` share the same projection math (perspective divide, depth sort) but are independent implementations.
- Modal content is defined entirely in JavaScript (`MODALS` object), not in HTML — add new services there, not in the DOM.
- Form submission is client-side only via `mailto:` — no server, no API calls anywhere in the project.
