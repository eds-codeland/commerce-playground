# Product List Page Block

## Overview

The Product List Page block renders a product listing experience powered by the Product Discovery drop-in. It supports both search pages and category pages. For category pages, it applies a `categoryPath` filter and exposes the resolved category on the block DOM for use by other blocks (for example, `enrichment`).

## Integration

### Block Configuration

Configuration is read via `readBlockConfig()`.

- `urlpath` - Category path to filter by (enables category page mode)

### URL Parameters

- `q` - Search query (used when not in category mode)
- `page` - Pagination page number
- `sort` - Sort key
- `filter` - Serialized filter parameter(s)

### Events

#### Event Listeners

No required event listeners.

#### Event Emitters

No events are emitted.

## Behavior Patterns

### Page Context Detection

- **Category mode**: If `urlpath` is set or the current path starts with `/categories/`, the block treats the page as a category page.
- **Search mode**: Otherwise, the block treats the page as a search page.

### Category Context for Enrichment

When in category mode, the block sets `block.dataset.category` to the resolved category value so that other blocks (such as the `enrichment` block) can determine the current category.

### Error Handling

- Search errors are caught and logged to the console.
- The block falls back to search mode when no category can be resolved.
