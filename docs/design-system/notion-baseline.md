# Notion Visual Baseline

Thinking IDE uses Notion as the explicit visual baseline for workspace presentation.

This baseline is about structure, tone, and information hierarchy rather than exact duplication.

## Reference Points

Use these official Notion help references conceptually:

1. [Style & customize your content](https://www.notion.com/help/customize-and-style-your-content)
2. [Format your page with columns, headings, and dividers](https://www.notion.com/help/columns-headings-and-dividers)
3. [Layouts](https://www.notion.com/help/layouts)

These references are useful because they show how Notion treats:

1. typography and calm hierarchy
2. page composition and spacing
3. side detail surfaces and layout switching

## Baseline Principles

### 1. Workspace, Not Console

The right side should read like a thinking workspace.

Use:

1. calm headers
2. page-style titles
3. light status expression
4. restrained secondary actions

Avoid:

1. loud system chrome
2. debug-panel framing
3. visually dominant status badges
4. stacked control bars

### 2. Typography Carries Hierarchy

Primary structure should come from:

1. title scale
2. weight changes
3. spacing rhythm
4. paragraph-like grouping

Not from:

1. heavy color blocking
2. oversized capsules everywhere
3. excessive icon emphasis

### 3. Surfaces Stay Neutral

The default visual field should be mostly neutral.

Use:

1. warm white, paper, stone, and graphite neutrals
2. subtle separators
3. light elevation only where needed

Avoid:

1. saturated gradients as the main identity
2. dashboard-dark chrome
3. multi-hue status overload

### 4. Feedback Is Nearby And Light

Status should feel like page guidance, not modal interruption.

Preferred surfaces:

1. inline status text
2. subtle bottom logs
3. lightweight toast
4. quiet warning hinting for `source_lost`

### 5. Detail Surfaces Are Tool-Like

Floating toolbars, popovers, and panels should feel like document tools:

1. compact
2. lightly bordered
3. close to their target
4. text-first with icons as support

## Translation To Thinking IDE

The Notion baseline should be adapted like this:

| Notion quality | Thinking IDE translation |
|---|---|
| Page title calm | `ThinkingPanel` header behaves like a workspace title bar |
| Document spacing | Panel sections use generous vertical rhythm and lighter separators |
| Details panel logic | Editing surfaces feel like adjacent tools, not full control strips |
| Subtle state hints | `ready`, `synced`, `failed`, and `source_lost` use restrained semantic styling |
| Neutral canvas framing | The concept map sits on a light workspace surface, not a dramatic stage |

## Allowed Brand Separation

Thinking IDE should still keep its own identity.

Allowed differences from Notion:

1. concept-map specific node and edge affordances
2. source-linkage feedback between map and chat
3. slightly stronger spatial framing around the canvas
4. targeted accent colors for selection, relation editing, and warnings

## Review Questions

When reviewing a UI change, ask:

1. Does it feel closer to a page workspace or a control console?
2. Is hierarchy coming mostly from typography and spacing?
3. Are neutral surfaces doing most of the work?
4. Would a stronger treatment actually help the user think better, or just call attention to itself?
