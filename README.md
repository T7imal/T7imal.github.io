# Personal Academic Homepage

This repository contains a plain static GitHub Pages homepage.

## Local Preview

After editing project data, rebuild all generated pages:

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
- `src/project.template.html` - project page template based on Academic Project Page Template
- `style.css` - homepage styles
- `data/projects/*.json` - single source of truth for publications and project pages
- `scripts/build.js` - generates `index.html` and `projects/<paper-slug>/index.html`
- `static/` - shared site assets, including template CSS/JS and icons
- `assets/images/` - profile photo and homepage-only images
- `assets/pdfs/` - CV and homepage-only PDFs
- `projects/<paper-slug>/` - generated project page plus paper-specific assets

## Notes

- Edit `data/projects/<paper-slug>.json` rather than generated HTML.
- Do not hand-edit `index.html` or `projects/<paper-slug>/index.html`; they are generated.
- Put paper-specific assets next to the project page, for example:

```text
projects/2026wop/
  thumbnail.jpg
  teaser.jpg
  paper.pdf
```

- Author fields support:

```json
{
  "name": "Author Name",
  "url": "https://example.com",
  "highlight": true,
  "equalContribution": false,
  "corresponding": true
}
```

- For project-specific custom HTML, set `extraHtml` in the project JSON and place the file in that project directory.
- Project pages intentionally omit BibTeX; link to the paper PDF or official publication page instead.
- Project abstracts support LaTeX math via MathJax, including inline `$...$` and display `$$...$$`.
- Keep paths relative where possible so the site works locally and on GitHub Pages.
