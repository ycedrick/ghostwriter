---
name: ghostwriter
description: >
  Targeted code reducer for minimizing token usage. 
  Essential for analyzing bugs in large files without creating reproduction scripts 
  or debug files. Replaces unrelated code with comments in its output.
---

## Core Rules

1. **No Reproduction Files:** Never create reproduction scripts, debug files, or unit tests to "find" the bug. Fix the bug directly in the existing source files.
2. **Targeted Reading:** Use `ghostwriter prune` to read only the necessary logic.
3. **In-Memory Output:** The reduced output exists only in your context (via stdout) or the clipboard. It must not be saved to a file.
4. **Direct Modification:** Apply your code changes directly to the original source file using the agent's normal editing tools.

## Execution Pattern

1. **Identify Target:** Determine the file and line number (from error trace or user prompt).
2. **Execute Prune:** Run `ghostwriter prune <file> --line <number> --stdout --silent`.
3. **Analyze:** Use the stdout output to understand the local logic.
4. **Modify Source:** Edit the original file directly after analyzing the reduced output.

## Advantages

- **No Temporary Files:** Avoids creating and cleaning up reproduction scripts.
- **Reduced Token Usage:** Excludes unneeded code blocks from the context window.
- **High-Signal Context:** Provides only the relevant imports, class structures, and the targeted code section.

## Codex Notes

- In Codex, run `ghostwriter prune <file> --line <number> --stdout --silent` from the terminal.
- Read the reduced output in context, then patch the original source file normally.
- Use clipboard-based auto-detection only when the command has access to the relevant terminal trace context.
