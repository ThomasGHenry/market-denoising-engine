---
status: accepted
date: 2026-06-24
tags: [process, pipeline, automation]
---

# 0101. Manual-First Pipeline

## Context

MDE supports a content experimentation loop: generate probes, post to platforms, capture
metrics, review signal, generate mutations. Early in the system's life, the temptation is
to automate steps such as scheduling posts, auto-fetching platform metrics via API, or
triggering mutation generation from threshold rules.

Automating before the human process is stable introduces two compounding risks: the
automation encodes assumptions about the workflow that have not yet been validated, and
failures in automated steps are harder to observe and recover from than failures in manual
steps. Premature automation also obscures the learning loop, making it harder to identify
which part of the pipeline is the source of signal.

## Decision

All pipeline steps remain manual until three conditions are jointly satisfied:

1. The human-operated process has been completed end-to-end at least five times.
2. The inputs, outputs, and failure modes of the step are documented and stable.
3. The cost of a silent failure in the automated step is understood and acceptable.

No automation is added speculatively. Platform API integrations, scheduled posting, and
metric ingestion pipelines are deferred until the above conditions are met for each step
individually.

## Consequences

Throughput is lower during the manual phase. Operators must manually enter metric
snapshots into the system. Platform API credentials and integration code are not built
until needed. The pipeline is slower to run but every step remains observable and
recoverable. The learning loop is understood before it is mechanized, avoiding the
encoding of unvalidated assumptions into automation logic.
