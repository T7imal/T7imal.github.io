# Personal Academic Homepage

This repository contains a plain static GitHub Pages homepage.

## Local Preview

After editing publication data, rebuild the homepage:

```powershell
node scripts/build.js
```

Then open `index.html` directly in a browser, or run a local server:

```powershell
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Structure

- `index.html` - homepage markup
- `src/index.template.html` - homepage template used by the build script
- `style.css` - homepage styles
- `data/publications.json` - publication data
- `scripts/build.js` - generates `index.html` from the template and data
- `assets/images/` - profile photo and publication thumbnails
- `assets/pdfs/` - CV and paper PDFs

## Notes

- Keep project pages under `projects/<paper-slug>/` when adding paper-specific pages.
- Keep paths relative where possible so the site works locally and on GitHub Pages.
