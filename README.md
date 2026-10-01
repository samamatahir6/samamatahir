# Samama Tahir: Personal Brand Website

Plain HTML5 + CSS3 + vanilla JavaScript. No frameworks, no build step, no dependencies.

This is a **personal brand** site for Samama Tahir, full-stack web developer and digital growth specialist. It's distinct from the `marketing.samamatahir.com` subdomain, which is a separate consulting sub-brand (Sami Marketing Digital) aimed at local Porto businesses. Voice here is first-person throughout ("I build", "I help"), never agency language.

## Run it locally

Just open `index.html` directly (double-click it, or drag it into a browser tab). All pages use plain relative paths (`css/styles.css`, `../css/styles.css`, `../../css/styles.css`), so they work with no server.

A local server is only needed to preview `404.html`, since that page intentionally uses root-relative paths (`/css/...`). That's the correct choice for a real server-triggered error page: Apache serves it for a 404 at any URL depth, so the paths have to resolve from the domain root, not from wherever 404.html happens to sit on disk. To preview it:

```
python3 -m http.server 8000
```

Then visit `http://localhost:8000/404.html`.

## Before deploying to samamatahir.com

**`samamatahir.com` is currently a live WordPress site** ("Samama Tahir - WordPress and Shopify Engineer"), already indexed by Google. Deploying these files there will replace that site entirely. Make sure that's actually the intent before pointing the domain here. Back up anything from the WordPress site worth keeping first (content, any existing SEO-valuable pages, etc.).

## Deployment

This is a static site, so "deploy" just means getting these files onto the web root.

- **Method**: push to GitHub, and Hostinger Business auto-deploys via its Git integration (Hostinger hPanel → Advanced → GIT), pulling the repo into `public_html` on each push to the deploy branch.
- **`.htaccess` works** on Hostinger (LiteSpeed reads it), so the custom 404, `Options -Indexes`, and the future force-HTTPS / 301 rules all apply as written.
- **After the first deploy**: confirm the domain still resolves and HTTPS is valid, then uncomment the force-HTTPS block in `.htaccess` and push again.
- **Repo hygiene**: `.DS_Store` is git-ignored. `images/` only holds files the site uses, all WebP/JPG and resized for the web; keep original PNG screenshots out of the repo. The unused source photos that used to live in `img_for_website/` were removed and can be restored from git history.

## Project structure

```
index.html                            # Home page (EN)
about/index.html                      # About page (EN)
contact/index.html                    # Contact page (EN, Web3Forms contact form)
work/index.html                       # Work / portfolio page (EN)
services/index.html                   # Services hub page (EN)
services/web-development/index.html   # Web Development service page (EN)
services/marketing/index.html         # Marketing service page (EN)
services/ai-automation/index.html     # AI & Automation service page (EN)
faq/index.html                        # FAQ page, FAQPage schema (EN)
pt/index.html                         # Home page (PT)
pt/about/index.html                   # About page (PT)
pt/contact/index.html                 # Contact page (PT, Web3Forms contact form)
pt/work/index.html                    # Work / portfolio page (PT)
pt/services/index.html                # Services hub page (PT)
pt/services/web-development/index.html # Web Development service page (PT)
pt/services/marketing/index.html      # Marketing service page (PT)
pt/services/ai-automation/index.html  # AI & Automation service page (PT)
pt/faq/index.html                     # FAQ page, FAQPage schema (PT)
css/styles.css                        # Base styles: variables, reset, typography, components (sections 1-20)
css/responsive.css                    # min-width media query overrides (640 / 900 / 1100px)
js/main.js                            # Mobile menu, scroll shadow, footer year, reviews slider, contact form
images/                               # Real photos only, no stock. SEO-named, e.g.:
                                      #   samama-tahir-full-stack-web-developer.webp (home hero cutout, transparent)
                                      #   samama-tahir-web-development-workspace.webp + samama-tahir-desk-laptop-notebook-coffee.webp (home quote collage)
                                      #   samama-tahir-coding-setup-laptop-coffee.webp, -working-on-laptop.webp, -laptop-on-desk-by-window.webp (home gallery row, 960x720)
                                      #   samama-tahir-working-remotely-laptop.webp (home Marketing section)
icons/favicon.svg                     # "ST" monogram, matches the marketing subdomain's brand palette
robots.txt
sitemap.xml
404.html                              # Custom not-found page
.htaccess                             # 404 + Options -Indexes; commented force-HTTPS / 301 patterns
.gitignore
```

## Cache busting (CSS / JS versions)

Every page links its stylesheets and script with a version query, e.g. `css/styles.css?v=20260924f`. Browsers cache these files, so **whenever you change `css/styles.css`, `css/responsive.css`, or `js/main.js`, bump the version on every page** (same value everywhere), or returning visitors (and your own browser) may keep seeing the old styles. One command does it:

```
grep -rl '?v=OLD' --include='*.html' . | xargs sed -i '' 's/?v=OLD"/?v=NEW"/g'
```

## Bilingual structure (EN / PT)

The site is EN-default at the root, with a full European Portuguese mirror under `/pt/`. This is the reverse of `marketing.samamatahir.com`, which is PT-default with an `/en/` mirror, since English is the primary language for this personal-brand domain.

- **`/pt/` mirrors the EN folder structure exactly** (`pt/about/`, `pt/contact/`, `pt/work/`, `pt/services/`, `pt/services/web-development/`, `pt/services/marketing/`, `pt/services/ai-automation/`), so every internal same-language link inside a PT page (nav, footer, breadcrumbs, CTAs) resolves correctly using the *same relative path depth as the EN original* — only the shared asset paths (`css/`, `js/`, `icons/`, `images/`, which live once at the true project root, not duplicated under `pt/`) need one extra `../` prepended.
- Each page carries a `.lang-switch` in the header (desktop) and mirrored in `#mobile-nav` (mobile), linking to its counterpart in the other language, plus `hreflang` alternate tags (`en`, `pt-PT`, `x-default`) in `<head>` and matching `<xhtml:link>` entries in `sitemap.xml`.
- `<html lang="...">`, canonical URL, OG/Twitter meta, and JSON-LD (`inLanguage`, `description`, `url`) are all translated/adjusted per language, not just the visible copy.
- **To add another page later**: build the EN version first, then copy it into the matching `pt/` path, translate the body copy and metadata, and fix only the asset-path prefix (add one `../`) — leave the internal nav/footer/breadcrumb links as copied, since the mirrored structure already makes them resolve correctly.
- **Real review quotes are kept in whichever language the client actually wrote them in** (all 10 have a real, verbatim Portuguese version reused from `marketing.samamatahir.com`, since these are the same real Google reviews for the same person). Where a real quote says "o Sam"/"Sam", that's the client's own words and is left as-is even though the rest of the site's copy says "Samama"/"Samama Tahir" per the branding decision below.

## Services structure

`services/` is a hub page (EN + PT) linking out to main service "pillars" — deliberately not one page per narrow skill or tool. Current pillars:

- **`services/web-development/`** — WordPress, Shopify, custom web applications (React/Vue/Node/Laravel/CodeIgniter), and e-commerce, as sections within one page.
- **`services/marketing/`** — Google Business Profile, local/technical SEO, Google Ads, Meta Ads, analytics and tracking, and conversion optimization. This was renamed from `services/digital-growth/` before go-live (no indexed URLs existed yet, so the rename was free). "Digital Growth Specialist" remains the job-title branding used elsewhere on the site; only the service page itself is called "Marketing".
- **`services/ai-automation/`** — automated customer replies, quote-to-invoice workflows, and AI-generated reports/audits. Built only once real, specific examples were provided (an actual auto-reply system, an actual moving-quote-to-invoice pipeline, an actual AI SEO-audit tool), per the no-invented-capabilities rule below — not from a generic AI-services template.
- A Hosting/Security/Infrastructure pillar was discussed and intentionally deferred to avoid over-niching the services list. Add it the same way if it's ever wanted: a card in both hub pages, a new `services/<slug>/` page pair, and a `sitemap.xml` entry.

When adding a new pillar: add a card to both `services/index.html` and `pt/services/index.html`, build the EN page first following the pattern in the two existing service pages (intro, `.service-block` sections, process, CTA), then its `pt/` mirror, and add both URLs to `sitemap.xml`.

## Common Questions marquee + FAQ page

The home page and each of the three service pages carry a "Common Questions" section: a rotated, auto-scrolling marquee of real client questions (`.questions-marquee`, CSS-only animation, text always in plain HTML so nothing depends on JS or motion to be visible), styled from the brand palette, next to two honest trust points (`.questions-trust`) and an "Ask Me Anything" CTA. Questions are general on the home page and specific to that page's service on the service pages.

`faq/` (EN) and `pt/faq/` (PT) collect every one of those questions in one place, grouped by category, as native `<details>/<summary>` accordions (no JS needed to reveal an answer, so nothing is hidden from a reader or a search engine). Each page carries a matching `FAQPage` JSON-LD schema whose `Question`/`acceptedAnswer` text is kept identical to the visible accordion content — if you edit an answer, update both. Both the home page and every service page link to `/faq/` from their Common Questions section, and every page's footer links to it too.

When adding a new question anywhere (a marquee or the FAQ page), add it to the other place too so they stay in sync, and keep it a real question a client has actually asked, never a hypothetical written to fill space.

## Adding more pages later

Every nav/footer link now resolves to a real page. `work/` and `pt/work/` were the last additions and are the current worked example of the process. To add any future `/services/<slug>/` or other page:

1. Create the folder plus `index.html` (e.g. `work/index.html`), built from an existing page at the same folder depth (`work/` mirrors `about/`; `pt/work/` mirrors `pt/about/`).
2. Copy the `<head>` block from an existing page and give it a unique title, meta description, canonical URL, OG tags, and `hreflang` alternates for both language URLs.
3. Copy the header/footer markup as-is, adjusting relative asset paths for the new page's folder depth, and set `aria-current="page"` on the matching nav item.
4. Add both language URLs to `sitemap.xml` with today's `lastmod`.
5. Build the EN page first, then copy to `pt/`, translate copy + metadata, add one `../` to the asset paths, and leave internal nav/footer links as copied.

Do not create a new CSS file per page. Extend `css/styles.css` / `css/responsive.css` with new component classes as needed, following the existing naming pattern.

## Brand guidelines

All tokens live in `:root` at the top of `css/styles.css`. Always use the `var(--...)` token, never re-type the hex value. The palette matches the `marketing.samamatahir.com` sub-brand.

### Core palette

| Token | Hex | Role |
|---|---|---|
| `--color-green` | `#0B3B2A` | Primary brand color. Headings, dark sections (`.section--dark`), logo mark background, header CTA, secondary button text |
| `--color-green-dark` | `#082B1F` | Hover state for green buttons, footer / deepest backgrounds |
| `--color-green-light` | `#2F9E5E` | Icons, strokes, focus outlines, card hover borders, "Tahir" in the logo. **Decoration only**: 3.4:1 on white fails WCAG AA for text |
| `--color-green-text` | `#217A48` | Readable green text on white: eyebrows, links, tag text. Use this instead of green-light whenever it's text |
| `--color-yellow` | `#F4C542` | Main accent. Primary buttons, "ST" in the logo mark, eyebrows on dark sections, text selection, highlights |
| `--color-red` | `#D8232A` | Third accent, used sparingly: red tags, red pillar cards, red breadcrumb pill |
| `--color-text` | `#1A1A1A` | Body text base |
| `--color-text-muted` | `#52605C` | Paragraph text (all `<p>` default to this) |
| `--color-border` | `#E6E8E7` | Card and input borders, secondary button border |
| `--color-bg-alt` | `#F7F8F7` | Alternating section background (`.section--alt`) |
| `--color-white` | `#FFFFFF` | Page background, text on dark sections |

### One-off shades (not tokens, kept consistent)

| Value | Where |
|---|---|
| `#F0BA30` | Primary (yellow) button hover |
| `#8A6D16` | Text on yellow tints (yellow tags), since yellow itself is unreadable as text on white |
| `#F5A623` | Review stars |
| `#9FB3A8` | Muted text in the footer on dark green |
| `rgba(255,255,255,0.82)` | Paragraph text on dark green sections |

### Tints (accent at low opacity as a background)

- Yellow: `rgba(244,197,66, 0.15–0.22)` for tags and pills, with `#8A6D16` or green text.
- Red: `rgba(216,35,42, 0.06–0.08)`, with red text.
- Light green: `rgba(47,158,94, 0.08–0.12)`, with `--color-green-text`.
- Green: `rgba(11,59,42, 0.08)` for neutral pills and breadcrumbs.
- Shadows are always green-tinted, never grey: `rgba(11,59,42, 0.05–0.45)`.

### Accent system

Components that come in color variants use a modifier class that sets a local custom property instead of duplicating CSS: `.tag--yellow|red|green-light`, `.pillar-card--yellow|red|green-light` (`--pillar-accent`, `--pillar-tint`), `.breadcrumb-current--yellow|red` (`--breadcrumb-accent`, `--breadcrumb-tint`), and case-study cards (`--case-accent`, `--case-accent-ink`). Default is always green. On service pages, the three pillar cards run in the order yellow, red, green-light.

### Color pairing rules

- On white: headings in green, body in text-muted, green text in `--color-green-text`. Never put yellow or green-light text on white.
- On dark green: headings and text in white (paragraphs at 82% white), eyebrows in yellow, secondary buttons turn transparent with a 35% white border.
- The primary CTA is always yellow with green text. The header CTA and full-width form buttons are green pills with white text.
- Red is an accent, not an error or warning color. Use it in small doses.

### Typography

- **Font**: Manrope, self-hosted in `fonts/` (variable font, weights 400 to 800, latin + latin-ext subsets, declared with `@font-face` at the top of `css/styles.css`; the latin file is preloaded on every page). No request goes to Google Fonts. Fallback `system-ui, -apple-system, 'Segoe UI', sans-serif`.
- **Body**: 17px, line-height 1.65, antialiased.
- **Headings (h1–h3)**: weight 800, line-height 1.15, letter-spacing -0.01em, green.
  - h1: `clamp(2.1rem, 5vw + 1rem, 3.4rem)`
  - h2: `clamp(1.6rem, 3vw + 1rem, 2.4rem)`
  - h3: `1.25rem`
- **Eyebrow** (`.eyebrow`, small label above headings): 0.85rem, weight 700, uppercase, letter-spacing 0.08em.
- **Buttons**: weight 700, 1rem.
- Headings use `.text-balance` (`text-wrap: balance`).

### Logo

- "ST" monogram: green (`#0B3B2A`) rounded square with yellow (`#F4C542`) "ST" in Manrope 800. Same art as `icons/favicon.svg`.
- Wordmark: "Samama" in the heading green, "Tahir" in `--color-green-light` (`.logo .accent`).

### Shape, spacing, layout

- **Radius**: `--radius-sm` 8px (buttons, inputs, logo mark), `--radius-md` 14px (cards), `--radius-lg` 22px (large panels, images). Pills use `999px`.
- **Spacing scale**: `--space-1` 0.5rem, `-2` 1rem, `-3` 1.5rem, `-4` 2rem, `-5` 3rem, `-6` 4.5rem, `-7` 6rem.
- **Container**: max-width 1180px.
- **Breakpoints** (mobile-first, `min-width` in `css/responsive.css`): 640px, 900px, 1100px.

### Motion and accessibility

- Buttons lift `-2px` on hover and scale to `0.97` on press. Transitions are 0.15–0.25s ease.
- Focus ring: 2px solid green-light, 3px offset, on every link, button and input.
- `prefers-reduced-motion` turns off every animation and smooth scroll, including the marquee.
- Text selection: yellow background, dark text.

## Content rules (carried over into any future pages)

- First-person voice only ("I", "my"), never "we" / "our team" / agency language.
- The site refers to him as **"Samama Tahir"** / **"Samama"** throughout its own copy, not "Sam" — except inside real, verbatim client review quotes (see Reviews section below), which are never edited.
- No invented clients, testimonials, awards, certifications, revenue figures, or rankings. The only testimonials on the site are the 10 real Google reviews in the Reviews section, reused as-is from `marketing.samamatahir.com` (same real person, same real reviews).
- No guaranteed-ranking or guaranteed-results claims.
- Only the real facts provided: 8+ years of experience, the tech/skill list, Porto/Portugal location, real photo, real contact details.
- No em dashes in body copy. Use periods, commas, or colons instead. This was flagged as reading as AI-generated, so keep sentences short and plainly punctuated.
- Placeholder links (`#`) only for pages/profiles that don't exist yet or whose real URL hasn't been supplied. Replace with real URLs as soon as you have them; don't leave `#` live for long. As of the go-live pass there are **no `#` placeholder links left**: `/work/` is built, LinkedIn is real, Instagram/Facebook were removed pending real URLs.

## Reviews section

The home page (both languages) includes a "What clients say" / "O que dizem os clientes" section: a horizontally scrolling `.reviews-track` of `.review-card` elements (1 visible on mobile, 3 on desktop via `css/responsive.css`), driven by hand-rolled `requestAnimationFrame` easing in `js/main.js` rather than native `scroll-behavior: smooth`, which was found unreliable for this kind of track on the sibling `marketing.samamatahir.com` project.

- All 10 reviews are **real Google reviews for the same real person**, reused from `marketing.samamatahir.com` (not fabricated for this site).
- `ProfessionalService.review` in the home page's JSON-LD lists the same 10 reviews as structured data, `ratingValue: "5"` each, no fabricated `aggregateRating`.
- If more real reviews are collected later, add them the same way: a `.review-card` in both `index.html` and `pt/index.html`, plus a matching `Review` entry in both pages' JSON-LD. Never invent one.

## Work / portfolio page

`work/` and `pt/work/` present a `.work-grid` (1 col mobile, 2 at 640px, 3 at 900px) of `.work-card` elements. Each card is one anonymized case: a business-type-and-city label, a short "what I did" line, and the client's **real, verbatim Google review** (EN or PT version to match the page), tagged by service area. No business names, no invented projects, no metrics that weren't stated. The quotes are the same real reviews used on the home page and in its JSON-LD.

To add a real named project later (with the client's OK), add a `.work-card` to both pages. If you want screenshots, add them under `images/` with descriptive filenames and explicit `width`/`height`, and drop them into the card above the quote. Keep the "described by outcome" framing so confidential work still fits.

## Intro video ("Meet Samama")

The home page (both languages) has a "Meet Samama" section right after the hero (`#intro-video`, `.split.split--reverse` layout): Samama's own video explaining the services (YouTube `VsIfhwxvdvU`, English only), next to a short intro and the "Let's talk" CTA. A small "Watch my intro video" link under the hero buttons (`.hero-video-link`) jumps to it. The video is English only, so the PT page says "(em inglês)" in both the hero link and the section text. It uses the same `.video-embed` link and popup player as the testimonials below, styled larger via `.intro-video`. It is on the home page only, by choice.

**Local preview note:** YouTube refuses embeds from a page with no referrer (Error 153, "video player configuration error"), which is what you get when opening `index.html` straight from disk (`file://`). So on `file://` the JS skips the popup and leaves the videos as plain links that open on YouTube in a new tab. To see the popup player locally, use `python3 -m http.server 8000`. On the live site (https) it works normally.

## Video testimonials

The home page (both languages) has a "Video Testimonials" section, right after the text Reviews section: `.video-testimonials-track` (a scroll-snap slider with prev/next arrows, same `initCardSlider` JS as the Reviews slider) of `.video-testimonial-card` elements. The arrows hide themselves automatically when every card already fits (e.g. 2 videos on desktop).

Videos are hosted on YouTube (channel `@samitahir1456`), not in the repo. Each card is a click-to-load embed: a plain link to the YouTube video showing its thumbnail (`i.ytimg.com/vi_webp/<id>/sddefault.webp`) and a brand yellow/green play button. With JS, a click opens the video in a popup: a native `<dialog class="video-modal">` built by `js/main.js`, holding a privacy-enhanced `youtube-nocookie.com/embed/<id>` iframe that autoplays. Esc, a backdrop click, or the yellow close button shut it, and closing removes the iframe so the video stops. The popup sizes itself to fit both the viewport width and height (so it works on landscape phones), and page scroll is locked while it is open. No YouTube player loads until the visitor presses play. Without JS, the card opens the video on YouTube.

Current videos (real clients, real names):
- **Dr. Osako Marie Djemo**: `LF6-CKyWXdQ`
- **Waggy**: `RX8k6RozVqE` (Shopify landing page and custom code)

To add another real client video: copy a `.video-testimonial-card` in both `index.html` and `pt/index.html`, change the video ID in `href`, `data-youtube-id` and the thumbnail URL, and use the client's real name only (no invented role, quote, or location unless supplied). The optional `.video-testimonial-meta` line should only state what the client or video title actually says.

Local source files (`videos/`, and the `part 1-4 - final.mov` clips in `~/Downloads/`) are not committed. They're too large for GitHub (100MB limit) and aren't needed now that the videos live on YouTube.

## Gallery (deferred, not built)

A Portugal photo gallery was discussed but intentionally not built yet: it doesn't serve this site's lead-generation purpose (unlike the Reviews section, which builds trust directly) and was judged likely scope creep for a first version. Easy to add later as `/gallery/` (+ `/pt/gallery/`) following the same page-creation steps above, once real Portugal photos are supplied.

## SEO decisions made while building

- **One `<h1>` per page**, logical `h2`/`h3` hierarchy, semantic `<header>/<nav>/<main>/<section>/<footer>` throughout. No div-soup.
- **Unique `<title>`, meta description, canonical, and Open Graph tags** on all eighteen pages (nine EN + nine PT; titles roughly 51 to 80 characters, descriptions under 160 characters), each translated per language, not duplicated.
- **`hreflang` alternates** (`en`, `pt-PT`, `x-default`) in every page's `<head>` and in `sitemap.xml` via `<xhtml:link>`, so Google serves the right language version per searcher.
- **JSON-LD structured data**: `Person` + `WebSite` + `ProfessionalService` (with a real `review` array of 10 Google reviews) on the home page, `Service` + `BreadcrumbList` on the service page, `BreadcrumbList` on About, `BreadcrumbList` on Work, `BreadcrumbList` + `ContactPage` on Contact, all duplicated and translated on the PT side with `/pt/` URLs and `inLanguage: "pt-PT"`. All fields reflect only real, stated information. No fabricated ratings, prices, or reviews beyond the real ones.
- **Relative asset and internal-link paths** so the site works both from a real server and by opening files directly, with correct depth handling for nested pages (including the extra `/pt/` folder level).
- **Minimal JavaScript**: menu toggle, scroll shadow, footer year, the reviews slider, and the contact-form fetch enhancement only. All page content is real HTML, not JS-rendered. The contact form works with JS disabled (plain POST to Web3Forms). Nothing meaningful is hidden behind JavaScript.
- **Images**: one real photo, descriptive filename (`samama-tahir-web-developer-porto.jpg`), explicit `width`/`height` to avoid layout shift, meaningful `alt` text (not keyword-stuffed, translated on PT pages).
- **`robots.txt` + `sitemap.xml`** (with `lastmod` and hreflang alternates) pointing at `https://samamatahir.com/`, listing all eighteen pages (nine EN + nine PT).
- **Custom 404 page** wired up via `.htaccess` (`ErrorDocument 404 /404.html`), plus `Options -Indexes` and a commented pattern ready for future 301 redirects.
- **Internal linking**: Home links to the Digital Growth service page from three separate places with descriptive anchor text, no "click here". Every page links to `/contact/` for the primary conversion action, and the footer shows real email/phone directly on every page. Work links back to the home reviews section.
- **No keyword stuffing, no repeated "Porto" for its own sake.** Location appears where it's genuinely relevant.

## What still needs manual setup after deployment

None of this can be done from the codebase. It requires access to accounts or services this project doesn't have:

1. **DNS / hosting**: connect the GitHub repo to Hostinger Business's Git integration so it deploys into `public_html` (replacing the current WordPress install), point `samamatahir.com` at that hosting, and confirm HTTPS is issued for the domain before uncommenting the force-HTTPS rule in `.htaccess`.
2. **Google Search Console**: verify the domain, submit `sitemap.xml`, request indexing for all eighteen pages (EN + PT).
3. **Bing Webmaster Tools**: same, separately. This matters for Copilot/ChatGPT's web search, which leans on Bing's index.
4. **Analytics and consent**: GA4 (`G-YJFSYZGMZ0`) and Microsoft Clarity (`t42b3vk2m8`) are installed behind a cookie banner. Every `<head>` starts with a Consent Mode v2 default (`analytics_storage` denied unless the visitor already accepted), then the GA tag. Clarity is not in the HTML at all; `js/main.js` injects it only after the visitor clicks Accept. The choice is stored in `localStorage` (`st-consent`), and the footer's "Cookie settings" button (`[data-cookie-settings]`) reopens the banner. The privacy policy lives at `/privacy/` and `/pt/privacidade/`; update it if you add any new tool that collects data.
5. **Social links**: the footer now links to the real LinkedIn profile (`https://www.linkedin.com/in/samama-tahir/`) on every page. The Instagram/Facebook placeholders were removed rather than left as dead `#` links. Add them back (a footer `.footer-links` anchor in all 8 pages + 404 if you want it there) once real profile URLs exist.
6. **`/work/`**: built as an anonymized-case page (see "Work / portfolio page" above). Swap in real named projects and screenshots when clients agree to be shown.
7. **Contact form**: wired up (both languages) via Web3Forms. The form POSTs to `https://api.web3forms.com/submit` with a hidden `access_key`; `js/main.js` enhances it to submit over `fetch` with an inline status message (no page redirect), falling back to Web3Forms' own hosted success page if JavaScript is off. Submissions are delivered to `hello@samamatahir.com`. The access key lives in plain text in the markup, which is normal for Web3Forms (it only authorizes sending to the address the key is bound to). If it ever gets abused by spam, rotate the key at web3forms.com and consider enabling their hCaptcha option. WhatsApp, email, and phone are still offered alongside the form.
8. **og-image**: currently reuses the real headshot photo as the social-share image (`og:image`) since no dedicated banner graphic was supplied for this brand. A proper 1200x630 branded social card would look better if you want one made later.
