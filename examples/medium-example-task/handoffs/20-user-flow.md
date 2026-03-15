---
task_id: "TASK-2026-03-15-medium-feed-workbench"
author: codex
role: planner
stage: user_flow
status: draft
next_actor: human
---

# User Flow: Medium Feed Workbench

## User

A power user opening the app to see the most important feed items first.

## Entry Point

The user opens the feed workbench home route.

## Flow Summary

The user lands on the feed, scans the top cards, and opens an item detail view without leaving context.

## Steps

1. User opens the feed route
2. User scans prioritized cards
3. User opens an item detail view

## System Responses

- Backend returns a feed read model
- UI renders cards and a detail panel based on that contract

## Completion Condition

The user can read the feed and inspect one item without contract mismatch.

## Open Questions

- None
