# AGENTS.md

This repository is a static, multi-page EMECSA website. Keep changes small, consistent with the existing design system, and aligned with the current Spanish copy and commercial tone.

## Project Map

- Entry pages: [index.html](index.html), [empresa.html](empresa.html), [proyectos.html](proyectos.html), [servicios.html](servicios.html)
- Shared styling: [css/styles.css](css/styles.css)
- Hero-specific styling: [css/hero.css](css/hero.css)
- Shared behavior and animations: [js/main.js](js/main.js)
- Hero sequence behavior: [js/hero.js](js/hero.js)
- Deployment config and caching rules: [vercel.json](vercel.json)

## Working Conventions

- Treat the site as plain HTML/CSS/JS; do not introduce a framework or build step unless the user explicitly asks.
- Preserve relative paths, existing section IDs, and shared class names so navigation and animation hooks keep working.
- Prefer extending the shared CSS/JS files over adding one-off page code when the behavior is reused across pages.
- Respect the current animation model: Anime.js-driven reveals in `main.js`, scroll-driven hero logic in `hero.js`, and reduced-motion fallbacks.
- Keep the existing logo fallbacks and `onerror` handling intact.
- Preserve the Spanish content, WhatsApp links, and technical wording unless the task is specifically to rewrite copy.

## Editing Notes

- Update `styles.css` for global components and `hero.css` only for the hero sequence.
- Keep DOM hooks and data attributes stable unless you are updating the matching JavaScript.
- If you add new assets or directories, check whether [vercel.json](vercel.json) needs cache-header updates.
- Avoid changing the visual direction casually; this site already has a deliberate industrial/electromecánica identity.

## Validation

- There is no build pipeline here. Validate changes by loading the affected HTML pages in a browser and checking responsive behavior, navigation, animations, and image fallbacks.
- If you touch the hero or shared animation code, confirm that the preloader, scroll progress, and hero transitions still behave correctly with and without motion reduction enabled.
