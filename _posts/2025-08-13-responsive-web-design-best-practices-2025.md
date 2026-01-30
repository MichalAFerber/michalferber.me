---
layout: post
date: 2025-08-13 00:00:00 +0000
title: "Responsive Web Design Best Practices in 2025"
subtitle: "Responsive design in 2025: content-based breakpoints, fluid layouts, optimized images (AVIF/WebP), SVG, and when to use a CDN versus self-hosting."
tags: [responsive, css, media-queries, images, performance, svg, bootstrap, tailwind]
comments: true
style: fill
color: primary
thumbnail-img: /assets/img/website-code.avif
---

![Website Code]({{ "/assets/img/website-code.avif" | relative_url | absolute_url }})

## Why “responsive” still matters (and what’s new)

In 2025, we still design **mobile-first**—but with better tools:

- **Logical CSS pixels** (ignore physical resolution/DPI; design to content).
- **Dynamic viewport units** (`dvh`, `svh`, `lvh`) fix mobile address-bar jumps.
- **Container queries** adapt components by their **own width**, not the window.
- **Modern image formats** (AVIF/WebP) and `image-set()` for responsive **background** images.

## Media queries: content-based breakpoints

Pick breakpoints where your **layout** needs them—not by device names.

```css
/* Mobile-first breakpoints */
@media (min-width: 600px)  { /* tablet */ }
@media (min-width: 900px)  { /* small laptop */ }
@media (min-width: 1200px) { /* desktop */ }
```

### Container queries (progressive enhancement)

```css
.card { container-type: inline-size; container-name: card; }

@container card (min-width: 28rem) {
  .card--media-right { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
}
```

**Tip:** Keep your **typography and spacing fluid** with `clamp()` and size components using `%`, `rem`, `vw`, `cqw` (container query units), not fixed `px`.

## Fluid layouts: Grid & Flex done right

- Use **CSS Grid** for page and card layouts; **Flexbox** for navs/rows.
- Constrain line length for readability (45–75ch).
- Set an explicit **content width** and center with:  
  `width: min(100% - 2rem, 68rem); margin-inline: auto;`

```css
img, video { max-width: 100%; height: auto; }     /* intrinsic sizing */
:root { --content: 68rem; }                        /* ~1088px */
.wrapper { width: min(100% - 2rem, var(--content)); margin-inline: auto; }
```

## Images: AVIF/WebP/JPG/PNG—what to use & how

**Use AVIF** when possible (best compression), **WebP** as a widely-supported modern default, **JPG** for photo fallback, **PNG** for transparency/UI art (only when SVG isn’t suitable).

### Responsive `<picture>` with `srcset` + `sizes`

```html
<picture>
  <source type="image/avif"
          srcset="/img/card-400.avif 400w, /img/card-800.avif 800w, /img/card-1200.avif 1200w">
  <source type="image/webp"
          srcset="/img/card-400.webp 400w, /img/card-800.webp 800w, /img/card-1200.webp 1200w">
  <img src="/img/card-800.jpg" alt="Responsive demo" width="800" height="533"
       sizes="(max-width:600px) 92vw, (max-width:1200px) 50vw, 600px"
       loading="lazy" decoding="async">
</picture>
```

### Best practice

- Include explicit `width`/`height` to avoid **CLS**.
- Use `loading="lazy"` for non-critical images; consider `fetchpriority="high"` for the LCP/hero image.
- Prefer **AVIF/WebP** for photos; use **SVG** or **lossless PNG** for pixel-perfect UI if vectors aren’t possible.

### Background images with `image-set()`

```css
.hero {
  min-height: 60vh;
  background: center/cover no-repeat image-set(
    url("/img/hero-m.webp") 1x, url("/img/hero-m@2x.webp") 2x
  );
}
@media (min-width: 48rem) {
  .hero { background: center/cover no-repeat image-set(
    url("/img/hero-d.webp") 1x, url("/img/hero-d@2x.webp") 2x
  );}
}
```

### Sizing guidance (backgrounds)

- **Mobile**: ~1200×800  
- **Desktop**: ~1920×1080 (2×: 3840×2160 if the image is your hero/LCP)  
- Keep files **as small as quality allows**; target **<300–500 KB** for hero.

## SVG: when, where, why

**Use SVG** for logos, icons, and diagrams:

- Infinite resolution; crisp on any DPI.
- Style with CSS via `fill`/`stroke` or inherit `currentColor`.
- Small transfer size for geometric art; gzips well.
- Accessible: add `<title>` and ARIA; inline when you need stateful styling.

**Do not** use SVG for photographs or complex textured art (raster is better).

### Sprite include + icon usage

```html
<!-- once per page (server/layout include), hidden off-layout -->
<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">
  <symbol id="icon-check" viewBox="0 0 24 24"><path d="M20.3 5.7a1 1 0 0 1 0 1.4l-10 10a1 1 0 0 1-1.4 0l-5-5a1 1 0 1 1 1.4-1.4L9.3 15l9.3-9.3Z"/></symbol>
</svg>

<button class="btn">
  <span class="icon" aria-hidden="true"><svg width="1em" height="1em"><use href="#icon-check"/></svg></span>
  Save
</button>
```

## Frameworks: Bootstrap, Tailwind, “no framework,” and size control

**Pick the tool that fits your team and UI**, then ship only what you use.

- **Bootstrap 5+** – Rapid scaffolding, utilities, components. Import **partial SCSS** only:

```scss
// app.scss
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/reboot";
@import "bootstrap/scss/buttons";
@import "bootstrap/scss/utilities";
```

- **Tailwind CSS** – Utility-first; excellent purging/JIT. Keep `content` paths tight to avoid bloat.

```js
// tailwind.config.js
module.exports = { content: ["./**/*.{html,md,js}"], theme:{}, plugins:[] }
```

- **Just CSS (Grid/Flex + utilities)** – For simple sites/components, native CSS is smallest and cleanest.

## CDN vs. self-hosting frameworks

| Choice | Use when | Pros | Cons |
| --- | --- | --- | --- |
| **CDN** | Prototypes, internal tools, quick spikes | Zero setup, edge-cached, simple version pinning + SRI | Third-party dependency, privacy/logging, cache partitioning weakens cross-site reuse |
| **Self-host** | Production sites/apps, compliance, perf budgets | Deterministic builds, **tree-shaking/purge**, full CSP, no third-party outages | CI setup, you own caching/versioning |

**Rule of thumb:** marketing sites & apps → **self-host** and purge. Demos and PoCs → **CDN** with **SRI** and pinned versions.

```html
<link rel="stylesheet" href="https://cdn.example.com/bootstrap/5.3.3/css/bootstrap.min.css" 
integrity="sha384-…" crossorigin="anonymous">
```

## Performance & testing checklist (2025)

- **Core Web Vitals**: LCP ≤2.5s, CLS ≤0.1, INP ≤200ms.
- **Images**: AVIF/WebP + explicit dimensions; lazy-load non-LCP; compress aggressively.
- **CSS**: purge/treeshake; inline critical if needed; avoid blocking fonts.
- **JS**: bundle split, defer modules; avoid shipping unused libs.
- **Accessibility**: color contrast, focus states, keyboard nav, `prefers-reduced-motion`.
- **QA**: Chrome/Edge/Firefox DevTools device modes, throttled networks; Playwright/Cypress multi-viewport tests.

## Drop-in starter you can use today

- **CSS**: `/assets/css/responsive-starter.css` with fluid type/spacing, helpers, and container queries.  
- **SVG include**: `_includes/svg-sprite.html` with icons (`<use href="#icon-…">`).  
- **Demo page**: `index.md` shows `<picture>`/`srcset` and background `image-set()` patterns.

| **Live demo & repo:**  
| Starter → [https://michalferber.me/responsive-starter-repo/](https://michalferber.me/responsive-starter-repo/)  
| GitHub → [https://github.com/MichalAFerber/responsive-starter-repo](https://github.com/MichalAFerber/responsive-starter-repo)

### Final thought

Don’t chase devices. Build **fluid components**, test across ranges, and ship **only what users need** on the network they have. That’s responsive design in 2025.
