# Single Vendor eCommerce — AI Agent Master Architecture & WooCommerce Migration

Version: 1.1 | Date: 2026-10-23 | Currency: LKR | Timezone: Asia/Colombo

## 0. Mission / Agent Instructions

Build a production-ready Sri Lankan electronics eCommerce store with a Next.js customer storefront, React admin dashboard, NestJS REST backend and PostgreSQL database. Host on Hetzner VPS (2 vCPU, 4 GB RAM, 40 GB disk). **Import the supplied WooCommerce CSV including product images, categories, attributes, prices, variations, descriptions and SEO metadata** without manual product re-entry. Provide repeatable **Import Products** and **Export Products** workflows in admin. This is an engineering specification, not executable code. Implement, test, document and deploy in stages. Never fabricate image download success, gateway credentials or test results.

**Input CSV:** `wc-product-export-23-10-2026-1792752032411.csv` (provided separately to the agent). Do not embed customer secrets in git. Do not copy third-party site branding or copyrighted imagery without rights.

## 1. Inspected CSV Facts (actual file)

- 531 records; 152 columns.
- Product types: 369 `simple`, 38 `variable` (parent), 124 `variation` (child). Therefore **407 top-level product rows** before any filtering/deduplication; **124 child variants**, not independent catalog products.
- 439 rows have non-empty `Images`; 92 rows have no image in this CSV. There are approximately 2,517 image URL entries before URL deduplication, mostly `https://www.dwstore.lk/wp-content/uploads/...`. Availability/download success is **not yet verified**.
- `SKU` is empty for all 531 rows; generate deterministic SKUs based on WooCommerce ID, e.g. `WC-<ID>`, with uniqueness checks. Preserve original IDs separately.
- 113 variation rows have `Parent` referencing a present CSV row (`id:<id>`); **11 variation rows have blank Parent** and need review / fallback matching. Do not silently attach them to the wrong product.
- 151 rows have `Attribute 1 name` and value(s). Columns include regular/sale price, category paths, brands, descriptions, stock, publish status, Yoast metadata, Woodmart and Facebook-specific metadata.
- All 531 rows show `Published=1`, but publication still requires data validation and image/variant checks.
- CSV is a data source, not a full WordPress backup: attachment binaries, complete taxonomy relationships, historical order data and some custom plugin semantics may be missing.

## 2. Final Stack

| Layer | Choice |
|---|---|
| Storefront | Next.js App Router + React + TypeScript + Tailwind CSS, server-rendered SEO pages |
| Admin | React + Vite + TypeScript; adapt purchased HTML/CSS/JS template into components |
| Backend | NestJS + TypeScript, REST `/api/v1` |
| Database | PostgreSQL |
| ORM/migrations | Prisma |
| Background import jobs | PostgreSQL-backed durable jobs / outbox with bounded worker concurrency; Redis optional later |
| CSV parsing | Streaming Node CSV parser with correct quoted fields and UTF-8/BOM support |
| Image processing | Sharp for validated formats, bounded sizes, WebP thumbnails |
| Media | S3-compatible object storage recommended (e.g. Cloudflare R2 / Hetzner Object Storage); local temporary staging only |
| Auth | Server-side opaque session cookies, CSRF, role-based admin permissions, admin MFA |
| Proxy/deploy | Nginx + TLS + Docker Compose, prebuilt CI images |
| Payment | COD, bank transfer, optional verified PayHere hosted gateway |

Choose current mutually compatible stable framework versions at implementation time and commit lockfiles. Keep the app lean on 4 GB RAM; no heavyweight search cluster or unlimited workers.

## 3. Deployment Diagram

```text
Browser -> HTTPS / Nginx
    www.example.lk   -> Next.js storefront (SSR)
    admin.example.lk -> React Vite static admin
    api.example.lk   -> NestJS REST API
                           |
                    PostgreSQL (private)
                           |
                    Import queue / worker
                           |
                    S3-compatible image storage

Old WordPress CSV + image URLs -> Import staging -> Validation -> Mapping
                                  -> Image download -> DB commit -> Report
```

Only ports 80/443 exposed; PostgreSQL private. Run image downloads with low concurrency (e.g. 2–4) and stream content; never load all images into memory. Build images in CI, not on VPS. Maintain daily encrypted off-server DB backups and restore tests.

## 4. Core Database Design

Use UUID primary keys and UTC timestamps. Store monetary amounts as integer minor units (LKR cents) and never use floating-point calculations for totals. Key tables:

- `users`, `sessions`, `addresses`, `roles`, `permissions`, `user_roles`, `role_permissions`
- `categories(id,parent_id,name,slug,...)`, `brands(id,name,slug,...)`
- `products(id,category_id,brand_id,name,slug,short_description,description,status,seo_title,seo_description,source_system,source_id,...)`
- `product_categories(product_id,category_id)` for multiple WooCommerce category paths
- `product_variants(id,product_id,sku,title,price_minor,compare_at_minor,weight_grams,active,source_system,source_id,...)`
- `attributes`, `attribute_values`, `variant_attribute_values`; optionally `product_attribute_options` for configurable choices
- `inventory(variant_id,on_hand,reserved,low_stock_threshold,version)`, `inventory_movements`
- `media_assets(id,storage_key,source_url,sha256,mime,width,height,bytes,download_status,...)`
- `product_images(id,product_id,variant_id nullable,media_asset_id,sort_order,is_primary,alt_text)`
- `carts`, `cart_items`, `wishlists`, `orders`, `order_items`, `order_addresses`, `order_status_history`, `stock_reservations`
- `payments`, `payment_events`, `refunds`, `shipping_zones`, `shipping_rates`, `shipments`, `coupons`, `coupon_redemptions`
- `banners`, `pages`, `reviews`, `settings`, `audit_logs`, `outbox_events`

**Migration-specific tables (mandatory):**

```text
import_jobs
  id, created_by, filename, file_sha256, source_type, mode, status,
  total_rows, processed_rows, created_count, updated_count, skipped_count,
  failed_count, image_success_count, image_failure_count,
  started_at, completed_at, report_storage_key, created_at

import_rows
  id, import_job_id, row_number, source_id, source_type,
  source_parent_id, normalized_json, validation_errors_json,
  target_product_id, target_variant_id, status, created_at

import_media_tasks
  id, import_job_id, source_url, target_media_id, status,
  attempts, last_error, next_retry_at, created_at

source_product_mappings
  source_system, source_id, target_product_id nullable,
  target_variant_id nullable, last_import_hash, last_seen_at
  UNIQUE(source_system, source_id)

export_jobs
  id, created_by, format, filters_json, status,
  file_storage_key, row_count, expires_at, created_at
```

Never overwrite live prices/stock on repeated imports without an explicit mode and dry-run summary. Unique `(source_system, source_id)` prevents duplicate migration rows. Store original source ID even if SKU is generated.

## 5. Exact WooCommerce CSV Field Mapping

| WooCommerce CSV | New DB / logic |
|---|---|
| `ID` | `source_product_mappings.source_id`, not new PK |
| `Type=simple` | Create product + one default sellable variant |
| `Type=variable` | Create parent product; child `variation` rows become variants |
| `Type=variation` | Link by `Parent=id:<ID>` to parent; unresolved -> review queue |
| `SKU` | Use if non-empty/unique; else deterministic `WC-<ID>` |
| `Name` | Product name or variation label; normalize whitespace |
| `Published`, `Visibility in catalog` | Map to draft/published/hidden according to rules |
| `Short description`, `Description` | Sanitize HTML; preserve allowed formatting |
| `Regular price` | Normal/list price; decimal parse -> integer cents |
| `Sale price` | Active sale price if valid and <= regular price; otherwise flag |
| `Date sale price starts/ends` | Optional scheduled sale window; parse timezone safely |
| `Categories` | Split WooCommerce comma-separated category paths; `>` means hierarchy; create nested categories; assign multiple categories |
| `Brands` | Normalize/create brand; flag ambiguous/multiple brand values |
| `Images` | Parse comma-separated URLs; primary first, gallery remainder; download, validate, store and link |
| `Parent` | Variation parent ID reference |
| `Attribute 1 name`, `Attribute 1 value(s)` | Attributes and variant choices; parse multi-values carefully |
| `In stock?`, `Stock`, `Low stock amount` | Stock flags and quantity; missing quantity -> review, not fabricated stock |
| `Backorders allowed?`, `Sold individually?` | Inventory/order constraints |
| `Weight (kg)`, dimensions in cm | Convert weight to grams; preserve dimensions in standardized units |
| `Meta: _yoast_wpseo_metadesc`, `Meta: _yoast_wpseo_title` | SEO description/title where present |
| `Tags` | Optional product tags |
| `Allow customer reviews?` | Product review setting |
| `Meta: woodmart_*`, `Meta: fb_*` | Ignore by default; preserve raw import metadata for audit if useful |

**Price interpretation:** WooCommerce regular price is list price; when sale price is active, `price_minor=sale` and `compare_at_minor=regular`. No sale -> `price_minor=regular`, compare-at null. Reject malformed/negative values. Never guess tax treatment; client must confirm VAT policy.

**Variation resolution:** Process simple + variable parent records first, then child variations. For the 11 rows with blank `Parent`, attempt safe match only if reliable source metadata supports it; otherwise mark `NEEDS_REVIEW`. Never publish unattached variation as a separate product by default.

**Missing images:** Keep product in draft or publish with a configured placeholder only after admin approval. Log all missing images.

## 6. Product Image Migration Architecture

### Workflow
1. Upload CSV to admin. Store original file in private object storage; calculate SHA-256.
2. Parse CSV streaming into `import_rows`, preserving source row numbers and raw values.
3. Extract image URLs and normalize safely (trim whitespace, decode HTML entities, preserve valid URL paths, deduplicate by canonical URL without breaking signed URLs).
4. Restrict download sources to **explicit allowlisted WordPress media hosts** (`www.dwstore.lk` / approved redirects). Reject private IPs, loopback, link-local and unsafe redirects (SSRF protection). Use HTTPS where supported.
5. Download in worker jobs with timeouts, retries, exponential backoff, content-length/max-byte limits, streaming to temporary files, and strict concurrency limits.
6. Validate actual file magic bytes, MIME, image dimensions and decode safety; reject HTML/error pages masquerading as JPGs.
7. Create optimized derivatives with Sharp (e.g. thumbnails 320px, 640px, full 1200px WebP; preserve original where licensed and needed). Avoid upscaling tiny sources.
8. Compute content hash; deduplicate binaries by hash; upload to private/public appropriate object storage key such as `products/<uuid>/<hash>-640.webp`.
9. Insert `media_assets`, link via `product_images` maintaining image order and first-image primary flag. For variation images, link to variant.
10. Record success/failure per URL; retry failures independently. Never mark image import successful before object is stored and DB linked.
11. Admin sees missing-image report and can upload replacement files or re-run failed downloads.
12. After successful migration, product images should load from **new storage/CDN**, not old WordPress URLs. Old website can then be retired after verification.

**Critical:** The CSV contains **URLs only, not embedded image binaries**. The agent must verify that old WordPress images remain reachable. If URLs are inaccessible, request `wp-content/uploads` archive, WordPress media export, or server backup. Do not delete old hosting until images and redirects have been verified.

## 7. Admin Product Import / Export Module (mandatory)

### Admin navigation
`Products > All Products | Add Product | Import Products | Export Products | Import History | Media Failures`

### Import wizard
1. **Upload:** CSV (WooCommerce preset or Native CSV), file-size limits and antivirus/malware checks where available.
2. **Source detection:** Auto-detect WooCommerce headers; show row counts/types and sample preview.
3. **Field mapping:** WooCommerce preset with editable mappings for unknown custom columns.
4. **Mode:** `Create only`, `Upsert by source ID`, `Update selected fields`, `Images only`, `Dry run`.
5. **Validation preview:** Missing names/prices, invalid attributes, missing parents, duplicate IDs, image URLs, category collisions; downloadable error CSV.
6. **Options:** Import images yes/no; publish valid products or save drafts; update stock/prices toggles; retry failed images.
7. **Run:** Create background job, show progress, processed/created/updated/skipped/failed, cancel request and logs.
8. **Review:** Show unresolved variations, products without images, missing stock and suspicious prices.
9. **Result:** Download report CSV; preview imported products; rerun safely.

### Export wizard
- Formats: **Native CSV** (round-trip import/export), **WooCommerce-compatible CSV** (best-effort interoperability).
- Filters: category, brand, published status, date range, stock status, selected product IDs.
- Options: include variations, image URLs, descriptions, SEO metadata, inventory.
- Export absolute public image URLs for images, not storage credentials or private paths.
- Generate files asynchronously, with short-lived authenticated download links and cleanup/retention policy.
- Protect CSV against spreadsheet formula injection by escaping dangerous leading characters in free-text fields.
- Do not export passwords, sessions, private customer information or secrets.

### APIs
```text
POST   /api/v1/admin/imports/products/upload
POST   /api/v1/admin/imports/products/:id/preview
POST   /api/v1/admin/imports/products/:id/execute
GET    /api/v1/admin/imports/products/:id
GET    /api/v1/admin/imports/products/:id/errors
POST   /api/v1/admin/imports/products/:id/retry-images
POST   /api/v1/admin/imports/products/:id/cancel
GET    /api/v1/admin/imports/products
POST   /api/v1/admin/exports/products
GET    /api/v1/admin/exports/products/:id
GET    /api/v1/admin/exports/products/:id/download
```
All endpoints require admin permissions. Use resumable durable job state and rate limits. Import and export actions are audit logged.

## 8. Idempotency and Transaction Strategy

- `DRY_RUN` performs validation and estimates changes, **never writes catalog data**.
- Import stage creates normalized rows first; DB commits in small bounded batches with transactions, not one transaction for all 531 rows and images.
- Parent products committed before variants; media tasks are decoupled from catalog commits.
- Re-import same file in upsert mode must not create duplicate products or variants; use source mapping and import hash.
- Explicit conflict policy: `source_wins`, `existing_wins`, or per-field; default **existing_wins for stock/price after initial migration** to avoid overwriting live admin changes.
- Generate slugs uniquely and deterministically; maintain redirects from legacy WordPress slugs/URLs to new product URLs when known.
- Record source IDs and normalized payload hashes to support incremental migration.
- Import failure must not corrupt already-valid products. Provide row-level error reporting.

## 9. Full Storefront Features

Homepage with category navigation, search, hero banners, brands, best sellers, featured products and promotions. Product listing with category/brand/price/stock/attribute filters and pagination. Product detail with variants, images, specs, warranty and related items. Guest/user cart, checkout, COD/bank transfer/hosted gateway, accounts, wishlist, order tracking, shipping zones, coupons, SEO metadata, sitemap, structured data, transactional email and policy pages. Mobile responsive and accessible UI.

## 10. Full Admin Features

Dashboard, product/category/brand CRUD, variation and stock management, import/export, image failure repair, order management, shipping fees, payment status/refunds, customers, coupons, banners, content pages, reviews, reports, staff RBAC, audit logs and settings. HTML/CSS/JS purchased admin template may be converted to React/Vite components; remove demo data and integrate typed API calls. Enforce RBAC in NestJS, not just in UI.

## 11. Security / Payments / Inventory

Use secure HttpOnly cookies, CSRF protection, strict CORS allowlist, session rotation, admin MFA, Argon2id password hashes, validation and rate limits. Verify payment gateway signatures and order amounts server-side; redirect is not proof of payment. Never store payment card data. Reserve stock transactionally to avoid overselling; maintain immutable order item price/name snapshots. Log admin stock/price changes. Sanitize imported HTML to prevent stored XSS; never trust imported CSV URLs or values. Apply least privilege to storage and DB.

## 12. VPS Operations

Hetzner 2 vCPU/4 GB/40 GB is initial target, not a throughput guarantee. Deploy Nginx + Next.js + NestJS + Postgres + static admin with Docker Compose; run bounded background worker in API or separate lightweight worker with limited concurrency. Do not run Redis/Elasticsearch initially. Prebuild images in CI. Configure firewall, SSH keys, TLS, log rotation, health checks, memory limits, daily offsite backups, restore tests and uptime alerts. Prefer external object storage for thousands of product images. Keep old WordPress website/images available until migration verified.

## 13. Implementation Phases and Acceptance Tests

1. **Foundation:** monorepo (`apps/storefront`, `apps/admin`, `apps/api`), TypeScript, Prisma, Docker, CI, env examples.
2. **Schema:** catalog, variants, categories, media, orders, auth, migration jobs, source mappings; seed admin.
3. **Importer:** streaming CSV parser, WooCommerce mapper, dry run, parent/child linking, errors, upsert.
4. **Images:** URL downloader with SSRF protection, Sharp, object storage, dedup, retry and media report.
5. **Admin:** template integration, product CRUD, import/export UI, inventory, orders, CMS, RBAC.
6. **Storefront:** SSR pages, search, variants, cart, SEO, account and checkout.
7. **Payments/shipping:** COD, bank transfer, hosted gateway sandbox, webhooks, shipping rates.
8. **Testing:** unit, integration, Playwright E2E, security, accessibility, SEO, image migration and concurrency tests.
9. **Deployment:** Hetzner Docker Compose, Nginx/TLS, offsite backups, monitoring, DNS, staging then production.
10. **Cutover:** compare old/new catalog, image coverage, URLs/redirects, price/stock sampling, freeze old changes, final delta import, DNS cutover, rollback plan.

**Mandatory migration acceptance tests:**
- Parser reads exactly 531 rows and 152 headers from the supplied CSV.
- Detects 369 simple, 38 variable, 124 variation rows.
- Produces 407 top-level product candidates, with variants correctly linked.
- Flags 11 parentless variation rows for review; no silent data loss.
- Preserves all original source IDs and maps re-import idempotently.
- Produces per-image success/failure counts; no claim of complete image migration until actual downloads verified.
- Product prices and categories spot-checked against source; no wrong stock assumptions.
- Import/export round-trip retains supported fields; Native CSV export can be re-imported without duplicates.
- Concurrent checkout cannot oversell; admin-only routes cannot be accessed by customers.

## 14. AI Agent Execution Prompt

> Read this specification and inspect the provided WooCommerce CSV before coding. Build the Next.js + React/Vite Admin + NestJS + PostgreSQL/Prisma project in phases. Prioritize the CSV migration and admin import/export system so existing products and images can be reused. Begin by generating the database schema, import mapping code, dry-run validation report and tests using the actual 531-row CSV. Treat the 11 parentless variations as review cases. Build secure image downloading and storage with per-URL reporting. Never fake successful downloads, tests, credentials or deployment. After each phase list files changed, exact commands, test results, unresolved issues and next steps. Request the purchased template source and payment gateway credentials only when needed.

## 15. Inputs Still Needed

- Purchased frontend and admin template source files and licenses.
- Access to old `www.dwstore.lk` images or WordPress `wp-content/uploads` backup; verify download permissions.
- Brand assets, product warranty/tax rules, payment merchant account, delivery zones/rates.
- Domain/DNS, object storage account, SMTP, and production secrets.
- Client approval for handling 11 parentless variations and products without images.

**Do not decommission WordPress before migration and image verification are complete.**


---

# PART II — Complete Build Contract and Engineering Implementation Instructions

This part is integral to the preceding migration specification. The AI agent must implement **both** parts. Do not interpret the import subsystem as a one-time script only: it must be a permanent, permission-protected admin feature.

## 16. Architecture decisions and non-negotiable requirements

**Architecture:** a TypeScript monorepo with three deployables, one API and one PostgreSQL database. Keep a modular monolith in NestJS; do not split into microservices. Use `pnpm` workspaces, explicit contracts, API OpenAPI schema, and CI-generated typed API clients.

| Application | Framework | Hosting mode | Main responsibility |
|---|---|---|---|
| Public website | Next.js App Router + React + TypeScript + Tailwind CSS | Standalone Node production server behind Nginx | SEO, storefront, customer journey |
| Admin website | React + Vite + TypeScript | Static assets served by Nginx | Catalog, orders, inventory, CSV import/export, reports |
| Backend | NestJS + TypeScript | Containerized Node production process | REST API, auth, payment, jobs, domain rules |
| Database | PostgreSQL + Prisma | Private container, persistent volume | Catalog, users, inventory, orders, migration state |
| Product images | S3-compatible object storage | External storage, served via CDN | Permanent image copies independent of WordPress |
| Background tasks | Postgres-backed durable queue/outbox | One bounded worker process | CSV batches, image downloads, emails, cleanup |
| TLS/routing | Nginx + Let's Encrypt | VPS | Reverse proxy, security headers, HTTPS |

**Admin template:** The user's purchased HTML/CSS/JS template is acceptable. Convert it to maintainable React/Vite components; do not require a React-specific template purchase. Preserve licensed CSS/JS and layout where feasible, replacing direct DOM mutations with React-controlled behavior. If conversion is unreasonably costly, document that decision and offer a separate server-rendered admin architecture for approval, but **do not silently change the locked stack**.

**Customer template:** Prefer a Next.js/React/TypeScript template. If only HTML/CSS/JS is available, convert into React components and retain original licensed assets.

**Version policy:** Choose currently supported compatible versions of Node LTS, Next.js, NestJS, Prisma, React, PostgreSQL and Vite when implementation begins. Pin dependency versions/lockfile. Test production builds. Never rely on an unverified version number in this spec.

## 17. Feature-by-feature public website build

### 17.1 Global shell
- Announcement bar; responsive header with logo, category mega-menu, predictive search, account, wishlist and cart badge.
- Sticky mobile-friendly navigation, accessible keyboard support and screen-reader labels.
- Footer with contact information, social links, legal pages, shipping/returns, newsletter opt-in only with consent.
- Site-wide loading, error, empty, not-found and maintenance states.

### 17.2 Home
- Admin-managed hero banners (desktop/mobile images, alt text, start/end date, click target, sort).
- Category circles/tiles, featured brands, new arrivals, best sellers, featured products, editorial promotion blocks, vendor-neutral CTA where applicable.
- Data comes from API; no hardcoded product inventory.

### 17.3 Catalog
- Routes `/shop`, `/category/[slug]`, `/brand/[slug]`, `/product/[slug]`, `/search`.
- Facets: categories, brands, attributes, price range, in-stock, sort, pagination.
- Use URL query params for filters and stable shareable URLs.
- Show variant-specific pricing, availability, sale windows, and stock status.
- Product pages: image gallery, description, technical specifications, warranty, SKU, stock, related items, structured metadata.
- Do not show false reviews or fabricated ratings.

### 17.4 Shopping and accounts
- Guest cart stored via secure session; merge into user cart after login.
- Server-side checkout quote and recalculation at order creation.
- Guest checkout, optional account creation, shipping address with Sri Lankan district/province, COD, bank transfer and approved online gateway.
- Customer order history, saved addresses, wishlist, password reset, account profile.
- Guest tracking requires verification token/OTP; order number alone must not expose personal details.
- Transactional email for order placement, payment confirmation, shipment and reset links.

### 17.5 CMS and SEO
- Admin-editable About, Contact, Shipping, Returns, Warranty, Privacy and Terms pages.
- Next.js metadata, canonical URLs, sitemap, robots.txt, OpenGraph, Product/Offer/Breadcrumb JSON-LD.
- Server-render public product/category content; protect account/cart/checkout from shared caching.
- Admin publishing invalidates cached product/category/home pages.
- Redirect imported legacy WooCommerce product URLs to new canonical URLs when old URLs can be determined; create a `legacy_redirects` table.

## 18. Admin panel build contract

### Required sections
1. Dashboard — revenue, paid orders, pending fulfillment, low-stock alerts, import activity.
2. Catalog — categories, brands, products, variants, attributes, media gallery, bulk publish/archive.
3. Inventory — stock quantities, reservations, adjustments with reason and audit trail.
4. Orders — search, filters, details, allowed status transitions, shipment tracking, refunds with permission.
5. Customers — account lookup and authorized support tools.
6. Marketing — banners, coupons, featured collections, SEO.
7. Content — legal/static pages, navigation, site settings.
8. **Imports & Exports** — CSV upload, preview, mapping, validation, import execution, per-row results, media retry, export download.
9. Reporting — sales, popular products, stock and exports.
10. Administration — staff accounts, RBAC, MFA, activity logs, integration status.

### Import/export screens
- `/imports`: history with file, operator, time, status, progress, counts, errors.
- `/imports/new`: file upload, CSV type detection (WooCommerce or native), encoding and delimiter check.
- `/imports/:id/preview`: show mapped fields, first sample records, product type breakdown, warnings, orphan variants, duplicates, images.
- `/imports/:id/run`: confirmation with dry-run summary, then background import.
- `/imports/:id`: progress, imported/updated/skipped/failed counts, resumable job state, downloadable error CSV.
- `/imports/:id/images`: image queue progress, failed URLs, safe retry.
- `/exports`: full or filtered export with native format, WooCommerce-compatible format where possible, image URLs and variant rows.
- `/exports/:id`: job status and time-limited secure download.

**Export must never embed image binaries in CSV.** Export stable public media URLs and optionally provide a separate ZIP of media with a manifest if explicitly requested.

## 19. Exact migration semantics and safety

### 19.1 Supplied file facts
The supplied file `wc-product-export-23-10-2026-1792752032411.csv` was inspected. It has **531 rows, 152 columns**, with **369 simple**, **38 variable** and **124 variation** rows. **439** rows contain `Images`; **92** do not. All **531** SKU cells are blank. **11** variation rows have blank `Parent` and require manual review, not blind attachment. There are **407 parent/top-level product records** before validation or deduplication.

The CSV contains remote WordPress image URLs, mostly under `https://www.dwstore.lk/wp-content/uploads/`. It **does not contain image binaries**. Old website access, an uploads directory backup or WordPress media export is needed for guaranteed image migration. Do not claim all images were migrated until checksums and media references are verified.

### 19.2 Import order
1. Upload original CSV to protected staging; store file hash, original filename, size, actor, timestamp.
2. Parse CSV with a streaming, RFC-4180-aware parser that handles quoted commas/newlines, UTF-8 BOM and malformed rows.
3. Store raw records and row numbers in staging; never discard original source fields.
4. Dry-run and produce a report of type counts, duplicate IDs, missing required names/prices, missing parents, invalid stock, malformed URLs, category hierarchy, brand labels and attribute combinations.
5. Import/merge category tree and brands.
6. Import simple products and variable parent products; create deterministic unique slug and stable source mapping.
7. Import variations only after parents; attach by WooCommerce `Parent` (`id:<ID>`) where valid.
8. Queue blank-parent/orphan variations for human review; do not make them independent products by default.
9. Build attributes/attribute values and variant attribute links. Ensure unique SKU for every sellable variant, e.g. `WC-<legacy-id>` with collision resolution.
10. Map regular/sale prices into integer LKR minor units, preserving zero/blank distinctions and scheduled sale windows.
11. Map stock fields carefully: missing quantity is not equivalent to zero; represent unknown inventory explicitly and block checkout until resolved when needed.
12. Sanitize imported HTML descriptions, preserving safe formatting only.
13. Queue image URLs after product database transaction commits.
14. Download/validate/deduplicate/upload images to owned object storage; associate gallery order and alt text.
15. Verify counts, price samples, category hierarchy, parent-child relations, image coverage and front-end rendering.
16. Export discrepancy report; approve go-live only after blockers are resolved.

### 19.3 Idempotent upsert and identity
- `source_system = "woocommerce"` + `source_id` (WooCommerce `ID`) is the stable import key; unique compound index.
- Keep `legacy_sku`, `legacy_slug`, `legacy_permalink` where present; preserve original ID in `external_product_mappings`.
- Re-importing the same file must not create duplicate products, variants or images.
- Offer modes: **create only**, **update existing**, **skip existing**, and **dry-run**.
- Default safe update: do not overwrite manually edited product fields without explicit import policy and preview.
- Detect duplicate source IDs, slugs, categories and images. Record deterministic resolution and audit.
- Use per-row/batch transactions; don't hold one DB transaction for the entire file or image downloads.
- Each row stores status and actionable error message. Retry only failed rows where possible.
- If an image fails, keep product and mark media as pending/failed, not silently successful.

### 19.4 Image downloader security and reliability
- Only permit `https` and configured allowlisted legacy media hosts. Validate hostname, DNS resolution and redirect destination on every hop; block private, loopback, link-local and cloud metadata IPs (SSRF protection).
- Limit redirects, concurrency (e.g. 2–3), response bytes, duration, content types, dimensions and decompression ratio.
- Validate magic bytes; reject SVG/scripts and unsupported file types unless separately sanitized.
- Use SHA-256 hash for deduplication; persist `source_url`, `storage_key`, `checksum`, `status`, `attempts`, `last_error`, `linked_product_id`.
- Create thumbnail and optimized display variants with Sharp; preserve originals where legally appropriate.
- Upload to object storage; generate public CDN URLs; never depend on WordPress hotlinks after launch.
- Respect old server rate limits; exponential backoff; support ZIP/upload fallback if URLs are inaccessible.
- The admin must expose missing-image report and retry controls.

### 19.5 New permanent data entities
Extend the core Prisma schema with:
- `external_product_mappings(source_system, source_id, entity_type, local_id, last_import_id, source_updated_at)`
- `import_jobs(id, actor_id, filename, file_hash, mode, status, total_rows, processed_rows, created_count, updated_count, skipped_count, failed_count, started_at, finished_at)`
- `import_rows(id, job_id, source_row_number, source_id, source_type, raw_json, mapped_json, status, error_code, error_message)`
- `import_field_mappings(id, source_format, mapping_json, version)`
- `import_media(id, import_job_id, source_url, resolved_url, checksum, storage_key, status, attempts, error_message)`
- `export_jobs(id, actor_id, format, filters_json, status, file_key, expires_at, error_message)`
- `legacy_redirects(id, old_path, new_path, http_status, enabled)`
- `media_assets(id, storage_key, mime_type, bytes, width, height, checksum, alt_text)`
- `product_media(product_id, variant_id_nullable, media_id, sort_order, is_primary)`

Use unique constraints and indexes for source IDs, file hash where relevant, job status, media checksum, old URL paths and product/variant media relations.

### 19.6 Import/export APIs
- `POST /api/v1/admin/imports` — multipart upload, limits, validation.
- `GET /api/v1/admin/imports`
- `GET /api/v1/admin/imports/:id/preview`
- `POST /api/v1/admin/imports/:id/start`
- `POST /api/v1/admin/imports/:id/cancel`
- `POST /api/v1/admin/imports/:id/retry`
- `POST /api/v1/admin/imports/:id/media/retry`
- `GET /api/v1/admin/imports/:id/errors.csv`
- `POST /api/v1/admin/exports` — filters + format.
- `GET /api/v1/admin/exports/:id`
- `GET /api/v1/admin/exports/:id/download` — authorized short-lived URL or stream.

All endpoints require admin role/permission checks. Restrict upload size and formats. Defend against CSV formula injection on export (escape cells beginning `=`, `+`, `-`, `@` when interpreted as formulas), path traversal, zip bombs, malicious HTML and external URL SSRF.

## 20. PostgreSQL/Prisma domain model and invariants

### Catalog
- `categories`: hierarchical with parent FK, slug, active status.
- `brands`: unique slug and optional logo.
- `products`: canonical name, slug, descriptions, status, SEO, source mapping, category/brand.
- `product_variants`: SKU unique, option combination, price, compare price, weight, active.
- `attributes`, `attribute_values`, `variant_attribute_values`.
- `inventory`: variant ID unique, `on_hand`, `reserved`, `low_stock_threshold`.
- `inventory_movements`: immutable adjustments ledger.
- `media_assets` and `product_media` for product/variant gallery.

### Customers and shopping
- `users`, `sessions`, `addresses`, `wishlists`, `carts`, `cart_items`.
- `orders`, `order_items` with price/name/SKU snapshots, `order_addresses` snapshots, `order_status_history`.
- `stock_reservations` with expiry and idempotent release.
- `payments`, `payment_events`, `refunds`.
- `shipping_zones`, `shipping_rates`, `shipments`.
- `coupons`, `coupon_redemptions`, `reviews`.
- `banners`, `pages`, `settings`, `audit_logs`, `outbox_events`.

### Money and time
- Store all monetary values as **integer minor units** (LKR cents) in database and API; use a money helper. Never use floating-point arithmetic for checkout totals.
- Store timestamps UTC, display in `Asia/Colombo`.
- Support `LKR` only for initial launch; explicitly define tax/VAT applicability with client.
- SKU and slug uniqueness must be enforced at DB level.
- Order history must not change when product title/price changes.

### Inventory and payment concurrency
- Checkout validates and recalculates prices on server.
- Use PostgreSQL transaction with row locks or conditional updates for stock reservation; available = on_hand − reserved.
- Payment webhook signature, amount, currency and order ID verification required.
- Deduplicate gateway events with unique provider event IDs and transaction boundaries.
- Browser payment success redirect is never proof of payment.
- COD orders have independent payment status; never mark COD as prepaid.
- Failed/expired payments release reservations exactly once.
- Outbox job pattern for emails, notifications and image work; do not perform remote network requests inside long-running DB transactions.

## 21. Backend REST API minimum contract

Use versioned `/api/v1` routes. Provide OpenAPI docs and typed client. Validate request bodies, query parameters and authorization.

**Public:** `/home`, `/products`, `/products/:slug`, `/categories`, `/brands`, `/search/suggestions`, `/pages/:slug`.

**Identity:** `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/me`, `/auth/forgot-password`, `/auth/reset-password`, `/account/profile`, `/account/addresses`, `/account/orders`, `/account/wishlist`.

**Shopping:** `/cart`, `/cart/items`, `/checkout/quote`, `/checkout/orders`, `/payments/:provider/initialize`, `/payments/:provider/webhook`, `/orders/track`.

**Admin:** `/admin/dashboard`, catalog CRUD, variant/media management, stock adjustments, orders/status transitions, shipments, customer lookup, coupons, banners, CMS, users/roles, reports, audit logs, import/export endpoints from section 19.

Standardize response shape and error codes. Paginate all lists; allowlist sorting/filter fields; use structured request IDs. Protect guest order lookup with secure token/verification, not only sequential order number.

## 22. Authentication and hardening

- Secure, HttpOnly, SameSite cookies and server-side session storage (hashed opaque tokens). CSRF tokens for browser mutations. Strict CORS allowlist for storefront/admin origins.
- Admin MFA and permissions (super admin, catalog manager, order manager, content editor).
- Password hashing via Argon2id, secure reset links, login throttling, session rotation on privilege change.
- Server-side authorization for every admin API; UI hiding alone is not authorization.
- Validate/sanitize descriptions, CMS HTML, upload MIME, file size, image metadata and URLs.
- Use parameterized DB access through Prisma; protect against XSS, CSRF, SSRF, IDOR, open redirects.
- Do not store credit card data or gateway secrets in settings tables.
- Redact secrets/PII in logs. Keep encrypted off-server backups, restore tests and retention policies.
- Review Sri Lankan data protection requirements and cross-border data transfer implications for German hosting.

## 23. Monorepo layout and development conventions

```text
ecommerce/
├── apps/
│   ├── storefront/       # Next.js App Router, TS, Tailwind
│   ├── admin/            # React, Vite, TS, purchased admin theme
│   └── api/              # NestJS, Prisma, domain modules
├── packages/
│   ├── contracts/        # OpenAPI-derived shared DTO/types
│   ├── ui/               # Optional reusable primitives
│   └── config/
├── infrastructure/
│   ├── docker/
│   ├── nginx/
│   ├── scripts/
│   └── backups/
├── docs/
│   ├── decisions/
│   ├── migrations/
│   ├── runbooks/
│   └── admin-guide/
├── .github/workflows/
├── compose.yaml
├── compose.dev.yaml
├── pnpm-workspace.yaml
├── .env.example
└── README.md
```

Use ESLint, Prettier, strict TypeScript, conventional naming, feature modules, DTO validation, central error handling, centralized logging, environment schema validation, no hardcoded secrets. Write migration SQL/Prisma migration files and seeders. Provide sample non-sensitive seed data.

## 24. Hetzner VPS deployment and operations

**Observed VPS:** 2 vCPU, 4 GB RAM, 40 GB local disk, Germany/Nuremberg. Initial launch suitable subject to load testing; no performance guarantee.

- Install supported Ubuntu LTS, Docker Engine/Compose, Nginx and TLS certificates.
- Deploy production images prebuilt in CI; avoid compiling Next.js on 4 GB production server.
- Route `www.domain.lk` → Next.js standalone service, `admin.domain.lk` → static admin build, `api.domain.lk` → NestJS.
- Keep PostgreSQL on private Docker network; no public DB port. Persist volume with correct backups.
- Prefer S3-compatible external media storage to avoid filling 40 GB disk.
- Avoid Redis/Elasticsearch initially; use one bounded Postgres-backed job worker for import/media.
- Enable firewall, SSH key auth, minimal open ports, log rotation, rate limiting, resource monitoring.
- Set up daily offsite encrypted DB backup and restore drill; VPS snapshot alone is insufficient.
- Set up uptime, error-rate, memory/disk and failed-import alerts.
- Use `.env.production` outside git; rotate secrets on handover.
- Implement deployment health checks, rollback instructions and one-at-a-time migrations.
- Configure SPF, DKIM, DMARC for transactional email.
- Enable optional Cloudflare CDN for static assets and images; do not publicly cache authenticated responses.

**Example routing:**
```text
HTTPS Nginx :443
  ├─ www.domain.lk   → storefront:3000
  ├─ admin.domain.lk → admin static files
  └─ api.domain.lk   → api:4000
                             └─ postgres:5432 (private only)
```

## 25. Automated tests and migration acceptance

### Product migration tests
1. Parse the supplied CSV and assert **531 rows / 152 columns**.
2. Assert type distribution: **369 simple / 38 variable / 124 variation**.
3. Import parent rows before children; do not show variation rows as separate storefront products.
4. Produce an explicit report for **11 blank-parent variation rows**.
5. Generate unique deterministic SKU values for all sellable variants where source SKU missing.
6. Reimport same file and verify **zero unintended duplicate products/variants/media**.
7. Verify representative product prices, descriptions, categories, attributes and SEO metadata.
8. Download sample images; validate MIME, checksum, storage URL and storefront rendering.
9. Simulate unavailable URLs, timeouts, 404s, redirects and malformed images; verify retry and error reporting.
10. Export catalog to CSV and reimport into a clean staging DB; compare normalized fields and image URL references.
11. Verify dry-run causes no catalog mutations.
12. Verify non-admin users cannot upload/import/export or retrieve private error reports.

### Full system tests
- Unit tests for price calculation, coupon logic, shipping, stock reservations and order transitions.
- Integration tests for Prisma models, authentication, admin RBAC and CSV workers.
- Playwright end-to-end: browse → cart → COD checkout → order confirmation → admin fulfillment.
- Payment sandbox tests for success/failure/cancel/duplicate/invalid-signature webhooks.
- Concurrent purchase of last available unit must not oversell.
- Security tests: unauthorized order lookup, upload abuse, CSV injection, SSRF, CSRF, XSS.
- Responsive UI, keyboard accessibility, sitemap/metadata and product structured data.
- Backup restore test, staging smoke test, production rollback rehearsal.

**Release gate:** no launch until migration discrepancy report is approved, essential images have been copied to owned storage, checkout tests pass, admin import/export works, backups are tested, and payment gateway integration is verified in sandbox.

## 26. Agent build phases — required order

| Phase | Build | Deliverable / acceptance |
|---|---|---|
| 0 | Inspect assets, CSV, templates, requirements | Confirmed assumptions and data audit |
| 1 | Monorepo, local Docker, CI, configs | All apps build; health endpoint |
| 2 | Prisma schema, migrations, auth, RBAC | Tests and clean DB seed pass |
| 3 | Catalog API, admin CRUD, media service | Admin-created product visible publicly |
| 4 | CSV import staging, preview, mapping, jobs | Dry-run and initial 531-row migration |
| 5 | Remote image copy, retries, discrepancies | Sample gallery and failure reports verified |
| 6 | Next.js storefront, SEO, responsive UI | Functional browsing/search/product pages |
| 7 | Cart, checkout, stock, COD | Successful and concurrent E2E tests |
| 8 | Payments, shipping, emails, returns | Verified webhook and fulfillment flows |
| 9 | Admin CSV export, native reimport, reports | Round-trip test and authorization pass |
| 10 | Security, load tests, documentation | UAT, restore test, staging approved |
| 11 | Hetzner production deploy | TLS, backups, monitoring, smoke tests |

**After each phase, the agent must report:** changed files, commands run, migrations, tests passed/failed, actual blockers, remaining work. Do not invent test results or claim production deployment without server access. Commit each phase coherently.

## 27. Final handover package

- Working frontend, admin, backend and database migrations.
- Original import preserved; migration logs and discrepancy report.
- Export/import admin manual, supported CSV schema and sample file.
- Product image storage and recovery instructions.
- OpenAPI specification and generated client.
- Domain, TLS, Docker Compose, CI/CD and rollback docs.
- Admin user guide, customer support workflow, audit trail.
- Backup/restore scripts and verification record.
- Template/image/font license inventory and source attribution as required.
- Security checklist, environment variable inventory (no secrets), and client acceptance checklist.

## 28. Start prompt for your AI coding agent

> Read `FULL_ECOMMERCE_AI_AGENT_BLUEPRINT.md` in full, including Part I and Part II. Implement a production-ready Sri Lankan single-vendor electronics eCommerce platform on Hetzner VPS using Next.js App Router + React/TypeScript/Tailwind for the storefront, React/Vite/TypeScript for admin (adapt my licensed HTML/CSS/JS template), NestJS/TypeScript for the API, PostgreSQL/Prisma for data, and Docker Compose/Nginx for deployment. The supplied WooCommerce CSV is mandatory input: implement a reusable admin CSV import/export subsystem, migrate products/variations/categories/attributes/prices/SEO, safely copy product images from old WordPress URLs to our own object storage, preserve legacy IDs and prevent duplicates. Begin with Phase 0: inspect the repository, uploaded CSV and available template files; verify assumptions and report missing inputs. Then implement phases in order with actual code, migrations, automated tests, deployment files, documentation and honest status reports. Never fake credentials, image download success, payment verification, tests or deployment. Ask only for genuinely blocking external inputs.

