# Medium Feed Workbench Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Demonstrate a medium-size workflow where backend work is completed and gated before a frontend shell begins.

**Architecture:** Phase 1 defines and verifies the backend feed read model. Phase 2 implements the frontend shell against that locked contract. The handoff between phases is explicit and must be approved before UI execution starts.

**Tech Stack:** Backend read model, frontend shell, phase-gated workflow artifacts

---

### Task 1: Backend feed contract

**Files:**
- Modify: `backend/feed_read_model.py`
- Test: `backend/tests/test_feed_read_model.py`

**Step 1: Write the failing test**

Define the backend payload contract in tests.

**Step 2: Run the test to verify it fails**

Run: `pytest backend/tests/test_feed_read_model.py -q`

Expected: failure because the contract is not implemented yet.

**Step 3: Write the minimal implementation**

Implement the feed payload shape.

**Step 4: Run the test to verify it passes**

Run: `pytest backend/tests/test_feed_read_model.py -q`

Expected: pass.

### Task 2: Frontend shell

**Files:**
- Modify: `frontend/src/pages/FeedWorkbench.tsx`
- Test: `frontend/src/tests/feed-workbench.test.tsx`

**Step 1: Wait for backend phase gate**

Do not start until the backend gate is approved.

**Step 2: Implement the frontend shell**

Consume the verified backend contract without inventing new fields.
