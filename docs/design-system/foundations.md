# Foundations And Tokens

This document defines the initial foundation layer the frontend should implement against.

It is intentionally minimal and concrete enough for the current MVP.

## Foundations

### Color Direction

Use a restrained neutral palette with a small semantic accent set.

Core intent:

1. default workspace surfaces should feel paper-like and calm
2. contrast should come from ink, graphite, and border separation
3. accents should be sparse and meaningful

### Typography Direction

Typography should carry hierarchy first.

Preferred qualities:

1. readable sans serif with clean UI text
2. strong title-to-body scale separation
3. compact but breathable label styles
4. low reliance on all-caps or dense badge styling

### Spacing Direction

Spacing should feel editorial rather than cramped.

Use:

1. clear vertical sections in the panel
2. compact controls only where task-local
3. larger breathing room around empty and generating states

### Shape Direction

Use restrained rounding.

Preferred feel:

1. soft rectangles
2. light pills only for small state hints or compact tools
3. avoid overly bubbly or glossy treatment

### Elevation Direction

Prefer low elevation.

Use:

1. borders first
2. small shadows second
3. strong shadow only for clearly floating editing surfaces

## Initial Semantic Token Model

These names should guide the first implementation pass even if the exact CSS variable file lands later.

### Surface

1. `surface.app`
   Overall extension shell background.
2. `surface.panel`
   Main panel background.
3. `surface.canvas`
   Concept-map working area.
4. `surface.card`
   Nodes, state cards, and panel subsections.
5. `surface.overlay`
   Toolbars, popovers, and floating editors.
6. `surface.subtle`
   Weak status rails and informational strips.

### Text

1. `text.primary`
2. `text.secondary`
3. `text.tertiary`
4. `text.inverse`
5. `text.linked`

### Border

1. `border.subtle`
2. `border.default`
3. `border.strong`
4. `border.focus`
5. `border.warning`

### Accent And State

1. `accent.selection`
2. `accent.relation`
3. `accent.success`
4. `accent.warning`
5. `accent.danger`
6. `accent.info`

### Feedback

1. `status.ready`
2. `status.generating`
3. `status.synced`
4. `status.failed`
5. `status.source_lost`

## Suggested Initial Token Values

These are implementation starting points, not immutable brand colors.

| Token | Suggested value | Usage intent |
|---|---|---|
| `surface.app` | `#f6f5f2` | Outer extension shell |
| `surface.panel` | `#fbfaf8` | Main workspace panel |
| `surface.canvas` | `#f8f7f4` | Map area behind nodes |
| `surface.card` | `#ffffff` | Nodes and cards |
| `surface.overlay` | `#ffffff` | Popovers and toolbars |
| `surface.subtle` | `#f1efeb` | Quiet strip surfaces |
| `text.primary` | `#191919` | Main content |
| `text.secondary` | `#5f5a52` | Supporting text |
| `text.tertiary` | `#8a847a` | Metadata |
| `border.subtle` | `#ebe7e0` | Section separators |
| `border.default` | `#ddd7cf` | Card and panel borders |
| `border.focus` | `#6b6bf3` | Keyboard and selected states |
| `accent.selection` | `#6b6bf3` | Selected node/edge cue |
| `accent.relation` | `#4f7b6a` | Edge relation editing cue |
| `accent.success` | `#39725d` | Synced/success support |
| `accent.warning` | `#b7791f` | `source_lost` and caution |
| `accent.danger` | `#b74242` | Failed/removal cues |

## Motion Guidance

Motion should be short and quiet.

Use:

1. quick fade or translate for overlays
2. subtle highlight transitions for selection
3. minimal emphasis on state changes

Avoid:

1. bouncing
2. large-scale panel choreography
3. decorative motion that competes with chat reading

## Accessibility Notes

Even with a subtle visual baseline, implementation still needs:

1. clear focus visibility
2. keyboard reachability for toolbar and popover actions
3. sufficient contrast on text and state cues
4. warning states that are not color-only
