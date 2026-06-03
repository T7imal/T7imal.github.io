const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const templatePath = path.join(root, "src", "index.template.html");
const publicationsPath = path.join(root, "data", "publications.json");
const outputPath = path.join(root, "index.html");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderAuthors(authors = [], highlightAuthors = []) {
  const highlighted = new Set(highlightAuthors);
  return authors
    .map((author) => {
      const name = escapeHtml(author);
      return highlighted.has(author) ? `<strong>${name}</strong>` : name;
    })
    .join(", ");
}

function renderThumbnail(publication) {
  const title = publication.title || "publication";
  const url = publication.url || "#";
  const aria = `Open project page for ${title}`;

  if (!publication.thumbnail) {
    return `          <a class="publication-thumb" href="${escapeHtml(url)}" aria-label="${escapeHtml(aria)}"></a>`;
  }

  return [
    `          <a class="publication-thumb" href="${escapeHtml(url)}" aria-label="${escapeHtml(aria)}">`,
    `            <img src="${escapeHtml(publication.thumbnail)}" alt="${escapeHtml(publication.thumbnailAlt || title)}">`,
    `          </a>`,
  ].join("\n");
}

function renderDate(publication) {
  if (!publication.dateText) {
    return "";
  }

  const datetime = publication.date ? ` datetime="${escapeHtml(publication.date)}"` : "";
  return [
    `            <p class="publication-date">`,
    `              <time${datetime}>${escapeHtml(publication.dateText)}</time>`,
    `            </p>`,
  ].join("\n");
}

function renderLinks(links = []) {
  if (!links.length) {
    return "";
  }

  const renderedLinks = links
    .map((link) => `              <a href="${escapeHtml(link.url || "#")}">${escapeHtml(link.label)}</a>`)
    .join("\n");

  return [
    `            <div class="publication-links" aria-label="Publication links">`,
    renderedLinks,
    `            </div>`,
  ].join("\n");
}

function renderPublication(publication) {
  const title = publication.title || "Untitled publication";
  const url = publication.url || "#";

  return [
    `        <article class="publication">`,
    renderThumbnail(publication),
    `          <div class="publication-body">`,
    `            <h3><a href="${escapeHtml(url)}">${escapeHtml(title)}</a></h3>`,
    `            <p class="publication-authors">${renderAuthors(publication.authors, publication.highlightAuthors)}</p>`,
    `            <p class="publication-venue">${escapeHtml(publication.venue || "")}</p>`,
    renderDate(publication),
    renderLinks(publication.links),
    `          </div>`,
    `        </article>`,
  ]
    .filter(Boolean)
    .join("\n");
}

function main() {
  const template = fs.readFileSync(templatePath, "utf8");
  const publications = readJson(publicationsPath);
  const publicationsHtml = publications.map(renderPublication).join("\n\n");
  const output = template.replace("<!-- PUBLICATIONS_PLACEHOLDER -->", publicationsHtml);

  fs.writeFileSync(outputPath, output);
  console.log(`Built ${path.relative(root, outputPath)} from ${publications.length} publications.`);
}

main();
