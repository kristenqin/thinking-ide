# AI Structuring Fixtures

This directory holds the fixed evaluation fixtures for the Wave 3 AI-structuring lane.

## Purpose

The fixtures make provider choice and prompt iteration auditable. They exist so the repo can evaluate `DeepSeek` and the rest of the first provider batch against the same representative turns instead of relying on ad hoc examples.

## Primary Artifact

1. [wave3-fixtures.v1.json](/Users/qyx/Desktop/project/thinking-ide/docs/fixtures/ai-structuring/wave3-fixtures.v1.json)

## How To Use

1. Feed each fixture's `input` turn into the normalized `StructureTurnInput` contract.
2. Compare provider output against the `assertions` block, not against one brittle exact string dump.
3. Score candidates on:
   - valid JSON
   - role and relation vocabulary fidelity
   - `answer_outline` quality
   - short-concept quality
   - bilingual handling
   - latency and retry behavior

## Fixture Design Rules

1. Fixtures stay repo-owned and provider-neutral.
2. They model one completed user/assistant turn at a time.
3. They capture representative Markdown and non-Markdown answer shapes.
4. They encode bounded assertions such as concept count, title length, and required relation families.
5. They should be versioned when the contract changes materially.

## Versioning

Current baseline:

1. `wave3-fixtures.v1.json`

Future updates should:

1. add a new versioned file
2. document why the fixture set changed
3. keep the older version for comparison until the migration is complete
