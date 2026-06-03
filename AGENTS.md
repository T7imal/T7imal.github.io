# Repository Guidelines

## Project Structure & Module Organization

This is a plain static GitHub Pages site with a small Node-based generator.

- `src/index.template.html` - homepage template.
- `src/project.template.html` - project page template based on Academic Project Page Template.
- `data/projects/*.json` - single source of truth for publications and project pages.
- `scripts/build.js` - generates `index.html` and `projects/<paper-slug>/index.html`.
- `style.css` - homepage styles.
- `static/` - shared site assets, including CSS, JS, icons, and template resources.
- `projects/<paper-slug>/` - generated project page plus paper-specific assets such as `thumbnail.jpg`, `teaser.jpg`, and `paper.pdf`.

Do not hand-edit generated HTML files unless the change is temporary for debugging.

## Build, Test, and Development Commands

Build all generated pages:

```powershell
node scripts\build.js
```

Preview locally:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

There is currently no package manager setup, install step, or automated test command.

## Coding Style & Naming Conventions

Use two-space indentation in HTML, CSS, JSON, and JavaScript. Keep generated page changes in templates or data files, not in `index.html` or generated project pages.

Use lowercase, URL-safe project slugs:

```text
data/projects/2026wop.json
projects/2026wop/
```

Keep paper-specific assets beside the generated project page. Use stable names such as `thumbnail.jpg`, `teaser.jpg`, and `paper.pdf`.

## Testing Guidelines

After changes, run:

```powershell
node scripts\build.js
python -m http.server 8000
```

Manually verify the homepage, project links, PDF links, icon rendering, teaser image, and MathJax formulas in the browser. Check both desktop and narrow mobile widths.

## Commit & Pull Request Guidelines

The repository currently has minimal history (`initial commit`), so no strict convention is established. Prefer concise, imperative commit messages, for example:

```text
Add project page generator
Update 2026wop metadata
```

Pull requests should describe the changed data/templates, include screenshots for visual changes, and mention whether `node scripts\build.js` was run.

## Agent-Specific Instructions

When updating publications or project pages, edit `data/projects/*.json` and rebuild. Preserve user-edited content in templates and JSON. Avoid deleting project assets unless explicitly requested.
