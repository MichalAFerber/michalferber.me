# Michal Ferber's Personal Website

This is the personal website and blog of Michal Ferber, built with Jekyll and based on the [Beautiful Jekyll](https://beautifuljekyll.com) theme. It hosts my blog posts, professional timeline, skills, and portfolio.

**Latest Updates**: Timeline updated, CSS styling improvements for blog tags, and minified assets regenerated.

## Key Features

- **Responsive Design**: Mobile-friendly layout using Beautiful Jekyll.
- **Blog Platform**: Markdown-based posting with tags and pagination.
- **Timeline & Skills**: Data-driven components powered by YAML data files.
- **Comments Integration**: configured for Giscus/Disqus/Staticman.
- **Analytics**: Integration with Google, Cloudflare, Matomo, etc.

---

## Tech Stack

- **Generator**: Jekyll 3.9+
- **Language**: Ruby 3.0+
- **Theme**: beautiful-jekyll-theme 6.0.1
- **Styling**: Bootstrap (via theme)
- **Templating**: Liquid
- **Deployment**: GitHub Pages (Custom Domain)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Ruby**: Version 3.0 or higher is recommended.
- **Bundler**: To manage Ruby gems.
- **GCC/Make**: Required for building native extensions (usually pre-installed on macOS/Linux).

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/michalferber/michalferber.me.git
cd michalferber.me
```

### 2. Install Dependencies

Install the required Ruby gems specified in `Gemfile` and `beautiful-jekyll-theme.gemspec`:

```bash
bundle install
```

### 3. Start Development Server

Run the Jekyll server with live reloading enabled:

```bash
bundle exec jekyll serve --livereload
```

Open [http://localhost:4000](http://localhost:4000) in your browser.

> **Note**: If you run into permission errors, you might need to use `chown` or install Ruby version manager like `rbenv` to avoid using system Ruby.

---

## Architecture

### Directory Structure

```tree
├── _posts/                  # Blog entries (markdown format)
├── _layouts/                # Page templates (HTML + Liquid)
├── _includes/               # Reusable snippets (Headers, Footers, Analytics)
├── _data/                   # Structured data for site components
│   ├── timeline.yml         # Career timeline data
│   ├── programming-skills.yml
│   └── other-skills.yml
├── assets/                  # Static files (Images, CSS, JS)
├── _config.yml              # Main site configuration
├── CNAME                    # Custom domain configuration for GitHub Pages
└── beautiful-jekyll-theme.gemspec # Theme dependency specification
```

### Data Flow

1. **Content**: You write content in Markdown (`_posts/*.md`) or define data in YAML (`_data/*.yml`).
2. **Build**: Jekyll processes these files using Liquid templates (`_layouts` and `_includes`).
3. **Render**: It generates static HTML files in the `_site/` directory (not committed to git).
4. **Serve**: The `jekyll serve` command hosts this `_site/` directory locally.

### Key Components

**Posts (`_posts/`)**

- Format: `YYYY-MM-DD-title.md`
- Contains Frontmatter at the top (YAML) defining layout, title, tags, etc.

**Data Files (`_data/`)**

- Used to populate sections like "Skills" or "Timeline" without hardcoding HTML.
- Example: `timeline.yml` contains a list of events which the `about.html` or similar page iterates over.

**Configuration (`_config.yml`)**

- Controls site-wide settings like title, author, navigation links, and social accounts.
- Restart the server after modifying this file.

---

## Environment Variables / Configuration

This project is a static site and relies primarily on `_config.yml` rather than traditional environment variables. However, some build-time configurations are relevant:

| Config | File | Description |
|--------|------|-------------|

| **Site Title** | `_config.yml` | The global title of the website. |
| **Author** | `_config.yml` | Author metadata for SEO and footer. |
| **Navbar** | `_config.yml` | Links appearing in the top navigation. |
| **Social** | `_config.yml` | Social media links for the footer. |

### Analytics & Comments

API keys or IDs for services like Google Analytics or Disqus are stored in `_config.yml` or specific include files in `_includes/`.

---

## Available Scripts

| Command | Description |
|---------|-------------|

| `bundle exec jekyll serve` | Build the site and serve it locally. |
| `bundle exec jekyll serve --livereload` | Serve with auto-refresh on file changes. |
| `bundle exec jekyll build` | Build the site into `_site/` for production deployment. |
| `bundle clean` | Remove unused gems. |
| `bundle update` | Update dependencies to the latest versions. |

---

## Deployment

### GitHub Pages

This site is configured to be served via GitHub Pages.

1. **Push to Main**: Simply push your changes to the `main` (or `master`) branch.
2. **Build**: GitHub Actions (or the legacy Pages builder) will detect the Jekyll structure and build the site.
3. **CNAME**: The `CNAME` file ensures the site is served at `michalferber.me` instead of the default GitHub domain.

### Local Production Build

To test the production build locally:

```bash
JEKYLL_ENV=production bundle exec jekyll build
# Serve the _site directory using a static file server if needed
```

---

## Troubleshooting

### "Gem not found" or Bundler Errors

**Error**: `Could not find gem '...' in any of the sources`

**Solution**:

```bash
bundle install
```

### "Address already in use"

**Error**: `bind: Address already in use`

**Solution**:
Another instance of Jekyll or another service is using port 4000.

```bash
lsof -i :4000
kill -9 <PID>
# OR run on a different port
bundle exec jekyll serve --port 4001
```

### Jekyll Version Mismatch

**Error**: Warnings about version mismatch between Gemfile.lock and system.

**Solution**:

```bash
bundle update jekyll
```

---

## Writing Principles (For this Project)

- **Posts**: Always include `layout: post` and `tags` in the frontmatter.
- **Images**: Place images in `assets/img/` and reference them with absolute paths `{{ site.baseurl }}/assets/img/filename.jpg`.
- **Excerpts**: Use `<!--more-->` in your post content to define where the summary ends on the home page.
