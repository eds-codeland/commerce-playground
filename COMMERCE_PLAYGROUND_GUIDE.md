# Commerce Playground (Edge Delivery Services + Adobe Commerce)

This repository is an **Edge Delivery Services (EDS)** storefront built on the **Adobe Commerce boilerplate**.
It combines:

- **Document-based authoring** (DA.live / Google Docs / Word / SharePoint) → rendered by EDS
- **EDS blocks** (HTML + CSS + JS decorators)
- **Adobe Commerce drop-in components** (cart/checkout/auth/account/etc.)
- **GraphQL data fetching** (Core Commerce GraphQL + Catalog Service GraphQL)

The goal of the “playground” is to give you a working storefront you can:

- customize visually through content,
- extend via blocks and templates,
- integrate with your own Commerce backend by updating configuration (see `demo-config.json`, `config.json`, and production config options below).

---

## How the storefront works (runtime flow)

At a high level, the runtime is:

1. **Authoring**
   - Content is authored in DA.live (or other supported authoring sources).
   - Authors build pages out of **sections** and **blocks** (tables become blocks).

2. **Server-side rendering (EDS)**
   - EDS converts authored content into HTML.
   - Blocks appear in HTML as:
     - a `div` with a block name class (example: `div.commerce-cart`)
     - nested `div` rows/columns from the authored table

3. **Client-side decoration**
   - The browser loads `scripts/scripts.js`.
   - `scripts/scripts.js` initializes commerce configuration, then:
     - decorates sections and blocks
     - loads block JS/CSS on demand

4. **Commerce initialization**
   - `scripts/commerce.js` loads and caches `config.json`, then initializes:
     - GraphQL clients
     - drop-in component initializers
     - page-type behaviors (PDP/PLP/cart/checkout/etc.)

5. **Drop-ins + GraphQL**
   - Commerce blocks mount drop-in components.
   - Drop-ins fetch data using configured endpoints/headers.

---

## Key entry points

### `scripts/scripts.js` (bootstraps the page)
This is the main orchestrator. It runs the EDS loading phases:

- **Eager phase** (`loadEager`) — aims to get to LCP quickly
  - `initializeCommerce()`
  - `decorateMain()` (sections/blocks)
  - `applyTemplates()`
  - `loadCommerceEager()`
  - if commerce init fails, loads `418.html` via `loadErrorPage(418)`

- **Lazy phase** (`loadLazy`) — loads remaining sections, header/footer, lazy CSS/fonts
  - `loadHeader()` / `loadFooter()`
  - `loadCommerceLazy()`

### `scripts/aem.js` (EDS core helpers)
Owns the generic EDS behaviors:

- block discovery and decoration
- `loadBlock()` which dynamically imports:
  - `blocks/<blockName>/<blockName>.js`
  - `blocks/<blockName>/<blockName>.css`

### `scripts/commerce.js` (commerce engine)
Owns commerce-specific behaviors:

- `initializeCommerce()`
  - loads `config.json` (cached in session storage)
  - sets up two GraphQL clients:
    - `CORE_FETCH_GRAPHQL` → `commerce-core-endpoint`
    - `CS_FETCH_GRAPHQL` → `commerce-endpoint` (Catalog Service)
  - sets required request headers from `config.json`
  - calls `scripts/initializers/index.js` to initialize drop-ins

- `loadCommerceEager()`
  - detects page type (PDP/PLP/cart/checkout/CMS)
  - initializes Adobe Data Layer

- `decorateLinks()` / `rootLink()`
  - localizes internal links when the site has locale roots

---

## Configuration (connect to your Commerce backend)

## Configuration files (local vs production)

This repo supports the same configuration approaches described in the official boilerplate docs:

- **Local development**: `demo-config.json` (or other demo config files)
- **Production**: Configuration Service (recommended) or repo-based `config.json`

### Local development: `demo-config.json`

This repo includes `demo-config.json` (demo backend: `aemshop.net`). In the boilerplate, the local dev server typically serves this as `/config.json` during development.

If you want to connect your own backend locally, start by updating the values in `demo-config.json`.

### Repository override: `config.json`

This repo also contains a root-level `config.json`. At runtime, `scripts/commerce.js` fetches `/config.json` from the current origin.

That means:

- If your deployment serves the repo’s `config.json` at `/config.json`, it will be used.
- If you use the Configuration Service in production, **a repo-local `config.json` can override it** (depending on your setup).

### Production (recommended): Configuration Service

For production, Adobe recommends using the Configuration Service so you can change commerce settings without redeploying code.

Typical location:

- `https://admin.hlx.page/config/{ORG}/sites/{SITE}/public.json`

---

## What’s inside the config

The config (regardless of where it comes from) contains:

- **Core GraphQL endpoint** (`commerce-core-endpoint`)
  - typically the Commerce instance GraphQL endpoint (example: `https://<domain>/graphql`)

- **Catalog Service endpoint** (`commerce-endpoint`)
  - used for high-performance catalog reads (Catalog Service)

- **Headers** (`headers.all`, `headers.cs`)
  - `headers.all` are used for common requests
  - `headers.cs` are used for Catalog Service requests (includes `x-api-key`, environment IDs, store codes)

If these values are wrong, `initializeCommerce()` may fail and you’ll land on the `418.html` error page.

---

## Content + code linkage

### `fstab.yaml`
EDS needs to know where your content lives. This repo uses DA.live as the mountpoint:

- `mountpoints./.url` points to the DA.live content folder
- `folders` provides content routing/mount mapping (example: product content mapping)

When cloning/adapting this repo for a new project, you typically change:

- `fstab.yaml` to your own DA.live content URL
- Sidekick config (see `tools/sidekick/config.json` in your project)

---

## Multistore (multiple locales/stores)

This repo supports the boilerplate multistore model: **one codebase**, multiple store views/locales, typically separated by **root folders** like `/en/`, `/en-ca/`, `/fr-ca/`.

### How multistore works here

- **Root folder drives configuration**
  - The boilerplate supports per-root overrides via config keys such as `"/en-ca/"` inside `public`.
- **Automatic link localization**
  - `scripts/commerce.js` localizes internal links so navigation stays within the current root.
  - Use `#nolocal` on links that must not be rewritten (for example, store switcher links).
- **Store switcher UI**
  - `blocks/footer/footer.js` renders a store switcher button when `isMultistore()` is true.
  - It loads the store switcher content from the fragment path `'/store-switcher'`.

### Content structure (DA.live)

Create one folder per store view (examples):

- `/en/`
- `/en-ca/`
- `/fr-ca/`

Each store root should contain:

- `index` (or other pages)
- `placeholders/` (localized placeholder JSON sheets)
- `store-switcher` (a fragment document)

### Folder mapping for PDPs (fstab)

This repo currently maps PDP folder-mapped routes like this:

- `/products/` → `/products/default`

For multistore, you typically add per-locale mappings (example):

```yaml
folders:
  /en/products/: /en/products/default
  /en-ca/products/: /en-ca/products/default
  /fr-ca/products/: /fr-ca/products/default
```

### Store-specific configuration overrides (config)

In `config.json` (or Configuration Service), add store-root keys under `public`.

Example shape:

```json
{
  "public": {
    "default": {
      "commerce-core-endpoint": "...",
      "commerce-endpoint": "...",
      "headers": {
        "all": { "Store": "default" },
        "cs": {
          "Magento-Store-Code": "main_website_store",
          "Magento-Store-View-Code": "default",
          "Magento-Website-Code": "base"
        }
      }
    },
    "/en/": {},
    "/en-ca/": {
      "headers": {
        "all": { "Store": "en-ca" },
        "cs": {
          "Magento-Store-Code": "ca-store",
          "Magento-Store-View-Code": "en-ca",
          "Magento-Website-Code": "base"
        }
      }
    },
    "/fr-ca/": {
      "headers": {
        "all": { "Store": "fr-ca" },
        "cs": {
          "Magento-Store-Code": "ca-store",
          "Magento-Store-View-Code": "fr-ca",
          "Magento-Website-Code": "base"
        }
      }
    }
  }
}
```

### Store switcher authoring (`/store-switcher` fragment)

Create a `store-switcher` document in each store root.

Important:

- Include `#nolocal` in the URLs so the automatic link localization does not rewrite the destination.

---

## Where to make changes

## 1) Add / customize blocks

Blocks live in `blocks/<block-name>/`.

A block typically has:

- `blocks/<name>/<name>.js` — `export default function decorate(block) { ... }`
- `blocks/<name>/<name>.css`

How blocks load:

- EDS finds `div.<block-name>` in the page
- `scripts/aem.js` lazy-loads the JS/CSS for that block
- `decorate(block)` transforms the authored HTML into the final DOM

Example block that fetches commerce data:

- `blocks/product-teaser/product-teaser.js`
  - imports `CORE_FETCH_GRAPHQL` from `scripts/commerce.js`
  - runs a GraphQL query and renders a small product grid

## 2) Customize commerce behavior

Most commerce-wide behaviors live in:

- `scripts/commerce.js`
- `scripts/initializers/` (drop-in bootstrap per domain)

This is where you change:

- how GraphQL is configured
- global commerce events
- page type detection
- drop-in initialization and extension patterns

## 3) Styling

- Global styles: `styles/`
- Block styles: `blocks/**/<block>.css`

---

## Running locally

This repo uses the AEM CLI dev server:

```bash
npm install
npm start
```

- `npm start` runs `aem up`
- local site should be available at `http://localhost:3000`

Note:

- `npm install` triggers `postinstall`, which runs `npm run install:dropins`.
- Drop-in assets are copied into `scripts/__dropins__/` so EDS can serve them.

---

## How drop-ins are loaded (import map)

Drop-in packages are installed from npm, but the site does **not** load them directly from `node_modules`.

Instead:

- `npm run postinstall` copies the runtime files into `scripts/__dropins__/`
- `head.html` defines an **import map** that maps package prefixes like:
  - `@dropins/storefront-cart/`
  - `@dropins/tools/`
  to paths under:
  - `/scripts/__dropins__/...`

This is why keeping `scripts/__dropins__/` in sync (via `postinstall`) is critical when upgrading drop-in versions.

---

## Drop-in components (what they are + how to customize)

### What are drop-ins?

Drop-ins are **full-featured commerce “mini apps”** (cart, checkout, PDP, auth, account, wishlist, recommendations, product discovery). They encapsulate UI + state + API calls and communicate through a shared event bus.

In this repo, “Commerce blocks” (for example `blocks/commerce-cart/`) are thin wrappers that:

- create containers/layout DOM,
- initialize the required drop-ins (via `scripts/initializers/*`),
- render drop-in containers into the page.

### Extend vs substitute vs create

- **Extend**: recommended approach (styling, slots, events, configuration).
- **Substitute**: replace a drop-in entirely with a third-party solution; higher maintenance burden.
- **Create**: build a brand-new drop-in using the SDK (not typically needed for storefront customization).

### Customization methods you’ll use in this repo

#### 1) Design tokens (global branding)

Design tokens are CSS variables that control colors, spacing, typography, shapes, etc.

- Where: `styles/styles.css`
- Pattern: update token values under `:root, .dropin-design { ... }` to apply brand-wide changes.

#### 2) CSS class overrides (targeted styling)

For drop-in-specific styling, add overrides either:

- **Globally** in `styles/styles.css` (affects the whole site), or
- **Per block** in `blocks/<block>/<block>.css` (loads only when that block is used).

Use DevTools to inspect the generated DOM and target drop-in BEM-style classes.

#### 3) Slots (deep UI customization)

Slots let you inject custom DOM/UI into extension points exposed by a drop-in container.

Example in this repo:

- `blocks/commerce-cart/commerce-cart.js` passes `slots` to `CartSummaryList`.

Slots are the preferred way to:

- add extra UI (promo banners, extra CTAs),
- integrate custom components,
- adjust rendering of specific sub-parts (thumbnails, item footer actions, etc.).

#### 4) Events (behavior customization)

Drop-ins publish/subscribe via the event bus:

- Where: `@dropins/tools/event-bus.js`
- This repo enables logging in `scripts/initializers/index.js` via `events.enableLogger(true)`.

Common patterns:

- listen for cart changes (`cart/data`, `cart/updated`)
- listen for auth/session changes (`authenticated`)

#### 5) Labels, dictionaries, and placeholders (text + localization)

Drop-in text is driven by dictionaries. In this repo, dictionaries are overridden via placeholder files fetched from content.

- Fetching mechanism: `fetchPlaceholders()` in `scripts/commerce.js`
- Drop-in initialization pattern: `scripts/initializers/<dropin>.js` creates `langDefinitions` from placeholders.

Examples:

- `scripts/initializers/cart.js` loads `placeholders/cart.json` and passes it via `langDefinitions`.
- `scripts/initializers/pdp.js` loads `placeholders/pdp.json`.
- `scripts/initializers/index.js` preloads global labels via `placeholders/global.json`.

This lets non-developers adjust UI strings (and translate them per locale for multistore) without changing code.

### Example: Cart drop-in containers (used by `commerce-cart`)

The cart experience is composed out of multiple **containers** from `@dropins/storefront-cart`, typically including:

- `CartSummaryList` (line items)
- `OrderSummary` (totals + checkout action)
- `EstimateShipping` (optional)
- `Coupons`
- `GiftCards`
- `GiftOptions`

In this repo, these are wired together in:

- `blocks/commerce-cart/commerce-cart.js`

Customization points:

- **Block configuration** (document-authored)
  - `blocks/commerce-cart/commerce-cart.js` reads options via `readBlockConfig(block)` (e.g. `enable-estimate-shipping`, `max-items`, `enable-updating-product`).
- **Slots** (developer extension)
  - The block passes `slots` into containers (for example, the `Footer` slot on `CartSummaryList`).

---

## Updating drop-ins

After upgrading a drop-in dependency, you must refresh the copied drop-in files:

```bash
npm run postinstall
```

This ensures `scripts/__dropins__/` matches what’s installed in `node_modules/`.

---

## Debugging checklist

- **418 error page**
  - Usually indicates `initializeCommerce()` failed.
  - Check DevTools console for `Error initializing commerce configuration:`.
  - Verify `config.json` endpoints and required headers.

- **GraphQL errors in blocks**
  - Check the GraphQL endpoint being used:
    - Core: `commerce-core-endpoint`
    - Catalog Service: `commerce-endpoint`
  - Confirm store headers (`Magento-Store-*`) match your backend.

- **Drop-in UI not rendering**
  - Ensure `npm install` / `npm run postinstall` has populated `scripts/__dropins__/`.
  - Confirm the relevant commerce block exists on the page (e.g. `div.commerce-cart`).

- **Authoring preview**
  - `scripts/scripts.js` supports DA preview mode when the URL contains `?dapreview`.

---

## Common extension points

- **New content block**
  - Create `blocks/my-block/my-block.js` + `my-block.css`.
  - Author a table named `my-block` in DA.live.

- **New commerce data block**
  - Import `CORE_FETCH_GRAPHQL` or `CS_FETCH_GRAPHQL` from `scripts/commerce.js`.
  - Keep rendering lightweight (Lighthouse).

- **Event-driven integrations**
  - Use the drop-ins event bus:
    - `import { events } from '@dropins/tools/event-bus.js';`

---

## File map (quick reference)

- `scripts/scripts.js`
  - page bootstrapping, eager/lazy loading
- `scripts/aem.js`
  - EDS core block/section loading
- `scripts/commerce.js`
  - commerce config + GraphQL + drop-in initialization
- `config.json`
  - endpoints, headers, analytics settings
- `fstab.yaml`
  - content mountpoint (DA.live)
- `blocks/`
  - site blocks (content + commerce)

---

## Status

- This guide is specific to the current repo layout and the Suite 4 drop-in tooling (`@dropins/tools ~1.5.x`).
