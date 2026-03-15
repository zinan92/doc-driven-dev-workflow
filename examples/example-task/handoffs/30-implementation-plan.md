# Example Greeter CLI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a minimal greeting command and tests that demonstrate the workflow on a small feature.

**Architecture:** Keep the implementation small: one greeting helper, one command path, and tests for both named and default greetings. Do not introduce extra layers or dependencies.

**Tech Stack:** Python, unittest

---

### Task 1: Add greeting behavior

**Files:**
- Modify: `src/greeter.py`
- Test: `tests/test_greeter.py`

**Step 1: Write the failing test**

Add tests for named and default greeting behavior.

**Step 2: Run the test to verify it fails**

Run: `python3 -m unittest tests.test_greeter -v`

Expected: failure because the greeting helper does not yet exist.

**Step 3: Write the minimal implementation**

Implement a greeting helper that formats the correct string.

**Step 4: Run the test to verify it passes**

Run: `python3 -m unittest tests.test_greeter -v`

Expected: pass.
