# AI Structuring Baseline

## Purpose

This memo turns the gap assessment in [spec-gap-assessment-2026-05-12.md](/Users/qyx/Desktop/project/thinking-ide/docs/spec-gap-assessment-2026-05-12.md) into an executable MVP baseline for the AI-structuring lane.

It is a decision memo for the next implementation slice, not a code change and not a final provider lock.

## Governing Sources

This baseline is governed by these repo artifacts:

1. [thinking_ide_prd_产品需求文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_prd_产品需求文档.md)
2. [thinking_ide_技术方案文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_技术方案文档.md)
3. [thinking_ide_组件设计文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_组件设计文档.md)
4. [thinking_ide_数据模型详细设计文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_数据模型详细设计文档.md)
5. [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md)
6. [spec-gap-assessment-2026-05-12.md](/Users/qyx/Desktop/project/thinking-ide/docs/spec-gap-assessment-2026-05-12.md)
7. [ADR-0001-runtime-spine.md](/Users/qyx/Desktop/project/thinking-ide/docs/architecture-decisions/ADR-0001-runtime-spine.md)

## Decision Summary

1. The current local heuristic generator is acceptable only as a runtime-spine scaffold.
2. It is not an acceptable MVP structuring baseline for the product defined in the PRD and technical design.
3. The repo should treat `AI Structuring Service` as a required MVP capability for spec-parity work on node quality.
4. The service boundary should stay behind the extension background worker, not in the content script.
5. `DeepSeek` must be treated as an explicit first-batch provider candidate, not as a deferred idea.
6. Provider selection should be made through a fixed evaluation harness against the normalized repo contract below, not by preference or anecdote.

## Why Heuristics Are Insufficient

The current heuristic path is too weak for the MVP defined by [thinking_ide_prd_产品需求文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_prd_产品需求文档.md) and [thinking_ide_技术方案文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_技术方案文档.md).

### Product mismatch

The PRD requires:

1. `question`, `answer`, `answer_outline`, and `concept` nodes.
2. `answered_by`, `contains`, `mentions`, and `follow_up` relations.
3. `answer_outline` nodes derived from headings, paragraph themes, steps, viewpoints, or conclusions.
4. `concept` nodes that are short, useful, and limited enough to be readable in a graph.

Simple sentence splitting cannot reliably produce those outputs.

### Quality mismatch

Heuristics are especially weak at:

1. turning markdown-rich answers into stable `answer_outline` nodes
2. extracting `3-7` useful concepts instead of long fragments
3. avoiding generic terms with low map value
4. keeping titles short and readable
5. generating relation semantics beyond adjacency guesses

### Privacy and boundary mismatch

The technical design and data model require:

1. only the current turn to be sent for structuring
2. no long-term storage of full user and assistant messages
3. old maps to survive service failure

An explicit background-mediated service contract makes those constraints auditable. A drifting local heuristic path does not.

### Decision-gate mismatch

The gap assessment already identifies an `LLM Integration Decision Gate` as missing. This memo closes that gap by defining the baseline required before more structuring work continues.

## MVP Structuring Service Must Do

The MVP service is not a general chat model integration. It has one job: convert one completed user/assistant turn into normalized concept-map draft data that matches repo semantics.

### Required responsibilities

1. Summarize the current user message into one `question` node.
2. Summarize the full assistant reply into one `answer` node.
3. Extract a small set of `answer_outline` nodes from the assistant reply structure.
4. Extract a small set of high-value `concept` nodes from the turn.
5. Generate relation drafts using the repo relation vocabulary.
6. Return JSON that can be validated and normalized before it reaches the store.
7. Fail without destroying the existing map.

### Required non-goals

1. It does not call or replace ChatGPT.
2. It does not receive the full conversation transcript.
3. It does not own persistence.
4. It does not bypass user edits.
5. It does not write directly into UI components.

## When To Call It

The call timing baseline follows [thinking_ide_技术方案文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_技术方案文档.md) and [thinking_ide_测试用例文档.md](/Users/qyx/Desktop/project/thinking-ide/docs/specs/thinking_ide_测试用例文档.md).

### Automatic call rules

1. Call only after the latest assistant reply is considered complete.
2. Call only for the latest completed user/assistant turn.
3. Auto-call only once per assistant message completion.
4. Do not call on every DOM mutation.
5. Do not call while the assistant reply is still streaming.

### Manual call rules

1. Manual retry may re-run the same turn after failure.
2. Manual regenerate may re-run a source-linked turn after the user asks for it.
3. Manual actions still use the same normalized service contract.

### Explicit exclusions

1. Do not send full historical chat to the provider.
2. Do not auto-restructure the whole conversation on page load.
3. Do not silently call the service for unrelated UI actions.

## Expected IO Shape

The repo should normalize provider-specific prompts and responses into one internal contract before results leave the background worker.

The earlier `ConceptMapNode[] / ConceptMapEdge[]` output shorthand is too loose for implementation, because it incorrectly implies that the provider returns persisted domain objects with layout, timestamps, ids, and store-owned status fields.

Wave 3 should therefore use a two-stage contract:

1. provider-facing `draft` payload
2. background-owned normalized repo payload

### Input

```ts
type StructureTurnInput = {
  conversationKey: string
  turnKey: string
  language?: string
  userMessage: {
    messageRefId: string
    content: string
    textHash?: string
  }
  assistantMessage: {
    messageRefId: string
    content: string
    textHash?: string
  }
  previousNodes: ConceptMapNode[]
  previousEdges: ConceptMapEdge[]
}
```

### Input rules

1. `content` is sent only for the current turn and should not be persisted long-term after structuring.
2. `previousNodes` and `previousEdges` are prior map abstractions for merge-awareness, not transcript replay.
3. `turnKey` should uniquely identify the current turn for dedupe, retry, and log correlation.
4. The background layer may include provider metadata internally, but that metadata should not leak into the normalized store contract.
5. During implementation, `previousNodes` and `previousEdges` should be reduced into a bounded merge-context view before they leave the background worker so provider payloads do not include layout noise or unnecessary store fields.

### Provider draft output

```ts
type ProviderStructureTurnOutput = {
  question: StructuredNodeDraft
  answer: StructuredNodeDraft
  answerOutline: StructuredNodeDraft[]
  concepts: StructuredNodeDraft[]
  relations: StructuredEdgeDraft[]
}
```

```ts
type StructuredNodeDraft = {
  clientKey: string
  title: string
  summary?: string
  primaryRole: 'question' | 'answer' | 'answer_outline' | 'concept'
  secondaryRoles?: Array<'claim' | 'insight' | 'model'>
  sourceAnchors: SourceAnchorDraft[]
  derivedFromMessageRefIds: string[]
  confidence?: number
}
```

```ts
type SourceAnchorDraft = {
  messageRefId: string
  anchorType: 'whole_message' | 'heading' | 'block' | 'offset_range'
  headingText?: string
  ordinal?: number
  quoteText?: string
  startOffset?: number
  endOffset?: number
}
```

```ts
type StructuredEdgeDraft = {
  clientKey: string
  sourceClientKey: string
  targetClientKey: string
  relationType:
    | 'answered_by'
    | 'contains'
    | 'mentions'
    | 'follow_up'
    | 'explains'
    | 'derived_from'
    | 'refines'
    | 'expands'
    | 'relates_to'
    | 'supports'
    | 'contrasts'
  label?: string
  confidence?: number
}
```

### Provider draft rules

1. The provider returns `draft` objects, not persisted repo entities.
2. The provider must not return layout, timestamps, generated ids, `status`, or `createdBy` fields.
3. All returned roles and relations must stay inside the repo vocabularies.
4. `answer_outline` nodes must be anchored to the assistant message in a way the repo can later resolve.
5. `concept` titles must be short enough for graph display.
6. Output must be valid JSON and schema-checked before normalization.
7. Provider-native explanations or chain-of-thought must be discarded before returning to the app.

### Normalized repo output

```ts
type StructureTurnOutput = {
  nodes: ConceptMapNode[]
  edges: ConceptMapEdge[]
}
```

### Normalization ownership

The background layer, not the provider, is responsible for:

1. assigning stable repo ids
2. creating timestamps
3. setting `status = candidate`
4. setting `createdBy = system`
5. creating or preserving merge-aware metadata
6. mapping `clientKey` references into repo node ids
7. rejecting invalid anchors, unsupported roles, and unsupported relations

## Normalization Expectations

The provider may return richer or messier text, but the repo baseline must normalize toward these expectations:

1. exactly one `question` node per structured turn
2. exactly one `answer` node per structured turn
3. a bounded number of `answer_outline` nodes
4. a bounded number of `concept` nodes, with the PRD target of `3-7` as the preferred starting range
5. relation labels limited to the repo contract unless a later spec change expands them

If the provider returns extra roles, extra relations, or verbose titles, the background layer should normalize or reject the payload rather than letting schema drift reach the store.

## Implementation-Ready Evaluation Fixtures

The fixed fixture set for the first provider batch lives in:

1. [fixtures/ai-structuring/README.md](/Users/qyx/Desktop/project/thinking-ide/docs/fixtures/ai-structuring/README.md)
2. [fixtures/ai-structuring/wave3-fixtures.v1.json](/Users/qyx/Desktop/project/thinking-ide/docs/fixtures/ai-structuring/wave3-fixtures.v1.json)

These fixtures are the minimum repo-owned evaluation baseline for Wave 3 runtime wiring.

### Fixture coverage requirements

The first fixture set must cover:

1. Markdown heading extraction into `answer_outline`
2. Ordered steps / process answers
3. Chinese and English concept compression
4. Repeated terms and long-sentence over-generation pressure
5. Cases where the provider should stay inside the `3-7` concept target band

### Fixture scoring dimensions

Each provider candidate should be reviewed on:

1. JSON contract validity
2. role and relation vocabulary fidelity
3. `answer_outline` usefulness and anchorability
4. short-concept quality
5. bilingual output quality
6. latency and retry ergonomics

## Provider Decision Framing

Provider choice should be a constrained engineering decision, not an open-ended model debate.

### Required decision criteria

1. JSON reliability against the normalized contract
2. quality of `answer_outline` extraction from markdown-style answers
3. quality of short concept extraction in Chinese and English
4. latency under the MVP timeout target of `30s`
5. operational simplicity for MV3 background usage
6. privacy posture and future support for user-supplied keys or a backend proxy
7. rate-limit behavior and retry ergonomics
8. total cost at expected MVP request volume

### First-batch provider plan

Wave 3 implementation should start with one bounded provider batch rather than an open-ended model search.

#### Batch A candidates

1. `DeepSeek API`
   Use an OpenAI-compatible chat-completions style entrypoint if that is the cleanest integration path.
2. `OpenAI-compatible structured-output baseline`
   Use one provider with strong JSON / schema reliability as the contract-fidelity baseline.
3. `Anthropic-compatible comparison provider`
   Use one provider with strong long-form markdown understanding as a comparison point for `answer_outline` quality.

#### Evaluation order

1. Run the fixed Wave 3 fixture set against `DeepSeek` first.
2. Run the same fixture set against the structured-output baseline provider.
3. Run the same fixture set against the markdown-quality comparison provider.
4. Choose the smallest implementation surface that still clears contract and quality gates.

#### What `DeepSeek` must prove

`DeepSeek` should be included in the first provider evaluation batch because it is a plausible fit for the repo's needs:

1. it is strong enough to be worth testing on structured extraction
2. it may be attractive on cost for repeated per-turn calls
3. it is relevant for bilingual Chinese and English output quality in this repo's context

But `DeepSeek` should not be declared the default provider until it proves four things on repo-owned fixtures:

1. stable schema fidelity without frequent invalid JSON
2. good `answer_outline` and short-concept quality on markdown-heavy answers
3. acceptable timeout, retry, and rate-limit behavior in the background-worker call path
4. no recurring tendency to emit long sentence fragments where the contract expects compact concepts

### Suggested decision process

1. Define a fixed evaluation fixture set from representative turns.
2. Run the same prompt contract against each candidate provider.
3. Score results on contract adherence first, then quality, then latency/cost.
4. Prefer the provider that minimizes normalization pain and failure handling, not just the one with the best isolated output.
5. If results are close, prefer the simpler and cheaper option.

### Provider-plan boundary

This memo intentionally does not lock:

1. a final provider winner
2. exact production model sku names
3. whether the first live path uses direct user keys or a backend proxy

Those belong to the runtime implementation slice once the batch above is actually evaluated.

## Fallback Behavior

Fallback behavior must protect user work and make failure visible.

### On timeout, network error, invalid JSON, or rate limit

1. keep the existing map unchanged
2. enter the generation-failure path defined by the specs
3. allow manual retry
4. log the failure reason in a bounded, debuggable way

### On structurally weak but valid output

1. reject payloads that violate schema or relation vocabulary
2. normalize small issues such as title trimming or relation aliases only if deterministic
3. avoid silently accepting low-quality verbose output that breaks the graph UX

### On provider outage

1. do not clear old nodes or edges
2. preserve user edits and prior accepted map state
3. surface that fresh AI structuring is temporarily unavailable

### Local heuristic fallback policy

The repo should not silently fall back to the current heuristic generator in production MVP flows after a provider failure, because that would hide service quality issues and reintroduce the spec gap.

Allowed uses for the heuristic path:

1. temporary runtime-spine development scaffolding
2. isolated local testing
3. explicitly labeled emergency fallback if the product later chooses that tradeoff

## Implementation Handoff Baseline

The next code slice in this lane should be considered ready when it can name:

1. the normalized request and response schema
2. the provider evaluation fixture set
3. the first provider batch, explicitly including `DeepSeek`
4. the validation and normalization strategy in the background worker
5. the failure-state contract for timeout, invalid JSON, and retry

Until those are defined, AI-structuring work should be treated as decision-incomplete rather than implementation-ready.

## What Is Implementation-Ready Now

After this prep slice, Wave 3 should be treated as implementation-ready at the planning level because the repo now has:

1. a tightened provider-draft contract instead of the earlier over-loose domain-object shorthand
2. a fixed fixture set for representative turns
3. a concrete first-batch provider plan that explicitly includes `DeepSeek`
4. a clear normalization ownership boundary between provider output and repo persistence

## What Still Blocks Wave 3 Runtime Wiring

The next runtime slice is still blocked on execution work, not on missing planning artifacts:

1. background-worker request plumbing has not been implemented
2. no schema validator is wired yet for the provider-draft payload
3. no provider adapter interface exists yet
4. no provider credentials or proxy strategy is selected yet
5. privacy-boundary remediation is not complete because persisted `MessageRef.text` still exists elsewhere in the repo
