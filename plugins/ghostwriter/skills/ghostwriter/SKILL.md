---
name: ghostwriter
description: >
  Targeted code reducer for minimizing token usage in Codex.
  Use it before reading or editing large files so analysis stays focused on the failing logic.
---

## Core Rules

1. **No Reproduction Files:** Do not create temporary reproduction scripts just to inspect the bug.
2. **Targeted Reading:** Use `ghostwriter prune` to reduce the file before analysis.
3. **In-Memory Output:** Treat the reduced output as analysis context only. Do not save it as a new source file.
4. **Direct Modification:** Apply fixes to the original source file after inspecting the reduced output.

## Execution Pattern

1. Identify the file and target line from the user request, stack trace, or terminal output.
2. Run `ghostwriter prune <file> --line <number> --stdout --silent`.
3. Analyze the reduced code in-context.
4. Edit the original source file normally.

## Best Uses

- Debugging stack traces in large files
- Explaining one method inside a very large class or module
- Reducing token usage before patching a narrow code path
