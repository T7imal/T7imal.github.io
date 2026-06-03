const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const projectsDataDir = path.join(root, "data", "projects");
const homepageTemplatePath = path.join(root, "src", "index.template.html");
const projectTemplatePath = path.join(root, "src", "project.template.html");
const homepageOutputPath = path.join(root, "index.html");
const projectsOutputDir = path.join(root, "projects");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readProjects() {
  return fs
    .readdirSync(projectsDataDir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => readJson(path.join(projectsDataDir, file)))
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
}

function authorMarkers(author) {
  return `${author.equalContribution ? "<sup>*</sup>" : ""}${author.corresponding ? "<sup>&dagger;</sup>" : ""}`;
}

function renderAuthorName(author, options = {}) {
  const shouldHighlight = options.highlight !== false && author.highlight;
  const name = shouldHighlight ? `<strong>${escapeHtml(author.name)}</strong>` : escapeHtml(author.name);
  const linked = author.url ? `<a href="${escapeHtml(author.url)}" target="_blank" rel="noopener">${name}</a>` : name;
  return `${linked}${options.markers === false ? "" : authorMarkers(author)}`;
}

function renderHomepageAuthors(authors = []) {
  return authors.map((author) => renderAuthorName(author)).join(", ");
}

function renderContributionNotes(authors = [], className = "") {
  const notes = [];
  if (authors.some((author) => author.equalContribution)) {
    notes.push("<sup>*</sup>Equal contribution");
  }
  if (authors.some((author) => author.corresponding)) {
    notes.push("<sup>&dagger;</sup>Corresponding author");
  }
  if (!notes.length) {
    return "";
  }
  const classAttr = className ? ` class="${className}"` : "";
  return `<span${classAttr}><small><br>${notes.join(" &nbsp;&nbsp; ")}</small></span>`;
}

function homepageUrlFor(project, link) {
  if (link.homepageUrl) {
    return link.homepageUrl;
  }
  if (link.homepageProjectLink) {
    return `projects/${project.slug}/`;
  }
  if (/^(https?:|mailto:|#)/.test(link.url || "")) {
    return link.url || "#";
  }
  return `projects/${project.slug}/${link.url || ""}`;
}

function renderHomepageThumbnail(project) {
  const thumbnail = project.thumbnail || {};
  const src = thumbnail.src || `projects/${project.slug}/thumbnail.jpg`;
  const url = `projects/${project.slug}/`;
  return [
    `          <a class="publication-thumb" href="${escapeHtml(url)}" aria-label="${escapeHtml(`Open project page for ${project.title}`)}">`,
    `            <img src="${escapeHtml(src)}" alt="${escapeHtml(thumbnail.alt || project.title)}">`,
    `          </a>`,
  ].join("\n");
}

function renderHomepageLinks(project) {
  const videos = validVideos(project);
  const links = [
    { label: "Project", homepageProjectLink: true },
    ...(project.links || []).filter((link) => link.label !== "Project"),
  ];
  const hasVideoLink = links.some((link) => String(link.label || "").toLowerCase() === "video" || link.icon === "video");
  if (videos.length && !hasVideoLink) {
    links.push({
      label: videos.length > 1 ? "Videos" : "Video",
      homepageUrl: `projects/${project.slug}/#videos`,
    });
  }

  return [
    `            <div class="publication-links" aria-label="Publication links">`,
    ...links.map((link) => `              <a href="${escapeHtml(homepageUrlFor(project, link))}">${escapeHtml(link.label)}</a>`),
    `            </div>`,
  ].join("\n");
}

function renderHomepagePublication(project) {
  const projectUrl = `projects/${project.slug}/`;
  const dateHtml = project.dateText
    ? [
        `            <p class="publication-date">`,
        `              <time${project.date ? ` datetime="${escapeHtml(project.date)}"` : ""}>${escapeHtml(project.dateText)}</time>`,
        `            </p>`,
      ].join("\n")
    : "";

  return [
    `        <article class="publication">`,
    renderHomepageThumbnail(project),
    `          <div class="publication-body">`,
    `            <h3><a href="${escapeHtml(projectUrl)}">${escapeHtml(project.title)}</a></h3>`,
    `            <p class="publication-authors">${renderHomepageAuthors(project.authors)}</p>`,
    `            <p class="publication-venue">${escapeHtml(project.venue || "")}</p>`,
    dateHtml,
    renderHomepageLinks(project),
    `          </div>`,
    `        </article>`,
  ]
    .filter(Boolean)
    .join("\n");
}

function renderProjectAuthors(authors = []) {
  return authors
    .map((author) => `<span class="author-block">${renderAuthorName(author, { highlight: false })}</span>`)
    .join("\n                ");
}

function projectIconClass(link) {
  const icon = link.icon || link.label.toLowerCase();
  if (icon === "pdf" || icon === "paper" || icon === "supplementary") return "fas fa-file-pdf";
  if (icon === "github" || icon === "code") return "fab fa-github";
  if (icon === "video") return "fas fa-video";
  if (icon === "slides") return "fas fa-file-powerpoint";
  if (icon === "arxiv") return "ai ai-arxiv";
  return "fas fa-link";
}

function videoSource(video = {}) {
  return video.source || "";
}

function isYoutubeSource(source) {
  try {
    const url = new URL(source);
    return url.hostname === "youtu.be" || url.hostname.endsWith("youtube.com");
  } catch {
    return false;
  }
}

function validVideos(project) {
  return (project.videos || []).filter((video) => {
    const source = videoSource(video);
    if (!source) {
      return false;
    }
    return isYoutubeSource(source) ? Boolean(youtubeEmbedUrl(video)) : true;
  });
}

function projectLinksFor(project) {
  const links = [...(project.links || [])];
  const videos = validVideos(project);
  const hasVideoLink = links.some((link) => String(link.label || "").toLowerCase() === "video" || link.icon === "video");
  if (videos.length && !hasVideoLink) {
    links.push({
      label: videos.length > 1 ? "Videos" : "Video",
      url: "#videos",
      icon: "video",
      newTab: false,
    });
  }
  return links;
}

function renderProjectLinks(project) {
  const links = projectLinksFor(project);
  return links
    .map((link) => {
      const href = link.url || "#";
      const targetAttrs = link.newTab === false || href.startsWith("#") ? "" : ` target="_blank" rel="noopener"`;
      return [
        `                      <span class="link-block">`,
        `                        <a href="${escapeHtml(href)}"${targetAttrs} class="external-link button is-normal is-rounded is-dark">`,
        `                          <span class="icon"><i class="${projectIconClass(link)}"></i></span>`,
        `                          <span>${escapeHtml(link.label)}</span>`,
        `                        </a>`,
        `                      </span>`,
      ].join("\n");
    })
    .join("\n");
}

function renderParagraphs(paragraphs = []) {
  return paragraphs.map((paragraph) => `          <p>${escapeHtml(paragraph)}</p>`).join("\n");
}

function renderTeaser(project) {
  const teaser = project.teaser || {};
  if (teaser.type === "video") {
    return [
      `      <video poster="${escapeHtml(teaser.poster || "")}" id="tree" autoplay controls muted loop height="100%" preload="metadata">`,
      `        <source src="${escapeHtml(teaser.src || "")}" type="${escapeHtml(teaser.mime || "video/mp4")}">`,
      `      </video>`,
      teaser.caption ? `      <h2 class="subtitle has-text-centered">${escapeHtml(teaser.caption)}</h2>` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    `      <img class="project-teaser-image" src="${escapeHtml(teaser.src || "teaser.jpg")}" alt="${escapeHtml(teaser.alt || project.title)}" loading="lazy">`,
    teaser.caption ? `      <h2 class="subtitle has-text-centered">${escapeHtml(teaser.caption)}</h2>` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function youtubeEmbedUrl(video) {
  const source = videoSource(video);
  if (!source) {
    return "";
  }

  try {
    const url = new URL(source);
    if (url.hostname === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : "";
    }
    if (url.hostname.endsWith("youtube.com")) {
      const id = url.searchParams.get("v");
      if (id) {
        return `https://www.youtube.com/embed/${encodeURIComponent(id)}`;
      }
      if (url.pathname.startsWith("/embed/")) {
        return url.toString();
      }
    }
  } catch {
    return "";
  }

  return "";
}

function videoMime(video) {
  if (video.mime) {
    return video.mime;
  }
  const source = videoSource(video).toLowerCase();
  if (source.endsWith(".webm")) return "video/webm";
  if (source.endsWith(".ogg") || source.endsWith(".ogv")) return "video/ogg";
  return "video/mp4";
}

function renderVideoItem(video, index) {
  const title = video.title || `Video ${index + 1}`;
  const caption = video.caption
    ? `                <p class="video-caption">${escapeHtml(video.caption)}</p>`
    : "";
  let mediaHtml = "";

  if (isYoutubeSource(videoSource(video))) {
    const src = youtubeEmbedUrl(video);
    if (!src) {
      return "";
    }
    mediaHtml = `                  <iframe src="${escapeHtml(src)}" title="${escapeHtml(title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  } else {
    const source = videoSource(video);
    if (!source) {
      return "";
    }
    const controls = video.controls === false ? "" : " controls";
    const muted = video.muted ? " muted" : "";
    const loop = video.loop ? " loop" : "";
    const autoplay = video.autoplay ? " autoplay" : "";
    const poster = video.poster ? ` poster="${escapeHtml(video.poster)}"` : "";
    mediaHtml = [
      `                  <video${poster}${controls}${muted}${loop}${autoplay} preload="${escapeHtml(video.preload || "metadata")}">`,
      `                    <source src="${escapeHtml(source)}" type="${escapeHtml(videoMime(video))}">`,
      `                  </video>`,
    ].join("\n");
  }

  return [
    `              <article class="publication-video-item">`,
    `                <h3 class="title is-5">${escapeHtml(title)}</h3>`,
    `                <div class="publication-video">`,
    mediaHtml,
    `                </div>`,
    caption,
    `              </article>`,
  ]
    .filter(Boolean)
    .join("\n");
}

function renderVideoSection(project) {
  const videos = validVideos(project);
  if (!videos.length) {
    return "";
  }

  return [
    `    <section class="hero is-small is-light" id="videos">`,
    `      <div class="hero-body">`,
    `        <div class="container is-max-desktop">`,
    `          <div class="columns is-centered has-text-centered">`,
    `            <div class="column is-four-fifths">`,
    `              <h2 class="title is-3">Videos</h2>`,
    videos.map(renderVideoItem).join("\n"),
    `            </div>`,
    `          </div>`,
    `        </div>`,
    `      </div>`,
    `    </section>`,
  ]
    .filter(Boolean)
    .join("\n");
}

function renderExtraHtml(project) {
  if (!project.extraHtml) {
    return "";
  }
  const extraPath = path.join(projectsOutputDir, project.slug, project.extraHtml);
  if (!fs.existsSync(extraPath)) {
    throw new Error(`Missing extraHtml file for ${project.slug}: ${extraPath}`);
  }
  return fs.readFileSync(extraPath, "utf8");
}

function replaceAll(template, values) {
  let output = template;
  for (const [key, value] of Object.entries(values)) {
    output = output.replaceAll(`{{${key}}}`, value ?? "");
  }
  return output;
}

function jsonString(value) {
  return JSON.stringify(String(value ?? ""));
}

function jsonArray(values = []) {
  return JSON.stringify(values);
}

function renderProjectPage(template, project) {
  const authorNames = (project.authors || []).map((author) => author.name).join(", ");
  const abstractText = (project.abstract || []).join("\n\n");
  return replaceAll(template, {
    PAPER_TITLE: escapeHtml(project.title),
    DESCRIPTION: escapeHtml(project.description || project.title),
    KEYWORDS: escapeHtml((project.keywords || []).join(", ")),
    AUTHOR_NAMES: escapeHtml(authorNames),
    SITE_NAME: "Personal Academic Homepage",
    PROJECT_URL: escapeHtml(`projects/${project.slug}/`),
    SOCIAL_IMAGE: escapeHtml((project.thumbnail && project.thumbnail.src) || `projects/${project.slug}/thumbnail.jpg`),
    PUBLISHED_TIME: escapeHtml(project.date || `${project.year || ""}-01-01`),
    YEAR: escapeHtml(project.year || (project.date || "").slice(0, 4)),
    VENUE: escapeHtml(project.venue || ""),
    SCHEMA_TITLE: jsonString(project.title),
    SCHEMA_DESCRIPTION: jsonString(project.description || project.title),
    SCHEMA_DATE: jsonString(project.date || `${project.year || ""}-01-01`),
    SCHEMA_VENUE: jsonString(project.venue || ""),
    SCHEMA_URL: jsonString(`projects/${project.slug}/`),
    SCHEMA_IMAGE: jsonString((project.thumbnail && project.thumbnail.src) || `projects/${project.slug}/thumbnail.jpg`),
    SCHEMA_KEYWORDS: jsonArray(project.keywords || []),
    SCHEMA_ABSTRACT: jsonString(abstractText),
    AUTHORS_HTML: renderProjectAuthors(project.authors),
    AFFILIATION_AND_VENUE_HTML: escapeHtml(project.venue || ""),
    CONTRIBUTION_NOTES_HTML: renderContributionNotes(project.authors, "eql-cntrb"),
    PROJECT_LINKS_HTML: renderProjectLinks(project),
    TEASER_HTML: renderTeaser(project),
    ABSTRACT_HTML: renderParagraphs(project.abstract),
    VIDEO_SECTION_HTML: renderVideoSection(project),
    EXTRA_HTML: renderExtraHtml(project),
    ABSTRACT_TEXT: escapeHtml(abstractText),
  });
}

function buildHomepage(projects) {
  const template = fs.readFileSync(homepageTemplatePath, "utf8");
  const publicationsHtml = projects.map(renderHomepagePublication).join("\n\n");
  const output = template.replace("<!-- PUBLICATIONS_PLACEHOLDER -->", publicationsHtml);
  fs.writeFileSync(homepageOutputPath, output);
  console.log(`Built index.html from ${projects.length} projects.`);
}

function buildProjects(projects) {
  const template = fs.readFileSync(projectTemplatePath, "utf8");
  for (const project of projects) {
    if (!project.slug) {
      throw new Error(`Project "${project.title}" is missing required field "slug".`);
    }
    const outputDir = path.join(projectsOutputDir, project.slug);
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, "index.html"), renderProjectPage(template, project));
    console.log(`Built projects/${project.slug}/index.html.`);
  }
}

function main() {
  const projects = readProjects();
  buildHomepage(projects);
  buildProjects(projects);
}

main();
